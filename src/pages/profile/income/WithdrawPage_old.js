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
    TouchableWithoutFeedback
} from "react-native";

import {
    px
} from "../../../utils/Ratio";

import {
    get
} from "../../../services/Request";

import { show as toast } from '../../../widgets/Toast';
import { LoadingInit, LoadingRequest } from '../../../widgets/Loading';
import { TopHeader } from '../../common/Header'

export default class extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            initRequest: true,
            requestStatus: false,
            buttonStatus: false,
            withdrawMoney: 0,
            inputStatus: true,
            textStatus: false,
        };
    }
    
    render() {
        return <ScrollView style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <TopHeader navigation={this.props.navigation}
                       title="申请提现"></TopHeader>
            {this.state.initRequest
                ? <View>
                    <View style={styles.bank_card}>
                        <Text allowFontScaling={false} style={styles.bank_card_name}>{this.state.bankName}</Text>
                        <Text allowFontScaling={false} style={styles.bank_card_number}>尾号{this.state.bankAccountNo} 储蓄卡</Text>
                    </View>
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
                                    value={String(this.state.withdrawMoney)}
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
                : <LoadingInit />
            }
            <LoadingRequest status={this.state.requestStatus} />
        </ScrollView>
    }
    
    async componentDidMount() {
        try {
            let benefit = await get(`/withdrawalsApply/findWithdrawalsAmount.do`);
            if (benefit.preWpDate && new Date().getTime() < benefit.wpDay * 24 * 60 * 60 * 1000 + new Date(benefit.preWpDate).getTime()) {
                this.setData(Object.assign({}, benefit, {
                    inputStatus: false,
                    initRequest: false
                }));
            } else {
                this.setState(benefit);
            }
        } catch (e) {
            // toast(e.message);
            this.props.navigation.navigate('AddBankCardPage', {
                type: 1,
                callback: () => {
                    this.refish();
                }
            });
        }
    }
    async refish() {
        try {
            let benefit = await get(`/withdrawalsApply/findWithdrawalsAmount.do`);
            if (benefit.preWpDate && new Date().getTime() < benefit.wpDay * 24 * 60 * 60 * 1000 + new Date(benefit.preWpDate).getTime()) {
                this.setData(Object.assign({}, benefit, {
                    inputStatus: false,
                    initRequest: false
                }));
            } else {
                this.setState(benefit);
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
            let datas = await get(`/withdrawalsApply/createWithdrawalsApply.do?amount=${Number(this.state.withdrawMoney).toFixed(3).replace(/\d$/, '') || 0}`);
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
}

const styles = StyleSheet.create({
    bank_card: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        height: px(140),
        backgroundColor: '#fff',
        paddingLeft: px(30),
        borderBottomWidth: px(1),
        borderColor: '#efefef'
    },
    bank_card_name: {
        color: '#252426',
        fontSize: px(30),
        marginBottom: px(18)
    },
    bank_card_number: {
        fontSize: px(28),
        color: '#858385'
    },
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
        flexDirection: 'row'
    },
    money_symbol: {
        fontSize: px(36),
        paddingTop: px(50),
        marginRight: px(10)
    },
    money_number: {
        padding: 0,
        paddingTop: px(36),
        fontSize: px(40),
        flex: 1
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
        color: '#858385',
        flex: 1
    },
    withdraw_all_sty2: {
        fontSize: px(26),
        color: '#d0648f',
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
        height: px(80),
        backgroundColor: '#d0648f',
        overflow: 'hidden',
        borderRadius: px(8),
        marginLeft: px(30),
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitText: {
        fontSize: px(30),
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
