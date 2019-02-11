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
    ScrollView,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";

import { px } from "../../../utils/Ratio";
import { get } from "../../../services/Request";
import { show as toast } from '../../../widgets/Toast';
import { LoadingInit, LoadingRequest } from '../../../widgets/Loading';
import { TopHeader } from '../../common/Header'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    async componentDidMount() {
        this.refresh();
    }
    async refresh() {
        try {
            let res = await get(`/userBank/findUserBank.do`);
            this.setState(res || {});
        } catch (e) {
            toast(e.message);
        } 
    }
    onChange() {
        const _this = this;
        this.props.navigation.navigate('AddBankCardPage', {
            type: 1,
            callback: () => this.refresh()
        });
    }
    render() {
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6', alignItems: 'center' }}>
            <TopHeader navigation={this.props.navigation}
                title="提现银行卡"></TopHeader>
            {this.state && this.state.accountName ? <View>
                {this.state.bankCode
                    ? <View style={styles.card}>
                        <View style={styles.view1}>
                            <Text allowFontScaling={false} style={styles.accountName}>{this.state.accountName}</Text>
                            <Text allowFontScaling={false} style={styles.bankName}>{this.state.bankName}</Text>
                        </View>
                        <Text allowFontScaling={false} style={styles.accountNo}>{this.state.accountNo}</Text>
                    </View>
                    : <Text allowFontScaling={false} style={styles.error}>您还没有添加银行卡</Text>
                }
                <TouchableOpacity onPress={this.onChange.bind(this)} activeOpacity={0.8}>
                    <View style={styles.submit}>
                        {this.state.bankCode
                            ? <Text allowFontScaling={false} style={styles.submitTxt}>更换银行卡</Text>
                            : <Text allowFontScaling={false} style={styles.submitTxt}>去添加</Text>
                        }
                    </View>
                </TouchableOpacity>
            </View> : <LoadingInit />}
            <LoadingRequest status={!this.state.loading} />
        </View>;
    }
}



const styles = StyleSheet.create({
    card: {
        backgroundColor: '#d0648f',
        height: px(240),
        overflow: 'hidden',
        paddingHorizontal: px(41),
        borderRadius: px(8),
        marginTop: px(40)
    },
    view1: {
        paddingTop: px(55),
        //width: px(203),
        flex: 0
    },
    error: {
        textAlign: 'center',
        paddingTop: px(40),
        paddingBottom: px(20),
        fontSize: px(40)
    },
    accountName: {
        color: '#fff',
        lineHeight: px(39),
        fontSize: px(30)
    },
    bankName: {
        color: '#fff',
        lineHeight: px(39),
        fontSize: px(26)
    },
    accountNo: {
        color: '#fff',
        paddingTop: px(40),
        fontSize: px(45),
        lineHeight: px(45),
        textAlign: 'right'
    },
    submit: {
        width: px(668),
        height: px(80),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: px(8),
        marginTop: px(50)
    },
    submitTxt: {
        fontSize: px(30),
        color: '#d0648f'
    }

});
