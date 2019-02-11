/**
 * 初始化APP的所有常用数据
 */
import {
    Dimensions,
    Platform
} from 'react-native';

import { get } from './Request';
import { log, logErr, logWarm } from '../utils/logs'

let ConstantObject = {};
let Config = {};

/**
 * 获取配置，超过一天就更新
 */
exports.config = async function () {
    try {
        if (!Config.time || Config.time < new Date().getTime() - 86400000) {
            Config = await get('/static/resource.do');
            Config.time = new Date().getTime();
        }
    } catch (e) {
        logWarm(e)
    }
    return Config;
}
/**
 * 设置一个常用变量,只记录一次
 */
exports.setConstant = function (key, val) {
    ConstantObject[key] = val;
}
/**
 * 获取
 * @param {*} key
 */
exports.getConstant = function (key) {
    return ConstantObject[key];
}

