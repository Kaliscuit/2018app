import React from "react";

import {
    Image,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Clipboard,
    PixelRatio,
    TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from 'react-native-style-adaptive';
import { TopHeader, Header, GradientHeader } from '../common/Header';
import { px, isIphoneX } from "../../utils/Ratio";
import Request, {get, baseUrl, touchBaseUrl, getHeader} from "../../services/Request";
import { User, getShopDetail } from "../../services/Api";
import CartList from '../../services/Cart'
import { show as toast } from '../../widgets/Toast';
import { log, logWarm } from '../../utils/logs'
import ShareView, { SHARETYPE } from '../common/ShareView'
import base from '../../styles/Base'
import Popover from '../common/Popover'
import Tabs from '../common/TabGood'
import TabView from 'react-native-scrollable-tab-view2'
import Page from '../../UI/Page'
import { GoodSpu } from './GoodSpu'
import { GoodMatter } from './GoodMatter'
import { FootView } from '../../UI/Page'
import { Good } from './Good'
import { TrackClick } from "../../services/Track";
import Tabs_ from './GoodTabs'
import util_cools from '../../utils/tools'
import { getItem } from '../../services/Storage';
import { ImagesRes } from "../../utils/ContentProvider";
import mDate from '../../utils/Date'
import Event from '../../services/Event'
import Icon from '../../UI/lib/Icon'
import { MatterTab } from '../common/matter/MatterTab';
import ShareStyle from "../..//styles/ShareStyle";
import ShareGoods from "../../share/goods"

const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class Detail extends Page {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            tabs: [{ name: '商品', show: true }, { name: '素材', show: false }],
            id: this.props.navigation.state.params.id,
            sku: this.props.navigation.state.params.sku,
            shop: '',
            current: [],
            cartNum: 0,
            imgs: [], // 查看大图的imgs
            detail: {}, // good的detail
            isPopover: false,
            buttonRect: {},
            hasMatter: false,
            spuChangeBind: false,
            list: [],
            goods: {},
            isShoping: true,
            preheatDiffTime: 0,
            preheatTime: 0,
            area: {
                province: '北京市',
                city: '北京市',
                area: '东城区',
                address: '',
                deliveryArea: '可配送',
                deliveryAreaStatus: 1,
                flag: '0'
            },
            isShowTab: false,
            st: 0,
            activity: {
                coupons: '',
                bonus: ''
            },
            everybody: [],
            link: [],
            isRecommendedLoad: true
        };
        this.timer = null;
        //this.timer1 = null;
        /*this.preheatTime = 0;
        this.preheatDiffTime = 0;
        this.isShoping = true;*/
        this._scrollY = this._scrollY.bind(this)
    }

    showTab() {
        this.setState({
            isShowTab: true
        })
    }
    hideTab() {
        this.setState({
            isShowTab: false
        })
    }
    title = "商品详情"
    pageHeader() {
        return null
    }

    pageBody() {
        return <View style={{ flex: 1, position: 'relative' }}>
            <GradientHeader
                title={this.state.hasMatter && !User.vip && this.state.goods.is_deep_stock != 1 ? null : this.title}
                ref={ref => this.gradientHeader = ref}
                navigation={this.props.navigation}
                isRightBtn={User.isLogin && this.state.goods.is_deep_stock != 1}
                rightPress={() => this.sharePage(0)}
            >
                {this.state.hasMatter && !User.vip && this.state.goods.is_deep_stock != 1 && <Tabs ref="tab" tabs={this.state.tabs} goToPage={(e) => this.goToPage(e)} />}
            </GradientHeader>
            {
                this.state.hasMatter ?
                    <TabView page={this.state.activeTab}
                        initialPage={0} locked
                        onChangeTab={(i) => this.ChangeTab(i)}
                        renderTabBar={false}>
                        <View style={{ flex: 1 }}>
                            <Good
                                navigation={this.props.navigation}
                                goods={this.state.goods}
                                current={this.state.current}
                                detail={this.state.detail}
                                imgs={this.state.imgs}
                                area={this.state.area}
                                activity={this.state.activity}
                                everybody={this.state.everybody}
                                link={this.state.link}
                                isRecommendedLoad={this.state.isRecommendedLoad}
                                cartShow={this.cartShow.bind(this)}
                                onLoadEnd={this.onLoadEnd.bind(this)}
                                showPopover={this.showPopover.bind(this)}
                                showTab={this.showTab.bind(this)}
                                hideTab={this.hideTab.bind(this)}
                                getArea={this.getArea.bind(this)}
                                getActivities={this.getActivities.bind(this)}
                                scrollCallback={this._scrollY}
                                recommended={this.recommended.bind(this)}
                            />
                            {
                                this.state.goods && this.state.goods.flag == '0' && this.state.area && this.state.area.deliveryAreaStatus == 0 && this.state.isShowTab && <View style={[styles.footerArea, base.inline, { bottom: isIphoneX() ? px(150) : px(90) }]}>
                                    <Text allowFontScaling={false} style={styles.footerAreaTxt}>
                                        该商品在该地区暂不支持配送，非常抱歉！
                                    </Text>
                                </View>
                            }
                            {
                                this.state.goods && this.state.goods.flag == '1' && <View style={[styles.footerArea, base.inline, { bottom: isIphoneX() ? px(150) : px(90) }]}>
                                    <Text allowFontScaling={false} style={styles.footerAreaTxt}>
                                        商品已下架，不如看看其他商品吧~
                                    </Text>
                                </View>
                            }
                            {this.renderFooter()}
                        </View>
                        <MatterTab
                            show={this.state.tabs[1].show}
                            navigation={this.props.navigation}
                            //sharePage={this.sharePage.bind(this)}
                            goods={this.state.goods}
                            type={0}
                        //goodName={`${this.state.goods.goodsShowName}+${this.state.goods.goodsShowDesc}`}
                        //list={this.state.list}
                        //refreshing={this.state.refreshing}
                        //refresh={this.refresh.bind(this)}
                        //loadNext={this.loadNext.bind(this)}
                        //onLayout={this.onLayout.bind(this)}
                        //switchTxt={this.switchTxt.bind(this)}
                        //_onScroll={this._onScroll.bind(this)}
                        />
                    </TabView> : <View style={{ flex: 1 }}>
                        <Good
                            navigation={this.props.navigation}
                            goods={this.state.goods}
                            current={this.state.current}
                            detail={this.state.detail}
                            imgs={this.state.imgs}
                            area={this.state.area}
                            activity={this.state.activity}
                            everybody={this.state.everybody}
                            link={this.state.link}
                            isRecommendedLoad={this.state.isRecommendedLoad}
                            cartShow={this.cartShow.bind(this)}
                            onLoadEnd={this.onLoadEnd.bind(this)}
                            showPopover={this.showPopover.bind(this)}
                            showTab={this.showTab.bind(this)}
                            hideTab={this.hideTab.bind(this)}
                            getArea={this.getArea.bind(this)}
                            getActivities={this.getActivities.bind(this)}
                            scrollCallback={this._scrollY}
                            recommended={this.recommended.bind(this)}
                        />
                        {
                            this.state.goods && this.state.goods.flag == '0' && this.state.area && this.state.area.deliveryAreaStatus == 0 && this.state.isShowTab && <View style={[styles.footerArea, base.inline, { bottom: isIphoneX() ? px(150) : px(90) }]}>
                                <Text allowFontScaling={false} style={styles.footerAreaTxt}>
                                    该商品在该地区暂不支持配送，非常抱歉！
                                </Text>
                            </View>
                        }
                        {
                            this.state.goods && this.state.goods.flag == '1' && <View style={[styles.footerArea, base.inline, { bottom: isIphoneX() ? px(150) : px(90) }]}>
                                <Text allowFontScaling={false} style={styles.footerAreaTxt}>
                                    商品已下架，不如看看其他商品吧~
                                </Text>
                            </View>
                        }
                        {this.renderFooter()}
                    </View>
            }

            <ShareView ref='shareView'
                getQrCode2={() => this.getQrCode2()}
                getQrCode={() => this.getQrCode()}
                QRCodeType={util_cools.isNewAndroid() ? "old" : "product"}
                navigation={this.props.navigation}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
                <ShareGoods money={this.state.goods.benefitMoney} />
            </ShareView>
            <GoodSpu
                goods={this.state.goods}
                area={this.state.area}
                ref="goodSpu"
                st={this.state.st}
                current={this.state.current}
                isShoping={this.state.isShoping}
                preheatDiffTime={this.state.preheatDiffTime}
                preheatTime={this.state.preheatTime}
                navigation={this.props.navigation}
                getData={this.getData.bind(this)}
                changeCartNum={this.changeCartNum.bind(this)}
                spuChangeBind={this.spuChangeBind.bind(this)}
                changeShopping={this.changeShopping.bind(this)}
                getArea={this.getArea.bind(this)}
                sharePage={this.sharePage.bind(this)}
            />
            <Popover
                style={{ backgroundColor: '#000' }}
                isVisible={this.state.isPopover}
                fromRect={this.state.buttonRect}
                placement={'top'}
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
        </View>
    }

    renderFooterBtn(extraStyles, txt) {
        return <View style={[styles.footerBuy, extraStyles]}>
            <Text allowFontScaling={false} style={[styles.footerBuyTxt]}>
                {txt}
            </Text>
        </View>
    }
    /**
     * goods.flag == '1' 商品下架
     * goods.flag == '0' 商品在架
     * area.deliveryAreaStatus == 0 暂不配送
     * area.deliveryAreaStatus == 1 可配送
     * area.limitStock == 0 库存为0
     * area.limitStock > 0 库存正常
     * User.vip && User.isLogin    vip
     * User.isLogin && !User.vip   店主
     * !User.isLogin && !User.vip  c
     *
     * 下架商品：     去店铺查看更多商品
     * 在架商品：
     * 店主:
     *    left：
     *     可配送无库存：   已抢光
     *     不可配送无库存： 暂不配送
     *     不可配送有库存： 暂不配送
     *     可配送有库存：   自购省
     *    right:           分享赚（深库存商品隐藏）
     * vip:
     *     可配送无库存：   已抢光
     *     不可配送无库存： 暂不配送
     *     不可配送有库存： 暂不配送
     *     可配送有库存：
     *    left:            加入购物车(预售商品隐藏)
     *    right:           立即购买
     * c:                  立即购买
     */
    renderFooter() {
        if (!this.state.goods || !this.state.area) return null;
        const { area, goods } = this.state;
        return <FootView>
            <View style={styles.footer}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => this.goCart()}>
                    <View style={styles.footerCart}>
                        <Icon
                            name="icon-detail-cart"
                            style={{ width: px(44), height: px(44) }} />
                        <View style={[styles.cartTxt, CartList.data.goods_count < 10 ? styles.footerCartTxt : styles.footerCartTxt1]}>
                            <Text allowFontScaling={false} style={styles.footerCartTxt_}>
                                {CartList.data.goods_count}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {
                    goods.flag == '1' &&
                    <TouchableWithoutFeedback activeOpacity={0.8} onPress={() => this.goIndex()}>
                        {this.renderFooterBtn(styles.bgMain, '去店铺查看更多商品')}
                    </TouchableWithoutFeedback>
                }
                {
                    goods.flag == '0' &&
                    <View style={[base.inline, { flex: 1 }]}>
                        {
                            area.deliveryAreaStatus == 0 &&
                            this.renderFooterBtn(styles.bgGray, '暂不配送')
                        }
                        {
                            area.deliveryAreaStatus == 1 && area.limitStock == 0 &&
                            this.renderFooterBtn(styles.bgGray, '已抢光')
                        }
                        {
                            area.deliveryAreaStatus == 1 && area.limitStock > 0 &&
                            <View style={[base.inline, { flex: 1 }]}>
                                {
                                    !User.vip &&
                                    <TouchableWithoutFeedback onPress={() => this.cartShow()}>
                                        {
                                            User.isLogin ?
                                                this.renderFooterBtn(styles.bgBlue, `自购省￥${util_cools.parsePrice(goods.benefitMoney) || 0}`)
                                                :
                                                this.renderFooterBtn(styles.bgBlue, '立即购买')
                                        }
                                    </TouchableWithoutFeedback>
                                }
                                {
                                    User.vip && area.preSaleYn == 'N' &&
                                    <TouchableWithoutFeedback onPress={() => this.vipOpen(0)}>
                                        {this.renderFooterBtn(styles.bgBlue, '加入购物车')}
                                    </TouchableWithoutFeedback>
                                }
                                {
                                    User.vip && User.isLogin &&
                                    <TouchableWithoutFeedback activeOpacity={0.8} onPress={() => this.vipOpen(1)}>
                                        {this.renderFooterBtn(styles.bgMain, '立即购买')}
                                    </TouchableWithoutFeedback>
                                }
                            </View>
                        }
                        {
                            !User.vip && User.isLogin && this.state.goods.is_deep_stock != 1 &&
                            <TouchableWithoutFeedback onPress={() => this.sharePage(1)}>
                                {this.renderFooterBtn(styles.bgMain, `分享赚￥${util_cools.parsePrice(goods.benefitMoney) || 0}`)}
                            </TouchableWithoutFeedback>
                        }


                    </View>
                }
            </View>
        </FootView>
    }
    vipOpen(st) {
        this.setState({ st })
        this.cartShow();
    }

    async onReady() {
        let shop = await getShopDetail();
        this.setState({
            shop: shop
        });
        await this.getData(this.state.sku)

        this.reload = this.reload.bind(this);
        Event.on("app.back", this.reload);
    }
    /**
     * 重载界面
     */
    reload() {
        this.getData(this.state.sku)
    }

    componentWillUnmount() {
        Event.off("app.back", this.reload);
    }

    goToPage(i) {
        let tabs = this.state.tabs
        tabs.forEach((item, index) => {
            tabs[index].show = false
            if (i == index) {
                tabs[i].show = true;
                return;
            }
        })
        if (i == 1) {
            this.gradientHeader.setNativeProps(parseInt(px(750)));
        }
        this.setState({
            activeTab: i, tabs
        })
    }

    ChangeTab(i) {
        //this.state.spuChangeBind && i == 1 && this.refresh() //
        this.refs.tab && this.refs.tab.set(i.i)
    }

    spuChangeBind() {
        this.setState({
            spuChangeBind: true
        })
    }

    showImage(index) {
        if (this.timer) return;
        this.timer = setTimeout(() => {
            let list = this.state.list.filter((item, i) => {
                item.show = i >= index - 2 && i < index + 3
                return item;
            })
            this.setState({ list })
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 200);
    }

    _scrollY(y) {
        this.gradientHeader.setNativeProps(y)
    }


    /**
     * 分享2
     */
    sharePage(b) {
        if (!this.refs.shareView) return;
        let goods = this.state.goods, area = this.state.area;
        if (area.salePrice) {
            goods.salePrice = area.salePrice;
        }
        let desc = util_cools.goodDesc(goods);
        this.refs.shareView.Share({
            title: this.state.goods.shareTitle,
            desc: desc,
            img: this.state.goods.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${this.state.goods.id}`,
            link: `${touchBaseUrl}/goods-detail?id=${this.state.goods.id}`,
            track: (type) => {
                if (b) {
                    TrackClick('SKUdetailpage', `SKUdetailpageShare1-${this.state.goods.id}`, '商品详情页', `分享商品-${type}-${this.state.goods.id}`);
                } else {
                    TrackClick('SKUdetailpage', `SKUdetailpageShare-${this.state.goods.id}`, '商品详情页', `分享商品-${type}-${this.state.goods.id}`);
                }
            },
            shareType: 'goods',
            extra: this.state.goods.goodsShowName
        });
    }

    async getData(sku) {
        let goods = {};
        try {
            if (sku) {
                goods = await Request.get(`/goods/detail.do`, { sku: sku });
            } else {
                goods = await Request.get(`/goods/detail.do`, { id: this.state.id });
            }
            this.setState({
                isShoping: true
            })
            if (goods.salesTimeDiff > 0) {
                this.setState({
                    isShoping: false,
                    preheatDiffTime: goods.salesTimeDiff,
                    preheatTime: Date.now()
                })
            }
            let cartNum = 0;
            if (User.isLogin) {
                cartNum = CartList.data.goods_count;
            }
            await this.getArea(goods.id, goods)
            let current = []
            //goods.salesEndTimeDiff = '4546576'
            goods.treeInfo && goods.treeInfo.tree_current.map(item => {
                current.push(item.attr_value)
            })
            this.betterImage(goods)
            this.setState({
                goods,
                current,
                cartNum,
                detail: goods.detail
            });
        } catch (e) {
            toast(e.message || "内容不存在");
            //this.props.navigation.goBack();
        }

        try {
            // 用户登录调用接口查看用户是否有素材入口
            if (User.isLogin && goods.sku) {
                let haveMatter = await Request.get(`/xczin/front/subject/have.do?sku=${goods.sku}`);
                this.setState({hasMatter: haveMatter})
            } 
        } catch (e){
            log(e.message)
        }
    }

    async getArea(id, goods) {
        let area = {}
        let uid = getHeader('uid')
        let selectAddress = JSON.parse(await getItem(`selectAddress${uid}`))
        try {
            //area = await Request.get(`/goods/deliveryArea.do?id=${selectAddress.id || 0}&prodId=${id}&province=${selectAddress.province || ''}&city=${selectAddress.city || ''}&district=${selectAddress.district || ''}&detail=${selectAddress.detail || ''}`)
            if (selectAddress) {
                area = await Request.get(`/goods/deliveryArea.do?addressId=12345&prodId=${id}&province=${selectAddress.province || ''}&city=${selectAddress.city || ''}&area=${selectAddress.district || ''}&address=${selectAddress.detail || ''}`)
            } else {
                area = await Request.get(`/goods/deliveryArea.do?addressId=12345&prodId=${id}&province=${''}&city=${''}&area=${''}&address=`)
            }
            let skuType = goods ? goods.skuTypeTwo : this.state.goods.skuTypeTwo;
            if (skuType == 'suning' && User.isLogin) {
                await this.getActivities(id, area)
            }
            this.setState({
                area
            });
        } catch (e) {
            toast(e.message)
        }
    }
    async getActivities(id, area) {
        try {
            let res = await Request.get(`/coupon/getActivities.do?prodId=${id}&city=${area.city}&province=${area.province}&district=${area.area}`)
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
    /**
     * 分享2的获取二维码方法
     */
    async getQrCode() {
        let salePrice = this.state.area.salePrice ? this.state.area.salePrice : this.state.goods.salePrice;
        let res1 = await get(`/goods/touch/createQrcode.do?id=${this.state.goods.id}&salePrice=${salePrice}&type=2&join=0`);
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }
    async getQrCode2() {
        return {
            id: this.state.goods.id,
            image: this.state.goods.image,
            price: this.state.goods.salePrice,
            showName: this.state.goods.goodsShowDesc,
            taxation: this.state.goods.taxation,
            temai: this.state.goods.salesTime,
            temaiTxt: this.state.goods.salesTimeStr,
            temaiEnd: this.state.goods.salesEndTime,
            temaiEndTxt: this.state.goods.salesEndTimeStr
        }
    }

    cartShow(flag) {
        if (flag != 'spu' && !User.isLogin) {
            this.go('LoginPage');
            return;
        }
        this.refs.goodSpu && this.refs.goodSpu.Open();
    }

    changeCartNum = (num) => {
        this.setState({
            cartNum: num
        });
    }
    goCart() {
        TrackClick('SKUdetailpage', 'SKUdetailpageCart', '商品详情页', '加入购物车');
        CartList.update();
        this.go('ShoppingCartContentPage', {
            isNeedBack: true
        });
    }

    betterImage(goods) {
        let imgs = [];
        try {
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
                            logWarm(e.message)
                        }
                    }
                    item.index = index;
                    item.currIndex = index;
                    item.name = 'mobile_detail';
                    item.show = false;
                    item.img = require('../../images/img');
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
                        item.img = require('../../images/img');
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
                        item.img = require('../../images/img');
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
                        item.img = require('../../images/img');
                        return item;
                    });
                    imgs = imgs.concat(goods.detail.usages.list)
                }
            }

            this.setState({
                imgs
            });
        } catch (e) {
            //
        }
    }

    onLoadEnd(show, index) {
        if (show) {
            //加载下一个
            const img = this.state.imgs[index + 1];
            if (!img) return;
            try {
                let obj = Object.assign({}, this.state.detail);
                const item = obj[img.name].list[img.currIndex];
                item.show = true;
                item.img = item.image;
                this.setState({ detail: obj })
            } catch (e) {
                log(e.message);
            }
        }
    }

    showPopover(copyTxt, re) {
        re.measure((ox, oy, width, height, px, py) => {
            this.setState({
                copyTxt: copyTxt,
                isPopover: true,
                buttonRect: { x: px, y: py, width: width, height: height }
            });
        });
    }
    changeShopping() {
        this.setState({
            isShoping: true
        })
    }

    goIndex() {
        this.go('ShopPage', {
        });
    }

    async recommended(e) {
        this.setState({ isRecommendedLoad: true })
        const result = await get(`/goods/getGoodsDetailRecommendList.do?sku=${this.state.goods.sku}&sn=${this.state.goods.id}&recType=goodsDetail`);
        // const result = await get(`/goods/getGoodsDetailRecommendList.do?sku=040378236A221&sn=${this.state.goods.id}&recType=goodsDetail`);

        this.setState({
            link: result.productDetailGuess || [],
            everybody: result.productDetailAllBuy || [],
            isRecommendedLoad: false
        })
    }
}

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: '#fbfafc'
    // },
    footer: {
        width: px(750),
        height: px(90),
        flexDirection: 'row'
    },
    footerCart: {
        width: px(130),
        height: px(90),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#fbfafc'
    },
    cartTxt: {
        position: 'absolute',
        top: px(16),
        left: px(75),
        borderRadius: px(12),
        height: px(24),
        borderWidth: 1,
        borderColor: '#d0648f',
        backgroundColor: '#fbfafc',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerCartTxt: {
        width: px(24),
        //lineHeight: px(22),
        //paddingHorizontal: px(8),
        //paddingVertical: px(1),
        //paddingBottom: px(6),
    },
    footerCartTxt1: {
        //lineHeight: px(18),
        paddingHorizontal: px(8),
        //paddingVertical: px(1),
        //paddingBottom: px(3),
    },
    footerCartTxt_: {
        fontSize: px(16),
        color: '#d0648f',
        textAlign: 'center',
    },
    footerBuy: {
        flex: 1,
        //backgroundColor: '#56beec',
        //width: px(310),
        height: px(90),
        justifyContent: 'center',
        alignItems: 'center'
    },
    bgMain: {
        backgroundColor: '#d0648f',
    },
    bgBlue: {
        backgroundColor: '#56beec',
    },
    bgGray: {
        backgroundColor: '#b2b3b5'
    },
    footerBuyTxt: {
        fontSize: px(30),
        color: '#fff',
        includeFontPadding: false
    },
    footerArea: {
        width: px(750),
        height: px(72),
        backgroundColor: 'rgba(248,240,242,0.7)',
        position: 'absolute',
        bottom: px(90),
        left: 0,
        zIndex: 111
    },
    footerAreaTxt: {
        color: '#e86d78',
        fontSize: px(28)
    }
});

