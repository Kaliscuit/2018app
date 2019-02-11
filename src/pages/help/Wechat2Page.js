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

    title = "帮助"

    pageBody() {
        return <ScrollView style={style.box}>
            <Text style={style.h1}>如何找到我的微信号?</Text>
            <View style={style.h2}>
                <Text style={style.txt}>1.点击手机上的微信，打开并登录自己的微信。 </Text>
                <Text style={style.txt}>2.在微信界面上，点击右下角的“我”，进入相应界面。看到自己的头像和昵称，昵称下即是微信号。</Text>
            </View>
            <Icon name="help-wx" style={style.img1} resizeMode="contain" />
            <View style={style.line}></View>
        </ScrollView>
    }
}

const style = StyleSheet.create({
    box: {
        paddingHorizontal: 15,
    },
    line: {
        height: 20,
    },
    h1: {
        marginTop: 30,
        fontSize: px(36),
        color: "#222",
    },
    h2: {
        marginTop: 20,
    },
    txt: {
        fontSize: px(28),
        color: "#666",
        lineHeight: 15
    },
    img1: {
        marginTop: 5,
        width: deviceWidth - 30,
        height: 277,
    }
})