export function getTokenLabChallengeAvailability(result) {
  const count = result?.visualGroups?.length || 0;
  if (count < 4) return "too-short";
  if (count > 12) return "too-long";
  if (result.visualGroups.some((group) => group.decodedPiece.includes("�"))) return "unsupported-bytes";
  return "available";
}

export function createTokenLabChallengePieces(result, random = Math.random) {
  const pieces = result.visualGroups.map((group, originalIndex) => ({
    ...group,
    id: `lab-${originalIndex}-${group.ids.join("-")}`,
    originalIndex
  }));
  for (let index = pieces.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pieces[index], pieces[swapIndex]] = [pieces[swapIndex], pieces[index]];
  }
  if (pieces.every((piece, index) => piece.originalIndex === index) && pieces.length > 1) {
    [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
  }
  return pieces;
}

export function isTokenLabChallengeCorrect(answer, expectedLength) {
  return answer.length === expectedLength && answer.every((piece, index) => piece.originalIndex === index);
}
