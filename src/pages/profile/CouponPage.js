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
import { px, isIphoneX } from '../../utils/Ratio';
import { get, post, touchBaseUrl } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { getCouponList, getShopDetail, User } from '../../services/Api';
import T from '../common/TabsTest'
import { TopHeader } from '../common/Header'
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view2'
import ShareView, { SHARETYPE } from '../common/ShareView'
import base from '../../styles/Base'
import { config } from '../../services/Constant';
import Loading from '../../animation/Loading'
import Page, { FootView } from '../../UI/Page'
import { TrackClick } from "../../services/Track";
import Icon from '../../UI/lib/Icon'

import List from "../common/List"

const PAGE_SIZE = 20;

//列表项
class CouponItem extends Component {

    constructor(props) {
        super(props);
        this.state = { selected: false }
    }

    render() {
        const { coupon, type, selectedList } = this.props
        return <View>
            {
                type == 0 && <View style={coupon_style.coupon}>
                    <View style={coupon_style.body}>
                        <View style={[base.text_center, coupon_style.moneyBox]}>
                            <View style={base.inline}>
                                <Text allowFontScaling={false} style={coupon_style.couponMoneyI}>￥</Text>
                                <Text allowFontScaling={false} style={coupon_style.couponMoney}>{coupon.amountStr}</Text>
                            </View>
                            {coupon.minAmount > 0 && coupon.amount < coupon.minAmount && <Text allowFontScaling={false} style={coupon_style.couponMoney2}>满{coupon.minAmountStr}可用</Text>}
                            {/* <Text allowFontScaling={false} style={coupon_style.couponMoney2}>满200可用</Text> */}
                        </View>
                        <View style={coupon_style.infoBox}>
                            <View>
                                <Text numberOfLines={1} allowFontScaling={false} style={coupon_style.couponName}>{coupon.name}</Text>
                                <Text numberOfLines={1} allowFontScaling={false} style={coupon_style.couponShop}>使用店铺:{coupon.shopName}</Text>
                            </View>
                            <Text numberOfLines={3} allowFontScaling={false} style={coupon_style.desc}>{coupon.describe}</Text>
                        </View>
                        {!User.vip && <View style={coupon_style.btn}>
                            <TouchableOpacity style={coupon_style.couponSelect} onPress={() => this.select(coupon.code)}>
                                {this.state.selected && <Icon name="check-box-select" resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />}
                                {!this.state.selected && <Icon name="check-box" resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />}
                            </TouchableOpacity>
                        </View>}
                    </View>
                    <View style={coupon_style.line}>
                        <Icon name="coupon-bottom"
                            style={{ width: px(690), height: px(18) }} />
                    </View>
                    <View style={[base.inline_between, coupon_style.foot]}>
                        <Text allowFontScaling={false} style={coupon_style.footDate}>{coupon.startDateStr}-{coupon.endDateStr}</Text>
                        <TouchableOpacity onPress={() => this.toUse(coupon.couponId, coupon.name, coupon.useRange, coupon.singleSku, coupon.inviteCode, coupon.shopName)}>
                            <View style={coupon_style.btnUse}>
                                <Text style={coupon_style.btnUseTxt}>去使用</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            {
                type != 0 &&
                <View style={coupon_style.coupon}>
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
                        <Icon name="coupon-bottom"
                            style={{ width: px(690), height: px(18) }} />
                    </View>
                    <View style={[base.inline_between, coupon_style.foot]}>
                        <Text allowFontScaling={false} style={[coupon_style.footDate, { color: '#b2b3b5' }]}>{coupon.startDateStr}-{coupon.endDateStr}</Text>
                    </View>
                </View>
            }
        </View>
    }
    select(code) {
        this.setState({ selected: !this.state.selected })
        this.props.selectTo && this.props.selectTo(code, this.props.coupon);
    }
    toUse(id, name, range, sku, inviteCode, shopName) {
        if (this.props.tmp.inviteCode != inviteCode) {
            return toast(`该代金券仅在${shopName}店铺中使用，请在微信中进入该店铺使用`)
        }
        if (range === 'all') {
            this.props.navigation.navigate('ShopPage');
        } else if (sku) {
            this.props.navigation.navigate('DetailPage', {
                sku: sku
            });
        } else {
            this.props.navigation.navigate('CouponGoodsPage', {
                id: id,
                name: name,
                from: 'coupon'
            });
        }
    }
}
const coupon_style = StyleSheet.create({
    coupon: {
        width: px(690),
        height: px(275),
        marginTop: px(20),
        marginLeft: px(30),
        marginRight: px(30),
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
        color: '#d0648f',
        fontSize: px(40),
        marginTop: px(20)
    },
    couponMoney2: {
        color: '#d0648f',
        fontSize: px(22),
    },
    couponMoney: {
        color: '#d0648f',
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
    btnUse: {
        borderColor: '#d0648f',
        borderWidth: px(2),
        borderRadius: px(30),
        paddingHorizontal: px(20),
        paddingVertical: px(5)
    },
    btnUseTxt: {
        fontSize: px(22),
        color: '#d0648f'
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
        width: px(82),
        justifyContent: 'center',
        alignItems: 'center'
    },
})
//列表
class CouponList extends List {

    constructor(props) {
        super(props);
    }

    renderItem(item, index) {
        const { type } = this.props
        const { list, refreshing, selectedList, isShow } = this.state
        return <CouponItem
            navigation={this.props.navigation}
            tmp={this.state.tmp}
            selectTo={this.selectTo.bind(this)}
            coupon={item} type={type} selectedList={selectedList} />
    }

    other() {
        const { type } = this.props
        return <View>
            {!User.vip && type == 0 && <FootView>
                <TouchableWithoutFeedback onPress={() => this.shareTo()}>
                    <View style={styles.share}>
                        <Text allowFontScaling={false} style={styles.share2}>分享代金券</Text>
                    </View>
                </TouchableWithoutFeedback>
            </FootView>}
            <ShareView ref='shareView'
                navigation={this.props.navigation}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN]} />
        </View>
    }
    key = "couponId"
    shareTo = async () => {
        let { selectedList, selectedCoupon } = this.state
        if (selectedList.length == 0) {
            return toast('请勾选要分享的代金券');
        } else {
            try {
                let shareCodes = '', shareCouponNames = [], shareCouponPrices = []
                selectedList.length > 1 && selectedList.map((item, index) => {
                    if (index < selectedList.length - 1) {
                        shareCodes += 'codes=' + item + '&'
                    } else {
                        shareCodes += 'codes=' + item
                    }

                })
                selectedList.length == 1 && selectedList.map(item => {
                    shareCodes += 'codes=' + item
                })
                selectedCoupon.length >= 1 && selectedCoupon.map(item => {
                    shareCouponNames.push(item.name)
                    shareCouponPrices.push(item.amountStr)
                })
                let res = await post(`/api/coupon/share?` + shareCodes);
                let shareCouponName = shareCouponNames.join(',')
                let shareCouponPrice = shareCouponPrices.join(',')
                this.refs.shareView.Share({
                    title: `{shopName}给您送代金券啦~`,
                    desc: `{shopName}给您送${selectedList.length}张店铺代金券，快来领取啊~`,
                    img: this.state.couponShare,
                    url: `${touchBaseUrl}/get-vouchers?codes=${res}&title={shopName}给您送代金券啦~&description={shopName}给您送${selectedList.length}张店铺代金券，快来领取啊~`,
                    track: (type) => {
                        TrackClick('MyCouponpage', 'MyCouponpageShare', '我的代金券页', `分享代金券-${type}-${shareCouponName}-${shareCouponPrice}`);
                    }
                });
            } catch (e) {
                toast(e.message);
            }
        }
    }
    selectTo(couponLogId, coupon) { //选择代金券
        let { selectedList, selectedCoupon } = this.state
        if (selectedList.indexOf(couponLogId) == -1) {
            selectedList.push(couponLogId)
            selectedCoupon.push(coupon)
        } else {
            selectedList.splice(selectedList.indexOf(couponLogId), 1)
            selectedCoupon.splice(selectedList.indexOf(couponLogId), 1)
        }
        this.setState({
            selectedList: selectedList,
            selectedCoupon: selectedCoupon
        })
    }
    async load() {
        try {
            let res = await getCouponList(this.props.type);
            if (res.constructor === Array) {
                return {
                    items: res,
                    totalPages: 1
                }
            }
            return res;
        } catch (e) {
            toast(e.message);
        }
        return {
            items: [],
            totalPages: 1
        }
    }
    init() {
        this.state = Object.assign({
            refreshing: false,
            list: [],
            selectedList: [],
            selectedCoupon: [],
            isShow: false,
            contentTxt: "",
            shareContent: [],
            tmp: '',
            couponShare: ''
        }, this.state)
    }
    async componentDidMount() {

        let cfg = await config();
        let tmp = await getShopDetail()
        this.setState({
            tmp: tmp,
            couponShare: cfg.images.couponShare
        });
    }

    // async refresh() {
    //     /*this.setState({
    //         refreshing: true
    //     });*/
    //     let list = await this.getList();
    //     if (list.length == 0) this.state.contentTxt = "暂无数据";
    //     this.refs.loading.close()
    //     this.setState({
    //         list: list,
    //         // refreshing: false,
    //         contentTxt: this.state.contentTxt
    //     });
    // }

    // async next() {
    //     let list = await this.getList();
    //     this.setState({
    //         list: this.state.list.concat(list)
    //     });
    // }

    // async getList() {
    //     try {
    //         let res = await getCouponList(this.props.type);
    //         return res || [];
    //     } catch (e) {
    //         toast(e.message);
    //         return [];
    //     }
    // }

}

export default class extends Page {

    constructor(props) {
        super(props);
        let page = (this.props.navigation.state.params && this.props.navigation.state.params.page) || 0
        this.state = {
            page
        };
    }
    title = "我的代金券"
    pageBody() {
        let tabs = ['未使用', '已过期', '已使用', '分享被领取'];
        if (User.vip) tabs = ['未使用', '已过期', '已使用'];
        return <ScrollableTabView
            locked
            initialPage={this.state.page}
            tabBarBackgroundColor="#fff"
            tabBarInactiveTextColor="#858385"
            tabBarActiveTextColor="#252426"
            style={{ backgroundColor: "#f6f5f7" }}
            tabBarUnderlineStyle={{ backgroundColor: '#e86d78', height: px(4) }}
            renderTabBar={() => <T
                paddingValue={80}
            />} >
            {
                tabs.map((item, index) =>
                    <View tabLabel={item} key={index} style={{ flex: 1 }}>
                        {User.isLogin && <CouponList type={index} navigation={this.props.navigation} />
                        }
                    </View>
                )
            }
        </ScrollableTabView>
    }

    onReady() {
        if (!User.isLogin) this.go_("LoginPage")
    }
}


const pagerStyles = StyleSheet.create({
    contain: {
        flex: 1,
        backgroundColor: '#f6f5f7'
    },
    page: {
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
        color: '#d0648f'
    },
    indicatorSelectedBorder: {
        backgroundColor: '#d0648f'
    }

});
const styles = StyleSheet.create({
    share: {
        width: px(750),
        height: px(80),
        justifyContent: 'center',
        backgroundColor: '#d0648f',
        alignItems: 'center',
    },
    share2: {
        fontSize: px(28),
        color: '#fff',
    },
    coupon: {
        width: px(690),
        height: px(242),
        marginTop: px(20),
        marginLeft: px(30),
        marginRight: px(30),
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: px(10),
        overflow: "hidden"
    },
    couponMoneyBox: {
        width: px(199),
        height: px(242),
        alignItems: 'center',
        justifyContent: 'center'
    },
    couponMoney2: {
        color: '#b2b3b5',
        fontSize: px(22),
    },
    couponMoneyI: {
        color: '#d0648f',
        fontSize: px(40),
        marginTop: px(20)
    },
    couponMoney: {
        color: '#d0648f',
        fontSize: px(80),
    },
    couponIcon: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    couponIcon1: {
        width: px(24),
        height: px(24),
        backgroundColor: '#f6f5f7',
        overflow: 'hidden',
        borderRadius: px(12),
        marginTop: px(-12)
    },
    couponIcon3: {
        marginTop: 0
    },
    couponContent: {
        paddingLeft: px(20),
        paddingTop: px(30),
        paddingBottom: px(30),
        width: px(366)
    },
    couponName: {
        fontSize: px(32),
        color: '#252426',
        marginBottom: px(12),
    },
    couponShop: {
        fontSize: px(22),
        color: '#252426',
        marginBottom: px(5),
    },
    couponTime: {
        fontSize: px(20),
        color: '#858385'
    },
    couponDecBox: {
        height: px(79),
        justifyContent: 'flex-end'
    },
    couponDec: {
        fontSize: px(22),
        color: '#858385',
        lineHeight: px(26),
    },
    couponSelect: {
        width: px(82),
        justifyContent: 'center',
        alignItems: 'center'
    },
    couponRe: {
        color: '#b2b3b5'
    },
    emptyList: {
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    }
})
