/* Flex Grotto in 3D: lasers, haze, LED screens, a lit dance floor and a crowd that dances to
   DJ Josh Bouche's beat. Truss, speakers and booth are VRML97 models from world/models/.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
import {loadVRML} from './vrml.js';
import {makePirate,makeLady} from './characters.js';

export function startClub3D(host,opts={}){
 const B=window.PoyBeats,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const phone=Math.min(screen.width,screen.height)<700;
 let ren;try{ren=new THREE.WebGLRenderer({antialias:!phone,powerPreference:'high-performance'})}catch(e){return null}
 if(!ren.getContext())return null;
 ren.setPixelRatio(Math.min(phone?1.5:2,window.devicePixelRatio||1));ren.outputColorSpace=THREE.SRGBColorSpace;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.15;
 const cv=ren.domElement;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';host.appendChild(cv);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x05040a);scene.fog=new THREE.FogExp2(0x0a0812,.028);
 const cam=new THREE.PerspectiveCamera(52,16/10,.1,200);
 const base='world/';
 const PAL={east:[0x5aa0ff,0xb06cff,0xdfe8ff],west:[0xff9a3c,0xff4f9a,0xffe2b0],miami:[0xff3fa4,0x22e0d0,0xfff0a0],dubstep:[0x8cff3c,0x7a2cff,0xd6ffb0],rave:[0xfff23c,0xff3cf0,0x3cf0ff]};
 const style=()=>B?(B.pendingStyle()||B.style()):'east',pal=()=>PAL[style()]||PAL.east;
 const under=()=>{const b=document.getElementById('fUnder');return b&&b.getAttribute('aria-pressed')==='true'};

 /* ---------- room ---------- */
 scene.add(new THREE.HemisphereLight(0x6070a0,0x100808,.35));
 const key=new THREE.PointLight(0xffd9a0,30,30,1.6);key.position.set(0,7,4);scene.add(key);
 const wallM=new THREE.MeshStandardMaterial({color:0x14121a,roughness:.9});
 const floorM=new THREE.MeshStandardMaterial({color:0x0c0b10,roughness:.22,metalness:.6});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),floorM);floor.rotation.x=-Math.PI/2;scene.add(floor);
 const back=new THREE.Mesh(new THREE.PlaneGeometry(40,14),wallM);back.position.set(0,7,-9);scene.add(back);
 for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(30,14),wallM);w.position.set(s*13,7,2);w.rotation.y=-s*Math.PI/2;scene.add(w)}
 const stage=new THREE.Mesh(new THREE.BoxGeometry(12,.6,4.6),new THREE.MeshStandardMaterial({color:0x17121a,roughness:.5,metalness:.3}));stage.position.set(0,.3,-6.4);scene.add(stage);

 /* LED dance floor */
 const NX=12,NZ=8,tileG=new THREE.PlaneGeometry(.92,.92);tileG.rotateX(-Math.PI/2);
 const tiles=new THREE.InstancedMesh(tileG,new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),NX*NZ);
 const mtx=new THREE.Matrix4(),col=new THREE.Color();let k0=0;
 for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){mtx.makeTranslation((x-(NX-1)/2),.012,(z-(NZ-1)/2)+.2);tiles.setMatrixAt(k0,mtx);tiles.setColorAt(k0,col.setRGB(0,0,0));k0++}
 scene.add(tiles);

 /* ---------- LED screens ---------- */
 const scrC=document.createElement('canvas');scrC.width=1024;scrC.height=512;const sg=scrC.getContext('2d');
 const scrT=new THREE.CanvasTexture(scrC);scrT.colorSpace=THREE.SRGBColorSpace;
 const frameM=new THREE.MeshStandardMaterial({color:0x101014,roughness:.4,metalness:.8});
 function screen(w,h,x,y,z,ry,mat){const g=new THREE.Group();const f=new THREE.Mesh(new THREE.BoxGeometry(w+.3,h+.3,.2),frameM);g.add(f);const s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);s.position.z=.11;g.add(s);g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);return s}
 screen(9,4.5,0,5.1,-8.8,0,new THREE.MeshBasicMaterial({map:scrT,toneMapped:false}));
 const vids=[];
 function vidMat(src){const v=document.createElement('video');v.src=src;v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.crossOrigin='anonymous';v.preload='auto';const p=v.play();if(p&&p.catch)p.catch(()=>{});vids.push(v);
  const t=new THREE.VideoTexture(v);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t,toneMapped:false,color:0xdddddd})}
 const poster=new THREE.TextureLoader().load('assets/pops-pippy-official.jpg');poster.colorSpace=THREE.SRGBColorSpace;
 const sideL=screen(4.2,2.4,-9.4,4.6,-6.6,.55,vidMat('assets/clips/stage.mp4'));
 const sideR=screen(4.2,2.4,9.4,4.6,-6.6,-.55,vidMat('assets/clips/courtyard.mp4'));
 screen(2.6,3.4,-12.9,4.4,1,Math.PI/2,new THREE.MeshBasicMaterial({map:poster,toneMapped:false,color:0xbbbbbb}));
 screen(2.6,3.4,12.9,4.4,1,-Math.PI/2,new THREE.MeshBasicMaterial({map:poster,toneMapped:false,color:0xbbbbbb}));
 const bars=new Float32Array(48);
 function drawScreen(t,p,pc){const W=1024,H=512,c=pc.map(h=>'#'+h.toString(16).padStart(6,'0'));sg.fillStyle='#05040a';sg.fillRect(0,0,W,H);
  const gr=sg.createRadialGradient(W/2,H*.55,20,W/2,H*.55,W*.6);gr.addColorStop(0,c[1]+'66');gr.addColorStop(1,'#05040a');sg.fillStyle=gr;sg.fillRect(0,0,W,H);
  for(let i=0;i<bars.length;i++){const tgt=.15+.85*p*Math.abs(Math.sin(i*.7+t*3))*(.5+.5*Math.sin(i*.21+t));bars[i]+= (tgt-bars[i])*.25;const bw=W/bars.length,h=bars[i]*H*.55;sg.fillStyle=i%2?c[0]:c[1];sg.fillRect(i*bw+2,H-h,bw-4,h)}
  sg.save();sg.translate(W/2,H*.38);sg.rotate(Math.sin(t*.7)*.03);sg.textAlign='center';sg.shadowColor=c[0];sg.shadowBlur=30+40*p;sg.fillStyle='#fff';sg.font='700 120px Georgia,serif';sg.fillText(under()?'UNDERGROUND':'FLEX GROTTO',0,0);
  sg.shadowBlur=12;sg.fillStyle=c[2];sg.font='600 40px system-ui,sans-serif';sg.fillText('DJ JOSH BOUCHE · '+((B&&B.styles[style()])?B.styles[style()].name.toUpperCase():'LIVE'),0,70);sg.restore();
  sg.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<H;y+=4)sg.fillRect(0,y,W,2);scrT.needsUpdate=true}

 /* ---------- VRML set pieces ---------- */
 const vr=(name,setup)=>loadVRML(base+'models/'+name+'.wrl.txt').then(g=>{setup(g);}).catch(e=>console.warn('vrml',name,e));
 vr('club-truss',g=>{g.position.set(0,0,-4.2);scene.add(g);const g2=g.clone();g2.position.set(0,0,3);scene.add(g2)});
 vr('club-booth',g=>{g.position.set(0,.6,-5.2);scene.add(g)});
 vr('club-speaker',g=>{for(const s of[-1,1])for(const z of[-6.6,-1]){const c=g.clone();c.position.set(s*(z<-3?6.8:9.6),z<-3?.6:0,z);c.rotation.y=-s*.25;scene.add(c)}});

 /* ---------- lasers and moving heads ---------- */
 const gc=document.createElement('canvas');gc.width=4;gc.height=128;const gg=gc.getContext('2d'),lg=gg.createLinearGradient(0,0,0,128);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.7,'rgba(255,255,255,.45)');lg.addColorStop(1,'#fff');gg.fillStyle=lg;gg.fillRect(0,0,4,128);
 const fade=new THREE.CanvasTexture(gc);
 const L=30,beamG=new THREE.CylinderGeometry(.03,.09,L,6,1,true);beamG.translate(0,-L/2,0);
 const heads=[];
 const HEADPOS=[[-5.5,5.9,-4.2],[-2,5.9,-4.2],[2,5.9,-4.2],[5.5,5.9,-4.2],[-4,5.9,3],[4,5.9,3]];
 HEADPOS.forEach((hp,hi)=>{const G=new THREE.Group();G.position.set(hp[0],hp[1],hp[2]);const n=phone?5:8,beams=[];
  for(let i=0;i<n;i++){const piv=new THREE.Group(),m=new THREE.Mesh(beamG,new THREE.MeshBasicMaterial({map:fade,color:0xffffff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}));piv.add(m);G.add(piv);beams.push({piv,m,i})}
  const box=new THREE.Mesh(new THREE.BoxGeometry(.3,.25,.3),frameM);G.add(box);scene.add(G);heads.push({G,beams,hi,n})});
 const coneG=new THREE.ConeGeometry(1.6,9,24,1,true);coneG.translate(0,-4.5,0);
 const spots=[];for(let i=0;i<4;i++){const piv=new THREE.Group();piv.position.set(-4.5+i*3,5.6,3);const m=new THREE.Mesh(coneG,new THREE.MeshBasicMaterial({map:fade,color:0xffffff,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,fog:false}));piv.add(m);scene.add(piv);spots.push({piv,m,i})}
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.45,24,16),new THREE.MeshStandardMaterial({color:0xcfd6e6,metalness:1,roughness:.18,flatShading:true}));ball.position.set(0,5.4,0);scene.add(ball);
 const dotsG=new THREE.BufferGeometry(),DP=new Float32Array(phone?240:480);for(let i=0;i<DP.length;i+=3){const a=Math.random()*6.283,b=Math.acos(2*Math.random()-1)*.55,r=12;DP[i]=Math.sin(b)*Math.cos(a)*r;DP[i+1]=Math.cos(b)*r*-.5+5;DP[i+2]=Math.sin(b)*Math.sin(a)*r}
 dotsG.setAttribute('position',new THREE.BufferAttribute(DP,3));const dots=new THREE.Points(dotsG,new THREE.PointsMaterial({size:.08,color:0xffffff,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));dots.position.y=0;scene.add(dots);
 /* haze sheets */
 const hz=document.createElement('canvas');hz.width=hz.height=128;const hg=hz.getContext('2d'),rg=hg.createRadialGradient(64,64,4,64,64,64);rg.addColorStop(0,'rgba(255,255,255,.35)');rg.addColorStop(1,'rgba(255,255,255,0)');hg.fillStyle=rg;hg.fillRect(0,0,128,128);
 const hzT=new THREE.CanvasTexture(hz),haze=[];for(let i=0;i<(phone?6:12);i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:hzT,color:0x8888aa,transparent:true,opacity:.12,depthWrite:false}));s.scale.setScalar(9+Math.random()*6);s.position.set((Math.random()-.5)*20,2+Math.random()*4,(Math.random()-.5)*12);scene.add(s);haze.push(s)}

 /* ---------- people ---------- */
 const COATS=[0x5c1720,0x1c2f6b,0x2b2d33,0x1f6b4a,0x6a2c91,0x8c1c13,0x15151a,0xc2571a],SK=[0xc99570,0x8a5a3c,0xe0b48c,0x6b4026,0xd9a67c,0xa8734c];
 const crowd=[],NC=phone?16:28;
 for(let i=0;i<NC;i++){const lady=i%2===1,o={coat:COATS[i%COATS.length],skin:SK[(i*5)%SK.length],trim:[0xd9a944,0xcfd6e6,0xff3fa4,0x22e0d0][i%4],skirt:[0x6d1f3c,0x15151a,0x1c2f6b,0x6a2c91][i%4]};
  const P=lady?makeLady(o):makePirate({...o,beard:i%3===0});const row=Math.floor(i/7),colI=i%7;
  P.R.position.set((colI-3)*1.35+(row%2?.6:0)+(Math.random()-.5)*.3,0,-1.6+row*1.5+(Math.random()-.5)*.3);P.R.rotation.y=Math.PI+(Math.random()-.5)*.6;
  P.R.scale.multiplyScalar(1.6+(Math.random()-.5)*.12);P.R.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false}});scene.add(P.R);
  crowd.push({P,ph:Math.random()*6.283,style:i%3,amp:.8+Math.random()*.4,base:P.R.position.y})}
 const dj=makePirate({coat:0x1c2f6b,trim:0xf6d67a,skin:0x8a5a3c,beard:false});dj.R.position.set(-.5,.6,-5.9);dj.R.scale.multiplyScalar(1.7);scene.add(dj.R);
 const lita=makeLady({coat:0x7c1530,trim:0xf6d67a,skin:0xc28a62,skirt:0x15151a});lita.R.position.set(1.8,.6,-5.9);lita.R.scale.multiplyScalar(1.7);scene.add(lita.R);
 function dance(P,t,beat,amp,st,hype){const b=Math.abs(Math.sin(beat*Math.PI)),up=hype>.6||st===2;
  P.hips.position.y=.94-b*.07*amp+(st===1&&hype>.75?Math.max(0,Math.sin(beat*Math.PI))*.12:0);
  P.body.rotation.y=Math.sin(beat*Math.PI*.5+st)*.25*amp;P.body.rotation.x=.08+b*.06;P.hips.rotation.z=Math.sin(beat*Math.PI)*.08;
  P.ta.rotation.x=-.15-b*.25;P.tb.rotation.x=-.15-(1-b)*.25;P.sa.rotation.x=.3+b*.3;P.sb.rotation.x=.3+(1-b)*.3;
  if(up){P.ua.rotation.x=-2.7+b*.35;P.ub.rotation.x=-2.7+(1-b)*.35;P.la.rotation.x=-.3;P.lb.rotation.x=-.3}
  else if(st===0){P.ua.rotation.x=-.6-b*.9;P.ub.rotation.x=-.6-(1-b)*.9;P.la.rotation.x=-1.2;P.lb.rotation.x=-1.2}
  else{P.ua.rotation.x=-1.2+Math.sin(t*2+st)*.3;P.ub.rotation.x=-.4;P.la.rotation.x=-1.5;P.lb.rotation.x=-.9}
  P.head.rotation.x=-.08+b*.12}

 /* ---------- beat tracking ---------- */
 let pulse=0,snr=0,lastBar=-1,flash=0,dropWas=0,hype=.4;const pend=[];
 if(B)B.onStep((n,t,i,bar)=>{const p=B.styles[B.style()];if(p.kick[bar][i]==='x')pend.push([t,0]);if(p.snare[bar][i]==='x')pend.push([t,1]);if(i===0)pend.push([t,2])});

 /* ---------- cinematic camera ---------- */
 const SHOTS=[
  {from:[0,2.2,11],to:[0,2.4,8],look:[0,3,-6],fov:50},
  {from:[-7,1.2,5],to:[-4,1.4,4],look:[0,2,-4],fov:44},
  {from:[3,2.7,-3.5],to:[1.2,2.4,-3.1],look:[0,2.4,-6],fov:42},
  {from:[0,9,6],to:[0,8,2],look:[0,0,-1],fov:56},
  {from:[7,1.6,1],to:[4,1.8,6],look:[-1,2.4,-5],fov:48},
  {from:[0,1.1,2.5],to:[0,1.3,5],look:[0,4,-8],fov:58}];
 let shot=0,shotT=0,shotLen=7,cut=0;
 function nextShot(force){shot=force!==undefined?force:(shot+1+Math.floor(Math.random()*(SHOTS.length-1)))%SHOTS.length;shotT=0;shotLen=5.5+Math.random()*3.5;cut=1}
 const lp=new THREE.Vector3(),la=new THREE.Vector3(),tmp=new THREE.Vector3();

 /* ---------- loop ---------- */
 let last=performance.now(),running=true,raf=0,T=0;
 function size(){const w=host.clientWidth||960,h=host.clientHeight||600;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
 const ro=window.ResizeObserver?new ResizeObserver(size):null;if(ro)ro.observe(host);else window.addEventListener('resize',size);size();
 function frame(now){if(!running)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  const c=B&&B.clock(),at=c?c.now:T,on=B&&B.isOn(),u=under(),P3=pal();
  for(let i=pend.length-1;i>=0;i--){if(pend[i][0]<=at){const k=pend[i][2];if(pend[i][1]===0)pulse=1;else if(pend[i][1]===1)snr=1;else if(k===undefined&&pend[i][1]===2&&Math.random()<.25&&!reduce)nextShot();pend.splice(i,1)}}
  if(pend.length>80)pend.splice(0,40);
  pulse=Math.max(0,pulse-dt*4.5);snr=Math.max(0,snr-dt*5);flash=Math.max(0,flash-dt*3);
  const dr=B?B.barsToDrop():0;if(dropWas>0&&dr===0){flash=1;hype=1;if(!reduce)nextShot(3)}dropWas=dr;
  hype+=((on?(u?.85:.6):.2)-hype)*dt*.3;
  const beat=c?at/(c.dur*4):T*1.5,bp=on?beat:T*.8;
  /* floor */
  const cA=new THREE.Color(P3[0]),cB=new THREE.Color(P3[1]);let q=0;
  for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){const w=Math.sin(x*.7+z*.9-T*(on?3:.6))*.5+.5,lit=((x+z+Math.floor(T*(on?2:.5)))%3===0);col.copy(lit?cA:cB).multiplyScalar(on?(lit?.25+pulse*.9:.06+w*.12):.05+w*.05);tiles.setColorAt(q++,col)}
  tiles.instanceColor.needsUpdate=true;
  /* lasers */
  const L1=new THREE.Color(P3[0]),L2=new THREE.Color(P3[1]),L3=new THREE.Color(P3[2]);
  for(const h of heads){const show=on&&(u||h.hi<4||hype>.7);h.G.visible=show||!on;const spread=(u?1.1:.7)*(.45+.55*Math.sin(T*.5+h.hi))+pulse*.15;
   for(const b of h.beams){const f=b.i/(h.n-1)-.5,sweep=reduce?0:Math.sin(T*(.6+h.hi*.13)+h.hi)*.6;b.piv.rotation.set(-(.55+Math.sin(T*.8+h.hi)*.3*(reduce?0:1))*(h.hi>3?-1:1),0,sweep+f*spread*2);
    b.m.material.color.copy(b.i%3===0?L3:b.i%2?L1:L2);b.m.material.opacity=on?(.45+.5*pulse+(u?.2:0)):.12}}
  for(const s of spots){s.piv.rotation.set(Math.sin(T*.7+s.i)*.5,0,Math.cos(T*.5+s.i*1.7)*.6);s.m.material.color.copy(s.i%2?L1:L2);s.m.material.opacity=(on?.1+.18*pulse:.06)*(u?.6:1)}
  ball.rotation.y+=dt*.6;dots.rotation.y+=dt*.25;dots.material.opacity=on?.25+.5*pulse:.15;
  for(const s of haze){s.material.opacity=(u?.16:.1)+.05*pulse;s.position.x+=Math.sin(T*.1+s.position.z)*dt*.2}
  key.intensity=on?18+40*pulse:12;key.color.copy(L2).lerp(new THREE.Color(0xffd9a0),.5);
  scene.fog.density=u?.04:.026;scene.background.setHex(u?0x020205:0x05040a);
  /* people */
  for(const d of crowd){d.ph+=dt;dance(d.P,T,bp+d.ph*.02,d.amp,d.style,on?hype:.25)}
  dance(dj.P||dj,T,bp,.6,0,.3);dj.ua.rotation.x=-.9+snr*.4;dj.ub.rotation.x=-1.1+pulse*.3;dj.la.rotation.x=-1.2;dj.lb.rotation.x=-1.3;
  dance(lita,T,bp,.9,1,hype);lita.ub.rotation.x=-2.2+snr*.3;
  /* screens */
  drawScreen(T,on?pulse:.2,P3);
  /* camera */
  shotT+=dt;if(shotT>shotLen&&!reduce)nextShot();const S=SHOTS[reduce?0:shot],k=Math.min(1,shotT/shotLen),e=k*k*(3-2*k);
  tmp.set(S.from[0]+(S.to[0]-S.from[0])*e,S.from[1]+(S.to[1]-S.from[1])*e,S.from[2]+(S.to[2]-S.from[2])*e);
  if(cut){lp.copy(tmp);la.set(...S.look);cut=0}else{lp.lerp(tmp,.08);la.lerp(tmp.set(...S.look),.08)}
  cam.position.copy(lp);cam.position.y+=Math.sin(T*1.3)*.03+pulse*.02;cam.fov+=(S.fov-cam.fov)*.06;cam.updateProjectionMatrix();cam.lookAt(la);
  ren.toneMappingExposure=1.1+flash*1.2;
  ren.render(scene,cam)}
 raf=requestAnimationFrame(frame);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;cancelAnimationFrame(raf)}else if(!running){running=true;last=performance.now();raf=requestAnimationFrame(frame)}});
 return{scene,cam,ren,shot:i=>nextShot(i),get crowd(){return crowd.length},stop(){running=false;cancelAnimationFrame(raf);vids.forEach(v=>v.pause())}};
}
