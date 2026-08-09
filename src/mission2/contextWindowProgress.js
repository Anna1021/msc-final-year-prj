export function didContextWindowShift(previousCount, nextCount, windowSize) {
  const previousStart = Math.max(0, previousCount - windowSize);
  const nextStart = Math.max(0, nextCount - windowSize);
  return nextStart > previousStart;
}
