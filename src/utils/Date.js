import { domain } from '../services/Request'
import { logWarm } from './logs'
//针对系统时间的不稳定性
//使用自定义的系统时间

let timestamp = 0;
const timeUrl = domain + "/api/common/timestamp";
let start = false;
/**
 * 获取当前时间,附带跟系统时间的插值
 */
function now() {
    return Date.now() + timestamp;
}
exports.now = now

/**
 * 主动同步一次时间
 */
function sync() {
    if (start) return;
    start = true;
    let now = Date.now();
    fetch(timeUrl).then(function (res) {
        return res.json();
    }).then(function (json) {
        if (json.data && json.data.ts) {
            let stamp = json.data.ts * 1000 - now;
            if (stamp > 1000 || stamp < -1000) {
                timestamp = stamp;
                logWarm("更新一次时间差", { stamp });
            } else if (timestamp !== 0) {
                timestamp = 0;
            }
        }
    }).catch(function () { });
    setTimeout(() => {
        start = false;
    }, 2000);
}
exports.sync = sync
//补位
function padStart(str, len, ad = "") {
    str = str + "";
    while (str.length < len) {
        str = ad + str;
    }
    return str;
}
export default {
    sync,
    now,
    getTodayDate(format = "yyyy-MM-dd") {
        let now = new Date();
        format = format.replace("yyyy", now.getFullYear());
        format = format.replace("MM", padStart(now.getMonth() + 1, 2, "0"));
        format = format.replace("dd", padStart(now.getDate(), 2, "0"));
        return format;
    },
    getTomorrowDate(format = "yyyy-MM-dd") {
        let timestamp = Date.now() + 86400000;
        let now = new Date(timestamp);
        format = format.replace("yyyy", now.getFullYear());
        format = format.replace("MM", padStart(now.getMonth() + 1, 2, "0"));
        format = format.replace("dd", padStart(now.getDate(), 2, "0"));
        return format;
    },
    getYesterdayDate(format = "yyyy-MM-dd") {
        let timestamp = Date.now() - 86400000;
        let now = new Date(timestamp);
        format = format.replace("yyyy", now.getFullYear());
        format = format.replace("MM", padStart(now.getMonth() + 1, 2, "0"));
        format = format.replace("dd", padStart(now.getDate(), 2, "0"));
        return format;
    },
    getOtherDate(format = "yyyy-MM-dd", day = 1) {
        let timestamp = Date.now() + 86400000 * day;
        let now = new Date(timestamp);
        format = format.replace("yyyy", now.getFullYear());
        format = format.replace("MM", padStart(now.getMonth() + 1, 2, "0"));
        format = format.replace("dd", padStart(now.getDate(), 2, "0"));
        return format;
    }
}