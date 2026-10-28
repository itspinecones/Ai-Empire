import { ROOM_SAVE_KEY, readRoomRoutine, advanceRoomRoutine, roomFrame } from './routine.js';

export function startRoomLife() {
  const stage = document.querySelector('.room-stage');
  const actor = document.getElementById('walkingActor');
  const walkSprite = actor.querySelector('.walk-sprite');
  const petSprite = document.getElementById('pettingActor');
  const status = document.getElementById('roomStatus');
  const portrait = matchMedia('(orientation: portrait)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let raw = null;
  try { raw = localStorage.getItem(ROOM_SAVE_KEY); } catch { /* Cosmetic only. */ }
  const routine = readRoomRoutine(raw);
  let lastTick = performance.now(), lastSaved = lastTick, raf = null, ready = false;
  let lastPose = '', lastActivity = '';

  function save() {
    try { localStorage.setItem(ROOM_SAVE_KEY, JSON.stringify({ elapsed: routine.elapsed })); } catch { /* Economy reports unavailable storage. */ }
    lastSaved = performance.now();
  }
  function render() {
    const frame = roomFrame(routine, portrait.matches ? 'tall' : 'wide', reducedMotion.matches);
    if (lastActivity !== frame.activity) {
      document.documentElement.dataset.roomActivity = frame.activity;
      lastActivity = frame.activity;
      save();
    }
    if (lastPose !== frame.pose) {
      stage.dataset.pose = frame.pose;
      lastPose = frame.pose;
    }
    if (frame.pose === 'walking') {
      actor.style.left = frame.x + '%';
      actor.style.top = frame.y + '%';
      // Atlas frames share a floor-contact baseline despite small drawing offsets.
      const soles = [[497,492,497,491],[466,464,465,467]][frame.row][frame.frame];
      const rowPosition = frame.row * 100 - (497 - soles) / 512 * 100;
      walkSprite.style.backgroundPosition = `${frame.frame * 100 / 3}% ${rowPosition}%`;
      walkSprite.style.transform = `scaleX(${frame.facing})`;
    } else if (frame.pose === 'petting') {
      petSprite.style.backgroundPosition = `${frame.frame % 2 * 100}% ${Math.floor(frame.frame / 2) * 95.694}%`;
    }
    const name = { typing: 'Typing', walking: 'Walking', cat: 'Cat time' }[frame.activity];
    const label = `${name} · ${frame.remaining}s`;
    if (status.textContent !== label) status.textContent = label;
  }
  function tick(now) {
    raf = null;
    if (document.hidden || !ready) return;
    if (now - lastTick >= 1000 / 30) {
      advanceRoomRoutine(routine, now - lastTick);
      lastTick = now;
      render();
      if (now - lastSaved >= 5000) save();
    }
    raf = requestAnimationFrame(tick);
  }
  function resume() {
    lastTick = performance.now();
    if (ready && !document.hidden && raf === null) raf = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (ready) advanceRoomRoutine(routine, performance.now() - lastTick);
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      save();
    } else resume();
  });
  window.addEventListener('pagehide', save);
  portrait.addEventListener('change', () => { if (ready) render(); });
  reducedMotion.addEventListener('change', () => { if (ready) render(); });

  // Preload every pose before allowing the character to leave the desk.
  Promise.all(['walk-atlas.webp','pet-atlas.webp','cat.webp','chair.webp'].map(name => {
    const image = new Image();
    image.src = new URL('../assets/' + name, import.meta.url).href;
    return image.decode();
  })).then(() => {
    ready = true;
    stage.classList.add('routine-ready');
    render(); resume();
  }).catch(() => {
    status.textContent = 'Room animation unavailable';
    const error = document.getElementById('sceneError');
    error.textContent = 'A room animation could not load. Reload to try again; jobs still work.';
    error.hidden = false;
  });
}
