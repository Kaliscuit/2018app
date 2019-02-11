/**
 * Created by zhaoxiaobing on 2017/9/1.
 */


'use strict';

import React from 'react';

import {
    Text,
    TextInput,
    Button,
    View,
    Image,
    FlatList,
    Picker,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    ScrollView
} from "react-native";

//let PickerItemIOS = PickerIOS.Item;
import { px } from "../../../utils/Ratio";
import { get } from "../../../services/Request";
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
            bankList: [],
            second: this.second,
            pickerStatus: false,
            requestStatus: false,
            enterInfo: {
                accountName: '',
                accountNo: '',
                bankCode: '',
                mobile: '',
                verifyCode: ''
            },
            status: true,
            btnStatus: true //获取验证码按钮状态
        }
    }
    
    async componentDidMount() {
        try {
            let res = await get(`/userBank/findUserBank.do`);
            let bankList = await get(`/unionpayBank/findBankList.do`);
            let bank = [{ bankCode: '', bankName: '请选择' }].concat(bankList)
            this.setState(Object.assign({}, res, {
                initloading: true,
                bankList: bank
            }));
        } catch (e) {
            toast(e.message);
        }
    }
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }
    
    selectBank(code) {
        let name = null;
        this.state.bankList.forEach(res => {
            if (res.bankCode == code) {
                name = res.bankName
            }
        });
        this.setState({
            bankCode: code,
            bankName: name
        });
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
            let res = await get(`/userBank/sendVerifyCode.do?mobile=${this.state.mobile}`);
            if (res.code == 0) {
                toast(res.message);
                this.Countdown();
            } else {
                toast(res.message);
            }
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
            accountName,
            accountNo,
            bankCode,
            mobile,
            verifyCode] = [
            this.clearSpace(this.state.accountName),
            this.clearSpace(this.state.accountNo),
            this.clearSpace(this.state.bankCode),
            this.clearSpace(this.state.mobile),
            this.clearSpace(this.state.verifyCode)
        ];
        if (!accountName) {
            toast('姓名不能为空');
            return;
        }
        if (!accountNo) {
            toast('银行卡号不能为空');
            return;
        }
        if (accountNo.match(/\*/)) {
            toast('银行卡号不能为空');
            return;
        }
        if (!/^[0-9]*$/.test(accountNo)) {
            toast('银行卡号格式不正确'); return;
        }
        //if(!/^(\d{18}|\d{17}X|\d{15})$/gmi.test(accountNo)){ toast('银行卡号格式不正确'); return; }
        if (!bankCode) {
            toast('请选择银行');
            return;
        }
        if (!mobile) {
            toast('手机号码不能为空');
            return;
        }
        if (!/^1\d{10}$/.test(mobile)) {
            toast('手机号码格式不正确');
            return;
        }
        if (!verifyCode) {
            toast('验证码不能为空');
            return;
        }
        
        this.setState({
            requestStatus: true
        });
        try {
            let res = await get(`/userBank/modiUserBank.do?accountName=${accountName}&accountNo=${accountNo}&bankCode=${bankCode}&mobile=${mobile}&verifyCode=${verifyCode}`);
            //this.props.navigation.goBack();
            this.props.navigation.state.params.callback && this.props.navigation.state.params.callback();
            this.props.navigation.goBack();
        } catch (e) {
            toast(e.message);
        } finally {
            this.setState({
                requestStatus: false
            });
        }
    }
    pickerSty(sty) {
        return <Picker
            style={sty}
            selectedValue={this.state.bankCode}
            onValueChange={this.selectBank.bind(this)}>
            {this.state.bankList.map(res => <Picker.Item style={styles.picker1Sty} key={res.bankCode} label={res.bankName} value={res.bankCode} />)}
        </Picker>;
    }
    render() {
        let bankListDom = null;
        if (Platform.OS === 'android') {
            bankListDom = <TouchableOpacity activeOpacity={0.8}>
                <View style={styles.view1}>
                    <Text allowFontScaling={false} style={styles.sty1}>开户银行</Text>
                    {this.pickerSty([styles.picker1])}
                </View>
            </TouchableOpacity>
        } else {
            bankListDom = <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ pickerStatus: true })}>
                <View style={styles.view1}>
                    <Text allowFontScaling={false} style={styles.sty1}>开户银行</Text>
                    <Text allowFontScaling={false} style={[styles.sty1, styles.bankName]}>{this.state.bankName}</Text>
                </View>
            </TouchableOpacity>
        }
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <TopHeader navigation={this.props.navigation}
                title="提现银行卡"></TopHeader>
            {this.state.pickerStatus
                ? <View style={styles.picker_box}>
                    <View style={styles.tab}>
                        <TouchableOpacity style={styles.tab_view1} onPress={() => this.setState({ pickerStatus: false })}>
                            <Text allowFontScaling={false} style={styles.tab_txt1}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab_view1} onPress={() => this.setState({ pickerStatus: false })}>
                            <Text allowFontScaling={false} style={styles.tab_txt2}>确定</Text>
                        </TouchableOpacity>
                    </View>
                    {this.pickerSty([styles.picker2])}
                </View>
                : <View></View>
            }
            <ScrollView keyboardShouldPersistTaps="never">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                    {this.state.initloading
                        ? <View style={styles.main_box}>
                            <View style={styles.view0}>
                                <Text allowFontScaling={false} style={styles.sty0}>1.如持卡人非店主本人，或者银行卡信息与卡号不符，将影响资金提现</Text>
                                <Text allowFontScaling={false} style={styles.sty0}>2.仅可使用储蓄卡，请不要填写信用卡</Text>
                            </View>
                            <View style={styles.view1}>
                                <Text allowFontScaling={false} style={styles.sty1}>户名</Text>
                                <TextInput
                                    style={styles.sty2}
                                    value={this.state.accountName}
                                    placeholder='请输入户名'
                                    onChangeText={res => this.setState({ accountName: res })}
                                    underlineColorAndroid="transparent">
                                </TextInput>
                            </View>
                            <View style={styles.view1}>
                                <Text allowFontScaling={false} style={styles.sty1}>银行卡号</Text>
                                <TextInput
                                    style={styles.sty2}
                                    placeholder='请输入银行卡号'
                                    onChangeText={res => this.setState({ accountNo: res })}
                                    underlineColorAndroid="transparent">
                                </TextInput>
                            </View>
                            {bankListDom}
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
                        
                        </View>
                        : <LoadingInit />
                    }
                </KeyboardAvoidingView>
            </ScrollView>
            <TouchableOpacity style={styles.submitBox} activeOpacity={0.8} onPress={() => this.onSubmit()}>
                <Text allowFontScaling={false} style={styles.submit}>
                    提交
                </Text>
            </TouchableOpacity>
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
    bankName: {
        flex: 1
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
        borderColor: '#d0648f'
    },
    btn1: {
        color: '#d0648f',
        fontSize: px(26),
    },
    view2: {
        marginTop: px(20)
    },
    picker_ios: {
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    main_box: {
        flex: 1,
        position: 'relative',
        zIndex: 0,
        alignItems: 'center'
    },
    picker_box: {
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    tab: {
        flexDirection: 'row',
        height: px(90),
        backgroundColor: '#d0648f'
    },
    tab_view1: {
        flex: 1,
        justifyContent: 'center'
    },
    tab_txt1: {
        textAlign: 'left',
        fontSize: px(30),
        color: '#fff',
        paddingLeft: px(30),
    },
    tab_txt2: {
        
        textAlign: 'right',
        fontSize: px(30),
        color: '#fff',
        paddingRight: px(30),
    },
    picker1: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'flex-end'
    },
    picker2: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        justifyContent: 'flex-end'
    },
    disabled: {
        borderColor: '#aaa'
    },
    disabledTxt: {
        color: '#aaa'
    },
    submitBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: px(80),
        backgroundColor: '#d0648f',
        justifyContent: 'center',
        alignItems: 'center'
    },
    submit: {
        color: '#fff',
        fontSize: px(28)
    }
});
