/* Talking parrots of Ybor Cay: one rides on your shoulder and repeats what it hears,
   and a few more ride on the shoulders of pirates around the island.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';

const STD=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o));
const LOOKS=[{body:0xd8282b,wing:0x1f6fd0,tail:0x2fa84a,head:0xd8282b},{body:0x2fa84a,wing:0x1f6fd0,tail:0xd8282b,head:0xf0b429},{body:0x1f6fd0,wing:0xf0b429,tail:0x1f6fd0,head:0x1f6fd0},{body:0xf0b429,wing:0x2fa84a,tail:0xd8282b,head:0xf0b429}];
const CHATTER=["Pieces of eight! Pieces of eight!","Squawk! Doubloons!","Pops is the boss! Pops is the boss!","Pippy! Pippy! Good dog!","Seventh Avenue! Seventh Avenue!","Kraken! Kraken! Run!","Rum? No rum. Water!","Gaspar's Grotto! Grotto!","Walk the plank! Squawk!","Treasure! Treasure!","Pretty bird! Pretty bird!","Ahoy, matey! Ahoy!"];

export function makeParrot(look=LOOKS[0],s=1,opt={}){
 const G=new THREE.Group(),sph=new THREE.SphereGeometry(1,12,9),cone=new THREE.ConeGeometry(1,1,8);
 const m={b:STD(look.body),w:STD(look.wing),t:STD(look.tail),h:STD(look.head),k:STD(0x2a2a2a,{roughness:.4}),y:STD(0xf6d67a),e:STD(0x111111,{roughness:.2}),wh:STD(0xffffff)};
 const mk=(g,mat,x,y,z,sx,sy,sz,p=G)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;p.add(o);return o};
 mk(sph,m.b,0,.07,0,.045,.07,.05);// body
 const head=new THREE.Group();head.position.set(0,.15,.02);G.add(head);
 mk(sph,m.h,0,0,0,.038,.036,.04,head);mk(sph,m.wh,0,-.002,.03,.026,.02,.016,head);
 for(const x of[-.024,.024])mk(sph,m.e,x,.008,.026,.007,.007,.006,head);
 const beak=mk(cone,m.k,0,-.012,.05,.014,.032,.014,head);beak.rotation.x=Math.PI/2+.5;
 const wings=[];for(const x of[-1,1]){const w=new THREE.Group();w.position.set(x*.04,.1,-.005);G.add(w);const e=mk(sph,m.w,x*.006,-.035,-.01,.014,.055,.035,w);e.rotation.x=.25;wings.push(w)}
 const tail=mk(cone,m.t,0,-.04-(opt.longTail?.04:0),-.05-(opt.longTail?.05:0),.02,opt.longTail?.2:.1,.012);tail.rotation.x=-2.5;
 if(opt.crest){for(let i=0;i<4;i++){const c=mk(cone,STD(opt.crest),0,.04+i*.006,-.02-i*.012,.008,.06,.008,head);c.rotation.x=-.6-i*.25}}
 if(opt.belly){mk(sph,STD(opt.belly),0,.06,.03,.035,.055,.025)}
 for(const x of[-.018,.018]){const f=mk(new THREE.CylinderGeometry(.004,.004,.03,5),m.y,x,.005,.01,1,1,1);void f}
 G.scale.setScalar(s);
 return{G,head,beak,wings,talk:0,ph:Math.random()*6};
}
function animateParrot(p,dt,t){p.ph+=dt;const talking=p.talk>0;p.talk=Math.max(0,p.talk-dt);
 p.head.rotation.y=Math.sin(p.ph*.9)*.5+(talking?Math.sin(t*12)*.15:0);p.head.rotation.x=talking?Math.sin(t*18)*.2:Math.sin(p.ph*1.7)*.08;
 p.beak.rotation.x=Math.PI/2+.5+(talking?Math.abs(Math.sin(t*22))*.5:0);
 const flap=talking?Math.sin(t*26)*.9:Math.sin(p.ph*3)*.05;p.wings[0].rotation.z=-flap;p.wings[1].rotation.z=flap;}

export function initParrots({P,pirates,audio,root}){
 /* the bubble where parrots say things */
 const css=document.createElement('style');css.textContent=`#parrotSay{position:fixed;left:50%;top:calc(max(12px,env(safe-area-inset-top)) + 64px);transform:translateX(-50%) scale(.9);max-width:min(86vw,520px);padding:9px 14px 9px 12px;border-radius:16px;background:rgba(26,8,44,.82);border:1px solid rgba(255,95,168,.55);color:#fff4fb;font:600 1rem/1.3 Alegreya,Georgia,serif;box-shadow:0 0 18px rgba(255,79,163,.35);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;z-index:4;display:flex;gap:8px;align-items:center}#parrotSay.show{opacity:1;transform:translateX(-50%) scale(1)}#parrotSay b{color:#22e0d6;white-space:nowrap}
#teach{position:fixed;inset:0;z-index:6;display:none;align-items:center;justify-content:center;background:rgba(4,2,12,.6);padding:16px}#teach.show{display:flex}#teach .box{width:min(440px,100%);background:#1a082c;border:1px solid rgba(255,95,168,.6);border-radius:16px;padding:16px;color:#fff4fb;box-shadow:0 0 30px rgba(255,79,163,.35)}#teach h3{margin:0 0 6px;font:400 1.6rem "Pirata One",Georgia,serif;color:#ff7ab8}#teach p{margin:0 0 10px;color:#ffd6ea;font-size:.95rem}#teach input{width:100%;min-height:46px;border-radius:10px;border:1px solid rgba(34,224,214,.5);background:#0e0418;color:#fff;font:inherit;padding:0 12px;-webkit-user-select:text;user-select:text}#teach .row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}#teach button{min-height:44px;padding:0 14px;border-radius:10px;border:0;font:700 1rem Alegreya,Georgia,serif;cursor:pointer}#teach .go{background:linear-gradient(95deg,#ff4fa3,#ff8a3c);color:#1a0618}#teach .no{background:#ffffff18;color:#fff}#teach .known{margin-top:10px;font-size:.85rem;color:#ffd6ea}`;
 document.head.appendChild(css);
 const say=document.createElement('div');say.id='parrotSay';say.setAttribute('aria-live','polite');document.body.appendChild(say);
 const teach=document.createElement('div');teach.id='teach';teach.setAttribute('role','dialog');teach.setAttribute('aria-modal','true');
 teach.innerHTML=`<div class="box"><h3>Teach Squawk a word</h3><p>Type anything and your shoulder parrot will repeat it, now and again later on the island.</p><input id="teachIn" maxlength="80" placeholder="Pops runs the Grotto!" aria-label="Words to teach your parrot"><div class="row"><button class="go" id="teachGo" type="button">Say it, Squawk!</button><button class="no" id="teachNo" type="button">Close</button></div><div class="known" id="teachKnown"></div></div>`;
 document.body.appendChild(teach);

 let learned=[];try{learned=JSON.parse(localStorage.getItem('poy_parrot_words')||'[]')}catch(e){}
 const saveWords=()=>{try{localStorage.setItem('poy_parrot_words',JSON.stringify(learned.slice(-12)))}catch(e){}};
 const showKnown=()=>{document.getElementById('teachKnown').textContent=learned.length?'Squawk knows: '+learned.slice(-6).map(w=>'“'+w+'”').join(' · '):''};

 /* speaking: a squeaky voice when the device has one, plus a squawk */
 let sayT=0,voiceOK=!!window.speechSynthesis;
 function speak(text){if(!voiceOK||audio.muted)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/Squawk!?/gi,''));u.pitch=1.95;u.rate=1.18;u.volume=.9;speechSynthesis.speak(u)}catch(e){voiceOK=false}}
 function talk(bird,who,text,voice=true){say.innerHTML=`<b>🦜 ${who}</b><span>${text}</span>`;say.classList.add('show');clearTimeout(sayT);sayT=setTimeout(()=>say.classList.remove('show'),3400);bird.talk=1.6;audio.parrot();if(voice)setTimeout(()=>speak(text),180)}

 /* your shoulder parrot, Squawk */
 const mine=makeParrot(LOOKS[0],1.5);mine.G.position.set(-.215,.53,-.02);mine.G.rotation.y=-.3;P.body.add(mine.G);
 const echo=line=>{const w=line.replace(/[“”"]/g,'').split(/\s+/).filter(Boolean);const tail=w.slice(-Math.min(4,w.length)).join(' ').replace(/[.,!?]+$/,'');return `${tail}! ${tail}! Squawk!`};
 let lastEcho=0;
 const api={
  hear(a,b){const line=(b&&/“/.test(b))?b:(/“/.test(a)?a:null);if(!line)return;const now=performance.now();if(now-lastEcho<5000)return;lastEcho=now;setTimeout(()=>talk(mine,'Squawk',echo(line)),1700)},
  event(k){if(k==='coin'&&Math.random()<.35)talk(mine,'Squawk',Math.random()<.5?'Doubloons! Doubloons!':'Shiny! Shiny! Squawk!');if(k==='chest')talk(mine,'Squawk','Treasure! Treasure! Squawk!');if(k==='monster')talk(mine,'Squawk','Kraken! Kraken! Run!')},
  openTeach(){teach.classList.add('show');showKnown();setTimeout(()=>document.getElementById('teachIn').focus(),30);window.__poyPause=true},
  closeTeach(){teach.classList.remove('show');window.__poyPause=false}};
 document.getElementById('teachGo').onclick=()=>{const v=document.getElementById('teachIn').value.trim();if(!v)return;learned.push(v);saveWords();showKnown();document.getElementById('teachIn').value='';api.closeTeach();talk(mine,'Squawk',`${v}! ${v}!`)};
 document.getElementById('teachIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')document.getElementById('teachGo').click();if(e.key==='Escape')api.closeTeach()});
 document.getElementById('teachNo').onclick=api.closeTeach;
 teach.addEventListener('click',e=>{if(e.target===teach)api.closeTeach()});

 /* parrots on other pirates' shoulders */
 const others=[];pirates.filter(p=>p&&p.body).forEach((p,i)=>{if(i%3)return;const b=makeParrot(LOOKS[1+others.length%3],1.4);b.G.position.set(-.215,.53,-.02);b.G.rotation.y=-.3;p.body.add(b.G);others.push({b,p})});

 let chatT=8;
 api.update=(dt,t,pp)=>{animateParrot(mine,dt,t);for(const o of others)animateParrot(o.b,dt,t);
  chatT-=dt;if(chatT<=0&&!window.__poyPause){chatT=10+Math.random()*14;
   const near=others.find(o=>{const r=o.p.R.position;return o.p.R.visible!==false&&Math.hypot(r.x-pp.x,r.z-pp.z)<7});
   if(near){const pick=Math.random()<.4&&learned.length?learned[Math.random()*learned.length|0]:CHATTER[Math.random()*CHATTER.length|0];talk(near.b,'Parrot',pick.endsWith('!')?pick:pick+'!')}
   else if(Math.random()<.45){const pick=learned.length&&Math.random()<.5?learned[Math.random()*learned.length|0]:CHATTER[Math.random()*CHATTER.length|0];talk(mine,'Squawk',pick.endsWith('!')?pick:pick+'!',Math.random()<.6)}}};
 api.talk=talk;
 return api;
}

/* All kinds of parrots: they fly around Ybor Cay and land on the places */
export const SPECIES=[
 {n:'Scarlet Macaw',look:{body:0xd8202b,wing:0x1f6fd0,tail:0xd8202b,head:0xd8202b},o:{longTail:true,belly:0xd8202b},s:1.9},
 {n:'Blue-and-Gold Macaw',look:{body:0x1f6fd0,wing:0x1f6fd0,tail:0x1f6fd0,head:0x2fa84a},o:{longTail:true,belly:0xf6c21a},s:1.9},
 {n:'Hyacinth Macaw',look:{body:0x2a2f9a,wing:0x232882,tail:0x2a2f9a,head:0x2a2f9a},o:{longTail:true},s:2.1},
 {n:'Green-winged Macaw',look:{body:0xb8202b,wing:0x2fa84a,tail:0x1f6fd0,head:0xb8202b},o:{longTail:true},s:1.9},
 {n:'African Grey',look:{body:0x8a8f96,wing:0x6e737a,tail:0xc8202b,head:0x9aa0a8},o:{},s:1.4},
 {n:'Sulphur-crested Cockatoo',look:{body:0xf4f4ee,wing:0xf0f0e8,tail:0xf4f4ee,head:0xf4f4ee},o:{crest:0xf6d020},s:1.5},
 {n:'Rainbow Lorikeet',look:{body:0x2fa84a,wing:0x2fa84a,tail:0x2fa84a,head:0x2a3fb8},o:{belly:0xff7a1a},s:1.15},
 {n:'Yellow-headed Amazon',look:{body:0x3a9a3a,wing:0x2f8a3a,tail:0x3a9a3a,head:0xf6d020},o:{},s:1.35},
 {n:'Sun Conure',look:{body:0xffa21a,wing:0x2fa84a,tail:0x2f8a3a,head:0xffc21a},o:{belly:0xff7a1a},s:1.05},
 {n:'Eclectus',look:{body:0x35c43a,wing:0x2fae3a,tail:0x35c43a,head:0x35c43a},o:{},s:1.35},
 {n:'Peach-faced Lovebird',look:{body:0x5ac85a,wing:0x4ab84a,tail:0x2a6fd0,head:0xff9a7a},o:{},s:.85},
 {n:'Budgie',look:{body:0x7ad83a,wing:0x5ab02a,tail:0x2a6fd0,head:0xf6e03a},o:{},s:.8},
 {n:'Galah',look:{body:0xe86a8a,wing:0x9aa0a8,tail:0x9aa0a8,head:0xf4b8c8},o:{crest:0xf4c8d8},s:1.3},
 {n:'Military Macaw',look:{body:0x5aa83a,wing:0x2f8a3a,tail:0xc0502a,head:0x5aa83a},o:{longTail:true},s:1.8}];
export function initFlock({root,groundAt,places,audio,talk,count=26}){
 const birds=[];
 const pickPlace=(not)=>{const L=places();if(!L||!L.length)return null;let p;for(let k=0;k<6;k++){p=L[Math.random()*L.length|0];if(p!==not)break}return p};
 const perchAt=(pl)=>{const a=Math.random()*6.283,r=2+Math.random()*7,x=pl.x+Math.cos(a)*r,z=pl.z+Math.sin(a)*r;return{x,z,y:Math.max(groundAt(x,z,60),-.5)+.05,pl}};
 for(let i=0;i<count;i++){const sp=SPECIES[i%SPECIES.length],b=makeParrot(sp.look,sp.s,sp.o);const pl=pickPlace();const pos=pl?perchAt(pl):{x:0,z:0,y:5};
  b.G.position.set(pos.x,pos.y,pos.z);root.add(b.G);birds.push({b,sp,state:'perch',t:4+Math.random()*12,from:null,to:pos,k:0,said:0})}
 return{birds,update(dt,t,pp){for(const B of birds){const g=B.b.G;
   if(B.state==='perch'){B.t-=dt;B.b.wings[0].rotation.z=-.05;B.b.wings[1].rotation.z=.05;B.b.head.rotation.y=Math.sin(t*1.3+B.b.ph)*.6;
    const d=Math.hypot(pp.x-g.position.x,pp.z-g.position.z);
    if(d<5&&t-B.said>14&&talk){B.said=t;talk(B.b,B.sp.n,['Pieces of eight!','Ahoy, matey!','Squawk! Doubloons!','Pretty bird! Pretty bird!','Pops is the boss!','Welcome to Ybor Cay!','Land of the free! Squawk!','God bless America! Squawk!'][Math.random()*8|0])}
    if(d<2.2&&B.t>1)B.t=.2;// startled when you walk right up
    if(B.t<=0){const pl=pickPlace(B.to&&B.to.pl);if(!pl){B.t=5;continue}B.from={x:g.position.x,y:g.position.y,z:g.position.z};B.to=perchAt(pl);B.k=0;B.dur=Math.max(6,Math.hypot(B.to.x-B.from.x,B.to.z-B.from.z)/14);B.state='fly';if(d<30&&audio)audio.flap(.4)}}
   else{B.k+=dt/B.dur;const k=Math.min(1,B.k),e=k*k*(3-2*k),x=B.from.x+(B.to.x-B.from.x)*e,z=B.from.z+(B.to.z-B.from.z)*e,arc=Math.sin(k*Math.PI)*(14+B.dur*.8),y=B.from.y+(B.to.y-B.from.y)*e+arc;
    const dx=x-g.position.x,dz=z-g.position.z;if(Math.abs(dx)+Math.abs(dz)>1e-4)g.rotation.y=Math.atan2(dx,dz);g.position.set(x,y,z);
    const fl=Math.sin(t*(16+B.sp.s*-2)+B.b.ph)*1.1;B.b.wings[0].rotation.z=-fl;B.b.wings[1].rotation.z=fl;g.rotation.x=k<.15?-.4:k>.85?.35:0;
    if(k>=1){B.state='perch';B.t=8+Math.random()*16;g.rotation.x=0}}}}};
}
/* American flags on the island */
export function flagTexture(){const W=760,H=400,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 for(let i=0;i<13;i++){g.fillStyle=i%2?'#ffffff':'#b22234';g.fillRect(0,i*H/13,W,H/13+1)}
 const cw=W*.4,ch=H*7/13;g.fillStyle='#3c3b6e';g.fillRect(0,0,cw,ch);g.fillStyle='#ffffff';
 const star=(cx,cy,r)=>{g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.4:r;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}g.closePath();g.fill()};
 for(let row=0;row<9;row++){const n=row%2?5:6;for(let col=0;col<n;col++){const x=cw*(row%2?(col+1)/6:(col+.5)/6),y=ch*(row+.6)/9.6;star(x,y,ch*.042)}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
export function initFlags({root,groundAt,spots}){const tex=flagTexture(),mat=new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,roughness:.8}),pole=new THREE.MeshStandardMaterial({color:0xdcdcdc,metalness:.8,roughness:.3}),gold=new THREE.MeshStandardMaterial({color:0xe8b84a,metalness:1,roughness:.3});
 const flags=[];for(const s of spots){const h=Math.max(groundAt(s.x,s.z,60),0);const P=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,11,10),pole);P.position.set(s.x,h+5.5,s.z);P.castShadow=true;root.add(P);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),gold);ball.position.set(s.x,h+11.15,s.z);root.add(ball);
  const geo=new THREE.PlaneGeometry(3.8,2,16,6),f=new THREE.Mesh(geo,mat);f.position.set(s.x+1.95,h+9.9,s.z);f.castShadow=true;root.add(f);flags.push({f,base:geo.attributes.position.array.slice()})}
 return{update(t){for(const F of flags){const p=F.f.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=F.base[i*3];p.setZ(i,Math.sin(x*1.8-t*4.5)*.18*(x+1.9)/3.8)}p.needsUpdate=true}}}}
