/**
 * 素材列表，分为店铺素材列表type=1，商品精选素材列表type=0，区分type，goods
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Easing, Text, View, StyleSheet,
    NativeModules, TouchableOpacity,
    TouchableWithoutFeedback, TextInput,
    FlatList, Platform, Animated,
    Clipboard, NetInfo
} from 'react-native'
import { px, isIphoneX, deviceWidth, deviceHeight } from '../../../utils/Ratio';
import base from '../../../styles/Base';
import Icon from '../../../UI/lib/Icon'
import request, { domain } from '../../../services/Request';
import { show as toast } from '../../../widgets/Toast';
import Loading from '../../../animation/Loading';
import TabView from 'react-native-scrollable-tab-view2';
import Event from '../../../services/Event';
import Popover from '../Popover';
import { DialogModal } from '../ModalView';
import {  isWXAppInstalled } from '../../../services/WeChat';
import { getShopDetail } from '../../../services/Api';
import { touchBaseUrl } from "../../../services/Request";
import { LoadingRequest } from '../../../widgets/Loading';
import {ZoomImgModal} from '../ModalView';
import {ShareModal} from './Extra';
import {SelectPicker} from './Extra';
import {MatterItem} from './MatterItem';
import { Header } from '../Header';
const AppModule = NativeModules.AppModule;
const os = Platform.OS == "ios" ? true : false;
const WeChat = NativeModules.WeChat;

exports.MatterTab = class MatterTab extends React.Component {
    constructor(props) {
        super(props);
        let tab = [], type = '';
        if (props.type != undefined) {
            type = props.type;
            if (type == 0) { // 商品素材
                tab = [{txt: '精选素材', show: true}, {txt: '我的素材', show: false}]
            } else { // 我的素材
                tab = [{txt: '我收藏的素材', show: true}, {txt: '我发布的素材', show: false}]
            }
        }
        this.state = {
            active: 0,
            tab: tab,
            type: type,
            isWhiteListUser: -1,
            requestStatus: false,
            isPopover: false,
            buttonRect: {},
            net: 'WIFI',
            opacity: new Animated.Value(1),
            opacityToTop: new Animated.Value(0),
            isCanUp: false,
            noSelectedFlag: []
        };
        this.showPopover = this.showPopover.bind(this)
        this.lookBigImg = this.lookBigImg.bind(this)
        this.enterFull = this.enterFull.bind(this)
        this.share = this.share.bind(this)
        this.save = this.save.bind(this)

    }

    

    pages = []

    setList(index, listType, from) {
        let isWhiteListUser = this.state.isWhiteListUser;
        return <List
            share={this.share}
            lookBigImg={this.lookBigImg}//查看大图
            enterFull={this.enterFull}//查看视频
            showPopover={this.showPopover}//长按复制文本
            save={this.save}//保存素材
            isWhiteListUser={isWhiteListUser}
            goPublish_={this.goPublish.bind(this)}
            ref={e => this.pages[index] = e}
            //setEmptyTxt={this.setEmptyTxt.bind(this)}
            setScroll={this.setScroll.bind(this)}
            listType={listType}
            goods={from == 'my' ? null : this.props.goods}
            navigation={from == 'my' ? this.props.navigation : null}
            opacity={this.state.opacity}
        />
    }

    renderList(active, isWhiteListUser, type) {
        if (isWhiteListUser == -1) return null;
        //let firstList = type == 0 ? <List switchLoading={this.switchLoading.bind(this)} listType="selected" goods={this.props.goods}/> : <List switchLoading={this.switchLoading.bind(this)} listType="collect" goods={this.props.goods}/>
        if (isWhiteListUser == 1) {
            return <TabView
                page={active}
                initialPage={0} locked
                //onChangeTab={(i) => this.change(i)}
                renderTabBar={false}>

                {
                    type == 0 ? this.setList(0, 'selected', 'good')
                        /*<List
                            ref={e => this.pages[0] = e}
                            setEmptyTxt={this.setEmptyTxt.bind(this)}
                            setScroll={this.setScroll.bind(this)}
                            listType="selected"
                            goods={this.props.goods}/>*/
                        :
                        this.setList(0, 'collect', 'my')
                        /*<List
                            ref={e => this.pages[0] = e}
                            setEmptyTxt={this.setEmptyTxt.bind(this)}
                            setScroll={this.setScroll.bind(this)}
                            navigation={this.props.navigation}
                            listType="collect"/>*/
                }
                {
                    type == 0 ?
                        this.setList(1, 'myNeedGood', 'good')
                        /*<List
                            goods={this.props.goods}
                            setEmptyTxt={this.setEmptyTxt.bind(this)}
                            ref={e => this.pages[1] = e}
                            setScroll={this.setScroll.bind(this)}
                            navigation={this.props.navigation} listType="myNeedGood"/>*/
                        :
                        this.setList(1, 'my', 'my')
                        /*<List
                            goods={this.props.goods}
                            setEmptyTxt={this.setEmptyTxt.bind(this)}
                            ref={e => this.pages[1] = e}
                            setScroll={this.setScroll.bind(this)}
                            navigation={this.props.navigation}
                            listType="my"/>*/
                }


            </TabView>
        } else {
            return <View style={{flex: 1}}>
                {type == 0 ?
                    this.setList(0, 'selected', 'good')
                    /*<List
                        ref={e => this.pages[0] = e}
                        setEmptyTxt={this.setEmptyTxt.bind(this)}
                        setScroll={this.setScroll.bind(this)}
                        listType="selected"
                        goods={this.props.goods}/>*/
                    :
                    this.setList(0, 'collect', 'my')
                    /*<List
                        ref={e => this.pages[0] = e}
                        setEmptyTxt={this.setEmptyTxt.bind(this)}
                        setScroll={this.setScroll.bind(this)}
                        navigation={this.props.navigation}
                        listType="collect"/>*/
                }
            </View>
            //return firstList
        }
    }

    render() {
        const {tab, active, isWhiteListUser, type, noSelectedFlag} = this.state;
        if (isWhiteListUser == -1 || tab.length == 0) return null;
        return <View style={{flex: 1}}>
            {
                type == 0 && <Header></Header>
            }
            {
                isWhiteListUser == 1 &&
                <View style={[styles.box, base.line]}>
                    <View style={[styles.tab, base.inline_between]}>
                        {
                            tab.map((i, index) =>
                                <TouchableWithoutFeedback key={index} onPress={() => this.change(index)}>
                                    <View style={[styles.item, {backgroundColor: active == index ? '#858385' : '#fff'}]}>
                                        <Text style={[styles.txt, {color: active == index ? '#fff' : '#858385'}]} allowFontScaling={false}>{i.txt}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
                    </View>
                </View>
            }
            {/*{
                isWhiteListUser ?
                    <TabView
                        page={active}
                        initialPage={0} locked
                        //onChangeTab={(i) => this.change(i)}
                        renderTabBar={false}>
                        {
                            this.renderList(active, isWhiteListUser, type)
                        }

                        <List  listType="my" goods={this.props.goods}/>
                    </TabView> :
                    this.renderList(isWhiteListUser, type)
            }*/}
            {this.renderList(active, isWhiteListUser, type)}
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
            <DialogModal
                ref='dialog'
                bodyStyle={matterStyles.alertBody}
            />
            <ShareModal
                check={this.check.bind(this)}
                ref="shareModal"
                successCall={() => {}}
            />
            <Loading ref='loading' />
            <ZoomImgModal ref="zoomImgModal"/>
            <SelectPicker
                ref="selectPicker"
                goods={this.props.goods}
                navigation={this.props.navigation}
                refresh={this.refresh.bind(this)}
                //select={this.select.bind(this)}
            />
            {/*{
                isWhiteListUser == 1 && noSelectedFlag.length != 0 && noSelectedFlag.indexOf(active) > -1 ?
                    <View style={[base.line, styles.emptyPulisher, {
                        bottom: isIphoneX() ? px(186) : px(126)
                    }]}>
                        <Text style={styles.emptyPulisherTxt} allowFontScaling={false}>点击这个，晒出你的心得吧～</Text>
                        <Icon name='icon-publishUp' style={styles.emptyPublishIcon}/>
                    </View> : null
            }
            {
                isWhiteListUser == 1 &&
                <TouchableWithoutFeedback onPress={() => this.goPublish()}>
                    <Animated.View style={[matterStyles.publish, base.inline, {
                        opacity: this.state.opacity,
                        bottom: isIphoneX() ? px(90) : px(30)
                    }]}>
                        <Icon
                            name='camrea'
                            style={matterStyles.publishIcon}
                        />
                        <Text style={matterStyles.publishTxt} allowFontScaling={false}>发布素材</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
            }*/}
            {
                this.state.scrollTop &&
                <TouchableWithoutFeedback onPress={() => {
                    this.toTop()
                }}>
                    <Animated.View style={[{ position: 'absolute', right: px(20),
                        bottom: isIphoneX() ? px(165) : px(105),
                        opacity: this.state.opacityToTop
                    }]}>
                        <Icon
                            name="icon-toTop"
                            style={{ width: px(100), height: px(100) }}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>
            }
        </View>
    }


    scrollTop = 0;
    switchScroll = false;
    switchShow = false;
    setScroll(top) {
        if (this.scrollTop > 1000) {
            this.state.opacityToTop.stopAnimation();
            Animated.timing(this.state.opacityToTop, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear
            }).start()
            if (!this.switchShow) {
                this.setState({
                    scrollTop: true
                })
                this.switchShow = true;
            }
            // if (!this.switchShow) {
            //     this.state.opacityToTop.stopAnimation();
            //     Animated.timing(this.state.opacityToTop, {
            //         toValue: 1,
            //         duration: 500,
            //         easing: Easing.linear
            //     }).start()
            //     this.switchShow = true;
            //     return;
            // }
        } else {
            if (this.switchShow) {
                this.setState({
                    scrollTop: false
                })
                this.switchShow = false;
            }
        }


        if (this.scrollTop >= top + 1) {
            //xia  opacityToTop
            this.state.opacity.stopAnimation();
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 200,
                easing: Easing.linear
            }).start()

            if (!this.switchScroll) {
                /*this.setState({
                    isCanUp: true
                })*/
                
                this.state.opacityToTop.stopAnimation();
                Animated.timing(this.state.opacityToTop, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.linear
                }).start()
                this.switchScroll = true;
                return;
            }
            
        } else {
            if (top > 0) { //没有超出边界时才隐藏按钮
                this.state.opacity.stopAnimation();
                Animated.timing(this.state.opacity, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.linear
                }).start()
            }
            
            //shang
            if (this.switchScroll) {
                /*this.setState({
                    isCanUp: false
                })*/
                
                this.state.opacityToTop.stopAnimation();
                Animated.timing(this.state.opacityToTop, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear
                }).start()
                
                this.switchScroll = false;
                return;
            }
            
        }
        this.scrollTop = top;
    }

    toTop() {
        this.pages[this.state.active].scrollToTop(0)
    }

    change(index) {
        let active = this.state.active, tab = this.state.tab;
        if (index == active) return;
        if (this.needRefresh == true && index == 1) {
            this.pages[index] && this.pages[index].refresh();
            this.needRefresh = false;
        }
        tab.filter((v, v_index) => v_index !== index)[0].show = false;
        tab[index].show = true;
        this.setState({
            active: index,
            tab
        });
    }

    checkUser() {
        let res = false;
        try {
            res = request.post('/xczin/front/subject/SelectedIsHave.do');
            return res;
        } catch (e) {
            toast(e.message);
            return false;
        }
    }

    _handleConnectionInfoChange = (connectionInfo) => {
        const net  = connectionInfo.type.toLocaleUpperCase()
        this.setState({
            net:net,
        });
    }

    async componentDidMount() {

        let isWhiteListUser = await this.checkUser();
        this.setState({
            isWhiteListUser: isWhiteListUser * 1
        })
        NativeModules.AppModule.getAppNetType && NativeModules.AppModule.getAppNetType((err, net) => {
            this.setState({
                net: net
            })
        });

        
        NetInfo.addEventListener(
            'connectionChange',
            this._handleConnectionInfoChange
        );
        
        
    }

    async componentWillMount() {
        this.isInstalled = await isWXAppInstalled();
    }

    async componentWillUnmount() {
        NetInfo.removeEventListener(
            'connectionChange',
            this._handleConnectionInfoChange
        );
    }

    /**
     * 精选素材为空设置文案
     */
    /*setEmptyTxt(active, listType) {
        let noSelectedFlag = this.state.noSelectedFlag;
        noSelectedFlag.push(active);
        this.setState({
            noSelectedFlag
        })
    }*/
    /**
     *发布素材
     */

    goPublish() {

        if (this.state.opacity._value > 0){
            this.refs.loading.open();
            this.refs.selectPicker && this.refs.selectPicker.open();
            this.refs.loading.close();
        }
    }

    /**
     *发布素材返回回调： 如果当前是tab1，切换刷新，如果是tab2，直接刷新
     */

    needRefresh = false;
    refresh() {
        if (this.state.active == 1) {
            this.pages[this.state.active].refresh();
        } else {
            this.needRefresh = true;
        }
    }

    /**
     *长按复制文字
     */

    showPopover(copyTxt, re) {
        re.measure((ox, oy, width, height, px, py) => {
            this.setState({
                copyTxt: copyTxt,
                isPopover: true,
                buttonRect: { x: px, y: py, width: width, height: height }
            });
        });

    }

    /**
     *查看大图
     */
    lookBigImg(index, list) {
        this.refs.zoomImgModal && this.refs.zoomImgModal.open(index, list);
    }

    /**
     *播放视频
     */
    enterFull(sub) {
        let src = sub.subject_video_url_http,
            size = sub.subject_video_size;
        if (this.state.net != 'WIFI') {
            const tips = size ? `当前为移动网络，播放将消耗流量${size}` : '当前为移动网络，播放将消耗流量'
            this.refs.dialog.open({
                content: [tips],
                btns: [{
                    txt: '放弃播放',
                    click: () => { }
                }, {
                    txt: '继续播放',
                    click: async () => {
                        if (src){
                            this.props.navigation.navigate('PlayVideoPage', {src})
                        } else {
                            toast('视频地址不合法')
                        }
                    }
                }]
            });
            return;
        }
        if (src){
            this.props.navigation.navigate('PlayVideoPage', {src})
        } else {
            toast('视频地址不合法')
        }
    }

    /**
     *保存图文
     */
    async save(type, item) {
        let image = item.subjectContent[0].img_list, txt = item.subjectContent[0].content
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
        let obj = item.subjectContent[0].img_list[0];
        //分为从商品列表传过来和店铺列表关联的goods
        let goods = item.goodList.sku ? item.goodList : this.props.goods;
        let goodsName = goods.goodsName.replace(/\//g, '') || '',
            video = obj.subject_video_url_http,
            currentTime = new Date().getTime(),
            content = item.subjectContent[0].content;
        let videoFileName = `${goodsName}${currentTime}.mp4`
        this.setState({
            requestStatus: true
        }, () => {
            try {
                AppModule.saveVideoToAlbum(video, videoFileName).then((res) => {
                    if (res) {
                        Clipboard.setString(content);
                        toast('保存并复制完成');
                    }
                    this.setState({
                        requestStatus: false
                    });
                }).catch((res) => {
                    toast('视频下载失败，可能是您的网络不稳定，请稍候重试')
                    this.setState({
                        requestStatus: false
                    });
                });
            } catch (e) {
                toast('视频下载失败，可能是您的网络不稳定，请稍候重试');
                this.setState({
                    requestStatus: false
                });
            } finally {
                
            }
        })
    }



    /*一键分享*/

    async check(content, goods) {
        if (!goods) return;
        const shop = await getShopDetail();
        let inviteCode = shop.inviteCode, url = '';
        if (goods.id) {
            url = `${touchBaseUrl}/goods-detail?id=${goods.id}&inviteCode=${inviteCode}`;
        } else {
            url = `${touchBaseUrl}/goods-detail?sku=${goods.sku}&inviteCode=${inviteCode}`;
        }
        if (!/inviteCode/.test(url)) {
            url += "&inviteCode=" + shop.inviteCode;
        }
        let txt = content + ' ' + url
        Clipboard.setString(txt);
        toast('文字和链接已复制到剪切板，请直接粘贴分享')
        this.statistical()
    }

    statistical () {
        if (!this.goods.subjectId) return

        request.get(`/xczin/front/subjectRecommend/recommendSubjectCounter.do?id=${this.goods.subjectId}`)
        request.get('/xczin/front/subjectRecommend/hotSubjectCounter.do')
    }

    goods = {}

    /**
     *安卓多图分享，视频分享，ios视频分享弹层，ios多图分享直接吊起原生分享
     */
    async share(obj) {
        let goods = obj.goodList.sku ? obj.goodList : this.props.goods;

        // 保存分享数据
        this.goods = obj

        if (!obj || !obj.subjectContent[0] || !obj.subjectContent[0].img_list || obj.subjectContent[0].img_list.length == 0) {
            return;
        }
        if (os && obj.contentType == 1) { //ios分享图片
            if (!this.isInstalled) {
                toast('没有安装微信');
                return;
            }
            await this.check(obj.subjectContent[0].content, goods)
            this.refs.loading.open()
            let images = []
            obj.subjectContent[0].img_list.forEach(item => {
                images.push(item.subject_img_url_http)
            })
            WeChat.shareImagesToSession({
                description: 'shareMatter',
                images: images.join('|')
            }).then((res) => {
                // this.statistical()
                this.refs.loading.close()
            }).catch((res) => {
                this.refs.loading.close()
                toast('出错了，请稍后再试')
            })
        } else {
            this.refs.shareModal && this.refs.shareModal.share(obj, goods)
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
    publish: {
        width: px(260),
        height: px(70),
        backgroundColor: '#d0648f',
        borderRadius: px(35),
        overflow: 'hidden',
        position: 'absolute',
        left: 0, right: 0, marginHorizontal: px(245),
        bottom: px(30)
    },
    publishIcon: {
        width: px(31),
        height: px(30),
        marginRight: px(12)
    },
    publishTxt: {
        fontSize: px(32),
        color: '#fff'
    }
})
const styles = StyleSheet.create({
    box: {
        width: deviceWidth,
        height: px(98),
        backgroundColor: '#fff',
        //marginBottom: px(20)
    },
    tab: {
        width: px(467),
        height: px(58),
        borderColor: '#858385',
        borderWidth: px(1),
        borderRadius: px(8),
        overflow: 'hidden'
    },
    item: {
        flex: 1,
        //width: px(233),
        height: px(58),
        justifyContent: 'center',
        alignItems: 'center'
    },
    txt: {
        fontSize: px(26)
    },
    emptyPulisher: {
        position: 'absolute',
        left: 0,
        right: 0
    },
    emptyPulisherTxt: {
        color: '#999',
        fontSize: px(28),
        marginBottom: px(15)
    },
    emptyPublishIcon: {
        width: px(24),
        height: px(18)
    },
    emptyTxt: {
        color: '#999',
        fontSize: px(28),
        marginTop: px(90)
    }
})

class List extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            loadText: "",
            list: [],
            emptyTxt: ''
        }
        this.timer = null;
        this.layoutArr = [];
        this.loading = false;
        this.hasNext = true;
        this.start = 1;
        this.itemHeight = px(500);
        this.api = [
            '/xczin/front/collet/listSubject.do',
            '/xczin/front/collet/mySucaiList.do',
            '/xczin/front/collet/selectedSubjectList.do',
        ];
        this.collect = this.collect.bind(this)
        this.deleteFn = this.deleteFn.bind(this)
    }

    componentDidMount() {
        this.refresh();
        //Event.on('matter.collect', this.collect)
        //Event.on('matter.deleteFn', this.deleteFn)
    }

    render() {
        const { isWhiteListUser } = this.props;
        return <View style={{flex: 1}}>
            <FlatList
                ref="flatlist"
                onScroll={(e) => this._onScroll(e.nativeEvent)}
                refreshing={this.state.refreshing}
                numColumns={1}
                style={{flex: 1, backgroundColor: this.state.list.length > 0 ? '#fbfafc' : '#fff'}}
                onRefresh={() => this.refresh()}
                onEndReached={() => this.loadNext()}
                renderItem={({ item, index }) => {
                    return <MatterItem
                        shouldUpdate={this.shouldUpdate}
                        navigation={this.props.navigation}
                        item={item}
                        index={index}
                        show={item.show}
                        share={this.props.share}//分享
                        lookBigImg={this.props.lookBigImg}//查看大图
                        enterFull={this.props.enterFull}//查看视频
                        showPopover={this.props.showPopover}//长按复制文本
                        save={this.props.save}//保存素材
                        listType={this.props.listType}
                        setLay={e => this.setLay(e, index)}
                        deleteFn={this.deleteFn.bind(this)}
                        collect={this.collect.bind(this)}
                    />
                }}
                ListEmptyComponent={!this.hasNext && <View style={[{backgroundColor: '#fff', paddingTop: px(168), alignItems: 'center'}]}>
                    <Icon name="matterEmpty" style={{width: px(750), height: px(335)}}/>
                    <Text allowFontScaling={false} style={styles.emptyTxt}>{this.state.emptyTxt}</Text>
                </View>}
                ListFooterComponent={<View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", marginBottom: isIphoneX() ? px(220) : px(160) }}>
                    {(this.state.list || []).length > 1 && <Text style={{
                        textAlign: 'center',
                        fontSize: px(28),
                        marginLeft: px(30),
                        marginRight: px(30),
                        color: "#ccc"
                    }}>别扯了，到底啦</Text>}
                </View>}
                keyExtractor={(item, index) => index + ''}
                data={this.state.list}
                initialNumToRender={3} />
            {
                isWhiteListUser == 1 && this.state.list.length == 0 ?
                    <View style={[base.line, styles.emptyPulisher, {
                        bottom: isIphoneX() ? px(186) : px(126)
                    }]}>
                        <Text style={styles.emptyPulisherTxt} allowFontScaling={false}>点击这个，晒出你的心得吧～</Text>
                        <Icon name='icon-publishUp' style={styles.emptyPublishIcon}/>
                    </View> : null
            }
            {
                isWhiteListUser == 1 &&
                <TouchableWithoutFeedback onPress={() => this.props.goPublish_()}>
                    <Animated.View style={[matterStyles.publish, base.inline, {
                        opacity: this.props.opacity,
                        bottom: isIphoneX() ? px(90) : px(30)
                    }]}>
                        <Icon
                            name='camrea'
                            style={matterStyles.publishIcon}
                        />
                        <Text style={matterStyles.publishTxt} allowFontScaling={false}>发布素材</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
            }
            <Loading ref='load' />
            <DialogModal
                ref='dialogModal_'
                bodyStyle={matterStyles.alertBody}
            />
        </View>
    }

    loading = false;
    start = 1;
    hasNext = true;
    async refresh() {
        if (this.loading) return;
        this.hasNext = true;
        this.start = 1;
        this.refs.load.open();
        let list = await this.getList();
        this.setState({
            list: list
        });
    }

    async getList() {
        if (!this.hasNext || this.loading) {
            return [];
        }
        this.loading = true;
        let res = '', listType = this.props.listType, goods = this.props.goods;
        try {
            if (listType == 'collect') {
                res = await request.get(`${this.api[0]}?page_no=${this.start}`);
                this.setState({
                    emptyTxt: '当前没有收藏的素材哦～'
                })
            } else if (listType == 'my') {
                res = await request.get(`${this.api[1]}?page_no=${this.start}`);
                this.setState({
                    emptyTxt: '您还没有上传过素材哦～'
                })
            } else if (listType == 'selected') {
                res = await request.get(`${this.api[2]}?page_no=${this.start}&sku=${goods.sku}`);
                this.setState({
                    emptyTxt: '这个宝贝还没有素材哦～'
                })
            } else if (listType == 'myNeedGood') {
                res = await request.get(`${this.api[1]}?page_no=${this.start}&sku=${goods.sku}`);
                this.setState({
                    emptyTxt: '您还没有上传过这个宝贝的素材哦～'
                })
            }
            this.shouldUpdate = true;
            //let res = await Request.get(`http://a.zin.beta.daling.com/xczin/front/subject/list-by-good.do?good_id=290938&page_no=${this.start}&page_size=20`);
            this.start = this.start + 1;
            this.hasNext = res.hasNext;
            //this.showImage(0)
            this.refs.load.close();
            this.showImage(0)
            return res.items || [];
        } catch (e) {
            this.refs.load.close();
            toast(e.message);
            return [];
        } finally {
            this.loading = false;
        }
    }
    itemHeight = px(500)
    async loadNext() {
        let list = await this.getList();
        let h = this.itemHeight
        this.layoutArr.push({ h });
        this.setState({
            list: this.state.list.concat(list)
        });
    }

    setLay(e, index) {
        this.layoutArr[index] = e.layout.height
    }
    showImage(index) {
        if (this.timer) return;
        this.timer = setTimeout(() => {
            let list = this.state.list.filter((item, i) => {
                item.show = i >= index - 2 && i < index + 3
                return item;
            })
            this.setState({ list })
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 200);
    }

    scrollToTop(offset) {
        setTimeout(() => {
            this.refs.flatlist.scrollToOffset({
                offset,
            });
        }, 100);
    }
    _onScroll(e) {
        const y = e.contentOffset.y;
        this.props.setScroll && this.props.setScroll(y)
        //return ;
        let index = 0;
        let curr = 0;
        while (y > curr) {
            if (!this.layoutArr[index]) break;
            curr += this.layoutArr[index];
            index++;
        }
        this.showImage(index);
    }

    isCollect = false;

    /**
     *收藏/取消收藏
     */
    async collect(item, type) {
        if (this.isCollect) return;
        this.isCollect = true;
        if (type == 0 && this.props.listType == 'collect') {
            this.refs.dialogModal_.open({
                content: [`确定取消收藏吗`],
                btns: [{
                    txt: '先留着',
                    click: () => {
                        this.isCollect = false;
                    }
                }, {
                    txt: '确定取消',
                    click: async () => {
                        this.toCollect(item, type);
                    }
                }]
            });
            return;
        } else {
            this.toCollect(item, type);
        }
        //this.isCollect = false;
    }

    shouldUpdate = false;
    async toCollect(item, type) {
        this.isCollect = false;
        try {
            let res = await request.post('/xczin/front/collet/saveOrUpdateSubject.do', {
                subjectId: item.subjectId,
                type: type
            })
            this.shouldUpdate = true;
            if (this.props.listType == 'collect') { //收藏素材列表，操作一定是取消收藏，并从列表删除
                this.deleteList(item);
                this.shouldUpdate = true;
                this.props.listType == 'collect' && toast('取消成功~');
                return;
            }
            this.state.list.forEach((i, index) => {
                if (i.subjectId == item.subjectId) {
                    i.isCollet = type;
                    return;
                }
            });
            this.setState({
                list: this.state.list
            });
            if (type == 1) {
                toast('收藏成功~');
            } else if (type == 0) {
                toast('取消成功~');
            }
            this.shouldUpdate = false
        } catch (e) {
            toast(e.message);
            if (e.message == "该素材已不存在") { //素材已被作者删除
                this.deleteList(item);
                this.shouldUpdate = true;
                return;
            }
        }
    }

    deleteFn(item) {
        this.refs.dialogModal_.open({
            content: [`确定删除该素材吗`],
            btns: [{
                txt: '取消',
                click: () => {
                }
            }, {
                txt: '确定',
                click: async () => {
                    this.postDelete(item);
                }
            }]
        });
    }

    async postDelete(item) {
        try {
            this.deleteList(item);
            let res = await request.post('/xczin/front/collet/deleteBySubId.do', {
                id: item.subjectId
            })
            toast('删除成功~');

        } catch (e) {
            toast(e.message);
        }
    }

    deleteList(item) {
        let list = this.state.list,
            index = list.indexOf(item);
        this.shouldUpdate = true;
        list.splice(index, 1)
        this.setState({
            list
        }, () => {
            this.shouldUpdate = false;
        })
    }


    componentWillUnmount() {
        //Event.off('matter.collect', this.collect)
        //Event.off('matter.deleteFn', this.deleteFn)
    }
}
