'use strict';

import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, TouchableOpacity, BackHandler, NativeModules, Platform } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { TopHeader } from '../common/Header';
import PayPlatform from '../common/PayPlatform';
import { PayFailConfirmModal } from '../common/ModalView';
import { px } from '../../utils/Ratio';
import { log } from '../../utils/logs';
import Loading from '../../animation/Loading';
import request, { get, getHeader, post } from "../../services/Request";
import { show as toast } from '../../widgets/Toast';
import { pay as wxPay, isWXAppInstalled } from '../../services/WeChat';
import { setItem, removeItem, getItem } from '../../services/Storage';
import Router from "../../services/Router"
import Icon from '../../UI/lib/Icon'

const aliPay = NativeModules.Alipay;


const TimePanel = ({ time }) => <View style={styles.timeBar}>
    <Text allowFontScaling={false} style={styles.timeFont}>{time}</Text>
</View>

class TimeViewPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hour: '',
            minute: '',
            second: ''
        };
        this.timeset = null;
        this.time = this.props.time || 0;
    }

    componentDidMount() {
        this.tick();
        if (!this.time) return;
        this.timeset = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        if (this.timeset) {
            clearInterval(this.timeset);
        }
    }

    render() {
        return <View style={styles.timePanel}>
            <TimePanel time={this.state.hour} />
            <Text allowFontScaling={false} style={styles.timeUnit}>:</Text>
            <TimePanel time={this.state.minute} />
            <Text allowFontScaling={false} style={styles.timeUnit}>:</Text>
            <TimePanel time={this.state.second} />
        </View>
    }

    tick() {
        if (this.time <= 0) {
            if (this.timeset) {
                clearInterval(this.timeset);
            }
        }
        this.setState({
            second: this.tickFormat(Math.floor(this.time % 60)),
            minute: this.tickFormat(Math.floor(this.time / 60 % 60)),
            hour: this.tickFormat(Math.floor(this.time / 60 / 60 % 24))
        }, () => {
            --this.time;
        });
    }

    tickFormat(tick) {
        if (tick < 1) return "00";
        if (tick / 10 >= 1) {
            return tick;
        } else {
            return `0${tick}`;
        }
    }
}

const FailViewPanel = ({ orderNo, timer, seckillYn }) => <View style={styles.payFailPanel}>
    <View style={styles.payFailIconBar}>
        <Icon name="icon-fail" style={styles.failIcon} />
        <Text allowFontScaling={false} style={styles.failFont}>支付失败</Text>
    </View>
    {timer}
    {seckillYn == '0' && <Text allowFontScaling={false} style={styles.tipFont}>订单过时自动取消订单</Text>}
    <Text allowFontScaling={false} style={styles.tipFont}>订单编号：{orderNo}</Text>
    {seckillYn == '1' && <View style={styles.seckillTip}>
        <Text allowFontScaling={false} style={styles.seckillTipMessage}>您的订单中包含抢购商品,请抓紧时间支付,好物不等人哦~</Text>
    </View>}
</View>

const PriceCol = ({ style1, style2, type, title, price }) => <View style={[styles[`${type}Price`], styles.priceStyle]}>
    <Text allowFontScaling={false} style={[styles[`${style1}Font`], { flex: 1 }]}>{title}</Text>
    <Text allowFontScaling={false} style={[styles[`${style2}Font`], { paddingRight: px(30) }]}>¥{price}</Text>
</View>

const PricePanel = ({ prodPrice, payPrice }) => <View style={styles.pricePanel}>
    <PriceCol style1="prod" style2="prod" type="prod" title="商品金额" price={prodPrice} />
    <PriceCol style1="payTitle" style2="payPrice" type="pay" title="应付金额" price={payPrice} />
</View>

const PayButton = ({ payHandle }) => <TouchableOpacity onPress={payHandle}>
    <View style={styles.payBtns}>
        <Text allowFontScaling={false} style={styles.payBtnsFont}>
            确认支付
        </Text>
    </View>
</TouchableOpacity>

export default class extends Component {

    static navigationOptions = {
        gesturesEnabled: false
    }

    select(index, id) {
        this.payType = index;
    }

    async pay() {
        log(this.payType)
        let data = {};
        let code = this.refs['payPlatform'].getCode();
        try {
            data = await post('/saleOrderApp/payOrder.do', { ///saleOrder/createOrder.do
                orderNo: this.state.order.orderNo,
                payPlatform: code
            });
        } catch (e) {
            return toast(e.message)
        }
        let uid = getHeader('uid')
        await setItem(`payPlatform${uid}`, data.payform);
        try {
            if ('weixin' == data.payform) {
                let isInstalled = await isWXAppInstalled();
                if (!isInstalled) {
                    toast('没有安装微信');
                    return;
                }
                let res = await wxPay(data.paydata);
            } else if ('ialipayFz' == data.payform) {
                let param = [];
                let payInfo = data.paydata || {};
                for (let k in payInfo) {
                    param.push(`${k}=${payInfo[k]}`);
                }
                let paramStr = param.join('&');
                let res = await aliPay.pay({ orderString: paramStr });
                // let isErr = this.aliPayErr(res);
                let isErr = true;
                if (Platform.OS == "ios") {
                    if (!(res.resultStatus && res.resultStatus == '9000')) {
                        isErr = false;
                    }
                } else {
                    isErr = this.aliPayErr(res);
                }
                if (!isErr) {
                    throw new Error('您已取消了支付');
                }
            } else {
                throw new Error('您已取消了支付');
            }
        } catch (e) {
            // if ((e + '').indexOf('WechatError: -2') == 0) {
            //     toast('已取消')
            // } else {
            //     toast("支付失败")
            // }
            toast("您已取消了支付")
            return;
        }
        this.props.navigation.navigate('SuccessPage', {
            orderNo: data.orderNo
        });
    }

    aliPayErr(ret) {
        return /9000/.test(ret);
    }

    noPay() {
        // let {params} = this.props.navigation.state;
        // let from = params && params.from;
        // let prodIds = params && params.prodIds;
        // from == 'cart' && this.jumpCart();
        // from == 'buy_now' && this.jumpShop(prodIds);
        this.props.navigation.replace("OrderListPage", { type: 0 })
    }

    jumpCart() {
        this.props.navigation.replace("OrderListPage", { type: 0 })
        // this.props.navigation.dispatch(StackActions.reset({
        //     index: 1,
        //     actions: [
        //         NavigationActions.navigate({ routeName: 'ShoppingCartPage' }),
        //         NavigationActions.navigate({
        //             routeName: 'OrderListPage',
        //             params: {type: 0}
        //         })
        //     ]
        // }));
    }

    jumpShop(prodId) {
        this.props.navigation.replace("OrderListPage", { type: 0 })
        // this.props.navigation.dispatch(StackActions.reset({
        //     index: 2,
        //     actions: [
        //         NavigationActions.navigate({ routeName: 'HomePage' }),
        //         NavigationActions.navigate({
        //             routeName: 'DetailPage',
        //             params: {id: prodId}
        //         }),
        //         NavigationActions.navigate({
        //             routeName: 'OrderListPage',
        //             params: {type: 0}
        //         })
        //     ]
        // }));
    }

    goBack() {
        if ('PayFailResult' == Router.current()) {
            if (this.refs && this.refs['payFail']) {
                let payFail = this.refs['payFail'];
                if (payFail instanceof Object) {
                    "open" in payFail && payFail.open();
                }
            }
            return true;
        } else {
            return false;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            order: {
                orderNo: this.props.navigation.state.params.orderNo,
                endPayTime: 86400000
            },
            done: false
        };
        // pay type
        this.payType = 0;
        this.select = this.select.bind(this);
        this.pay = this.pay.bind(this);
        this.noPay = this.noPay.bind(this);
        this.goBack = this.goBack.bind(this);
    }

    async componentDidMount() {
        this.refs['loading'].open();

        let order = {}
        try {
            order = await this.getOrderDetail();
        } catch (e) {
            //
        } finally {
            this.refs['loading'].close();
        }
        this.setState({
            order: order,
            done: true
        });
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.goBack);
    }

    async getOrderDetail() {
        let { params } = this.props.navigation.state;
        let orderNo = params && params.orderNo;
        let orderDetail = await get(`/saleOrderApp/findSaleOrderByNo.do?orderNo=${orderNo}`);
        return orderDetail || {};
    }

    render() {
        // let {params} = this.props.navigation.state;
        // let orderNo = params && params.orderNo;
        if (!this.state.done) {
            return <View style={styles.payContainer}>
                <Loading ref='loading' />
                <PayFailConfirmModal ref="payFail" cancel={this.noPay} />
            </View>
        }
        return <View style={styles.payContainer}>
            <TopHeader action={this.goBack} navigation={this.props.navigation} title='支付结果'></TopHeader>
            <ScrollView style={{ flex: 1 }}>
                <FailViewPanel seckillYn={this.state.order.seckillYn} orderNo={this.state.order.orderNo} timer={<TimeViewPanel time={this.state.order.endPayTime} />} />
                <PricePanel payPrice={this.state.order.payableAmount} prodPrice={this.state.order.orderTotal} />
                <PayPlatform ref="payPlatform" select={this.select} />
            </ScrollView>
            <PayButton payHandle={this.pay} />
            <PayFailConfirmModal ref="payFail" cancel={this.noPay} />
            <Loading ref='loading' />
        </View>
    }
}

const styles = StyleSheet.create({
    seckillTip: {
        justifyContent: 'center',
        alignItems: 'center',
        // width: px(680),
        height: px(50),
        marginTop: px(10),
        paddingVertical: px(10),
        paddingHorizontal: px(30),
        backgroundColor: '#fbf0f3',
        borderRadius: px(30),
        overflow: 'hidden'
    },
    seckillTipMessage: {
        fontSize: px(22),
        color: '#e86d78',
        includeFontPadding: false,
        textAlignVertical: 'center'
    },
    payContainer: {
        flex: 1,
        backgroundColor: '#f6f5f7'
    },
    payFailPanel: {
        justifyContent: 'center',
        alignItems: 'center',
        height: px(552),
        paddingTop: px(30),
        paddingBottom: px(80),
        backgroundColor: '#fff'
    },
    payFailIconBar: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: px(50)
    },
    failIcon: {
        width: px(250),
        height: px(135)
    },
    failFont: {
        marginTop: px(25),
        fontSize: px(40),
        color: '#333333',
        includeFontPadding: false
    },
    timePanel: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: px(50)
    },
    timeBar: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(50),
        height: px(50),
        backgroundColor: '#d0648f',
        borderRadius: px(25)
    },
    timeFont: {
        fontSize: px(26),
        color: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    timeUnit: {
        paddingHorizontal: px(8),
        fontSize: px(24),
        color: '#d0648f',
        includeFontPadding: false
    },
    tipFont: {
        paddingTop: px(16),
        fontSize: px(24),
        color: '#666',
        lineHeight: px(24),
        includeFontPadding: false
    },
    pricePanel: {
        marginTop: px(20),
        backgroundColor: '#fff'
    },
    prodPrice: {
        width: px(720),
        height: px(80),
        marginLeft: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    payPrice: {
        width: px(720),
        height: px(80),
        marginLeft: px(30)
    },
    priceStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    prodFont: {
        fontSize: px(24),
        color: '#858385',
        includeFontPadding: false
    },
    payTitleFont: {
        fontSize: px(26),
        color: '#252426',
        includeFontPadding: false
    },
    payPriceFont: {
        fontSize: px(32),
        color: '#d0648f',
        includeFontPadding: false
    },
    payBtns: {
        justifyContent: 'center',
        alignItems: 'center',
        height: px(98),
        backgroundColor: '#d0648f'
    },
    payBtnsFont: {
        fontSize: px(34),
        color: '#fff',
        includeFontPadding: false
    }
});
