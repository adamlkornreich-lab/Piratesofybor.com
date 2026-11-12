/* Ybor Cay GPS: pick any place and get a live bearing, distance, turn hint, a route on the chart and a beacon in the world.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
const WORDS=['north','north-east','east','south-east','south','south-west','west','north-west'];
export function makeGPS({$,P,scene,toast,audio,getYaw,groundAt}){
 let dest=null,arrived=false,last='';
 const el=$('gps'),txt=$('gpsT'),arrow=$('gpsA');
 const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,90,10,1,true),new THREE.MeshBasicMaterial({color:0x4fc3ff,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide,fog:false}));
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,.16,8,36),new THREE.MeshBasicMaterial({color:0x9fe1ff,transparent:true,opacity:.9,fog:false}));ring.rotation.x=Math.PI/2;
 beacon.visible=ring.visible=false;beacon.renderOrder=5;scene.add(beacon,ring);
 const dist=d=>{const ft=d*3.281;return ft<1000?Math.max(10,Math.round(ft/10)*10)+' ft':(ft/5280).toFixed(1)+' mi'};
 function clear(quiet){if(!dest)return;dest=null;last='';el.classList.remove('show');beacon.visible=ring.visible=false;if(!quiet)toast('GPS off')}
 function set(d){dest=d;arrived=false;last='';el.classList.add('show');beacon.visible=ring.visible=true;if(audio){audio.tone(660,.1,.06,'triangle');setTimeout(()=>audio.tone(990,.14,.06,'triangle'),110)}toast('GPS set',d.name);tick(0)}
 function tick(t=0){if(!dest)return;const p=P.R.position,dx=dest.x-p.x,dz=dest.z-p.z,d=Math.hypot(dx,dz);
  const brg=Math.atan2(dx,-dz);let rel=brg-(Math.PI-getYaw());rel=Math.atan2(Math.sin(rel),Math.cos(rel));
  arrow.style.transform=`rotate(${rel.toFixed(2)}rad)`;
  const a=Math.abs(rel),turn=a<.35?'Straight ahead':a>2.6?'Turn around':(a<1.1?'Bear ':'Turn ')+(rel>0?'right':'left');
  const word=WORDS[Math.round(((brg*180/Math.PI+360)%360)/45)%8],secs=d/5.5,eta=secs<50?'under a minute':'about '+Math.max(1,Math.round(secs/60))+' min on foot';
  const s=`<b>${dest.name}</b><span>${turn} · ${dist(d)} ${word} · ${eta}</span>`;if(s!==last){last=s;txt.innerHTML=s}
  const gy=Math.max(groundAt(dest.x,dest.z),0);beacon.position.set(dest.x,gy+45,dest.z);ring.position.set(dest.x,gy+1.2+Math.sin(t*2)*.3,dest.z);ring.rotation.z=t;
  if(d<(dest.r||9)&&!arrived){arrived=true;const n=dest.name;toast('You have arrived',n);if(audio){audio.tone(880,.14,.08,'triangle');setTimeout(()=>audio.tone(1320,.3,.08,'triangle'),140)}setTimeout(()=>{if(arrived)clear(true)},2500)}}
 function pin(c,a,b,r){c.fillStyle='#4fc3ff';c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(a,b,r,0,6.3);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(a,b,r*.35,0,6.3);c.fill()}
 function onMap(c,toS,S){if(!dest)return;let[a,b]=toS(dest.x,dest.z);const m=S/2,r=Math.hypot(a-m,b-m),R=S/2-20;if(r>R){a=m+(a-m)/r*R;b=m+(b-m)/r*R}
  c.save();c.strokeStyle='#4fc3ff';c.lineWidth=7;c.lineCap='round';c.setLineDash([14,12]);c.beginPath();c.moveTo(m,m);c.lineTo(a,b);c.stroke();c.setLineDash([]);pin(c,a,b,12);c.restore()}
 function onBig(c,toS){if(!dest)return;const[a,b]=toS(dest.x,dest.z),[x,y]=toS(P.R.position.x,P.R.position.z);c.save();c.strokeStyle='#4fc3ff';c.lineWidth=4;c.lineCap='round';c.setLineDash([10,9]);c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();c.setLineDash([]);pin(c,a,b,9);c.restore()}
 return{set,clear,tick,onMap,onBig,get dest(){return dest}};
}
