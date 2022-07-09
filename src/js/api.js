async function getMusicList() {
    let list;

    if (!!(list = localStorage.getItem('music_list')))
        if (new Date().getTime() - localStorage.getItem('music_time') < 1000 * 60 * 30)
            return JSON.parse(list);

    list = (await new XHR().connect('/api/list.php').get()).json;
    saveMusicList(list);
    return list;
}