'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    RefreshControl,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Linking,
    Platform,
    NativeModules,
    Modal,
    ImageBackground,
    PixelRatio,
} from 'react-native';

import { observer } from "mobx-react";
import util_tools from '../../utils/tools'

const AppModule = NativeModules.AppModule;
import { deviceWidth, isIphoneX, px } from '../../utils/Ratio';
import request, { touchBaseUrl } from '../../services/Request';
import { User, getUser, getShopDetail } from '../../services/Api';
import { LoadingRequest } from '../../widgets/Loading';
import { show as toast } from '../../widgets/Toast';
import { config } from '../../services/Constant';
import { TrackClick } from "../../services/Track";
import { ImagesRes } from "../../utils/ContentProvider";
import AnimateNumber from "../common/AnimateNumber";
import HeaderImage from "../common/HeaderImage";
import Background from '../../UI/lib/Background';
import Icon from '../../UI/lib/Icon'
import Span from "../../UI/lib/Span"
import base from '../../styles/Base'
import Badge from '../../UI/lib/Badge'
import {TopMsg} from "../common/Header";
import Event from "../../services/Event";
import {getUnReadMsg} from "../../services/Push";

const pxRatio = PixelRatio.get();  // 屏幕像密度

const PERINFORMATION = "个人资料",
    MYBALANCE = "我的余额",
    GROUP = "我的拼团",
    ADDRESS = "收货地址",
    PAGER = '支付人信息';



let TopHeader = class extends React.Component {

    constructor(props) {
        super(props);
    }

    goMessageCenter() {
        this.props.navigation.navigate('MessageCenter', {});
    }

    render() {
        return <Background style={TopHeaderStyle.bg}
            name={User.vip ? "vip-top-bg" : "mine_header_bg"}
            resizeMode={'cover'}>
            <View style={{ paddingTop: isIphoneX() ? px(50) : 0 }}>
                {Platform.OS === 'ios' && <View style={{
                    width: deviceWidth,
                    height: px(44),
                }} />}
                <View style={TopHeaderStyle.headerView}>
                    <TopMsg cl={true} navigation={this.props.navigation} />

                    <TouchableOpacity onPress={() => this._jumpToSetting()}>
                        <Icon style={TopHeaderStyle.btn_setting} name="icon-setting" />
                    </TouchableOpacity>
                </View>
                {!User.isLogin && <View style={Styles.unLoginView}>
                    <TouchableWithoutFeedback onPress={() => this.goLoginPage()}>
                        <View style={Styles.login}>
                            <Text style={TopHeaderStyle.btn_login_txt}>
                                登录
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>}
                {User.isLogin && !User.vip && <TouchableWithoutFeedback
                    onPress={() => this.props._jumpToPage(PERINFORMATION)}>
                    <View style={Styles.headerProView}>
                        <View style={{height: px(110),
                            flexDirection: 'row',
                            justifyContent: 'space-between'}}>
                            <View style={Styles.headerTouch}>
                                <HeaderImage imgSource={User.headImgUrl} />
                                <Span style={Styles.headerTxt}>{User.name}</Span>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 13, color: '#fff', marginRight: 6}}>个人资料</Text>
                                <Icon style={[Styles.icon_arrow, { alignSelf: 'center', marginRight: px(30) }]} name="icon-arrowRed" />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>}
                {User.isLogin && User.vip && <TouchableWithoutFeedback
                    onPress={() => this.props._jumpToPage(PERINFORMATION)}>
                    <View style={Styles.headerProView}>
                        <View style={{height: px(110),
                            flexDirection: 'row',
                            justifyContent: 'space-between'}}>
                            <View style={Styles.headerTouch}>
                                <HeaderImage imgSource={User.headImgUrl} />
                                <View>
                                    <Text style={Styles.headerTxt}>{User.name}</Text>
                                    <Icon style={TopHeaderStyle.label} name="vip-logo" />
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 13, color: '#fff', marginRight: 6}}>个人资料</Text>
                                <Icon style={[Styles.icon_arrow, { alignSelf: 'center', marginRight: px(30) }]} name="icon-right" />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>}
            </View>
        </Background>
    }
    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {});
    }
    _jumpToSetting() {
        this.props.navigation.navigate('SettingPage', {});
    }
}

const TopHeaderStyle = StyleSheet.create({
    bg: {
        width: deviceWidth,
        height: isIphoneX() ? px(350) : Platform.OS === 'ios' ? px(300) : px(256)
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: deviceWidth,
        height: px(76),
    },
    btn_setting: {
        width: px(44),
        height: px(44),
        marginRight: px(30)
        // marginLeft: 60,
        // marginVertical: 4,
    },
    message_center: {
        width: px(104),
        height: 39,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn_login_txt: {
        color: '#d0648f',
        fontSize: px(30),
    },
    label: {
        marginTop: 5,
        marginLeft: 10,
        width: 44,
        height: 15
    }
});

/**
 * 我的 页面
 */
export default observer(class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bannerImg: '',
            requestStatus: false,
            share_status: false,
            share_img: '',
            isrefresh: false,
            isShow: false,
            shop: '',
            withdrawalsAmount: 0.00,
        };
    }
    /**
     * 我的资产
     */
    _renderProperty() {
        return (
            <View style={Styles.propertyView}>

                {
                    User.isLogin && !User.vip ? <TouchableOpacity
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: px(40),
                        }}
                        activeOpacity={0.9}
                        onPress={() => {
                            TrackClick('Mine-top', 'Mine-topbutton-1', '个人中心页', '我的余额');
                            this._jumpToPage(MYBALANCE);
                        }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {
                                util_tools.isRealNum(User.withdrawalsAmount) ?
                                    <AnimateNumber style={[Styles.ripdTxt, { alignSelf: 'flex-end' }]}
                                        value={User.withdrawalsAmount}
                                        interval={15}
                                        allowFontScaling={false}
                                        formatter={(val) => {
                                            return parseFloat(val).toFixed(2)
                                        }} />
                                    : <Text style={Styles.ripdTxt}
                                        allowFontScaling={false}>
                                        {"--"}
                                    </Text>
                            }
                            <Span allowFontScaling={false}
                                style={Styles.unitTxt}>{"元"}</Span>
                        </View>

                        <Text style={Styles.itemTxt}
                            allowFontScaling={false}>
                            我的余额
                        </Text>
                    </TouchableOpacity>
                        : <View />
                }

                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: px(40),
                    }}
                    activeOpacity={0.9}
                    onPress={() => {
                        if (User.isLogin) {
                            TrackClick('Mine-top', 'Mine-topbutton-2', '个人中心页', '我的金币');
                            this.props.navigation.navigate('GoldPage', {
                                callback: () => {
                                    this.onRefresh()
                                }
                            });
                        } else {
                            this.goLoginPage()
                        }

                    }}>

                    {
                        User.isLogin ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={Styles.ripdTxt}
                                allowFontScaling={false}>
                                {" " + User.stunnerTotalAmount + " "}
                            </Text>

                            <Text allowFontScaling={false}
                                style={[Styles.unitTxt]}>{"元"}</Text>
                        </View>
                            : <Span style={Styles.unitTxt}>{"-- 元"}</Span>
                    }


                    <Text style={Styles.itemTxt}
                        allowFontScaling={false}>
                        我的金币
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: px(40),
                    }}
                    activeOpacity={0.9}
                    onPress={() => {
                        if (User.isLogin) {
                            TrackClick('Mine-top', 'Mine-topbutton-2', '个人中心页', '我的代金券');
                            this.props.navigation.navigate('CouponPage', {
                                callback: () => {
                                    this.onRefresh()
                                }
                            });
                        } else {
                            this.goLoginPage();
                        }

                    }}>
                    {
                        User.isLogin ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={Styles.ripdTxt} allowFontScaling={false}>
                                {" " + User.couponCount + " "}
                            </Text>
                            <Span style={Styles.unitTxt}>{"张"}</Span>
                        </View>
                            : <Span style={Styles.unitTxt}>{"-- 张"}</Span>
                    }
                    <Text style={Styles.itemTxt}
                        allowFontScaling={false}>
                        我的代金券
                    </Text>
                </TouchableOpacity>

            </View>
        )
    }
    /**
     * 余额不为0并且未设置余额密码提示
     */
    renderPswTip() {
        let isPaySet = User.balancePayPasswordSet == 0 && User.withdrawalsAmount > 0
        
        if (!(User.isLogin && !User.vip && isPaySet)) return null;
        return <View style={tipStyles.contain}>
            <Icon name="triangle" style={tipStyles.triangle} />
            <TouchableWithoutFeedback onPress={() => this.goAddPswPage()}>
                <View style={[tipStyles.box, base.inline_between]}>
                    <View style={base.inline_left}>
                        <Icon name="pswTip" style={tipStyles.pswTip}/>
                        <Text allowFontScaling={false} style={tipStyles.txt}>
                            为保证账户安全，请设置余额支付密码
                        </Text>
                    </View>
                    <View style={base.inline_left}>
                        <Text allowFontScaling={false} style={[tipStyles.txt, tipStyles.line]}>
                            |
                        </Text>
                        <Text allowFontScaling={false} style={[tipStyles.txt]}>
                            立即设置
                        </Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    }
    
    goAddPswPage() {
        this.props.navigation.navigate('AddPswPage', {
            call: () => {
                this.onRefresh()
            }
        });
    }
    /**
     * 我的订单
     */
    _renderOrder() {
        return (
            <View style={Styles.orderView}>
                <TouchableWithoutFeedback onPress={() => this.goOrderListPage(0, 0)}>
                    <View style={Styles.orderTopItem}>
                        <Span style={{
                            fontSize: px(30),
                            color: '#222222',
                        }}>
                            我的订单
                        </Span>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Span style={{
                                fontSize: px(26),
                                color: '#858385'
                            }}>全部订单</Span>
                            <Icon style={[Styles.icon_arrow, { marginLeft: px(12) }]} name="icon-mine-arrows-gray" />
                            {/* <Image style={[Styles.icon_arrow, {marginLeft: px(12)}]}
                                source={pxRatio > 2.51 ? ImagesRes.mine_arrows_gray_icon3x : ImagesRes.mine_arrows_gray_icon2x}/> */}
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                {/** 分割线*/}
                <View style={Styles.divLine} />

                <View style={Styles.orderBottom}>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goOrderListPage(0, 1)}
                        style={Styles.itemBtn}>
                        <Image style={Styles.itemImg}
                            source={pxRatio > 2.51 ? ImagesRes.mine_unpaid3x : ImagesRes.mine_unpaid2x} />
                        <Text allowFontScaling={false}
                            style={Styles.orderText}>
                            待支付
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goOrderListPage(0, 2)}
                        style={Styles.itemBtn}>
                        <Image style={Styles.itemImg}
                            source={pxRatio > 2.51 ? ImagesRes.mine_unshipments3x : ImagesRes.mine_unshipments2x} />
                        <Text allowFontScaling={false}
                            style={Styles.orderText}>
                            待发货
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goOrderListPage(0, 3)}
                        style={Styles.itemBtn}>
                        <Image style={Styles.itemImg}
                            source={pxRatio > 2.51 ? ImagesRes.mine_unReceiving3x : ImagesRes.mine_unReceiving2x} />
                        <Text allowFontScaling={false}
                            style={Styles.orderText}>
                            待收货
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.goOrderListPage(0, 4)}
                        style={Styles.itemBtn}>
                        <Image style={Styles.itemImg}
                            source={pxRatio > 2.51 ? ImagesRes.mine_afterSale3x : ImagesRes.mine_afterSale2x} />
                        <Text allowFontScaling={false}
                            style={Styles.orderText}>
                            退货售后
                        </Text>
                    </TouchableOpacity>

                </View>


            </View>
        )
    }

    /**
     * 我的拼团，收货地址
     */
    _renderGroupAndLocation() {
        return (
            <View style={Styles.groupView}>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        this._jumpToPage(GROUP);
                    }}>

                    <View style={Styles.groupItem}>

                        <View style={Styles.groupChild}>
                            <Image style={Styles.iconImg}
                                resizeMode={'contain'}
                                source={pxRatio > 2.51 ? ImagesRes.mine_group_icon3x : ImagesRes.mine_group_icon2x} />
                            <Span style={{
                                fontSize: px(30),
                                color: '#222222',
                                marginLeft: px(20),
                            }}>
                                我的拼团
                            </Span>
                        </View>

                        <View style={Styles.groupChild}>

                            {
                                User.isLogin && User.grouponCount > 0 ? <Span style={{
                                    fontSize: px(26),
                                    color: '#858385'
                                }}>
                                    {`${User.grouponCount}个参团中`}
                                </Span>
                                    : null
                            }

                            <Icon style={[Styles.icon_arrow, { marginLeft: px(12) }]} name="icon-mine-arrows-gray" />
                            {/* <Image style={[Styles.icon_arrow, {marginLeft: px(12)}]}
                                resizeMode={'contain'}
                                source={pxRatio > 2.51 ? ImagesRes.mine_arrows_gray_icon3x : ImagesRes.mine_arrows_gray_icon2x}/> */}
                        </View>

                    </View>
                </TouchableOpacity>

                {/** 分割线*/}
                <View style={Styles.divLine} />

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        this._jumpToPage(ADDRESS);
                    }}>

                    <View style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: px(34),
                        paddingHorizontal: px(30),
                    }}>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Image style={Styles.iconImg}
                                resizeMode={'contain'}
                                source={pxRatio > 2.51 ? ImagesRes.mine_location_icon3x : ImagesRes.mine_location_icon2x} />
                            <Span style={{
                                fontSize: px(30),
                                color: '#222222',
                                marginLeft: px(20),
                            }}>
                                收货地址
                            </Span>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon style={{
                                width: 8,
                                height: 15,
                                marginLeft: px(24),
                            }} name="icon-mine-arrows-gray" />
                            {/* <Image style={{
                                width: 8,
                                height: 15,
                                marginLeft: px(24),
                            }}
                            resizeMode={'contain'}
                            source={pxRatio > 2.51 ? ImagesRes.mine_arrows_gray_icon3x : ImagesRes.mine_arrows_gray_icon2x}/> */}
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={Styles.divLine}/>
                {
                    User.bondedPayerSwitchOnYn == 'Y' &&
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            this._jumpToPage(PAGER);
                        }}>
    
                        <View style={{
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: px(34),
                            paddingHorizontal: px(30),
                        }}>
        
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <Icon style={Styles.iconImg}
                                    resizeMode={'contain'}
                                    name="icon-payer"
                                />
                                <Span style={{
                                    fontSize: px(30),
                                    color: '#222222',
                                    marginLeft: px(20),
                                }}>
                                    支付人信息
                                </Span>
                            </View>
        
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <Image style={{
                                    width: 8,
                                    height: 15,
                                    marginLeft: px(24),
                                }}
                                resizeMode={'contain'}
                                source={pxRatio > 2.51 ? ImagesRes.mine_arrows_gray_icon3x : ImagesRes.mine_arrows_gray_icon2x}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    /**
     * 绘制其他条目
     */
    _renderOtherItem() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                marginHorizontal: px(24),
                marginTop: px(24),
                borderRadius: px(12),
                // paddingHorizontal: px(20),
                marginBottom: px(40),
            }}>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        this.goKefu()
                    }}>

                    <View style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: px(34),
                        paddingHorizontal: px(30),
                    }}>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Image style={Styles.iconImg}
                                resizeMode={'contain'}
                                source={pxRatio > 2.51 ? ImagesRes.tabbar_daling_kefu3x : ImagesRes.tabbar_daling_kefu2x} />
                            <Span style={{
                                fontSize: px(30),
                                color: '#222222',
                                marginLeft: px(20),
                            }}>
                                我的客服
                            </Span>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon style={{
                                width: 8,
                                height: 15,
                                marginLeft: px(12),
                            }} name="icon-mine-arrows-gray" />
                        </View>

                    </View>
                </TouchableOpacity>

                {/** 分割线*/}
                <View style={Styles.divLine} />

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        this.goAboutUs();
                    }}>

                    <View style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: px(34),
                        paddingHorizontal: px(30),
                    }}>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Image style={Styles.iconImg}
                                resizeMode={'contain'}
                                source={pxRatio > 2.51 ? ImagesRes.mine_about_icon3x : ImagesRes.mine_about_icon2x} />
                            <Span style={{
                                fontSize: px(30),
                                color: '#222222',
                                marginLeft: px(20)
                            }}>
                                关于达令家
                            </Span>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon style={{
                                width: 8,
                                height: 15,
                                marginLeft: px(24),
                            }} name="icon-mine-arrows-gray" />
                        </View>

                    </View>
                </TouchableOpacity>

                {/** 分割线*/}
                <View style={Styles.divLine} />

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        //点击进去信的页面
                        this.gotoBussiness();
                    }}>
                    <View style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: px(34),
                        paddingHorizontal: px(30),
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon style={Styles.iconImg} name={pxRatio > 2.51 ? "lingdaitie3@3x" : "lingdaitie3@2x"}  resizeMode={'contain'}/>

                            <Span style={{
                                fontSize: px(30),
                                color: '#222222',
                                marginLeft: px(20)
                            }}>
                                商务合作
                            </Span>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon style={{
                                width: 8,
                                height: 15,
                                marginLeft: px(24),
                            }} name="icon-mine-arrows-gray" />
                        </View>

                    </View>
                </TouchableOpacity>

            </View>
        )
    }


    render() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#f5f3f6',
            }}>
                <ScrollView style={{ flex: 1 }}
                    refreshControl={
                        <RefreshControl
                            tintColor="#fff"
                            colors={["#fff"]}
                            refreshing={this.state.isrefresh}
                            onRefresh={() => this.onRefresh()}
                        />}
                    showsVerticalScrollIndicator={false}>

                    <LoadingRequest status={this.state.requestStatus} />

                    <TopHeader navigation={this.props.navigation} _jumpToPage={this._jumpToPage.bind(this)}/>

                    {this._renderProperty()}
                    {this.renderPswTip()}
                    {this._renderOrder()}

                    {this._renderGroupAndLocation()}

                    {this._renderOtherItem()}

                </ScrollView>
            </View>
        )
    }

    didFocus = null


    componentWillUnmount() {
        this.didFocus && this.didFocus.remove()
    }

    async componentDidMount() {
        if (User.isLogin) {
            this.didFocus = this.props.navigation.addListener(
                'didFocus',
                async payload => {
                    let un = await getUnReadMsg(); // 获取未读消息
                    Event.emit("top.msg.updated", un)
                }
            );
        }
        try {
            // getUser();
            let cfg = await config();
            let shop = await getShopDetail();
            this.setState({
                shop: shop,
                bannerImg: cfg.images['ucenter_b_image'],
            });
        } catch (error) {
            //
        }
    }

    /**
     * 跳转到设置页面
     * @private
     */
    _jumpToSetting() {
        this.props.navigation.navigate('SettingPage', {});
    }

    async onRefresh() {
        getUser();
        let shop = await getShopDetail();
        this.setState({
            shop: shop
        })
    }
    
    goSetShopPage() {
        User.isLogin && this.props.navigation.navigate('SetShopPage', {
            callback: () => {
                this.onRefresh()
            }
        });
    }

    goRecruitPage() {
        User.isLogin && this.props.navigation.navigate('RecruitPage', {});
    }

    goInvitePage() {
        User.isLogin && this.props.navigation.navigate('InvitePage', {});
    }


    goFansPage() {
        User.isLogin && this.props.navigation.navigate('FansPage', {});
    }

    goContact(tel) {
        Linking.openURL('tel://' + tel);
    }

    /**
     * 跳转到我的订单页
     * @param type 订单类型：{0: 我的订单；1: 店铺订单}
     * @param orderState 订单状态: {0 全部; 待支付: 1; 待发货: 2; 待收货: 3; 退货/售后: 4}
     */
    goOrderListPage(type, orderState) {
        if (User.isLogin) {
            if (type == 0) {
                TrackClick('Mine-top', 'Mine-topbutton-1', '个人中心页', '我的订单');
            }
            this.props.navigation.navigate('OrderListPage', {
                type: type,
                orderState: orderState,
                callback: () => {
                    this.onRefresh()
                }
            });
        } else {
            this.goLoginPage();
        }
    }

    goIncome() {
        User.isLogin && this.props.navigation.navigate('IncomeManagePage', {});
    }

    async goGuide() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '店铺指南',
            src: cfg.images['recruit']
        });
    }

    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {});
    }

    async goHelp() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '帮助中心',
            src: cfg.images['help']
        });
    }

    async goKefu() {
        if (User.isLogin) {
            this.props.navigation.navigate('CustomSC', {
            });
        } else {
            this.goLoginPage();
        }
    }

    async goAboutUs() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '关于达令家',
            src: cfg.images['aboutus']
        });
    }
    async gotoBussiness(){
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '商务合作',
            src: cfg.images['Business']
        });

    }


    /**
     * 跳转到对应的页面
     * @private
     */
    _jumpToPage(actionType) {
        if (User.isLogin) {
            if (actionType === PERINFORMATION) {  // 个人资料
                this.props.navigation.navigate('InfoPage', {
                    type: User.userRole,
                    callback: () => {
                        this.onRefresh()
                    }
                });
            } else if (actionType === MYBALANCE) { // 我的余额
                this.props.navigation.navigate('MyBalancePage', {});
            } else if (actionType === GROUP) { // 我的拼团
                TrackClick('Mine-top', 'Mine-topbutton-2', '个人中心页', '我的拼团');
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: 'https://dalingjia.com/xcgroupon/order-list',
                    img: ''
                });
            } else if (actionType === ADDRESS) {  // 收货地址
                this.props.navigation.navigate('AddressListPage', {});
            } else if (actionType === PAGER) { // 支付人信息
                this.props.navigation.navigate('PayerListPage', {
                    from: 'my' // 支付人信息
                });
            }
        } else {
            this.goLoginPage();
        }
    }


});

const Styles = StyleSheet.create({

    unLoginView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: px(12)
    },

    login: {
        backgroundColor: '#ffffff',
        paddingVertical: px(15),
        paddingHorizontal: px(53),
        borderRadius: px(12),
    },

    headerImgBg: {
        width: deviceWidth,
        height: px(350),
    },

    headerView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Platform.OS === 'ios' ? px(60) : px(24),
        paddingRight: px(30),
    },

    headerProView: {
        // paddingHorizontal: px(30),
        paddingLeft: px(30),
        height: px(110),
        // paddingTop: px(4)
    },

    headerIcon: {
        width: 55,
        height: 55,
        borderRadius: Platform.OS === 'ios' ? px(50) : px(60),
        borderWidth: 1.5,
        borderColor: '#ffffff'
    },

    headerTxt: {
        fontSize: 15,
        color: '#ffffff',
        marginLeft: px(20)
    },

    headerTouch: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    itemTxt: {
        fontSize: px(24),
        color: '#000000',
        marginTop: px(14),
    },

    orderText: {
        fontSize: px(22),
        color: '#666666',
        marginTop: px(20),
    },

    ripdTxt: {
        fontSize: px(36),
        color: '#222222',
        fontWeight: 'bold'
    },

    unitTxt: {
        color: '#222222',
        fontSize: px(20),
        fontWeight: 'normal',
        marginLeft: px(4),
        marginTop: px(12)
    },

    propertyView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        marginHorizontal: px(24),
        marginTop: -px(50),
        borderRadius: 6,
    },

    orderView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        marginHorizontal: px(24),
        marginTop: px(24),
        borderRadius: px(12),
    },

    orderTopItem: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: px(34),
        paddingHorizontal: px(30),
    },

    orderBottom: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: px(54),
        paddingVertical: px(40),
    },

    itemBtn: {
        alignItems: 'center',
    },

    itemImg: {
        width: 25,
        height: 25,
    },

    iconImg: {
        width: 15,
        height: 15,
    },

    icon_arrow: {
        width: 8,
        height: 15,
    },

    divLine: {
        flex: 1,
        height: px(1),
        backgroundColor: '#efefef',
        marginLeft: px(30),
    },

    groupView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        marginHorizontal: px(24),
        marginTop: px(24),
        borderRadius: px(12),
    },

    groupItem: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: px(34),
        paddingHorizontal: px(30),
    },

    groupChild: {
        flexDirection: 'row',
        alignItems: 'center'
    },

});
const tipStyles = StyleSheet.create({
    /*box: {
        height: px(80),
        borderRadius: px(12),
        overflow: 'hidden',
        width: px(710),
        backgroundColor: '#fff',
        marginHorizontal: px(20)
    },*/
    contain: {
        flex: 1,
        marginHorizontal: px(24),
        marginTop: px(13),
    },
    triangle: {
        width: px(23),
        height: px(11),
        marginLeft: px(107)
    },
    box: {
        height: px(80),
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: px(12),
        paddingHorizontal: px(30)
    },
    pswTip: {
        width: px(30),
        height: px(30),
        //marginLeft: px(30),
        marginRight: px(14)
    },
    txt: {
        fontSize: px(26),
        color: '#ed3f58'
    },
    line: {
        marginLeft: px(16),
        marginRight: px(16)
    }
});





