
import { NativeModules, NetInfo, Alert, NativeEventEmitter } from 'react-native';
import { setHeader, jsversion } from '../services/Request';
import { log, logWarm } from './logs'
import { get } from '../services/Request'
import { show as toast } from '../widgets/Toast'
import Cache from '../services/Cache'

const App = NativeModules.AppModule;

function save(key, data) {
    if (key && data) setHeader(key, data);
}

async function getDeviceID() {
    return new Promise((a, b) => {
        App.getDeviceID(function (err, uuid) {
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

export default async function () {
    save("jsversion", jsversion);
    //获取pushToken

    if (App.getPushToken) {
        App.getPushToken().then(function (res) {
            save("pushToken", res);
        }).catch(function () { });
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
    save("model", "apple");
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
    save("brand", "apple");
    //获取安卓市场渠道来源
    save("channel", "appstore");
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
    const AppModuleEmitter = new NativeEventEmitter(App);
    AppModuleEmitter.addListener('EventNetwork', (body) => {
        if (body.status == "NULL") {
            Alert.alert(
                '提示',
                '网络连接失败，请检查网络设置',
                { cancelable: false }
            )
        }
        if (body.status == "MOBILE") {
            toast('当前使用2G/3G/4G网络');
        }
        // if (body.status == "WIFI") { }
    });
}