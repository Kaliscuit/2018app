'use strict';
/**
 * skulist 组件不能有touchable组件， 需要添加的事件传clickEvent属性。
 */
import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';

import { px } from '../../utils/Ratio';
import OrderTools from './OrderTools';
import { SkuListDetail } from './OrderItems'

const flagLen = Platform.OS == "ios" ? "---  " : "直]  ";

export default class extends React.Component {
    render() {
        const items = this.props.items;
        return <View style={styles.orderItems}>
            {items.map((item) =>
                <View key={item.prodId} style={styles.orderItem}>
                    <Image source={{ uri: item.prodImg }} style={styles.orderItemCover} />
                    <Text allowFontScaling={false} style={styles.orderItemName} numberOfLines={2}>{item.goodsName}</Text>
                    <View>
                        <Text allowFontScaling={false}
                            style={styles.orderItemPrice}>￥{Number(item.prodPrice).toFixed(2)}</Text>
                        <Text allowFontScaling={false} style={styles.orderItemCount}>x{item.prodQty}</Text>
                    </View>
                </View>
            )}
        </View>
    }
}

export class ExpressListDetail extends React.Component {
    
    /**
     * 不可退货提示文案：item.status == 100是全部商品已退货（20180713）
     */
    
    renderTip(item, order) {
        let tip = '',
            isForeignSupply = item.skuList && (item.skuList[0].isForeignSupply == '2' || item.skuList[0].isForeignSupply == '3'),
            isf = !item.isShowRtBt && isForeignSupply && order.erpOrderNo && item.status != 100 && order.orderStatus != 9 && item.status != 30
        if (item.logisticsCenter === '郑州仓' && item.status != 100 && !item.isShowRtBt && order.orderStatus != 9 && item.status != 30) {
            tip = '海关清关中暂不可退货'
        } else if (item.logisticsCenter === '易果仓' && item.status != 100 && !item.isShowRtBt && order.orderStatus != 9) {
            tip = '生鲜食品签收后有质量问题可申请退货'
        }
        //   else if (((item.logisticsCenter === '苏宁仓' || item.logisticsCenter === '苏宁易购') && order.orderStatus != 9 && item.status != 30) || isf) {
        //     tip = '配货中暂不可退货'
        // }
        if (tip == '') return null;
        return <View style={{backgroundColor: '#fbfafc', paddingLeft: px(30), paddingVertical: px(20)}}>
            <Text style={styles.expressTip}>{tip}</Text>
        </View>
    }
    render() {
        const items = this.props.items;
        const order = this.props.order;
        
        if (!items || items.length == 0) return <View></View>
        return <View style={styles.expressItems}>
            {items.map(item =>
                <View style={styles.expressItem} key={item.expressCode}>
                    <View>
                        {
                            item.logisticsCenter &&
                            <View style={styles.expressItemTop}>
                                {item.logisticsCenter && <Text allowFontScaling={false}
                                    style={{ fontSize: px(26) }}>{item.logisticsCenter}发货</Text>
                                }
                                {
                                    order.orderStatus != 0 && order.orderStatus != 99 &&
                                    <Text allowFontScaling={false}
                                        style={styles.statusColor}>{item.statusName}</Text>
                                    
                                }
                            </View>
                            
                        }
                        <SkuListDetail
                            load={this.props.load}
                            role={this.props.role}
                            expressCode={item.expressCode}
                            order={this.props.order}
                            items={item.skuList}
                            // 微信历史订单
                            isWeCatHistory={ this.props.isWeCatHistory }
                            navigation={this.props.navigation} />
                        {this.renderTip(item, order)}
                    </View>
                    <OrderTools
                        order={this.props.order}
                        showTell={this.props.showTell}
                        type={this.props.type}
                        virtualSkuType={item.isExistsVirtual}
                        status={item.status}
                        expressNoNum={item.expressNoNum}
                        expressNo={item.expressNo}
                        shipDate={item.shipDate}
                        skuList={item.skuList}
                        orderNo={item.orderNo}
                        aoNo={item.expressCode}
                        from = {'detail'}
                        isWeCatHistory={ this.props.isWeCatHistory }
                        navigation={this.props.navigation} />
                </View>
            )}
        </View>
    }
}


export class ReturnListDetail extends React.Component {
    goReturn(srNo) {
        if (this.props.type == '1') return;
        this.props.navigation.navigate('ReturnGoods', {
            orderNo: srNo,
            type: '1',
            isWeCatHistory: this.props.isWeCatHistory
        });
    }
    render() {
        const items = this.props.items;
        
        return <View style={styles.skuDetailItem}>
            <ScrollView>
                {items.map(item =>
                    <TouchableWithoutFeedback key={item.refundNo} onPress={() => this.goReturn(item.refundNo)}>
                        <View style={[styles.skuItemBase, styles.skuItem]}>
                            <Image style={styles.skuItemImage} source={{ uri: item.prodImg }} />
                            <View style={styles.skuItemInfo}>
                                <Text allowFontScaling={false} style={styles.skuItemFont}>{item.goodsName}</Text>
                                {/*<Text allowFontScaling={false} style={styles.skuItemFontSmall}>{item.brandName}</Text>*/}
                            </View>
                            <View style={styles.skuItemPrice}>
                                <Text allowFontScaling={false} style={styles.skuItemFont}>¥{item.prodPrice}</Text>
                                <Text allowFontScaling={false} style={styles.skuItemFontSmall}>x{item.refundQty}</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </ScrollView>
        </View>
    }
}

const styles = StyleSheet.create({
    whiteSpace: {
        height: px(3),
        backgroundColor: '#fff'
    },
    orderItems: {
        paddingTop: px(20),
        paddingRight: px(30),
        paddingLeft: px(30),
        backgroundColor: '#fbfafc'
    },
    orderItem: {
        paddingBottom: px(20),
        flexDirection: 'row'
    },
    orderItemCover: {
        width: px(150),
        height: px(150),
        borderRadius: px(10)
    },
    orderItemName: {
        flex: 1,
        color: '#222',
        paddingLeft: px(20),
        paddingRight: px(20),
        fontSize: px(24)
    },
    orderItemPrice: {
        textAlign: 'right',
        fontSize: px(24),
        color: '#222'
    },
    orderItemCount: {
        textAlign: 'right',
        fontSize: px(24),
        marginTop: px(50),
        color: '#959395'
    },
    expressItemTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingTop: px(20),
        paddingBottom: px(20),
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    statusColor: {
        fontSize: px(24),
        color: '#eb83b2'
    },
    skuItemBase: {
        paddingTop: px(20),
        paddingBottom: px(20),
        backgroundColor: '#fbfafc',
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    skuItemBaseDetail: {
        paddingTop: px(20),
        paddingBottom: px(20),
        backgroundColor: '#fbfafc',
    },
    skuDetailItem: {
        backgroundColor: '#fbfafc',
    },
    skuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skuItemDetail: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    skuItemImage: {
        backgroundColor: '#fff',
        width: px(150),
        height: px(150),
        borderRadius: px(10)
    },
    skuItemInfo: {
        width: px(400),
    },
    skuItemDetailInfoWrap: {
        marginLeft: px(20),
        width: px(400),
        height: px(150),
    },
    classesBtn: {
        position: 'absolute',
        bottom: px(19),
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: px(130),
        height: px(50),
        borderRadius: px(30),
        backgroundColor: '#d0648f',
        overflow: 'hidden'
    },
    classesBtnTxt: {
        fontSize: px(24),
        color: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    skuItemDetailInfo: {
        width: px(400),
    },
    skuItemPrice: {
        alignItems: 'flex-end'
    },
    skuItemFont: {
        fontSize: px(26),
        color: '#252426',
        marginBottom: px(10)
    },
    skuItemFontSmall: {
        color: '#858385',
        fontSize: px(24),
    },
    skuItemFontShow: {
        marginTop: px(10),
        color: '#d0648f',
        fontSize: px(24),
    },
    skuItemList: {
        marginLeft: px(20),
        marginRight: px(10),
        width: px(130),
        justifyContent: 'center'
    },
    flag: {
        width: px(45),
        height: px(27),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        left: 0,
        ...Platform.select({
            ios: {
                top: px(1),
            },
            android: {
                top: px(5)
            }
        }),
        zIndex: 100,
        borderRadius: px(4),
        overflow: 'hidden'
    },
    flag1: {
        backgroundColor: '#56beec'
    },
    flag2: {
        backgroundColor: '#6cd972'
    },
    flagLen: {
        fontSize: px(17),
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: "center",
        color: '#fbfafc',
    },
    flagBaoShui: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    flagZhiYou: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    expressTip: {
        fontSize: px(24),
        color: '#ed3f58',
        includeFontPadding: false
    }
});

