'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    FlatList,
    Modal,
    Clipboard,
    TouchableOpacity,
    NativeModules,
    Dimensions,
    TouchableWithoutFeedback,
    Platform
} from 'react-native';

import { px, isIphoneX } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import Base from '../../styles/Base';
import { LoadingRequest } from '../../widgets/Loading';
import Popover from '../common/Popover';
import { DialogModal } from '../common/ModalView'
import { MyVideo } from '../common/Video'
import Icon from '../../UI/lib/Icon'
import { shareToSession, isWXAppInstalled, shareToTimeline } from '../../services/WeChat';
import Loading from '../../animation/Loading'
import { User, getShopDetail } from '../../services/Api';
import { touchBaseUrl, getHeader } from "../../services/Request";
import { ZoomImgModal } from '../common/ModalView'
import { SafeHeadView2 } from "../common/Header"

const os = Platform.OS == "ios" ? true : false;
const AppModule = NativeModules.AppModule;
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const WeChat = NativeModules.WeChat;

exports.GoodMatter = class extends React.Component {

    constructor(props) {
        super(props);
        this.height = px(240)
        this.state = {
            requestStatus: false,
            isPopover: false,
            buttonRect: {},
            net: 'WIFI'
        };
    }

    render() {
        return <View style={{ flex: 1 }}>
            <FlatList
                onScroll={(e) => this.props._onScroll(e.nativeEvent)}
                refreshing={this.props.refreshing}
                numColumns={1}
                style={{ flex: 1, marginBottom: px(50) }}
                onRefresh={() => this.props.refresh()}
                onEndReached={() => this.props.loadNext()}
                renderItem={({ item, index }) => {
                    if (index === 0) {
                        return <SafeHeadView2>
                            <View style={{ height: px(70) }}></View>
                        </SafeHeadView2>
                    }
                    return <MatterItem
                        item={item}
                        goods={this.props.goods}
                        onLayout={e => this.props.onLayout(e, index)}
                        share={this.share.bind(this)}
                        save={this.save.bind(this)}
                        openBigImg={this.openBigImg.bind(this)}
                        showPopover={this.showPopover.bind(this)}
                        switchTxt={this.props.switchTxt.bind(this)}
                        enterFull={this.enterFull.bind(this)}
                    />
                }}
                ListFooterComponent={<View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", marginBottom: isIphoneX() ? px(120) : px(60) }}>
                    {this.props.list.length > 0 && <Text style={{
                        textAlign: 'center',
                        fontSize: px(28),
                        marginLeft: px(30),
                        marginRight: px(30),
                        color: "#ccc"
                    }}>别扯了，到底啦</Text>}
                </View>}
                keyExtractor={(item) => item.id + ''}
                data={this.props.list}
                initialNumToRender={3} />
            <LoadingRequest text="正在保存" status={this.state.requestStatus} />
            <Popover
                style={{ backgroundColor: '#000' }}
                isVisible={this.state.isPopover}
                fromRect={this.state.buttonRect}
                //placement={'auto'}
                arrowSize={{ width: px(50), height: px(20) }}
                onClose={() => {
                    this.setState({ isPopover: false });
                }} >
                <Text onPress={() => {
                    Clipboard.setString(this.state.copyTxt);
                    this.setState({ isPopover: false }, () => {
                        toast('复制成功')
                    });
                }} style={{ color: '#fff', flex: 1, fontSize: px(32), textAlign: 'center' }} allowFontScaling={false}>复制</Text>
            </Popover>
            <MyVideo
                ref="videoModal"
                goodName={this.props.goodName}
            />
            <DialogModal
                ref='dialog'
                bodyStyle={matterStyles.alertBody}
            />
            <ShareModal
                check={this.check.bind(this)}
                ref="shareModal" />
            <Loading ref='loading' />
            <ZoomImgModal ref="zoomImgModal" />
        </View>
    }

    enterFull(item) {
        let obj = item.subject_content[0].img_list[0],
            src = obj.subject_video_url_http,
            size = obj.subject_video_size;
        if (this.state.net != 'WIFI') {
            this.refs.dialog.open({
                content: [`当前为移动网络，播放将消耗流量${size || `${0}M`}`],
                btns: [{
                    txt: '放弃播放',
                    click: () => { }
                }, {
                    txt: '继续播放',
                    click: async () => {
                        this.refs.videoModal && this.refs.videoModal.enterFullScreen(src);
                    }
                }]
            });
            return;
        }
        this.refs.videoModal && this.refs.videoModal.enterFullScreen(src);
    }


    async componentDidMount() {
        NativeModules.AppModule.getAppNetType && NativeModules.AppModule.getAppNetType((err, net) => {
            //console.log(net)
            this.setState({
                net: net
            })
        });
        this.props.refresh()
    }

    async componentWillMount() {
        this.isInstalled = await isWXAppInstalled();
    }

    async save(type, item) {
        let image = item.subject_content[0].img_list, txt = item.subject_content[0].content
        if (type == 1) {
            this.saveImage(image, txt);
        } else {
            await this.saveVideo(item);
        }
    }

    saveImage(image, txt) {
        this.setState({
            requestStatus: true
        }, () => {
            try {
                image.forEach((item, i) => {
                    AppModule.saveImageToAlbum(item.subject_img_url_http, (ignore, res) => {
                        if (res && i == image.length - 1) {
                            toast('保存并复制完成');
                            this.setState({
                                requestStatus: false
                            })
                            //Platform.OS == 'ios' && toast('保存成功');
                        } else {
                            //Platform.OS == 'ios' && toast('保存失败');
                        }
                    });
                })
                Clipboard.setString(txt);

            } catch (e) {
                toast('保存失败，请稍后重试');
                this.setState({
                    requestStatus: false
                })
            }
        })
    }

    async saveVideo(item) {
        let obj = item.subject_content[0].img_list[0];
        let goodName = this.props.goodName.replace(/\//g, '') || '',
            video = obj.subject_video_url_http,
            currentTime = new Date().getTime(),
            content = item.subject_content[0].content;
        let videoFileName = `${goodName}${currentTime}.mp4`
        this.setState({
            requestStatus: true
        }, () => {
            try {
                AppModule.saveVideoToAlbum(video, videoFileName).then((res) => {
                    if (res) {
                        this.setState({
                            requestStatus: false
                        });
                        Clipboard.setString(content);
                        toast('保存并复制完成');
                    }
                }).catch((res) => {
                    toast('视频下载失败，可能是您的网络不稳定，请稍候重试')
                });
            } catch (e) {
                toast('视频下载失败，可能是您的网络不稳定，请稍候重试');
            }
        })
    }

    openBigImg(index, list) {
        this.refs.zoomImgModal && this.refs.zoomImgModal.open(index, list)
    }

    showPopover(copyTxt, re) {
        re.measure((ox, oy, width, height, px, py) => {
            this.setState({
                copyTxt: copyTxt,
                isPopover: true,
                buttonRect: { x: px, y: py, width: width, height: height }
            });
        });
    }

    /*一键分享*/

    async check(content) {
        if (!this.props.goods) return;
        const shop = await getShopDetail();
        let inviteCode = shop.inviteCode,
            url = `${touchBaseUrl}/goods-detail?id=${this.props.goods.id}&inviteCode=${inviteCode}`;
        if (!/inviteCode/.test(url)) {
            url += "&inviteCode=" + shop.inviteCode;
        }
        let txt = content + ' ' + url
        Clipboard.setString(txt);
        toast('文字和链接已复制到剪切板，请直接粘贴分享')
    }

    async share(obj) {
        // 兼容1.0.7以下不能分享
        let version = getHeader('version').replace(/\./g, '') * 1
        if (version < 107) {
            this.props.sharePage && this.props.sharePage();
            return;
        }
        if (!obj || !obj.subject_content[0] || !obj.subject_content[0].img_list || obj.subject_content[0].img_list.length == 0) {
            return;
        }
        if (os && obj.content_type == 1) { //ios分享图片
            if (!this.isInstalled) {
                toast('没有安装微信');
                return;
            }
            await this.check(obj.subject_content[0].content)
            this.refs.loading.open()
            let images = []
            obj.subject_content[0].img_list.forEach(item => {
                images.push(item.subject_img_url_http)
            })
            WeChat.shareImagesToSession({
                description: 'shareMatter',
                images: images.join('|')
            }).then((res) => {
                this.refs.loading.close()
            }).catch((res) => {
                this.refs.loading.close()
                toast('出错了，请稍后再试')
            })
        } else {
            this.refs.shareModal.share(obj)
        }
    }
}

const matterStyles = StyleSheet.create({
    alertBody: {
        width: px(541),
        height: px(152),
        alignItems: 'center',
        justifyContent: 'center'
    },
    matter: {
        width: px(750),
        backgroundColor: "#fff",
        marginBottom: px(20),
    },
    matterTxt: {
        paddingLeft: px(30),
        paddingRight: px(30),
        paddingTop: px(30),
        paddingBottom: px(20)
    },
    text: {
        color: '#333',
        fontSize: px(30),
        lineHeight: px(42)
    },
    emptyTxt: {
        fontSize: px(28),
        color: '#858685'
    },
    operate: {
        flex: 1,
        marginTop: px(16),
        //alignItems:'flex-end',
        marginRight: px(15)
    },
    txtBtn: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageContain: {
        //flex:1,
        flexDirection: 'row',
        //paddingTop:px(30),
        //paddingBottom:px(7),
        //alignItems:'center',
        flexWrap: 'wrap',
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    images: {
        overflow: 'hidden',
        borderRadius: px(10)
    },
    matterFooter: {
        height: px(80),
        borderTopColor: '#e5e5e5',
        borderTopWidth: px(1)
    },
    matterBtn: {
        flex: 1
    },
    btnTxt: {
        color: '#333',
        fontSize: px(28)
    },
    videoContain: {
        paddingLeft: px(30),
        paddingRight: px(30),
        //paddingBottom: px(7),
        //paddingTop: px(10),
    },
    defaultVideo: {
        width: px(690),
        height: px(458)
    },
    play: {
        position: 'absolute',
        top: px(179),
        left: px(295),
        zIndex: 1,
        width: px(100),
        height: px(100),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    netContain: {
        position: 'absolute',
        left: px(30),
        top: 0,
        backgroundColor: '#000',
        borderRadius: px(10),
        overflow: 'hidden'
    }
})

class MatterItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            width: 0,
            height: 0,
            size: 1,
            txtHeight: 0,
            version: getHeader('version').replace(/\./g, '') * 1
        }
        this.layout = []
    }

    renderImage(item, sub) {
        return <View style={[matterStyles.imageContain]}>
            {
                (sub.img_list || []).map((i, index) =>
                    <TouchableOpacity onPress={() => this.lookBigImg(index)} key={index}>
                        <View style={[matterStyles.images, {
                            marginRight: sub.img_list.length == 4 ? index % 2 ? px(18) : px(8) : (index + 1) % 3 ? px(8) : px(0),
                            marginBottom: sub.img_list.length - index <= 3 ? px(0) : px(8),
                            width: sub.img_list.length == 1 ? px(456) : px(224),
                            height: sub.img_list.length == 1 ? px(456) : px(224)
                        }]} activeOpacity={0.8}>
                            <Image
                                source={{ uri: item.show ? i.subject_img_url_http : require('../../images/img2') }}
                                resizeMode="cover"
                                resizeMethod="resize"
                                style={[matterStyles.images, { width: sub.img_list.length == 1 ? px(456) : px(224), height: sub.img_list.length == 1 ? px(456) : px(224) }]}
                            >
                            </Image>
                        </View>
                    </TouchableOpacity>
                )
            }
        </View>
    }

    renderVideo(item, sub) {
        return <TouchableOpacity activeOpacity={0.9} onPress={() => this.enter()}>
            <View style={matterStyles.videoContain}>
                <Image
                    onLoad={() => {
                        Image.getSize(sub.img_list[0].subject_img_url_http, (width, height) => {
                            let size = (width / height + '').substr(0, (width / height + '').indexOf('.') + 2)
                            this.setState({
                                width, height, size
                            })
                        });
                    }}
                    source={{ uri: item.show ? sub.img_list[0].subject_img_url_http : require('../../images/img2') }}
                    resizeMode="cover"
                    resizeMethod="resize"
                    style={{
                        width: this.state.width > this.state.height ? px(690) : this.state.size == 1 ? px(456) : px(388),
                        //height:this.state.width > this.state.height ? px(458) : px(579),
                        height: this.state.width > this.state.height ? px(690) / this.state.size : this.state.size == 1 ? px(456) / this.state.size : px(388) / this.state.size,
                        borderRadius: px(10),
                        overflow: 'hidden'
                    }}
                >
                </Image>
                <Icon name="icon-detail-play" style={{
                    width: px(100), height: px(100), position: 'absolute',
                    top: this.state.width > this.state.height ? px(690) / this.state.size / 2 - px(50) : this.state.size == 1 ? px(456) / this.state.size / 2 - px(50) : px(388) / this.state.size / 2 - px(50),
                    left: this.state.width > this.state.height ? px(295) : this.state.size == 1 ? px(178) : px(144),
                    zIndex: 1
                }} />
            </View>
        </TouchableOpacity>
    }

    renderBtn(icon, txt) {
        return <View style={[matterStyles.matterBtn, Base.inline]}>
            <Icon
                name={icon}
                style={{ width: px(28), height: px(28), marginRight: px(12) }}
            />
            <Text allowFontScaling={false} style={matterStyles.btnTxt}>{txt}</Text>
        </View>
    }

    renderFoot(item, version, goods) {
        return <View style={[matterStyles.matterFooter, { marginTop: !item.source ? px(30) : px(0) }]}>
            <View style={[Base.inline, { flex: 1 }]}>
                {
                    item.content_type == 1 ?
                        <TouchableWithoutFeedback onPress={() => this.save(1)}>
                            {this.renderBtn("icon-detail-download", '保存图文')}
                        </TouchableWithoutFeedback> :
                        <TouchableWithoutFeedback onPress={() => this.save(2)}>
                            {this.renderBtn("icon-detail-download", '保存视频')}
                        </TouchableWithoutFeedback>
                }
                {
                    goods.is_deep_stock != 1 &&
                    <TouchableWithoutFeedback onPress={() => this.share(item)}>
                        {
                            version < 107 ?
                                this.renderBtn("goodsDetailShare", '分享商品')
                                :
                                this.renderBtn("goodsDetailShare", '一键分享')
                        }
                    </TouchableWithoutFeedback>
                }
            </View>
        </View>
    }

    render() {
        const { item, goods } = this.props
        const sub = item.subject_content[0]
        const { version } = this.state
        if (!item.subject_content[0]) return null;
        return <View style={matterStyles.matter} onLayout={(e => this.setLayAll(e.nativeEvent))}>
            <View style={matterStyles.matterTxt}>
                <Text onLayout={(e => this.setLayout(e.nativeEvent))} allowFontScaling={false} style={[matterStyles.text, { position: 'absolute', left: 0, opacity: 0 }]}>
                    {sub.content}
                </Text>
                <Text allowFontScaling={false} numberOfLines={!item.showTxt ? 3 : 100} onLongPress={this.showPopover_('button' + item.id)} ref={`button${item.id}`} style={matterStyles.text}>
                    {sub.content}
                </Text>
                {
                    this.state.txtHeight > 63.5 * deviceWidth / 375 + 1 &&
                    <View style={matterStyles.operate}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.props.switchTxt(item)} style={matterStyles.txtBtn}>
                            <Text allowFontScaling={false} style={{ color: '#d0648f', fontSize: px(28) }}>{!item.showTxt ? '展开' : '收起'}</Text>
                            {item.showTxt && <Icon name="icon-detail-shousuo" style={{ width: px(22), height: px(12), marginLeft: px(17) }} />}
                            {!item.showTxt && <Icon name="icon-detail-zhankai" style={{ width: px(22), height: px(12), marginLeft: px(17) }} />}
                        </TouchableOpacity>
                    </View>
                }
            </View>
            {item.content_type == 1 && this.renderImage(item, sub)}
            {item.content_type == 2 && this.renderVideo(item, sub)}
            {
                item.source != '' &&
                <Text
                    style={{ color: '#ccc', fontSize: px(24), marginLeft: px(30), marginBottom: px(25), marginTop: px(7) }}
                    allowFontScaling={false}>
                    {`素材来源:${item.source}`}
                </Text>
            }
            {this.renderFoot(item, version, goods)}
        </View>
    }

    share(item) {
        this.props.share && this.props.share(item)
    }

    setLayAll(e) {
        this.props.onLayout && this.props.onLayout(e);
    }
    save(type) {
        let item = this.props.item;
        this.props.save && this.props.save(type, item);
    }

    showPopover_ = (re) => () => {
        let content = this.props.item.subject_content[0].content;
        this.props.showPopover && this.props.showPopover(content, this.refs[re]);
    }

    setLayout(e, index) {
        //console.log(e, index, 'layout')
        this.setState({
            txtHeight: e.layout.height
        });
        this.layout[index] = e.layout.height;
    }

    lookBigImg(index) {
        const { item } = this.props;
        const object = item.subject_content[0];
        let list = object.img_list;
        let images = []
        list.forEach(i => {
            images.push({ url: i.subject_img_url_http })
        })
        this.props.openBigImg && this.props.openBigImg(index, images);
    }

    enter() {
        let item = this.props.item, width = this.state.width, height = this.state.height;
        this.props.enterFull && this.props.enterFull(item, width, height);
    }
}

const SHARE = {
    /**
     * 微信
     */
    WEIXINPIC: {
        method: "weiFriend", url: 'icon-shareWexin', txt: '微信好友'
    },
    /**
     * 微信朋友圈
     */
    PENGYOUQUANPIC: {
        method: 'weiPyq', url: 'icon-sharepyq', txt: '朋友圈'
    }
}
class ShareModal extends React.Component {
    height = px(deviceHeight)
    constructor(props) {
        super(props)
        this.state = {
            boxY: new Animated.Value(this.height),
            isShow: false,
        }
    }

    render() {
        return <Modal
            style={shareStyles.view}
            visible={this.state.isShow}
            onShow={() => this.show()}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <Loading ref='loading' />
            <TouchableWithoutFeedback onPress={() => this.cancel()}>
                <View style={shareStyles.bg} ></View>
            </TouchableWithoutFeedback>
            <Animated.View style={[shareStyles.box, { paddingBottom: isIphoneX() ? px(80) : px(20) }, {
                transform: [
                    { translateY: this.state.boxY }
                ]
            }]}>
                <View style={shareStyles.list}>
                    {this.renderTypes([SHARE.WEIXINPIC, SHARE.PENGYOUQUANPIC]).map(item => item)}
                </View>
                <TouchableOpacity onPress={() => this.cancel()}>
                    <View style={[shareStyles.cancelBtn]}>
                        <Text style={shareStyles.cancelTxt}>取消</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    }

    async componentWillMount() {
        this.isInstalled = await isWXAppInstalled();
    }
    renderTypes(types) {
        let list = [];
        types.map((item, index) => {
            if (!item) return;
            list.push(<TouchableOpacity key={index}
                style={shareStyles.shareBtn}
                onPress={this[item.method].bind(this)}
                activeOpacity={0.9}>
                <Icon name={item.url} style={{ width: px(96), height: px(96) }} />
                <Text style={shareStyles.shareTxt} allowFontScaling={false}>{item.txt}</Text>
            </TouchableOpacity>);
        })
        return list;
    }

    cancel() {
        this.state.boxY.stopAnimation();
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 200
            }
        ).start(() => {
            this.setState({
                isShow: false
            })
        })
    }

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

    share(obj) {
        if (!obj) return null;
        this.obj = obj
        let images = []
        obj.subject_content[0].img_list.forEach(item => {
            images.push(item.subject_img_url_http)
        })
        this.images = images.join('|')

        this.setState({
            isShow: true
        })
    }

    async weiFriend() {
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        if (!this.obj || !this.obj.subject_content[0] || !this.obj.subject_content[0].img_list || this.obj.subject_content[0].img_list.length == 0) {
            return;
        }
        if (!this.props.check) {
            return toast('请稍后再试')
        }
        await this.props.check(this.obj.subject_content[0].content)
        this.refs.loading.open()
        if (this.obj.content_type == 1) {
            WeChat.shareImagesToSession({
                description: "shareMatter",
                images: this.images
            }).then((res) => {
                this.refs.loading.close()
            }).catch((res) => {
                this.refs.loading.close()
                toast('出错了，请稍后再试')
            });

        } else if (this.obj.content_type == 2) {
            await shareToSession({
                type: 'video',
                title: this.obj.subject_content[0].img_list[0].good_name,
                description: this.obj.subject_content[0].content,
                videoUrl: this.obj.subject_content[0].img_list[0].subject_video_url_http,
                //thumbImage: '',
                //thumbImage: this.state.down_img,
                thumbImage: this.obj.subject_content[0].img_list[0].subject_img_url_http,
            });
        }
        this.cancel()
    }

    async weiPyq() {
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        if (!this.obj || !this.obj.subject_content[0] || !this.obj.subject_content[0].img_list || this.obj.subject_content[0].img_list.length == 0) {
            return;
        }
        if (!this.props.check) {
            return toast('请稍后再试')
        }
        await this.props.check(this.obj.subject_content[0].content)
        this.refs.loading.open()
        if (this.obj.content_type == 1) {
            WeChat.shareImagesToTimeline({
                description: "shareMatter",
                images: this.images
            }).then((res) => {
                this.refs.loading.close()
            }).catch((res) => {
                this.refs.loading.close()
                toast('出错了，请稍后再试')
            });

        } else if (this.obj.content_type == 2) {
            await shareToTimeline({
                type: 'video',
                title: this.obj.subject_content[0].img_list[0].good_name,
                description: this.obj.subject_content[0].content,
                videoUrl: this.obj.subject_content[0].img_list[0].subject_video_url_http,
                //thumbImage: '',
                //thumbImage: this.state.down_img,
                thumbImage: this.obj.subject_content[0].img_list[0].subject_img_url_http,
            });

        }
        this.cancel()
    }
}

const shareStyles = StyleSheet.create({
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
        backgroundColor: '#fff'
    },
    cancelBtn: {
        width: px(750),
        padding: px(20),
        borderColor: "#efefef",
        borderTopWidth: px(1),
        justifyContent: 'center',
        alignItems: 'center'
    },
    cancelTxt: {
        fontSize: px(36),
        textAlign: 'center'
    },
    list: {
        //height: px(250),558   186
        width: px(750),
        //justifyContent: 'space-around',
        //alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: px(60),
        paddingHorizontal: px(70)
    },
    shareBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareTxt: {
        marginTop: px(10),
        fontSize: px(25),
    }
})