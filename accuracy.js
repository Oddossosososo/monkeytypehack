// ==UserScript==
// @name         MonkeyType Accuracy Module
// @namespace    Oddossosososo
// @version      1.0
// @match        *://monkeytype.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{"use strict";
const A=window.__AutoTyperAccuracy=window.__AutoTyperAccuracy||{};
A.cfg=A.cfg||{accuracy:100};
try{Object.assign(A.cfg,JSON.parse(localStorage.autotyperConfig||"{}"))}catch{}
A.save=()=>localStorage.autotyperConfig=JSON.stringify(A.cfg);
A.word="";
A.pos=0;
A.nextChar=()=>{
 const el=document.querySelector(".word.active");
 if(!el)return null;
 const word=[...el.querySelectorAll("letter")].map(x=>x.textContent).join("");
 if(A.word!==word){A.word=word;A.pos=0}
 return A.pos<word.length?word[A.pos++]:" ";
};
A.press=key=>{
 const el=document.getElementById("wordsInput");
 if(!el)return false;
 const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set;
 set.call(el,el.value+key);
 el.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:key}));
 return true;
};
A.reset=()=>{A.word="";A.pos=0};
})();