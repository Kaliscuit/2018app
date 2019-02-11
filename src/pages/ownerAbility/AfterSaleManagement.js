import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity
} from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view2'

import { getBottomSpace } from 'react-native-style-adaptive'
import { AfterSalesT } from '../common/TabsTest'
import { TopHeader } from '../common/Header'
import Loading from '../../animation/Loading'
import Icon from '../../UI/lib/Icon'

import { px } from '../../utils/Ratio'
import { get } from '../../services/Request'
import base from '../../styles/Base'

import { log } from '../../utils/logs'
import { Load, NoData } from './common/FooterPrompt'

import CustomerItem from './common/CustomerItem'

//列表组件
class CustomerList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            list: [],
            isSubsequent: false,
            isNoDate: false
        }

        this.pageIndex = 0
        this.page = 1
        this.totalPages = 2
        this.loading = false
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={ this.state.list }
                    showsVerticalScrollIndicator={ false }
                    refreshing={ this.state.refreshing }
                    onEndReachedThreshold={ 0.1 }
                    onRefresh={ () => this.refresh() }
                    keyExtractor={ (item) => item.srNo }
                    initialNumToRender={ 2 }
                    renderItem={({ item }) =>
                        <CustomerItem
                            customer={ item }
                            navigation={ this.props.navigation }
                            reCan={ this.refresh.bind(this)}
                        />
                    }
                    onEndReached={() => this.next()}
                    ListEmptyComponent={
                        !this.state.list.length && <Text allowFontScaling={ false } style={ styles.emptyList }>暂无数据</Text>
                    }
                    ListFooterComponent={ () => {
                        return <View>
                            <Load ref={ ref => this.loadRef = ref }/>
                            {this.state.isNoDate && !!this.state.list.length && <NoData text="没有更多订单惹" />}
                        </View>
                    } }
                />
            </View>
        )
    }

    componentDidMount () {
        this.refresh()
    }

    async refresh () {
        this.page = 1
        this.totalPages = 2

        const list = await this.load()

        this.setState({ list })
    }

    async getList () {
        return await get(`/return/shopReturnProcessedV1.do?type=${ this.props.index + 3 }&searchValue=&page=${ this.page }`)
    }

    async load () {
        this.loading = true

        try {
            const result = await this.getList()

            this.totalPages = result.totalPages
            this.page >= this.totalPages && this.setState({ isSubsequent: true })

            return result.list || []
        } catch (e) {
            return []
        } finally {
            this.loading = false
            this.page ++
        }
    }

    async next () {
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

export default class extends React.Component {

    render() {
        const { navigation } = this.props
        const tabs = ['全部', '待店主确认', '待平台审核', '已退款']

        return (
            <View style={ styles.container }>
                <TopHeader navigation={ navigation }
                    title="售后管理"
                    rightBtn={<View style={base.inline}>
                        <TouchableOpacity activeOpacity={ 0.5 } onPress={ () => this.goSearch() }>
                            <Icon style={ [styles.headerIcon, { marginRight: px(20) }] } name="icon-search-order" />
                        </TouchableOpacity>
                    </View>}
                />
                <ScrollableTabView
                    locked
                    initialPage={ 0 }
                    tabBarBackgroundColor="#fff"
                    tabBarInactiveTextColor="#858385"
                    tabBarActiveTextColor="#252426"
                    tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(4) }}
                    renderTabBar={(props) => <AfterSalesT
                        paddingValue={ 62 }
                        { ...props }
                        tabs={ tabs }
                    />}
                >
                    {
                        tabs.map((item, index) =>
                            <View tabLabel={ item } key={ index } style={ { flex: 1 } }>
                                <CustomerList
                                    index={ index }
                                    key={ index }
                                    navigation={ this.props.navigation }
                                />
                            </View>
                        )
                    }
                </ScrollableTabView>
            </View>
        )
    }

    goSearch () {
        this.props.navigation.navigate('SearchAfterSale')
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f5f7',
        position: 'relative',
        paddingBottom: getBottomSpace()
    },
    headerIcon: {
        width: px(40), height: px(40),
        marginRight: px(20),
        marginTop: px(5)
    },
    emptyList: {
        flex: 1,
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    }
})
