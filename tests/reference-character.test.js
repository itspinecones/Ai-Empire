import test from 'node:test';import assert from 'node:assert/strict';
import {selectCharacterFrame,CHARACTER,createReferenceCharacter} from '../src/reference-character.js';
import {ATLAS} from '../src/character-frames.js';
test('direction chooses the correct artwork without changing identity mid-stride',()=>{
 const cases=[[0,8,false],[Math.PI/2,8,true],[Math.PI,9,true],[-Math.PI/2,9,false]];
 for(const [heading,index,flip]of cases)for(const stride of [0,.9,1.8,2.7,3.6])assert.deepEqual(selectCharacterFrame({pose:'walking',heading,stride}),{index,flip,rear:index===9});
});
test('pose rectangles stay within the atlas and use one consistent drawing scale',()=>{
 const scale=CHARACTER.standingHeight/ATLAS.standingHeight;
 for(const f of ATLAS.frames){assert.ok(f.w>0&&f.h>0);assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=ATLAS.width&&f.y+f.h<=ATLAS.height);assert.ok(f.h*scale<CHARACTER.baseline);assert.ok(f.anchorX>=f.x&&f.anchorX<=f.x+f.w);}
 assert.equal(selectCharacterFrame({pose:'seated'}).index,10);assert.equal(selectCharacterFrame({pose:'petting'}).index,11);assert.equal(selectCharacterFrame({pose:'window'}).index,9);
});
test('failed artwork load surfaces an error instead of silently using a substitute',async()=>{
 const Previous=globalThis.Image;globalThis.Image=class{async decode(){throw Error('load failed');}};
 try{await assert.rejects(createReferenceCharacter({}),/load failed/);}finally{globalThis.Image=Previous;}
});
