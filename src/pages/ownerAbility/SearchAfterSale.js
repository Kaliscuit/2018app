import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList
} from 'react-native'

import Page from '../../UI/Page'
import { px } from '../../utils/Ratio'
import { log } from '../../utils/logs'
import { SearchBar } from '../common/Header'
import { get } from '../../services/Request'
import { getItem } from '../../services/Storage'
import Loading from '../../animation/Loading'
import Icon from '../../UI/lib/Icon'

import EmptyData from '../common/EmptyData'
import CustomerItem from './common/CustomerItem'
import { Load } from './common/FooterPrompt'

export default class extends Page {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            refreshing: false,
            isData: true,
            fHeight: 0
        }

        this.pageIndex = 0
        this.page = 1
        this.totalPages = 2
        this.loading = false
    }

    pageHeader() {
        return <SearchBar placeholder="退货单号/收件人/商品名称"
            goSearch={ (t) => this.searchOrder(t) }
            type={ 0 }
            navigation={ this.props.navigation }
        />
    }

    pageBody() {
        return <View style={{ flex: 1 }}>
            <FlatList
                data={ this.state.list }
                refreshing={ this.state.refreshing }
                keyExtractor={ item => item.srNo }
                onEndReached={ () => this.next() }
                initialNumToRender={ 2 }
                onLayout={ e => {
                    let height = e.nativeEvent.layout.height

                    if (this.state.fHeight < height) {
                        this.setState({fHeight: height})
                    }
                } }
                renderItem={({ item }) =>
                    <CustomerItem
                        customer={ item }
                        navigation={ this.props.navigation }
                        reCan={ this.reCan2.bind(this) }
                    />
                }
                ListFooterComponent={ () => {
                    return <View>
                        <Load ref={ ref => this.loadRef = ref }/>
                    </View>
                } }
                ListEmptyComponent={
                    !this.state.isData && <EmptyData
                        style={ { height: this.state.fHeight } }
                        name="no-return"
                        prompt="没有找到相关退货"
                    />
                }
            />
        </View>
    }

    pageFooter() {
        return <Loading ref="loading" />
    }

    async searchOrder(t) {
        this.pageIndex = 1
        this.searchTxt = t
        this.refs.loading.open()
        this.refresh()
    }

    reCan2() {
        this.searchOrder(this.searchTxt)
    }

    async refresh () {
        this.page = 1
        this.totalPages = 2

        const list = await this.load()

        this.setState({ list, isData: !!list.length })
    }

    async getList () {
        return await get(`/return/shopReturnProcessedV1.do?type=3&searchValue=${ this.searchTxt }&page=${ this.page }`)
    }

    async load () {
        this.loading = true

        try {
            const result = await this.getList()

            this.totalPages = result.totalPages

            return result.list || []
        } catch (e) {
            return []
        } finally {
            this.refs.loading.close()
            this.loading = false
            this.page ++
        }
    }

    async next () {
        if (this.page > this.totalPages || this.loading) return

        this.loadRef.open()

        const list = await this.load()
        
        this.setState({
            list: [...this.state.list, ...list]
        })
        this.loadRef.close()
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