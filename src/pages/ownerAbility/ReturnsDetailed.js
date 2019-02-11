import React, { Component } from 'react'

import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'

import { getBottomSpace } from 'react-native-style-adaptive'
import ScrollableTabView from 'react-native-scrollable-tab-view2'
import { px } from "../../utils/Ratio"
import { get } from '../../services/Request'

import { TopHeader } from '../common/Header'
import { Tab2 } from '../common/TabsTest'
import EmptyData from '../common/EmptyData'

import { Detail } from './common/Earnings'
import { Load, NoData } from './common/FooterPrompt'

import Icon from '../../UI/lib/Icon'
import SwitchMotel, { DateSelect, Radio, Checkbox } from '../common/RightMotel'
import { dataFormat } from '../../utils/dataFormat'

class TabContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            refreshing: false,
            isNoDate: false,
            fHeight: 0
        }

        this.page = 0
        this.totalPages = 2
        this.loading = false
        this.data = {}
    }

    render() {
        const { list, refreshing, isNoDate } = this.state
        const { isRanking, navigation } = this.props

        return (
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
                    return <Detail
                        item={item}
                        index={index}
                        isRanking={isRanking}
                        isBorder={index < list.length - 1}
                        onPress={this.goOrderDetails.bind(this)}
                    />
                }}
                ListFooterComponent={() => {
                    return <View>
                        <Load ref={ref => this.loadRef = ref} />
                        {isNoDate && !!list.length && <NoData />}
                    </View>
                }}
                ListHeaderComponent={() => isNoDate && list.length ? <View style={styles.topMargin} /> : null}
                keyExtractor={items => items.benefitId.toString()}
                data={list}
                initialNumToRender={2}
                ListEmptyComponent={() => {
                    return isNoDate && <EmptyData
                        style={{ height: this.state.fHeight }}
                        name="no-settlement"
                        prompt="店铺没有已结算收益，亲要加油咯！"
                        btnText="开工吧~"
                        onPress={() => navigation.navigate('ShopPage')}
                    />
                }}
            />
        )
    }

    componentDidMount() {
        this.refresh()
    }

    goOrderDetails(order) {
        this.props.navigation.navigate('OrderDetailPage', {
            orderNo: order.benefitNo,
            type: 1,
            callback: async () => {
                this.refresh()
            }
        })
    }

    async refresh() {
        this.page = 1
        this.totalPages = 2
        this.setState({ isSubsequent: false, list: [], isNoDate: false })

        const list = await this.getList()

        this.setState({
            list,
            isNoDate: !list.length
        })
    }

    async getList() {
        this.loading = true

        const { startDate, endDate, benefitTypes, type } = this.props

        const benefits = benefitTypes.map(item => `&benefitTypes=${item.value}`).join('')

        try {
            const result = await get(`/benefit/list.do?page=${this.page}&type=${type}&startDateStr=${startDate}&endDateStr=${endDate}${benefits}`)

            this.totalPages = result.totalPages

            return result.items

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

        const list = await this.getList()

        this.setState({
            list: [...this.state.list, ...list],
            isNoDate: !list.length
        })

        this.loadRef.close()
    }
}


export default class extends Component {
    constructor(props) {
        super(props)

        this.startDate = props.navigation.getParam('startDate', '')
        this.endDate = props.navigation.getParam('endDate', '')
        this.type = props.navigation.getParam('type', 0)
        this.isInit = props.navigation.getParam('isInit', false)

        this.state = {
            refreshing: false,
            ...this.initSelectOptions()
        }

        this.page = 0
        this.totalPages = 2
        this.loading = false
        this.selected = this.selected.bind(this)
        this.index = this.type
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
                value: 1,
                selected: false,
                text: '商品销售收益'
            },
            {
                value: 2,
                selected: false,
                text: '精选销售收益'
            },
            {
                value: 4,
                selected: false,
                text: '退款扣除'
            }
        ]

        let startDate = this.startDate
        let endDate = this.endDate

        if (this.isInit) {
            const selfData = timeList.filter(item => item.selected)[0]

            let now = new Date()

            startDate = dataFormat(now.getTime() - selfData.value)
            endDate = dataFormat(new Date())
        }

        if (isReset) {
            startDate = ''
            endDate = ''
        }

        const defaultOptions = {
            timeOptions: {
                title: '选择日期',
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
                title: '选择收益类型',
                list: typeList
            }
        }

        const benefitTypes = typeList.filter(item => item.selected)

        return {
            selected: defaultOptions,
            startDate,
            endDate,
            dateChecked: timeList.filter(item => item.selected),
            benefitTypes,
            isSelected: benefitTypes.length || endDate || startDate
        }
    }

    selected() {
        this.motel.open()
    }

    render() {
        const tabs = ['已结算', '待结算']

        return (
            <View style={styles.container}>
                <View style={styles.main}>
                    <TopHeader navigation={this.props.navigation}
                        boxStyles={{ borderBottomColor: '#eee' }}
                        title={"收益明细"}
                        rightBtn={<TouchableOpacity
                            style={styles.rightBtn}
                            activeOpacity={0.8}
                            onPress={this.selected.bind(this)}
                        >
                            <Icon name={this.state.isSelected ? 'selected' : 'disable-selected'} style={styles.selected} />
                        </TouchableOpacity>}
                    />
                    <ScrollableTabView
                        locked
                        initialPage={this.type}
                        tabBarBackgroundColor="#FBFAFC"
                        tabBarInactiveTextColor="#666"
                        tabBarActiveTextColor="#D0648F"
                        onChangeTab={(t) => this.onChangeT(t)}
                        tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(3) }}
                        renderTabBar={(props) => <Tab2
                            tabs={tabs}
                        />}
                    >
                        {
                            tabs.map((item, index) =>
                                <View tabLabel={item} key={index} style={{ flex: 1 }}>
                                    <TabContainer
                                        key={index}
                                        ref={ref => this.tabContainer = ref}
                                        isRanking={index === 0}
                                        startDate={this.state.startDate}
                                        endDate={this.state.endDate}
                                        benefitTypes={this.state.benefitTypes}
                                        type={index + 1}
                                        navigation={this.props.navigation}
                                    />
                                </View>
                            )
                        }
                    </ScrollableTabView>
                </View>
                <SwitchMotel
                    ref={ref => this.motel = ref}
                    reset={this.resetMotel.bind(this)}
                    determine={this.determineMotel.bind(this)}
                >
                    <DateSelect
                        {...this.state.selected.timeOptions}
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        checked={ this.state.dateChecked }
                        ref={ref => this.dateRef = ref}
                    >
                    </DateSelect>
                    <Checkbox
                        {...this.state.selected.typeOptions}
                        checked={ this.state.benefitTypes }
                        ref={ref => this.checkboxRef = ref}
                    />
                </SwitchMotel>
            </View>
        )
    }

    onChangeT({ i }) {
        if (this.index === i) return

        this.index = i
        this.tabContainer.refresh()
    }

    resetMotel() {
        this.setState({
            ...this.initSelectOptions(true)
        }, () => {
            this.tabContainer.refresh()
        })
    }

    determineMotel() {
        const benefitTypes = this.checkboxRef.getSelected()
        const date = this.dateRef.getDate()

        const isSelected = benefitTypes.length || date.startDate || date.endDate

        this.setState({
            benefitTypes,
            ...date,
            isSelected
        }, () => {
            this.tabContainer.refresh()
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: getBottomSpace()
    },
    main: {
        flex: 1,
        backgroundColor: '#FBFAFC',
        position: 'relative'
    },
    topMargin: {
        backgroundColor: '#fff',
        height: px(10)
    },
    selected: {
        width: px(38),
        height: px(38),
        marginHorizontal: px(26),
    }
})

