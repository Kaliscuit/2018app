'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback, TextInput, Dimensions, Animated, NativeModules, Platform,
    ActivityIndicator
} from 'react-native'
import { px, isIphoneX } from '../../../utils/Ratio';
import { show as toast } from '../../../widgets/Toast';
import base from '../../../styles/Base'
import { shareToSession, isWXAppInstalled, shareToTimeline } from '../../../services/WeChat';
import Loading from '../../../animation/Loading'
import Icon from '../../../UI/lib/Icon'
import {UploadOperation} from './Operation';
import {Header, SafeHeadView} from '../Header';

import util_tools from "../../../utils/tools";
import Video from 'react-native-video'
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const WeChat = NativeModules.WeChat;
/**
 *确定删除弹层
 */
class ComfirmDelete extends React.Component {
    constructor(props) {
        super(props)
        this.height = px(500)
        this.state = {
            boxY: new Animated.Value(this.height)
        }
    }

    render() {
        return <Animated.View style={[styles.box, {
            transform: [
                { translateY: this.state.boxY }
            ]
        }]}>
            {this.renderConfirm()}
        </Animated.View>
    }

    renderConfirm() {
        let type = this.props.type, txt = '';
        if (type == 'image') {
            txt = '要删除这张照片吗？'
        } else if (type == 'video') {
            txt = '要删除这个视频吗？'
        }
        return <View style={styles.btn}>
            {this.renderItem('txt1', txt, 'topRadius')}
            <TouchableWithoutFeedback onPress={() => this.del()}>
                {this.renderItem('txt2', '删除', 'botRadius', 'borderItem')}
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.cancel()}>
                {this.renderItem('txt3', '取消', 'borderRadius', 'borderRadius', 'marginItem')}
            </TouchableWithoutFeedback>
        </View>

    }

    renderItem(txt, label, radius, needBorder, needMargin) {
        return <View style={[styles.item, styles[radius], styles[needBorder], styles[needMargin]]}>
            <View style={styles.inner}><Text style={styles[txt]} allowFontScaling={false}>{label}</Text></View>
        </View>
    }

    del() {
        this.cancel();
        this.props.del && this.props.del();
    }

    /*renderSelect() {
        return <View style={styles.btn}>
            <TouchableWithoutFeedback onPress={() => this.props.select && this.props.select(1)}>
                {this.renderItem('txt3', '选择视频', 'topRadius')}
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.props.select && this.props.select(2)}>
                {this.renderItem('txt3', '选择图片', 'botRadius', 'borderItem')}
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.props.cancel && this.props.cancel()}>
                {this.renderItem('txt3', '取消', 'borderRadius', 'borderRadius', 'marginItem')}
            </TouchableWithoutFeedback>
        </View>

    }*/

    pop() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 100
            }
        ).start();
    }

    cancel() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 100
            }
        ).start();
    }

    /*async select(type) {
        if (type == 1) { //选择视频

        } else if (type == 2) { //选择图片
            console.log(UploadOperation, 'UploadOperation')
            let images = await UploadOperation.upPhotos(9)
            console.log(images, 'images')
            if (images.status == 0) {
                await this.props.navigation.navigate('ReleaseMatter', {
                    photos: images.photos
                });
            } else {
                if (images.err && images.err.indexOf('取消') !== -1) {
                    toast('您已取消了')
                } else {
                    toast('请您稍后再试')
                }
            }
        }
        this.props.cancel && this.props.cancel();
        //ReleaseMatter
    }*/

}
exports.ComfirmDelete = ComfirmDelete
/**
 *选择发布类型弹层
 * props：goods没有，from 店铺素材列表
 */
exports.SelectPicker = class SelectPicker extends React.Component {
    constructor(props) {
        super(props)
        this.height = px(325)
        this.state = {
            show: false,
            boxY: new Animated.Value(this.height)
        }

    }

    render() {
        const {goods} = this.props;
        const {show} = this.state;
        return <Modal
            visible={show}
            style={{flex: 1}}
            onShow={() => this.open()}
            transparent={true}>
            <TouchableWithoutFeedback onPress={() => this.cancel()}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)'}}></View>
            </TouchableWithoutFeedback>
            <Animated.View style={[styles.box, {
                transform: [
                    { translateY: this.state.boxY }
                ]
            }]}>
                {this.renderSelect()}
            </Animated.View>
        </Modal>
    }

    renderSelect() {
        return <View style={styles.btn}>
            <TouchableWithoutFeedback onPress={() => this.select(1)}>
                {this.renderItem('txt3', '选择视频', 'topRadius')}
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.select(2)}>
                {this.renderItem('txt3', '选择图片', 'botRadius', 'borderItem')}
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.cancel()}>
                {this.renderItem('txt3', '取消', 'borderRadius', 'borderRadius', 'marginItem')}
            </TouchableWithoutFeedback>
        </View>

    }

    renderItem(txt, label, radius, needBorder, needMargin) {
        return <View style={[styles.item, styles[radius], styles[needBorder], styles[needMargin]]}>
            <View style={styles.inner}><Text style={styles[txt]} allowFontScaling={false}>{label}</Text></View>
        </View>
    }


    open() {
        this.setState({
            show: true
        }, this.pop())
    }


    pop() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 100
            }
        ).start();
    }


    async select(type) {
        let goods = this.props.goods;
        if (type == 1) { //选择视频
            let video = await UploadOperation.uploadVideo();
            if (video) {
                await this.props.navigation.navigate('ReleaseMatter', {
                    video: video,
                    goods: goods,
                    type: 'video',
                    call: () => {
                        this.props.refresh && this.props.refresh()
                    }
                });
            }
        } else if (type == 2) { //选择图片
            let images = await UploadOperation.upPhotos(9)
            if (images.status == 0) {
                await this.props.navigation.navigate('ReleaseMatter', {
                    photos: images.photos,
                    goods: goods,
                    type: 'photo',
                    call: () => {
                        this.props.refresh && this.props.refresh()
                    }
                });
            } else {
                if (images.err && images.err.indexOf('取消') !== -1) {
                    //toast('您已取消了')
                } else {
                    toast('请您稍后再试')
                }
            }
        }
        this.cancel();
        //ReleaseMatter
    }

    cancel() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 100
            }
        ).start();
        this.setState({
            show: false
        })
    }
}
const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
    },
    btn: {
        flex: 1,
        justifyContent:'flex-end',
        marginBottom: px(20)
    },
    item: {
        marginHorizontal: px(20),
        height: px(100),
        width: px(710),
        overflow: 'hidden'
    },
    marginItem: {
        marginTop: px(22)
    },
    borderRadius: {
        borderRadius: px(12),
    },
    topRadius: {
        borderTopLeftRadius: px(12),
        borderTopRightRadius: px(12)
    },
    botRadius: {
        borderBottomLeftRadius: px(12),
        borderBottomRightRadius: px(12)
    },
    borderItem: {
        borderTopColor: '#ccc',
        borderTopWidth: px(1)
    },
    inner: {
        width: px(710),
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    txt1: {
        color: '#222',
        fontSize: px(24)
    },
    txt2: {
        color: '#d0648f',
        fontSize: px(34)
    },
    txt3: {
        color: '#222',
        fontSize: px(34)
    }
});
/**
 *一键分享
 */
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

        this.successCall = props.successCall || function () {}
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
                <Icon name={item.url} style={{width: px(96), height: px(96)}} />
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

    share(obj, goods) {
        if (!obj) return null;
        this.obj = obj;
        this.goods = goods;
        let images = []
        obj.subjectContent[0].img_list.forEach(item => {
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
        if (!this.obj || !this.obj.subjectContent[0] || !this.obj.subjectContent[0].img_list || this.obj.subjectContent[0].img_list.length == 0) {
            return;
        }
        if (!this.props.check) {
            return toast('请稍后再试')
        }
        await this.props.check(this.obj.subjectContent[0].content, this.goods)
        this.refs.loading.open()
        if (this.obj.contentType == 1) {
            // WeChat.openWXApp(() => {})
            WeChat.shareImagesToSession({
                description: "shareMatter",
                images: this.images
            }).then((res) => {
                this.successCall()
                this.refs.loading.close()
            }).catch((res) => {
                this.refs.loading.close()
                toast('出错了，请稍后再试')
            });

        } else if (this.obj.contentType == 2) {
            //视频地址为null时 ios 闪退
            if (!this.obj.subjectContent[0].img_list[0].subject_video_url_http){
                return
            }
            shareToSession({
                type: 'video',
                title: this.obj.subjectContent[0].img_list[0].good_name,
                description: this.obj.subjectContent[0].content,
                videoUrl: this.obj.subjectContent[0].img_list[0].subject_video_url_http,
                //thumbImage: '',
                //thumbImage: this.state.down_img,
                thumbImage: this.obj.subjectContent[0].img_list[0].subject_img_url_http,
            }).then((res) => {
                this.successCall()
            }).catch((res) => {
                toast('出错了，请稍后再试')
            })
        }
        this.cancel()
    }

    async weiPyq() {
        if (!this.isInstalled) {
            toast('没有安装微信');
            return;
        }
        if (!this.obj || !this.obj.subjectContent[0] || !this.obj.subjectContent[0].img_list || this.obj.subjectContent[0].img_list.length == 0) {
            return;
        }
        if (!this.props.check) {
            return toast('请稍后再试')
        }
        await this.props.check(this.obj.subjectContent[0].content, this.goods)
        this.refs.loading.open()
        if (this.obj.contentType == 1) {
            WeChat.openWXApp(() => {})
            // WeChat.shareImagesToTimeline({
            //     description: "shareMatter",
            //     images: this.images
            // }).then((res) => {
            //     this.successCall()
            //     this.refs.loading.close()
            // }).catch((res) => {
            //     this.refs.loading.close()
            //     toast('出错了，请稍后再试')
            // });

        } else if (this.obj.contentType == 2) {
            //视频地址为null时 ios 闪退
            if (!this.obj.subjectContent[0].img_list[0].subject_video_url_http){
                return
            }
            shareToTimeline({
                type: 'video',
                title: this.obj.subjectContent[0].img_list[0].good_name,
                description: this.obj.subjectContent[0].content,
                videoUrl: this.obj.subjectContent[0].img_list[0].subject_video_url_http,
                //thumbImage: '',
                //thumbImage: this.state.down_img,
                thumbImage: this.obj.subjectContent[0].img_list[0].subject_img_url_http,
            }).then((res) => {
                this.successCall()
            }).catch((res) => {
                toast('出错了，请稍后再试')
            })

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

exports.ShareModal = ShareModal
/**
 *查看视频大图
 */
exports.VideoModal = class VideoModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            src: ''
        }
        this.renderHead = this.renderHead.bind(this);

    }

    onBack() {
        this.setState({
            show: false,
            src: ''
        })
    }

    del() {
        this.onBack()
        this.props.delVideo && this.props.delVideo();
    }

    deleteFn() {
        this.refs.comfirmDelete && this.refs.comfirmDelete.pop();
    }

    renderHead() {
        return <Header
            title={'1/1'}
            style={{backgroundColor:'#fff'}}
            onBack={() => this.onBack()}
            navigation={{state: {params: null}}}
            rightBtn={
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.deleteFn()}>
                    <Icon name="trash" style={{ width: 21, height: 21, marginRight: 10 }}/>
                </TouchableOpacity>
            }
        >
        </Header>
    }
    renderVideo(src) {
        return <Video
            ref={(ref) => this.videoPlayer_ = ref}
            source={{uri: src}}
            style={{ flex: 1, backgroundColor:'#000' }}
            resizeMode='contain'
            rate={1.0}
            volume={1.0}
            muted={false}
            //currentTime={this.state.currentTime}
            playWhenInactive={false}
            playInBackground={false}
            ignoreSilentSwitch={'ignore'}
            progressUpdateInterval={100}
            //paused={paused}
            //onProgress={(e) => this.onProgress(e)}
            repeat={true}
            //onLoadStart={() => this.changeVideoStatus('onLoadStart')}
            //onLoad={(data) => this.onLoaded(data)}
            //onEnd={() => this.onPlayEnd()}
            //onError={() => this.changeVideoStatus('error')}
        />
    }

    renderCenter(state) {
        if (state.videoStatus) { //播放视频之前
            return <TouchableWithoutFeedback onPress={() => this.outerFullScreen()}>
                <View style={styles.sty2}>
                    <ActivityIndicator
                        animating={true}
                        style={{ width: px(80), height: px(80) }}
                        size="large"
                        color="#ffffff"
                    />
                    <Text style={styles.text}>{state.hint}</Text>
                </View>
            </TouchableWithoutFeedback>
        }
    }

    render() {
        const {show, src} = this.state;
        if (src == '') return null;
        return <Modal
            visible={show}
            onShow={() => this.open()}
            transparent={true}>
            <View style={lookStyles.modal}>
                {this.renderHead()}
                {this.renderVideo(src)}
                {/*{this.renderCenter()}*/}
                <ComfirmDelete
                    type="video"
                    ref="comfirmDelete"
                    del={this.del.bind(this)}
                />
            </View>
        </Modal>
    }

    /**
     *视频加载，出错的情况
     */
    changeVideoStatus(status) {
        let tip = ''
        if (status == 'onLoadStart') {
            tip = '视频载入中...'
        } else if (status == 'onBuffering') {
            tip = '视频缓冲中...'
        } else if (status == 'error') {
            tip = '网络不给力，视频没打开，请点击屏幕退出重试'
        }
        this.setState({
            videoStatus: true,
            hint: tip
        })
    }

    /**
     *视频加载完成
     */
    onLoaded(data) {
        let duration_ = this.betterTime(Math.round(data.duration))
        //console.log('视频加载完成', data);
        this.setState({
            videoStatus: false,
            hint: '视频加载中...',
            duration: data.duration,
            totalTime: duration_,
            loadEnd: true,
            //isEnd: false,
            paused: false
        })
    }

    /**
     *视频播放结束
     */
    onPlayEnd() {
        //console.log(1)
        this.setState({
            isEnd: true,
            isShowMenu: true
        })
    }

    open(src) {
        if (!src) {
            return;
        }
        this.setState({
            show: true,
            src
        })
    }
}
const lookStyles = StyleSheet.create({
    modal: {
        flex: 1,
        height: deviceHeight,
        backgroundColor: '#000'
    },
})

/**
 *关联列表列表项
 */
class GoodItem extends React.Component {

    click() {
        const {goods} = this.props;
        this.props.navigation.state.params.call && this.props.navigation.state.params.call(goods);
        this.props.navigation.goBack();
    }

    render() {
        const {goods} = this.props;
        return <TouchableWithoutFeedback onPress={() => this.click()}>
            <View style={[goodStyles.content, base.inline_left]}>
                <GetGoodItem goods={goods}/>
                <View style={[goodStyles.btn, base.line]}>
                    <Icon name="matterRelation" style={goodStyles.icon}/>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }
}

/**
 *关联商品模块
 */
class Relation extends React.Component {

    render() {
        const {goods, originGoods, style = {}} = this.props;
        return <View style={[goodStyles.relationGood, base.inline, style]}>
            <GetGoodItem goods={goods}/>
            {
                !originGoods && 
                <Icon 
                    name="icon-arrow1" 
                    style={{width: px(15), height: px(26), marginLeft:px(20)}} />
            }
        </View>
    }
}

class ListGood extends React.Component {

    render() {
        const {goods} = this.props;
        return <TouchableWithoutFeedback onPress={() => this.goDetail(goods)}>
            <View style={[goodStyles.listGood]}>
                <GetGoodItem goods={goods}/>
            </View>
        </TouchableWithoutFeedback>
    }

    goDetail(goods) {
        this.props.navigation.navigate('DetailPage', {
            id: goods.sku ? '' : goods.id,
            sku: goods.sku
        });
    }
}
/**
 *公用样式
 */
class GetGoodItem extends React.Component {
    render() {
        const {goods} = this.props;
        if (!goods) return null;
        return <View style={[goodStyles.good, base.inline_left]}>
            <Image
                resizeMethod="scale"
                source={{ uri: goods.image }}
                style={goodStyles.image} />
            <View style={goodStyles.right}>
                <Text allowFontScaling={false} numberOfLines={2} style={goodStyles.tit}>{goods.goodsName}</Text>
                <View style={[goodStyles.money]}>
                    <Text allowFontScaling={false} style={goodStyles.tit}>
                        ￥{goods.salePrice}
                    </Text>
                    <Text allowFontScaling={false} style={goodStyles.priceLine}>
                        /
                    </Text>
                    <Text allowFontScaling={false} style={goodStyles.benefitMoney}>
                        赚￥{goods.benefitMoney}
                    </Text>
                </View>
            </View>
        </View>
    }
}

exports.GoodItem = GoodItem
exports.Relation = Relation
exports.ListGood = ListGood
const goodStyles = StyleSheet.create({
    content: {
        width: px(750),
        paddingTop: px(42),
        paddingBottom: px(47),
        paddingLeft: px(32),
        backgroundColor: '#fff',
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    relationGood: {
        marginHorizontal: px(30),
        marginTop: px(42), //设计的50-上传图片留下的8
        padding: px(20),
        backgroundColor: '#f7f7f7',
        borderRadius: px(10),
        overflow: 'hidden'
    },
    listGood:{
        marginHorizontal: px(30),
        marginTop: px(30),
        padding: px(20),
        backgroundColor: '#f7f7f7',
        borderRadius: px(10),
        overflow: 'hidden'
    },
    good: {
        flex: 1,
    },
    image: {
        width: px(120),
        height: px(120)
    },
    tit: {
        fontSize: 14,
        color: '#222',
        includeFontPadding: false
    },
    right: {
        flex: 1,
        justifyContent: 'space-between',
        height: px(120),
        marginLeft: px(20),
        paddingVertical: px(5)
    },
    money: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    salePrice: {

    },
    priceLine: {
        fontSize: px(22),
        color: '#898989',
        lineHeight: px(35),
        includeFontPadding: false,
        marginHorizontal: px(10)
    },
    benefitMoney: {
        fontSize: px(22),
        color: '#d0648f',
        includeFontPadding: false
    },
    btn: {
        width: px(140),
        height: px(40),
        borderLeftWidth: px(1),
        borderLeftColor: '#e1e1e1',
        marginLeft: px(40)
        //backgroundColor: '#000'
    },
    icon: {
        width: px(40),
        height: px(40)
    }
})

/**
 *素材关联商品搜索
 */

exports.SearchMatterBar = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChangeSearchBtnTxt: false,
            inputTxt: '',
            isDisabled: false,
        };
    }
    static defaultProps = {
        goSearch: () => { },
        onFocus: null,
        placeholder: "输入您想关联的商品关键字"
    }
    render() {
        return <SafeHeadView style={[styleSearchMatterBar.header, this.props.style || {}]}>
            <TouchableOpacity onPress={() => this.goBack()}>
                <View style={styleSearchMatterBar.back}>
                    <Icon name="icon_back" style={styleSearchMatterBar.backIcon} />
                </View>
            </TouchableOpacity>
            <View style={styleSearchMatterBar.headerSearchBar}>
                <TouchableOpacity style={styleSearchMatterBar.headerSearchImg} onPress={() => this.submit()}>
                    <Icon name="icon_search_gray"
                        style={{ width: px(40), height: px(40), marginRight: px(10) }} />
                </TouchableOpacity>
                <TextInput
                    style={[styleSearchMatterBar.headerSearchInput, { width: this.state.isEdit ? px(540) : this.props.type == 1 ? px(500) : px(540) }]}
                    ref="searchInput"
                    placeholder={this.props.placeholder}
                    placeholderTextColor="#858385"
                    autoCorrect={false}
                    autoFocus={true}
                    keyboardType="web-search"
                    maxLength={20}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                    value={this.state.inputTxt}
                    onChangeText={(text) => this.change(text)}
                    onSubmitEditing={this.submit.bind(this)}
                />
            </View>

            {
                this.state.isChangeSearchBtnTxt ?
                    <TouchableOpacity onPress={this.cancel.bind(this)}>
                        <View style={styles.cancelView}>
                            <Text style={styles.touchTxt}>
                                取消
                            </Text>
                        </View>
                    </TouchableOpacity>
                    : <TouchableOpacity onPress={this.submit.bind(this)}>
                        <View style={styles.cancelView}>
                            <Text style={[styles.touchTxt, {color: this.state.isDisabled ? '#222222' : '#b2b3b5'}]}>
                                搜索
                            </Text>
                        </View>
                    </TouchableOpacity>
            }
        </SafeHeadView>
    }
    goBack() {
        this.props.navigation.goBack();
    }
    setTxt(t) {
        this.setState({
            inputTxt: t
        });
    }
    endEdit() {
        if (this.state.inputTxt == "") {
            this.setState({
                inputTxt: "",
                isEdit: true
            });
        } else {
            this.setState({
                isEdit: true
            });
        }

    }
    submit() {
        this.setState({
            isChangeSearchBtnTxt: true,
        });
        this.endEdit();
        this.refs.searchInput.blur();
        this.props.goSearch(this.state.inputTxt);
    }

    change(text) {
        if (util_tools.isNotEmpty(text)) {
            if (text != this.state.inputTxt) {
                this.setState({
                    inputTxt: text,
                    isDisabled: true,
                });
            }
        } else {
            this.setState({
                isDisabled: false,
                inputTxt: '',
            });
            //this.props.restPose(); // 恢复初始状态
        }
    }

    cancel() {
        this.setState({
            inputTxt: '',
            isDisabled: false,
            isChangeSearchBtnTxt: false,
        });
        this.textInput && this.textInput.blur();
        //this.props.onPressCancel();
    }

}
const styleSearchMatterBar = StyleSheet.create({
    header: {
        width: deviceWidth,
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: px(20),
        ...Platform.select({
            ios: {
                paddingTop: px(60),
                height: px(140)
            },
            android: {
                paddingTop: px(20),
                height: px(100)
            }
        })
    },
    back: {
        marginLeft: px(10)
    },
    backIcon: {
        width: px(44),
        height: px(44)
    },
    headerSearchBar: {
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(10),
        marginRight: px(10),
        alignItems: "center",
        //borderRadius: px(30)
    },
    headerSearchImg: {
        marginLeft: px(15)
    },
    headerSearchInput: {
        width: px(500),
        //flex: 1,
        color: "#252426",
        fontSize: px(28),
        height: px(64),
        padding: 0
    },
    headerSearchCancel: {
        color: "#858385",
        fontSize: px(28),
        //textAlign: "center",
        //marginLeft: px(10)
        //flex: 1,
    },
    icon: {
        width: 20,
        height: 20
    },
});
