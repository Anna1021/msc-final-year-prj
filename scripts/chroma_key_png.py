#!/usr/bin/env python3
import argparse
import binascii
import struct
import zlib


def paeth(a, b, c):
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read_png(path):
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("Not a PNG file")
    pos = 8
    ihdr = None
    chunks = []
    idat = []
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        payload = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            ihdr = payload
        elif kind == b"IDAT":
            idat.append(payload)
        elif kind not in (b"IEND", b"tRNS", b"PLTE", b"gAMA", b"cHRM", b"sRGB", b"iCCP"):
            chunks.append((kind, payload))
    width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(">IIBBBBB", ihdr)
    if bit_depth != 8 or color_type not in (2, 6) or interlace != 0:
        raise SystemExit("Only non-interlaced 8-bit RGB/RGBA PNG files are supported")
    return width, height, color_type, zlib.decompress(b"".join(idat)), chunks


def unfilter(raw, width, height, channels):
    stride = width * channels
    rows = []
    pos = 0
    prev = bytearray(stride)
    for _ in range(height):
        ftype = raw[pos]
        pos += 1
        scan = bytearray(raw[pos:pos + stride])
        pos += stride
        out = bytearray(stride)
        for i, value in enumerate(scan):
            left = out[i - channels] if i >= channels else 0
            up = prev[i]
            up_left = prev[i - channels] if i >= channels else 0
            if ftype == 0:
                out[i] = value
            elif ftype == 1:
                out[i] = (value + left) & 255
            elif ftype == 2:
                out[i] = (value + up) & 255
            elif ftype == 3:
                out[i] = (value + ((left + up) // 2)) & 255
            elif ftype == 4:
                out[i] = (value + paeth(left, up, up_left)) & 255
            else:
                raise SystemExit("Unsupported PNG filter")
        rows.append(out)
        prev = out
    return rows


def write_chunk(out, kind, payload):
    out.extend(struct.pack(">I", len(payload)))
    out.extend(kind)
    out.extend(payload)
    crc = binascii.crc32(kind)
    crc = binascii.crc32(payload, crc)
    out.extend(struct.pack(">I", crc & 0xFFFFFFFF))


def write_png(path, width, height, rows):
    raw = bytearray()
    for row in rows:
        raw.append(0)
        raw.extend(row)
    out = bytearray(b"\x89PNG\r\n\x1a\n")
    write_chunk(out, b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    write_chunk(out, b"IDAT", zlib.compress(bytes(raw), 9))
    write_chunk(out, b"IEND", b"")
    open(path, "wb").write(out)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--green-threshold", type=int, default=150)
    parser.add_argument("--spill", type=int, default=55)
    args = parser.parse_args()

    width, height, color_type, raw, _ = read_png(args.input)
    channels = 4 if color_type == 6 else 3
    source_rows = unfilter(raw, width, height, channels)
    output_rows = []
    for row in source_rows:
        out = bytearray()
        for x in range(width):
            i = x * channels
            r, g, b = row[i], row[i + 1], row[i + 2]
            a = row[i + 3] if channels == 4 else 255
            green_excess = g - max(r, b)
            if g > args.green_threshold and green_excess > args.spill:
                alpha = max(0, 255 - green_excess * 3)
                a = min(a, alpha)
                g = min(g, max(r, b))
            out.extend((r, g, b, a))
        output_rows.append(out)
    write_png(args.output, width, height, output_rows)


if __name__ == "__main__":
    main()
