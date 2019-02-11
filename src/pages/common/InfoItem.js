'use strict';

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { deviceWidth, px } from '../../utils/Ratio';
import Icon from "../../UI/lib/Icon";

/**
 * 个人资料的小项
 * props.label
 * props.right
 * props.onPress
 */
export default class Item extends React.Component {

    static defaultProps = {
        label: "",
        right: true,
        color: "#858385",
        txt: "",
        onPress: () => { }
    }

    render() {
        return <TouchableOpacity activeOpacity={1} onPress={() => this.props.onPress()}>
            <View style={itemStyle.box}>
                <Text allowFontScaling={false} style={itemStyle.label}>{this.props.label}</Text>
                <View style={itemStyle.body}>
                    {!!this.props.txt &&
                        <Text allowFontScaling={false} style={[itemStyle.txt, { color: this.props.color }]}>{this.props.txt}</Text>
                    }
                    {this.props.children}
                    {this.props.right && <Icon style={itemStyle.icon} name="icon-mine-arrows-gray" />}
                </View>
            </View>
        </TouchableOpacity>
    }
}

const itemStyle = StyleSheet.create({
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: px(32),
        paddingHorizontal: px(24),
    },
    label: {
        color: '#222222',
        fontSize: px(30)
    },
    body: { flexDirection: 'row', alignItems: 'center' },
    txt: {
        color: '#858385',
        fontSize: px(26),
    },
    icon: {
        width: 8,
        height: 15,
        alignSelf: 'center',
        marginLeft: 6
    }
})