import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

if CommandLine.arguments.count < 3 {
    fputs("Usage: swift chroma_key.swift input.png output.png\n", stderr)
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    fputs("Could not read image\n", stderr)
    exit(1)
}

let width = image.width
let height = image.height
let bytesPerPixel = 4
let bytesPerRow = width * bytesPerPixel
var pixels = [UInt8](repeating: 0, count: height * bytesPerRow)

guard let context = CGContext(
    data: &pixels,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: bytesPerRow,
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
    fputs("Could not create context\n", stderr)
    exit(1)
}

context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

func alphaForKeyDistance(_ d: Double) -> UInt8 {
    if d < 48 { return 0 }
    if d > 160 { return 255 }
    return UInt8(max(0, min(255, ((d - 48) / 112) * 255)))
}

var minX = width
var minY = height
var maxX = 0
var maxY = 0

for y in 0..<height {
    for x in 0..<width {
        let offset = y * bytesPerRow + x * bytesPerPixel
        let r = Double(pixels[offset])
        let g = Double(pixels[offset + 1])
        let b = Double(pixels[offset + 2])
        let keyDistance = sqrt(pow(r - 0, 2) + pow(g - 255, 2) + pow(b - 0, 2))
        let alpha = alphaForKeyDistance(keyDistance)
        pixels[offset + 3] = alpha
        if alpha > 12 {
            minX = min(minX, x)
            minY = min(minY, y)
            maxX = max(maxX, x)
            maxY = max(maxY, y)
        }
    }
}

let padding = 18
minX = max(0, minX - padding)
minY = max(0, minY - padding)
maxX = min(width - 1, maxX + padding)
maxY = min(height - 1, maxY + padding)

let cropW = maxX - minX + 1
let cropH = maxY - minY + 1
let cropBytesPerRow = cropW * bytesPerPixel
var cropped = [UInt8](repeating: 0, count: cropH * cropBytesPerRow)

for y in 0..<cropH {
    let src = (minY + y) * bytesPerRow + minX * bytesPerPixel
    let dst = y * cropBytesPerRow
    cropped[dst..<dst + cropBytesPerRow] = pixels[src..<src + cropBytesPerRow]
}

guard let outContext = CGContext(
    data: &cropped,
    width: cropW,
    height: cropH,
    bitsPerComponent: 8,
    bytesPerRow: cropBytesPerRow,
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
), let outImage = outContext.makeImage(),
   let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fputs("Could not create output image\n", stderr)
    exit(1)
}

CGImageDestinationAddImage(destination, outImage, nil)
if !CGImageDestinationFinalize(destination) {
    fputs("Could not write PNG\n", stderr)
    exit(1)
}

