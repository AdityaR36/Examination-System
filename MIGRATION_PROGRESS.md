# ExamPro migration progress (Node/JSON -> PHP/MySQL/XAMPP)

_Last updated: all phases implemented (checkpoint 2). NOT yet executed on a real PHP/MySQL server._

## How to resume in a new conversation
Provide this project folder + this file and say: "Continue the ExamPro migration from MIGRATION_PROGRESS.md; do not restart or overwrite working modules. First fix whatever fails in TESTING_CHECKLIST.md (paste the errors)."

## Environment note
The sandbox that produced this code had **no PHP and no MySQL**. PHP was only statically reviewed (brace/paren balance, cross-file id/field checks); JavaScript is syntax-checked with `node --check`; SQL was not run.
Expect possible small runtime bugs on first run — that is Phase 8.

## Phase status
| Phase | Scope | Status |
|---|---|---|
| 1 | Analysis + FEATURE_INVENTORY.md | DONE |
| 2 | Schema + seed `database/exampro.sql` (12 tables) | DONE (unexecuted) |
| 3 | config, bootstrap, sessions, CSRF, auth, grading, spreadsheet | DONE (unexecuted) |
| 4 | Admin / Examiner / Student portals (pages + JS + APIs) | DONE (unexecuted) |
| 5 | Exam creation, manual questions, upload, edit/delete, assignment | DONE (unexecuted) |
| 6 | Exam engine + anti-cheat (server deadline, autosave, incidents, threshold) | DONE (unexecuted) |
| 7 | Results + xlsx/csv export | DONE (unexecuted) |
| 8 | Test all workflows | **TODO - must run on XAMPP (TESTING_CHECKLIST.md)** |
| 9 | README, migration script, packaging | DONE |

## Files
index.php; admin/index.php; examiner/{index,workspace}.php; student/index.php;
api/{auth,admin,examiner,student}.php; includes/{bootstrap,functions,csrf,auth,grading,reports,spreadsheet,layout}.php;
config/{database,app}.php; assets/css/{styles,theme}.css (original CSS + one `[hidden]` rule);
assets/js/{common,ux,admin,examiner,student}.js; database/{exampro.sql,migrate_json.php};
README.md, FEATURE_INVENTORY.md, TESTING_CHECKLIST.md. Original untouched in ../ExamPro_original_backup/.

## Known limitations (by design)
- `.xls` (legacy binary) upload unsupported -> save as .xlsx/.csv.
- Old scrypt password hashes cannot be verified in PHP -> migration issues temporary passwords.
- Migrated results lack per-question answers.

## Known bugs
None confirmed (code never executed). Suspected risk areas to check first:
1. `includes/spreadsheet.php` XLSX reading/writing (ZipArchive/XMLReader) with a real Excel file.
2. Fullscreen request timing after `confirm()` in `student.js` (fallback overlay exists).
3. `api/student.php` transactions around `finalize_attempt` (nested in outer transaction).
4. Session file location `uploads/_sessions` (permissions on macOS/Linux XAMPP).

## Next exact steps
1. Import `database/exampro.sql`, open http://localhost/ExamPro/, run TESTING_CHECKLIST.md top to bottom.
2. Fix any failures (check Apache `logs/error.log`; set `'debug' => true` in config/app.php for API error details).
3. Change the seeded passwords; optional: dedicated MySQL user instead of root.
