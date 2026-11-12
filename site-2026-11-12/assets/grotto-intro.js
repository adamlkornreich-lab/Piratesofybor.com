/* Gaspar's Grotto After Dark: the cinematic opening, cut from real footage and photos of
   Gaspar's Grotto, its crew and the Pirates of Ybor art, with a dark pirate grade, music and thunder.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
(function(){
  if(window.PoyIntro)return;
  var me=document.currentScript,root=me&&me.src?me.src.replace(/assets\/grotto-intro\.js.*$/,""):"";
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function shots(o){if(o.shots&&o.shots.length)return o.shots;return[
    {k:"img",src:"assets/crew/jazz-1.jpg",d:2.6,z:[1.04,1.2],p:[.5,.45,.55,.5],cap:"GASPAR'S GROTTO PRESENTS",small:1,fx:"thunder"},
    {k:"vid",src:"assets/clips/stage.mp4",d:2.8,z:[1.06,1.14],p:[.5,.5,.5,.5],cap:"7th Avenue · Ybor City",small:1},
    {k:"img",src:"assets/crew/grotto-crew.jpg",d:2.3,z:[1.18,1.04],p:[.5,.55,.5,.5],cap:"THE CREW"},
    {k:"vid",src:"assets/clips/crew-pose-1.mp4",d:2.4,z:[1.04,1.12],p:[.5,.45,.5,.5],fx:"flash"},
    {k:"vid",src:"assets/clips/courtyard.mp4",d:2.6,z:[1.05,1.15],p:[.5,.5,.5,.45]},
    {k:"vid",src:"assets/clips/crew-pose-2.mp4",d:2.3,z:[1.1,1.02],p:[.5,.5,.5,.5],fx:"flash"},
    {k:"img",src:"assets/crew/pirate.jpg",d:2.4,z:[1.02,1.22],p:[.5,.18,.5,.22],cap:"NO QUARTER",fx:"thunder"},
    {k:"img",src:"assets/pirates-of-ybor-treasure-ship.jpg",d:3.2,z:[1.05,1.3],p:[.45,.5,.62,.62],title:o.title||"THE PIRATES OF YBOR",gold:1,fx:"drop"},
    {k:"img",src:"assets/pops-pippy-official.jpg",d:3,z:[1.22,1.06],p:[.5,.3,.5,.4],cap:o.sub||"Pops & Pippy saved you a seat"}
  ]}
  function play(o){
    o=o||{};var B=window.PoyBeats,S=shots(o),base=o.base!==undefined?o.base:root;
    var el=document.createElement("div");el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Gaspar's Grotto opening film");
    el.style.cssText="position:fixed;inset:0;z-index:600;background:#000;overflow:hidden;font-family:Georgia,serif;color:#f3ead7";
    var css="#pyi .sh{position:absolute;inset:0;opacity:0;transition:opacity .42s ease}#pyi .sh.on{opacity:1}"+
      "#pyi .sh>img,#pyi .sh>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform;filter:brightness(.74) contrast(1.28) saturate(1.15) sepia(.2)}"+"#pyi.classic .sh>img,#pyi.classic .sh>video{filter:sepia(.55) contrast(1.1) brightness(.9)}#pyi.classic .grade{background:linear-gradient(rgba(200,160,100,.35),rgba(150,110,60,.35))}#pyi.neon .sh>img,#pyi.neon .sh>video{filter:brightness(.8) contrast(1.35) saturate(1.6) hue-rotate(-12deg)}#pyi.neon .grade{background:linear-gradient(rgba(255,63,164,.4),rgba(34,224,208,.4))}"+
      "#pyi .grade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(170,70,55,.42),rgba(110,40,60,.46));mix-blend-mode:multiply}"+
      "#pyi .vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 34%,rgba(0,0,0,.85) 100%)}"+
      "#pyi .bar{position:absolute;left:0;right:0;height:11%;background:#000;z-index:5}#pyi .bar.t{top:0}#pyi .bar.b{bottom:0}"+
      "#pyi .cap{position:absolute;left:0;right:0;bottom:16%;text-align:center;z-index:6;padding:0 18px;opacity:0;transition:opacity .6s,transform .8s;transform:translateY(10px);text-shadow:0 2px 3px #000,0 0 24px #000}"+
      "#pyi .cap.on{opacity:1;transform:none}#pyi .cap.big{font:700 clamp(1.8rem,6.5vw,3.6rem)/1.05 Georgia,serif;color:#f6d67a;letter-spacing:.04em}#pyi .cap.sm{font:600 clamp(.85rem,2.6vw,1.15rem) Georgia,serif;letter-spacing:.32em;text-transform:uppercase;color:#efe6d2}"+
      "#pyi .title{position:absolute;inset:0;display:grid;place-items:center;z-index:6;pointer-events:none;text-align:center;padding:0 16px;font:700 clamp(2.4rem,9vw,5.2rem)/1 Georgia,serif;color:#f6d67a;text-shadow:0 4px 0 #2a1a06,0 0 40px rgba(0,0,0,.95);opacity:0;transform:scale(1.5);transition:opacity .35s,transform .45s cubic-bezier(.2,1.4,.4,1)}#pyi .title.on{opacity:1;transform:scale(1)}"+
      "#pyi canvas.grain{position:absolute;inset:0;width:100%;height:100%;opacity:.09;mix-blend-mode:overlay;pointer-events:none;z-index:4;image-rendering:pixelated}"+
      "#pyi canvas.gold{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4}"+
      "#pyi .flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:7;pointer-events:none;transition:opacity .5s}"+
      "#pyi .gate{position:absolute;inset:0;z-index:9;display:grid;place-items:center;text-align:center;padding:20px;background:radial-gradient(ellipse at 50% 45%,rgba(30,10,8,.55),#000 75%)}"+
      "#pyi .gate h2{margin:0 0 6px;font:700 clamp(2rem,8vw,3.6rem)/1.05 Georgia,serif;color:#f6d67a;text-shadow:0 3px 0 #2a1a06}#pyi .gate p{margin:0 0 18px;color:#d8cfbb}"+
      "#pyi .go{font:700 1.2rem Georgia,serif;color:#15100a;background:linear-gradient(180deg,#f0c860,#b9872a);border:2px solid #f6d67a;border-radius:12px;padding:14px 30px;cursor:pointer;min-height:48px}"+
      "#pyi .skip,#pyi .quiet{background:rgba(0,0,0,.55);color:#f3ead7;border:1px solid #6b4b12;border-radius:8px;padding:10px 14px;font:600 .95rem Georgia,serif;min-height:44px;cursor:pointer}"+
      "#pyi .skip{position:absolute;right:14px;top:calc(11% + 10px);z-index:8}#pyi .quiet{display:block;margin:12px auto 0;background:none;border:0;text-decoration:underline}";
    el.id="pyi";if(o.look&&o.look!=="dark")el.className=o.look;el.innerHTML="<style>"+css+"</style>";
    var layers=S.map(function(s){var d=document.createElement("div");d.className="sh";var m;
      if(s.k==="vid"){m=document.createElement("video");m.muted=true;m.loop=true;m.playsInline=true;m.setAttribute("playsinline","");m.setAttribute("muted","");m.preload="auto";}
      else{m=document.createElement("img");m.alt="";m.decoding="async";}
      m.src=/^(blob:|data:|https?:)/.test(s.src)?s.src:base+s.src;d.appendChild(m);el.appendChild(d);return{d:d,m:m,s:s};});
    el.insertAdjacentHTML("beforeend",'<div class="grade"></div><div class="vig"></div><canvas class="grain" width="96" height="96"></canvas><canvas class="gold"></canvas><div class="bar t"></div><div class="bar b"></div><div class="cap"></div><div class="title"></div><div class="flash"></div><button type="button" class="skip" hidden>Skip ▸</button>'+
      '<div class="gate"><div><h2>'+(o.gateTitle||"Gaspar's Grotto")+'</h2><p>'+(o.gateSub||"After dark on 7th Avenue. Turn your sound up.")+'</p><button type="button" class="go">▶ Play the opening</button><button type="button" class="quiet">Skip the opening</button></div></div>');
    document.body.appendChild(el);
    var q=function(c){return el.querySelector(c);},cap=q(".cap"),title=q(".title"),flash=q(".flash"),grain=q("canvas.grain"),gold=q("canvas.gold"),gx=grain.getContext("2d"),gl=gold.getContext("2d");
    var cur=-1,t0=0,raf=0,done=false,sparks=[],lastG=0;
    function finish(){if(done)return;done=true;cancelAnimationFrame(raf);el.style.transition="opacity .8s";el.style.opacity="0";
      layers.forEach(function(L){if(L.s.k==="vid")try{L.m.pause();}catch(e){}});
      setTimeout(function(){el.remove();if(o.onDone)try{o.onDone();}catch(e){}},820);}
    function show(i){var s=S[i];layers.forEach(function(L,j){L.d.classList.toggle("on",j===i);if(L.s.k==="vid"){if(j===i){try{L.m.currentTime=0;}catch(e){}var p=L.m.play();if(p&&p.catch)p.catch(function(){});}else if(j!==i-1){try{L.m.pause();}catch(e){}}}});
      cap.classList.remove("on");title.classList.remove("on");
      setTimeout(function(){if(s.cap){cap.textContent=s.cap;cap.className="cap "+(s.small?"sm":"big");requestAnimationFrame(function(){cap.classList.add("on");});}},350);
      if(s.title){setTimeout(function(){title.textContent=s.title;title.classList.add("on");},420);}
      if(s.fx==="thunder"||s.fx==="flash"||s.fx==="drop"){flash.style.transition="none";flash.style.opacity=s.fx==="flash"?".5":".85";requestAnimationFrame(function(){flash.style.transition="opacity .6s";flash.style.opacity="0";});}
      if(B){try{if(s.fx==="thunder")B.fx("thunder");if(s.fx==="flash")B.fx("scratch");if(s.fx==="drop"){B.fx("crash");B.bassDrop&&B.isOn()?B.bassDrop():0;}}catch(e){}}
      if(i===S.length-1)setTimeout(function(){cap.classList.remove("on");},(s.d-0.9)*1000);}
    function fit(){var r=el.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);gold.width=r.width*d;gold.height=r.height*d;}
    function tick(now){if(done)return;raf=requestAnimationFrame(tick);var t=(now-t0)/1000,acc=0,i=0;
      for(i=0;i<S.length;i++){if(t<acc+S[i].d)break;acc+=S[i].d;}
      if(i>=S.length){finish();return;}
      if(i!==cur){cur=i;show(i);}
      var s=S[i],k=Math.min(1,(t-acc)/s.d),e=k*k*(3-2*k),L=layers[i],z=s.z[0]+(s.z[1]-s.z[0])*e,px=s.p[0]+(s.p[2]-s.p[0])*e,py=s.p[1]+(s.p[3]-s.p[1])*e;
      if(!reduce){L.m.style.transformOrigin=(px*100)+"% "+(py*100)+"%";L.m.style.transform="scale("+z.toFixed(4)+")";}
      if(now-lastG>70&&!reduce){lastG=now;var im=gx.createImageData(96,96);for(var n=0;n<im.data.length;n+=4){var v=Math.random()*255;im.data[n]=im.data[n+1]=im.data[n+2]=v;im.data[n+3]=255;}gx.putImageData(im,0,0);}
      var W=gold.width,H=gold.height;gl.clearRect(0,0,W,H);
      if(s.gold&&!reduce){if(sparks.length<90)for(var a=0;a<4;a++)sparks.push([W*(.55+Math.random()*.2),H*.82,(Math.random()-.5)*1.4,-2-Math.random()*3,1]);
        gl.globalCompositeOperation="lighter";sparks.forEach(function(p){p[0]+=p[2];p[1]+=p[3];p[3]+=.02;p[4]-=.012;gl.fillStyle="rgba(255,210,110,"+Math.max(0,p[4])+")";gl.beginPath();gl.arc(p[0],p[1],(1.5+p[4]*2.5)*(W/900),0,7);gl.fill();});gl.globalCompositeOperation="source-over";sparks=sparks.filter(function(p){return p[4]>0;});}}
    function start(music){q(".gate").remove();q(".skip").hidden=false;
      layers.forEach(function(L){if(L.s.k==="vid"){var p=L.m.play();if(p&&p.then)p.then(function(){L.m.pause();}).catch(function(){});}});
      if(B){try{if(music){if(B.pref()==="off"){try{localStorage.setItem("py_beat",o.style||"dubstep");}catch(e){}}B.start(o.style||(B.pref()==="off"?"dubstep":undefined),false);}else B.stop();}catch(e){}}
      if(reduce){finish();return;}fit();t0=performance.now();raf=requestAnimationFrame(tick);}
    q(".go").addEventListener("click",function(){start(true);});
    q(".quiet").addEventListener("click",function(){if(B)try{B.stop();}catch(e){}finish();});
    q(".skip").addEventListener("click",finish);
    window.addEventListener("resize",function(){if(!done)fit();});
    if(o.autoplay)start(true);else try{q(".go").focus({preventScroll:true});}catch(e){}
    return{skip:finish};
  }
  window.PoyIntro={play:play};
})();
