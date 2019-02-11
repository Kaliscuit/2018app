import React from "react";

import {
    Image,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Clipboard,
    PixelRatio,
    TouchableWithoutFeedback
} from "react-native";

import { User } from "../services/Api"
import base from "../styles/Base"
import { px } from "../utils/Ratio"
import util_cools from '../utils/tools';

/**
 * 分享商品的文案
 */
export default function (props) {
    if (!User.vip) {
        return <View style={ShareStyle.shareBox}>
            <Text style={ShareStyle.shareTitle} allowFontScaling={false}>分享赚<Text style={{ fontWeight: '900' }}>￥{util_cools.parsePrice(props.money)}</Text></Text>
            <Text style={[ShareStyle.shareDesc, { marginTop: px(8) }]} allowFontScaling={false}>只要你的好友通过你的分享购买商品，</Text>
            <Text style={ShareStyle.shareDesc} allowFontScaling={false}>你就能赚到至少{util_cools.parsePrice(props.money)}元利润收入哦～</Text>
        </View>
    }
    if (User.vip) {
        return <View style={[base.line, { marginVertical: px(20) }]}>
            <Text style={ShareStyle.shareTitle} allowFontScaling={false}>分享商品</Text>
        </View>
    }
    return null;
}

const ShareStyle = StyleSheet.create({
    shareBox: {
        alignItems: 'center',
        // marginTop: px(25),
    },
    shareTitle: {
        fontSize: px(42),
        color: '#d0648f',
    },
    shareDesc: {
        fontSize: px(26),
        color: '#858385',
        textAlign: 'center',
        lineHeight: px(32)
    }
})