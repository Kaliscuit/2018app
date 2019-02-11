'use strict';
/**
 * APP的本地升级管理
 */
import Request, { get } from './Request'

import {
    Linking,
    Platform
} from 'react-native';
import { log, logWarm, logErr } from '../utils/logs'

/**
 * 更新提示，可以取消
 * @param {*} v 
 * @param {*} desc 
 * @param {*} uri 
 */
function upMessage(v, desc, uri) {
    return {
        title: "有新的更新v" + v,
        content: desc || ['APP有新的更新，请下载最新的更新。'],
        btns: [
            { txt: "暂不升级" },
            {
                txt: "马上升级", click: () => {
                    Linking.openURL(uri)
                }
            }
        ]
    }
}
/**
 * 重要更新，强制升级
 * @param {*} v 
 * @param {*} desc 
 * @param {*} uri 
 */
function upMust(v, desc, uri) {
    return {
        title: "重要更新v" + v,
        content: desc || ['请升级您的APP，否则您将不能使用以后的版本。'],
        btns: [
            {
                txt: "马上升级", click: () => {
                    Linking.openURL(uri);
                    return false;
                }
            }
        ]
    }
}

async function check(dialog) {
    // dialog.open(upMust("1.22", ["说明"], "http://www.baidu.com"))
    // return
    try {
        let res = await Request.get('/resource/app/version/updateCheck.do');
        if (res) {
            res.description = res.description.split('@@');
            if (res.forceYN == "YES") {
                // dialog.open(upMust(res.version, res.description, res.downloadUrl))
            } else {
                // dialog.open(upMessage(res.version, res.description, res.downloadUrl))
            }
        }
    } catch (e) {
        logWarm(e)
    }
}
exports.check = check;