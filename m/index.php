<?php
    include_once '../module/db.php';

    $db = new DB();
    $data = $db -> query("SELECT path FROM list WHERE title=? OR seq=?", [$_GET['iD'] ?? 0, $_GET['iD'] ?? 0]);

    if ($data == null) {
        echo "error";
        exit;
    }

    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');

    $file_path = $data[0]['path'];
    $type = "audio/mp3";
    $buffer = 1024 * 16;
    include '../module/steam.php';
?>