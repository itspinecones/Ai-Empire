// Pure game rules: no browser or rendering dependencies.
export const SAVE_KEY = 'ai-empire-development-v1';
export const JOB_DURATION_MS = 10000;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
export const MODEL_NAMES = ['Basic Classifier', 'Text Assistant', 'Vision Model', 'Reasoning Engine', 'Frontier AI'];
export const initialState = (now = Date.now()) => ({
  version: 1, cash: 0, gpu: 1, agents: 0, rp: 0, tier: 0,
  gameMinutes: 360, last: now, job: null,
});

const finite = (value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value)) : fallback;

export function readState(raw, now = Date.now()) {
  const defaults = initialState(now);
  try {
    const value = JSON.parse(raw || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
    return {
      ...defaults,
      cash: finite(value.cash, 0),
      gpu: Math.floor(finite(value.gpu, 1, 1, 1000)),
      agents: Math.floor(finite(value.agents, 0, 0, 1000)),
      rp: finite(value.rp, 0),
      tier: Math.floor(finite(value.tier, 0, 0, MODEL_NAMES.length - 1)),
      gameMinutes: finite(value.gameMinutes, 360),
      last: finite(value.last, now, 0, now),
      job: value.job && Number.isFinite(value.job.startedAt) && Number.isFinite(value.job.endsAt)
        && value.job.startedAt >= 0 && value.job.endsAt - value.job.startedAt === JOB_DURATION_MS
        && Number.isFinite(value.job.cash) && value.job.cash > 0
        && Number.isFinite(value.job.rp) && value.job.rp > 0
        ? { startedAt: value.job.startedAt, endsAt: value.job.endsAt, cash: value.job.cash, rp: value.job.rp } : null,
    };
  } catch { return defaults; }
}

export const gpuCost = s => Math.floor(25 * 1.65 ** (s.gpu - 1));
export const agentCost = s => Math.floor(100 * 1.8 ** s.agents);
export const unlockCost = s => 20 * (s.tier + 1) ** 2;
export const jobReward = s => s.gpu * 5 * (s.tier + 1);
export const incomeRate = s => s.agents * s.gpu * (s.tier + 1);

// Advance once per interval. The timestamp also prevents duplicate offline pay.
export function advance(s, now = Date.now()) {
  const elapsed = Math.min(OFFLINE_CAP_SECONDS, Math.max(0, (now - s.last) / 1000));
  const earned = elapsed * incomeRate(s);
  s.cash = Math.min(Number.MAX_SAFE_INTEGER, s.cash + earned);
  s.gameMinutes += elapsed;
  s.last = Math.max(s.last, now);
  let completed = null;
  if (s.job && now >= s.job.endsAt) {
    completed = { cash: s.job.cash, rp: s.job.rp };
    s.job = null;
    s.cash = Math.min(Number.MAX_SAFE_INTEGER, s.cash + completed.cash);
    s.rp = Math.min(Number.MAX_SAFE_INTEGER, s.rp + completed.rp);
  }
  return { elapsed, earned, completed };
}

export function performAction(s, action, now = s.last) {
  if (action === 'job') {
    if (s.job) return false;
    s.job = { startedAt: now, endsAt: now + JOB_DURATION_MS, cash: jobReward(s), rp: s.gpu };
    return true;
  }
  if (action === 'gpu' && s.gpu < 1000 && s.cash >= gpuCost(s)) {
    s.cash -= gpuCost(s); s.gpu++; return true;
  }
  if (action === 'agent' && s.agents < 1000 && s.cash >= agentCost(s)) {
    s.cash -= agentCost(s); s.agents++; return true;
  }
  if (action === 'unlock' && s.tier < MODEL_NAMES.length - 1 && s.rp >= unlockCost(s)) {
    s.rp -= unlockCost(s); s.tier++; return true;
  }
  return false;
}

export const formatNumber = n => n >= 1e9 ? (n / 1e9).toFixed(2) + 'B'
  : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M'
  : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K'
  : Math.floor(n).toLocaleString('en-US');

export function clockText(s) {
  const minute = Math.floor(s.gameMinutes);
  const hr = Math.floor((minute % 1440) / 60);
  return `Day ${Math.floor(minute / 1440) + 1} · ${hr % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${hr >= 12 ? 'PM' : 'AM'}`;
}
