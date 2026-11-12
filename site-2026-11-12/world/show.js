/* Ybor Cay show lights: a Miami-style laser show over every island after dark, the projector at
   Gaspar's Grotto Sandbar, and cinematic title moments that follow the island clock.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
import {ISLANDS} from './terrain.js';
export function makeShow(A){
 const {root,P,groundAt,heightAt,toast,audio,$}=A,low=(A.QL||1)<1;
 const PAL=[0xff3fa4,0x22e0d0,0x8cff3c,0xfff23c,0x7a5cff,0xff9a3c];
 /* ---------- lasers on every island ---------- */
 const N=low?4:6,L=95,geo=new THREE.CylinderGeometry(.05,.55,L,6,1,true);geo.translate(0,L/2,0);
 const rigs=[];
 const spot=I=>{for(let r=0;r<Math.max(I.rx,I.rz);r+=6)for(let k=0;k<10;k++){const a=k/10*6.283+r,x=I.x+Math.cos(a)*r,z=I.z+Math.sin(a)*r;if(heightAt(x,z)>1.4)return[x,z]}return null};
 ISLANDS.forEach((I,ii)=>{const q=spot(I);if(!q)return;const G=new THREE.Group();G.position.set(q[0],groundAt(q[0],q[1])+ (I.mini?6:14),q[1]);G.visible=false;
  const base=I.neon?new THREE.Color(I.neon).getHex():PAL[ii%PAL.length],beams=[];
  for(let i=0;i<N;i++){const piv=new THREE.Group(),m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:i%2?PAL[(ii+i)%PAL.length]:base,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));piv.add(m);G.add(piv);beams.push({piv,m,ph:i*6.283/N+ii})}
  root.add(G);rigs.push({G,beams,sp:.5+((ii*37)%10)/14,x:q[0],z:q[1]})});
 /* ---------- Gaspar's Grotto Sandbar projector ---------- */
 let cine=null;
 {let q=null;for(let r=18;r<70&&!q;r+=4)for(let k=0;k<16&&!q;k++){const a=k/16*6.283,x=38+Math.cos(a)*r,z=176+Math.sin(a)*r,h=heightAt(x,z);if(h>.75&&h<1.9&&heightAt(x+3,z)>.5&&heightAt(x-3,z)>.5)q=[x,z]}
  if(q){const[x,z]=q,y=groundAt(x,z),G=new THREE.Group();G.position.set(x,y,z);G.rotation.y=Math.atan2(38-x,176-z);
   const wood=new THREE.MeshStandardMaterial({color:0x4a3320,roughness:.9}),iron=new THREE.MeshStandardMaterial({color:0x22242a,roughness:.5,metalness:.6});
   const tl=new THREE.TextureLoader(),pics=['../assets/pirates-of-ybor-treasure-ship.jpg','../assets/pops-pippy-official.jpg'].map(u=>{const t=tl.load(u);if('colorSpace' in t)t.colorSpace=THREE.SRGBColorSpace||'srgb';return t});
   const scr=new THREE.Mesh(new THREE.PlaneGeometry(9,6),new THREE.MeshBasicMaterial({map:pics[0],fog:false}));scr.position.set(0,4.4,0);G.add(scr);
   const back=new THREE.Mesh(new THREE.BoxGeometry(9.5,6.5,.2),wood);back.position.set(0,4.4,-.14);back.castShadow=true;G.add(back);
   for(const sx of[-4.9,4.9]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,8,8),wood);p.position.set(sx,4,-.1);p.castShadow=true;G.add(p)}
   const cvs=document.createElement('canvas');cvs.width=1024;cvs.height=128;const c2=cvs.getContext('2d');c2.fillStyle='#1a0d08';c2.fillRect(0,0,1024,128);c2.strokeStyle='#d9a944';c2.lineWidth=6;c2.strokeRect(6,6,1012,116);c2.fillStyle='#f6d67a';c2.font='700 64px Georgia,serif';c2.textAlign='center';c2.textBaseline='middle';c2.fillText("GASPAR'S GROTTO SANDBAR",512,66);
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(9.5,1.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cvs),fog:false}));sign.position.set(0,8.4,0);G.add(sign);
   const pj=new THREE.Group();pj.position.set(0,0,11);const box=new THREE.Mesh(new THREE.BoxGeometry(.9,.6,1.2),iron);box.position.y=1.9;pj.add(box);const lens=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.4,12),new THREE.MeshBasicMaterial({color:0xfff2c0}));lens.rotation.x=Math.PI/2;lens.position.set(0,1.9,-.75);pj.add(lens);
   for(const a of[0,2.09,4.19]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2,6),iron);leg.position.set(Math.cos(a)*.45,.95,Math.sin(a)*.45);leg.rotation.set(Math.sin(a)*.35,0,-Math.cos(a)*.35);pj.add(leg)}G.add(pj);
   const cone=new THREE.Mesh(new THREE.ConeGeometry(4.6,10.2,20,1,true),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.07,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));cone.rotation.x=Math.PI/2;cone.position.set(0,3.2,5.2);cone.rotation.z=0;G.add(cone);
   for(let i=0;i<4;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,3.2,8),wood);log.rotation.z=Math.PI/2;log.position.set((i%2?2.4:-2.4),.3,5+Math.floor(i/2)*2.6);log.castShadow=true;G.add(log)}
   root.add(G);cine={x,z,scr,pics,cone,i:0,t:0,seen:false}}}
 /* ---------- cinematic moments on the island clock ---------- */
 const cm=document.createElement('div');cm.setAttribute('aria-live','polite');cm.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:6;opacity:0;transition:opacity .9s';
 cm.innerHTML='<div style="position:absolute;left:0;right:0;top:0;height:11%;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:11%;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:15%;text-align:center;padding:0 16px"><div data-a style="font:400 clamp(1.8rem,6vw,3.4rem)/1.05 \'Pirata One\',Georgia,serif;color:#f6d67a;text-shadow:0 3px 0 #2a1608,0 0 26px #000"></div><div data-b style="font:600 clamp(.95rem,2.6vw,1.25rem) Alegreya,Georgia,serif;color:#f3ead7;text-shadow:0 1px 6px #000;margin-top:6px"></div></div>';
 ($('hud')||document.body).appendChild(cm);
 const SEG={dawn:[['Dawn over Ybor Cay','The tide gives back what the night took.'],['First light','Fresh crates wash in with the morning.'],['Sunrise on the Gulf','Pops is already at the bar.']],
  day:[['High sun on Seventh Avenue','The marines are awake. So is the money.'],['Fair winds','Good day to sail. Better day to plunder.'],['La Séptima at noon','Every door on the avenue is a game.']],
  dusk:[['Golden hour','The lasers warm up at the clubs.'],['Blood-red sails at sunset','The Iron Gaspar lights her lanterns.'],['Last light','Tonight’s feature starts at the Sandbar.']],
  night:[['Ybor Cay after dark','Lasers over every island. Josh Bouche has the decks.'],['The night shift','Bounties pay double in the dark.'],['Lanterns on the water','The squall hunts at night.']],
  witch:[['The witching hour','Something big is moving under the dock.'],['Midnight on the Cay','Flex Grotto is just getting started.']]};
 const segOf=h=>h<1?'witch':h<5?'night':h<8?'dawn':h<17?'day':h<19.5?'dusk':'night';
 let seg=null,cmT=0,nextCm=150+Math.random()*110,first=true;
 const moment=k=>{const a=SEG[k],m=a[Math.floor(Math.random()*a.length)];cm.querySelector('[data-a]').textContent=m[0];cm.querySelector('[data-b]').textContent=m[1];cm.style.opacity='1';cmT=5.5;audio.tone(k==='night'||k==='witch'?196:392,.9,.07,'triangle',k==='night'||k==='witch'?147:587)};
 return{
  moment,get cine(){return cine},get rigs(){return rigs},
  update(dt,t){
   const h=A.hour(),p=P.R.position,night=h>=19.2||h<5.6,k=night?Math.min(1,(h>=19.2?h-19.2:(h<5?1:5.6-h))*1.2):0;
   for(const r of rigs){const far=Math.hypot(r.x-p.x,r.z-p.z)>1500;r.G.visible=k>0&&!far;if(!r.G.visible)continue;
    for(const b of r.beams){b.piv.rotation.y=b.ph+t*r.sp*.6;b.piv.rotation.z=.55+.4*Math.sin(t*r.sp+b.ph*2);b.piv.rotation.x=.25*Math.sin(t*r.sp*.7+b.ph);b.m.material.opacity=k*(.2+.12*Math.sin(t*3+b.ph*5))}}
   if(cine){cine.t+=dt;if(cine.t>18){cine.t=0;cine.i=(cine.i+1)%cine.pics.length;cine.scr.material.map=cine.pics[cine.i];cine.scr.material.needsUpdate=true}
    cine.cone.material.opacity=.05+.03*Math.sin(t*9)+(night?.05:0);
    if(!cine.seen&&Math.hypot(cine.x-p.x,cine.z-p.z)<16){cine.seen=true;toast("Gaspar's Grotto Sandbar",'The projector is rolling. Pull up a log and watch the feature.')}}
   if(cmT>0){cmT-=dt;if(cmT<=0)cm.style.opacity='0'}
   const s=segOf(h);if(s!==seg){const was=seg;seg=s;if(!first||was===null){if(!first)moment(s)}first=false}
   nextCm-=dt;if(nextCm<=0&&cmT<=0){nextCm=150+Math.random()*110;moment(seg)}
  }};
}
