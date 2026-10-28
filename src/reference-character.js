import {ATLAS} from './character-frames.js';
export const CHARACTER = Object.freeze({width:256,height:320,baseline:288,standingHeight:246,cycleDistance:3.6});
export function selectCharacterFrame({pose='seated',stride=0,heading=0,reduced=false}={}) {
 if(pose!=='walking')return {index:({seated:10,petting:11,window:9}[pose]??8),flip:false};
 const dx=Math.sin(heading)-Math.cos(heading),dy=Math.sin(heading)+Math.cos(heading);
 const rear=dy<0;
 // Both standing reference views face left. Walking articulates their legs.
 return {index:rear?9:8,flip:dx>0,rear};
}
export async function createReferenceCharacter(canvas) {
 const atlas=new Image();atlas.src=new URL('../assets/character-reference.webp',import.meta.url).href;
 await atlas.decode();
 if(atlas.naturalWidth!==ATLAS.width||atlas.naturalHeight!==ATLAS.height)throw Error('Character artwork dimensions do not match its frame map');
 canvas.width=CHARACTER.width;canvas.height=CHARACTER.height;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Character canvas unavailable');
 const scale=CHARACTER.standingHeight/ATLAS.standingHeight;
 return {paint(options={}) {
  const {index,flip,rear}=selectCharacterFrame(options),f=ATLAS.frames[index];
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();ctx.translate(CHARACTER.width/2,CHARACTER.baseline);if(flip)ctx.scale(-1,1);
  // All poses use the same pixel-to-room scale. Only posture changes their height.
  const breathe=options.reduced||options.pose==='walking'?0:Math.sin((options.time||0)*2)*.55;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(options.pose==='walking'&&!options.reduced){
   const hip=Math.round(f.h*.72),split=Math.round(f.anchorX),phase=(options.stride||0)/CHARACTER.cycleDistance;
   const pieces=[[f.x,split-f.x],[split,f.x+f.w-split]];
   for(let i=0;i<2;i++){
    const t=((phase+i*.5)%1+1)%1;
    const step=t<.5?1-4*t:-Math.cos((t-.5)*Math.PI*2);
    const lift=t<.5?0:Math.sin((t-.5)*Math.PI*2)*5;
    const [x,w]=pieces[i];
    const legHeight=(f.h-hip)*scale;
    ctx.save();ctx.translate((x-f.anchorX)*scale,-legHeight);
    // Keep the hip attached while the shoe swings and lifts; never mirror a boot separately.
    ctx.transform(1,0,-step*14/legHeight,1+(step*(rear?-5:5)-lift)/legHeight,0,0);
    ctx.drawImage(atlas,x,f.y+hip,w,f.h-hip,0,0,w*scale,legHeight);ctx.restore();
   }
   ctx.drawImage(atlas,f.x,f.y,f.w,hip,(f.x-f.anchorX)*scale,-f.h*scale,f.w*scale,hip*scale);
  }else{
   ctx.drawImage(atlas,f.x,f.y,f.w,f.h,(f.x-f.anchorX)*scale,-f.h*scale+breathe,f.w*scale,f.h*scale);
  }
  ctx.restore();
 }};
}
