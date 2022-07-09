<?php
    $fp = @fopen($file_path, 'rb');
    $size   = filesize($file_path);
    $length = $size;
    $start  = 0;
    $end    = $size - 1;

    header("Accept-Ranges: 0-$length");
    header("Content-type: {$type}");

    if (isset($_SERVER['HTTP_RANGE'])) {
        $c_start = $start;
        $c_end   = $end;
        list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);

        if (strpos($range, ',') !== false) {
            header('HTTP/1.1 416 Requested Range Not Satisfiable');
            header("Content-Range: bytes $start-$end/$size");
            exit;
        }

        if ($range == '-') $c_start = $size - substr($range, 1);
        else {
            $range  = explode('-', $range);
            $c_start = $range[0];
            $c_end   = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $size;
        }

        $c_end = ($c_end > $end) ? $end : $c_end;

        if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
            header('HTTP/1.1 416 Requested Range Not Satisfiable');
            header("Content-Range: bytes $start-$end/$size");
            exit;
        }

        $start  = $c_start;
        $end    = $c_end;
        $length = $end - $start + 1;

        fseek($fp, $start);
        header('HTTP/1.1 206 Partial Content');
    }

    header("Content-Range: bytes $start-$end/$size");
    header("Content-Length: $length");
    ob_start('ob_gzhandler');
    set_time_limit(0);

    while(!feof($fp) && ($p = ftell($fp)) <= $end) {
        if ($p + $buffer > $end) $buffer = $end - $p + 1;
        echo fread($fp, $buffer);
        ob_flush();
    }

    fclose($fp);
    gc_collect_cycles();
?>