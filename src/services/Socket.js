/**
 * 这就是socket实现
 */
import { Platform, AppRegistry, BackHandler, NativeModules } from 'react-native';
import { regBackgroundTask } from './BackgroundTask'
import { log, logWarm } from '../utils/logs'
import Router from "./Router"
import { User } from './Api'
import { getHeader } from './Request'

const App = NativeModules.AppModule;
const STATE = {
    INIT: 0, OPEN: 1, CLOSED: 2, END: 3
}


class Socket {

    constructor() {
        this.data = Math.random()
    }
    socketState = STATE.INIT;
    socket_url = ''
    timer = null
    /**
     * 开始启动socket
     * @param {*} token 
     */
    init() {
        let uid = getHeader("uid");
        let token = getHeader("utoken");
        this.socket_url = `ws://ws.dalingjia.com/xc_sale/wsocket?action=login&uid=${uid}&platform=${Platform.OS}&utoken=${token}&clientid=${getHeader('clientid')}`
        try {
            let obj = new WebSocket(this.socket_url)
            obj.onopen = this.onopen.bind(this);
            obj.onclose = this.onclose.bind(this);
            obj.onerror = this.onerror.bind(this);
            obj.onmessage = this.onmessage.bind(this);
            this.obj = obj;
            // console.log('socket success')
        } catch (e) {
            log("无法连接socket")
        }
    }
    close() {
        if (this.obj) this.obj.close();
    }
    /**
     * 重试
     */
    retry() {
        if (!User.isLogin) return;
        if (this.socketState != STATE.CLOSED) return;
        if (this.timer) return;
        this.timer = setTimeout(() => {
            let uid = getHeader('uid');
            let utoken = getHeader('utoken');
            log("重试socket")
            this.init(uid, utoken);
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 10000);
    }

    onopen() {
        this.socketState = STATE.OPEN
        log("连接socket", '', this.socket_url)
    }
    onclose() {
        log("关闭socket")
        this.socketState = STATE.CLOSED;
        this.retry();
    }
    onerror() {
        logWarm("失败socket")
        this.retry()
    }
    onmessage(t) {
        log("websocket收到消息:", '', t.data);
        if (t.data.indexOf('{') == 0 || t.data.indexOf('[') == 0 || t.data.indexOf('(') == 0) {
            try {
                const json = JSON.parse(t.data);
                if (this[json.command]) this[json.command](json.data);
            } catch (e) {
                log("socket消息格式不正确");
            }
        }
    }
    //后台之后结束APP，达到更新bundle的目的
    update_bundle(data) {
        const obj = this.obj;
        const version = Number(getHeader("version").replace(/\./g, ''))
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.platform == Platform.OS) {
                if (element.requiredMinVersion > version) return;
                this.socketState = STATE.END;
                regBackgroundTask('reboot', function () {
                    log("当前页面:" + Router.current())
                    try {
                        obj.close();
                        if (App.restartApp) {
                            if (Platform.OS === "ios"){
                                App.restartApp('Bootstrap');
                            } else {
                                App.restartApp('Bootstrap', function(){});
                            }
                        } else {
                            AppRegistry.unmountApplicationComponentAtRootTag();
                        }
                    } catch (e) {
                        log(e.message)
                    }
                });
                obj.send('update_bundle')
            }
        }
    }
}
let socket = new Socket()
exports.socket = socket;