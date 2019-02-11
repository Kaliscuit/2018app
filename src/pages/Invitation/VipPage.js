'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Dimensions,
    ScrollView,
    Clipboard
} from 'react-native';
import { Header } from '../common/Header'
import { px, deviceWidth, isIphoneX } from '../../utils/Ratio';
import Page, { FootView } from "../../UI/Page"
import { log, logErr, logWarm } from '../../utils/logs'
import base from "../../styles/Base"
import ShareView, { SHARETYPE } from "../common/ShareView";
import Icon from "../../UI/lib/Icon"
import Button, { EButton } from "../../UI/lib/Button"
import request, { domain, touchBaseUrl } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { getShopDetail } from "../../services/Api"
import Span from "../../UI/lib/Span"

class GoodItem extends React.Component {

    render() {
        const item = this.props.item;
        return <View style={goodStyle.good}>
            <Image resizeMode='contain' style={goodStyle.img} source={{ uri: item.image, cache: "force-cache" }} />
            <View style={goodStyle.info}>
                <Span numberOfLines={1} style={goodStyle.tit}>{item.goodsShowName}</Span>
                <Span numberOfLines={2} style={goodStyle.txt}>{item.goodsShowDesc}</Span>
                <Span style={goodStyle.quan}>VIP 新用户在APP用券再减{item.couponMoney}元</Span>
                <View style={[base.inline_between, goodStyle.ms]}>
                    <Span style={goodStyle.money}>
                        达令家价 ¥<Span style={goodStyle.money2}>{item.salePrice}</Span>
                    </Span>
                    <TouchableOpacity onPress={() => this.props.share(item)}>
                        <Icon name="icon-index-shareNew" style={goodStyle.share} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }
}
const goodStyle = StyleSheet.create({
    good: {
        backgroundColor: "#fff",
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        overflow: "hidden",
        flexDirection: 'row',
        height: 140,
    },
    img: {
        width: 140,
        height: 140,
    },
    info: {
        width:210,
        padding: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tit: {
        marginTop: 3,
        fontSize: px(28),
        color: "#333",
    },
    txt: {
        marginTop: 7,
        lineHeight: 14,
        fontSize: px(24),
        color: "#858385",
    },
    quan: {
        marginTop: 20,
        fontSize: px(24),
        color: "#ed3f59",
    },
    ms: {
        marginTop: 10,
        width: px(380),
    },
    money: {
        fontSize: px(22),
        color: "#222",
    },
    money2: {
        fontSize: px(28),
        color: "#222",
    },
    share: {
        width: 20,
        height: 20,
    }
})
export default class extends Page {

    constructor(props) {
        super(props, {
            code: "",
            list: []
        });
    }
    pageHeader() {
        return <Header navigation={this.props.navigation}
            title="邀请VIP" rightBtn={<TouchableOpacity onPress={() => this.remark()}>
                <Span>帮助</Span>
            </TouchableOpacity>}></Header>
    }
    //750*400
    pageBody() {
        return <View>
            <ScrollView style={style.bg}>
                <Icon name="vip-top" style={style.topImg} />
                <View style={style.code}>
                    <Span style={style.codeTxt}>我的店铺邀请码：{this.state.code}</Span>
                    <EButton onPress={this.copy.bind(this)} style={style.cpBtn} txtStyle={style.cpTxt} value="复制邀请码" />
                </View>
                <View style={style.info}>
                    <View style={style.titleContent}>
                        <View style={style.block}/>
                        <Span style={style.titleText}>邀请好友注册VIP成功，您将获得以下福利：</Span>
                    </View>
                    <Span style={style.tit}>好友下单，您可立享奖励</Span>
                    <Span style={style.txts}>好友在平台下单成功，每单您都会获得奖励。</Span>

                    <Span style={style.tit}>好友分享，您可再享奖励</Span>
                    <Span style={style.txts}>好友分享商品链接给他人，他人下单成功，每单您也同样会获得奖励。</Span>

                    <View style={style.titleContent}>
                        <View style={style.block}/>
                        <Span style={style.titleText}>邀请好友注册VIP成功，好友将获得以下福利：</Span>
                    </View>
                    <Span style={style.txts1}>好友注册成为VIP，将会立即获得2张价值5元的优惠券。</Span>
                </View>

                <Icon name="vip-head" style={style.headImg} />
                <View style={style.list}>
                    {this.state.list.map((item) => <GoodItem key={item.sku} item={item} share={this.share.bind(this)} />)}
                </View>
                <View style={style.line}></View>
            </ScrollView>
            <ShareView ref="shareView"
                getQrCode={() => this.getQrCode()}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.PIC]} >
                <Span style={{ fontSize: 20 }}>邀请VIP</Span>
                <Span>好友通过您的邀请注册即可成为您的VIP</Span>
            </ShareView>
            <ShareView ref="shareView2"
                getQrCode={() => this.getQrCode2()}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.PIC]} >
                <Span style={{ fontSize: 20 }}>邀请VIP</Span>
                <Span>好友通过您的邀请注册即可成为您的VIP</Span>
            </ShareView>
        </View>
    }

    pageFooter() {
        return <FootView style={[base.inline]}>
            <Button style={style.btn} onPress={() => this.sharePage()} value="立即邀请" />
        </FootView>
    }

    async onReady() {
        try {
            let result = await request.get("/shop/vipSkus.do");
            let shopDetail = await getShopDetail();
            this.setState({
                code: shopDetail.inviteCode,
                list: result.goodsList
            })
        } catch (error) {
            toast(error.message);
        }
    }

    copy() {
        Clipboard.setString(this.state.code);
        this.$toast("邀请码已复制，可直接粘贴发送")
    }
    remark() {
        this.go_("VipRemarkPage")
    }
    id = 0;
    async getQrCode() {
        const { goods } = this.state
        let res1 = await request.get(`/goods/touch/createQrcode.do?id=${this.id}&join=0`)
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }
    async getQrCode2() {
        let img = {};
        try {
            img = await request.get("/vip/touch/createVipQrcode.do");
        } catch (error) {
            //
        }
        return {
            share_img: img.showUrl,
            down_img: img.showUrl,
        }
    }
    sharePage() {
        this.refs.shareView2.Share({
            title: "{shopName}邀请您成为VIP,尊享更多优惠!",
            desc: "赶快注册成为VIP,登录APP领取更多优惠吧~",
            img: "http://img.daling.com/st/dalingjia/wechat/vip_wechat.jpg",
            url: `${touchBaseUrl}/invite-vip`,
            link: `${touchBaseUrl}/invite-vip`,
            track: () => { }
        });
    }

    share(goods) {
        this.id = goods.id;
        this.refs.shareView.Share({
            title: `${goods.goodsShowName}${goods.goodsShowDesc}`,
            desc: '嗨，我看到一个好东西，在达令家有卖哦，正品低价，赶快来看看吧~',
            img: goods.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            link: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            track: () => { }
        });
    }

}
const style = StyleSheet.create({
    bg: {
        backgroundColor: "#fff",
    },
    topImg: {
        width: px(750),
        height: px(499),
    },
    code: {
        paddingTop: 20,
        alignItems: 'center',
        backgroundColor: "#fff"
    },
    codeTxt: {
        fontSize: 16,
        color: "#333"
    },
    cpBtn: {
        marginTop: 17,
        borderColor: "#ceae6a",
        height: 30,
        width: 130
    },
    cpTxt: {
        color: "#CEAE6A",
        fontSize: 14,
    },
    info: {
        backgroundColor: "#fff",
        paddingLeft:px(38),
        paddingRight:px(55),
        marginTop:px(20),
    },
    tit: {
        marginTop: px(20),
        color: "#ceae6a",
        fontSize: px(28),
        fontWeight:'bold'
    },
    txts: {
        marginTop:px(5),
        color: "#ceae6a",
        fontSize: px(28),
    },
    txts1: {
        marginTop:px(23),
        color: "#ceae6a",
        fontSize: px(28),
    },
    headImg: {
        marginTop: px(80),
        width: deviceWidth,
        height: px(170),
        backgroundColor: "#fff",
    },
    btn: {
        width: deviceWidth,
        backgroundColor: "#ceae6a"
    },
    line: {
        width: deviceWidth,
        height: isIphoneX() ? 172 : 138,
        backgroundColor: "#162b53",
    },
    list: {
        backgroundColor: "#162b53",
    },
    titleContent:{
        flexDirection:'row',
        // height:px(40),
        alignItems:'center',
        marginTop:px(55),
    },
    block:{
        height:px(16),
        width:px(16),
        backgroundColor:'#CEAE6A',
        transform:[{rotate:'45deg'}]
    },
    titleText:{
        fontSize:px(30),
        color:'#CEAE6A',
        marginLeft:px(9),
        fontWeight:'bold'
    }
})