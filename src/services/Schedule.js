/**
 * 定时器,定时任务
 */
import { log, logWarm, logErr } from '../utils/logs'
import { TackList } from './Track'
import request from './Request'
import Event from "./Event"

const tasks = new Map();
let currDate = Date.now();
/**
 * 初始化
 */
exports.init = function () {
    global.requestAnimationFrame(run);
}
/**
 * 执行,每秒执行一次
 * 保证秒级工作正确
 */
function run() {
    const now = Date.now();
    if (now > currDate + 1000) {
        currDate = now;
        tasks.forEach(item => item.preStart(now));
    }
    global.requestAnimationFrame(run);
}

/**
 * 添加一个工作
 * @param {*} name  名称
 * @param {*} time  时间
 * @param {*} fn    执行函数
 */
const addJob = (name, Job) => tasks.set(name, new Job())

exports.addJob = addJob;

/**
 * 取消任务
 * @param {*} name 
 */
const cancelJob = name => tasks.delete(name);

exports.cancelJob = cancelJob;

/**
 * 基础工作类
 */
class Jobs {
    name = "base";
    /**
     * 下次执行时间戳
     */
    nextTime = 0;
    /**
     * 重载:时间间隔
     */
    timer = 0;
    /**
     * 预启动
     */
    preStart(now) {
        if (this.timer < 1000) return;
        if (this.nextTime > now) return;
        if (this.nextTime === 0) return this.nextTime = now + this.timer;
        this.nextTime += this.timer;
        this.start(now);
    }
    /**
     * 重载:执行一次设置的方法
     */
    start() { }
}

/**
 * 定时触发统计方法
 */
class TrackJob extends Jobs {
    timer = 3000;
    start() {
        let list = TackList();
        if (list.length > 10) {
            this.timer = 3000;
        } else {
            this.timer = 5000;
        }
        list.forEach(item => {
            request.trackData(item.url, item.data);
            log("埋点事件", item.data);
        })
    }
}
addJob("Track", TrackJob);

/**
 * 每5秒执行一次
 * 1.整点通知
 */
class TimeJob extends Jobs {
    timer = 5000
    start() {
        const curr = new Date().getHours();
        if (curr != this.lastHour) {
            this.lastHour = curr;
            log("整点通知" + curr)
            Event.emit("notice.time");
        }
    }

    lastHour = 0
}
addJob("Time", TimeJob);
