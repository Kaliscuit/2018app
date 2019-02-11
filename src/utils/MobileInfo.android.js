
import { NativeModules, NetInfo, DeviceEventEmitter, Alert } from 'react-native';
import { setHeader, jsversion } from '../services/Request';
import { setConstant } from '../services/Constant';
import { show as toast } from '../widgets/Toast'
import Cache from '../services/Cache'
import { log, logWarm } from './logs'

const App = NativeModules.AppModule;
let index = 0;

function save(key, data) {
    if (key && data) setHeader(key, data);
}

async function getDeviceID() {
    return new Promise((a, b) => {
        App.getDeviceId(function (err, uuid) {
            if (err) return b(err);
            a(uuid);
        });
    });
}
async function getAppVersionCode() {
    return new Promise((a, b) => {
        App.getAppVersionCode(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}
async function getAppOSVersion() {
    return new Promise((a, b) => {
        App.getAppOSVersion(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}
async function getAppNetType() {
    return new Promise((a, b) => {
        App.getAppNetType(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}
async function getBundleMD5() {
    return new Promise((a, b) => {
        App.getBundleMD5(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}
async function getAppDeviceModel() {
    return new Promise((a, b) => {
        App.getAppDeviceModel(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}
async function getAppDeviceProduct() {
    return new Promise((a, b) => {
        App.getAppDeviceProduct(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}
async function getAppChanel() {
    return new Promise((a, b) => {
        App.getAppChanel(function (err, res) {
            if (err) return b(err);
            a(res);
        });
    });
}

export default async function () {
    save("jsversion", jsversion);
    //获取pushToken
    try {
        if (App.getHWPushToken) {
            let res = await App.getHWPushToken();
            save("pushToken", res);
        }
    } catch (err) {
        //
    }

    try {
        //用户id
        let uuid = await getDeviceID();
        save("clientid", uuid);
    } catch (error) {
        logWarm("错误", error.message);
    }

    try {
        //app版本号
        let app_version = await getAppVersionCode();
        save("version", app_version);
    } catch (error) {
        logWarm("错误", error.message);
    }

    //设备型号
    try {
        let model = await getAppDeviceModel();
        save("model", model);
    } catch (error) {
        //
    }

    //操作系统版本
    try {
        if (App.getAppOSVersion) {
            let os = await getAppOSVersion();
            save("OSVersion", os);
        }
    } catch (error) {
        //
    }

    //获取制造厂商。
    try {
        let equipment = await getAppDeviceProduct();
        save("brand", equipment);
    } catch (error) {
        //
    }

    //获取安卓市场渠道来源
    try {
        let channel = await getAppChanel();
        save("channel", channel);
    } catch (error) {
        //
    }

    //获取网络类型
    try {
        if (App.getAppNetType) {
            let net = await getAppNetType();
            save("net", net);
        }
    } catch (err) {
        //
    }

    //获取bundle的md5
    try {
        let bundle = await getBundleMD5();
        save("bundle", bundle);
    } catch (error) {
        //
    }
    Cache.setHeader();
    //网络切换
    DeviceEventEmitter.addListener("EventNetwork", body => {
        if (body.status == "NULL" || body.status == "null") {
            // Alert.alert(
            //     '提示',
            //     '网络连接失败，请检查网络设置',
            //     { cancelable: false }
            // )
        }
        if (body.status == "MOBILE") {
            toast('当前使用2G/3G/4G网络');
        }
        // if (body.status == "WIFI") { }
    });
}