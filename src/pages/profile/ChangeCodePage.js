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
import Button, { EButton } from "../../UI/lib/Button"
import Input from "../../UI/lib/Input"
import { show as toast } from '../../widgets/Toast';
import request, { setHeader, domain } from '../../services/Request';
import { Viplogin, UpdateInviteCode } from '../../services/Api';
import tools from "../../utils/tools"

const deviceWidth = Dimensions.get('window').width;

export default class extends Page {

    constructor(props) {
        if (!props.navigation) props.navigation = { state: { params: {} } };
        if (!props.navigation.state.params) props.navigation.state.params = {};
        super(props, {
            inviteCode: "",
            bNeedInviteCode: props.navigation.state.params.bNeedInviteCode
        })
        this.sessionToken = props.navigation.state.params.sessionToken;
        this.utoken = props.navigation.state.params.utoken;
    }

    title = "绑定店铺"
    pageBody() {
        return <View style={style.body}>
            <Icon name="regcode-top" style={style.top} />
            <View style={style.box}>
                <View style={style.inBox}>
                    <Input onChangeText={(v) => this.setState({ inviteCode: v })} style={style.inp} placeholder="请输入店铺邀请码" />
                </View>
                <View style={style.tipBox}>
                    <TouchableOpacity onPress={() => this.what()}>
                        <Text style={style.whatTxt}>什么是店铺邀请码？</Text>
                    </TouchableOpacity>
                </View>
                <Button disabled={this.state.inviteCode.length < 3} onPress={() => this.check()} style={style.btn} txtStyle={style.btnTxt} value="提交" />
            </View>
        </View>
    }

    what() {
        let context = [
            "1.店主登录后可在“我的店铺”中查看",
            "店铺邀请码，您可以联系邀请您的",
            "店主获取其店铺邀请码；",
            "2.每个VIP用户可在本次绑定成功后7",
            "天内更换一次店铺绑定"
        ]
        this.$alert(null, context, "我已了解");
    }
    async check() {
        let context;
        try {
            let res = await request.get(domain + "/xc_uc/api/nl/shopByInviteCode.do", { inviteCode: this.state.inviteCode });
            if (res) {
                context = <View style={base.inline}>
                    <View style={style.headimgBox}>
                        <Image style={style.headimg} source={{ uri: res.shopImg }} />
                    </View>
                    <Text>{res.shopName}</Text>
                </View>
            }
        } catch (error) {
            toast(error.message);
            return;
        }
        this.$dialog("确认成为以下店铺VIP用户？", context, "取消", { txt: "确认", click: this.gobind.bind(this) });
    }
    async gobind() {
        try {
            let res = await request.get(domain + "/xc_uc/uc/manager/my/changeFollowerInviteCode.do", {
                inviteCode: this.state.inviteCode,
                sessionToken: this.sessionToken
            });
            toast("已更换邀请人");
            await tools.sleep(900);
            UpdateInviteCode();
            this.props.navigation.pop(3);
        } catch (error) {
            toast(error.message);
            return;
        }
    }
}

const style = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: "#fff",
    },
    top: {
        width: deviceWidth,
        height: px(468),
    },
    box: {
        marginTop: 40,
        paddingHorizontal: 15,
    },
    inBox: {
        height: 30,
        borderBottomWidth: 1,
        borderColor: "#efefef",
    },
    inp: {
        height: 30,
        padding: 0
    },
    tipBox: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    whatTxt: {
        color: "#c9a760",
    },
    btn: {
        marginTop: 30,
        backgroundColor: "#c9a760",
        borderRadius: 5
    },
    btnTxt: {
        fontSize: px(36)
    },
    nextBox: {
        alignItems: 'center',
    },
    next: {
        marginTop: 20,
        color: "#c9a760",
    },
    headimgBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
        marginRight: 10,
    },
    headimg: {
        width: 40,
        height: 40,
    }
})