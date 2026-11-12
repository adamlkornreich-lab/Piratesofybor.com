/* Ybor Cay venues: a home stadium or arena with its own team on every island, Alonso Arena's
   Fight Night on Danny Alonso Island, resort towers with pools on Ybor Cay, and cruise ships
   sailing a loop through the islands.  © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
import {ISLANDS} from './terrain.js';
export const TEAMS={
 main:["Ybor Cay Cannons","football"],skull:["Alonso Arena · Fight Night","fight"],gaspar:["Gaspar's Rock Krakens","football"],mangrove:["Mangrove Key Gators","basketball"],
 ruben:["Ruben's Rhythm Raiders","basketball"],adamashlee:["Adam & Ashlee Admirals","football"],ericshere:["Eric & Shere Sharpshooters","basketball"],landonshere:["Landon & Shere Lagoon Lions","football"],
 seavey:["Andy Seavey Swingers","basketball"],evanelise:["Evan & Elise Emperors","football"],ambervick:["Amber & Vick Vipers","basketball"],gerald:["Gerald's Gold Galleons","football"],
 kevincraig:["Kevin & Craig Corsairs","basketball"],lorilarry:["Lori & Larry Lighthouse Keepers","football"],sadie:["Sadie's Sea Stars","basketball"],megan:["Megan's Moonrakers","football"],
 greg:["Greg's Gulf Hammerheads","basketball"],brenner:["Brenner Brigantines","football"],lafferty:["Lafferty Longboats","basketball"],nakamura:["Nakamura Nightingales","football"],
 message:["Message Island Messengers","basketball"],chile:["Chile Island Cóndores","football"]};
export function makeVenues(A){
 const {root,P,groundAt,heightAt,$}=A,low=(A.QL||1)<1,venues=[];
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7},o||{}));
 const conc=M(0xcfc8bb),dark=M(0x1d1f26,{metalness:.4,roughness:.5}),steel=M(0x8a9099,{metalness:.7,roughness:.35}),grass=M(0x2f8a3a,{roughness:.95}),wood=M(0xb07a3e,{roughness:.6}),glass=M(0x9fd8ff,{metalness:.3,roughness:.15,emissive:0x2a4a66,emissiveIntensity:.5});
 const lamp=new THREE.MeshBasicMaterial({color:0xfff6d8,fog:false});
 function sign(G,txt,col,w,h,x,y,z){const m=new THREE.MeshBasicMaterial({map:signTex(txt,col),fog:false}),g=new THREE.PlaneGeometry(w,h);const a=new THREE.Mesh(g,m);a.position.set(x,y,z);G.add(a);const b=new THREE.Mesh(g,m);b.position.set(x,y,z-.05);b.rotation.y=Math.PI;G.add(b);return a}
 function signTex(txt,col){const c=document.createElement('canvas');c.width=1024;c.height=128;const g=c.getContext('2d');g.fillStyle='#0b0c10';g.fillRect(0,0,1024,128);g.strokeStyle=col;g.lineWidth=8;g.strokeRect(6,6,1012,116);g.fillStyle=col;g.font='700 '+(txt.length>26?50:62)+'px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,512,66);const t=new THREE.CanvasTexture(c);if('colorSpace' in t)t.colorSpace=THREE.SRGBColorSpace||'srgb';return t}
 function spot(I,frac){const R=Math.min(I.rx,I.rz);for(let r=R*frac;r<R*.85;r+=3)for(let k=0;k<14;k++){const a=k/14*6.283+.6,x=I.x+Math.cos(a)*r,z=I.z+Math.sin(a)*r;const h=heightAt(x,z),hs=[heightAt(x+8,z),heightAt(x-8,z),heightAt(x,z+8),heightAt(x,z-8)];if(h>1.5&&Math.min(...hs)>1.1&&Math.max(...hs)-Math.min(...hs)<5)return[x,z]}return null}
 const BOWL=new THREE.CylinderGeometry(1,.78,1,40,1,true),FIELD=new THREE.CircleGeometry(1,40),POLE=new THREE.CylinderGeometry(.25,.35,1,6),HEAD=new THREE.BoxGeometry(3,1.4,.6),DOME=new THREE.SphereGeometry(1,32,12,0,6.283,0,1.25),RING=new THREE.CylinderGeometry(1,1,1,36,1,true);
 function football(G,s,name,col){const W=16*s,D=11*s,Hh=6*s;
  const bowl=new THREE.Mesh(BOWL,new THREE.MeshStandardMaterial({color:0xd8d2c6,roughness:.8,side:THREE.DoubleSide}));bowl.scale.set(W,Hh,D);bowl.position.y=Hh/2;bowl.castShadow=!low;G.add(bowl);
  const stands=new THREE.Mesh(BOWL,new THREE.MeshStandardMaterial({color:new THREE.Color(col).multiplyScalar(.75),roughness:.9,side:THREE.BackSide}));stands.scale.set(W*.985,Hh*.98,D*.985);stands.position.y=Hh/2+.05;G.add(stands);
  const f=new THREE.Mesh(FIELD,grass);f.rotation.x=-Math.PI/2;f.scale.set(W*.7,D*.62,1);f.position.y=.25;G.add(f);
  const lg=new THREE.PlaneGeometry(.35,D*.95),lm=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=-4;i<=4;i++){const l=new THREE.Mesh(lg,lm);l.rotation.x=-Math.PI/2;l.position.set(i*W*.13,.3,0);G.add(l)}
  for(const sx of[-1,1]){const gp=new THREE.Mesh(new THREE.BoxGeometry(.3,4*s,.3),M(0xffd24d));gp.position.set(sx*W*.62,2*s,0);G.add(gp)}
  if(!low)for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const p=new THREE.Mesh(POLE,steel);p.scale.set(1,Hh*2.2,1);p.position.set(a*W*.92,Hh*1.1,b*D*.92);G.add(p);const h=new THREE.Mesh(HEAD,lamp);h.position.set(a*W*.92,Hh*2.2,b*D*.92);h.lookAt(G.position.x,0,G.position.z);G.add(h)}
  sign(G,name,col,W*1.1,W*.14,0,Hh+W*.12,D*.6);
  const leg=new THREE.Mesh(POLE,dark);leg.scale.set(1.6,W*.12+Hh,1.6);leg.position.set(0,(Hh+W*.12)/2,D*.6-.4);G.add(leg);return Math.max(W,D)}
 function arena(G,s,name,col,fight){const R=11*s,Hh=5*s;
  const wall=new THREE.Mesh(RING,M(fight?0x1b1b1f:0xe8e2d6,{side:THREE.DoubleSide}));wall.scale.set(R,Hh,R);wall.position.y=Hh/2;wall.castShadow=!low;G.add(wall);
  const band=new THREE.Mesh(RING,new THREE.MeshBasicMaterial({color:new THREE.Color(col),fog:false,side:THREE.DoubleSide}));band.scale.set(R*1.01,.9*s,R*1.01);band.position.y=Hh*.8;G.add(band);
  const dome=new THREE.Mesh(DOME,fight?M(0x2a2c35,{metalness:.6,roughness:.3}):glass);dome.scale.set(R,R*.42,R);dome.position.y=Hh;dome.castShadow=!low;G.add(dome);
  const door=new THREE.Mesh(new THREE.BoxGeometry(R*.5,Hh*.7,1),M(0x111216,{emissive:new THREE.Color(col),emissiveIntensity:.6}));door.position.set(0,Hh*.35,R*.98);G.add(door);
  sign(G,name,fight?'#ff3b2f':col,R*1.8,R*.23,0,Hh+R*.5,R*.55);
  if(fight){for(const sx of[-1,1]){const t=new THREE.Mesh(new THREE.ConeGeometry(.9*s,3*s,8),new THREE.MeshBasicMaterial({color:0xff7a1e,transparent:true,opacity:.8,fog:false}));t.position.set(sx*R*.6,Hh*.2+1.5*s,R*1.05);t.userData.flame=1;G.add(t)}}
  return R}
 const PAL=['#f6d67a','#ff6fb1','#7be0ff','#8dff8a','#ffb347','#c9a0ff','#ff5a3c','#35f0d8'];
 ISLANDS.forEach((I,i)=>{const T=TEAMS[I.id];if(!T)return;const q=spot(I,I.mini?.45:.4);if(!q)return;const[x,z]=q,y=groundAt(x,z)-.2,G=new THREE.Group();G.position.set(x,y,z);G.rotation.y=Math.atan2(I.x-x,I.z-z);
  const col=I.neon||PAL[i%PAL.length],s=I.mini?.85:I.id==='main'?1.6:1.25,kind=T[1];const r=kind==='football'?football(G,s,T[0],col):arena(G,s,T[0],col,kind==='fight');
  root.add(G);venues.push({G,x,z,r:r+8,name:T[0],kind,id:I.id,island:I.name})});
 /* resorts on Ybor Cay */
 const winTex=(()=>{const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');g.fillStyle='#e9e4d8';g.fillRect(0,0,128,256);for(let y=6;y<256;y+=16)for(let x=6;x<128;x+=20){g.fillStyle=Math.random()<.55?'#ffd98a':'#3a5a78';g.fillRect(x,y,13,9)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if('colorSpace' in t)t.colorSpace=THREE.SRGBColorSpace||'srgb';return t})();
 const towerM=new THREE.MeshStandardMaterial({map:winTex,emissiveMap:winTex,emissive:0x664422,emissiveIntensity:.35,roughness:.6});
 const RES=[["The Grand Gasparilla Resort",0],["Pippy's Palms Beach Club",1.9],["Pops' Hideaway Hotel & Spa",3.6],["Treasure Cove Casino-Free Resort",5.0]];
 const M0=ISLANDS[0];RES.forEach(([nm,a],k)=>{let q=null;for(let f=.78;f>.5&&!q;f-=.04){const x=M0.x+Math.cos(a)*M0.rx*f,z=M0.z+Math.sin(a)*M0.rz*f,h=heightAt(x,z);if(h>1.4&&h<14&&Math.abs(heightAt(x+10,z)-heightAt(x-10,z))<5)q=[x,z]}if(!q)return;
  const[x,z]=q,G=new THREE.Group();G.position.set(x,groundAt(x,z)-.2,z);G.rotation.y=Math.atan2(-x,-z)+Math.PI;
  const hh=[34,26,30,22][k];for(let j=0;j<2;j++){const w=10-j*2,tw=new THREE.Mesh(new THREE.BoxGeometry(w,hh-j*8,7),towerM);tw.position.set(j?9:-2,(hh-j*8)/2,0);tw.castShadow=!low;G.add(tw);const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.6,.6,7.6),dark);roof.position.set(j?9:-2,hh-j*8+.3,0);G.add(roof)}
  const pool=new THREE.Mesh(new THREE.BoxGeometry(12,.3,6),new THREE.MeshStandardMaterial({color:0x2fc3e8,emissive:0x0a5d7a,emissiveIntensity:.5,roughness:.1}));pool.position.set(3,.4,10);G.add(pool);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(18,.2,11),wood);deck.position.set(3,.2,10);G.add(deck);
  for(let u=0;u<4;u++){const um=new THREE.Mesh(new THREE.ConeGeometry(1.4,.8,8),M([0xff5a3c,0xffd24d,0x35f0d8,0xff6fb1][u]));um.position.set(-4+u*4.6,2.4,15);G.add(um);const st=new THREE.Mesh(POLE,steel);st.scale.set(.3,2.4,.3);st.position.set(-4+u*4.6,1.2,15);G.add(st)}
  sign(G,nm,'#f6d67a',14,1.8,1,hh+2,0);
  root.add(G);venues.push({G,x,z,r:20,name:nm,kind:'resort',island:'Ybor Cay'})});
 /* cruise ships */
 const ships=[];const shipNames=["Pops' Princess","The Pippy Royale","Gasparilla Star"];
 const deckTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=32;const g=c.getContext('2d');g.fillStyle='#f6f4ef';g.fillRect(0,0,256,32);for(let x=4;x<256;x+=10){g.fillStyle=Math.random()<.6?'#ffe2a0':'#2b4f6e';g.fillRect(x,10,6,10)}const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(4,1);if('colorSpace' in t)t.colorSpace=THREE.SRGBColorSpace||'srgb';return t})();
 const deckM=new THREE.MeshStandardMaterial({map:deckTex,emissiveMap:deckTex,emissive:0x553311,emissiveIntensity:.4,roughness:.5});
 shipNames.forEach((nm,k)=>{const S=new THREE.Group(),hull=new THREE.Mesh(new THREE.BoxGeometry(66,6,13),M([0x14305f,0x1b1b1f,0x5c1720][k]));hull.position.y=1;S.add(hull);
  const bs=new THREE.Shape();bs.moveTo(33,-6.5);bs.lineTo(47,0);bs.lineTo(33,6.5);bs.lineTo(33,-6.5);const bg=new THREE.ExtrudeGeometry(bs,{depth:6,bevelEnabled:false});bg.rotateX(-Math.PI/2);bg.translate(0,-2,0);const bow=new THREE.Mesh(bg,hull.material);S.add(bow);
  for(let d=0;d<5;d++){const L=56-d*7,dk=new THREE.Mesh(new THREE.BoxGeometry(L,2.2,12-d*.8),deckM);dk.position.set(-3-d*1.5,5.1+d*2.2,0);dk.castShadow=!low;S.add(dk)}
  const fun=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2.2,6,12),M(0xc22a2a));fun.position.set(-14,17.5,0);S.add(fun);
  const pool=new THREE.Mesh(new THREE.BoxGeometry(8,.2,5),new THREE.MeshBasicMaterial({color:0x35d6f0}));pool.position.set(4,15.3,0);S.add(pool);
  sign(S,nm,'#f6d67a',26,2.4,0,2,6.62);{const m=sign(S,nm,'#f6d67a',26,2.4,0,2,-6.62);}
  root.add(S);ships.push({S,a:k*2.1,sp:.012+k*.002,rx:480+k*25,rz:430+k*20,name:nm})});
 /* prompt to enter */
 const btn=document.createElement('a');btn.id='venueBtn';btn.style.cssText='position:absolute;left:50%;bottom:120px;transform:translateX(-50%);z-index:8;display:none;padding:12px 18px;border-radius:12px;border:2px solid #f6d67a;background:rgba(10,8,6,.86);color:#f6d67a;font:700 16px Georgia,serif;text-decoration:none;min-height:44px';
 ($('hud')||document.body).appendChild(btn);let near=null,chk=0;
 function link(v){if(v.kind==='fight')return'../fight.html';if(v.kind==='resort')return'../club.html';return'../league.html?team='+v.id}
 window.__venues={venues,ships,TEAMS};
 return{update(dt,t){
  for(const s of ships){s.a+=s.sp*dt;const x=Math.cos(s.a)*s.rx,z=Math.sin(s.a)*s.rz;s.S.position.set(x,Math.sin(t*.7+s.a*9)*.25,z);const vx=-Math.sin(s.a)*s.rx,vz=Math.cos(s.a)*s.rz;s.S.rotation.y=Math.atan2(-vz,vx);s.S.rotation.z=Math.sin(t*.6+s.a)*.012}
  chk-=dt;if(chk>0)return;chk=.3;const p=P.R.position;let best=null,bd=1e9;for(const v of venues){const d=Math.hypot(p.x-v.x,p.z-v.z);if(d<v.r&&d<bd){bd=d;best=v}}
  if(best!==near){near=best;if(near){btn.href=link(near);btn.textContent=(near.kind==='fight'?'🥊 Enter Fight Night':near.kind==='resort'?'🏨 '+near.name+' · club & pool':'🏟 '+near.name+' · play')+' ▸';btn.style.display='block'}else btn.style.display='none'}}};
}
