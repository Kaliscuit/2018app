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
    TouchableOpacity,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';

import { px } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import OrderTools from './OrderTools';
import { DialogModal, AlertModal } from '../common/ModalView'
import { ExpressStatus } from './Status';
import {get} from '../../services/Request'
import tools from '../../utils/tools'
import base from '../../styles/Base'
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

class PreSale extends React.Component {
    render() {
        const {order, item} = this.props
        if (!order || !order.preSaleYn || order.preSaleYn == 'N') return null;
        return <View style={[preStyles.preSale, base.inline_left]}>
            <View style={[preStyles.sale, base.inline]}>
                <Text allowFontScaling={false} style={preStyles.saleTxt}>
                    预售
                </Text>
            </View>
            <View style={[preStyles.time, base.inline]}>
                <Text allowFontScaling={false} style={[preStyles.saleTxt, {color: '#a363d6'}]}>
                    预计{order.preSaleShipDateStr}前发货
                </Text>
            </View>
        </View>
    }
}

exports.PreSale = PreSale
class SkuList extends React.Component {
    constructor(props) {
        super(props);
        this.locationX = 0;
        this.locationY = 0;
    }
    
    render() {
        const items = this.props.items || [];
        const order = this.props.order;
        
        if (items && items.length == 1) {
            let item = items[0];
            return <TouchableWithoutFeedback onPress={() => this.props.clickEvent && this.props.clickEvent()}>
                <View style={[styles.skuItemBase, styles.skuItem]}>
                    <Image style={styles.skuItemImage} source={{ uri: item.prodImg }} />
                    <View style={[styles.skuItemInfo, {justifyContent: 'space-between'}]}>
                        <View>
                            {item.isInBond == 1 &&
                            <View style={[styles.flag, styles.flag1]}>
                                <Text allowFontScaling={false} style={[styles.flagBaoShui]}> 保税 </Text>
                            </View>
                            }
                            {item.isForeignSupply == 2 &&
                            <View style={[styles.flag, styles.flag2]}>
                                <Text allowFontScaling={false} style={[styles.flagZhiYou]}> 直邮 </Text>
                            </View>
                            }
                            <Text allowFontScaling={false}>
                                {item.isInBond == 1 && <Text style={styles.flagLen}>flagLen</Text>}
                                {item.isForeignSupply == 2 && <Text style={styles.flagLen}>flagLen</Text>}
                                <Text allowFontScaling={false} style={styles.skuItemFont}>{item.goodsName}</Text>
                            </Text>
                        </View>
                        <PreSale item={item} order={order}/>
                        {/*{this.renderPreSale(item, order)}*/}
                    </View>
                    <View style={styles.skuItemPrice}>
                        <Text allowFontScaling={false} style={styles.skuItemFont}>¥{item.prodPrice}</Text>
                        <Text allowFontScaling={false} style={styles.skuItemFontSmall}>x{item.prodQty}</Text>
                        {item.refundQty > 0 &&
                        <Text allowFontScaling={false} style={styles.skuItemFontShow}>已退货:{item.refundQty}</Text>}
                    </View>

                </View>
            </TouchableWithoutFeedback>
        }
        return <View style={styles.skuItemBase}>
            <ScrollView
                horizontal={true}
                onTouchStart={(e) => this.touchStart(e.nativeEvent)}
                onTouchEnd={(e) => this.touchEnd(e.nativeEvent)}>
                {items.map(item =>
                    <View key={item.itemId} style={[styles.skuItem]}>
                        <Image style={styles.skuItemImage} source={{ uri: item.prodImg }} />
                        <View style={styles.skuItemList}>
                            <Text allowFontScaling={false} style={styles.skuItemFont}>¥{item.prodPrice}</Text>
                            <Text allowFontScaling={false} style={styles.skuItemFontSmall}>x{item.prodQty}</Text>
                            {item.refundQty > 0 &&
                            <Text allowFontScaling={false} style={styles.skuItemFontShow}>已退货:{item.refundQty}</Text>}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    }

    touchStart(event) {
        this.locationX = event.locationX;
        this.locationY = event.locationY;
    }

    touchEnd(event) {
        let jl = event.locationX - this.locationX;
        let jt = event.locationY - this.locationY;

        if (jl > -10 && jl < 10 && jt > -10 && jt < 10) {
            this.props.clickEvent && this.props.clickEvent();
        }
    }
}

class SkuListDetail extends React.Component {
    goReturns(param) {
        this.props.navigation.navigate('ReturnGoods', param);
    }
    goVirtual(param) {
        this.props.navigation.navigate('VirtualSku', {info: param});
    }

    async returnGoods(orderType, orderNo, goods, orderId, expressCode) {
        // WebCat历史订单
        if (this.props.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        let res = {}
        let params = {
            type: '0',
            goods: goods,
            orderNo: orderNo,
            orderId: orderId,
            prodQty: 1,
            expressCode: expressCode,
            cb: this.props.load
        };
        if (orderType == '1') {
            let isErr = false
            try {
                res = await get(`/return/big_gif_befor.do?orderNo=${orderNo}`);
                let {status, message} = res;
                if (status == '700') {
                    this.refs.other.open({
                        content: [message],
                        btns: [{
                            txt: '我不要金币',
                            click: async () => {
                                this.goReturns(params)
                            }
                        }, {
                            txt: '我再想想',
                            click: () => {}
                        }]
                    })
                    return;
                }
            } catch (e) {
                isErr = true
            }


            this.refs.dialog.open({
                content: ['精选商品退货等于退店，如果精选商品有质量问题，请联系客服，如果需要退店，请点击退店'],
                btns: [{
                    txt: '退店',
                    click: () => {
                        if (isErr) {
                            this.refs['alert'].open('您的账户还有余额或未结算收入，请您在完成结算并全部提现后，再申请退店');
                            return;
                        }
                        let {status, message} = res;
                        if (status == '0') {
                            this.goReturns(params)
                        } else if (status == '1') {
                            this.refs.other.open({
                                content: ['您的账户还有余额或未结算收入，退店后将', '无法提现或结算，是否确定退店？'],
                                btns: [{
                                    txt: '确定',
                                    click: async () => {
                                        this.goReturns(params)
                                    }
                                }, {
                                    txt: '取消',
                                    click: () => {}
                                }]
                            })
                        }

                    }
                }, {
                    txt: '联系客服',
                    click: () => {
                        tools.toCall('400-005-5566')
                    }
                }]
            });
        } else {
            // todo
            this.goReturns(params)
        }
    }
    constructor(props) {
        super(props);
        this.returnGoods.bind(this);
    }
    render() {
        const items = this.props.items || [];
        const order = this.props.order || [];
        let expressCode = this.props.expressCode || '';
        const navigation = this.props.navigation;

        return <View style={styles.skuDetailItem}>
            <ScrollView>
                {items.map((item, index) =>
                    <View key={item.itemId}>
                        {index != '0' && <View style={styles.whiteSpace}></View>}
                        <View style={[styles.skuItemBase]}>
                            <TouchableOpacity
                                onPress={() => {
                                    //navigation.navigate('DetailPage', { id: item.prodId })
                                    !order.grouponInfoCode && item.prodId && this.props.navigation.navigate('DetailPage', {
                                        id: item.sku ? '' : item.prodId,
                                        sku: item.sku
                                    });
                                    order.grouponInfoCode && this.props.navigation.navigate('HtmlViewPage', {
                                        webPath: 'https://dalingjia.com/xcgroupon/goods-detail?code=' + order.grouponInfoCode,
                                        img: ''
                                    });
                                }}
                                activeOpacity={0.9} style={styles.skuItem}>
                                <Image style={styles.skuItemImage} source={{ uri: item.prodImg }} />
                                <View style={[styles.skuItemDetailInfoWrap, {justifyContent: 'space-between'}]}>
                                    <View style={styles.skuItemDetailInfo}>
                                        {item.isInBond == 1 &&
                                        <View style={[styles.flag, styles.flag1]}>
                                            <Text allowFontScaling={false} style={[styles.flagBaoShui]}> 保税 </Text>
                                        </View>
                                        }
                                        {item.isForeignSupply == 2 &&
                                        <View style={[styles.flag, styles.flag2]}>
                                            <Text allowFontScaling={false} style={[styles.flagZhiYou]}> 直邮 </Text>
                                        </View>
                                        }
                                        <Text numberOfLines={2} allowFontScaling={false}>
                                            {item.isInBond == 1 && <Text style={styles.flagLen}>flagLen</Text>}
                                            {item.isForeignSupply == 2 && <Text style={styles.flagLen}>flagLen</Text>}
                                            <Text allowFontScaling={false} style={styles.skuItemFont}>{item.goodsName}</Text>
                                            {/*<Text allowFontScaling={false} style={styles.skuItemFontSmall}>{item.brandName}</Text>*/}
                                        </Text>
                                    </View>
                                    <PreSale item={item} order = {this.props.order}/>
                                    {
                                        item.isVirtual == 1 && item.virtualStatus == 1 &&
                                        <TouchableWithoutFeedback onPress={() => this.goVirtual(item)}>
                                            <View style={styles.classesBtn}>
                                                <Text allowFontScaling={false} style={styles.classesBtnTxt}>领取课程</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    }
                                </View>
                                <View style={styles.skuItemPrice}>
                                    <Text allowFontScaling={false} style={styles.skuItemFont}>¥{item.prodPrice}</Text>
                                    <Text allowFontScaling={false} style={styles.skuItemFontSmall}>x{item.prodQty}</Text>
                                    {item.refundQty > 0 &&
                                    <Text allowFontScaling={false} style={styles.skuItemFontShow}>已退货:{item.refundQty}</Text>}
                                </View>

                            </TouchableOpacity>

                            <View style={styles.return}>
                                {(item.isInBond == '1' || item.isForeignSupply == 2) && order.orderStatus == 9 &&
                                <View style={styles.noReturn}>
                                    <Text allowFontScaling={false} style={styles.noReturnText}>保税、海外直邮商品非质量问题不支持退货</Text>
                                </View>}

                                {item.isShowRtBt && <TouchableWithoutFeedback
                                    onPress={() =>
                                        this.returnGoods(order.orderType, order.orderNo, item, item.itemId, expressCode)}>
                                    <View style={styles.returnBtn}>
                                        <Text allowFontScaling={false} style={styles.returnText}>退货</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                }
                            </View>

                        </View>
                    </View>
                )}
            </ScrollView>
            <DialogModal enabledExit={true} ref="dialog" />
            <DialogModal ref="other" />
            <AlertModal ref="alert"/>
        </View>
    }
}
export class RgOrderItem extends React.Component {
    constructor(props) {
        super(props)

    }
    goDetail() {
        const order = this.props.order || {};
        this.props.navigation.navigate('ReturnGoods', {
            orderNo: order.srNo,
            type: '1',
            cb: this.props.load,
            isWeCatHistory: this.props.isWeCatHistory
        });
    }
    render() {
        const order = this.props.order || {};
        const items = order.items || [];
        if (items.length == 0) return null;
        items.map((item, index) => {
            item.prodPrice = item.incPrice;
            item.prodQty = item.prodQtys;
            item.refundQty = 0;
        })
        return <View style={ [styles.rgOrderItem, this.props.noTopBorder && styles.noMarginTop] }>
            <TouchableWithoutFeedback onPress={() => this.goDetail()}>
                <View style={styles.rgOrderHead}>
                    <View style={styles.rgOrderHome}>
                        <Text allowFontScaling={false} style={styles.rgOrderName}>退货单号：{order.srNo}</Text>
                    </View>
                    <Text allowFontScaling={false} style={styles.rgOrderStatus}>{order.viewStatusTopDesc}</Text>
                </View>
            </TouchableWithoutFeedback>
            <SkuList order={this.props.order} items={items} clickEvent={() => this.goDetail()} />
            <TouchableWithoutFeedback onPress={() => this.goDetail()}>
                <View style={styles.rgOrderFoot}>
                    <Text allowFontScaling={false} style={styles.rgOrderTip}>{order.viewStatusDesc}</Text>
                    {order.viewStatus == 'SrViewStatus_2' && order.skuSource != 'suning' && <View style={styles.rgOrderBack}>
                        <Text allowFontScaling={false} style={styles.rgOrderBackText}>寄回商品</Text>
                    </View>}
                </View>
            </TouchableWithoutFeedback>
        </View>
    }
}

export class ExpressList extends React.Component {

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
        const items = this.props.items;  // sku
        const order = this.props.order;  // Express

        if (items.length == 0) return <View></View>
        return <View style={styles.expressItems}>
            {items.map((item, index) =>
                <View style={[styles.expressItem]} key={item.expressCode}>
                    <View>
                        {
                            item.logisticsCenter && <TouchableWithoutFeedback onPress={() => this.goDetail(order.orderNo)}>
                                <View style={styles.expressItemTop}>

                                    {item.logisticsCenter && <Text allowFontScaling={false}
                                        style={{ fontSize: px(26)}}>
                                        {item.logisticsCenter}发货
                                    </Text>
                                    }

                                    {
                                        order.orderStatus != 0 && order.orderStatus != 99 &&
                                        <Text allowFontScaling={false}
                                            style={styles.statusColor}>{item.statusName}
                                        </Text>
                                    }
                                </View>
                            </TouchableWithoutFeedback>
                        }
                        <SkuList items={item.skuList} order={order} clickEvent={() => this.goDetail(order.orderNo)} />
                        
                        {this.renderTip(item, order)}

                    </View>

                    <OrderTools
                        order={this.props.order}
                        showTell={this.props.showTell}
                        type={this.props.type}
                        orderNo={item.orderNo}
                        virtualSkuType={item.isExistsVirtual}
                        shipDate={item.shipDate}
                        skuList={item.skuList}
                        aoNo={item.expressCode}
                        status={item.status}
                        expressNoNum={item.expressNoNum}
                        expressNo={item.expressNo}
                        from = {'list'}
                        // 微信历史订单
                        isWeCatHistory={ this.props.isWeCatHistory }
                        navigation={this.props.navigation} />

                    {(item.status == 20 || item.status == 30 || item.status == 50 || item.isShowRtBt) && <View style={[{height: px(1), backgroundColor: '#efefef'}, items.length > 0 ? {
                        width: px(720),
                        marginLeft: px(30)
                    } : {}, items.length - 1 == index ? {
                        width: px(750),
                        marginLeft: 0
                    } : {}]}/>}
                </View>
            )}
        </View>
    }

    goDetail(orderNo) {
        this.props.navigation.navigate('OrderDetailPage', {
            orderNo: orderNo,
            type: this.props.type,
            // 微信历史订单
            isWeCatHistory: this.props.isWeCatHistory,
            callback: async () => {
                // await this.props.reCan()
            }
        });
    }
}

const styles = StyleSheet.create({
    whiteSpace: {
        height: px(3),
        backgroundColor: '#fff'
    },
    noReturn: {
        flex: 1,
        height: px(45),
        justifyContent: 'center'
    },
    noReturnText: {
        fontSize: px(24),
        color: '#ed3f58',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    return: {
        // height: px(45),
        // paddingTop: px(10),
        // paddingBottom: px(20),
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    returnBtn: {
        width: px(100),
        height: px(45),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: px(1),
        borderColor: '#b2b3b5',
        borderRadius: px(8)
    },
    returnText: {
        fontSize: px(24),
        color: '#252426',
        includeFontPadding: false
    },
    rgOrderItem: {
        width: px(750),
        marginTop: px(20),
        backgroundColor: '#FFFFFF'
    },
    noMarginTop: {
        marginTop: 0
    },
    rgOrderHead: {
        height: px(80),
        paddingHorizontal: px(30),
        flexDirection: 'row',
        alignItems: 'center'
    },
    rgOrderHome: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    rgOrderHomeIcon: {
        width: px(15),
        height: px(26),
        marginLeft: px(16)
    },
    rgOrderStatus: {
        fontSize: px(28),
        color: '#d0648f',
        textAlignVertical: 'center'
    },
    rgOrderName: {
        fontSize: px(28),
        color: '#252426',
        textAlignVertical: 'center'
    },
    rgOrderFoot: {
        height: px(80),
        paddingHorizontal: px(30),
        flexDirection: 'row',
        alignItems: 'center'
    },
    rgOrderTip: {
        flex: 1,
        fontSize: px(24),
        color: '#858385',
        textAlignVertical: 'center'
    },
    rgOrderBack: {
        width: px(130),
        height: px(50),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: px(1),
        borderColor: '#252426',
        borderRadius: px(8)
    },
    rgOrderBackText: {
        fontSize: px(24),
        color: '#252426'
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
    expressItems: {},
    expressItem: {},
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
const preStyles = StyleSheet.create({
    preSale: {
        width: px(348),
        height: px(36),
        borderRadius: px(5),
        overflow: 'hidden',
        borderColor: '#a363d6',
        borderWidth: px(1),
        
    },
    sale: {
        width: px(67),
        
        height: px(36),
        backgroundColor: '#a363d6',
        paddingHorizontal: px(7)
    },
    saleTxt: {
        fontSize: px(24),
        color: '#fff',
        textAlignVertical: 'center'
    },
    time: {
        flex: 1,
        //paddingHorizontal: px(7),
        height: px(36),
        backgroundColor: '#f2deff',
        //width: px(280)
    }
});

exports.SkuListDetail = SkuListDetail;
exports.SkuList = SkuList;
