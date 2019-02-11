'use strict';

export let Status = {
    '0': '待支付',
    '1': '待发货',
    '2': '待发货',
    '3': '已发货',
    '4': '已签收',
    '5': '已退货',
    '6': '待退款',
    '7': '待退款',
    '8': '已退款',
    '9': '已完成',
    '99': '已取消'
}
export default Status;

export let ExpressStatus = {
    '10': '未发货',
    '20': '已发货',
    '30': '已签收',
    '40': '已完成',
    '100': '所有商品已退货'
}

export let payType = {
    'weixin': '微信支付',
    'ialipayFz': '支付宝支付'
}

/**
 *type : 0 我的订单 1 店铺订单
 */