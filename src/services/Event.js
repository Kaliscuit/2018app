/**
 * APP事件总线
 * 
 */
import { log, logWarm, logErr } from '../utils/logs'
const events = {};

function isFunction(arg) {
    return typeof arg === 'function';
}

function isNumber(arg) {
    return typeof arg === 'number';
}

function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
    return arg === void 0;
}
/**
 * 触发
 */
exports.emit = function (type, ...args) {
    const handler = events[type];
    if (isUndefined(handler)) return false;
    if (isFunction(handler)) {
        handler.call(this, args);
    } else if (isObject(handler)) {
        let listeners = handler.slice();
        let len = listeners.length;
        for (let i = 0; i < len; i++) {
            listeners[i].apply(this, args);
        }
    }
    return true;
}
/**
 * 添加监听
 */
exports.on = function on(type, listener) {
    if (!isFunction(listener)) {
        return logWarm("监听函数不是一个function")
    }
    if (!events[type]) return events[type] = [listener];
    if (events[type].indexOf(listener) < 0) events[type].push(listener);
}
/**
 * 结束监听
 */
exports.off = function off(type, listener) {
    if (!isFunction(listener)) return false;
    if (!events[type]) return false;
    let list = events[type];
    const length = list.length;
    let position = -1;
    for (let i = length; i-- > 0;) {
        if (list[i] === listener) {
            position = i;
            break;
        }
    }
    if (position < 0) return this;
    if (list.length === 1) {
        list.length = 0;
        delete events[type];
    } else {
        list.splice(position, 1);
    }
    return this;
}
/**
 * 清除
 */
exports.clear = function (type) {
    if (!events[type]) return false;
    delete events[type];
    return this;
}
/**
 * 触发一次
 */
exports.once = function (type, listener) {
    if (!isFunction(listener)) return false;
    let fired = false;
    function g() {
        off(type, g);
        if (!fired) {
            fired = true;
            listener.apply(this, arguments);
        }
    }
    on(type, g);
}
