// ==UserScript==
// @name         MonkeyType AutoTyper - Unlimited WPM
// @namespace    AutoTyper
// @version      4.1
// @match        *://monkeytype.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{"use strict";
const KEY="ArrowRight",defaults={wpm:50,accuracy:100,mode:"basic",minDelay:100,maxDelay:333,pauseDelay:100};
let cfg={...defaults,...JSON.parse(localStorage.getItem("autotyper-config")||"{}")},running=false,timer=null,audio=null;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem("autotyper-config",JSON.stringify(cfg))}
function stop(){running=false;clearTimeout(timer);timer=null;type.nextTime=0;if($("status"))$("status").textContent="Ready"}
function start(){if(!document.querySelector("#typingTest")||!$("wordsInput"))return;running=true;if($("status"))$("status").textContent="Typing...";type.nextTime=performance.now();type()}
function toggle(){running?stop():start()}
document.addEventListener("keydown",e=>{const el=e.target,editing=el.tagName==="INPUT"||el.tagName==="TEXTAREA"||el.isContentEditable||el.closest("#autotyper");if(e.code===KEY&&editing){e.preventDefault();e.stopImmediatePropagation();return}if(e.code===KEY&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();toggle()}},true);
function nextChar(){const word=document.querySelector(".word.active");if(!word)return null;for(const letter of word.children)if(!letter.className)return letter.textContent;return" "}
function clickSound(){try{audio??=new AudioContext();if(audio.state==="suspended")audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type="square";o.frequency.value=650+Math.random()*120;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.025);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.025)}catch(e){}}\nfunction press(key){const input=$("wordsInput");if(!input)return;clickSound();const code=key===" "?"Space":/^[a-z]$/i.test(key)?"Key"+key.toUpperCase():"";input.dispatchEvent(new KeyboardEvent("keydown",{key,code,bubbles:true,cancelable:true}));input.dispatchEvent(new KeyboardEvent("keyup",{key,code,bubbles:true,cancelable:true}))}
function type(){if(!running)return;const wpm=Math.max(Number(cfg.wpm)||1,.000001),ms=12000/wpm,now=performance.now();if(!type.nextTime)type.nextTime=now;let n=0;while(running&&type.nextTime<=now&&n++<50){const ch=nextChar();if(!ch)return stop();press(ch);type.nextTime+=ms}if(running)timer=setTimeout(type,Math.max(0,type.nextTime-performance.now(),1))}
function makeGUI(){document.getElementById("autotyper")?.remove();const gui=document.createElement("div");gui.id="autotyper";gui.innerHTML=`<b>🐵 AutoTyper</b><div><button id="basic">Basic</button><button id="advanced">Advanced</button></div><div id="basicBox">WPM: <input id="wpm" type="text" value="${cfg.wpm}" inputmode="decimal" autocomplete="off"></div><div id="advancedBox" style="display:none">Min: <input id="min" type="number" value="${cfg.minDelay}"> Max: <input id="max" type="number" value="${cfg.maxDelay}"> Pause: <input id="pause" type="number" value="${cfg.pauseDelay}"></div>Accuracy: <input id="accuracy" type="number" min="0" max="100" step="1" value="${cfg.accuracy}"><button id="reset">Reset</button><button id="start">Start</button><button id="stop">Stop</button><span id="status">Ready</span>`;gui.style.cssText="position:fixed;right:15px;bottom:15px;z-index:999999;width:190px;padding:12px;background:#111;color:white;border:1px solid #444;border-radius:10px;font:12px Arial;box-shadow:0 5px 25px #000";document.body.appendChild(gui);const style=document.createElement("style");style.textContent="#autotyper input{width:70px;box-sizing:border-box;margin:4px;padding:4px;color:white;background:#222;border:1px solid #555;border-radius:4px}#autotyper button{margin:5px 2px;padding:5px 8px;color:white;background:#333;border:1px solid #555;border-radius:5px;cursor:pointer}#autotyper button:hover{background:#555}#status{display:block;margin-top:6px}#autotyper small{display:block;margin-top:6px;color:#888}";document.head.appendChild(style);gui.addEventListener("keydown",e=>e.stopPropagation(),true);
$("start").onclick=()=>start();$("stop").onclick=()=>stop();
$("wpm").addEventListener("input",e=>{const v=parseFloat(e.target.value);if(Number.isFinite(v)&&v>0){cfg.wpm=v;save()}});
$("accuracy").addEventListener("input",e=>{let v=parseFloat(e.target.value);if(Number.isFinite(v)){v=Math.min(100,Math.max(0,v));cfg.accuracy=v;save()}});
$("min").addEventListener("input",e=>{cfg.minDelay=Number(e.target.value)||0;save()});$("max").addEventListener("input",e=>{cfg.maxDelay=Number(e.target.value)||0;save()});$("pause").addEventListener("input",e=>{cfg.pauseDelay=Number(e.target.value)||0;save()});
$("basic").onclick=()=>{cfg.mode="basic";$("basicBox").style.display="";$("advancedBox").style.display="none";save()};$("advanced").onclick=()=>{cfg.mode="advanced";$("basicBox").style.display="none";$("advancedBox").style.display="";save()};
$("reset").onclick=()=>{cfg={...defaults};save();$("wpm").value=cfg.wpm;$("accuracy").value=cfg.accuracy;$("min").value=cfg.minDelay;$("max").value=cfg.maxDelay;$("pause").value=cfg.pauseDelay;cfg.mode="basic";$("basicBox").style.display="";$("advancedBox").style.display="none"}}
if(document.body)makeGUI();
})();