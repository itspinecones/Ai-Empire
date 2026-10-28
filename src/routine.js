export const ROOM_SAVE_KEY = 'ai-empire-room-hourly-v2';
export const ACTIVITIES = Object.freeze(['typing','cat','window']);
// Logical floor coordinates map into both approved room illustrations.
export const FLOOR = {
 typing:[61.5,60], junction:[55.5,60], cat:[60,70], window:[48,49],
};
export function project(point, tall = false) {
 return tall ? [point[0]*1.25-16.5,point[1]*.64+17.2] : [...point];
}
export function createRoomRoutine(minutes=360) {
 return {version:2,hour:Math.floor(minutes/60),activity:'typing',position:[...FLOOR.typing],route:[],stride:0};
}
export function readRoomRoutine(raw, minutes) {
 const initial=createRoomRoutine(minutes);
 try {
  const s=JSON.parse(raw);
  const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=40&&p[0]<=70&&p[1]>=45&&p[1]<=75;
  if(s?.version===2&&ACTIVITIES.includes(s.activity)&&Number.isInteger(s.hour)&&s.hour>=0&&validPoint(s.position)&&Array.isArray(s.route)&&s.route.length<=3&&s.route.every(validPoint))
   return {...s,stride:Number.isFinite(s.stride)?s.stride:0};
 } catch {}
 return initial;
}
export function syncRoomHour(s, minutes, random=Math.random) {
 const hour=Math.floor(minutes/60);
 if(hour===s.hour) return false;
 const choices=ACTIVITIES.filter(a=>a!==s.activity);
 const r=Math.max(0,Math.min(.999999,random()));
 s.activity=choices[Math.floor(r*choices.length)];
 s.hour=hour;
 // Re-route from the current position even if an hour changes mid-walk.
 s.route=[[...FLOOR.junction],[...FLOOR[s.activity]]];
 return true;
}
export function advanceTravel(s, seconds, reducedMotion=false) {
 if(!Number.isFinite(seconds)||seconds<=0) return;
 if(reducedMotion&&s.route.length){s.position=[...s.route.at(-1)];s.route=[];return;}
 let distance=seconds*4;
 while(s.route.length&&distance>0){
  const dest=s.route[0],dx=dest[0]-s.position[0],dy=dest[1]-s.position[1],length=Math.hypot(dx,dy);
  if(length<.0001){s.route.shift();continue;}
  const step=Math.min(distance,length);
  s.facing=dx<0?-1:1;s.row=dy<0?1:0;
  s.position=[s.position[0]+dx/length*step,s.position[1]+dy/length*step];
  s.stride+=step;distance-=step;
  if(step===length)s.route.shift();
 }
}
export function roomFrame(s,tall=false,reduced=false) {
 const [x,y]=project(s.position,tall);
 return {x,y,activity:s.activity,pose:s.route.length?'walking':({typing:'seated',cat:'petting',window:'window'}[s.activity]),frame:reduced?0:Math.floor(s.stride/ .55)%4,row:s.row||0,facing:s.facing||1};
}
