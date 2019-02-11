/**
 * @ClassName:  MarketPage
 * @Desc:  店铺页面
 * @Author: luhua
 * @Date: 2018-04-28 14:52:08
 */

import React, { Component } from 'react';
import { Clipboard, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, FlatList, NativeModules, Animated, Easing, Dimensions, NetInfo } from 'react-native';
import Api, { getShopDetail, getUser, User } from "../../services/Api";
import { config } from "../../services/Constant";
import request, { touchBaseUrl } from '../../services/Request';
import { TrackClick } from "../../services/Track";
import base from "../../styles/Base";
import Background from '../../UI/lib/Background';
import Icon from '../../UI/lib/Icon';
import { ImagesRes } from "../../utils/ContentProvider";
import { deviceWidth, isIphoneX, px, pxRatio, px1 } from "../../utils/Ratio";
import ScreenUtil from "../../utils/ScreenUtil";
import { get, post } from '../../services/Request'
import { show as toast } from '../../widgets/Toast';
import CircleHeader from "../common/CircleHeader";
import ShareView, { SHARETYPE } from '../common/ShareView';
import Badge from '../../UI/lib/Badge'
import { SafeHeadView, TopMsg } from '../common/Header'
import Event from '../../services/Event'
import ScrollableTabView from 'react-native-scrollable-tab-view2'
import { OwnerTab } from '../common/TabsTest'
import { digitalUnit } from '../../utils/digitalProcessing'
import { dataFormat } from '../../utils/dataFormat'
import { getUnReadMsg } from "../../services/Push"
import Material from './Material'
import { ImgsModal, ZoomImgModal, DialogModal } from '../common/ModalView'
import { MatterItem } from '../common/matter/MatterItem'
import { ShareModal } from '../common/matter/Extra';
import Popover from '../common/Popover';
import Loading from '../../animation/Loading'
import { LoadingRequest } from '../../widgets/Loading';
import { isWXAppInstalled } from '../../services/WeChat';

const conversion = digitalUnit(10000, ['', '万', '亿', '万亿', '兆'])
const AppModule = NativeModules.AppModule;
const os = Platform.OS === "ios";
const WeChat = NativeModules.WeChat;
const originalWidth = Dimensions.get('window').width

/**
 * 店铺页面
 */

export default class MarketPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            market: {},
            bannerImg: '',
            isrefresh: false,
            hasLogin: false,
            showGoldValid: 0,
            running: {
                month: {},
                today: {},
                total: {},
                yesterday: {}
            },
            materialList: [],
            nextPage: true,
            net: 'WIFI',
            isPopover: false,
            buttonRect: {},
            copyTxt: '',
            scrollTop: false,
            opacityToTop: new Animated.Value(0),
            requestStatus: false,
            isNext: true,
        };

        this.tabIndex = 0
    }

    didFocus = null

    componentWillUnmount() {
        NetInfo.removeEventListener(
            'connectionChange',
            this._handleConnectionInfoChange
        );
    }

    async componentDidMount() {
        this.isInstalled = await isWXAppInstalled();
        if (User.isLogin) {
            try {
                let cfg = await config();
                let market = await getShopDetail();
                let is = await this.checkUserIsGoldValid(market.inviteCode);
                const running = await this.getDimensional()

                this.setState({
                    market: market,
                    bannerImg: cfg.images['ucenter_b_image_v1'],
                    vipImg: cfg.images['ucenter_vip_image'],
                    showGoldValid: is,
                    running
                });

            } catch (e) {
                //
            } finally {
                this.refs.loading.close()
            }
            AppModule.getAppNetType && AppModule.getAppNetType((err, net) => {
                this.setState({
                    net: net
                })
            });
            NetInfo.addEventListener(
                'connectionChange',
                this._handleConnectionInfoChange
            );
        } else {
            this.goLoginPage();
        }
    }

    _handleConnectionInfoChange = (connectionInfo) => {
        const net = connectionInfo.type.toLocaleUpperCase()
        this.setState({
            net: net,
        });
    }


    async checkUserIsGoldValid(code) {
        let result = {}
        try {
            result = await get(`/stunner/showGoldCheck.do`)
        } catch (e) {
            //
        }

        return result.checkFlag || 0
    }

    async getDimensional(index) {
        const result = await get(`/benefit/indexV1.do`)

        return result
    }

    async onRefresh() {
        if (!User.isLogin) return
        
        this.isMaterialLoad = false
        this.hasNextMaterial = true
        this.shouldUpdate = true

        try {
            getUser()
            const cfg = await config()
            const market = await getShopDetail()
            const is = await this.checkUserIsGoldValid(market.inviteCode)
            const materialList = await this.getMaterial(1)
            const running = await this.getDimensional()
            this.setState({
                market,
                bannerImg: cfg.images['ucenter_b_image_v1'],
                vipImg: cfg.images['ucenter_vip_image'],
                showGoldValid: is,
                running,
                materialList,
                isNext: this.hasNextMaterial
            });
        } catch (e) {
            //
        } 
    }

    goMessageCenter() {
        this.props.navigation.navigate('MessageCenter', {});
    }

    /**
     * 绘制 我的店铺 概要信息
     * @returns {*}
     */
    _renderHeader() {
        return (
            <Background style={{
                width: deviceWidth,
                height: isIphoneX() ? px(422) : Platform.OS === 'ios' ? px(372) : px(328),
            }} resizeMode={'cover'} name="market_header_bg" >
                <SafeHeadView boxStyle={{ backgroundColor: 'transparent' }} style={{ width: deviceWidth }}>
                    {Platform.OS === 'ios' && <View style={{
                        width: deviceWidth,
                        height: px(44)
                    }} />}
                    <View style={{
                        width: deviceWidth,
                        height: px(76),
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <TopMsg navigation={this.props.navigation} />
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => this.share()}
                            style={{
                                width: px(104),
                                height: px(76),
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Icon name={'icon-share-shop'} width={px(44)} height={px(44)} />
                        </TouchableOpacity>
                    </View>
                </SafeHeadView>
                <View style={{
                    height: px(110),
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: px(3),
                    paddingHorizontal: ScreenUtil.scaleSize(30),
                }}>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CircleHeader
                                headerStyle={{ borderColor: '#894571' }}
                                imgSource={this.state.market.indexImg} />
                            {/* {
                                User.recruitIcon != '' ? <Image
                                    style={{
                                        width: 17,
                                        height: 17,
                                        position: 'relative',
                                        top: 19,
                                        left: -12,
                                    }}
                                    source={{ uri: User.recruitIcon }} />
                                    : <View />
                            } */}
                        </View>

                        <View style={{
                            marginLeft: 10,
                        }}>
                            <Text style={{
                                fontSize: 15,
                                color: '#ffffff',
                            }}>{this.state.market.name}</Text>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 4
                            }}>
                                <Text style={{
                                    fontSize: 12,
                                    color: '#ffffff',
                                }}>邀请码:  {this.state.market.inviteCode}</Text>
                                <TouchableOpacity onPress={this.copy.bind(this)}>
                                    <View style={Styles.copyBtn}>
                                        <Text style={Styles.copyTxt}>复制</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => this.goSetShopPage()}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: px(26),
                                color: '#fff'
                            }}>店铺设置</Text>
                            <Image style={[{
                                width: 8,
                                height: 15,
                                alignSelf: 'center',
                                marginLeft: px(12)
                            }]} source={pxRatio > 2.51 ? ImagesRes.mine_arrows_icon3x : ImagesRes.mine_arrows_icon2x} />
                        </View>
                    </TouchableOpacity>

                </View>
            </Background>
        )
    }

    copy() {
        Clipboard.setString(this.state.market.inviteCode)
        toast('邀请码已复制，可直接粘贴发送')
    }

    /**
     * 店铺流水信息
     * @returns {*}
     */
    _renderRpid() {
        const { amount, orderCount, sales } = this.state.running.today

        const orderCountObj = conversion(orderCount, 0, '单')
        const amountObj = conversion(amount, 2, '元')
        const salesObj = conversion(sales, 2, '元')

        return (
            <Background style={{
                width: deviceWidth,
                height: px(243),
                marginTop: -px(120)
            }}
            name="market_rpid_bg">
                <View style={{
                    paddingHorizontal: 20,
                    paddingTop: px(116),
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View style={Styles.headerTopBoxItem}>
                        <Text style={[Styles.ripdTxt, { marginRight: -9 * orderCountObj.unit.length }]}
                            onPress={() => this.goSearch(0)}
                            allowFontScaling={false}
                        >
                            {" " + orderCountObj.num + " "}
                            <Text style={Styles.unit}>{orderCountObj.unit}</Text>
                        </Text>
                        <Text style={Styles.ripTitle}
                            allowFontScaling={false}
                            onPress={() => this.goSearch(0)}
                        >
                            今日订单
                        </Text>
                    </View>
                    <View style={Styles.headerTopBoxItem}>
                        <Text style={[Styles.ripdTxt, { marginRight: -9 * amountObj.unit.length }]}
                            onPress={() => this.goAccumulatedEarnings(0)}
                            allowFontScaling={false}
                        >
                            {" " + amountObj.num + " "}
                            <Text style={Styles.unit}>{amountObj.unit}</Text>
                        </Text>
                        <Text style={Styles.ripTitle}
                            allowFontScaling={false}
                            onPress={() => this.goAccumulatedEarnings(0)}
                        >
                            今日收益
                        </Text>
                    </View>
                    <View style={Styles.headerTopBoxItem}>
                        <Text style={[Styles.ripdTxt, { marginRight: -9 * salesObj.unit.length }]}
                            onPress={() => this.goAccumulatedSales(0)}
                            allowFontScaling={false}
                        >
                            {" " + salesObj.num + " "}
                            <Text style={Styles.unit}>{salesObj.unit}</Text>
                        </Text>
                        <Text style={Styles.ripTitle}
                            allowFontScaling={false}
                            onPress={() => this.goAccumulatedSales(0)}
                        >
                            今日销售额
                        </Text>
                    </View>

                    {/* <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>

                        <Text style={Styles.ripdTxt}
                            allowFontScaling={false}
                            onPress={() => this.goIncome()}>
                            {" " + User.todayAmount + " "}

                        </Text>

                        <Text style={Styles.ripdTxt}
                            allowFontScaling={false}
                            onPress={() => this.goOrderListPage(1)}>
                            {" " + User.todayOrderCount + " "}
                        </Text>

                        <Text style={Styles.ripdTxt}
                            allowFontScaling={false}
                            onPress={() => this.goOrderListPage(1)}>
                            {" " + User.monthSales + " "}
                        </Text>

                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: 2,
                    }}>
                        <Text style={Styles.ripTitle}
                            allowFontScaling={false}
                            onPress={() => this.goIncome()}>
                            今日收入
                        </Text>

                        <Text style={Styles.ripTitle}
                            allowFontScaling={false}
                            onPress={() => this.goOrderListPage(1)}>
                            今日订单
                        </Text>

                        <Text style={Styles.ripTitle}
                            allowFontScaling={false}
                            onPress={() => this.goOrderListPage(1)}>
                            本月销售
                        </Text>

                    </View> */}

                </View>
            </Background>
        )
    }

    _searchFlowData(index) {
        const running = this.state.running

        switch (index) {
            case 0:
                return running.yesterday
            case 1:
                return running.month
            case 2:
                return running.total
            default:
                return running.yesterday
        }
    }

    /**
     * 店铺历史流水
     * @returns {*}
     */
    _renderRunningWater() {
        const tabs = ['昨日', '本月', '累计']

        return (
            <ScrollableTabView
                style={Styles.runningLayout}
                locked
                android={false}
                initialPage={0}
                onChangeTab={({ i }) => this.tabIndex = i}
                renderTabBar={(props) => <OwnerTab
                    tabs={tabs}
                />}
            >
                {
                    tabs.map((item, index) => {
                        const { amount, orderCount, sales } = this._searchFlowData(index)

                        const orderCountObj = conversion(orderCount, 0, '单')
                        const amountObj = conversion(amount, 2, '元')
                        const salesObj = conversion(sales, 2, '元')
                        const location = index + 1

                        return <View tabLabel={item} key={index} style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', marginHorizontal: -12, paddingTop: 25 }}>
                            <View style={Styles.headerTopBoxItem}>
                                <Text style={[Styles.ripdTxt, { marginRight: -9 * orderCountObj.unit.length }]}
                                    onPress={() => this.goSearch(location)}
                                    allowFontScaling={false}
                                >
                                    {" " + orderCountObj.num + " "}
                                    <Text style={Styles.unit}>{orderCountObj.unit}</Text>
                                </Text>
                                <Text style={Styles.ripTitle}
                                    allowFontScaling={false}
                                    onPress={() => this.goSearch(location)}
                                >
                                    订单数
                                </Text>
                            </View>
                            <View style={Styles.headerTopBoxItem}>
                                <Text style={[Styles.ripdTxt, { marginRight: -9 * amountObj.unit.length }]}
                                    onPress={() => this.goAccumulatedEarnings(location)}
                                    allowFontScaling={false}
                                >
                                    {" " + amountObj.num + " "}
                                    <Text style={Styles.unit}>{amountObj.unit}</Text>
                                </Text>
                                <Text style={Styles.ripTitle}
                                    allowFontScaling={false}
                                    onPress={() => this.goAccumulatedEarnings(location)}
                                >
                                    收益
                                </Text>
                            </View>
                            <View style={Styles.headerTopBoxItem}>
                                <Text style={[Styles.ripdTxt, { marginRight: -9 * amountObj.unit.length }]}
                                    onPress={() => this.goAccumulatedSales(location)}
                                    allowFontScaling={false}
                                >
                                    {" " + salesObj.num + " "}
                                    <Text style={Styles.unit}>{salesObj.unit}</Text>
                                </Text>
                                <Text style={Styles.ripTitle}
                                    allowFontScaling={false}
                                    onPress={() => this.goAccumulatedSales(location)}
                                >
                                    销售额
                                </Text>
                            </View>
                        </View>
                    })
                }
            </ScrollableTabView>
        )
    }

    /**
     * 订单中心
     * @returns {*}
     */
    _renderOrdersCenter() {
        return (
            <View style={[Styles.itemLayout, Styles.itemChildLayout]}>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => this.goOrderListPage(1)}
                    style={Styles.itemBtn}>
                    <Icon style={Styles.itemImg} name="icon-myOrder1" />
                    <Text allowFontScaling={false}
                        style={[Styles.itemTxt]}>
                        销售订单
                    </Text>
                </TouchableOpacity>

                {
                    User.openTuanYn == 'Y' &&
                    <TouchableOpacity activeOpacity={0.9} onPress={() => {
                        User.isLogin && TrackClick('market-top', 'market-topbutton-2', '店铺', '拼团管理');
                        User.isLogin && this.props.navigation.navigate('HtmlViewPage', {
                            webPath: 'https://dalingjia.com/xcgroupon/order-list',
                            img: ''
                        });
                        !User.isLogin && this.props.navigation.navigate('LoginPage', {});
                    }} style={Styles.itemBtn}>
                        <Icon
                            style={Styles.itemImg}
                            name="icon-myCoupon" />
                        <Text allowFontScaling={false} style={Styles.itemTxt}>拼团管理</Text>
                    </TouchableOpacity>
                }

                <TouchableOpacity activeOpacity={0.9}
                    onPress={() => this.goCustomerPage()}
                    style={Styles.itemBtn}>
                    <Icon
                        style={Styles.itemImg} name="icon-profile-returngoods" />
                    <Text
                        allowFontScaling={false}
                        style={Styles.itemTxt}>
                        售后管理
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * 绘制其他选项
     * @returns {*}
     */

    renderList() {
        let showGoldValid = this.state.showGoldValid;
        let renderArr = [
            { txt: '资金管理', icon: 'icon-profile-income', method: 'goIncome' },
            { txt: '精选销售', icon: 'icon-profile-invite', method: 'goRecruitPage' },
            { txt: '客户管理', icon: 'icon-profile-user', method: 'goFansPage' },
            { txt: '店铺设置', icon: 'icon-profile-shop', method: 'goSetShopPage' },
            { txt: '店铺指南', icon: 'icon-profile-guide', method: 'goGuide' },
            { txt: '金币核验', icon: 'icon-gold-valid', method: 'goGoldValid' },
            { txt: '素材管理', icon: 'icon-profile-matter', method: 'goMatter' }
        ];
        if (!showGoldValid) {
            renderArr.splice(5, 1);
        }
        return <View style={Styles.itemLayout_}>
            {
                renderArr.map((i, index) => {
                    return <TouchableOpacity
                        key={index}
                        activeOpacity={0.9}
                        onPress={this[i.method].bind(this)}
                        style={[Styles.itemBtn_, base.line]}>
                        <Icon style={Styles.itemImg} name={i.icon} />
                        <Text
                            allowFontScaling={false}
                            style={Styles.itemTxt}>
                            {i.txt}
                        </Text>
                    </TouchableOpacity>
                })
            }
        </View>
    }

    _renderOtherItem() {
        return (
            <View style={[Styles.itemLayout, { marginBottom: 12 }]}>
                <View style={Styles.itemChildLayout}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goIncome()}
                        style={Styles.itemBtn}>
                        <Icon style={Styles.itemImg} name="icon-profile-income" />
                        <Text allowFontScaling={false}
                            style={Styles.itemTxt}>
                            资金管理
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goRecruitPage()}
                        style={Styles.itemBtn}>
                        <Icon style={Styles.itemImg} name="icon-profile-invite" />
                        <Text allowFontScaling={false} style={Styles.itemTxt}>精选销售</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goFansPage()}
                        style={Styles.itemBtn}>
                        <Icon style={Styles.itemImg}
                            name="icon-profile-user" />
                        <Text allowFontScaling={false} style={Styles.itemTxt}>客户管理</Text>
                    </TouchableOpacity>

                </View>

                <View style={[Styles.itemChildLayout, { marginTop: 25 }]}>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goSetShopPage()}
                        style={Styles.itemBtn}>
                        <Icon style={Styles.itemImg}
                            name="icon-profile-shop" />
                        <Text allowFontScaling={false} style={Styles.itemTxt}>店铺设置</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goGuide()}
                        style={Styles.itemBtn}>
                        <Icon style={Styles.itemImg} name="icon-profile-guide" />
                        <Text allowFontScaling={false} style={Styles.itemTxt}>店铺指南</Text>
                    </TouchableOpacity>

                    {this.state.showGoldValid ? <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goGoldValid()}
                        style={Styles.itemBtn}>
                        <Icon style={Styles.itemImg} name="icon-gold-valid" />
                        <Text allowFontScaling={false} style={Styles.itemTxt}>金币核验</Text>
                    </TouchableOpacity> : <View style={[Styles.itemBtn]}>
                        <Text allowFontScaling={false} style={[Styles.itemTxt, { color: 'transparent' }]}>布局占位</Text>
                    </View>}
                </View>
            </View>
        )
    }

    /**
     * 广告
     * @returns {*}
     * @private
     */
    // _renderAD() {
    //     return (
    // <View style={[base.inline, { paddingHorizontal: 12 }]}>
    //     <TouchableWithoutFeedback onPress={() => this.goInvitePage()}>
    //         <Image style={Styles.bannerImgBox}
    //             source={{ uri: this.state.bannerImg }} />
    //     </TouchableWithoutFeedback>
    //     <TouchableWithoutFeedback onPress={() => this.goInvitePage2()}>
    //         <Image style={Styles.bannerImgBox}
    //             source={{ uri: this.state.vipImg }} />
    //     </TouchableWithoutFeedback>
    // </View>
    //     )
    // }
    /**
     * 广告
     * @returns {*}
     * @private
     */
    _renderAD() {
        return <View style={[base.inline, { padding: 12, paddingBottom: 0, justifyContent: 'space-between' }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => this.goInvitePage()}>
                <Background style={[Styles.bgHeight, { width: px(275) }]} resizeMode={'cover'} name="select">
                    <Text style={Styles.introduction}>分享精选商品</Text>
                </Background>
            </TouchableOpacity>
            <View style={[base.inline]}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.goInvitePage2()}>
                    <Background style={[Styles.bgHeight, { width: px(265) }]} resizeMode={'cover'} name="invitation">
                        <Text style={Styles.introduction}>海量优惠券免费发放</Text>
                    </Background>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.goFansPage()}>
                    <Background style={[Styles.bgHeight, { width: px(146) }]} resizeMode={'cover'} name="have">
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={[Styles.whiteBoldType, { fontSize: this._vipFontSize(), marginTop: 16 }]}>{User.vipCount || 0}</Text>
                            <Text style={[Styles.whiteBoldType, { fontSize: px(18) }]}>(人)</Text>
                        </View>
                        <Text style={Styles.introduction}>店铺vip</Text>
                    </Background>
                </TouchableOpacity>
            </View>
        </View>
    }

    _vipFontSize() {
        let size = 0

        switch ((User.vipCount || 0).toString().length) {
            case 1:
                size = 52
                break
            case 2:
                size = 48
                break
            case 3:
                size = 48
                break
            case 4:
                size = 36
                break
            case 5:
                size = 32
                break
            default:
                break;
        }

        return px(size)
    }

    /**
     * 热销商品素材标题
     */
    _renderHotSellingMaterial() {
        if (!this.state.materialList.length) {
            return null
        }
        return (
            <View style={Styles.hotSellingBox}>
                <Icon name={'icon-hot-selling-material-left'} width={px(35)} height={px(18)} />
                <Text style={Styles.hotSellingText}>热销商品素材</Text>
                <Icon name={'icon-hot-selling-material-right'} width={px(35)} height={px(18)} />
            </View>
        )
    }

    render() {
        return (
            <View style={Styles.container}>
                {
                    User.isLogin ? <FlatList
                        ref="flatlist"
                        onScroll={(e) => this._onScroll(e.nativeEvent)}
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        data={this.state.materialList}
                        extraData={this.state}
                        initialNumToRender={1}
                        refreshControl={
                            <RefreshControl
                                tintColor="#fff"
                                colors={["#fff"]}
                                refreshing={this.state.isrefresh}
                                onRefresh={() => this.onRefresh()}
                            />
                        }
                        ListHeaderComponent={
                            <View>
                                {this._renderHeader()}

                                {this._renderRpid()}

                                {this._renderRunningWater()}

                                {this._renderAD()}

                                {this._renderOrdersCenter()}

                                {/* {this._renderOtherItem()} */}

                                {this.renderList()}

                                {this._renderHotSellingMaterial()}
                            </View>
                        }
                        renderItem={({ item, index }) =>
                            <MatterItem
                                shouldUpdate={true}
                                navigation={this.props.navigation}
                                item={item}
                                index={index}
                                show={item.show}
                                listType="marketBottom"
                                collect={this.collect}
                                share={this.shareMatter}
                                lookBigImg={this.lookBigImg}//查看大图
                                enterFull={this.enterFull}//查看视频
                                showPopover={this.showPopover}//长按复制文本
                                save={this.save}//保存素材
                                setLay={e => this.setLay(e, index)}
                            />
                        }
                        onEndReachedThreshold={0.5}
                        onEndReached={() => this.next()}
                        keyExtractor={(material, index) => `{material.transmitNumber}-${index}`}
                        ListEmptyComponent={null}
                        ListFooterComponent={<View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", marginBottom: px(30) }}>
                            {(this.state.materialList || []).length > 0 && <Text style={{
                                textAlign: 'center',
                                fontSize: px(28),
                                marginLeft: px(30),
                                marginRight: px(30),
                                color: "#ccc"
                            }}>{this.state.isNext ? '加载中...' : '别扯了，到底啦'}</Text>}
                        </View>}
                    /> : <View />
                }
                <ShareView ref="shareView"
                    navigation={this.props.navigation}
                    getQrCode={() => this.getQrCode()}
                    types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
                    {User.isLogin && !User.vip && <View style={Styles.modalHead}>
                        <Text style={Styles.modalTxt1} allowFontScaling={false}>分享店铺</Text>
                        <Text style={Styles.modalTxt2} allowFontScaling={false}>只要你的好友通过你的分享购买商品,</Text>
                        <Text style={Styles.modalTxt2} allowFontScaling={false}>你就能赚到利润收入哦～</Text>
                    </View>}
                    {User.vip && <View style={Styles.modalHead}>
                        <Text style={Styles.modalTxt1} allowFontScaling={false}>分享好店:{this.state.market.name}</Text>
                    </View>}
                </ShareView>
                <ShareModal
                    check={this.check.bind(this)}
                    ref="shareModal"
                    successCall={() => { }}
                />
                <ZoomImgModal ref="zoomImgModal" />
                <DialogModal
                    ref='dialog'
                    bodyStyle={Styles.alertBody}
                />
                <Popover
                    style={{ backgroundColor: '#000' }}
                    isVisible={this.state.isPopover}
                    fromRect={this.state.buttonRect}
                    //placement={'auto'}
                    arrowSize={{ width: px(50), height: px(20) }}
                    onClose={() => {
                        this.setState({ isPopover: false });
                    }} >
                    <Text onPress={() => {
                        Clipboard.setString(this.state.copyTxt);
                        this.setState({ isPopover: false }, () => {
                            toast('复制成功')
                        });
                    }} style={{ color: '#fff', flex: 1, fontSize: px(32), textAlign: 'center' }} allowFontScaling={false}>复制</Text>
                </Popover>
                {
                    this.state.scrollTop &&
                    <TouchableWithoutFeedback onPress={() => {
                        this.toTop()
                    }}>
                        <Animated.View style={[{
                            position: 'absolute', right: px(20),
                            bottom: isIphoneX() ? px(165) : px(105),
                            opacity: this.state.opacityToTop
                        }]}>
                            <Icon
                                name="icon-toTop"
                                style={{ width: px(100), height: px(100) }}
                            />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                }
                <Loading ref='loading' />
                <LoadingRequest text="正在保存" status={this.state.requestStatus} />
            </View>
        )
    }
    itemHeight = px(500)
    layoutArr = []
    async next() {
        if (this.isMaterialLoad || !this.hasNextMaterial) return

        let h = this.itemHeight
        const result = await this.getMaterial()

        this.layoutArr.push({ h });
        this.setState({
            materialList: [...this.state.materialList, ...result],
            isNext: this.hasNextMaterial
        })
    }

    startPage = 1
    isMaterialLoad = false
    hasNextMaterial = true
    getMaterial = async (page) => {
        if (!this.hasNextMaterial || this.isMaterialLoad) return []
        this.isMaterialLoad = true
        try {
            this.startPage = page || this.startPage
            const result = await get(`/xczin/front/subjectRecommend/subjectRecommendList.do?start=${page || this.startPage}`)

            this.hasNextMaterial = result && result.next || false
            this.shouldUpdate = true
            this.showImage(0)
            this.startPage++
            this.isMaterialLoad = false
            return  result.dataItem || []
        } catch (error) {
            this.isMaterialLoad = false
            toast(error.message);
            return []
        }
    }

    /**
     * 跳转到 店铺设置 页面
     */
    goSetShopPage() {
        User.isLogin && this.props.navigation.navigate('SetShopPage', {
            callback: () => {
                this.onRefresh()
            }
        });
    }

    goIncome() {
        User.isLogin && this.props.navigation.navigate('IncomeManagePage', {});
    }

    goOrderListPage(type) {
        if (User.isLogin) {
            if (type == 0) {
                TrackClick('market-top', 'market-topbutton-1', '个人中心页', '我的订单');
            }
            this.props.navigation.navigate('OrderListPage', {
                type: type
            });
        } else {
            this.goLoginPage();
        }
    }

    goAccumulatedEarnings(dimension) {
        User.isLogin && this.props.navigation.navigate('AccumulatedEarnings', {
            dimension
        })
    }

    goAccumulatedSales(dimension) {
        User.isLogin && this.props.navigation.navigate('AccumulatedSales', {
            dimension
        })
    }

    goCustomerPage() {
        // User.isLogin && this.props.navigation.navigate('CustomerServicePage', {})
        User.isLogin && this.props.navigation.navigate('AfterSaleManagement', {})
    }

    goRecruitPage() {
        User.isLogin && this.props.navigation.navigate('RecruitPage', {});
    }

    goFansPage() {
        User.isLogin && this.props.navigation.navigate('FansPage', {});
    }

    async goGuide() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '店铺指南',
            src: cfg.images['recruit']
        });
    }

    goGoldValid() {
        User.isLogin && this.props.navigation.navigate('GoldValid', {});
    }

    goInvitePage() {
        User.isLogin && this.props.navigation.navigate('SpecialPage', {});
    }

    goInvitePage2() {
        User.isLogin && this.props.navigation.navigate('InvitationVipPage', {});
    }

    goSearch(index) {
        let startDate = ''
        let endDate = ''
        let now = Date.now()
        let nowDate = new Date()

        switch (index) {
            case 0:
                startDate = dataFormat(nowDate)
                endDate = dataFormat(nowDate)
                break
            case 1:
                nowDate.setDate(nowDate.getDate() - 1)
                startDate = dataFormat(nowDate)
                endDate = startDate
                break
            case 2:
                startDate = dataFormat(nowDate, 'YYYY-MM') + '-01'
                endDate = dataFormat(nowDate)
                break
        }

        this.props.navigation.navigate('SearchOrderPage', {
            type: 1,
            startDate,
            endDate,
            immediately: true
        })
    }

    goMatter() {
        User.isLogin && this.props.navigation.navigate('MyMatterList', {});
    }
    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {
            actionType: 'tabType'
        })
    }

    /**
     * 店铺分享
     */
    share = () => {
        this.refs.shareView.Share({
            title: `给您推荐一个不错的店铺:{shopName}`,
            desc: this.state.market.desc,
            url: `${touchBaseUrl}/`,
            img: this.state.market.indexImg,
            link: `${touchBaseUrl}/`,
            track: (type) => {
                TrackClick('Market-med', 'Market-ShareShop', '个人中心页', `分享店铺-${type}`);
            }
        });
    }

    /**
     * 实现店铺下载二维码
     */
    async getQrCode() {
        let res1 = await Api.createQrcodeV1();
        return res1.showUrl;
    }
    isCollect = false;

    /**
     * 收藏/取消收藏
     */
    collect = async (item, type) => {
        if (this.isCollect) return;
        this.isCollect = true;
        if (type == 0 && this.props.listType == 'collect') {
            this.refs.dialogModal_.open({
                content: [`确定取消收藏吗`],
                btns: [{
                    txt: '先留着',
                    click: () => {
                        this.isCollect = false;
                    }
                }, {
                    txt: '确定取消',
                    click: async () => {
                        this.toCollect(item, type);
                    }
                }]
            });
            return;
        } else {
            this.toCollect(item, type);
        }
    }

    shouldUpdate = false;
    async toCollect(item, type) {
        this.isCollect = false;
        try {
            let res = await request.post('/xczin/front/collet/saveOrUpdateSubject.do', {
                subjectId: item.subjectId,
                type: type
            })
            this.shouldUpdate = true;
            this.state.materialList.forEach((i, index) => {
                if (i.subjectId == item.subjectId) {
                    i.isCollet = type;
                    return;
                }
            });
            this.setState({
                materialList: this.state.materialList
            });
            if (type == 1) {
                toast('收藏成功~');
            } else if (type == 0) {
                toast('取消成功~');
            }
            this.shouldUpdate = false
        } catch (e) {
            toast(e.message);
            if (e.message == "该素材已不存在") { //素材已被作者删除
                this.deleteList(item);
                this.shouldUpdate = true;
                return;
            }
        }
    }


    /**
     * 分享素材
     */
    async check(content, goods) {
        if (!goods) return;
        const shop = await getShopDetail();
        let inviteCode = shop.inviteCode, url = '';
        if (goods.id) {
            url = `${touchBaseUrl}/goods-detail?id=${goods.id}&inviteCode=${inviteCode}`;
        } else {
            url = `${touchBaseUrl}/goods-detail?sku=${goods.sku}&inviteCode=${inviteCode}`;
        }
        if (!/inviteCode/.test(url)) {
            url += "&inviteCode=" + shop.inviteCode;
        }
        let txt = content + ' ' + url
        Clipboard.setString(txt);
        toast('文字和链接已复制到剪切板，请直接粘贴分享')
        this.statistical()
    }

    goods = {}

    /**
     *安卓多图分享，视频分享，ios视频分享弹层，ios多图分享直接吊起原生分享
     */
    shareMatter = async (obj) => {
        //TODO 埋点
        let goods = obj.goodList.sku ? obj.goodList : this.props.goods;

        this.goods = obj

        if (!obj || !obj.subjectContent[0] || !obj.subjectContent[0].img_list || obj.subjectContent[0].img_list.length == 0) {
            return;
        }
        if (os && obj.contentType == 1) { //ios分享图片
            if (!this.isInstalled) {
                toast('没有安装微信');
                return;
            }
            await this.check(obj.subjectContent[0].content, goods)
            this.refs.loading.open()
            let images = []
            obj.subjectContent[0].img_list.forEach(item => {
                images.push(item.subject_img_url_http)
            })
            WeChat.shareImagesToSession({
                description: 'shareMatter',
                images: images.join('|')
            }).then((res) => {
                // this.statistical()
                this.refs.loading.close()
            }).catch((res) => {
                this.refs.loading.close()
                toast('出错了，请稍后再试')
            })
        } else {
            this.refs.shareModal && this.refs.shareModal.share(obj, goods)
        }
    }

    statistical(obj) {
        if (!this.goods.subjectId) return

        request.get(`/xczin/front/subjectRecommend/recommendSubjectCounter.do?id=${this.goods.subjectId}`)
        request.get('/xczin/front/subjectRecommend/hotSubjectCounter.do')
    }

    /**
     *保存图文
     */
    save = async (type, item) => {
        //TODO 埋点
        let image = item.subjectContent[0].img_list, txt = item.subjectContent[0].content
        if (type == 1) {
            this.saveImage(image, txt);
        } else {
            await this.saveVideo(item);
        }
    }

    saveImage = (image, txt) => {
        this.setState({
            requestStatus: true
        }, () => {
            try {
                image.forEach((item, i) => {
                    AppModule.saveImageToAlbum(item.subject_img_url_http, (ignore, res) => {
                        if (res && i == image.length - 1) {
                            toast('保存并复制完成');
                            this.setState({
                                requestStatus: false
                            })
                            //Platform.OS == 'ios' && toast('保存成功');
                        } else {
                            //Platform.OS == 'ios' && toast('保存失败');
                        }
                    });
                })
                Clipboard.setString(txt);

            } catch (e) {
                toast('保存失败，请稍后重试');
                this.setState({
                    requestStatus: false
                })
            }
        })
    }

    saveVideo = async (item) => {
        let obj = item.subjectContent[0].img_list[0];
        //分为从商品列表传过来和店铺列表关联的goods

        let goodsName = item.goodsName.replace(/\//g, '') || '',
            video = obj.subject_video_url_http,
            currentTime = new Date().getTime(),
            content = item.subjectContent[0].content;
        let videoFileName = `${goodsName}${currentTime}.mp4`
        this.setState({
            requestStatus: true
        }, () => {
            try {
                AppModule.saveVideoToAlbum(video, videoFileName).then((res) => {
                    if (res) {
                        Clipboard.setString(content);
                        toast('保存并复制完成');
                    }
                    this.setState({
                        requestStatus: false
                    });
                }).catch((res) => {

                    toast('视频下载失败，可能是您的网络不稳定，请稍候重试')
                    this.setState({
                        requestStatus: false
                    });
                });
            } catch (e) {
                toast('视频下载失败，可能是您的网络不稳定，请稍候重试');
                this.setState({
                    requestStatus: false
                });
            }
        })
    }

    /**
     *查看大图
     */
    lookBigImg = (index, list) => {
        this.refs.zoomImgModal && this.refs.zoomImgModal.open(index, list);
    }

    /**
     *长按复制文字
     */
    showPopover = (copyTxt, re) => {
        //TODO 埋点
        re.measure((ox, oy, width, height, px, py) => {
            this.setState({
                copyTxt: copyTxt,
                isPopover: true,
                buttonRect: { x: px, y: py, width: width, height: height }
            });
        });

    }

    /**
     *播放视频
     */
    enterFull = (sub) => {
        let src = sub.subject_video_url_http,
            size = sub.subject_video_size;
        if (this.state.net != 'WIFI') {
            const tips = size ? `当前为移动网络，播放将消耗流量${size}` : '当前为移动网络，播放将消耗流量'
            this.refs.dialog.open({
                content: [tips],
                btns: [{
                    txt: '放弃播放',
                    click: () => { }
                }, {
                    txt: '继续播放',
                    click: async () => {
                        if (src) {
                            this.props.navigation.navigate('PlayVideoPage', { src })
                        } else {
                            toast('视频地址不合法')
                        }
                    }
                }]
            });
            return;
        }
        if (src) {
            this.props.navigation.navigate('PlayVideoPage', { src })
        } else {
            toast('视频地址不合法')
        }
    }

    toTop = () => {
        setTimeout(() => {
            this.refs.flatlist && this.refs.flatlist.scrollToOffset({offset:0, animated:true})
        }, 100);
    }


    _onScroll = (e) => {
        const y = e.contentOffset.y;
        this.setScroll(y)

        let index = 0;
        let curr = 0;
        while (y > curr) {
            if (!this.layoutArr[index]) break;
            curr += this.layoutArr[index];
            index++;
        }
        this.showImage(index);
    }

    showImage(index) {
        if (this.timer) return;
        this.timer = setTimeout(() => {
            let list = this.state.materialList.filter((item, i) => {
                item.show = i >= index - 2 && i < index + 3
                return item;
            })
            this.setState({ materialList: list })
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 200);
    }

    setLay(e, index) {
        this.layoutArr[index] = e.layout.height
    }

    scrollTop = 0;
    switchScroll = false;
    switchShow = false;
    setScroll(top) {
        if (this.scrollTop > 1000) {
            this.state.opacityToTop.stopAnimation();
            Animated.timing(this.state.opacityToTop, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear
            }).start()
            if (!this.switchShow) {
                this.setState({
                    scrollTop: true
                })
                this.switchShow = true;
            }
        } else {
            if (this.switchShow) {
                this.setState({
                    scrollTop: false
                })
                this.switchShow = false;
            }
        }

        if (this.scrollTop > top) {
            //xia  opacityToTop
            if (!this.switchScroll) {
                this.state.opacityToTop.stopAnimation();
                Animated.timing(this.state.opacityToTop, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.linear
                }).start()
                this.switchScroll = true;
                return;
            }
        } else {
            //shang
            if (this.switchScroll) {
                this.state.opacityToTop.stopAnimation();
                Animated.timing(this.state.opacityToTop, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear
                }).start()
                this.switchScroll = false;
                return;
            }
        }
        this.scrollTop = top;
    }

}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f3f6'
    },

    bannerImgBox: {
        width: px(340),
        height: px(180),
        marginTop: 12,
        marginHorizontal: 6,
        borderRadius: 6,
    },

    headerTopBoxItem: {
        flex: 1,
        height: 60,
        alignItems: 'center',
    },
    itemLayout: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 6,
        paddingHorizontal: px(84),
        paddingVertical: px(40)
    },
    runningLayout: {
        height: px(248),
        backgroundColor: '#FFF',
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 6,
        alignItems: 'center'
    },
    itemChildLayout: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        //backgroundColor: '#000'
    },
    itemTxt: {
        fontSize: px(22),
        color: '#666',
        marginTop: 10,
    },

    ripdTxt: {
        fontWeight: 'bold',
        fontSize: px(36),
        color: '#222',
    },

    ripTitle: {
        marginTop: 5,
        fontSize: px(22),
        color: '#666',
    },

    itemBtn: {
        alignItems: 'center',
    },

    itemImg: {
        width: 25,
        height: 25,
    },

    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
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
    },
    copyBtn: {
        borderWidth: px1,
        borderColor: "#fff",
        width: 35,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        marginLeft: 5,
    },
    copyTxt: {
        color: "#fff",
        fontSize: 10,
        lineHeight: Platform.OS === "ios" ? 11 : 13,
    },
    unit: {
        color: "#222",
        fontSize: 9,
        fontWeight: 'normal'
    },
    introduction: {
        fontSize: px(22),
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: px(20)
    },
    bgHeight: {
        height: px(230),
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    whiteBoldType: {
        color: '#fff',
        fontWeight: 'bold',
    },
    itemLayout_: {
        width: originalWidth,
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 6,
        paddingHorizontal: px(22),
        paddingVertical: px(13)
    },
    itemBtn_: {
        width: px(218),
        marginVertical: px(22)
    },
    hotSellingBox: {
        marginBottom: px(10),
        marginTop: px(58),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hotSellingText: {
        fontSize: px(30),
        color: '#222222',
        marginHorizontal: px(20),
    },
    alertBody: {
        width: px(541),
        height: px(152),
        alignItems: 'center',
        justifyContent: 'center'
    }
});
