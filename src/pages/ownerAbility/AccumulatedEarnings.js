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
import { DialogModal } from '../common/ModalView'

import TopContainer from './common/TopContainer'
import Histogram from './common/Histogram'
import Earnings from './common/Earnings'

import { digitalUnit } from '../../utils/digitalProcessing'
import { dataFormat, milliseconds } from '../../utils/dataFormat'
import { get, post } from '../../services/Request'

const conversion = digitalUnit(10000, ['', '万', '亿', '万亿', '兆'])

export default class extends Component {
    constructor (props) {
        super(props)

        const dimension = props.navigation.getParam('dimension', 0)
        const initTab = dimension === 0 || dimension === 1 ? 0 : 1 

        this.state = {
            refreshing: false,
            initTab,
            amount: '',
            btnAmounts: {
                leftAmount: '',
                rightAmount: ''
            },
            benefit: [],
            histogram: {
                xAxisData: [],
                seriesData: []
            },
            dimension
        }
    }

    render () {
        const len = this.state.benefit.length

        return (
            <View style={ styles.container }>
                <TopHeader navigation={this.props.navigation}
                    title="累计收益"
                />
                <FlatList
                    style={ styles.flatList }
                    showsVerticalScrollIndicator={ false }
                    refreshing={ this.state.refreshing }
                    onRefresh={ () => this.load() }
                    onEndReachedThreshold={ 0.1 }
                    renderItem={({ item, index }) => {
                        return <Earnings
                            item={ item }
                            index={ index }
                            onPress={ value => this.singlePress({ name: value.dateTime }) }
                        />
                    }}
                    ListFooterComponent={ () => {
                        return len ? <View style={ styles.footer }>
                            <TouchableOpacity
                                style={ styles.button }
                                activeOpacity={ 0.8 }
                                onPress={() => this.navigateDetail() }
                            >
                                <Text style={ styles.buttonText }>查看更多</Text>
                            </TouchableOpacity>
                        </View> : null
                    } }
                    ListHeaderComponent={ () => {
                        return <View>
                            <TopContainer
                                amount={ this.state.amount }
                                initTab={ this.state.initTab }
                                onDimension={ index => this.changeDimension(index) }
                                btnAmounts={ this.state.btnAmounts }
                                onPlate={ value => this.navigateDetail(value) }
                                bounced={ this.bounced.bind(this) }
                                type={ 1 }
                                dimension={ this.state.dimension }
                                totalNumberClick={ this.goIncome.bind(this) }
                            />
                            <Histogram
                                { ...this.state.histogram }
                                type={ this.state.initTab }
                                precision={() => this._calculationPrecision()}
                                histogramClick={value => this.singlePress(value)}
                                dimension={ this.state.dimension }
                                typeText="收益"
                            />
                        </View>
                    } }
                    keyExtractor={ (benefit, index) => benefit.dateTime + index }
                    data={ this.state.benefit }
                    ListEmptyComponent={ () => {
                        return null
                    } }
                />
                <DialogModal ref="dialog" />
            </View>
        )
    }

    goIncome() {
        this.props.navigation.navigate('IncomeManagePage', {})
    }

    componentDidMount () {
        this.load()
    }

    bounced () {
        this.refs.dialog.open({
            title: '累计收益目前包括两部分',
            content: [
                '',
                '  一部分是你分享商品给好友，好友购买下单后，当订单状态变为“已完成”时（买家确认收货7天后），该笔订单的利润将计入累计收益。',
                '',
                '  另一部分是你推荐好友成为店主，好友购买精选商品的订单状态变为“已完成”时（确认收货7天后），获得的奖励将计入累计收益。累计收益可提现。'
            ],
            btns: [
                { txt: "我知道了" }
            ]
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
        
        this.navigateDetail({
            startDate,
            endDate
        })
    }

    navigateDetail (data = {}) {
        const type = this.state.initTab === 1 ? 0 : 1

        this.props.navigation.navigate('ReturnsDetailed', {
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            type,
            isInit: !!data.isInit
        })
    }

    _calculationPrecision () {
        const max = Math.max.apply(this, this.state.histogram.seriesData)
        const min = Math.min.apply(this, this.state.histogram.seriesData)

        const precision = max - min

        return precision || 7000
    }

    _benefitProcessing (oldBenefit) {
        return oldBenefit.benefit.map((benefit, index) => {
            benefit['refundAmount'] = oldBenefit.refund[index].sumAmount
            
            return benefit
        })
    }

    _histogramProcessing (oldHistogram) {
        const xAxisData = oldHistogram.map(item => item.dateTime)
        const seriesData = oldHistogram.map(item => item.sumAmount)

        return {
            xAxisData,
            seriesData
        }
    }

    async changeDimension (index) {
        const timeDimension = index == 0 ? this.state.dimension === 1 ? '0' : '3' : '1'
        const btnAmounts = await get(`/benefit/sumBenefitTimeDimension.do?timeDimension=${ timeDimension }`)
        const oldHistogram = await get(`/benefit/sumBenefitHistogramTimeDimension.do?timeDimension=${index == 0 ? '3' : '1' }`)
        const oldBenefit = await get(`/benefit/sumBenefitRefundTimeDimension.do?timeDimension=${index == 0 ? '3' : '1' }`)

        const histogram = this._histogramProcessing(oldHistogram)
        const benefit = this._benefitProcessing(oldBenefit)

        this.setState({
            initTab: index,
            btnAmounts,
            histogram,
            benefit
        })
    }

    async load () {
        const timeDimension = this.state.initTab == 0 ? this.state.dimension === 1 ? '0' : '3' : '1'

        const result = await get('/benefit/sumBenefit.do')
        const btnAmounts = await get(`/benefit/sumBenefitTimeDimension.do?timeDimension=${ timeDimension }`)
        const oldHistogram = await get(`/benefit/sumBenefitHistogramTimeDimension.do?timeDimension=${this.state.initTab == 0 ? '3' : '1' }`)
        const oldBenefit = await get(`/benefit/sumBenefitRefundTimeDimension.do?timeDimension=${this.state.initTab == 0 ? '3' : '1' }`)

        const histogram = this._histogramProcessing(oldHistogram)
        const benefit = this._benefitProcessing(oldBenefit)

        this.setState({
            amount: result.amount,
            btnAmounts,
            histogram,
            benefit
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
        paddingTop: px(7),
        paddingBottom: px(46)
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
    }
})
