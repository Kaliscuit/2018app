/**
 * 无侵入式验证结果
 */
import { log, logWarm, logErr } from '../utils/logs'
const FN = {
    //获取礼包的时效code
    "/qrcode/getUrlValidityTime.do": function (data) {
        if (data.validity) return;
        log("大礼包返回的validity不正确")
        throw new Error('请求失败,请重试');
    }
}
/**
 * 检测返回数据的合理性
 * @param {*} name 
 * @param {*} data 
 */
exports.exec = (name, data) => typeof FN[name] === "function" && FN[name].call(this, data) || true;
//========================我是分割线=============================
const PFN = {
    //请求商品详情,参数:id|sku
    "/goods/detail.do": function (data) {
        if (!/[0-9]+/.test(data.id) && !data.sku) throw new Error('商品不存在');
    }
}
/**
 * 检测请求数据的合理性
 * @param {*} name 
 * @param {*} data 
 */
exports.check = (name, data) => typeof PFN[name] === "function" && PFN[name].call(this, data) || true;
