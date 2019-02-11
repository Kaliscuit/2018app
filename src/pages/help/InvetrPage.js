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
            <Text style={style.h1}>如何添加我的邀请人为微信好友？</Text>
            <View style={style.h2}>
                <Text style={style.txt}>1.点击达令家App我的邀请人界面“保存二维码”。 </Text>
                <Text style={style.txt}>2.打开微信，点击右上角的“+”，“扫一扫”进入扫码页。</Text>
            </View>
            <Icon resizeMode="contain" name="help-inviter1" style={style.img1} />
            <View style={style.h2}>
                <Text style={style.txt}>3.然后点击右上角“从相册选取二维码”，选择刚才保存的我的邀请人图片。 </Text>
            </View>
            <Icon resizeMode="contain" name="help-inviter2" style={style.img1} />
            <View style={style.h2}>
                <Text style={style.txt}>4.在打开的界面点击“添加到通讯录”，填写相应信息，点击发送。</Text>
                <Text style={style.txt}>5.得到添加人的同意后，就可以愉快的跟邀请人联系啦~</Text>
            </View>
            <Icon resizeMode="contain" name="help-inviter3" style={style.img1} />
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
        lineHeight: 18
    },
    img1: {
        marginTop: 5,
        width: deviceWidth - 30,
        height: 277,
    }
})