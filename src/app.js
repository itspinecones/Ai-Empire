import { SAVE_KEY, MODEL_NAMES, initialState, readState, advance, performAction,
  gpuCost, agentCost, unlockCost, jobReward, incomeRate, formatNumber as fmt, clockText } from './game.js';
import { startRoomLife } from './room-life.js';

document.documentElement.classList.toggle('paused', document.hidden);

const el = id => document.getElementById(id);
let storageAvailable = true, raw = null;
try { raw = localStorage.getItem(SAVE_KEY); } catch { storageAvailable = false; }
let state = readState(raw);
const startup = advance(state);
function announceCompletion(result) {
  if (result.completed) {
    el('toast').textContent = 'Job complete · +$' + fmt(result.completed.cash) + ' · +' + result.completed.rp + ' research';
    persist();
  }
}
let lastSaved = 0;

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    lastSaved = Date.now(); storageAvailable = true;
  } catch { storageAvailable = false; }
  el('startupStatus').textContent = storageAvailable ? '' : 'Saving is unavailable. You can play, but progress may be lost when this page closes.';
  el('startupStatus').hidden = storageAvailable;
}

function render() {
  el('cash').textContent = '$' + fmt(state.cash);
  el('cashTop').textContent = '$' + fmt(state.cash);
  el('rate').textContent = '$' + fmt(incomeRate(state)) + '/s';
  el('gpu').textContent = state.gpu;
  el('rp').textContent = fmt(state.rp);
  el('model').textContent = 'Model: ' + MODEL_NAMES[state.tier];
  el('agents').textContent = state.agents + ' agents';
  el('dayTime').textContent = clockText(state);
  const remaining = state.job ? Math.max(0, state.job.endsAt - Date.now()) : 0;
  el('job').textContent = state.job ? 'Working… ' + (remaining / 1000).toFixed(1) + 's' : 'Start AI Job · +$' + fmt(jobReward(state));
  el('job').disabled = Boolean(state.job);
  el('jobProgress').value = state.job ? Math.min(10, Math.max(0, 10 - remaining / 1000)) : 0;
  el('jobStatus').textContent = state.job ? 'Training · reward $' + fmt(state.job.cash) + ' + ' + state.job.rp + ' research' : 'Ready · 10-second job';
  el('buyGpu').textContent = 'Upgrade GPU · $' + fmt(gpuCost(state));
  el('buyGpu').disabled = state.cash < gpuCost(state) || state.gpu >= 1000;
  el('buyAgent').textContent = 'Hire AI Agent · $' + fmt(agentCost(state));
  el('buyAgent').disabled = state.cash < agentCost(state) || state.agents >= 1000;
  const finalModel = state.tier === MODEL_NAMES.length - 1;
  el('unlock').textContent = finalModel ? 'All models unlocked' : 'Unlock next model · ' + unlockCost(state) + ' RP';
  el('unlock').disabled = finalModel || state.rp < unlockCost(state);
}

for (const [id, action] of [['job', 'job'], ['buyGpu', 'gpu'], ['buyAgent', 'agent'], ['unlock', 'unlock']]) {
  el(id).addEventListener('click', () => {
    advance(state);
    if (performAction(state, action)) {
      el('toast').textContent = action === 'job' ? 'AI job started. Your computer is running it.' : action === 'gpu'
        ? 'GPU upgraded. Jobs and agents now earn more.' : action === 'agent'
        ? 'AI agent hired. Passive income is running.' : 'Unlocked ' + MODEL_NAMES[state.tier] + '.';
    }
    persist(); render();
  });
}

el('reset').addEventListener('click', () => {
  if (!confirm('Erase this preview’s progress? Your live game save will not be touched.')) return;
  state = initialState(); el('toast').textContent = 'Preview progress reset.';
  persist(); render();
});

document.querySelectorAll('.nav button').forEach(button => {
  button.setAttribute('aria-pressed', String(button.dataset.view === 'room'));
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav button').forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    const view = button.dataset.view;
    el('toast').textContent = view === 'room' ? '' : view === 'store'
      ? 'Store visits and opening hours are planned for a future update.'
      : view[0].toUpperCase() + view.slice(1) + ' is planned for a future update.';
  });
});

if (startup.elapsed > 5 && startup.earned > 0) el('toast').textContent = 'Offline earnings: $' + fmt(startup.earned);
persist(); render(); announceCompletion(startup);

setInterval(() => {
  if (document.hidden) return;
  const result = advance(state); render(); announceCompletion(result);
  if (Date.now() - lastSaved >= 5000) persist();
}, 100);
document.addEventListener('visibilitychange', () => {
  const result = advance(state);
  document.documentElement.classList.toggle('paused', document.hidden);
  if (!document.hidden && result.earned > 0 && result.elapsed > 5)
    el('toast').textContent = 'Welcome back. Earned $' + fmt(result.earned) + ' while away.';
  persist(); render(); announceCompletion(result);
});
window.addEventListener('pagehide', () => { advance(state); persist(); });

// Artwork loading is independent of the economy.
const art = el('world');
art.addEventListener('error', () => { el('sceneError').hidden = false; });
if (art.complete && !art.naturalWidth) el('sceneError').hidden = false;
el('openUpgrades').addEventListener('click', () => el('upgrades').showModal());
document.querySelector('[data-view="research"]').addEventListener('click', () => el('upgrades').showModal());

startRoomLife(() => state.gameMinutes);
