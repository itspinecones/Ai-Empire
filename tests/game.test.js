import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVE_KEY, initialState, readState, advance, performAction,
  gpuCost, agentCost, jobReward, incomeRate, clockText } from '../src/game.js';

test('preview cannot overwrite the live storage key', () => {
  assert.notEqual(SAVE_KEY, 'ai-empire-v01');
});
test('new game earns its first GPU upgrade without negative cash', () => {
  const s = initialState(1000);
  assert.equal(performAction(s, 'gpu'), false);
  for (let i = 0; i < 5; i++) { performAction(s, 'job'); advance(s, s.job.endsAt); }
  assert.equal(s.cash, 25); assert.equal(s.rp, 5);
  assert.equal(performAction(s, 'gpu'), true);
  assert.equal(s.gpu, 2); assert.equal(s.cash, 0);
  assert.equal(gpuCost(s), 41); assert.equal(jobReward(s), 10);
});
test('buying an agent spends the correct amount and creates passive income', () => {
  const s = initialState(1000);
  s.cash = 100;
  assert.equal(performAction(s, 'agent'), true);
  assert.equal(s.cash, 0); assert.equal(s.agents, 1);
  assert.equal(agentCost(s), 180); assert.equal(incomeRate(s), 1);
  advance(s, 6000); assert.equal(s.cash, 5);
});
test('model unlock consumes research, scales income, and stops at final model', () => {
  const s = initialState(); s.rp = 19;
  assert.equal(performAction(s, 'unlock'), false);
  s.rp = 20; assert.equal(performAction(s, 'unlock'), true);
  assert.equal(s.rp, 0); assert.equal(s.tier, 1); assert.equal(jobReward(s), 10);
  s.tier = 4; s.rp = 10000;
  assert.equal(performAction(s, 'unlock'), false);
  assert.equal(s.rp, 10000);
});
test('offline earnings stop at eight hours and are never awarded twice', () => {
  const s = initialState(1000); s.agents = 2; s.gpu = 3;
  const next = 1000 + 12 * 60 * 60 * 1000;
  assert.equal(advance(s, next).earned, 172800);
  assert.equal(advance(s, next).earned, 0);
  assert.equal(advance(s, next + 1000).earned, 6);
});
test('reload retains purchases and accounts only for time since the saved timestamp', () => {
  const s = initialState(1000); s.cash = 100; performAction(s, 'agent');
  advance(s, 3000);
  const restored = readState(JSON.stringify(s), 8000);
  assert.equal(advance(restored, 8000).earned, 5);
  assert.equal(restored.cash, 7); assert.equal(restored.agents, 1);
});
test('corrupt and hostile save values recover into valid game state', () => {
  for (const raw of ['bad JSON', 'null', '[]']) assert.deepEqual(readState(raw, 1000), initialState(1000));
  const s = readState('{"cash":-40,"gpu":0,"agents":-2,"rp":"Infinity","tier":999,"last":999999}', 1000);
  assert.equal(s.cash, 0); assert.equal(s.gpu, 1); assert.equal(s.agents, 0);
  assert.equal(s.rp, 0); assert.equal(s.tier, 4); assert.equal(s.last, 1000);
  assert.ok(Number.isFinite(incomeRate(s)));
});
test('clock starts at 6 AM, advances, and crosses midnight', () => {
  const s = initialState(1000);
  assert.equal(clockText(s), 'Day 1 · 6:00 AM');
  advance(s, 61000); assert.equal(clockText(s), 'Day 1 · 7:00 AM');
  s.gameMinutes = 1440; assert.equal(clockText(s), 'Day 2 · 12:00 AM');
});
test('a backward system clock does not generate income or double count elapsed time', () => {
  const s = initialState(5000); s.agents = 1;
  assert.equal(advance(s, 4000).earned, 0);
  assert.equal(s.last, 5000);
  assert.equal(advance(s, 6000).earned, 1);
});

test('a job starts without payment and rejects repeated starts', () => {
  const s = initialState(1000);
  assert.equal(performAction(s, 'job'), true);
  assert.equal(s.cash, 0); assert.equal(s.rp, 0);
  assert.equal(performAction(s, 'job'), false);
  advance(s, 10999); assert.equal(s.cash, 0);
  const result = advance(s, 11000);
  assert.deepEqual(result.completed, {cash:5,rp:1});
  assert.equal(s.cash, 5); assert.equal(s.job, null);
  advance(s, 12000); assert.equal(s.cash, 5);
});
test('mid-job reload preserves remaining time and pays once', () => {
  const s = initialState(1000); performAction(s, 'job');
  const restored = readState(JSON.stringify(s), 6000);
  advance(restored, 6000); assert.equal(restored.cash, 0);
  assert.equal(restored.job.endsAt, 11000);
  advance(restored, 21000); assert.equal(restored.cash, 5);
  const again = readState(JSON.stringify(restored), 22000);
  advance(again, 22000); assert.equal(again.cash, 5);
});
test('reward is snapshotted, not increased by buying upgrades mid-job', () => {
  const s = initialState(1000); s.cash = 25; performAction(s, 'job');
  performAction(s, 'gpu'); advance(s, 11000);
  assert.equal(s.cash, 5); assert.equal(s.rp, 1);
  performAction(s, 'job'); advance(s, 21000);
  assert.equal(s.cash, 15); assert.equal(s.rp, 3);
});
test('old saves migrate with no job and invalid job data is discarded', () => {
  assert.equal(readState('{"cash":25}',1000).job,null);
  assert.equal(readState('{"job":{"startedAt":0,"endsAt":-1,"cash":999,"rp":1}}',1000).job,null);
});
