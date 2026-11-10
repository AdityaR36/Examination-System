# ExamPro — Full-stack examination system prototype

A small runnable prototype demonstrating an examiner uploading an Excel/CSV question bank, configuring and publishing a test, and a student taking a timed MCQ exam.

## Requirements
- Node.js 18+ and npm
- Internet is not required for the core app after dependencies have been installed. Google Fonts are optional.

## Run locally
1. Extract the ZIP.
2. Open a terminal in the `exampro-prototype` folder.
3. Install packages:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` for the new home page with Admin, Examiner, and Student portals.
6. Open `http://localhost:3000/student` for the separate student portal.
7. Open `http://localhost:3000/examiner` for examiner sign-in (admin-created accounts only).
8. Open `http://localhost:3000/admin` for the admin portal. Demo admin credentials: `admin` / `admin123`.
9. After examiner sign-in, the workspace opens at `/examiner/workspace`.

## Excel template
The first worksheet must contain a header row with these columns (header capitalization is flexible; CSV comma, semicolon, and tab delimiters are supported):
- `Question`
- `Option A`
- `Option B`
- `Option C`
- `Option D`
- `Correct Answer` — one of A, B, C, D
- `Marks` — optional; defaults to 1

A sample `sample-questions.csv` is included and can be opened in Excel. Supported uploads: `.xlsx`, `.xls`, `.csv`. Maximum upload size: 10 MB.

## Demo workflow
1. Examiner Dashboard → Create test.
2. Upload sample-questions.csv or your own spreadsheet.
3. Validate, enter test title and duration, preview, publish.
4. Student portal → Sign up and submit a profile.
5. Examiner → Student verification → Verify the student.
6. Examiner → Assign a test to one or more verified students.
7. Student portal → Sign in; only assigned tests are displayed.
5. Answer questions, navigate with the question palette, submit, and view the score.
6. Results view lists submissions.

## API endpoints
- `GET /api/health`
- `GET /api/tests`
- `POST /api/tests/preview-upload` — multipart field `questionsFile`
- `POST /api/tests` — create/publish a test
- `GET /api/tests/:id/questions` — sends questions/options without answer keys
- `POST /api/tests/:id/submit` — grade submitted answers
- `POST /api/admin/examiners` — admin creates an examiner account\n- `GET /api/admin/examiners` — list examiner accounts\n- `POST /api/examiner/signin` — examiner sign-in\n- `POST /api/auth/signup` — register a student profile pending verification
- `POST /api/auth/signin` — demo sign-in for verified profiles
- `GET /api/students` — list profiles for examiner review
- `PATCH /api/students/:id/verify` — verify or reject profile
- `POST /api/assignments` — allocate test to verified students
- `GET /api/students/:id/tests` — list tests allocated to student
- `GET /api/results`

## Important prototype limitations
This is a learning/demo prototype, not a production examination platform. It includes a demo student sign-up/sign-in and examiner verification/allocation workflow, but this is not secure production authentication: passwords are stored in plain text, there are no sessions/tokens or real examiner authorization, and API routes are not protected. It also lacks anti-cheating controls, concurrent-attempt limits, and database migrations. Data is stored in a local `data.json` file. Before real use, add secure examiner/student accounts, server-side authorization, per-student attempts, duplicate submission protection, audit logs, a real database, backups, CSRF/rate-limit protections, and appropriate exam integrity controls. Do not use it for high-stakes examinations as-is.


## Security upgrade (v12)
- Passwords are hashed with scrypt (old plain-text records still sign in; re-create them when you can).
- Every `/api` route needs a sign-in token and the right role (admin / examiner / student). Examiners only see their own results.
- Students can only open tests assigned to them, once. The timer is enforced on the server and survives a page refresh.
- Set your own admin login before use: `ADMIN_USER=you ADMIN_PASS=strong-password npm start` (defaults to admin / admin123 with a warning).
- Still needed for high-stakes use: a real database, HTTPS, persistent sessions, audit logs.
