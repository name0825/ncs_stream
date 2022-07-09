@ECHO OFF
SET /p url=url: 
youtube-dl.exe -x --audio-format mp3 --audio-quality 0 %url%