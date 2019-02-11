'use strict';

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';

import { deviceWidth, px } from '../../utils/Ratio';
import Icon from "../../UI/lib/Icon";
import base from '../../styles/Base'

let flag3 = "";
/**
 * 下单页item
 * props.label
 * props.right
 * props.onPress
 */
export default class SubmitItem extends React.Component {

    static defaultProps = {
        label: "",
        right: true,
        color: "#858385",
        txt: "",
        border: false,
        isAllow: false,
        onPress: () => { },
        onPress_: () => { }
    }

    renderLabel(props) {
        return <TouchableWithoutFeedback  onPress={() => this.props.onPressTip && this.props.onPressTip()}>
            <View style={{ flexDirection: 'row' }}>
                <Text
                    style={{ fontSize: px(26) }}
                    allowFontScaling={false} >{props.label}</Text>
                {
                    props.isNeedTip &&
                    <View style={[itemStyle.openTip, base.inline]}>
                        <Text
                            style={itemStyle.tipDec}
                            allowFontScaling={false} >?</Text>
                    </View>

                }
            </View>
        </TouchableWithoutFeedback>
    }
    
    renderExtra(props) {
        return <View style={[itemStyle.rightExtra, this.props.extraStyle]}>
            <Text allowFontScaling={false} style={[itemStyle.contain, this.props.txtStyle]}>
                {props.txt}
            </Text>
            {
                props.extraTxt != '' &&
                <Text allowFontScaling={false} style={itemStyle.extra}>
                    {props.extraTxt}
                </Text>
            }
        </View>
    }
    
    render() {
        const {border, label, txt, isAllow, isNeedTip, haveExtra} = this.props
        return <TouchableOpacity activeOpacity={1} onPress={() => this.props.onPress_ && this.props.onPress_()}>
            <View style={[itemStyle.box, this.props.style]}>
                <View style={[itemStyle.comItem, base.inline_between, {
                    borderTopWidth: px(1),
                    borderTopColor: border ? '#efefef' : '#fff'
                }]}>
                    {
                        isNeedTip ? this.renderLabel(this.props)
                            :
                            <Text allowFontScaling={false} style={itemStyle.label}>
                                {label}
                            </Text>
                    }
                    {
                        haveExtra ? this.renderExtra(this.props) :
                            <Text allowFontScaling={false} style={itemStyle.contain}>
                                {txt}
                            </Text>
                    }
                    {
                        isAllow &&
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    }
                </View>
            </View>
        </TouchableOpacity>
    }
}


exports.ItemExtra = class extends React.Component {

    static defaultProps = {
        onPress_: () => { }
    }

    renderLabel(props) {
        return <TouchableWithoutFeedback  onPress={() => this.props.onPressTip && this.props.onPressTip()}>
            <View style={{ flexDirection: 'row' }}>
                <Text
                    style={{ fontSize: px(26) }}
                    allowFontScaling={false} >{props.label}</Text>
                <View style={itemStyle.couponTip}>
                    <Text style={itemStyle.couponTipTxt} allowFontScaling={false}>
                        {this.state.stunnerId == '' || this.state.stunnerId == null ? flag3 ? `本单最高可用${(this.state.stunnerUseAmount * 1).toFixed(0)}元` : '无可用' : `已选${(this.state.stunnerAmount * 1).toFixed(0)}元`}
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }
    render() {
        const {border, label, txt, isAllow, isNeedTip} = this.props
        return <TouchableOpacity activeOpacity={1} onPress={() => this.props.onPress_ && this.props.onPress_()}>
            <View style={itemStyle.box}>
                <View style={[itemStyle.comItem, base.inline_between, {
                    borderTopWidth: px(1),
                    borderTopColor: border ? '#efefef' : '#fff'
                }]}>
                    {
                        isNeedTip ? this.renderLabel(this.props)
                            :
                            <Text allowFontScaling={false} style={itemStyle.label}>
                                {label}
                            </Text>
                    }
                    <Text allowFontScaling={false} style={itemStyle.contain}>
                        {txt}
                    </Text>
                    {
                        isAllow &&
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    }
                </View>
            </View>
        </TouchableOpacity>
    }
}
const itemStyle = StyleSheet.create({
    box: {
        width: px(750),
        height: px(80),
        backgroundColor: '#fff'
    },
    label: {
        flex: 1,
        fontSize: px(25),
        color: '#222'
    },
    contain: {
        fontSize: px(26),
        width: px(200),
        textAlign: 'right',
        color: '#d0648f'
    },
    comItem: {
        flex: 1,
        width: px(726),
        marginLeft: px(24),
        paddingRight: px(24)
    },
    openTip: {
        width: px(42)
    },
    tipDec: {
        width: px(26),
        height: px(26),
        fontSize: px(20),
        overflow: 'hidden',
        borderRadius: px(13),
        borderColor: '#858385',
        borderWidth: px(1),
        color: '#858385',
        textAlign: 'center',
        //marginLeft: px(8),
    },
    extra: {
        fontSize: px(20),
        color: '#858385',
        //flex: 1,
        textAlign: 'right'
    },
    rightExtra: {
        justifyContent: 'space-between',
        paddingVertical: px(23)
    }
})
