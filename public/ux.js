(()=>{const t=()=>document.getElementById('timerText');
setInterval(()=>{const e=t();if(!e)return;const[m,s]=e.textContent.split(':').map(Number),n=m*60+s,b=e.closest('.timer');b&&(b.classList.toggle('warn',n<=300&&n>60),b.classList.toggle('crit',n<=60))},1000);
document.addEventListener('keydown',e=>{if(!t()||/INPUT|TEXTAREA/.test(e.target.tagName)&&e.target.type!=='radio')return;const k=e.key.toUpperCase();
 if('ABCD'.includes(k)&&k.length===1){const r=document.querySelector(`input[name=answer][value=${k}]`);if(r){r.checked=true;r.dispatchEvent(new Event('change'))}}
 else if(e.key==='ArrowRight')moveQuestion(1);else if(e.key==='ArrowLeft')moveQuestion(-1)});
new MutationObserver(()=>{const a=document.querySelector('.exam-question .actions');if(a&&!document.querySelector('.kbd-hint'))a.insertAdjacentHTML('afterend','<div class="kbd-hint">Shortcuts: press A, B, C or D to answer; use the left and right arrow keys to move between questions.</div>')}).observe(document.body,{childList:true,subtree:true})})();
