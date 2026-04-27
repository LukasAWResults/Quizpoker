const STORAGE_KEY = 'qp_cats_v1';

let pool = [];
let idx = 0;
let enabled = new Set();

// ── INIT ──────────────────────────────────────────
function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { enabled = new Set(JSON.parse(saved)); } catch { enableAll(); }
  } else {
    enableAll();
  }
  renderCats();
  updateStartBtn();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function enableAll() { enabled = new Set(QUESTIONS.map(c => c.id)); }

// ── CATEGORY SCREEN ───────────────────────────────
function renderCats() {
  const list = document.getElementById('cat-list');
  list.innerHTML = '';
  QUESTIONS.forEach(cat => {
    const on = enabled.has(cat.id);
    const item = document.createElement('div');
    item.className = 'cat-item';
    item.innerHTML = `
      <div class="cat-icon">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-count">${cat.questions.length}&nbsp;Fragen</div>
      <div class="cat-check ${on ? 'on' : ''}" data-id="${cat.id}"></div>`;
    item.addEventListener('click', () => toggle(cat.id, item));
    list.appendChild(item);
  });
}

function toggle(id, item) {
  if (enabled.has(id)) { enabled.delete(id); } else { enabled.add(id); }
  item.querySelector('.cat-check').className = 'cat-check' + (enabled.has(id) ? ' on' : '');
  save();
  updateStartBtn();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
}

function updateStartBtn() {
  document.getElementById('btn-start').disabled = enabled.size === 0;
}

// ── GAME ──────────────────────────────────────────
function startGame() {
  pool = [];
  QUESTIONS.forEach(cat => {
    if (enabled.has(cat.id)) {
      cat.questions.forEach(q => pool.push({ ...q, _cat: cat.icon + ' ' + cat.name }));
    }
  });
  shuffle(pool);
  idx = 0;
  show('screen-game');
  loadQ();
}

function loadQ() {
  const q = pool[idx];
  document.getElementById('q-text').textContent = q.frage;
  document.getElementById('h1-text').textContent = q.hinweis1;
  document.getElementById('h2-text').textContent = q.hinweis2;
  document.getElementById('ans-text').textContent = q.antwort;
  document.getElementById('counter').textContent = `${idx + 1} / ${pool.length}`;
  document.getElementById('cat-badge').textContent = q._cat;
  ['card-h1', 'card-h2', 'card-ans'].forEach(id => {
    document.getElementById(id).classList.remove('open');
  });
}

function next() {
  if (idx < pool.length - 1) { idx++; }
  else { idx = 0; shuffle(pool); }
  loadQ();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── EVENTS ────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-back').addEventListener('click', () => show('screen-cat'));
document.getElementById('btn-next').addEventListener('click', next);
document.getElementById('btn-skip').addEventListener('click', next);
document.getElementById('btn-all').addEventListener('click', () => {
  enableAll(); renderCats(); save(); updateStartBtn();
});
document.getElementById('btn-none').addEventListener('click', () => {
  enabled.clear(); renderCats(); save(); updateStartBtn();
});

['card-h1', 'card-h2', 'card-ans'].forEach(id => {
  document.getElementById(id).addEventListener('click', function () {
    this.classList.add('open');
  });
});

init();
