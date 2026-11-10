<?php
$route = $_GET['route'] ?? '';
$map = [
  'student' => 'workspace.html',
  'examiner' => 'examiner-login.html',
  'examiner/workspace' => 'workspace.html',
  'admin' => 'admin.html'
];
$file = $map[$route] ?? 'home.html';
readfile(__DIR__ . '/' . $file);
