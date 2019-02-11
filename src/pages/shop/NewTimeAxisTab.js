'use strict';
import React from 'react';

import {
    Text,
    View,
    Dimensions,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform
} from 'react-native';

import { px } from '../../utils/Ratio';
import { log } from '../../utils/logs';

import Event from '../../services/Event';

const DEVICE_WIDTH = Dimensions.get('window').width;
const TABBAR_WIDTH = DEVICE_WIDTH / 5;
const TABBAR_MID = DEVICE_WIDTH / 2;

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currTabIndex: this.props.index || 0, // 当前选项卡索引
            tabBars: this.props.tabBars || []
        }

        this.initEvent = this.initEvent.bind(this)
        this.changeEvent = this.changeEvent.bind(this)
        this.next = this.next.bind(this)
        this.localTimeAxis = this.localTimeAxis.bind(this)

    }

    // 空
    _renderEmpty() {
        return null
    }

    // 占位
    _renderBlank() {
        return (
            <View style={styles.blank}></View>
        )
    }

    // 时间轴项
    _renderTabBar() {
        return (
            this.state.tabBars.map((item, index) => <View style={styles.tabBar} key={index}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => this.notice(index)}
                >
                    <View style={styles.tabBarPanel}>
                        <Text allowFontScaling={false}
                            style={[styles.tabBarTitle1, item.type == 'yesterday' || item.type == 'tomorrow' ? styles.tabBarTitle2 : {}, this.state.currTabIndex == index ? styles.currTabBar : {}]}>
                            {` ${item.title_1} `}
                        </Text>
                        <Text allowFontScaling={false}
                            style={[styles.tabBarDesc, this.state.currTabIndex == index ? styles.currTabBar : {}]}>
                            {item.title_2}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            )
        )
    }

    // ios渲染
    _renderTimeLineTabByIOS() {
        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollWrap}
                    ref='timelineTab'
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    directionalLockEnabled={true}
                    bounces={false}
                    snapToInterval={TABBAR_WIDTH}
                    snapToAlignment={'center'}
                    onMomentumScrollEnd={e => this.scrollSelectedByIOS(e)}
                    scrollsToTop={false}
                >
                    {this._renderBlank()}
                    {this._renderTabBar()}
                    {this._renderBlank()}
                </ScrollView>
                <View style={styles.tabBarLine}></View>
            </View>
        )
    }

    // 安卓渲染
    _renderTimeLineTabByAndriod() {
        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollWrap}
                    ref='timelineTab'
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onMomentumScrollEnd={e => this.scrollSelectedByAndriod(e)}
                >
                    {this._renderBlank()}
                    {this._renderTabBar()}
                    {this._renderBlank()}
                </ScrollView>
                <View style={styles.tabBarLine}></View>
            </View>
        )
    }

    _renderTimeLineTab() {
        return Platform.OS == "ios" ? this._renderTimeLineTabByIOS() : this._renderTimeLineTabByAndriod()
    }

    render() {
        return this.state.tabBars && this.state.tabBars.length > 0 ? this._renderTimeLineTab() : this._renderEmpty()
    }
    isScroll = false
    // IOS滚动
    scrollSelectedByIOS(e) {
        let currTabIndex = Math.round(e.nativeEvent.contentOffset.x / TABBAR_WIDTH)
        if (currTabIndex == this.state.currTabIndex) return;
        this.isScroll = true
        this.notice(currTabIndex)
    }

    // 安卓滚动
    scrollSelectedByAndriod(e) {
        let limit = this.state.currTabIndex * TABBAR_WIDTH
        let distance = e.nativeEvent.contentOffset.x - limit
        let speed = distance / TABBAR_WIDTH

        let currTabIndex = this.state.currTabIndex + Math.round(speed)
        this.scrollTo(currTabIndex)

        if (currTabIndex != this.state.currTabIndex) {
            this.isScroll = true
            this.notice(currTabIndex)
        }
    }

    // 通知事件
    notice(index) {

        if (!this.isNext && !this.isScroll) return;
        this.isNext = false
        this.isScroll = false
        if (index != this.state.currTabIndex) {
            Event.emit("timeAxis.change", index, "tab", this.state.tabBars[index])
        }
    }

    // 定义事件
    componentDidMount() {
        this.events()
        if (this.props.tabBars) {
            setTimeout(() => {
                this.scrollTo(this.state.currTabIndex)
            }, 1)
        }
        this.state.tabBars.forEach((tab, index) => {
            if (tab.current) {
                this.currTimeIndex = index
            }
        });
    }

    // 销毁事件
    componentWillUnmount() {
        this.clearEvent()
    }

    // 控制渲染
    // shouldComponentUpdate(nextProps, nextState) {
    //     if (this.state.currTabIndex != nextState.currTabIndex || this.state.tabBars.length != nextState.tabBars.length) {
    //         return true
    //     }

    //     return false
    // }

    // 内部更新tab
    updateTabIndex(currTabIndex) {
        let tabBars = this.state.tabBars, is_deep_stock = tabBars[currTabIndex].is_deep_stock || 0;
        this.props.controlShareBtn && this.props.controlShareBtn(is_deep_stock);
        this.setState({
            currTabIndex: currTabIndex,
        }, () => {
            this.scrollTo(currTabIndex)
        })
    }

    currTimeIndex = 0;
    //重新定位当前时间
    localTimeAxis() {
        let time = new Date().getHours();
        let currIndex = this.state.currTabIndex;
        let nextIndex = 0;
        let list = [...this.state.tabBars];

        this.state.tabBars.forEach((item, index) => {
            let title = parseInt(item.title_1.replace(":00", ""))
            if (time >= title) {
                nextIndex = index;
                if (list[index].title_2 == "预热中") list[index].title_2 = "抢购中";
            }
        });
        if (currIndex !== nextIndex) {
            log("更新时间轴信息", { time, nextIndex })
        }
        this.currTimeIndex = nextIndex;
        this.setState({ tabBars: list });

    }
    // 外部通知更新时间轴tab
    changeEvent(currTabIndex) {
        if (this.state.currTabIndex == currTabIndex) return;
        this.updateTabIndex(currTabIndex)
    }

    // 外部通知初始化时间轴tab
    initEvent(currIndex, tabsInfo) {
        if (this.props.tabBars) return;
        let state = {
            currTabIndex: currIndex || 0,
            tabBars: tabsInfo || []
        },
            is_deep_stock = tabsInfo[currIndex].is_deep_stock || 0;
        this.props.controlShareBtn && this.props.controlShareBtn(is_deep_stock);
        this.setState(state, () => {
            setTimeout(() => {
                this.scrollTo(this.state.currTabIndex)
            }, 1)
        })
    }

    // 滚动方法
    scrollTo(currTabIndex) {
        if (this.refs['timelineTab']) {
            this.refs['timelineTab'].scrollTo({
                x: currTabIndex * TABBAR_WIDTH,
                animated: true,
            });
        }
    }

    // 允许下一个
    isNext = true;
    next() {
        this.isNext = true;
    }

    // 事件定义
    events() {
        Event.on("timeAxis.init", this.initEvent)
        Event.on("timeAxis.change", this.changeEvent)
        Event.on("timeAxis.next", this.next)
        Event.on("notice.time", this.localTimeAxis)
    }

    // 清理事件
    clearEvent() {
        Event.off("timeAxis.init", this.initEvent)
        Event.off("timeAxis.change", this.changeEvent)
        Event.off("timeAxis.next", this.next)
        Event.off("notice.time", this.localTimeAxis)
    }

    // 外部方法
    getCurrTabInfo() {
        return this.state.tabBars[this.state.currTabIndex]
    }
}

const styles = StyleSheet.create({
    container: {
        width: DEVICE_WIDTH,
        height: px(102),
        backgroundColor: '#fff',
    },
    scrollWrap: {
        flex: 1,
    },
    blank: {
        width: TABBAR_WIDTH * 2,
        height: px(102),
    },
    tabBar: {
        width: TABBAR_WIDTH,
        height: px(102),
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBarPanel: {
        position: 'relative',
        width: TABBAR_WIDTH,
        height: px(102),
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBarTitle1: {
        fontSize: px(42),
        fontWeight: '700',
        color: '#252426',
        includeFontPadding: false,
    },
    tabBarTitle2: {
        fontSize: px(26),
        paddingVertical: px(10),
    },
    currTabBar: {
        color: '#d0648f',
    },
    tabBarDesc: {
        fontSize: px(20),
        color: '#454545',
        includeFontPadding: false,
    },
    tabBarLine: {
        position: 'absolute',
        bottom: 0,
        left: TABBAR_MID - px(32),
        width: px(64),
        height: px(4),
        backgroundColor: '#d0648f',
    }
})
