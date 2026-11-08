import {THREE,clamp,lerp,smooth} from './util.js';
const col=(h)=>new THREE.Color(h);
/* key: sun elevation in degrees → palette */
const KEYS=[
 {e:-22,z:col('#05031a'),h:col('#160a34'),g:col('#1e0c3c'),sun:col('#8a7ce0'),si:.34,env:.1,fog:col('#120830')},
 {e:-6,z:col('#120a3a'),h:col('#5a1a5e'),g:col('#c2306e'),sun:col('#ff4f8a'),si:.2,env:.18,fog:col('#3a1446')},
 {e:1,z:col('#2a1a66'),h:col('#ff5f8f'),g:col('#ff7a3c'),sun:col('#ff6a5a'),si:1.5,env:.4,fog:col('#b0507a')},
 {e:8,z:col('#3a3a9a'),h:col('#ff9a8a'),g:col('#ffb04a'),sun:col('#ffa070'),si:2.4,env:.58,fog:col('#d08a9a')},
 {e:24,z:col('#1f6fbf'),h:col('#9fe6f0'),g:col('#ffe0c8'),sun:col('#fff0d8'),si:2.9,env:.74,fog:col('#a8d8e6')},
 {e:70,z:col('#1a6ec8'),h:col('#a8eef4'),g:col('#fff0dc'),sun:col('#fff6e6'),si:3.1,env:.8,fog:col('#b0e0ea')}];
export function palette(e){let a=KEYS[0],b=KEYS[KEYS.length-1];for(let i=0;i<KEYS.length-1;i++)if(e>=KEYS[i].e&&e<=KEYS[i+1].e){a=KEYS[i];b=KEYS[i+1];break}if(e<KEYS[0].e)b=a;const t=b===a?0:clamp((e-a.e)/(b.e-a.e));
 return{z:a.z.clone().lerp(b.z,t),h:a.h.clone().lerp(b.h,t),g:a.g.clone().lerp(b.g,t),sun:a.sun.clone().lerp(b.sun,t),si:lerp(a.si,b.si,t),env:lerp(a.env,b.env,t),fog:a.fog.clone().lerp(b.fog,t)}}
export function makeSky(){const u={sunDir:{value:new THREE.Vector3(0,1,0)},zen:{value:new THREE.Color()},hor:{value:new THREE.Color()},glo:{value:new THREE.Color()},time:{value:0},night:{value:0},cloudLit:{value:new THREE.Color()},storm:{value:0},flash:{value:0},stormC:{value:new THREE.Color(.3,.33,.37)}};
 const m=new THREE.ShaderMaterial({uniforms:u,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
 vertexShader:`varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*mat4(mat3(modelViewMatrix))*vec4(position,1.);gl_Position=p.xyww;}`,
 fragmentShader:`varying vec3 vD;uniform vec3 sunDir,zen,hor,glo,cloudLit,stormC;uniform float time,night,storm,flash;
 float H(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float N(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),f.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),f.x),f.y);}
 float F(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*N(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
 void main(){vec3 d=normalize(vD);float y=max(d.y,0.);
  vec3 c=mix(hor,zen,pow(y,.48));
  float sd=max(dot(d,sunDir),0.);float az=max(dot(normalize(vec3(d.x,0.,d.z)+1e-4),normalize(vec3(sunDir.x,1e-4,sunDir.z))),0.);
  float band=exp(-y*7.)*pow(az,3.);c=mix(c,glo,band*.95);
  c+=glo*pow(sd,10.)*.35;c+=vec3(1.,.93,.8)*pow(sd,1800.)*30.*step(-.04,sunDir.y)*(1.-storm);c+=glo*pow(sd,120.)*.8;
  /* moon */
  vec3 md=normalize(vec3(-sunDir.x,abs(sunDir.y)+.25,-sunDir.z));float ms=dot(d,md);c+=vec3(.86,.9,1.)*smoothstep(.99955,.99975,ms)*night*2.5;c+=vec3(.5,.6,.9)*pow(max(ms,0.),300.)*night*.4;
  /* stars */
  vec2 sp=d.xz/(d.y+.35)*180.;float st=step(.9972,H(floor(sp)))*smoothstep(.45,.1,length(fract(sp)-.5));c+=vec3(.95,.97,1.)*st*night*(.5+.5*sin(time*2.+H(floor(sp))*40.))*smoothstep(.02,.2,d.y);
  /* clouds */
  if(d.y>.005){vec2 q=d.xz/(d.y+.12)*1.15+vec2(time*.006,time*.002);float n=F(q);float n2=F(q*2.6+7.);float cov=smoothstep(.5-storm*.34,.78-storm*.2,n+.16*n2-.04);float light=clamp(F(q+sunDir.xz*.18)-n+.55,0.,1.);
   vec3 cc=mix(cloudLit*.42+zen*.22,cloudLit,light);cc+=glo*band*.5;c=mix(c,cc,cov*smoothstep(.005,.14,d.y)*.92);
   float dk=mix(1.,.62,smoothstep(.45,.75,n));c=mix(c,stormC*dk,storm*.86);c+=vec3(.72,.78,1.)*flash*(.28+n*1.1)*smoothstep(0.,.25,d.y);}
  /* below the horizon: blends into sea haze */
  if(d.y<=.005)c=mix(mix(hor,hor*.55,smoothstep(0.,-.2,d.y)),stormC,storm*.75);
  gl_FragColor=vec4(c,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
 const me=new THREE.Mesh(new THREE.SphereGeometry(10,32,16),m);me.frustumCulled=false;me.renderOrder=-10;return{mesh:me,u}}
export function makeWater(depth,normalTex,quality){normalTex.wrapS=normalTex.wrapT=THREE.RepeatWrapping;
 const u={time:{value:0},sunDir:{value:new THREE.Vector3()},sunCol:{value:new THREE.Color()},zen:{value:new THREE.Color()},hor:{value:new THREE.Color()},fogC:{value:new THREE.Color()},fogD:{value:.0003},cam:{value:new THREE.Vector3()},tDepth:{value:depth.t},span:{value:depth.span},tN:{value:normalTex},lit:{value:1},night:{value:0},gain:{value:1}};
 const rings=quality<1?100:110,seg=quality<1?80:128;const P=[],I=[];for(let r=0;r<=rings;r++){const R=r===0?0:1.6*Math.pow(1.078,r)-1.6+r*.55;for(let s=0;s<seg;s++){const a=s/seg*6.2832;P.push(Math.cos(a)*R,0,Math.sin(a)*R)}}
 for(let r=0;r<rings;r++)for(let s=0;s<seg;s++){const a=r*seg+s,b=r*seg+(s+1)%seg,c=(r+1)*seg+s,d=(r+1)*seg+(s+1)%seg;I.push(a,b,c,b,d,c)}
 /* skirt to the horizon */
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:true,
 vertexShader:`uniform float time,span,gain;uniform vec3 cam;uniform sampler2D tDepth;varying vec3 vW;varying float vH;
 float W(vec2 p,float t){float h=0.;h+=.34*sin(dot(p,vec2(.083,.047))+t*.9);h+=.22*sin(dot(p,vec2(-.061,.103))+t*1.13);h+=.11*sin(dot(p,vec2(.19,-.14))+t*1.7);h+=.055*sin(dot(p,vec2(-.31,-.27))+t*2.3);return h;}
 void main(){vec3 p=position;p.xz+=floor(cam.xz);vec2 uv=p.xz/span+.5;float bed=texture2D(tDepth,uv).r*18.-14.;vH=bed;float dep=clamp(-bed/3.5,.08,1.);float d=length(position.xz);p.y=W(p.xz,time)*dep*gain*smoothstep(1400.,300.,d);vW=p;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float time,span,fogD,lit,night;uniform vec3 sunDir,sunCol,zen,hor,fogC,cam;uniform sampler2D tDepth,tN;varying vec3 vW;varying float vH;
 void main(){vec2 uv=vW.xz/span+.5;float bed=texture2D(tDepth,uv).r*18.-14.;float dep=max(vW.y-bed,0.);float dist=length(cam-vW);
  vec2 q=vW.xz;float t=time;
  vec3 n1=texture2D(tN,q*.021+vec2(t*.011,t*.006)).xyz*2.-1.;vec3 n2=texture2D(tN,q*.059+vec2(-t*.018,t*.024)).xyz*2.-1.;vec3 n3=texture2D(tN,q*.0049+vec2(t*.003,-t*.004)).xyz*2.-1.;vec3 n4=texture2D(tN,q*.17+vec2(t*.04,t*.03)).xyz*2.-1.;
  float falloff=mix(1.,.34,smoothstep(40.,1100.,dist));
  vec3 n=normalize(vec3((n1.x*.65+n2.x*.45+n3.x*.5+n4.x*.25)*falloff,3.0,(n1.y*.65+n2.y*.45+n3.y*.5+n4.y*.25)*falloff));
  vec3 V=normalize(cam-vW);vec3 R=reflect(-V,n);R.y=abs(R.y);
  float F=.02+.98*pow(1.-max(dot(n,V),0.),5.);
  vec3 sky=mix(hor,zen,pow(R.y,.5));float az=max(dot(normalize(vec3(R.x,1e-3,R.z)),normalize(vec3(sunDir.x,1e-3,sunDir.z))),0.);sky+=sunCol*.32*exp(-R.y*6.)*pow(az,4.)*step(-.1,sunDir.y);
  /* colour by depth: Gulf-coast turquoise over sand, navy in the deep */
  vec3 deep=vec3(.006,.052,.095),mid=vec3(.012,.185,.235),shal=vec3(.09,.50,.47);
  vec3 body=mix(shal,mid,smoothstep(.2,3.8,dep));body=mix(body,deep,smoothstep(3.,20.,dep));body*=lit;
  body+=vec3(.05,.18,.16)*pow(max(dot(n,sunDir),0.),2.)*smoothstep(.0,.6,sunDir.y)*(1.-smoothstep(1.,14.,dep));
  vec3 c=mix(body,sky,F);
  /* sun or moon on the water */
  vec3 L=sunDir.y>-.05?sunDir:normalize(vec3(-sunDir.x,abs(sunDir.y)+.25,-sunDir.z));vec3 Hv=normalize(L+V);float sp=pow(max(dot(n,Hv),0.),sunDir.y>-.05?520.:240.);c+=(sunDir.y>-.05?sunCol*5.5:vec3(.7,.8,1.)*1.1)*sp;
  /* breaking foam along the shore, moving in sets */
  float fn=texture2D(tN,q*.09+vec2(t*.012,0.)).r+texture2D(tN,q*.31-vec2(0.,t*.03)).g*.6;
  float wave=sin(dep*3.1-t*.75+fn*4.5);float line=smoothstep(.25,1.,wave)*smoothstep(1.7,.25,dep);
  float edge=smoothstep(.34,.03,dep);float foam=clamp((line*.75+edge)*smoothstep(.72,1.15,fn),0.,1.);
  c=mix(c,mix(vec3(.75,1.,.98)*(.15+lit),vec3(.2,1.,.95)*1.5,clamp(night+.15,0.,1.)),foam*(1.-smoothstep(120.,380.,dist)));
  /* fog */
  float f=1.-exp(-fogD*fogD*dist*dist);c=mix(c,fogC,f);
  float alpha=clamp(mix(smoothstep(.0,.55,dep)*.92,1.,smoothstep(.5,2.6,dep))+foam,0.,1.);
  gl_FragColor=vec4(c,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
 const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.renderOrder=2;return{mesh:me,u}}
/* same waves on the CPU, for the boat */
export const sea={gain:1};
export const waveAt=(x,z,t)=>sea.gain*(.34*Math.sin(x*.083+z*.047+t*.9)+.22*Math.sin(-x*.061+z*.103+t*1.13)+.11*Math.sin(x*.19-z*.14+t*1.7)+.055*Math.sin(-x*.31-z*.27+t*2.3));
/* Soft additive lights, one draw call */
export function makeGlows(tex,cap=500){const g=new THREE.BufferGeometry();const P=new Float32Array(cap*3),C=new Float32Array(cap*4),S=new Float32Array(cap);g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(C,4));g.setAttribute('size',new THREE.BufferAttribute(S,1));g.setDrawRange(0,0);
 const u={t:{value:tex},scale:{value:600},fogC:{value:new THREE.Color()},fogD:{value:.0003},gain:{value:1}};
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`attribute vec4 color;attribute float size;uniform float scale;varying vec4 vC;varying float vD;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_PointSize=min(size*scale/-mv.z,520.);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform sampler2D t;uniform float fogD,gain;varying vec4 vC;varying float vD;void main(){float a=gain*texture2D(t,gl_PointCoord).a*vC.a*exp(-fogD*fogD*vD*vD);if(a<.003)discard;gl_FragColor=vec4(vC.rgb*a,a);
 #include <colorspace_fragment>
 }`});
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=5;let n=0;
 return{pts,u,cap,add(x,y,z,s,r,gc,b,a=1){if(n>=cap)return-1;P[n*3]=x;P[n*3+1]=y;P[n*3+2]=z;C[n*4]=r;C[n*4+1]=gc;C[n*4+2]=b;C[n*4+3]=a;S[n]=s;n++;return n-1},set(i,x,y,z,s,a){if(i<0)return;P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z;S[i]=s;C[i*4+3]=a},alpha(i,a){if(i>=0)C[i*4+3]=a},sync(){g.setDrawRange(0,n);g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.attributes.size.needsUpdate=true},get count(){return n}}}
