'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Platform,
    Dimensions
} from 'react-native';

import { NavigationActions, StackActions } from 'react-navigation';
import { TopHeader } from '../common/Header'
import { px } from '../../utils/Ratio';
import Page from "../../UI/Page"
import { log, logErr, logWarm } from '../../utils/logs'
import base from "../../styles/Base"
import Icon from "../../UI/lib/Icon"
import { show as toast } from '../../widgets/Toast';
import Button, { EButton } from "../../UI/lib/Button"
import Api, { User, login, logOut } from '../../services/Api';
import request, { setHeader, domain } from '../../services/Request';
import { isWXAppInstalled, sendAuthRequest } from '../../services/WeChat';

const deviceWidth = Dimensions.get('window').width;

export default class extends Page {

    title = "注册成功"

    pageBody() {
        return <View style={style.body}>
            <Icon name="reg_end_top" style={style.top} />
            <View style={style.box}>
                <Text style={style.tit}>绑定微信后可在微信端下单</Text>
                <Button onPress={() => this.bind()} round={true} style={style.btn1} txtStyle={style.btnTxt1} value="现在绑定" />
                <EButton onPress={() => this.gonext()} round={true} style={style.btn2} txtStyle={style.btnTxt2} value="暂不绑定" />
            </View>
        </View>
    }
    async bind() {
        let installed = await isWXAppInstalled();
        if (!installed) {
            toast('没有安装微信');
            return;
        }
        let wxRes;
        try {
            wxRes = await sendAuthRequest('snsapi_userinfo', '');
        } catch (e) {
            logWarm(e.message)
            return;
        }
        try {
            let res = await Api.bindWechat(wxRes.code)
            toast('绑定成功');
            this.gonext();
        } catch (error) {
            toast(error.message)
        }
    }

    gonext() {
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'HomePage' })
            ]
        }))
    }
}

const style = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: "#fff",
    },
    top: {
        width: deviceWidth,
        height: px(542),
    },
    box: {
        marginTop: 10,
        // justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15
    },
    tit: {
        fontSize: px(36),
        color: "#c9a760",
        marginBottom: 20,
    },
    btn1: {
        backgroundColor: "#c9a760",
        borderColor: "#c9a760",
        marginBottom: 20,
        width: 330
    },
    btn2: {
        borderColor: "#c9a760",
        width: 330
    },
    btnTxt1: {
        color: "#fff",
        fontSize: px(36),
    },
    btnTxt2: {
        color: "#c9a760",
        fontSize: px(36),
    },
})