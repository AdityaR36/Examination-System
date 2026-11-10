# ExamPro — PHP + MySQL (XAMPP)

ExamPro is an online MCQ examination system with **Admin, Examiner and Student portals**.
## Install on XAMPP (Windows / macOS / Linux)
1. Install XAMPP with **PHP 8.0+** (https://www.apachefriends.org).
2. Copy the `ExamPro` folder to `C:\xampp\htdocs\ExamPro` (macOS: `/Applications/XAMPP/htdocs`).
3. Start **Apache** and **MySQL** in the XAMPP Control Panel.
4. Open `http://localhost/phpmyadmin` -> **Import** -> choose `database/exampro.sql` -> **Go**. (It creates the `exampro` database, tables and sample data.)
5. Check `config/database.php` (defaults: host `127.0.0.1`, user `root`, empty password, database `exampro`).
6. Make sure the PHP extension `zip` is enabled (it is by default; needed for `.xlsx` upload/export). `php.ini`: `extension=zip`, then restart Apache.
7. Open **http://localhost/ExamPro/**

## Sample logins (change them!)
| Role | Login | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Examiner | `examiner@example.com` | `Examiner@123` |
| Student | `student@example.com` | `Student@123` (already verified, assigned to the sample test) |

Portals: `/ExamPro/admin/`, `/ExamPro/examiner/`, `/ExamPro/student/`.
New students register themselves, then an **administrator verifies** them; examiners assign tests to verified students.

## Migrating old data
Your supplied `data.json` was empty, so nothing had to be imported. If you have a populated one:
`C:\xampp\php\php.exe database\migrate_json.php "C:\path\data.json" --dry-run` then again without `--dry-run`.
Old scrypt password hashes cannot be verified by PHP, so those accounts get temporary passwords written to `database/migration_credentials.csv` (delete it after use). The original implementation is kept untouched in `ExamPro_original_backup/`.

## Folder structure
```
ExamPro/
  index.php                 home page
  admin/ examiner/ student/ portal pages
  api/                      auth.php admin.php examiner.php student.php (JSON endpoints)
  includes/                 bootstrap, auth, csrf, functions, grading, reports, spreadsheet
  config/                   database.php app.php
  assets/css js images      original CSS + ported JS
  database/                 exampro.sql, migrate_json.php
  samples/                  sample-questions.csv
  uploads/                  (denied from the web; holds PHP session files)
```

## How the important parts work
* **Timer:** `exam_attempts.deadline_at` is fixed by the server when the student starts. The browser only displays `deadline - now` (re-synced every 20 s and on every save), so refreshing never resets it. After the deadline (+5 s network grace, `config/app.php`) the server refuses answers and finalizes the attempt; attempts abandoned by closing the browser are finalized the next time anyone views results.
* **Autosave:** every answer is saved immediately; failed saves are retried and the full answer set is re-sent on submit.
* **Submission:** one transaction locks the attempt row, grades, writes `results`, and closes the attempt; repeated or concurrent submits return the stored result.
* **Anti-cheating:** the browser detects full-screen exit, tab hidden and window blur and reports them to `api/student.php?action=incident`; the server stores timestamped incidents and auto-submits when the examiner-configured *violation limit* is reached (default 1 = original behaviour). Reloading the page is logged as an informational `exam_resumed` event and is **not** counted. Browser-side monitoring can deter and record misconduct; it cannot completely prevent it (another device, a second monitor, etc.).
* **Scoring:** correct = question marks; wrong = `-marks x fraction` if negative marking is on; total is never below 0; pass mark default 40 %.
* **Access control:** examiner queries always include `examiner_id = <session user>`; other examiners' ids return 404. Students only reach their own assignments/attempts. The answer key is never sent during an exam.
* **Security:** bcrypt (`password_hash`), session-id regeneration at login, separate session namespace per role, CSRF header on all non-GET API calls, PDO prepared statements, output escaping, upload type/size checks (files are parsed from the temp upload and never stored), CSV formula-injection guard, login throttling.

## Question file format
Headers: `Question, Option A, Option B, Option C, Option D, Correct Answer (A-D), Marks (optional)`; aliases such as `Choice A` or `Option 1` work. `.xlsx` and `.csv` supported (UTF-8, `;`/tab delimiters auto-detected).

## Limitations / differences from the original
* Legacy **`.xls`** files are not supported (no library-free reader) — save as `.xlsx` or `.csv`. The original accepted `.xls`.
* The old examiner "Preview / attempt" button (which created a demo result) is now a read-only **Preview**; examiners cannot take their own tests.
* Examiners cannot verify students (the original UI said so too; the admin does).
* Migrated results have no per-question answers (the old JSON never stored them).
* Sessions are one PHP session per browser; roles stay independent, but two different users of the same role in the same browser profile will replace each other.
* **This build was written without access to PHP/MySQL, so it was statically reviewed but not executed.** Run `TESTING_CHECKLIST.md` first and report any failure.
