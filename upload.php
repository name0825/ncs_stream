<?php
    include_once './module/db.php';

    $db = new DB();
    $path = __DIR__ . '/assets';
    $handle = opendir($path);
 
    while (($file = readdir($handle)) !== FALSE) {
        if ($file == '' || $file == '.' || $file == '..') continue;
        if (($name = preg_replace('/\.(mp3)$/', '', $file)) == $file) continue;
        if ($db -> query("SELECT seq FROM list WHERE title=?", [$name]) !== null) continue;

        $p = "{$path}/{$file}";
        $db -> insert("INSERT INTO list(title, path) VALUES(?, ?)", [$name, $p]);
    }
    
    closedir($handle);
?>