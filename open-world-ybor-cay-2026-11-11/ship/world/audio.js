/* All synthesized live. No samples, no licensing. */
let radioOn=false;let C,master,sea,wind,seaF,beatG,muted=false,timer=null,started=false,noiseB,whiteB,rainG,patG,gust=0;
export const audio={
 start(){if(started){if(C&&C.state!=='running')C.resume().catch(()=>{});return}try{C=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}started=true;const wake=()=>{if(C&&C.state!=='running')C.resume().catch(()=>{})};['pointerdown','touchend','keydown','click'].forEach(ev=>addEventListener(ev,wake,{passive:true,capture:true}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});try{const sb=C.createBuffer(1,1,22050),ss=C.createBufferSource();ss.buffer=sb;ss.connect(C.destination);ss.start(0)}catch(e){}if(C.state!=='running')C.resume().catch(()=>{});master=C.createGain();master.gain.value=muted?0:.8;master.connect(C.destination);
  noiseB=C.createBuffer(1,C.sampleRate*3,C.sampleRate);const d=noiseB.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;l=l*.985+w*.05;d[i]=l*2.4+w*.08}
  const src=()=>{const s=C.createBufferSource();s.buffer=noiseB;s.loop=true;s.start();return s};
  seaF=C.createBiquadFilter();seaF.type='lowpass';seaF.frequency.value=900;sea=C.createGain();sea.gain.value=.2;src().connect(seaF).connect(sea).connect(master);
  const wf=C.createBiquadFilter();wf.type='bandpass';wf.frequency.value=420;wf.Q.value=.6;wind=C.createGain();wind.gain.value=.05;src().connect(wf).connect(wind).connect(master);
  whiteB=C.createBuffer(1,C.sampleRate*3,C.sampleRate);{const w=whiteB.getChannelData(0);for(let i=0;i<w.length;i++)w[i]=Math.random()*2-1}
  const ws=()=>{const s=C.createBufferSource();s.buffer=whiteB;s.loop=true;s.start();return s};
  const rh=C.createBiquadFilter();rh.type='highpass';rh.frequency.value=3200;const rl=C.createBiquadFilter();rl.type='lowpass';rl.frequency.value=9500;rainG=C.createGain();rainG.gain.value=0;ws().connect(rh).connect(rl).connect(rainG).connect(master);
  const pb=C.createBiquadFilter();pb.type='bandpass';pb.frequency.value=1100;pb.Q.value=.5;patG=C.createGain();patG.gain.value=0;ws().connect(pb).connect(patG).connect(master);
  const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;beatG=C.createGain();beatG.gain.value=0;beatG.connect(lp).connect(master);this.loop()},
 loop(){/* Grotto FM with DJ Bouche: three original grooves in rotation. Miami bass with an 808 boom, East Coast boom-bap, and a neon-night synth cruise. */
  let tr=0,n=0,next=C.currentTime+.1,s=.1,sw=0,said=false;const at=()=>next+((n%2)?sw:0);
  const hit=(f,d,type,v,slide,t=at())=>{const o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(beatG);o.start(t);o.stop(t+d+.02)};
  const nz=(d,v,f,t=at(),type='highpass')=>{const b=C.createBufferSource();b.buffer=whiteB;const h=C.createBiquadFilter();h.type=type;h.frequency.value=f;const g=C.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);b.connect(h).connect(g).connect(beatG);b.start(t,Math.random()*2);b.stop(t+d+.02)};
  const keys=(fs,d,v,type='triangle',atk=.012)=>{const t=at();for(const f of fs){const o=C.createOscillator(),o2=C.createOscillator(),g=C.createGain();o.type=type;o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.005;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+atk);g.gain.exponentialRampToValueAtTime(v*.45,t+Math.max(atk+.05,d*.3));g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);o2.connect(g);g.connect(beatG);o.start(t);o2.start(t);o.stop(t+d+.03);o2.stop(t+d+.03)}};
  const BASS=[55,0,0,55,0,0,65.41,0,0,55,0,0,82.41,0,73.42,0, 43.65,0,0,43.65,0,0,55,0,0,43.65,0,0,49,0,51.91,0],KICK=[1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0, 1,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0],CH=[[220,261.63,329.63,392,493.88],[174.61,220,261.63,329.63,392]],LEAD={38:659.25,40:587.33,43:523.25,46:440,54:392,56:440,102:783.99,104:659.25,107:587.33,110:523.25,118:440,120:493.88};
  const MK=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0, 1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],MC=[0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0],MA=[293.66,349.23,440,587.33,440,349.23,293.66,220,261.63,329.63,392,523.25,392,329.63,261.63,196];
  const VR=[55,43.65,65.41,49],VC=[[220,261.63,329.63],[174.61,220,261.63],[196,261.63,329.63],[196,246.94,293.66]],VL={0:659.25,6:587.33,8:523.25,14:493.88,16:523.25,22:440,32:783.99,38:659.25,40:587.33,44:659.25,48:587.33,54:493.88,56:440};
  const T=[
   {name:'Bayshore Bass',bpm:126,sw:0,len:512,step(n){const i=n%32,j=n%16;
     if(MK[i]){hit(62,.6,'sine',.95,36);hit(180,.03,'triangle',.3,60)}
     if(j==4||j==12){nz(.11,.4,1300,at(),'bandpass');nz(.1,.3,1300,at()+.018,'bandpass')}
     nz(.02,j%2?.07:.13,8500);if(j%4==2)nz(.12,.1,6500);
     if(MC[j]){hit(800,.07,'square',.05);hit(540,.07,'square',.04)}
     if(i==0)keys([146.83,220,293.66,349.23],.9,.03,'sawtooth');if(i==16)keys([130.81,196,261.63,329.63],.9,.03,'sawtooth');
     if(n%64>=32)hit(MA[j],.09,'square',.028)}},
   {name:'Seventh Avenue Boom-Bap',bpm:90,sw:.32,len:256,step(n){const i=n%32,j=n%16,L=n%128;
     if(KICK[i]){hit(118,.3,'sine',.95,40);nz(.02,.12,900,at(),'lowpass')}
     if(j==4||j==12){nz(.17,.5,1500);hit(190,.11,'triangle',.3,120)}
     if(j%2==0)nz(.035,j%4==2?.2:.13,7200);else if(j==7||j==15)nz(.025,.07,8000);
     if(BASS[i]){hit(BASS[i],.34,'triangle',.5);hit(BASS[i]*2,.2,'sine',.12)}
     if(i==0)keys(CH[0],1.5,.05);if(i==16)keys(CH[1],1.5,.05);if(i==10||i==26)keys(CH[i<16?0:1].slice(1,4).map(f=>f*2),.35,.022);
     if(LEAD[L])hit(LEAD[L],.3,'triangle',.07)}},
   {name:'Causeway After Dark',bpm:104,sw:0,len:384,step(n){const i=n%64,j=n%16,b=Math.floor(i/16);
     if(j%4==0)hit(105,.26,'sine',.85,42);
     if(j==4||j==12){nz(.3,.42,1100);hit(200,.14,'triangle',.25,130)}
     if(j%2==0){nz(.03,.1,7800);hit(VR[b]*(j%4==2?2:1),.2,'sawtooth',.13)}
     if(j==0)keys(VC[b].concat(VC[b].map(f=>f*2)),2.2,.022,'sawtooth',.25);
     hit(VC[b][n%3]*2,.11,'triangle',.035);
     if(VL[i]&&n%128>=64)hit(VL[i],.34,'sawtooth',.03)}}];
  const setT=()=>{s=60/T[tr].bpm/4;sw=s*T[tr].sw};setT();
  timer=setInterval(()=>{if(!C||!radioOn||muted){if(C)next=C.currentTime+.1;return}if(!said){said=true;if(audio.onTrack)audio.onTrack(T[tr].name)}while(next<C.currentTime+.25){T[tr].step(n);if(Math.random()<.2)nz(.006,.03,4500,next+Math.random()*s);next+=s;n++;if(n>=T[tr].len){n=0;tr=(tr+1)%T.length;setT();if(audio.onTrack)audio.onTrack(T[tr].name)}}},60)},
 update(shore,beat,speed){if(!started)return;const t=C.currentTime;sea.gain.setTargetAtTime(.05+shore*.34,t,.4);seaF.frequency.setTargetAtTime(500+shore*1100+Math.sin(t*.4)*200,t,.5);wind.gain.setTargetAtTime(.025+Math.min(speed,12)*.008+gust*.11,t,.8);beatG.gain.setTargetAtTime(radioOn&&!muted?.34:0,t,.4)},
 radio(on){radioOn=on===undefined?!radioOn:on;if(started&&beatG)beatG.gain.setTargetAtTime(radioOn?.34:0,C.currentTime,.3);return radioOn},get radioOn(){return radioOn},
 tone(f,d,v=.12,type='sine',f2){if(!started||muted)return;const o=C.createOscillator(),g=C.createGain(),t=C.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(master);o.start();o.stop(t+d+.03)},
 coin(){this.tone(1320,.09,.11,'triangle');setTimeout(()=>this.tone(1980,.22,.1,'triangle'),70)},
 step(sand){if(!started||muted)return;const b=C.createBufferSource();b.buffer=noiseB;const f=C.createBiquadFilter();f.type=sand?'highpass':'lowpass';f.frequency.value=sand?1100:500;const g=C.createGain(),t=C.currentTime;g.gain.setValueAtTime(sand?.09:.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);b.connect(f).connect(g).connect(master);b.start(t,Math.random()*2);b.stop(t+.1)},
 gull(v=1){const n=2+(Math.random()*3|0),f=1500+Math.random()*500;for(let i=0;i<n;i++)setTimeout(()=>this.tone(f-i*60,.17,.02*v,'sawtooth',f*.55),i*190)},
 parrot(){if(!started||muted)return;const t=C.currentTime,o=C.createOscillator(),l=C.createOscillator(),lg=C.createGain(),g=C.createGain(),f=C.createBiquadFilter();const b=1100+Math.random()*700,k=2+(Math.random()*2|0);o.type='sawtooth';o.frequency.setValueAtTime(b,t);l.frequency.value=48;lg.gain.value=320;l.connect(lg).connect(o.frequency);f.type='bandpass';f.frequency.value=2100;f.Q.value=1.4;g.gain.setValueAtTime(0,t);for(let i=0;i<k;i++){const s=t+i*.2;g.gain.setValueAtTime(.05,s);o.frequency.setValueAtTime(b*(1+i*.12),s);o.frequency.exponentialRampToValueAtTime(b*.68,s+.15);g.gain.exponentialRampToValueAtTime(.001,s+.17)}o.connect(f).connect(g).connect(master);o.start(t);l.start(t);o.stop(t+k*.2+.05);l.stop(t+k*.2+.05)},
 flap(v=1){if(!started||muted)return;const t=C.currentTime;for(let i=0;i<7;i++){const b=C.createBufferSource();b.buffer=noiseB;const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=700+i*60;const g=C.createGain(),s=t+i*.085;g.gain.setValueAtTime(.001,s);g.gain.exponentialRampToValueAtTime(.16*v*(1-i*.1),s+.02);g.gain.exponentialRampToValueAtTime(.001,s+.075);b.connect(f).connect(g).connect(master);b.start(s,Math.random()*2);b.stop(s+.09)}},
 rain(v){gust=v;if(!started)return;const t=C.currentTime;rainG.gain.setTargetAtTime(v*.085,t,.7);patG.gain.setTargetAtTime(v*.035,t,.7)},
 thunder(v=1,delay=0){if(!started||muted)return;const t=C.currentTime+delay,b=C.createBufferSource();b.buffer=noiseB;b.loop=true;const f=C.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(420,t);f.frequency.exponentialRampToValueAtTime(70,t+3.6);const g=C.createGain();g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.9*v,t+.12);g.gain.setTargetAtTime(.5*v,t+.3,.35);g.gain.setTargetAtTime(.001,t+1.1,1.1);b.connect(f).connect(g).connect(master);b.start(t,Math.random()*2);b.stop(t+6)},
 chest(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.tone(f,.32,.13,'triangle'),i*110))},
 cheer(){[392,523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>this.tone(f,.4,.12,'triangle'),i*130))},
 duck(on){if(!started||!master)return;master.gain.setTargetAtTime(on||muted?0:.8,C.currentTime,.15);if(on&&window.speechSynthesis)try{speechSynthesis.cancel()}catch(e){}},
 toggle(){muted=!muted;if(master)master.gain.value=muted?0:.8;if(muted&&window.speechSynthesis)try{speechSynthesis.cancel()}catch(e){}return muted},get muted(){return muted}};
