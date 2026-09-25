// ==UserScript==
// @name         MonkeyType AutoTyper
// @namespace    Oddossosososo
// @version      5.0
// @match        *://monkeytype.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{"use strict";

const KEY="ArrowRight";
const defaults={wpm:50,accuracy:100};
let cfg={...defaults};
try{Object.assign(cfg,JSON.parse(localStorage.autotyperConfig||"{}"))}catch{}
let running=false,timer=0,word="",pos=0,next=0,audio=null;

const $=id=>document.getElementById(id);
const input=()=>$("wordsInput");

function save(){localStorage.autotyperConfig=JSON.stringify(cfg)}
function status(s){const x=$("atStatus");if(x)x.textContent=s}
function stop(){running=false;clearTimeout(timer);timer=0;word="";pos=0;next=0;status("Ready")}

function activeWord(){
 const w=document.querySelector(".word.active");
 return w?[...w.children].map(x=>x.textContent).join(""):"";
}

function nextChar(){
 const w=activeWord();
 if(!w)return null;
 if(w!==word){word=w;pos=0}
 return pos<w.length?w[pos++]:" ";
}

function sound(){
 try{
  audio??=new AudioContext();
  if(audio.state==="suspended")audio.resume();
  const o=audio.createOscillator(),g=audio.createGain();
  o.frequency.value=700;g.gain.value=.025;o.connect(g).connect(audio.destination);
  o.start();o.stop(audio.currentTime+.018);
 }catch{}
}

function press(k){
 const el=input();
 if(!el)return false;
 sound();
 const code=k===" "?"Space":/^[a-z]$/i.test(k)?"Key"+k.toUpperCase():"";
 const opt={key:k,code,bubbles:true,cancelable:true};
 el.dispatchEvent(new KeyboardEvent("keydown",opt));
 el.dispatchEvent(new KeyboardEvent("keyup",opt));
 return true;
}

function type(){
 if(!running)return;
 const wpm=Math.max(Number(cfg.wpm)||1,.000001);
 const gap=12000/wpm;
 const now=performance.now();
 let count=0;
 while(running&&next<=now&&count++<1000){
  const ch=nextChar();
  if(ch===null){stop();return}
  press(ch);
  next+=gap;
 }
 timer=setTimeout(type,Math.max(1,next-performance.now()));
}

function start(){
 if(!input()){status("Open a typing test first");return}
 stop();
 running=true;
 status("Typing...");
 next=performance.now();
 type();
}

function makeGUI(){
 if($("autotyper"))return;
 const g=document.createElement("div");
 g.id="autotyper";
 g.innerHTML=[
  "<b>AutoTyper</b>",
  '<label>WPM <input id="atWpm" type="text" inputmode="decimal" autocomplete="off"></label>',
  '<label>Accuracy <input id="atAccuracy" type="number" min="0" max="100" step="1"></label>',
  '<button id="atStart">Start</button><button id="atStop">Stop</button>',
  '<span id="atStatus">Ready</span>'
 ].join("");
 g.style.cssText="position:fixed;right:15px;bottom:15px;z-index:999999;width:180px;padding:12px;background:#111;color:#fff;border:1px solid #444;border-radius:10px;font:12px Arial;box-shadow:0 5px 25px #000";
 document.body.appendChild(g);
 const s=document.createElement("style");
 s.textContent="#autotyper label{display:block;margin:7px 0}#autotyper input{width:75px;box-sizing:border-box;background:#222;color:#fff;border:1px solid #555;border-radius:4px;padding:4px}#autotyper button{margin:4px 3px 0 0;padding:5px 8px;background:#333;color:#fff;border:1px solid #555;border-radius:5px}#atStatus{display:block;margin-top:8px;color:#aaa}";
 document.head.appendChild(s);
 $("atWpm").value=cfg.wpm;
 $("atAccuracy").value=cfg.accuracy;
 $("atWpm").oninput=e=>{if(e.target.value==="")return;const n=Number(e.target.value);if(Number.isFinite(n)&&n>0){cfg.wpm=n;save()}};
 $("atAccuracy").oninput=e=>{let n=Number(e.target.value);if(Number.isFinite(n)){cfg.accuracy=Math.max(0,Math.min(100,n));save()}};
 $("atStart").onclick=start;
 $("atStop").onclick=stop;
 g.addEventListener("keydown",e=>e.stopPropagation(),true);
}

document.addEventListener("keydown",e=>{
 const t=e.target;
 const editing=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable);
 if(e.code===KEY&&editing)return;
 if(e.code===KEY&&!e.repeat){e.preventDefault();start()}
},true);

function boot(){
 if(!document.body)return setTimeout(boot,250);
 makeGUI();
}
boot();

})();