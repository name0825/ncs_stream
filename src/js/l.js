window.addEventListener('load', async function() {
    const tick = 100;

    let musicList = await getMusicList();
    let id = new URL(location.href).searchParams.get('id');

    let bars;
    let n = Math.floor(Math.random() * 10);
    let bar_h_min = 20 + Math.floor(Math.random() * 5), bar_h_max = 75 + Math.sin((Math.random() * 2 - 1) * Math.PI) * 5;

    let audio;
    let ctx, source, gain;

    let repeatButton, repeatMode, repeatShow = ['repeat', 'repeat_one', 'repeat_on'];
    let playButton, volumeButton;

    let prograssBar, prograssDot;

    function audioSetting() {
        audio = new Audio();
        audio.autoplay = true;
        audio.crossOrigin = '*';
        audio.src = `/m/${id}`;

        ctx = new AudioContext();
        source = ctx.createMediaElementSource(audio);
        gain = ctx.createGain();

        gain.gain.value = 1;

        source.connect(gain);
        gain.connect(ctx.destination);

        audio.addEventListener("ended", function() {
            if (repeatMode == 0) return;
            else if (repeatMode == 1) return play();
            else if (repeatMode == 2) {
                if (!!musicList[id + 1]) location.href = `/l?id=${id + 1}`;
                else location.href=`/l?id=1`;
            }
        })
    }

    function play() {
        if (audio.paused) {
            ctx.resume();
            audio.play();
        }else {
            cleanBar();
            audio.pause();
        }
    }

    function repeat() {
        repeatMode = (repeatMode + 1) % repeatShow.length;
        localStorage.setItem("repeat", repeatMode);
    }

    function cleanBar() {
        for (let i in bars) {
            if (typeof bars[i] != 'object') continue;
            bars[i].style.height = `${bar_h_min}%`;
        }
    }

    function set() {
        bars = document.querySelectorAll(".container > .left > .sound > .bar");

        repeatButton = document.querySelector("#repeat");
        repeatMode = localStorage.getItem('repeat') ?? 0;

        playButton = document.querySelector("#play");
        volumeButton = document.querySelector("#volume");

        prograssBar = document.querySelector(".container > .right > .prograss > .now");
        prograssDot = document.querySelector(".container > .right > .prograss > .dot")

        audioSetting();

        repeatButton.addEventListener("click", repeat);
        playButton.addEventListener("click", play);
        volumeButton.addEventListener("volume", () => audio.muted = !audio.muted);

        setInterval(updateGUI, tick);
    }

    function updateGUI() {
        // button
        if (repeatButton.innerText != repeatShow[repeatMode])
            repeatButton.innerText = repeatShow[repeatMode];

        if (playButton.innerText != audio.paused ? 'play_arrow' : 'pause')
            playButton.innerText = audio.paused ? 'play_arrow' : 'pause';

        if (volumeButton.innerText != audio.muted ? 'volume_mute' : 'volume_up')
            volumeButton.innerText = audio.muted ? 'volume_mute' : 'volume_up';

        // bar
        if (!audio.paused) {
            for (let i in bars) {
                if (typeof bars[i] != 'object') continue;
                bars[i].style.height = `${bar_h_min + (bar_h_max - bar_h_min) * Math.abs(Math.sin((i + n) * Math.PI / 32))}%`;
            }
            n = (n + 1) % 196;
        }

        let per = audio.currentTime / audio.duration * 100;
        prograssBar.style.width = `${per}%`;
        prograssDot.style.left = `${per}%`;
    }

    set();
});