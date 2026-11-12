/* The birds of Ybor Cay: gulls overhead and on the sand, pelican lines over the water, parrots on Seventh Avenue.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE,clamp,lerp,smooth,rng} from './util.js';
function birdGeo(){const P=[],C=[],G=[];const tri=(a,b,c,ca=1,cb=ca,cc=ca)=>{P.push(...a,...b,...c);C.push(ca,ca,ca,cb,cb,cb,cc,cc,cc);const gl=ca<.7?1:0;G.push(gl,gl,gl)};
 const N=[0,.02,.46],T=[0,.03,-.34],U=[0,.1,.05],D=[0,-.07,.04],L=[-.09,0,.05],R=[.09,0,.05];
 for(const[a,b]of[[L,U],[U,R],[R,D],[D,L]]){tri(N,a,b);tri(T,b,a)}
 /* head and beak */const H=[0,.1,.42];tri(H,[-.05,.03,.36],[.05,.03,.36]);tri([0,.05,.58],[-.022,.03,.44],[.022,.03,.44],.55);
 /* tail */tri([-.03,.03,-.28],[.03,.03,-.28],[.11,.02,-.5],.8);tri([-.03,.03,-.28],[.11,.02,-.5],[-.11,.02,-.5],.8);
 /* wings: inner panel, then a darker tip */
 for(const s of[-1,1]){const r0=[s*.05,.03,.17],r1=[s*.05,.03,-.1],m0=[s*.48,.05,.14],m1=[s*.46,.05,-.15],t=[s*.95,.02,-.11];tri(r0,m0,r1);tri(r1,m0,m1);tri(m0,t,m1,.62)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('aG',new THREE.Float32BufferAttribute(G,1));g.computeVertexNormals();return g}
export function makeBirds({root,groundAt,heightAt,TOWN,ISLANDS,dock,audio,QL}){
 const R=rng(7741),nG=QL>=1?30:16,nPel=QL>=1?15:10,nPar=QL>=1?14:8,nBeach=QL>=1?20:12,N=nG+nPel+nPar+nBeach,g=birdGeo(),F=new Float32Array(N*3);g.setAttribute('aF',new THREE.InstancedBufferAttribute(F,3));
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.85});
 mat.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aF;attribute float aG;varying float vG;').replace('#include <begin_vertex>',`#include <begin_vertex>
 vG=aG;float wx=abs(position.x);transformed.x*=mix(1.,.2,aF.z);if(wx>.04){transformed.y+=wx*aF.y*sin(aF.x+wx*1.1)*(1.-aF.z);transformed.y+=wx*.12*(1.-aF.z);}`);s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying float vG;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.12,.95,1.)*vG*1.9;')};
 const M=new THREE.InstancedMesh(g,mat,N);M.frustumCulled=false;root.add(M);
 const col=new THREE.Color();const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(0,0,0,'YXZ'),v=new THREE.Vector3(),s=new THREE.Vector3(),a=[0,0,0],b=[0,0,0];
 const birds=[];let id=0;const mk=(o,c,size)=>{const B={id,phase:R()*6,size,...o};birds.push(B);M.setColorAt(id,col.setHex(c));id++;return B};
 const main=ISLANDS[0];
 /* gulls: wheeling kettles, one of which trails the player */
 const CX=[[30,180],[-80,210],[240,100],[680,-340],[-650,-280],null];for(let i=0;i<nG;i++){const k=i%6;mk({kind:'gull',k,r:18+R()*34,w:(.2+R()*.14)*(i%2?1:-1),o:R()*6.28,y:14+R()*18,j:R()*6},R()<.2?0xc9ced4:0xf4f3ee,1.5)}
 /* pelicans: slow lines close to the water */
 for(let i=0;i<nPel;i++){const L=i%3,idx=Math.floor(i/3);mk({kind:'pel',L,idx},L===2?0x6f604e:0x85745e,2.5)}
 /* parrots */
 const PC=[0xd8282b,0x1f6fd0,0x2fa84a,0xf0b429];for(let i=0;i<nPar;i++)mk({kind:'par',f:i%2,o:R()*6.28,sp:.2+R()*.12,r:3+R()*4},PC[i%4],1)
 /* beach gulls, and a few on the dock */
 const beach=[];let guard=0;const near=[[38,172],[50,186],[20,180]];while(beach.length<nBeach&&guard++<1800){let x,z;if(guard%3===0&&dock){x=dock.sx+R()*dock.LEN;z=dock.z+(R()-.5)*3}else if(guard%3===1){const c=near[Math.floor(R()*3)];x=c[0]+(R()-.5)*34;z=c[1]+(R()-.5)*26}else{const an=R()*6.283,rr=.75+R()*.35;x=main.x+Math.cos(an)*main.rx*rr;z=main.z+Math.sin(an)*main.rz*rr}const h=groundAt(x,z,99);const isDeck=h>heightAt(x,z)+.5;if(isDeck||(h>.5&&h<2.2)){beach.push([x,z,h]);const B=mk({kind:'beach',x,z,y:h,hx:x,hz:z,hy:h,yaw:R()*6.28,st:0,vx:0,vy:0,vz:0,tm:0,pk:R()*9},R()<.25?0xc9ced4:0xf4f3ee,1.15);void B}}
 M.count=id;if(M.instanceColor)M.instanceColor.needsUpdate=true;
 const chase=[30,180];let calm=0,parT=4,flapT=0;
 const place=(B,x,y,z,yaw,pitch,roll,sc,phase,amp,fold)=>{e.set(pitch,yaw,roll);q.setFromEuler(e);v.set(x,y,z);s.setScalar(sc);m4.compose(v,q,s);M.setMatrixAt(B.id,m4);F[B.id*3]=phase;F[B.id*3+1]=amp;F[B.id*3+2]=fold};
 const hide=B=>{m4.makeScale(0,0,0);M.setMatrixAt(B.id,m4)};
 const gullAt=(B,t,o)=>{const c=B.k===5?chase:CX[B.k],an=(t+B.j)*B.w+B.o;o[0]=c[0]+Math.cos(an)*B.r;o[2]=c[1]+Math.sin(an)*B.r;o[1]=B.y+Math.sin(t*.31+B.j)*3+Math.max(heightAt(o[0],o[2]),0)*.8};
 const pelAt=(B,t,o)=>{const leader=t*(.024+B.L*.003)*(B.L===1?-1:1)+B.L*2.1,back=B.idx*.024*(B.L===1?-1:1),an=leader-back,ex=main.rx*1.34+B.L*38,ez=main.rz*1.36+B.L*30,x=main.x+Math.cos(an)*ex,z=main.z+Math.sin(an)*ez;const wob=B.idx*2.4*(B.idx%2?1:-1);o[0]=x+Math.cos(an)*wob;o[2]=z+Math.sin(an)*wob;o[1]=Math.max(5+Math.sin(t*.4+an*5)*1.3,heightAt(o[0],o[2])+7)};
 const parAt=(B,t,o)=>{const u=t*B.sp*.32+B.f*2.6,cx=lerp(TOWN.x0+30,TOWN.x1-30,.5+.5*Math.sin(u)),cz=TOWN.streetZ+Math.sin(u*2.3)*26;o[0]=cx+Math.cos(t*B.sp*5+B.o)*B.r;o[2]=cz+Math.sin(t*B.sp*4+B.o)*B.r;o[1]=TOWN.y+11+Math.sin(t*.8+B.o)*3.5};
 function update(dt,t,pp,storm,night){const dayVis=1-smooth(.62,.95,night),wet=storm,flyVis=dayVis*(1-smooth(.55,.98,wet)*.7);calm+=dt;
  if(heightAt(pp.x,pp.z)<14){chase[0]=lerp(chase[0],pp.x,Math.min(1,dt*.35));chase[1]=lerp(chase[1],pp.z,Math.min(1,dt*.35))}
  for(const B of birds){if(B.kind==='beach')continue;const f=B.kind==='gull'?gullAt:B.kind==='pel'?pelAt:parAt;if(B.kind==='par'&&wet>.6){hide(B);continue}const thresh=(B.id*.618)%1;if(thresh>(B.kind==='pel'?dayVis:flyVis)){hide(B);continue}f(B,t,a);f(B,t+.15,b);const dx=b[0]-a[0],dz=b[2]-a[2],dy=b[1]-a[1],yaw=Math.atan2(dx,dz),pitch=-Math.atan2(dy,Math.hypot(dx,dz));let roll=0,amp,rate;if(B.kind==='gull'){roll=-Math.sign(B.w)*.42;const gl=Math.sin(t*.37+B.j);amp=gl>.3?.08:.55;rate=9.5;if(wet>.4)amp=.65}else if(B.kind==='pel'){const c=(t*.22+B.L+B.idx*.09)%1;amp=c<.28?.42:.03;rate=6}else{amp=.85;rate=21;roll=Math.sin(t*1.4+B.o)*.35}B.phase+=dt*rate;place(B,a[0],a[1],a[2],yaw,pitch,roll,B.size,B.phase,amp,0)}
  /* beach gulls wait, peck, and burst up when you run at them */
  let scared=0;for(const B of birds){if(B.kind!=='beach')continue;const pd=Math.hypot(pp.x-B.x,pp.z-B.z);if(B.st===0){if(pd<(wet>.5?4.5:7.5)&&dayVis>.02){B.st=1;B.tm=0;B.an=Math.atan2(B.x-pp.x,B.z-pp.z)+(R()-.5)*1.2;B.vx=Math.sin(B.an)*5;B.vz=Math.cos(B.an)*5;B.vy=5;scared++}else{B.pk-=dt;const peck=B.pk<.28&&wet<.5;if(B.pk<0)B.pk=2+R()*7;place(B,B.x,B.hy+.2*(wet>.5?.8:1),B.z,B.yaw,peck?.75:-.1,0,B.size,0,0,1);continue}}
   B.tm+=dt;B.phase+=dt*(B.st===1?14:10);if(B.st===1){const c=Math.min(1,B.tm/1.2);B.vy=lerp(B.vy,B.y>B.hy+13?0:7,dt*2);const a2=B.an+B.tm*.45;B.vx=lerp(B.vx,Math.sin(a2)*9,dt*1.2);B.vz=lerp(B.vz,Math.cos(a2)*9,dt*1.2);if(B.tm>9&&Math.hypot(pp.x-B.hx,pp.z-B.hz)>20)B.st=2;void c}else{const dx=B.hx-B.x,dz=B.hz-B.z,dy=B.hy+.2-B.y,d=Math.hypot(dx,dz);const sp=Math.min(9,1+d*.7);B.vx=lerp(B.vx,dx/(d||1)*sp,dt*2.5);B.vz=lerp(B.vz,dz/(d||1)*sp,dt*2.5);B.vy=lerp(B.vy,clamp(dy*(d<12?1.3:.3),-4,3),dt*3);if(d<.5&&Math.abs(dy)<.35){B.st=0;B.x=B.hx;B.z=B.hz;B.y=B.hy;B.yaw=Math.atan2(B.vx,B.vz);continue}}
   B.x+=B.vx*dt;B.y+=B.vy*dt;B.z+=B.vz*dt;const flo=groundAt(B.x,B.z,B.y+1)+.3;if(B.y<flo)B.y=flo;B.yaw=Math.atan2(B.vx,B.vz);place(B,B.x,B.y,B.z,B.yaw,-Math.atan2(B.vy,Math.hypot(B.vx,B.vz)),0,B.size*1.1,B.phase,.8,0)}
  if(scared&&calm>1.5){calm=0;audio.flap(Math.min(1,scared/3));audio.gull(1.5);setTimeout(()=>audio.gull(1),260)}
  M.instanceMatrix.needsUpdate=true;g.attributes.aF.needsUpdate=true;
  /* parrots squawk when you walk Seventh Avenue */
  parT-=dt;if(parT<0){parT=5+R()*11;if(wet<.5&&dayVis>.2&&pp.x>TOWN.x0-30&&pp.x<TOWN.x1+30&&pp.z>TOWN.z0-30&&pp.z<TOWN.z1+30)audio.parrot()}}
 return{update,get count(){return id},birds}}
