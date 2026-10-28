import {ROOM_SAVE_KEY,readRoomRoutine,syncRoomHour,advanceTravel,roomFrame} from './routine.js';
export function startRoomLife(getMinutes) {
 const stage=document.querySelector('.room-stage'), actor=document.getElementById('walkingActor'), walk=actor.querySelector('.walk-sprite'),pet=document.getElementById('pettingActor'),windowActor=document.getElementById('windowActor');
 const portrait=matchMedia('(orientation: portrait)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let raw=null;try{raw=localStorage.getItem(ROOM_SAVE_KEY);}catch{}
 const s=readRoomRoutine(raw,getMinutes());
 let last=performance.now(),saved=last,raf=null,ready=false,petTime=0;
 function save(){try{localStorage.setItem(ROOM_SAVE_KEY,JSON.stringify(s));}catch{}saved=performance.now();}
 function render(){
  const f=roomFrame(s,portrait.matches,reduced.matches);
  stage.dataset.pose=f.pose;document.documentElement.dataset.roomActivity=f.pose==='seated'?'typing':f.activity;
  stage.setAttribute('aria-label',f.pose==='walking'?'Developer walking to '+f.activity:({typing:'Developer typing',cat:'Developer petting the cat',window:'Developer looking out the window'}[f.activity]));
  if(f.pose==='walking'){
   actor.style.left=f.x+'%';actor.style.top=f.y+'%';
   walk.style.backgroundPosition=`${f.frame*100/3}% ${f.row*100}%`;
   walk.style.transform=`scaleX(${f.facing})`;
  }else if(f.pose==='window') {windowActor.style.left=f.x+'%';windowActor.style.top=f.y+'%';}
  else if(f.pose==='petting') {const n=reduced.matches?0:Math.floor(petTime/.45)%4;pet.style.backgroundPosition=`${n%2*100}% ${Math.floor(n/2)*95.694}%`;}
 }
 function tick(now){raf=null;if(document.hidden||!ready)return;
  if(now-last>=1000/60){const dt=(now-last)/1000;last=now;
   if(syncRoomHour(s,getMinutes())){petTime=0;save();}
   advanceTravel(s,Math.min(dt,.1),reduced.matches);petTime+=dt;render();if(now-saved>=5000)save();
  }raf=requestAnimationFrame(tick);
 }
 function resume(){last=performance.now();if(ready&&!document.hidden&&raf===null)raf=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf!==null)cancelAnimationFrame(raf);raf=null;save();}else resume();});
 window.addEventListener('pagehide',save);
 portrait.addEventListener('change',()=>{if(ready)render();});
 Promise.all(['walk-hourly.webp','window.webp','pet-atlas.webp','cat.webp','chair.webp'].map(name=>{const image=new Image();image.src=new URL('../assets/'+name,import.meta.url).href;return image.decode();})).then(()=>{ready=true;stage.classList.add('routine-ready');syncRoomHour(s,getMinutes());render();resume();}).catch(()=>{const e=document.getElementById('sceneError');e.textContent='A room animation could not load. Reload to retry; jobs still work.';e.hidden=false;});
}
