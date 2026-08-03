import fixtureSet from "./qwenTokenizerFixtures.json" with { type: "json" };

const partBFixtures = fixtureSet.fixtures.filter((fixture) => fixture.role === "part-b");

export function getMission1ChallengePool(language = "en") {
  const matching = partBFixtures.filter((fixture) => fixture.language === language);
  const english = partBFixtures.filter((fixture) => fixture.language === "en");
  return matching.length >= 2 ? matching : [...matching, ...english.filter((fixture) => !matching.includes(fixture))];
}

export function getMission1IntroFixture() {
  return fixtureSet.fixtures.find((fixture) => fixture.role === "intro");
}

export function shuffleChallengePieces(fixture, random = Math.random) {
  const pieces = fixture.rawPieces.map((rawPiece, originalIndex) => ({
    id: `${fixture.id}-${originalIndex}`,
    originalIndex,
    rawPiece,
    decodedPiece: fixture.decodedPieces[originalIndex],
    tokenId: fixture.ids[originalIndex]
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

export function isCorrectChallengeOrder(answer) {
  return answer.every((piece, index) => piece.originalIndex === index);
}

export function readableTokenPiece(decodedPiece) {
  if (decodedPiece.startsWith(" ")) return { text: decodedPiece.slice(1) || "space", leadingSpace: true };
  if (decodedPiece === "\n") return { text: "newline", leadingSpace: false };
  if (decodedPiece === "\t") return { text: "tab", leadingSpace: false };
  return { text: decodedPiece || "byte", leadingSpace: false };
}
