<?php
    include_once './module/db.php';

    $db = new DB();
    $path = __DIR__ . '/assets';
    $handle = opendir($path);
 
    while (($file = readdir($handle)) !== FALSE) {
        if ($file == '' || $file == '.' || $file == '..') continue;
        if (($name = preg_replace('/\.(mp3)$/', '', $file)) == $file) continue;

        preg_match("/^(.*?) - (.*?)$/", $name, $tl);
        $title = $tl[2];
        $lyrics = $tl[1];

        if ($db -> query("SELECT seq FROM list WHERE title=? and lyrics=?", [$title, $lyrics]) !== null) continue;

        $p = "{$path}/{$file}";
        $db -> insert("INSERT INTO list(title, lyrics, path) VALUES(?, ?, ?)", [$title, $lyrics, $p]);
    }
    
    closedir($handle);
?>