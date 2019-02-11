'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity, Image,
    NativeModules, Clipboard, Animated,
    TouchableWithoutFeedback, CameraRoll, Platform,
    Dimensions,
    ScrollView
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import { log, logErr, logWarm } from '../../utils/logs'
import { shareToSession, isWXAppInstalled, shareToTimeline } from '../../services/WeChat';
import { User, getShopDetail } from '../../services/Api';
import request, { get, baseUrl, touchBaseUrl } from '../../services/Request';
import { MagicImage } from './ImagePage'
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import { LoadingRequest, Loading } from '../../widgets/Loading';
import GoodsSnapshot from "../snapshot/goods"
import TimelineSnapshot from "../snapshot/timeline"
import GiftGoods from "../snapshot/giftGoods"

//import Loading from '../../animation/Loading'
const AppModule = NativeModules.AppModule;
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const SHARE = {
    /**
     * 微信
     */
    WEIXINPIC: {
        method: "weiFriendPic", url: 'icon-shareWexin', txt: '微信好友'
    },
    /**
     * 微信朋友圈
     */
    PENGYOUQUANPIC: {
        method: 'weiPyqPic', url: 'icon-sharepyq', txt: '朋友圈'
    },
    /**
     * 保存图片
     */
    SAVE: {
        method: 'saveToAlbum', url: 'icon-shareSavePic', txt: '保存图片'
    }
}
function checkInviteCode(path) {
    let params = path.split("inviteCode=");
    if (params.length > 1) {
        let code = params[1].split("&")[0];
        if (code.indexOf(",") > -1) {
            logErr("分享的url有问题", {}, path);
            let newcode = code.split(",")[0];
            path = path.replace(code, newcode);
        }
    }
    return path;
}


/**
 * props：shareType
 * props：types  可以分享的类型
 * props：navigation
 * props：getQrCode
 * 方法：Share(title, desc, img, url,link),打开分享，传入分享参数
 */
export default class extends React.Component {
    static defaultProps = {
        types: [],
        QRCodeType: "old"
    }
    height = px(deviceHeight);
    myHeight = isIphoneX() ? deviceHeight - px(90) : deviceHeight - px(50)
    title = '';
    desc = '';
    img = '';
    url = '';
    link = '';
    inviteCode = '';
    shareType = '';
    extra = '';
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            boxY: new Animated.Value(this.height),
            showModal: false,
            loading: false,
            shareType: this.props.shareType || '',
            share_img: '',
            down_img: '',
            width: 0,
            height: 0,
            imgSaveTxt: "保存图片到相册",
            imageY: new Animated.Value(deviceHeight),
            goodsInfo: {},
            goodsList: [],
            shop: {},
            iosShare: false
        };
        this.list = this.getTypeComponent(this.props.types);
    }
    /**
     * 初始化显示模块
     * @param {*} types
     */
    getTypeComponent(types) {
        let list = [];
        types.map((item, index) => {
            if (!item) return;
            list.push(<TouchableOpacity key={index}
                style={styles.shareBtn}
                onPress={this[item.method].bind(this)}
                activeOpacity={0.9}>
                <Icon name={item.url} style={{ width: px(96), height: px(96) }} />
                <Text style={styles.shareTxt} allowFontScaling={false}>{item.txt}</Text>
            </TouchableOpacity>);
        })
        return list;
    }

    render() {
        return <View>
            <Modal
                style={styles.view}
                visible={this.state.isShow}
                onShow={() => this.show()}
                onRequestClose={() => { }}
                animationType="none"
                transparent={true}>
                <Loading status={this.state.loading} />
                {
                    !this.state.showModal &&
                    <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={styles.bg} ></View></TouchableWithoutFeedback>
                }
                {!this.state.showModal && <Animated.View style={[styles.box, { paddingBottom: isIphoneX() ? px(80) : px(10) }, {
                    transform: [
                        { translateY: this.state.boxY }
                    ]
                }]}>
                    <View style={styles.titleBox}>
                        {this.props.children || <Text style={styles.tit}>分享到</Text>}
                    </View>
                    <View style={styles.list}>
                        {this.list.map(item => item)}
                    </View>
                    <TouchableOpacity onPress={() => this.cancel()}>
                        <View style={[styles.cancelBtn]}>
                            <Text style={styles.cancelTxt}>取消</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>}
                {this.state.showModal &&
                    <Animated.View style={{
                        flex: 1,
                        width: px(750),
                        height: deviceHeight,
                        transform: [
                            { translateY: this.state.imageY }
                        ],
                        backgroundColor: '#d0648f',
                    }}>
                        <View
                            style={{
                                height: Platform.OS === 'ios' ? isIphoneX() ? px(98) : px(30) : px(80),
                            }}
                        ></View>
                        <TouchableWithoutFeedback onPress={() => this.cancel()}>
                            <View style={[modalStyles.close, base.inline, { top: Platform.OS === 'ios' ? isIphoneX() ? px(98) : px(54) : px(80) }]} >
                                <Icon name="sharePicClose" style={{ width: px(54), height: px(54) }} />
                            </View>
                        </TouchableWithoutFeedback>
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            style={{
                                borderRadius: px(20),
                                width: px(710),
                                flex: 1,
                                marginHorizontal: px(20),
                                backgroundColor: '#fff'
                            }}>
                            <View style={[modalStyles.wrap]}>
                                {this.props.QRCodeType === "old" && <Image source={{ uri: this.state.share_img }}
                                    onLoad={this.onLoadImage.bind(this)}
                                    onError={this.onErrorImage.bind(this)}
                                    name='分享二维码' style={[modalStyles.image, { width: px(this.state.width), height: px(this.state.height) }]} />}
                                {this.props.QRCodeType === "product" && <GoodsSnapshot ref="snapshot"
                                    shopDetail={this.state.shop}
                                    goods={this.state.goodsInfo} />}
                                {this.props.QRCodeType === "giftgoods" && <GiftGoods ref="snapshot"
                                    shopDetail={this.state.shop}
                                    goods={this.state.goodsInfo} />}
                                {this.props.QRCodeType === "timeline" && <TimelineSnapshot ref="snapshot"
                                    data={this.state.goodsInfo}
                                    shopDetail={this.state.shop} />}
                            </View>
                            <View style={{ height: px(230), backgroundColor:'#515151' }}></View>
                        </ScrollView>
                        <View style={modalStyles.bot}>
                            <View style={[modalStyles.bot_, base.inline]}>
                                {this.getTypeComponent([SHARE.WEIXINPIC, SHARE.PENGYOUQUANPIC, SHARE.SAVE]).map(item => item)}
                            </View>
                        </View>
                    </Animated.View>
                }
            </Modal>
        </View>
    }
    async componentWillMount() {
        this.isInstalled = await isWXAppInstalled();
    }

    /**
     * 取消
     */
    cancel() {
        this.state.imageY.stopAnimation();
        this.state.boxY.stopAnimation();
        Animated.sequence([
            Animated.timing(
                this.state.imageY,
                {
                    toValue: deviceHeight,
                    duration: 100
                }
            ),
            Animated.timing(
                this.state.boxY,
                {
                    toValue: this.height,
                    duration: 200
                }
            )
        ]).start(() => {
            this.setState({
                isShow: false,
                showModal: false
            })
        })
    }
    /**
     * 结束分享
     */
    end() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 200
            }
        ).start();
    }
    /**
     * 关闭
     */
    close() {
        this.setState({
            isShow: false,
            showModal: false
        })
    }

    isSaveImging = false;
    /**
     * 保存图片
     */
    async saveToAlbum() {
        if (this.isSaveImging) return;
        this.isSaveImging = true;
        if (this.props.QRCodeType !== "old") {
            let res = await this.refs.snapshot.save();
            toast("保存成功");
            this.isSaveImging = false;

        } else {
            this.setState({
                imgSaveTxt: "正在努力保存中..."
            })
            AppModule.saveImageToAlbum(this.state.down_img, (ignore, res) => {
                if (res) {
                    Platform.OS == 'ios' && toast('保存成功');
                } else {
                    Platform.OS == 'ios' && toast('保存失败');
                }
                this.isSaveImging = false;
                this.setState({
                    imgSaveTxt: "保存图片到相册"
                });
            });
        }
    }
    /**
     * 弹出动画
     */
    show() {
        if (this.state.isShow) {
            Animated.timing(
                this.state.boxY,
                {
                    toValue: 0,
                    duration: 200
                }
            ).start();
        }
    }

    showPic() {
        if (this.state.isShow && this.state.showModal) {
            Animated.timing(
                this.state.imageY,
                {
                    toValue: 0,
                    duration: 100
                }
            ).start();
        }
    }
    /**
     * 分享之前的检测
     */
    async preShare() {
        if (!User.isLogin) {
            this.props.navigation.navigate('LoginPage', {});
            this.cancel();
            return false;
        }
        if (!/inviteCode/.test(this.url) || /inviteCode=undefined/.test(this.url) || /undefined/.test(this.title) || /title=undefined/.test(this.url) || /description=undefined/.test(this.url)) {
            let shop = await getShopDetail();
            logErr('分享失败2:', shop, this.url, this.title)
            toast('分享失败，请稍后再试');
            return false;
        }
        return true;
    }
    /**
     * 微信好友
     */
    async weiFriend() {
        this.track && this.track('微信好友')
        if (!await this.preShare()) return;
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            request.get("/dlj-share.do", {
                type: 'app-haoyou',
                title: this.title,
                description: this.desc,
                webpageUrl: this.url,
                thumbImage: this.img,
                code: this.inviteCode
            })
            await shareToSession({
                type: 'news',
                title: this.title,
                description: this.desc,
                webpageUrl: this.url,
                thumbImage: this.img,
            });
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logErr('微信分享', e)
            }
        }
        this.cancel();
    }

    async weiFriendPic() {
        if (!await this.preShare()) return;
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            let res = "";
            if (this.props.QRCodeType !== "old") {
                if (Platform.OS === "ios") {
                    res = await this.refs.snapshot.save();
                } else {
                    res = await this.refs.snapshot.snapshot();
                }

                await shareToSession({
                    type: 'imageFile',
                    imageUrl: res,
                    // thumbImage: res,
                });
            } else {
                res = this.state.share_img
                await shareToSession({
                    type: 'imageUrl',
                    imageUrl: res,
                    thumbImage: res,
                });
            }
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logErr('微信分享', e)
            }
        }
        this.cancel();
    }
    /**
     * 微信朋友圈
     */
    async weiPyq() {
        this.track && this.track('朋友圈')
        if (!await this.preShare()) return;
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        let title = this.title;
        if (this.shareType == 'goods') {
            title = this.extra + this.title
        } else {
            title = this.title
        }
        try {
            request.get("/dlj-share.do", {
                type: 'app-pengyou',
                title: title,
                description: this.desc,
                webpageUrl: this.url,
                thumbImage: this.img,
                code: this.inviteCode
            })
            await shareToTimeline({
                type: 'news',
                title: title,
                description: this.desc,
                webpageUrl: this.url,
                thumbImage: this.img,
            });
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logErr('微信分享', e)
            }
        }
        this.cancel();
    }
    async weiPyqPic() {
        if (!await this.preShare()) return;
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        try {
            let res = "";
            if (this.props.QRCodeType !== "old") {
                if (Platform.OS === "ios") {
                    res = await this.refs.snapshot.save();
                } else {
                    res = await this.refs.snapshot.snapshot();
                }
                await shareToTimeline({
                    type: 'imageFile',
                    imageUrl: res,
                    // thumbImage: res,
                });
            } else {
                res = this.state.share_img
                await shareToTimeline({
                    type: 'imageUrl',
                    imageUrl: res,
                    thumbImage: res,
                });
            }
        } catch (e) {
            if ((e + '').indexOf('WechatError: -2') == 0) {
                toast('已取消')
            } else {
                logErr('微信分享', e)
            }
        }
        this.cancel();
    }
    /**
     * 复制链接
     */
    weiLink() {
        this.track && this.track('链接')
        if (!this.preShare()) return;
        Clipboard.setString(this.link)
        toast('链接复制成功')
    }
    /**
     * 打开二维码
     */
    async weiCode() {
        this.track && this.track('二维码')

        if (this.props.QRCodeType === "old") {
            try {
                if (!this.props.getQrCode) {
                    toast('还不支持分享二维码');
                    return;
                }
                this.setState({
                    showModal: true,
                    loading: true
                })
                let res = await this.props.getQrCode();
                if (typeof res === 'string') {
                    this.setState({
                        share_img: res,
                        down_img: res,
                        height: 1136,
                        width: 710
                    })
                } else {
                    // 大图，超时会返回null
                    if (!res || res.share_img == 'null' || res.share_img == null) {
                        this.setState({
                            showModal: false,
                            loading: false
                        })
                        toast('图片加载失败，请稍后再试')

                        return
                    }
                    this.setState({
                        share_img: res.share_img,
                        down_img: res.down_img,
                        height: res.height || 1136,
                        width: res.width || 710
                    })
                }
                this.end()
            } catch (e) {
                log(e)
                toast(e.message)
                this.setState({
                    showModal: false,
                    loading: false
                })
                this.end()
            }

        } else {
            try {
                let goodsInfo = await this.props.getQrCode2();
                this.setState({
                    showModal: true,
                    loading: true,
                    iosShare: true,
                    goodsInfo
                })
                this.end()
                setTimeout(() => {
                    this.setState({
                        loading: false
                    })
                    this.showPic()
                }, 500)
            } catch (e) {
                log(e)
                toast(e.message)
                this.setState({
                    showModal: false,
                    loading: false
                })
                this.end()
            }
        }
    }

    onLoadImage(e) {
        let w = e.nativeEvent.source.width;
        let h = e.nativeEvent.source.height;
        let nh = h / w * 710;
        if (Math.abs(nh - this.state.width) > 10) {
            this.setState({
                height: nh,
                width: 710
            })
        }
        this.setState({
            loading: false
        })
        this.showPic()
    }
    onErrorImage() {
        // toast('图片加载失败，请稍后再试')
        // this.setState({
        //     loading: false
        // })
        // this.cancel()
    }

    /**
     * 打开分享层
     * @param {*} title
     * @param {*} desc
     * @param {*} img
     * @param {*} url
     * @param {*} link
     */
    async Share(title, desc, img, url, link, track, shareType, extra) {
        if (typeof title == 'string') {
            if (title) this.title = title;
            if (desc) this.desc = desc;
            if (img) this.img = img;
            if (url) this.url = url;
            if (link) this.link = link;
            if (track) this.track = track;
            if (shareType) this.shareType = shareType;
            if (extra) this.extra = extra;
        } else {
            let config = title;
            if (config.title) this.title = config.title;
            if (config.desc) this.desc = config.desc;
            if (config.img) this.img = config.img;
            if (config.url) this.url = config.url;
            if (config.link) this.link = config.link;
            if (config.track) this.track = config.track;
            if (config.shareType) this.shareType = config.shareType;
            if (config.extra) this.extra = config.extra;
        }
        const shop = await getShopDetail();
        this.inviteCode = shop.inviteCode;
        if (!/inviteCode/.test(this.url)) {
            if (this.url.indexOf('?') < 0) {
                this.url += "?inviteCode=" + shop.inviteCode;
            } else {
                this.url += "&inviteCode=" + shop.inviteCode;
            }
        }
        if (!/inviteCode/.test(this.link)) {
            if (this.link.indexOf('?') < 0) {
                this.link += "?inviteCode=" + shop.inviteCode;
            } else {
                this.link += "&inviteCode=" + shop.inviteCode;
            }
        }
        this.url += "&f=app";
        this.link += "&f=app";

        this.title = this.title.replace(/\{shopName\}/g, shop.name);
        this.url = this.url.replace(/\{shopName\}/g, shop.name);
        this.desc = this.desc.replace(/\{shopName\}/g, shop.name);
        if (this.url.indexOf('description=undefined') != -1) {
            this.url = this.url.replace('undefined', shop.name);
        }
        if (/daling\.com/.test(this.img) && ! /\.(jpg|png)_[0-9]{3}x[0-9]{3}.(jpg|png)/.test(this.img)) {
            this.img += '_150x150.jpg';
        }
        this.url = checkInviteCode(this.url)
        this.link = checkInviteCode(this.link)
        this.setState({
            isShow: true,
            share_img: "",
            shop
        })
    }
    /**
     * 打开分享层
     * @param {*} config
     * @param {*} config.title
     * @param {*} config.desc
     * @param {*} config.img
     * @param {*} config.url
     * @param {*} config.link
     * @param {*} data
     */
    async ShareData(config, data) {
        if (config.title) this.title = config.title;
        if (config.desc) this.desc = config.desc;
        if (config.img) this.img = config.img;
        if (config.url) this.url = config.url;
        if (config.link) this.link = config.link;
        if (config.track) this.track = config.track;
        try {
            const shop = await getShopDetail();
            this.inviteCode = shop.inviteCode;
            data.inviteCode = shop.inviteCode;

            const params = this.getParam(data);
            this.url += "?" + params;
            this.link += "?" + params;

            this.url += "&f=app";
            this.link += "&f=app";

            this.title = this.title.replace(/\{shopName\}/g, shop.name);
            this.url = this.url.replace(/\{shopName\}/g, shop.name);
            this.desc = this.desc.replace(/\{shopName\}/g, shop.name);

            if (! /\.(jpg|png)_[0-9]{3}x[0-9]{3}.(jpg|png)/.test(this.img)) {
                this.img += '_200x200.jpg';
            }
            this.url = checkInviteCode(this.url)
            this.link = checkInviteCode(this.link)
            this.setState({
                isShow: true,
                share_img: "",
                shop
            })
        } catch (e) {
            toast('打开分享失败,请重新分享')
        }
    }
    /**
     * 组合参数,将object转成字符串
     * @param {*} data
     */
    getParam(data) {
        let arr = [];
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const item = data[key];
                if (item !== undefined) arr.push(key + "=" + item);
            }
        }
        return arr.join("&");
    }
}
/**
 * 分享层显示的类型
 */
exports.SHARETYPE = {
    /**
     * 微信
     */
    WEIXIN: {
        method: "weiFriend", url: 'icon-shareWexin', txt: '微信好友'
    },
    /**
     * 微信朋友圈
     */
    PENGYOUQUAN: {
        method: 'weiPyq', url: 'icon-sharepyq', txt: '朋友圈'
    },
    /**
     * 连接地址
     */
    LIANJIE: {
        method: 'weiLink', url: 'icon-shareLink', txt: '链接'
    },
    /**
     * 二维码
     */
    ERWEIMA: {
        method: 'weiCode', url: 'icon-shareCode', txt: '二维码'
    },
    /**
     * 长图
     */
    PIC: {
        method: 'weiCode', url: 'icon-shareCode', txt: '长图分享'
    }
}
const styles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    bg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    box: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: px(750),
        backgroundColor: '#fff',
        borderTopLeftRadius: px(20),
        borderTopRightRadius: px(20),
    },
    cancelBtn: {
        width: px(750),
        height: px(90),
        borderColor: "#efefef",
        borderTopWidth: px(1),
        justifyContent: 'center',

    },
    cancelTxt: {
        lineHeight: px(100),
        fontSize: px(34),
        textAlign: 'center'
    },
    titleBox: {
        paddingHorizontal: px(20),
        //paddingTop: px(54),
        marginTop:px(54),
        alignItems: 'center',
    },
    tit: {
        fontSize: px(22)
    },
    list: {
        marginTop: px(74),
        marginBottom: px(76),
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: px(50),
        paddingRight: px(50),
    },
    shareBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareTxt: {
        marginTop: px(14),
        fontSize: px(25),
    }
})

const modalStyles = StyleSheet.create({
    wrap: {
        backgroundColor: '#fff',
        alignItems: 'center',
        flex: 1,
        //justifyContent: 'center',
        /*position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,*/
        //height: 0.8 * deviceHeight,
        width: px(710),
        //borderRadius: px(20),
        borderTopLeftRadius: px(20),
        borderTopRightRadius: px(20),
    },
    closeWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: px(690)
    },
    closeBtn: {
        width: px(60),
        height: px(80),
        marginRight: px(20)
    },
    image: {
        //borderRadius: px(20)
        borderTopLeftRadius: px(20),
        borderTopRightRadius: px(20),
    },
    saveInfo: {
        marginTop: px(26),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: px(228),
        height: px(49),
        borderWidth: px(1),
        borderColor: '#b2b3b5',
        borderRadius: px(4),
        backgroundColor: '#515151'
    },
    saveIcon: {
        width: px(26),
        height: px(26),
        marginRight: px(14)
    },
    saveText: {
        fontSize: px(26),
        color: '#fff'
    },
    saveText2: {
        marginTop: px(30),
        fontSize: px(24),
        color: '#fff'
    },
    bot: {
        height: px(230),
        width: deviceWidth,
        position: 'absolute',
        bottom: 0,
        zIndex: 100,
        left: px(0),
        borderTopLeftRadius: px(20),
        borderTopRightRadius: px(20),
        overflow: 'hidden',
    },
    bot_: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        justifyContent: 'space-around',
        paddingLeft: px(50),
        paddingRight: px(50)
    },
    close: {
        position: 'absolute',
        right: px(10),
        top: px(0),
        zIndex: 1,
        width: px(102),
        height: px(102)
    }
})
