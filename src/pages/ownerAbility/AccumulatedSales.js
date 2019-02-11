import React, { Component } from 'react'

import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'

import { getBottomSpace } from 'react-native-style-adaptive'
import { px } from "../../utils/Ratio"
import { TopHeader } from '../common/Header'
import ShareView, { SHARETYPE } from '../common/ShareView'
import { DialogModal } from '../common/ModalView'
import { TrackClick } from '../../services/Track'

import TopContainer from './common/TopContainer'
import Histogram from './common/Histogram'
import OrderItem from './common/OrderItem'
import RankingTitle from './common/RankingTitle'

import { digitalUnit } from '../../utils/digitalProcessing'
import { dataFormat, milliseconds } from '../../utils/dataFormat'
import { get, post, touchBaseUrl, baseUrl } from '../../services/Request'
import utils_tools from '../../utils/tools'

const conversion = digitalUnit(10000, ['', '万', '亿', '万亿', '兆'])

export default class extends Component {
    constructor(props) {
        super(props)

        const dimension = props.navigation.getParam('dimension', 0)
        const initTab = dimension === 0 || dimension === 1 ? 0 : 1

        this.state = {
            refreshing: false,
            isSales: true,
            initTab,
            amount: '',
            btnAmounts: {
                leftAmount: '',
                rightAmount: ''
            },
            list: [],
            histogram: {
                xAxisData: [],
                seriesData: []
            },
            isRanking: true,
            goods: {
                benefitMoney: 0
            },
            dimension
        }
    }

    render() {
        const len = this.state.list.length

        return (
            <View style={styles.container}>
                <TopHeader navigation={this.props.navigation}
                    title="累计销售额"
                />
                <FlatList
                    style={styles.flatList}
                    showsVerticalScrollIndicator={false}
                    refreshing={this.state.refreshing}
                    numColumns={1}
                    onRefresh={() => () => { }}
                    onEndReached={() => () => { }}
                    onEndReachedThreshold={0.1}
                    renderItem={({ item, index }) => {
                        return <OrderItem
                            item={item}
                            index={index}
                            isRanking={this.state.isRanking}
                            isBorder={index < len - 1}
                            onPress={value => this.navigateDetail(value)}
                            goShare={value => this.goShare(value)}
                        />
                    }}
                    ListFooterComponent={() => {
                        return len ? <View style={[styles.footer, this.state.list.length < 4 && { paddingTop: px(30) }]}>
                            <TouchableOpacity
                                style={styles.button}
                                activeOpacity={0.8}
                                onPress={() => this.navigateRanking()}
                            >
                                <Text style={styles.buttonText}>查看更多</Text>
                            </TouchableOpacity>
                        </View> : null
                    }}
                    ListHeaderComponent={() => {
                        return <View>
                            <TopContainer
                                amount={ this.state.amount }
                                initTab={ this.state.initTab }
                                onDimension={ index => this.changeDimension(index) }
                                btnAmounts={ this.state.btnAmounts }
                                onPlate={ value => this.navigateOrderList(value) }
                                bounced={ this.bounced.bind(this) }
                                type={ 2 }
                                dimension={ this.state.dimension }
                                totalNumberClick={ this.goOrderListPage.bind(this) }
                            />
                            <Histogram
                                {...this.state.histogram}
                                type={ this.state.initTab }
                                precision={() => this._calculationPrecision()}
                                histogramClick={value => this.singlePress(value)}
                                dimension={ this.state.dimension }
                                typeText="销售额"
                            />
                            <RankingTitle isSales={!this.state.isRanking} />
                        </View>
                    }}
                    keyExtractor={goods => goods.goodsId}
                    data={this.state.list}
                    initialNumToRender={2}
                    ListEmptyComponent={() => {
                        return null
                    }}
                />
                <ShareView
                    ref='shareView'
                    navigation={this.props.navigation}
                    getQrCode={() => this.getQrCode()}
                    types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}
                >
                    <View style={styles.modalHead}>
                        <Text style={styles.modalTxt1}>分享赚￥{Number(this.state.goods.benefitMoney).toFixed(2)}</Text>
                        <Text style={styles.modalTxt2}>只要你的好友通过你的分享购买商品，你就能赚到至少{Number(this.state.goods.benefitMoney).toFixed(2)}元利润收入哦～</Text>
                    </View>
                </ShareView>
                <DialogModal ref="dialog" />
            </View>
        )
    }

    goOrderListPage() {
        this.props.navigation.navigate('OrderListPage', {
            type: 1
        })
    }

    componentDidMount() {
        this.load()
    }

    bounced() {
        this.refs.dialog.open({
            title: '累计销售额目前包括两部分',
            content: [
                '',
                '  一部分是你分享商品给好友，好友购买下单后，当订单已支付后，该笔订单的销售额将计入累计销售额。',
                '',
                '  另一部分是你推荐好友成为店主，好友购买精选商品并支付成功后，该笔订单的销售额将计入累计销售额。'
            ],
            btns: [
                { txt: "我知道了" }
            ]
        })
    }

    navigateOrderList(value) {
        this.props.navigation.navigate('SearchOrderPage', {
            type: 1,
            ...value,
            immediately: true
        })
    }

    singlePress(e) {
        const value = e.name || e.value
        let startDate = ''
        let endDate = ''
        let now = Date.now()

        if (this.state.initTab === 0) {
            startDate = value
            endDate = value
        } else {
            startDate = value + '-01'

            let date = new Date(milliseconds(startDate))

            date.setMonth(date.getMonth() + 1)
            date.setDate(date.getDate() - 1)

            const endTime = date.getTime()

            endDate = endTime - now > 0 ? dataFormat(now) : dataFormat(date)
        }

        this.props.navigation.navigate('SearchOrderPage', {
            type: 1,
            startDate,
            endDate,
            immediately: true
        })
    }

    navigateRanking() {
        this.props.navigation.navigate('PopularGoods', {
            tab: this.state.isRanking ? 0 : 1
        })
    }

    navigateDetail(goods) {
        this.props.navigation.navigate('DetailPage', {
            id: goods.sku ? '' : goods.id,
            sku: goods.sku
        })
    }

    goShare(goods) {
        if (goods.is_deep_stock === '1' || !goods.limitStock || goods.flag === '1') return false
        
        this.setState({ goods })
        this.refs.shareView.Share({
            title: goods.shareTitle,
            desc: '销量较高产品',
            img: goods.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            link: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            shareType: 'goods',
            extra: goods.goodsShowName
        })
    }

    async getQrCode() {
        const result = await get(`/goods/touch/createQrcode.do?id=${this.state.goods.id}&salePrice=${this.state.goods.salePrice}`)

        if (typeof result === 'string') {
            return {
                share_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${result}`,
                down_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${result}`
            }
        } else {
            return {
                height: result.showHeight,
                width: result.showWidth,
                share_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${result.showKey}`,
                down_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${result.downloadKey}`
            }
        }
    }

    _calculationPrecision() {
        const max = Math.max.apply(this, this.state.histogram.seriesData)
        const min = Math.min.apply(this, this.state.histogram.seriesData)

        const precision = max - min

        return precision || 7000
    }

    _histogramProcessing(oldHistogram) {
        const xAxisData = oldHistogram.map(item => item.dateTime)
        const seriesData = oldHistogram.map(item => item.sumAmount)

        return {
            xAxisData,
            seriesData
        }
    }

    async getGoodsList() {
        let list = []

        const shopPopularGoods = await get(`/benefit/shopPopularGoods.do?topN=10&page=1`)

        if (!shopPopularGoods.items.length) {
            const popularGoods = await get(`/benefit/popularGoods.do?topN=10&page=1`)

            return {
                isRanking: false,
                list: popularGoods.items
            }
        }

        return {
            isRanking: true,
            list: shopPopularGoods.items
        }
    }

    async changeDimension(index) {
        const timeDimension = index == 0 ? this.state.dimension === 1 ? '0' : '3' : '1'
        const { leftSales, rightSales } = await get(`/saleOrder/sumOrderSalesTimeDimension.do?timeDimension=${timeDimension}`)
        const oldHistogram = await get(`/saleOrder/sumOrderSalesHistogramTimeDimension.do?timeDimension=${index == 0 ? '3' : '1'}`)
        const goods = await this.getGoodsList()

        const histogram = this._histogramProcessing(oldHistogram)

        this.setState({
            initTab: index,
            btnAmounts: { ...this.state.btnAmounts, leftAmount: leftSales, rightAmount: rightSales },
            histogram,
            ...goods
        })
    }

    async load() {
        const timeDimension = this.state.initTab == 0 ? this.state.dimension === 1 ? '0' : '3' : '1'

        const result = await get('/saleOrder/sumOrderSales.do')
        const { leftSales, rightSales } = await get(`/saleOrder/sumOrderSalesTimeDimension.do?timeDimension=${timeDimension}`)
        const oldHistogram = await get(`/saleOrder/sumOrderSalesHistogramTimeDimension.do?timeDimension=${this.state.initTab == 0 ? '3' : '1'}`)
        const goods = await this.getGoodsList()

        const histogram = this._histogramProcessing(oldHistogram)

        this.setState({
            amount: result.amount,
            btnAmounts: { ...this.state.btnAmounts, leftAmount: leftSales, rightAmount: rightSales },
            histogram,
            ...goods
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        paddingBottom: getBottomSpace()
    },
    flatList: {
        flex: 1,
        backgroundColor: '#F2F2F2'
    },
    footer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingBottom: px(30)
    },
    button: {
        width: px(260),
        height: px(70),
        borderRadius: px(35),
        backgroundColor: '#D0648F',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: px(32),
        color: '#fff'
    },
    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
        height: px(169),
        paddingLeft: px(145),
        paddingRight: px(145),
        paddingTop: px(53)
    },
    modalTxt1: {
        fontSize: px(42),
        color: '#d0648f',
        fontWeight: '900'
    },
    modalTxt2: {
        fontSize: px(26),
        color: '#858385',
        textAlign: 'center',
        marginTop: px(10),
        lineHeight: px(30)
    }
})
