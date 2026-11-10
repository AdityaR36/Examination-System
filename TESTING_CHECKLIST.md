# ExamPro test checklist (run on XAMPP; tick every box)

Sample logins (see README): admin / admin123 · examiner@example.com / Examiner@123 · student@example.com / Student@123

## Setup
- [ ] phpMyAdmin import of `database/exampro.sql` succeeds; 12 tables exist
- [ ] `http://localhost/ExamPro/` shows the home page with styling
- [ ] PHP extensions `pdo_mysql`, `zip`, `mbstring`, `xml` enabled (`php -m`)

## Admin
- [ ] Wrong password -> error; correct login -> dashboard; refresh keeps session
- [ ] Create examiner; duplicate email rejected; disable examiner -> that examiner can no longer sign in / API returns 401
- [ ] Reset examiner password; sign in with new one
- [ ] Verify / reject / reset a newly registered student
- [ ] Examinations list shows every examiner's exams; examiner filter works; Monitor panel lists attempts
- [ ] Results list + filters (examiner, exam, student, search); Export Excel opens in Excel with 2 sheets; CSV opens with correct accents
- [ ] Sign out -> admin pages/API require login again

## Examiner
- [ ] Upload `samples/sample-questions.csv` -> 4 questions; upload bad file -> row errors shown; `.xls` -> clear message; >10 MB rejected
- [ ] Upload a real `.xlsx` (Option A-D headers and Choice 1-4 variant)
- [ ] Add questions manually; move/remove; append from spreadsheet
- [ ] Settings: duration, negative marking, violation limit, pass %, show-results; preview shows answers (examiner only)
- [ ] Publish; Save as draft; Edit draft; Close; Reopen; Delete (blocked once attempts exist)
- [ ] Assign to verified student only; already-assigned students are locked in the list
- [ ] Attempts page shows live attempts; Details shows answers + incidents
- [ ] Results + export contain only own exams
- [ ] **IDOR**: sign in as Examiner B; open `api/examiner.php?action=exam&id=<A's exam id>`, `attempts&exam_id=`, `results&exam_id=`, `attempt_review&attempt_id=`, `export&exam_id=` -> 404 / empty. POST `exam_delete`, `exam_status`, `assign` with A's id -> 404

## Student
- [ ] Sign up -> "awaiting verification"; cannot sign in until verified
- [ ] Dashboard lists only assigned, published exams
- [ ] Cancel the start confirm -> no attempt created (check `exam_attempts`)
- [ ] Start -> fullscreen, timer counts down; answers persist after selecting (check `submitted_answers`)
- [ ] **Refresh mid-exam** -> dashboard shows "Resume"; timer continues from the server value (not reset); answers restored; `exam_resumed` incident (not counted) logged
- [ ] Disconnect network (DevTools offline), answer a question -> "Offline - retrying"; reconnect -> saved
- [ ] Manual submit -> result; double-click submit / replay request -> only one `results` row
- [ ] Let the timer expire -> auto-submit with reason "time limit"; set `deadline_at` in the past in SQL and call `answer` -> 409 + finalized
- [ ] Close the browser during an exam, wait past the deadline, open examiner Results -> attempt finalized as time limit
- [ ] Student cannot call `start` for an exam not assigned (403) or fetch another student's attempt (404)
- [ ] Network response of `start` contains no `answer`/`is_correct` fields
- [ ] show_results off -> student sees "score not released"; no review

## Anti-cheating
- [ ] Violation limit 1: press Esc -> auto-submit, reason "Full-screen exit", incident recorded with time
- [ ] Violation limit 3: Esc -> warning overlay "Violation 1 of 3", return to fullscreen; third violation auto-submits
- [ ] Switch tab / minimise -> `tab_switch` incident; one Alt+Tab is not double counted
- [ ] Window blur > 3 s -> `window_blur` (not counted)
- [ ] Report an incident -> shows in examiner/admin register
- [ ] Plain F5 refresh is NOT counted as a violation

## Database / security
- [ ] Foreign keys: delete an exam in phpMyAdmin -> its questions/options/attempts cascade
- [ ] `UNIQUE(exam_id, student_id)` blocks a second attempt row
- [ ] POST without `X-CSRF-Token` -> 419
- [ ] Passwords in tables are `$2y$...` hashes
- [ ] `http://localhost/ExamPro/config/database.php`, `/includes/`, `/database/`, `/uploads/` return 403
- [ ] Negative marking: 2 wrong answers deduct `marks x fraction`; total never below 0
