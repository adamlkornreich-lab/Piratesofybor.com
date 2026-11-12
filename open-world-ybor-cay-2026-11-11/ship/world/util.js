/* Pirates of Ybor: Open World. © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
export {THREE};
/* older Safari and Firefox lack canvas roundRect */
if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(+r||0,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this};
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export const hash=(x,y=0)=>{let h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)};
export function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
export function noise(x,y,per=0){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi;
 const w=(i)=>per?((i%per)+per)%per:i;
 const a=hash(w(xi),w(yi)),b=hash(w(xi+1),w(yi)),c=hash(w(xi),w(yi+1)),d=hash(w(xi+1),w(yi+1));
 const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
export function fbm(x,y,oct=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<oct;i++){s+=a*noise(x*f+i*17.3,y*f-i*9.1);n+=a;a*=.5;f*=2.03}return s/n}
export function tfbm(x,y,per,oct=5){let s=0,a=.5,f=1,n=0;for(let i=0;i<oct;i++){s+=a*noise(x*f+i*37,y*f+i*11,per*f);n+=a;a*=.55;f*=2}return s/n}
/* Geometry bucket: collects geometry per material and merges into one mesh. */
export function mergeGeos(list){let nv=0;for(const g of list)nv+=g.index?g.index.count:g.attributes.position.count;
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2);let o=0;
 for(let g of list){if(g.index)g=g.toNonIndexed();if(!g.attributes.normal)g.computeVertexNormals();
  const n=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=n}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(P,3));r.setAttribute('normal',new THREE.BufferAttribute(N,3));r.setAttribute('uv',new THREE.BufferAttribute(U,2));return r}
export class Kit{
 constructor(){this.b=new Map();this.m=new THREE.Matrix4()}
 add(mat,g,m){if(!this.b.has(mat))this.b.set(mat,[]);g=g.clone();g.applyMatrix4(m?new THREE.Matrix4().multiplyMatrices(this.m,m):this.m);this.b.get(mat).push(g)}
 /* box with real-world-scale UVs */
 box(mat,x,y,z,sx,sy,sz,ry=0,rx=0,rz=0,uv=1){const g=new THREE.BoxGeometry(sx,sy,sz);const a=g.attributes.uv,n=g.attributes.normal;
  for(let i=0;i<a.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));const u=a.getX(i),v=a.getY(i);
   if(nx>.5)a.setXY(i,u*sz*uv,v*sy*uv);else if(ny>.5)a.setXY(i,u*sx*uv,v*sz*uv);else a.setXY(i,u*sx*uv,v*sy*uv)}
  const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1));this.add(mat,g,m)}
 cyl(mat,a,b,r0,r1,seg=8,open=false,uv=1){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
  const g=new THREE.CylinderGeometry(r1,r0,L,seg,1,open);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*Math.max(r0,r1)*6.28*uv,u.getY(i)*L*uv);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
  const m=new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,new THREE.Vector3(1,1,1));this.add(mat,g,m)}
 geo(mat,g,x=0,y=0,z=0,ry=0,s=1,rx=0,rz=0){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),typeof s==='number'?new THREE.Vector3(s,s,s):new THREE.Vector3(...s));this.add(mat,g,m)}
 place(x,y,z,ry=0){this.m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(1,1,1));return this}
 reset(){this.m=new THREE.Matrix4();return this}
 build(parent,{cast=true,receive=true}={}){const out=[];for(const[mat,list]of this.b){const me=new THREE.Mesh(mergeGeos(list),mat);me.castShadow=cast&&!mat.userData.noCast;me.receiveShadow=receive;parent.add(me);out.push(me)}this.b.clear();return out}
}
