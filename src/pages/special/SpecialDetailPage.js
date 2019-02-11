'use strict';

import React from 'react';

import {
    View,
    ScrollView,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing
} from 'react-native';

import { px, deviceWidth } from '../../utils/Ratio';
import request, { touchBaseUrl, baseUrl } from "../../services/Request";
import Page, { SafeFootView, FootView } from "../../UI/Page"
import Tab from "../../UI/lib/Tab"
import Icon from "../../UI/lib/Icon"
import ShareView, { SHARETYPE } from "../common/ShareView"
import Background from "../../UI/lib/Background"
import base from "../../styles/Base"
import util_cools from "../../utils/tools"
import ImgLoad from "../../UI/lib/ImgLoad"
import { getItem } from "../../services/Storage"
import TabView from 'react-native-scrollable-tab-view2'
import { Header } from "../common/Header"

class Detail extends React.PureComponent {

    static defaultProps = {
        sku: ""
    }
    constructor(props) {
        super(props)
        this.state = {
            imgs: [],
            goods: {},
            area: {},
        }
    }
    render() {
        return <ScrollView style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ backgroundColor: "#fff" }}
            scrollEventThrottle={10} >
            <View style={[base.inline, { paddingHorizontal: px(40) }]}>
                <Text style={styles.topTitleTxt}>{this.state.goods.goodsName}</Text>
            </View>
            {this.state.imgs.map((item, index) => <ImgLoad key={index}
                src={item.image}
                loaded={this.loadimg.bind(this)}
                width={deviceWidth}
            />)}
            <View style={styles.line}></View>
        </ScrollView>
    }

    componentDidMount() {
        if (this.props.show) this.loadDetail();
    }
    componentWillReceiveProps(pp) {
        if (pp.show != this.props.show && pp.show) this.loadDetail();
    }
    imgs = [];

    loadimg() {
        let img = this.imgs.shift();
        if (!img) return;
        this.setState({ imgs: this.state.imgs.concat([img]) })
    }
    async loadDetail() {
        let sku = this.props.sku;
        try {
            let goods = await request.get("/goods/selected/detail.do", { sku, calltype: "app" })
            let imgs = [];
            if (!goods.detail.mobile_detail || !goods.detail.mobile_detail.list) {
                goods.detail.mobile_detail = { list: [] }
            }
            if (goods.detail.mobile_detail.list.length > 0) {
                goods.detail.mobile_detail.list.map((item, index) => {
                    if (Number(item.width) != 750) {
                        try {
                            item.height = 750 / Number(item.width) * Number(item.height) >> 0;
                            item.width = 750;
                        } catch (e) {
                            //
                        }
                    }
                    item.index = index;
                    item.currIndex = index;
                    item.name = 'mobile_detail';
                    item.show = false;
                    // item.img = require('../../images/img');
                    return item;
                });
                imgs = imgs.concat(goods.detail.mobile_detail.list)
            } else {
                if (goods.detail.shows) {
                    const len = imgs.length;
                    goods.detail.shows.list.map((item, index) => {
                        item.index = len + index;
                        item.currIndex = index;
                        item.name = 'shows';
                        item.show = false;
                        return item;
                    });
                    imgs = imgs.concat(goods.detail.shows.list)
                }
                if (goods.detail.specials) {
                    const len = imgs.length;
                    goods.detail.specials.list.map((item, index) => {
                        item.index = len + index;
                        item.currIndex = index;
                        item.name = 'specials';
                        item.show = false;
                        return item;
                    });
                    imgs = imgs.concat(goods.detail.specials.list)
                }
                if (goods.detail.usages && goods.detail.usages.list) {
                    const len = imgs.length;
                    goods.detail.usages.list.map((item, index) => {
                        item.index = len + index;
                        item.currIndex = index;
                        item.name = 'usages';
                        item.show = false;
                        return item;
                    });
                    imgs = imgs.concat(goods.detail.usages.list)
                }
            }
            // this.getArea(goods.id, goods)
            this.props.setData && this.props.setData(goods)
            this.imgs = imgs;
            this.setState({ goods })
            this.loadimg()
        } catch (error) {
            // this.$toast(error.message);
        }
    }

    async getArea(id, goods) {
        let area = {}
        let selectAddress = JSON.parse(await getItem('selectAddress'))
        try {
            //area = await Request.get(`/goods/deliveryArea.do?id=${selectAddress.id || 0}&prodId=${id}&province=${selectAddress.province || ''}&city=${selectAddress.city || ''}&district=${selectAddress.district || ''}&detail=${selectAddress.detail || ''}`)
            if (selectAddress) {
                area = await request.get(`/goods/deliveryArea.do?addressId=12345&prodId=${id}&province=${selectAddress.province || ''}&city=${selectAddress.city || ''}&area=${selectAddress.district || ''}&address=${selectAddress.detail || ''}`)
            } else {
                area = await request.get(`/goods/deliveryArea.do?addressId=12345&prodId=${id}&province=${''}&city=${''}&area=${''}&address=`)
            }
            let skuType = goods ? goods.skuTypeTwo : this.state.goods.skuTypeTwo;
            // if (skuType == 'suning') {
            //     await this.getActivities(id, area)
            // }
            this.setState({
                area
            });
        } catch (e) {
            // this.$toast(e.message)
        }
    }
    async getActivities(id, area) {
        try {
            let res = await request.get(`/coupon/getActivities.do?prodId=${id}&city=${area.city}&province=${area.province}&district=${area.area}`)
            this.setState({
                activity: {
                    coupons: res.couponActivities.join(',') || '',
                    bonus: res.bonusActivities.join(',') || ''
                }
            });
        } catch (e) {
            this.setState({
                activity: {
                    coupons: '',
                    bonus: ''
                }
            });
            //toast(e.message)
        }
    }
}

export default class extends Page {

    constructor(props) {
        super(props, {
            list: [],
            scrollTop: new Animated.Value(0),
            show: true,
            sku: props.navigation.state.params.sku,
            page: 0,
            code: ""
        })
    }

    backgroundColor = '#fff';

    pageHeader() {
        return <Header navigation={this.props.navigation}
            rightBtn={<TouchableOpacity onPress={this.sharePage.bind(this)}>
                <Icon name="goodsDetailShare" style={{ width: px(40), height: px(40) }} />
            </TouchableOpacity>}
            title="超值精选商品"></Header>
    }

    pageBody() {
        return <View style={{ flex: 1 }}>
            <View style={styles.topBox}>
                <Tab data={this.state.list}
                    contentContainerStyle={styles.contentContainerStyle}
                    onClick={this.onClick.bind(this)}
                    renderItem={this.renderItem.bind(this)} />
            </View>
            <TabView
                locked={true}
                page={this.state.page}
                prerenderingSiblingsNumber={3}
                android={false}
                scrollWithoutAnimation={true}
                renderTabBar={false}
                initialPage={0}>
                {this.state.list.map((item, index) => <Detail
                    key={index}
                    show={item.show}
                    setData={e => this.setData(index, e)}
                    sku={item.sku}
                />)}
            </TabView>
            <ShareView ref='shareView'
                getQrCode={() => this.getQrCode()}
                getQrCode2={() => this.getQrCode2()}
                QRCodeType={util_cools.isNewAndroid() ? "old" : "giftgoods"}
                navigation={this.props.navigation}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
                {/* <View style={[base.line, { marginVertical: px(20) }]}>
                    <Text style={styles.modalTxt1} allowFontScaling={false}>分享赚￥{util_cools.parsePrice(this.state.goods.benefitMoney)}</Text>
                    <Text style={styles.modalTxt2} allowFontScaling={false}>只要你的好友通过你的分享购买商品，</Text>
                    <Text style={styles.modalTxt2} allowFontScaling={false}>你就能赚到至少{util_cools.parsePrice(this.state.goods.benefitMoney)}元利润收入哦～</Text>
                </View> */}
            </ShareView>
        </View>
    }
    pageFooter() {
        return <FootView>
            <TouchableOpacity onPress={() => this.sharePage()}>
                <View style={styles.sharBtn}>
                    {/* <Icon name="icon-gold-share"
                        style={{ width: px(32), height: px(32) }} /> */}
                    <Text style={styles.shareTxt}>立即分享</Text>
                </View>
            </TouchableOpacity>
        </FootView>
    }
    renderItem(item, index, curr) {
        return <View style={styles.topItemBox}>
            <View style={[styles.topItem, curr === index ? { borderColor: "#999" } : null]}>
                <View style={[styles.img, { borderRadius: px(10), overflow: "hidden" }]}>
                    <Image source={{ uri: item.coverImgUrl }}
                        resizeMode="stretch"
                        resizeMethod="auto"
                        style={styles.img} />
                </View>
            </View>
            <Text numberOfLines={1} style={[styles.topTxt, curr === index ? { color: "#222" } : null]}>{item.goodsDesc}</Text>
        </View>
    }
    async onReady() {
        try {
            let code = await request.get('/qrcode/getUrlValidityTime.do');
            this.setState({ code: code.validity })
        } catch (e) {
            // console.log(e.message)
        }
        this.next();
    }
    onClick(index) {
        let list = this.state.list.concat();
        list[index].show = true;
        this.setState({ page: index, list })
        // this.runScroll(this.offsetList[index]);
    }
    list = [];
    setData(index, data) {
        this.list[index] = data;
    }
    offsetList = [];

    async next() {
        try {
            let res = await this.load();
            res.items.map((item, index) => {
                if (index === 0) item.show = true;
                return item;
            })
            this.setState({ list: res.items });
        } catch (error) {
            this.$toast(error.message);
        }
    }
    async load() {
        try {
            let data = await request.get("/goods/selected/wheel.do", { sku: this.state.sku, limit: 50 });
            // let data = require("../../../package/list");
            return data;
        } catch (error) {
            // console.log(error)
        }
        return {
            totalPages: 1,
            items: []
        }
    }
    /**
         * 分享2的获取二维码方法
         */
    async getQrCode() {
        let goods = this.list[this.state.page];
        if (!goods) return {};
        let salePrice = goods.salePrice;
        let res1 = await request.get(`/goods/touch/createQrcode.do?id=${goods.id}&sku=${goods.sku}&salePrice=${salePrice}&join=1`);
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }
    async getQrCode2() {
        let goods = this.list[this.state.page];
        if (!goods) return {};
        return {
            id: goods.id,
            image: goods.image,
            price: goods.salePrice,
            showName: goods.goodsShowDesc,
            taxation: goods.taxation,
            validity: this.state.code,
            sku: goods.sku
        }
    }
    sharePage() {
        if (!this.refs.shareView) return;
        let goods = this.list[this.state.page];
        if (!goods) return {};
        let desc = util_cools.goodDesc(goods);
        this.refs.shareView.ShareData({
            title: goods.shareTitle,
            desc: desc,
            img: goods.shareImage,
            url: `${touchBaseUrl}/join-details`,
            link: `${touchBaseUrl}/join-details`,
            shareType: 'goods',
            extra: goods.goodsShowName
        }, { validity: this.state.code, sku: goods.sku });
    }


}

const styles = StyleSheet.create({
    topBox: {
        width: deviceWidth,
        // height: px(240),
        backgroundColor: "#fff",
        paddingTop: px(20),
        paddingBottom: px(30),
    },
    contentContainerStyle: {
        paddingHorizontal: px(15)
    },
    topTitleTxt: {
        marginVertical: 30,
        fontSize: px(48),
        color: "#000",
        textAlign: "center"
    },
    topItemBox: {
        width: px(136),
        marginHorizontal: px(15)
    },
    topItem: {
        width: px(136),
        height: px(136),
        borderWidth: px(1),
        borderColor: "#fff",
        borderRadius: px(10),
        // overflow: "hidden",
        alignItems: "center",
        justifyContent: "center"
    },
    img: {
        width: px(130),
        height: px(130),
    },
    topTxt: {
        fontSize: px(24),
        color: "#999",
        marginTop: 5
    },
    sharBtn: {
        width: deviceWidth,
        height: px(98),
        backgroundColor: '#d0648f',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: px(1),
        borderTopColor: '#cecece'
    },
    shareTxt: {
        fontSize: px(34),
        marginLeft: px(20),
        color: '#fff',
        textAlign: 'center',
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
    line: {
        height: px(166),
        backgroundColor: "#fff"
    }
})