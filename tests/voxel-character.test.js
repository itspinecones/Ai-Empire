import test from 'node:test';import assert from 'node:assert/strict';
import {feetAt,CHARACTER} from '../src/voxel-character.js';
test('walk alternates the planted foot every half stride',()=>{
 const first=feetAt(CHARACTER.cycleDistance*.25,true),second=feetAt(CHARACTER.cycleDistance*.75,true);
 assert.equal(first[0][1],0);assert.ok(first[1][1]>.1);
 assert.ok(second[0][1]>.1);assert.equal(second[1][1],0);
 assert.deepEqual(feetAt(0,true),feetAt(CHARACTER.cycleDistance,true));
});
test('walking stance stays on the floor and pose preserves foot spacing',()=>{
 for(let i=0;i<=100;i++){const f=feetAt(i*.04,true);assert.ok(f.some(p=>p[1]===0));assert.equal(f[1][0]-f[0][0],.38);f.forEach(p=>assert.ok(p[1]>=0&&p[1]<=.14));}
 assert.deepEqual(feetAt(10,false),feetAt(0,false));
});
test('all joint poses fit the same canvas through a complete turn',async()=>{
 const {createVoxelCharacter}=await import('../src/voxel-character.js');let points=[];
 const ctx={clearRect(){},beginPath(){},ellipse(){},fill(){},closePath(){},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);}};
 const canvas={getContext:()=>ctx};const model=createVoxelCharacter(canvas);
 for(const pose of ['seated','petting','window','walking'])for(let i=0;i<8;i++){
  points=[];model.paint({pose,stride:i*.45,heading:i*Math.PI/4,reduced:true});
  assert.ok(points.length>0);assert.equal(canvas.width,128);assert.equal(canvas.height,160);
  for(const [x,y]of points){assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(x>=0&&x<=128&&y>=0&&y<=160,`${pose}: ${x},${y}`);}
 }
});
