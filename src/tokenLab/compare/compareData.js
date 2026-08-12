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

const chineseComparePairs = [
  {
    id: "meaning",
    category: "word",
    inputs: ["桌上放着一个红苹果。", "苹果发布了新手机。"],
    highlights: [["桌上", "红"], ["发布", "手机"]],
    contextClues: [["桌上", "红"], ["发布", "手机"]],
    predictions: [
      [[" 看起来", 44], [" 很", 29], [" 已经", 18], ["。", 9]],
      [[" 公司", 41], [" 将", 31], [" 同时", 19], ["。", 9]]
    ]
  },
  {
    id: "details",
    category: "details",
    inputs: ["帮我策划一个聚会。", "帮我策划一个室内动漫聚会，参加者是八名13岁学生，预算为50英镑。"],
    highlights: [[], ["室内", "动漫", "八名13岁学生", "50英镑"]],
    contextClues: [["聚会"], ["室内", "动漫", "八名", "50英镑"]],
    predictions: [
      [[" 可以", 38], [" 首先", 27], [" 建议", 21], [" 你", 14]],
      [[" 可以", 42], [" 建议", 28], [" 先", 19], [" 安排", 11]]
    ]
  },
  {
    id: "ending",
    category: "ending",
    inputs: ["守门员接住了", "午餐时，他吃了"],
    highlights: [["守门员", "接住"], ["午餐", "吃"]],
    contextClues: [["守门员", "接住"], ["午餐", "吃"]],
    predictions: [
      [[" 球", 78], [" 火车", 10], [" 三明治", 8], [" 云", 4]],
      [[" 三明治", 48], [" 苹果", 32], [" 球", 12], [" 云", 8]]
    ]
  }
];

export function getComparePairs(language) {
  return language === "zh" ? chineseComparePairs : comparePairs;
}

export function getDefaultCompareInputs(language) {
  return language === "zh"
    ? ["模型可以学习模式。", "模型会从示例中学习有用的模式。"]
    : ["Models can learn patterns.", "Models learn useful patterns from examples."];
}

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
