export const comparePairs = [
  {
    id: "meaning",
    category: "word",
    inputs: ["The bat flew out of the cave.", "He hit the ball with a bat."],
    highlights: [["flew", "cave"], ["hit", "ball"]],
    contextClues: [["flew", "cave"], ["hit", "ball"]],
    predictions: [
      [[" It", 44], [" The", 29], [" A", 18], [" Suddenly", 9]],
      [[" The", 41], [" It", 31], [" He", 19], [" Then", 9]]
    ]
  },
  {
    id: "details",
    category: "details",
    inputs: ["Help me plan a party.", "Help me plan an indoor anime party for eight 13-year-olds with a £50 budget."],
    highlights: [[], ["indoor", "anime", "eight 13-year-olds", "£50 budget"]],
    contextClues: [["party"], ["indoor", "anime", "eight", "£50"]],
    predictions: [
      [[" Start", 38], [" You", 27], [" Choose", 21], [" First", 14]],
      [[" Plan", 42], [" Choose", 28], [" Set", 19], [" Create", 11]]
    ]
  },
  {
    id: "ending",
    category: "ending",
    inputs: ["The goalkeeper caught the", "At lunch, he ate the"],
    highlights: [["goalkeeper", "caught"], ["lunch", "ate"]],
    contextClues: [["goalkeeper", "caught"], ["lunch", "ate"]],
    predictions: [
      [[" ball", 78], [" train", 10], [" sandwich", 8], [" cloud", 4]],
      [[" sandwich", 48], [" apple", 32], [" ball", 12], [" cloud", 8]]
    ]
  }
];

export function changedTokenIndexes(groups, otherGroups) {
  const remaining = new Map();
  for (const group of otherGroups) {
    const key = group.decodedPiece;
    remaining.set(key, (remaining.get(key) || 0) + 1);
  }
  return groups.map((group) => {
    const count = remaining.get(group.decodedPiece) || 0;
    if (count) remaining.set(group.decodedPiece, count - 1);
    return count === 0;
  });
}

export function swapPairSides(pair) {
  return {
    ...pair,
    inputs: [pair.inputs[1], pair.inputs[0]],
    highlights: [pair.highlights[1], pair.highlights[0]],
    contextClues: [pair.contextClues[1], pair.contextClues[0]],
    predictions: [pair.predictions[1], pair.predictions[0]]
  };
}
