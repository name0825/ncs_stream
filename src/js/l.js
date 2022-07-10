window.addEventListener('load', async function() {
    const tick = 90;
    const lUrl = "l";

    let musicList = await getMusicList();
    let id = parseInt(new URL(location.href).searchParams.get('id'));

    let audio;
    let ctx, source, gain, analyser;

    let visualizer, bufferLength, dataArray, canvasCtx;

    let fastForward, fastRewind, prev, next;

    let timeCurrent, timeEnd;

    let repeatButton, repeatMode, repeatShow = ['repeat', 'repeat_one', 'repeat_on'];
    let playButton, volumeButton;

    let prograssBarContainer, prograssBar, thumb, seekMoving = false;

    let calculate;

    function audioSetting() {
        audio = new Audio();
        audio.autoplay = true;
        audio.crossOrigin = '*';
        audio.src = `/m/${id}`;

        ctx = new AudioContext();
        source = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        gain = ctx.createGain();

        gain.gain.value = 1;

        source.connect(analyser);
        analyser.connect(gain);
        gain.connect(ctx.destination);

        analyser.fftSize = 512;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        audio.addEventListener("ended", function() {
            if (repeatMode == 0) return;
            else if (repeatMode == 1) return play();
            else if (repeatMode == 2) {
                if (!!musicList[id + 1]) location.href = `/${lUrl}?id=${id + 1}`;
                else location.href=`/${lUrl}?id=1`;
            }
        })
    }

    function play() {
        if (audio.paused) {
            ctx.resume();
            audio.play();
        }else {
            audio.pause();
        }
    }

    function repeat() {
        repeatMode = (repeatMode + 1) % repeatShow.length;
        localStorage.setItem("repeat", repeatMode);
    }

    function set() {
        visualizer = document.querySelector("#visualizer");

        repeatButton = document.querySelector("#repeat");
        repeatMode = localStorage.getItem('repeat') ?? 0;

        playButton = document.querySelector("#play");
        volumeButton = document.querySelector("#volume");

        prograssBarContainer = document.querySelector(".page-player > .right > .controls > .progressbar");
        prograssBar = document.querySelector(".page-player > .right > .controls > .progressbar > .progress");
        thumb = document.querySelector(".page-player > .right > .controls > .progressbar > .thumb");

        timeCurrent = document.querySelector("#time_current");
        timeEnd = document.querySelector("#time_end");

        fastForward = document.querySelector("#forward");
        fastRewind = document.querySelector("#rewind");

        prev = document.querySelector("#prev");
        next = document.querySelector("#next");

        // 혹시몰라서
        //if (!musicList[id - 1]) prev.classList.add("disabled");
        //if (!musicList[id + 1]) next.classList.add("disabled");

        canvasCtx = visualizer.getContext("2d", { alpha: false });
        visualizer.setAttribute("width", window.innerWidth);
        visualizer.setAttribute("height", window.innerHeight);

        canvasCtx.imageSmoothingEnabled = false;

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        audioSetting();

        repeatButton.addEventListener("click", repeat);
        playButton.addEventListener("click", play);
        volumeButton.addEventListener("click", () => audio.muted = !audio.muted);
        fastForward.addEventListener("click", () => audio.currentTime = audio.currentTime + 10);
        fastRewind.addEventListener("click", () => audio.currentTime = audio.currentTime - 10);
        prev.addEventListener("click", e => {
            if (prev.classList.contains("disabled")) return; // 혹시몰라서
            if (!!musicList[id - 1]) location.href = `/${lUrl}?id=${id - 1}`;
            else location.href=`/${lUrl}?id=${Object.keys(musicList).length}`;
        });
        next.addEventListener("click", e => {
            if (next.classList.contains("disabled")) return; // 혹시몰라서
            if (!!musicList[id + 1]) location.href = `/${lUrl}?id=${id + 1}`;
            else location.href=`/${lUrl}?id=1`;
        });

        prograssBarContainer.addEventListener("click", e => {
            let offset = prograssBarContainer.getBoundingClientRect();
            let left = ((e.clientX - (offset.left + window.scrollX)));
            let totalWidth = prograssBarContainer.clientWidth;
            let percentage = ( left / totalWidth );
            let audioTime = audio.duration * percentage;
            audio.currentTime = audioTime;
        });

        window.addEventListener("pointerdown", e => {
            if (e.target.id == "progressbar" || e.target.parentElement.id == "progressbar") {
                seekMoving = true;
                prograssBarContainer.classList.add("expand");
            } else {
                seekMoving = false;
                prograssBarContainer.classList.remove("expand");
            }
        });

        window.addEventListener("pointermove", e => {
            if (seekMoving) {
                let offset = prograssBarContainer.getBoundingClientRect();
                let left = ((e.clientX - (offset.left + window.scrollX)));
                let totalWidth = prograssBarContainer.clientWidth;
                let percentage = ( left / totalWidth );
                let audioTime = audio.duration * percentage;
                audio.currentTime = audioTime;
            }
        });
        window.addEventListener("pointerup", e => {
            setTimeout(()=>{
                seekMoving = false;
                prograssBarContainer.classList.remove("expand");
            }, 100);
        });

        setInterval(drawVisualizer, tick);
        window.requestAnimationFrame(updateGUI);
    }

    function msToTime(s) {

        // Pad to 2 or 3 digits, default is 2
        function pad(n, z) {
          z = z || 2;
          return ('00' + n).slice(-z);
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        let hourText = pad(hrs).trim();
        let minsText = pad(mins).trim();
        let secsText = pad(secs).trim();
        if (hourText != '00') hourText += ':';
        else hourText = '';
        minsText += ':';

        return hourText + minsText + secsText;
    }

    function updateGUI() {
        // button
        if (!seekMoving) {
            if (repeatButton.innerText != repeatShow[repeatMode])
                repeatButton.innerText = repeatShow[repeatMode];

            if (playButton.innerText != audio.paused ? 'play_arrow' : 'pause')
                playButton.innerText = audio.paused ? 'play_arrow' : 'pause';

            if (volumeButton.innerText != audio.muted ? 'volume_mute' : 'volume_up')
                volumeButton.innerText = audio.muted ? 'volume_mute' : 'volume_up';
        }

        let per = audio.currentTime / audio.duration * 100;
        prograssBar.style.width = `${per}%`;
        thumb.style.left = `${per}%`;

        timeCurrent.innerText = msToTime(audio.currentTime*1000);
        timeEnd.innerText = msToTime(audio.duration*1000);

        window.requestAnimationFrame(updateGUI);
    }

    function drawVisualizer() {
        let WIDTH = visualizer.width;
        let HEIGHT = visualizer.height;
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        analyser.getByteTimeDomainData(dataArray);
        soundData = arrayCnt(Array.from(dataArray), 64);
        soundData = soundDataCorrection(soundDataCorrection(soundData));
        dataLen = soundData.length;

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.beginPath();

        let my = HEIGHT;

        if (!audio.paused) {;
            let fy;
            let x = 0;
            let preX, preY;
            let sliceWidth = WIDTH * 1.0 / (dataLen - 1);

            for(let i = 0; i < dataLen; i++, x += sliceWidth) {
                let v = soundData[i] / 128.0;
                let y = v * HEIGHT / 2;

                if (y < my) my = y;

                if (i == 0)
                    canvasCtx.moveTo(x, fy = y);
                else {
                    preX = x;
                    preY = y;

                    canvasCtx.quadraticCurveTo((preX * 3 + x) / 4, (preY + y * 3) / 4, x, y);
                }
            }

            canvasCtx.lineTo(WIDTH, HEIGHT);
            canvasCtx.lineTo(0, HEIGHT);
            canvasCtx.lineTo(0, fy);
        } else {
            canvasCtx.moveTo(0, HEIGHT/2);
            canvasCtx.lineTo(WIDTH, HEIGHT/2);
        }

        canvasCtx.stroke();
        if (audio.paused == false) {
            var grd = canvasCtx.createLinearGradient(0, HEIGHT, WIDTH, my);
            grd.addColorStop(0, "#040c1a");
            grd.addColorStop(1, "rgb(200, 200, 200)");
            canvasCtx.fillStyle = grd;
            canvasCtx.fill();
        }
        canvasCtx.closePath();
    }

    set();
});