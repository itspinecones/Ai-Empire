// Cosmetic room time is independent of jobs, money and the in-game clock.
export const ROOM_SAVE_KEY = 'ai-empire-room-routine-v1';
export const ACTIVITY_MS = 60000;
export const ACTIVITIES = Object.freeze(['typing', 'walking', 'cat']);
export const CYCLE_MS = ACTIVITY_MS * ACTIVITIES.length;
export const createRoomRoutine = () => ({ elapsed: 0, activity: 'typing' });

export function advanceRoomRoutine(routine, elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return routine.activity;
  routine.elapsed = (routine.elapsed + elapsedMs % CYCLE_MS) % CYCLE_MS;
  routine.activity = ACTIVITIES[Math.floor(routine.elapsed / ACTIVITY_MS)];
  return routine.activity;
}

export function readRoomRoutine(raw) {
  const routine = createRoomRoutine();
  try {
    const value = JSON.parse(raw);
    if (Number.isFinite(value?.elapsed) && value.elapsed >= 0)
      advanceRoomRoutine(routine, value.elapsed);
  } catch { /* A missing or corrupt cosmetic save starts at the desk. */ }
  return routine;
}

// Hand-authored safe floor waypoints, calibrated to each approved room image.
// No route crosses the bed, nightstand, desk, slippers or cat.
export const FLOOR = Object.freeze({
  desk: { wide: [61.5, 60], tall: [61, 53] },
  north: { wide: [55.5, 62], tall: [53.5, 55.5] },
  east: { wide: [63, 65], tall: [64, 58] },
  south: { wide: [61, 76], tall: [61, 66] },
  west: { wide: [55, 68], tall: [53, 60] },
  cat: { wide: [60, 70], tall: [58, 62] },
});
const WALK = [[0,'desk'],[6000,'north'],[17000,'east'],[30000,'south'],[41000,'west'],[51000,'north'],[60000,'cat']];
const RETURN = [[0,'cat'],[2500,'north'],[5000,'desk']];

function sampleRoute(route, time, orientation) {
  const next = route.findIndex(([at]) => at > time);
  const index = next < 0 ? route.length - 1 : Math.max(1, next);
  const [startTime, from] = route[index - 1], [endTime, to] = route[index];
  const a = FLOOR[from][orientation], b = FLOOR[to][orientation];
  const t = Math.max(0, Math.min(1, (time - startTime) / (endTime - startTime)));
  const eased = t * t * (3 - 2 * t);
  return {
    x: a[0] + (b[0] - a[0]) * eased,
    y: a[1] + (b[1] - a[1]) * eased,
    facing: b[0] < a[0] ? -1 : 1,
    row: b[1] < a[1] ? 1 : 0,
  };
}

export function roomFrame(routine, orientation = 'wide', reducedMotion = false) {
  const time = routine.elapsed % ACTIVITY_MS;
  const remaining = Math.ceil((ACTIVITY_MS - time) / 1000);
  const common = { activity: routine.activity, remaining };
  if (routine.activity === 'typing') return { ...common, pose: 'seated' };
  if (routine.activity === 'cat' && time < 55000)
    return { ...common, pose: 'petting', frame: reducedMotion ? 0 : Math.floor(time / 450) % 4 };
  // Reduced motion keeps the standing pose at a fixed floor point, without travel.
  const route = routine.activity === 'walking' ? WALK : RETURN;
  const routeTime = routine.activity === 'walking' ? time : time - 55000;
  const position = reducedMotion
    ? { x: FLOOR.cat[orientation][0], y: FLOOR.cat[orientation][1], facing: 1, row: 0 }
    : sampleRoute(route, routeTime, orientation);
  return { ...common, pose: 'walking', frame: reducedMotion ? 1 : Math.floor(routeTime / 190) % 4, ...position };
}
