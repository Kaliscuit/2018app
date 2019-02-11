/**
 * 多线程任务
 */
import { initLog, log, logWarm, logErr } from '../utils/logs'
import request, { getHeader, setHeader } from './Request'
import { socket } from './Socket'
import Event from './Event'
import { initBackgroundTask } from './BackgroundTask'
import MobileInfo from '../utils/MobileInfo'
import Cache from './Cache'
import Api, { User, RefreshShopDetail, logOut, getUser } from './Api'
import CartList from './Cart'
import mDate from '../utils/Date'
import Schedule from './Schedule'
import { getItem, setItem, removeItem } from './Storage';
import { show as toast } from '../widgets/Toast'
/**
 * APP启动之后执行的动作
 */
export default async function () {
    open();
    Event.on("open", init);
    Event.on("relogin", refresh);
    //更新时间
    mDate.sync();
    // setInterval(function () {
    //     mDate.sync();
    // }, 10000)
}
/**
 * 开机任务
 */
async function open() {
    log('更新省市');
    //APP壳信息
    // MobileInfo();
    log('初始化后台任务');
    initBackgroundTask();
    log('初始化日志');
    initLog();
    log('初始化定时器');
    Schedule.init();
}
/**
 * 初始化APP
 */
async function init() {
    log('路由任务');

    //更新用户标签
    Api.UpdateUT();
    //初始化购物车
    CartList.init();

    //验证登录
    login();
    //远程注册APP信息
    let token = getHeader('pushToken');
    if (!!token && token !== "") {
        request.trackData("/device/manager/active.do?type=open_app&pushToken=" + token);
    } else {
        setTimeout(() => {
            token = getHeader('pushToken') || "";
            request.trackData("/device/manager/active.do?type=open_app&pushToken=" + token);
        }, 3000);
    }
}
/**
 * 登录任务
 */
async function login() {
    log('登录任务');
    // request.get('/uc/check_login.do');
    let uid = getHeader("uid");
    if (!uid || uid == "") return;
    try {
        let res = await request.get('/uc/auth.do');
        Cache.setUserRole(res.userType);
        setHeader('xc_role', res.userType || 0);
        User.userRole = res.userType;
        if (res.userType == 3 || res.userType == 2) {
            User.vip = true;
        } else {
            User.vip = false;
        }
        //res.userType
        //用户已登录
        User.isLogin = true;
        //刷新店铺信息
        RefreshShopDetail();
        // getUser();
        //连接socket
        socket.init();
        //用户信息更新
        Event.emit('user.update');
        //更新购物车
        CartList.update();
    } catch (e) {
        logOut();
    }
}
/**
 * 重新登录
 */
function refresh() {
    log('重新登录');
    //连接socket
    socket.init();
}
