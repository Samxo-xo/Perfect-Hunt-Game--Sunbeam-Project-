"use strict";

const LEVELS = [
  {
    photoUrl: "https://static.boredpanda.com/blog/wp-content/uploads/2025/06/chilling-ghost-encounters-15-6842f255d2478__700.jpg",
    isPerfect: false,
    hint: "Look at the kids"
  },
  {
    photoUrl: "https://static.boredpanda.com/blog/wp-content/uploads/2025/05/68370e7bd8431_frqmzdln19k61__700.jpg",
    isPerfect: false,
    hint: "what is there in the background"
  },
  {
    photoUrl: "https://img.magnific.com/premium-photo/happy-portrait-grandparents-with-girl-nature-family-relax-support-embrace-bonading-summer-with-old-man-woman-smile-with-grandchild-affection-hug-youth-countryside_590464-107021.jpg?semt=ais_hybrid&w=740&q=80",
    isPerfect: true,
    hint: "Wow! A happy family?"
  }
   
];

let currentIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let isLocked = false; 

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function updateStats() {
  const storedScore = localStorage.getItem('pp_score') || 0;
  const storedStreak = localStorage.getItem('pp_streak') || 0;
  document.getElementById('menuBestScore').textContent = storedScore;
  document.getElementById('menuBestStreak').textContent = storedStreak;
}


function playSound(freq, duration, type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

function playCorrectSound() {
  playSound(880, 0.12, 'square');
  setTimeout(() => playSound(1320, 0.16, 'square'), 110);
}

function playWrongSound() {
  playSound(180, 0.18, 'sawtooth');
}


function startGame() {
  currentIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  isLocked = false;
  loadCurrentLevel();
  showScreen('screen-game');
}

function loadCurrentLevel() {
  const current = LEVELS[currentIndex];
  document.getElementById('photoImg').src = current.photoUrl;
  document.getElementById('levelChip').textContent = `PHOTO ${currentIndex + 1}/${LEVELS.length}`;
  document.getElementById('scoreChip').textContent = `SCORE ${score}`;
  document.getElementById('streakChip').textContent = `🔥 ${streak}`;
  document.getElementById('hintBox').textContent = '';
}

function showFeedback(text, isGood) {
  const msg = document.getElementById('feedbackMsg');
  msg.textContent = text;
  msg.className = `feedback-msg pixel-font show ${isGood ? 'good' : 'bad'}`;
  setTimeout(() => msg.classList.remove('show'), 900);
}

function handleGuess(userGuessedPerfect) {
  if (isLocked) return;
  isLocked = true;

  const current = LEVELS[currentIndex];
  const isCorrect = (userGuessedPerfect === current.isPerfect);

  if (isCorrect) {
    score += 10;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    playCorrectSound();
    showFeedback(current.isPerfect ? "YES — PERFECT DAY! ✨" : "CAUGHT IT! ✨", true);
    
    setTimeout(() => {
      isLocked = false;
      nextLevel();
    }, 850);
  } else {
    streak = 0;
    playWrongSound();
    showFeedback(current.isPerfect ? "WRONG — IT WAS PERFECT!" : "WRONG — SOMETHING WAS OFF!", false);
    
    const wrap = document.getElementById('canvasWrap');
    wrap.classList.remove('shake');
    void wrap.offsetWidth; 
    wrap.classList.add('shake');

    setTimeout(() => { isLocked = false; }, 700);
  }

  document.getElementById('scoreChip').textContent = `SCORE ${score}`;
  document.getElementById('streakChip').textContent = `🔥 ${streak}`;
}

function nextLevel() {
  currentIndex++;
  if (currentIndex < LEVELS.length) {
    loadCurrentLevel();
  } else {
    endGame();
  }
}

function endGame() {
  const oldBestScore = parseInt(localStorage.getItem('pp_score') || 0, 10);
  const oldBestStreak = parseInt(localStorage.getItem('pp_streak') || 0, 10);

  if (score > oldBestScore) localStorage.setItem('pp_score', score);
  if (bestStreak > oldBestStreak) localStorage.setItem('pp_streak', bestStreak);

  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalStreak').textContent = bestStreak;
  document.getElementById('finalBest').textContent = localStorage.getItem('pp_score');
  
  updateStats();
  showScreen('screen-results');
}


document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('replayBtn').addEventListener('click', startGame);
document.getElementById('perfectBtn').addEventListener('click', () => handleGuess(true));
document.getElementById('notPerfectBtn').addEventListener('click', () => handleGuess(false));

document.getElementById('hintBtn').addEventListener('click', () => {
  document.getElementById('hintBox').textContent = "💡 " + LEVELS[currentIndex].hint;
});

document.getElementById('menuBtn').addEventListener('click', () => { updateStats(); showScreen('screen-menu'); });
document.getElementById('backMenuBtn').addEventListener('click', () => { updateStats(); showScreen('screen-menu'); });

updateStats();


document.getElementById('navHomeBtn').addEventListener('click', () => {
  setActiveNav('navHomeBtn');
  updateStats();
  showScreen('screen-menu');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('navRuleBtn').addEventListener('click', () => {
  const rulesSection = document.getElementById('section-rules');
  if (!rulesSection) return;

  const isHidden = rulesSection.classList.contains('hidden');

  if (isHidden) {
    rulesSection.classList.remove('hidden');
    setActiveNav('navRuleBtn');
    rulesSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    rulesSection.classList.add('hidden');
    setActiveNav('navHomeBtn');
  }
});

document.getElementById('navAboutBtn').addEventListener('click', () => {
  setActiveNav('navAboutBtn');
  const aboutSection = document.getElementById('section-about');
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  }
});

document.querySelectorAll('.scroll-top-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveNav('navHomeBtn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

function setActiveNav(buttonId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(buttonId);
  if (btn) btn.classList.add('active');
}


function setActiveNav(buttonId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(buttonId).classList.add('active');
}

document.getElementById('navHomeBtn').addEventListener('click', () => {
  setActiveNav('navHomeBtn');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


document.getElementById('navRuleBtn').addEventListener('click', () => {
  const rulesSection = document.getElementById('section-rules');
  const isHidden = rulesSection.classList.contains('hidden');

  if (isHidden) {
    rulesSection.classList.remove('hidden');
    setActiveNav('navRuleBtn');
    rulesSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    rulesSection.classList.add('hidden');
    setActiveNav('navHomeBtn');
  }
});

document.getElementById('navAboutBtn').addEventListener('click', () => {
  setActiveNav('navAboutBtn');
  document.getElementById('section-about').scrollIntoView({ behavior: 'smooth' });
});
document.querySelectorAll('.scroll-top-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveNav('navHomeBtn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
function setActiveNav(buttonId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(buttonId).classList.add('active');
}