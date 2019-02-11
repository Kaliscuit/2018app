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
    KeyboardAvoidingView,
    Platform,
    NativeModules,
    DeviceEventEmitter,
    BackHandler,
    PixelRatio,
    Keyboard
} from 'react-native';

import { NavigationActions, StackActions } from 'react-navigation';
import DismissKeyboard from 'dismissKeyboard';
import { px } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import request, { domain, setHeader, get, getHeader } from '../../services/Request';
import { setItem, getItem, removeItem } from '../../services/Storage';
import { User, login2, logOut } from '../../services/Api';
import CartList from '../../services/Cart'
import { Header } from '../common/Header'

import { isWXAppInstalled, sendAuthRequest } from '../../services/WeChat';
import { log, logErr, logWarm } from '../../utils/logs'
import { DialogModal, LoginProtocol } from '../common/ModalView'
import { ImagesRes } from "../../utils/ContentProvider";
import Icon from '../../UI/lib/Icon'
import Page from "../../UI/Page"

import Loading from '../../animation/Loading';
import Router from "../../services/Router"

const pxRatio = PixelRatio.get();  // 屏幕像密度
const App = NativeModules.AppModule;

export default class extends Page {

    constructor(props) {
        super(props, {
            valid: false,
            isRegShow: 0,
            showTip: false,
            tel: ''
        });
        this.isPass = true;
        this.onBackPressed = this.onBackPressed.bind(this);
        this.eventCaptcha = this.eventCaptcha.bind(this);

    }

    pageHeader() {
        return <Header navigation={this.props.navigation} onBack={() => this._leftBtnOnPress()} />
    }
    pageBody() {
        const { isRegShow } = this.state
        return (
            <View style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={DismissKeyboard}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>

                        <View style={{ backgroundColor: '#fff', flex: 1, alignItems: 'center' }}>
                            <Icon
                                name="logo_new"
                                style={{
                                    width: px(220),
                                    height: px(130),
                                    marginTop: px(170),
                                    marginLeft: px(50),
                                    marginBottom: px(80)
                                }} />
                            <View style={[styles.input, { marginBottom: px(12) }]}>
                                <TextInput style={styles.inputTxt}
                                    placeholder='请输入手机号' placeholderTextColor="#b2b3b5"
                                    maxlength={11} keyboardType="numeric"
                                    clearButtonMode='while-editing'
                                    value={this.state.tel}
                                    onChangeText={(v) => this.setState({ tel: v })}
                                    onBlur={() => this.checkTell()}
                                    underlineColorAndroid="transparent" />
                            </View>
                            <View style={[styles.input, { marginBottom: this.state.showTip ? 1 : px(42) }]}>
                                <TextInput style={styles.inputTxt}
                                    placeholder='请输入验证码' placeholderTextColor="#b2b3b5"
                                    maxLength={10} keyboardType="numeric"
                                    onChangeText={(v) => this.setState({ code: v })}
                                    underlineColorAndroid="transparent" />
                                <Text allowFontScaling={false} style={this.state.sent ? styles.sent : styles.send}
                                    onPress={() => this.sendCode()}>
                                    {this.state.sent ?
                                        `重新获取${this.state.timeout}S` :
                                        `获取验证码`
                                    }
                                </Text>
                            </View>
                            {this.state.showTip && <View style={[styles.input, styles.rows, { marginBottom: px(42) }]}>
                                <TouchableOpacity onPress={() => this.voiceSms()}>
                                    <Text style={{
                                        fontSize: px(26),
                                        color: '#000'
                                    }}>获取语音验证码</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.tips()}>
                                    <Text style={styles.outText}>收不到验证码?</Text>
                                </TouchableOpacity>
                            </View>}
                            <TouchableOpacity activeOpacity={0.8} onPress={() => this.submit()}>
                                <View testId="loading"
                                    style={[styles.btn, { backgroundColor: this.isValid() ? '#d0648f' : '#b2b5b5' }]}>
                                    <Text allowFontScaling={false} style={{ fontSize: px(30), color: '#fff' }}>
                                        登录
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* <View style={styles.xieyiBox}>
                                <Text style={styles.xieyi1}>
                                    登录代表您已阅读并同意
                                    <Text style={styles.xieyi2}>达令家用户服务协议</Text>
                                    内容
                                </Text>
                            </View> */}

                            {this.state.isWXAppInstalled &&
                                <View testId="wloading" style={{ marginTop: px(60) }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                        activeOpacity={0.8}
                                        onPress={() => this.loginWeChat()}>
                                        <Image source={{ uri: require('../../images/icon-wechat') }}
                                            style={{ width: px(38), height: px(38), marginRight: px(13) }} />
                                        <Text allowFontScaling={false}
                                            style={{ color: '#679d5e', fontSize: px(28) }}>微信登录</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
                <DialogModal ref='dialog'
                    bodyStyle={styles.alertBody} />
                <Loading ref="loading" />
                <LoginProtocol ref='protocol' login1={this.loginByVip.bind(this)} login2={this.activeShopAndLogin.bind(this)} navigation={this.props.navigation} />
            </View>
        );
    }

    // pageFooter() {
    //     return
    // }

    async onLoad() {
        await logOut();
    }

    async onReady() {
        let installed = await isWXAppInstalled();
        this.setState({
            'isWXAppInstalled': installed
        })
        DeviceEventEmitter.addListener('EventCaptcha', this.eventCaptcha);
        BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('EventCaptcha', this.eventCaptcha);
        if (this.timer) {
            clearInterval(this.timer);
        }
        BackHandler.removeEventListener("hardwareBackPress", this.onBackPressed);
    }

    _leftBtnOnPress() {
        if (!this.props.navigation.state || !this.props.navigation.state.params) {
            this.props.navigation.goBack();
        } else {
            const actionType = this.props.navigation.state.params.actionType;
            if (actionType && actionType === 'tabType') {
                this.goTabPage();
            } else {
                this.props.navigation.goBack();
            }
        }
    }

    /**
     * 处理Android物理返回键
     * @returns {boolean}
     */
    onBackPressed() {
        this._leftBtnOnPress(); // 回到首页
        return true;
    }

    checkTell(tell) {
        if (!tell) tell = this.state.tel;
        tell = tell.match(/[0-9]+/g)
        if (!tell || tell.constructor !== Array) tell = []
        tell = tell.join("");
        this.setState({ tel: tell })
    }

    tips() {
        this.refs.dialog.alert([
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

    lock = false;

    eventCaptcha({ validate }) {
        let pageName = Router.current();
        if (pageName != 'LoginPage') return;
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

        if (!this.state.tel || this.state.tel.length != 11) {
            toast('请输入正确的手机号');
            return;
        }

        let that = this;
        let isPass = true;
        try {
            let data = await request.post(`/auth/login/captchaEnabled.do`, {
                mobile: that.state.tel
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

    async sendCode() {
        if (this.state.sent) {
            return;
        }
        if (!this.state.tel || this.state.tel.length != 11) {
            toast('请输入正确的手机号');
            return;
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
                mobile: that.state.tel
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

    voiceSmsTime = 0
    async sendVoiceSms(viftcode, randStr = "") {
        try {
            let res = await request.get(`${domain}/xc_uc/api/register/app/speechVerifyCode.do?mobile=${this.state.tel}&validate=${viftcode}&randStr=${randStr}`);
            this.voiceSmsTime = Date.now();
            toast(res);
        } catch (e) {
            this.voiceSmsTime = 0;
            toast(e.message);
        }
    }

    async postCode(viftcode, randStr = "") {
        try {
            let res = await request.post(domain + `/xc_uc/api/register/app/smsVerifyCode.do`, {
                mobile: this.state.tel,
                validate: viftcode,
                randStr
            });
            this.startTimer();
            toast(res);
        } catch (e) {
            toast(e.message);
        }
    }

    startTimer() {
        this.setState({
            'sent': Date.now(),
            'timeout': 60
        });
        this.timer = setInterval(() => {
            let elapsed = Math.ceil((Date.now() - this.state.sent) / 1000);
            if (elapsed > 30) {
                this.setState({
                    showTip: true
                });
            }
            if (elapsed > 59) {
                this.setState({
                    'sent': null,
                    'timeout': null,
                    showTip: true
                });
                clearInterval(this.timer);
                delete this.timer;
            } else {
                this.setState({
                    'timeout': 60 - elapsed
                });
            }
        }, 100);
    }

    isValid() {
        return !!(
            this.state.tel && this.state.tel.length == 11 &&
            this.state.code
        );
    }

    async submit() {
        if (this.loading) return;
        this.loading = true;
        // back
        Keyboard.dismiss();
        //内容检查
        if (!this.isValid()) return;
        try {
            let res = await request.post(domain + `/xc_uc/api/register/app/smsLogin.do`, {
                verifyCode: this.state.code,
                mobile: this.state.tel,
            });
            this.loginEnd(res, "RegCodePage");
        } catch (e) {
            toast(e.message);
        } finally {
            this.loading = false;
        }
    }
    async loginByVip(token, cb) {
        try {
            let res = await request.post(`${domain}/xc_uc/api/register/app/confirmActiveShop.do`, {
                sessionToken: token,
                activeShopYn: 'N'
            })
            cb()
            await this.loginEnd(res, "")
        } catch (e) {
            toast(e.message)
        }
    }

    async activeShopAndLogin(token, is, cb) {
        if (!is) {
            this.$toast("请先勾选同意协议，再领取金币和店主权益");
            return;
        }
        try {
            let res = await request.post(`${domain}/xc_uc/api/register/app/confirmActiveShop.do`, {
                sessionToken: token,
                activeShopYn: 'Y'
            })
            cb()
            await this.loginEnd(res, "")
        } catch (e) {
            toast(e.message)
        }
    }
    async loginEnd(res, next) {
        //第一次登录添加判断用的数据
        if (res.firstLogin) {
            setItem("home_first", "first");
            setItem("cart_first", "first");
        }
        if (res.uid) {
            toast('登录成功');
            await login2(res.uid, res.utoken);
            this.goTabPage();
            return;
        }
        if (res.nextStep == 'confirmActiveShop') {
            this.refs.protocol && this.refs.protocol.open(res.sessionToken);
            return;
        }
        this.go_(next, {
            sessionToken: res.sessionToken,
            nickName: res.nickName,
            headimgUrl: res.headimgUrl,
            unionid: res.unionid,
            bCanSkipBindInviteCode: res.bCanSkipBindInviteCode
        })
    }
    goTabPage() {
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: "HomePage" })
            ]
        }))
    }
    loading = false
    async loginWeChat() {
        this.refs.loading.open()
        this.loading = true;
        if (!this.loading) return;
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
            let authRes = await request.post(domain + `/xc_uc/api/register/app/wechat/loginAndRegister.do`, {
                code: wxRes.code,
            });
            this.loginEnd(authRes, "BindMobilePage");
        } catch (e) {
            toast(e.message);
        } finally {
            this.refs.loading.close()
            this.loading = false
        }
    }
}

const styles = StyleSheet.create({
    'input': {
        width: px(580),
        height: px(80),
        borderBottomWidth: px(1),
        borderBottomColor: '#e5e5e5',
        paddingLeft: px(12),
        paddingRight: px(12),
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    'inputTxt': {
        fontSize: px(26),
        color: '#252426',
        flex: 1
    },
    'send': {
        color: '#d0648f',
        fontSize: px(26),
        marginLeft: px(30)
    },
    'sent': {
        color: '#b2b5b5',
        fontSize: px(26),
        marginLeft: px(30)
    },
    'btn': {
        width: px(580),
        height: px(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: px(40)
    },
    'register': {
        color: '#b2b3b5',
        width: px(750),
        fontSize: px(24),
        paddingTop: px(20),
        paddingLeft: px(550),
    },
    alertBody: {
        alignItems: 'flex-start',
        justifyContent: "flex-start"
    },
    rows: {
        // justifyContent: 'flex-end',
        borderBottomWidth: 0
    },
    outText: {
        color: '#858385',
        fontSize: px(24),
    },


    xieyiBox: {
        paddingTop: 25,
    },
    xieyi1: {
        fontSize: px(22),
        color: "#222"
    },
    xieyi2: {
        fontSize: px(22),
        color: "#44b7ea"
    },
});
const modalStyles = StyleSheet.create({
    warp: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(36, 37, 38, 0.5)'
    },
    warpContent: {
        width: px(500),
        height: px(300),
        backgroundColor: '#fff',
        borderRadius: px(10),
        overflow: 'hidden',
        paddingTop: px(44),
    },
    textBox: {
        color: '#3b3b3b',
        fontSize: px(24),
        lineHeight: px(33),
        textAlign: 'center',
        paddingLeft: px(11),
        paddingRight: px(11)
    },
    close: {
        width: px(160),
        height: px(60),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: px(60),
        marginLeft: 'auto',
        marginRight: 'auto',
        overflow: 'hidden',
        borderRadius: px(8),
        backgroundColor: '#d0648f'
    },




})
