'use strict';

import React from 'react';

import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    Platform,
    Animated,
    FlatList,
    Dimensions,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ImageBackground,
    PixelRatio,
    DeviceEventEmitter
} from 'react-native';

import Page from '../../UI/Page'
import Tabs, { TabBar } from '../common/Tabs'
import base from '../../styles/Base'
import { setConstant, getConstant } from '../../services/Constant';
import { setSpText } from '../../utils/AdaptationSize'
import { px, isIphoneX, deviceWidth, deviceHeight } from "../../utils/Ratio"
import util_cools from '../../utils/tools'
import levelup from '../../services/LevelUp'
import { SearchHeader } from '../common/Header'
import { DialogModal, GGModal } from '../common/ModalView'
import { show as toast } from '../../widgets/Toast'
import { TimeAxis } from './TimeAxis'
import TabContainer from '../../UI/StaticContainer'
import { log, logWarm, logErr } from '../../utils/logs'
import TabView from 'react-native-scrollable-tab-view2'
import ShareView, { SHARETYPE } from "../common/ShareView";
import { getShopDetail, User } from '../../services/Api';
import request, { baseUrl, touchBaseUrl } from '../../services/Request';
import { setNavigation } from '../../utils/NavigationHolder'
import { observer } from "mobx-react";
import Event from '../../services/Event'
import { LoadView } from '../../animation/Loading'
import { TrackClick, TrackPage } from '../../services/Track';
import { LoadImage } from '../common/ImageView';
// import TabTxis from './TimeAxisTab'
import ToTop from '../common/ToTop'
import Icon from '../../UI/lib/Icon'
import Background from '../../UI/lib/Background'
import ShopList from "./ShopList"
import GreatList from "./GreatList"
import NewTimeAxisHeader from './NewTimeAxisHeader'
import ShopHome from "./ShopHome"
import { getUnReadMsg, push_destroy, push_init } from "../../services/Push";
import mDate from "../../utils/Date"

const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class extends React.Component {
    currentSize = 0;
    height = 0;
    constructor(props) {
        super(props);
        this.state = {
            scrollTop: new Animated.Value(0),
            tabs: [],
            tabs2: [],
            activeTab: 0,
            pageLeft: 0,
            shop: {},
            tabState: false,
            loading: true,
            showIcon: false,
            showTimeAxis: false,
            opacityTop: new Animated.Value(0),
            timeAxisShareInfo: {},
            updated: false,
            lockSwip: Platform.OS !== "ios",
        }
        this.recordChannelTime = Date.now();
        this.layout = [];
        this.onChangeFull = this.onChangeFull.bind(this);
    }
    render() {
        if (this.state.loading) return <View style={base.flex_middle}><LoadView /></View>
        return <View style={{ flex: 1 }}>
            <View style={styles.pageView}>
                <TabView page={this.state.activeTab}
                    prerenderingSiblingsNumber={3}
                    android={false}
                    locked={this.state.lockSwip}
                    initialPage={0}
                    onChangeTab={(i) => this.ChangeTab(i)}
                    renderTabBar={false}>
                    {this.state.tabs2.map((item, index) => index === 0 ? <ShopHome
                        ref={e => this.pages[index] = e}
                        key={index} id={item.id} tabLabel={item.id + ""}
                        name={item.name}
                        shop={this.state.shop}
                        show={item.show}
                        loadlist={() => this.loadcategorys()}
                        onChangeF={(e) => this.goToPage2(e)}
                        navigation={this.props.navigation}
                        onScroll={this.onScroll.bind(this)}
                        switchTimeAxis={this.switchTimeAxis.bind(this)}
                        onScrollOther={this.onScrollOther.bind(this)}
                    /> : item.id === 1011 ? <GreatList
                        ref={e => this.pages[index] = e}
                        key={index} id={item.id} tabLabel={item.id + ""}
                        name={item.name}
                        shop={this.state.shop}
                        show={item.show}
                        switchLock={this.switchLock.bind(this)}
                        loadlist={() => this.loadcategorys()}
                        onChangeF={(e) => this.goToPage2(e)}
                        navigation={this.props.navigation}
                        onScroll={e => this.onScroll(e)}
                        onScrollOther={this.onScrollOther.bind(this)}
                    /> : <ShopList ref={e => this.pages[index] = e}
                        key={index} id={item.id} tabLabel={item.id + ""}
                        name={item.name}
                        shop={this.state.shop}
                        show={item.show}
                        loadlist={() => this.loadcategorys()}
                        onChangeF={(e) => this.goToPage2(e)}
                        navigation={this.props.navigation}
                        onScroll={e => this.onScroll(e)}
                        onScrollOther={this.onScrollOther.bind(this)}
                    />)}
                </TabView>
            </View>
            <DialogModal ref="dialog" />
            <GGModal ref="ggmodal" click={(a) => this.clickPop(a)} />
            <ShareView
                ref='shareField'
                navigation={this.props.navigation}
                getQrCode={() => this.getQrCode_()}
                getQrCode2={() => this.getQrCode_2()}
                QRCodeType={util_cools.isNewAndroid() ? "old" : "timeline"}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.PIC]}>
                <View style={[base.inline, styles.field]}>
                    <Text style={styles.fieldTxt} allowFontScaling={false}>
                        分享
                    </Text>
                    <Text style={styles.fieldTxt1} allowFontScaling={false}>
                        {this.state.timeAxisShareInfo && this.state.timeAxisShareInfo.title_1}
                    </Text>
                    <Text style={styles.fieldTxt} allowFontScaling={false}>
                        场
                    </Text>
                </View>
            </ShareView>
            <View style={[styles.headerView]}>
                <Animated.View style={[{
                    backgroundColor: this.state.activeTab == 0 ? this.state.scrollTop._value >= 0.5 ? 'rgba(255,255,255,1)' : "rgba(255,255,255,0)" : "#fff"
                }]} renderToHardwareTextureAndroid>
                    <SearchHeader
                        onLayout={e => this.setLayout(e, 0)} scrollTop={this.state.scrollTop}
                        navigation={this.props.navigation}
                        tabState={this.state.tabState}
                    />
                    <Tabs ref="tabs" onLayout={e => this.setLayout(e, 1)}
                        tabState={this.state.tabState}
                        scrollTop={this.state.scrollTop} tabs={this.state.tabs}
                        goToPage={(e) => this.goToPage(e)} />
                </Animated.View>
                {
                    this.state.showTimeAxis ? <View style={{ height: px(180) - 40 }}></View> : null
                }
                <NewTimeAxisHeader shareEvent={(tab) => this.shareField(tab)} show={this.state.showTimeAxis} />
            </View>
            <ToTop ref='toTop'
                go={this.toTop.bind(this)}
                height={this.state.showIcon ? px(70) : px(0)}
                height1={this.state.showIcon ? px(100) : px(0)}
                opacity={this.state.opacityTop}
            />
        </View>
    }

    onChangeFull(isf) {
        if (this.state.activeTab == 0) {
            this.setState({ tabState: !!isf })
        }
    }
    async getQrCode_() {
        let ids = (this.state.timeAxisShareInfo.ids || "").split(",")
        ids.join("&ids=")
        let res1 = await request.get(`/timeline/share.do?ids=${ids}&type=1`)
        return {
            share_img: res1.smallImg,
            down_img: res1.bigImg,
        }
    }

    async getQrCode_2() {
        let time = this.state.timeAxisShareInfo.title_1;
        let now = new Date();
        if (this.state.timeAxisShareInfo.type === "today") {
            time = `${mDate.getTodayDate("MM月dd日")} ${time}`
        }
        if (this.state.timeAxisShareInfo.type === "tomorrow") {
            time = mDate.getTomorrowDate("MM月dd日")
        }
        if (this.state.timeAxisShareInfo.type === "yesterday_time") {
            time = `${mDate.getYesterdayDate("MM月dd日")} ${time}`
        }
        if (this.state.timeAxisShareInfo.type === "yesterday") {
            time = mDate.getYesterdayDate("MM月dd日")
        }
        return {
            ids: this.state.timeAxisShareInfo.ids,
            list: [],
            time
        }
    }

    shareField(tabInfo) { //分享场次、
        if (!User.isLogin) {
            this.props.navigation.navigate('LoginPage', {});
            return;
        }

        let idParam = "", name = "", desc = '', title = '';
        if (tabInfo) {
            this.setState({
                timeAxisShareInfo: tabInfo
            })
            let ids = (tabInfo.ids || "").split(",")
            idParam = ids.join("_");
            name = tabInfo.title_1;

            if (tabInfo.type == "today" || tabInfo.type == "yesterday" || tabInfo.type == "yesterday_time") {
                desc = '甄选好物底价出击，每天限时疯抢，快来参与'
                title = `${name}场正在火爆抢购中`
            } else {
                desc = '天青色等烟雨，好价在等你'
                title = `${name}场即将开售，赶快提前进场看看吧`
            }
            this.refs.shareField.Share({
                title: title,
                desc: desc,
                img: 'http://img.daling.com/st/dalingjia/shareTimeAxis.jpg',
                url: `${touchBaseUrl}/?ids=${idParam}`,
                link: `${touchBaseUrl}/?ids=${idParam}`,
                track: (type) => {
                    TrackClick('Home-TimeAxis', `ShareHour-${name}`, '首页', `${name}-分享-${type}`);
                }
            });
        }
    }

    didFocus = null

    pushTimer = null

    async componentDidMount() {
        if (User.isLogin) {
            this.didFocus = this.props.navigation.addListener(
                'didFocus',
                async payload => {
                    let un = await getUnReadMsg(); // 获取未读消息
                    if (this.state.loading) {
                        if (this.pushTimer) {
                            clearInterval(this.pushTimer)
                        }
                        this.pushTimer = setInterval(() => {
                            let success = Event.emit("top.msg.updated", un)
                            if (success) {
                                clearInterval(this.pushTimer)
                            }
                        }, 100)
                    } else {
                        Event.emit("top.msg.updated", un)
                    }
                }
            );
        }

        let tabs = [];
        try {
            tabs = await request.get('/goods/categorys.do');
            if (!tabs) tabs = [];
            tabs.unshift({
                id: 'dev', name: '今日特卖', isShowImg: "0", show: true
            })
        } catch (e) {
            toast(e.message);
        }
        let shop = await getShopDetail();
        let tabs2 = tabs.concat([]);
        this.setState({
            tabs, tabs2,
            shop: shop,
            loading: false
        });
        let obj = this;
        let timer = setTimeout(() => {
            if (User.isLogin) {
                request.get("/popupLayer/getPopupLayerV1.do").then(ggs => {
                    if (!ggs.popuplayer) return;
                    obj.popuplayer = ggs.popuplayer;
                    obj.refs.ggmodal.open(ggs.popuplayer);
                });
            }
            levelup.check(this.refs.dialog);
            if (timer) clearTimeout(timer);
        }, 1000);
        //注册重载界面方法
        this.reload = this.reload.bind(this);
        Event.on("app.back", this.reload);
        Event.on("change_color", this.onChangeFull);
        Event.on("top.tab.change", this.goToPage3)
        push_init();
    }
    isReload = false;
    /**
     * 重新载入
     */
    async reload() {
        this.pages.forEach(page => {
            page.reload();
        })
    }
    componentWillUnmount() {
        this.didFocus && this.didFocus.remove()
        Event.off("app.back", this.reload);
        Event.off("change_color", this.onChangeFull);
        Event.off("top.tab.change", this.goToPage3);
        push_destroy()
    }

    async loadcategorys() {
        let tabs = [];
        try {
            tabs = await request.get('/goods/categorys.do');
            if (!tabs) return;
            tabs.unshift({
                id: '', name: '发现', isShowImg: "0", show: true
            })
            let isUpdate = false;
            tabs.forEach((item, index) => {
                if (this.state.tabs[index].id != item.id) isUpdate = true;
            })

            if (isUpdate) {
                let tabs2 = tabs.concat([]);
                this.setState({
                    tabs, tabs2
                });
            }
        } catch (e) {
            toast(e.message);
        }

    }
    clickPop(item) {
        if (item.scopeType == 99 && !item.context) {
            this.props.navigation.navigate('VipGoods');
            return;
        }
        if (item.contextType == "sku") {
            this.props.navigation.navigate('DetailPage', {
                sku: item.context
            });
        }
        if (item.contextType == "url") {
            this.props.navigation.navigate('LookImagePage', {
                'title': "",
                'img': item.showImg,
                'shareImg': item.showImg
            });
        }
        if (item.contextType == "h5") {
            if (item.context.indexOf("/active/") > 0) {
                this.props.navigation.navigate('BrowerPage', {
                    webPath: item.context,
                    img: item.showImg
                });
            } else {
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: item.context,
                    img: item.showImg
                });
            }
        }
        if (item.contextType == "category") { //需要确定后台传的是id还是name
            this.goToPage3(item.context)
        }
    }
    ChangeTab(i) {
        this.trackChannel();
        this.refs.tabs.set(i.i)
        let tabs2 = this.state.tabs2.concat();
        if (tabs2[i.i].id != 1011) {
            this.switchLock(false);
        } else {
            this.switchLock(this.pages[i.i].lockSwip);
        }
        if (tabs2[i.i] === true) {
            this.setState({
                activeTab: i.i,
                showIcon: false,
                tabState: false
            })
        } else {
            tabs2[i.i].show = true;
            this.setState({
                activeTab: i.i, tabs2,
                showIcon: false,
                tabState: false
            })
        }
    }
    switchLock(en) {
        if (Platform.OS === "ios") {
            this.setState({ lockSwip: en })
        }
    }

    trackChannel() {
        let time = Date.now() - this.recordChannelTime;
        TrackPage('ChannelPage', 'ChannelPage', time)
        this.recordChannelTime = Date.now();
    }
    /**
     * 点击跳转到对应的频道
     * @param {*} i
     */
    goToPage(i) {
        this.state.opacityTop.setValue(0);
        //this.showIcon = false
        let tabs2 = this.state.tabs2.concat();
        if (tabs2[i] === true) {
            this.setState({
                activeTab: i,
                showIcon: false
            })
        } else {
            tabs2[i].show = true;
            this.setState({
                activeTab: i, tabs2,
                showIcon: false
            })
        }
        if (i > 0) {
            this.state.scrollTop.setValue(150)
        } else {
            this.state.scrollTop.setValue(this.currentSize)
        }
        // track
        this.trackGoToPage(i, tabs2[i].name);
    }
    trackGoToPage(i, tabName) {
        let index = i + 1;
        TrackClick('TOP', `TOPChannel-${index}`, '首页', tabName)
    }
    goToPage2(name) {
        let tabs = this.state.tabs;
        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index];
            if (tab.name === name) {
                this.refs.tabs.go(index); break;
            }
        }
    }
    goToPage3 = (id) => {
        let tabs = this.state.tabs;
        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index];
            if (tab.id == id) {
                this.refs.tabs.go(index); break;
            }
        }
    }

    /**
     * 根据滑动发布事件,别的组件可以订阅这个方法
     * 根据y激活对应的组件
     * contentOffset(x,y)
     * contentSize(width,height)
     * layoutMeasurement(width,height)
     */
    onScroll(scrollTop, timeAxisTop) {
        if (this.state.activeTab == 0) {
            this.currentSize = scrollTop;
            this.state.scrollTop.setValue(scrollTop)
            if (!this.state.updated) {
                if (scrollTop > 90) {
                    this.setState({
                        updated: true
                    })
                }
            } else {
                if (scrollTop <= 90) {
                    this.setState({
                        updated: false
                    })
                }
            }
        }
    }

    /**
    * 开关时间轴置顶
    */
    switchTimeAxis(en) {
        if (Platform.OS === "ios") {
            this.setState({ showTimeAxis: en, lockSwip: en })
        } else {
            this.setState({ showTimeAxis: en })
        }
    }
    _scrollY = 0;
    isRun = true;
    isCanOpen = true
    oneHeight = px(500) * 20
    twoHeight = 2 * deviceHeight
    isShowIcon = false
    topBack = false;
    onScrollOther(y, productTop) {
        if (parseInt(y) == 0) {
            this.topBack = false;
        }
        if (this.topBack) return;
        if (y > this.twoHeight) {
            if (!this.isShowIcon) {
                this.isShowIcon = true
                this.setState({
                    showIcon: true
                })
                this.state.opacityTop.setValue(1);
            }

            if (this.state.activeTab == 0 && y > productTop + this.oneHeight) {
                if (this.isCanOpen) {
                    this.refs.toTop.run()
                    this.isCanOpen = false
                }
            } else {
                this.isCanOpen = true
            }
        } else {
            if (this.isShowIcon) {
                this.isShowIcon = false;
                this.setState({
                    showIcon: false
                })
                //this.showIcon = false
                this.state.opacityTop.setValue(0);
            }
        }

        if (this._scrollY > y) { // shang
            if (!this.isRun) {
                this.refs.toTop.run()
                this.isRun = true;
                return;
            }
        } else if (this._scrollY < y) { // xia
            if (this.isRun) {
                //console.log('xia')
                this.isRun = false;
                return;
            }
        }
        this._scrollY = y;
    }
    layout = [];
    pages = [];
    //showIcon = false;
    //记录渲染高度
    setLayout(e, index) {
        this.layout[index] = e.nativeEvent.layout.height
        if (isIphoneX() && index === 0) {
            this.layout[0] = this.layout[0] - px(50)
        }
    }

    toTop() {
        this.topBack = true;
        this.pages[this.state.activeTab].scrollToTop(0)
    }
}

const styles = StyleSheet.create({
    preheatBg: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: px(367),
        height: px(50),
        zIndex: 99,
        justifyContent: 'center'
    },
    preheatBigBg: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: px(10)
    },
    preheatBgContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: px(50),
        zIndex: 99,
        borderBottomLeftRadius: px(12),
        borderBottomRightRadius: px(12),
        overflow: 'hidden'
    },
    pC1: {
        width: px(450),
    },
    pC2: {
        width: px(600)
    },
    preheatTxt: {
        padding: 0,
        fontSize: setSpText(12),
        color: '#ffffff',
        //textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        backgroundColor: 'transparent'
    },
    headerView: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 100,
    },
    headerTab: {

    },
    pageView: {
        flex: 1,
        width: deviceWidth
    },
    pageContent: {

    },
    loading: {
        textAlign: 'center',
        fontSize: px(28),
        color: "#ccc"
    },
    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
        height: px(169),
        paddingLeft: px(145),
        paddingRight: px(145),
        paddingTop: px(53)
    },
    modalTxt1: {
        fontSize: px(42),
        color: '#d0648f',
       // fontWeight: '900'
    },
    modalTxt2: {
        fontSize: px(26),
        color: '#858385',
        textAlign: 'center',
        marginTop: px(10),
        lineHeight: px(30)
    },
    field: {
        paddingLeft: px(145),
        paddingRight: px(145),
    },
    fieldTxt: {
        fontSize: px(42),
        color: '#d0648f',
    },
    fieldTxt1: {
        fontSize: px(42),
        color: '#d0648f',
        textAlign: 'center',
        fontWeight: '900'
        //lineHeight: px(30)
    },
    modalTxt3: {
        color: '#d0648f',
    },
    shareField: {
        position: 'absolute',
        top: px(242),
        left: px(274),
        width: px(202),
        height: px(78),
        //marginLeft: px(274)
        //backgroundColor: '#fff',
        //borderRadius: px(25),
        //overflow:'hidden',
        zIndex: 1
    },
    toTop: {
        position: 'absolute',
        right: px(0),
        width: px(100),
        height: px(100),
        zIndex: 1
    },
    timeBox: {
        width: px(750),
        paddingHorizontal: px(20),
        height: px(70),
        backgroundColor: "#fff"
    },
    timeTitle: {
        width: px(4),
        height: px(20),
        marginRight: px(10)
    },
    timeTxt: {
        fontSize: px(26),
        color: '#252426'
    }
});
