'use strict';
import {
    Dimensions,
    Platform,
    NativeAppEventEmitter,
    DeviceEventEmitter,
    NativeEventEmitter,
    NativeModules,
} from 'react-native';
import request, { get, post, getToken, setHeader, getHeader, domain } from './Request';
import { getItem, setItem, removeItem } from './Storage';
import { observable, extendObservable, action, useStrict, autorun, runInAction } from 'mobx';
import { show as toast } from '../widgets/Toast';
import { initLog, log, logErr, logWarm } from '../utils/logs';
import { socket } from './Socket'
import Event from './Event'
import Cache from './Cache'
import { setConstant } from "./Constant";
import tools from "../utils/tools"

const IM = NativeModules.XNIMModule
const App = NativeModules.AppModule;
let getUserLoading = false;

/**
 * 临时店铺信息
 */
let ShopDetail = observable({
    "indexImg": "http://img.cdn.daling.com/data/files/mobile/img/dalingjia.jpg",
    "inviteCode": "1",
    "name": "达令家",
    "shopImg": "http://img.cdn.daling.com/data/files/mobile/img/diaozhao1.jpeg",
    "userRole": "0",
    "desc": "欢迎光临小店"
})
exports.ShopDetail = ShopDetail;
/**
 * 全局身份信息
 */
let User = observable({
    desc: "",
    headImgUrl: "http://img.cdn.daling.com/data/files/mobile/img/dalingjia.jpg",
    // inviteCode: "",//不再使用这个字段
    monthSales: 0,
    name: "",
    recruitIcon: "",
    salesIcon: "",
    shopImgUrl: "",
    todayAmount: 0,
    todayOrderCount: 0,
    userRole: "0",
    isLogin: false,
    openTuanYn: 'Y',
    unionid: '',
    couponCount: 0,
    stunnerTotalAmount: 0,
    userTag: 0,
    totalCount: 0,            // 购物车数量
    withdrawalsAmount: '',  // 我的余额
    grouponCount: 0,          // 我的拼团数量
    vip: false, //是否vip用户
    followInviteCode: "",   //vip的店铺code
    bondedPayerSwitchOnYn: 'N', // 是否开启支付人开关
    balancePayPasswordSet: 0
});
exports.User = User;

/**
 * 更新unionid,微信
 * @param {*} unionid
 */
exports.UpdateUnionid = function (unionid, uid, utoken) {
    User.unionid = unionid;
    if (uid) {
        setHeader('uid', uid)
    }
    if (utoken) {
        setHeader('utoken', utoken)
    }
    saveUser();
}
//获取用户信息
const getUser = action(async () => {
    if (!User.isLogin) return;
    if (getUserLoading) return;
    getUserLoading = true;

    try {
        let tmp = await get('/ucenter/index.do');
        for (let item in tmp) {
            if (tmp[item] != undefined) User[item] = tmp[item];
        }
        if (User.name == null) User.name = "匿名";
        if (!isNaN(User.todayAmount * 1)) User.todayAmount = (User.todayAmount * 1).toFixed(2);
        if (!isNaN(Number(User.monthSales))) User.monthSales = Number(User.monthSales).toFixed(2);
        setHeader('xc_role', User.userRole || 0);
        if (User.userRole == 3 || User.userRole == 2) {
            User.vip = true;
        } else {
            User.vip = false;
        }
    } catch (e) {
        log(e)
    } finally {
        getUserLoading = false;
        Cache.setUser();
    }
});
exports.getUser = getUser;

const getUserInfo = action(async () => {
    if (!User.isLogin) return;
    if (getUserLoading) return;
    getUserLoading = true;

    try {
        let tmp = await get('/ucenter/indexSimple.do');
        for (let item in tmp) {
            if (tmp[item] != undefined) User[item] = tmp[item];
        }
        if (User.name == null) User.name = "匿名";
        if (!isNaN(User.todayAmount * 1)) User.todayAmount = (User.todayAmount * 1).toFixed(2);
        if (!isNaN(Number(User.monthSales))) User.monthSales = Number(User.monthSales).toFixed(2);
        setHeader('xc_role', User.userRole || 0);
        if (User.userRole == 3 || User.userRole == 2) {
            User.vip = true;
        } else {
            User.vip = false;
        }
    } catch (e) {
        log(e)
    } finally {
        getUserLoading = false;
        Cache.setUser();
    }
});

exports.getUserInfo = getUserInfo;

const getUnionid = async function () {
    try {
        let tmp = await get('/ucenter/indexSimple.do');
        setHeader('xcrole', tmp.userRole);
        await setItem('xcRole', tmp.userRole);
        return tmp.unionid;
    } catch (e) {
        return ''
    }
}
exports.getUnionid = getUnionid;

/**
 * 登录,
 */
const login = async (uid, utoken, userRole) => {
    User.isLogin = true;
    await Cache.setLoginInfo(uid, utoken);
    Api.UpdateUT();
    RefreshShopDetail();
    Cache.setShopDetail();
    setConstant('gg_status', ''); // 重置弹层状态
    Event.emit("relogin");
    Cache.setHeader();
    Cache.setUser();
}
exports.login = login;

const Viplogin = async (uid, utoken, userRole) => {
    User.isLogin = true;
    User.vip = true;
    await Cache.setLoginInfo(uid, utoken, 3);
    Api.UpdateUT();
    // RefreshShopDetail();
    Cache.setShopDetail();
    setConstant('gg_status', ''); // 重置弹层状态
    Event.emit("relogin");
    Cache.setHeader();
    Cache.setUser();
}
exports.Viplogin = Viplogin;
/**
 * 登出
 */
const logOut = async () => {
    User.isLogin = false;
    User.userRole = "0";
    User.totalCount = 0;  // 清空购物车数量
    User.withdrawalsAmount = ''; // 清空余额
    User.grouponCount = 0;  // 我的拼团
    User.recruitIcon = '';  // 粉钻图片path
    User.vip = false;
    setHeader("uid", "");
    setHeader("utoken", "");
    await Cache.setLoginInfo('', '', '')
    await Cache.setHeader();
    socket.close();
    ShopDetail.indexImg = "http://img.cdn.daling.com/data/files/mobile/img/dalingjia.jpg";
    ShopDetail.inviteCode = "1";
    ShopDetail.name = "达令家";
    ShopDetail.shopImg = "http://img.cdn.daling.com/data/files/mobile/img/diaozhao1.jpeg";
    ShopDetail.userRole = "0";
    ShopDetail.desc = "欢迎光临小店";
    Cache.setShopDetail();
    await Cache.updateLoginInfo('');
    setConstant('gg_status', ''); // 重置弹层状态
    Cache.setUser();
    IM.logout(function (rr) { });
}
exports.logOut = logOut;
/**
 * 获取店铺信息，默认达令家
 */
const getShopDetail = async () => {
    if (User.isLogin) {
        let res = await get('/shop/detail.do');
        return res;
    }
    return ShopDetail;
}
exports.getShopDetail = getShopDetail;
/**
 * 更新店铺信息
 */
exports.updateShopDetail = async function () {
    if (User.isLogin) {
        let res = await get('/shop/detail.do');
        return res;
    }
    return ShopDetail;
}
/**
 * 刷新店铺信息,返回结果
 */
let RefreshShopDetail = action(() => {
    if (User.isLogin) {
        runInAction(async () => {
            let res = await get('/shop/detail.do');
            for (let item in res) {
                if (res[item] != undefined) ShopDetail[item] = res[item];
            }
            Cache.setUserRole(ShopDetail.userRole);
        })
    }
})
exports.RefreshShopDetail = RefreshShopDetail

/**
 * 优惠券的类型
 * 未使用,已过期,已使用,分享被领取
 */
const couponEnums = ["UNUSED", "EXPIRED", "USED", "TOOK"];
exports.couponEnums = couponEnums;
/**
 * 获取优惠券列表
 */
exports.getCouponList = async (status, start = 1) => {
    status = couponEnums[status];
    //let res = await getShopDetail() || "";
    return get(`/api/coupon/list?status=${status}&start=${start}`);
}
/**
 * 获取金币列表
 */
exports.getGoldList = async (status) => {
    status = couponEnums[status];
    //let res = await getShopDetail() || "";
    return get(`/api/stunner/list?status=${status}`);
}

const getAddressList = async function () {
    try {
        let version = await request.get(`/sysarea/version.do`),
            localVersion = await getItem('addressVersion'),
            localAddress = JSON.parse(await getItem('address'));
        if (!localVersion || localVersion !== version.version || !localAddress || localAddress == '' || localAddress.length == 0) {
            let res = await request.get(`/sysarea/get.do`);
            let tmp = res.data
            let address = []
            for (let i in tmp) {
                let a1 = []
                let obj = {}
                for (let j in tmp[i]) {
                    let a2 = []
                    for (let k in tmp[i][j]) {
                        let obj1 = {}
                        obj1[k] = tmp[i][j][k]
                        a2.push(obj1)
                    }
                    obj[j] = a2
                    let a3 = {}
                    a3[obj[j]] = obj
                    a1.push(obj)
                }
                address.push(obj)
            }
            await setItem('address', JSON.stringify(address));
        }
        await setItem('addressVersion', version.version);
    } catch (e) {
        //
    }
}

exports.getAddressList = getAddressList;

const getDefaultAddress = async function () {
    let uid = getHeader('uid')
    const local = JSON.parse(await getItem(`selectAddress${uid}`));
    let defaultAddress = await request.get('/goods/defaultAddress.do');

    const selectAddress = local ? local : defaultAddress

    await setItem(`selectAddress${uid}`, JSON.stringify(selectAddress));
    await setItem('defaultAddress', JSON.stringify(defaultAddress));

    setHeader('province', encodeURIComponent(selectAddress.province));
    setHeader('city', encodeURIComponent(selectAddress.city));
    setHeader('district', encodeURIComponent(selectAddress.district));
}
exports.getDefaultAddress = getDefaultAddress

let Api = {
    /**
     * 更新用户标签
     */
    UpdateUT: action(async function () {
        try {
            let uid = getHeader("uid");
            if (!uid) return;
            let tag = await request.get("/ucenter/ut.do");
            Cache.updateLoginInfo(tag);
        } catch (e) {
            //
        }
    }),
    /**
     * 绑定店铺时候获取验证码
     */
    shopByInviteCode(inviteCode) {
        return request.get(domain + "/xc_uc/api/nl/shopByInviteCode.do", { inviteCode });
    },
    /**
     * 绑定店铺邀请码
     */
    bindInviteCode(data) {
        return request.get(domain + "/xc_uc/api/register/app/bindInviteCode.do", data);
    },
    /**
     * 绑定微信
     */
    bindWechat(code) {
        return request.get('/wechat/open/bind.do', { code });
    },
    /**
     * 获取店铺二维码V1
     */
    createQrcodeV1() {
        return request.get('/shop/touch/createQrcodeV1.do');
    }
}
export default Api;

/**
 * 将数据覆盖到User对象上
 */
function saveUser(tmp) {
    if (tmp) {
        for (let item in tmp) {
            if (tmp[item] != undefined) User[item] = tmp[item];
        }
        if (User.name == null) User.name = "匿名";
        if (!isNaN(User.todayAmount * 1)) User.todayAmount = (User.todayAmount * 1).toFixed(2);
        if (!isNaN(Number(User.monthSales))) User.monthSales = Number(User.monthSales).toFixed(2);
        setHeader('xc_role', User.userRole || 0);
        setHeader('xcrole', User.userRole || 0);
        if (User.userRole == 3 || User.userRole == 2 || User.userRole == "3" || User.userRole == "2") {
            User.vip = true;
        } else {
            User.vip = false;
        }
    }
}

/**
 * app启动流程
 * 1.恢复备份的用户数据
 * 2.恢复备份的header数据
 * 3.重新验证用户数据
 * 4.验证通过之后保存以上数据
 */
exports.AppUp = async () => {
    await Cache.recoveryHeader();
    let tmp = await Cache.recoveryUser();
    saveUser(tmp);
    let uid = getHeader("uid");
    let utoken = getHeader("utoken");
    if (!uid || !utoken) {
        User.isLogin = false;
    }
    log("更新User", tmp);
    // if (tmp.uid) {
    //     try {
    //         tmp = await get('/ucenter/index.do');
    //     } catch (error) {
    //         User.isLogin = false;
    //     } finally {
    //         saveUser(tmp);
    //     }
    //     Cache.setHeader();
    //     Cache.setUser();
    // }
}
/**
 * 更新店铺code
 * TODO:更换之后的code可能需要变更
 */
exports.UpdateInviteCode = function () {

}
/**
 * 登录接口2
 * 1.保存uid等
 * 2.获取userrole
 * 3.保存
 */
exports.login2 = async (uid, utoken) => {
    User.isLogin = true;
    setHeader('uid', uid);
    setHeader('utoken', utoken);
    let tmp = {};
    try {
        tmp = await request.get('/ucenter/indexSimple.do');
    } catch (error) {
        User.isLogin = false;
    } finally {
        saveUser(tmp)
    }
    Api.UpdateUT();
    // setConstant('gg_status', ''); // 重置弹层状态
    Event.emit("relogin");
    await Cache.setHeader();

    let res = await request.get('/shop/detail.do');
    for (let item in res) {
        if (res[item] != undefined) ShopDetail[item] = res[item];
    }
    await Cache.setUser();

    try {
        await IM.login(uid, User.name, User.userTag + "", function (rr) { })
    } catch (error) {
        // console.log(error)
    }
}