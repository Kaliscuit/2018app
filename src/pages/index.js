'use strict';

import React from 'react';

import {
    StyleSheet,
    Platform,
    BackHandler,
    DeviceEventEmitter,
    Linking,
    View,
    Text,
    AsyncStorage,
    TouchableWithoutFeedback
} from 'react-native';

import Navigation, { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import { observer } from "mobx-react";

import LoginPage from './account/LoginPage';
import LoginAgree from './account/LoginAgree'
import ShopPage from './shop/ShopPage';
import ProfilePage from './profile/ProfilePage';
import InfoPage from './profile/InfoPage';
import DetailPage from './goods/DetailPage';
import DetailPage_fromCart from './goods/DetailFromCartPage';
import SubmitPage from './goods/SubmitPage';
import AddressListPage from './address/ListPage';
import AddressEditorPage from './address/EditorPage';
import OrderListPage from './order/ListPage';
import WeChatHistoryOrder from './order/WeChatHistoryOrder'
import OrderDetailPage from './order/DetailPage';
import LogisticsPage from './order/LogisticsPage';
import IncomeManagePage from './profile/income/ManagePage';
import IncomeListPage from './profile/income/ListPage';
import WithdrawPage from './profile/income/WithdrawPage';
import WithdrawRecordPage from './profile/income/WithdrawRecordPage';
import BankCardPage from './profile/bankCard/BankCardPage';
import AddBankCardPage from './profile/bankCard/AddBankCardPage';
import RecruitPage from './profile/RecruitPage';
import InvitePage from './profile/InvitePage';
import ImagePage from './common/ImagePage';
import ChangeShopNamePage from './profile/ChangeShopNamePage';
import ChangeShopDecPage from './profile/ChangeShopDecPage';
import SetShopPage from './profile/SetShopPage';
import FansPage from './profile/FansPage';
import ShoppingCartPage from './shopping-cart/ShoppingCartPage_new';
import ShoppingCartContentPage from './shopping-cart/ShoppingCartContentPage_new';
import SuccessPage from './goods/SuccessPage';
import LookImagePage from './shop/LookImagePage';
import SettingPage from './profile/SettingPage';
import HtmlViewPage from './shop/HtmlViewPage';
import CouponPage from './profile/CouponPage';
import BalancePage from './profile/income/BalancePage';
import EditPswPage from './profile/password/EditPswPage';
import AddPswPage from './profile/password/AddPswPage';
import UseCouponPage from './goods/UseCouponPage';
import { deviceHeight, deviceWidth, px } from '../utils/Ratio';
import TaxationDetail from './goods/TaxationDetail';
import CouponGoodsPage from './goods/CouponGoodsPage';
import GoldPage from './profile/GoldPage';
import UseGoldPage from './goods/UseGoldPage';
import PayFailResult from './goods/PayFailResult';
import CustomerServicePage from './order/CustomerServicePage'
import CustomerDetailPage from './order/CustomerDetailPage'
import SearchOrderPage from './order/SearchOrderPage'
import DistributionPage from './goods/DistributionPage'
import VirtualSku from './order/VirtualSku'
import RegCodePage from "./account/RegCodePage"
import RegEndPage from "./account/RegEndPage"
import BindMobilePage from "./account/BindMobilePage"
import InvitationVipPage from "./Invitation/VipPage"
import VipRemarkPage from "./Invitation/VipRemarkPage"
import ShopWechatPage from "./profile/ShopWechatPage"
import WechatPage from "./help/WechatPage"
import Wechat2Page from "./help/Wechat2Page"
import InvetrPage from "./profile/InvetrPage"
import InvetrHelpPage from "./help/InvetrPage"
import ChangeInvitePage from "./profile/ChangeInvitePage"
import SendCode from "./profile/SendCode"
import ChangeCodePage from "./profile/ChangeCodePage"
import VipGoods from "./shop/VipGoods"
import HomePage from "./HomePage"
import TogetherPage from './shopping-cart/TogetherPage'
import PayerListPage from './profile/payer/ListPage'
import PayerEditPage from './profile/payer/EditPage'
import UseSuningCouponPage from './goods/UseSuningCouponPage'
import UserPage from './profile/UserPage'
import GoldValid from './market/GoldValid'
import GoldQrCode from './market/GoldQrCode'
import UseGold from './market/UseGold'
import BrowerPage from './shop/BrowerPage'
import SpecialPage from "./special/SpecialPage"
import SpecialDetailPage from "./special/SpecialDetailPage"
import AccumulatedSales from './ownerAbility/AccumulatedSales'
import AccumulatedEarnings from './ownerAbility/AccumulatedEarnings'
import PopularGoods from './ownerAbility/PopularGoods'
import ReturnsDetailed from './ownerAbility/ReturnsDetailed'
import AfterSaleManagement from './ownerAbility/AfterSaleManagement'
import SearchAfterSale from './ownerAbility/SearchAfterSale'
import SearchPage from './shop/SearchPage'
import ReleaseMatter from './goods/matter/ReleaseMatter';
import MyMatterList from './goods/matter/MyMatterlist';
import SearchMatterPage from './goods/matter/SearchMatterPage';
import Test from './common/matter/UploadPhotos1'
//debug
import DebugPage from './setting/DebugPage';
import LogPage from './setting/LogPage';
import LogTxtPage from './setting/LogTxtPage';
import TestPage from './setting/TestPage';


import { init, getUser, RefreshShopDetail, User, AppUp, getAddressList, getDefaultAddress } from '../services/Api';
import CartList from '../services/Cart'
import { log, logErr, logWarm } from '../utils/logs';
import { show as toast } from '../widgets/Toast';
import { getConstant } from '../services/Constant';
import ReturnGoods from './order/ReturnGoods'
import ProgressTrack from './order/ProgressTrack'
import Event, { emit } from '../services/Event'
import TrackUtil, { TrackClick, TrackPage } from "../services/Track";
import { registerApp } from '../services/WeChat';
import request, { setHeader } from '../services/Request'

import TabBarItem from './common/TabBarItem';
import { ImagesRes } from "../utils/ContentProvider";
import ScreenUtil from "../utils/ScreenUtil";
import MarketPage from "./market/MarketPage";
import PlayVideoPage from "./market/PlayVideoPage"
import MyBalancePage from "./profile/MyBalancePage";
import CustomSC from './profile/help/customSC'
import GoodsCategoryPage from "./goods/GoodsCategoryPage";
import SecondCategoryPage from "./goods/SecondCategoryPage";
import Notice from './profile/help/notice'
import MobileInfo from "../utils/MobileInfo"
import AnswerPage from './profile/help/AnswerPage'
import mDate from '../utils/Date'
import Cache from '../services/Cache'
import Router from "../services/Router"
import Background from "../UI/lib/Background";
import MessageCenter from './message'
import ActivityMessage from './message/activity-detail'
import SysMessage from './message/sys-detail'
import ShopMessage from './message/shop-detail'
import AssetsMessage from './message/assets-detail'
import TransMessage from './message/trans-detail'
import { getUnReadMsg } from "../services/Push";
import SpeSubmitPage from './goods/SpeSubmitPage';
import SpeSuccessPage from './goods/SpeSucessPage';
import CustomerServiceSearchPage from "./profile/CustomerServiceSearchPage"

global.ErrorUtils.setGlobalHandler(function (e) {
    logErr("未处理错误", e, e.message);
})

const styles = StyleSheet.create({
    tab: {
        height: 49,
        backgroundColor: '#fbfafc',
        borderTopColor: '#efefef'
    },

    tabIcon: {
        width: 22,
        height: 22,
        marginTop: px(12)
    },

    tab3xIcon: {
        width: px(66),
        height: px(66),
        marginTop: px(24)
    },

    tabLabel: {
        // fontSize: px(20),
        // marginBottom:px(10),
        // marginTop: px(6)
        fontSize: ScreenUtil.setSpText(10),
        marginBottom: 6,
        // marginTop: 4,
    },
    stackHeader: Platform.select({
        android: {
            height: px(100),
            backgroundColor: '#fbfafc',
            elevation: 0,
            borderBottomWidth: px(1),
            borderBottomColor: '#ddd'
        },
        ios: {
            height: px(110),
            backgroundColor: '#fbfafc',
            elevation: 0,
            borderBottomWidth: px(1),
            borderBottomColor: '#ddd'
        }
    }),
    stackHeaderTitle: {
        fontSize: px(30),
        textAlignVertical: 'center',
        fontWeight: 'normal'
    },
    stackHeaderTitleCenter: {
        alignSelf: 'center',
        fontSize: px(30),
        fontWeight: 'normal'
    },
    back: {
        paddingLeft: px(20),
        paddingRight: px(20)
    },
    badgeView: {
        position: 'absolute',
        top: 0,
        right: -16,
        backgroundColor: "#d0648f",
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 10,
        color: "#ffffff",
        fontSize: 11,
        alignSelf: 'center',
    }
});

const TabShopPage = {
    screen: ShopPage,
    path: 'ShopPage',
    navigationOptions: ({ navigation, screenProps }) => {
        return {
            tabBarLabel: '首页',
            tabBarIcon: ({ tintColor, focused }) =>
                <TabBarItem
                    focused={focused}
                    normal2x={ImagesRes.tabbar_shop_normal2x}
                    selected2x={ImagesRes.tabbar_shop_selected2x}
                    normal3x={ImagesRes.tabbar_shop_normal3x}
                    selected3x={ImagesRes.tabbar_shop_selected3x}
                />,

            tabBarOnPress: ({ defaultHandler }) => {
                defaultHandler();
                TrackClick('Bottom', 'BottomHome', '首页', '首页');
                RefreshShopDetail();
            }
        };
    }
}
const TabShoppingCartPage = {
    screen: ShoppingCartPage,
    path: 'ShoppingCartPage',
    navigationOptions: ({ navigation, screenProps }) => {
        return {
            tabBarLabel: '购物车',
            tabBarIcon: ({ tintColor, focused }) =>
                <TabBarItem
                    focused={focused}
                    normal2x={ImagesRes.tabbar_cart_normal2x}
                    selected2x={ImagesRes.tabbar_cart_selected2x}
                    normal3x={ImagesRes.tabbar_cart_normal3x}
                    selected3x={ImagesRes.tabbar_cart_selected3x} />
            ,
            tabBarOnPress: async ({ defaultHandler }) => {
                defaultHandler();
                TrackClick('Bottom', 'BottomCart', '购物车页', '购物车页');
                //TODO:刷新购物车
                // await CartList.getDefaultArea();
                // await CartList.update();
            }
        };
    }
}
const TabMarketPage = {
    screen: MarketPage,
    path: 'MarketPage',
    navigationOptions: ({ navigation, screenProps }) => {
        return {
            tabBarLabel: '店铺',
            tabBarIcon: ({ tintColor, focused }) =>
                <TabBarItem
                    focused={focused}
                    normal2x={ImagesRes.tabbar_market_normal2x}
                    selected2x={ImagesRes.tabbar_market_selected2x}
                    normal3x={ImagesRes.tabbar_market_normal3x}
                    selected3x={ImagesRes.tabbar_market_selected3x}
                />,
            tabBarOnPress: ({ defaultHandler }) => {
                defaultHandler();
                if (!navigation.isFocused()) {
                    getUser();
                    TrackClick('Bottom', 'BottomMarket', '店铺页', '店铺');
                }
            }
        }
    }
}
let TabProfilePage = {
    screen: ProfilePage,
    path: 'ProfilePage',
    navigationOptions: ({ navigation, screenProps }) => {
        return {
            tabBarLabel: '我的',
            tabBarIcon: ({ tintColor, focused }) =>
                <TabBarItem
                    focused={focused}
                    normal2x={ImagesRes.tabbar_mine_normal2x}
                    selected2x={ImagesRes.tabbar_mine_selected2x}
                    normal3x={ImagesRes.tabbar_mine_normal3x}
                    selected3x={ImagesRes.tabbar_mine_selected3x}
                />,

            tabBarOnPress: ({ defaultHandler, navigation }) => {
                defaultHandler();
                //更新个人信息
                if (!navigation.isFocused()) {
                    getUser();
                    RefreshShopDetail();
                    TrackClick('Bottom', 'BottomMine', '个人中心页', '我的');
                }
            }
        };
    }
}
const tabConfig = {
    //debug
    //initialRouteName:'ProfilePage',
    // tabBarComponent: Navigation.TabBarBottom,
    //animationEnabled: true,
    lazy: true,
    tabBarPosition: 'bottom',
    // animationEnabled: true,
    tabBarOptions: {
        style: styles.tab,
        labelStyle: styles.tabLabel,
        activeTintColor: '#d0648f',
        inactiveTintColor: '#222222'
    }
}
const Tab1 = createBottomTabNavigator({
    'ShopPage': TabShopPage,
    'ShoppingCartPage': TabShoppingCartPage,
    'MarketPage': TabMarketPage,
    'ProfilePage': TabProfilePage
}, tabConfig);

const Tab2 = createBottomTabNavigator({
    'ShopPage': TabShopPage,
    'ShoppingCartPage': TabShoppingCartPage,
    'ProfilePage': TabProfilePage
}, tabConfig);

let PagesConfig = {
    // initialRouteName:"TestPage",
    // initialRouteName: "SpeSuccessPage",
    navigationOptions: {
        header: null
    },
}
const Pages = {
    'HomePage': {
        screen: HomePage
    },
    'TabPage1': {
        screen: Tab1,
    },
    'TabPage2': {
        screen: Tab2,
    },
    'LoginAgree': {
        screen: LoginAgree
    },
    'GoldValid': {
        screen: GoldValid,
    },
    'GoldQrCode': {
        screen: GoldQrCode,
    },
    'UseGold': {
        screen: UseGold
    },
    'ShoppingCartPage': {
        screen: User.vip ? Tab2 : Tab1,
        path: 'ShoppingCartPage'
    },
    'PayFailResult': {
        screen: PayFailResult
    },
    'ReturnGoods': {
        screen: ReturnGoods
    },
    'ProgressTrack': {
        screen: ProgressTrack
    },
    'LoginPage': {
        screen: LoginPage
    },
    'DetailPage': {
        screen: DetailPage
    },
    'DetailPage_fromCart': {
        screen: DetailPage_fromCart
    },
    'SubmitPage': {
        screen: SubmitPage
    },
    'InfoPage': {
        screen: InfoPage
    },
    'VirtualSku': {
        screen: VirtualSku
    },
    'AddressListPage': {
        screen: AddressListPage
    },
    'AddressEditorPage': {
        screen: AddressEditorPage
    },
    'OrderListPage': {
        screen: OrderListPage
    },
    'WeChatHistoryOrder': {
        screen: WeChatHistoryOrder
    },
    'OrderDetailPage': {
        screen: OrderDetailPage
    },
    'LogisticsPage': {
        screen: LogisticsPage
    },
    'ImagePage': {
        screen: ImagePage
    },
    'IncomeManagePage': {
        screen: IncomeManagePage
    },
    'IncomeListPage': {
        screen: IncomeListPage
    },
    'WithdrawPage': {
        screen: WithdrawPage
    },
    'Notice': {
        screen: Notice
    },
    'WithdrawRecordPage': {
        screen: WithdrawRecordPage
    },
    'BankCardPage': {
        screen: BankCardPage
    },
    'AddBankCardPage': {
        screen: AddBankCardPage
    },
    'InvitePage': {
        screen: InvitePage
    },
    'RecruitPage': {
        screen: RecruitPage
    },
    'DebugPage': {
        screen: DebugPage
    },
    'LogPage': {
        screen: LogPage
    },
    'LogTxtPage': {
        screen: LogTxtPage
    },
    'ChangeShopNamePage': {
        screen: ChangeShopNamePage
    },
    'ChangeShopDecPage': {
        screen: ChangeShopDecPage
    },
    'SetShopPage': {
        screen: SetShopPage
    },
    'FansPage': {
        screen: FansPage
    },
    'SettingPage': {
        screen: SettingPage
    },
    'SuccessPage': {
        screen: SuccessPage
    },
    'LookImagePage': {
        screen: LookImagePage
    },
    'HtmlViewPage': {
        screen: HtmlViewPage
    },
    'CouponPage': {
        screen: CouponPage
    },
    'BalancePage': {
        screen: BalancePage
    },
    'EditPswPage': {
        screen: EditPswPage
    },
    'AddPswPage': {
        screen: AddPswPage
    },
    'UseCouponPage': {
        screen: UseCouponPage
    },
    'ShoppingCartContentPage': {
        screen: ShoppingCartContentPage
    },
    'TaxationDetail': {
        screen: TaxationDetail
    },
    'CouponGoodsPage': {
        screen: CouponGoodsPage
    },
    'GoldPage': {
        screen: GoldPage
    },
    'UseGoldPage': {
        screen: UseGoldPage
    },
    'TestPage': {
        screen: TestPage
    },
    'CustomerServicePage': {
        screen: CustomerServicePage
    },
    'CustomerDetailPage': {
        screen: CustomerDetailPage
    },
    'SearchOrderPage': {
        screen: SearchOrderPage
    },
    'DistributionPage': {
        screen: DistributionPage
    },
    'MyBalancePage': {
        screen: MyBalancePage
    },
    'GoodsCategoryPage': {
        screen: GoodsCategoryPage
    },
    'SecondCategoryPage': {
        screen: SecondCategoryPage
    },
    'RegCodePage': {
        screen: RegCodePage
    },
    'RegEndPage': {
        screen: RegEndPage
    },
    'BindMobilePage': {
        screen: BindMobilePage
    },
    'InvitationVipPage': {
        screen: InvitationVipPage
    },
    'VipRemarkPage': {
        screen: VipRemarkPage
    },
    'ShopWechatPage': {
        screen: ShopWechatPage
    },
    'WechatPage': {
        screen: WechatPage
    },
    'InvetrPage': {
        screen: InvetrPage
    },
    'InvetrHelpPage': {
        screen: InvetrHelpPage
    },
    'SendCode': {
        screen: SendCode
    },
    'ChangeInvitePage': {
        screen: ChangeInvitePage
    },
    'ChangeCodePage': {
        screen: ChangeCodePage
    },
    'VipGoods': {
        screen: VipGoods
    },
    'TogetherPage': {
        screen: TogetherPage
    },
    'Wechat2Page': {
        screen: Wechat2Page
    },
    'PayerListPage': {
        screen: PayerListPage
    },
    'PayerEditPage': {
        screen: PayerEditPage
    },
    'UseSuningCouponPage': {
        screen: UseSuningCouponPage
    },
    'UserPage': {
        screen: UserPage
    },
    'AnswerPage': {
        screen: AnswerPage
    },
    'BrowerPage': {
        screen: BrowerPage
    },
    'SearchPage': {
        screen: SearchPage
    },
    'CustomSC': {
        screen: CustomSC
    },
    'MessageCenter': {
        screen: MessageCenter,
    },
    'ActivityMessage': {
        screen: ActivityMessage,
    },
    'SysMessage': {
        screen: SysMessage
    },
    'ShopMessage': {
        screen: ShopMessage
    },
    'AssetsMessage': {
        screen: AssetsMessage
    },
    'TransMessage': {
        screen: TransMessage,
    },
    'AccumulatedSales': {
        screen: AccumulatedSales,
    },
    'AccumulatedEarnings': {
        screen: AccumulatedEarnings,
    },
    'PopularGoods': {
        screen: PopularGoods,
    },
    'ReturnsDetailed': {
        screen: ReturnsDetailed
    },
    'AfterSaleManagement': {
        screen: AfterSaleManagement
    },
    'SearchAfterSale': {
        screen: SearchAfterSale
    },
    'ReleaseMatter': {
        screen: ReleaseMatter
    },
    'MyMatterList': {
        screen: MyMatterList
    },
    'SearchMatterPage': {
        screen: SearchMatterPage
    },
    'Test': {
        screen: Test
    },
    'CustomerServiceSearchPage': {
        screen: CustomerServiceSearchPage,
    },
    'SpecialPage': {
        screen: SpecialPage
    },
    'SpecialDetailPage': {
        screen: SpecialDetailPage
    },
    'SpeSubmitPage': {
        screen: SpeSubmitPage
    },
    'SpeSuccessPage': {
        screen: SpeSuccessPage
    },
    'PlayVideoPage': {
        screen: PlayVideoPage,
    }
};

const Warp1 = createStackNavigator(Pages, PagesConfig);

class MessageIn extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            item: null
        }

        this.add = this.add.bind(this)
    }

    render() {
        let item = this.state.item
        return <View style={message.wrap}>
            {this.state.item ? <Background name="message-box-bg" resizeMode={'cover'} style={message.item}>
                <TouchableWithoutFeedback onPress={() => this.go(item)}>
                    <View style={{ flex: 1 }}>
                        <View style={message.f}>
                            <Text allowFontScaling={false} style={message.title}>
                                {item.tit}
                            </Text>
                            <Text allowFontScaling={false} style={message.time}>
                                {item.time}
                            </Text>
                        </View>
                        <Text allowFontScaling={false} style={message.context} numberOfLines={1}>
                            {item.msg}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </Background> : null}
        </View>
    }

    componentWillMount() {
        Event.on("push.view", this.add)
    }

    list = []

    timer = null

    isRun = false

    go(data) {
        try {
            this.no()
            let msg = JSON.stringify(data);
            Event.emit("push.go", msg);
        } catch (e) {
            //
        }
    }

    add(msg) {
        try {
            let data = JSON.parse(msg)
            data.time = this.parseTime()
            this.list.unshift(data)
            this.reduce()
        } catch (e) {
            //
        }
    }

    parseTime() {
        let today = new Date()
        return `今天 ${today.getHours() > 9 ? today.getHours() : '0' + today.getHours()}:${today.getMinutes() > 9 ? today.getMinutes() : '0' + today.getMinutes()}`
    }

    no() {
        if (this.timer) clearInterval(this.timer)
        this.remove()
        this.times()
    }

    remove(index) {
        this.setState({
            item: null
        }, () => {
            setTimeout(() => {
                let data = this.list.pop()
                this.setState({
                    item: data,
                })
            }, 10)
        })
    }

    reduce() {
        if (this.isRun) return;
        this.isRun = true;
        let data = this.list.pop()
        this.setState({
            item: data,
        }, () => {
            this.times()
        })
    }

    times() {
        this.timer = setInterval(() => {
            if (!this.list || this.list.length == 0) {
                clearInterval(this.timer)
                this.setState({
                    item: null,
                })
                this.isRun = false;
                return;
            }
            this.remove()
        }, 2100)
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        Event.off("push.view", this.add)
    }
}

const myPages = class myPage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.isCanBack = true;

        this.state = {
            show: false,
        };

        if (props.app && props.app === 'huibang') {
            setHeader("app", "huibang");
            registerApp('wxbc72f1eec01162b0');
        } else {
            registerApp('wxfa333b610f00ded2');
        }

        this.update = this.update.bind(this);

    }

    render() {
        if (!this.state.show) return null;
        return <View style={{ flex: 1 }}>
            <Warp1 onNavigationStateChange={this.listenChange.bind(this)} />
            <MessageIn />
        </View>;
    }

    listenChange(state1, state2, action) {
        if (action.type === 'Navigation/COMPLETE_TRANSITION') return;

        let fromobj = state1.routes[state1.routes.length - 1];
        let from = { name: fromobj.routeName, key: fromobj.key };
        let toobj = state2.routes[state2.routes.length - 1];
        let to = { name: toobj.routeName, key: toobj.key };

        log("加载路由" + toobj.routeName);
        //前进逻辑
        if (action.routeName && to.name != action.routeName) {
            to = { name: action.routeName, key: action.routeName };
        }
        //重置
        if (action.type === "Navigation/RESET") {
            Router.flush(from, to);
        }
        if (action.type === "Navigation/BACK") {
            Router.pop();
        }
        if (action.type === "Navigation/REPLACE" || action.type === "Navigation/NAVIGATE") {
            Router.push(from, to);
        }

        if (action.type == 'Navigation/RESET' || action.type == 'Navigation/BACK') {
            if (state2.index == 0 && state2.routes.length == 1) {
                this.isCanBack = true;
            } else {
                this.isCanBack = false;
            }
        } else {
            this.isCanBack = false;
        }
    }

    async componentWillMount() {
        getAddressList();
    }
    async componentDidMount() {
        try {
            await AppUp();
            await getDefaultAddress();
        } catch (e) {
            log("app信息恢复", e.message);
        }
        try {
            await MobileInfo();
        } catch (e) {
            //
        }
        this.wgo = this.backDesk.bind(this);
        this.backDate = Date.now();
        BackHandler.addEventListener('hardwareBackPress', this.wgo);
        if (User.isLogin) Event.emit("open");
        this.setState({ show: true });
        Event.on("app.active", this.update);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.wgo);
        Event.off("app.active", this.update)
    }
    update() {
        mDate.sync();
    }

    backDesk() {
        if (!this.isCanBack) return false;
        const now = Date.now();
        if (now - this.backDate < 1000) {
            this.setState({
                show: false
            })
            return false;
        }
        toast('再点一次返回键退出达令家');
        this.backDate = now;
        return true;
    }
};
export default myPages;

const message = StyleSheet.create({
    wrap: { position: 'absolute', top: 0, left: 0, width: deviceWidth },
    item: {
        width: px(750),
        height: px(167),
        paddingHorizontal: px(40),
        paddingVertical: px(35),
    },
    f: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        flex: 1,
        fontSize: px(32),
        lineHeight: px(52),
        color: '#000',
        fontWeight: '600',
    },
    time: {
        fontSize: px(26),
        color: '#666'
    },
    context: {
        lineHeight: px(46),
        fontSize: px(28),
        color: '#000',
    }
})
