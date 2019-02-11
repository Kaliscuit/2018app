'use strict';

import {on, off, emit} from './Event'
import {DeviceEventEmitter, NativeEventEmitter, NativeModules} from "react-native";
import {getNavigation} from '../utils/NavigationHolder';
import {NavigationActions, StackActions} from "react-navigation";
import {User} from '../services/Api';
import Router from "../services/Router"
import {setConstant, getConstant} from '../services/Constant'
import request, {get, post, getToken, setHeader, getHeader, domain} from './Request';
import {setItem, getItem} from '../services/Storage'
import {log} from '../utils/logs'

const IM = NativeModules.XNIMModule
const AppModuleEmitter = new NativeEventEmitter(IM);

let isReady = false
export const push_init = () => {
    if (isReady) return;
    isReady = true
    on("push.go", go)
    DeviceEventEmitter.addListener("EventPush", handle);
    AppModuleEmitter.addListener("EventIM", helpHandle)
}

export const push_destroy = () => {
    if (!isReady) return;
    isReady = false
    off("push.go", go)
    DeviceEventEmitter.removeListener("EventPush", handle)
    AppModuleEmitter.removeListener('EventIM', helpHandle)
}

const helpHandle = async function (event) {
    if (!event) return;
    event.date = dateStr(new Date())
    if (User.isLogin) {
        let uid = getHeader('uid')
        await setItem(`HelpCenterContent${uid}`, event)
    }
    setConstant("isMsgBox", true)
    emit("top.msg.updated", true)
}

function dateStr(date) {
    return `${date.getFullYear()}-${month(date.getMonth())}-${date.getDate()} ${timeStr(date.getHours())}:${timeStr(date.getMinutes())}:${timeStr(date.getSeconds())}`
}

function month(m) {
    return timeStr(m + 1)
}

function timeStr(time) {
    if (!time) return '00'
    return time > 9 ? time : `0${time}`
}

const handle = function (event) {
    if (!event) return;

    if (event.activePushMsg) {
        // app 内消息
        emit("push.view", event.activePushMsg)
    } else if (event.pushMsg) {
        // app 外消息
        emit("push.go", event.pushMsg)
    }
    setConstant("isMsgBox", true)
    emit("top.msg.updated", true)
}


const go = function (msg) {
    try {
        const navigation = getNavigation()
        let data = JSON.parse(msg);
        let {extras} = data
        if (extras.type == 1) {
            navigation.navigate("ShopPage")
        } else if (extras.type == 2) {
            navigation.navigate("DetailPage", {
                sku: extras.typeUrl,
            })
        } else if (extras.type == 3) {
            navigation.navigate("HtmlViewPage", {
                webPath: extras.typeUrl,
            })
        } else if (extras.type == 4) {
            let router = Router.current()
            if (router != 'ShopPage') {
                navigation.navigate("ShopPage")
            }

            emit("top.tab.change", extras.typeUrl)
        } else if (extras.type == 5) {
            navigation.navigate("CouponPage")
        } else if (extras.type == 6) {
            navigation.navigate("GoldPage")
        } else if (extras.type == 7) {
            navigation.navigate("ProfilePage")
        } else if (extras.type == 8) {
            navigation.navigate("InvitePage")
        } else if (extras.type == 9) {
            navigation.navigate('ReturnGoods', {
                orderNo: extras.typeUrl,
                type: '1',
            });
        } else if (extras.type == 10) {
            navigation.navigate("HtmlViewPage", {
                webPath: extras.typeUrl,
            })
        } else if (extras.type == 11) {
            // navigation.navigate("CustomerServicePage")
            navigation.navigate("AfterSaleManagement")
        } else if (extras.type == 12) {
            let json = JSON.parse(extras.typeUrl)
            navigation.navigate('OrderDetailPage', {
                orderNo: json.orderNo,
                type: json.type,
            });
        } else if (extras.type == 13) {
            // let json = JSON.parse(extras.typeUrl)
            // navigation.navigate('LogisticsPage', {
            //     aoNo: json.expressCode,
            //     date: json.shipDate,
            //     skus: json.skuList,
            //     expressNoNum: json.expressNoNum,
            //     expressNo: json.expressNo
            // });
        } else if (extras.type == 14) {
            navigation.navigate("IncomeManagePage")
        } else if (extras.type == 15) {
            navigation.navigate("CouponPage", {
                page: 3,
            })
        } else if (extras.type == 16) {
            navigation.navigate("GoldPage", {
                page: 3,
            })
        } else if (extras.type == 17) {
            navigation.navigate("WithdrawRecordPage")
        } else if (extras.type == 18) {
            navigation.navigate("HtmlViewPage", {
                webPath: 'https://dalingjia.com/xcgroupon/order-list',
            })
        } else if (extras.type == 19) {
            navigation.navigate("RecruitPage")
        } else if (extras.type == 20) {
            navigation.navigate('OrderListPage', {
                type: 1,
            })
        }
    } catch (e) {
        //
    }

}

export const getUnReadMsg = async () => {
    let _is = getConstant("isMsgBox")
    if (_is) {
        return _is
    }
    let uid = getHeader('uid')
    try {
        let res = await request.get('/msg_box/api/unreadCount.do');
        if (res) {
            let {hasUnreadCount} = res
            if (hasUnreadCount) {
                setConstant("isMsgBox", hasUnreadCount)
                return true;
            }
            let helpMsg = await getItem(`HelpCenterContent${uid}`)
            if (helpMsg && helpMsg.unreadMsgNum > 0) {
                setConstant("isMsgBox", true);
                return true;
            }
            return hasUnreadCount;
        }
    } catch (e) {
        //
    }
}