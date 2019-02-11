import React, { Component } from 'react'

import {
    View,
    Text,
    FlatList,
    StyleSheet,
} from 'react-native'

import { getBottomSpace } from 'react-native-style-adaptive'
import ScrollableTabView from 'react-native-scrollable-tab-view2'
import { px } from "../../utils/Ratio"

import { get, baseUrl, touchBaseUrl } from '../../services/Request'

import ShareView, { SHARETYPE } from '../common/ShareView'
import { TopHeader } from '../common/Header'
import { Tab2 } from '../common/TabsTest'
import EmptyData from '../common/EmptyData'

import OrderItem from './common/OrderItem'
import { Load, NoData } from './common/FooterPrompt'

const PAGE_SIZE = 100

class HotStyle extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            type: props.index,
            refreshing: false,
            isSubsequent: false,
            isNoDate: false,
            fHeight: 0,
            goods: {}
        }

        this.page = 1
        this.totalPages = 2
        this.loading = false

    }

    render() {
        const { list, refreshing, isSubsequent, isNoDate } = this.state
        const { isRanking, navigation } = this.props

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    style={{ flex: 1, backgroundColor: '#F2F2F2' }}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => this.refresh()}
                    onEndReached={() => this.next()}
                    onEndReachedThreshold={0.1}
                    onLayout={e => {
                        let height = e.nativeEvent.layout.height

                        if (this.state.fHeight < height) {
                            this.setState({ fHeight: height })
                        }
                    }}
                    renderItem={({ item, index }) => {
                        return <OrderItem
                            item={item}
                            index={index}
                            isRanking={isRanking}
                            isBorder={index < this.state.list.length - 1}
                            onPress={value => this.navigateDetail(value)}
                            goShare={value => this.goShare(value)}
                        />
                    }}
                    ListFooterComponent={() => {
                        return <View>
                            <Load ref={ref => this.loadRef = ref} />
                            {isNoDate && !!list.length && <NoData />}
                        </View>
                    }}
                    ListHeaderComponent={() => isNoDate ? <View style={styles.topMargin} /> : null}
                    keyExtractor={goods => goods.goodsId}
                    data={list}
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
            </View>
        )
    }

    componentDidMount() {
        this.refresh()
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

    async refresh() {
        this.page = 1
        this.totalPages = 2
        const list = await this.load()

        this.setState({ list })
    }

    async getList() {
        if (!this.state.type) {
            return await get(`/benefit/shopPopularGoods.do?topN=${PAGE_SIZE}&page=${this.page}`)
        }

        return await get(`/benefit/popularGoods.do?topN=${PAGE_SIZE}&page=${this.page}`)
    }

    async load() {

        this.loading = true

        try {
            const result = await this.getList()

            this.totalPages = result.totalPages

            this.page >= this.totalPages && this.setState({ isSubsequent: true })

            return result.items || []
        } catch (e) {
            return []
        } finally {
            this.loading = false
            this.page++
        }
    }

    async next() {
        if (this.loading) return
        if (this.page > this.totalPages) return this.setState({ isNoDate: true })

        this.loadRef.open()

        const list = await this.load()

        this.setState({
            list: [...this.state.list, ...list]
        })

        this.loadRef.close()
    }
}


export default class extends Component {
    constructor(props) {
        super(props)

        this.tab = props.navigation.getParam('tab', false)
        this.index = this.tab
    }

    render() {
        const tabs = ['本店爆款', '全网爆款']

        return (
            <View style={styles.container}>
                <TopHeader
                    navigation={this.props.navigation}
                    boxStyles={{ borderBottomColor: '#eee' }}
                    title={!this.tab ? '近30日人气商品' : '全网爆款'}
                />
                {
                    !this.tab ?
                        <ScrollableTabView
                            locked
                            initialPage={this.index}
                            tabBarBackgroundColor="#FBFAFC"
                            tabBarInactiveTextColor="#666"
                            tabBarActiveTextColor="#D0648F"
                            tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(3) }}
                            onChangeTab={({ i }) => this.index = i}
                            renderTabBar={(props) => <Tab2
                                tabs={tabs}
                            />}
                        >
                            {
                                tabs.map((item, index) =>
                                    <View tabLabel={item} key={index} style={{ flex: 1 }}>
                                        <HotStyle
                                            isRanking={index === 0}
                                            key={index}
                                            index={index}
                                            navigation={this.props.navigation}
                                        />
                                    </View>
                                )
                            }
                        </ScrollableTabView> :
                        <HotStyle
                            isRanking={false}
                            index={this.tab}
                            navigation={this.props.navigation}
                        />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFAFC',
        marginBottom: getBottomSpace()
    },
    topMargin: {
        backgroundColor: '#fff',
        height: px(10)
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

