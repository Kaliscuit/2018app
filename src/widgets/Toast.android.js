'use strict';

import { ToastAndroid } from 'react-native';

let used = false;
let timer;

function show(message, callback) {
    if (used) return;
    used = true;
    ToastAndroid.show(message, ToastAndroid.SHORT);
    timer = setTimeout(() => {
        used = false;
        if (timer) clearTimeout(timer)
        timer = null;
        callback && callback()
    }, 1500);
}

export { show }
