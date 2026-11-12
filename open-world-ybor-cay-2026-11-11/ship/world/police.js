/* Ybor Police: Captain College's squad walks the beat on Seventh Avenue and goes out hunting whatever crawls ashore.
   They wear a monster down and pin it; the finishing blow is left for you.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
import {makePirate,makeLady,animatePirate} from './characters.js';
const NAMES=['Captain College','Officer Reyes','Officer Dunn','Officer Vega','Officer Park','Officer Cole'];
const LINES=['Ybor Police. We hunt what the tide drags in.','Stay behind the squad, Captain. The crabs bite.','Seventh Avenue is clear. The shoreline is not.','Follow the blue dots on your GPS if you want in on the hunt.','We pin them down. You finish them.','Quiet night. That never lasts on this cay.'];
export function makePolice({root,battle,groundAt,collide,toast,audio,P,station,beat,count=5,sailing}){
 const red=new THREE.MeshBasicMaterial({color:0xff2a2a}),blue=new THREE.MeshBasicMaterial({color:0x2a6bff}),off=new THREE.MeshBasicMaterial({color:0x1a1f2a}),bar=new THREE.MeshStandardMaterial({color:0x10141c,roughness:.5}),sg=new THREE.SphereGeometry(.05,8,6),bg=new THREE.BoxGeometry(.2,.03,.06);
 const squad=[];
 for(let i=0;i<count;i++){const lady=i%3===2,p=(lady?makeLady:makePirate)({coat:0x14264a,trim:0xcfd6e2,shirt:0xb9cdea,pants:0x0e1626,skin:[0x8d5a3a,0xd9ac86,0xc99570,0x5e3a26,0xe0b896][i%5],hair:[0x1c1410,0x2a1a0c,0x4a2c14][i%3],beard:i===0,bandana:false,skirt:0x14264a});
  const b=new THREE.Mesh(bg,bar);b.position.set(0,2.02,0);p.R.add(b);const l=new THREE.Mesh(sg,red),r=new THREE.Mesh(sg,blue);l.position.set(-.07,2.06,0);r.position.set(.07,2.06,0);p.R.add(l,r);
  const a=i/count*6.283,x=station.x+Math.cos(a)*4,z=station.z+8+Math.sin(a)*3;p.R.position.set(x,groundAt(x,z),z);root.add(p.R);
  squad.push({p,name:NAMES[i%NAMES.length],l,r,cd:1+i*.3,sw:0,wp:i%beat.length,stuck:0,said:-99,ring:a})}
 let target=null,pick=0,skip=new Set(),announced=false,hunting=false,pinT=0;
 const choose=()=>{let best=null,bd=1e9;const lead=squad[0].p.R.position;for(const m of battle.mons){if(m.dead>0||!m.K.land||skip.has(m))continue;const d=Math.hypot(m.x-lead.x,m.z-lead.z);if(d<bd){bd=d;best=m}}if(!best&&skip.size){skip.clear()}return best};
 const from=new THREE.Vector3(),to=new THREE.Vector3();
 function update(dt,t){pick-=dt;if(pick<=0||(target&&target.dead>0)){pick=3;const bt=battle.target;target=(bt&&bt.dead<=0&&bt.K.land)?bt:(target&&target.dead<=0&&!skip.has(target)?target:choose())}
  hunting=!!target;if(target&&target!==battle.target&&target.hp<=target.K.hp*.34){pinT+=dt;if(pinT>22){skip.add(target);if(skip.size>3)skip.delete(skip.values().next().value);target=null;pick=0;pinT=0;announced=false}}else pinT=0;hunting=!!target;const pp=P.R.position,flash=Math.floor(t*(hunting?7:1.2))%2;
  squad.forEach((o,i)=>{const r=o.p.R.position;let tx,tz,run=false,sp=0;o.cd-=dt;o.sw=Math.max(0,o.sw-dt);
   o.l.material=hunting?(flash?red:off):off;o.r.material=hunting?(flash?off:blue):off;
   if(target){const rad=target.K.rad+7+(i%2)*3,a=o.ring+t*.05;tx=target.x+Math.cos(a)*rad;tz=target.z+Math.sin(a)*rad;run=true;
    const dm=Math.hypot(target.x-r.x,target.z-r.z);
    if(dm<26+target.K.rad){o.p.R.rotation.y=Math.atan2(target.x-r.x,target.z-r.z);if(o.cd<=0){o.cd=1.25+Math.random()*.5;o.sw=.2;from.set(r.x,r.y+1.5,r.z);to.set(target.x,1.6,target.z);battle.trace(from.clone(),to.clone());if(target.hp>target.K.hp*.3)battle.hurt(target,7,false);const near=Math.hypot(pp.x-r.x,pp.z-r.z);if(near<90&&audio)audio.tone(760,.09,.03*(1-near/90)+.004,'square',170)}}}
   else{const w=beat[o.wp];tx=w[0];tz=w[1];if(Math.hypot(tx-r.x,tz-r.z)<2.5){o.wp=(o.wp+1+(i%2))%beat.length}}
   const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz);
   if(d>1.2){sp=run?Math.min(7.2,d*1.6):2.3;const nx=r.x+dx/d*sp*dt,nz=r.z+dz/d*sp*dt,ox=r.x,oz=r.z;if(groundAt(nx,nz)>-.45){r.x=nx;r.z=nz;collide(r,.34)}
    const moved=Math.hypot(r.x-ox,r.z-oz);if(moved<sp*dt*.25){o.stuck+=dt;if(o.stuck>1.2){const s=(i%2?1:-1);const sx=r.x-dz/d*s*sp*dt*1.4,sz=r.z+dx/d*s*sp*dt*1.4;if(groundAt(sx,sz)>-.45){r.x=sx;r.z=sz;collide(r,.34)}}if(o.stuck>9&&i===0&&target){skip.add(target);target=null;pick=0;o.stuck=0}}else o.stuck=Math.max(0,o.stuck-dt*2);
    if(!(target&&Math.hypot(target.x-r.x,target.z-r.z)<26+target.K.rad))o.p.R.rotation.y=Math.atan2(dx,dz);if(moved<.001)sp=0}
   r.y+=(groundAt(r.x,r.z,r.y+1.5)-r.y)*Math.min(1,dt*14);
   const pd=Math.hypot(pp.x-r.x,pp.z-r.z);o.p.R.visible=pd<420;
   if(o.p.R.visible){animatePirate(o.p,dt,sp,'walk',t+i*1.3);if(o.sw>0){o.p.ub.rotation.x=-1.6;o.p.lb.rotation.x=-.15}}
   if(pd<3.4&&t-o.said>40&&!(sailing&&sailing())){o.said=t;toast(o.name,'“'+LINES[(i+Math.floor(t/40))%LINES.length]+'”')}});
  if(hunting&&!announced){const l=squad[0].p.R.position;if(Math.hypot(pp.x-l.x,pp.z-l.z)<260){announced=true;toast('Ybor Police are out hunting','Captain College’s squad is after a '+target.name+'. Blue dots on your map.')}}}
 function onMap(c,toS,big){for(const o of squad){const r=o.p.R.position,[a,b]=toS(r.x,r.z);c.fillStyle='#2a6bff';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(a,b,big?4:6,0,6.3);c.fill();c.stroke()}}
 return{update,onMap,squad,get lead(){return squad[0].p.R.position},get hunting(){return hunting},get target(){return target}};
}
