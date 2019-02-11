'use strict';

import React from 'react';
import {
    Text, View,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    Platform
} from 'react-native'
import Icon from '../../UI/lib/Icon'
import NewTimeAxisTab from './NewTimeAxisTab'
import Event from '../../services/Event';
import base from '../../styles/Base'
import {deviceWidth, isIphoneX, px} from "../../utils/Ratio";
import { log } from "../../utils/logs"

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            timeAxisTop: new Animated.Value(-300),
            timeAxisShare: new Animated.Value(-300),
            timeAxisShareOpacity: new Animated.Value(0),
            timeAxisTabHeight: new Animated.Value(0),
            title: '',
            isDeepStock: 0
        }

        // this.showTab = this.showTab.bind(this)
        // this.hideTab = this.hideTab.bind(this)
        this.updateTitle = this.updateTitle.bind(this)
    }

    show = true

    render() {
        return <Animated.View style={[styles.timeAxisAni, this.show ? {} : { overflow: 'hidden' }, {
            height: this.state.timeAxisTabHeight,
            top: this.state.timeAxisTop,
            // transform: [{ translateY: this.state.timeAxisTop }],
        }]}>
            <NewTimeAxisTab ref="headTimeAxis" controlShareBtn={this.controlShareBtn.bind(this)} />
            {this.state.title ? <View style={[base.inline_left, styles.timeBox]}>
                <View style={[styles.timeTitle, base.backgroundColor]}></View>
                <Text style={styles.timeTxt}>{this.state.title}</Text>
            </View> : null}
            {
                this.state.isDeepStock == 0 ?
                    <TouchableWithoutFeedback onPress={() => this.share()}>
                        <Animated.View style={[styles.shareField, base.inline, {
                            // transform: [{ translateY: this.state.timeAxisShare }],
                            opacity: this.state.timeAxisShareOpacity,
                            top: this.state.timeAxisShare
                        }]}>
                            <Icon
                                name="icon-share-field"
                                style={{ width: px(202), height: px(78) }} />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    : null
            }
        </Animated.View>
    }

    share() {
        if (this.refs["headTimeAxis"]) {
            let tabInfo = this.refs["headTimeAxis"].getCurrTabInfo()
            this.props.shareEvent && this.props.shareEvent(tabInfo)
        }
    }

    //控制分享场次按钮，深库存场次不能分享isDeepStock=1不能分享
    controlShareBtn(isDeepStock) {
        this.updated = true;
        this.setState({
            isDeepStock
        })
    }
    // 外部属性刷新逻辑
    componentWillReceiveProps(nextProps) {
        if (this.props.show == nextProps.show) {
            this.updated = false
        } else {
            if (nextProps.show && this.show) {
                this.timeAxisTabShow()
            } else if (!nextProps.show && this.show) {
                this.timeAxisTabHide()
            }
            this.updated = true
        }
    }

    // 时间轴tab显示动画
    timeAxisTabShow() {
        this.state.timeAxisTabHeight.setValue(px(180))
        let topPosi = isIphoneX() ? 92 : Platform.OS === 'ios' ? 72 : 52;
        this.state.timeAxisTop.setValue(topPosi)

        this.state.timeAxisShare.stopAnimation();
        this.state.timeAxisShareOpacity.stopAnimation();
        Animated.timing(this.state.timeAxisShare, {
            duration: 200,
            toValue: px(102)
        }).start();
        Animated.timing(this.state.timeAxisShareOpacity, {
            duration: 200,
            toValue: 1
        }).start();
    }

    // 时间轴tab隐藏动画
    timeAxisTabHide() {
        this.state.timeAxisTabHeight.setValue(0)
        this.state.timeAxisTop.setValue(-300)
        this.state.timeAxisShare.stopAnimation();
        this.state.timeAxisShareOpacity.stopAnimation();
        Animated.timing(this.state.timeAxisShare, {
            duration: 200,
            toValue: -300
        }).start();
        Animated.timing(this.state.timeAxisShareOpacity, {
            duration: 200,
            toValue: 0
        }).start();
    }

    // 控制渲染
    updated = true // 属性控制
    noticeUpdated = false // 通知事件控制
    shouldComponentUpdate() {
        if (this.noticeUpdated) {
            this.noticeUpdated = false
            return true
        }
        if (this.updated) {
            return true;
        }
        return false;
    }
    // 定义事件
    componentDidMount() {
        this.events()
    }
    // 销毁事件
    componentWillUnmount() {
        this.clearEvent()
    }
    // 更新分组标题
    updateTitle(title) {
        this.setState({
            title: title
        })
        this.noticeUpdated = true
    }

    // 事件定义
    events() {
        Event.on("timeAxis.showTitle", this.updateTitle)
    }
    // 清理事件
    clearEvent() {
        Event.off("timeAxis.showTitle", this.updateTitle)
    }
}

const styles = StyleSheet.create({
    timeAxisAni: {
        position: 'absolute',
        left: 0,
        width: deviceWidth,
        alignItems: 'center',
        zIndex: 1000,
    },
    shareField: {
        position: 'absolute',
        left: px(274),
        width: px(202),
        height: px(78),
        zIndex: 1000
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
})
