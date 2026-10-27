// Original 2D bedroom artwork. A visual replacement requires review.
export function startRoom(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  let handle = 0, previous = -Infinity, disposed = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function resize() {
    const width = Math.max(1, canvas.getBoundingClientRect().width);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(canvas.width * 390 / 640);
    ctx.setTransform(canvas.width / 640, 0, 0, canvas.height / 390, 0, 0);
    frame(performance.now());
  }
function frame(t){
const c=ctx;c.clearRect(0,0,640,390);
const bg=c.createLinearGradient(0,0,0,390);bg.addColorStop(0,'#101c36');bg.addColorStop(1,'#0c1226');c.fillStyle=bg;c.fillRect(0,0,640,390);
c.save();c.translate(44,61);c.scale(.86,.86);
function shape(p,color,stroke='#302b40'){c.beginPath();c.moveTo(...p[0]);p.slice(1).forEach(q=>c.lineTo(...q));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function iso(x,y,z=0){return [320+(x-y)*34,108+(x+y)*17-z*23]}
function quad(x,y,w,d,z,col){shape([iso(x,y,z),iso(x+w,y,z),iso(x+w,y+d,z),iso(x,y+d,z)],col)}
function block(x,y,w,d,h,top,front,side){let A=iso(x,y,h),B=iso(x+w,y,h),C=iso(x+w,y+d,h),D=iso(x,y+d,h),E=iso(x+w,y+d,0),F=iso(x,y+d,0),G=iso(x+w,y,0);shape([D,C,E,F],front);shape([B,C,E,G],side);shape([A,B,C,D],top)}
// Room: worn plaster walls and wooden flooring.
shape([iso(0,0,0),iso(9,0,0),iso(9,0,7),iso(0,0,7)],'#75535b');
shape([iso(0,0,0),iso(0,7,0),iso(0,7,7),iso(0,0,7)],'#624b5a');
quad(0,0,9,7,0,'#6b4850');
for(let x=0;x<9;x++)for(let y=0;y<7;y++){quad(x+.03,y+.03,.94,.94,(x+y)%3===0?.004:0,(x+y)%2?'#704c4c':'#79534e')}
for(let x=0;x<9;x++){let p=iso(x,0,.01),q=iso(x,7,.01);c.strokeStyle='#543b43';c.lineWidth=1;c.beginPath();c.moveTo(...p);c.lineTo(...q);c.stroke()}
// Window with nighttime city.
shape([iso(1.1,0,2.5),iso(3.7,0,2.5),iso(3.7,0,5.7),iso(1.1,0,5.7)],'#202e53','#a48278');
for(let i=0;i<22;i++){let x=iso(1.2+(i%6)*.4,0,2.8+Math.floor(i/6)*.65);rect(x[0]-2,x[1]-2,3,3,i%3?'#e2a76d':'#70a4e8')}
let w1=iso(2.4,0,2.5),w2=iso(2.4,0,5.7);c.strokeStyle='#b99b8a';c.lineWidth=4;c.beginPath();c.moveTo(...w1);c.lineTo(...w2);c.stroke();
// Bed, pillow and a casually rumpled duvet.
block(.45,3.35,3.15,2.35,.48,'#3b364d','#3c293a','#372738');
quad(.65,3.52,2.8,2.05,.51,'#655b7c');
quad(.65,3.52,2.8,.6,.54,'#b4a5a9');
quad(.75,4.3,2.65,1.18,.55,'#49465e');
block(3.6,3.45,.9,.85,.85,'#805b50','#513d40','#594047');
let lamp=iso(4.05,3.86,1.4);rect(lamp[0]-5,lamp[1]-8,10,15,'#f8cf8b');c.fillStyle='rgba(255,186,101,.11)';c.beginPath();c.arc(lamp[0],lamp[1],55,0,Math.PI*2);c.fill();
// Desk and single monitor.
block(5.5,.65,2.85,1.5,1.35,'#9a6c53','#533b40','#624248');
block(6.25,.85,1.15,.12,1.15,'#1c263d','#161b32','#1c2136');
let m=iso(6.38,.85,2.5);shape([[m[0]-18,m[1]-29],[m[0]+36,m[1]-4],[m[0]+36,m[1]+30],[m[0]-18,m[1]+5]],'#222e52','#0d1427');
for(let i=0;i<5;i++)rect(m[0]-8,m[1]-18+i*7,16+i%3*6,2,i%2?'#65d2d4':'#9d82ed');
block(6.45,1.82,.8,.34,.07,'#353347','#232439','#222439');
// Computer tower
block(7.7,1.1,.52,.65,.9,'#20263a','#151c2d','#1b2234');
let led=iso(8.1,1.6,.6);c.fillStyle='#6f7df5';c.beginPath();c.arc(led[0],led[1],4+Math.sin(t/550),0,Math.PI*2);c.fill();
// Character: seated, slightly hunched, typing.
let seat=iso(5.7,2.45,.45);rect(seat[0]-14,seat[1]-20,27,28,'#302e44');
let body=iso(5.95,2.35,1.25);c.fillStyle='#37354d';c.beginPath();c.ellipse(body[0],body[1],20,24,-.25,0,Math.PI*2);c.fill();
let head=iso(5.9,2.35,2.18);c.fillStyle='#d4a085';c.beginPath();c.arc(head[0],head[1],16,0,Math.PI*2);c.fill();
c.fillStyle='#292332';for(let i=0;i<8;i++){let ang=Math.PI+i*Math.PI/7;rect(head[0]+Math.cos(ang)*15-5,head[1]+Math.sin(ang)*14-5,11,9,'#292332')}
let hand=iso(6.45,2.0,1.5);rect(hand[0]-5,hand[1]+Math.sin(t/150)*2,13,5,'#d4a085');
// Subtle clutter: two socks and one hoodie, not piles.
let sock=iso(4.2,5.7,.05);rect(sock[0],sock[1],15,5,'#a9a4ae');let hoodie=iso(4.65,5.2,.04);shape([[hoodie[0]-12,hoodie[1]],[hoodie[0]+7,hoodie[1]-6],[hoodie[0]+19,hoodie[1]+5],[hoodie[0],hoodie[1]+10]],'#494459');
c.restore();c.save();c.fillStyle='#f3e9fc';c.font='bold 18px system-ui';c.fillText('BEDROOM · DAY 1',18,28);c.fillStyle='#c9b9d9';c.font='13px system-ui';c.fillText('One monitor · Solo developer',18,49);
c.restore();
}

  function animate(t) {
    if (disposed || document.hidden || reducedMotion.matches) return;
    if (t - previous >= 1000 / 30) { frame(t); previous = t; }
    handle = requestAnimationFrame(animate);
  }
  function resume() {
    cancelAnimationFrame(handle);
    if (!document.hidden) { frame(performance.now()); handle = requestAnimationFrame(animate); }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener('visibilitychange', resume);
  reducedMotion.addEventListener('change', resume);
  resize(); resume();
  return () => {
    disposed = true; cancelAnimationFrame(handle); observer.disconnect();
    document.removeEventListener('visibilitychange', resume);
    reducedMotion.removeEventListener('change', resume);
  };
}
