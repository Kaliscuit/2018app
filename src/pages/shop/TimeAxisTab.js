'use strict';

import React, { PureComponent } from 'react';
import {
    Text, View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    TouchableWithoutFeedback,
    Animated,
    InteractionManager,
    NativeModules
} from 'react-native'
import { px } from '../../utils/Ratio';
import { MediaImage } from '../common/ImageView'
import base from '../../styles/Base'
import {TrackClick, TrackPage} from '../../services/Track';
const os = Platform.OS == "ios" ? true : false;
const deviceWidth = Dimensions.get('window').width;
const AppModule = NativeModules.AppModule;

/**
 * 首页顶部tabBar
 * event goToPage
 * props tabs<arrary>
 * props scrollTop
 */
export default class extends React.Component {

    txtlist = []
    middle = deviceWidth / 2;
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0,
            empty: [],
            device: ''
        }
        this.to = 0
        this.txtlistLen = 0;
        this.showPadding = false
        //一个块的宽度
        this.timeWidth = deviceWidth / 5;
    }

    render() {
        if (!this.props.tabs || this.props.tabs.length == 0) return null
        return <View style={styles.container}>
            <ScrollView
                style={{
                    flex: 1,
                    //paddingLeft: !os && this.to < 0 ? -this.to : !os && this.to > 0 ? this.to : 0
                }} ref='tabView'
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                directionalLockEnabled={true}
                // onScrollEndDrag={e => this.scrollEnd(e)}
                // pagingEnabled={true}
                bounces={false}
                snapToInterval={deviceWidth / 5}
                snapToAlignment={'center'}
                onMomentumScrollEnd={e => this.scrollEnd(e)}
                onScroll={e => this.scroll(e)}
                scrollEventThrottle={500}
                scrollsToTop={false} >
                <View style={{ width: deviceWidth / 5 }}></View>
                <View style={{ width: deviceWidth / 5 }}></View>
                {this.props.tabs.map((tab, i) => <View style={[base.text_center, styles.tabbox]} key={i}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.click(i)}
                        onLayout={(e) => this.cal(i, e)}
                    >
                        <View style={[styles.tab, base.line]}>
                            <Text allowFontScaling={false} style={[styles.txt1, {
                                fontSize: tab.timelineRound == '昨日精选' || tab.timelineRound == '明日预告' ? px(26) : px(42),
                                paddingVertical: tab.timelineRound == '昨日精选' || tab.timelineRound == '明日预告' ? px(10) : 0,
                                color: this.state.activeTab == i ? '#d0648f' : '#252426',
                                fontWeight: '700'
                            }]}
                            >
                                {' ' + tab.timelineRound + ' '}
                            </Text>
                            <Text allowFontScaling={false} style={[styles.txt2, { color: this.state.activeTab == i ? '#d0648f' : '#454545' }]}>
                                {tab.status == 1 ? '即将开始' : '抢购中'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                )}
                <View style={{ width: deviceWidth / 5 }}></View>
                <View style={{ width: deviceWidth / 5 }}></View>
            </ScrollView>
            <View style={[styles.border, { left: this.middle - px(32) }]}></View>
        </View>
    }
    go(i) {
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }
    set(i) {
        this.toMiddle(i)
        this.setState({ activeTab: i })
        if (os) {
            this.isMy = true;
        }

    }
   
    componentWillUnmount() {
        if (this.timerEndX) clearTimeout(this.timerEndX);
    }
    click(i) {
        if (this.state.activeTab === i) return;
        this.setState({ activeTab: i })
        this.props.goToPage(i)
        //this.toMiddle(i)
    }
    /**
     * 计算宽度
     * @param {*} i
     * @param {*} e
     */
    toMiddle(i) {
        let width = Math.round(deviceWidth / 5)
        let to = - (0 - i) * width
        this.to = to
        setTimeout(() => {
            this.refs.tabView && this.refs.tabView.scrollTo({x: to})
        }, 1)
        //this.refs.tabView && this.refs.tabView.scrollTo({ x: to })
    }
    cal(i, e) {
        if (this.txtlist[i]) return;
        this.txtlist[i] = e.nativeEvent.layout.width
    }
    //===============
    timeWidth = 0;
    moveX = 0;
    backx = 0;

    //滚动监听
    scroll(e) {
        let x = e.nativeEvent.contentOffset.x;
        this.moveX = x;
        
    }

    isMy = false
    timerEndX = null
    //滚动结束
    scrollEnd(e) {
        if (this.isMy) {
            this.isMy = false;
            return;
        }
        this.isMy = true;
        let x = e.nativeEvent.contentOffset.x;
        let activeTab = Math.round(x / this.timeWidth);
        !os && this.refs.tabView && this.refs.tabView.scrollTo({ x: activeTab * this.timeWidth });
        this.click(activeTab)
        if (this.timerEndX) clearTimeout(this.timerEndX);
        this.timerEndX = setTimeout(() => {
            this.isMy = false;
        }, 200);
    }
    scrollEnd_(e) {
        let width = Math.round(deviceWidth / 5)
        let i = Math.round(e.nativeEvent.contentOffset.x / width) * -1
        this.setState({ activeTab: -i })
        this.props.goToPage(-i)
        //console.log(x, width, x % width)
    }

}
const styles = StyleSheet.create({
    container: {
        width: deviceWidth,
        height: px(102),
        backgroundColor: '#fff',
        //paddingHorizontal: px(20)
    },
    tabs: {
        //paddingHorizontal:px(100)
    },
    tabbox: {
        height: px(102),
        alignItems: 'center',
        width: deviceWidth / 5
    },
    tab: {
        height: px(102),
        /*paddingLeft: px(18),
        paddingRight: px(18),*/
        position: "relative",
    },
    txt1: {
        color: '#252426',
        fontSize: px(50),
        //fontWeight: '700',
        includeFontPadding: false,
    },
    txt2: {
        color: '#454545',
        fontSize: px(20),
        includeFontPadding: false,
    },
    border: {
        width: px(64),
        height: px(4),
        backgroundColor: '#d0648f',
        position: 'absolute',
        bottom: 0
    }
})
