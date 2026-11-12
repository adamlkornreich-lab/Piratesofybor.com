/* Writes the live island out as a VRML97 (.wrl) world: terrain as elevation grids, then the town, ships, the Vanicular,
   the police, the parrots and the folk, each shape placed with its own Transform and coloured from its material.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
const n2=x=>{const s=(Math.round(x*100)/100).toString();return s==='-0'?'0':s},n3=x=>{const s=(Math.round(x*1000)/1000).toString();return s==='-0'?'0':s},n4=x=>{const s=(Math.round(x*10000)/10000).toString();return s==='-0'?'0':s};
const texCol=new Map();
function avg(tex){if(texCol.has(tex))return texCol.get(tex);let c=null;try{const im=tex.image;if(im&&(im.width||im.videoWidth)){const k=document.createElement('canvas');k.width=k.height=4;const g=k.getContext('2d');g.drawImage(im,0,0,4,4);const d=g.getImageData(0,0,4,4).data;let r=0,gg=0,b=0,a=0;for(let i=0;i<d.length;i+=4){const w=d[i+3]/255;r+=d[i]*w;gg+=d[i+1]*w;b+=d[i+2]*w;a+=w}if(a>.5)c=[r/a/255,gg/a/255,b/a/255]}}catch(e){}texCol.set(tex,c);return c}
const SAND=[.87,.79,.6],GRASS=[.31,.47,.2],ROCK=[.46,.43,.39],PATH=[.62,.52,.38],DEEP=[.2,.42,.44];
export function exportVRML(root,{maxVerts=1400000,title='Ybor Cay'}={}){
 root.updateMatrixWorld(true);const o=[];
 o.push('#VRML V2.0 utf8','# '+title+': the open world of Pirates of Ybor, written out from the live game.','# Copyright 2026 Adam Kornreich / R.A. Consulting, Pops & Pippy. All rights reserved.','# Units are metres and Y is up. Open it in a VRML97 / X3D viewer (FreeWRL, view3dscene, Cortona, BS Contact) or import it into Blender or MeshLab.',
  `WorldInfo{title "${title}" info["Pirates of Ybor","Copyright 2026 Adam Kornreich / R.A. Consulting, Pops & Pippy"]}`,
  'NavigationInfo{type["WALK","ANY"] headlight TRUE speed 6 avatarSize[0.4 1.7 0.6] visibilityLimit 5000}',
  'Background{skyColor[0.12 0.43 0.77,0.70 0.87 0.95] skyAngle[1.5] groundColor[0.05 0.23 0.29]}',
  'Viewpoint{position 38 6 198 orientation 0 1 0 0 description "Beach landing"}',
  'Viewpoint{position 40 9 60 orientation 0 1 0 1.5708 description "Seventh Avenue and the Vanicular"}',
  'Viewpoint{position 20 520 120 orientation 1 0 0 -1.5708 description "Chart view"}',
  'DirectionalLight{direction -0.4 -0.8 -0.45 intensity 1 ambientIntensity 0.55}',
  '# The sea','Shape{appearance Appearance{material Material{diffuseColor 0.06 0.36 0.45 specularColor 0.5 0.6 0.6 shininess 0.6 transparency 0.25}} geometry IndexedFaceSet{solid FALSE coord Coordinate{point[-2600 -0.15 -2600,2600 -0.15 -2600,2600 -0.15 2600,-2600 -0.15 2600]} coordIndex[0,3,2,1,-1]}}');
 const v=new THREE.Vector3(),m=new THREE.Matrix4(),c=new THREE.Color(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),defs=new Map();let total=0,shapes=0,skipped=0;
 const place=(mx,body)=>{mx.decompose(v,q,sc);if(!isFinite(v.x+v.y+v.z+sc.x+sc.y+sc.z))return;if(q.w<0)q.set(-q.x,-q.y,-q.z,-q.w);const ang=2*Math.acos(Math.min(1,q.w)),sn=Math.sqrt(Math.max(0,1-q.w*q.w));let t='Transform{';if(Math.abs(v.x)+Math.abs(v.y)+Math.abs(v.z)>.004)t+=`translation ${n2(v.x)} ${n2(v.y)} ${n2(v.z)} `;if(ang>.002&&sn>1e-5)t+=`rotation ${n4(q.x/sn)} ${n4(q.y/sn)} ${n4(q.z/sn)} ${n4(ang)} `;if(Math.abs(sc.x-1)+Math.abs(sc.y-1)+Math.abs(sc.z-1)>.004)t+=`scale ${n4(sc.x)} ${n4(sc.y)} ${n4(sc.z)} `;o.push(t+`children ${body}}`);shapes++};
 root.traverse(e=>{if(!e.isMesh||!e.geometry)return;for(let p=e;p;p=p.parent)if(p.visible===false)return;
  const g=e.geometry,pos=g.attributes.position;if(!pos)return;const G=e.userData.grid;
  if(G){/* terrain: one ElevationGrid per island */const k=Math.max(1,Math.ceil(Math.sqrt(G.nx*G.nz/60000))),nx=Math.floor((G.nx-1)/k)+1,nz=Math.floor((G.nz-1)/k)+1,H=[],C=[],w=g.attributes.color;
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const id=j*k*G.nx+i*k,h=pos.getY(id);H.push(n2(h));let col;if(h<-.2){const d=Math.min(1,-h/8);col=SAND.map((s,a)=>s+(DEEP[a]-s)*d)}else{const gw=w?w.getX(id):0,rw=w?w.getY(id):0,pw=w?w.getZ(id):0;col=SAND.map((s,a)=>{let x=s+(GRASS[a]-s)*gw;x+=(ROCK[a]-x)*rw;x+=(PATH[a]-x)*pw;return x})}C.push(n3(col[0])+' '+n3(col[1])+' '+n3(col[2]))}
   o.push('# '+G.name,`Transform{translation ${n2(G.x0)} 0 ${n2(G.z0)} children Shape{appearance Appearance{material Material{diffuseColor 0.8 0.75 0.6}} geometry ElevationGrid{xDimension ${nx} zDimension ${nz} xSpacing ${n3(G.res*k)} zSpacing ${n3(G.res*k)} solid FALSE creaseAngle 1.2 colorPerVertex TRUE color Color{color[${C.join(',')}]} height[${H.join(' ')}]}}}`);total+=nx*nz;shapes++;return}
  const mat=Array.isArray(e.material)?e.material[0]:e.material;if(!mat||mat.isShaderMaterial||(mat.transparent&&mat.opacity<.5)||mat.blending===THREE.AdditiveBlending)return;
  let col=[1,1,1];if(mat.color){c.copy(mat.color).convertLinearToSRGB();col=[c.r,c.g,c.b]}if(mat.map){const a=avg(mat.map);if(a)col=[col[0]*a[0],col[1]*a[1],col[2]*a[2]]}
  let em='';if(mat.isMeshBasicMaterial)em=` emissiveColor ${n3(col[0]*.6)} ${n3(col[1]*.6)} ${n3(col[2]*.6)}`;else if(mat.emissive&&(mat.emissive.r+mat.emissive.g+mat.emissive.b)>.05){c.copy(mat.emissive).convertLinearToSRGB();em=` emissiveColor ${n3(c.r)} ${n3(c.g)} ${n3(c.b)}`}
  const app=`appearance Appearance{material Material{diffuseColor ${n3(col[0])} ${n3(col[1])} ${n3(col[2])}${em}${mat.metalness>.5?' specularColor 0.8 0.75 0.6 shininess 0.7':''}}}`;
  let geo;const vc=mat.vertexColors&&g.attributes.color?g.attributes.color:null,key=g.uuid+(vc?'c':'');
  if(defs.has(key))geo='USE '+defs.get(key);else{const N=pos.count;if(total+N>maxVerts){skipped++;return}const idx=g.index?g.index.array:null,tris=[],pts=[];
   if(idx){for(let i=0;i+2<idx.length;i+=3)tris.push(idx[i]+','+idx[i+1]+','+idx[i+2]+',-1')}else for(let i=0;i+2<N;i+=3)tris.push(i+','+(i+1)+','+(i+2)+',-1');
   for(let i=0;i<N;i++)pts.push(n3(pos.getX(i))+' '+n3(pos.getY(i))+' '+n3(pos.getZ(i)));
   let cols='';if(vc){const a=[];for(let i=0;i<N;i++){c.setRGB(vc.getX(i),vc.getY(i),vc.getZ(i)).convertLinearToSRGB();a.push(n3(c.r)+' '+n3(c.g)+' '+n3(c.b))}cols=` colorPerVertex TRUE color Color{color[${a.join(',')}]}`}
   const name='G'+defs.size;defs.set(key,name);total+=N;geo=`DEF ${name} IndexedFaceSet{solid FALSE creaseAngle 0.9${cols} coord Coordinate{point[${pts.join(',')}]} coordIndex[${tris.join(',')}]}`}
  const body=`Shape{${app} geometry ${geo}}`;
  if(e.isInstancedMesh){for(let k=0;k<e.count;k++){e.getMatrixAt(k,m);m.premultiply(e.matrixWorld);place(m,k===0?body:`Shape{${app} geometry USE ${defs.get(key)}}`)}}else{m.copy(e.matrixWorld);place(m,body)}});
 o.push(`# ${shapes} shapes placed from ${defs.size} shared geometries, ${total} vertices${skipped?' ('+skipped+' oversize meshes left out)':''}.`);
 return o.join('\n')+'\n';
}
