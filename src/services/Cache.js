/**
 * 缓存管理,三级缓存
 */
import React from 'react';
import { View } from 'react-native';
import { getItem, setItem, removeItem, clearItem } from './Storage';
import { log, logWarm, logErr } from '../utils/logs'
import request, { setHeader, getHeader, setHeaders, getHeaders } from './Request'
import { ShopDetail, User } from './Api'

//内存级缓存
let MemoryCache = new Map();

//=====常量=======
//2小时
const HOUR_2 = 7200000;
//12小时
const HOUR_12 = 43200000;

/**
 * 缓存对象
 */
class Cache {

    constructor() { }

    /**
     * 从内存字典中拿缓存
     * @param {*} key
     */
    _getMemory(key) {
        if (MemoryCache.has(key)) {
            let res = MemoryCache.get(key);
            if (res.t === 0 || Date.now() < res.t) return res.v;
            MemoryCache.delete(key);
        }
        return null;
    }
    /**
     * 设置内存字典缓存
     * @param {*} key
     * @param {*} val
     * @param {*} time
     */
    _setMemory(key, val, time) {
        MemoryCache.set(key, { v: val, t: time });
    }
    /**
     * 从存储库中拿缓存
     * @param {*} key
     */
    async _getStorage(key) {
        let res = await getItem(key)
        if (res !== null) {
            if (res.t === 0 || Date.now() < res.t) return res.v;
            await removeItem(key);
        }
        return null;
    }
    /**
     * 设置存储库缓存
     * @param {*} key
     * @param {*} val
     */
    async _setStorage(key, val, time = 0) {
        return await setItem(key, { v: val, t: time });
    }
    /**
     * 获取缓存对象的内容
     * @param {*} key
     */
    async Get(key) {
        let res = this._getMemory(key);
        if (res !== null) return res;
        res = await this._getStorage(key);
        if (res != null) {
            this._setMemory(key, res); return res;
        }
        if (this[key] !== undefined && typeof (this[key] === 'function')) {
            res = await this[key].call(this);
        }
        return res;
    }
    /**
     * 设置缓存内容,时长为最终日期的毫秒数,0=loop
     * @param {*} key
     * @param {*} value
     * @param {*} time
     */
    Set(key, value, time = 0) {
        this._setMemory(key, value, time);
        this._setStorage(key, value, time);
    }
    /**
     * 移除缓存
     * @param {*} key
     */
    Remove(key) {
        MemoryCache.delete(key);
        removeItem(key);
    }
    /**
     * 清空缓存
     */
    Clear() {
        MemoryCache.clear();
        clearItem()
    }

    //============以下是自定义获取方法=================
    //注：获取的同时，调用Set方法存入结果

    test() {
        let res = 'get this data';
        this.Set('test', res);
        return res;
    }
    /**
     * 保存登录信息
     * @param {*} uid
     * @param {*} utoken
     * @param {*} xcrole
     */
    async setLoginInfo(uid, utoken, xcrole) {
        let info = await this._getStorage("userinfo");
        if (!info) info = {};
        info.uid = uid;
        info.utoken = utoken;
        info.xcrole = xcrole;
        setHeader('uid', uid);
        setHeader('utoken', utoken);
        setHeader('xcrole', xcrole);
        this._setStorage("userinfo", { uid, utoken, xcrole });
    }
    async updateLoginInfo(userTag) {
        setHeader('ut', userTag || '');
        const info = await this._getStorage("userinfo");
        if (info) {
            info.userTag = userTag;
            this._setStorage("userinfo", info);
        }
    }
    async setUserRole(xcrole) {
        let info = await this._getStorage("userinfo");
        if (!info) info = {};
        info.uid = getHeader('uid');
        info.utoken = getHeader('utoken');
        info.xcrole = xcrole;
        setHeader('xcrole', xcrole);
        this._setStorage("userinfo", info);
    }
    /**
     * 获取登录信息
     */
    async getLoginInfo() {
        const info = await this._getStorage("userinfo");
        if (info) {
            setHeader('uid', info.uid);
            setHeader('utoken', info.utoken);
            setHeader('xcrole', info.xcrole);
            setHeader('ut', info.userTag || '');
        }
        return info;
    }
    /**
     * 存储店铺信息
     */
    setShopDetail() {
        this._setStorage("g_shop_detail", ShopDetail);
    }
    /**
     * 恢复店铺信息
     */
    async getShopDetail() {
        const detail = await this._getStorage("g_shop_detail");
        if (detail) {
            for (const key in detail) {
                if (detail.hasOwnProperty(key)) {
                    const value = detail[key];
                    if (value !== undefined) ShopDetail[key] = value
                }
            }
        }
    }

    /**
     * 缓存header信息
     */
    async getHeader() {
        const headers = await this._getStorage("g_req_header");
        if (headers) {
            const old = getHeaders();
            for (const hd in old) {
                if (old.hasOwnProperty(hd)) {
                    const head = old[hd];
                    if (!head) old[hd] = headers[hd];
                }
            }
            setHeaders(old);
        }
    }
    /**
     * 重新恢复信息
     */
    async recovery() {
        await this.getHeader();
        await this.getLoginInfo();
        await this.getShopDetail();
    }

    //=============重新设计方法=================
    /**
     * 恢复header信息
     */
    async recoveryHeader() {
        const headers = await this._getStorage("g_req_header");
        if (headers) {
            setHeaders(headers);
        }
    }
    /**
     * 返回user信息
     */
    async recoveryUser() {
        return this._getStorage("g_user");
    }
    /**
     * 保存一次header
     */
    async setHeader() {
        const headers = getHeaders();
        await this._setStorage("g_req_header", headers);
    }
    /**
     * 保存一次用户信息
     */
    async setUser() {
        const tmp = Object.assign({}, User);
        await this._setStorage("g_user", tmp);
    }

}

export default new Cache;