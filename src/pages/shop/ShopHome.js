'use strict';

import React from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, View, Animated, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import GoodItem from "./GoodItem";
import ShopShare from "./ShopShare";
import { TimeAxis } from './TimeAxis';
import HomeBanner from "./HomeBanner";
import { Module } from './ShopPage_floor';
import { User } from "../../services/Api";
import CartList from '../../services/Cart';
import request from '../../services/Request';
import { TrackClick } from '../../services/Track';
import { DialogModal } from '../common/ModalView';
import { show as toast } from '../../widgets/Toast';
import { deviceWidth, isIphoneX, px, deviceHeight } from "../../utils/Ratio";
import { log } from "../../utils/logs"
import Icon from '../../UI/lib/Icon'
import NewTimeAxisTab from './NewTimeAxisTab'
import base from "../../styles/Base";
import NewTimeAxisItem from './NewTimeAxisItem'
import Event from '../../services/Event';
import { setItem, getItem, removeItem } from "../../services/Storage"

/**
 * 列表中的时间轴
 */

class TimeAxisTab extends React.Component {
    constructor(props) {
        super(props)
    }

    mh = px(103)
    sh = px(103) - 35

    render() {
        return <Animated.View style={{
            width: deviceWidth,
            height: this.mh,
            backgroundColor: '#fff',
            marginTop: this.props.i == 0 ? px(20) : 0,
        }}
            onLayout={e => this.props.onLayout(e)}>
            <NewTimeAxisTab index={this.props.index} tabBars={this.props.tabBars} />
        </Animated.View>
    }
}

/**
 * 分组时间轴
 */

class TimeAxisGroup extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <View onLayout={e => this.props.onLayout(e)} style={[base.inline_left, goodOtherStyles.timeBox]}>
            <View style={[goodOtherStyles.timeTitle, base.backgroundColor]}></View>
            <Text style={goodOtherStyles.timeTxt}>{this.props.name}</Text>
        </View>
    }

    // 更新一次
    updated = true
    shouldComponentUpdate() {
        if (this.updated) {
            this.updated = false;
            return true;
        }
        return false;
    }
}

const goodOtherStyles = StyleSheet.create({
    timeBox: {
        width: px(750),
        paddingHorizontal: px(20),
        height: px(70),
        backgroundColor: '#fff'
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
})

/**
 * 列表中的类型
 */
const ListType = {
    /**
     * 轮播图
     */
    BANNER: "banner",
    /**
     * 楼层
     */
    MOUDLE: "module",
    /**
     * 时间轴顶部滚动条
     */
    TIMEAXISTAB: "timeAxisTab",
    /**
     * 时间轴分组标题
     */
    TIMEAXISGROUP: "timeAxisGroup",
    /**
     * 时间轴顶部高度
     */
    TIMEAXISLISTMARGIN: "timeAxisListMargin",
    /**
     * 时间轴项
     */
    TIMEAXISLIST: "timeAxisList",
    /**
     * 时间轴底部
     */
    TIMEAXISSEAT: "timeAxisSeat"
}

/**
 * 首页的列表组件
 */
export default class extends React.Component {
    openShare = (goods, tab, type) => {
        this.refs['shareGoods'].share(goods, tab, type);
    }
    constructor(props) {
        super(props)
        this.state = {
            part: 0,
            list: [],
            loadText: "加载中...",
            refreshing: false,
            isLogin: User.isLogin,
            timeAxisOpacity: 1,
            showLead: false
        };
        this.isEnd = false;
        this.layout = [];
        this.timeAxisProps();
        this.timeAxisChange = this.timeAxisChange.bind(this);
    }

    hasBanner = false;
    hasModule = false;
    scroll_y = 0;

    render() {
        if (this.props.id === undefined) return <View style={{ flex: 1 }}></View>;
        return <View style={{ flex: 1 }}>
            <FlatList ref="flatlist"
                style={{ width: deviceWidth, backgroundColor: "#f2f2f2", height: deviceHeight }}
                refreshing={this.state.refreshing}
                numColumns={1}
                onRefresh={() => this.refresh()}
                onEndReached={() => this.loadNext()}
                onEndReachedThreshold={500}
                renderItem={({ item, index }) => {
                    if (item.type === ListType.BANNER) {
                        return <HomeBanner ref='banner' id={0} tab={this.props.id}
                            item={item}
                            onLayout={e => this.onLayout(e.nativeEvent, index, item.type)}
                            tabName={this.props.name}
                            refresh={this.state.refreshing}
                            navigation={this.props.navigation}
                            onChangeF={this.props.onChangeF} />
                    }
                    if (item.type === ListType.MOUDLE) {
                        return <Module item={item} index={item.key}
                            ref={"item_" + index}
                            show={item.show}
                            onLayout={e => this.onLayout(e, index, item.type)}
                            navigation={this.props.navigation}
                            onChangeF={this.props.onChangeF}
                            goOtherPage={this.goOtherPage.bind(this)} />
                    }
                    if (item.type === ListType.TIMEAXISTAB) {
                        return <TimeAxisTab opacity={this.state.timeAxisOpacity}
                            i={index}
                            onLayout={e => this.onLayout(e.nativeEvent, index, item.type)}
                            index={this.timeAxisCurrTab.index}
                            tabBars={item.data.tabBars} />
                    }
                    if (item.type === ListType.TIMEAXISGROUP) {
                        return <TimeAxisGroup onLayout={e => this.onLayout(e.nativeEvent, index, item.type, item.data)} name={item.data} />
                    }
                    if (item.type === ListType.TIMEAXISLISTMARGIN) {
                        return <View onLayout={e => this.onLayout(e.nativeEvent, index, item.type)}
                            style={{
                                width: deviceWidth,
                                height: px(10),
                                backgroundColor: '#fff'
                            }} />
                    }
                    if (item.type === ListType.TIMEAXISLIST) {
                        return <NewTimeAxisItem onLayout={e => this.onLayout(e.nativeEvent, index, item.type)}
                            show={true} good={item.data}
                            navigation={this.props.navigation}
                            shareEvent={this.openShare.bind(this)}
                            onChangeF={this.props.onChangeF.bind(this)}
                            goOtherPage={this.goOtherPage.bind(this)}
                            addCart={(id, num, key, type) => this.addCart(id, num, key, type)}
                        />;
                    }
                    if (item.type === ListType.TIMEAXISSEAT) {
                        return <View onLayout={e => this.onLayout(e.nativeEvent, index, item.type)}
                            style={{
                                width: deviceWidth,
                                height: deviceHeight,
                                backgroundColor: '#fff'
                            }} />
                    }
                }}
                ListFooterComponent={this._footer.bind(this)}
                onScroll={(e) => this._onScroll(e.nativeEvent)}
                scrollEventThrottle={100}
                keyExtractor={(goods, index) => goods.index + index}
                data={this.state.list}
                extraData={this.state}
                initialNumToRender={2} />
            <ShopShare ref="shareGoods" navigation={this.props.navigation} />
            <DialogModal ref="dialog" />
            {User.isLogin && !User.vip && this.state.showLead && <View style={styles.lead}>
                <TouchableOpacity activeOpacity={.9} onPress={() => this.firstSubject()}>
                    <Image source={{ uri: "http://img.daling.com/st/dalingjia/app/lead1.png" }} style={styles.leadImg} />
                </TouchableOpacity>
            </View>}
        </View>
    }
    async componentDidMount() {
        this.loadBanner();
        Event.on('timeAxis.change', this.timeAxisChange);
        // setItem("home_first", "first");
        let first = await getItem("home_first");
        if (first === "first") {
            this.setState({ showLead: true });
            removeItem("home_first")
        }
    }

    componentWillUnmount() {
        Event.off('timeAxis.change', this.timeAxisChange)
    }

    _footer() {
        if (this.timeAxisDone) {
            return <TouchableWithoutFeedback onPress={() => this.btnNext()}>
                <View style={{ width: deviceWidth, backgroundColor: '#fff', alignItems: 'center' }}>
                    <View style={styles.nextWrap}>
                        <Text style={styles.next}>{this.state.loadText}</Text>
                        <Icon
                            name="time-axis-left"
                            style={{ width: px(12), height: px(22) }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        }
        if (this.timeAxisCurrTab && this.timeAxisCurrTab.index != this.timeAxisCurrent) {
            return <TouchableWithoutFeedback onPress={() => this.backCurrent()}>
                <View style={{ width: deviceWidth, backgroundColor: '#fff', alignItems: 'center' }}>
                    <View style={styles.nextWrap}>
                        <Text style={styles.next}>回到主场</Text>
                        <Icon
                            name="time-axis-left"
                            style={{ width: px(12), height: px(22) }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        }
        return null
    }

    /**
     * 第一次登录，点击进入的专题页
     */
    firstSubject() {
        this.setState({ showLead: false });
        this.shouldUpdate = true;
        this.props.navigation.navigate('HtmlViewPage', {
            webPath: "https://dalingjia.com/subject/06a5249",
            // webPath: "https://dalingjia.com/subject/aeb1549",
            img: "",
            first: true
        });
    }
    userUpdate() {
        this.shouldUpdate = true;
    }
    /**
     * 动态获取列表项高度
     * @param {*} e nativeEvent后面的部分
     * @param {*} index 序号
     */
    onLayout(e, index, type, data) {
        if (!this.layout[index]) this.layout[index] = {};
        this.layout[index].h = e.layout.height;
        this.layout[index].type = type;
        this.layout[index].data = data;
    }

    shouldUpdate = true;
    shouldComponentUpdate() {
        if (this.state.refreshing) return true;
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    componentWillReceiveProps(pp) {
        if (!this.props.show && pp.show) {
            this.loadBanner();
        }
    }
    /**
     * 获取时间轴距离顶部的距离
     */
    getTimerAxisTop() {
        let top = 0
        this.layout.forEach(item => {
            if ([ListType.BANNER, ListType.MOUDLE].indexOf(item.type) >= 0) top += item.h;
        });
        return top;
    }

    topOffset = 0;
    /**
     * 滚动的时候传值
     * @param {*} e
     */
    _onScroll(e) {
        // console.log(e.contentOffset.y, e.contentSize)
        // console.log(e.contentOffset.y, this.layout)
        const y = e.contentOffset.y;
        this.topOffset = y;

        // 下拉刷新
        if (e.contentOffset.y < -10) this.shouldUpdate = true;

        // 首页功能
        if (this.timeAxisTabs.length) {
            if (parseInt(y) == 0) {
                this.topBack = false;
            }
            this.headerTimeAxisGroupAni(y)
        }

        this.switchTimeAxis();

        this.props.onScroll && this.props.onScroll(y)

        this.props.onScrollOther(y, this.productTop || this.timeAxisTop)
    }
    /**
     * 判断是否需要置顶顶部时间轴切换条
     */
    switchTimeAxis() {
        const currTop = this.getTimerAxisTop() - this.headerHeight;
        this.props.switchTimeAxis && this.props.switchTimeAxis(this.topOffset > currTop - 5)
    }

    step = 0;
    start = 0;
    loading = false;
    totalPages = 2;
    layout = [];
    hasTitle = false;
    moduleL = 0; //楼层的长度，为了计算时间轴滚动高度

    async loadBanner() {
        if (this.loading) return;
        this.loading = true;
        try {
            let res = await request.get(`/banner/findBannerAndQuickList.do`, {
                categoryId: ""
            });
            res.type = ListType.BANNER;
            res.index = ListType.BANNER;
            res.tt = Date.now();
            //添加高度表
            let h = 0;
            if (res.bannerList.length > 0) {
                let BannerHeight = Platform.OS === "ios" ? isIphoneX() ? px(340) + 128 : px(536) + 10 : px(500) + 10
                h = BannerHeight;
            }
            if (res.quickList.length > 0) {
                h += px(176)
            }
            this.layout[0] = { h: h, type: ListType.BANNER };
            this.shouldUpdate = true;
            this.setState({ list: [res] });
        } catch (e) {
            // toast(e.message);
        } finally {
            this.loading = false
            this.step = 1;
            this.loadNext();
        }
    }
    //加载下一页
    async loadNext() {
        if (this.step === 1) this.loadModules();
        if (this.step === 2) this.loadTimeAxis();
    }
    //获取楼层
    async loadModules() {
        if (this.loading) return;
        this.loading = true;
        let list = [];
        try {
            let moduleList = await request.get(`/module/findModuleListV2.do?categoryId=`);
            if (moduleList.constructor === Array) {
                moduleList.forEach((item, key) => {
                    item.type = ListType.MOUDLE;
                    item.index = 'module_' + item.moduleId;
                    item.key = key;
                    list.push(item);
                    this.layout.push({ h: 0, type: ListType.MOUDLE });
                })
                this.moduleL = moduleList.length || 0
                if (moduleList.length > 0) this.hasTitle = true;
            }
        } catch (e) {
            // log(e.message);
        } finally {
            this.step = 2;
            this.loading = false;
            this.shouldUpdate = true;
            this.setState({ list: this.state.list.concat(list) });
            this.loadNext();
        }
    }

    // 加载时间轴
    async loadTimeAxis() {
        // 最后一场时间轴提示信息逻辑
        if (this.timeAxisCurrTab.index + 1 >= this.timeAxisTabs.length && !this.timeAxisCurrTab.next) {
            if (!this.timeAxisOver) {
                this.timeAxisOver = true;
                this.shouldUpdate = true;
                this.setState({ loadText: "别扯啦,到底了..." })
            }
            return;
        } // 结束
        if (this.loading) return;
        this.loading = true;
        try {
            // 是否可以换页
            if (this.timeAxisCurrTab.next) {
                this.timeAxisOver = false;
                this.timeAxisCurrTab.page++; // 页数从1开始
                let httpUrl = ""
                if (this.timeAxisInit) { // 如果初始化
                    httpUrl = `/timeline/timelineList_paging.do?start=${this.timeAxisCurrTab.page}`
                } else {
                    let httpParam = []
                    let tabInfo = this.getTimeAxisTabInfo(this.timeAxisCurrTab.index); //获取时间轴tab信息
                    let ids = (tabInfo.ids || "").split(",");
                    ids.forEach(id => {
                        httpParam.push(`ids=${id}`)
                    })
                    httpUrl = `/timeline/timelineList_paging.do?start=${this.timeAxisCurrTab.page}&${httpParam.join("&")}`
                }

                let res = await request.get(httpUrl);
                if (this.timeAxisCurrTab.page === 1 && res.floor) {
                    res.list = res.floor.concat(res.list);
                }
                this.timeAxisCurrTab.next = res.next;
                if (this.timeAxisInit) { // 初始化逻辑
                    this.timeAxisInit = false;
                    this.timeAxisTabs = res.heads || [];
                    // 初始化遍历得到当前时间轴
                    this.timeAxisTabs.forEach((tab, index) => {
                        if (tab.current) {
                            this.timeAxisCurrTab.index = index
                            this.timeAxisCurrent = index
                        }
                    });
                    this.setTimeAxis("timeAxisTab", {
                        index: this.timeAxisCurrTab.index,
                        tabBars: this.timeAxisTabs
                    }, 0, () => {
                        this.listTimeAxisIndex = this.state.list.length; //时间轴所在列表位置，用于裁剪列表
                        setTimeout(() => {
                            Event.emit('timeAxis.init', this.timeAxisCurrTab.index, this.timeAxisTabs)
                        }, 10)
                        setTimeout(() => { // 时间轴距离屏幕位置
                            this.setTimeAxisPositionY()
                            this.timeAxisCounter += this.timeAxisTop
                        }, 10);
                    })
                }
                let tabInfo = this.getTimeAxisTabInfo(this.timeAxisCurrTab.index)
                let list = [];
                if (tabInfo.type != "tomorrow") {
                    if (this.timeAxisCurrTab.page == 1) { // 列表上边距
                        list.push(this.setTimeAxisItem("timeAxisListMargin", 1, null, px(20)))
                    }
                }
                (res.list || []).forEach((item, index) => {
                    item.tabType = tabInfo.type;
                    if (tabInfo.type == "tomorrow") { // 如果是明日列表， 分组
                        if (this.timeAxisGroupNext != item.title) {
                            this.timeAxisGroupNext = item.title;
                            list.push(this.setTimeAxisGroup(this.timeAxisGroupNext))
                        }
                    }
                    let height = item.type == 1 ? this.timeAxisSH : this.timeAxisBH;
                    list.push(this.setTimeAxisItem(ListType.TIMEAXISLIST, index, item, height))
                })
                this.shouldUpdate = true;
                if (this.timeAxisCurrTab.page == 1) { // 第一页数据，删除掉占位元素
                    this.setState({ list: this.state.list.slice(0, this.listTimeAxisIndex).concat(list) }, () => {
                        Event.emit("timeAxis.next");
                        const currTop = this.getTimerAxisTop() - this.headerHeight;
                        if (this.topOffset > currTop) { // 返回时间轴顶部
                            this.refs.flatlist.scrollToOffset({
                                offset: currTop,
                                animated: true
                            });
                        }
                    })
                } else {
                    this.setState({ list: this.state.list.concat(list) })
                }
            } else { // 切换下场逻辑
                if (!this.timeAxisDone) {
                    this.timeAxisDone = true;
                    // 显示下一场按钮
                    this.shouldUpdate = true;
                    this.setState({ loadText: "下一场" })
                }
            }
        } catch (e) {
            toast(e.message);
        } finally {
            this.loading = false;
        }
    }
    // 时间轴切换场次
    timeAxisChange(index) {
        if (this.isTimeAxisGroupAni) {
            this.hideTitle()
        }
        this.shouldUpdate = true
        this.setState({ loadText: "加载中...", list: this.cleanTimeAxisList() })
        this.cleanTimeAxisGroup()
        // 重制属性
        this.cleanTimeAxis(index)
        this.loadTimeAxis()
    }

    // 清理时间轴列表数据
    cleanTimeAxis(index) {
        this.timeAxisOver = false;
        this.timeAxisDone = false;
        this.timeAxisCurrTab = {
            index: index,
            next: true,
            page: 0,
        } //当前时间轴tab
    }

    cleanTimeAxisGroup() {
        this.timeAxisGroupNext = ''
        this.timeAxisGroup = [] // 标题组
        this.timeAxisGroupIndex = 0 // 组下标
        this.timeAxisCounter = this.timeAxisTop
    }

    cleanTimeAxisList() {
        let list = this.state.list.slice(0, this.listTimeAxisIndex)
        list.push({
            type: "timeAxisSeat",
            index: `timeAxisSeat`,
        })
        return list
    }
    timeAxisCurrent = 0;
    // 重制属性
    timeAxisProps() {
        this.timeAxisInit = true // 初始化控制
        this.timeAxisCurrTab = {
            index: 0,
            next: true,
            page: 0,
        } //当前时间轴tab
        this.timeAxisTabs = [] // 时间轴tab
        this.listTimeAxisIndex = 0 // 列表中时间轴的index
        this.timeAxisGroupNext = ""
        this.timeAxisGroup = [] // 标题组
        this.timeAxisGroupIndex = 0 // 组下标
        this.timeAxisCounter = 0
        this.timeAxisOpacity = 1;
        this.timeAxisOver = false;
        this.timeAxisDone = false;
        this.isTimeAxisAni = false
        this.isTimeAxisGroupAni = false
        this.topBack = false;
    }

    timeAxisSH = px(258)
    timeAxisBH = px(652)

    // 效果
    btnNext() {
        Event.emit("timeAxis.change", this.timeAxisCurrTab.index + 1, 'list')
    }
    backCurrent() {
        let curr = 0;
        let time = new Date().getHours();
        this.timeAxisTabs.forEach((item, index) => {
            let title = parseInt(item.title_1.replace(":00", ""))
            if (time >= title) {
                curr = index;
            }
        });
        Event.emit("timeAxis.change", curr)
    }
    //
    // 时间轴组，封装好组位置信息
    setTimeAxisGroup(title) {
        let len = this.timeAxisGroup.length - 1
        if (len >= 0) {
            this.timeAxisGroup[len].ey = this.timeAxisCounter
        }
        let group = {
            sy: this.timeAxisCounter,
            ey: 1000000000,
            title: title,
        }
        this.timeAxisGroup.push(group)
        return this.setTimeAxisItem("timeAxisGroup", title, title, px(70))
    }

    // 获取时间轴tab信息
    getTimeAxisTabInfo(index) {
        if (this.timeAxisTabs.length <= index) {
            return {}
        }
        return this.timeAxisTabs[index];
    }
    // 封装渲染时间轴单项
    setTimeAxis(name, data, height, cb) {
        let timeAxis = {
            type: name,
            index: `${name}${Date.now()}`,
            data: data,
        }
        let list = [timeAxis];
        this.layout.push({ h: 0 })
        this.timeAxisCounter += height;
        this.shouldUpdate = true;
        this.setState({ list: this.state.list.concat(list), }, cb)
    }

    // 封装渲染时间轴列表项
    setTimeAxisItem(name, index, data, height) {
        let timeAxis = {
            type: name,
            index: `${name}${index}${Date.now()}`,
            data: data,
        }
        this.layout.push({ h: 0 });
        this.timeAxisCounter += height;

        return timeAxis
    }

    productSH = px(654)
    productBH = px(695)
    timer = null;

    currTimeAxisTitle = ""; ƒ
    // 时间轴组动画
    headerTimeAxisGroupAni(y) {
        if (this.topBack) return;
        if (this.timeAxisGroup.length > 0) {
            let currTop = 0;
            let currTitle = "";
            this.layout.reduce((result, item, index) => {
                if (currTop > y) return;

            })
            this.layout.forEach(item => {
                if (currTop > y + this.headerHeight + 100) return;
                currTop += item.h;
                if (item.type === ListType.TIMEAXISGROUP) {
                    currTitle = item.data;
                }
            })
            if (this.currTimeAxisTitle === currTitle) return;
            this.currTimeAxisTitle = currTitle;
            this.showTitle(currTitle)

        } else {
            // 结束
            if (this.isTimeAxisGroupAni) {
                this.hideTitle()
            }
        }
    }

    hideTitle() {
        this.isTimeAxisGroupAni = false
        Event.emit("timeAxis.showTitle", '')
    }

    showTitle(title) {
        this.isTimeAxisGroupAni = true
        Event.emit("timeAxis.showTitle", title)
    }

    // 头部动画
    headerHeight = Platform.OS === "ios" ? isIphoneX() ? 80 : 78 : 57;

    // 获取时间轴高度
    timeAxisTop = 0
    setTimeAxisPositionY() {
        let currTop = Platform.OS === "ios" ? isIphoneX() ? 118 : px(186) : px(146);
        for (let i = 0; i < this.state.list.length; i++) {
            const tmp = this.state.list[i];
            if (tmp.type === "timeAxisTab") {
                this.timeAxisTop = currTop
                break;
            } else {
                // currTop += this.layout[i].h;
            }
        }
    }

    // 精选好货距离屏幕高度
    productTop = 0

    scrollToTop(offset) {
        setTimeout(() => {
            this.refs.flatlist.scrollToOffset({
                offset,
            });
        }, 100);
    }

    //刷新
    refresh() {
        this.timeAxisProps() // 初始化时间轴属性
        this.step = 0;
        this.start = 0;
        this.loading = false;
        this.totalPages = 2;
        this.setState({ list: [], loadText: "加载中..." });
        this.loadBanner();
        // this.props.loadlist && this.props.loadlist();
    }
    /**
     * 重载界面
     */
    reload() {
        this.timeAxisProps() // 初始化时间轴属性
        this.step = 0;
        this.start = 0;
        this.loading = false;
        this.totalPages = 2;
        if (this.state.list.length > 0) {
            this.setState({ list: [], loadText: "加载中..." });
            this.loadBanner();
        }
    }
    trackAddCart(i, type) { // 20180409时间轴商品加埋点
        if (type == 'shop') {
            let index = i + 1;
            if (this.props.id == "dev") {
                TrackClick('Home-SKUlist', `Home-SKUlistAddcart-${index}`, '首页', `加入购物车-${index}`);
            } else {
                TrackClick('Channel-SKUlist', `Channel-SKUlistAddcart-${index}`, '频道页', `加入购物车-${index}`);
            }
        } else {
            let sku = type.split('/')[0],
                time = type.split('/')[1]
            TrackClick('Home-TimeAxis', `Addcar-${sku}`, '首页', `加入购物车-${time}-${sku}`);
        }
    }
    async addCart(id, num, key, type) {
        if (User.isLogin) {
            this.trackAddCart(key, type);
            try {
                await CartList.addCartNum(id, num);
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
                                txt: "去购物车", click: () => this.props.navigation.navigate('ShoppingCartPage')
                            }
                        ]
                    })
                }
            }
        } else {
            this.goLoginPage();
        }
    }

    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {});
    }

    /**
     * banner floor 跳转其他页面
     * @param {*} e
     * @param k 图片下标号
     * @param j 楼层编码
     * @param i 楼层下标
     */
    goOtherPage(item, k, j, i, moduleName) {
        this.trackModuleHandle(item, k, i, j, moduleName)
        if (item.urlType == "sku" && item.prodId) {
            this.props.navigation.navigate('DetailPage', {
                id: item.prodId
            });
        }
        if (item.urlType == "url" && item.urlTypeValue) {
            if (item.urlTypeValue.indexOf(".jpg") > 0) {
                this.props.navigation.navigate('LookImagePage', {
                    'title': "",
                    'img': item.urlTypeValue,
                    'shareImg': item.urlTypeValue
                });
            } else {
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: item.urlTypeValue,
                    img: item.imageUrl
                });
            }
        }
        if (item.urlType == "h5") {
            if (item.urlTypeValue.indexOf("/active/") > 0) {
                this.props.navigation.navigate('BrowerPage', {
                    webPath: item.urlTypeValue,
                    img: item.imageUrl
                });
            } else {
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: item.urlTypeValue,
                    img: item.imageUrl
                });
            }
        }
        if (item.urlType == "category") { //需要确定后台传的是id还是name
            this.props.onChangeF(item.urlTypeValue)
        }
    }
    trackModuleHandle(item, k, i, j, moduleName) {
        if (item.urlType == 'category') return
        let location = '', name = '', from = '', kk = k + 1, ii = i + 1, jj = j + 1, content = '', channel = this.props.name;
        if (this.props.id == "dev") {
            location = 'Homepage';
            name = `HomepageFloor${ii}-${jj}-${kk}`;
            from = '首页'
        } else {
            location = 'Channelpage';
            name = `Floor${ii}-${jj}-${kk}`;
            from = '频道页'
        }
        if (item.urlType == 'sku') {
            content = `${channel}-${moduleName}-图片-${kk}`
        } else {
            content = `${channel}-${moduleName}-${item.title}`
        }
        TrackClick(location, name, from, content)
    }
}

const styles = StyleSheet.create({
    nextWrap: {
        flexDirection: 'row',
        marginTop: px(20),
        marginBottom: px(50),
        width: px(480),
        height: px(60),
        borderWidth: px(1),
        borderColor: '#d0648f',
        borderRadius: px(30),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(208,100,143, 0.05)',
    },
    next: {
        fontSize: px(24),
        color: '#222',
        marginRight: px(10)
    },
    loading: {
        marginVertical: 5,
        textAlign: 'center',
        fontSize: px(28),
        color: "#ccc"
    },
    timeLine: {
        borderBottomColor: '#d2d2d2',
        borderBottomWidth: px(1),
        width: px(293)
    },
    timeBorder: {
        marginTop: px(-2),
        width: px(710),
        marginHorizontal: px(20),
        marginBottom: px(20)
    },
    lead: {
        width: deviceWidth,
        height: deviceHeight,
        position: "absolute",
        top: 0,
        paddingTop: Platform.OS === "ios" ? isIphoneX() ? 120 : 110 : px(140),
        left: 0,
        zIndex: 1000,
    },
    leadImg: {
        width: deviceWidth,
        height: px(670),
    },
});
