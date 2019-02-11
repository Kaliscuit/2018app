'use strict';

import React from 'react';

import {
    Text,
    TextInput,
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView
} from "react-native";

import { px } from "../../../utils/Ratio";
import { get, post } from "../../../services/Request";
import { show as toast } from '../../../widgets/Toast';
import { LoadingInit, LoadingRequest } from '../../../widgets/Loading';
import { TopHeader } from '../../common/Header'

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.second = 60;
        this.timer = null;
        this.state = {
            initloading: false,
            second: this.second,
            requestStatus: false,
            mobile: '',
            verifyCode: '',
            password: '',
            rePassword: '',
            status: true,
            btnStatus: true //获取验证码按钮状态
        }
    }

    async componentDidMount() {
        try {
            let res = await get(`/ucenter/toSetPaymentPassword.do`);
            this.setState(Object.assign({}, res, {
                initloading: true,
            }));
        } catch (e) {
            toast(e.message);
        }
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    Countdown() {
        if (this.state.second == 1) {
            this.setState({
                btnStatus: true,
                second: this.second
            });
            return;
        } else {
            this.setState({
                btnStatus: false
            });
        }
        let second = this.state.second;
        second--;
        this.setState({
            second
        });
        this.timer = setTimeout(this.Countdown.bind(this), 1000);
    }

    async verification_code() {
        if (!this.state.btnStatus || !this.state.status) {
            return
        }
        this.setState({
            status: !this.state.status,
            requestStatus: true
        });

        try {
            let res = await get(`/ucenter/sendVerifyCode.do?mobile=${this.state.mobile}`);
            toast(res);
            this.Countdown();
        } catch (e) {
            toast(e.message);
        } finally {
            this.setState({
                status: true,
                requestStatus: false
            });
        }
    }

    clearSpace(v) {
        if (!v) {
            return v;
        } else {
            return String(v).replace(/\s/g, '');
        }
    }

    async onSubmit() {
        let [
            rePassword,
            password,
            mobile,
            verifyCode] = [
            this.clearSpace(this.state.rePassword),
            this.clearSpace(this.state.password),
            this.clearSpace(this.state.mobile),
            this.clearSpace(this.state.verifyCode)
        ];
        if (!mobile) {
            return toast('手机号码不能为空');
        }
        if (!/^1\d{10}$/.test(mobile)) {
            toast('手机号码格式不正确');
            return;
        }
        if (!verifyCode) {
            return toast('请输入验证码');
        }
        if (!password) {
            return toast('请输入支付密码');
        }
        if (password.length < 6) {
            return toast('支付密码不能少于6位字符');
        }
        if (!rePassword) {
            return toast('请确认支付密码');
        }
        if (rePassword != password) {
            return toast('密码和确认密码不一致，请重新输入');
        }


        this.setState({
            requestStatus: true
        });
        try {
            // let res = await get(`/ucenter/setPaymentPassword.do?pwd=${password}&confirmPwd=${rePassword}&mobile=${mobile}&verifyCode=${verifyCode}`);
            let res = await post(`/ucenter/setPaymentPassword.do`, {
                pwd: password,
                confirmPwd: rePassword,
                mobile: mobile,
                verifyCode: verifyCode
            });
            toast('设置成功');
            this.props.navigation.state.params.call();
            this.props.navigation.goBack();
            //this.props.navigation.navigate('SetShopPage', {});
        } catch (e) {
            toast(e.message);
        } finally {
            this.setState({
                requestStatus: false
            });
        }
    }

    render() {
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <TopHeader navigation={this.props.navigation}
                title="设置支付密码"></TopHeader>
            <ScrollView keyboardShouldPersistTaps="never">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                    {this.state.initloading
                        ? <View style={styles.main_box}>
                            <View style={[styles.view1, styles.view2]}>
                                <Text allowFontScaling={false} style={styles.sty1}>手机号</Text>
                                <TextInput
                                    style={styles.sty2}
                                    value={this.state.mobile}
                                    editable={false}
                                    placeholder='请输入手机号'
                                    underlineColorAndroid="transparent">
                                </TextInput>
                            </View>
                            <View style={styles.view1}>
                                <Text allowFontScaling={false} style={styles.sty1}>验证码</Text>
                                <TextInput
                                    style={styles.sty2}
                                    placeholder='请输入验证码' keyboardType="numeric"
                                    onChangeText={res => this.setState({ verifyCode: res })}
                                    underlineColorAndroid="transparent">
                                </TextInput>
                                <TouchableOpacity activeOpacity={0.8} onPress={this.verification_code.bind(this)}>
                                    <View style={[styles.btn1Box, this.state.btnStatus ? '' : styles.disabled]}>
                                        {this.state.btnStatus
                                            ? <Text allowFontScaling={false} style={styles.btn1}>
                                                获取验证码
                                            </Text>
                                            : <Text allowFontScaling={false} style={[styles.btn1, styles.disabledTxt]}>
                                                重新获取({this.state.second})
                                            </Text>}
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.view1}>
                                <Text allowFontScaling={false} style={styles.sty1}>密码</Text>
                                <TextInput
                                    style={styles.sty2}
                                    placeholder='请输入支付密码(不少于6位)'
                                    secureTextEntry
                                    onChangeText={res => this.setState({ password: res })}
                                    underlineColorAndroid="transparent">
                                </TextInput>
                            </View>
                            <View style={styles.view1}>
                                <Text allowFontScaling={false} style={styles.sty1}>确认密码</Text>
                                <TextInput
                                    style={styles.sty2}
                                    secureTextEntry
                                    placeholder='请再次输入支付密码'
                                    onChangeText={res => this.setState({ rePassword: res })}
                                    underlineColorAndroid="transparent">
                                </TextInput>
                            </View>
                            <TouchableOpacity style={styles.submitBox} activeOpacity={0.8}
                                onPress={() => this.onSubmit()}>
                                <Text allowFontScaling={false} style={styles.submit}>
                                    提交
                                </Text>
                            </TouchableOpacity>
                        </View>
                        : <LoadingInit />
                    }
                </KeyboardAvoidingView>
            </ScrollView>
            <LoadingRequest status={this.state.requestStatus} />
        </View>;
    }
}


const styles = StyleSheet.create({
    view0: {
        width: px(750),
        backgroundColor: '#fcf0f3',
        paddingTop: px(10)
    },
    sty0: {
        fontSize: px(22),
        color: '#d0648f',
        paddingRight: px(35),
        paddingLeft: px(27),
        paddingBottom: px(10),
        lineHeight: px(33)
    },
    view1: {
        width: px(750),
        height: px(80),
        backgroundColor: '#fff',
        paddingHorizontal: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#f6f5f7',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sty1: {
        width: px(146),
        fontSize: px(28),
        color: '#252426'
    },
    sty2: {
        flex: 1,
        height: px(80),
        //lineHeight: px(80),
        textAlign: 'left',
        color: '#252426',
        fontSize: px(28)
    },
    btn1Box: {
        width: px(180),
        height: px(60),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: px(6),
        borderWidth: px(1),
        borderColor: '#e86d78'
    },
    btn1: {
        color: '#e86d78',
        fontSize: px(26),
    },
    view2: {
        marginTop: px(20)
    },
    main_box: {
        flex: 1,
        position: 'relative',
        zIndex: 0,
        alignItems: 'center'
    },
    disabled: {
        borderColor: '#aaa'
    },
    disabledTxt: {
        color: '#aaa'
    },
    submitBox: {
        width: px(690),
        height: px(80),
        backgroundColor: '#d0648f',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: px(30),
        marginRight: px(30),
        borderRadius: px(10),
        marginTop: px(50)
    },
    submit: {
        color: '#fff',
        fontSize: px(28)
    }
});
