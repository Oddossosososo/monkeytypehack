export const cfg = globalThis.__AutoTyperConfig ??= (() => {
  try { return Object.assign({accuracy:100}, JSON.parse(localStorage.autotyperConfig || "{}")); }
  catch { return {accuracy:100}; }
})();
export const save = () => localStorage.autotyperConfig = JSON.stringify(cfg);
export let word = "", pos = 0;
export function reset(){word="";pos=0}
export function nextChar(){
  const el=document.querySelector(".word.active"); if(!el)return null;
  const text=[...el.querySelectorAll("letter")].map(x=>x.textContent).join("");
  if(word!==text){word=text;pos=0}
  return pos<text.length?text[pos++]:" ";
}
export function press(key){
  const el=document.getElementById("wordsInput"); if(!el)return false;
  const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set;
  set.call(el,el.value+key);
  el.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:key}));
  return true;
}