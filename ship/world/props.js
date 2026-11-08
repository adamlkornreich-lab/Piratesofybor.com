import {THREE,Kit,clamp,lerp,smooth,hash,rng,fbm,mergeGeos} from './util.js';
import * as T from './textures.js';
import {heightAt,slopeAt,TOWN,ISLANDS,shoreFrom,grassW} from './terrain.js';
const std=(o)=>new THREE.MeshStandardMaterial(o);
export function makeMats(){const M={};
 M.brick=std({map:T.brick(),bumpMap:T.brickBump(),bumpScale:1.4,roughness:.9});
 M.brickBuff=std({map:T.brick([186,146,98]),bumpMap:M.brick.bumpMap,bumpScale:1.4,roughness:.9});
 M.brickDark=std({map:T.brick([96,50,44]),bumpMap:M.brick.bumpMap,bumpScale:1.4,roughness:.9});
 M.stucco=std({map:T.stucco(),roughness:.95});M.stuccoBlue=std({map:T.stucco([96,142,150]),roughness:.95});M.stuccoRose=std({map:T.stucco([198,120,104]),roughness:.95});
 M.wood=std({map:T.wood(),roughness:.82});M.woodDark=std({map:T.wood([62,40,26],[34,21,14]),roughness:.78});M.deck=std({map:T.wood([134,100,66],[88,62,40]),roughness:.86});
 M.black=std({map:T.wood([30,30,36],[14,14,18]),roughness:.42,metalness:.2});
 M.iron=std({color:0x15161a,roughness:.55,metalness:.75});M.steel=std({color:0x8b9198,roughness:.3,metalness:.95});M.gold=std({color:0xe2ac47,roughness:.26,metalness:1});
 M.trim=std({color:0xe8dcc4,roughness:.75});M.roof=std({color:0x34302e,roughness:.92});M.stone=std({map:T.rockTex(),roughness:.96});M.cobble=std({map:T.cobble(),roughness:.72,bumpMap:null});M.side=std({roughness:.9,map:T.stucco([205,198,184])});
 M.bark=std({map:T.bark(),roughness:.95});M.sail=std({map:T.cloth(),side:THREE.DoubleSide,roughness:.95});M.torn=std({map:T.tornSail(),side:THREE.DoubleSide,roughness:.95,alphaTest:.5});M.blackSail=std({map:T.cloth([46,44,48]),side:THREE.DoubleSide,roughness:.9});
 M.flag=std({map:T.flag(),side:THREE.DoubleSide,roughness:.9});
 M.glass=std({color:0x20303a,roughness:.08,metalness:.85,emissive:0xffa64d,emissiveIntensity:.1});M.glassCool=std({color:0x2b4250,roughness:.06,metalness:.9,emissive:0x8fe6ff,emissiveIntensity:.1});
 {const si=T.shopInterior();M.shop=std({map:si,emissive:0xffffff,emissiveMap:si,emissiveIntensity:.55,roughness:.15,metalness:.1})}
 M.bulb=new THREE.MeshBasicMaterial({color:0xffd9a0});M.led=new THREE.MeshBasicMaterial({color:0x35f0d8});M.ledPink=new THREE.MeshBasicMaterial({color:0xff4fa3});
 M.awnRed=std({color:0x8e2b1f,roughness:.85,side:THREE.DoubleSide});M.awnGreen=std({color:0x1f5a44,roughness:.85,side:THREE.DoubleSide});M.awnBlack=std({color:0x17181c,roughness:.8,side:THREE.DoubleSide});
 M.chalkW=std({color:0xe9e2d0,roughness:.6});M.chalkB=std({color:0x232224,roughness:.45});M.green=std({color:0x4e9a3f,roughness:.9});M.sandDisc=std({color:0xe8d8a8,roughness:1});
 M.rope=std({color:0x4a3c2a,roughness:1});M.red=std({color:0xa32a1e,roughness:.7});M.cream=std({color:0xe6dcc0,roughness:.7});M.maroon=std({color:0x651c1c,roughness:.5});
 return M}
function archWindow(k,M,glass,x,y,z,w,h){k.box(glass,x,y,z+.03,w,h,.06);
 const fr=M.trim;k.box(fr,x,y-h/2-.07,z+.08,w+.4,.14,.26);k.box(fr,x-w/2-.07,y,z+.06,.14,h,.14);k.box(fr,x+w/2+.07,y,z+.06,.14,h,.14);k.box(fr,x,y,z+.06,.07,h,.08);k.box(fr,x,y+h*.15,z+.06,w,.07,.08);
 const a=new THREE.Shape();const r=w/2;a.absarc(0,0,r+.14,0,Math.PI,false);a.absarc(0,0,r,Math.PI,0,true);const ag=new THREE.ExtrudeGeometry(a,{depth:.16,bevelEnabled:false,curveSegments:10});k.geo(fr,ag,x,y+h/2,z-.02);
 const b=new THREE.Shape();b.absarc(0,0,r,0,Math.PI,false);k.geo(glass,new THREE.ShapeGeometry(b,10),x,y+h/2,z+.03);
 k.box(M.iron,x,y-h/2+.25,z+.24,w+.2,.05,.05);k.box(M.iron,x,y-h/2+.55,z+.24,w+.2,.05,.05)}
const pieceKinds={pawn:[[0,0],[.42,0],[.4,.12],[.24,.2],[.14,.55],[.24,.62],[.14,.7],[.24,.92],[.14,1.1],[0,1.14]],rook:[[0,0],[.46,0],[.42,.14],[.26,.26],[.22,.98],[.34,1.06],[.34,1.34],[0,1.34]],king:[[0,0],[.5,0],[.46,.14],[.26,.3],[.17,1.2],[.33,1.3],[.17,1.4],[.3,1.74],[.1,1.86],[0,1.86]],queen:[[0,0],[.48,0],[.44,.14],[.25,.3],[.15,1.1],[.3,1.2],[.15,1.3],[.3,1.6],[.2,1.68],[.08,1.72],[.1,1.78],[0,1.8]],bishop:[[0,0],[.44,0],[.4,.14],[.23,.28],[.14,.9],[.27,.98],[.14,1.06],[.26,1.3],[.08,1.54],[0,1.58]]};
export const lathe=(pts,seg=14)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg);
export function buildTown(ctx){const{root,M,colliders,platforms,portals,glowsN,lamps,fontsReady}=ctx,k=new Kit(),y0=TOWN.y,Z=TOWN.streetZ;
 /* street, sidewalks, tram rails */
 const L=TOWN.x1-TOWN.x0,cx=(TOWN.x0+TOWN.x1)/2;
 k.reset();k.box(M.cobble,cx,y0+.02,Z,L,.08,13,0,0,0,.42);for(const s of[-1,1]){k.box(M.side,cx,y0+.12,Z+s*8.3,L,.24,3.6,0,0,0,.5);k.box(M.trim,cx,y0+.13,Z+s*6.55,L,.26,.14)}
 for(const dz of[-1.8,-.4,.4,1.8])k.box(M.steel,cx,y0+.075,Z+dz,L,.05,.09);
 /* plaza */
 k.box(M.cobble,142,y0+.03,Z,56,.09,44,0,0,0,.3);
 const B=[
 {x:-104,side:-1,w:30,h:12,d:18,mat:M.brick,name:'The Tavern Hall',url:'tavern-hall/',neon:'#ffb347',awn:M.awnRed},
 {x:-66,side:-1,w:32,h:15,d:20,mat:M.brickDark,name:'Game Room',sub:'Arcade & Marketplace',url:'arcade/',neon:'#35f0d8',awn:M.awnBlack,led:1},
 {x:-22,side:-1,w:38,h:18,d:24,mat:M.stucco,name:'Movie Palace',sub:'Name That Reel',url:'play/',neon:'#ff4fa3',marquee:1},
 {x:24,side:-1,w:30,h:13,d:18,mat:M.brickBuff,name:'Tavern Tournament',url:'tournament/',neon:'#ffd24d',awn:M.awnGreen},
 {x:64,side:-1,w:30,h:14,d:18,mat:M.stuccoRose,name:'The Playhouse',url:'playhouse/',neon:'#a98bff',awn:M.awnRed},
 {x:104,side:-1,w:30,h:12,d:18,mat:M.brick,name:'Tavern Arcade',url:'tavern-arcade/',neon:'#60e0ff',awn:M.awnBlack},
 {x:-98,side:1,w:32,h:13,d:18,mat:M.stuccoBlue,name:'Tavern Games',url:'tavern/',neon:'#7dff8a',awn:M.awnGreen},
 {x:-56,side:1,w:36,h:16,d:22,mat:M.brick,name:"Gaspar's Grotto",sub:'The notorious pirate bar',url:'grotto-arcade/',neon:'#ff6a3d',awn:M.awnRed,big:1},
 {x:-9,side:1,w:28,h:13,d:18,mat:M.brickBuff,name:'The Crew',sub:'Family Room',url:'crew/',neon:'#ffd24d',awn:M.awnGreen},
 {x:36,side:1,w:30,h:14,d:18,mat:M.stucco,name:"Shere's Revenge",sub:'& Classics',url:'classics/',neon:'#ff4fa3',awn:M.awnBlack},
 {x:76,side:1,w:28,h:12,d:18,mat:M.brickDark,name:'Crew Games',url:'crew-games/',neon:'#35f0d8',awn:M.awnRed},
 {x:112,side:1,w:26,h:12,d:18,mat:M.stuccoRose,name:'The Pour-Off',sub:'21 and over',url:'pour-off/',neon:'#ff9de0',awn:M.awnBlack}];
 for(const b of B){const fz=Z+b.side*10.1,ry=b.side<0?0:Math.PI;k.place(b.x,y0,fz,ry);const w=b.w,h=b.h,d=b.d;
  k.box(b.mat,0,h/2,-d/2,w,h,d,0,0,0,.5);
  k.box(M.roof,0,h+.1,-d/2,w-.2,.2,d-.2);
  /* cornice and stepped parapet */
  k.box(M.trim,0,h+.05,.06,w+.5,.5,.4);k.box(M.trim,0,h-.7,.03,w+.2,.16,.25);k.box(b.mat,0,h+1,-.2,w*.4,1.5,.4,0,0,0,.5);k.box(M.trim,0,h+1.8,-.15,w*.42,.2,.55);k.box(b.mat,0,h+2.1,-.2,w*.18,.9,.4,0,0,0,.5);
  for(const s of[-1,1]){k.box(M.trim,s*(w/2-.15),h/2,.1,.5,h,.3);}
  /* upper arched windows */
  const flo=h>14?2:1,n=Math.floor(w/5.4);for(let f=0;f<flo;f++){const wy=7.3+f*4.6;for(let i=0;i<n;i++){const wx=(i-(n-1)/2)*(w-3)/n;archWindow(k,M,hash(i+b.x,f)>.3?M.glass:M.glassCool,wx,wy,0,1.9,2.6)}}
  /* ironwork balcony, the Ybor signature */
  k.box(M.iron,0,5.15,1,w-1.6,.14,2);for(let i=0;i<=Math.floor(w/.62);i++)k.box(M.iron,-w/2+1+i*.6,5.75,1.95,.035,1.1,.035);k.box(M.iron,0,6.3,1.95,w-1.6,.06,.08);k.box(M.iron,0,5.45,1.95,w-1.6,.04,.05);
  for(let i=0;i<=Math.floor(w/5);i++){const px=-w/2+1.3+i*(w-2.6)/Math.floor(w/5);k.cyl(M.iron,[px,0,1.92],[px,5.15,1.92],.07,.07,6)}
  /* storefront: glass, panelled door, kick plate */
  k.box(M.woodDark,0,.35,.1,w-1.2,.7,.2);k.box(M.woodDark,0,4.3,.1,w-1.2,.34,.2);
  const pn=Math.floor(w/6);for(let i=0;i<pn;i++){const px=(i-(pn-1)/2)*(w-1.6)/pn;if(Math.abs(px)<2.1)continue;k.geo(M.shop,new THREE.PlaneGeometry((w-1.6)/pn-.3,3.3),px,2.5,.22);k.box(M.woodDark,px-((w-1.6)/pn)/2,2.5,.14,.16,3.6,.2)}
  k.box(M.woodDark,0,1.75,.14,2.6,3.4,.14);k.box(M.glass,0,2.5,.23,1.9,1.5,.03);k.box(M.gold,.9,1.5,.28,.09,.5,.09);k.box(M.glass,0,3.85,.16,2.6,.4,.06);k.box(M.trim,0,3.55,.2,3.2,.14,.2);
  if(b.awn){const ag=new THREE.PlaneGeometry(w-2.4,1.9,1,1);k.geo(b.awn,ag,0,4.1,.95,0,1,.65,0)}
  if(b.marquee){k.box(M.iron,0,4.75,1.8,w*.68,.9,3.4);k.box(M.bulb,0,4.28,3.5,w*.68,.08,.08);k.box(M.bulb,0,5.2,3.5,w*.68,.08,.08);for(const s of[-1,1])k.box(M.bulb,s*w*.34,4.75,3.5,.08,.9,.08)}
  /* collider, portal */
  const bz0=fz-(b.side<0?d:0),bz1=fz+(b.side<0?0:d);colliders.push({x0:b.x-w/2,x1:b.x+w/2,z0:bz0,z1:bz1});
  portals.push({x:b.x,z:fz+(b.side<0?1.6:-1.6),name:b.name,url:b.url,r:4.6,side:b.side,icon:'door'});
  ctx.signs.push(b);
  glowsN.add(b.x,y0+3.4,fz+(b.side<0?.9:-.9),9,1,.62,.3,.5);
 }
 /* mural of the official poster on the wall you see when you walk up from the beach */
 ctx.mural=[-9,y0,Z+10.1+18+.08];
 /* lamps and string lights */
 const stringPts=[];let idx=0;for(let x=TOWN.x0+6;x<TOWN.x1-34;x+=22){for(const s of[-1,1]){const lz=Z+s*7.3,lx=x+(s>0?11:0);k.reset();k.cyl(M.iron,[lx,y0+.2,lz],[lx,y0+5,lz],.08,.05,8);k.cyl(M.iron,[lx,y0+.2,lz],[lx,y0+.9,lz],.16,.1,8);k.box(M.iron,lx,y0+5.05,lz,.5,.05,.05);k.geo(M.bulb,new THREE.SphereGeometry(.17,10,8),lx-.22,y0+4.86,lz);k.geo(M.bulb,new THREE.SphereGeometry(.17,10,8),lx+.22,y0+4.86,lz);glowsN.add(lx,y0+4.86,lz,4.2,1,.72,.42,.8);lamps.push([lx,y0+4.4,lz]);colliders.push({cx:lx,cz:lz,r:.32})}
  const a=[x,y0+7.6,Z-10],b=[x+11,y0+7.2,Z+10];for(let i=0;i<=12;i++){const t=i/12,px=lerp(a[0],b[0],t),py=lerp(a[1],b[1],t)-Math.sin(t*Math.PI)*1.5,pz=lerp(a[2],b[2],t);stringPts.push(new THREE.Vector3(px,py,pz));glowsN.add(px,py,pz,.9,1,.82,.5,.75)}idx++}
 const sb=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,6,5),M.bulb,stringPts.length);const mm=new THREE.Matrix4();stringPts.forEach((p,i)=>{mm.makeTranslation(p.x,p.y,p.z);sb.setMatrixAt(i,mm)});root.add(sb);
 /* giant chess */
 k.reset();const cx0=132,cz0=46,st=2.4;for(let i=0;i<8;i++)for(let j=0;j<8;j++)k.box((i+j)%2?M.chalkB:M.chalkW,cx0+i*st,y0+.13,cz0+j*st,st,.12,st);
 k.box(M.woodDark,cx0+3.5*st,y0+.1,cz0+3.5*st,st*8+.6,.1,st*8+.6);
 const order=['rook','bishop','queen','king','bishop','rook'];const pl=[[0,0,'rook',0],[3,0,'queen',0],[4,0,'king',0],[6,0,'bishop',0],[2,1,'pawn',0],[3,3,'pawn',0],[5,1,'pawn',0],[7,1,'pawn',0],[0,7,'rook',1],[3,7,'queen',1],[4,7,'king',1],[1,7,'bishop',1],[2,6,'pawn',1],[4,4,'pawn',1],[6,6,'pawn',1]];
 for(const[i,j,t,c]of pl){k.geo(c?M.chalkB:M.chalkW,lathe(pieceKinds[t]),cx0+i*st,y0+.19,cz0+j*st,0,1.1);colliders.push({cx:cx0+i*st,cz:cz0+j*st,r:.55})}
 portals.push({x:cx0-3,z:cz0+3.5*st,name:'Chess & Checkers',url:'game-deck/',r:5,icon:'chess'});
 /* The App: treasure chest with a floating holo phone */
 const ax=118,az=Z+16;k.box(M.woodDark,ax,y0+.75,az,3,1.2,1.9);k.box(M.wood,ax,y0+1.6,az-.95,3,1.3,.14,0,-.5,0);for(const s of[-1,1])k.box(M.gold,ax+s*1.1,y0+.75,az,.2,1.3,2);k.box(M.gold,ax,y0+.95,az+.96,.46,.5,.06);colliders.push({cx:ax,cz:az,r:1.9});
 for(let i=0;i<24;i++){k.cyl(M.gold,[ax+(hash(i)-.5)*5,y0+.2,az+(hash(i,3)-.5)*4+1],[ax+(hash(i)-.5)*5,y0+.24+hash(i,7)*.1,az+(hash(i,3)-.5)*4+1],.18,.18,10)}
 portals.push({x:ax,z:az+2.3,name:'The App',url:'app/',r:4.5,icon:'app'});ctx.holo=[ax,y0+2.8,az];
 /* tram */
 ctx.buildTram=()=>{const t=new Kit(),g=new THREE.Group();t.box(M.maroon,0,1.6,0,10.5,1.5,2.5);t.box(M.cream,0,3,0,10.5,1.3,2.5);t.box(M.maroon,0,3.75,0,11,.18,2.8);for(let i=-2;i<=2;i++)for(const s of[-1,1])t.box(M.glass,i*2,3,s*1.27,1.6,1,.05);for(const x of[-5.27,5.27])t.box(M.glass,x,3,0,.05,1,1.9);t.box(M.gold,0,2.4,1.28,10.5,.08,.03);t.box(M.gold,0,2.4,-1.28,10.5,.08,.03);for(const x of[-3,3])for(const s of[-.8,.8])t.cyl(M.iron,[x,.45,s-.08],[x,.45,s+.08],.45,.45,14);t.box(M.iron,0,.85,0,9,.3,1.6);t.cyl(M.iron,[0,3.85,0],[2,5.4,0],.04,.04,5);t.geo(M.bulb,new THREE.SphereGeometry(.18,8,6),5.3,3,0);t.build(g);return g};
 k.build(root);
}
/* ---------- ships ---------- */
export function hullGeo(L,B,H,{t0=0,t1=1,bow=.32,keel=.15,sheer=.2}={}){const ST=28,R=10,P=[],U=[],I=[];const W=t=>{const f=t<bow?Math.pow(Math.sin(t/bow*Math.PI/2),.8):1-.26*Math.pow((t-bow)/(1-bow),2.2);return B/2*Math.max(f,.01)},TOP=t=>H+H*sheer*(Math.pow(1-t,3)*.9+Math.pow(t,3)*.55),K=t=>keel*H*(Math.pow(1-t,6)*3+Math.pow(t,5)*.7);
 const n=ST+1;for(let i=0;i<n;i++){const t=lerp(t0,t1,i/ST),x=(t-.5)*L,w=W(t),tp=TOP(t),kl=K(t);for(let s=0;s<=2*R;s++){const a=(s-R)/R,sa=Math.abs(a),y=kl+(tp-kl)*Math.pow(sa,1.3),z=Math.sign(a)*w*Math.pow(Math.sin(sa*Math.PI/2),.62);P.push(x,y,z);U.push(x*.55,y*.55)}}
 const m=2*R+1;for(let i=0;i<ST;i++)for(let s=0;s<2*R;s++){const a=i*m+s,b=a+1,c=a+m,d=c+1;I.push(a,b,c,b,d,c)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();
 const dp=[],du=[],di=[];for(let i=0;i<n;i++){const t=lerp(t0,t1,i/ST),x=(t-.5)*L,w=W(t)*.97,tp=TOP(t)*.86;dp.push(x,tp,-w,x,tp,w);du.push(x*.5,-w*.5,x*.5,w*.5)}for(let i=0;i<ST;i++){const a=i*2;di.push(a,a+1,a+2,a+1,a+3,a+2)}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(dp,3));dg.setAttribute('uv',new THREE.Float32BufferAttribute(du,2));dg.setIndex(di);dg.computeVertexNormals();
 return{g,dg,W,TOP}}
export function sailGeo(w,h,bulge=1.1,taper=.82){const g=new THREE.PlaneGeometry(1,1,12,10),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i),t=v+.5,ww=lerp(taper,1,1-t)*w;p.setXYZ(i,u*ww,v*h,Math.sin((u+.5)*Math.PI)*Math.sin(t*Math.PI)*bulge)}g.computeVertexNormals();return g}
export function galleon(M,{L=36,B=9.5,H=6,sail=M.sail,hull=M.wood,flag=true}={}){const k=new Kit(),g=new THREE.Group();const h=hullGeo(L,B,H);k.geo(hull,h.g);k.geo(M.deck,h.dg);const dk=H*.92;
 k.box(hull,L*.36,dk+1.6,0,L*.3,3.2,B*.84,0,0,0,.55);k.box(M.deck,L*.36,dk+3.25,0,L*.31,.15,B*.88);k.box(hull,L*.45,dk+4.3,0,L*.13,2,B*.7,0,0,0,.55);k.box(M.deck,L*.45,dk+5.35,0,L*.14,.15,B*.74);
 k.box(hull,-L*.3,dk+1,0,L*.16,2,B*.5,0,0,0,.55);k.box(M.deck,-L*.3,dk+2.05,0,L*.17,.14,B*.54);
 for(let i=0;i<4;i++)k.box(M.glass,L*.5+.1,dk+1+i*.0,-B*.3+i*B*.2,.1,1.1,.9);for(let i=-3;i<=3;i++)for(const s of[-1,1]){const x=i*L*.09-L*.02;k.box(M.iron,x,H*.62,s*B*.5,1,.8,.14);k.cyl(M.iron,[x,H*.62,s*B*.45],[x,H*.62,s*(B*.5+1)],.17,.13,8)}
 k.box(M.gold,L*.05,H*.78,B*.49,L*.7,.08,.04);k.box(M.gold,L*.05,H*.78,-B*.49,L*.7,.08,.04);
 k.cyl(M.woodDark,[-L/2+.6,dk+.7,0],[-L/2-8,dk+5.5,0],.32,.1,8);
 const masts=[[-L*.2,26,8],[L*.04,33,10],[L*.28,23,7]];for(const[x,mh,yw]of masts){k.cyl(M.woodDark,[x,H*.7,0],[x,H+mh,0],.42,.14,10);for(const f of[.5,.82]){const yy=H+mh*f,yl=yw*(1.55-f)*1.25;k.cyl(M.woodDark,[x,yy,-yl],[x,yy,yl],.1,.1,6);k.geo(sail,sailGeo(yl*1.82,mh*(f>.6?.28:.36)),x+.3,yy-mh*(f>.6?.14:.18),0,Math.PI/2,1);k.box(M.woodDark,x,yy+1.3,0,.1,.1,.1)}
  for(const s of[-1,1]){for(let r=0;r<3;r++)k.cyl(M.rope,[x-1.4+r*1.4,dk+.3,s*B*.48],[x,H+mh*.8,s*.2],.025,.025,3)}}
 if(flag)k.geo(M.flag,new THREE.PlaneGeometry(3.6,2.3),L*.04+1.9,H+33.2,0);k.build(g);return g}
export function sloop(M){const k=new Kit(),g=new THREE.Group();const h=hullGeo(15,4.4,1.8,{bow:.42,sheer:.14,keel:.1});k.geo(M.black,h.g);k.geo(M.deck,h.dg);
 k.box(M.led,0,1.42,2.17,12,.05,.03);k.box(M.led,0,1.42,-2.17,12,.05,.03);k.box(M.woodDark,.5,1.75,0,5,.55,2.5,0,0,0,.6);k.box(M.black,.2,2.15,0,3.6,.34,2.1);for(const s of[-1,1])k.box(M.glassCool,.2,1.8,s*1.26,3.4,.26,.03);
 k.cyl(M.steel,[-1.4,1.6,0],[-1.4,15,0],.09,.05,8);k.cyl(M.steel,[-1.2,3.2,0],[5.8,3.2,0],.05,.05,6);
 const s=new THREE.BufferGeometry();s.setAttribute('position',new THREE.Float32BufferAttribute([-1.2,3.3,0,5.6,3.3,.5,-1.2,14.7,0,-1.2,3.3,0,-7,2,0,-1.45,12.8,0],3));s.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,3,0,0,5,0,0,2,0,0,4],2));s.computeVertexNormals();k.geo(M.blackSail,s);
 k.cyl(M.steel,[4.7,1.9,-1],[4.7,3.1,-1],.04,.04,5);k.geo(M.gold,new THREE.TorusGeometry(.42,.04,6,14),4.7,3.2,-.9,0,1);k.geo(M.flag,new THREE.PlaneGeometry(1.5,.95),-.65,14.5,0);k.box(M.bulb,7.2,1.8,0,.1,.1,.2);k.build(g);return g}
export function buildWreck(ctx){const{root,M,colliders}=ctx,sh=shoreFrom(-30,120,0,1);const sz=sh?sh[1]-13:195,wx=-34,gy=heightAt(wx,sz);const g=new THREE.Group();g.position.set(wx,gy-2.5,sz);g.rotation.y=.22;root.add(g);
 const L=44,B=11.5,H=7.2,A=new THREE.Group(),C=new THREE.Group();A.position.set(-4.5,0,0);A.rotation.set(.1,.08,.07);C.position.set(6,-.3,1.5);C.rotation.set(-.16,-.18,-.05);g.add(A,C);
 let k=new Kit(),h=hullGeo(L,B,H,{t0:0,t1:.47});k.geo(M.wood,h.g);k.geo(M.deck,h.dg);
 k.cyl(M.woodDark,[-L/2+1,H+1,0],[-L/2-9,H+6,0],.3,.08,8);k.cyl(M.woodDark,[-9,H*.7,0],[-10,H+18,.4],.42,.25,10);k.cyl(M.woodDark,[-10,H+18,.4],[-9.6,H+19.2,1.4],.24,.04,6);k.cyl(M.woodDark,[-10,H+13,-5.5],[-10,H+13,5.5],.12,.12,6);k.geo(M.torn,sailGeo(11,9,1.2),-9.7,H+8.5,0,Math.PI/2);
 for(let i=-3;i<2;i++)for(const s of[-1,1]){const x=i*4-2;k.box(M.iron,x,H*.62,s*B*.48,1,.8,.14);k.cyl(M.iron,[x,H*.62,s*B*.45],[x,H*.62,s*B*.45+s*1.3],.17,.13,8)}
 for(const[x,s]of[[-.4,1],[.8,1],[2,1]]){for(let a=0;a<7;a++){const t0=a/7*Math.PI,t1=(a+1)/7*Math.PI,r=B*.47;k.cyl(M.woodDark,[x,H*.92-Math.sin(t0)*H*.8,Math.cos(t0)*r],[x,H*.92-Math.sin(t1)*H*.8,Math.cos(t1)*r],.16,.14,5)}}
 for(const[x,yy,z,ry,rz]of[[1,H+.5,3,.4,.4],[-1.5,H+.6,-3.4,-.5,-.3]])k.box(M.deck,x,yy,z,5,.14,.5,ry,0,rz,.6);
 k.build(A);
 k=new Kit();h=hullGeo(L,B,H,{t0:.5,t1:1});k.geo(M.wood,h.g);k.geo(M.deck,h.dg);const dk=H*.92;
 k.box(M.wood,L*.32,dk+2,0,L*.3,4,B*.82,0,0,0,.55);k.box(M.deck,L*.32,dk+4.05,0,L*.31,.15,B*.86);k.box(M.wood,L*.42,dk+5.4,0,L*.14,2.5,B*.62,0,0,0,.55);k.box(M.deck,L*.42,dk+6.7,0,L*.15,.15,B*.66);
 for(let i=0;i<5;i++){k.box(M.glass,L*.2+i*2.3,dk+2,B*.42,1.4,1.7,.05);k.box(M.trim,L*.2+i*2.3,dk+2,B*.415,1.7,2,.04)}
 k.cyl(M.woodDark,[3,H*.7,0],[4,H+27,-.3],.45,.2,10);k.cyl(M.woodDark,[4,H+20,-6.5],[4,H+20,6.5],.12,.12,6);k.geo(M.torn,sailGeo(12.6,11,1.3),4.2,H+14.2,0,Math.PI/2);k.geo(M.flag,new THREE.PlaneGeometry(4,2.5),6.3,H+26,-.3);
 for(const x of[-.2,1.1,2.4]){for(let a=0;a<7;a++){const t0=a/7*Math.PI,t1=(a+1)/7*Math.PI,r=B*.47;k.cyl(M.woodDark,[x,H*.92-Math.sin(t0)*H*.8,Math.cos(t0)*r],[x,H*.92-Math.sin(t1)*H*.8,Math.cos(t1)*r],.16,.14,5)}}
 for(let i=0;i<4;i++)for(const s of[-1,1]){const x=i*4+1;k.box(M.iron,x,H*.62,s*B*.48,1,.8,.14);k.cyl(M.iron,[x,H*.62,s*B*.45],[x,H*.62,s*B*.45+s*1.3],.17,.13,8)}
 k.build(C);
 const c=Math.cos(g.rotation.y),s=Math.sin(g.rotation.y);for(let i=-23;i<=26;i+=3.5){if(Math.abs(i)<2.2)continue;const f=1-.5*Math.pow(Math.abs(i+2)/28,2);colliders.push({cx:wx+i*c,cz:sz-i*s,r:5.6*f})}
 k=new Kit();for(const[x,z,ry]of[[0,6,.5],[-3,10,1.4],[5,13,2.2],[-6,4,2.9]])k.box(M.deck,wx+x,heightAt(wx+x,sz+z)+.1,sz+z,4.6,.14,.5,ry,0,.05,.6);
 for(const[x,z]of[[6,9],[8,8],[7.2,10.5]]){const y=heightAt(wx+x,sz+z);k.cyl(M.wood,[wx+x,y,sz+z],[wx+x,y+1.4,sz+z],.55,.55,14);for(const d of[.25,1.1])k.cyl(M.iron,[wx+x,y+d,sz+z],[wx+x,y+d+.09,sz+z],.57,.57,14);colliders.push({cx:wx+x,cz:sz+z,r:.7})}k.build(root);
 ctx.wreckAt=[wx,sz];return g}
export function buildDock(ctx){const{root,M,platforms,colliders,glowsN,portals}=ctx,sh=shoreFrom(200,76,1,0),sx=sh?sh[0]-8:260,z=76,k=new Kit(),LEN=70,dy=2.6;
 k.box(M.deck,sx+LEN/2,dy-.1,z,LEN,.2,4.6,0,0,0,.45);platforms.push({x0:sx-4,x1:sx+LEN,z0:z-2.3,z1:z+2.3,y:dy});
 k.box(M.deck,sx+LEN-5,dy-.1,z,10,.2,26,0,0,0,.45);platforms.push({x0:sx+LEN-10,x1:sx+LEN,z0:z-13,z1:z+13,y:dy});
 for(let x=0;x<LEN;x+=7)for(const s of[-1,1]){k.cyl(M.woodDark,[sx+x,-6,z+s*2.5],[sx+x,dy+.9,z+s*2.5],.22,.18,8);k.box(M.led,sx+x+3.5,dy-.2,z+s*2.34,7,.05,.05);glowsN.add(sx+x,dy+1.1,z+s*2.5,1.2,.3,.95,.85,.7)}
 for(const s of[-1,1])k.box(M.led,sx+LEN-5,dy-.2,z+s*13,10,.05,.05);for(const[dx,dz]of[[-10,-13],[0,-13],[-10,13],[0,13]])k.cyl(M.woodDark,[sx+LEN+dx,-6,z+dz],[sx+LEN+dx,dy+.9,z+dz],.26,.22,8);
 /* a small glass harbor office: the modern side of the port */
 const ox=sx+LEN-5,oz=z-8;k.box(M.glassCool,ox,dy+1.5,oz,7,3,5);k.box(M.roof,ox,dy+3.1,oz,8,.2,6);k.box(M.led,ox,dy+3,oz+3,8,.06,.04);colliders.push({x0:ox-3.5,x1:ox+3.5,z0:oz-2.5,z1:oz+2.5});
 k.build(root);
 return{boatAt:[sx+LEN+7,z+6],sx,LEN,z,dy}}
export function buildFort(ctx){const{root,M,colliders,portals,glowsN}=ctx,fx=-205,fz=8,k=new Kit(),gy=heightAt(fx,fz),Rf=19;
 for(let i=0;i<16;i++){const a=i/16*6.283,b=(i+1)/16*6.283;if(i===3)continue;const ax=fx+Math.cos(a)*Rf,az=fz+Math.sin(a)*Rf,bx=fx+Math.cos(b)*Rf,bz=fz+Math.sin(b)*Rf,mx=(ax+bx)/2,mz=(az+bz)/2,y=heightAt(mx,mz),ry=-Math.atan2(bz-az,bx-ax),l=Math.hypot(bx-ax,bz-az)+.6;k.box(M.stone,mx,y+1.2,mz,l,6,2.4,ry,0,0,.3);if(i%2)k.box(M.stone,mx,y+4.8,mz,l*.5,1.2,2.4,ry,0,0,.3);colliders.push({cx:mx,cz:mz,r:3.6})}
 for(const a of[2.5,3.1,3.7,4.3]){const x=fx+Math.cos(a)*(Rf-4),z=fz+Math.sin(a)*(Rf-4),y=heightAt(x,z),ox=Math.cos(a)*3.2,oz=Math.sin(a)*3.2;k.box(M.woodDark,x,y+.5,z,1.8,.7,1.8,-a);k.cyl(M.iron,[x-ox*.3,y+1.05,z-oz*.3],[x+ox,y+1.35,z+oz],.26,.17,12);colliders.push({cx:x,cz:z,r:1.1})}
 k.cyl(M.woodDark,[fx,gy,fz],[fx,gy+14,fz],.16,.09,8);k.geo(M.flag,new THREE.PlaneGeometry(3.4,2.2),fx+1.75,gy+12.8,fz);k.build(root);
 portals.push({x:fx-3,z:fz,name:'Broadside 3D',url:'broadside/',r:6,icon:'cannon'});ctx.fortAt=[fx,fz]}
export function buildLighthouse(ctx){const{root,M,colliders,portals,glowsN}=ctx,x=26,z=-135,y=heightAt(x,z),k=new Kit();const seg=[[3.4,2.2,0,M.cream],[2.2,0,0,null]];
 const H=20;for(let i=0;i<5;i++){const t0=i/5,t1=(i+1)/5,r0=lerp(3.6,2.1,t0),r1=lerp(3.6,2.1,t1);k.cyl(i%2?M.cream:M.red,[x,y+t0*H,z],[x,y+t1*H,z],r0,r1,20)}
 k.cyl(M.iron,[x,y+H,z],[x,y+H+.2,z],2.9,2.9,20);k.cyl(M.glassCool,[x,y+H+.2,z],[x,y+H+2.9,z],1.6,1.6,14);k.cyl(M.red,[x,y+H+2.9,z],[x,y+H+4.6,z],1.9,.1,14);k.geo(M.bulb,new THREE.SphereGeometry(.7,12,8),x,y+H+1.5,z);for(let i=0;i<16;i++){const a=i/16*6.283;k.cyl(M.iron,[x+Math.cos(a)*2.8,y+H+.2,z+Math.sin(a)*2.8],[x+Math.cos(a)*2.8,y+H+1.3,z+Math.sin(a)*2.8],.03,.03,4)}
 k.box(M.woodDark,x,y+1.2,z+3.7,1.6,2.6,.2);k.build(root);colliders.push({cx:x,cz:z,r:4});portals.push({x,z:z+6,name:'Pirate Trivia',url:'trivia/',r:5,icon:'bell',label:'Trivia Lighthouse'});glowsN.add(x,y+H+1.5,z,20,1,.88,.6,.95);
 const bm=new THREE.Group();bm.position.set(x,y+H+1.5,z);const mat=new THREE.MeshBasicMaterial({color:0xffe6b0,transparent:true,opacity:.085,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});for(const s of[0,Math.PI]){const c=new THREE.Mesh(new THREE.ConeGeometry(16,240,16,1,true),mat);c.rotation.z=Math.PI/2;c.position.x=120;const p=new THREE.Group();p.rotation.y=s;p.add(c);bm.add(p)}root.add(bm);ctx.beam=bm;ctx.beamMat=mat}
export function buildGolf(ctx){const{root,M,portals,colliders}=ctx,x=150,z=-82,k=new Kit();const disc=(mat,cx,cz,r,ps=1)=>{const g=new THREE.CircleGeometry(1,48,0,6.2832);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),rr=Math.hypot(p.getX(i),p.getZ(i)),wob=1+.16*Math.sin(a*3+cx)+.08*Math.sin(a*7+cz),X=cx+p.getX(i)*r*wob*ps,Z=cz+p.getZ(i)*r*wob;p.setXYZ(i,X,heightAt(X,Z)+.07,Z)}g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;root.add(m)};
 disc(new THREE.MeshStandardMaterial({color:0x3f8f3a,roughness:.75}),x,z,17,1.2);disc(M.sandDisc,x+21,z+12,6);disc(M.sandDisc,x-23,z-8,5);
 const gy=heightAt(x,z);k.cyl(M.chalkW,[x+2,gy,z],[x+2,gy+3.6,z],.03,.03,6);const fl=new THREE.Shape();fl.moveTo(0,0);fl.lineTo(1.4,-.35);fl.lineTo(0,-.7);k.geo(M.red,new THREE.ShapeGeometry(fl),x+2,gy+3.55,z);k.cyl(M.chalkB,[x+2,gy+.02,z],[x+2,gy+.1,z],.12,.12,14);
 k.geo(M.chalkW,new THREE.SphereGeometry(.09,10,8),x+3.4,gy+.14,z+1.1);k.build(root);portals.push({x:x-3,z:z+5,name:'Andy Seavy Golf Club',url:'golf/',r:7,icon:'golf'})}
export function palmAssets(M){const N=7,SEG=9,bendK=1.15,PP=[],UU=[],II=[];for(let i=0;i<=N;i++){const t=i/N,r=lerp(.4,.2,Math.pow(t,.7))+(i===0?.1:0),cx=bendK*t*t;for(let s=0;s<=SEG;s++){const a=s/SEG*6.2832;PP.push(cx+Math.cos(a)*r,t*9,Math.sin(a)*r);UU.push(s/SEG*2,t*5)}}for(let i=0;i<N;i++)for(let s=0;s<SEG;s++){const a=i*(SEG+1)+s,b=a+1,c=a+SEG+1,d=c+1;II.push(a,c,b,b,c,d)}const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(PP,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(UU,2));tg.setIndex(II);tg.computeVertexNormals();const trunk=mergeGeos([tg]);
 const Fs=[];const topX=bendK;for(let f=0;f<11;f++){const a=f/11*6.283+hash(f)*.4,up=f%2?.62:.3,L=3.9+hash(f,5)*1.4,w=1.35,seg=7,p=[],u=[],ix=[];for(let s=0;s<=seg;s++){const t=s/seg,dx=t*L,dy=up*L*t-1.25*L*t*t*.72;const sag=Math.sin(t*3.14)*.18;for(const side of[-1,1]){const lat=side*w*(.25+.75*Math.sin(Math.min(1,t*1.1+.06)*Math.PI));p.push(Math.cos(a)*dx-Math.sin(a)*lat,dy-Math.abs(lat)*.25-sag,Math.sin(a)*dx+Math.cos(a)*lat);u.push(side<0?0:1,t)}}for(let s=0;s<seg;s++){const b=s*2;ix.push(b,b+2,b+1,b+1,b+2,b+3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setIndex(ix);g.computeVertexNormals();g.translate(topX,9,0);Fs.push(g)}
 const fronds=mergeGeos(Fs);const nrm=fronds.attributes.normal;for(let i=0;i<nrm.count;i++)nrm.setXYZ(i,nrm.getX(i)*.35,Math.abs(nrm.getY(i))+.75,nrm.getZ(i)*.35);
 return{trunk,fronds}}
export function windMat(base,uni,amp=.08,hk=1){base.onBeforeCompile=s=>{s.uniforms.uWind=uni;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float uWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
 {vec4 ip=instanceMatrix*vec4(0.,0.,0.,1.);float ph=ip.x*.13+ip.z*.17;float k=${hk.toFixed(1)}*max(position.y,0.);float q=k*k*${amp.toFixed(3)};
 transformed.x+=q*sin(uWind*1.3+ph+position.x)*1.; transformed.z+=q*cos(uWind*1.05+ph*1.3+position.z)*.8; transformed.y+=q*.3*sin(uWind*2.1+ph+position.x*2.);}`)};return base}
export function scatter(ctx,counts){const{root,M,colliders,uWind}=ctx,R=rng(2026);const pal=palmAssets(M);
 const frondMat=windMat(new THREE.MeshStandardMaterial({map:T.frond(),alphaTest:.45,side:THREE.DoubleSide,roughness:.72}),uWind,.0016);frondMat.userData.noCast=false;
 const fd=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:frondMat.map,alphaTest:.45,side:THREE.DoubleSide});
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),pp=new THREE.Vector3(),sc=new THREE.Vector3(),col=new THREE.Color();
 const clear=(x,z,r=3)=>{for(const c of colliders){if(c.r!==undefined){if(Math.hypot(c.cx-x,c.cz-z)<c.r+r)return false}else if(x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r)return false}for(const p of ctx.platforms)if(x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r)return false;return true};
 const inStreet=(x,z)=>x>TOWN.x0-3&&x<TOWN.x1+3&&z>TOWN.z0+6&&z<TOWN.z1-6;
 for(const I of ISLANDS){const [x0,x1,z0,z1]=I.ext,want=Math.round((I.id==='main'?counts.palms:counts.palms*.3)),list=[];let guard=0;
  while(list.length<want&&guard++<want*60){const x=lerp(x0,x1,R()),z=lerp(z0,z1,R()),h=heightAt(x,z);if(h<1.3||h>(I.id==='main'?22:18)||slopeAt(x,z)>.48||inStreet(x,z)||!clear(x,z,2.6))continue;if(fbm(x*.02+3,z*.02,2)<.42&&h>4)continue;list.push([x,h,z])}
  /* street palms */
  if(I.id==='main'){for(let x=TOWN.x0+16;x<TOWN.x1-40;x+=44)list.push([x,TOWN.y,TOWN.streetZ+9.2],[x+22,TOWN.y,TOWN.streetZ-9.2])}
  const tr=new THREE.InstancedMesh(pal.trunk,M.bark,list.length),fr=new THREE.InstancedMesh(pal.fronds,frondMat,list.length);tr.castShadow=fr.castShadow=true;tr.receiveShadow=true;fr.customDepthMaterial=fd;
  list.forEach((p,i)=>{const s=.85+R()*.75;e.set(0,R()*6.283,0);q.setFromEuler(e);pp.set(p[0],p[1]-.2,p[2]);sc.set(s,s*(.85+R()*.45),s);m4.compose(pp,q,sc);tr.setMatrixAt(i,m4);fr.setMatrixAt(i,m4);col.setHSL(.26+R()*.05,.5+R()*.2,.8+R()*.2);fr.setColorAt(i,col);colliders.push({cx:p[0],cz:p[2],r:.5})});root.add(tr,fr)}
 /* rocks */
 const rg=new THREE.IcosahedronGeometry(1,2),rp=rg.attributes.position;for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),n=1+(fbm(x*2+y,z*2-y,3)-.5)*.75;rp.setXYZ(i,x*n,y*n*.72,z*n)}rg.computeVertexNormals();
 const rl=[];let g=0;while(rl.length<counts.rocks&&g++<counts.rocks*90){const I=ISLANDS[R()*4|0],[x0,x1,z0,z1]=I.ext,x=lerp(x0,x1,R()),z=lerp(z0,z1,R()),h=heightAt(x,z);if(h<-1.6||inStreet(x,z)||!clear(x,z,4))continue;const sl=slopeAt(x,z);if(!(sl>.5||(h<.9&&R()<.25)))continue;rl.push([x,h,z,.5+R()*R()*3.4])}
 const rocks=new THREE.InstancedMesh(rg,M.stone,rl.length);rocks.castShadow=rocks.receiveShadow=true;rl.forEach((r,i)=>{e.set(R()*.5,R()*6,R()*.5);q.setFromEuler(e);pp.set(r[0],r[1]-.1,r[2]);sc.setScalar(r[3]);m4.compose(pp,q,sc);rocks.setMatrixAt(i,m4);col.setScalar(.8+R()*.4);rocks.setColorAt(i,col);if(r[3]>1.1)colliders.push({cx:r[0],cz:r[2],r:r[3]*.8})});root.add(rocks);
 /* grass, sea oats, bushes in chunks */
 const tq=(w,h)=>{const P=[];for(let i=0;i<3;i++){const g=new THREE.PlaneGeometry(w,h);g.translate(0,h/2,0);g.rotateY(i*1.047);P.push(g)}const m=mergeGeos(P),n=m.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);return m};
 const gGeo=tq(1.25,.82),oGeo=tq(1.4,1.55),bGeo=(()=>{const P=[];for(let i=0;i<6;i++){const g=new THREE.PlaneGeometry(2,2);g.rotateY(i*.52);g.rotateX(i%2?.55:-.45);g.translate(0,.95,0);P.push(g)}const m=mergeGeos(P),n=m.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,n.getX(i)*.2,1,n.getZ(i)*.2);return m})();
 const mk=(tx,a)=>{const mt=windMat(new THREE.MeshStandardMaterial({map:tx,alphaTest:.42,side:THREE.DoubleSide,roughness:.9}),uWind,a);return mt};
 const gMat=mk(T.tuft(),.1),oMat=mk(T.tuft(true),.09),bMat=mk(T.leaves(),.018);
 const CH=48,buckets=new Map();const put=(kind,x,y,z,s)=>{const key=kind+':'+Math.floor(x/CH)+':'+Math.floor(z/CH);if(!buckets.has(key))buckets.set(key,{kind,cx:(Math.floor(x/CH)+.5)*CH,cz:(Math.floor(z/CH)+.5)*CH,y,items:[]});buckets.get(key).items.push([x,y,z,s])};
 for(const I of ISLANDS){const [x0,x1,z0,z1]=I.ext,area=(x1-x0)*(z1-z0),n=counts.grass*(I.id==='main'?1:.3);for(let i=0;i<n;i++){const x=lerp(x0,x1,R()),z=lerp(z0,z1,R()),h=heightAt(x,z);if(h<1.5||inStreet(x,z)||!clear(x,z,.2))continue;const sl=slopeAt(x,z);if(h<3.4&&grassW(x,z,h,sl)<.5){if(R()<.11&&h>1.7)put('o',x,h,z,.8+R()*.7);continue}const w=grassW(x,z,h,sl);if(w<.45)continue;if(R()<.018)put('b',x,h,z,.7+R()*1.1);else put('g',x,h,z,.75+R()*.7)}}
 ctx.chunks=[];for(const b of buckets.values()){const G=b.kind==='g'?gGeo:b.kind==='o'?oGeo:bGeo,Mt=b.kind==='g'?gMat:b.kind==='o'?oMat:bMat,im=new THREE.InstancedMesh(G,Mt,b.items.length);b.items.forEach((t,i)=>{e.set(0,R()*6.28,0);q.setFromEuler(e);pp.set(t[0],t[1]-.03,t[2]);sc.setScalar(t[3]);m4.compose(pp,q,sc);im.setMatrixAt(i,m4);const v=.72+R()*.42;col.setRGB(v*(.9+R()*.25),v,v*.85);im.setColorAt(i,col)});im.receiveShadow=false;im.castShadow=b.kind==='b';root.add(im);ctx.chunks.push({m:im,x:b.cx,z:b.cz,kind:b.kind})}
}
