'use strict';

import React from 'react';

import {
    Text,
    View,
    Image,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Modal
} from "react-native";

import {
    px
} from "../../../utils/Ratio";

import {
    get
} from "../../../services/Request";

import { show as toast } from '../../../widgets/Toast';
import Icon from '../../../UI/lib/Icon'
import base from '../../../styles/Base'
exports.Balance = class extends React.Component {
    
    async goWithdrawPage() {
        this.props.navigation.navigate('WithdrawPage', {});
        /*try {
            let detail = await get('/ucenter/detail.do');
            if (detail.userBankDetail) {
                this.props.navigation.navigate('WithdrawPage', {});
            } else {
                this.props.navigation.navigate('AddBankCardPage', {
                    type: 1
                });
            }
        } catch (e) {
            toast(e.message);
        }*/
    }
    
    goWithdrawRecordPage() {
        this.props.navigation.navigate('WithdrawRecordPage', {});
    }
    
    goBalancePage() {
        this.props.navigation.navigate('BalancePage', {});
    }
    
    render() {
        return <View>
            <View style={styles.top}>
                <Text allowFontScaling={false}
                    style={{ fontSize: px(24), color: '#858385', marginBottom: px(15), includeFontPadding: false }}>
                    {this.props.label}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text allowFontScaling={false} style={{ fontSize: px(51), color: '#252426' }}>
                        ￥{Number(this.props.withdrawalsAmount).toFixed(2)}
                    </Text>
                    <TouchableWithoutFeedback onPress={() => this.goWithdrawPage()}>
                        <View style={[styles.submit, base.backgroundColor, base.inline]}>
                            <Text allowFontScaling={false} style={styles.submitTxt}>
                                申请提现
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <TouchableWithoutFeedback onPress={() => this.goBalancePage()}>
                <View style={[styles.link, { marginBottom: px(0) }]}>
                    <Text allowFontScaling={false} style={styles.linkTxt}>
                        余额明细
                    </Text>
                    <Icon name="icon-arrow" style={styles.linkArrow} />
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.goWithdrawRecordPage()}
                style={{ borderTopColor: '#efefef', borderTopWidth: px(1) }}
            >
                <View style={styles.link}>
                    <Text allowFontScaling={false} style={styles.linkTxt}>
                        提现记录
                    </Text>
                    <Icon name="icon-arrow" style={styles.linkArrow} />
                </View>
            </TouchableWithoutFeedback>
        </View>
    }
}

const styles = StyleSheet.create({
    top: {
        height: px(160),
        paddingHorizontal: px(30),
        paddingVertical: px(20),
        backgroundColor: '#fff',
        marginBottom: px(1)
    },
    link: {
        height: px(90),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: px(30),
        marginBottom: px(20),
        justifyContent: 'space-between'
    },
    linkArrow: {
        width: px(15),
        height: px(26)
    },
    linkTxt: {
        fontSize: px(28),
        color: '#252426'
    },
    submit: {
        backgroundColor: '#e86d78',
        width: px(150),
        height: px(54),
        overflow: 'hidden',
        borderRadius: px(6)
    },
    submitTxt: {
        fontSize: px(26),
        color: '#fff',
        includeFontPadding: false,
    }
});