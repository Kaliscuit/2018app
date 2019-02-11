'use strict';

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

import { deviceWidth, px } from '../../utils/Ratio';
import Icon from "../../UI/lib/Icon";
import Page from '../../UI/Page'
import Input from "../../UI/lib/Input"
import Button from "../../UI/lib/Button"
import { logWarm } from '../../utils/logs'
import base from "../../styles/Base"
import request, { get, domain } from '../../services/Request';
import tools from "../../utils/tools"

export default class extends Page {

    constructor(props) {
        super(props, {
            codeTxt: "获取验证码",
            code: "",
            hasTip: false,
            mobile: props.navigation.state.params.mobile
        })
    }

    title = "输入验证码"

    backgroundColor = "#fff";
    pageBody() {
        return <View style={style.box}>
            <Text style={style.tit}>验证码发送手机</Text>
            <Text style={style.tit}>{tools.mobile(this.state.mobile)}</Text>
            <View style={[base.inline, style.row]}>
                <Input placeholder="请输入验证码" keyboardType="numeric" onChangeText={(v) => this.setState({ code: v })} style={style.inpu} />
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.sendCode()}>
                    <Text style={style.code}>{this.state.codeTxt}</Text>
                </TouchableOpacity>
            </View>
            {this.state.hasTip && <View style={base.right}>
                <TouchableOpacity onPress={this.help.bind(this)}>
                    <Text styke={style.tips}>收不到验证码</Text>
                </TouchableOpacity>
            </View>}
            <View style={style.btnBox}>
                <Button disabled={this.state.code == ""} onPress={() => this.next()} style={style.btn} value="下一步" />
            </View>
        </View>
    }

    timer = null;
    async sendCode() {
        if (this.timer) return;
        let count = 60;
        this.setCodeTxt(count);
        try {
            let res = await request.post(domain + `/xc_uc/uc/manager/my/sendVerifyCode.do`, {
                mobile: this.state.mobile,
            });
            this.$toast("已发送");
        } catch (e) {
            this.$toast(e.message);
            return;
        }
        this.timer = setInterval(() => {
            count--;
            this.setCodeTxt(count);
            if (count < 0) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }, 1000);
    }
    setCodeTxt(cc) {
        if (cc < 0) {
            this.setState({
                codeTxt: "获取验证码",
                hasTip: true
            })
        } else {
            this.setState({
                codeTxt: cc + "s",
            })
        }
    }
    help() {
        this.$alert("收不到验证码?", [
            "1.请检查手机号手机号输入是否正确,港澳台及海外手机号请填写国际区号,再填写手机号码;",
            "2.如果安装了360卫视、安全管家、QQ管家等软件，请进入软件查询拦截记录，并将达令家短信设为信任后重试；",
            "3.请您清除手机缓存后重新获取;",
            "4.请确认您是否退订过"
        ], "关闭", "联系客服换绑");
    }
    async next() {
        try {
            let res = await request.post(domain + "/xc_uc/uc/manager/my/confirmVerifyCode.do", {
                mobile: this.state.mobile,
                verifyCode: this.state.code
            })
            this.go_("ChangeCodePage", { sessionToken: res.sessionToken });

        } catch (error) {
            this.$toast(error.message);
        }
    }
}
const style = StyleSheet.create({
    box: {
        flex: 1,
        marginTop: 40,
        paddingHorizontal: 15,
    },
    tit: {
        color: "#666",
        fontSize: px(32),
        lineHeight: 24
    },
    row: {
        borderBottomWidth: 1,
        borderColor: "#efefef",
        marginVertical: 20,
    },
    inpu: {
        flex: 1,
        height: 30,
        padding: 0,
        fontSize:px(30)
    },
    code: {
        width: 100,
        textAlign: "center",
        color: "#d0648f"
    },
    tips: {
        color: "#858385",
        fontSize: px(26)
    },
    btnBox: {

    },
    btn: {
        marginVertical: 15,
        borderRadius: 5
    }
})