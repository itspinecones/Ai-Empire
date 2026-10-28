import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomRoutine, advanceRoomRoutine } from '../src/routine.js';
import { initialState, performAction, advance, readState } from '../src/game.js';

test('room starts typing without a job and takes breaks on its own', () => {
  const room = createRoomRoutine();
  assert.equal(room.activity, 'typing');
  assert.equal(advanceRoomRoutine(room, 15999), 'typing');
  assert.equal(advanceRoomRoutine(room, 1), 'desk-rest');
  assert.equal(advanceRoomRoutine(room, 7000), 'typing');
  assert.equal(advanceRoomRoutine(room, 22000), 'desk-rest');
  assert.equal(advanceRoomRoutine(room, 11000), 'typing');
});

test('jobs complete and pay during a room break without interrupting the routine', () => {
  const room = createRoomRoutine();
  advanceRoomRoutine(room, 16000);
  const before = structuredClone(room);
  const game = initialState(1000);
  performAction(game, 'job');
  const restored = readState(JSON.stringify(game), 6000);
  advance(restored, 11000);
  assert.equal(restored.cash, 5);
  assert.equal(restored.job, null);
  assert.deepEqual(room, before);
});

test('ambient activity cannot change balances, game clock or saved job', () => {
  const game = initialState(1000);
  performAction(game, 'job');
  const before = JSON.stringify(game);
  const room = createRoomRoutine();
  advanceRoomRoutine(room, 45000);
  assert.equal(JSON.stringify(game), before);
});

test('large visible time steps match incremental updates across many cycles', () => {
  const oneStep = createRoomRoutine(), manySteps = createRoomRoutine();
  advanceRoomRoutine(oneStep, 56000 * 100 + 49000);
  for (let i = 0; i < 5649; i++) advanceRoomRoutine(manySteps, 1000);
  assert.deepEqual(oneStep, manySteps);
  assert.equal(oneStep.activity, 'desk-rest');
});

test('invalid or backwards elapsed time leaves the routine unchanged', () => {
  const room = createRoomRoutine();
  advanceRoomRoutine(room, 17000);
  const before = structuredClone(room);
  for (const delta of [-100, 0, NaN, Infinity]) advanceRoomRoutine(room, delta);
  assert.deepEqual(room, before);
});
