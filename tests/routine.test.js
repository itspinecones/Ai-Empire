import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomRoutine, advanceRoomRoutine, readRoomRoutine, roomFrame, ACTIVITY_MS, CYCLE_MS, ACTIVITIES, FLOOR } from '../src/routine.js';
import { initialState, performAction, advance, readState } from '../src/game.js';

test('typing, walking and cat time each last exactly one minute; sleep is excluded', () => {
  const room = createRoomRoutine();
  assert.equal(ACTIVITY_MS, 60000);
  assert.deepEqual(ACTIVITIES, ['typing','walking','cat']);
  for (const [current, next] of [['typing','walking'],['walking','cat'],['cat','typing']]) {
    assert.equal(room.activity, current);
    assert.equal(advanceRoomRoutine(room, 59999), current);
    assert.equal(advanceRoomRoutine(room, 1), next);
  }
  assert.equal(room.elapsed, 0);
});

test('job completes during cat time without interrupting the routine', () => {
  const room = readRoomRoutine('{"elapsed":130000}');
  const before = structuredClone(room);
  const game = initialState(1000);
  performAction(game, 'job');
  const restored = readState(JSON.stringify(game), 6000);
  advance(restored, 11000);
  assert.equal(restored.cash, 5);
  assert.equal(restored.job, null);
  assert.deepEqual(room, before);
});

test('large elapsed steps match incremental updates across cycles', () => {
  const one = createRoomRoutine(), many = createRoomRoutine();
  advanceRoomRoutine(one, CYCLE_MS * 10 + 129000);
  for (let i = 0; i < 1929; i++) advanceRoomRoutine(many, 1000);
  assert.deepEqual(one, many);
  assert.equal(one.activity, 'cat');
});

test('reload preserves activity and remaining time; invalid saves recover', () => {
  const room = readRoomRoutine('{"elapsed":97000}');
  assert.equal(room.activity, 'walking');
  assert.equal(roomFrame(room).remaining, 23);
  assert.deepEqual(readRoomRoutine(JSON.stringify(room)), room);
  for (const raw of ['broken','null','{"elapsed":-1}','{"elapsed":"90000"}'])
    assert.deepEqual(readRoomRoutine(raw), createRoomRoutine());
});

test('invalid or backwards time does not advance the routine', () => {
  const room = readRoomRoutine('{"elapsed":97000}');
  const before = structuredClone(room);
  for (const delta of [-100, 0, NaN, Infinity]) advanceRoomRoutine(room, delta);
  assert.deepEqual(room, before);
});

test('routes reach cat and return to the desk in both orientations without jumps', () => {
  for (const view of ['wide','tall']) {
    const start = roomFrame(readRoomRoutine('{"elapsed":60000}'), view);
    assert.deepEqual([start.x,start.y], FLOOR.desk[view]);
    const arrive = roomFrame(readRoomRoutine('{"elapsed":119999.99}'), view);
    assert.ok(Math.hypot(arrive.x-FLOOR.cat[view][0],arrive.y-FLOOR.cat[view][1]) < .001);
    const leave = roomFrame(readRoomRoutine('{"elapsed":175000}'), view);
    assert.deepEqual([leave.x,leave.y], FLOOR.cat[view]);
    const finish = roomFrame(readRoomRoutine('{"elapsed":179999.99}'), view);
    assert.ok(Math.hypot(finish.x-FLOOR.desk[view][0],finish.y-FLOOR.desk[view][1]) < .001);
    let previous = start;
    for (let elapsed = 60100; elapsed < 120000; elapsed += 100) {
      const frame = roomFrame(readRoomRoutine(JSON.stringify({elapsed})), view);
      assert.ok(Math.hypot(frame.x-previous.x, frame.y-previous.y) < .3, 'no position jumps');
      assert.ok(frame.x >= 53 && frame.x <= 64 && frame.y >= 53 && frame.y <= 76, 'stays on approved floor route');
      previous = frame;
    }
  }
});

test('reduced motion keeps standing position and all sprite frames stationary', () => {
  const first = roomFrame(readRoomRoutine('{"elapsed":61000}'), 'wide', true);
  const later = roomFrame(readRoomRoutine('{"elapsed":110000}'), 'wide', true);
  assert.deepEqual([first.x,first.y,first.frame], [later.x,later.y,later.frame]);
  assert.equal(roomFrame(readRoomRoutine('{"elapsed":145000}'),'wide',true).frame,0);
});
