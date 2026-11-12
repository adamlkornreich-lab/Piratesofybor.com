/* Ybor Cay: Plunder & Heat. Random supply drops, bounty runs, a closing squall ring and
   the Ybor marines on your tail when your wanted stars go up.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
export function makeHeat(A){
 const {root,P,groundAt,heightAt,burst,toast,audio,store,save,$,makePirate,animatePirate}=A;
 store.plunder=store.plunder||0;store.jobs=store.jobs||0;
 const RANKS=[[0,'Deckhand'],[300,'Buccaneer'],[800,'Quartermaster'],[1500,'Captain'],[3000,'Legend of Ybor']];
 const rankOf=()=>{let r=0;for(let i=0;i<RANKS.length;i++)if(store.plunder>=RANKS[i][0])r=i;return r};let rank=rankOf();
 let heat=0,nextEv=22,ev=null,marines=[],coolT=0,flashT=0,bustCd=0;
 /* HUD */
 const tl=$('tl'),hud=document.createElement('div');hud.id='heatW';hud.style.cssText='margin-top:4px;font-size:.86rem;color:#f3ead7;font-variant-numeric:tabular-nums;white-space:nowrap';if(tl)tl.appendChild(hud);
 const ban=document.createElement('div');ban.id='evt';ban.setAttribute('aria-live','polite');ban.style.cssText='position:absolute;left:50%;top:max(64px,env(safe-area-inset-top));transform:translateX(-50%);max-width:min(92vw,560px);padding:8px 14px;border-radius:10px;background:rgba(18,19,24,.78);border:1px solid rgba(217,169,68,.6);color:#f3ead7;font:600 .95rem Alegreya,Georgia,serif;text-align:center;display:none;z-index:5;pointer-events:none';
 ($('hud')||document.body).appendChild(ban);
 const hudUpd=()=>{const s=Math.ceil(heat-.001);hud.innerHTML='<span style="color:#ff6a5a;letter-spacing:2px" aria-label="Wanted level '+s+' of 5">'+'★'.repeat(s)+'<span style="opacity:.35">'+'★'.repeat(5-s)+'</span></span> · Plunder '+store.plunder+' · '+RANKS[rank][1]};hudUpd();
 const say=t=>{if(t){ban.textContent=t;ban.style.display='block'}else ban.style.display='none'};
 const DIR=['N','NE','E','SE','S','SW','W','NW'];
 const where=(x,z)=>{const p=P.R.position,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);return Math.round(d)+' m '+DIR[(Math.round(Math.atan2(dx,-dz)/(Math.PI/4))+8)%8]};
 const landNear=(min,max)=>{const p=P.R.position;for(let i=0;i<40;i++){const a=Math.random()*6.283,d=min+Math.random()*(max-min),x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;if(heightAt(x,z)>.9)return[x,z]}return null};
 const beam=(x,z,col,r=.7,h=70)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.position.set(x,groundAt(x,z)+h/2,z);root.add(m);return m};
 const kill=o=>{if(!o)return;root.remove(o);o.traverse&&o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)c.material.dispose()})};
 const gain=(n,stars,title,sub)=>{n=Math.round(n*(1+rank*.25));store.jobs++;store.plunder=Math.max(0,store.plunder+n);save();const nr=rankOf();if(nr>rank){rank=nr;setTimeout(()=>{toast('Promoted: '+RANKS[rank][1],'The island gets wilder from here: bigger hauls, faster marines, more to find.');audio.cheer()},3600)}else rank=nr;heat=Math.min(5,heat+stars);coolT=0;hudUpd();const p=P.R.position;if(n>0){burst(p.x,p.y+1.2,p.z,26,1,.82,.3,5,1,6,1.1);audio.coin();audio.cheer()}toast(n>0?title+': +'+n+' plunder':title,sub)};
 /* events */
 function startDrop(){const q=landNear(28,70);if(!q)return false;const[x,z]=q,gy=groundAt(x,z),G=new THREE.Group();
  const crate=new THREE.Mesh(new THREE.BoxGeometry(1.3,1,1.3),new THREE.MeshStandardMaterial({color:0x6b4a22,roughness:.85}));crate.castShadow=true;G.add(crate);
  const band=new THREE.Mesh(new THREE.BoxGeometry(1.36,.16,1.36),new THREE.MeshStandardMaterial({color:0xd9a944,metalness:.8,roughness:.35}));G.add(band);
  const chute=new THREE.Mesh(new THREE.SphereGeometry(2.1,14,8,0,6.283,0,1.5),new THREE.MeshStandardMaterial({color:0x9c1f1f,roughness:.8,side:THREE.DoubleSide}));chute.position.y=3.4;G.add(chute);
  G.position.set(x,gy+46,z);root.add(G);ev={kind:'drop',x,z,gy,G,chute,b:beam(x,z,0xffd35a),t:95,landed:false};
  toast('Supply drop incoming','A crate is coming down by parachute. Follow the gold beam.');audio.tone(660,.5,.1,'triangle',990);return true}
 function startBounty(){const q=landNear(45,95);if(!q)return false;const[x,z]=q;const chest=new THREE.Mesh(new THREE.BoxGeometry(1,.7,.7),new THREE.MeshStandardMaterial({color:0x3a1414,roughness:.6,emissive:0x5a0f0f,emissiveIntensity:.6}));chest.position.set(x,groundAt(x,z)+.4,z);root.add(chest);
  ev={kind:'bounty',x,z,G:chest,b:beam(x,z,0xff5a4a),t:80};toast('Bounty posted','A rival crew hid their stash. Grab it before the clock runs out.');audio.tone(220,.4,.12,'sawtooth',330);return true}
 function startSquall(){const q=landNear(40,85);if(!q)return false;const[x,z]=q,R=15,gy=groundAt(x,z);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(R,.28,8,64),new THREE.MeshBasicMaterial({color:0x3ff0e0}));ring.rotation.x=Math.PI/2;ring.position.set(x,gy+.5,z);root.add(ring);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(R,R,26,48,1,true),new THREE.MeshBasicMaterial({color:0x3ff0e0,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));wall.position.set(x,gy+13,z);root.add(wall);
  ev={kind:'squall',x,z,R,G:ring,b:wall,t:65};toast('The squall is closing in','Get inside the teal ring before the storm wall hits.');audio.thunder(.8);return true}
 function endEv(){if(!ev)return;kill(ev.G);kill(ev.b);ev=null;say('');nextEv=(35+Math.random()*40)/(1+rank*.22)}
 /* marines */
 function spawnMarine(){const q=landNear(26,38);if(!q)return;const m=makePirate({coat:0x1c2f6b,trim:0xcfd6e6,pants:0xe9e0cc,beard:false});m.R.position.set(q[0],groundAt(q[0],q[1]),q[1]);root.add(m.R);marines.push(m)}
 function clearMarines(){for(const m of marines)root.remove(m.R);marines=[]}
 function busted(){const cut=Math.round(store.plunder*.3);store.plunder-=cut;save();heat=0;clearMarines();hudUpd();bustCd=6;if(ev)endEv();A.rescue();toast('Busted by the Ybor marines','Captain College took '+cut+' plunder and dropped you back at the dock.');audio.tone(180,.6,.14,'sawtooth',70)}
 return{
  get heat(){return heat},get plunder(){return store.plunder},
  force(k){if(ev)endEv();return k==='drop'?startDrop():k==='bounty'?startBounty():k==='squall'?startSquall():(heat=Math.min(5,heat+2),hudUpd(),true)},get ev(){return ev},get marines(){return marines},
  update(dt,t){
   if(A.paused&&A.paused())return;const p=P.R.position,sail=A.sailing();bustCd=Math.max(0,bustCd-dt);
   /* random events */
   if(!ev){nextEv-=dt;if(nextEv<=0){if(sail){nextEv=12}else{const r=Math.random(),ok=r<.4?startDrop():r<.78?startBounty():startSquall();if(!ok)nextEv=10}}}
   else{ev.t-=dt;const d=Math.hypot(ev.x-p.x,ev.z-p.z);
    if(ev.kind==='drop'){if(!ev.landed){ev.G.position.y=Math.max(ev.gy+.5,ev.G.position.y-dt*5.5);ev.G.rotation.y+=dt*.6;if(ev.G.position.y<=ev.gy+.51){ev.landed=true;ev.chute.visible=false;burst(ev.x,ev.gy+.6,ev.z,14,.8,.7,.5,3,1,6,.9)}}
     say('Supply drop · '+where(ev.x,ev.z)+' · '+Math.ceil(ev.t)+'s');
     if(ev.landed&&d<2.4){const n=60+Math.round(Math.random()*9)*10;endEv();gain(n,1,'Crate cracked: plunder secured','The marines saw that. Your wanted level went up.')}else if(ev.t<=0){endEv();toast('The crate is gone','Another crew got there first.')}}
    else if(ev.kind==='bounty'){ev.G.rotation.y+=dt;say('Bounty stash · '+where(ev.x,ev.z)+' · '+Math.ceil(ev.t)+'s');
     if(d<2.2){endEv();gain(200,1.5,'Bounty claimed','That crew will not be happy, and neither will the marines.')}else if(ev.t<=0){endEv();toast('Bounty expired','The stash was moved. Watch for the next one.')}}
    else if(ev.kind==='squall'){const k=.75+.25*Math.sin(t*5);ev.G.scale.setScalar(1);ev.b.material.opacity=.08+.1*k;const inside=d<ev.R;
     say('Squall closing · '+(inside?'you are inside the ring':'safe ring '+where(ev.x,ev.z))+' · '+Math.ceil(ev.t)+'s');
     if(ev.t<=0){endEv();if(inside)gain(150,0,'You beat the squall','Last pirate standing in the ring.');else{const lost=Math.min(store.plunder,100);store.plunder-=lost;save();hudUpd();audio.thunder(1);toast('The squall caught you','The storm wall took '+lost+' plunder. Reach the ring next time.')}}}}
   /* wanted level */
   if(heat>0){let near=false;for(const m of marines){if(Math.hypot(m.R.position.x-p.x,m.R.position.z-p.z)<46)near=true}
    if(!near||sail){coolT+=dt;if(coolT>4)heat=Math.max(0,heat-dt/9)}else coolT=0;
    const want=sail?0:Math.min(4,Math.ceil(heat-.001));while(marines.length<want&&bustCd<=0)spawnMarine();
    if(heat<=0){clearMarines();hudUpd();toast('You lost them','The marines gave up the chase.')}
    flashT+=dt;if(flashT>.5){flashT=0;hudUpd()}}
   for(const m of marines){const q=m.R.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz)||1,sp=d>1.2?4.4+heat*.25+rank*.3:0,nx=q.x+dx/d*sp*dt,nz=q.z+dz/d*sp*dt;
    if(heightAt(nx,nz)>.25){q.x=nx;q.z=nz}q.y=groundAt(q.x,q.z);m.R.rotation.y=Math.atan2(dx,dz);animatePirate(m,dt,sp,'walk',t);
    if(d<1.25&&!sail&&bustCd<=0){busted();break}}
  }};
}
