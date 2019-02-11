'use strict';

import React from 'react';

import {
    View,
    Text,
    Platform,
    FlatList,
    Image,
    StyleSheet
} from 'react-native';
import ShareView, { SHARETYPE } from "../common/ShareView";
import { User } from "../../services/Api";
import util_cools from '../../utils/tools';
import request, { baseUrl, touchBaseUrl } from '../../services/Request';
import { TrackClick } from '../../services/Track';
import { px, deviceWidth } from "../../utils/Ratio";
import mDate from "../../utils/Date"
import ShareStyle from '../../styles/ShareStyle';
import ShareGoods from "../../share/goods"

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            goods: {}
        }
    }
    render() {
        return <ShareView
            ref='shareView'
            navigation={this.props.navigation}
            getQrCode={() => this.getQrCode()}
            getQrCode2={() => this.getQrCode2()}
            QRCodeType={util_cools.isNewAndroid() ? "old" : "product"}
            types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
            <ShareGoods money={this.state.goods.benefitMoney} />
        </ShareView>
    }
    /**
     * 分享2的获取二维码方法
     */
    async getQrCode() {
        const { goods } = this.state
        let res1 = await request.get(`/goods/touch/createQrcode.do?id=${goods.id}&salePrice=${goods.salePrice}&type=2&&join=0`)
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }

    async getQrCode2() {
        const tabType = this.state.goods.tabType;
        const txt = this.state.goods.title;
        let showTxt = "";
        if (tabType === "today") {
            let now = new Date().getHours();
            let hour = txt.split(":")[0];
            if (now > hour * 1) {
                showTxt = `${mDate.getOtherDate("MM月dd日", 2)}${txt}结束`
            } else {
                showTxt = `${mDate.getOtherDate("MM月dd日", 0)}${txt}开抢`
            }
        }
        if (tabType === "tomorrow") {
            let txt2 = txt.replace("明日", "")
            showTxt = `${mDate.getOtherDate("MM月dd日", 0)}${txt2}开抢`
        }
        if (tabType === "yesterday_time") {
            showTxt = `${mDate.getOtherDate("MM月dd日", 1)}${txt}结束`
        }
        if (tabType === "yesterday") {
            showTxt = `${mDate.getOtherDate("MM月dd日", 1)}${txt}结束`
        }
        let image = this.state.goods.original_img || this.state.goods.mainImage;
        image = util_cools.cutImage(image, 640, 0);
        return {
            id: this.state.goods.id,
            image: image,
            price: this.state.goods.salePrice,
            showName: this.state.goods.goodsShowDesc,
            taxation: this.state.goods.taxation,
            temai: this.state.goods.salesTime,
            temaiTxt: this.state.goods.salesTimeStr,
            temaiEnd: this.state.goods.salesEndTime,
            temaiEndTxt: this.state.goods.salesEndTimeStr,
            showTxt
        }
    }

    share(goods, tab, type_) { // type_ 新加，区分时间轴和其他商品用来加埋点
        this.setState({
            goods: goods
        })
        let desc = util_cools.goodDesc(goods);
        this.refs.shareView.Share({
            title: goods.shareTitle,
            desc: desc,
            img: goods.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            link: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            track: (type) => {
                if (type_ == 'shop') {
                    let index = goods.id;
                    if (!tab) {
                        TrackClick('Home-SKUlist', `Home-SKUlistShare-${index}`, '首页', `分享商品-${type}-${index}`);
                    } else {
                        TrackClick('Channel-SKUlist', `Channel-SKUlistShare-${index}`, '频道页', `分享商品-${type}-${index}`);
                    }
                } else {
                    TrackClick('Home-TimeAxis', `Share-${goods.sku}`, '首页', `分享-${type}-${type_}-${goods.sku}`);
                }
            },
            shareType: 'goods',
            extra: goods.goodsShowName
        });
    }
}