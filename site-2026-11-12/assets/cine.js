/* Cinematic title card shown as every game and room opens: a storm-lit montage of the project's
   photos and paintings, a different cut each time, then thunder and the beat on the first tap.
   © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy */
(function(){
  if(window.PoyCine)return;
  var me=document.currentScript,base=me&&me.src?me.src.replace(/cine\.js.*$/,""):"assets/";
  var SKIP=["index.html","","club.html","shop.html","legal.html","messages.html","rumors.html","world.html"];
  var ROOMS=["arcade.html","crew.html","merch.html","card.html","plank-bar.html","station.html","travel.html","surfshop.html","movie.html"];
  /* file, caption, fit: "in" keeps the whole picture on screen */
  var SHOTS=[["pirates-of-ybor-treasure-ship.jpg","The Treasure Ship"],["pops-pippy-official.jpg","Pops & Pippy · Legends of the High Seas"],["waldo-painting.jpg","Painting by Waldo Nahuel"],["../gallery/lane.jpg","Painting by Waldo Nahuel"],["../gallery/street.jpg","Painting by Waldo Nahuel"],
    ["crew/pops-pippy-poster-2.jpg","Pops & Pippy · Two loyal companions, one legendary adventure"],["crew/pippy.jpg","Pippy, the pirate chihuahua"],["crew/pirate.jpg","A pirate of Ybor"],
    ["crew/studio.jpg","In the studio with a Waldo Nahuel painting"],["crew/stephania.jpg","Stephania Schiller"],
    ["crew/crew-1.jpg","The crew of the Pirates of Ybor"],["crew/crew-2.jpg","The crew of the Pirates of Ybor"],["crew/crew-3.jpg","The crew of the Pirates of Ybor"],["crew/crew-4.jpg","The crew of the Pirates of Ybor"],["crew/crew-5.jpg","The crew of the Pirates of Ybor"],["crew/crew-6.jpg","The crew of the Pirates of Ybor"],["crew/crew-7.jpg","The crew of the Pirates of Ybor"],
    ["crew/pippy-pool.jpg","Pippy takes the pool"],["crew/grotto-bar.jpg","Behind the bar at Gaspar's Grotto"],["crew/grotto-crew.jpg","The Gaspar's Grotto crew"],
    ["crew/jazz-1.jpg","Live jazz in the courtyard at Gaspar's Grotto"],["crew/jazz-2.jpg","Live jazz in the courtyard at Gaspar's Grotto"],["crew/party.jpg","Party night at Gaspar's Grotto"],
    /* short silent clips: [poster, caption, fit, video] */
    ["clips/courtyard.jpg","The courtyard at Gaspar's Grotto",0,"clips/courtyard.mp4"],["clips/stage.jpg","On stage at Gaspar's Grotto",0,"clips/stage.mp4"],
    ["clips/crew-pose-1.jpg","The Gaspar's Grotto crew",0,"clips/crew-pose-1.mp4"],["clips/crew-pose-2.jpg","The Gaspar's Grotto crew",0,"clips/crew-pose-2.mp4"]];
  var LOOKS=[{tint:"4,10,18",a:.42,gold:"#f6d67a"},{tint:"52,8,10",a:.4,gold:"#ffb39a"},{tint:"44,30,4",a:.34,gold:"#ffe9a8"},{tint:"8,26,30",a:.42,gold:"#a8fff0"},{tint:"26,8,44",a:.4,gold:"#e7c2ff"}];
  var LINES=["Chart your course. Take the treasure.","Storm's coming. So are we.","Iron, brass and blood-red sails.","Every doubloon has a story.","From Gaspar's Grotto to the high seas.","Pops and Pippy saved you a seat.","Seventh Avenue never sleeps.","No quarter. No refunds. No mercy."];
  function card(o){
    o=o||{};var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    var look=LOOKS[Math.floor(Math.random()*LOOKS.length)],line=o.sub||LINES[Math.floor(Math.random()*LINES.length)];
    var fx0=.3+Math.random()*.4,fy0=.35+Math.random()*.3,fx1=.3+Math.random()*.45,fy1=.4+Math.random()*.35,zin=Math.random()<.5;
    var el=document.createElement("div");el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label",(o.title||"Game")+" opening");
    el.style.cssText="position:fixed;inset:0;z-index:400;background:#020409;display:grid;place-items:center;overflow:hidden;transition:opacity .7s;font-family:Georgia,serif";
    el.innerHTML='<canvas style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"></canvas>'+
      '<div style="position:relative;text-align:center;padding:22px;max-width:680px">'+
      '<div style="color:#ff9a8a;letter-spacing:.3em;text-transform:uppercase;font-size:.8rem;text-shadow:0 1px 3px #000">'+(o.kick||"The Pirates of Ybor presents")+'</div>'+
      '<div data-t style="font:700 clamp(2rem,8vw,4.2rem)/1.05 Georgia,serif;color:'+look.gold+';margin:8px 0 8px;text-shadow:0 3px 0 #2a1a06,0 0 34px rgba(0,0,0,.95);transition:transform .5s cubic-bezier(.2,1.6,.4,1)"></div>'+
      '<div data-s style="color:#efe6d2;font-size:1.1rem;margin:0 0 20px;text-shadow:0 1px 4px #000"></div>'+
      '<button type="button" data-go style="font:700 1.2rem Georgia,serif;color:#15100a;background:linear-gradient(180deg,#f0c860,#b9872a);border:2px solid #f6d67a;border-radius:12px;padding:14px 30px;cursor:pointer;min-height:48px;box-shadow:0 8px 24px rgba(0,0,0,.6)"></button>'+
      '<div><button type="button" data-q style="margin-top:12px;background:none;border:0;color:#cfc6b2;text-decoration:underline;font:1rem Georgia,serif;cursor:pointer;min-height:44px">Play with no music</button></div></div>';
    el.querySelector("[data-t]").textContent=o.title||"The Pirates of Ybor";el.querySelector("[data-s]").textContent=line;el.querySelector("[data-go]").textContent=o.button||"▶ Play";
    document.body.appendChild(el);
    var cv=el.querySelector("canvas"),g=cv.getContext("2d"),W=0,H=0,t0=performance.now(),raf=0,gone=false,rain=[],bolt=0,nextBolt=1.5+Math.random()*3,hit=0;
    var pool=(window.__cinePick?SHOTS.filter(function(x){return window.__cinePick.indexOf(x[0])>=0;}):SHOTS.slice().sort(function(){return Math.random()-.5;})).slice(0,3),SEG=4.6;
    var pics=pool.map(function(p){var im=new Image();im.src=base+p[0];var v=null;
      if(p[3]&&!reduce){try{v=document.createElement("video");v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute("playsinline","");v.setAttribute("muted","");v.preload="auto";v.src=base+p[3];var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){v=null;}}
      return{im:im,v:v,cap:p[1],fit:p[2],fx0:.43+Math.random()*.14,fy0:.28+Math.random()*.14,fx1:.43+Math.random()*.14,fy1:.3+Math.random()*.16,zin:Math.random()<.5};});
    function shot(p,k,a){var im=p.im,vid=p.v&&p.v.readyState>=2&&p.v.videoWidth?p.v:null;if(!vid&&(!im.complete||!im.naturalWidth))return;
      if(vid)im={naturalWidth:vid.videoWidth,naturalHeight:vid.videoHeight,el:vid};else im={naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,el:im};
      if(vid)k=k*.35;var z=p.zin?1.02+k*.18:1.2-k*.18,s,w,h,x,y;
      if(p.fit==="in"){s=Math.min(W/im.naturalWidth,H/im.naturalHeight)*(.72+k*.12);w=im.naturalWidth*s;h=im.naturalHeight*s;x=(W-w)/2;y=(H-h)/2;}
      else{s=Math.max(W/im.naturalWidth,H/im.naturalHeight)*(z+hit*.25);w=im.naturalWidth*s;h=im.naturalHeight*s;x=W/2-w*(p.fx0+(p.fx1-p.fx0)*k);y=H/2-h*(p.fy0+(p.fy1-p.fy0)*k);x=Math.min(0,Math.max(W-w,x));y=Math.min(0,Math.max(H-h,y));}
      g.save();g.globalAlpha=a;g.imageSmoothingQuality="high";try{g.drawImage(im.el,x,y,w,h);}catch(e){}g.restore();}
    function fit(){var d=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);}
    function draw(ts){if(gone)return;raf=requestAnimationFrame(draw);var t=Math.max(0,(ts-t0)/1000),n=pics.length,ix=reduce?0:Math.floor(t/SEG)%n,loc=reduce?0:(t%SEG)/SEG;
      g.fillStyle="#020409";g.fillRect(0,0,W,H);
      shot(pics[ix],loc,1);if(loc>.76){shot(pics[(ix+1)%n],0,(loc-.76)/.24);}
      g.fillStyle="rgba("+look.tint+","+look.a+")";g.fillRect(0,0,W,H);
      if(!reduce){if(rain.length<130)for(var i=rain.length;i<130;i++)rain.push([Math.random()*W*1.3,Math.random()*H,9+Math.random()*12]);
        g.strokeStyle="rgba(190,210,230,.3)";g.lineWidth=1;g.beginPath();for(var j=0;j<rain.length;j++){var d=rain[j];d[0]-=d[2]*.35;d[1]+=d[2];if(d[1]>H){d[1]=-20;d[0]=Math.random()*W*1.3;}g.moveTo(d[0],d[1]);g.lineTo(d[0]+d[2]*.4,d[1]-d[2]*1.3);}g.stroke();
        if(t>nextBolt){bolt=1;nextBolt=t+3+Math.random()*5;}if(bolt>0){g.fillStyle="rgba(220,235,255,"+bolt*.4+")";g.fillRect(0,0,W,H);bolt-=.07;}}
      var v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,"rgba(0,0,0,.25)");v.addColorStop(1,"rgba(0,0,0,.85)");g.fillStyle=v;g.fillRect(0,0,W,H);
      var lb=H*.07;g.fillStyle="#000";g.fillRect(0,0,W,lb);g.fillRect(0,H-lb,W,lb);
      g.font="italic "+Math.max(12,Math.min(15,W/34))+"px Georgia,serif";g.textAlign="center";g.textBaseline="middle";g.fillStyle="rgba(233,223,200,"+(loc<.1?loc/.1:loc>.8?Math.max(0,(1-loc)/.2):1)+")";g.fillText(pics[ix].cap,W/2,H-lb/2);if(hit>0)hit=Math.max(0,hit-.03);}
    function close(music){if(gone&&!raf)return;var B=window.PoyBeats;
      if(B){if(music){B.fx("thunder");if(!(document.body.hasAttribute("data-beats-manual")))B.start(B.pref()==="off"?B.style():undefined,false);}else B.stop();}
      bolt=1;hit=1;el.querySelector("[data-t]").style.transform="scale(1.18)";el.style.pointerEvents="none";el.querySelector("[data-go]").disabled=true;
      setTimeout(function(){el.style.opacity="0";el.style.pointerEvents="none";},reduce?0:520);
      setTimeout(function(){gone=true;cancelAnimationFrame(raf);raf=0;pics.forEach(function(p){if(p.v){try{p.v.pause();p.v.removeAttribute("src");p.v.load();}catch(e){}}});el.remove();window.removeEventListener("resize",fit);if(o.onDone)try{o.onDone(music);}catch(e){}},reduce?60:1250);}
    el.querySelector("[data-go]").addEventListener("click",function(){close(true);});
    el.querySelector("[data-q]").addEventListener("click",function(){close(false);});
    window.addEventListener("resize",fit);fit();raf=requestAnimationFrame(draw);
    try{el.querySelector("[data-go]").focus({preventScroll:true});}catch(e){}
    return el;
  }
  window.PoyCine={card:card};
  function auto(){
    if(!document.body||document.body.hasAttribute("data-no-cine"))return;
    var pg=location.pathname.split("/").pop()||"index.html";if(SKIP.indexOf(pg)>=0)return;
    var t=(document.title||"").split(/ [—–|] /)[0].replace(/^The Pirates of Ybor:?\s*/,"")||"The Pirates of Ybor";
    card({title:t,button:ROOMS.indexOf(pg)>=0?"⚓ Come aboard":undefined});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",auto);else auto();
})();
