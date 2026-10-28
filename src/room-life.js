import {ROOM_SAVE_KEY,readRoomRoutine,syncRoomHour,advanceTravel,roomFrame,project} from './routine.js';
import {createReferenceCharacter} from './reference-character.js';
export function startRoomLife(getMinutes) {
 const stage=document.querySelector('.room-stage'),canvas=document.getElementById('characterActor');
 const portrait=matchMedia('(orientation: portrait)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let raw=null;try{raw=localStorage.getItem(ROOM_SAVE_KEY);}catch{}
 const s=readRoomRoutine(raw,getMinutes());
 let last=performance.now(),saved=last,raf=null,time=0,model;
 function save(){try{localStorage.setItem(ROOM_SAVE_KEY,JSON.stringify(s));}catch{}saved=performance.now();}
 function render(dt=1) {
  const f=roomFrame(s,portrait.matches,reduced.matches);
  stage.dataset.pose=f.pose;document.documentElement.dataset.roomActivity=f.pose==='walking'?'travel':f.activity;
  stage.setAttribute('aria-label',f.pose==='walking'?'Developer walking to '+f.activity:({typing:'Developer typing',cat:'Developer petting the cat',window:'Developer looking out the window'}[f.activity]));
  canvas.style.left=f.x+'%';canvas.style.top=f.y+'%';
  let heading=({typing:2.35,cat:1.25,window:3.75}[f.activity]);
  if(f.pose==='walking'){
   const target=project(s.route[0],portrait.matches),rect=stage.getBoundingClientRect();
   const dx=(target[0]-f.x)*rect.width,dy=(target[1]-f.y)*rect.height;
   heading=Math.atan2(dx/1.5+dy/.62,-dx/1.5+dy/.62);
  }
  model.paint({pose:f.pose,stride:s.stride,time,heading,reduced:reduced.matches,dt});
 }
 function tick(now){raf=null;if(document.hidden)return;
  const interval=reduced.matches?250:s.route.length?1000/30:1000/12;
  if(now-last>=interval){const dt=(now-last)/1000;last=now;
   const changed=syncRoomHour(s,getMinutes());if(changed)save();
   const wasTraveling=s.route.length>0;advanceTravel(s,Math.min(dt,.25),reduced.matches);if(!reduced.matches)time+=dt;if(!reduced.matches||changed||wasTraveling)render(dt);if(now-saved>=5000)save();
  }raf=requestAnimationFrame(tick);
 }
 function resume(){last=performance.now();if(model&&!document.hidden&&raf===null)raf=requestAnimationFrame(tick);}
 createReferenceCharacter(canvas).then(character=>{
  model=character;syncRoomHour(s,getMinutes());render();resume();
 }).catch(()=>{const e=document.getElementById('sceneError');e.textContent='The character artwork could not load. Reload to retry; jobs still work.';e.hidden=false;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf!==null)cancelAnimationFrame(raf);raf=null;save();}else resume();});
 window.addEventListener('pagehide',save);
 portrait.addEventListener('change',()=>{if(model)render();});
 reduced.addEventListener('change',()=>{if(model)render();});
}
