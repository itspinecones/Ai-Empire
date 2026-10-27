import { SAVE_KEY, MODEL_NAMES, initialState, readState, advance, performAction,
  gpuCost, agentCost, unlockCost, jobReward, incomeRate, formatNumber as fmt, clockText } from './game.js';

const el = id => document.getElementById(id);
let storageAvailable = true, raw = null;
try { raw = localStorage.getItem(SAVE_KEY); } catch { storageAvailable = false; }
let state = readState(raw);
const startup = advance(state);
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
  el('job').textContent = 'Complete AI Job · +$' + fmt(jobReward(state));
  el('job').disabled = false;
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
      el('toast').textContent = action === 'job' ? '' : action === 'gpu'
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
persist(); render();

setInterval(() => {
  if (document.hidden) return;
  advance(state); render();
  if (Date.now() - lastSaved >= 5000) persist();
}, 1000);
document.addEventListener('visibilitychange', () => {
  const result = advance(state);
  if (!document.hidden && result.earned > 0 && result.elapsed > 5)
    el('toast').textContent = 'Welcome back. Earned $' + fmt(result.earned) + ' while away.';
  persist(); render();
});
window.addEventListener('pagehide', () => { advance(state); persist(); });

// Scene problems must not prevent the economy or interface from starting.
import('./room.js').then(({ startRoom }) => startRoom(el('world'))).catch(error => {
  console.error('Bedroom renderer:', error);
  el('sceneError').hidden = false;
});
