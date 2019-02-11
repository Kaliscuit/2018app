'use strict';

import { Platform } from 'react-native';

import { log, logErr, logWarm } from '../utils/logs';
import { getItem, setItem, removeItem } from './Storage';
import Validity from './Validity'
import { getNavigation } from '../utils/NavigationHolder'
import Router from "./Router"


let domain = 'https://dalingjia.com';
// debug
// domain = 'http://b.xc.dev.daling.com';
let baseUrl = `${domain}/xc_sale`;
let touchBaseUrl = `${domain}/touch`;

export {
    baseUrl, touchBaseUrl, domain
};
//重新设置根
exports.setBaseUrl = function (url = "https://dalingjia.com") {
    domain = url;
    baseUrl = `${domain}/xc_sale`;
    touchBaseUrl = `${domain}/touch`;
}
//获取根域名
exports.getBaseUrl = function () {
    return domain;
}

exports.getBaseUrl = function () {
    return domain;
}

exports.getBaseUrl = function () {
    return domain;
}

exports.jsversion = "0.2.9"

/**
 * 默认的头信息
 */
let headers = {
    app: "appstore",
    uid: 0,
    jsversion: "0.0.1",
    utoken: "",
    platform: Platform.OS,
    clientid: '',
    version: '',
    model: '',
    OSVersion: '',
    brand: '',
    channel: '',
    net: '',
    bundle: '',
    xcrole: 0, //0-普通用户,1-店主
}
/**
 * 设置headers头
 * @param {*} name
 * @param {*} value
 */
exports.setHeader = function (name, value) {
    if (!name) return;
    headers[name] = value;
}
/**
 * 统一设置头部对象
 */
exports.setHeaders = function (data) {
    for (const key in data) {
        if (headers.hasOwnProperty(key)) {
            headers[key] = data[key];
        }
    }
    log("设置header", headers)
}

/**
 * 获取头的信息
 * @param {*} name
 * @param {*} value
 */
exports.getHeader = function (name, value) {
    if (!name) return "";
    return headers[name] || '';
}
/**
 * 获取所有headers
 */
exports.getHeaders = function () {
    return headers;
}
/**
 * 混合参数
 * @param {*} data
 */
let urlEncoded = (data) => {
    if (typeof data == 'string') return encodeURIComponent(data);
    let params = [];
    for (let k in data) {
        if (!data.hasOwnProperty(k)) return;
        let v = data[k];
        if (typeof v == 'string') v = encodeURIComponent(v);
        if (v == undefined) v = '';
        params.push(`${encodeURIComponent(k)}=${v}`);
    }
    return params.join('&');
}
/**
 * 等待几毫秒
 * @param {*} time
 */
let sleep = time => new Promise(a => setTimeout(a, time));

let authFailureHandler = () => { }

class RequestError extends Error {
    constructor(name, data) {
        super(name)
        this.data = data;
    }
}

function joinUrl(url) {
    if (url.indexOf('http') === 0) return url;
    const list = ["/api", "/xczin", "/xc_uc", "/dal_cec", "/msg_box"];
    let host = baseUrl;
    list.forEach(item => {
        if (url.indexOf(item) === 0) host = domain;
    });

    return host + url;
}

/**
 * 请求库
 */
class Request {
    /**
     * 需要登录的逻辑
     */
    authFailureHandler() {
        let navigation = getNavigation();
        try {
            navigation.navigate("LoginPage")
        } catch (e) {
            log(e.message)
        }
    }
    /**
     * 重试次数
     */
    retryCount = 5

    constructor() { }
    /**
     * 错误处理
     * @param {*} handle
     */
    setAuthFailureHandler(handle) {
    }
    /**
     * 检测返回状态码
     * @param {*} status
     * @param {*} res
     */
    async _checkStatus(status, res, url) {
        if (status !== 200) {
            logWarm('请求失败参数', await res.text(), url, headers);
            throw new Error('网络连接失败，请检查网络');
        }
    }
    /**
     * 检查后端返回的状态码
     * @param {*} status
     */
    _checkAppStatus(json, url, options) {
        if (json.status == 4002) {
            this.authFailureHandler()
            log('跳转登录', json, url);
            throw new Error('请登录');
        }
        if (json.status == 403) {
            this.authFailureHandler()
            log('跳转登录', json, url, JSON.stringify(options));
            throw new Error('请登录');
        }

        if (json.status == 510) {
            throw new RequestError(json.status);
        }
        if (json.status != 0) {
            logWarm('返回状态报错', json, url, options);
            // 为了兼容后端素材接口们
            let errorTxt = json.errorMsg ? json.errorMsg : json.errmsg
            throw new RequestError(`${errorTxt}`, json);
        }
    }
    /**
     * 内部实现网络请求
     * @param {*} url
     * @param {*} options
     */
    async _request(url, options, type, retry) {
        // url = url.indexOf('http') == 0 ? url : url.indexOf('/api') == 0 || url.indexOf('/xczin') == 0 || url.indexOf('/xc_uc') == 0 ? domain + url : baseUrl + url;
        url = joinUrl(url);
        let res = await this._fetch(url, options, retry);
        this._checkStatus(res.status, res, url)
        if (type === 'json') return await this._jsonFactory(res, url, options)
        return await this._jsonFactory(res, url, options)
    }
    /**
     * 简易请求,返回结果简单处理
     */
    async _simple(url, options, type, retry) {
        // url = url.indexOf('http') == 0 ? url : url.indexOf('/api') == 0 || url.indexOf('/xczin') == 0 || url.indexOf('/xc_uc') == 0 ? domain + url : baseUrl + url;
        url = joinUrl(url);
        let res = await this._fetch(url, options, retry);
        this._checkStatus(res.status, res, url)
        let json = await res.json();
        if (json.data) return json.data;
        return {};
    }
    /**
     * 推送http消息
     * @param {*} url 
     * @param {*} options 
     * @param {*} type 
     */
    _push(url, options, type) {
        // url = url.indexOf('http') == 0 ? url : url.indexOf('/api') == 0 || url.indexOf('/xczin') == 0 || url.indexOf('/xc_uc') == 0 ? domain + url : baseUrl + url;
        url = joinUrl(url);
        fetch(url, options);
    }

    /**
     * 包装fetch方法
     * @param {*} url
     * @param {*} options
     */
    async _fetch(url, options, retry) {
        // log("发起请求", options, url);
        let res;
        let count = 1;
        try {
            res = await fetch(url, options);
        } catch (e) {
            logErr('网络请求失败', e, e.message);
            throw new Error('网络连接失败，请检查网络权限');
        }
        while (retry && res.status === 420 && count < this.retryCount) {
            await sleep(2000)
            try {
                res = await fetch(url, options);
            } catch (e) {
                logErr('网络请求失败', e, url);
                throw new Error('网络连接失败，请检查网络');
            }
            count++;
        }
        if (res.status === 420) throw new Error('排队人多,再来一次');
        return res;
    }
    /**
     * 调用验证逻辑
     * @param {*} url
     * @param {*} json
     */
    _validity(url, json) {
        const name = url.replace(baseUrl, "").replace(domain, "").split("?")[0];
        if (!name) return true;
        return Validity.exec(name, json.data);
    }
    _pre_validity(url, data) {
        if (!data) return true;
        return Validity.check(url, data);
    }
    /**
     * 处理json数据
     * @param {*} res
     * @param {*} url
     */
    async _jsonFactory(res, url, options) {
        let json;
        let txt = '';
        try {
            // json = await res.json();
            txt = await res.text();
        } catch (e) {
            log('未拿到返回字符串', { url: url, txt: txt });
            throw new Error('数据格式错误');
        }
        try {
            json = JSON.parse(txt);
        } catch (e) {
            logErr('返回数据格式错误', { url: url, txt: txt });
            throw new Error('数据格式错误');
        }
        this._checkAppStatus(json, url, options)
        // this._validity(url, json)
        log(url.replace(domain, "").replace("/xc_sale", ""), json, options);
        return json.data;
    }
    // 埋点方法
    _trackParamHandler(data) {
        let location = Router.current();
        let from = Router.parent();
        from = this._checkPage(from);
        location = this._checkPage(location);
        if (data) {
            data['dlj-from'] = from;
            data['dlj-location'] = location;
            return data
        } else {
            let params = 'dlj-from=' + from + '&dlj-location=' + location
            params = urlEncoded(params);
            return params
        }
    }
    _checkPage(page) {
        if (!page) return 'Unknown'
        let allPage = 'ShopPage,Subject,ChannelPage,' +
            'InvitePage,GGModal,SearchPage,DetailPage,' +
            'ShoppingCartPage,ShoppingCartContentPage,' +
            'SubmitPage,PayFailResult,OrderDetailPage,' +
            'OrderListPage,GroupOn,GoldPage,CouponPage,ProfilePage';

        if (allPage.indexOf(page) > -1) {
            return page;
        }

        return 'Unknown';
    }
    /**
     * get请求
     * @param {*} url
     */
    async get(url, data, retry) {
        // this._pre_validity(url, data)

        data = this._trackParamHandler(data || {})

        if (data) data = urlEncoded(data);
        if (url.indexOf('?') < 0 && data) {
            url += '?' + data;
        } else {
            url += '&' + data;
        }
        return this._request(url, {
            method: 'GET',
            headers: headers,
            timeout: 10000
        }, 'json', retry)
    }
    /**
     * post请求
     * @param {*} url
     * @param {*} data
     */
    async post(url, data, retry) {
        // this._pre_validity(url, data)

        let params = this._trackParamHandler();

        if (url.indexOf('?') < 0) {
            url += '?' + params;
        } else {
            url += '&' + params;
        }

        return this._request(url, {
            method: 'POST',
            headers: Object.assign(headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
            timeout: 10000,
            body: urlEncoded(data)
        }, 'json', retry)
    }
    /**
     * 埋点
     * @param {*} url
     * @param {*} data
     */
    // checkTrackObj(obj) {
    //     let pass = true;
    //     for (let i = 0; i < trackField.length; i ++) {
    //         if (!(trackField[i] in obj)) {
    //             pass = false;
    //             return;
    //         }
    //     }
    //     return pass
    // }

    /**
     * 简单的发送请求
     */
    trackData(url, data) {
        if (data) data = urlEncoded(data);
        if (url.indexOf('?') < 0 && data) url += '?' + data;
        this._push(url, {
            method: 'GET',
            headers: headers,
            timeout: 10000
        }, 'json')
    }

    async trackGet(url, data, retry) {
        // this._pre_validity(url, data)
        if (data) data = urlEncoded(data);
        if (url.indexOf('?') < 0 && data) url += '?' + data;
        return this._request(url, {
            method: 'GET',
            headers: headers,
            timeout: 10000
        }, 'json', retry)
    }
    async track(methods, trackObj, { url, data, retry }) {
        let method = typeof methods === 'string'
            && (methods === 'get' || methods === 'post')
            ? methods.toLowerCase()
            : methods;
        let params = Object.assign(trackObj, data)
        let res = await this[method](url, params, retry);
        return res;
    }
    /**
     * 上传图片
     * @param {*} url
     * @param {*} data
     */
    async uploadImage(url, data) {

        let params = this._trackParamHandler();

        if (url.indexOf('?') < 0) {
            url += '?' + params;
        } else {
            url += '&' + params;
        }

        return this._request(url, {
            method: 'POST',
            headers: Object.assign({}, headers, {
                'Content-Type': 'multipart/form-data;charset=utf-8'
            }),
            body: data
        });
    }

}
const request = new Request();
export default request;

//旧方法兼容
exports.get = async (url, data) => {
    return request.get(url, data)
};
exports.post = async (url, data) => {
    return request.post(url, data)
};
exports.uploadImage = async (url, data) => {
    return request.uploadImage(url, data)
};
exports.setAuthFailureHandler = async (handle) => {
    request.setAuthFailureHandler(handle)
};
