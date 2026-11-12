/* A small VRML97 (.wrl) reader for the open world: Transform, Group, Shape, Appearance, Material,
   Box, Sphere, Cylinder, Cone, with DEF and USE. Models live in world/models/.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
function tokens(src){return src.replace(/#[^\n]*/g,' ').match(/[{}\[\]]|"[^"]*"|[^\s{}\[\],]+/g)||[]}
const isNum=t=>t!==undefined&&/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t);
export function parseVRML(src){const T=tokens(src);let i=0;const defs={};
 function node(){let name=null;if(T[i]==='DEF'){name=T[i+1];i+=2}if(T[i]==='USE'){const n=defs[T[i+1]];i+=2;return n?{use:n}:null}
  const type=T[i++];if(T[i]!=='{')throw new Error('VRML: expected { after '+type);i++;const n={type,f:{}};if(name)defs[name]=n;
  while(i<T.length&&T[i]!=='}'){const key=T[i++];n.f[key]=value()}i++;return n}
 function value(){if(T[i]==='['){i++;const list=[];while(i<T.length&&T[i]!==']'){list.push(isNum(T[i])?parseFloat(T[i++]):node())}i++;return list}
  if(isNum(T[i])){const v=[];while(isNum(T[i]))v.push(parseFloat(T[i++]));return v}
  if(T[i]==='TRUE'||T[i]==='FALSE')return T[i++]==='TRUE';if(T[i]&&T[i][0]==='"')return T[i++].slice(1,-1);
  return node()}
 const out=[];while(i<T.length){const n=node();if(n)out.push(n)}return out}
function material(a){const m=a&&a.f.material,f=m?m.f:{},d=f.diffuseColor||[.8,.8,.8],e=f.emissiveColor||[0,0,0],tr=f.transparency?f.transparency[0]:0,sh=f.shininess?f.shininess[0]:.2;
 return new THREE.MeshStandardMaterial({color:new THREE.Color(d[0],d[1],d[2]),emissive:new THREE.Color(e[0],e[1],e[2]),roughness:Math.min(1,Math.max(.12,1-sh)),metalness:sh>.6?.7:.05,transparent:tr>0,opacity:1-tr})}
function geometry(g){if(!g)return null;const f=g.f,n=(k,d)=>f[k]?f[k][0]:d;
 if(g.type==='Box'){const s=f.size||[2,2,2];return new THREE.BoxGeometry(s[0],s[1],s[2])}
 if(g.type==='Sphere')return new THREE.SphereGeometry(n('radius',1),24,16);
 if(g.type==='Cylinder')return new THREE.CylinderGeometry(n('radius',1),n('radius',1),n('height',2),24);
 if(g.type==='Cone')return new THREE.ConeGeometry(n('bottomRadius',1),n('height',2),24);
 return null}
function build(n,cache){if(!n)return null;if(n.use)return build(n.use,cache);
 if(n.type==='Shape'){const geo=geometry(n.f.geometry);if(!geo)return null;let mat=cache.get(n.f.appearance);if(!mat){mat=material(n.f.appearance);cache.set(n.f.appearance,mat)}const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m}
 if(n.type==='Transform'||n.type==='Group'){const g=new THREE.Group(),f=n.f;
  if(f.translation)g.position.set(f.translation[0],f.translation[1],f.translation[2]);
  if(f.rotation)g.quaternion.setFromAxisAngle(new THREE.Vector3(f.rotation[0],f.rotation[1],f.rotation[2]).normalize(),f.rotation[3]);
  if(f.scale)g.scale.set(f.scale[0],f.scale[1],f.scale[2]);
  const kids=Array.isArray(f.children)?f.children:f.children?[f.children]:[];for(const k of kids){const o=build(k,cache);if(o)g.add(o)}return g}
 return null}
export async function loadVRML(url){const r=await fetch(url);if(!r.ok)throw new Error('VRML '+url+' '+r.status);const src=await r.text();if(!/^#VRML V2\.0/.test(src))throw new Error('Not a VRML97 file: '+url);
 const g=new THREE.Group(),cache=new Map();for(const n of parseVRML(src)){const o=build(n,cache);if(o)g.add(o)}return g}
