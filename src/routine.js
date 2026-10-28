// Room life uses visible elapsed time, never the business/job state.
// These are the two activities supported by the approved seated artwork.
// Walking, petting and sleep need their own poses before joining this routine.
const SEQUENCE = Object.freeze([
  Object.freeze({ activity: 'typing', duration: 16000 }),
  Object.freeze({ activity: 'desk-rest', duration: 7000 }),
  Object.freeze({ activity: 'typing', duration: 22000 }),
  Object.freeze({ activity: 'desk-rest', duration: 11000 }),
]);
const CYCLE_MS = SEQUENCE.reduce((sum, entry) => sum + entry.duration, 0);

export const createRoomRoutine = () => ({ elapsed: 0, activity: 'typing' });

export function advanceRoomRoutine(routine, elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return routine.activity;
  routine.elapsed = (routine.elapsed + elapsedMs % CYCLE_MS) % CYCLE_MS;
  let cursor = routine.elapsed;
  for (const entry of SEQUENCE) {
    if (cursor < entry.duration) {
      routine.activity = entry.activity;
      return routine.activity;
    }
    cursor -= entry.duration;
  }
}
