'use strict';

import React from 'react';

import {
    View,
    ScrollView,
    Image,
    Text
} from 'react-native';
import { User, getShopDetail } from '../../services/Api';
import { px } from '../../utils/Ratio';
import request, { touchBaseUrl, baseUrl, get } from "../../services/Request";
import { config } from '../../services/Constant';
import { shareToSession, isWXAppInstalled } from '../../services/WeChat';
import { show as toast } from '../../widgets/Toast';
import ShareView, { SHARETYPE } from '../common/ShareView'
import { TopHeader } from '../common/Header'
import {FootView} from '../../UI/Page'
import {TrackClick} from "../../services/Track";

export default class extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            image: '',
            shareImage: '',
            width: 0,
            height: 0,
            code: ''
        }
    }

    render() {
        return <View style={{ flex: 1 }}>
            <TopHeader navigation={this.props.navigation}
                title="分享达令家精选商品"></TopHeader>
            <ScrollView style={{ flex: 1 }}>
                <Image source={{ uri: this.state.image }}
                    style={{ width: px(750), height: px(750 * this.state.height / this.state.width) }} />
            </ScrollView>
            <FootView style={{ borderTopWidth: px(1), borderTopColor: '#edeced', width:px(750) }}>
                <Text allowFontScaling={false} style={{
                    height: px(50),
                    width:px(750),
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    color: '#e5626d',
                    fontSize: px(20),
                    includeFontPadding: false,
                    paddingTop: px(15)
                }}>分享好友，共同开启时尚体验之旅</Text>
                <Text allowFontScaling={false}
                    onPress={() => this.share()}
                    style={{
                        height: px(90),
                        width:px(750),
                        textAlign: 'center',
                        backgroundColor: '#e5626d',
                        color: '#fff',
                        fontSize: px(30),
                        includeFontPadding: false,
                        paddingTop: px(28)
                    }}>马上分享</Text>
            </FootView>
            <ShareView ref="shareView"
                navigation={this.props.navigation}
                code={this.state.code}
                getQrCode={() => this.getQrCode()}
                keyStr={this.state.keyStr}
                types={[SHARETYPE.WEIXIN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}
            ></ShareView>
        </View>;
    }

    async componentDidMount() {
        let cfg = await config();
        Image.getSize(cfg.images['packs'], (w, h) => {
            this.setState({
                image: cfg.images['packs'],
                width: w,
                height: h,
            });
        });
        try {
            let code = await request.get('/qrcode/getUrlValidityTime.do');
            this.setState({
                shareImage: cfg.images['logo'],
                code: code.validity,
            })
        } catch (e) {
            this.setState({
                shareImage: cfg.images['logo'],
            })
            await this.retry();
        }
    }
    async retry() {
        try {
            let code = await request.get('/qrcode/getUrlValidityTime.do');
            this.setState({
                code: code.validity,
            })
        } catch (e) {
            toast(e.message)
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
            return toast('分享失败,请稍候再试')
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
}
