/*
 * 神策埋点
 */

import { setConstant, getConstant } from './Constant';

// const TrackUtil = {
//     recordTimestamp(timestamp) {
//         setConstant('loadTime', timestamp);
//     }
// }

// export default TrackUtil;
//======================================

let queue = [];
//页面跳转事件
exports.TrackPage = function (location, from, loadTime) {
    loadTime = Math.abs(loadTime || 0)
    queue.push({
        url: "/dlj_track_page",
        data: {
            'dlj-location': location,
            'dlj-from': from,
            'dlj-loadtime': loadTime
        }
    })
}
//页面点击事件
exports.TrackClick = function (location, name, from, content) {
    let loadTime = getConstant('loadTime') || Date.now();
    queue.push({
        url: "/dlj-track",
        data: {
            'dlj-location': location,
            'dlj-name': name,
            'dlj-from': from,
            'dlj-content': content,
            'dlj-loadtime': loadTime
        }
    })
}
exports.TackList = function () {
    let list = queue.concat();
    queue = [];
    return list;
}
