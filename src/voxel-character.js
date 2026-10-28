// A single articulated voxel model. Coordinates and scale are shared by every pose.
export const CHARACTER = Object.freeze({width:128,height:160,cycleDistance:3.6});
const TAU=Math.PI*2;
export function feetAt(stride=0,walking=false) {
 return [-1,1].map((side,i)=>{
  const phase=((stride/CHARACTER.cycleDistance+i/2)%1+1)%1;
  // Stance travels backwards at constant speed; swing returns the other foot.
  const z=phase<.5?.19-.76*phase:-.19+.38*(1-Math.cos((phase-.5)*TAU))/2;
  const lift=phase<.5?0:.14*Math.sin((phase-.5)*TAU);
  return [side*.19,walking?lift:0,walking?z:0];
 });
}
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,k)=>a.map(v=>v*k);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/(Math.hypot(...a)||1));
const shade=(color,k)=>{const n=parseInt(color.slice(1),16);return `rgb(${[n>>16,(n>>8)&255,n&255].map(v=>Math.min(255,Math.round(v*k))).join(',')})`;};
const identity=[[1,0,0],[0,1,0],[0,0,1]];
export function createVoxelCharacter(canvas) {
 canvas.width=CHARACTER.width;canvas.height=CHARACTER.height;
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx)throw Error('Character canvas unavailable');
 let yaw=2.35;
 return {paint({pose='seated',stride=0,time=0,heading=2.35,reduced=false,dt=.033}={}) {
  const delta=Math.atan2(Math.sin(heading-yaw),Math.cos(heading-yaw));
  yaw+=reduced?delta:delta*Math.min(1,dt*12);
  const c=Math.cos(yaw),s=Math.sin(yaw),faces=[];
  const rotate=p=>[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];
  const camera=unit([4,3.3,5]);
  const project=p=>[64+(p[0]-p[2])*.75*40,144+((p[0]+p[2])*.31-p[1]*.91)*40];
  function box(center,size,color,basis=identity) {
   const points=[];
   for(let n=0;n<8;n++) {
    let p=[...center];for(let j=0;j<3;j++)p=add(p,mul(basis[j],size[j]*((n>>j)&1?.5:-.5)));
    points.push(rotate(p));
   }
   for(const ids of [[0,4,6,2],[1,3,7,5],[0,1,5,4],[2,6,7,3],[0,2,3,1],[4,5,7,6]]) {
    const vertices=ids.map(i=>points[i]);
    const normal=unit(cross(sub(vertices[1],vertices[0]),sub(vertices[2],vertices[0])));
    if(dot(normal,camera)<=0)continue;
    const brightness=.80+.27*Math.max(0,normal[1])+.20*Math.max(0,dot(normal,unit([-3,5,4])));
    faces.push({points:vertices.map(project),depth:vertices.reduce((v,p)=>v+dot(p,camera),0)/4,color:shade(color,brightness)});
   }
  }
  function bone(a,b,width,depth,color){const y=unit(sub(b,a)),x=unit(cross(y,[0,0,1])),z=cross(x,y);box(mul(add(a,b),.5),[width,Math.hypot(...sub(b,a)),depth],color,[x,y,z]);}
  const walking=pose==='walking',sitting=pose==='seated',petting=pose==='petting';
  const feet=feetAt(stride,walking);
  const bob=walking?.012*Math.cos(stride/CHARACTER.cycleDistance*TAU*2):0;
  const drop=sitting?.52:petting?.37:0;
  const torsoY=1.41-drop+bob,headY=2.08-drop+bob,lean=petting?.2:0;
  // Ground shadow belongs to the character, not to a separately scaled image.
  ctx.clearRect(0,0,128,160);ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(64,145,17,5,0,0,TAU);ctx.fill();
  for(let i=0;i<2;i++) {
   const side=i?1:-1,hip=[side*.19,1.04-drop,0];
   let foot=[...feet[i]];if(sitting)foot=[side*.19,.06,.48];
   const knee=sitting?[side*.19,.54,.47]:[side*.19,.54-drop*.45+feet[i][1]*.45,feet[i][2]*.5+.08];
   bone(hip,knee,.26,.27,'#282733');bone(knee,add(foot,[0,.17,0]),.22,.23,'#252430');
   box(add(foot,[0,.09,.07]),[.27,.18,.43],'#c8c5c9');box(add(foot,[0,.025,.08]),[.28,.05,.44],'#eeebdf');
   box(add(foot,[0,.15,.17]),[.24,.03,.17],'#f5eee2');
  }
  box([0,1.04-drop,0],[.60,.27,.4],'#2e2b36');
  box([0,torsoY,lean],[.68,.65,.46],'#393642');
  box([0,torsoY-.25,lean+.24],[.40,.17,.045],'#302e38'); // hoodie pocket
  box([0,torsoY-.32,lean],[.69,.09,.46],'#292832');
  box([0,torsoY+.28,lean-.21],[.56,.24,.23],'#292730');
  for(const x of [-.13,.13])box([x,torsoY+.12,lean+.245],[.025,.23,.025],'#a5a09a');
  for(let i=0;i<2;i++) {
   const side=i?1:-1,shoulder=[side*.41,torsoY+.2,lean];
   const swing=walking?Math.sin(stride/CHARACTER.cycleDistance*TAU+i*Math.PI)*.20:0;
   const tap=reduced?0:Math.sin(time*(sitting?11:4)+i*1.5)*.025;
   const elbow=[side*.47,torsoY-.13,lean+(sitting?.27:petting?.21:swing*.6)];
   const hand=[side*(sitting?.27:petting?.34:.43),torsoY-(sitting?.08:petting?.45:.43)+tap,lean+(sitting?.55:petting?.52:swing)];
   bone(shoulder,elbow,.24,.25,'#3d3944');bone(elbow,hand,.21,.22,'#36323d');box(hand,[.18,.18,.19],'#d8a17c');
  }
  // Oversized chibi head, layered tufts and a covered rear scalp match the approved silhouette.
  const headBox=(p,size,color)=>box([p[0]*1.55,headY+(p[1]-headY)*1.35+.035,lean+(p[2]-lean)*1.55],size.map((v,i)=>v*(i===1?1.35:1.55)),color);
  headBox([0,headY,lean],[.65,.58,.57],'#e6b28a');
  box([0,headY-.31,lean],[.2,.13,.22],'#c48a66');
  for(const side of [-1,1]){
   headBox([side*.15,headY+.005,lean+.294],[.055,.08,.018],'#29212b');
   headBox([side*.34,headY-.03,lean],[.08,.15,.12],'#cf9470');
  }
  const hair=['#30201e','#412820','#513024','#603a28','#845034'];
  for(let x=-4;x<=4;x++)for(let y=-2;y<=4;y++)for(let z=-4;z<=4;z++) {
   const hash=Math.abs(x*17+z*31+y*13+x*z*7);
   // Rounded crown made from individual cubes, with an open face and uneven fringe.
   if(x*x/19+y*y/15+z*z/19>1.05)continue;
   if(z>=1&&y<1+(Math.abs(x)<2?0:-1))continue;
   if(y<0&&z>=0&&Math.abs(x)<3)continue;
   headBox([x*.102,headY+.23+y*.105,lean+z*.102],[.115,.115,.115],hair[hash%5]);
   if(y>=2&&hash%17===0)headBox([x*.108,headY+.32+y*.11,lean+z*.108],[.09,.16,.09],hair[(hash+3)%5]);
  }
  faces.sort((a,b)=>a.depth-b.depth);
  for(const f of faces){ctx.fillStyle=f.color;ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(Math.round(p[0]),Math.round(p[1])):ctx.moveTo(Math.round(p[0]),Math.round(p[1])));ctx.closePath();ctx.fill();}
 }};
}
