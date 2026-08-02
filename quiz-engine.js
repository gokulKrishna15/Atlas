// Generic MCQ engine. Any "deck" is: { id, label, data, prompt(item), answer(item), optionLabel(item) }
// To add a new quiz type in future: write a data-*.js file exporting an array,
// then add one deck object in main.js. Nothing else needs to change.

export function pickDistractors(data, correctItem, answerFn, count) {
  const correctAnswer = answerFn(correctItem);
  const pool = data.filter((item) => answerFn(item) !== correctAnswer);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(answerFn);
}

export function buildQuestion(deck, optionCount = 4) {
  const { data, prompt, answer } = deck;
  const correctItem = data[Math.floor(Math.random() * data.length)];
  const correctAnswer = answer(correctItem);
  const distractors = pickDistractors(data, correctItem, answer, optionCount - 1);
  const options = [...distractors, correctAnswer].sort(() => Math.random() - 0.5);

  return {
    item: correctItem,
    promptText: prompt(correctItem),
    correctAnswer,
    options,
  };
}
