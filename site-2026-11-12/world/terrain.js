import {THREE,clamp,lerp,smooth,fbm,hash,rng} from './util.js';
import {sandTex,grassTex,rockTex,dirtTex,detailNormal} from './textures.js';
export const ISLANDS=[
 {id:'main',name:'Ybor Cay',x:0,z:0,rx:285,rz:215,hill:1,s:1,ext:[-420,420,-340,340],res:2.6},
 {id:'skull',name:'Danny Alonso Island',x:680,z:-340,rx:125,rz:100,hill:.9,s:2,ext:[480,880,-510,-170],res:3},
 {id:'gaspar',name:"Gaspar's Rock",x:-660,z:-280,rx:105,rz:95,hill:1.5,s:3,ext:[-830,-490,-440,-120],res:3},
 {id:'mangrove',name:'Mangrove Key',x:-130,z:690,rx:120,rz:72,hill:.35,s:4,ext:[-320,60,560,820],res:3},
 /* family and friends islands */
 {id:'ruben',name:'Ruben Alvarez Island',x:-1000,z:-1000,rx:58,rz:54,hill:.42,s:5,ext:[-1130,-870,-1130,-870],res:3,mini:true,game:["Ruben's Rhythm","island.html?i=ruben"],neon:'#ffb347'},
 {id:'adamashlee',name:'Adam and Ashlee Island',x:-600,z:-1000,rx:65,rz:59,hill:.42,s:6,ext:[-730,-470,-1130,-870],res:3,mini:true,game:["Adam & Ashlee's Match Deck","island.html?i=adamashlee"],neon:'#ff6fb1'},
 {id:'ericshere',name:'Eric and Shere Island',x:-200,z:-1000,rx:58,rz:64,hill:.42,s:7,ext:[-330,-70,-1130,-870],res:3,mini:true,game:["Eric & Shere's Quick Draw","island.html?i=ericshere"],neon:'#ff5a3c'},
 {id:'landonshere',name:'Landon and Shere Island',x:200,z:-1000,rx:65,rz:57,hill:.42,s:8,ext:[70,330,-1130,-870],res:3,mini:true,game:["Landon & Shere's Garnish Catch","island.html?i=landonshere"],neon:'#7be0ff'},
 {id:'seavey',name:'Andy Seavey Golf Club',x:600,z:-1000,rx:58,rz:62,hill:.42,s:9,ext:[470,730,-1130,-870],res:3,mini:true,game:["Andy Seavey's Driving Range","island.html?i=seavey"],neon:'#8dff8a'},
 {id:'evanelise',name:'Evan and Elise Island',x:1000,z:-1000,rx:65,rz:55,hill:.42,s:10,ext:[870,1130,-1130,-870],res:3,mini:true,game:["Evan & Elise's Ledger Scramble","island.html?i=evanelise"],neon:'#ffd24d'},
 {id:'ambervick',name:'Amber and Vick Island',x:-1050,z:-620,rx:58,rz:60,hill:.42,s:11,ext:[-1180,-920,-750,-490],res:3,mini:true,game:["Amber & Vick's Star Match","island.html?i=ambervick"],neon:'#c9a0ff'},
 {id:'gerald',name:'Gerald I. Kornreich Island',x:-200,z:-620,rx:65,rz:65,hill:.42,s:12,ext:[-330,-70,-750,-490],res:3,mini:true,game:["Gerald's Word Vault","island.html?i=gerald"],neon:'#ffd24d'},
 {id:'kevincraig',name:'Kevin and Craig Island',x:200,z:-620,rx:58,rz:58,hill:.42,s:13,ext:[70,330,-750,-490],res:3,mini:true,game:["Kevin & Craig's Bullseye Reflex","island.html?i=kevincraig"],neon:'#ff8a3c'},
 {id:'lorilarry',name:'Aunt Lori and Uncle Larry Island',x:1080,z:-620,rx:65,rz:63,hill:.42,s:14,ext:[950,1210,-750,-490],res:3,mini:true,game:["Aunt Lori & Uncle Larry's Cookie Catch","island.html?i=lorilarry"],neon:'#ff6fb1'},
 {id:'sadie',name:'Sadie Island',x:-1050,z:20,rx:58,rz:56,hill:.42,s:15,ext:[-1180,-920,-110,150],res:3,mini:true,game:["Sadie's Bubble Pop","island.html?i=sadie"],neon:'#7be0ff'},
 {id:'megan',name:'Megan Massok Island',x:-700,z:30,rx:65,rz:61,hill:.42,s:16,ext:[-830,-570,-100,160],res:3,mini:true,game:["Megan's Lantern Lights","island.html?i=megan"],neon:'#8dff8a'},
 {id:'greg',name:'Greg Biggerstaff Island',x:700,z:20,rx:58,rz:54,hill:.42,s:17,ext:[570,830,-110,150],res:3,mini:true,game:["Greg's Target Run","island.html?i=greg"],neon:'#ffb347'},
 {id:'brenner',name:'Mark Brenner Island',x:1050,z:20,rx:65,rz:59,hill:.42,s:18,ext:[920,1180,-110,150],res:3,mini:true,game:["Mark Brenner's Sailor Scramble","island.html?i=brenner"],neon:'#c9a0ff'},
 {id:'lafferty',name:'Ed Lafferty Island',x:-800,z:400,rx:58,rz:64,hill:.42,s:19,ext:[-930,-670,270,530],res:3,mini:true,game:["Ed Lafferty's Serve Return","island.html?i=lafferty"],neon:'#ff5a3c'},
 {id:'nakamura',name:'Daisuke Nakamura and Family Island',x:860,z:400,rx:65,rz:57,hill:.42,s:20,ext:[730,990,270,530],res:3,mini:true,game:["The Nakamura Family Melody","island.html?i=nakamura"],neon:'#ffd24d'},
 {id:'message',name:'Message Island',x:560,z:470,rx:58,rz:62,hill:.42,s:21,ext:[430,690,340,600],res:3,mini:true,game:["The Message Deck: talk, post and challenge",'messages.html'],neon:'#35f0d8'},
 {id:'chile',name:'Chile Island',x:-250,z:960,rx:64,rz:58,hill:.42,s:23,ext:[-380,-120,830,1090],res:3,mini:true,game:["Chile Island Palabras","island.html?i=chile"],neon:'#ff5a3c'},
];
export const TOWN={y:3.2,x0:-128,x1:172,z0:18,z1:102,streetZ:60};
const gauss=(x,z,cx,cz,s)=>Math.exp(-((x-cx)*(x-cx)+(z-cz)*(z-cz))/(2*s*s));
const rectMask=(x,z,x0,x1,z0,z1,f)=>smooth(x0-f,x0,x)*(1-smooth(x1,x1+f,x))*smooth(z0-f,z0,z)*(1-smooth(z1,z1+f,z));
function rawH(I,x,z){const dx=(x-I.x)/I.rx,dz=(z-I.z)/I.rz;let r=Math.hypot(dx,dz);r+=(fbm(x*.0075+I.s*9.1,z*.0075-I.s*3.7,4)-.5)*.46;
 if(r>=1){const o=(r-1)*Math.min(I.rx,I.rz);return Math.max(-30,-o*.052-Math.max(0,o-70)*.17+(fbm(x*.03,z*.03,2)-.5)*1.2)}
 const k=1-r;let h=smooth(0,.17,k)*2.4+k*1.2;const inl=smooth(.1,.42,k);h+=inl*(.9+fbm(x*.011+I.s,z*.011,5)*14*I.hill);return h}
export function shape(I,x,z){let h=rawH(I,x,z);
 if(I.id==='main'){const inl=smooth(-1,2.2,h);
  h+=inl*58*gauss(x,z,30,-135,62);h+=inl*15*gauss(x,z,-205,10,34);h+=inl*7*gauss(x,z,-60,-110,60);
  const g=gauss(x,z,150,-82,44);h=lerp(h,6.4+Math.sin(x*.06)*.6+Math.cos(z*.07)*.5,clamp(g*1.8)*inl);
  const t=rectMask(x,z,TOWN.x0,TOWN.x1,TOWN.z0,TOWN.z1,26);h=lerp(h,TOWN.y,t);
  /* a sheltered lagoon on the west shore */
  const lag=gauss(x,z,-300,128,38);h=lerp(h,-3.2,clamp(lag*1.5));
 }
 if(I.id==='skull')h+=smooth(0,2,h)*20*gauss(x,z,680,-360,30);
 if(I.id==='gaspar')h+=smooth(0,2,h)*11*gauss(x,z,-660,-290,38);
 return h}
export const PATHS=[ [[34,176],[30,140],[16,118],[12,102],[10,74]], [[160,60],[205,62],[240,70],[280,76]], [[-128,60],[-160,50],[-190,34],[-205,14]], [[20,18],[28,-20],[10,-60],[40,-96],[22,-128]], [[150,20],[158,-20],[150,-48]], [[-128,70],[-175,92],[-205,106]] ];
function distSeg(px,pz,a,b){const vx=b[0]-a[0],vz=b[1]-a[1],t=clamp(((px-a[0])*vx+(pz-a[1])*vz)/(vx*vx+vz*vz));return Math.hypot(px-a[0]-vx*t,pz-a[1]-vz*t)}
function pathD(x,z){let d=1e9;for(const P of PATHS)for(let i=0;i<P.length-1;i++)d=Math.min(d,distSeg(x,z,P[i],P[i+1]));return d}
export function buildGrids(){for(const I of ISLANDS){const[x0,x1,z0,z1]=I.ext,nx=Math.ceil((x1-x0)/I.res)+1,nz=Math.ceil((z1-z0)/I.res)+1,H=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*nx+i]=shape(I,x0+i*I.res,z0+j*I.res);Object.assign(I,{nx,nz,H})}}
export function heightAt(x,z){for(const I of ISLANDS){const[x0,x1,z0,z1]=I.ext;if(x<=x0||x>=x1||z<=z0||z>=z1)continue;const fx=(x-x0)/I.res,fz=(z-z0)/I.res,i=Math.min(I.nx-2,Math.floor(fx)),j=Math.min(I.nz-2,Math.floor(fz)),u=fx-i,v=fz-j,H=I.H,n=I.nx;const a=H[j*n+i],b=H[j*n+i+1],c=H[(j+1)*n+i],d=H[(j+1)*n+i+1];return u+v<1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v)}return -30}
export function slopeAt(x,z){const e=1.5;return Math.hypot(heightAt(x+e,z)-heightAt(x-e,z),heightAt(x,z+e)-heightAt(x,z-e))/(2*e)}
export function shoreFrom(ox,oz,dx,dz,max=500){let last=heightAt(ox,oz);for(let t=2;t<max;t+=1.5){const h=heightAt(ox+dx*t,oz+dz*t);if(h<0&&last>=0)return[ox+dx*t,oz+dz*t,t];last=h}return null}
export function grassW(x,z,h,sl){if(h<2.1)return 0;const n=fbm(x*.04,z*.04,3);return clamp(smooth(2.1,3.6,h)*(1-smooth(.5,1,sl))*smooth(.28,.5,n+.15+(h>6?.2:0)))}
export function terrainMaterial(uni){const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0});
 const T={tSand:sandTex(),tGrass:grassTex(),tRock:rockTex(),tDirt:dirtTex(),tDet:detailNormal()};
 m.onBeforeCompile=s=>{for(const k in T)s.uniforms[k]={value:T[k]};s.uniforms.uWet=uni&&uni.wet||{value:0};
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvW=(modelMatrix*vec4(position,1.)).xyz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vW;uniform sampler2D tSand,tGrass,tRock,tDirt,tDet;uniform float uWet;float wetK;')
  .replace('#include <color_fragment>',`vec2 uvw=vW.xz;
   float mac=texture2D(tGrass,uvw*.013).g;
   vec3 sa=texture2D(tSand,uvw*.16).rgb*(.9+.2*texture2D(tSand,uvw*.021).r);
   vec3 gr=texture2D(tGrass,uvw*.11).rgb*mix(.68,1.45,mac);gr=mix(gr,texture2D(tGrass,uvw*.027).rgb,.4);
   vec3 ro=texture2D(tRock,uvw*.06+vec2(vW.y*.09,-vW.y*.07)).rgb;vec3 di=texture2D(tDirt,uvw*.14).rgb;
   vec3 c=mix(sa,gr,vColor.r);c=mix(c,ro,vColor.g);c=mix(c,di,vColor.b);
   float wet=max(smoothstep(1.15,.12,vW.y),uWet*.62);wetK=wet;c*=mix(1.,.52,wet);
   float under=smoothstep(.05,-3.,vW.y);c=mix(c,c*vec3(.72,.92,.95),under);
   diffuseColor.rgb*=c;`)
  .replace('#include <roughnessmap_fragment>','float roughnessFactor=mix(mix(.96,.34,wetK),.92,vColor.r);')
  .replace('#include <normal_fragment_maps>',`vec3 dn=texture2D(tDet,uvw*.33).xyz*2.-1.;vec3 dn2=texture2D(tDet,uvw*.07).xyz*2.-1.;
   normal=normalize(normal+(viewMatrix*vec4((dn.x+dn2.x*1.4)*.5,0.,(dn.y+dn2.y*1.4)*.5,0.)).xyz*mix(.2,.7,vColor.g));`)};
 return m}
export function buildTerrain(parent,mat){for(const I of ISLANDS){const{nx,nz,H,res}=I,[x0,,z0]=I.ext,P=new Float32Array(nx*nz*3),C=new Float32Array(nx*nz*3),idx=new Uint32Array((nx-1)*(nz-1)*6);let o=0;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=x0+i*res,z=z0+j*res,h=H[k];P[k*3]=x;P[k*3+1]=h;P[k*3+2]=z;
   const hl=H[j*nx+Math.max(0,i-1)],hr=H[j*nx+Math.min(nx-1,i+1)],hu=H[Math.max(0,j-1)*nx+i],hd=H[Math.min(nz-1,j+1)*nx+i],sl=Math.hypot(hr-hl,hd-hu)/(2*res);
   let gw=grassW(x,z,h,sl),rw=smooth(.62,.95,sl+(h>26?.08:0)),pw=0;if(I.id==='main'){pw=1-smooth(1.8,3.8+fbm(x*.2,z*.2,2)*1.5,pathD(x,z));if(x>TOWN.x0-4&&x<TOWN.x1+4&&z>TOWN.z0&&z<TOWN.z1)gw=Math.max(gw*.5,.25)}
   C[k*3]=gw;C[k*3+1]=rw;C[k*3+2]=pw;if(i<nx-1&&j<nz-1){idx[o++]=k;idx[o++]=k+nx;idx[o++]=k+1;idx[o++]=k+1;idx[o++]=k+nx;idx[o++]=k+nx+1}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
  const me=new THREE.Mesh(g,mat);me.receiveShadow=true;me.castShadow=false;parent.add(me)}}
export function depthTexture(size=1024,span=2600){const D=new Uint8Array(size*size);for(let j=0;j<size;j++)for(let i=0;i<size;i++){const x=(i+.5)/size*span-span/2,z=(j+.5)/size*span-span/2;D[j*size+i]=clamp((heightAt(x,z)+14)/18)*255}
 const t=new THREE.DataTexture(D,size,size,THREE.RedFormat,THREE.UnsignedByteType);t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return{t,span}}
