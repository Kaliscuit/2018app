
'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    Modal,
    WebView,
    TouchableOpacity,
    Platform,
    BackHandler,
    Clipboard,
    NativeModules,
    PixelRatio,
    AsyncStorage
} from 'react-native';
const aliPay = NativeModules.Alipay;

import { px } from '../../utils/Ratio';
import { User, getShopDetail } from '../../services/Api';
import CartList from '../../services/Cart'
import { show as toast } from '../../widgets/Toast';
import ShareView, { SHARETYPE } from '../common/ShareView'
import { log, logErr, logWarm } from '../../utils/logs';
import request, { get, getHeader, baseUrl, getHeaders } from '../../services/Request';
import { pay as wxPay, isWXAppInstalled, shareToSession, shareToTimeline } from '../../services/WeChat'
import { setItem, getItem, removeItem } from "../../services/Storage";
import { DialogModal } from '../common/ModalView'
import { SafeHeadView } from '../common/Header'
import { TrackClick } from "../../services/Track";
import Icon from '../../UI/lib/Icon'
import util_cools from "../../utils/tools"

import { ImagesRes } from "../../utils/ContentProvider";
import Router from "../../services/Router"
import ShareGoods from "../../share/goods"

const AppModule = NativeModules.AppModule;

const pxRatio = PixelRatio.get();  // 屏幕像密度

/**
 * 头部组件
 */
class TopHeader extends React.Component {
    render() {
        return <SafeHeadView style={styleSearchBar.header}>
            {this.props.showBackBtn ? <View style={styleSearchBar.leftBtn}>
                <TouchableOpacity style={styleSearchBar.back} onPress={() => this.props.back()}>
                    <Icon name="icon_back"
                        style={{ width: px(40), height: px(40) }} />
                </TouchableOpacity>
                <TouchableOpacity style={styleSearchBar.back} onPress={() => this.props.close()}>
                    <Icon name="icon-close-black"
                        style={{ width: px(40), height: px(40) }} />
                </TouchableOpacity>
            </View> : <View style={styleSearchBar.leftBtn}></View>}
            <Text numberOfLines={1} style={styleSearchBar.title}>{this.props.title}</Text>
            {this.props.showShareBtn && !this.props.gold ? <TouchableOpacity style={styleSearchBar.shareBtn} onPress={() => this.props.onShare()}>
                <Icon name="goodsDetailShare" style={{ width: px(40), height: px(40) }} />
            </TouchableOpacity> : <TouchableOpacity style={styleSearchBar.shareBtn}></TouchableOpacity>}
        </SafeHeadView>
    }
}
const styleSearchBar = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        justifyContent: "space-between",
        borderBottomColor: "#efefef",
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                paddingTop: px(60),
                height: px(140),
            },
            android: {
                height: px(80),
            }
        })
    },
    leftBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: px(120),
    },
    back: {
        marginLeft: px(10)
    },
    title: {
        flex: 1,
        fontSize: px(36),
        textAlign: "center",
        color: "#252426"
    },
    shareBtn: {
        width: px(120),
        paddingRight: px(10),
        alignItems: "flex-end",
    }
});
/**
 * 打开专题页
 * 传入参数：webpath     链接地址
 */
export default class extends React.Component {

    url = ""
    img = ""

    constructor(props) {
        super(props);
        this.state = {
            requestStatue: false,
            showShareModal: false,
            shareContent: [],
            shopDetail: {},
            title: "",
            title2: "",
            desc: "",
            showShareBtn: true,
            showBackBtn: true,
            showTopBar: true,
            img: "https://img.daling.com/st/topic/xc_wxapp/logo_share1.png",
            gold: this.props.navigation.state.params.gold,
            shareList: ["分享专题", "分享为你推荐的精选专题，", "很容易产生订单噢～"],
            shareList2: [],
            webpath: decodeURIComponent(this.props.navigation.state.params.webPath),
            // webpath: "https://forum.vuejs.org"
            // webpath: "http://10.36.33.125:8080"
            // webpath: "http://dalingjia.com/topic/BJD6JfR",
            // webpath: "https://dalingjia.com/subject/d605d49?inviteCode=1089735",
            htmlStr: '<div></div>',
        }
    }

    render() {
        let config = { uri: this.state.webpath, header: { Cookie: "utoken=" + getHeader('utoken') } }
        if (/topic/.test(this.state.webpath)) {
            config = { html: this.state.htmlStr, baseUrl: 'http://dalingjia.com' }
            if (this.state.webpath.indexOf('https') >= 0) {
                config.baseUrl = 'https://dalingjia.com'
            }
        }
        return <View style={{ flex: 1 }}>
            {this.state.showTopBar && <TopHeader
                showShareBtn={this.state.showShareBtn}
                showBackBtn={this.state.showBackBtn}
                gold={this.state.gold}
                back={() => this.goBack()}
                close={() => this.props.navigation.goBack()}
                title={this.state.title || this.state.title2}
                onShare={() => this.onSharePage()} />}
            <WebView
                ref="webview"
                source={config}
                style={styles.viewbox}
                javaScriptEnabled={true}
                decelerationRate="normal"
                mixedContentMode="always"
                startInLoadingState={true}
                scalesPageToFit={true}
                // injectedJavaScript={this.javascript}
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
            <ShareView ref="shareView"
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE]}
                navigation={this.props.navigation} >
                <View style={styles.shareBox}>
                    {this.state.shareList2.length == 0 && this.state.shareList.map((item, index) => <View key={index}>
                        {this.renDesc(index, item, this.state.shareList.length)}
                    </View>)}
                    {this.state.shareList2.length !== 0 && this.state.shareList2.map((item, index) => <View key={index}>
                        {this.renDesc(index, item, this.state.shareList2.length)}
                    </View>)}
                </View>
            </ShareView>
            <ShareView ref="shareView2"
                getQrCode2={() => this.getQrCode2()}
                getQrCode={() => this.getQrCode()}
                QRCodeType={util_cools.isNewAndroid() ? "old" : "product"}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}
                navigation={this.props.navigation} >
                <View style={styles.shareBox}>
                    {this.state.shareList2.length == 0 && this.state.shareList.map((item, index) => <View key={index}>
                        {this.renDesc(index, item, this.state.shareList.length)}
                    </View>)}
                    {this.state.shareList2.length !== 0 && this.state.shareList2.map((item, index) => <View key={index}>
                        {this.renDesc(index, item, this.state.shareList2.length)}
                    </View>)}
                </View>
            </ShareView>
            <DialogModal ref="dialog" />
        </View>
    }
    renDesc(index, item, count) {
        if (index == 0) return <Text style={styles.shareTitle}>{item}</Text>
        if (count == 2) return <Text style={styles.shareDesc}>{item}</Text>
        if (index < count - 1) return <Text style={styles.shareDesc}>{item}</Text>
        return <Text style={styles.shareRemark}>{item}</Text>
    }
    async componentWillMount() {
        this.wgo = this.goBack.bind(this);
        BackHandler.addEventListener("hardwareBackPress", this.wgo);
        if (User.vip) {
            this.setState({ shareList: ["分享专题"] })
        }
    }
    async componentDidMount() {
        this.setState({
            shopDetail: await getShopDetail(),
        });
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.wgo);
    }
    goBack(e) {
        let currName = Router.current();
        if (currName !== "HtmlViewPage") return false;
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
                title2: event.title
            });
        }
    }
    /**
     * 分享的回调
     */
    callback() {
        // this.refresh()
    }
    /**
     * 发送刷新事件
     */
    refresh() {
        this.refs.webview.injectJavaScript('SDK.emit&&SDK.emit("refresh")');
    }
    /**
     * 支付结果
     */
    payBack(bl) {
        this.refs.webview.injectJavaScript(`SDK.emit&&SDK.emit("payed",${bl})`);
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
     * 加入购物车
     * @param {*} id
     * @param {*} num
     */
    async addCart(id, num, sku) {
        try {
            let count = await CartList.addCartNum(id, num, sku);
            this.refs.webview.injectJavaScript(`SDK.emit("cart.change",{total_count:${count}})`);
            toast('加入购物车成功');
        } catch (e) {
            if (e.data.oos !== 'oos') {
                toast(e.message);
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
    /**
     * 打开详情页
     * @param {*} id
     */
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
    /**
     * 设置显示内容
     */
    setMenu(list) {
        if (list.constructor !== Array) return;
        let config = {
            showShareBtn: true,
            showBackBtn: true,
            showTopBar: true,
        }
        list.forEach(item => {
            switch (item) {
                case "shareBtn":
                    config.showShareBtn = false;
                    break;
                case "backBtn":
                    config.showBackBtn = false;
                    break;
                case "topBar":
                    config.showTopBar = false;
                    break;
            }
        })
        this.setState({
            showShareBtn: config.showShareBtn,
            showBackBtn: config.showBackBtn,
            showTopBar: config.showTopBar,
        })
    }
    /**
     * 立即购买
     * @param {*} id
     */
    buy(id) {
        this.props.navigation.navigate('SubmitPage', {
            prodIds: id,
            prodQtys: 1,
            from: 'buy_now'
        });
    }
    /**
     * 打开购物车
     */
    openCart() {
        CartList.update();
        this.props.navigation.navigate('ShoppingCartContentPage', { isNeedBack: true });
    }
    /**
     *
     * @param {*} t
     */
    search(t) {
        this.props.navigation.navigate('SearchPage', {
        });
    }
    /**
     * 跳转到登录页
     * @param {*} uri
     */
    login(uri) {
        this.props.navigation.navigate('LoginPage', {});
    }
    /**
     * 跳转到订单列表
     */
    orderPage() {
        if (User.isLogin) {
            this.props.navigation.navigate('OrderListPage', {
                type: 1
            });
        } else {
            this.goLoginPage();
        }
    }
    myOrderPage() {
        if (User.isLogin) {
            this.props.navigation.navigate('OrderListPage', {
                type: 0
            });
        } else {
            this.goLoginPage();
        }
    }
    /**
     * 订单详情
     * @param {*} id
     */
    orderDetail(id) {
        if (User.isLogin) {
            this.props.navigation.navigate('OrderDetailPage', {
                orderNo: id,
                type: 1,
                callback: async () => {
                }
            });
        } else {
            this.goLoginPage();
        }
    }
    myOrderDetail(id) {
        if (User.isLogin) {
            this.props.navigation.navigate('OrderDetailPage', {
                orderNo: id,
                type: 0,
                callback: async () => {
                }
            });
        } else {
            this.goLoginPage();
        }
    }
    /**
     * 调用微信支付
     */
    async wxpay(datas) {
        let isInstalled = await isWXAppInstalled();
        if (!isInstalled) {
            toast('没有安装微信');
            return;
        }
        this.setState({
            requestStatue: true
        });
        let uid = getHeader('uid')
        await setItem(`payPlatform${uid}`, 'weixin');
        try {
            let res = await wxPay(datas);
            this.payBack(true);
        } catch (e) {
            // if ((e + '').indexOf('WechatError: -2') == 0) {
            //     toast('已取消')
            // } else {
            //     toast("支付失败")
            //     logErr('网页内支付失败', e)
            // }
            toast('您已取消了支付') // 失败统一文案修改
            this.payBack(false);
        }
        this.setState({
            requestStatue: false
        });
    }
    aliPayErr(ret) {
        return /9000/.test(ret);
    }
    /**
     * 调用支付宝支付
     */
    async alipay(datas) {

        this.setState({
            requestStatue: true
        });
        let uid = getHeader('uid')
        await setItem(`payPlatform${uid}`, 'ialipayFz');
        try {
            let param = [];
            let payInfo = datas || {};
            for (let k in payInfo) {
                param.push(`${k}=${payInfo[k]}`);
            }
            let paramStr = param.join('&');
            let res = await aliPay.pay({ orderString: paramStr });
            let isErr = true;
            if (Platform.OS == "ios") {
                if (!(res.resultStatus && res.resultStatus == '9000')) {
                    isErr = false;
                }
            } else {
                isErr = this.aliPayErr(res);
            }

            if (!isErr) {
                throw new Error('您已取消了支付');
            }
            this.payBack(true);
        } catch (e) {
            // if ((e + '').indexOf('WechatError: -2') == 0) {
            //     toast('已取消')
            // } else {
            //     toast("支付失败")
            //     logErr('网页内支付失败', e)
            // }
            toast('您已取消了支付') // 失败统一文案修改
            this.payBack(false);
        }
        this.setState({
            requestStatue: false
        });
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
     * 是否能分享
     */
    setShareBtn(config) {
        if (config && config == 'showShareBtn') {
            this.setState({
                showShareBtn: false
            })
        }
    }
    //设置是否可以回退
    isCanGoBack(bl) {
        this.canGoBack = bl;
    }
    /**
     * 分享到微信好友
     * @param {*} title
     * @param {*} desc
     * @param {*} url
     * @param {*} img
     */
    async shareToSession(title, desc, url, img) {
        let isInstalled = await isWXAppInstalled();
        if (!isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            await shareToSession({
                type: 'news',
                title: title,
                description: desc,
                webpageUrl: url,
                thumbImage: img,
            });
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logWarm('微信分享', e)
            }
        }
    }
    /**
     * 分享到微信朋友圈
     * @param {*} title
     * @param {*} desc
     * @param {*} url
     * @param {*} img
     */
    async shareToTimeline(title, desc, url, img) {
        let isInstalled = await isWXAppInstalled();
        if (!isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            await shareToTimeline({
                type: 'news',
                title: title,
                description: desc,
                webpageUrl: url,
                thumbImage: img,
            });
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logWarm('微信分享', e)
            }
        }
    }
    /**
     * 分享当前内容,参数默认店铺信息
     * @param {*} url
     * @param {*} img
     * @param {*} title
     * @param {*} desc
     */
    sharePage(url, img, title, desc, shareList) {
        if (title == "") {
            toast("分享失败");
            return;
        }

        let webpath = url || this.props.navigation.state.params.webPath;
        let imgPath = img || this.state.shopDetail.indexImg;
        let shareTitle = title || this.state.shopDetail.name + "分享了" + this.state.title + "给你";
        let shareDesc = desc || this.state.shopDetail.desc;

        this.setState({
            shareList2: shareList || []
        })
        this.refs.shareView.Share({
            title: shareTitle,
            desc: shareDesc,
            img: imgPath,
            url: webpath,
            link: webpath
        });
    }
    /**
     * 专业分享二维码
     * @param {*} id
     * @param {*} url
     * @param {*} img
     * @param {*} title
     * @param {*} desc
     * @param {*} shareList
     */
    shareGoodInfo = {}
    shareDetail(id, url, img, title, desc, shareList, price) {
        if (title == "") {
            toast("分享失败");
            return;
        }
        this.shareId = id;
        this.setState({
            shareList2: shareList || []
        })
        this.shareGoodInfo = {
            image: img,
            goodsShowDesc: title,
            salePrice: price
        }
        this.refs.shareView2.Share({
            title: title,
            desc: desc,
            img: img,
            url: url,
            link: url
        });
    }
    /**
     * 商品专用二维码生成
     */
    async getQrCode() {
        if (!this.shareId) return {};
        let res1 = await get(`/goods/touch/createQrcode.do?id=${this.shareId}&type=2&join=0`)
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }
    /**
     * 商品专用二维码生成
     */
    async getQrCode2() {
        if (this.shareGoodInfo.salePrice === undefined) {
            try {
                let goods = await request.get(`/goods/detail.do`, { id: this.shareId });
                this.shareGoodInfo.salePrice = goods.salePrice;
            } catch (error) {
                //
            }
        }
        return {
            id:  this.shareId,
            image: this.shareGoodInfo.image,
            price: this.shareGoodInfo.salePrice,
            showName: this.shareGoodInfo.goodsShowDesc,
        }
    }
    /**
     * 复制
     */
    clipBoard(clip) {
        Clipboard.setString(clip)
        toast('复制成功');
    }
    /**
     * 保存图片
     */
    async saveToAlbum(image) {
        try {
            await new Promise((resolve, reject) => {
                AppModule.saveImageToAlbum(image, (ignore, res) => {
                    if (res) {
                        resolve()
                    } else {
                        reject()
                    }
                });
            });
            toast('保存成功');
        } catch (e) {
            toast('保存失败');
        }
    }
    /**
     * 分享图片到微信好友
     */
    async sharePicTopy(image) {
        let isInstalled = await isWXAppInstalled();
        if (!isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            await shareToSession({
                type: 'imageUrl',
                //title: this.title,
                //description: this.desc,
                imageUrl: image,
                thumbImage: image,
            });
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logWarm('微信分享', e)
            }
        }
    }
    /**
     * 分享图片到微信朋友圈
     */
    async sharePicTopyq(image) {
        let isInstalled = await isWXAppInstalled();
        if (!isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            await shareToTimeline({
                type: 'imageUrl',
                //title: this.title,
                //description: this.desc,
                imageUrl: image,
                thumbImage: image,
            });
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logWarm('微信分享', e)
            }
        }
    }
    /**
     * 点击分享
     */
    onSharePage() {
        if (!User.isLogin) {
            this.props.navigation.navigate('LoginPage', {});
            return;
        }
        if (this.state.title == "") {
            toast("分享失败");
            return;
        }
        this.setState({
            shareList2: []
        })

        this.refs.shareView.Share({
            title: `{shopName}分享了${this.state.title}给你`,
            desc: this.state.desc,
            img: this.img || this.state.img,
            url: this.url || this.props.navigation.state.params.webPath,
            link: this.url || this.props.navigation.state.params.webPath,
            track: (type) => {
                let url = this.url || this.props.navigation.state.params.webPath;
                if (!/subject/.test(url)) return;

                let strs = url.split('/');
                let subjectId = strs.length > 0 ? strs[strs.length - 1] : '';

                TrackClick('Campaign', 'ShareCam', '专题活动页', `分享专题-${type}-${subjectId}-${this.state.title}`);
            }
        });
    }

    async setData(key, val) {
        AsyncStorage.setItem("brower_" + key, val)
    }

    async getData(key) {
        let val = await AsyncStorage.getItem("brower_" + key);
        this.refs.webview.injectJavaScript('SDK.emit&&SDK.emit("getData","' + key + '","' + val + '")');
    }
    /**
     *
     * @param {*设置当前的分享内容} title
     * @param {*} desc
     */
    setShareInfo(title, desc, shareList, img, viewurl) {
        if (!shareList) shareList = this.state.shareList;
        this.setState({
            title: title,
            desc: desc,
            shareList: shareList || []
        });
        this.img = img || "";
        this.url = viewurl || "";
    }
    async javascript() {
        let uid = getHeader("uid");
        let type = await getItem(`payPlatform${uid}`)
        return `
    ;(function(win,undefined){
        var sdk_list=["addCart","openDetail","buy","openCart","setData","getData",
                    "search","orderPage","isCanGoBack","sharePage","login",
                    "setShareInfo","setTitle","wxpay","alipay","setMenu","myOrderPage",
                    "orderPage","myOrderDetail","orderDetail",
                    "shareToSession","shareToTimeline","clipBoard","saveToAlbum","shareDetail","sharePicTopy","sharePicTopyq","setShareBtn"];
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
        _sdk.remPayType='${type}';
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
        win.title&&_sdk.setShareInfo(win.title,win.desc,null,win.image,win.viewUrl);
        win.Ready&&window.Ready();
        _sdk.emit&&_sdk.emit("ready");
    })(window);
    `;
    }
    /**
     * 向h5页面中注入sdk,android无效
     */
    sdk() {
        // if(Platform.OS!=="ios")return "";
        // return this.javascript();
    }
    /**
     * 加载完之后,注入js
     */
    async loaded() {
        // log(this.javascript);
        let javascript = await this.javascript();
        if (this.props.navigation.state.params.first) {
            javascript += "SDK.first && SDK.first();";
        }
        this.refs.webview.injectJavaScript(javascript);
    }
}

const styles = StyleSheet.create({
    viewbox: {
        width: px(750),
        height: px(500)
    },
    shareBox: {
        alignItems: "center",
    },
    shareTitle: {
        fontSize: px(42),
        color: '#d0648f',
        marginBottom:px(10)
    },
    shareDesc: {
        fontSize: px(26),
        color: '#858385',
        lineHeight:px(32)
    },
    shareRemark: {
        paddingHorizontal: px(10),
        fontSize: px(26),
        lineHeight:px(32),
        color: '#d0648f'
    }
});
