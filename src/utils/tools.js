/**
 * Created by qiaopanpan on 2017/9/1.
 */
import { Linking, Platform } from 'react-native'
import { log } from '../utils/logs';
import { getHeader } from "../services/Request"

const util_tools = {
    parsePrice(price) {
        if (typeof price === 'string' || typeof price === 'number') {
            let np = parseFloat(price)
            return isNaN(np) ? price : np
        }
        return price;
    },
    toCall(tel) { //拨打电话
        //TODO
        Linking.openURL('tel://' + tel);
    },
    sleep: time => new Promise(a => setTimeout(a, time)),
    mobile(tel) {
        return tel.substr(0, 3) + "******" + tel.substr(9, 2);
    },
    parseDate(date) {
        let isoExp, parts;
        isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s(\d\d):(\d\d):(\d\d)\s*$/;
        try {
            parts = isoExp.exec(date);
        } catch (e) {
            return null;
        }
        if (parts) {
            date = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]);
        } else {
            return null;
        }
        return date;
    },
    spliceNum(price) { // 价格，整数小数字体大小不一样
        if (!price % 1) {
            return price
        } else {
            let p_int = (price + '').split('.')[0]
            let t_len = (price + '').split('.')[1].length || 0
            let p_float = ((price * 1 - p_int * 1).toFixed(t_len) + '').split('.')[1]
            return [p_int, p_float]
        }
    },
    toInt(price) { // 价格，小数不为零去掉小数
        if (!price % 1) {
            return price
        } else {
            let p_int = (price + '').split('.')[0]
            let p_float = ((price * 1 - p_int * 1).toFixed(2) + '').split('.')[1]
            if (p_float > 0) {
                return price
            } else {
                return p_int
            }
        }
    },
    formatDate(time) {
        let h = Math.floor(time / 60 / 60)
        let m = Math.floor(time / 60 % 60)
        let s = Math.floor(time % 60)
        return {
            hour: `${h > 9 ? h : '0' + h}`,
            minute: `${m > 9 ? m : '0' + m}`,
            second: `${s > 9 ? s : '0' + s}`
        }
    },
    formatDay(time) { //传入的是ms 秒杀新增天和0.1秒
        let t = Math.floor(time / 1000)
        let d = Math.floor(t / 60 / 60 / 24)
        let h = Math.floor(t / 60 / 60 % 24)
        let m = Math.floor(t / 60 % 60)
        let s = Math.floor(t % 60)
        let ms = Math.floor(time / 100 % 10)
        return {
            day: `${d > 9 ? d : '0' + d}`,
            hour: `${h > 9 ? h : '0' + h}`,
            minute: `${m > 9 ? m : '0' + m}`,
            second: `${s > 9 ? s : '0' + s}`,
            ms: ms
        }
    },
    formatStr(time, formatStr = "yyyy-MM-dd") {
        if (!time || time == null) return "";
        if (typeof time === "string") return time;
        const date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        month = month < 10 ? "0" + month : month;
        day = day < 10 ? "0" + day : day;

        return formatStr.replace(/yyyy/g, year).replace(/MM/g, month).replace(/dd/g, day);
    },
    /**
     * 控制事件触发频率
     * @param {*} func
     * @param {*} wait
     * @param {*} options 表示首次调用返回值方法时，会马上调用func；否则仅会记录当前时刻，当第二次调用的时间间隔超过wait时，才调用func。
     * @param {*} options.leading
     * @param {*} options.trailing
     */
    throttle(func, wait, options) {
        let context, args, result;
        let timeout = null;
        let previous = 0;
        if (!options) options = {};
        let later = function () {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            let now = Date.now();
            if (!previous && options.leading === false) previous = now;
            let remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        }
    },
    /**
     *
     * @param {*} func
     * @param {*} wait
     * @param {*} immediate
     */
    debounce(func, wait, immediate) {
        let timeout, args, context, timestamp, result;
        let later = function () {
            let last = Date.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };
        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            // 第一次调用该方法时，且immediate为true，则调用func函数
            let callNow = immediate && !timeout;
            // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    },
    /**
     * 汉明距离
     */
    hammingDistance(num1, num2) {
        return ((num1 ^ num2).toString(2).match(/1/g) || '').length
    },
    /**
     * luhn算法
     */
    luhnCheck(num) {
        let arr = (num + '')
            .split('')
            .reverse()
            .map(x => parseInt(x));
        let lastDigit = arr.splice(0, 1)[0];
        let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + (val * 2) % 9 || 9), 0);
        sum += lastDigit;
        return sum % 10 === 0;
    },
    merge(...objs) {
        return [...objs].reduce(
            (acc, obj) =>
                Object.keys(obj).reduce((a, k) => {
                    acc[k] = acc.hasOwnProperty(k) ? [].concat(acc[k]).concat(obj[k]) : obj[k];
                    return acc;
                }, {}),
            {}
        )
    },

    /**
     * 判断字符串是否为空
     * @param str 传入的字符串
     * @returns true: 非空字符串; false: 空字符串
     */
    isNotEmpty: function (str) {
        return !this.isEmpty(str);
    },

    /**
     * 判断空字符串
     * @param val
     * @return {boolean} true: 空字符串; false: 非空字符串
     */
    isEmpty: function (val) {
        if (val == "null" || val == null || typeof (val) == "undefined" || val == "" || val == "undefined" || val == '') {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 判断是否是数字
     * @param val
     * @returns {boolean}
     */
    isRealNum: function (val) {
        // isNaN()函数，把空格，以及null 按照0来处理，所以先去除
        if (val === "" || val == null) {
            return false;
        }

        if (!isNaN(val)) {
            return true;
        } else {
            return false;
        }
    },
    goodDesc(goods) {
        let price = goods.salePrice, name = goods.goodsShowName
        if (goods.salesEndTimeDiff > 0) {
            return `限时特卖 ￥${price}\r\n${name}`
        } else {
            return `超值优惠价 ￥${price}\r\n${name}`
        }
    },
    /**
     * 返回裁切之后的图片地址
     * @param {*} src 
     * @param {*} w 
     * @param {*} h 
     */
    cutImage(src, w, h) {
        if (!src) return "";
        let ext = src.substring(src.lastIndexOf("."));
        if (/_[0-9]{1,3}x[0-9]{1,3}\./.test(src)) {
            src = src.replace(/_[0-9]{1,3}x[0-9]{1,3}/, "xxx");
            src = src.replace("xxx" + ext, "");
        }
        // log(`${src}_${w}x${h}${ext}`)
        return `${src}_${w}x${h}${ext}`;
    },
    /**
     * 收货地址校验错误数据
     * @param {*} name
     * @param {*} detail
     */
    checkAddr(name, detail) {
        if (!name || !detail) return;

        let regex = new RegExp('[^\\･\\·\\.\\•\\,\\，\\(\\)\\（\\）\\_\\-\\！\\!\\【\\】\\[\\]\\《\\》a-zA-Z0-9\u4e00-\u9fa5]', 'g')
        let len_n = name.length, len_d = detail.length;

        if (len_n > 16 || len_d > 100 || regex.test(name) || regex.test(detail)) {
            return true;
        } else {
            return false;
        }
    },
    isNewAndroid() {
        if (Platform.OS === "android") {
            let os = getHeader("OSVersion");
            if (os.includes("8.1") || os.indexOf("9") === 0) return true;
        }
        if (Platform.OS === "ios") {
            let os = getHeader("OSVersion");
            let version = os.split(".")[0];
            if (version * 1 < 9) return true;
        }
        return false;
    }
}

export default util_tools
