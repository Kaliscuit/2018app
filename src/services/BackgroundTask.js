/**
 * 转入后台时运行任务
 */
import React from 'react';
import { AppState, AppRegistry, View, Text } from 'react-native';
import { log } from '../utils/logs'
import { emit } from './Event'
import mDate from '../utils/Date'

let TaskArray = new Map();

let lastBack = new Date();

/**
 * 检查状态
 * inactive/background/active
 */
function checkActive() {
    if (AppState.currentState == 'background') {
        lastBack = new Date(mDate.now());
        const keys = TaskArray.keys();
        for (const item of keys) {
            if (TaskArray.has(item)) {
                const fn = TaskArray.get(item);
                typeof fn == 'function' && fn();
                TaskArray.delete(item)
            }
        }
    }
    if (AppState.currentState == 'active') {
        emit("app.active");
        let now = new Date(mDate.now());
        if (now.getDate() !== lastBack.getDate()) {
            emit("app.back");
        }
    }
}
/**
 * 设置任务
 * @param {*} name
 * @param {*} fn
 */
exports.regBackgroundTask = function (name, fn) {
    TaskArray.set(name, fn)
}

/**
 * 初始化方法
 */
exports.initBackgroundTask = function () {
    AppState.addEventListener('change', checkActive)
}
