<?php
    include_once '../module/db.php';

    $res = array();
    $db = new DB();
    $data = $db -> query("SELECT seq, title, lyrics FROM list");

    foreach ($data as $v) {
        $res[$v['seq']] = array('title' => $v['title'], 'lyrics' => $v['lyrics']);
    }

    echo json_encode($res);
?>