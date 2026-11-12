import {THREE,lerp} from './util.js';
const S=(o)=>new THREE.MeshStandardMaterial(o);
function add(p,g,m,x=0,y=0,z=0,sx=1,sy=sx,sz=sx,cast=true){const e=new THREE.Mesh(g,m);e.position.set(x,y,z);e.scale.set(sx,sy,sz);e.castShadow=cast;p.add(e);return e}
const sph=new THREE.SphereGeometry(1,16,12),cap=(r,l)=>new THREE.CapsuleGeometry(r,l,4,10),lath=(pts,seg=18)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg);
export function tricornGeo(R=.21){const seg=30,rings=7,P=[],I=[];for(let r=0;r<=rings;r++){const t=r/rings;for(let s=0;s<=seg;s++){const a=s/seg*6.283,rr=R*(.42+t*.75)*(1+.06*Math.cos(a*3)),lift=Math.pow(t,2.2)*R*.62*(1.05+Math.cos(a*3+Math.PI));P.push(Math.cos(a)*rr,lift,Math.sin(a)*rr)}}for(let r=0;r<rings;r++)for(let s=0;s<seg;s++){const a=r*(seg+1)+s,b=a+1,c=a+seg+1,d=c+1;I.push(a,c,b,b,c,d)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g}
export function hat(parent,y,scale=1,col=0x17151a,trim=0xd9a944){const G=new THREE.Group();G.position.y=y;G.scale.setScalar(scale);parent.add(G);const m=S({color:col,roughness:.72,side:THREE.DoubleSide}),gold=S({color:trim,metalness:.9,roughness:.32});add(G,tricornGeo(),m);add(G,sph,m,0,.03,0,.105,.1,.115);const t=new THREE.Mesh(new THREE.TorusGeometry(.102,.009,6,28),gold);t.rotation.x=Math.PI/2;t.position.y=.012;G.add(t);add(G,sph,S({color:0xeee6d2,roughness:.6}),0,.065,.105,.018,.022,.012,false);G.userData.m=m;G.userData.gold=gold;return G}
/* A jointed pirate, about 1.8 m tall. Feet on y=0; faces +z. */
export function makePirate({coat=0x5c1720,trim=0xd9a944,skin=0xc99570,shirt=0xe9e0cc,pants=0x2a2622,hair=0x1c1410,beard=true,bandana=false,gold=false}={}){
 const R=new THREE.Group(),m={coat:S({color:coat,roughness:.78,side:THREE.DoubleSide}),trim:S({color:trim,metalness:.85,roughness:.35}),skin:S({color:skin,roughness:.62}),shirt:S({color:shirt,roughness:.85}),pants:S({color:pants,roughness:.85}),boot:S({color:0x18120e,roughness:.45}),hair:S({color:hair,roughness:.9}),belt:S({color:0x3a2412,roughness:.6})};
 const hips=new THREE.Group();hips.position.y=.94;R.add(hips);
 const body=new THREE.Group();hips.add(body);
 add(body,lath([[0,-.06],[.155,-.04],[.17,.08],[.155,.22],[.2,.42],[.19,.5],[.09,.57],[0,.58]]),m.shirt,0,0,0,1,1,.72);
 add(body,lath([[.215,.53],[.225,.42],[.2,.2],[.188,.06],[.215,-.1],[.27,-.32],[.33,-.56]],22),m.coat,0,0,-.012,1,1,.78);
 for(const s of[-1,1]){add(body,new THREE.BoxGeometry(.06,.95,.028),m.coat,s*.135,.02,.145,1,1,1).rotation.z=s*-.06;add(body,new THREE.BoxGeometry(.012,.95,.03),m.trim,s*.103,.02,.152,1,1,1,false)}
 for(let i=0;i<3;i++)add(body,sph,m.trim,-.075,.38-i*.11,.158,.012,.012,.008,false);
 const bt=new THREE.Mesh(new THREE.TorusGeometry(1,.05,6,24),m.belt);bt.rotation.x=Math.PI/2;bt.scale.set(.178,.13,.28);bt.position.y=.05;body.add(bt);add(body,new THREE.BoxGeometry(.07,.06,.02),m.trim,0,.05,.145,1,1,1,false);
 const bal=new THREE.Mesh(new THREE.BoxGeometry(.05,.72,.3),m.belt);bal.rotation.z=.68;bal.position.set(0,.28,0);bal.scale.z=.76;body.add(bal);
 /* sword at hip */
 const sw=new THREE.Group();sw.position.set(-.21,.03,-.02);sw.rotation.x=.55;body.add(sw);add(sw,new THREE.BoxGeometry(.016,.68,.035),S({color:0xbfc7cf,metalness:1,roughness:.2}),0,-.38,0);add(sw,sph,m.trim,0,-.02,0,.05,.012,.05);add(sw,cap(.012,.08),m.belt,0,.05,0);
 const neck=add(body,cap(.05,.06),m.skin,0,.61,.005);
 const head=new THREE.Group();head.position.set(0,.74,.012);body.add(head);add(head,sph,m.skin,0,0,0,.098,.118,.108);add(head,sph,m.skin,0,-.012,.094,.019,.024,.03,false);
 for(const s of[-1,1]){add(head,sph,S({color:0xf6f1e8,roughness:.3}),s*.038,.016,.09,.016,.012,.01,false);add(head,sph,S({color:0x140d08,roughness:.2}),s*.039,.015,.1,.007,.007,.004,false);add(head,new THREE.BoxGeometry(.046,.011,.018),m.hair,s*.04,.04,.095,1,1,1,false)}
 add(head,sph,m.hair,0,.015,-.03,.1,.108,.098);if(beard){add(head,sph,m.hair,0,-.075,.052,.075,.066,.058);add(head,new THREE.BoxGeometry(.07,.012,.016),m.hair,0,-.032,.1,1,1,1,false)}
 const ear=add(head,new THREE.TorusGeometry(.016,.004,5,12),m.trim,-.098,-.03,.01,1,1,1,false);ear.rotation.y=Math.PI/2;
 let H;if(bandana){add(head,sph,S({color:coat,roughness:.8}),0,.052,-.008,.103,.075,.11)}else H=hat(head,.077,1,gold?0xd9a944:0x17151a,gold?0xfff0b0:trim);
 const limb=(x,y,r1,l1,r2,l2,matA,matB)=>{const a=new THREE.Group();a.position.set(x,y,0);add(a,cap(r1,l1),matA,0,-l1/2,0);const b=new THREE.Group();b.position.y=-l1-.01;a.add(b);add(b,cap(r2,l2),matB,0,-l2/2,0);return[a,b]};
 const[ua,la]=limb(-.235,.47,.05,.26,.042,.25,m.coat,m.coat),[ub,lb]=limb(.235,.47,.05,.26,.042,.25,m.coat,m.coat);ua.rotation.z=-.1;ub.rotation.z=.1;body.add(ua,ub);
 for(const f of[la,lb]){add(f,sph,m.skin,0,-.3,0,.045,.05,.04);const c=new THREE.Mesh(lath([[.05,-.24],[.062,-.18],[.05,-.14]],10),m.trim);f.add(c)}
 const[ta,sa]=limb(-.1,-.02,.077,.37,.058,.33,m.pants,m.pants),[tb,sb]=limb(.1,-.02,.077,.37,.058,.33,m.pants,m.pants);hips.add(ta,tb);
 for(const s of[sa,sb]){add(s,lath([[.06,-.42],[.074,-.26],[.086,-.13],[.094,-.1],[0,-.1]],12),m.boot);add(s,sph,m.boot,0,-.445,.05,.062,.05,.125)}
 const P={R,hips,body,head,ua,la,ub,lb,ta,sa,tb,sb,hat:H,ph:Math.random()*6,mats:m};return P}
export function animatePirate(P,dt,speed,mode='walk',t=0){const k=Math.min(speed/4.2,1.7);P.ph+=dt*(4+speed*1.35)*(speed>.05?1:0);const s=Math.sin(P.ph),c=Math.cos(P.ph);let A=.3+k*.42;
 if(mode==='swim'){P.ph+=dt*2;const v=Math.sin(P.ph);P.R.children[0].rotation.x=1.25;P.ta.rotation.x=v*.4;P.tb.rotation.x=-v*.4;P.sa.rotation.x=.3;P.sb.rotation.x=.3;P.ua.rotation.x=-2.4+Math.sin(P.ph)*.8;P.ub.rotation.x=-2.4-Math.sin(P.ph)*.8;P.la.rotation.x=-.3;P.lb.rotation.x=-.3;P.head.rotation.x=-1;P.hips.position.y=.3;return}
 P.R.children[0].rotation.x=0;P.head.rotation.x=0;
 if(mode==='air'){P.ta.rotation.x=-.75;P.sa.rotation.x=1.05;P.tb.rotation.x=.25;P.sb.rotation.x=.45;P.ua.rotation.x=-1.05;P.ub.rotation.x=-.65;P.la.rotation.x=-.5;P.lb.rotation.x=-.5;P.body.rotation.x=.08;return}
 if(mode==='helm'||speed<.08){const b=Math.sin(t*1.6)*.012,d=mode==='helm'?-.9:0;for(const[a,v]of[[P.ta,.02],[P.tb,-.02],[P.sa,.04],[P.sb,.04]])a.rotation.x=lerp(a.rotation.x,v,.2);P.ua.rotation.x=lerp(P.ua.rotation.x,d+b,.15);P.ub.rotation.x=lerp(P.ub.rotation.x,d-b,.15);P.la.rotation.x=lerp(P.la.rotation.x,mode==='helm'?-.5:-.12,.15);P.lb.rotation.x=lerp(P.lb.rotation.x,mode==='helm'?-.5:-.12,.15);P.hips.position.y=lerp(P.hips.position.y,.94+b,.2);P.body.rotation.x=lerp(P.body.rotation.x,0,.15);P.body.rotation.y=0;return}
 P.ta.rotation.x=-s*A;P.tb.rotation.x=s*A;P.sa.rotation.x=Math.max(0,c)*A*1.65+.06;P.sb.rotation.x=Math.max(0,-c)*A*1.65+.06;P.ua.rotation.x=s*A*.8;P.ub.rotation.x=-s*A*.8;P.la.rotation.x=-.22-k*.55;P.lb.rotation.x=-.22-k*.55;
 P.hips.position.y=.925+Math.abs(c)*.026*(1+k);P.body.rotation.x=lerp(P.body.rotation.x,.04+k*.13,.14);P.body.rotation.y=s*.07*k;P.hips.rotation.y=-s*.05*k}
function quad(col,accent,o={}){const R=new THREE.Group(),mb=S({color:col,roughness:.95}),L=[];const b=new THREE.Group();R.add(b);return{R,b,mb,L}}
export function makePops(){const white=S({color:0xf1ece2,roughness:.92}),gray=S({color:0x6e6c6a,roughness:.95}),dark=S({color:0x121113,roughness:.4}),pink=S({color:0xe8a0a0,roughness:.6}),R=new THREE.Group(),b=new THREE.Group();b.position.y=.2;R.add(b);
 const body=add(b,cap(.092,.2),white);body.rotation.x=Math.PI/2;add(b,sph,gray,.035,.07,-.08,.066,.038,.1,false);add(b,sph,gray,-.05,.058,.03,.05,.04,.06,false);add(b,sph,white,0,-.02,.13,.082,.09,.075);
 const hd=new THREE.Group();hd.position.set(0,.1,.2);b.add(hd);add(hd,sph,white,0,0,0,.098,.085,.09);add(hd,sph,gray,.04,.045,-.012,.066,.05,.07,false);add(hd,sph,white,0,-.022,.066,.044,.032,.04,false);add(hd,sph,pink,0,-.008,.104,.011,.008,.006,false);
 for(const s of[-1,1]){const e=add(hd,new THREE.ConeGeometry(.04,.075,4),s>0?gray:white,s*.058,.09,-.006);e.rotation.z=-s*.2}
 add(hd,sph,dark,-.044,.012,.08,.03,.03,.012,false);const strap=new THREE.Mesh(new THREE.TorusGeometry(.095,.005,5,20),dark);strap.rotation.set(.1,1.1,.2);strap.position.set(-.012,.03,.012);hd.add(strap);
 add(hd,sph,S({color:0x9ad64a,roughness:.15,emissive:0x2f4a10,emissiveIntensity:.4}),.044,.012,.078,.021,.022,.013,false);add(hd,sph,dark,.044,.012,.09,.009,.015,.004,false);
 const er=new THREE.Mesh(new THREE.TorusGeometry(.017,.004,5,14),S({color:0xe2ac47,metalness:1,roughness:.25}));er.position.set(-.08,.03,.0);er.rotation.y=1.5;hd.add(er);hat(hd,.058,.5);
 const tail=[];let tp=b,tx=new THREE.Vector3(0,.04,-.19);for(let i=0;i<5;i++){const g=new THREE.Group();g.position.copy(tx);tp.add(g);add(g,cap(.022-.002*i,.06),i%2?gray:white,0,.045,0);tail.push(g);tp=g;tx=new THREE.Vector3(0,.085,0)}tail[0].rotation.x=-.8;
 const legs=[[-.056,.11],[.056,.11],[-.056,-.12],[.056,-.12]].map(([x,z])=>{const g=new THREE.Group();g.position.set(x,-.06,z);b.add(g);add(g,cap(.027,.09),white,0,-.055,0);add(g,sph,white,0,-.135,.012,.03,.018,.04);return g});
 R.scale.setScalar(1.7);return{R,b,hd,tail,legs,ph:0}}
export function makePippy(){const br=S({color:0x5f3417,roughness:.95}),br2=S({color:0x3a1e0d,roughness:.95}),tan=S({color:0xbd7f3f,roughness:.9}),white=S({color:0xf0e8d8,roughness:.95}),dark=S({color:0x100b08,roughness:.25}),R=new THREE.Group(),b=new THREE.Group();b.position.y=.2;R.add(b);
 const body=add(b,cap(.072,.17),br);body.rotation.x=Math.PI/2;add(b,sph,white,0,-.012,.105,.062,.09,.05);for(let i=0;i<9;i++)add(b,sph,br2,(i%3-1)*.055,.045+.006*i%2,-.1+i*.024,.03,.024,.04,false);
 const hd=new THREE.Group();hd.position.set(0,.115,.155);b.add(hd);add(hd,sph,br,0,0,0,.08,.074,.078);add(hd,sph,tan,0,-.022,.058,.04,.032,.045,false);add(hd,sph,white,0,-.012,.072,.014,.03,.02,false);add(hd,sph,dark,0,-.01,.102,.012,.009,.007,false);
 for(const s of[-1,1]){const e=add(hd,new THREE.ConeGeometry(.044,.13,5),br,s*.074,.1,-.01);e.rotation.z=-s*.33;const ie=add(hd,new THREE.ConeGeometry(.025,.09,5),S({color:0xd99b8b,roughness:.7}),s*.073,.095,.008,1,1,.5,false);ie.rotation.z=-s*.33;add(hd,sph,dark,s*.04,.016,.068,.022,.024,.015,false);add(hd,sph,S({color:0xffffff}),s*.046,.024,.082,.006,.006,.003,false);add(hd,sph,tan,s*.037,.05,.06,.012,.009,.006,false)}
 hat(hd,.06,.42);const tail=[];let tp=b,tx=new THREE.Vector3(0,.03,-.16);for(let i=0;i<4;i++){const g=new THREE.Group();g.position.copy(tx);tp.add(g);add(g,sph,i>1?br2:br,0,.03,0,.044-.004*i,.05,.044-.004*i);tail.push(g);tp=g;tx=new THREE.Vector3(0,.06,-.012)}tail[0].rotation.x=-.65;
 const legs=[[-.046,.09],[.046,.09],[-.046,-.095],[.046,-.095]].map(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,-.05,z);b.add(g);add(g,cap(.019,.1),i<2?tan:br,0,-.06,0);add(g,sph,tan,0,-.135,.01,.023,.015,.03);return g});
 R.scale.setScalar(1.7);return{R,b,hd,tail,legs,ph:Math.PI}}
export function animatePet(p,dt,speed,t){p.ph+=dt*(speed*3.2+.1);const s=Math.sin(p.ph),A=Math.min(speed*.24,.85);p.legs[0].rotation.x=s*A;p.legs[3].rotation.x=s*A;p.legs[1].rotation.x=-s*A;p.legs[2].rotation.x=-s*A;p.b.position.y=.2+Math.abs(Math.cos(p.ph))*.012*Math.min(speed,3);p.tail.forEach((g,i)=>{g.rotation.z=Math.sin(t*(speed>1?10:3)+i*.8)*(.18+.04*i)});p.hd.rotation.y=Math.sin(t*.7)*.25*(speed<.2?1:.2);p.hd.rotation.x=speed>2?.12:0}
export function makeChicken(){const R=new THREE.Group(),c=[0xb5532a,0xe8dcc0,0x3a2a22][Math.random()*3|0],m=S({color:c,roughness:.9}),r=S({color:0xc22a1e,roughness:.7}),y=S({color:0xd9962b,roughness:.6});const b=new THREE.Group();b.position.y=.25;R.add(b);add(b,sph,m,0,0,0,.13,.13,.18);const tl=add(b,new THREE.ConeGeometry(.08,.22,6),m,0,.1,-.15);tl.rotation.x=-.9;const hd=new THREE.Group();hd.position.set(0,.16,.14);b.add(hd);add(hd,sph,m,0,0,0,.062,.07,.068);add(hd,sph,r,0,.07,0,.014,.032,.04,false);add(hd,new THREE.ConeGeometry(.018,.05,5),y,0,0,.08).rotation.x=Math.PI/2;
 const legs=[-.05,.05].map(x=>{const g=new THREE.Group();g.position.set(x,-.1,0);b.add(g);add(g,cap(.012,.13),y,0,-.07,0);return g});R.scale.setScalar(1.35);return{R,b,hd,legs,ph:Math.random()*6}}
/* The pirate lady: same jointed rig, with long hair, a full skirt and a plumed hat. */
export function makeLady(o={}){const P=makePirate({trim:0xd9a944,pants:0x2a2622,...o,beard:false,bandana:false});const hair=P.mats.hair,skirt=S({color:o.skirt??0x6d1f3c,roughness:.8,side:THREE.DoubleSide});
 add(P.head,sph,hair,0,-.075,-.075,.112,.2,.075);for(const s of[-1,1])add(P.head,sph,hair,s*.092,-.085,-.012,.036,.15,.05);
 add(P.body,lath([[.17,.08],[.235,-.1],[.32,-.42],[.4,-.78]],22),skirt,0,0,0,1,1,.86);
 if(P.hat){const pl=S({color:o.plume??0xd63a3a,roughness:.7});const f=add(P.hat,sph,pl,-.1,.1,-.02,.022,.12,.03);f.rotation.z=.5}
 P.R.scale.setScalar(.95);return P}
/* A sea dog, built on Pippy's frame with its own coat and size. */
export function makeDog({coat=0x8a5a2b,dark=0x4a2c14,belly=0xd9b98a,size=2.5}={}){const d=makePippy(),seen=new Set(),map={0x5f3417:coat,0x3a1e0d:dark,0xbd7f3f:belly};d.R.traverse(o=>{if(o.isMesh&&!seen.has(o.material)){seen.add(o.material);const n=map[o.material.color.getHex()];if(n!==undefined)o.material.color.setHex(n)}});d.R.scale.setScalar(size);return d}

/* ---------- Battle Stations: war gear for the crew ----------
   Iron breastplate, pauldrons, a bandolier of brass cartridges, a flintlock and a torn blood-red sash
   go over the pirate that makePirate built; the pets get a small plate and a steel cap. */
const IRON=()=>S({color:0x3a3d44,metalness:.92,roughness:.34}),BRASS=()=>S({color:0xd9a944,metalness:.95,roughness:.3}),BLOOD=()=>S({color:0x8f1a1a,roughness:.78,side:THREE.DoubleSide});
export function warGear(P,{recolor=true}={}){const iron=IRON(),brass=BRASS(),blood=BLOOD(),rivet=S({color:0x14151a,metalness:.8,roughness:.5}),b=P.body;
 /* breastplate shaped to the torso, with a brass crest */
 const plate=add(b,lath([[0,.2],[.19,.2],[.215,.3],[.215,.44],[.2,.52],[.11,.58],[0,.59]],22),iron,0,-.01,.012,1,1,.74);plate.scale.z=.8;plate.position.z=.02;
 add(b,sph,brass,0,.4,.19,.03,.036,.012,false);for(const s of[-1,1])for(const y of[.28,.46])add(b,sph,rivet,s*.12,y,.17,.011,.011,.007,false);
 /* backplate */
 add(b,lath([[0,.2],[.17,.2],[.2,.34],[.19,.5],[.1,.57],[0,.58]],18),iron,0,-.01,-.04,1,1,.6).scale.z=.55;
 /* pauldrons */
 for(const a of[P.ua,P.ub]){const s=a.position.x<0?-1:1;const pd=add(a,new THREE.SphereGeometry(1,14,10,0,6.283,0,1.9),iron,0,.02,0,.095,.07,.09);pd.rotation.z=s*.35;add(a,sph,brass,s*.03,.06,0,.014,.014,.014,false)}
 /* bandolier: a tilted ring with brass cartridges */
 const band=new THREE.Mesh(new THREE.TorusGeometry(1,.028,6,28),S({color:0x2b1a10,roughness:.7}));band.rotation.set(Math.PI/2,0,0);band.rotation.x=1.25;band.rotation.z=.75;band.scale.set(.2,.16,.3);band.position.set(.01,.33,.02);b.add(band);
 for(let i=0;i<6;i++){const t=-.55+i*.22,x=Math.sin(t)*.19,y=.33+Math.cos(t)*.17*.75,z=.165;add(b,new THREE.CylinderGeometry(.009,.009,.045,6),brass,x*.9,y,z+.01,1,1,1,false)}
 /* flintlock on the right hip */
 const gun=new THREE.Group();gun.position.set(.2,.02,.05);gun.rotation.set(.3,0,-1.1);b.add(gun);add(gun,new THREE.BoxGeometry(.028,.2,.03),S({color:0x4a2a14,roughness:.6}),0,-.1,0);add(gun,new THREE.CylinderGeometry(.012,.014,.22,8),iron,0,.1,0);add(gun,sph,brass,0,-.02,0,.02,.02,.014,false);
 /* torn blood-red sash over the shoulder */
 const sash=add(b,new THREE.BoxGeometry(.07,.62,.012),blood,-.08,.3,.18);sash.rotation.z=-.45;
 /* a brass skull badge on the hat */
 if(P.hat){add(P.hat,sph,brass,0,.055,.11,.022,.024,.01,false);P.hat.userData.m.color.setHex(0x1b1518)}
 if(recolor){P.mats.coat.color.setHex(0x3b1016);P.mats.pants.color.setHex(0x1b1a1e)}return P}
export function petArmor(pet,cap=true){const iron=IRON(),brass=BRASS();
 const pl=add(pet.b,cap? new THREE.CylinderGeometry(.105,.11,.17,14,1,true):new THREE.CylinderGeometry(.095,.1,.15,14,1,true),iron,0,.015,.02);pl.rotation.x=Math.PI/2;pl.material.side=THREE.DoubleSide;
 add(pet.b,sph,brass,0,.112,.02,.016,.012,.016,false);
 if(cap){const c=add(pet.hd,new THREE.SphereGeometry(1,14,10,0,6.283,0,1.55),iron,0,.04,-.01,.1,.07,.095);c.rotation.x=-.2;add(pet.hd,new THREE.BoxGeometry(.012,.05,.02),BLOOD(),0,.115,-.01,1,1,1,false)}
 return pet}
