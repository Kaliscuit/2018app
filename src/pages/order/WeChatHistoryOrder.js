'use strict'

import React from 'react'

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
    Platform
} from 'react-native'

import { getItem } from '../../services/Storage'
import { px } from '../../utils/Ratio'
import { get, getHeader, post } from '../../services/Request'
import util_tools from '../../utils/tools'
import { ExpressList, RgOrderItem } from './OrderItems'
import { pay as wxPay, isWXAppInstalled } from '../../services/WeChat'
import { show as toast } from '../../widgets/Toast'
import T from '../common/TabsTest'
import { TopHeader } from '../common/Header'
import Loading from '../../animation/Loading'
import ScrollableTabView from 'react-native-scrollable-tab-view2'
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import { User } from "../../services/Api"

const PAGE_SIZE = 10
const aliPay = NativeModules.Alipay

//列表的单项组件
class OrderItem extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            time: "",
        }
        this.timer = null
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

    prompt () {
        toast('请解绑微信后从微信端操作')
    }

    /**
     * "省" 标签
     * @private
     */
    _renderEconomyTag(colourValue) {
        return (
            <View style={[orderStyles.epTagView, {
                backgroundColor: colourValue,
            }]}>
                <Text allowFontScaling={false}
                    style={orderStyles.tagTxt}>省</Text>
            </View>
        )
    }

    /**
     * "赚" 标签
     * @returns {*}
     * @private
     */
    _renderProfitTag(colourValue) {
        return (
            <View style={[orderStyles.epTagView, {
                backgroundColor: colourValue,
            }]}>
                <Text allowFontScaling={false}
                    style={orderStyles.tagTxt}>赚</Text>
            </View>
        )
    }

    /**
     * 订单管理工具栏
     * @returns {*}
     * @private
     */
    _renderOrderManagement(order) {
        return (
            <View style={orderStyles.orderFooter}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        <Text allowFontScaling={false} style={orderStyles.orderPay}>
                            {order.orderStatus == 0 ? `应付金额￥${Number(order.payableAmount).toFixed(2)}` : `实付金额￥${Number(order.payAmount).toFixed(2)}`}
                        </Text>

                        {!this.props.hideMoney && this.props.type == 1 && [5, 6, 7, 8, 10].indexOf(order.orderStatus) >= 0 &&
                            <View style={orderStyles.tagView}>

                                {
                                    this._renderEconomyTag('#999999')
                                }

                                <Text allowFontScaling={false}
                                    style={[orderStyles.tagMsg, { color: '#999999' }]}>￥0.00(退款无法结算)</Text>
                            </View>
                        }

                        {!this.props.hideMoney && this.props.type == 1 && [99].indexOf(order.orderStatus) >= 0 &&
                            <View style={orderStyles.tagView}>
                                {
                                    this._renderEconomyTag('#44b7ea')
                                }
                                <Text allowFontScaling={false} style={orderStyles.tagMsg}>￥0.00</Text>
                            </View>
                        }

                        {!this.props.hideMoney && this.props.type == 1 && [5, 6, 7, 8, 10, 99].indexOf(order.orderStatus) == -1 &&
                            <View style={orderStyles.tagView}>
                                {
                                    this._renderEconomyTag('#44b7ea')
                                }
                                <Text allowFontScaling={false} style={orderStyles.tagMsg}>￥{order.earnAmount}</Text>
                            </View>
                        }
                    </View>

                    {(this.props.type == 0 || this.props.type == 1) && order.orderStatus == 0 &&
                        <Text allowFontScaling={false} style={{ fontSize: px(20), color: '#858385' }}>
                            付款剩余时间{this.state.time}
                        </Text>
                    }
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {
                        order.orderStatus == 0 ? <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={this.prompt}>
                                <View style={[orderStyles.Btn, orderStyles.cancelBtn]}>
                                    <Text style={[orderStyles.cBtn, orderStyles.cBtn1]}
                                        allowFontScaling={false}>取消订单</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.prompt}>
                                <View style={[orderStyles.Btn, orderStyles.payBtn]}>
                                    <Text style={[orderStyles.cBtn, orderStyles.cBtn2]}
                                        allowFontScaling={false}>去支付</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                            : <View />
                    }

                    {order.orderStatus == 99 &&
                        <TouchableOpacity onPress={this.prompt}>
                            <View style={[orderStyles.Btn, orderStyles.cancelBtn]}>
                                <Text style={[orderStyles.cBtn, orderStyles.cBtn1]} allowFontScaling={false}>
                                    删除订单
                                </Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

                {
                    this.props.type == 1 && this.props.status == 4 &&
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: '#858385', fontSize: px(24) }}
                            allowFontScaling={false}>{`还有${Math.floor(order.endSuccessTime / 60 / 60 / 24) + 1}天佣金可到账`}</Text>
                    </View>
                }

            </View>
        )
    }


    render() {
        const order = this.props.order
        return <View style={orderStyles.order}>
            <View>
                <TouchableWithoutFeedback onPress={() => this.goDetail(order.orderNo)}>
                    <View style={orderStyles.orderHeader}>
                        <Text allowFontScaling={false} style={orderStyles.orderNo}>订单编号 {order.orderNo} </Text>
                        <Text allowFontScaling={false} style={orderStyles.orderStatus}>{order.orderStatusNm}</Text>
                    </View>
                </TouchableWithoutFeedback>

                <ExpressList
                    showTell={this.props.showTell}
                    items={order.expressList}
                    type={this.props.type}
                    order={order}
                    navigation={this.props.navigation}
                    isWeCatHistory={true}
                    reCan={this.props.reCan} />

            </View>
            <TouchableWithoutFeedback onPress={() => this.goDetail(order.orderNo)}>
                {this._renderOrderManagement(order)}
            </TouchableWithoutFeedback>
        </View>
    }

    goDetail = (orderNo) => {
        this.props.navigation.navigate('OrderDetailPage', {
            orderNo: orderNo,
            type: this.props.type,
            isWeCatHistory: true,
            callback: async () => {
                // await this.props.reCan()
            }
        })
    }

}

exports.OrderItem = OrderItem

//列表组件
class OrderList extends React.Component {

    constructor(props) {
        super(props)
        this.hasNext = true
        this.nextPage = 1
        this.state = {
            refreshing: false,
            firstLoad: this.props.firstLoad,
            list: [],
            empty: ""
        }
    }

    render() {

        return (
            <View style={{ flex: 1, width: px(750) }}>
                <FlatList
                    data={this.state.list || []}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.refresh()}
                    keyExtractor={(item) => item.orderNo}
                    showsVerticalScrollIndicator={ false }
                    renderItem={({ item }) =>
                        <OrderItem showTell={this.props.showTell}
                            order={item}
                            type={this.props.type}
                            navigation={this.props.navigation}
                            hideMoney={this.props.hideMoney}
                            reCan={this.reCan}
                            delCan={this.delCan}
                            status={this.props.status}
                        />
                    }
                    onEndReached={() => this.next()}
                    ListEmptyComponent={
                        this.state.list &&
                        <Text allowFontScaling={false} style={orderStyles.emptyList}>{this.state.empty}</Text>
                    }
                />
                <Loading ref='loading' />
            </View>
        )
    }

    async componentDidMount() {
        this.refs.loading.open()
        await this.refresh()
    }

    async refresh() {
        this.hasNext = true
        this.nextPage = 1
        /*this.setState({
            refreshing: true
        })*/
        let list = await this.load()
        this.refs.loading.close()
        this.setState({
            list: list,
            empty: "暂无订单"
            //refreshing: false
        })
    }

    async next() {
        let list = await this.load()
        this.setState({
            list: this.state.list.concat(list)
        })
    }

    async load() {

        if (!this.hasNext || this.loading) {
            return []
        }
        this.loading = true
        try {
            let res = await get(`/saleOrderApp/findTouchHistorySaleOrderList.do?type=${this.props.type || 0}&status=${this.props.status}&pageIndex=${this.nextPage}&pageSize=${PAGE_SIZE}`)

            this.nextPage = this.nextPage + 1
            this.hasNext = (res || []).length == PAGE_SIZE
            return res || []
        } catch (e) {
            return []
        } finally {
            this.loading = false
        }
    }

    //取消订单重刷列表操作
    reCan = async (orderNo) => {
        // let {list} = this.state
        // list.map(item => {
        //     if (orderNo == item.orderNo){
        //         item.orderStatus = 99
        //         item.orderStatusNm = '已取消'
        //     }
        // })
        // this.setState({
        //     list: [].concat(list)
        // })
        await this.refresh()
    }

    delCan = (orderNo) => {
        let { list } = this.state
        let newList = list.filter(item => item.orderNo != orderNo)
        this.setState({
            list: newList
        })
    }
}

class RgOrderList extends React.Component {
    constructor(props) {
        super(props)
        this.hasNext = true
        this.nextPage = 1
        this.state = {
            refreshing: false,
            firstLoad: false,
            list: []
        }
    }

    render() {
        return (
            <View style={{ flex: 1, width: px(750) }}>
                <FlatList
                    // style={{ flex: 1, width: px(750) }}
                    data={this.state.list || []}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.refresh()}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={ false }
                    renderItem={({ item }) =>
                        <RgOrderItem load={() => this.refresh()}
                            isWeCatHistory={ true }
                            navigation={this.props.navigation}
                            order={item} />
                    }
                    onEndReached={() => this.next()}
                    ListEmptyComponent={
                        this.state.list && <Text allowFontScaling={false} style={orderStyles.emptyList}>暂无订单</Text>
                    }
                />
                <Loading ref='loading' />
            </View>
        )
    }

    async componentDidMount() {
        await this.refresh()
    }

    async load() {
        if (!this.hasNext || this.loading) {
            return []
        }
        this.loading = true
        try {
            let res = await get(`/return/touchHistoryReturnList.do?page=${this.nextPage}`)
            
            let list = res.dataList
            this.nextPage = this.nextPage + 1
            this.hasNext = (list || []).length == PAGE_SIZE
            return list || []
        } catch (e) {
            return []
        } finally {
            this.loading = false
        }
    }

    async next() {
        let list = await this.load()
        this.setState({
            list: this.state.list.concat(list)
        })
    }

    async refresh() {
        this.hasNext = true
        this.nextPage = 1
        /*this.setState({
            refreshing: true
        })*/
        this.refs.loading.open()
        let list = await this.load()
        this.refs.loading.close()
        this.setState({
            list: list,
            //refreshing: false
        })
    }
}


class DefaultTabBar extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        //590/3*page
        const left = px(196.67 * this.props.page + 68.5)
        return <View style={styles.tabs}>
            <View style={styles.tab}>
                {this.props.tabs.map((name, page) =>
                    <TouchableWithoutFeedback key={name} onPress={() => this.props.goToPage(page)}>
                        <View style={styles.tab}>
                            <Text allowFontScaling={false}
                                style={page == this.props.activeTab ? styles.itemTextActive : styles.itemText}>{name}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
            <Animated.View style={[styles.tabUnderlineStyle, left]} />
        </View>
    }
}

export default class extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            type: props.navigation.state.params.type,
            orderState: props.navigation.state.params.orderState,
            modalVisible: false,
            user: {},
            shopName: '',
            shopUserMobile: '',
            hideMoney: false
        }
    }

    showTell(shopName, shopUserMobile) {
        this.setState({
            modalVisible: true,
            shopName,
            shopUserMobile
        })
    }

    render() {

        const {
            type,
            hideMoney,
            orderState,
            modalVisible,
            shopName,
            shopUserMobile
        } = this.state

        const { navigation } = this.props

        const tabs = type == 1 ? ['全部', '待支付', '待发货', '待收货', '已收货']
            : ['全部', '待支付', '待发货', '待收货', '退货/售后']

        return (
            <View style={ styles.container }>
                <TopHeader navigation={ navigation }
                    title="微信历史订单"
                    rightBtn={<View style={base.inline}>
                        <TouchableOpacity activeOpacity={ 0.5 } onPress={ () => this.goSearch() }>
                            <Icon style={ [pageStyles.headerIcon, { marginRight: px(20) }] }
                                name="icon-search-order" />
                        </TouchableOpacity>
                        { type == 1 && <TouchableOpacity onPress={ () => {
                            this.setState({ hideMoney: !hideMoney })
                        } }>
                            { hideMoney ? <Icon name="icon-eye2" style={ pageStyles.headerIcon } /> :
                                <Icon name="icon-eye1" style={ pageStyles.headerIcon } />}
                        </TouchableOpacity>}
                    </View>}
                />


                <ScrollableTabView
                    locked
                    initialPage={ orderState }
                    tabBarBackgroundColor="#fff"
                    tabBarInactiveTextColor="#858385"
                    tabBarActiveTextColor="#252426"
                    tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(4) }}
                    renderTabBar={(props) => <T
                        paddingValue={ type == 1 ? 50 : 50 }
                        tabs={tabs}
                    />}
                >
                    {
                        tabs.map((item, index) =>
                            <View tabLabel={ item } key={ index } style={ { flex: 1 } }>
                                {
                                    type == 0 && index == 4 ?
                                        <RgOrderList navigation={ navigation } /> :
                                        <OrderList
                                            showTell={(a, b) => this.showTell(a, b)}
                                            type={ type }
                                            status={index == 0 ? '' : index == 1 ? 0 : index == 2 ? 2 : index == 3 ? 3 : index == 4 ? 4 : 9}
                                            hideMoney={ hideMoney }
                                            navigation={ navigation }
                                        />
                                }
                            </View>
                        )
                    }
                </ScrollableTabView>
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={ modalVisible }
                    onRequestClose={() => this.onRequestClose()}
                >
                    <View style={styles.modal}>
                        <View style={styles.closeWrap}>
                            <TouchableWithoutFeedback onPress={() => {
                                this.setState({ modalVisible: false })
                            }}>

                                <View style={{ width: px(60), height: px(80), marginRight: px(20) }}>
                                    <Icon name="icon-close" style={styles.modalClose} />
                                </View>

                            </TouchableWithoutFeedback>

                        </View>
                        <View style={styles.modalBox}>

                            { type != 1 &&
                                <View>
                                    <Text allowFontScaling={false} style={styles.modalLine}>若购买的商品出现问题，请联系店主进行售后服务：</Text>
                                    <Text allowFontScaling={false}
                                        style={styles.modalLine}>店铺名称：{ shopName }</Text>
                                    <Text allowFontScaling={false} style={styles.modalLine}>店主电话：<Text onPress={() => {
                                        util_tools.toCall(shopUserMobile)
                                    }} style={{ color: '#44b7ea' }}
                                    allowFontScaling={false}>{ shopUserMobile }</Text></Text>
                                    <Text> </Text>
                                    <Text allowFontScaling={false} style={styles.modalLine}>如您无法联系店主，请联系达令家客服：</Text>
                                </View>
                            }
                            {
                                type == 1 &&
                                <Text allowFontScaling={false}
                                    style={styles.modalLine}>若购买的商品出现问题，请联系我们的客服进行售后服务：</Text>
                            }
                            <Text allowFontScaling={false} style={styles.modalLine}>电话：<Text onPress={() => {
                                util_tools.toCall('400-005-5566')
                            }} style={{ color: '#44b7ea' }} allowFontScaling={false}>400-005-5566</Text></Text>
                            <Text allowFontScaling={false} style={styles.modalLine}>微信公众号：达令家(搜索dalingfamily)</Text>
                            <Text allowFontScaling={false} style={styles.modalLine}>客服时间：周一至周日 9:00-21:00</Text>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }

    goSearch() {
        this.props.navigation.navigate('SearchOrderPage', { type: this.state.type, isWeCatHistory: true })
    }

    /**
     * 关闭 Modal (Android必须实现)
     */
    onRequestClose() {
        this.setState({ modalVisible: false })
    }

}

const pageStyles = StyleSheet.create({
    pager: {
        flex: 1,
        backgroundColor: '#f5f3f6'
    },
    headerIcon: {
        width: px(40), height: px(40),
        marginRight: px(20),
        marginTop: px(5)
    },
    indicator: {
        position: 'absolute',
        top: 0,
        backgroundColor: '#fff',
        width: px(750),
        height: px(80),
        paddingLeft: px(80),
        paddingRight: px(80),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        justifyContent: 'space-between',
    },
    indicatorItem: {
        flex: -1
    },
    indicatorSelectedItem: {
        flex: -1
    },
    indicatorItemTxt: {
        fontSize: px(28)
    },
    indicatorSelectedTxt: {
        fontSize: px(28),
        color: '#e86d78'
    },
    indicatorSelectedBorder: {
        backgroundColor: '#e86d78'
    }
})

const orderStyles = StyleSheet.create({
    order: {
        backgroundColor: '#fff',
        marginTop: px(20)
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
    },
    orderEarn: {
        marginLeft: px(25),
        fontSize: px(24),
        color: '#eb83b2',
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        height: px(80),
        paddingLeft: px(30),
        paddingRight: px(30),
    },
    orderPay: {
        fontSize: px(26),
        color: '#222'
    },
    emptyList: {
        flex: 1,
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    },
    Btn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: px(48),
        borderWidth: px(1),
        marginLeft: px(14),
        width: px(128),
        borderRadius: px(6),
        overflow: 'hidden'
    },
    cBtn: {
        fontSize: px(24),
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    cBtn1: {
        color: '#252426',
    },
    cancelBtn: {
        borderColor: '#b2b3b5'
    },
    cBtn2: {
        color: '#fff'
    },
    payBtn: {
        backgroundColor: '#d0648f',
        borderColor: '#d0648f'
    },

    tagView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: px(30),
    },

    epTagView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(28),
        height: px(28),
        borderRadius: 2,
    },

    tagTxt: {
        fontSize: px(22),
        color: '#ffffff',
        textAlign: 'center',
        paddingBottom: px(2)
    },

    tagMsg: {
        fontSize: px(26),
        color: '#222',
        marginLeft: 3
    },


})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f5f7'
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
        /*position: 'absolute',
        top: px(-50),
        right: px(-10),*/
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
