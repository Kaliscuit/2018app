'use strict';

import React from 'react';

import {
    Image,
    Text,
    TextInput,
    View,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    BackHandler
} from "react-native";

import { px } from "../../utils/Ratio";
import { get, post } from "../../services/Request";
import { show as toast } from '../../widgets/Toast';
import { pay as wxPay } from '../../services/WeChat'
import { TopHeader } from '../common/Header'
import { NavigationActions, StackActions } from 'react-navigation';
import Router from "../../services/Router"
import Page, { FootView } from '../../UI/Page'
import { getUser } from "../../services/Api"

import { GoodsRecommendedForYou } from '../recommended/GoodsRecommended'
import { WarnPrompt } from '../../widgets/Prompt'

const PAY_TYPES = {
    'weixin': '微信支付',
    'ialipayFz': '支付宝支付'
};
export default class extends React.Component {

    static navigationOptions = {
        gesturesEnabled: false
    }

    noGoBack() {
        if ('SuccessPage' == Router.current()) {
            return true;
        } else {
            return false;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            orderNo: "",
            payAmount: 0,
            recommends: []
        }
        
        this.noGoBack = this.noGoBack.bind(this);
    }

    render() {
        return (
            <View style={styles.container}>
                <TopHeader hiddenBack={true} navigation={this.props.navigation}
                    title="支付成功"></TopHeader>
                <WarnPrompt
                    text="近期诈骗事件多发，为了您的资金安全，任何陌生号码、微信或者链接，要求您提供支付宝账号密码、银行卡密码、验证码，要求扫二维码等，都是诈骗行为，均不要相信！！！"
                    isShowArrow={false}
                    style={ styles.security } 
                />
                <ScrollView
                    showsVerticalScrollIndicator={ false }
                    alwaysBounceVertical={ false }
                    
                >
                    <View style={styles.order_info}>
                        <Image source={{
                            uri: this.state.expressList
                                && this.state.expressList[0]
                                && this.state.expressList[0].skuList
                                && this.state.expressList[0].skuList[0]
                                && this.state.expressList[0].skuList[0].prodImg
                        }}
                        resizeMode='cover'
                        style={{ width: px(150), height: px(150) }} />
                        <View style={styles.order_detail}>
                            <View style={styles.order_prop}>
                                <Text allowFontScaling={false} style={styles.key}>订单编号</Text>
                                <Text allowFontScaling={false} style={styles.txt}>{this.state.orderNo}</Text>
                            </View>
                            <View style={styles.order_prop}>
                                <Text allowFontScaling={false} style={styles.key}>已付金额</Text>
                                <Text allowFontScaling={false} style={[styles.amount, styles.txt]}>￥{this.state.payAmount}</Text>
                            </View>
                            <View style={styles.order_prop}>
                                <Text allowFontScaling={false} style={styles.key}>支付方式</Text>
                                <Text allowFontScaling={false} style={styles.txt}>{this.state.payAmount == 0 ? '在线支付' : PAY_TYPES[this.state.payPlatform]}</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        <Text allowFontScaling={false} style={styles.success_info}>您的订单将闪电发出，敬请期待</Text>
                    </View>
                    <View style={styles.btnBox}>
                        <TouchableOpacity activeOpacity={0.8} onPress={this.goDetail.bind(this)}>
                            <Text allowFontScaling={false} style={styles.btn}>订单详情</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={this.goHome.bind(this)}>
                            <Text allowFontScaling={false} style={styles.btn}>继续购物</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={ { paddingHorizontal: px(24) } }>
                        <GoodsRecommendedForYou
                            navigation={this.props.navigation}
                            list={ this.state.recommends }
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }

    async componentDidMount() {
        //let orderNo = '001725111554383700';//this.props.navigation.state.params.orderNo;
        this.setState({
            orderNo: this.props.navigation.state.params.orderNo
        });
        try {
            let res = await get(`/saleOrderApp/findSaleOrderDetail.do?orderNo=${this.props.navigation.state.params.orderNo}&type=0`);
            
            this.setState(res);
        } catch (e) {
            toast(e.message);
        }
        
        this.getRecommends()
    }

    async getRecommends () {
        let result = await get(`/shoppingFlow/getRecommendList.do?sn=${this.props.navigation.state.params.orderNo}&recType=orderPaySuccess`);
        // let result = await get(`/shoppingFlow/getRecommendList.do?sn=001823614352870365&recType=orderPaySuccess`);

        this.setState({
            recommends: result.item || []
        })
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.noGoBack);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.noGoBack);
    }

    goDetail() {
        getUser();
        this.props.navigation.replace('OrderDetailPage', {
            orderNo: this.state.orderNo
        });
    }
    goHome() {
        // this.props.navigation.PopToTop();
        // this.props.navigation.navigate('ShopPage');
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'HomePage' })
            ]
        }));
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f3f6'
    },
    order_info: {
        padding: px(30),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: px(40)
    },
    goods_cover: {
        width: px(150),
        height: 150,
        marginVertical: px(20),
        marginHorizontal: px(30),
        overflow: 'hidden',
        borderRadius: px(8)
    },
    order_detail: {
        width: px(540),
        paddingLeft: px(35)
    },
    order_prop: {
        flexDirection: 'row',
        marginBottom: px(6)
    },
    key: {
        fontSize: px(25),
        marginRight: px(18)
    },
    txt: {
        fontSize: px(25)
    },
    amount: {
        color: '#e5626d'
    },
    success_info: {
        paddingVertical: px(30),
        color: '#b3b4b6',
        textAlign: 'center',
        fontSize: px(24)
    },
    btnBox: {
        flexDirection: 'row'
    },
    btn: {
        width: px(300),
        height: px(70),
        paddingTop: px(18),
        //lineHeight:px(70),
        borderWidth: px(1),
        borderColor: '#a9aaac',
        color: '#212121',
        textAlign: 'center',
        backgroundColor: '#fff',
        fontSize: px(26),
        marginLeft: px(50),
        borderRadius: px(8)
    },
    security: {
        backgroundColor: '#ee5168',
        paddingTop: px(10),
        paddingBottom: px(10)
    }
});