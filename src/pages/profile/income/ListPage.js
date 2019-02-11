'use strict';

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback
} from 'react-native';

import { px } from '../../../utils/Ratio';
import { get } from '../../../services/Request';

import { show as toast } from '../../../widgets/Toast';
import T from '../../common/TabsTest'
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view2'
import { TopHeader } from '../../common/Header'
import Loading from '../../../animation/Loading'
const TYPE_TEXT_HIGHLIGHT = ['ORDER_COMING_RETURN', 'ORDER_SUCCESS_RETURN'];

const PAGE_SIZE = 20;

class IncomeItem extends React.PureComponent {

    render() {
        const income = this.props.income;
        return <TouchableWithoutFeedback onPress={() => this.goByEventType()}>
            <View style={styles.income}>
                <View>
                    <Text allowFontScaling={false} style={[styles.incomeText,
                        TYPE_TEXT_HIGHLIGHT.indexOf(income.eventCode) >= 0 ? styles.incomeTextEm : {}]}>
                        {income.eventDesc}
                    </Text>
                    {
                        income.fullName != '' && income.eventDesc !== "开店奖励" && 
                            <Text allowFontScaling={false} style={[styles.incomeDetail,
                                income.eventCode.indexOf('ORDER') == 0 ? styles.incomeDetailEm : {}]}>
                                {income.fullName}
                            </Text>
                        
                    }
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text allowFontScaling={false} style={[styles.incomeValue,
                        TYPE_TEXT_HIGHLIGHT.indexOf(income.eventCode) >= 0 ? styles.incomeTextEm : {}]}>
                        {income.benefitValue > 0 ? '+' : ''}
                        {Number(income.benefitValue).toFixed(2)}
                    </Text>
                    <Text allowFontScaling={false} style={styles.incomeDate}>{income.benefitDate}</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }

    goByEventType() {
        const income = this.props.income;
        if (income.eventCode.indexOf('ORDER') !== 0) {
            return;
        }
        this.props.navigation.navigate('OrderDetailPage', {
            orderNo: income.benefitNo,
            type: 1
        });
    }

}

class IncomeList extends React.Component {

    constructor(props) {
        super(props);
        this.hasNext = true;
        this.start = 0;
        this.state = {
            list: [],
            refreshing: false
        };
    }

    render() {
        return (
            <View style={{ flex: 1, width: px(750) }}>
                <FlatList
                    //style={{flex: 1, width: px(750)}}
                    data={this.state.list}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.refresh()}
                    keyExtractor={item => item.benefitId}
                    renderItem={({ item, index }) =>
                        <IncomeItem income={item} navigation={this.props.navigation} />
                    }
                    onEndReached={() => this.next()}
                    ListEmptyComponent={
                        this.state.list && <Text allowFontScaling={false} style={styles.emptyList}>暂无相关数据</Text>
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
        this.setState({
            refreshing: true
        });
        let list = await this.load();
        this.refs.loading.close()
        this.setState({
            list: list,
            refreshing: false
        });
    }

    async next() {
        let list = await this.load();
        this.setState({
            list: this.state.list.concat(list)
        });
    }

    async load() {
        if (!this.hasNext || this.loading) {
            return [];
        }
        this.loading = true;
        try {
            let res = await get(`/benefit/list.do?type=${this.props.type}&start=${this.start}&limit=${PAGE_SIZE}`);
            this.start = this.start + 1;
            this.hasNext = this.start * PAGE_SIZE < res.totalCount;
            return res.items || [];
        } catch (e) {
            toast(e.message);
            return [];
        } finally {
            this.loading = false;
        }
    }

}

export default class extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TopHeader navigation={this.props.navigation}
                    title="收入明细"></TopHeader>
                <ScrollableTabView
                    locked
                    initialPage={0}
                    tabBarBackgroundColor="#fff"
                    tabBarInactiveTextColor="#858385"
                    tabBarActiveTextColor="#252426"
                    tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(4) }}
                    renderTabBar={() => <T
                        paddingValue={140}
                        tabs={['已结算', '待结算']}
                    />}
                >
                    {
                        ['已结算', '待结算'].map((item, index) => 
                            <View tabLabel={item} key={index} style={{flex:1}}>
                                <IncomeList type={index + 1} navigation={this.props.navigation} />
                            </View>
                        )
                    }
                </ScrollableTabView>
                {/*<IndicatorViewPager
                style={styles.pager}
                pagerStyle={{marginTop: px(80)}}
                indicator={<PagerTitleIndicator
                  style={styles.indicator}
                  itemStyle={styles.indicatorItem}
                  selectedItemStyle={styles.indicatorSelectedItem}
                  itemTextStyle={styles.indicatorItemTxt}
                  selectedItemTextStyle={styles.indicatorSelectedTxt}
                  selectedBorderStyle={styles.indicatorSelectedBorder}
                  titles={['已结算', '待结算']}/>
                }>
                  <IncomeList type={1} navigation={this.props.navigation}/>
                  <IncomeList type={2} navigation={this.props.navigation}/>
              </IndicatorViewPager>*/}
            </View>
        )
    }

}

const styles = StyleSheet.create({
    pager: {
        flex: 1,
        backgroundColor: '#f5f3f6'
    },
    indicator: {
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
    pagerTab: {
        backgroundColor: '#fff',
        width: px(750),
        height: px(80),
        //paddingLeft: px(140),
        // paddingRight: px(140),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        justifyContent: 'space-between',
        flexDirection: 'row',
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
    income: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        //marginTop: px(20),
        paddingLeft: px(30),
        paddingRight: px(30),
        height: px(142),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
    },
    incomeText: {
        fontSize: px(28),
        color: '#252426',
        marginBottom: px(20)
    },
    incomeTextEm: {
        color: '#e86d78'
    },
    incomeDetailEm: {
        color: '#d0648f'
    },
    incomeDetail: {
        fontSize: px(24)
    },
    incomeValue: {
        fontSize: px(28),
        color: '#252426',
        marginBottom: px(20)
    },
    incomeDate: {
        fontSize: px(24),
        color: '#858385'
    },
    emptyList: {
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    }
});