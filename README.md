# ExamPro — online examinations (PHP + MySQL)

ExamPro is an online MCQ examination system with **Admin, Examiner and Student portals**, built with **PHP 8 + MySQL (PDO)**. No Node.js, npm, Composer or external service is needed.

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

## Folder structure
```
ExamPro/
  index.php                 home page
  admin/ examiner/ student/ portal pages
  api/                      auth.php admin.php examiner.php student.php (JSON endpoints)
  includes/                 bootstrap, auth, csrf, functions, grading, reports, spreadsheet
  config/                   database.php app.php
  assets/css js             styles and browser scripts
  database/                 exampro.sql
  samples/                  sample-questions.csv
  uploads/                  (denied from the web; holds PHP session files)
```

## How the important parts work
* **Timer:** `exam_attempts.deadline_at` is fixed by the server when the student starts. The browser only displays `deadline - now` (re-synced every 20 s and on every save), so refreshing never resets it. After the deadline (+5 s network grace, `config/app.php`) the server refuses answers and finalizes the attempt; attempts abandoned by closing the browser are finalized the next time anyone views results.
* **Autosave:** every answer is saved immediately; failed saves are retried and the full answer set is re-sent on submit.
* **Submission:** one transaction locks the attempt row, grades, writes `results`, and closes the attempt; repeated or concurrent submits return the stored result.
* **Anti-cheating:** the browser detects full-screen exit, tab hidden and window blur and reports them to `api/student.php?action=incident`; the server stores timestamped incidents and auto-submits when the examiner-configured *violation limit* is reached (default 1). Reloading the page is logged as an informational `exam_resumed` event and is **not** counted. Browser-side monitoring can deter and record misconduct; it cannot completely prevent it (another device, a second monitor, etc.).
* **Scoring:** correct = question marks; wrong = `-marks x fraction` if negative marking is on; total is never below 0; pass mark default 40 %.
* **Access control:** examiner queries always include `examiner_id = <session user>`; other examiners' ids return 404. Students only reach their own assignments/attempts. The answer key is never sent during an exam.
* **Security:** bcrypt (`password_hash`), session-id regeneration at login, separate session namespace per role, CSRF header on all non-GET API calls, PDO prepared statements, output escaping, upload type/size checks (files are parsed from the temp upload and never stored), CSV formula-injection guard, login throttling.

## Question file format
Headers: `Question, Option A, Option B, Option C, Option D, Correct Answer (A-D), Marks (optional)`; aliases such as `Choice A` or `Option 1` work. `.xlsx` and `.csv` supported (UTF-8, `;`/tab delimiters auto-detected).

## Limitations
* Binary **`.xls`** files are not supported — save as `.xlsx` or `.csv`.
* Examiners preview tests read-only and cannot take their own tests; students are verified by the administrator, not by examiners.
* Sessions are one PHP session per browser; roles stay independent, but two different users of the same role in the same browser profile will replace each other.
* Browser-based monitoring records and deters misconduct but cannot prevent every form of it, so it is not suited to high-stakes exams on its own.
* Run `TESTING_CHECKLIST.md` after installing to confirm everything works on your server.
