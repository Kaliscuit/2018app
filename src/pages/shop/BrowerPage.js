
'use strict';

import React from 'react';
import {
    View,
    StyleSheet,
    WebView,
    BackHandler,
    Clipboard,
    TouchableOpacity,
    Text,
    AsyncStorage
} from 'react-native';

import CartList from '../../services/Cart'
import { px } from '../../utils/Ratio';
import { User, getShopDetail } from '../../services/Api';
import { log, logErr, logWarm } from '../../utils/logs';
import request, { getHeader, baseUrl, getHeaders } from '../../services/Request';
import Icon from '../../UI/lib/Icon'
import Page from "../../UI/Page";
import Router from "../../services/Router"
import { Header } from "../common/Header"
import Span from "../../UI/lib/Span"

export default class extends Page {

    static defaultProps = {
        webPath: "",
    }

    constructor(props) {
        super(props, {
            title: "达令家APP",
            rightBtn: null,
            webpath: decodeURIComponent(props.navigation.state.params.webPath),
        });
        if (this.state.webpath.indexOf("web_env") < 0) {
            if (this.state.webpath.indexOf("?") < 0) {
                this.state.webpath += "?web_env=app";
            } else {
                this.state.webpath += "&web_env=app";
            }
        }
        this.wgo = this.goBack.bind(this);
    }
    pageHeader() {
        return <Header navigation={this.props.navigation}
            rightBtn={this.state.rightBtn}
            title={this.state.title}></Header>
    }
    pageBody() {
        log("准备加载网页:" + this.state.webpath)
        let config = { uri: this.state.webpath, header: { Cookie: "utoken=" + getHeader('utoken') } }
        if (/topic/.test(this.state.webpath)) {
            config = { html: this.state.htmlStr, baseUrl: 'http://dalingjia.com' }
            if (this.state.webpath.indexOf('https') >= 0) {
                config.baseUrl = 'https://dalingjia.com'
            }
        }

        return <View style={{ flex: 1 }}>
            <WebView
                ref="webview"
                source={config}
                style={styles.viewbox}
                javaScriptEnabled={true}
                decelerationRate="normal"
                mixedContentMode="always"
                startInLoadingState={true}
                scalesPageToFit={true}
                onMessage={(t) => this.onMessage(t)}
                onLoad={(e) => {
                    this.loaded()
                    log('网页加载成功', e.nativeEvent)
                }}
                onError={(e) => {
                    log('网页加载失败', e.nativeEvent)
                }}
                onNavigationStateChange={(e) => this.webBack(e)}
            />
        </View>
    }
    async onReady() {
        BackHandler.addEventListener("hardwareBackPress", this.wgo);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.wgo);
    }
    goBack(e) {
        let currName = Router.current();
        if (currName !== "BrowerPage") return false;
        if (this.canGoBack) {
            this.refs.webview.goBack();
        } else {
            this.props.navigation.goBack();
        }
        return true;
    }
    webBack(event) {
        this.canGoBack = event.canGoBack;
        if (!event || !event.title) return;
        if (event.title.indexOf("http") < 0 && event.title.indexOf("dalingjia") < 0 && event.title.indexOf("about:") < 0) {
            this.setState({
                title: event.title
            });
        }
    }

    /**
     * 发送刷新事件
     */
    refresh() {
        this.refs.webview.injectJavaScript('SDK.emit&&SDK.emit("refresh")');
    }
    /**
     * 预处理返回的内容
     * @param {*} t
     */
    onMessage(t) {
        try {
            let data = t.nativeEvent.data;
            if (data) {
                let args = JSON.parse(data);
                let name = args.shift();
                if (this[name]) this[name].call(this, ...args)
            }
        } catch (e) {
            logWarm(e.message)
        }
    }
    /**
     * 跳转到登录页
     * @param {*} uri
     */
    login(uri) {
        this.props.navigation.navigate('LoginPage', {});
    }
    /**
     * 设置标题
     * @param {*} title
     */
    setTitle(title) {
        if (title) {
            this.setState({
                title: title
            })
        }
    }
    /**
     * 设置右侧菜单
     */
    setMenu(txt) {
        if (!txt) return;
        this.setState({
            rightBtn: <TouchableOpacity onPress={this.onMenuClick.bind(this)}>
                <Span>{txt}</Span>
            </TouchableOpacity>
        })
    }
    /**
     * 自定义右侧菜单点击事件
     */
    onMenuClick() {
        this.refs.webview.injectJavaScript('SDK.emit&&SDK.emit("menuClick")');
    }
    /**
     * 复制
     */
    clipBoard(clip) {
        Clipboard.setString(clip)
        this.$toast('复制成功');
    }

    async setData(key, val) {
        AsyncStorage.setItem("brower_" + key, val)
    }

    async getData(key) {
        let val = await AsyncStorage.getItem("brower_" + key);
        this.refs.webview.injectJavaScript('SDK.emit&&SDK.emit("getData","' + key + '","' + val + '")');
    }
    buy(id) {
        this.props.navigation.navigate('SubmitPage', {
            prodIds: id,
            prodQtys: 1,
            from: 'buy_now'
        });
    }
    openDetail(id) {
        if (/^[0-9]+$/.test(id + '')) {
            this.props.navigation.navigate('DetailPage', {
                id: id
            });
        } else {
            this.props.navigation.navigate('DetailPage', {
                sku: id
            });
        }
    }
    openCart() {
        CartList.update();
        this.props.navigation.navigate('ShoppingCartContentPage', { isNeedBack: this.state.id });
    }
    async addCart(id, num, sku) {
        try {
            let count = await CartList.addCartNum(id, num, sku);
            this.refs.webview.injectJavaScript(`SDK.emit("cart.change",{total_count:${count}})`);
            this.$toast('加入购物车成功');
        } catch (e) {
            if (e.data.oos !== 'oos') {
                this.$toast(e.message);
            } else {
                this.refs.dialog.open({
                    content: [e.data.error_detail],
                    btns: [
                        { txt: "我知道了" },
                        {
                            txt: "去购物车", click: () => this.props.navigation.navigate('ShoppingCartContentPage', { isNeedBack: true })
                        }
                    ]
                })
            }
        }
    }
    async javascript() {
        return `
    ;(function(win,undefined){
        var sdk_list=["login","setTitle","setMenu","clipBoard","setData","getData","openCart","buy","openDetail","addCart"];
        function sdk_fun(name,arr){
            var data=[name].concat(arr);
            window.postMessage(JSON.stringify(data));
        }
        var _sdk=win.SDK||{};
        _sdk.current="${getHeader('platform')}";
        _sdk.xc_role="${getHeader('xcrole')}";
        _sdk.utoken='${getHeader("utoken")}';
        _sdk.uid='${getHeader("uid")}';
        _sdk.clientid='${getHeader("clientid")}';
        _sdk.header=${JSON.stringify(getHeaders())};
        for(var i=0,j=sdk_list.length;i<j;i++){
            ;(function(){
                var name=sdk_list[i];
                _sdk[name]=function(){
                    var arr=Array.prototype.slice.apply(arguments);
                    sdk_fun.call(SDK,name,arr);
                }
            })()
        }
        win.SDK=_sdk;
        win.Ready&&window.Ready();
        _sdk.emit&&_sdk.emit("ready");
    })(window);
    `;
    }
    /**
     * 加载完之后,注入js
     */
    async loaded() {
        let javascript = await this.javascript()
        this.refs.webview.injectJavaScript(javascript);
    }
}

const styles = StyleSheet.create({

});