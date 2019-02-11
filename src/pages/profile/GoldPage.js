'use strict';

import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { px, isIphoneX } from '../../utils/Ratio';
import { get, post, touchBaseUrl } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { getGoldList, getShopDetail, User } from '../../services/Api';
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
import { GoldQrCodeModal } from '../common/ModalView'

const deviceHeight = Dimensions.get('window').height;
const PAGE_SIZE = 20;

//列表项
class CouponItem extends Component {

    constructor(props) {
        super(props);
        this.state = { selected: false }
    }

    render() {
        const { stunner, type, selectedList } = this.props
        return <View>
            {
                type == 0 && <View style={stunner_style.stunner}>
                    <Icon name="icon-gold-bg" style={{ width: px(690), height: px(264), position: 'absolute' }} />
                    <View style={[stunner_style.stunnerBox]}>
                        <TouchableWithoutFeedback onPress={() => this.props.openQrCode({amountStr: stunner.amountStr, stunnerLogId: stunner.stunnerLogId})}>
                            <View style={stunner_style.body}>
                                <View style={[base.text_center, stunner_style.moneyBox]}>
                                    <View style={base.inline}>
                                        <Icon name="goldMoney"
                                            resizeMode='cover'
                                            style={{ width: px(28), height: px(28), marginRight: px(6), marginTop: px(20) }} />
                                        <Text allowFontScaling={false} style={stunner_style.stunnerMoney}>{stunner.amountStr}</Text>
                                    </View>
                                </View>
                                <Icon name="icon-gold-line"
                                    resizeMode='cover'
                                    style={{ width: px(1), height: px(190) }} />
                                <View style={stunner_style.infoBox}>
                                    <View>
                                        <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerName}>{stunner.name}</Text>
                                        <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerShop}>使用店铺:{stunner.shopName}</Text>
                                    </View>
                                    <Text numberOfLines={3} allowFontScaling={false} style={stunner_style.desc}>{stunner.describe}</Text>
                                </View>
                                <View style={stunner_style.btn}>
                                    {!User.vip && <TouchableOpacity style={stunner_style.stunnerSelect} onPress={() => this.select(stunner.code)}>
                                        {!this.state.selected &&
                                            <Icon name="gold-check" resizeMode='cover' style={{ width: px(34), height: px(34) }} />
                                        }
                                        {
                                            this.state.selected && <Icon name="gold-checked" resizeMode='cover' style={{ width: px(34), height: px(34) }} />
                                        }
                                    </TouchableOpacity>}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={[base.inline_between, stunner_style.foot]}>
                            <Text allowFontScaling={false} style={stunner_style.footDate}>{stunner.startDateStr} - {stunner.endDateStr}</Text>
                            <TouchableOpacity onPress={() => this.toUse(stunner.stunnerId, stunner.name, stunner.inviteCode, stunner.shopName)}>
                                <View style={stunner_style.btnUse}>
                                    <Text style={stunner_style.btnUseTxt}>去省钱</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
            {
                type != 0 &&
                <View style={stunner_style.stunner}>
                    <Icon name="icon-gold-bg1"
                        resizeMode='cover'
                        style={{ width: px(690), height: px(264), position: 'absolute' }} />
                    <View style={[stunner_style.stunnerBox]}>
                        <View style={stunner_style.body}>
                            <View style={[base.text_center, stunner_style.moneyBox]}>
                                <View style={base.inline}>
                                    <Icon name="goldMoney"
                                        resizeMode='cover'
                                        style={{ width: px(28), height: px(28), marginRight: px(6), marginTop: px(20) }} />
                                    <Text allowFontScaling={false} style={stunner_style.stunnerMoney}>{stunner.amountStr}</Text>
                                </View>
                            </View>
                            <Icon name="icon-gold-line"
                                resizeMode='cover'
                                style={{ width: px(1), height: px(190) }} />
                            <View style={stunner_style.infoBox}>
                                <View>
                                    <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerName}>{stunner.name}</Text>
                                    <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerShop}>使用店铺:{stunner.shopName}</Text>
                                </View>
                                <Text numberOfLines={3} allowFontScaling={false} style={stunner_style.desc}>{stunner.describe}</Text>
                            </View>
                        </View>
                        <View style={[base.inline_between, stunner_style.foot]}>
                            <Text allowFontScaling={false} style={stunner_style.footDate}>{stunner.startDateStr} - {stunner.endDateStr}</Text>
                        </View>
                    </View>
                </View>
            }
        </View>
    }
    select(code) {
        this.setState({ selected: !this.state.selected })
        this.props.selectTo && this.props.selectTo(code, this.props.stunner);
    }
    toUse(id, name, inviteCode, shopName) {
        if (this.props.tmp.inviteCode != inviteCode) {
            return toast(`该金币仅在${shopName}店铺中使用，请在微信中进入该店铺使用`)
        }
        this.props.navigation.navigate('CouponGoodsPage', {
            id: id,
            name: name,
            from: 'stunner'
        });
    }
}
const stunner_style = StyleSheet.create({
    stunner: {
        width: px(690),
        height: px(264),
        marginTop: px(20),
        marginLeft: px(30),
        marginRight: px(30),
        // backgroundColor: '#d0648f',
        borderRadius: px(10),
        overflow: 'hidden',
        /*shadowColor: '#000',
        shadowOffset: { width: 0, height: px(10) },
        shadowRadius: px(10),
        shadowOpacity: 0.12,*/
    },
    stunnerBox: {
        flex: 1
    },
    body: {
        flexDirection: 'row',
        paddingHorizontal: px(10),
        //paddingTop: px(30),
        paddingBottom: px(20),
        height: px(194)
    },
    moneyBox: {
        width: px(210),
        paddingTop: px(30)
        //height:px(194),
        /*borderRightColor: '#e698b7',
        borderRightWidth: px(1)*/
    },
    stunnerMoneyI: {
        color: '#fff',
        fontSize: px(40),
        marginTop: px(20),
        backgroundColor: 'transparent'
    },
    stunnerMoney2: {
        color: '#fff',
        fontSize: px(22),
        backgroundColor: 'transparent'
    },
    stunnerMoney: {
        color: '#fff',
        fontSize: px(70),
        backgroundColor: 'transparent'
    },
    infoBox: {
        width: px(370),
        paddingTop: px(30),
        paddingHorizontal: px(40),
        //height: px(162),
        overflow: "hidden",
    },
    desc: {
        marginTop: px(10),
        color: '#fff',
        fontSize: px(22),
        backgroundColor: 'transparent'
    },
    btn: {
        paddingTop: px(80),
        paddingRight: px(10)
    },
    foot: {
        paddingHorizontal: px(20),
        paddingBottom: px(5),
        flex: 1
    },
    footDate: {
        fontSize: px(22),
        color: '#929292',
        lineHeight: px(30),
        backgroundColor: 'transparent'
    },
    btnUse: {
        borderColor: '#d1d1d1',
        borderWidth: px(2),
        borderRadius: px(30),
        paddingHorizontal: px(20),
        paddingVertical: px(5)
    },
    btnUseTxt: {
        fontSize: px(22),
        color: '#404040',
        backgroundColor: 'transparent'
    },
    stunnerName: {
        fontSize: px(32),
        color: '#fff',
        marginBottom: px(10),
        backgroundColor: 'transparent'
    },
    stunnerShop: {
        fontSize: px(22),
        color: '#fff',
        marginBottom: px(5),
        backgroundColor: 'transparent'
    },
    stunnerSelect: {
        width: px(82),
        justifyContent: 'center',
        alignItems: 'center'
    },
})
//列表
class CouponList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            list: [],
            selectedList: [],
            selectedStunner: [],
            isShow: false,
            contentTxt: "",
            shareContent: [],
            tmp: '',
            banner: {},
            stunnerShare: ''
        };
    }

    render() {
        const { list, refreshing, selectedList, isShow } = this.state
        const { type } = this.props
        return <View style={{ flex: 1 }}>
            <FlatList
                style={{ flex: 1 }}
                data={list || []}
                refreshing={refreshing}
                onRefresh={() => this.refresh()}
                keyExtractor={(item) => item.stunnerLogId + ''}
                ListHeaderComponent={
                    type == 0 && this.state.banner.img ? <TouchableOpacity activeOpacity={0.9} onPress={
                        () => {
                            this.props.navigation.navigate('HtmlViewPage', {
                                webPath: this.state.banner.url,
                                img: this.state.banner.img,
                                gold: 1
                            });
                        }
                    }>
                        <Image
                            source={{ uri: this.state.banner.img }}
                            style={{ width: px(750), height: px(130) }}
                        >
                        </Image>
                    </TouchableOpacity> : null
                }
                renderItem={({ item }) =>
                    <CouponItem
                        navigation={this.props.navigation}
                        tmp={this.state.tmp}
                        openQrCode={this.qrCode.bind(this)}
                        selectTo={this.selectTo.bind(this)}
                        stunner={item} type={type} selectedList={selectedList} />
                }
                contentContainerStyle={{ backgroundColor: "#f6f5f7" }}
                ListEmptyComponent={
                    list && <View style={{ flex: 1, height: deviceHeight - px(300), justifyContent: 'center' }}><Text style={styles.emptyList} allowFontScaling={false}>{this.state.contentTxt}</Text></View>
                }
            />
            {
                !User.vip && type == 0 && this.state.list.length != 0 && <View style={{ height: isIphoneX() ? px(160) : px(98) }}>
                    <FootView>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.shareTo()}>
                            <View style={styles.bottomBox}>
                                <Icon name="icon-gold-share"
                                    style={{ width: px(32), height: px(32) }} />
                                <Text allowFontScaling={false} style={styles.shareTxt}>分享金币</Text>
                            </View>
                        </TouchableOpacity>
                    </FootView>
                </View>
            }
            <ShareView ref='shareView'
                navigation={this.props.navigation}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN]} />
            <Loading ref='loading' />
            <GoldQrCodeModal ref='qrCodeTip' />
        </View>

    }

    // 打开二维码
    qrCode(gold) {
        if (User.isLogin && !User.vip) {
            this.refs.qrCodeTip.open(gold);
        }
    }

    shareTo = async () => {
        let { selectedList, stunnerShare, selectedStunner } = this.state
        if (selectedList.length == 0) {
            return toast('请勾选要分享的金币');
        } else {
            try {
                let shareCodes = '', shareStunnerPrices = []
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
                selectedStunner.length > 0 && selectedStunner.map(item => {
                    shareStunnerPrices.push(item.amountStr)
                })
                let res = await post(`/api/stunner/share?` + shareCodes);
                let shareStunnerPrice = shareStunnerPrices.join(',')
                this.refs.shareView.Share({
                    title: `{shopName}给您送金币啦~`,
                    desc: `{shopName}给您送金币啦，快来领取啊~`,
                    img: this.state.stunnerShare,
                    url: `${touchBaseUrl}/get-stunner?codes=${res}&title={shopName}给您送金币啦~&description={shopName}给您送金币啦，快来领取啊~`,
                    track: (type) => {
                        TrackClick('MyStunnerpage', 'MyStunnerpageShare', '我的金币页', `分享金币-${type}-${shareStunnerPrice}`)
                    }
                });
            } catch (e) {
                toast(e.message);
            }
        }
    }
    selectTo(stunnerLogId, stunner) { //选择金币
        let { selectedList, selectedStunner } = this.state
        if (selectedList.indexOf(stunnerLogId) == -1) {
            selectedList.push(stunnerLogId)
            selectedStunner.push(stunner)
        } else {
            selectedList.splice(selectedList.indexOf(stunnerLogId), 1)
            selectedStunner.splice(selectedList.indexOf(stunnerLogId), 1)
        }
        this.setState({
            selectedList: selectedList,
            selectedStunner: selectedStunner
        })
    }
    async componentDidMount() {
        this.refs.loading.open()
        await this.refresh();
        let cfg = await config();
        let tmp = await getShopDetail()
        this.setState({
            tmp: tmp,
            stunnerShare: cfg.images.stunnerShare
        });
    }

    async refresh() {
        /* this.setState({
             refreshing: true
         });*/
        let list = await this.getList();
        let banner = this.props.type == 0 && await this.getBanner();
        if (list.list.length == 0 && this.props.type == 0) {
            this.state.contentTxt = "小主，您没有未使用的金币哦~";
        } else if (list.list.length == 0 && this.props.type == 1) {
            this.state.contentTxt = "小主，您没有已过期的金币哦~";
        } else if (list.list.length == 0 && this.props.type == 2) {
            this.state.contentTxt = "小主，您没有已使用的金币哦~";
        } else if (list.list.length == 0 && this.props.type == 3) {
            this.state.contentTxt = "小主，您没有分享被领取的金币哦~";
        }
        this.refs.loading.close()
        this.setState({
            list: list.list,
            banner,
            //refreshing: false,
            contentTxt: this.state.contentTxt
        });
    }

    async next() {
        let list = await this.getList();
        this.setState({
            list: this.state.list.concat(list)
        });
    }

    async getList() {
        try {
            let res = await getGoldList(this.props.type);
            return res || [];
        } catch (e) {
            toast(e.message);
            return [];
        }
    }
    async getBanner() {
        try {
            let res = await get('/stunner/entry.do');
            return res || {};
        } catch (e) {
            toast(e.message);
            return [];
        }
    }

}

export default class extends Page {

    constructor(props) {
        super(props);
        let page = (this.props.navigation.state.params && this.props.navigation.state.params.page) || 0
        this.state = {
            page
        };
    }
    async goHelp() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '使用帮助',
            src: cfg.images['stunner_b_des']
        });
    }

    pageHeader() {
        return <TopHeader
            navigation={this.props.navigation}
            title="我的金币"
            rightBtn={
                <Text style={{ color: '#858385', width: px(140) }}
                    onPress={() => this.goHelp()}>
                    使用帮助
                </Text>
            }
        />
    }

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
                style={{ marginBottom: px(0) }}
            />} >
            {
                tabs.map((item, index) =>
                    <View tabLabel={item} key={index}
                        style={{ flex: 1, marginTop: index == 0 ? 0 : px(20) }}>
                        {User.isLogin && <CouponList type={index} navigation={this.props.navigation} />}
                    </View>
                )
            }
        </ScrollableTabView>
    }

    onReady() {
        if (!User.isLogin) this.go_("LoginPage")
    }
}

const styles = StyleSheet.create({
    bottomBox: {
        width: px(690),
        height: px(98),
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: px(1),
        borderTopColor: '#cecece'
    },
    share: {
        width: px(690),
        height: px(98),
        flexDirection: 'row',
        justifyContent: 'center',
        //backgroundColor: '#fff',
        //paddingBottom: px(26),
        alignItems: 'center',
        /*borderWidth:px(2),
        borderColor:'#d0648f',
        borderRadius:px(10)*/
        /*shadowColor: '#f6f5f7',
        //shadowOffset: {width: 0, height: px(100)},
        shadowRadius: px(20),
        shadowOpacity: 0.5,*/
    },
    shareTxt: {
        fontSize: px(34),
        marginLeft: px(20),
        color: '#d0648f',
        textAlign: 'center',
    },
    emptyList: {
        fontSize: px(26),
        // marginTop: px(250),
        textAlign: 'center',
        color: '#858385'
    }
})
