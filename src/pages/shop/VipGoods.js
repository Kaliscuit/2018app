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

class GoodItem extends React.Component {

    render() {
        const item = this.props.item;
        return <View style={goodStyle.good}>
            <TouchableOpacity onPress={() => this.props.go()}>
                <Image style={goodStyle.img} source={{ uri: item.image }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.go()}>
                <View style={goodStyle.info}>
                    <Text numberOfLines={1} style={goodStyle.tit}>{item.goodsShowName}</Text>
                    <Text numberOfLines={2} style={goodStyle.txt}>{item.goodsShowDesc}</Text>
                    <Text style={goodStyle.quan}>VIP 新用户在APP用券再减{item.couponMoney}元</Text>
                    <View style={[base.inline_between, goodStyle.ms]}>
                        <Text style={goodStyle.money}>
                            达令家价 ¥<Text style={goodStyle.money2}>{item.salePrice}</Text>
                        </Text>
                        {/* <TouchableOpacity onPress={() => this.props.share(item)}>
                            <Icon name="icon-index-shareNew" style={goodStyle.share} />
                        </TouchableOpacity> */}
                    </View>
                </View>
            </TouchableOpacity>
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
        padding: 10,
        width:210,
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
    title = "VIP专享"
    pageBody() {
        return <View>
            <ScrollView style={style.bg}>
                <Icon name="vip_top2" style={style.headImg} />
                <View style={style.list}>
                    {this.state.list.map((item) => <GoodItem go={() => this.go_("DetailPage", { sku: item.sku })} key={item.sku} item={item} share={this.share.bind(this)} />)}
                </View>
                <View style={style.line}></View>
            </ScrollView>
            <ShareView ref="shareView"
                getQrCode={() => this.getQrCode()}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.PIC]} >
                <Text style={{ fontSize: 20 }}>邀请VIP</Text>
                <Text>好友涌过您的邀请注册即可成为您的VIP</Text>
            </ShareView>
        </View>
    }

    async onReady() {
        try {
            let result = await request.get("/shop/vipSkus.do");
            this.setState({
                code: result.inviteCode,
                list: result.goodsList
            })
        } catch (error) {
            toast(error.message);
        }
    }

    copy() {
        Clipboard.setString(this.state.code);
        this.$toast("复制成功")
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

    share(goods) {
        this.id = goods.id;
        this.refs.shareView.Share({
            title: `${goods.goodsShowName}${goods.goodsShowDesc}`,
            desc: '嗨，我看到一个好东西，在达令家有卖哦，正品低价，赶快来看看吧~',
            img: goods.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${goods.goodsId}`,
            link: `${touchBaseUrl}/goods-detail?id=${goods.goodsId}`,
            track: () => { }
        });
    }

}
const style = StyleSheet.create({
    bg: {
        backgroundColor: "#fff",
    },
    headImg: {
        width: px(750),
        height: px(450),
        backgroundColor: "#fff",
    },
    btn: {
        width: deviceWidth,
        backgroundColor: "#ceae6a"
    },
    line: {
        width: deviceWidth,
        height: isIphoneX() ? 166 : 132,
    },
    list: {
        backgroundColor: "#162b53",
    },
})