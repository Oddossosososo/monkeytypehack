// ==UserScript==
// @name         MonkeyType AutoTyper
// @namespace    Oddossosososo
// @version      5.4
// @match        *://monkeytype.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{"use strict";

const defaults={wpm:50,accuracy:100};
let cfg={...defaults},running=false,timer=0,audio=null;
let state={word:"",pos:0,nextTime:0,startTime:0,typed:0};

try{Object.assign(cfg,JSON.parse(localStorage.autotyperConfig||"{}"))}catch{}
const $=id=>document.getElementById(id);

function save(){localStorage.autotyperConfig=JSON.stringify(cfg)}
function status(x){const e=$("atStatus");if(e)e.textContent=x}
function stop(){running=false;clearTimeout(timer);timer=0;state={word:"",pos:0,nextTime:0,startTime:0,typed:0};status("Ready")}

function nextWord(){
 const w=document.querySelector(".word.active");
 return w?[...w.querySelectorAll("letter")].map(x=>x.textContent).join(""):"";
}
function nextChar(){
 const w=document.querySelector(".word.active");
 const word=nextWord();
 if(!w)return null;
 if(state.word!==word){state.word=word;state.pos=0}
 return state.pos<word.length?word[state.pos++]:" ";
}

function clickSound(){
 try{
  audio??=new AudioContext();
  if(audio.state==="suspended")audio.resume();
  const o=audio.createOscillator(),g=audio.createGain();
  o.type="square";o.frequency.value=700;
  g.gain.setValueAtTime(.025,audio.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.02);
  o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.02);
 }catch{}
}

function press(key){
 const el=$("wordsInput");
 if(!el)return false;
 clickSound();
 const p=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set;
 p.call(el,el.value+key);
 el.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:key}));
 return true;
}

function type(){
 if(!running)return;
 const wpm=Math.max(Number(cfg.wpm)||1,.000001);
 const gap=12000/wpm;
 const now=performance.now();
 let n=0;

 while(running&&state.nextTime<=now&&n++<1000){
  const ch=nextChar();
  if(ch===null){stop();return}
  if(!press(ch)){stop();return}

  state.typed++;
  // Absolute target timeline: 5 characters = 1 word.
  // This prevents timer/frame delays from accumulating.
  state.nextTime=state.startTime+state.typed*gap;
 }

 timer=setTimeout(type,Math.max(1,state.nextTime-performance.now()));
}

function start(){
 if(!$("wordsInput")){status("Open a typing test first");return}
 stop();running=true;status("Typing...");
 state.startTime=performance.now();
 // The first character also consumes one character interval.\n state.nextTime=state.startTime+12000/Math.max(Number(cfg.wpm)||1,.000001);
 state.typed=0;
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
 s.textContent="#autotyper label{display:block;margin:7px 0}#autotyper input{width:75px;box-sizing:border-box;background:#222;color:#fff;border:1px solid #555;border-radius:4px;padding:4px}#autotyper button{margin:4px 3px 0 0;padding:5px 8px;background:#333;color:#fff;border:1px solid #555;border-radius:5px;color:#fff}#atStatus{display:block;margin-top:8px;color:#aaa}";
 document.head.appendChild(s);
 $("atWpm").value=cfg.wpm;$("atAccuracy").value=cfg.accuracy;
 $("atWpm").oninput=e=>{if(e.target.value==="")return;const n=Number(e.target.value);if(Number.isFinite(n)&&n>0){cfg.wpm=n;save()}};
 $("atAccuracy").oninput=e=>{let n=Number(e.target.value);if(Number.isFinite(n)){cfg.accuracy=Math.max(0,Math.min(100,n));save()}};
 $("atStart").onclick=start;$("atStop").onclick=stop;
 g.addEventListener("keydown",e=>e.stopPropagation(),true);
}

document.addEventListener("keydown",e=>{
 const t=e.target;
 const editing=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable);
 if(e.code==="ArrowRight"&&editing)return;
 if(e.code==="ArrowRight"&&!e.repeat){e.preventDefault();start()}
},true);

function boot(){if(!document.body)return setTimeout(boot,250);makeGUI()}
boot();

})();