<?php
declare(strict_types=1);
require __DIR__ . '/includes/bootstrap.php';
// Visiting the home page ends all portal sessions, so returning to a portal requires signing in again.
auth_logout_all();
?>
<!doctype html><html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ExamPro | Online examinations from spreadsheet to scorecard</title>
<meta name="description" content="ExamPro runs secure online examinations: upload questions from Excel or CSV, assign tests to verified students, and get automatically graded results with integrity records."><meta name="theme-color" content="#0e1a33">
<script>document.documentElement.className='js'</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Hanken+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#0e1a33;--blue:#2455e6;--paper:#f4f6fa;--line:#dde3ee;--mute:#5d6b85;--amber:#d98a0b;--green:#17845b;--ease:cubic-bezier(.22,1,.36,1)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:84px}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 'Hanken Grotesk',system-ui,sans-serif;overflow-x:hidden}
a{color:inherit}:focus-visible{outline:3px solid var(--blue);outline-offset:3px;border-radius:6px}
h1,h2,h3,.brand{font-family:'Bricolage Grotesque',system-ui,sans-serif;letter-spacing:-.02em}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px;position:relative;z-index:1}

/* ambient background */
.bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.bg i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;animation:drift 18s ease-in-out infinite alternate}
.bg i:nth-child(1){width:420px;height:420px;background:#cfdcff;top:-120px;right:-80px}
.bg i:nth-child(2){width:360px;height:360px;background:#d9f3e8;bottom:-100px;left:-100px;animation-duration:22s;animation-delay:-6s}
.bg i:nth-child(3){width:260px;height:260px;background:#ffe8c4;top:46%;left:52%;animation-duration:26s;opacity:.35}
@keyframes drift{to{transform:translate3d(-40px,50px,0) scale(1.12)}}
.progress{position:fixed;top:0;left:0;height:3px;width:100%;background:var(--blue);transform:scaleX(0);transform-origin:0 50%;z-index:30}

/* navigation */
header.top{position:sticky;top:0;z-index:20;transition:background .3s,box-shadow .3s,backdrop-filter .3s}
header.top.stuck{background:#f4f6facc;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 1px 0 var(--line)}
nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
.brand{display:flex;gap:10px;align-items:center;font-weight:800;font-size:22px;text-decoration:none}
.mark{width:34px;height:34px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;transition:transform .5s var(--ease)}.mark i{width:14px;height:14px;background:var(--ink);border-radius:50%;animation:beat 3.2s ease-in-out infinite}
.brand:hover .mark{transform:rotate(180deg)}
@keyframes beat{50%{transform:scale(.6)}}
nav .links{display:flex;gap:26px;font-weight:500;font-size:15px;align-items:center}
nav .links a{text-decoration:none;color:var(--mute);position:relative;padding:4px 0}
nav .links a:after{content:'';position:absolute;left:0;bottom:0;height:2px;width:100%;background:var(--ink);transform:scaleX(0);transform-origin:left;transition:transform .3s var(--ease)}
nav .links a:hover{color:var(--ink)}nav .links a:hover:after{transform:scaleX(1)}

/* hero */
.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:48px 0 72px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--blue);background:#e6edff;padding:6px 12px;border-radius:99px;margin-bottom:18px}
.eyebrow b{width:8px;height:8px;border-radius:50%;background:var(--green);animation:ping 2s infinite}
@keyframes ping{0%{box-shadow:0 0 0 0 #17845b66}70%,100%{box-shadow:0 0 0 9px #17845b00}}
h1{font-size:clamp(38px,5.4vw,64px);line-height:1.02;margin:0 0 20px;font-weight:800}
h1 .hl{position:relative;white-space:nowrap;z-index:0}
h1 .hl:after{content:'';position:absolute;left:-2px;right:-2px;bottom:.06em;height:.32em;background:#ffd98a;z-index:-1;border-radius:3px;transform:scaleX(0);transform-origin:left;animation:draw .9s .9s var(--ease) forwards}
@keyframes draw{to{transform:scaleX(1)}}
.lead{font-size:18px;color:var(--mute);max-width:46ch;margin:0 0 28px}
.btn{display:inline-block;padding:13px 22px;border-radius:10px;font-weight:700;text-decoration:none;background:var(--blue);color:#fff;transition:transform .2s var(--ease),box-shadow .2s var(--ease);box-shadow:0 6px 18px #2455e640}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px #2455e655}.btn:active{transform:none}
.btn.alt{background:transparent;color:var(--ink);border:1.5px solid var(--ink);margin-left:10px;box-shadow:none}.btn.alt:hover{background:var(--ink);color:#fff;box-shadow:none}
.trust{display:flex;gap:18px;flex-wrap:wrap;margin-top:26px;color:var(--mute);font-size:14px}.trust span:before{content:'✓';color:var(--green);font-weight:800;margin-right:6px}

/* demo exam card */
.stage{position:relative;perspective:1000px}
.sheet{background:#fff;border:1.5px solid var(--ink);border-radius:16px;padding:26px;box-shadow:8px 8px 0 var(--ink);transition:transform .25s ease-out;transform-style:preserve-3d;will-change:transform}
.sheet-top{display:flex;justify-content:space-between;font-size:13px;color:var(--mute);margin-bottom:12px;font-weight:500}
.timer{font-variant-numeric:tabular-nums;color:var(--amber);font-weight:700}
.bar{height:4px;background:var(--line);border-radius:4px;margin-bottom:18px;overflow:hidden}.bar i{display:block;height:100%;width:0;background:var(--blue);border-radius:4px;transition:width .7s var(--ease)}
.qbox{min-height:206px;transition:opacity .35s,transform .35s var(--ease)}.qbox.out{opacity:0;transform:translateX(-14px)}
.sheet h3{font-size:22px;margin:0 0 16px;line-height:1.25}
.opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font:inherit;background:none;border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:9px;cursor:pointer;opacity:0;transform:translateY(8px);animation:optIn .45s var(--ease) forwards;transition:border-color .15s,background .15s}
.opt:nth-child(1){animation-delay:.05s}.opt:nth-child(2){animation-delay:.12s}.opt:nth-child(3){animation-delay:.19s}.opt:nth-child(4){animation-delay:.26s}
@keyframes optIn{to{opacity:1;transform:none}}
.opt:hover{border-color:var(--ink)}
.bub{flex:none;width:30px;height:30px;border:2px solid var(--ink);border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;transition:.2s}
.opt[aria-pressed=true]{border-color:var(--blue);background:#eef2fe}.opt[aria-pressed=true] .bub{background:var(--ink);color:#fff;animation:pop .35s var(--ease)}
@keyframes pop{50%{transform:scale(1.25)}}
.pal{display:flex;gap:7px;margin-top:14px}.pal span{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line);transition:.35s var(--ease)}.pal .on{background:var(--ink);border-color:var(--ink);transform:scale(1.06)}.pal .cur{border-color:var(--blue);border-width:3px}
.chip{position:absolute;background:#fff;border:1.5px solid var(--ink);border-radius:99px;padding:7px 14px;font-size:13px;font-weight:700;display:flex;gap:8px;align-items:center;box-shadow:3px 3px 0 var(--ink);animation:bob 5s ease-in-out infinite;white-space:nowrap}
.chip.a{top:-18px;right:-14px}.chip.b{bottom:-18px;left:-18px;animation-delay:-2.2s}
.chip i{width:8px;height:8px;border-radius:50%;background:var(--green)}.chip.b i{background:var(--blue)}
@keyframes bob{50%{transform:translateY(-8px)}}

/* feature strip */
.features{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:0 0 56px}
.feat{background:#ffffffaa;border:1px solid var(--line);border-radius:14px;padding:20px;transition:transform .25s var(--ease),border-color .2s,background .2s}
.feat:hover{transform:translateY(-4px);border-color:var(--ink);background:#fff}
.feat svg{width:28px;height:28px;stroke:var(--blue);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;margin-bottom:10px}
.feat b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:17px;margin-bottom:2px}.feat span{font-size:14px;color:var(--mute)}

/* portals */
.sec-title{font-size:clamp(26px,3.4vw,34px);margin:0 0 6px}.sec-sub{color:var(--mute);margin:0 0 24px}
.portals{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding-bottom:64px}
.portal{background:#fff;border:1px solid var(--line);border-radius:14px;padding:26px;text-decoration:none;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden;transition:transform .3s var(--ease),border-color .2s,box-shadow .3s var(--ease)}
.portal:before{content:'';position:absolute;left:0;top:0;height:4px;width:100%;background:var(--blue);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.portal:hover{border-color:var(--ink);transform:translateY(-6px);box-shadow:0 18px 36px #0e1a331a}.portal:hover:before{transform:scaleX(1)}
.portal .bub{margin-bottom:6px;transition:.3s var(--ease)}.portal:hover .bub{background:var(--ink);color:#fff;transform:rotate(-8deg) scale(1.08)}
.portal h2{font-size:22px;margin:0}.portal p{margin:0;color:var(--mute);font-size:15px;flex:1}.portal b{color:var(--blue)}.portal b span{display:inline-block;transition:transform .25s var(--ease)}.portal:hover b span{transform:translateX(6px)}

/* flow */
.flow{background:var(--ink);color:#fff;border-radius:18px;padding:36px;margin-bottom:56px;position:relative;overflow:hidden}
.flow:before{content:'';position:absolute;width:320px;height:320px;border-radius:50%;right:-110px;top:-140px;background:radial-gradient(#2455e66a,transparent 70%);animation:drift 14s ease-in-out infinite alternate}
.flow h2{margin:0 0 26px;font-size:26px;position:relative}.flow ol{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:0;padding:0;list-style:none;counter-reset:s;position:relative}
.flow li{counter-increment:s;color:#c4cde0;font-size:15px;position:relative}
.flow li:before{content:counter(s);display:grid;place-items:center;width:30px;height:30px;border:2px solid #fff;border-radius:50%;color:#fff;font-weight:700;margin-bottom:10px;background:var(--ink);position:relative;z-index:1}
.flow li:not(:last-child):after{content:'';position:absolute;top:15px;left:40px;right:-24px;height:2px;background:linear-gradient(90deg,#fff8,#fff1);transform:scaleX(0);transform-origin:left;transition:transform .9s .4s var(--ease)}
.flow.in li:not(:last-child):after{transform:scaleX(1)}
.flow li b{display:block;color:#fff;font-size:17px;margin-bottom:4px}
.cta{text-align:center;padding:8px 0 64px}.cta h2{font-size:clamp(26px,3.4vw,34px);margin:0 0 18px}
footer{padding:0 0 36px;color:var(--mute);font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;border-top:1px solid var(--line);padding-top:22px}

/* entrance + scroll reveal (only when JS is on) */
.js .rise{opacity:0;transform:translateY(22px);animation:up .8s var(--ease) forwards;animation-delay:calc(var(--d,0) * 1ms)}
@keyframes up{to{opacity:1;transform:none}}
.js .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s var(--ease),transform .7s var(--ease);transition-delay:calc(var(--d,0) * 1ms)}
.js .reveal.in{opacity:1;transform:none}
.js .stage.rise{animation-name:upStage}@keyframes upStage{from{opacity:0;transform:translateY(30px) rotate(1.5deg)}to{opacity:1;transform:none}}

@media(max-width:860px){.hero{grid-template-columns:1fr;gap:44px;padding-top:20px}.portals,.flow ol{grid-template-columns:1fr}.features{grid-template-columns:1fr 1fr}nav .links .hide-s{display:none}.btn.alt{margin:10px 0 0}.flow li:after{display:none}.chip.a{right:0}.chip.b{left:0}}
@media(max-width:480px){.features{grid-template-columns:1fr}.sheet{padding:20px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.js .rise,.js .reveal{opacity:1;transform:none}h1 .hl:after{transform:scaleX(1)}.flow li:after{transform:scaleX(1)!important}.opt{opacity:1;transform:none}}
</style><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='13' fill='none' stroke='%230e1a33' stroke-width='3.5'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%232455e6'/%3E%3C/svg%3E"></head><body>
<div class="progress" id="progress"></div>
<div class="bg" aria-hidden="true"><i></i><i></i><i></i></div>
<header class="top" id="top"><div class="wrap"><nav aria-label="Main"><a class="brand" href="<?= e(url('/')) ?>" aria-label="ExamPro home"><span class="mark"><i></i></span>ExamPro</a><div class="links"><a class="hide-s" href="#features">Features</a><a href="#portals">Sign in</a><a href="#how">How it works</a></div></nav></div></header>
<div class="wrap">
<main>
<section class="hero"><div>
<div class="eyebrow rise" style="--d:0"><b></b>Secure online examinations</div>
<h1 class="rise" style="--d:80">Online exams, from <span class="hl">spreadsheet</span> to scorecard.</h1>
<p class="lead rise" style="--d:200">Upload your question bank as Excel or CSV, assign the test to verified students, and get graded results with integrity records the moment they submit.</p>
<div class="rise" style="--d:320"><a class="btn" href="#portals">Choose your portal</a><a class="btn alt" href="<?= e(url('samples/sample-questions.csv')) ?>" download>Download sample sheet</a></div>
<div class="trust rise" style="--d:440"><span>Server-side timer</span><span>Auto-grading</span><span>Excel &amp; CSV import</span></div></div>
<div class="stage rise" style="--d:260" id="stage"><div class="sheet" id="sheet" role="group" aria-label="Interactive sample question">
<div class="sheet-top"><span id="qn">Question 1 of 5</span><span class="timer" id="t">29:59</span></div>
<div class="bar" aria-hidden="true"><i id="bar"></i></div>
<div class="qbox" id="qbox"><h3 id="qtext"></h3><div id="opts"></div></div>
<div class="pal" id="pal" aria-hidden="true"></div></div>
<div class="chip a" aria-hidden="true"><i></i>Answers autosaved</div><div class="chip b" aria-hidden="true"><i></i>Graded instantly</div></div>
</section>

<section class="features" id="features" aria-label="Key features">
<div class="feat reveal" style="--d:0"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg><b>Fair timing</b><span>The clock lives on the server, so refreshing never resets it.</span></div>
<div class="feat reveal" style="--d:90"><svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg><b>Spreadsheet import</b><span>Row-by-row checks tell you exactly what to fix in your file.</span></div>
<div class="feat reveal" style="--d:180"><svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg><b>Integrity log</b><span>Full-screen exits and tab switches are recorded with timestamps.</span></div>
<div class="feat reveal" style="--d:270"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg><b>Instant results</b><span>Scores, pass marks and exports to Excel the moment tests close.</span></div>
</section>

<section id="portals" aria-labelledby="ph"><h2 class="sec-title reveal" id="ph">Choose your portal</h2><p class="sec-sub reveal" style="--d:60">Everyone signs in from their own workspace.</p>
<div class="portals"><a class="portal reveal" style="--d:0" href="<?= e(url('admin/')) ?>"><span class="bub">A</span><h2>Administrator</h2><p>Create examiner accounts, verify students and oversee examinations and results.</p><b>Sign in as administrator <span>→</span></b></a>
<a class="portal reveal" style="--d:110" href="<?= e(url('examiner/')) ?>"><span class="bub">B</span><h2>Examiner</h2><p>Upload or write questions, publish tests and assign exams to verified students.</p><b>Sign in as examiner <span>→</span></b></a>
<a class="portal reveal" style="--d:220" href="<?= e(url('student/')) ?>"><span class="bub">C</span><h2>Student</h2><p>Register your profile, take assigned tests and see your score right away.</p><b>Sign in or register <span>→</span></b></a></div></section>

<section class="flow reveal" id="how"><h2>How a test runs</h2><ol><li><b>Administrator adds examiners</b>Only accounts created by the administrator can publish tests.</li><li><b>Students are verified, then assigned</b>The administrator approves students; examiners give them specific tests.</li><li><b>Student attempts once</b>A server-side timer applies, and leaving full screen submits automatically.</li></ol></section>

<section class="cta reveal"><h2>Ready to run your next exam?</h2><a class="btn" href="<?= e(url('examiner/')) ?>">Go to examiner sign in</a></section>
</main>
<footer><span>© <span id="yr">2026</span> ExamPro online examination system</span><span><a href="<?= e(url('admin/')) ?>">Administrator</a> · <a href="<?= e(url('examiner/')) ?>">Examiner</a> · <a href="<?= e(url('student/')) ?>">Student</a></span></footer></div>
<script>
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('yr').textContent=new Date().getFullYear();

/* nav shadow + scroll progress */
var top=document.getElementById('top'),prog=document.getElementById('progress'),tick=false;
function onScroll(){var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;top.classList.toggle('stuck',y>8);prog.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';tick=false}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

/* reveal on scroll */
var els=[].slice.call(document.querySelectorAll('.reveal'));
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(el){io.observe(el)});
}else els.forEach(function(el){el.classList.add('in')});

/* live exam demo */
var Q=[
 {q:'Which language is used to structure web pages?',o:['Python','Java','HTML','C++'],a:2},
 {q:'What does CSS control on a web page?',o:['Database queries','Presentation and layout','Server routing','File uploads'],a:1},
 {q:'Which HTTP method is normally used to fetch data?',o:['POST','DELETE','PUT','GET'],a:3},
 {q:'What does the “S” in HTTPS stand for?',o:['Secure','Simple','Server','Standard'],a:0},
 {q:'Which symbol starts a comment in Python?',o:['//','#','--','/*'],a:1}
];
var qn=document.getElementById('qn'),qt=document.getElementById('qtext'),box=document.getElementById('opts'),qbox=document.getElementById('qbox'),pal=document.getElementById('pal'),bar=document.getElementById('bar');
var cur=0,done={},timer=null,pausedUntil=0;
Q.forEach(function(){pal.appendChild(document.createElement('span'))});
function draw(){
  var d=Q[cur];qn.textContent='Question '+(cur+1)+' of '+Q.length;qt.textContent=d.q;box.innerHTML='';
  d.o.forEach(function(t,i){var b=document.createElement('button');b.className='opt';b.type='button';b.setAttribute('aria-pressed',done[cur]===i?'true':'false');
    var s=document.createElement('span');s.className='bub';s.textContent='ABCD'[i];b.appendChild(s);b.appendChild(document.createTextNode(t));
    b.onclick=function(){pick(i);pausedUntil=Date.now()+9000};box.appendChild(b)});
  [].forEach.call(pal.children,function(s,i){s.className=(done[i]!==undefined?'on ':'')+(i===cur?'cur':'')});
  bar.style.width=(Object.keys(done).length/Q.length*100)+'%';
}
function pick(i){done[cur]=i;[].forEach.call(box.children,function(b,j){b.setAttribute('aria-pressed',j===i?'true':'false')});
  [].forEach.call(pal.children,function(s,k){s.className=(done[k]!==undefined?'on ':'')+(k===cur?'cur':'')});bar.style.width=(Object.keys(done).length/Q.length*100)+'%'}
function go(n){qbox.classList.add('out');setTimeout(function(){cur=n;if(n===0)done={};draw();qbox.classList.remove('out')},300)}
draw();
if(!reduce){
  var step=0;
  timer=setInterval(function(){
    if(Date.now()<pausedUntil||document.hidden)return;
    if(step===0){pick(Q[cur].a);step=1}else{step=0;go((cur+1)%Q.length)}
  },2200);
}else{pick(Q[0].a)}

/* countdown */
var s=1799,t=document.getElementById('t');
setInterval(function(){s=s>0?s-1:1799;t.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},1000);

/* flow connector lines */
var flow=document.getElementById('how');
if('IntersectionObserver' in window){new IntersectionObserver(function(e,o){if(e[0].isIntersecting){flow.classList.add('in');o.disconnect()}},{threshold:.3}).observe(flow)}else flow.classList.add('in');

/* gentle 3D tilt on the demo card (mouse only) */
var stage=document.getElementById('stage'),sheet=document.getElementById('sheet');
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  stage.addEventListener('mousemove',function(e){var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;sheet.style.transform='rotateY('+(x*7)+'deg) rotateX('+(-y*7)+'deg)'});
  stage.addEventListener('mouseleave',function(){sheet.style.transform=''});
}
})();
</script></body></html>
