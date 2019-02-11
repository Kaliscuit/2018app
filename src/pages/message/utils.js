'use strict';

export const dateFormat = (format) => {
    // 当日最小时间
    let currMinTime = new Date()
    currMinTime.setMilliseconds(0)
    currMinTime.setSeconds(0)
    currMinTime.setMinutes(0)
    currMinTime.setHours(0)

    if (!format) return ''

    let date = new Date(format.replace(/-/g, '/'))
    if (date.getTime()) { // 合法日期
        let time = date.getTime() - currMinTime.getTime()
        if (time < 0) {
            // 过去日期
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        } else if (time >= 0 && time <= 24 * 60 * 60 * 1000) {
            return `今日 ${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`
        } else {
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        }
    }

    return ''
}

export const nullStr = (val) => {
    if (val) {
        return val
    }

    return ''
}

export const isGroup = (prev, next) => {
    return prev != next
}