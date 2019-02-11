'use strict';

import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    DeviceEventEmitter,
    Modal
} from 'react-native';
import { px } from '../../../utils/Ratio';
import { get } from '../../../services/Request';
import { show as toast } from '../../../widgets/Toast';
import { IndicatorViewPager, PagerTitleIndicator } from 'rn-viewpager';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view2'
import T from '../../common/TabsTest'
import { TopHeader } from '../../common/Header'
import Loading from '../../../animation/Loading'
const PAGE_SIZE = 30;

//列表项
class BalanceItem extends PureComponent {

    constructor(props) {
        super(props);

    }

    render() {
        const { balance, type } = this.props
        return (
            <View style={styles.balance}>
                <View style={styles.balanceBox}>
                    <Text style={styles.balanceTxt1} allowFontScaling={false}>{balance.eventDesc}</Text>
                    <Text style={styles.balanceTxt1} allowFontScaling={false}>{type == 1 ? '+' : ''}{balance.benefitValue}</Text>
                </View>
                <View style={styles.balanceBox}>
                    <Text style={styles.balanceTxt2} allowFontScaling={false}>{balance.fullName}</Text>
                    <Text style={styles.balanceTxt2} allowFontScaling={false}>{balance.benefitDate}</Text>
                </View>
            </View>)
    }

}

//列表
class BalanceList extends React.Component {

    constructor(props) {
        super(props);
        this.hasNext = true;
        this.start = 0;
        this.state = {
            refreshing: false,
            list: [],
        };
    }

    render() {
        const { list, refreshing } = this.state
        const { type } = this.props
        return (
            <View style={{ flex: 1, width: px(750) }}>
                <FlatList
                    //style={{flex: 1}}
                    data={list || []}
                    refreshing={refreshing}
                    onRefresh={() => this.refresh()}
                    keyExtractor={(item) => item.benefitId}
                    renderItem={({ item }) =>
                        <BalanceItem balance={item} type={type} />
                    }
                    onEndReached={() => this.next()}
                    ListEmptyComponent={
                        list && <Text style={styles.emptyList} allowFontScaling={false}>暂无明细</Text>
                    }

                />
                <Loading ref='loading' />
            </View>
        )
    }
    async componentDidMount() {
        this.refs.loading.open()
        await this.refresh();
    }

    async refresh() {
        this.hasNext = true;
        this.start = 0;
        /*this.setState({
            refreshing: true
        });*/
        let list = await this.getList();
        this.refs.loading.close()
        this.setState({
            list: list,
            //refreshing: false
        });
    }

    async next() {
        let list = await this.getList();
        this.setState({
            list: this.state.list.concat(list)
        });
    }

    async getList() {
        if (!this.hasNext || this.loading) {
            return [];
        }
        this.loading = true;
        try {
            let res = await get(`/active/money/list.do?type=${this.props.type || 1}&start=${this.start}&limit=${PAGE_SIZE}`);
            this.start = this.start + 1;
            this.hasNext = (res.items || []).length == PAGE_SIZE;
            return res.items || [];
        } catch (e) {
            toast(e.message);
            return [];
        } finally {
            this.loading = false;
        }
    }



}

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <View style={{ flex: 1, position: 'relative' }}>
                <TopHeader navigation={this.props.navigation}
                    title="余额明细"></TopHeader>
                <ScrollableTabView
                    locked
                    initialPage={0}
                    tabBarBackgroundColor="#fff"
                    tabBarInactiveTextColor="#858385"
                    tabBarActiveTextColor="#252426"
                    tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(4) }}
                    renderTabBar={() => <T
                        paddingValue={140}
                        tabs={['收入', '支出']}
                    />}
                >
                    {
                        ['收入', '支出'].map((item, index) => 
                            <View tabLabel={item} key={index} style={{flex:1}}>
                                <BalanceList type={index + 1} navigation={this.props.navigation} />
                            </View>
                        )
                    }
                </ScrollableTabView>
                {/*<IndicatorViewPager
                style={pagerStyles.contain}
                pagerStyle={{marginTop: px(100)}}
                indicator={<PagerTitleIndicator
                  style={pagerStyles.page}
                  itemStyle={pagerStyles.indicatorItem}
                  selectedItemStyle={pagerStyles.indicatorSelectedItem}
                  itemTextStyle={pagerStyles.indicatorItemTxt}
                  selectedItemTextStyle={pagerStyles.indicatorSelectedTxt}
                  selectedBorderStyle={pagerStyles.indicatorSelectedBorder}
                  titles={['收入', '支出']}
                />}
              >
                  <View style={{flex: 1}}>
                      <BalanceList type="1"/>
                  </View>
                  <View style={{flex: 1}}>
                      <BalanceList type="2"/>
                  </View>
              </IndicatorViewPager>*/}
            </View>)
    }


}


const pagerStyles = StyleSheet.create({
    contain: {
        flex: 1,
    },
    page: {
        position: 'absolute',
        top: 0,
        backgroundColor: '#fff',
        width: px(750),
        height: px(80),
        paddingLeft: px(140),
        paddingRight: px(140),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1
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
    },

});
const styles = StyleSheet.create({
    emptyList: {
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    },
    balance: {
        width: px(750),
        height: px(141),
        backgroundColor: '#fff',
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        padding: px(30),
        //flexDirection:'row'
        justifyContent: 'space-between'
    },
    balanceBox: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    balanceTxt1: {
        fontSize: px(28)
    },
    balanceTxt2: {
        fontSize: px(24),
        color: '#858385'
    }
})