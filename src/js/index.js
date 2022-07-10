window.addEventListener("load", async function() {
    let musicList = await getMusicList();

    let tbody = document.querySelector('#list');

    let itemIdx = 0;
    for (let v in musicList) {
        let title = musicList[v].title;
        let lyrics = musicList[v].lyrics;

        let tr = makeTr(++itemIdx, title, lyrics);
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', ()=>this.location.href=`/l?id=${v}`);

        //tbody.appendChild(makeTr('\n', '\n'));
        tbody.appendChild(tr);
    }
});