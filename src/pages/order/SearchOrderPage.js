'use strict';

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Animated,
    Alert,
    Modal,
    Image,
    NativeModules,
    Platform,
    TextInput
} from 'react-native'
import { getBottomSpace } from 'react-native-style-adaptive'
import Page from '../../UI/Page'
import { px } from '../../utils/Ratio';
import { ExpressList, RgOrderItem } from './OrderItems';
import { show as toast } from '../../widgets/Toast';
import { log, logErr, logWarm } from '../../utils/logs'
import { TopHeader, SearchBar } from '../common/Header'
import request, { getHeader } from '../../services/Request'
import { OrderItem } from './ListPage'
import { pay as wxPay, isWXAppInstalled } from '../../services/WeChat'
import { setItem, removeItem, getItem } from '../../services/Storage';
import util_tools from '../../utils/tools'
import Loading from '../../animation/Loading'
import Icon from '../../UI/lib/Icon'

import EmptyData from '../common/EmptyData'
import SwitchMotel, { DateSelect, Radio, Checkbox } from '../common/RightMotel'
import { dataFormat } from '../../utils/dataFormat'
import { Load, NoData } from '../ownerAbility/common/FooterPrompt'

const aliPay = NativeModules.Alipay;

class OrderItem1 extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            time: ''
        }

        this.timer = null

    }

    render() {
        const order = this.props.order;
        return <View style={[orderStyles.order, {
            marginTop: this.props.index == 0 ? 0 : px(20)
        }]}>
            <View>
                <TouchableWithoutFeedback onPress={() => this.goDetail(order.orderNo)}>
                    <View style={orderStyles.orderHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={orderStyles.orderNo}>订单编号 {order.orderNo} </Text>
                            {/* <Icon name="search-select"/> */}
                            {order.orderType == 1 && <Icon name="search-select" style={orderStyles.orderTypeSelect} />}
                            {!!order.isVip && <Icon name="search-vip" style={orderStyles.orderTypeVip} />}
                        </View>
                        <Text allowFontScaling={false} style={orderStyles.orderStatus}>{order.orderStatusNm}</Text>
                    </View>
                </TouchableWithoutFeedback>
                <ExpressList showTell={this.props.showTell}
                    items={order.expressList}
                    type={this.props.type}
                    // WebCat历史订单
                    isWeCatHistory={this.props.isWeCatHistory}
                    order={order} navigation={this.props.navigation} reCan={this.props.reCan} />
            </View>
            <TouchableWithoutFeedback onPress={() => this.goDetail(order.orderNo)}>
                <View style={orderStyles.orderFooter}>
                    <View style={{ flexDirection: 'column', justifyContent: 'center', height: px(80) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={orderStyles.orderPay}>
                                {order.orderStatus == 0 ? `应付金额￥${Number(order.payableAmount).toFixed(2)}` : `实付金额￥${Number(order.payAmount).toFixed(2)}`}
                            </Text>
                            {!this.props.hideMoney && this.props.type == 1 && [5, 6, 7, 8, 10].indexOf(order.orderStatus) >= 0 &&
                                <View style={orderStyles.epTag}>
                                    {
                                        !order.isOwner && <View style={[orderStyles.epTagView, {
                                            backgroundColor: '#D0648F',
                                        }]}>
                                            <Text allowFontScaling={false}
                                                style={orderStyles.tagTxt}>赚</Text>
                                        </View>
                                    }
                                    {
                                        order.isOwner && <View style={[orderStyles.epTagView, {
                                            backgroundColor: '#44b7ea',
                                        }]}>
                                            <Text allowFontScaling={false}
                                                style={orderStyles.tagTxt}>省</Text>
                                        </View>
                                    }
                                    <Text allowFontScaling={false} style={[orderStyles.orderEarn]}>赚￥0.00(退款无法结算)</Text>
                                </View>
                            }
                            {!this.props.hideMoney && this.props.type == 1 && [99].indexOf(order.orderStatus) >= 0 &&
                                <View style={orderStyles.epTag}>
                                    {
                                        !order.isOwner && <View style={[orderStyles.epTagView, {
                                            backgroundColor: '#D0648F',
                                        }]}>
                                            <Text allowFontScaling={false}
                                                style={orderStyles.tagTxt}>赚</Text>
                                        </View>
                                    }
                                    {
                                        order.isOwner && <View style={[orderStyles.epTagView, {
                                            backgroundColor: '#44b7ea',
                                        }]}>
                                            <Text allowFontScaling={false}
                                                style={orderStyles.tagTxt}>省</Text>
                                        </View>
                                    }
                                    <Text allowFontScaling={false} style={orderStyles.orderEarn}>￥0.00</Text>
                                </View>
                            }
                            {!this.props.hideMoney && this.props.type == 1 && [5, 6, 7, 8, 10, 99].indexOf(order.orderStatus) == -1 &&
                                <View style={orderStyles.epTag}>
                                    {
                                        !order.isOwner && <View style={[orderStyles.epTagView, {
                                            backgroundColor: '#D0648F',
                                        }]}>
                                            <Text allowFontScaling={false}
                                                style={orderStyles.tagTxt}>赚</Text>
                                        </View>
                                    }
                                    {
                                        order.isOwner && <View style={[orderStyles.epTagView, {
                                            backgroundColor: '#44b7ea',
                                        }]}>
                                            <Text allowFontScaling={false}
                                                style={orderStyles.tagTxt}>省</Text>
                                        </View>
                                    }
                                    <Text allowFontScaling={false} style={orderStyles.orderEarn}>￥{order.earnAmount}</Text>
                                </View>
                            }
                        </View>
                        {(this.props.type == 0 || this.props.type == 1 && order.isOwner) && order.orderStatus == 0 &&
                            <Text allowFontScaling={false} style={{ fontSize: px(20), color: '#858385' }}>
                                付款剩余时间{this.state.time}
                            </Text>
                        }
                    </View>
                    {
                        (this.props.type == 0 || this.props.type == 1 && order.isOwner) && order.orderStatus == 0 &&
                        <View style={{ flexDirection: 'row' }}>
                            <Text onPress={this.cancel} style={[orderStyles.cBtn, orderStyles.cancelBtn]}
                                allowFontScaling={false}>取消订单</Text>
                            <Text onPress={this.pay} style={[orderStyles.cBtn, orderStyles.payBtn]}
                                allowFontScaling={false}>去支付</Text>
                        </View>
                    }
                    {
                        order.orderStatus == 99 && <TouchableOpacity onPress={() => this.delOrder(order)}>
                            <View style={orderStyles.Btn}>
                                <Text allowFontScaling={false} style={orderStyles.cBtn1}>
                                    删除订单
                                </Text>
                            </View>
                        </TouchableOpacity>
                    }
                    {
                        this.props.type == 1 && this.props.status == 4 &&
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#858385', fontSize: px(24) }}
                                allowFontScaling={false}>{`还有${Math.floor(order.endSuccessTime / 60 / 60 / 24) + 1}天佣金可到账`}</Text>
                        </View>
                    }
                </View>
            </TouchableWithoutFeedback>
        </View>
    }

    goDetail = (orderNo) => {
        this.props.navigation.navigate('OrderDetailPage', {
            orderNo: orderNo,
            type: this.props.type,
            // WebCat历史订单
            isWeCatHistory: this.props.isWeCatHistory,
            callback: async () => {
                // await this.props.reCan()
            }
        })
    }

    delOrder = async (order) => {
        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定删除订单？`,
                [{
                    text: '取消', onPress: () => resolve(false)
                }, {
                    text: '确定', onPress: () => resolve(true)
                }]
            )
        });
        if (!confirm) {
            return;
        }
        try {
            if (this.props.type == 0) {
                await request.post(`/saleOrderApp/deleteOrder.do?orderNo=${order.orderNo}`);
            } else if (this.props.type == 1) {
                await request.post(`/saleOrderApp/deleteShopOrder.do?orderNo=${order.orderNo}`);
            }

            this.props.delCan(order.orderNo)
            toast('删除订单成功')
        } catch (e) {
            toast(e.message)
        }
    }

    componentDidMount() {
        let time = this.props.order.endPayTime
        let h = Math.floor(time / 60 / 60)
        let m = Math.floor(time / 60 % 60)
        let s = Math.floor(time % 60)
        this.setState({
            time: (h < 10 ? '0' + h : h) + "时" + (m < 10 ? '0' + m : m) + "分" + (s < 10 ? '0' + s : s) + '秒'
        })
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    aliPayErr(ret) {
        return /9000/.test(ret)
    }

    pay = async () => {
        // 微信历史订单
        if (this.props.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        let data = {};
        let uid = getHeader('uid')
        let code = await getItem(`payPlatform${uid}`);
        try {
            data = await request.post('/saleOrderApp/payOrder.do', { ///saleOrder/createOrder.do
                orderNo: this.props.order.orderNo,
                payPlatform: code
            });
        } catch (e) {
            return toast(e.message)
        }
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

    cancel = async () => {
        // 微信历史订单
        if (this.props.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要取消么？`,
                [{
                    text: '我再想想', onPress: () => resolve(false)
                }, {
                    text: '确定取消', onPress: () => resolve(true)
                }]
            )
        });
        if (!confirm) {
            return;
        }
        try {
            await request.post(`/saleOrderApp/cancelOrder.do?orderNo=${this.props.order.orderNo}`);
            toast('取消成功')
        } catch (e) {
            toast(e.message)
        }
        this.props.reCan(this.props.order.orderNo)
    }
}

const orderStyles = StyleSheet.create({
    order: {
        backgroundColor: '#fff',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: px(20),
        paddingBottom: px(20),
        paddingLeft: px(30),
        paddingRight: px(30),
        borderBottomWidth: px(1),
        borderColor: '#efefef'
    },
    orderNo: {
        fontSize: px(28),
        color: '#222'
    },
    orderStatus: {
        fontSize: px(26),
        lineHeight: px(30)
    },
    orderEarn: {
        fontSize: px(28),
        color: '#252426',
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        height: px(80),
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    orderPay: {
        fontSize: px(26),
        color: '#222'
    },
    cBtn1: {
        fontSize: px(24),
        color: '#252426',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    cBtn: {
        fontSize: px(24),
        height: px(48),
        borderWidth: px(1),
        marginLeft: px(14),
        width: px(128),
        borderRadius: px(6),
        overflow: 'hidden',
        textAlign: 'center',
        paddingTop: px(11)
    },
    Btn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: px(48),
        borderWidth: px(1),
        borderColor: '#b2b3b5',
        marginLeft: px(14),
        width: px(128),
        borderRadius: px(6),
        overflow: 'hidden'
    },
    cancelBtn: {
        color: '#252426',
        borderWidth: px(1),
        borderColor: '#b2b3b5'
    },
    payBtn: {
        color: '#fff',
        backgroundColor: '#d0648f',
        borderColor: '#d0648f'
    },
    epTag: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    epTagView: {
        marginLeft: px(25),
        marginRight: px(6),
        justifyContent: 'center',
        alignItems: 'center',
        width: px(28),
        height: px(28),
        borderRadius: 2
    },
    tagTxt: {
        fontSize: px(22),
        color: '#ffffff',
        textAlign: 'center',
        paddingBottom: px(2)
    },
    orderTypeSelect: {
        width: px(63),
        height: px(28),
        marginRight: 4
    },
    orderTypeVip: {
        width: px(78),
        height: px(28)
    }
})

export default class extends React.Component {

    constructor(props) {
        super(props)
        if (!this.props.navigation.state.params) {
            this.props.navigation.state.params = {}
        }

        this.isWeCatHistory = props.navigation.getParam('isWeCatHistory', false)
        this.startDate = props.navigation.getParam('startDate', '')
        this.endDate = props.navigation.getParam('endDate', '')
        this.immediately = props.navigation.getParam('immediately', false)
        this.isEmpty = false

        this.state = {
            type: this.props.navigation.state.params.type || 0,
            list: [],
            refreshing: false,
            empty: '',
            modalVisible: false,
            shopName: "",
            shopUserMobile: "",
            fHeight: 0,
            isNoDate: false,
            ...this.initSelectOptions()
        }
    }

    initSelectOptions(isReset) {
        const timeList = [
            {
                value: 518400000,
                selected: false,
                text: '近7日'
            },
            {
                value: 2505600000,
                selected: this.isInit,
                text: '近30天'
            },
            {
                value: 7689600000,
                selected: false,
                text: '近90天'
            }
        ]

        const typeList = [
            {
                value: 0,
                selected: false,
                text: '商品'
            },
            {
                value: 1,
                selected: false,
                text: '精选'
            },
            {
                value: 2,
                selected: false,
                text: '拼团'
            }
        ]

        const statusList = [
            {
                value: 0,
                selected: false,
                text: '待支付'
            },
            {
                value: 2,
                selected: false,
                text: '待发货'
            },
            {
                value: 3,
                selected: false,
                text: '待收货'
            },
            {
                value: 4,
                selected: false,
                text: '已收货'
            },
            {
                value: 9,
                selected: false,
                text: '已完成'
            },
            {
                value: 5,
                selected: false,
                text: '已退货'
            },
            {
                value: 99,
                selected: false,
                text: '已取消'
            }
        ]

        const wayList = [
            {
                value: 1,
                selected: false,
                text: '买'
            },
            {
                value: 2,
                selected: false,
                text: '卖'
            }
        ]

        let startDate = this.startDate
        let endDate = this.endDate

        if (isReset) {
            startDate = ''
            endDate = ''
        }

        const defaultOptions = {
            timeOptions: {
                title: '下单日期',
                leftProps: {
                    placeholder: {
                        text: '请选择开始时间',
                    },
                    date: startDate,
                    max: endDate || dataFormat(new Date())
                },
                rightProps: {
                    placeholder: {
                        text: '请选择结束时间',
                    },
                    date: endDate,
                    max: dataFormat(new Date()),
                },
                list: timeList
            },
            typeOptions: {
                title: '订单类型',
                list: typeList
            },
            statusOptions: {
                title: '订单状态',
                list: statusList
            },
            wayOptions: {
                title: '购买类型',
                list: wayList
            }
        }

        const typeConditions = typeList.filter(item => item.selected)
        const statusConditions = statusList.filter(item => item.selected)
        const wayConditions = wayList.filter(item => item.selected)

        return {
            selected: defaultOptions,
            startDate,
            endDate,
            dateChecked: timeList.filter(item => item.selected),
            typeConditions,
            statusConditions,
            wayConditions,
            isSelected: typeConditions.length || statusConditions.length || wayConditions.length || endDate || startDate
        }
    }

    delCan = (orderNo) => {
        let { list } = this.state
        let newList = list.filter(item => item.orderNo != orderNo);
        this.setState({
            list: newList
        })
    }

    render() {
        return <View style={{ flex: 1, paddingBottom: getBottomSpace() }}>
            <SearchBar placeholder="订单编号/微信昵称/收货信息"
                immediately={this.immediately}
                goSearch={(t) => this.searchOrder(t)}
                type={this.state.type}
                hide={() => this.setState({ hideMoney: !this.state.hideMoney })}
                selected={() => this.selected()}
                hideMoney={this.state.hideMoney}
                navigation={this.props.navigation}
                isSelected={this.state.isSelected}
                bodyStyle={{
                    backgroundColor: '#EFEFEF'
                }}
                inputColor={'#B2B3B5'}
                style={{
                    backgroundColor: '#fbfafc'
                }}
            />
            <FlatList
                ref="dlist"
                data={this.state.list}
                refreshing={this.state.refreshing}
                style={this.state.list.length === 0 ? { backgroundColor: "#fff" } : null}
                showsVerticalScrollIndicator={false}
                onRefresh={() => this.downRefresh()}
                keyExtractor={(item) => item.orderNo}
                onEndReached={() => this.next()}
                onLayout={e => {
                    let height = e.nativeEvent.layout.height

                    if ( this.state.fHeight < height) {
                        this.setState({ fHeight: height })
                    }
                }}
                renderItem={({ item, index }) =>
                    <OrderItem1 showTell={this.showTell.bind(this)}
                        index={index}
                        order={item} type={this.state.type}
                        navigation={this.props.navigation}
                        hideMoney={this.state.hideMoney}
                        reCan={() => this.reCan2()}
                        delCan={this.delCan}
                        // 微信历史订单
                        isWeCatHistory={this.isWeCatHistory}
                        status={1}
                    />
                }
                ListFooterComponent={() => {
                    return <View>
                        <Load ref={ref => this.loadRef = ref} />
                        {this.state.isNoDate && !!this.state.list.length && <NoData />}
                    </View>
                }}
                ListEmptyComponent={
                    this.state.type == 1 && !this.state.list.length && this.isEmpty ?
                        <EmptyData
                            style={{ height: this.state.fHeight }}
                            name="no-orders"
                            prompt="暂无相关订单，亲要加油咯"
                            btnText="开工吧~"
                            onPress={() => this.props.navigation.navigate('ShopPage')}
                        />
                        : <Text allowFontScaling={false} style={styles.emptyList}>{this.state.empty}</Text>
                } />
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { }} >
                <View style={styles.modal}>
                    <View style={styles.closeWrap}>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({ modalVisible: false });
                        }}>
                            <View style={{ width: px(60), height: px(80), marginRight: px(20) }}>
                                <Icon name="icon-close" style={styles.modalClose} />
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                    <View style={styles.modalBox}>
                        {this.state.type != 1 &&
                            <View>
                                <Text allowFontScaling={false} style={styles.modalLine}>若购买的商品出现问题，请联系店主进行售后服务：</Text>
                                <Text allowFontScaling={false} style={styles.modalLine}>店铺名称：{this.state.shopName}</Text>
                                <Text allowFontScaling={false} style={styles.modalLine}>店主电话：<Text onPress={() => {
                                    util_tools.toCall(this.state.shopUserMobile)
                                }} style={{ color: '#44b7ea' }} allowFontScaling={false}>{this.state.shopUserMobile}</Text></Text>
                                <Text> </Text>
                                <Text allowFontScaling={false} style={styles.modalLine}>如您无法联系店主，请联系达令家客服：</Text>
                            </View>
                        }
                        {
                            this.state.type == 1 &&
                            <Text allowFontScaling={false} style={styles.modalLine}>若购买的商品出现问题，请联系我们的客服进行售后服务：</Text>
                        }
                        <Text allowFontScaling={false} style={styles.modalLine}>电话：<Text onPress={() => {
                            util_tools.toCall('400-005-5566')
                        }} style={{ color: '#44b7ea' }} allowFontScaling={false}>400-005-5566</Text></Text>
                        <Text allowFontScaling={false} style={styles.modalLine}>微信公众号：达令家(搜索dalingfamily)</Text>
                        <Text allowFontScaling={false} style={styles.modalLine}>客服时间：周一至周日 9:00-21:00</Text>
                    </View>
                </View>
            </Modal>
            <SwitchMotel
                ref={ref => this.motel = ref}
                reset={this.resetMotel.bind(this)}
                determine={this.determineMotel.bind(this)}
            >
                <DateSelect
                    {...this.state.selected.timeOptions}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    checked={this.state.dateChecked}
                    ref={ref => this.dateRef = ref}
                >
                </DateSelect>
                <Checkbox
                    {...this.state.selected.typeOptions}
                    checked={this.state.typeConditions}
                    ref={ref => this.typeRef = ref}
                />
                <Checkbox
                    {...this.state.selected.statusOptions}
                    checked={this.state.statusConditions}
                    ref={ref => this.statusRef = ref}
                />
                <Checkbox
                    {...this.state.selected.wayOptions}
                    checked={this.state.wayConditions}
                    ref={ref => this.wayRef = ref}
                />
            </SwitchMotel>
            <Loading ref="loading" />
        </View>
    }

    componentDidMount() {
        this.onReady()
    }

    downRefresh() {
        this.pageIndex = 1
        this.totalPages = 2
        this.refresh()
    }

    onReady() {
        if (this.immediately) {
            this.pageIndex = 1
            this.totalPages = 2
            this.refresh()
        }
    }

    selected() {
        this.motel.open()
    }

    resetMotel() {
        this.pageIndex = 1
        this.totalPages = 2
        this.refs.loading.open()
        this.setState({
            list: [],
            empty: '',
            ...this.initSelectOptions(true)
        }, () => {
            this.refresh()
        })
    }

    determineMotel() {
        const typeConditions = this.typeRef.getSelected()
        const statusConditions = this.statusRef.getSelected()
        const wayConditions = this.wayRef.getSelected()
        const date = this.dateRef.getDate()

        const isSelected = typeConditions.length || statusConditions.length || wayConditions.length || date.startDate || date.endDate

        this.setState({
            typeConditions,
            statusConditions,
            wayConditions,
            ...date,
            isSelected,
            empty: '',
            list: []
        }, () => {
            this.pageIndex = 1
            this.totalPages = 2
            this.refs.loading.open()
            this.refresh()
        })
    }

    pageIndex = 1

    totalPages = 2

    searchTxt = ''

    isLoad = false

    async searchOrder(t) {
        log("搜索:" + t)
        this.setState({
            list: [],
            empty: '',
            ...this.initSelectOptions()
        }, () => {
            this.pageIndex = 1
            this.totalPages = 2
            this.searchTxt = t
            this.refs.loading.open()
            this.refresh()
        })
    }

    arrayParameter(key, values) {
        return values.map(item => `&${key}=${item.value}`).join('')
    }

    async refresh() {
        if (!this.searchTxt && !this.state.type) return this.refs.loading.close()

        this.isLoad = true
        this.isEmpty = false

        let list = []

        try {
            if (this.state.type == 1) {
                const { startDate, endDate, typeConditions, statusConditions, wayConditions } = this.state
                const result = await request.get(`/saleOrderApp/findSaleOrderListForShop.do?pageIndex=${this.pageIndex}&searchValue=${this.searchTxt}&startDateStr=${startDate}&endDateStr=${endDate}${this.arrayParameter('status', statusConditions)}${this.arrayParameter('orderType', typeConditions)}${this.arrayParameter('buyType', wayConditions)}`)
                this.totalPages = result.totalPages
                list = result.list
            } else {
                // 微信历史订单
                const _url = this.isWeCatHistory ? 'findTouchHistorySaleOrderList' : 'findSaleOrderList'

                list = await request.get(`/saleOrderApp/${_url}.do`, {
                    type: this.state.type,
                    pageIndex: this.pageIndex,
                    searchValue: this.searchTxt
                })
            }

            if (!list || list.constructor !== Array) return

            list.map(item => item.page = this.pageIndex)
        } catch (e) {
            toast(e.message)
        } finally {
            this.refs.loading.close()

            this.isEmpty = true
            this.isLoad = false
            this.setState({ list, empty: "您还没有相关订单", isNoDate: this.pageIndex >= this.totalPages }, () => {
                this.refs.dlist && this.refs.dlist.scrollToOffset(0)
            })
        }
    }

    async next() {
        if (this.isLoad) return
        if (!this.searchTxt && this.state.type != 1) return
        if (this.state.type == 1 && this.pageIndex >= this.totalPages) return

        this.isLoad = true
        this.pageIndex++

        let list = []
        this.loadRef.open()

        try {
            if (this.state.type == 1) {
                const { startDate, endDate, typeConditions, statusConditions, wayConditions } = this.state

                const result = await request.get(`/saleOrderApp/findSaleOrderListForShop.do?pageIndex=${this.pageIndex}&searchValue=${this.searchTxt}&startDateStr=${startDate}&endDateStr=${endDate}${this.arrayParameter('status', statusConditions)}${this.arrayParameter('orderType', typeConditions)}${this.arrayParameter('buyType', wayConditions)}`)

                this.totalPages = result.totalPages
                list = result.list

            } else {
                const _url = this.isWeCatHistory ? 'findTouchHistorySaleOrderList' : 'findSaleOrderList'

                list = await request.get(`/saleOrderApp/${_url}.do`, {
                    type: this.state.type,
                    pageIndex: this.pageIndex,
                    searchValue: this.searchTxt
                })
            }

            if (!list || list.constructor !== Array) return

            list.map(item => item.page = this.pageIndex)
            this.setState({ list: this.state.list.concat(list), isNoDate: this.pageIndex >= this.totalPages })
        } catch (e) {
            toast(e.message)
        } finally {
            this.loadRef.close()
            this.isLoad = false;
        }
    }

    reCan2() {
        this.searchOrder(this.searchTxt)
    }

    async reCan(page) {
        let list = []

        try {
            if (this.state.type == 1) {
                const { startDate, endDate, typeConditions, statusConditions, wayConditions } = this.state

                list = await request.get(`/saleOrderApp/findSaleOrderListForShop.do?pageIndex=${this.pageIndex}&searchValue=${this.searchTxt}&startDateStr=${startDate}&endDateStr=${endDate}${this.arrayParameter('status', statusConditions)}${this.arrayParameter('orderType', typeConditions)}${this.arrayParameter('buyType', wayConditions)}`)
            } else {
                const _url = this.isWeCatHistory ? 'findTouchHistorySaleOrderList' : 'findSaleOrderList'

                list = await request.get(`/saleOrderApp/${_url}.do`, {
                    type: this.state.type,
                    pageIndex: this.pageIndex,
                    searchValue: this.searchTxt
                })
            }

            if (!list || list.constructor !== Array) return

            list.forEach((item, index) => {
                item.page = page
                this.state.list[(page - 1) * 10 + index] = item
            })
            this.setState({ list: this.state.list.concat() })
        } catch (e) {
            toast(e.message)
        }
    }

    showTell(shopName, shopUserMobile) {
        this.setState({
            modalVisible: true,
            shopName,
            shopUserMobile
        })
    }
}

const styles = StyleSheet.create({
    headerSearchBar: {
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(20),
        marginRight: px(20),
        alignItems: "center",
        borderRadius: px(30)
    },
    headerSearchImg: {
        marginLeft: px(15)
    },
    headerSearchInput: {
        width: px(540),
        color: "#252426",
        fontSize: px(28),
        height: px(60),
        padding: 0
    },
    emptyList: {
        flex: 1,
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    },
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: px(20),
        borderRadius: px(10),
        width: px(650),
    },
    closeWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: px(690)
    },
    modalClose: {
        width: px(60),
        height: px(80),
        //marginRight: px(20)
    },
    modalText: {
        fontSize: px(30),
        color: "#fff"
    },
    modalLine: {
        color: '#666',
        padding: px(10),
        alignItems: 'center'
    }
})