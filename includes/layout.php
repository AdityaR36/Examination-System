<?php
declare(strict_types=1);
// Small helpers shared by the page templates.

/** <meta csrf> + window.EXAMPRO config for the JavaScript files. */
function page_boot(array $extra = []): string
{
    $cfg = ['base' => base_path()] + $extra;
    return csrf_meta() . "\n<script>window.EXAMPRO=" . json_encode($cfg, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) . ";</script>";
}

function asset(string $path): string
{
    $f = EXAMPRO_ROOT . '/assets/' . ltrim($path, '/');
    $v = is_file($f) ? filemtime($f) : 1;
    return e(url('assets/' . ltrim($path, '/'))) . '?v=' . $v;
}
