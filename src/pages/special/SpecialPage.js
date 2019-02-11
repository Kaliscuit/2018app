'use strict';

import React from 'react';

import {
    View,
    ScrollView,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Platform
} from 'react-native';

import { px, deviceWidth } from '../../utils/Ratio';
import request, { touchBaseUrl, baseUrl } from "../../services/Request";
import Page, { FootView } from "../../UI/Page"
import List from "../common/List"
import { log, logErr } from "../../utils/logs"
import Icon from "../../UI/lib/Icon"
import ImgLoad from "../../UI/lib/ImgLoad"
import base from "../../styles/Base"
import ShareView, { SHARETYPE } from "../common/ShareView"
import { config } from "../../services/Constant"
import { TrackClick } from "../../services/Track";
import { User, getShopDetail } from '../../services/Api';
import util_cools from "../../utils/tools"
import Button from "../../UI/lib/Button"
import { Header } from "../common/Header"
import TabView from 'react-native-scrollable-tab-view2'

class ShowTimer extends React.Component {

    constructor(props) {
        super();
        this.state = {
            gg: []
        }
    }

    render() {
        return <View>
            <View>
                <Icon name="dity-price" style={{ width: px(670), height: px(963) }} />
                <ScrollView ref="users"
                    style={styles.ggBox}
                    androidoverScrollMode="never"
                    pagingEnabled={true}
                    ioscanCancelContentTouches={false}
                    showsVerticalScrollIndicator={false}>
                    {this.state.gg.map((item, index) => <View style={base.inline} key={index}>
                        <Text style={styles.ggTxt}>{item.name}</Text>
                    </View>)}
                </ScrollView>
            </View>
            <Icon name="dity-promise" style={{ width: px(670), height: px(429) }} />
            <Icon name="dity-ziben" ext="jpg" style={{ width: px(670), height: px(581) }} />
            <Icon name="dity-logo" ext="jpg" style={{ width: px(670), height: px(868) }} />
        </View>
    }

    async componentDidMount() {
        try {
            let ggs = await request.get("/good-choice-pic/getShopBenefit.do");
            this.setState({ gg: ggs.dnOnThousandList })
            this.start()
        } catch (error) {
            //
        }
    }
    componentWillMount() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    timer = null;
    timeIndex = 0;
    start() {
        if (this.state.gg.length <= 0) return;
        this.setState({ curr: this.state.gg[0] })
        this.timer = setInterval(() => {
            if (!this.refs.users) return;
            this.timeIndex++;
            if (this.timeIndex > this.state.gg.length - 1) {
                this.timeIndex = 0;
                this.refs.users.scrollTo({ y: 0, animated: false });
            } else {
                this.refs.users.scrollTo({ y: px(50) * this.timeIndex });
            }
            this.setState({ curr: this.state.gg[this.timeIndex] })
        }, 3000);
    }
}

export default class extends Page {

    constructor(props) {
        super(props, {
            list: [],
            active: 0,
            code: "",
            shareImage: "",
            gg: [],
            refreshing: false,
            info: {
                topPic: [],
                bottomPic: []
            },
            loadText: "",
        })
    }
    pageHeader() {
        return <Header navigation={this.props.navigation}
            rightBtn={<TouchableOpacity onPress={this.share.bind(this)}>
                <Icon name="goodsDetailShare" style={{ width: px(40), height: px(40) }} />
            </TouchableOpacity>}
            title="超值精选商品"></Header>
    }
    pageBody() {
        return <View style={styles.box}>
            <FlatList ref="flatlist"
                data={this.state.list}
                keyExtractor={item => item[this.key] + ''}
                style={[{ width: deviceWidth, backgroundColor: "#f2f2f2" }, this.listStyle]}
                columnWrapperStyle={styles.contentStyle}
                refreshing={this.state.refreshing}
                numColumns={2}
                onRefresh={() => this.refresh()}
                onEndReached={() => this.next()}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                extraData={this.state}
                initialNumToRender={2}
                ListHeaderComponent={this.header()}
                ListEmptyComponent={this.empty()}
                ListFooterComponent={this.footer()}
            />
            <ShareView ref="shareView"
                navigation={this.props.navigation}
                code={this.state.code}
                getQrCode={() => this.getQrCode()}
                keyStr={this.state.keyStr}
                types={[SHARETYPE.WEIXIN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]} />

            <ShareView ref='shareViewItem'
                getQrCode={() => this.getQrCodeItem()}
                getQrCode2={() => this.getQrCodeItem2()}
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
        return <FootView style={{ backgroundColor: "#D0648F" }}>
            <TouchableOpacity onPress={() => this.share()}>
                <View style={styles.sharBtn}>
                    {/* <Icon name="icon-gold-share"
                        style={{ width: px(32), height: px(32) }} /> */}
                    <Text style={styles.shareTxt}>立即分享</Text>
                </View>
            </TouchableOpacity>
        </FootView>
    }
    pageIndex = -1;
    loading = false;
    loadEnd = false;
    key = "id";
    refresh() { }
    async next() {
        if (this.state.active === 1) return;
        if (this.loadEnd) return;
        if (this.loading) return;
        this.loading = true;
        this.pageIndex++;
        this.setState({ loadText: "加载中..." })
        let data = await this.load(this.pageIndex);
        this.loading = false;
        if (!data || data.items.length == 0) {
            this.loadEnd = true;
            if (this.state.list.length > this.minCount) {
                this.setState({ loadText: "已经到底了" });
                this.onEnd()
            }
            if (this.state.list.length <= this.minCount) this.setState({ loadText: "" });
            return;
        }
        this.setState({ list: this.state.list.concat(data.items) });
        if (!data.totalPages) {
            if (data.items.length < 20) {
                this.loadEnd = true;
                let txt = "已经到底了";
                if (this.state.list.length <= this.minCount) txt = "";
                this.setState({ loadText: txt });
                this.onEnd()
            }
        } else if (this.pageIndex + 1 >= data.totalPages) {
            this.loadEnd = true;
            let txt = "已经到底了";
            if (this.state.list.length <= this.minCount) txt = "";
            this.setState({ loadText: txt });
            this.onEnd()
        }
    }
    onEnd() {
        if (this.state.list.length % 2 === 1) {
            this.setState({ list: this.state.list.concat([{ id: -1 }]) })
        }
    }
    async load(start) {
        try {
            let data = await request.get("/goods/selected/list.do", { start });
            delete data.totalPages;
            return data;
        } catch (error) {
            //
        }
        return {
            totalPages: 1,
            items: []
        }
    }
    renderItem(item, index) {
        if (this.state.active === 1) {
            return <ShowTimer />
        }
        if (item.id === -1) {
            return <View style={[styles.item, { width: Platform.OS === "ios" ? px(344) : px(345), paddingRight: px(20) }]}></View>
        }
        let xx = index % 2;
        return <TouchableOpacity
            activeOpacity={1}
            key={index}
            onPress={() => this.press(item.sku)}>
            <View style={[styles.item, xx === 1 ? { width: Platform.OS === "ios" ? px(344) : px(345), paddingRight: px(20) } : null]}>
                <Image source={{ uri: item.coverImgUrl }}
                    resizeMode="stretch"
                    resizeMethod="auto"
                    style={styles.img} />
                <Text numberOfLines={1} style={styles.tit}>{item.goodsDesc}</Text>
                <Text style={styles.price}>￥{item.salePrice}</Text>
                <Button onPress={() => this.sharePage(item)} style={styles.btn} txtStyle={styles.btnTxt} value="立即分享" />
                {/* <View style={styles.btn}>
                    <Text style={styles.btnTxt}>立即分享</Text>
                </View> */}
            </View>
        </TouchableOpacity >
    }
    header() {
        return <View style={styles.content}>
            <Icon name="dity-top" ext="jpg" style={{ width: px(750), height: px(916) }} />
            <Icon name="dity-quan" ext="jpg" style={{ width: px(750), height: px(299) }} />
            <View style={styles.product}>
                <View style={[base.flex_between, { width: px(670), height: px(100) }]}>
                    <TouchableOpacity onPress={() => this.change(0)}>
                        <Text style={[styles.title, this.state.active === 0 ? styles.active : null]}>精选商品</Text>
                    </TouchableOpacity>
                    <View style={styles.line}></View>
                    <TouchableOpacity onPress={() => this.change(1)}>
                        <Text style={[styles.title, this.state.active === 1 ? styles.active : null]}>好友福利</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }
    empty() {
        return <View style={styles.empty}>
            <Text style={styles.emptyTxt}>{this.emptyTxt}</Text>
        </View>;
    }
    footer() {
        if (this.state.active === 1) {
            return <View style={styles.footBox}>
                <View style={styles.listBottom}></View>
                <View style={styles.bottom}></View>
            </View>
        }
        return <View style={styles.footBox}>
            <View style={styles.listBottom}></View>
            <View style={styles.foot}>
                <View style={styles.line2}></View>
                <Text style={styles.footTxt}>{this.state.loadText}</Text>
                <View style={styles.line2}></View>
            </View>
            <View style={styles.bottom}></View>
        </View>
    }
    press(sku) {
        this.props.navigation.navigate("SpecialDetailPage", { sku });
    }

    async onReady() {
        let cfg = await config();
        let code = "";
        try {
            code = await request.get('/qrcode/getUrlValidityTime.do');
        } catch (e) {
            await this.retry();
        }
        this.setState({
            shareImage: cfg.images['logo'],
            code: code.validity,
        })
    }

    back = []
    change(active) {
        if (active === 0) {
            this.setState({ list: this.back, active })
        } else {
            this.back = this.state.list.concat();
            this.setState({ list: [1], active })
        }
    }
    async getQrCode() {
        let shop = await getShopDetail();
        let result = await request.get('/qrcode/createBiggiftTouchQrcode.do?inviteCode=' + shop.inviteCode);

        return {
            height: result.height,
            width: result.width,
            share_img: result.showUrl,
            down_img: result.showUrl
        }
    }
    share() {
        if (!this.state.code) {
            return this.$toast('分享失败,请稍候再试')
        }
        const config = {
            title: '{shopName}分享了超值精选商品',
            desc: '{shopName}分享了超值精选商品免费赠店铺，还送399金币，拿去花！',
            img: this.state.shareImage,
            url: `${touchBaseUrl}/join-detail`,
            link: `${touchBaseUrl}/join-detail`,
            track: (type) => {
                TrackClick('ShareLuckySKU', 'ShareLuckySKUShare', '大礼包页', `分享福袋-${type}`);
            }
        }
        this.refs.shareView.ShareData(config, { validity: this.state.code });
    }
    goods = {}
    sharePage(goods) {
        if (!this.refs.shareViewItem) return;
        this.goods = goods;
        this.refs.shareViewItem.ShareData({
            title: goods.goodsDesc,
            desc: goods.goodsDesc,
            img: goods.coverImgUrl,
            url: `${touchBaseUrl}/join-details`,
            link: `${touchBaseUrl}/join-details`,
            shareType: 'goods',
            extra: goods.goodsDesc
        }, { validity: this.state.code, sku: goods.sku });
    }
    async getQrCodeItem() {
        let res1 = await request.get(`/goods/touch/createQrcode.do?id=${this.goods.gid}&sku=${this.goods.sku}&salePrice=${this.goods.salePrice}&join=1`);
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }
    async getQrCodeItem2() {
        try {
            let goods = await request.get("/goods/selected/detail.do", { sku: this.goods.sku, calltype: "app" })
            return {
                id: goods.id,
                image: goods.image,
                price: goods.salePrice,
                showName: goods.goodsShowDesc,
                taxation: goods.taxation,
                validity: this.state.code, 
                sku: goods.sku
            }
        } catch (error) {
            //   
        }
        throw new Error("分享失败");
    }
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: "#B40F66",
    },
    content: {
        backgroundColor: "#B40F66",
        alignItems: "center"
    },
    product: {
        backgroundColor: "#fff",
        borderTopLeftRadius: px(10),
        borderTopRightRadius: px(10),
        width: px(670),
        alignItems: "center",
        paddingBottom: px(30),
        overflow: "hidden"
    },
    contentStyle: {
        backgroundColor: "#B40F66",
        alignItems: "center",
        paddingLeft: px(40)
    },
    title: {
        color: "#999",
        fontSize: px(34),
        marginHorizontal: px(100)
    },
    active: {
        color: "#222"
    },
    list: {
        marginTop: px(17),
        width: px(670),
    },
    item: {
        width: px(325),
        height: px(598),
        paddingLeft: px(20),
        alignItems: 'center',
        backgroundColor: "#fff"
    },
    img: {
        width: px(305),
        borderRadius: px(10),
        height: px(400)
    },
    tit: {
        marginTop: px(15),
        fontSize: px(30),
        color: "#222"
    },
    price: {
        color: "#71043E",
        fontSize: px(32),
        marginTop: px(1),
    },
    btn: {
        marginTop: px(12),
        backgroundColor: "#B40F66",
        width: px(193),
        borderRadius: px(25),
        height: px(50),
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTxt: {
        color: "#fff",
        fontSize: px(26)
    },
    btnBottom: {
        backgroundColor: "#E3E3E3",
        height: px(80),
        width: px(670),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: px(10),
        borderBottomRightRadius: px(10)
    },
    moreTxt: {
        color: "#222",
        fontSize: px(26)
    },
    down: {
        width: px(20),
        height: px(20),
        marginLeft: px(12)
    },
    line: {
        height: px(30),
        width: px(1),
        backgroundColor: "#ccc"
    },
    sharBtn: {
        width: deviceWidth,
        height: px(98),
        backgroundColor: '#D0648F',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareTxt: {
        fontSize: px(34),
        marginLeft: px(20),
        color: '#fff',
        textAlign: 'center',
    },
    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
        height: px(169),
        paddingLeft: px(145),
        paddingRight: px(145),
        paddingTop: px(53)
    },
    modalTxt1: {
        fontSize: px(42),
        color: '#d0648f',
        fontWeight: '900'
    },
    modalTxt2: {
        fontSize: px(26),
        color: '#858385',
        marginTop: px(10),
        lineHeight: px(30)
    },
    bottom: {
        width: deviceWidth,
        backgroundColor: "#B40F66",
        height: px(166)
    },
    ggBox: {
        position: "absolute",
        left: px(120), top: px(180),
        width: px(430),
        height: px(50),
        backgroundColor: "#F2D5E4", borderRadius: px(8)
    },
    ggTxt: {
        color: "#200A1A",
        fontSize: px(24),
        height: px(50),
        lineHeight: px(50)
    },
    listBottom: {
        width: px(670),
        borderBottomLeftRadius: px(10),
        borderBottomRightRadius: px(10),
        height: px(10),
        backgroundColor: "#fff"
    },
    foot: {
        width: deviceWidth,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#B40F66",
        paddingVertical: px(30)
    },
    footTxt: {
        color: "#DE91AF",
        fontSize: px(24)
    },
    line2: {
        width: px(160),
        height: 1,
        backgroundColor: "#D0648F",
        marginHorizontal: px(30)
    },
    empty: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTxt: {
        color: "#ccc",
    },
    footBox: {
        backgroundColor: "#B40F66",
        alignItems: "center"
    }
});