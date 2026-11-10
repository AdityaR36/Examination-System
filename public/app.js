const $ = s => document.querySelector(s);
const content = $('#content');
const appBase = window.examproBase || '/';
const appPath = window.location.pathname.slice(appBase.length - 1);
const studentStandalone = appPath === '/student';
const examinerWorkspace = appPath === '/examiner/workspace';
if (examinerWorkspace && !localStorage.getItem('examproExaminer')) window.location.replace(appBase+'examiner');
let currentPage = studentStandalone ? 'auth' : 'dashboard';
let uploadedQuestions = [];
let uploadedFile = '';
let activeTest = null;
let activeQuestions = [];
let answers = {};
let currentQuestion = 0;
let remainingSeconds = 0;
let timerHandle = null;
let lastResult = null;
let loggedInStudent = (()=>{try{return JSON.parse(sessionStorage.getItem('examproStudent')||'null')}catch(_){return null;}})();
let cheatingIncidents = [];
let submittingExam = false;
let fullscreenStarted = false;

function currentExaminer(){try{return JSON.parse(localStorage.getItem('examproExaminer')||'null')}catch(_){return null;}}
function examinerResultsUrl(path){const examiner=currentExaminer();return path+(path.includes('?')?'&':'?')+'examinerId='+encodeURIComponent(examiner?.id||'');}
function esc(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function api(url, options={}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(()=>({error:'Unexpected server response.'}));
  if (!res.ok) {
    let message = data.error || 'Something went wrong.';
    if (data.rowErrors) message += ' ' + data.rowErrors.map(x=>`Row ${x.row}: ${x.error}`).join(' ');
    throw new Error(message);
  }
  return data;
}
function toast(msg) { const el=$('#toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),3200); }
function setPage(page) {
  if (timerHandle && page !== 'exam') { clearInterval(timerHandle); timerHandle=null; }
  currentPage=page;
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page || (page==='exam' && b.dataset.page==='student')));
  const titles={dashboard:'Dashboard',create:'Create a test',tests:'Test library',student:'Student workspace',exam:'Examination',results:'Results'};
  $('#pageTitle').textContent=titles[page]||'ExamPro';
  $('#roleLabel').textContent=page==='student'||page==='exam'?'Student workspace':'Examiner workspace';
  if (studentStandalone) {
    document.querySelectorAll('.nav-item').forEach(b => b.style.display = (b.dataset.page === 'student') ? 'flex' : 'none');
    $('#quickCreate').style.display = 'none';
    $('#studentPortalLink').style.display = 'none';
    $('#roleLabel').textContent = 'Student portal';
  }
  render();
}
$('#nav').addEventListener('click', e=>{const b=e.target.closest('[data-page]');if(b)setPage(b.dataset.page);});
$('#quickCreate').addEventListener('click',()=>setPage('create'));
if (studentStandalone) {
  document.querySelectorAll('.nav-item').forEach(b => b.style.display = (b.dataset.page === 'student') ? 'flex' : 'none');
  $('#quickCreate').style.display = 'none';
  $('#studentPortalLink').style.display = 'none';
  $('#roleLabel').textContent = 'Student portal';
  $('#pageTitle').textContent = 'Student sign in';
}

async function render() {
  try {
    if(currentPage==='dashboard') await renderDashboard();
    else if(currentPage==='create') renderCreate();
    else if(currentPage==='tests') await renderTests();
    else if(currentPage==='students') await renderStudents();
    else if(currentPage==='auth') renderAuth();
    else if(currentPage==='student') await renderStudent();
    else if(currentPage==='exam') renderExam();
    else if(currentPage==='results') await renderResults();
  } catch(e) { content.innerHTML=`<div class="notice error">${esc(e.message)}</div>`; }
}
function stat(icon,num,label){return `<div class="stat"><div class="stat-icon">${icon}</div><div><strong>${num}</strong><small>${label}</small></div></div>`;}
async function renderDashboard(){
 const [tests,results]=await Promise.all([api('/api/tests'),api(examinerResultsUrl('/api/results'))]);
 const ongoing=tests.filter(t=>t.status==='Published').length;
 content.innerHTML=`
 <div class="welcome"><div><h2>Welcome back, Examiner 👋</h2><div class="muted">Here's what's happening with your assessments today.</div></div><button class="button primary" onclick="setPage('create')">＋ Create new test</button></div>
 <div class="stats">${stat('▤',tests.length,'Total tests')}${stat('◷',ongoing,'Published tests')}${stat('♙',results.length,'Student attempts')}${stat('✓',results.length,'Submissions received')}</div>
 <div class="two-col"><section class="card"><div class="card-head"><h3>Recent tests</h3><button class="button" onclick="setPage('tests')">View all tests →</button></div>${tests.length?testTable(tests.slice(0,5)):`<div class="empty"><div class="big">▤</div><h3>No tests created yet</h3><p>Create your first test by uploading an Excel question sheet.</p><button class="button primary" onclick="setPage('create')">Create your first test</button></div>`}</section>
 <section class="card"><div class="card-head"><h3>Quick start</h3><span class="pill blue">3 steps</span></div><div class="question-preview"><b>01 · Prepare your spreadsheet</b><p class="muted">Use columns for Question, Option A–D, Correct Answer, and Marks.</p></div><div class="question-preview"><b>02 · Configure the test</b><p class="muted">Set a title, description, and duration up to 360 minutes.</p></div><div class="question-preview"><b>03 · Publish and attempt</b><p class="muted">Open Student view to try the published exam.</p></div><a class="button ghost" href="sample-questions.csv">↓ Download sample CSV</a></section></div>`;
}
function testTable(tests){return `<div class="table-wrap"><table><thead><tr><th>Test name</th><th>Questions</th><th>Duration</th><th>Total marks</th><th>Status</th><th></th></tr></thead><tbody>${tests.map(t=>`<tr><td><b>${esc(t.title)}</b><div class="muted">${esc(t.description||'No description')}</div></td><td>${t.questionCount}</td><td>${t.duration} min</td><td>${t.totalMarks||'—'}</td><td><span class="pill">${esc(t.status)}</span></td><td><button class="button" onclick="startTest('${t.id}')">Preview / attempt</button></td></tr>`).join('')}</tbody></table></div>`;}
function renderCreate(){
 uploadedQuestions=[];uploadedFile='';
 content.innerHTML=`
 <div class="card"><div class="stepper"><div class="step active"><span class="step-num">1</span> Upload questions</div><div class="step"><span class="step-num">2</span> Test settings</div><div class="step"><span class="step-num">3</span> Preview</div><div class="step"><span class="step-num">4</span> Publish</div></div>
 <div class="two-col"><section><h3 style="font:700 16px Manrope;margin:0 0 6px">Upload your question bank</h3><p class="muted" style="margin:0 0 18px">Upload an Excel or CSV file. We'll validate the rows and build your test automatically.</p>
 <form id="uploadForm"><label class="dropzone" id="dropzone" for="questionsFile"><div class="upload-icon">↑</div><strong>Drag your spreadsheet here</strong><p>or choose a file from your device</p><span class="button">Choose file</span><div class="file-name" id="fileName"></div><input id="questionsFile" name="questionsFile" type="file" accept=".csv,.xlsx,.xls" hidden></label><div class="hint"><b>Required columns</b><br>Question · Option A · Option B · Option C · Option D · Correct Answer<br><span style="color:#7e8da4">Marks is optional (defaults to 1). Correct Answer must be A, B, C, or D.</span></div><div id="uploadMessage"></div><div class="actions"><a class="button" href="sample-questions.csv">↓ Download sample CSV</a><button class="button primary" type="submit">Validate & continue →</button></div></form></section>
 <aside><div class="card" style="background:#f9fbff;box-shadow:none"><h3>Spreadsheet checklist</h3><div class="question-preview">✓ First row contains column headings</div><div class="question-preview">✓ Each row contains one MCQ</div><div class="question-preview">✓ Four options per question</div><div class="question-preview">✓ Correct answer uses A / B / C / D</div><p class="muted">Files are processed by this demo server. Maximum file size: 10 MB.</p></div></aside></div></div>`;
 const input=$('#questionsFile'), zone=$('#dropzone');
 input.addEventListener('change',()=>{uploadedFile=input.files[0]?.name||'';$('#fileName').textContent=uploadedFile;});
 ['dragenter','dragover'].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add('dragover');}));
 ['dragleave','drop'].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove('dragover');if(ev==='drop'&&e.dataTransfer.files.length){input.files=e.dataTransfer.files;uploadedFile=input.files[0].name;$('#fileName').textContent=uploadedFile;}}));
 $('#uploadForm').addEventListener('submit', async e=>{
  e.preventDefault(); const file=input.files[0]; if(!file){$('#uploadMessage').innerHTML='<div class="notice error">Choose a spreadsheet first.</div>';return;}
  const fd=new FormData();fd.append('questionsFile',file);
  $('#uploadMessage').innerHTML='<div class="notice">Validating spreadsheet…</div>';
  try{const data=await api('/api/tests/preview-upload',{method:'POST',body:fd});uploadedQuestions=data.questions;uploadedFile=data.fileName;renderSettings(data);}
  catch(err){$('#uploadMessage').innerHTML=`<div class="notice error">${esc(err.message)}</div>`;}
 });
}
function renderSettings(data){
 content.innerHTML=`<div class="card"><div class="stepper"><div class="step done"><span class="step-num">✓</span> Upload questions</div><div class="step active"><span class="step-num">2</span> Test settings</div><div class="step"><span class="step-num">3</span> Preview</div><div class="step"><span class="step-num">4</span> Publish</div></div>
 <div class="notice">✓ ${data.questions.length} questions validated from <b>${esc(data.fileName)}</b>. Total marks: <b>${data.totalMarks}</b>.</div>
 <div class="two-col"><section><h3 style="font:700 16px Manrope;margin:0 0 18px">Test details</h3><form id="settingsForm"><div class="field"><label for="title">Test title *</label><input id="title" required maxlength="100" placeholder="e.g. DBMS Midterm Examination"></div><div class="field"><label for="description">Description (optional)</label><textarea id="description" maxlength="500" placeholder="Add instructions or a short description"></textarea></div><div class="form-row"><div class="field"><label for="duration">Duration (minutes) *</label><input id="duration" type="number" min="1" max="360" value="30" required></div><div class="field"><label>Total marks</label><input value="${data.totalMarks}" disabled></div></div><div class="actions"><button class="button" type="button" onclick="setPage('create')">← Back</button><button class="button primary" type="submit">Preview test →</button></div></form></section><section class="card" style="background:#f9fbff;box-shadow:none"><h3>Question bank summary</h3><div class="result-grid"><div><strong>${data.questions.length}</strong><small>Questions</small></div><div><strong>${data.totalMarks}</strong><small>Total marks</small></div><div><strong>4</strong><small>Options each</small></div></div><p class="muted">The answer key stays on the server and is not sent to the student browser during an exam.</p></section></div></div>`;
 $('#settingsForm').addEventListener('submit',e=>{e.preventDefault();const duration=Number($('#duration').value);if(!Number.isInteger(duration)||duration<1||duration>360){toast('Duration must be between 1 and 360 minutes.');return;}renderPreview({title:$('#title').value.trim(),description:$('#description').value.trim(),duration,questions:uploadedQuestions});});
}
function renderPreview(d){
 content.innerHTML=`<div class="card"><div class="stepper"><div class="step done"><span class="step-num">✓</span> Upload questions</div><div class="step done"><span class="step-num">✓</span> Test settings</div><div class="step active"><span class="step-num">3</span> Preview</div><div class="step"><span class="step-num">4</span> Publish</div></div><div class="notice">Review the test before publishing. Correct answers are highlighted only in this examiner preview.</div><div class="two-col"><section class="card" style="box-shadow:none"><h3 style="font:700 18px Manrope">${esc(d.title)}</h3><p class="muted">${esc(d.description||'No description provided')} · ${d.duration} minutes · ${d.questions.reduce((s,q)=>s+q.marks,0)} marks</p>${d.questions.map((q,i)=>`<div class="question-preview"><div class="preview-header"><b>Question ${i+1}</b><span>${q.marks} mark${q.marks===1?'':'s'}</span></div><div class="question-title">${esc(q.question)}</div><div class="option-list">${q.options.map((o,j)=>`<div class="option-chip ${q.answer==='ABCD'[j]?'correct':''}">${'ABCD'[j]}. ${esc(o)} ${q.answer==='ABCD'[j]?'✓':''}</div>`).join('')}</div></div>`).join('')}</section><aside class="card" style="box-shadow:none;background:#f9fbff"><h3>Ready to publish?</h3><p class="muted">Your test will be saved in the test library and become available in Student view.</p><div class="question-preview"><b>${d.questions.length}</b><p class="muted">Questions</p></div><div class="question-preview"><b>${d.duration} minutes</b><p class="muted">Time limit</p></div><div class="question-preview"><b>${d.questions.reduce((s,q)=>s+q.marks,0)} marks</b><p class="muted">Maximum score</p></div><button id="publishBtn" class="button primary" style="width:100%">✓ Publish test</button><button class="button" style="width:100%;margin-top:8px" id="editBtn">← Edit settings</button></aside></div></div>`;
 $('#editBtn').onclick=()=>renderSettings({questions:d.questions,fileName:uploadedFile,totalMarks:d.questions.reduce((s,q)=>s+q.marks,0)});
 $('#publishBtn').onclick=async()=>{const btn=$('#publishBtn');btn.disabled=true;btn.textContent='Publishing…';try{const test=await api('/api/tests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d, examinerId:currentExaminer()?.id, examinerName:currentExaminer()?.fullName, examinerEmail:currentExaminer()?.email})});toast('Test published successfully.');setPage('tests');}catch(e){btn.disabled=false;btn.textContent='✓ Publish test';toast(e.message);}};
}
async function renderTests(){
 const tests=await api('/api/tests');
 content.innerHTML=`<div class="welcome"><div><h2>Test library</h2><div class="muted">Manage published assessments and try them in student mode.</div></div><button class="button primary" onclick="setPage('create')">＋ Create test</button></div>${tests.length?testTable(tests):`<div class="card empty"><div class="big">▤</div><h3>Your test library is empty</h3><p>Upload an Excel sheet to create your first examination.</p><button class="button primary" onclick="setPage('create')">Create a test</button></div>`}`;
}
function renderAuth(mode='signin',message=''){
 currentPage='auth';$('#pageTitle').textContent='Student access';
 content.innerHTML=`<div class="auth-wrap"><div class="auth-card"><div class="brand auth-brand"><span class="brand-icon">E</span><span>ExamPro</span></div><h2>${mode==='signup'?'Create student account':'Student sign in'}</h2><p class="muted">${mode==='signup'?'Submit your profile for examiner verification before taking tests.':'Sign in using your verified student account.'}</p>${message?`<div class="notice">${esc(message)}</div>`:''}<div id="authMessage"></div>${mode==='signup'?`<form id="signupForm"><div class="field"><label>Full name *</label><input name="fullName" required></div><div class="field"><label>Email *</label><input name="email" type="email" required></div><div class="field"><label>Password * (6+ characters)</label><input name="password" type="password" minlength="6" required></div><div class="field"><label>Student ID / Roll number *</label><input name="studentId" required></div><div class="form-row"><div class="field"><label>Course / Department *</label><input name="course" required placeholder="B.Tech CSE"></div><div class="field"><label>Year *</label><select name="year" required><option value="">Choose year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Other</option></select></div></div><button class="button primary" style="width:100%">Submit profile</button></form><p class="auth-switch">Already registered? <button class="text-button" id="toSignin">Sign in</button></p>`:`<form id="signinForm"><div class="field"><label>Email</label><input name="email" type="email" required></div><div class="field"><label>Password</label><input name="password" type="password" required></div><button class="button primary" style="width:100%">Sign in</button></form><p class="auth-switch">New student? <button class="text-button" id="toSignup">Sign up</button></p>`}<button class="button" id="backExaminer" style="width:100%;margin-top:8px">← Back to examiner dashboard</button></div></div>`;
 $('#toSignup')?.addEventListener('click',()=>renderAuth('signup'));$('#toSignin')?.addEventListener('click',()=>renderAuth('signin'));$('#backExaminer').onclick=()=>{ window.location.href=appBase+'examiner'; };
 $('#signupForm')?.addEventListener('submit',async e=>{e.preventDefault();try{let d=await api('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});renderAuth('signin',d.message);}catch(err){$('#authMessage').innerHTML=`<div class="notice error">${esc(err.message)}</div>`;}});
 $('#signinForm')?.addEventListener('submit',async e=>{e.preventDefault();try{let d=await api('/api/auth/signin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});sessionStorage.setItem('examproToken',d.token);loggedInStudent=d.student;sessionStorage.setItem('examproStudent',JSON.stringify(d.student));setPage('student');}catch(err){$('#authMessage').innerHTML=`<div class="notice error">${esc(err.message)}</div>`;}});
}
async function renderStudents(){
 const [students,tests]=await Promise.all([api('/api/students'),api('/api/tests')]);
 const eligible=students.filter(s=>s.status==='Verified');
 content.innerHTML=`<div class="welcome"><div><h2>Student directory & test allocation</h2><div class="muted">Student verification is handled by the administrator. Assign tests only to verified students.</div></div><span class="pill blue">${eligible.length} eligible</span></div>
 <div class="card"><div class="card-head"><h3>Student directory</h3><span class="pill">Read-only profiles</span></div>${students.length?`<div class="table-wrap"><table><thead><tr><th>Student</th><th>ID</th><th>Course / Year</th><th>Eligibility</th></tr></thead><tbody>${students.map(s=>`<tr><td><b>${esc(s.fullName)}</b><div class="muted">${esc(s.email)}</div></td><td>${esc(s.studentId)}</td><td>${esc(s.course)} · ${esc(s.year)}</td><td><span class="pill ${s.status==='Verified'?'':'draft'}">${s.status==='Verified'?'Verified — eligible':'Not verified'}</span></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><div class="big">♙</div><h3>No student profiles yet</h3><p>Students appear here after registering; the administrator handles verification.</p></div>`}</div>
 <div class="card"><div class="card-head"><h3>Assign a test</h3><span class="pill blue">Verified students only</span></div>${tests.length?`<form id="assignForm"><div class="field"><label>Test</label><select name="testId" required>${tests.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></div><div class="student-checks">${eligible.map(s=>`<label class="student-check"><input type="checkbox" name="studentIds" value="${s.id}"><span><b>${esc(s.fullName)}</b><small>${esc(s.studentId)} · ${esc(s.course)}</small></span></label>`).join('')||'<p class="muted">No verified students available yet. Ask the administrator to verify students.</p>'}</div><div class="actions"><span class="muted">Only selected verified students will see this test.</span><button class="button primary" ${eligible.length?'':'disabled'}>Assign test</button></div></form>`:`<div class="empty"><h3>Create a test before assigning it</h3><button class="button primary" onclick="setPage('create')">Create test</button></div>`}</div>`;
 $('#assignForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);try{const d=await api('/api/assignments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({testId:f.get('testId'),studentIds:f.getAll('studentIds')})});toast(d.message);renderStudents();}catch(err){toast(err.message);}});
}
async function verifyStudent(id,status){try{await api(`/api/students/${id}/verify`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});toast('Student status updated: '+status);renderStudents();}catch(e){toast(e.message);}}
async function renderStudent(){
 if(!loggedInStudent){content.innerHTML=`<div class="welcome"><div><h2>Student portal</h2><div class="muted">Sign in or create an account to access exams.</div></div></div><div class="card empty"><div class="big">♙</div><h3>Welcome to the student portal</h3><p>New profiles need examiner verification before sign-in.</p><button class="button primary" onclick="renderAuth('signin')">Sign in</button> <button class="button" onclick="renderAuth('signup')">Sign up</button></div>`;return;}
 const tests=await api(`/api/students/${loggedInStudent.id}/tests`);content.innerHTML=`<div class="welcome"><div><h2>Hello, ${esc(loggedInStudent.fullName)}</h2><div class="muted">${esc(loggedInStudent.studentId)} · ${esc(loggedInStudent.course)} · Verified</div></div><button class="button" onclick="sessionStorage.removeItem('examproToken');sessionStorage.removeItem('examproStudent');loggedInStudent=null;renderAuth('signin')">Sign out</button></div><div class="notice">Only examinations assigned to your account by the examiner are shown here.</div>${tests.length?tests.map(t=>`<div class="test-card"><div><span class="pill">Assigned to you</span><h3 style="margin-top:10px">${esc(t.title)}</h3><div class="muted">${esc(t.description||'No additional instructions.')}</div><div class="test-meta"><span>◷ ${t.duration} minutes</span><span>▤ ${t.questionCount} questions</span></div></div><button class="button primary" onclick="startTest('${t.id}')">Start test →</button></div>`).join(''):`<div class="card empty"><div class="big">▤</div><h3>No tests assigned yet</h3><p>Your examiner has not allocated an examination to your account.</p></div>`}`;
}
async function startTest(id){
 try{
  // Confirm before calling the endpoint: the server creates the timed attempt on this request.
  if(!confirm('Start this examination now? The timer will begin immediately when you continue. Leaving full-screen mode during the exam will automatically submit your answers and record an incident for examiner review.'))return;
  const data=await api(`/api/tests/${id}/questions`);
  activeTest=data;activeQuestions=data.questions;answers=data.savedAnswers||{};currentQuestion=0;remainingSeconds=data.remainingSeconds??data.duration*60;
  cheatingIncidents=[];submittingExam=false;fullscreenStarted=false;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      fullscreenStarted=!!document.fullscreenElement;
    }
  } catch (_) {
    // Some browsers/settings block fullscreen; the exam still starts, and the limitation is shown.
  }
  setPage('exam');startTimer();
 }catch(e){toast(e.message);}
}
function startTimer(){if(timerHandle)clearInterval(timerHandle);timerHandle=setInterval(()=>{remainingSeconds--;const el=$('#timerText');if(el)el.textContent=formatTime(remainingSeconds);if(remainingSeconds<=0){clearInterval(timerHandle);timerHandle=null;submitExam(true,'time_limit');}},1000);}
function formatTime(s){s=Math.max(0,s);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function renderExam(){
 if(!activeTest){currentPage='student';renderStudent();return;}
 const q=activeQuestions[currentQuestion];
 content.innerHTML=`<div class="exam-top"><div><b>${esc(activeTest.title)}</b><div class="muted" style="margin-top:5px">Question ${currentQuestion+1} of ${activeQuestions.length}</div><div class="muted" style="margin-top:5px">${document.fullscreenElement?'● Full-screen monitoring active':'⚠ Full-screen unavailable — avoid leaving this page'}</div></div><div class="timer">◷ <span id="timerText">${formatTime(remainingSeconds)}</span> remaining</div><button class="button danger" onclick="submitExam(false,'student_submit')">Submit test</button></div><div class="notice" style="margin-bottom:16px">Exam integrity: leaving full-screen mode triggers automatic submission and records an incident for examiner review. Browser controls cannot prevent every form of misconduct.</div><div class="exam-layout"><section class="card exam-question"><div class="q-number">QUESTION ${currentQuestion+1} <span style="float:right">${q.marks} mark${q.marks===1?'':'s'}</span></div><h2>${esc(q.question)}</h2>${q.options.map((o,j)=>`<label class="answer-option ${answers[currentQuestion]==='ABCD'[j]?'selected':''}"><input type="radio" name="answer" value="${'ABCD'[j]}" ${answers[currentQuestion]==='ABCD'[j]?'checked':''}><span><b>${'ABCD'[j]}.</b> &nbsp;${esc(o)}</span></label>`).join('')}<div class="actions"><button class="button" ${currentQuestion===0?'disabled':''} onclick="moveQuestion(-1)">← Previous</button><button class="button primary" onclick="moveQuestion(1)">${currentQuestion===activeQuestions.length-1?'Review answers':'Next question →'}</button></div></section><aside class="card"><div class="card-head"><h3>Question palette</h3><span class="muted">${Object.keys(answers).length}/${activeQuestions.length}</span></div><div class="palette">${activeQuestions.map((_,i)=>`<button class="${i===currentQuestion?'current':answers[i]?'answered':''}" onclick="jumpQuestion(${i})">${i+1}</button>`).join('')}</div><div class="legend"><span><i style="background:#eaf1ff;border-color:#a8c2ff"></i> Current question</span><span><i></i> Answered</span><span><i style="background:white;border-color:#dfe5ee"></i> Not answered</span></div><div class="hint" style="margin-top:22px">Tip: You can move between questions and change your answers before submitting.</div><button class="button" style="width:100%;margin-top:14px" onclick="reportExamIncident()">⚑ Report an incident</button></aside></div>`;
 content.querySelectorAll('input[name="answer"]').forEach(el=>el.addEventListener('change',()=>{answers[currentQuestion]=el.value;fetch(`/api/tests/${activeTest.id}/answers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers})}).catch(()=>{});renderExam();}));
}
function moveQuestion(delta){currentQuestion=Math.max(0,Math.min(activeQuestions.length-1,currentQuestion+delta));renderExam();}
function jumpQuestion(i){currentQuestion=i;renderExam();}
function reportExamIncident(){
 if(!activeTest||submittingExam)return;
 const reason=prompt('Describe the incident or technical issue for the examiner (for example, accidental full-screen exit).');
 if(reason===null)return;
 cheatingIncidents.push({type:'student_report',reason:reason.trim()||'Student reported an incident.',occurredAt:new Date().toISOString()});
 toast('Incident report recorded for examiner review.');
}
document.addEventListener('fullscreenchange',()=>{
 if(!activeTest||submittingExam||currentPage!=='exam')return;
 if(!document.fullscreenElement){
   cheatingIncidents.push({type:'fullscreen_exit',reason:'Full-screen mode was exited during the exam.',occurredAt:new Date().toISOString()});
   submitExam(true,'fullscreen_exit');
 }
});
async function submitExam(auto=false,reason='student_submit'){
 if(!activeTest||submittingExam)return;
 if(!auto&&!confirm('Submit your test now? You cannot change answers after submission.'))return;
 submittingExam=true;
 if(timerHandle){clearInterval(timerHandle);timerHandle=null;}
 const testId=activeTest.id;
 try{
  const payload={answers,studentId:loggedInStudent?.id||null,studentName:loggedInStudent?.fullName||'Demo student',incidents:cheatingIncidents,submissionReason:reason};
  lastResult=await api(`/api/tests/${testId}/submit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  activeTest=null;
  if(document.fullscreenElement&&document.exitFullscreen){try{await document.exitFullscreen();}catch(_){}}
  setPage('result');renderResult(lastResult,auto,reason);
 }catch(e){submittingExam=false;toast('Submission failed: '+e.message+'. Your answers are still on this screen; please try Submit test again.');}
}
function renderResult(payload,auto=false,reason="student_submit"){
 const r=payload.result;
 content.innerHTML=`<div class="card result-box"><div class="upload-icon" style="background:#e8f8ef;color:#17845b;font-size:25px">✓</div><h2 style="font:800 22px Manrope;margin:0">Test submitted successfully</h2><p class="muted">${reason==='fullscreen_exit'?'Full-screen mode was exited. Your answers were auto-submitted and an incident was logged for examiner review.':auto?'Your answers were submitted automatically.':'Your answers have been saved and scored.'}</p><div class="result-score">${r.score} / ${r.totalMarks}</div><div class="result-sub">${r.percentage}% score</div><div class="result-grid"><div><strong>${payload.review.filter(x=>x.correct).length}</strong><small>Correct</small></div><div><strong>${payload.review.length-payload.review.filter(x=>x.correct).length}</strong><small>Incorrect / skipped</small></div><div><strong>${r.percentage}%</strong><small>Percentage</small></div></div><button class="button primary" onclick="showReview()">Review answers</button> <button class="button" onclick="setPage('student')">Back to tests</button></div><div id="reviewArea"></div>`;
 window._lastReview=payload.review;
}
function showReview(){
 const area=$('#reviewArea');if(!area)return;
 area.innerHTML=`<div class="card"><div class="card-head"><h3>Answer review</h3><span class="pill blue">Score details</span></div>${(window._lastReview||[]).map((q,i)=>`<div class="question-preview"><div class="preview-header"><b>Q${i+1}. ${esc(q.question)}</b><span class="pill ${q.correct?'':'draft'}">${q.correct?'Correct':'Incorrect / skipped'} · ${q.correct?q.marks:0}/${q.marks}</span></div><p class="muted">Your answer: <b>${q.chosen||'Not answered'}</b> · Correct answer: <b>${q.correctAnswer}</b></p></div>`).join('')}</div>`;
}
function exportResultsExcel(){downloadAuthed(examinerResultsUrl('/api/results/export.xlsx'),'exampro-results.xlsx');}
async function renderResults(){
 const [results,incidents]=await Promise.all([api(examinerResultsUrl('/api/results')),api(examinerResultsUrl('/api/incidents')).catch(()=>[])]);
 content.innerHTML=`<div class="welcome"><div><h2>Exam results & integrity review</h2><div class="muted">Review submissions and investigate recorded exam incidents.</div></div><div class="actions"><button class="button" onclick="exportResultsExcel()">↓ Export Excel / CSV</button><span class="pill blue">${results.length} submissions</span></div></div>
 <div class="card"><div class="card-head"><h3>Submissions</h3><span class="pill">${results.filter(r=>(r.incidents||[]).length).length} flagged attempts</span></div>${results.length?`<div class="table-wrap"><table><thead><tr><th>Student</th><th>Test</th><th>Submitted</th><th>Score</th><th>Integrity</th></tr></thead><tbody>${results.map(r=>`<tr><td><b>${esc(r.studentName||'Demo student')}</b></td><td>${esc(r.testTitle)}</td><td>${new Date(r.submittedAt).toLocaleString()}</td><td>${r.score} / ${r.totalMarks} (${r.percentage}%)</td><td>${(r.incidents||[]).length?`<span class="pill draft">⚑ ${r.incidents.length} incident(s)</span>`:'<span class="pill">No incident recorded</span>'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><div class="big">▥</div><h3>No submissions yet</h3><p>Completed tests and their integrity records will appear here.</p><button class="button primary" onclick="setPage('student')">Open student view</button></div>`}</div>
 <div class="card"><div class="card-head"><h3>Incident register</h3><span class="pill ${incidents.length?'draft':''}">${incidents.length} recorded</span></div>${incidents.length?`<div class="table-wrap"><table><thead><tr><th>Student</th><th>Test</th><th>Incident</th><th>Time</th><th>Review status</th></tr></thead><tbody>${incidents.map(i=>`<tr><td><b>${esc(i.studentName||'Student')}</b></td><td>${esc(i.testTitle||'')}</td><td><b>${esc(i.type==='fullscreen_exit'?'Full-screen exit':'Student report')}</b><div class="muted">${esc(i.reason||'')}</div></td><td>${new Date(i.occurredAt).toLocaleString()}</td><td><span class="pill draft">Needs examiner review</span></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><h3>No incidents recorded</h3><p>If a student exits full-screen during an exam, the attempt is automatically submitted and an incident is listed here.</p></div>`}</div>`;
}
if (studentStandalone) renderAuth('signin'); else render();
