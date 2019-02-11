'use strict';

import React from 'react';

import RN, {
    View,
    Text,
    Image,
    StyleSheet,
    CameraRoll,
    UIManager,
    Platform,
    ImageBackground
} from 'react-native';
import { px } from '../../utils/Ratio';
import QS from "react-native-qrcode-snapshot";
import { User, getShopDetail } from "../../services/Api"
import { captureRef } from "react-native-view-shot"
import base from "../../styles/Base"
import { log } from "../../utils/logs"
import request from "../../services/Request"
import util_cools from "../../utils/tools"
import Span from "../../UI/lib/Span"

export default class extends React.PureComponent {

    static defaultProps = {
        data: {
            ids: "",
            list: [],
            time: ""
        },
        shopDetail: {},
    }

    constructor(props) {
        super(props)
        this.state = {
            list: []
        }
    }

    render() {
        const { data, shopDetail } = this.props;
        if (this.state.list.length === 0) return null;
        const { time } = data;
        const list = this.state.list
        let urls = "https://dalingjia.com/touch/?ids=" + this.props.data.ids.replace(/,/g, "_") + "&inviteCode=" + shopDetail.inviteCode

        let topImage = null;
        let moban = 1;

        if (list.length > 8) {
            moban = 1;
            if (list.length % 3 === 1) {
                topImage = list.shift();
                topImage.src = util_cools.cutImage(topImage.goodsPicURL, 710, 440)
            }
            if (list.length % 3 === 2) {
                list.push({})
            }
        } else {
            moban = 2;
            if (list.length % 2 === 1) {
                topImage = list.shift();
                topImage.src = util_cools.cutImage(topImage.goodsPicURL, 710, 440)
            }
        }

        return <QS.Snapshot ref="share" style={styles.box}>
            <ImageBackground style={styles.topBg} source={{ uri: "http://img.daling.com/st/dalingjia/app/timeline_head.jpg" }}>
                <View style={[base.inline, styles.topBox]}>
                    <View style={styles.headBox}>
                        <Image style={styles.headimg} source={{ uri: shopDetail.indexImg }} />
                    </View>
                    <Span style={styles.nickname}>{shopDetail.name}</Span>
                </View>
                <View style={styles.time}>
                    <Span style={styles.timeTxt}>{time}</Span>
                </View>
            </ImageBackground>
            {moban === 1 && this.render3(list, topImage)}
            {moban === 2 && this.render2(list, topImage)}
            <View style={styles.erweima}>
                <View style={styles.maziBox}>
                    <QS.QRCode fgColor="#d0648f" value={urls} size={px(230)} />
                    <Image style={styles.logo} source={{ uri: "http://img.daling.com/st/dalingjia/app/erweima_logo.png" }} />
                </View>
                <Span style={styles.mazi}>扫描或长按二维码购买</Span>
            </View>
            <View style={styles.none}></View>
        </QS.Snapshot>
    }

    render2(list, topImage) {
        return <View style={styles.list}>
            {topImage != null && <View style={styles.bigItem}>
                <View style={styles.bigItemImgBox}>
                    <Image style={styles.bigItemImg} source={{ uri: topImage.src }} />
                    <View style={styles.bigItemPriceBox}>
                        <Text style={styles.itemPrice}>{topImage.goodsRealPrice + " "}</Text>
                    </View>
                </View>
                <Text numberOfLines={1} style={styles.itemTxt}>{topImage.goodsTitle}</Text>
            </View>}
            {list.map((item, index) => <View key={index} style={styles.item2}>
                <View style={styles.itemImgBox2}>
                    <Image style={styles.itemImg2} source={{ uri: util_cools.cutImage(item.goodsPicURL, 300, 300) }} />
                    <View style={styles.itemPriceBox2}>
                        <Text style={styles.itemPrice}>{item.goodsRealPrice + " "}</Text>
                    </View>
                </View>
                <Text numberOfLines={2} style={styles.itemTxt}>{item.goodsTitle}</Text>
            </View>)}
        </View>
    }
    render3(list, topImage) {
        return <View style={styles.list}>
            {topImage != null && <View style={styles.bigItem}>
                <View style={styles.bigItemImgBox}>
                    <Image style={styles.bigItemImg} source={{ uri: topImage.src }} />
                    <View style={styles.bigItemPriceBox}>
                        <Text style={styles.itemPrice}>{topImage.goodsRealPrice + " "}</Text>
                    </View>
                </View>
                <Text numberOfLines={1} style={styles.itemTxt}>{topImage.goodsTitle}</Text>
            </View>}
            {list.map((item, index) => <View key={index} style={styles.item}>
                <View style={styles.itemImgBox}>
                    <Image style={styles.itemImg} source={{ uri: util_cools.cutImage(item.goodsPicURL, 300, 300) }} />
                    {item.goodsRealPrice && <View style={styles.itemPriceBox}>
                        <Text style={styles.itemPrice}>{item.goodsRealPrice + " "}</Text>
                    </View>}
                </View>
                <Text numberOfLines={2} style={styles.itemTxt}>{item.goodsTitle}</Text>
            </View>)}
        </View>
    }
    async componentDidMount() {
        try {
            let trackId = Date.now() + Math.round(Math.random() * 1000);
            let res = await request.get("/timeline/shareGoodsInfo.do", { ids: this.props.data.ids, trackId })
            let list = res.goodsInfo || [];
            if (list.length > 15) list.length = 15;

            // let res = await request.get("/timeline/timelineList_paging.do", { ids: this.props.ids, start: 1 })
            // let list = res.list || [];
            // list = list.filter(item => item.type == 1);
            // list.map(item => {
            //     item.goodsPicURL = item.mainImage;
            //     item.goodsTitle = item.goodsShowName;
            //     item.goodsRealPrice = item.salePrice + '';
            //     return item
            // })
            // list.length = 6;

            this.setState({ list })
        } catch (error) {
            //
        }
    }
    snapshot_src = "";
    async snapshot() {
        if (this.snapshot_src) return this.snapshot_src;
        if (Platform.OS === "ios") {
            return this.refs.share.save();
        } else {
            this.snapshot_src = captureRef(this.refs.share, {
                width: 300,
                quality: 0.5,
            })
            return this.snapshot_src;
        }
    }
    async save() {
        let img = await this.snapshot();
        return CameraRoll.saveToCameraRoll(img, "photo");
    }

    componentWillReceiveProps() {
        this.snapshot_src = "";
    }
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: "#fff",
        width: px(710),
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 5
    },
    topBg: {
        width: px(710),
        height: px(302),
        alignItems: "center",
    },
    topBox: {
        marginTop: px(60),
    },
    headBox: {
        width: px(60),
        height: px(60),
        borderRadius: 15,
        overflow: "hidden",
    },
    headimg: {
        width: px(60),
        height: px(60),
    },
    nickname: {
        marginLeft: px(10),
        fontSize: 14,
        color: "#fff"
    },
    time: {
        position: "absolute",
        top: Platform.OS === "ios" ? px(248) : px(245)
    },
    timeTxt: {
        fontSize: px(28),
        color: "#000"
    },
    list: {
        backgroundColor: "#fff",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
    },
    bigItem: {
        marginTop: px(20),
        marginBottom: px(10),
        width: px(640),
        // alignItems: "center",
        // paddingHorizontal: px(10),
    },
    bigItemImgBox: {
        width: px(640),
        height: px(330),
        borderRadius: px(18),
        overflow: "hidden",
        // borderWidth: 1
    },
    bigItemImg: {
        width: px(640),
        height: px(330),
    },
    bigItemPriceBox: {
        backgroundColor: "#d0648f",
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        position: "absolute",
        left: 0,
        bottom: 0
    },
    item2: {
        marginTop: px(10),
        marginBottom: px(10),
        width: px(330),
        height: px(420),
        alignItems: "center",
        paddingHorizontal: px(10),
    },
    itemImgBox2: {
        width: px(320),
        height: px(320),
        borderRadius: px(18),
        overflow: "hidden",
        // borderWidth: 1
    },
    itemImg2: {
        width: px(320),
        height: px(320),
    },
    itemPriceBox2: {
        backgroundColor: "#d0648f",
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        position: "absolute",
        left: 0,
        bottom: 0
    },
    item: {
        marginTop: px(10),
        marginBottom: px(10),
        width: px(230),
        height: px(290),
        alignItems: "center",
    },
    itemImgBox: {
        width: px(200),
        height: px(200),
        borderRadius: px(18),
        overflow: "hidden",
        // borderWidth: 1
    },
    itemImg: {
        width: px(200),
        height: px(200),
    },
    itemTxt: {
        marginTop: px(10),
        marginHorizontal: px(10),
        fontSize: px(28),
        color: "#333"
    },
    itemPriceBox: {
        backgroundColor: "#d0648f",
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        position: "absolute",
        left: 0,
        bottom: 0
    },
    itemPrice: {
        fontSize: 14,
        color: "#fff",
        marginLeft: px(10),
        marginRight: px(15)
    },
    none: {
        width: px(710),
        backgroundColor: "#fff",
        height: px(50)
    },
    erweima: {
        marginTop: px(50),
        alignItems: "center",
        backgroundColor: "#fbfbfb"
    },
    maziBox: {

    },
    mazi: {
        marginTop: 10,
        fontSize: 11,
        color: "#333"
    },
    logo: {
        width: px(60),
        height: px(60),
        position: "absolute",
        top: px(85),
        left: px(85)
    }
})