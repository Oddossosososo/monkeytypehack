// ==UserScript==
// @name         MonkeyType WPM Module
// @namespace    Oddossosososo
// @version      1.0
// @match        *://monkeytype.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{"use strict";
const A=window.__AutoTyperAccuracy;
if(!A){setTimeout(()=>location.reload(),500);return}
const cfg=A.cfg;
let running=false,timer=0,start=0,typed=0,next=0,audio=null;
const $=id=>document.getElementById(id);
const save=()=>A.save();
const status=x=>{const e=$("atStatus");if(e)e.textContent=x};
function sound(){
 try{
  audio??=new AudioContext();
  if(audio.state==="suspended")audio.resume();
  const o=audio.createOscillator(),g=audio.createGain();
  o.type="square";o.frequency.value=700;g.gain.setValueAtTime(.025,audio.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.02);
  o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.02);
 }catch{}
}
function stop(){running=false;clearTimeout(timer);timer=0;typed=0;A.reset();status("Ready")}
function tick(){
 if(!running)return;
 const wpm=Math.max(Number(cfg.wpm)||1,.000001),gap=12000/wpm,now=performance.now();
 let n=0;
 while(running&&next<=now&&n++<1000){
  const ch=A.nextChar();
  if(ch===null){stop();return}
  sound();
  if(!A.press(ch)){stop();return}
  typed++;next=start+typed*gap;
 }
 timer=setTimeout(tick,Math.max(1,next-performance.now()));
}
function startTest(){
 if(!$("wordsInput")){status("Open a typing test first");return}
 stop();running=true;status("Typing...");
 start=performance.now();typed=0;next=start+12000/Math.max(Number(cfg.wpm)||1,.000001);tick();
}
function gui(){
 if($("autotyper"))return;
 const g=document.createElement("div");g.id="autotyper";
 g.innerHTML='<b>AutoTyper</b><label>WPM <input id="atWpm" type="text" inputmode="decimal" autocomplete="off"></label><label>Accuracy <input id="atAccuracy" type="number" min="0" max="100" step="1"></label><button id="atStart">Start</button><button id="atStop">Stop</button><span id="atStatus">Ready</span>';
 g.style.cssText="position:fixed;right:15px;bottom:15px;z-index:999999;width:180px;padding:12px;background:#111;color:#fff;border:1px solid #444;border-radius:10px;font:12px Arial;box-shadow:0 5px 25px #000";
 document.body.appendChild(g);
 const s=document.createElement("style");s.textContent="#autotyper label{display:block;margin:7px 0}#autotyper input{width:75px;box-sizing:border-box;background:#222;color:#fff;border:1px solid #555;border-radius:4px;padding:4px}#autotyper button{margin:4px 3px 0 0;padding:5px 8px;background:#333;color:#fff;border:1px solid #555;border-radius:5px}#atStatus{display:block;margin-top:8px;color:#aaa}";document.head.appendChild(s);
 $("atWpm").value=cfg.wpm??50;$("atAccuracy").value=cfg.accuracy??100;
 $("atWpm").oninput=e=>{const n=Number(e.target.value);if(Number.isFinite(n)&&n>0){cfg.wpm=n;save()}};
 $("atAccuracy").oninput=e=>{const n=Number(e.target.value);if(Number.isFinite(n)){cfg.accuracy=Math.max(0,Math.min(100,n));save()}};
 $("atStart").onclick=startTest;$("atStop").onclick=stop;
 g.addEventListener("keydown",e=>e.stopPropagation(),true);
}
document.addEventListener("keydown",e=>{
 const t=e.target,editing=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable);
 if(e.code==="ArrowRight"&&editing)return;
 if(e.code==="ArrowRight"&&!e.repeat){e.preventDefault();startTest()}
},true);
function boot(){if(!document.body)return setTimeout(boot,250);gui()}boot();
})();