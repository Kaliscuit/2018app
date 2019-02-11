
import { getHeaders, getHeader } from '../services/Request'
import os from "../../os.json"

let socket;
let logs = [];
let debug = false;
let debug_name = '';
// const debug_url = 'http://10.36.33.125:8090'
const debug_url = 'https://dalingjia.com/rnmonitor'

function post(url, data) {
    let headers = getHeaders();
    headers.name = debug_name;
    headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    fetch(url, {
        method: 'POST',
        headers: headers,
        body: urlEncoded(data)
    }).then(function (res) {
        if (res.status == 404) {
            debug = false;
        }
    }).catch(function () {
        debug = false;
    });
}
let urlEncoded = (data) => {
    if (typeof data == 'string') return encodeURIComponent(data);
    let params = [];
    for (let k in data) {
        if (!data.hasOwnProperty(k)) return;
        let v = data[k];
        if (typeof v == 'string') v = encodeURIComponent(v);
        if (v == undefined) v = '';
        if (typeof v == 'object') v = JSON.stringify(v);
        params.push(`${encodeURIComponent(k)}=${v}`);
    }
    return params.join('&');
}

//发送信息
function getLog(name, data, url, opt) {
    if (!name) return;
    if (typeof name !== 'string') {
        data = name;
        name = '消息'
    }
    post(debug_url + "/info", { name: name, data: data, url: url, opt: opt });
}
function getWarm(name, data, url, opt) {
    if (!name) return;
    if (typeof name !== 'string') {
        data = name;
        name = '消息'
    }
    post(debug_url + "/warm", { name: name, data: data, url: url, opt: opt });
}
function getErr(name, data, url, opt) {
    if (!name) return;
    if (typeof name !== 'string') {
        data = name;
        name = '消息'
    }
    post(debug_url + "/err", { name: name, data: data, url: url, opt: opt });
}

/**
 * 发送本地日志
 */
function local_log(type = "code", title, data) {
    let headers = getHeaders();
    headers.name = debug_name;
    headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    fetch("http://" + os.ip + ":18097/" + type, {
        method: 'POST',
        headers: headers,
        body: urlEncoded({ title, data })
    }).then(function (res) {
        if (res.status == 404) {
            debug = false;
        }
        // console.log(res);
    }).catch(function (err) {
        debug = false;
        // console.log(err);
    });
}

exports.getLogs = function () {
    return logs;
}
exports.getLog = function (index) {
    return logs[index];
}
exports.initLog = function () {
    debug_name = 'production';
    // if (!__DEV__) return;
    // debug = true;
    // debug_name = 'dev';
}
//开启调试日志
exports.testLog = function (name) {
    debug = true;
    debug_name = name;
}
exports.log = function (...args) {
    if (!args || args.length < 1) return;
    logs.push({ msg: args.concat() })
    if (__DEV__) {
        let info = args.concat();
        if (!console.group) console.group = () => { };
        if (!console.groupEnd) console.groupEnd = () => { };

        console.group(info[0]);
        info.forEach((log, index) => {
            if (index !== 0) {
                console.log(log);
            }
        });
        console.groupEnd();
        local_log("code", args[0], args[1]);
    }
    if (debug) getLog(...args);
    args[1] = {};
}
exports.logWarm = function (...args) {
    logs.push({ msg: args })
    if (__DEV__) {
        let info = args.concat();
        info[0] = "%c" + info[0];
        info.splice(1, 0, 'color: #ff9900');
        console.log(...info)
    }
    if (debug) getWarm(...args)
}
exports.logErr = function (...args) {
    logs.push({ msg: args })
    if (__DEV__) {
        let info = args.concat();
        info[0] = "%c" + info[0];
        info.splice(1, 0, 'color: #ed3f14');
        console.log(...info)
        local_log("err", args[0], args[1]);
    }
    getErr(...args);
}
