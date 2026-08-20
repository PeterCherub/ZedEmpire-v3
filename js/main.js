// js/main.js
// ZED EMPIRE -- web port, Prototype 0.4 parity.
// Structural port of main.lua: same gameState machine, same screens,
// same debt mechanic. love's callbacks map onto:
//   love.load        -> init()
//   love.update(dt)   -> update(dt) inside the rAF loop
//   love.draw         -> render()
//   love.mousepressed -> pointerdown
//   love.mousemoved    -> pointermove
//   love.mousereleased -> pointerup
//   love.keypressed    -> keydown

import { State } from "./game/state.js";
import { Engine } from "./game/engine.js";
import { Slider } from "./ui/Slider.js";
import * as draw from "./renderer/draw.js";
import { theme } from "./theme.js";
import fonts, { loadFonts } from "./fonts.js";
import { Button } from "./ui/Button.js";
import { Menu } from "./ui/Menu.js";
import { Settings } from "./ui/Settings.js";
import { HowToPlay } from "./ui/HowToPlay.js";
import { StoryBook } from "./ui/StoryBook.js";
import { HallOfFame } from "./ui/HallOfFame.js";
import { recordRun } from "./game/halloffame.js";
import { submitRunOnline, submitFeedback } from "./game/backend.js";
import { Shop } from "./ui/Shop.js";
import { Bank } from "./ui/Bank.js";
import { Map } from "./ui/Map.js";
import audio from "./audio.js";
import { getChapter, getChapterCards, getChapterSequence } from "./content/chapters.js";
import { saveExists, writeSave, readSave, deleteSave } from "./game/save.js";

const W = 420, H = 720;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Fixed 420x720 logical/drawing resolution (matches every layout
// number throughout the port); CSS scales that box to fit whatever
// screen it's actually running on, letterboxed to preserve aspect
// ratio. Without this the canvas would render at a literal 420x720
// CSS-pixel box in the corner of a phone screen instead of filling it.
function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = `${Math.floor(W * scale)}px`;
  canvas.style.height = `${Math.floor(H * scale)}px`;
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
resize();

// --- state (mirrors the module-level locals at the top of main.lua) ---
let gameState;      // "menu" | "map" | "playing" | "consequence" | "chapterComplete" | "gameOver" | "gameComplete"
let player;
let engine;
let slider;
let currentCard;
let lastResultText;
let gameOverText;

let shop, bank, menu, settings, map, howToPlay, storyBook, hallOfFame;
let settingsOpen = false;
let howToPlayOpen = false;
let storyBookOpen = false;
let hallOfFameOpen = false;
let debtDays = 0;
let lossCount = 0; // persisted: repeated losses have escalating consequences

let cardShownAt = 0; // performance.now() timestamp -- drives the situation card's fade/slide-in
function cardEntrance() {
  const CARD_ANIM_MS = 260;
  return Math.min(1, (performance.now() - cardShownAt) / CARD_ANIM_MS);
}

let bankOpenBtn, shopOpenBtn, mapOpenBtn, pauseBtn;
let continueBtn;
let chapCompleteRetryBtn, chapCompleteMenuBtn;
let gameOverRetryBtn, gameOverMenuBtn, gameOverStoryBtn;
let gameCompleteMenuBtn, gameCompleteStoryBtn;

// ============================================================
//  CHAPTER LOADING
// ============================================================
// Every chapter (1-10) keeps its cards/sequence in its own
// js/content/chapterN.js file; this just points the engine at
// whichever one matches the player's current chapter.
function startEngineForChapter(n) {
  engine = new Engine(getChapterCards(n), getChapterSequence(n));
  currentCard = engine.currentCard(player);
  cardShownAt = performance.now();
}

// ============================================================
//  SAVE / LOAD
// ============================================================
function saveGame() {
  if (!player) return;
  writeSave({
    player: player.serialize(),
    bankSavings: bank.savings,
    currentCardId: currentCard ? currentCard.id : null,
    queue: engine.queue,
    pos: engine.pos,
    debtDays,
    lossCount,
  });
}

function loadGame() {
  const data = readSave();
  if (!data) return false;

  player = new State();
  player.loadFrom(data.player);
  bank = new Bank(W, H);
  bank.savings = data.bankSavings || 0;
  bank.active = false;
  shop = new Shop(W, H);

  startEngineForChapter(player.chapter);
  engine.queue = data.queue;
  engine.pos = data.pos;

  currentCard = engine.currentCard(player);
  cardShownAt = performance.now();
  lastResultText = null;
  gameOverText = null;
  gameState = "playing";
  settingsOpen = false;
  // Restored from the save, not reset to 0 -- otherwise closing and
  // reopening the app while in debt would silently refresh your
  // 2-day grace period every time (an easy exploit).
  debtDays = data.debtDays || 0;
  lossCount = data.lossCount || 0;
  map.setCurrent(player.chapter);
  audio.playMusic();
  return true;
}

function newGame(inheritedBankSavings, chosenPlayerName) {
  player = new State(); // State() always starts at chapter 1
  const name = (chosenPlayerName || "Anonymous").trim().replace(/\s+/g, " ").slice(0, 24);
  player.playerName = name || "Anonymous";
  startEngineForChapter(1);
  lastResultText = null;
  gameOverText = null;
  gameState = "playing";
  shop = new Shop(W, H);
  bank = new Bank(W, H);
  debtDays = 0;
  if (inheritedBankSavings && inheritedBankSavings > 0) {
    bank.savings = inheritedBankSavings;
  }
  settingsOpen = false;
  if (map) map.setCurrent(1);
  audio.playMusic();
  saveGame();
}

// Called when the player finishes a chapter and taps "NEXT CHAPTER".
// Keeps the player's stats, bank, and flags -- only the chapter
// number and the card deck under them change. Chapter 10 has no
// "next", so that's treated as the end of the story instead.
function advanceToNextChapter() {
  const next = player.chapter + 1;
  if (next > 10) {
    recordRun({
      chapter: player.chapter,
      province: getChapter(player.chapter).province,
      day: player.day,
      player_name: player.playerName,
      outcome: "completed",
      stats: { ...player.stats },
      headline: "Crossed all ten provinces and built the empire.",
    });
    submitRunOnline({
      chapter: player.chapter,
      province: getChapter(player.chapter).province,
      day: player.day,
      player_name: player.playerName,
      outcome: "completed",
      stats: { ...player.stats },
      headline: "Crossed all ten provinces and built the empire.",
    }, player.playerName);
    gameState = "gameComplete";
    audio.play("win");
    saveGame();
    return;
  }
  player.chapter = next;
  player.day = 1;
  startEngineForChapter(next);
  lastResultText = null;
  gameOverText = null;
  debtDays = 0;
  gameState = "playing";
  map.setCurrent(next);
  saveGame();
}

function goToMainMenu() {
  gameState = "menu";
  settingsOpen = false;
  audio.stopMusic();
}

function resetGame() {
  lossCount = 0;
  deleteSave();
  settingsOpen = false;
  newGame(0);
}

function processDebt() {
  if (player.stats.money < 0) {
    debtDays += 1;
    if (debtDays >= 2) {
      gameOverText = "Creditors caught up with you. You couldn't pay your debt in time. Game Over.";
      gameState = "gameOver";
      audio.play("death");
      return true;
    } else {
      audio.play("debt"); // warning: this is your last day to repay
    }
  } else {
    debtDays = 0;
  }
  return false;
}

// ============================================================
//  FEEDBACK OVERLAY (real DOM form -- canvas has no text input)
// ============================================================
const feedbackOverlay = document.getElementById("feedback-overlay");
const feedbackMessage = document.getElementById("feedback-message");
const feedbackName = document.getElementById("feedback-name");
const feedbackContact = document.getElementById("feedback-contact");
const feedbackStatus = document.getElementById("feedback-status");
const feedbackSendBtn = document.getElementById("feedback-send");
const feedbackCancelBtn = document.getElementById("feedback-cancel");

function openFeedback() {
  feedbackStatus.textContent = "";
  feedbackStatus.className = "";
  feedbackMessage.value = "";
  feedbackOverlay.classList.remove("hidden");
  feedbackMessage.focus();
}

function closeFeedback() {
  feedbackOverlay.classList.add("hidden");
}

feedbackCancelBtn.addEventListener("click", closeFeedback);

feedbackSendBtn.addEventListener("click", async () => {
  const message = feedbackMessage.value.trim();
  if (!message) {
    feedbackStatus.textContent = "Write a message first.";
    feedbackStatus.className = "error";
    return;
  }
  feedbackSendBtn.disabled = true;
  feedbackStatus.textContent = "Sending...";
  feedbackStatus.className = "";
  const ok = await submitFeedback({
    message,
    playerName: feedbackName.value.trim(),
    contact: feedbackContact.value.trim(),
  });
  feedbackSendBtn.disabled = false;
  if (ok) {
    feedbackStatus.textContent = "Sent. Thank you!";
    feedbackStatus.className = "success";
    setTimeout(closeFeedback, 1200);
  } else {
    feedbackStatus.textContent = "Could not send right now -- try again later.";
    feedbackStatus.className = "error";
  }
});

// ============================================================
//  INIT
// ============================================================
async function init() {
  await loadFonts();
  await draw.loadIcons();

  slider = new Slider(24, 560, W - 48, 56);
  menu = new Menu(W);
  settings = new Settings(W, H);
  howToPlay = new HowToPlay(W, H);
  storyBook = new StoryBook(W, H);
  hallOfFame = new HallOfFame(W, H);
  map = new Map(W, H);

  bankOpenBtn = new Button(10, H - 60, 60, 50, "BANK", { color: "panel", textColor: "gold", radius: 4 });
  shopOpenBtn = new Button(W - 70, H - 60, 60, 50, "SHOP", { color: "panel", textColor: "gold", radius: 4 });
  mapOpenBtn = new Button(W / 2 - 30, H - 60, 60, 50, "MAP", { color: "panel", textColor: "cream", radius: 4 });
  // Sits in the gap between the ledger HUD (ends ~y=112) and the
  // situation card (starts y=170) -- the only way to reach Settings
  // (and from there, Main Menu / How To Play) once a run is underway.
  pauseBtn = new Button(W - 58, 122, 44, 28, "MENU", { color: "panel", textColor: "gold", radius: 4 });

  continueBtn = new Button(W / 2 - 90, 470, 180, 44, "CONTINUE", { color: "gold" });
  // Label is set dynamically each time we enter "chapterComplete" --
  // "NEXT CHAPTER" for chapters 1-9, "FINISH" on chapter 10.
  chapCompleteRetryBtn = new Button(W / 2 - 65, 340, 130, 40, "NEXT CHAPTER", { color: "green", textColor: "white" });
  chapCompleteMenuBtn = new Button(W / 2 - 65, 392, 130, 40, "MAIN MENU", { color: "red", textColor: "white" });
  gameOverRetryBtn = new Button(W / 2 - 65, 360, 130, 40, "RETRY", { color: "green", textColor: "white" });
  gameOverMenuBtn = new Button(W / 2 - 65, 412, 130, 40, "MAIN MENU", { color: "red", textColor: "white" });
  gameOverStoryBtn = new Button(W / 2 - 65, 464, 130, 40, "MY STORY", { color: "panel", textColor: "gold" });
  gameCompleteMenuBtn = new Button(W / 2 - 65, 420, 130, 40, "MAIN MENU", { color: "red", textColor: "white" });
  gameCompleteStoryBtn = new Button(W / 2 - 65, 472, 130, 40, "MY STORY", { color: "panel", textColor: "gold" });

  gameState = "menu";

  // Hand off from the CSS boot splash to the canvas.
  canvas.classList.add("ready");
  const boot = document.getElementById("boot");
  if (boot) {
    boot.classList.add("hidden");
    setTimeout(() => boot.remove(), 600);
  }

  requestAnimationFrame(loop);
}

// ============================================================
//  UPDATE
// ============================================================
function update(dt) {
  if (gameState === "menu") {
    menu.update(dt, saveExists());
  }
  if (gameState === "map") {
    map.update(dt);
    pauseBtn.update(dt);
  }
  if (settingsOpen) settings.update(dt);
  if (howToPlayOpen) howToPlay.update(dt);
  if (storyBookOpen) storyBook.update(dt);
  if (hallOfFameOpen) hallOfFame.update(dt);
  if (shop && shop.active) shop.update(dt, player);
  if (bank && bank.active) bank.update(dt, player);

  if (gameState === "playing") {
    bankOpenBtn.update(dt);
    shopOpenBtn.update(dt);
    mapOpenBtn.update(dt);
    pauseBtn.update(dt);
  } else if (gameState === "consequence") {
    continueBtn.update(dt);
    pauseBtn.update(dt);
  } else if (gameState === "chapterComplete") {
    chapCompleteRetryBtn.update(dt);
    chapCompleteMenuBtn.update(dt);
  } else if (gameState === "gameOver") {
    gameOverRetryBtn.update(dt);
    gameOverMenuBtn.update(dt);
  } else if (gameState === "gameComplete") {
    gameCompleteMenuBtn.update(dt);
  }
}

// ============================================================
//  INPUT
// ============================================================
function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / W;
  return [(clientX - rect.left) / scale, (clientY - rect.top) / scale];
}

function onPointerDown(x, y) {
  audio.unlock(); // first gesture unlocks Web Audio; no-op after that

  // Overlays always take priority over whatever's underneath them --
  // checked before any gameState-specific handling, map included.
  if (settingsOpen) {
    const action = settings.mousepressed(x, y);
    if (action === "close") settingsOpen = false;
    else if (action === "quit") { /* no-op on web: closing a browser tab isn't ours to control */ }
    else if (action === "reset") resetGame();
    else if (action === "menu") goToMainMenu();
    else if (action === "toggleSound") audio.toggleMuted();
    else if (action === "howToPlay") { settingsOpen = false; howToPlayOpen = true; }
    else if (action === "feedback") { settingsOpen = false; openFeedback(); }
    return;
  }

  if (howToPlayOpen) {
    const action = howToPlay.mousepressed(x, y);
    if (action === "close") howToPlayOpen = false;
    if (action) audio.play("click");
    return;
  }

  if (storyBookOpen) {
    const action = storyBook.mousepressed(x, y);
    if (action === "close") storyBookOpen = false;
    if (action) audio.play("click");
    return;
  }

  if (hallOfFameOpen) {
    const action = hallOfFame.mousepressed(x, y);
    if (action === "close") hallOfFameOpen = false;
    if (action) audio.play("click");
    return;
  }

  if (gameState === "map") {
    if (pauseBtn.click(x, y)) { settingsOpen = true; audio.play("click"); return; }
    const action = map.mousepressed(x, y);
    if (action === "back") {
      gameState = "playing";
      audio.play("click");
    }
    return;
  }

  if (gameState === "menu") {
    const action = menu.mousepressed(x, y);
    if (action) audio.play("click");
    if (action === "load") loadGame();
    else if (action === "new") {
      const entered = window.prompt("Enter your player name for the Global Hall of Fame:", "Player");
      newGame(0, entered || "Anonymous");
    }
    else if (action === "howToPlay") howToPlayOpen = true;
    else if (action === "hallOfFame") { hallOfFame.open(); hallOfFameOpen = true; }
    else if (action === "settings") settingsOpen = true;
    return;
  }

  if (shop && shop.active) {
    if (shop.mousepressed(x, y, player)) saveGame();
    return;
  }
  if (bank && bank.active) {
    if (bank.mousepressed(x, y, player)) saveGame();
    return;
  }

  if (gameState === "playing") {
    if (pauseBtn.click(x, y)) { settingsOpen = true; audio.play("click"); return; }
    if (bankOpenBtn.click(x, y)) { bank.active = true; audio.play("click"); return; }
    if (shopOpenBtn.click(x, y)) { shop.active = true; audio.play("click"); return; }
    if (mapOpenBtn.click(x, y)) {
      gameState = "map";
      map.active = true;
      audio.play("click");
      return;
    }
    slider.mousepressed(x, y);
    return;
  }

  if (gameState === "consequence") {
    if (pauseBtn.click(x, y)) { settingsOpen = true; audio.play("click"); return; }
    continueBtn.click(x, y);
    audio.play("click");
    advanceAfterConsequence();
    return;
  }

  if (gameState === "chapterComplete") {
    if (chapCompleteRetryBtn.click(x, y)) { audio.play("click"); advanceToNextChapter(); return; }
    if (chapCompleteMenuBtn.click(x, y)) { audio.play("click"); goToMainMenu(); return; }
    return;
  }

  if (gameState === "gameOver") {
    if (gameOverRetryBtn.click(x, y)) { audio.play("click"); newGame(bank.savings, player?.playerName); return; }
    if (gameOverMenuBtn.click(x, y)) { audio.play("click"); goToMainMenu(); return; }
    if (gameOverStoryBtn.click(x, y)) { audio.play("click"); storyBook.open(player.history); storyBookOpen = true; return; }
    return;
  }

  if (gameState === "gameComplete") {
    if (gameCompleteMenuBtn.click(x, y)) { audio.play("click"); goToMainMenu(); return; }
    if (gameCompleteStoryBtn.click(x, y)) { audio.play("click"); storyBook.open(player.history); storyBookOpen = true; return; }
    return;
  }
}

function onPointerMove(x, y) {
  if (settingsOpen) { settings.mousemoved(x, y); return; }
  if (howToPlayOpen) { howToPlay.mousemoved(x, y); return; }
  if (storyBookOpen) { storyBook.mousemoved(x, y); return; }
  if (hallOfFameOpen) { hallOfFame.mousemoved(x, y); return; }
  if (gameState === "map") { map.mousemoved(x, y); pauseBtn.mousemoved(x, y); return; }
  if (gameState === "menu") { menu.mousemoved(x, y); return; }
  if (shop && shop.active) { shop.mousemoved(x, y); return; }
  if (bank && bank.active) { bank.mousemoved(x, y); return; }

  if (gameState === "playing") {
    bankOpenBtn.mousemoved(x, y);
    shopOpenBtn.mousemoved(x, y);
    mapOpenBtn.mousemoved(x, y);
    pauseBtn.mousemoved(x, y);
    slider.mousemoved(x, y);
  } else if (gameState === "consequence") {
    continueBtn.mousemoved(x, y);
    pauseBtn.mousemoved(x, y);
  } else if (gameState === "chapterComplete") {
    chapCompleteRetryBtn.mousemoved(x, y);
    chapCompleteMenuBtn.mousemoved(x, y);
  } else if (gameState === "gameOver") {
    gameOverRetryBtn.mousemoved(x, y);
    gameOverMenuBtn.mousemoved(x, y);
    gameOverStoryBtn.mousemoved(x, y);
  } else if (gameState === "gameComplete") {
    gameCompleteMenuBtn.mousemoved(x, y);
    gameCompleteStoryBtn.mousemoved(x, y);
  }
}

function onPointerUp() {
  if (shop && shop.active) return;
  if (bank && bank.active) return;
  if (settingsOpen) return;
  if (howToPlayOpen) return;
  if (storyBookOpen) return;
  if (hallOfFameOpen) return;
  if (gameState === "map") return;
  if (gameState !== "playing") return;

  const choiceSide = slider.mousereleased();
  if (choiceSide) commitChoice(choiceSide);
}

canvas.addEventListener("pointerdown", (e) => {
  const [x, y] = toLogical(e.clientX, e.clientY);
  onPointerDown(x, y);
});
canvas.addEventListener("pointermove", (e) => {
  const [x, y] = toLogical(e.clientX, e.clientY);
  onPointerMove(x, y);
});
window.addEventListener("pointerup", onPointerUp);

window.addEventListener("keydown", (e) => {
  if (e.key === "r" && gameState === "gameOver") {
    newGame(bank.savings, player?.playerName);
  }
  if (e.key === "r" && gameState === "chapterComplete") {
    advanceToNextChapter();
  }
  if (e.key === "m" && (gameState === "gameOver" || gameState === "chapterComplete" || gameState === "gameComplete")) {
    goToMainMenu();
  }
  if (e.key === "Escape") {
    if (storyBookOpen) {
      storyBookOpen = false;
      storyBook.reset();
    } else if (hallOfFameOpen) {
      hallOfFameOpen = false;
      hallOfFame.reset();
    } else if (howToPlayOpen) {
      howToPlayOpen = false;
      howToPlay.reset();
    } else if (settingsOpen) {
      settingsOpen = false;
      settings.reset();
    } else if (gameState === "map") {
      gameState = "playing";
    } else if (gameState === "menu") {
      settingsOpen = true;
    } else if (gameState === "playing" || gameState === "consequence") {
      settingsOpen = true;
    }
  }
});

// ============================================================
//  DECISIONS
// ============================================================
function recordHistory(choiceLabel, result) {
  player.recordChoice({
    day: player.day,
    chapter: player.chapter,
    province: getChapter(player.chapter).province,
    situation: currentCard.text,
    choiceLabel,
    result,
  });
}

function commitChoice(side) {
  const choice = currentCard[side];

  if (currentCard.id === "c4_police" && side === "left") {
    const security = player.stats.security;
    const money = player.stats.money;
    if (security >= 5) {
      player.stats.security = security - 5;
      player.stats.money = money - 100;
      player.flags.criminal_record = true;
      lastResultText = "They find the package. You have enough street cred to talk your way out, but it costs you K100.";
      recordHistory(choice.label, lastResultText);
      gameState = "consequence";
      audio.play(player.stats.money < 0 ? "debt" : "error");
      saveGame();
      return;
    } else if (security < 5 && money >= 190) {
      player.stats.security = 0;
      player.stats.money = money - 190;
      player.flags.criminal_record = true;
      lastResultText = "You're arrested, but you have K190. You pay the bail. You walk, but you're completely broken. Security is 0.";
      recordHistory(choice.label, lastResultText);
      gameState = "consequence";
      audio.play(player.stats.money < 0 ? "debt" : "error");
      saveGame();
      return;
    } else {
      recordHistory(choice.label, "You are arrested and taken to jail.");
      triggerLoss("You are arrested and taken to jail. The story does not end, but the consequences follow you.");
      return;
    }
  }

  const moneyBefore = player.stats.money;
  player.applyEffects(choice.effects);
  lastResultText = choice.result;
  recordHistory(choice.label, choice.result);

  // Pick the sound that actually matches what just happened to your
  // money, instead of just "positive = coin, negative = error".
  const moneyAfter = player.stats.money;
  if (moneyAfter < 0 && moneyBefore >= 0) {
    audio.play("debt");
  } else if (moneyAfter < 0) {
    audio.play("error");
  } else if (moneyAfter > moneyBefore) {
    audio.play("coin");
  } else {
    audio.play("choice");
  }

  const { over: isOver, reason } = player.isGameOver();
  if (isOver) {
    triggerLoss(reason);
    return;
  }

  gameState = "consequence";
  saveGame();
}

function triggerLoss(reason) {
  // No death-money exploit: losing never transfers cash into the bank.
  lossCount += 1;
  const outcome = lossCount >= 2 ? "robbed" : "setback";
  if (lossCount >= 2) {
    const lostSavings = bank ? bank.savings : 0;
    if (bank) bank.savings = 0;
    gameOverText = `SECOND LOSS: ${reason} While you were trying to recover, robbers emptied your bank account${lostSavings > 0 ? ` (K${lostSavings} lost)` : ""}. You survive, but you must start again with nothing.`;
  } else {
    gameOverText = `SETBACK: ${reason} You survived, but this is your first loss. One more loss and your bank account will be emptied after a robbery.`;
  }
  recordRun({
    chapter: player.chapter,
    province: getChapter(player.chapter).province,
    day: player.day,
      player_name: player.playerName,
    outcome,
    stats: { ...player.stats },
    headline: reason,
  });
  submitRunOnline({
    chapter: player.chapter,
    province: getChapter(player.chapter).province,
    day: player.day,
    player_name: player.playerName,
    outcome,
    stats: { ...player.stats },
    headline: reason,
  }, player.playerName);
  gameState = "gameOver";
  audio.play("death");
  saveGame();
}

function advanceAfterConsequence() {
  player.day += 1;
  engine.advance(player);
  currentCard = engine.currentCard(player);
  cardShownAt = performance.now();
  if (processDebt()) return;
  if (!currentCard) {
    gameState = "chapterComplete";
    map.setCompleted(player.chapter);
    chapCompleteRetryBtn.setLabel(player.chapter >= 10 ? "FINISH" : "NEXT CHAPTER");
    audio.play("win");
  } else {
    gameState = "playing";
  }
  saveGame();
}

// ============================================================
//  DRAW
// ============================================================
function render() {
  draw.background(ctx, W, H);

  if (gameState === "menu") drawMenu();
  else if (gameState === "map") map.draw(ctx);
  else if (gameState === "playing") drawPlaying();
  else if (gameState === "consequence") drawConsequence();
  else if (gameState === "chapterComplete") drawChapterComplete();
  else if (gameState === "gameOver") drawGameOver();
  else if (gameState === "gameComplete") drawGameComplete();

  if (gameState === "playing" || gameState === "map" || gameState === "consequence") {
    pauseBtn.draw(ctx);
  }

  if (shop && shop.active) shop.draw(ctx, player);
  if (bank && bank.active) bank.draw(ctx, player);
  if (settingsOpen) settings.draw(ctx);
  if (howToPlayOpen) howToPlay.draw(ctx);
  if (storyBookOpen) storyBook.draw(ctx);
  if (hallOfFameOpen) hallOfFame.draw(ctx);
}

function drawMenu() {
  menu.draw(ctx);
}

function chapterHeading(){ const c=getChapter(player.chapter); return `CHAPTER ${c.number} — ${c.province.toUpperCase()}: ${c.title.toUpperCase()}`; }
function drawPlaying() {
  draw.ledger(ctx, player, 20, 20, W - 40);
  draw.centeredTitle(ctx, chapterHeading(), 128, W);
  if (player.stats.money < 0) {
    ctx.fillStyle = `rgb(${theme.redSoft[0]*255}, ${theme.redSoft[1]*255}, ${theme.redSoft[2]*255})`;
    ctx.font = fonts.get(13);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`DEBT: K${Math.abs(player.stats.money)} (Days left: ${2 - debtDays})`, W / 2, 145);
  }
  draw.situationCard(ctx, currentCard.text, 24, 170, W - 48, 300, cardEntrance());
  slider.draw(ctx, currentCard.left.label, currentCard.right.label);

  bankOpenBtn.draw(ctx);
  shopOpenBtn.draw(ctx);
  mapOpenBtn.draw(ctx);

  ctx.fillStyle = `rgb(${theme.gold[0]*255}, ${theme.gold[1]*255}, ${theme.gold[2]*255})`;
  ctx.font = fonts.get(14);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`DAY ${player.day}`, W / 2, 636);
}

function drawConsequence() {
  draw.ledger(ctx, player, 20, 20, W - 40);
  draw.centeredTitle(ctx, chapterHeading(), 128, W);
  if (player.stats.money < 0) {
    ctx.fillStyle = `rgb(${theme.redSoft[0]*255}, ${theme.redSoft[1]*255}, ${theme.redSoft[2]*255})`;
    ctx.font = fonts.get(13);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`DEBT: K${Math.abs(player.stats.money)} (Days left: ${2 - debtDays})`, W / 2, 145);
  }
  draw.situationCard(ctx, currentCard.text, 24, 170, W - 48, 220);
  const bannerHeight = draw.resultBanner(ctx, lastResultText, 24, 410, W - 48);
  continueBtn.setPosition(W / 2 - 90, 410 + bannerHeight + 16);
  continueBtn.draw(ctx);
  ctx.fillStyle = `rgb(${theme.creamDim[0]*255}, ${theme.creamDim[1]*255}, ${theme.creamDim[2]*255})`;
  ctx.font = fonts.get(13);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("or tap anywhere to continue", W / 2, continueBtn.y + continueBtn.h + 10);
}

function drawChapterComplete() {
  const c = getChapter(player.chapter);
  draw.centeredTitle(ctx, `CHAPTER ${c.number} COMPLETE`, 200, W);
  ctx.fillStyle = `rgb(${theme.creamDim[0]*255}, ${theme.creamDim[1]*255}, ${theme.creamDim[2]*255})`;
  ctx.font = fonts.get(14);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const body = c.number >= 10
    ? `You have survived ${c.province}. Your journey across all ten provinces of Zambia is nearly finished.`
    : `You have survived ${c.province}. The road to ${getChapter(c.number + 1).province} lies ahead.`;
  let lastY = draw.wrapText(ctx, body, 40, 250, W - 80, 20);
  if (player.flags.criminal_record) {
    lastY += 32;
    ctx.fillStyle = `rgb(${theme.redSoft[0]*255}, ${theme.redSoft[1]*255}, ${theme.redSoft[2]*255})`;
    ctx.fillText("FLAG SET: criminal_record", W / 2, lastY, W - 80);
  }
  const btnY = Math.max(340, lastY + 42);
  chapCompleteRetryBtn.setPosition(W / 2 - 65, btnY);
  chapCompleteMenuBtn.setPosition(W / 2 - 65, btnY + 52);
  chapCompleteRetryBtn.draw(ctx);
  chapCompleteMenuBtn.draw(ctx);
}

function drawGameComplete() {
  draw.centeredTitle(ctx, "ZED EMPIRE — JOURNEY COMPLETE", 180, W);
  ctx.fillStyle = `rgb(${theme.creamDim[0]*255}, ${theme.creamDim[1]*255}, ${theme.creamDim[2]*255})`;
  ctx.font = fonts.get(14);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lastY = draw.wrapText(ctx, "From the streets of Lusaka to the mountains of Muchinga, you have crossed all ten provinces of Zambia. Your empire is built.", 40, 250, W - 80, 20);
  ctx.fillStyle = `rgb(${theme.gold[0]*255}, ${theme.gold[1]*255}, ${theme.gold[2]*255})`;
  ctx.fillText(`Final savings: K${bank.savings}`, W / 2, lastY + 40, W - 80);
  const menuY = Math.max(420, lastY + 90);
  gameCompleteMenuBtn.setPosition(W / 2 - 65, menuY);
  gameCompleteStoryBtn.setPosition(W / 2 - 65, menuY + 52);
  gameCompleteMenuBtn.draw(ctx);
  gameCompleteStoryBtn.draw(ctx);
}

function drawGameOver() {
  draw.centeredTitle(ctx, lossCount >= 2 ? "ROBBED — START AGAIN" : "SETBACK — RECOVER", 220, W);
  ctx.fillStyle = `rgb(${theme.creamDim[0]*255}, ${theme.creamDim[1]*255}, ${theme.creamDim[2]*255})`;
  ctx.font = fonts.get(14);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lastY = draw.wrapText(ctx, gameOverText || "", 40, 270, W - 80, 20);
  const noteY = lastY + 34;
  ctx.fillStyle = `rgb(${theme.gold[0]*255}, ${theme.gold[1]*255}, ${theme.gold[2]*255})`;
  ctx.fillText(lossCount >= 2 ? "Bank emptied after the robbery." : "No money is saved from losing.", W / 2, noteY, W - 80);
  const btnY = Math.max(360, noteY + 40);
  gameOverRetryBtn.setPosition(W / 2 - 65, btnY);
  gameOverMenuBtn.setPosition(W / 2 - 65, btnY + 52);
  gameOverStoryBtn.setPosition(W / 2 - 65, btnY + 104);
  gameOverRetryBtn.draw(ctx);
  gameOverMenuBtn.draw(ctx);
  gameOverStoryBtn.draw(ctx);
}

// ============================================================
//  LOOP
// ============================================================
let lastTime = 0;
function loop(timestamp) {
  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.1) : 0;
  lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

init();
