'use strict';

import React from 'react';
import { NavigationActions, StackActions } from 'react-navigation';
import { DeviceEventEmitter, NativeModules, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { logOut, login2 } from "../../services/Api";
import request, { domain, getHeader } from '../../services/Request';
import base from "../../styles/Base";
import Button from "../../UI/lib/Button";
import Input from "../../UI/lib/Input";
import Page from "../../UI/Page";
import { px } from '../../utils/Ratio';
import { show as toast } from "../../widgets/Toast";
import CircleHeader from "../common/CircleHeader";
import Background from '../../UI/lib/Background';
import { log } from "../../utils/logs";
import Router from "../../services/Router";


const App = NativeModules.AppModule;

export default class extends Page {


    constructor(props) {
        if (!props.navigation) props.navigation = { state: { params: {} } };
        if (!props.navigation.state.params) props.navigation.state.params = {};
        super(props, {
            nickName: props.navigation.state.params.nickName,
            headimgUrl: props.navigation.state.params.headimgUrl,
            codeTxt: "获取验证码",
            tell: "",
            code: "",
            hasTip: false,
        })
        this.sessionToken = props.navigation.state.params.sessionToken;
        this.isPass = true;
        this.eventCaptcha = this.eventCaptcha.bind(this);
    }

    title = "绑定手机"
    backgroundColor = "#fff";

    pageBody() {
        return <ScrollView keyboardDismissMode="on-drag">
            <View style={style.body}>
                <View style={base.line}>
                    <CircleHeader headerStyle={style.headimg} imgSource={this.state.headimgUrl} />
                </View>
                <View style={[base.inline, style.top]}>
                    <Text style={style.topTxt}>亲爱的{this.state.nickName},请关联您的手机号</Text>
                </View>
                <View style={[base.inline, style.row]}>
                    <View style={[base.inline_left, style.inp]}>
                        <Input keyboardType="numeric" placeholder="请输入手机号" onChangeText={(v) => this.setState({ tell: v })} style={{ flex: 1, padding: 0, fontSize: px(30) }} />
                    </View>
                </View>
                <View style={[base.inline, style.row]}>
                    <View style={[base.flex_between, style.inp]}>
                        <Input keyboardType="numeric" placeholder="请输入验证码" onChangeText={(v) => this.setState({ code: v })} style={{ flex: 1, padding: 0, fontSize: px(30) }} />
                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.sendCode()}>
                            <Text style={style.codeTxt}>{this.state.codeTxt}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.hasTip && <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 15,
                }}>
                    <TouchableOpacity onPress={() => this.voiceSms()}>
                        <Text style={{
                            fontSize: px(26),
                            color: '#000'
                        }}>获取语音验证码</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.tips.bind(this)}>
                        <Text style={style.wen}>收不到验证码?</Text>
                    </TouchableOpacity>
                </View>}
                <Button onPress={() => this.submit()} disabled={this.state.code == ""} style={style.btn} value="确认绑定" />
                {/* <View style={style.xieyiBox}>
                <Text style={style.xieyi1}>
                    登录代表您已阅读并同意
                    <Text style={style.xieyi2}>达令家VIP用户服务协议</Text>
                    内容
                </Text>
            </View> */}
            </View>
        </ScrollView>
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('EventCaptcha', this.eventCaptcha);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    async onReady() {
        DeviceEventEmitter.addListener('EventCaptcha', this.eventCaptcha);
    }
    tips() {
        this.$alert([
            "1.尝试获取语音验证码；",
            "2.请切换网络，重新获取验证码；",
            "3.查看是否有短信拦截；",
            "4.重新启动手机，然后再次获取验证码；",
            "5.每个手机号每天只能获取20次验证码，",
            "    如果今日已超过次数请明天再尝试；",
            "6.是否为国外手机号，国外手机号不支持",
            "    获取验证码；",
            "7.以上情况都不是或者携号转网的用户请",
            "    联系客服；"
        ])
    }
    timer = null;
    lock = false;
    async sendCode() {
        if (this.timer) return;
        if (!/^[1]{1}[0-9]{10}$/.test(this.state.tell)) {
            return toast("手机号不正确")
        }

        if (this.lock) return;
        this.lock = true;
        let timer = setTimeout(() => {
            this.lock = false;
            if (timer) clearTimeout(timer);
        }, 500);


        let that = this;
        try {
            let data = await request.post(`/auth/login/captchaEnabled.do`, {
                mobile: that.state.tell
            })
            that.isPass = data;
        } catch (e) {
            toast(e.message);
            that.isPass = true;
        }

        let viftcode = 'null';
        if (this.isPass) {
            //验证码验证
            if (App.startValidateV2) {
                let version = getHeader("version");
                let version_ = version.replace(/\./g, '') * 1;
                if (version_ < 107) {
                    this.smsType = 'text'
                    App.startValidateV2('044b32fa23d64765a23c1e9f9ac37b10');
                } else {
                    this.smsType = 'text'
                    App.startValidateV2('2083786765');
                }
            }
            if (App.startValidate) {
                let version = getHeader("version");
                let version_ = version.replace(/\./g, '') * 1;
                try {
                    if (version_ < 107) {
                        this.smsType = null
                        viftcode = await App.startValidate('044b32fa23d64765a23c1e9f9ac37b10');
                        if (viftcode) this.postCode(viftcode);
                    } else {
                        this.smsType = null
                        viftcode = await App.startValidate('2083786765');
                        if (viftcode) this.eventCaptcha({ validate: viftcode })
                    }
                } catch (e) {
                    log(e.message)
                }
            }

        } else {
            this.postCode(viftcode);
        }

    }

    async postCode(viftcode, randStr = "") {
        try {
            let data = await request.post(`${domain}/xc_uc/api/register/app/wechat/smsVerifyCode.do`, {
                mobile: this.state.tell,
                validate: viftcode,
                randStr
            });
            toast("已发送")
            let count = 60;
            this.setCodeTxt(count);
            this.timer = setInterval(() => {
                count--;
                this.setCodeTxt(count);
                if (count < 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            }, 1000);
        } catch (e) {
            toast(e.message);
        }
    }

    smsType = null
    async voiceSms() {
        if (this.voiceSmsTime) {
            let time = Date.now() - this.voiceSmsTime;
            let second = parseInt(time / 1000)
            if (second >= 60) {
                this.voiceSmsTime = 0
            } else {
                let x = 60 - second
                toast(`${x}s后可重新获取`)
                return;
            }
        }
        if (!/^[1]{1}[0-9]{10}$/.test(this.state.tell)) {
            return toast("手机号不正确")
        }

        let that = this;
        let isPass = true;
        try {
            let data = await request.post(`/auth/login/captchaEnabled.do`, {
                mobile: that.state.tell
            })
            isPass = data;
        } catch (e) {
            toast(e.message);
            isPass = true;
        }

        let viftcode = 'null';
        if (isPass) {
            //验证码验证
            if (App.startValidateV2) {
                let version = getHeader("version");
                let version_ = version.replace(/\./g, '') * 1;
                if (version_ < 107) {
                    this.smsType = 'voice'
                    App.startValidateV2('044b32fa23d64765a23c1e9f9ac37b10');
                } else {
                    this.smsType = 'voice'
                    App.startValidateV2('2083786765');
                }
            }
            if (App.startValidate) {
                let version = getHeader("version");
                let version_ = version.replace(/\./g, '') * 1;
                try {
                    if (version_ < 107) {
                        this.smsType = null
                        viftcode = await App.startValidate('044b32fa23d64765a23c1e9f9ac37b10');
                        if (viftcode) this.sendVoiceSms(viftcode);
                    } else {
                        this.smsType = null
                        viftcode = await App.startValidate('2083786765');
                        if (viftcode) this.eventCaptcha1({ validate: viftcode })
                    }
                } catch (e) {
                    log(e.message)
                }
            }
        } else {
            this.sendVoiceSms(viftcode);
        }
    }
    voiceSmsTime = 0
    async sendVoiceSms(viftcode, randStr = "") {
        try {
            let res = await request.get(`${domain}/xc_uc/api/register/app/wechat/speechVerifyCode.do?mobile=${this.state.tell}&validate=${viftcode}&randStr=${randStr}`);
            this.voiceSmsTime = Date.now();
            toast(res);
        } catch (e) {
            this.voiceSmsTime = 0;
            toast(e.message);
        }
    }
    setCodeTxt(cc) {
        if (cc < 0) {
            this.setState({
                codeTxt: "获取验证码",
            })
        } else {
            if (cc == 29) {
                this.setState({
                    codeTxt: cc + "s",
                    hasTip: true
                })
            } else {
                this.setState({
                    codeTxt: cc + "s",
                })
            }
        }
    }
    async submit() {
        try {
            let res = await request.post(domain + "/xc_uc/api/register/app/wechat/bindMobile.do", {
                sessionToken: this.sessionToken,
                mobile: this.state.tell,
                verifyCode: this.state.code
            });
            await logOut();
            if (res.unionid) {
                await login2(res.uid, res.utoken);
                this.gonext();
            } else {
                this.loginEnd(res, "RegCodePage");
            }
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
    loginEnd(res, next) {
        this.go_(next, {
            sessionToken: res.sessionToken,
            nickName: res.nickName,
            headimgUrl: res.headimgUrl,
            bCanSkipBindInviteCode: res.bCanSkipBindInviteCode,
            home: true
        })
    }

    eventCaptcha({ validate }) {
        let pageName = Router.current();
        if (pageName != 'BindMobilePage') return;
        if (this.smsType == 'voice') {
            this.eventCaptcha1({ validate })
            return;
        }
        log("收到返回的code", validate)
        if (validate.indexOf("{") >= 0) {
            validate = JSON.parse(validate);
            if (validate.ticket && validate.randstr) this.postCode(validate.ticket, validate.randstr);
        } else {
            this.postCode(validate);
        }
    }

    eventCaptcha1({ validate }) {
        log("收到返回的code", validate)
        if (validate.indexOf("{") >= 0) {
            validate = JSON.parse(validate);
            if (validate.ticket && validate.randstr) this.sendVoiceSms(validate.ticket, validate.randstr);
        } else {
            this.sendVoiceSms(validate);
        }
    }
}
const style = StyleSheet.create({
    body: {
        paddingHorizontal: 40,
    },
    headimg: {
        borderColor: "#efefef",
        marginTop: 30,
    },
    top: {
        paddingTop: 7,
        marginBottom: 40
    },
    topTxt: {
        color: "#222",
        fontSize: px(30),
    },
    row: {
        marginTop: 10,
        borderBottomWidth: 1,
        borderColor: "#efefef",
    },
    inp: {
        flex: 1,
        height: 40,

    },
    codeTxt: {
        color: "#d0648f"
    },
    btn: {
        height: 40,
        borderRadius: 20,
        marginTop: 15,
    },
    xieyiBox: {
        paddingTop: 25,
        alignItems: 'center',
    },
    xieyi1: {
        fontSize: px(22),
        color: "#222"
    },
    xieyi2: {
        fontSize: px(22),
        color: "#44b7ea"
    },
    wen: {
        color: "#999",
        fontSize: px(26)
    }
})