/**
 * Created by zhaoxiaobing on 2017/8/30.
 */

'use strict';

import React from 'react';

import {
    Text,
    TextInput,
    Button,
    View,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";

import {
    px
} from "../../../utils/Ratio";

import request, {get, getHeader} from '../../../services/Request';
import Page from '../../../UI/Page'
import { show as toast } from '../../../widgets/Toast';
import { LoadingInit, LoadingRequest } from '../../../widgets/Loading';
import base from '../../../styles/Base';
import Icon from '../../../UI/lib/Icon';
import Background from '../../../UI/lib/Background';
import {SendMsgModal} from '../../common/ModalView';
import {getItem, setItem} from "../../../services/Storage";
import {log} from '../../../utils/logs'

class PutForward extends React.Component {
    
    render() {
        const { data, selected, version } = this.props
        return <View style={forwardStyles.box}>
            <Text allowFontScaling={false} style={forwardStyles.title}>提现到</Text>
            {
                version > 106 &&
                <View>
                    {
                        data.aliAccount ?
                            selected == 0 ? <TouchableWithoutFeedback onPress={() => this.props.select(0)}>
                                <Background name='ali-selected' style={[forwardStyles.selected, base.line, {marginBottom: px(20)}]}>
                                    <View style={[forwardStyles.comOpt1, forwardStyles.option1, base.inline_left]}>
                                        <Icon name="icon-forward1" style={forwardStyles.icon}/>
                                        <View style={forwardStyles.option_right}>
                                            <View style={base.inline_left}>
                                                <Text allowFontScaling={false} style={[forwardStyles.forwardTxt]}>
                                                        支付宝
                                                </Text>
                                                <View style={[forwardStyles.tui, base.inline]}>
                                                    <Text allowFontScaling={false} style={forwardStyles.tuiTxt}>
                                                            推荐
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text allowFontScaling={false} style={[forwardStyles.forwardTxt, forwardStyles.forwardTxt1]}>
                                                {data.aliAccount.nickName}
                                            </Text>
                                        </View>
                                    </View>
                                </Background>
                            </TouchableWithoutFeedback> :
                                <TouchableWithoutFeedback onPress={() => this.props.select(0)}>
                                    <View style={[forwardStyles.comunSelect, base.inline, {marginBottom: px(20)}]}>
                                        <View style={[forwardStyles.comOpt, forwardStyles.option1, base.inline_left]}>
                                            <Icon name="icon-forward1" style={forwardStyles.icon}/>
                                            <View style={forwardStyles.option_right}>
                                                <View style={base.inline_left}>
                                                    <Text allowFontScaling={false} style={[forwardStyles.forwardTxt]}>
                                                        支付宝
                                                    </Text>
                                                    <View style={[forwardStyles.tui, base.inline]}>
                                                        <Text allowFontScaling={false} style={forwardStyles.tuiTxt}>
                                                            推荐
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text allowFontScaling={false} style={[forwardStyles.forwardTxt, forwardStyles.forwardTxt1]}>
                                                    {data.aliAccount.nickName}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            :
                            <TouchableWithoutFeedback onPress={() => this.add(0)}>
                                <View style={[forwardStyles.comOpt, forwardStyles.option, base.inline, {marginHorizontal: px(30), marginBottom: px(20)}]}>
                                    <Text allowFontScaling={false} style={[forwardStyles.defaultTxt, forwardStyles.blue]}>
                                        +添加支付宝账户（快速到账）
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                    }
                </View>
            }
            {
                <View>
                    {
                        data.wxAccount ?
                            selected == 2 ? <TouchableWithoutFeedback onPress={() => this.props.select(2)}>
                                <Background name='wx-selected' style={[forwardStyles.selected, base.line, {
                                    marginBottom: px(20)
                                }]}>
                                    <View style={[forwardStyles.comOpt1, forwardStyles.option1, base.inline_left]}>
                                        <Icon name="icon-wx" style={forwardStyles.icon}/>
                                        <View style={forwardStyles.option_right}>
                                            <View style={base.inline_left}>
                                                <Text allowFontScaling={false} style={[forwardStyles.forwardTxt]}>
                                                    微信
                                                </Text>
                                            </View>
                                            <Text allowFontScaling={false} style={[forwardStyles.forwardTxt, forwardStyles.forwardTxt1]}>
                                                {data.wxAccount.wxNickName}
                                            </Text>
                                        </View>
                                    </View>
                                </Background>
                            </TouchableWithoutFeedback> :
                                <TouchableWithoutFeedback onPress={() => this.props.select(2)}>
                                    <View style={[forwardStyles.comunSelect, base.inline, {marginBottom: px(20)}]}>
                                        <View style={[forwardStyles.comOpt, forwardStyles.option1, base.inline_left]}>
                                            <Icon name="icon-wx" style={forwardStyles.icon}/>
                                            <View style={forwardStyles.option_right}>
                                                <View style={base.inline_left}>
                                                    <Text allowFontScaling={false} style={[forwardStyles.forwardTxt]}>
                                                        微信
                                                    </Text>
                                                </View>
                                                <Text allowFontScaling={false} style={[forwardStyles.forwardTxt, forwardStyles.forwardTxt1]}>
                                                    {data.wxAccount.wxNickName}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            :
                            <TouchableWithoutFeedback onPress={() => this.add(2)}>
                                <View style={[forwardStyles.comOpt, forwardStyles.option, base.inline, {marginHorizontal: px(30), marginBottom: px(20)}]}>
                                    <Text allowFontScaling={false} style={[forwardStyles.defaultTxt, forwardStyles.green]}>
                                        +添加微信账户 (仅支持微信实名用户)
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                    }
                </View>
            }
            {
                data.bankAccount ?
                    selected == 1 ? <TouchableWithoutFeedback onPress={() => this.props.select(1)}>
                        <Background name="yinlian-selected" style={[forwardStyles.selected, base.line]}>
                            <View style={[forwardStyles.comOpt1, forwardStyles.option1, base.inline_left]}>
                                <Icon name="icon-forward2" style={forwardStyles.icon}/>
                                <View style={forwardStyles.option_right}>
                                    <Text allowFontScaling={false} style={[forwardStyles.forwardTxt]}>
                                        {data.bankAccount.bankName}
                                    </Text>
                                    <Text allowFontScaling={false} style={[forwardStyles.forwardTxt, forwardStyles.forwardTxt1]}>
                                        {data.bankAccount.accountNo}
                                    </Text>
                                </View>
                            </View>
                        </Background>
                    </TouchableWithoutFeedback> :
                        <TouchableWithoutFeedback onPress={() => this.props.select(1)}>
                            <View style={[forwardStyles.comunSelect, base.inline]}>
                                <View style={[forwardStyles.comOpt, forwardStyles.option1, base.inline_left]}>
                                    <Icon name="icon-forward2" style={forwardStyles.icon}/>
                                    <View style={forwardStyles.option_right}>
                                        <Text allowFontScaling={false} style={[forwardStyles.forwardTxt]}>
                                            {data.bankAccount.bankName}
                                        </Text>
                                        <Text allowFontScaling={false} style={[forwardStyles.forwardTxt, forwardStyles.forwardTxt1]}>
                                            {data.bankAccount.accountNo}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    :
                    <TouchableWithoutFeedback onPress={() => this.add(1)}>
                        <View style={[forwardStyles.comOpt, forwardStyles.option, base.inline,
                            {
                                marginHorizontal: px(30),
                            }]}>
                            <Text allowFontScaling={false} style={[forwardStyles.defaultTxt, forwardStyles.black]}>
                                +添加银行卡
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
            }
            <SendMsgModal
                ref="sendMsgModal"
                navigation={this.props.navigation}
                refresh={this.props.refish.bind(this)}
            />
        </View>
    }
    
    /**
     * 绑定支付宝或者银行卡
     */
    
    add(type) {
        const { data } = this.props
        this.refs.sendMsgModal.open({
            mobile: data.mobile,
            type: type
        })
    }
}

export default class extends Page {

    constructor(props) {
        super(props);
        this.state = {
            initRequest: true,
            requestStatus: false,
            buttonStatus: false,
            withdrawMoney: 0,
            inputStatus: true,
            textStatus: false,
            selected: 0,
            version: getHeader('version').replace(/\./g, '') * 1
        };
    }
    title = '申请提现'

    pageBody() {
        return <ScrollView style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <View>
                <PutForward
                    data = {this.state}
                    version={this.state.version}
                    selected={this.state.selected}
                    navigation={this.props.navigation}
                    select={this.select.bind(this)}
                    refish={this.refish.bind(this)}
                />
                <View style={styles.money}>
                    <Text allowFontScaling={false} style={styles.money_des}>提现金额</Text>
                    <View style={styles.money_view1}>
                        <Text allowFontScaling={false} style={styles.money_symbol}>¥</Text>
                        {this.state.inputStatus
                            ? <TextInput
                                style={[styles.money_number]}
                                onChangeText={this.moneyChange.bind(this)}
                                underlineColorAndroid="transparent"
                                keyboardType="numeric"
                                placeholder="请输入金额"
                                onEndEditing={this.moneyChanged.bind(this)}
                                value={String(this.state.withdrawMoney == 0 ? '' : this.state.withdrawMoney)}
                            />
                            : <TextInput
                                style={styles.money_number}
                                editable={false}
                                underlineColorAndroid="transparent"
                            />
                        }
                    </View>
                </View>
                <View style={styles.withdraw_all}>
                    {this.state.textStatus
                        ? <Text allowFontScaling={false} style={styles.withdraw_all_sty1}>每次提现金额限{this.state.wpMinAmount}-{this.state.wpMaxAmount}元</Text>
                        : <Text allowFontScaling={false} style={styles.withdraw_all_sty2}>可提现金额￥{this.state.amount}</Text>
                    }
                    <TouchableOpacity onPress={this.withdrawAll.bind(this)} activeOpacity={0.8}>
                        <Text allowFontScaling={false} style={styles.withdraw_all_sty3} >全部提现</Text>
                    </TouchableOpacity>
                </View>
                <Text allowFontScaling={false} style={styles.lastTimeWithdraw}>
                    {this.state.preWpDate
                        ? `上次提现时间：${this.state.preWpDate}`
                        : ''
                    }
                </Text>
                <TouchableOpacity onPress={this.onSubmit.bind(this)} activeOpacity={0.8}>
                    <View style={[styles.submit, this.state.buttonStatus ? '' : styles.disabled]}>
                        <Text allowFontScaling={false} style={styles.submitText}>
                            {this.state.inputStatus
                                ? '提交申请'
                                : `距上次提现不到${this.state.wpDay}天，暂时无法提现`
                            }
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.rule}>
                    <Text allowFontScaling={false} style={[styles.rule_text, styles.rule_text1]}>提现说明：</Text>
                    <Text allowFontScaling={false} style={styles.rule_text}>1.每隔{this.state.wpDay}天可提现一次，每次提现金额限{this.state.wpMinAmount}-{this.state.wpMaxAmount}元以内</Text>
                    <Text allowFontScaling={false} style={styles.rule_text}>2.提现申请打款后到账时间具体以银行到账时间为准，一般在5个工作日内</Text>
                </View>
            </View>
            <LoadingRequest status={this.state.requestStatus} />
        </ScrollView>
    }

    async onReady() {
        await this.refish()
    }
    async refish() {
        try {
            let benefit = await get(`/withdrawalsApply/findWithdrawalsAmountWithAlicash.do`);
            if (benefit.preWpDate && new Date().getTime() < benefit.wpDay * 24 * 60 * 60 * 1000 + new Date(benefit.preWpDate).getTime()) {
                this.setState(Object.assign({}, benefit, {
                    inputStatus: false,
                    initRequest: false
                }));
            } else {
                this.setState(benefit);
            }

            let uid = getHeader('uid')
            let val = await getItem(`withdraw${uid}`);
            let defaultIndex = -1;
            if (benefit.aliAccount && this.state.version >= 107) { //默认是支付宝，没有支付宝就选中银行卡
                defaultIndex = val ? val : 0
            } else if (benefit.wxAccount){
                defaultIndex = val ? val : 2
            } else if (benefit.bankAccount) {
                defaultIndex = val ? val : 1
            } else {
                if (val) {
                    await setItem(`withdraw${uid}`, '')
                }
            }

            if (defaultIndex >= 0) {
                if (!val) {
                    await setItem(`withdraw${uid}`, String(defaultIndex))
                }
                this.setState({
                    selected: defaultIndex
                })
            }
        } catch (e) {
            toast(e.message)
        }
    }
    moneyChanged(val) {
        let money = Number(this.state.withdrawMoney);
        if (isNaN(money)) {
            this.setState({
                withdrawMoney: 0,
            });
        } else {
            this.setState({
                withdrawMoney: money,
            });
        }
    }
    moneyChange(val) {
        if (val < this.state.wpMinAmount || val > this.state.wpMaxAmount) {
            this.setState({
                withdrawMoney: val,
                buttonStatus: false,
                textStatus: true,
            });
        } else if (val > this.state.amount) {
            this.setState({
                withdrawMoney: val,
                buttonStatus: false,
                textStatus: false,
            });
        } else {
            this.setState({
                withdrawMoney: val,
                buttonStatus: true,
                textStatus: false,
            });
        }
    }
    withdrawAll() {
        if (!this.state.inputStatus) {
            return; 
        }
        const amount = this.state.amount || 0;
        //toast('' + amount);
        if (amount <= 0) {
            return; 
        }
        this.setState({
            withdrawMoney: amount,
            buttonStatus: true,
            textStatus: false,
        }, () => {
            //toast(this.state.withdrawMoney + '');
        });
    }
    async onSubmit() {
        if (!this.state.buttonStatus) {
            return; 
        }
        this.setState({
            requestStatus: true
        });
        try {
            let {selected, withdrawMoney} = this.state
            let datas = await request.post(`/withdrawalsApply/createWithdrawalsApply.do?amount=${Number(this.state.withdrawMoney).toFixed(3).replace(/\d$/, '') || 0}`, {
                amount: Number(withdrawMoney).toFixed(3).replace(/\d$/, '') || 0,
                accountType: selected
            });
            toast('提现申请成功');
            this.setState({
                requestStatus: false
            }, () => {
                this.props.navigation.navigate('WithdrawRecordPage');
            });
        } catch (e) {
            this.setState({
                requestStatus: false
            }, () => {
                toast(e.message);
            });
        } finally {
            this.refish();
        }
    }
    
    
    async select(item) {
        if (item == this.state.selected) return;
        let uid = getHeader('uid')
        await setItem(`withdraw${uid}`, String(item));
        this.setState({
            selected: item
        })
    }
}

const styles = StyleSheet.create({
    money: {
        flex: 1,
        height: px(172),
        backgroundColor: '#fff',
        paddingLeft: px(30),
        overflow: 'hidden',
        flexDirection: 'column'
    },
    money_des: {
        paddingTop: px(30),
        fontSize: px(26)
    },
    money_view1: {
        flex: 1,
        borderBottomWidth: px(1),
        borderColor: '#efefef',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    money_symbol: {
        fontSize: px(36),
        paddingTop: px(50),
        marginRight: px(10),
        textAlignVertical: 'bottom'
    },
    money_number: {
        padding: 0,
        paddingTop: px(36),
        fontSize: px(60),
        flex: 1,
        color: '#222'
    },
    withdraw_all: {
        flex: 1,
        height: px(80),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    withdraw_all_sty1: {
        fontSize: px(26),
        color: '#d0648f',
        flex: 1
    },
    withdraw_all_sty2: {
        fontSize: px(26),
        color: '#666',
        flex: 1
    },
    withdraw_all_sty3: {
        paddingBottom: px(20),
        paddingTop: px(20),
        fontSize: px(26),
        color: '#d0648f'
    },
    lastTimeWithdraw: {
        textAlign: 'center',
        lineHeight: px(24),
        fontSize: px(24),
        color: '#858385',
        paddingHorizontal: 0,
        paddingTop: px(36),
        paddingBottom: px(20),
    },
    submit: {
        width: px(690),
        height: px(90),
        backgroundColor: '#d0648f',
        overflow: 'hidden',
        borderRadius: px(8),
        marginLeft: px(30),
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitText: {
        fontSize: px(36),
        color: '#fff',
    },
    rule: {
        width: px(750),
        paddingHorizontal: px(30),
        marginTop: px(70)
    },
    rule_text: {
        color: '#858385',
        fontSize: px(24),
        lineHeight: px(28),
    },
    rule_text1: {
        marginBottom: px(10),
    },
    disabled: {
        backgroundColor: '#b2b3b5'
    }
});

const forwardStyles = StyleSheet.create({
    title: {
        fontSize: px(26),
        color: '#222',
        marginTop: px(40),
        marginBottom: px(30),
        marginLeft: px(30)
    },
    box: {
        backgroundColor: '#fff',
        marginBottom: px(24),
        paddingBottom: px(30)
    },
    selected: {
        width: px(700),
        height: px(126),
        marginHorizontal: px(25)
    },
    comunSelect: {
        width: px(700),
        marginHorizontal: px(25),
        //backgroundColor: '#ff0',
        height: px(126),
        //marginBottom: px(20)
    },
    comOpt1: {
        width: px(690)
    },
    comOpt: {
        width: px(690),
        borderRadius: px(12),
        overflow: 'hidden',
        borderWidth: px(1),
        borderColor: '#b2b3b5',
        //marginHorizontal: px(30),
    },
    option: {
        height: px(80)
    },
    option1: {
        height: px(114),
    },
    option_right: {
        height: px(114),
        paddingVertical: px(24),
        justifyContent: 'space-between'
    },
    defaultTxt: {
        fontSize: px(30),
    },
    blue: {
        color: '#44b7ea'
    },
    green: {
        color: '#00BC0C'
    },
    black: {
        color: '#666'
    },
    icon: {
        width: px(42),
        height: px(42),
        marginHorizontal: px(16)
    },
    forwardTxt: {
        fontSize: px(30),
        color: '#222'
    },
    forwardTxt1: {
        color: '#666'
    },
    tui: {
        height: px(24),
        width: px(44),
        borderRadius: px(2),
        overflow: 'hidden',
        backgroundColor: '#44b7ea',
        marginLeft: px(13)
    },
    tuiTxt: {
        color: '#fff',
        fontSize: px(20)
    }
});