/* Pirates of Ybor beat engine: original East Coast and West Coast instrumentals,
   made in the browser (no samples, nothing copied). DJ Bouche on deck.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
(function(){
  if(window.PoyBeats)return;
  var AC=window.AudioContext||window.webkitAudioContext;
  var ctx=null,master=null,drumBus=null,musBus=null,noiseBuf=null;
  var on=false,timer=null,next=0,step=0,drop=0,lastBass=0,lastLead=0,pending=null,boom=false;
  var listeners=[],stateListeners=[];
  var S_NAMES=["east","west","miami","dubstep","rave"];
  var style="east",pref="east";
  /* Each room gets the sound that fits it, until the player picks one. */
  var PAGE={"index.html":"east","arcade.html":"east","chess.html":"east","trivia.html":"east","crew.html":"west","pool.html":"west","golf.html":"west","surfshop.html":"west","island.html":"miami","plank-bar.html":"miami","mixology.html":"miami","cuppong.html":"miami","flipcup.html":"miami","skate.html":"rave","skate-classic.html":"rave","acropolis.html":"dubstep","swashbuckle.html":"dubstep","armwrestle.html":"dubstep","world-classic.html":"miami"};
  var forceMute=null;
  try{var pg=location.pathname.split("/").pop()||"index.html";if(/\/world\//.test(location.pathname))pg="world-classic.html";var dp=(document.body&&document.body.getAttribute("data-beat"))||PAGE[pg];if(dp&&S_NAMES.indexOf(dp)>=0){style=pref=dp;}}catch(e){}
  try{var sv=localStorage.getItem("py_beat");if(sv==="off"||S_NAMES.indexOf(sv)>=0)pref=sv;}catch(e){}
  if(pref!=="off")style=pref;

  var S={
    east:{name:"East Coast",bpm:91,swing:.6,
      kick:["x......x..x.....","x.........x..x..","x......x..x.....","x..x......x..x.x"],
      snare:["....x.......x...","....x.......x...","....x.......x...","....x.......x..g"],
      hat:["x.x.x.x.x.x.x.x.","x.x.x.x.x.x.xox.","x.x.x.x.x.x.x.x.","x.x.x.xxx.x.xox."],
      roots:[38,34,31,33],
      chords:[[50,53,57,60,64],[46,50,53,57,60],[55,58,62,65],[57,61,64,67]],
      stab:["x.....x.........","x.....x....x....","x.....x.........","x.....x...x....."],
      mel:[[[3,69],[5,72],[8,74]],[],[[3,70],[5,69],[8,65]],[[11,64],[13,62]]]},
    west:{name:"West Coast",bpm:95,swing:.54,
      kick:["x.....x.x.......","x.....x.x..x....","x.....x.x.......","x.....x.x..x..x."],
      snare:["....x.......x...","....x.......x...","....x.......x...","....x.......x.x."],
      hat:["xxxxxxxxxxxxxxxx","xxxxxxoxxxxxxxox","xxxxxxxxxxxxxxxx","xxxxxxoxxxxxxoxx"],
      roots:[29,37,34,36],
      bass:{0:0,3:0,6:3,8:0,11:7,14:10},
      chords:[[53,56,60,63],[49,53,56,60],[53,56,58,61],[52,55,58,60]],
      lead:[[[0,84,6],[8,87,3],[12,89,4]],[[0,92,4],[6,89,2],[8,87,6]],[[0,89,3],[4,87,2],[6,84,6],[14,82,2]],[[0,84,10],[12,87,2],[14,84,2]]]},
    miami:{name:"Miami Bass",bpm:128,swing:.5,
      kick:["x..x..x...x..x..","x..x..x...x.x...","x..x..x...x..x..","x..x..x..xx.x.x."],
      snare:["....x.......x...","....x.......x...","....x.......x...","....x.......x.xx"],
      hat:["x.xxx.xxx.xxx.xx","x.xxx.xxx.xxxoxx","x.xxx.xxx.xxx.xx","xxxxx.xxxoxxxxxx"],
      bell:["..x...x..x..x...","..x...x..x..x.x.","..x...x..x..x...","..x.x.x..x..x.x."],
      roots:[33,33,29,31],arp:[[57,60,64,69],[57,60,64,72],[53,57,60,65],[55,59,62,67]]},
    dubstep:{name:"Dubstep",bpm:140,swing:.5,
      kick:["x.........x.....","x.....x...x.....","x.........x.....","x.....x...x..x.."],
      snare:["........x.......","........x.......","........x.......","........x.....x."],
      hat:["..x...x...x...x.","..x...x.x.x...x.","..x...x...x...x.","..x.x.x...x.x.xo"],
      roots:[28,28,31,26],wob:[1,2,1.5,4],eerie:[[0,76],[],[0,79],[8,75]]},
    rave:{name:"Rave",bpm:138,swing:.5,
      kick:["x...x...x...x...","x...x...x...x...","x...x...x...x...","x...x...x...x.x."],
      snare:["....x.......x...","....x.......x...","....x.......x...","....x.......xxxx"],
      hat:["x.oxx.oxx.oxx.ox","x.oxx.oxx.oxx.ox","x.oxx.oxx.oxx.ox","x.oxx.oxx.oxx.ox"],
      roots:[33,33,29,31],chords:[[57,60,64],[57,60,64],[53,57,60],[55,59,62]],
      stab:["x..x..x...x..x..","x..x..x...x.....","x..x..x...x..x..","x..x..x...x.x.x."],
      arp:[[69,72,76,81],[69,72,76,84],[65,69,72,77],[67,71,74,79]]}
  };
  var ORDER=["east","west","miami","dubstep","rave"];
  function mtof(m){return 440*Math.pow(2,(m-69)/12);}
  function isMuted(){if(forceMute!==null)return forceMute;var b=document.getElementById("soundBtn");if(b)return b.getAttribute("aria-pressed")==="false";try{return localStorage.getItem("py_mute")==="1";}catch(e){return false;}}

  function ensure(){
    if(ctx)return true;
    if(!AC)return false;
    try{ctx=new AC();}catch(e){return false;}
    var comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
    master=ctx.createGain();master.gain.value=0;master.connect(comp);comp.connect(ctx.destination);
    drumBus=ctx.createGain();drumBus.gain.value=1;drumBus.connect(master);
    musBus=ctx.createGain();musBus.gain.value=1;musBus.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    var d=noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    return true;
  }
  function noise(t,dur,type,freq,q,vol,bus,atk){
    var s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=noiseBuf;f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(atk||.002));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(bus||drumBus);s.start(t,Math.random());s.stop(t+dur+.05);return f;
  }
  function osc(t,type,f,dur,vol,bus,atk){
    var o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(atk||.005));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(bus||musBus);o.start(t);o.stop(t+dur+.05);return o;
  }
  function kick(t,v){var o=osc(t,"sine",150,.38,v||.95,drumBus,.002);o.frequency.exponentialRampToValueAtTime(44,t+.13);noise(t,.02,"highpass",3000,0,.12);}
  function snare(t,v){v=v||.5;noise(t,.2,"bandpass",1900,.7,v);noise(t,.12,"highpass",5200,0,v*.5);var o=osc(t,"triangle",200,.1,v*.5,drumBus,.002);o.frequency.exponentialRampToValueAtTime(120,t+.08);}
  function clap(t,v){v=v||.5;[0,.011,.023].forEach(function(d){noise(t+d,.03,"bandpass",1300,1.2,v*.8);});noise(t+.03,.22,"bandpass",1200,.9,v);}
  function hat(t,open,v){noise(t,open?.26:.045,"highpass",open?6500:8000,0,v||.12);}
  function keys(t,notes,dur,v){
    var f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(2400,t);f.frequency.exponentialRampToValueAtTime(700,t+dur);f.connect(musBus);
    notes.forEach(function(m,i){osc(t+i*.006,"triangle",mtof(m),dur,v,f,.006);osc(t+i*.006,"sine",mtof(m)*2,dur*.6,v*.3,f,.006);});
  }
  function subBass(t,m,dur,v){osc(t,"sine",mtof(m),dur,v,musBus,.008);osc(t,"triangle",mtof(m+12),dur*.7,v*.18,musBus,.008);}
  function funkBass(t,m,dur){
    var f=ctx.createBiquadFilter();f.type="lowpass";f.Q.value=7;f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(260,t+dur);f.connect(musBus);
    var fr=mtof(m),from=lastBass||fr;
    ["sawtooth","square"].forEach(function(tp,i){var o=osc(t,tp,from,dur,i?.1:.2,f,.006);o.frequency.exponentialRampToValueAtTime(fr,t+.05);if(i)o.detune.value=-8;});
    osc(t,"sine",fr,dur,.3,musBus,.006);lastBass=fr;
  }
  function lead(t,m,dur){
    var fr=mtof(m),from=lastLead||fr,o=ctx.createOscillator(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
    o.type="sine";o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(fr,t+.09);
    l.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(14,t+Math.min(.3,dur));l.connect(lg);lg.connect(o.detune);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.075,t+.03);g.gain.setValueAtTime(.075,t+dur*.8);g.gain.exponentialRampToValueAtTime(.0001,t+dur+.08);
    o.connect(g);g.connect(musBus);o.start(t);l.start(t);o.stop(t+dur+.15);l.stop(t+dur+.15);lastLead=fr;
  }
  function pad(t,notes,dur){
    var f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=1100;f.connect(musBus);
    notes.forEach(function(m){[-7,7].forEach(function(det){
      var o=ctx.createOscillator(),g=ctx.createGain();o.type="sawtooth";o.frequency.value=mtof(m);o.detune.value=det;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.016,t+.25);g.gain.setValueAtTime(.016,t+dur-.3);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g);g.connect(f);o.start(t);o.stop(t+dur+.05);});});
  }
  function kick808(t,m){var o=osc(t,"sine",150,.75,.95,drumBus,.002);o.frequency.exponentialRampToValueAtTime(mtof(m+12),t+.07);o.frequency.exponentialRampToValueAtTime(mtof(m),t+.3);noise(t,.015,"highpass",2500,0,.15);}
  function bell(t){osc(t,"square",587,.09,.05,drumBus,.002);osc(t,"square",845,.09,.045,drumBus,.002);}
  function pluck(t,m,dur,v,type){var f=ctx.createBiquadFilter();f.type="lowpass";f.Q.value=3;f.frequency.setValueAtTime(3800,t);f.frequency.exponentialRampToValueAtTime(600,t+dur);f.connect(musBus);osc(t,type||"square",mtof(m),dur,v,f,.004);}
  function supersaw(t,notes,dur,v){var f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(5200,t);f.frequency.exponentialRampToValueAtTime(900,t+dur);f.connect(musBus);
    notes.forEach(function(m){[-14,0,14].forEach(function(det){var o=osc(t,"sawtooth",mtof(m),dur,v,f,.004);o.detune.value=det;});});}
  function wobble(t,m,dur,rate){
    var f=ctx.createBiquadFilter(),l=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();
    f.type="lowpass";f.Q.value=9;f.frequency.value=950;l.type="sine";l.frequency.value=rate;lg.gain.value=820;l.connect(lg);lg.connect(f.frequency);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2,t+.02);g.gain.setValueAtTime(.2,t+dur-.05);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    f.connect(g);g.connect(musBus);
    [["sawtooth",12,0],["square",12,-9],["sawtooth",24,6]].forEach(function(a){var o=ctx.createOscillator();o.type=a[0];o.frequency.value=mtof(m+a[1]);o.detune.value=a[2];o.connect(f);o.start(t);o.stop(t+dur+.05);});
    l.start(t);l.stop(t+dur+.05);osc(t,"sine",mtof(m),dur,.4,musBus,.01);
  }
  function bassBoom(t){var o=osc(t,"sine",190,1.9,1,master,.004);o.frequency.exponentialRampToValueAtTime(30,t+1.1);osc(t,"triangle",95,.5,.25,master,.004);crash(t,.4);noise(t,.5,"lowpass",300,0,.6,master,.004);}
  function riserAt(t,len){var o=osc(t,"sawtooth",70,len,.07,master,len*.8);o.frequency.exponentialRampToValueAtTime(900,t+len);var n=noise(t,len,"bandpass",400,2,.11,master,len*.85);n.frequency.exponentialRampToValueAtTime(7000,t+len);
    for(var k=0;k<8;k++){var tt=t+len*(1-Math.pow(.72,k));if(tt<t+len-.03)noise(tt,.06,"bandpass",1900,.7,.12+k*.02,master);}}
  function toBar(){var left=16-(step%16);if(left<6)left+=16;return left;}
  function crash(t,v){noise(t,1.6,"highpass",4200,0,v||.3);}

  function stepDur(){return 60/S[style].bpm/4;}
  function swingOff(n){return n%2?(S[style].swing-.5)*2*stepDur():0;}
  function sched(n,t){
    var p=S[style],bar=Math.floor(n/16)%4,i=n%16,d=stepDur(),drums=!(drop>0);
    if(drums){
      if(p.kick[bar][i]==="x"){if(style==="miami")kick808(t,p.roots[bar]);else kick(t,style==="dubstep"?1:.95);}
      var sn=p.snare[bar][i];if(sn==="x"){if(style==="east")snare(t,.5);else if(style==="dubstep"){snare(t,.6);clap(t,.35);noise(t,.5,"bandpass",900,.6,.2);}else clap(t,.5);}else if(sn==="g")snare(t,.16);
      var h=p.hat[bar][i];if(h==="x")hat(t,false,style==="east"?(i%4===0?.13:.09):(i%4===0?.1:(i%2?.04:.065)));else if(h==="o")hat(t,true,.1);
      if(p.bell&&p.bell[bar][i]==="x")bell(t);
    }
    var loop2=Math.floor(n/64)%2===1;
    if(style==="east"){
      if(p.kick[bar][i]==="x")subBass(t,p.roots[bar]+(i===13?7:0),d*(i===0?5:3),.5);
      if(p.stab[bar][i]==="x")keys(t,p.chords[bar],i===0?d*5:d*2.4,i===0?.07:.045);
      p.mel[bar].forEach(function(m){if(m[0]===i)osc(t,"triangle",mtof(m[1]),d*2.2,.06,musBus,.004);});
      if(i===0&&bar===0&&loop2)noise(t,.5,"bandpass",2600,3,.05,musBus,.2);
    }else if(style==="west"){
      if(p.bass[i]!==undefined)funkBass(t,p.roots[bar]+p.bass[i],d*(i===0?2.6:1.8));
      if(i===0)pad(t,p.chords[bar],d*16);
      if(loop2)p.lead[bar].forEach(function(m){if(m[0]===i)lead(t,m[1],d*m[2]);});
    }else if(style==="miami"){
      if(!drums&&i===0)subBass(t,p.roots[bar],d*8,.5);
      var am=p.arp[bar];if(i%2===0||loop2)pluck(t,am[(i*3+(i>>2))%4]+(loop2&&i%4===3?12:0),d*1.1,.045,"square");
    }else if(style==="dubstep"){
      if(i===0)wobble(t,p.roots[bar],d*16-.02,p.wob[(bar+(loop2?1:0))%4]*S.dubstep.bpm/60);
      if(p.eerie[bar].length&&p.eerie[bar][0]===i){lastLead=0;lead(t,p.eerie[bar][1],d*7);}
    }else if(style==="rave"){
      if(i%4===2)pluck(t,p.roots[bar]+12,d*1.6,.16,"sawtooth");
      if(p.stab[bar][i]==="x")supersaw(t,p.chords[bar],d*1.5,.022);
      if(loop2)pluck(t,p.arp[bar][(i*5)%4],d*.9,.035,"sawtooth");
    }
    if(drop>0&&i===15){drop--;if(drop===0)crash(t+d,.3);}
    for(var k=0;k<listeners.length;k++){try{listeners[k](n,t,i,bar);}catch(e){}}
  }
  function tick(){
    if(!on||!ctx)return;
    if(ctx.state!=="running"){try{ctx.resume();}catch(e){}return;}
    if(next<ctx.currentTime-.2){next=ctx.currentTime+.05;}
    while(next<ctx.currentTime+.18){
      if(step%16===0&&(pending||boom)){
        if(pending&&S[pending]){style=pending;step=0;lastBass=0;lastLead=0;emit();}
        pending=null;boom=false;drop=0;bassBoom(next);
      }
      sched(step,next+swingOff(step));next+=stepDur();step++;
    }
  }
  function emit(){for(var k=0;k<stateListeners.length;k++){try{stateListeners[k]();}catch(e){}}label();}
  function vol(){if(master&&ctx)master.gain.setTargetAtTime(on&&!isMuted()?.55:0,ctx.currentTime,.08);}

  var api={
    styles:S,order:ORDER,
    start:function(s,explicit){
      if(s&&S[s]&&s!==style){style=s;step=0;lastBass=0;lastLead=0;if(ctx)next=ctx.currentTime+.08;}
      if(!ensure())return false;
      try{if(ctx.state!=="running")ctx.resume();}catch(e){}
      if(!on){on=true;step=0;drop=0;next=ctx.currentTime+.08;clearInterval(timer);timer=setInterval(tick,40);}
      pref=style;if(explicit!==false){try{localStorage.setItem("py_beat",style);}catch(e){}}
      var sh=document.getElementById("shantyBtn");if(sh&&sh.getAttribute("aria-pressed")==="true")sh.click();
      vol();emit();return true;
    },
    stop:function(remember){on=false;clearInterval(timer);vol();if(remember!==false){pref="off";try{localStorage.setItem("py_beat","off");}catch(e){}}emit();},
    isOn:function(){return on;},
    style:function(){return style;},
    pref:function(){return pref;},
    running:function(){return !!(ctx&&ctx.state==="running"&&on);},
    onStep:function(fn){listeners.push(fn);},
    onState:function(fn){stateListeners.push(fn);},
    clock:function(){if(!ctx)return null;return{now:ctx.currentTime,step:step,next:next,dur:stepDur(),swing:S[style].swing};},
    timeOf:function(n){if(!ctx)return 0;return next+(n-step)*stepDur()+swingOff(n);},
    dropOut:function(bars){if(on)drop=bars||1;},
    /* Blend into another style on the bar line: drums pull out, a riser builds, then the bass drops in the new style. */
    mixTo:function(s){
      if(!S[s])return;if(!on||!ctx||ctx.state!=="running"){api.start(s);return;}
      if(s===style&&!pending)return;
      var left=toBar();pending=s;drop=2;riserAt(ctx.currentTime+.02,left*stepDur());
      pref=s;try{localStorage.setItem("py_beat",s);}catch(e){}
    },
    bassDrop:function(){if(!on||!ctx||ctx.state!=="running"){api.start();return;}var left=toBar();boom=true;drop=2;riserAt(ctx.currentTime+.02,left*stepDur());},
    pendingStyle:function(){return pending;},
    barsToDrop:function(){return (pending||boom)?(16-(step%16))*stepDur():0;},
    setMuted:function(m){forceMute=m;vol();},
    refresh:vol,
    fx:function(name){
      if(!ensure()||isMuted())return;try{if(ctx.state!=="running")ctx.resume();}catch(e){}
      var t=ctx.currentTime+.01,bus=master;if(master.gain.value<.3)master.gain.setTargetAtTime(.55,t,.02);
      if(name==="horn"){[0,.16,.32].forEach(function(dl,i){[466,470,699].forEach(function(f){var o=osc(t+dl,"sawtooth",f,i===2?.55:.13,.07,bus,.005);o.frequency.exponentialRampToValueAtTime(f*.94,t+dl+(i===2?.5:.12));});});}
      else if(name==="scratch"){[0,.09,.2,.28].forEach(function(dl,i){var f=noise(t+dl,.085,"bandpass",i%2?2600:900,5,.5,bus,.004);f.frequency.exponentialRampToValueAtTime(i%2?800:3200,t+dl+.08);});}
      else if(name==="thunder"){var f=noise(t,3.2,"lowpass",420,0,.9,bus,.03);f.frequency.exponentialRampToValueAtTime(70,t+3);noise(t,.25,"highpass",2500,0,.25,bus,.002);osc(t,"sine",48,2.2,.6,bus,.02);}
      else if(name==="crash"){crash(t,.35);}
      else if(name==="riser"){var o=osc(t,"sawtooth",60,2.4,.09,bus,1.8);o.frequency.exponentialRampToValueAtTime(700,t+2.3);var n=noise(t,2.4,"bandpass",500,2,.12,bus,2);n.frequency.exponentialRampToValueAtTime(6000,t+2.3);}
      else if(name==="hit"){kick(t,.9);noise(t,.06,"highpass",6000,0,.12,bus);}
      else if(name==="miss"){osc(t,"square",110,.12,.06,bus,.004);}
    }
  };
  window.PoyBeats=api;api.auto=function(){auto();};

  /* Header control: tap to cycle the five styles, then off. */
  var btn=null,offBtn=null;
  function label(){if(!btn)return;btn.textContent="🎧 "+S[pending||style].name;btn.setAttribute("aria-pressed",String(on));if(offBtn){offBtn.textContent=on?"🔕 No music":"🎵 Music on";offBtn.title=on?"Turn the music off":"Turn the music back on";}btn.title="DJ Bouche: tap to switch East Coast, West Coast, Miami Bass, Dubstep or Rave";}
  function mount(){
    var nav=document.querySelector("header.top nav.main");if(!nav||document.getElementById("beatBtn"))return;
    btn=document.createElement("button");btn.id="beatBtn";btn.type="button";nav.appendChild(btn);
    offBtn=document.createElement("button");offBtn.id="noMusicBtn";offBtn.type="button";nav.appendChild(offBtn);label();
    offBtn.addEventListener("click",function(){if(on){pending=null;api.stop();}else api.start();});
    btn.addEventListener("click",function(){if(!on)api.start();else{var ix=ORDER.indexOf(pending||style);api.mixTo(ORDER[(ix+1)%ORDER.length]);}});
    var sb=document.getElementById("soundBtn");if(sb)sb.addEventListener("click",function(){setTimeout(vol,0);});
    var sh=document.getElementById("shantyBtn");if(sh)sh.addEventListener("click",function(){setTimeout(function(){if(sh.getAttribute("aria-pressed")==="true"&&on)api.stop(false);},0);});
  }
  /* Music starts with the game: browsers only allow sound after the first tap or key, so start on that. */
  function auto(){
    if(document.body&&document.body.hasAttribute("data-beats-manual"))return;
    if(pref==="off"||on)return;
    function go(){document.removeEventListener("pointerdown",go,true);document.removeEventListener("keydown",go,true);if(pref!=="off"&&!on&&!(document.body&&document.body.hasAttribute("data-beats-manual")))api.start(pref,false);}
    if(navigator.userActivation&&navigator.userActivation.hasBeenActive){api.start(pref,false);if(api.running())return;}
    document.addEventListener("pointerdown",go,true);document.addEventListener("keydown",go,true);
  }
  function boot(){mount();auto();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
