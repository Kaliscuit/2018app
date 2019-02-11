'use strict';

import React from 'react';

import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity
} from "react-native";

import {
    px
} from "../../../utils/Ratio";

import {
    get
} from "../../../services/Request";

import { show as toast } from '../../../widgets/Toast';
import { TopHeader } from '../../common/Header'
import Icon from '../../../UI/lib/Icon'
import { Tip } from '../../common/ExplainModal';

import { Balance } from './CommpnBalance';

export default class extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            showTxt: [],
            detail: '',
            withdrawalsAmount:0,
        };
    }
    async componentDidMount() {
        try {
            let benefit = await get(`/benefit/index.do`);
            this.setState(benefit);
        } catch (e) {
            toast(e.message);
        }
    }
    
    goListPage() {
        // this.props.navigation.navigate('IncomeListPage', {});
        this.props.navigation.navigate('ReturnsDetailed', {
            startDate: '',
            endDate: '',
            type: 0,
            isInit: false
        })
    }
    
    onChange = (type) => () => {
        let txt = []
        if (type == 1) {
            txt = ['今日收益目前包括两部分,一部分是你分享商品给好友,好友在今天下单支付后,你获得的利润收益（待结算）。另一部分是你推荐好友成为店主，好友在今天购买精选商品并支付后，您获得的奖励收益（已结算）'];
        } else if (type == 2) {
            txt = [
                '累计已结算收益目前包括两部分',
                '一部分是你分享商品给好友，好友购买下单后，当订单状态变为“已完成”时(买家确认收货7天后)，该笔订单的利润收益将计入累计已结算收益。',
                '另一部分是你推荐好友成为店主，好友购买精选商品并支付成功后，获得的奖励收益将计入累计已结算收益。已结算收益可提现。'
            ]
        } else if (type == 3) {
            txt = [
                '预估待结算收益是指你分享商品给好友，好友购买下单后，该笔订单的利润收益将实时计入预估待结算收益。',
                '当订单产生退款后，该笔订单的利润收益将从预估待结算收益中扣除，不再结算。'
            ]
        }
        this.setState({
            showTxt: txt
        }, () => {
            this.refs.tip && this.refs.tip.show()
        })
    }
    
    render() {
        return <ScrollView style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <TopHeader navigation={this.props.navigation}
                title="资金管理"/>
            {this.state &&
            <View>
                <View style={{ flexDirection: 'row', backgroundColor: '#fff', marginBottom: px(1) }}>
                    <View style={styles.incomeBlock}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                            onPress={this.onChange(1)}
                        >
                            <Text allowFontScaling={false} style={styles.incomeAmount}>
                                {Number(this.state.todayAmount).toFixed(2) || 0}
                            </Text>
                            <Text allowFontScaling={false}
                                style={styles.labelBox}
                            >?</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.incomeText}>
                            今日收益
                        </Text>
                    </View>
                    <View style={styles.incomeBlock}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={this.onChange(2)}
                            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={styles.incomeAmount}>
                                {Number(this.state.settlementAmount).toFixed(2) || 0}
                            </Text>
                            <Text allowFontScaling={false}
                                style={styles.labelBox}
                            >?</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.incomeText}>
                            累计已结算收益
                        </Text>
                    </View>
                    <View style={styles.incomeBlock}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={this.onChange(3)}
                            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={styles.incomeAmount}>
                                {Number(this.state.estimateAmount).toFixed(2) || 0}
                            </Text>
                            <Text allowFontScaling={false}
                                style={styles.labelBox}
                            >?</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.incomeText}>
                            预估待结算收益
                        </Text>
                    </View>
                </View>
                <TouchableWithoutFeedback onPress={() => this.goListPage()}>
                    <View style={styles.link}>
                        <Text allowFontScaling={false} style={styles.linkTxt}>
                            收益明细
                        </Text>
                        <Icon name="icon-arrow" style={styles.linkArrow} />
                    </View>
                </TouchableWithoutFeedback>
                <Balance
                    label={'我的余额'}
                    navigation={this.props.navigation}
                    withdrawalsAmount={this.state.withdrawalsAmount}
                />
            </View>
            }
            <Tip
                ref="tip"
                isNeedLine
                tip={this.state.showTxt}
            />


        </ScrollView>
    }
    
}

const styles = StyleSheet.create({
    incomeBlock: {
        flex: 1,
        paddingTop: px(30),
        paddingBottom: px(30)
    },
    incomeAmount: {
        color: '#e86d78',
        fontSize: px(36),
        marginBottom: px(28),
        textAlign: 'center'
    },
    incomeText: {
        color: '#858385',
        fontSize: px(24),
        textAlign: 'center'
    },
    link: {
        height: px(90),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: px(30),
        paddingRight: px(30),
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
    labelBox: {
        width: px(30),
        height: px(30),
        paddingTop: px(2),
        //lineHeight: px(30),
        borderRadius: px(15),
        fontSize: px(22),
        marginLeft: px(6),
        borderColor: '#ccc',
        borderWidth: px(1),
        textAlign: 'center',
        color: '#bbb',
        marginBottom: px(22)
    }
});