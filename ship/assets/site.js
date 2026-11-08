/* Shared chrome for The Pirates of Ybor: header, footer, watermark, sign-in stub.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
(function(){
  var NAV=[["index.html","Home"],["arcade.html","Arcade"],["world.html","Open World"],["crew.html","Crew"],["merch.html","Merch"],["plank-bar.html","Plank Bar"]];
  var here=location.pathname.split("/").pop()||"index.html";
  var skull='<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="30" r="20" fill="#f6d67a"/><circle cx="24" cy="28" r="5" fill="#0b0e14"/><circle cx="40" cy="28" r="5" fill="#0b0e14"/><path d="M28 40h8l-4 6z" fill="#0b0e14"/><rect x="22" y="46" width="20" height="6" rx="2" fill="#f6d67a"/><path d="M8 14 L56 50 M56 14 L8 50" stroke="#f6d67a" stroke-width="5" stroke-linecap="round"/><path d="M12 24c6-16 34-16 40 0-10-6-30-6-40 0z" fill="#b5532a"/></svg>';
  var header='<header class="top"><div class="wrap"><a class="brand" href="index.html">'+skull+'The Pirates of Ybor</a><nav class="main">'+
    NAV.map(function(n){return '<a href="'+n[0]+'"'+(here===n[0]?' class="active"':'')+'>'+n[1]+'</a>';}).join("")+
    '<a href="#" id="signinLink">⚓ Sign in</a><button id="soundBtn" type="button"></button><button id="shantyBtn" type="button" aria-pressed="false">🎻 Shanty</button></nav></div></header>';
  var footer='<footer class="site"><div>Built by R.A. Consulting · Gaspar\'s Grotto · Ybor City, Tampa FL · <a href="crew.html">Credits</a> · <a href="legal.html">Legal &amp; Privacy</a> · <a href="mailto:adamlkornreich@gmail.com">Contact</a></div>'+
    '<div class="copy">© 2026 Adam Kornreich / R.A. Consulting ❤ Pops &amp; Pippy. All rights reserved.</div></footer>';
  /* Official Pops & Pippy art, blended in with sparkles and the copyright line. */
  var wm='<div class="pp-watermark" aria-hidden="true"><img src="assets/brand-watermark.png" alt=""><i class="sparkle">✦</i><i class="sparkle s2">✦</i><i class="sparkle s3">✦</i><small>© 2026 Adam Kornreich / R.A. Consulting ❤ Pops &amp; Pippy</small></div>';
  var modal='<div class="modal" id="signinModal"><div class="box"><span class="close" id="signinClose">✕</span><h3>⚓ Crew Sign-in</h3>'+
    '<p>Email &amp; password accounts are coming aboard soon. For now every game is free to play — no sign-in needed.</p>'+
    '<label>Email</label><input type="email" placeholder="you@example.com" disabled><label>Password</label><input type="password" placeholder="••••••••" disabled>'+
    '<p style="margin:14px 0 0"><button class="btn" disabled>Sign in — coming soon</button></p>'+
    '<p style="color:var(--mute);font-size:.85rem;margin-top:12px">All Access membership: $1.00 / year plus tax and processing fees. Launching with the app-store release.</p></div></div>';
  if(document.body.hasAttribute("data-bare")){document.body.insertAdjacentHTML("beforeend",wm);return;}
  document.body.insertAdjacentHTML("afterbegin",header);
  document.body.insertAdjacentHTML("beforeend",footer+wm+modal);
  var m=document.getElementById("signinModal");
  document.getElementById("signinLink").addEventListener("click",function(e){e.preventDefault();m.classList.add("open");});
  document.getElementById("signinClose").addEventListener("click",function(){m.classList.remove("open");});
  m.addEventListener("click",function(e){if(e.target===m)m.classList.remove("open");});
  var slot=document.getElementById("heroArt");if(slot){slot.innerHTML='<img class="hero-art" src="assets/pops-pippy-official.jpg" alt="Pops the bar cat and Pippy the pirate chihuahua">';}
  /* simple local high-score helper */
  window.PY={best:function(key,val){try{var k="py_"+key,b=parseFloat(localStorage.getItem(k)||"0");if(val!==undefined&&val>b){localStorage.setItem(k,val);b=val;}return b;}catch(e){return val||0;}}};
  /* Sound and celebration: small sounds made in the browser, only after a tap */
  var muted=false,actx=null;try{muted=localStorage.getItem("py_mute")==="1";}catch(e){}
  function tone(f,t,d,v){if(muted)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();var o=actx.createOscillator(),g=actx.createGain(),s=actx.currentTime+t;o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(v||.05,s);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g);g.connect(actx.destination);o.start(s);o.stop(s+d);}catch(e){}}
  var sb=document.getElementById("soundBtn");function sl(){sb.textContent=muted?"🔇 Sound off":"🔊 Sound on";sb.setAttribute("aria-pressed",String(!muted));}sl();
  sb.addEventListener("click",function(){muted=!muted;try{localStorage.setItem("py_mute",muted?"1":"0");}catch(e){}sl();});
  function knock(){if(muted)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state!=="running")actx.resume();var s=actx.currentTime,n=actx.createBuffer(1,actx.sampleRate*.06,actx.sampleRate),d=n.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);var b=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();b.buffer=n;f.type="bandpass";f.frequency.value=1700;f.Q.value=4;g.gain.value=.22;b.connect(f);f.connect(g);g.connect(actx.destination);b.start(s);tone(190,0,.09,.05)}catch(e){}}
  window.PY.knock=knock;window.PY.coin=function(){tone(1320,0,.09,.05);tone(1980,.07,.22,.05)};
  document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("button,.btn,.choice,.opt,a.card"))knock();});

  var shOn=false,shTimer=null,shNext=0,shStep=0,shGain=null;
  var MEL=[62,0,65,69,0,69,67,65,64,62,0,0,60,0,64,67,0,67,65,64,62,64,0,0,62,0,65,69,0,72,70,69,67,65,0,0,64,0,67,65,0,64,62,0,0,62,0,0];
  var BASS=[38,0,0,45,0,0,36,0,0,43,0,0,38,0,0,45,0,0,41,0,0,40,0,0];
  function mtof(m){return 440*Math.pow(2,(m-69)/12)}
  function shNote(f,t,d,v,type,det){var o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(det)o.detune.value=det;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(shGain);o.start(t);o.stop(t+d+.05)}
  function shTick(){if(!shOn||muted)return;var step=60/112/3;while(shNext<actx.currentTime+.3){var i=shStep%MEL.length,m=MEL[i];if(m){shNote(mtof(m),shNext,step*1.8,.05,"sawtooth",-6);shNote(mtof(m),shNext,step*1.8,.04,"triangle",7)}var b=BASS[shStep%BASS.length];if(b)shNote(mtof(b),shNext,step*2.6,.09,"triangle");if(shStep%3===0){var n=actx.createBuffer(1,actx.sampleRate*.05,actx.sampleRate),d=n.getChannelData(0);for(var k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*(1-k/d.length);var s=actx.createBufferSource(),hp=actx.createBiquadFilter(),g=actx.createGain();s.buffer=n;hp.type="highpass";hp.frequency.value=5000;g.gain.value=shStep%6===0?.05:.025;s.connect(hp);hp.connect(g);g.connect(shGain);s.start(shNext)}shNext+=step;shStep++}}
  var shb=document.getElementById("shantyBtn");
  shb.addEventListener("click",function(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state!=="running")actx.resume()}catch(e){return}shOn=!shOn;shb.setAttribute("aria-pressed",String(shOn));shb.textContent=shOn?"🎻 Shanty on":"🎻 Shanty";
   if(shOn){if(!shGain){shGain=actx.createGain();shGain.connect(actx.destination)}shGain.gain.setTargetAtTime(muted?0:.9,actx.currentTime,.1);shNext=actx.currentTime+.08;shStep=0;clearInterval(shTimer);shTimer=setInterval(shTick,60)}else{clearInterval(shTimer);if(shGain)shGain.gain.setTargetAtTime(0,actx.currentTime,.1)}});
  sb.addEventListener("click",function(){if(shGain&&actx)shGain.gain.setTargetAtTime(muted||!shOn?0:.9,actx.currentTime,.1)});
  window.PY.celebrate=function(){[392,523,659,784,1047].forEach(function(f,i){tone(f,i*.1,.34,.055);});[659,784,1047].forEach(function(f){tone(f,.55,.7,.035)});for(var c=0;c<9;c++)tone(1200+Math.random()*900,.15+c*.07,.12,.03);
    if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    for(var i=0;i<34;i++){var c=document.createElement("div");c.className="coin";c.textContent=i%5?"🪙":"✨";c.style.left=Math.random()*100+"vw";c.style.animationDuration=(1.3+Math.random()*1.5)+"s";c.style.animationDelay=Math.random()*.5+"s";document.body.appendChild(c);(function(n){setTimeout(function(){n.remove();},3600);})(c);}};
})();
