'use strict';

import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';
import { getShopDetail } from '../../services/Api';
import { px } from '../../utils/Ratio';
import { TopHeader } from '../common/Header'
import T from '../common/TabsTest'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view2'
import base from '../../styles/Base'
import {FootView} from '../../UI/Page'
import Icon from '../../UI/lib/Icon'

const PAGE_SIZE = 20;

//列表项
class CouponItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { coupon, selectedList } = this.props
        return <View>
            {this.props.use &&
                <View style={coupon_style.coupon}>
                    <View style={coupon_style.body}>
                        <View style={[base.text_center, coupon_style.moneyBox]}>
                            <View style={base.inline}>
                                <Text allowFontScaling={false} style={[coupon_style.couponMoneyI, base.color]}>￥</Text>
                                <Text allowFontScaling={false} style={[coupon_style.couponMoney, base.color]}>{coupon.amountStr}</Text>
                            </View>
                            {coupon.minAmount > 0 && coupon.amount < coupon.minAmount && <Text allowFontScaling={false} style={[coupon_style.couponMoney2, base.color]}>满{coupon.minAmountStr}可用</Text>}
                            {/* <Text allowFontScaling={false} style={coupon_style.couponMoney2}>满200可用</Text> */}
                        </View>
                        <View style={coupon_style.infoBox}>
                            <View>
                                <Text numberOfLines={1} allowFontScaling={false} style={coupon_style.couponName}>{coupon.name}</Text>
                                <Text numberOfLines={1} allowFontScaling={false} style={coupon_style.couponShop}>使用店铺:{coupon.shopName}</Text>
                            </View>
                            <Text numberOfLines={3} allowFontScaling={false} style={coupon_style.desc}>{coupon.describe}</Text>
                        </View>
                        <View style={coupon_style.btn}>
                            <TouchableOpacity style={[coupon_style.couponSelect, base.line]} onPress={() => this.props.selectTo()}>
                                {this.props.selectedList !== coupon.couponLogId ?
                                    <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34) }} /> :
                                    <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34) }} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={coupon_style.line}>
                        <Icon name="coupon-bottom" style={{ width: px(690), height: px(18) }} />
                    </View>
                    <View style={[base.inline_between, coupon_style.foot]}>
                        <Text allowFontScaling={false} style={coupon_style.footDate}>{coupon.startDateStr}-{coupon.endDateStr}</Text>
                    </View>
                </View>
            }
            {!this.props.use && <View style={coupon_style.coupon}>
                <View style={coupon_style.body}>
                    <View style={[base.text_center, coupon_style.moneyBox]}>
                        <View style={base.inline}>
                            <Text allowFontScaling={false} style={[coupon_style.couponMoneyI, { color: '#b2b3b5' }]}>￥</Text>
                            <Text allowFontScaling={false} style={[coupon_style.couponMoney, { color: '#b2b3b5' }]}>{coupon.amountStr}</Text>
                        </View>
                        {coupon.minAmount > 0 && coupon.amount < coupon.minAmount && <Text allowFontScaling={false} style={[coupon_style.couponMoney2, { color: '#b2b3b5' }]}>满{coupon.minAmountStr}可用</Text>}
                        {/* <Text allowFontScaling={false} style={coupon_style.couponMoney2}>满200可用</Text> */}
                    </View>
                    <View style={coupon_style.infoBox}>
                        <View>
                            <Text numberOfLines={1} allowFontScaling={false} style={[coupon_style.couponName, { color: '#b2b3b5' }]}>{coupon.name}</Text>
                            <Text numberOfLines={1} allowFontScaling={false} style={[coupon_style.couponShop, { color: '#b2b3b5' }]}>使用店铺:{coupon.shopName}</Text>
                        </View>
                        <Text numberOfLines={3} allowFontScaling={false} style={[coupon_style.desc, { color: '#b2b3b5' }]}>{coupon.describe}</Text>
                    </View>
                </View>
                <View style={coupon_style.line}>
                    <Icon name="coupon-bottom" width={px(690)} height={px(18)} />
                </View>
                <View style={[base.inline_between, coupon_style.foot]}>
                    <Text allowFontScaling={false} style={[coupon_style.footDate, { color: '#b2b3b5' }]}>{coupon.startDateStr}-{coupon.endDateStr}</Text>
                </View>
            </View>}
        </View>
    }

}

class CouponList extends React.Component {

    constructor(props) {
        super(props)
    }
    render() {
        let list = this.props.list;
        return <View style={{ flex: 1 }}>
            <FlatList
                keyExtractor={(item) => item.code}
                data={list || []}
                renderItem={({ item }) =>
                    <CouponItem
                        navigation={this.props.navigation}
                        use={this.props.use}
                        selectTo={() => this.props.selectTo(item.couponLogId)}
                        coupon={item}
                        selectedList={this.props.id} />
                }
                ListFooterComponent={
                    <View style={{ height: px(120) }}></View>
                }
                ListEmptyComponent={
                    list && <Text style={styles.emptyList} allowFontScaling={false}>暂无数据</Text>
                }
            />
        </View>
    }

}
const coupon_style = StyleSheet.create({
    coupon: {
        width: px(690),
        height: px(275),
        marginTop: px(20),
        marginHorizontal: px(30),
        backgroundColor: '#fff',
        borderRadius: px(10),
    },
    body: {
        flexDirection: 'row',
        paddingHorizontal: px(10),
        paddingTop: px(30),
        paddingBottom: px(20),
    },
    moneyBox: {
        width: px(210),
        height: px(150),
        borderRightColor: '#ccc',
        borderRightWidth: px(1)
    },
    couponMoneyI: {
        fontSize: px(40),
        marginTop: px(20)
    },
    couponMoney2: {
        fontSize: px(22),
    },
    couponMoney: {
        fontSize: px(70),
    },
    infoBox: {
        width: px(370),
        paddingHorizontal: px(40),
        height: px(162),
        overflow: "hidden",
    },
    desc: {
        marginTop: px(10),
        color: '#858385',
        fontSize: px(22)
    },
    btn: {
        paddingTop: px(70),
        paddingRight: px(10)
    },
    line: {
        backgroundColor: '#efefef'
    },
    foot: {
        paddingHorizontal: px(20),
        paddingBottom: px(5),
    },
    footDate: {
        fontSize: px(22),
        color: '#858385',
        lineHeight: px(30),
    },
    couponName: {
        fontSize: px(32),
        color: '#252426',
        marginBottom: px(10),
    },
    couponShop: {
        fontSize: px(22),
        color: '#252426',
        marginBottom: px(5),
    },
    couponSelect: {
        width: px(82)
    },
})
//列表
export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            coupons1: this.props.navigation.state.params.coupons1,
            coupons2: this.props.navigation.state.params.coupons2,
            id: this.props.navigation.state.params.id || "",
            pid: this.props.navigation.state.params.id || "",
        };
    }
    render() {
        const { list, refreshing } = this.state
        return (
            <View style={{ flex: 1 }}>
                <TopHeader navigation={this.props.navigation}
                    title="达令家代金券"></TopHeader>
                <ScrollableTabView
                    locked
                    initialPage={0}
                    tabBarBackgroundColor="#fff"
                    tabBarInactiveTextColor="#858385"
                    tabBarActiveTextColor="#d0648f"
                    tabBarUnderlineStyle={{ backgroundColor: '#d0648f' }}
                    tabBarTextStyle={{}}
                    renderTabBar={() => <T paddingValue={80} />}
                    onChangeTab={(t) => this.onChangeT(t)}>
                    <CouponList
                        id={this.state.id}
                        navigation={this.props.navigation}
                        key={1}
                        tabLabel='可使用代金券'
                        use={true}
                        selectTo={(id) => this.selectTo(id)}
                        list={this.state.coupons1} />
                    <CouponList navigation={this.props.navigation} key={2} tabLabel='不可使用代金券' use={false} list={this.state.coupons2} />
                </ScrollableTabView>
                <FootView style={[styles.shareBox, base.backgroundColor]}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => this.shareTo()}>
                        <View style={[styles.shareBtn, base.backgroundColor, base.line]}>
                            <Text allowFontScaling={false} style={styles.share}>确定</Text>
                        </View>
                    </TouchableOpacity>
                </FootView>
            </View>
        )
    }
    onChangeT(page) {
        this.setState({ page: page.i })
    }
    selectTo(id) {
        if (this.state.id === id) id = '';
        this.setState({ id: id })
    }
    shareTo = () => {
        const pid = this.props.navigation.state.params.id
        if (this.state.id) {
            this.props.navigation.state.params.callbackF(this.state.id);
        } else {
            if (pid == null || pid == '') {

            } else {
                this.props.navigation.state.params.callbackF(this.state.id);
            }
        }

        this.props.navigation.goBack();
    }
    componentDidMount() {
        //console.log(this.props.navigation.state.params.id, 777)
    }
}

const styles = StyleSheet.create({
    shareBox: {
        width: px(750),
        height: px(100)
    },
    shareBtn: {
        width: px(750),
        height: px(100)
    },
    share: {
        textAlign: 'center',
        fontSize: px(28),
        color: '#fff'
    },
    emptyList: {
        fontSize: px(36),
        marginTop: px(50),
        textAlign: 'center'
    },
    tab_title: {
        height: px(80)
    }
})