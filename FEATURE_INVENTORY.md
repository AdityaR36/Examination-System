# Feature inventory of the original ExamPro (Node.js/Express + data.json) and its PHP/MySQL status

| # | Original feature | Original location | New implementation | Status |
|---|---|---|---|---|
| 1 | Home page with 3 portal cards, how-it-works, sample CSV link | home.html | `index.php` | Same UI |
| 2 | Admin sign-in (admin/admin123), 8h token | admin.html, /api/admin/login | `admin/index.php`, `api/auth.php?action=admin_login`, PHP session | Same UI |
| 3 | Admin overview: counts + pending students | admin.html | `api/admin.php?action=overview` | Same UI |
| 4 | Admin creates examiner (name/email/temp password) | /api/admin/examiners | `examiner_create` (bcrypt) | Same UI |
| 5 | Admin examiner directory + search | admin.html | `examiners` + search | Same UI, + status/reset/delete |
| 6 | Admin verifies / rejects / resets students | PATCH /api/students/:id/verify | `student_status` | Same UI, + set password |
| 7 | Admin examination catalogue (read-only) + search | /api/tests | `exams` | Same UI, + examiner filter, Monitor panel |
| 8 | Admin results list + Excel export | /api/results, export.xlsx | `results`, `export` (xlsx + csv) | Same UI, + filters by examiner/exam/student, incident register |
| 9 | Examiner sign-in | examiner-login.html | `examiner/index.php` | Same UI |
| 10 | Examiner dashboard (4 stats, recent tests, quick start) | app.js | `examiner.js` | Same UI |
| 11 | Create test: upload xlsx/xls/csv, validate (row errors), settings, preview, publish | app.js, /api/tests/preview-upload, /api/tests | wizard in `examiner.js`, `preview_upload`, `exam_save` | Same UI; `.xls` unsupported (see limitations) |
| 12 | Header aliases (Option A / Choice A / Option 1 …), marks default 1, duration 1-360 | server.js | `includes/spreadsheet.php`, `validate_*` | Preserved |
| 13 | Test library | app.js | `tests` page | Same UI, + edit/publish/close/delete/attempts |
| 14 | Students & assignments (verified only) | /api/assignments | `assign`, `unassign` | Same UI; already-assigned students marked |
| 15 | Results & integrity review + incident register | /api/results, /api/incidents | `results`, `incidents`, `attempt_review` | Same UI, own data only |
| 16 | Student sign-up (pending verification), sign-in | /api/auth/* | `auth.php`, `student.js` | Same UI |
| 17 | Student dashboard with assigned tests | /api/students/:id/tests | `student.php?action=tests` | Same UI, + status/resume/result |
| 18 | Start test (confirm, fullscreen), question view, palette, keyboard shortcuts, timer colours | app.js, ux.js | `student.js`, `ux.js` | Same UI |
| 19 | Full-screen exit => auto-submit + incident | app.js | `incident` endpoint, `max_violations` (default 1 = original) | Preserved, configurable |
| 20 | Report an incident button | app.js | `student_report` incident | Preserved |
| 21 | Scoring + result page + answer review | /api/tests/:id/submit | `finalize_attempt`, `build_review` | Preserved (+ pass/fail, negative marking) |
| 22 | Rate-limited sign-in (20/15min), scrypt hashing, token auth | security.js | `login_attempts` table, bcrypt (`password_hash`), PHP sessions + CSRF | Replaced with PHP equivalents |
| 23 | JSON persistence | data.json | MySQL `database/exampro.sql` | Replaced |

## Gaps in the ORIGINAL that the new build fixes
- Attempt (and timer) started when the questions were fetched, even if the student cancelled the confirm box -> now an explicit `start` call after confirmation.
- Timer was JS-only and reset on refresh -> server-held deadline.
- No tab-switch detection, no per-attempt incident history stored with the attempt, no answer persistence, no duplicate-submission protection.
- Examiner results filtering relied on a client-supplied `examinerId` -> now taken from the session only.
- Admin results table showed `score / undefined` -> shows score / total marks.

## Added (requested in the migration brief, not in the original)
Manual MCQ entry, exam edit/delete/close, negative marking, violation threshold, pass percentage, tab-switch/blur detection, result-release switch, admin examiner enable/disable/reset, per-exam monitoring, CSV export, JSON->MySQL migration script.
