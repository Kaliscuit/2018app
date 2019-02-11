'use strict';

import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import Page from '../../UI/Page'
import { deviceWidth, px } from '../../utils/Ratio';
import request from '../../services/Request';
import { Header } from '../common/Header'
import base from "../../styles/Base"
import Button, { EButton } from "../../UI/lib/Button"
import Icon from '../../UI/lib/Icon';
import { log, logWarm, logErr } from '../../utils/logs'

export default class extends Page {

    title = "邀请VIP"

    pageBody() {
        return <ScrollView style={style.scroll}>
            <View style={style.box}>
                <Text style={style.h1}>为什么要邀请达令家VIP？</Text>
                <View style={style.h2}>
                    <Text style={style.h3}>1、提升店主效率：</Text>
                    <Text style={style.txt}>梳理客户，维系关系，让店主更好地服务自己的客户</Text>
                    <Text style={style.h3}>2、提升客户购物感受：</Text>
                    <Text style={style.txt}>成为VIP后登录APP, 活动全掌握，购物体验更佳</Text>
                </View>
                <Text style={style.h1}>如何邀请好友注册达令家VIP？ </Text>
                <View style={style.h2}>
                    <Text style={style.txt}>方法一：分享邀请链接或新人专享商品链接给好友，好友可以轻松在微信内完成注册；</Text>
                    <Text style={style.txt}>方法二：在店铺页复制邀请码，让好友到应用市场下载达令家App，使用您的邀请码注册达令家VIP。</Text>
                </View>
                <Text style={style.h1}>邀请VIP注意事项：</Text>
                <View style={style.h2}>
                    <Text style={style.txt}>1、新店主注册后即可邀请VIP，反之退店则失去店主权益，VIP邀请也将失效</Text>
                    <Text style={style.txt}>2、若好友注册时邀请码输入错误绑定他人，可于7天内登录达令家App，进入我的个人资料内进行换绑。（代金券不会重复发放）</Text>
                </View>
                <View style={style.line}></View>
            </View>
        </ScrollView>
    }
}

const style = StyleSheet.create({
    scroll:{
        flex: 1,
        backgroundColor: "#fff"
    },
    box: {
        paddingHorizontal: 15,
        backgroundColor: "#fff"
    },
    line: {
        height: 20,
    },
    h1: {
        marginTop: 35,
        fontSize: px(36),
        color: "#222",
    },
    h2: {
        marginTop: 15,
    },
    h3: {
        fontSize: px(28),
        lineHeight: 22,
        color: "#222",
        fontWeight: "700",
        marginTop: 4,
    },
    txt: {
        fontSize: px(28),
        color: "#666",
        lineHeight: 22,
        marginTop: 4,
    },
    img1: {
        marginTop: 5,
        width: 344.5,
        height: 277,
    }
})