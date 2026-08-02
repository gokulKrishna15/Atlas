import { FLAGS } from "./data-flags.js";
import { CAPITALS } from "./data-capitals.js";
import { buildQuestion } from "./quiz-engine.js";

// ---- Deck registry -----------------------------------------------------
// To add a new quiz in future: create a data-*.js file exporting an array,
// then add one entry below. Nothing else in this file needs to change.
const DECKS = [
  {
    id: "flags",
    tabLabel: "Flags",
    promptLabel: "Which country flies this flag?",
    promptType: "flag",
    data: FLAGS,
    prompt: (item) => item.flag,
    answer: (item) => item.name,
  },
  {
    id: "capitals",
    tabLabel: "Capitals",
    promptLabel: "What is the capital of this country?",
    promptType: "text",
    data: CAPITALS,
    prompt: (item) => item.country,
    answer: (item) => item.capital,
  },
];

const QUESTIONS_PER_ROUND = 10;
const OPTION_COUNT = 4;

// Windows browsers don't render flag emoji as images — they fall back to
// showing the two letters as plain text. To get a real flag image on every
// OS, we decode the ISO country code from the emoji's regional-indicator
// characters and render it with the flag-icons CSS library instead.
function emojiFlagToIsoCode(flagEmoji) {
  return [...flagEmoji]
    .map((char) => String.fromCodePoint(char.codePointAt(0) - 0x1f1e6 + 0x61))
    .join("");
}

// ---- State ---------------------------------------------------------------
let activeDeck = DECKS[0];
let questionIndex = 0;
let score = 0;
let currentQuestion = null;
let answered = false;

// ---- DOM refs --------------------------------------------------------
const tabsEl = document.getElementById("tabs");
const promptLabelEl = document.getElementById("prompt-label");
const promptEl = document.getElementById("prompt");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const statProgressEl = document.getElementById("stat-progress");
const statScoreEl = document.getElementById("stat-score");
const statBestEl = document.getElementById("stat-best");
const btnNext = document.getElementById("btn-next");
const btnRestart = document.getElementById("btn-restart");
const stampEl = document.getElementById("stamp");

// ---- Best score persistence -----------------------------------------
function bestKey(deckId) {
  return `atlas-quiz-best-${deckId}`;
}
function getBest(deckId) {
  return Number(localStorage.getItem(bestKey(deckId)) || 0);
}
function setBestIfHigher(deckId, value) {
  if (value > getBest(deckId)) {
    localStorage.setItem(bestKey(deckId), String(value));
  }
}

// ---- Rendering -------------------------------------------------------
function renderTabs() {
  tabsEl.innerHTML = "";
  DECKS.forEach((deck) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.role = "tab";
    btn.textContent = deck.tabLabel;
    btn.setAttribute("aria-selected", String(deck.id === activeDeck.id));
    btn.addEventListener("click", () => {
      if (deck.id === activeDeck.id) return;
      activeDeck = deck;
      startRound();
    });
    tabsEl.appendChild(btn);
  });
}

function renderStats() {
  statProgressEl.textContent = `Q ${Math.min(questionIndex + 1, QUESTIONS_PER_ROUND)}/${QUESTIONS_PER_ROUND}`;
  statScoreEl.textContent = `Score ${score}`;
  const best = getBest(activeDeck.id);
  statBestEl.textContent = `Best ${best || "—"}`;
}

function renderQuestion() {
  answered = false;
  btnNext.disabled = true;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  stampEl.className = "stamp";

  currentQuestion = buildQuestion(activeDeck, OPTION_COUNT);
  promptLabelEl.textContent = activeDeck.promptLabel;

  promptEl.className = `card__prompt card__prompt--${activeDeck.promptType}`;
  if (activeDeck.promptType === "flag") {
    const isoCode = emojiFlagToIsoCode(currentQuestion.promptText);
    promptEl.innerHTML = `<span class="fi fi-${isoCode} flag-tile" role="img" aria-label="Flag"></span>`;
  } else {
    promptEl.textContent = currentQuestion.promptText;
  }

  optionsEl.innerHTML = "";
  currentQuestion.options.forEach((optionValue) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.textContent = optionValue;
    btn.addEventListener("click", () => handleAnswer(optionValue, btn));
    optionsEl.appendChild(btn);
  });

  renderStats();
}

function handleAnswer(selected, btnEl) {
  if (answered) return;
  answered = true;

  const isCorrect = selected === currentQuestion.correctAnswer;
  if (isCorrect) score++;

  [...optionsEl.children].forEach((child) => {
    child.disabled = true;
    if (child.textContent === currentQuestion.correctAnswer) {
      child.classList.add("option--correct");
    } else if (child === btnEl) {
      child.classList.add("option--wrong");
    }
  });

  feedbackEl.textContent = isCorrect
    ? "Correct."
    : `Not quite — it's ${currentQuestion.correctAnswer}.`;
  feedbackEl.classList.add(isCorrect ? "feedback--correct" : "feedback--wrong");

  stampEl.textContent = isCorrect ? "Verified" : "Denied";
  stampEl.classList.add("stamp--show");
  if (!isCorrect) stampEl.classList.add("stamp--wrong");

  renderStats();

  const isLastQuestion = questionIndex >= QUESTIONS_PER_ROUND - 1;
  btnNext.disabled = false;
  btnNext.textContent = isLastQuestion ? "See results" : "Next question";
}

function nextQuestion() {
  if (questionIndex >= QUESTIONS_PER_ROUND - 1) {
    finishRound();
    return;
  }
  questionIndex++;
  renderQuestion();
}

function finishRound() {
  setBestIfHigher(activeDeck.id, score);
  optionsEl.innerHTML = "";
  promptEl.className = "card__prompt card__prompt--text";
  promptEl.textContent = `${score} / ${QUESTIONS_PER_ROUND}`;
  promptLabelEl.textContent = "Round complete";
  feedbackEl.textContent = "";
  stampEl.className = "stamp";
  btnNext.disabled = true;
  renderStats();
}

function startRound() {
  questionIndex = 0;
  score = 0;
  btnNext.textContent = "Next question";
  renderTabs();
  renderQuestion();
}

// ---- Wire up -----------------------------------------------------------
btnNext.addEventListener("click", nextQuestion);
btnRestart.addEventListener("click", startRound);

startRound();
