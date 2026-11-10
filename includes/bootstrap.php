<?php
// Loaded by every page and API endpoint.
declare(strict_types=1);

define('EXAMPRO_ROOT', dirname(__DIR__));
date_default_timezone_set('UTC');
if (function_exists('mb_internal_encoding')) mb_internal_encoding('UTF-8');

$GLOBALS['EXAMPRO_CFG'] = require EXAMPRO_ROOT . '/config/app.php';

require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/grading.php';
require_once __DIR__ . '/reports.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header_remove('X-Powered-By');

// --- Session setup ---------------------------------------------------------------------------
$ttl = (int) app_cfg('session_ttl', 28800);
$sessDir = EXAMPRO_ROOT . '/uploads/_sessions';   // uploads/ is blocked from the web by .htaccess
if (!is_dir($sessDir)) @mkdir($sessDir, 0700, true);
if (is_dir($sessDir) && is_writable($sessDir)) session_save_path($sessDir);
ini_set('session.gc_maxlifetime', (string) $ttl);   // default (24 min) would kill long exams
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_name((string) app_cfg('session_name', 'EXAMPRO_SID'));
$cookiePath = base_path() === '' ? '/' : base_path() . '/';
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => $cookiePath,
    'secure'   => is_https(),
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
