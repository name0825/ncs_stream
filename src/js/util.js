function saveMusicList(list) {
    localStorage.setItem('music_list', JSON.stringify(list));
    localStorage.setItem('music_time', new Date().getTime());
}

function removeMusicList() {
    localStorage.removeItem('music_list');
    localStorage.removeItem('music_time');
}

function makeTr(...value) {
    let tr = document.createElement("tr");

    for (let v of value) {
        let th = document.createElement("td");
        th.innerText = v;
        tr.appendChild(th);
    }

    return tr;
}

function arrayCnt(arr, len) {
    let res = [];
    let cnt = parseInt(arr.length / len);

    if (cnt <= 1) return arr;

    for (let i = 0, c = arr.length / cnt; i < c; i++) {
        let n = 0;
        for (let j = 0; j < cnt; j++) n += arr[cnt * i + j];
        res.push(n / cnt);
    }

    return res;
}

function soundDataCorrection(arr) {
    let res = [];

    for (i = 0; i < arr.length; i++) {
        let y = arr[i];
        let preY = arr[(i - 1) == -1 ? (arr.length - 1) : i - 1];
        let nextY = arr[(i + 1) % arr.length];

        res.push((y * 2 +  preY + nextY) / 4);
    }

    return res;
}

class XHR {
    #url = null;
    #xhr = null;
    #data = null;
    #headers = null;

    constructor() {
        this.#headers = new Map();
        this.#data = new FormData();
    }

    connect(url) {
        this.#url = url;
        this.#xhr = new XMLHttpRequest();
        return this;
    }

    timeout(time) {
        this.#xhr.timeout = time;
        return this;
    }

    header(key, value) {
        this.#headers.set(key, value);
        return this;
    }

    headers(headers) {
        for (let [key, value] of Object.entries(headers))
            this.#headers.set(key, value);
        return this;
    }

    cookie(key, value) {
        this.#headers.set("Cookie", `${key}=${value}`);
        return this;
    }

    cookies(cookies) {
        for (let [key, value] of Object.entries(cookies))
            this.#headers.set("Cookie", `${key}=${value}`);
        return this;
    }

    data(key, value) {
        this.#data.append(key, value);
        return this;
    }

    datas(data) {
        for (let key in data)
            this.#data.append(key, data[key]);
        return this;
    }

    get() {
        if (this.#url === null) return new Error('url not set');

        if (this.#data.size > 0) {
            this.#url += '?';
            for (let pair of this.#data.entries())
                this.#url += pair[0] + '=' + pair[1] + '&';
            this.#url = this.#url.slice(0, -1);
        }

        this.#xhr.open('GET', this.#url, true);

        for (let [key, value] of this.#headers.entries())
            this.#xhr.setRequestHeader(key, value);

        return new Promise((resolve, reject) => {
            this.#xhr.onreadystatechange = () => {
                if (this.#xhr.readyState === 4) {
                    if (this.#xhr.status === 200)
                        resolve({
                            status: this.#xhr.status,
                            text: this.#xhr.responseText,
                            json: JSON.parse(this.#xhr.responseText) 
                        });
                    else
                        reject(new Error(this.#xhr.statusText));
                }
            };
            this.#xhr.send();
        });
    }

    post() {
        if (this.#url === null) return new Error('url not set');

        this.#xhr.open('POST', this.#url, true);

        for (let [key, value] of this.#headers.entries())
            this.#xhr.setRequestHeader(key, value);

        return new Promise((resolve, reject) => {
            this.#xhr.onreadystatechange = () => {
                if (this.#xhr.readyState === 4) {
                    if (this.#xhr.status === 200)
                        resolve({
                            status: this.#xhr.status,
                            text: this.#xhr.responseText,
                            json: JSON.parse(this.#xhr.responseText) 
                        });
                    else
                        reject(new Error(this.#xhr.statusText));
                }
            };
            this.#xhr.send(this.#data);
        });
    }
}