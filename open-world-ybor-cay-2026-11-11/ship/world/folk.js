/* The new Ybor Cay: concrete towers over the island, and the people you grew up with.
   To name someone, change their entry in HANGOUTS or CREW below.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE,Kit,hash} from './util.js';
import {heightAt,slopeAt,TOWN} from './terrain.js';
import * as T from './textures.js';

/* who: shown when you walk up. Swap "Camp friend" for a real name and they keep it everywhere. */
export const HANGOUTS=[
 {sign:'THE MERCH STORE',sub:'Gaspar’s Grotto and Ybor City pirate gear',at:[78,150],color:'#ffd27a',who:'Shopkeeper',store:true,
  day:['Have a look around.','Season Two is coming. More loot, more doubloons.','Hoodies are coming, and you will want one in this chill.'],
  night:['Cold one tonight. The hoodie is on the way.','Still open for a look.','Season Two will be even crazier. Stay tuned.']},
 {name:'Camp Akiba',sign:'CAMP AKIBA',sub:'Where the best friends in your life sit around one fire',at:[-185,92],color:'#ff9a4a',fire:true,who:'Camp friend',src:'../camp.html',
  day:['Same bunk, same bad jokes. You came back.','Color war never really ended, you know.','Lake is still freezing. Dare you.'],
  night:['Pull up a log. We saved you a seat.','Marshmallows are on. Do not burn yours.','Best friends for life. That is the rule.']},
 {sign:'RIVIERA SCHOOLS',sub:'Lessons, tests and world languages. Everyone welcome.',at:[150,150],color:'#ffd27a',who:'Riviera Schools',school:true,
  day:['History, science, math, English and Spanish. Step on in.','Glad you are here. Everyone is welcome.','Try the quiz on the USA. Five easy questions.'],
  night:['Class is always open. Come in out of the dark.','Lights stay on here all night.','Everyone is welcome, any hour.']},
 {name:'Captain College’s Police Station',sign:'POLICE STATION',sub:'Run by Captain College',at:[-150,-40],color:'#4fa8ff',who:'Captain College',others:'Officer',src:'../station.html#police',few:true,
  day:['Captain College here. The cay is safe on my watch.','Seen a sea monster? Report it and we will round up the crew.','Keep your doubloons close on Seventh Avenue.'],
  night:['Night patrol is out. Stay near the lights.','Captain College never sleeps. Well, rarely.','Something big moved past the reef. We are on it.']},
 {name:'Rani’s Hospital',sign:'HOSPITAL',sub:'Run by Rani',at:[-195,-10],color:'#7dffb0',who:'Rani',others:'Nurse',src:'../station.html#hospital',few:true,heal:true,
  day:['Rani here. Rough fight? Let us patch you up.','Drink some water. Pirates forget that.','You look better already.'],
  night:['Rani is on the night shift. Come on in.','Bandages, a cot and a quiet room.','Rest up. The kraken will still be there tomorrow.']},
 {sign:'THE HOSPITAL THAT SAVED RUBEN',sub:'Thank you to everyone here',at:[205,-95],color:'#9ad0ff',who:'Ruben',few:true,
  day:['This place saved my brother Ruben. Thank you.','Ruben is my brother. I would not have made it without him.','Grateful every day.'],
  night:['Lights on all night, like always.','Thank you to everyone who works here.','Ruben made it. That is what matters.']},
 {name:'Laura & Dom’s Crossword Cabin',sign:'CROSSWORD CABIN',sub:'Laura & Dom’s Crossword',at:[120,-110],color:'#f6d67a',who:'Laura & Dom',src:'../crossword.html',few:true,
  day:['Stuck on 14 across. Help?','Daily puzzle is up.','Pen or pencil? Pen, obviously.'],night:['Crossword by lantern light.','One more clue and then bed.','Seven letters for brave. Pirate.']},
 {name:'Rene’s Guitar Shack',sign:'RENE’S GUITAR SHACK',sub:'Learn the strings and seven chords',at:[40,-150],color:'#4fd1c0',who:'Rene',src:'../guitar.html',few:true,
  day:['Grab a guitar. I will show you.','Start with G. Everybody starts with G.','Rene here. Always here when you need me.'],night:['Quiet songs only after dark.','Campfire chords. Easy ones.','Play it again. You are getting it.']},
 {name:'Jen Runs the Ship',sign:'JEN RUNS THE SHIP',sub:'The owners are out of town',at:[-60,165],color:'#ffb347',who:'Jen',src:'../jen.html',few:true,
  day:['Five days, every manager job. I have got this.','Deliveries at noon, payroll at two.','Do not tell the owners about the fridge.'],night:['Closing up. Count the till with me.','Long shift. Worth it.','Who left the back door open?']},
 {name:'Pirate Pool',sign:'PIRATE POOL',sub:'Eight-ball on Danny Alonso Island',at:[640,-330],color:'#7dff8a',who:'Pool shark',src:'../pool.html',few:true,
  day:['Rack them up.','Stripes or solids? You break.','Call the eight or it does not count.'],night:['Late game? Always.','The felt never sleeps.','One more rack.']},
 {name:'Pirate Bingo',sign:'PIRATE BINGO',sub:'Beat Pops, Pippy and Landon to the bell',at:[700,-300],color:'#ff4fa3',who:'Bingo caller',src:'../bingo.html',few:true,
  day:['Eyes down, here we go.','B seven, Pops’ favorite.','Card is free. Doubloons are not.'],night:['Night bingo, double doubloons. Probably.','Legs eleven!','Who rang the bell?']},
 {name:'Pippy’s Surf & Skate Shack',sign:'SURF & SKATE SHACK',sub:'Pippy’s decks, boards and wax',at:[720,-370],color:'#4fd1ff',who:'Pippy’s shop crew',src:'../surfshop.html',few:true,
  day:['New decks in. Gaspar Gold is the one.','Wax for the board, grip for the deck.','Earn doubloons at the park, spend them here.'],night:['Closing soon. Grab a board.','Surf report: dark.','Pippy counts the till.']},
 {name:'Skate the Grotto',skate:true,sign:'SKATE THE GROTTO',sub:'Quarter pipes, rails and big combos',at:[650,-395],color:'#ff9a4a',who:'Skater',src:'../skate.html',few:true,
  day:['Drop in! The quarter pipe is huge.','Grind the rails. It does it for you.','Land your flips clean.'],night:['Night session under the lights.','Ybor Night Run is open.','One more run.']},
 {name:'Resort & Travel Dock',sign:'RESORT & TRAVEL DOCK',sub:'Villas, plus Rincón, Valparaíso and Santiago',at:[600,-360],color:'#ffd27a',who:'Dock master',src:'../travel.html',few:true,
  day:['Ships out to Rincón, Valparaíso and Santiago.','Villas are open. Pick one.','Danny Alonso Island welcomes you.'],night:['Sunset sail just left.','The villas are lit. Go rest.','Next ship at dawn.']}];

/* Real Seventh Avenue spots, with no logos: facades that open their page in seventh/. */
export const SEVENTH=[['armwrestle','Ronnie & Joe’s Arm Wrestling','They send the crowd to Gaspar’s Grotto','#ff7fc0'],['acropolis','Acropolis Greek Taverna','The Dragon Table downstairs','#7fb4ff'],['columbia','Columbia Restaurant','Since 1905','#ffd27a'],['haya','Hotel Haya','Café Quiquiriqui','#ff9a4a'],['tiger','Blind Tiger Cafe','Coffee','#7dff8a'],['centro','Centro Español','Historic marker','#ffb347'],['italian','L’Unione Italiana','The Italian Club','#ff9de0'],['factory','First Cigar Factory','Historic marker','#d9c9a8']];

/* People already in the project. They walk Seventh Avenue, so you bump into them. */
export const CREW=[
 ['Greg','m','Back from the rooftops. Long night, Captain.'],['Captain Eric Schiller','m','The ship is yours tonight.'],['Shere Schiller','f','Co-Navigator on duty. Watch the reef.'],
 ['Mark Brenner','m','Keep moving. Good for the heart.'],['Andy Seavy','m','Course is open. Water hazards are hungry.'],['Steph','f','Behind the bar soon. Bet I out-pour you.'],
 ['Landon','m','Strongest drink with flavor. I am winning.'],['Stephania','f','Landon is not winning.'],['Ashlee Rae','f','Tire is still swinging. Want a throw?'],
 ['Abby Swager','f','Late again. Drive or walk?'],['Neph','m','Beat Abby to work. Do not tell her.'],['Emily','f','Pick a place. I will fly us.'],
 ['Elise Schiller','f','Good to see you out here.'],['Evan Schiller','m','The little one is going to beat us all at chess.'],['Victor','m','Saved you a seat at the Grotto.'],['Atara','f','Crowned and watching. Behave.']];

const NIGHT=['The lights flicker up by the towers after dark.','Stay close tonight. Something moves on that roof.','Walk me to the Grotto? It is not far.'];
const SKIN=[0xd9ac86,0x8d5a3a,0xc99570,0x5e3a26,0xe0b896],HAIR=[0x1c1410,0x4a2c14,0x6b6b6b,0x2a1a0c],COAT=[0x1b2230,0x2a2f3a,0x3a1420,0x15303a,0x242424,0x40301f];

function concreteTex(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#8b8e93';x.fillRect(0,0,256,256);for(let i=0;i<1400;i++){const v=110+Math.random()*50;x.fillStyle=`rgba(${v},${v},${v+3},.16)`;x.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*7,1+Math.random()*3)}x.strokeStyle='#4a4c52';x.lineWidth=2;x.strokeRect(1,1,254,254);x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.stroke();for(let i=0;i<7;i++){const a=Math.random()*256;const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(20,20,24,.34)');g.addColorStop(1,'rgba(20,20,24,0)');x.fillStyle=g;x.fillRect(a,0,3+Math.random()*9,256)}return T.tex(c)}
function windowTex(emit){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=emit?'#000':'#22252c';x.fillRect(0,0,256,256);for(let j=0;j<8;j++)for(let i=0;i<8;i++){const lit=hash(i*3.1,j*7.7)>.62,col=hash(i,j)>.75?'#6fe9ff':'#ffc27a';x.fillStyle=emit?(lit?col:'#000'):'#39414d';x.fillRect(i*32+4,j*32+6,24,20)}return T.tex(c)}

/* Find open, gently sloped ground near a spot, away from anything already built. */
function clearSpot(x0,z0,rad,taken){for(let r=0;r<130;r+=7)for(let k=0;k<14;k++){const a=k/14*6.283+r*.37,x=x0+Math.cos(a)*r,z=z0+Math.sin(a)*r,h=heightAt(x,z);if(h<1.6||slopeAt(x,z)>.55)continue;if(x>TOWN.x0-rad&&x<TOWN.x1+rad&&z>TOWN.z0-rad&&z<TOWN.z1+rad)continue;if(taken.some(c=>Math.hypot((c.cx??c.x)-x,(c.cz??c.z)-z)<rad+(c.r||0)))continue;return[x,z,h]}return null}

function tower(k,m,x,z,base,w,d,H,seed,beacons){let y=base-3,lvl=0,ox=0,oz=0;while(y<base+H&&lvl<6){const hh=H/(3+seed%3),ww=w*(1-lvl*.09),dd=d*(1-lvl*.06);k.box(m.conc,x+ox,y+hh/2,z+oz,ww,hh,dd,0,0,0,.09);k.box(m.win,x+ox,y+hh/2,z+oz,ww*.76,hh*.82,dd+.3,0,0,0,.07);k.box(m.win,x+ox,y+hh/2,z+oz,ww+.3,hh*.82,dd*.76,0,0,0,.07);k.box(m.dark,x+ox,y+hh+.25,z+oz,ww+1.6,.5,dd+1.6);for(const s of[-1,1])k.box(m.dark,x+ox+s*(ww/2+.5),y+hh/2,z+oz,.7,hh,1.2);y+=hh;ox+=(hash(seed,lvl)-.5)*3;oz+=(hash(lvl,seed)-.5)*3;lvl++}
 k.cyl(m.dark,[x+ox,y,z+oz],[x+ox,y+11,z+oz],.34,.07,6);k.box(m.dark,x+ox,y+6,z+oz,5,.22,.22);beacons.push([x+ox,y+11.3,z+oz])}

const MODERN=false;
export function buildFolk({root,scene,ctx,M,glowsN,addPerson,makePirate,makeLady,npcs,crowd,P,QL,toast,clamp,lerp}){
 /* Old brick and stucco goes to weathered concrete and steel. */
 {const vice={stucco:0xf7b9cc,stuccoBlue:0x9fe8de,stuccoRose:0xffd0a6,trim:0xffffff,side:0xf2e6ff};void vice;
  const NEON=[[1,.25,.6],[.15,.95,.9],[1,.55,.2],[.7,.35,1]];for(let x=TOWN.x0+8,i=0;x<TOWN.x1-8;x+=11,i++){void NEON;glowsN.add(x,TOWN.y+6.5,TOWN.streetZ+(i%2?9:-9),6,1,.74,.44,.4)}}
 if(MODERN){const reTint={brick:0x8d8f96,brickBuff:0x92959c,brickDark:0x71737c,stucco:0x9a9ea6,stuccoBlue:0x8a99a6,stuccoRose:0x9b8f94,side:0x8f9299,trim:0xa6a9b0,roof:0x56585e};for(const k in reTint)if(M[k]&&M[k].color)M[k].color.setHex(reTint[k]);}

 const std=o=>new THREE.MeshStandardMaterial(o),m={conc:std({map:concreteTex(),roughness:.93}),dark:std({color:0x1b1d22,roughness:.55,metalness:.6}),win:std({map:windowTex(false),emissiveMap:windowTex(true),emissive:0xffffff,emissiveIntensity:0,roughness:.28,metalness:.4})},k=new Kit(),taken=[...ctx.colliders.filter(c=>c.cx!==undefined),...ctx.portals],beacons=[];
 /* Towers stand behind the town and around the shore, big enough to read from anywhere. */
 const spots=[[-110,-30],[-40,-14],[70,-30],[120,-26],[205,-20],[245,20],[-170,-30],[-230,40],[-235,130],[-120,140],[-70,150],[85,158],[215,110],[-30,-115],[105,-125],[-150,-95]];const count=QL<1?10:spots.length;
 if(MODERN)for(let i=0;i<count;i++){const s=clearSpot(spots[i][0],spots[i][1],16,taken);if(!s)continue;const[x,z,h]=s,w=11+hash(i,1)*8,d=10+hash(i,2)*8,H=34+hash(i,3)*44;tower(k,m,x,z,h,w,d,H,i+2,beacons);ctx.colliders.push({cx:x,cz:z,r:Math.max(w,d)*.72});taken.push({cx:x,cz:z,r:14})}
 const redGlow=[];for(const b of beacons){glowsN.add(b[0],b[1],b[2],5,1,.12,.1,.9);redGlow.push(b)}

 /* Toon shading and an ink line on the people. */
 const steps=new Uint8Array([60,60,60,255,150,150,150,255,255,255,255,255]),grad=new THREE.DataTexture(steps,3,1,THREE.RGBAFormat);grad.minFilter=grad.magFilter=THREE.NearestFilter;grad.needsUpdate=true;
 const ink=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{w:{value:.016}},vertexShader:'uniform float w;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normalize(normal)*w,1.);}',fragmentShader:'void main(){gl_FragColor=vec4(.02,.02,.03,1.);}'}),cache=new Map();
 const inkify=(R,line=true)=>{if(!MODERN)return;const list=[];R.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial)list.push(o)});for(const o of list){const s=o.material;if(!cache.has(s))cache.set(s,new THREE.MeshToonMaterial({color:s.color,map:s.map,gradientMap:grad,side:s.side,transparent:s.transparent,alphaTest:s.alphaTest}));o.material=cache.get(s);if(line&&QL>=1&&o.geometry.attributes.normal){const e=new THREE.Mesh(o.geometry,ink);e.castShadow=false;e.receiveShadow=false;o.add(e)}}};

 /* Modern people: no tricorn, spiky manga hair, plain jackets. */
 const modern=(p,hairCol)=>{if(!MODERN)return;if(p.hat)p.hat.visible=false;if(p.head){const hm=new THREE.MeshStandardMaterial({color:hairCol,roughness:.8}),cap=new THREE.Mesh(new THREE.SphereGeometry(.125,12,8),hm);cap.position.y=.055;cap.scale.set(1,.72,1);p.head.add(cap);for(let i=0;i<9;i++){const a=i/9*6.283,sp=new THREE.Mesh(new THREE.ConeGeometry(.04,.14,5),hm);sp.position.set(Math.cos(a)*.085,.12,Math.sin(a)*.085);sp.rotation.z=-Math.cos(a)*.7;sp.rotation.x=Math.sin(a)*.7;p.head.add(sp)}}};
 /* A lantern glow around you after dark, so night is scary but you can still see. */
 const lantern=new THREE.PointLight(0xffc68a,0,26,1.6);root.add(lantern);
 const signMat=(g)=>new THREE.MeshBasicMaterial({map:T.neon(g.sign,g.color,{sub:g.sub,font:'Oswald'}),transparent:true,toneMapped:false,depthWrite:false}),spotsOut=[];
 const k2=new Kit();
 HANGOUTS.forEach((g,gi)=>{const s=clearSpot(g.at[0],g.at[1],15,taken);if(!s)return;const[x,z,h]=s;taken.push({cx:x,cz:z,r:16});
  /* a slab pavilion on four concrete legs */
  if(!g.skate){k2.box(m.conc,x,h-.1,z,20,.4,16,0,0,0,.09);for(const a of[-8.5,8.5])for(const b of[-6.5,6.5]){k2.box(m.conc,x+a,h+3,z+b,1,6.2,1,0,0,0,.09);ctx.colliders.push({cx:x+a,cz:z+b,r:.9})}k2.box(m.dark,x,h+6.3,z,23,.8,19);k2.box(m.conc,x,h+7.2,z,17,1,13,0,0,0,.09);}
  if(g.src)ctx.portals.push({x,z:z-9.5,name:g.name||g.sign,label:g.sub,url:'x/',hash:'#'+gi,src:g.src,kit:0,r:9,icon:'door',keep:true});const sign=new THREE.Mesh(new THREE.PlaneGeometry(16,4),signMat(g));sign.position.set(x,h+9.8,z);sign.renderOrder=5;root.add(sign);const back=sign.clone();back.rotation.y=Math.PI;root.add(back);spotsOut.push({sign,x,z,g,hit:false});
  if(g.store){const sp=ctx.portals.find(p=>p.url==='store/');if(sp){sp.x=x;sp.z=z}ctx.storeAt=[x,z];new THREE.TextureLoader().load('../assets/pops-pippy-official.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;const pm=new THREE.Mesh(new THREE.PlaneGeometry(4,4.67),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));pm.position.set(x,h+2.7,z-6);root.add(pm)})}
  if(g.school){{const sp=ctx.portals.find(p=>p.url==='school/');if(sp){sp.x=x;sp.z=z}ctx.schoolAt=[x,z]}
   const cv=document.createElement('canvas');cv.width=640;cv.height=336;const q=cv.getContext('2d');for(let i=0;i<13;i++){q.fillStyle=i%2?'#f4f1e6':'#a8232e';q.fillRect(0,i*336/13,640,336/13+1)}q.fillStyle='#1f3468';q.fillRect(0,0,256,181);q.fillStyle='#f4f1e6';for(let r=0;r<9;r++)for(let s=0;s<(r%2?5:6);s++){q.beginPath();q.arc((r%2?42:21)+s*43,14+r*19,4,0,7);q.fill()}
   const fx=x-11.5,fz=z+9.5,fh=heightAt(fx,fz);k2.cyl(m.dark,[fx,fh-.3,fz],[fx,fh+14,fz],.1,.07,8);ctx.colliders.push({cx:fx,cz:fz,r:.4});const fl=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.2),new THREE.MeshStandardMaterial({map:T.tex(cv,{rep:false}),side:THREE.DoubleSide,roughness:.8}));fl.position.set(fx+2.15,fh+12.7,fz);root.add(fl);
   const bd=document.createElement('canvas');bd.width=768;bd.height=384;const b=bd.getContext('2d');b.fillStyle='#1d3a30';b.fillRect(0,0,768,384);b.fillStyle='#f1eee2';b.font='700 54px Oswald,sans-serif';b.textAlign='center';b.fillText('TODAY',384,70);b.font='500 38px Oswald,sans-serif';['History · Science · Math','English · Español','The USA · The Pledge','Everyone is welcome'].forEach((t,i)=>b.fillText(t,384,135+i*58));const bm=new THREE.Mesh(new THREE.PlaneGeometry(9,4.5),new THREE.MeshBasicMaterial({map:T.tex(bd,{rep:false})}));bm.position.set(x,h+3.2,z-6);root.add(bm);const bb=bm.clone();bb.position.z=z-6.08;bb.rotation.y=Math.PI;root.add(bb)}
  if(g.skate){/* real ramps beside the pavilion: two quarter pipes, a kicker, a funbox and a rail */
   const cm=new THREE.MeshStandardMaterial({color:0xb9b2a8,roughness:.6,side:THREE.DoubleSide}),wm=new THREE.MeshStandardMaterial({color:0x9a6a3a,roughness:.75,side:THREE.DoubleSide}),rm=new THREE.MeshStandardMaterial({color:0xe6ebf2,metalness:1,roughness:.2}),px=x,pz=z,ph=Math.max(heightAt(px-13,pz-9),heightAt(px+13,pz-9),heightAt(px-13,pz+9),heightAt(px+13,pz+9),heightAt(px,pz))+.1;
   const pad=new THREE.Mesh(new THREE.BoxGeometry(26,10,18),new THREE.MeshStandardMaterial({color:0xa8a29a,roughness:.85}));pad.position.set(px,ph-5,pz);pad.castShadow=true;pad.receiveShadow=true;ctx.platforms&&ctx.platforms.push({x0:px-13,x1:px+13,z0:pz-9,z1:pz+9,y:ph});/* steps up onto the park from the arrival side */for(let i=0;i<6;i++){const st=new THREE.Mesh(new THREE.BoxGeometry(6,10,1.2),new THREE.MeshStandardMaterial({color:0x9a948c,roughness:.9}));const sy=ph-(i+1)*Math.max(.15,(ph-heightAt(px,pz-12))/6);st.position.set(px,sy-5,pz-9.6-i*1.2);root.add(st);ctx.platforms&&ctx.platforms.push({x0:px-3,x1:px+3,z0:pz-10.2-i*1.2,z1:pz-9-i*1.2,y:sy})}pad.receiveShadow=true;root.add(pad);
   for(const s of[-1,1]){const q=new THREE.Mesh(new THREE.CylinderGeometry(4,4,16,20,1,true,0,Math.PI/2),cm);q.rotation.set(Math.PI/2,0,s>0?-Math.PI/2:Math.PI);q.position.set(px+s*9,ph+4.3,pz);q.scale.set(1,1,1);q.castShadow=true;root.add(q);
    const cop=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,16,10),rm);cop.rotation.x=Math.PI/2;cop.position.set(px+s*13,ph+4.3,pz);root.add(cop);ctx.colliders.push({x0:px+s*13-(s>0?0:1.2),x1:px+s*13+(s>0?1.2:0),z0:pz-8,z1:pz+8})}
   const kick=new THREE.Mesh(new THREE.BoxGeometry(4,.3,5),wm);kick.rotation.z=.32;kick.position.set(px-3.5,ph+.9,pz-4);kick.castShadow=true;root.add(kick);
   const fb=new THREE.Mesh(new THREE.BoxGeometry(5,1.1,4),cm);fb.position.set(px+2,ph+.75,pz+3);fb.castShadow=true;root.add(fb);ctx.colliders.push({x0:px-.5,x1:px+4.5,z0:pz+1,z1:pz+5});
   const rail=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,10,10),rm);rail.rotation.z=Math.PI/2;rail.position.set(px,ph+1.05,pz-6.5);root.add(rail);for(const dx of[-4.5,0,4.5]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.95,6),rm);p.position.set(px+dx,ph+.6,pz-6.5);root.add(p)}
   const sk=ctx.portals.find(p=>p.src==='../skate.html');if(sk){sk.x=px;sk.z=pz-12;sk.r=14;sk.look=[px,pz]}}
  const c=new THREE.Color(g.color);glowsN.add(x,h+5.4,z,g.fire?9:7,c.r,c.g,c.b,.7);if(g.fire){k2.cyl(M.woodDark,[x-.8,h+.1,z-.5],[x+.8,h+.5,z+.5],.16,.16,6);k2.cyl(M.woodDark,[x+.8,h+.1,z-.5],[x-.8,h+.5,z+.5],.16,.16,6);glowsN.add(x,h+.9,z,5,1,.5,.15,1)}
  const n=g.few?3:QL<1?4:7;for(let i=0;i<n;i++){const a=i/n*6.283+gi,r=4.4+(i%2)*1.3,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,lady=i%2==1;const who=crowd.length;addPerson(px,pz,Math.atan2(x-px,z-pz),{trim:0x3a3f49,coat:COAT[(i+gi)%6],skin:SKIN[(i+gi*2)%5],hair:HAIR[(i*3+gi)%4],beard:i%3==0,bandana:false,pants:0x20232a,skirt:[0x2a2f3a,0x3a1420,0x15303a][i%3]},g.day[i%3],lady);const e=crowd[who];modern(e.p,HAIR[(i*3+gi)%4]);e.who=(i===0||!g.others)?g.who:g.others;e.dayL=g.day[i%3];e.nightL=g.night[i%3];inkify(e.p.R)}});
 SEVENTH.forEach((v,i)=>{const s=clearSpot(-150-i*24,48,10,taken),sp=ctx.portals.find(p=>p.sev===v[0]);if(!s){if(sp)ctx.portals.splice(ctx.portals.indexOf(sp),1);return}const[x,z,h]=s;taken.push({cx:x,cz:z,r:10});k2.box(i%2?M.brick:M.brickDark,x,h+5,z,14,11,9,0,0,0,.3);k2.box(m.dark,x,h+10.6,z,14.8,.6,9.8);k2.box(M.woodDark,x,h+1.7,z+4.56,2.4,3.4,.14);k2.box(M.glass,x-4.2,h+2.5,z+4.56,3.4,2.6,.1);k2.box(M.glass,x+4.2,h+2.5,z+4.56,3.4,2.6,.1);k2.box(m.dark,x,h+5.1,z+5.4,13,.16,1.8);for(let j=0;j<=20;j++)k2.box(m.dark,x-6.4+j*.64,h+5.7,z+6.25,.04,1,.04);ctx.colliders.push({x0:x-7,x1:x+7,z0:z-4.5,z1:z+4.5});const sg=new THREE.Mesh(new THREE.PlaneGeometry(11,2.75),new THREE.MeshBasicMaterial({map:T.neon(v[1],v[3],{sub:v[2],font:'Oswald'}),transparent:true,toneMapped:false,depthWrite:false}));sg.position.set(x,h+8,z+4.62);root.add(sg);if(sp){sp.x=x;sp.z=z+6.5}glowsN.add(x,h+3,z+5.5,8,1,.65,.35,.4)});
 k.build(root);k2.build(root);

 /* Named crew join the people walking Seventh Avenue. */
 const crew=CREW.slice(0,QL<1?9:CREW.length).map(([who,g,line],i)=>{const o={trim:0x3a3f49,coat:COAT[i%6],skin:SKIN[i%5],hair:HAIR[i%4],beard:g=='m'&&i%2==0,bandana:false,pants:0x20232a,skirt:[0x2a2f3a,0x3a1420][i%2]},n=(g=='f'?makeLady:makePirate)(o),x=lerp(TOWN.x0+16,TOWN.x1-46,hash(i,31)),z=TOWN.streetZ+(i%2?7.5:-7.5);n.R.position.set(x,TOWN.y+.24,z);root.add(n.R);const e={p:n,tx:x,tz:z,wait:hash(i,5)*4,line,said:false,who,dayL:line,nightL:NIGHT[i%3]};npcs.push(e);modern(n,HAIR[i%4]);inkify(n.R);return e});
 inkify(P.R);for(const e of npcs)if(!e.who)inkify(e.p.R,false);for(const e of crowd)if(!e.who)inkify(e.p.R,false);

 let wasNight=null;
 return{m,spots:spotsOut,crew,
  setNight(night){m.win.emissiveIntensity=.03+night*1.75;lantern.intensity=night*42;const isN=night>.5;if(isN!==wasNight){wasNight=isN;for(const e of [...crowd,...npcs])if(e.who){e.line=isN?e.nightL:e.dayL;e.said=false}}},
  update(pp){lantern.position.set(pp.x,pp.y+3.2,pp.z);for(const s of spotsOut){const d=Math.hypot(pp.x-s.x,pp.z-s.z);if(d<16&&!s.hit){s.hit=true;toast(s.g.sign,s.g.sub)}else if(d>40)s.hit=false}}};
}
