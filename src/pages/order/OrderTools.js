'use strict';

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity
} from 'react-native';

import { px } from '../../utils/Ratio';
import { get } from '../../services/Request'
import { show as toast } from '../../widgets/Toast';
import { log } from '../../utils/logs';

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            btnText: '确认收货',
            status: this.props.status,
        };
    }

    async confirmDetail() {
        // WebCat历史订单
        if (this.props.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        let confirm = await new Promise((resolve) => {
            Alert.alert('', '\n确认已收货?\n ', [
                { text: "取消", onPress: () => resolve(false) },
                { text: "确认", onPress: () => resolve(true) }
            ]);
        });
        if (!confirm) return;
        try {
            let res = await get(`/saleOrderApp/signSaleOrder.do?orderNo=${this.props.order.orderNo}&aoNo=${this.props.aoNo}`);
            this.setState({
                btnText: '已签收',
                status: 30
            });
        } catch (e) {
            toast('操作失败');
            log('确认收货失败', e);
        }
    }

    gotLogistics(aoNo, shipDate, skuArr, expressNoNum, expressNo) {
        this.props.navigation.navigate('LogisticsPage', {
            aoNo: aoNo,
            date: shipDate,
            skus: skuArr.join(','),
            expressNoNum: expressNoNum,
            expressNo: expressNo
        });
    }

    goDetail = (orderNo) => {

        if (this.props.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        this.props.navigation.navigate('OrderDetailPage', {
            orderNo: orderNo,
            type: this.props.type,
            actionType: false,
            // WebCat历史订单
            isWeCatHistory: this.props.isWeCatHistory,
            callback: async () => {
                // await this.props.reCan()
            }
        });
    };

    componentWillReceiveProps(pp, old) {
        if (pp.status != this.state.status) {
            this.setState({ status: pp.status })
        }
    }

    render() {
        const { order, skuList, virtualSkuType, type, from, aoNo } = this.props
        let isShowRtBt = false;
        //退货按钮：我的店铺订单中我的订单或者我的订单(isOwner是我的店铺订单中我的订单)
        let skuArr = [],
            expressNoNum = this.props.expressNoNum,
            expressNo = this.props.expressNo,
            myOrder = type == 1 && order.isOwner || type == 0;

        if (this.props.isWeCatHistory) myOrder = type == 1 || type == 0;

        order.expressList.map((item, index) => {
            item.skuList.map((item, index) => {
                skuArr.push(item.sku);
            })
        });

        skuList.map((item, index) => {
            if (item.isShowRtBt) {
                isShowRtBt = true;
            }
        });
        const { status } = this.state;

        return (
            <View style={styles.bottom}>
                {
                    (status == 20 || status == 30) && expressNoNum > 1 && virtualSkuType != '1' ?
                        <Text style={styles.tip} allowFontScaling={false}>商品数量较多，将拆分为{expressNoNum}个包裹送达，注意查看物流哦</Text>
                        : null
                }
                <View style={styles.orderTools}>

                    {(status == 20 || status == 30 || status == 50) && virtualSkuType != '1' && aoNo ? <View style={styles.btnView}>
                        <Text style={styles.btnTxt}
                            allowFontScaling={false}
                            onPress={() => this.gotLogistics(this.props.aoNo, this.props.shipDate, skuArr, expressNoNum, expressNo)}>
                            查看物流
                        </Text>
                    </View> : null
                    }

                    {
                        status == 20 && virtualSkuType != '1' && myOrder ?
                            <View style={[styles.btnView, {
                                backgroundColor: '#d0648f',
                                marginLeft: px(20)
                            }]}>
                                <Text
                                    allowFontScaling={false}
                                    style={[styles.btnTxt, { color: '#fff' }]} onPress={() => this.confirmDetail()}>
                                    {this.state.btnText}
                                </Text>
                            </View> : null
                    }

                    {status == 20 || status == 30 ?
                        <View style={[styles.btnView, {
                            backgroundColor: '#d0648f',
                            marginLeft: px(20)
                        }]}>
                            <Text
                                allowFontScaling={false}
                                style={[styles.btnTxt, { color: '#fff' }]}
                                onPress={() => this.props.showTell(order.shopName, order.shopUserMobile)}>
                                联系售后
                            </Text>
                        </View> : null
                    }

                    {
                        myOrder && isShowRtBt && from == 'list' ? <View style={[styles.btnView, { marginLeft: px(20) }]}>
                            <TouchableOpacity onPress={() => this.goDetail(order.orderNo)}>
                                <Text
                                    allowFontScaling={false}
                                    style={styles.btnTxt} >
                                    退货</Text>
                            </TouchableOpacity>
                        </View> : null
                    }

                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    bottom: {
        alignItems: 'flex-end',
        paddingRight: px(30),
    },
    tip: {
        fontSize: px(22),
        color: '#666',
        marginTop: px(15)
    },
    orderTools: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        //paddingRight: px(30),
        // paddingTop: px(20),
        // paddingBottom: px(20),
        //backgroundColor: '#000'
    },

    btnView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(130),
        height: px(50),
        borderColor: '#b2b3b5',
        borderRadius: px(8),
        borderWidth: px(1),
        marginVertical: px(20)
    },

    btnTxt: {
        fontSize: px(24),
        color: '#252426',
    },

});
