/* Rain, ripples and lightning over Ybor Cay. © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
import {THREE} from './util.js';
const BOX=46;
export function makeRain(QL){
 const cap=QL>=1?2600:QL>=.5?1600:900,S=new Float32Array(cap*4*4),E=new Float32Array(cap*4*2),I=new Uint32Array(cap*6);
 for(let i=0;i<cap;i++){const x=Math.random(),y=Math.random(),z=Math.random(),k=Math.random();for(let v=0;v<4;v++){S.set([x,y,z,k],(i*4+v)*4);E.set([v<2?0:1,v%2?1:-1],(i*4+v)*2)}I.set([i*4,i*4+1,i*4+2,i*4+1,i*4+3,i*4+2],i*6)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(cap*4*3),3));g.setAttribute('aS',new THREE.BufferAttribute(S,4));g.setAttribute('aE',new THREE.BufferAttribute(E,2));g.setIndex(new THREE.BufferAttribute(I,1));g.setDrawRange(0,0);
 const u={time:{value:0},cam:{value:new THREE.Vector3()},col:{value:new THREE.Color(.8,.85,.9)},alpha:{value:.62},wind:{value:new THREE.Vector2(3.4,1.5)},px:{value:.0034}};
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide,
 vertexShader:`attribute vec4 aS;attribute vec2 aE;uniform float time,px;uniform vec3 cam;uniform vec2 wind;varying float vA;
 const float B=${BOX.toFixed(1)};
 void main(){float sp=23.+aS.w*9.;vec3 v=vec3(wind.x,-sp,wind.y);vec3 p=aS.xyz*B+v*time;p=mod(p-cam+B*.5,B)-B*.5+cam;
  vec3 tail=p-v*(.03+aS.w*.018);
  vec4 a=projectionMatrix*viewMatrix*vec4(p,1.),b=projectionMatrix*viewMatrix*vec4(tail,1.);
  if(a.w<.4||b.w<.4){gl_Position=vec4(2.,2.,2.,1.);vA=0.;return;}
  vec2 d=b.xy/b.w-a.xy/a.w;d=normalize(d+1e-5);vec2 n=vec2(-d.y,d.x);vec4 c=mix(a,b,aE.x);c.xy+=n*aE.y*px*(.6+aS.w*.8)*c.w/max(c.w*.09,1.);gl_Position=c;
  vA=(.45+aS.w*.55)*smoothstep(B*.5,B*.3,length(p-cam))*mix(.35,1.,aE.x);}`,
 fragmentShader:`uniform vec3 col;uniform float alpha;varying float vA;void main(){float a=alpha*vA;if(a<.004)discard;gl_FragColor=vec4(col,a);
 #include <colorspace_fragment>
 }`});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=7;mesh.visible=false;
 return{mesh,u,set(v,t,c){mesh.visible=v>.01;g.setDrawRange(0,Math.round(cap*Math.min(1,v))*6);u.time.value=t;u.cam.value.copy(c)}}}
/* Rings where drops land, on sand, decks and the sea. */
export function makeRipples(QL){const cap=QL>=1?170:90,g=new THREE.InstancedBufferGeometry();const p=new THREE.PlaneGeometry(1,1);p.rotateX(-Math.PI/2);g.index=p.index;g.setAttribute('position',p.attributes.position);g.setAttribute('uv',p.attributes.uv);const S=new Float32Array(cap);g.setAttribute('aT',new THREE.InstancedBufferAttribute(S,1));g.instanceCount=cap;
 const O=new Float32Array(cap*4);g.setAttribute('aO',new THREE.InstancedBufferAttribute(O,4));
 const u={time:{value:0},col:{value:new THREE.Color(.8,.85,.9)},gain:{value:0}};
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide,
 vertexShader:`attribute float aT;attribute vec4 aO;uniform float time;varying vec2 vU;varying float vK;void main(){vU=uv-.5;vK=clamp((time-aT)/.55,0.,1.);vec3 q=position*aO.w+aO.xyz;gl_Position=projectionMatrix*viewMatrix*vec4(q,1.);}`,
 fragmentShader:`uniform vec3 col;uniform float gain;varying vec2 vU;varying float vK;void main(){float r=length(vU)*2.,R=mix(.08,.92,vK),w=mix(.1,.035,vK);float a=smoothstep(w,0.,abs(r-R))*(1.-vK)*gain;if(a<.004)discard;gl_FragColor=vec4(col,a);
 #include <colorspace_fragment>
 }`});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6;mesh.visible=false;let n=0,acc=0;
 return{mesh,u,update(dt,t,v,c,ground,sea){u.time.value=t;u.gain.value=.6*Math.min(1,v*1.4);mesh.visible=v>.02;if(!mesh.visible)return;acc+=dt*v*(cap/.55);let d=false;while(acc>=1){acc-=1;const a=Math.random()*6.283,r=2+Math.sqrt(Math.random())*30,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,h=ground(x,z);const y=h<.05?sea(x,z,t,h)+.05:h+.05;O.set([x,y,z,.45+Math.random()*.55],n*4);S[n]=t;n=(n+1)%cap;d=true}if(d){g.attributes.aO.needsUpdate=true;g.attributes.aT.needsUpdate=true}}}}
