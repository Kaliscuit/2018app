'use strict';

import React from 'react';

import RN, {
    View,
    Text,
    Image,
    StyleSheet,
    CameraRoll,
    UIManager,
    Platform
} from 'react-native';
import { px } from '../../utils/Ratio';
import QS from "react-native-qrcode-snapshot";
import { User, getShopDetail } from "../../services/Api"
import { captureRef } from "react-native-view-shot"
import base from "../../styles/Base"
import { log } from "../../utils/logs"
import Span from "../../UI/lib/Span"
import utils_tools from "../../utils/tools"

export default class extends React.PureComponent {

    static defaultProps = {
        goods: {
            id: 0,
            image: "",
            price: "",
            showName: "",
            temai: 0,
            temaiTxt: "",
            temaiEnd: 0,
            temaiEndTxt: "",
            taxation: 0,
            showTxt: ""
        },
        shopDetail: {},
    }

    render() {
        const { goods, shopDetail } = this.props;

        if (this.props.goods.id === undefined) return null;

        let temai = goods.temai;
        if (temai < Date.now()) temai = 0;
        let temaiTxt = "";
        if (temai != 0 && goods.temaiTxt) {
            const now = new Date(goods.temai);
            temaiTxt = goods.temaiTxt.replace(/ /g, "");
            temaiTxt = temaiTxt.replace(":00:00", ":00");
        }
        let temaiEnd = goods.temaiEnd;
        if (temaiEnd < Date.now()) temaiEnd = 0;
        let temaiEndTxt = "";
        if (temaiEnd != 0 && goods.temaiEndTxt) {
            const now = new Date(goods.temaiEnd);
            temaiEndTxt = goods.temaiEndTxt.replace(/ /g, "");
            temaiEndTxt = temaiEndTxt.replace(":00:00", ":00");
        }
        if (temai > 0) temaiEnd = 0;
        let showTxt = goods.showTxt;
        if (showTxt === undefined || showTxt === null) showTxt = "";
        log("分享：https://dalingjia.com/touch/goods-detail?id=" + this.props.goods.id + "&inviteCode=" + shopDetail.inviteCode + "&f=app")

        return <QS.Snapshot ref="share" style={styles.box}>
            <View style={styles.topBox}>
                <View style={styles.headimgBox}>
                    <Image style={styles.headimg} source={{ uri: shopDetail.indexImg }} />
                </View>
                <Span style={styles.nickname}>{shopDetail.name}</Span>
            </View>
            <View style={styles.line}></View>
            <Image style={styles.img} source={{ uri: utils_tools.cutImage(goods.image, 500, 500) }} />
            <View style={styles.bottom}>
                <View style={styles.info}>
                    <View style={styles.priceBox}>
                        <Span style={styles.price1}>￥</Span>
                        <Span style={styles.price2}>{goods.price + " "}</Span>
                        {goods.taxation != 0 && goods.taxation != null && <Span style={styles.shui}>税费￥{goods.taxation + " "}</Span>}
                    </View>
                    <View style={styles.descBox}>
                        <Span style={styles.desc} numberOfLines={2}>{goods.showName}</Span>
                    </View>
                    {temai > 0 && <View style={styles.temai}>
                        <View style={styles.temai1}>
                            <Span style={styles.temaiTxt1}>限时特卖</Span>
                        </View>
                        <View style={styles.temai2}>
                            <Span style={styles.temaiTxt2}>{temaiTxt}开抢</Span>
                        </View>
                    </View>}
                    {temaiEnd > 0 && <View style={styles.temai}>
                        <View style={styles.temai1}>
                            <Span style={styles.temaiTxt1}>限时特卖</Span>
                        </View>
                        <View style={styles.temai2}>
                            <Span style={styles.temaiTxt2}>{temaiEndTxt}结束</Span>
                        </View>
                    </View>}
                    {showTxt !== "" && <View style={styles.temai}>
                        <View style={styles.temai1}>
                            <Span style={styles.temaiTxt1}>限时特卖</Span>
                        </View>
                        <View style={styles.temai2}>
                            <Span style={styles.temaiTxt2}>{goods.showTxt}</Span>
                        </View>
                    </View>}
                </View>
                <View style={styles.erweima}>
                    <View style={styles.maziBox}>
                        <QS.QRCode fgColor="#d0648f" value={"https://dalingjia.com/touch/goods-detail?id=" + this.props.goods.id + "&inviteCode=" + shopDetail.inviteCode + "&f=app"} size={px(200)} />
                        <Image style={styles.logo} source={{ uri: "http://img.daling.com/st/dalingjia/app/erweima_logo.png" }} />
                    </View>
                    <Span style={styles.mazi}>长按识别二维码</Span>
                </View>
            </View>
            <View style={styles.none}></View>
        </QS.Snapshot>
    }

    snapshot_src = "";
    async snapshot() {
        if (this.snapshot_src) return this.snapshot_src;
        if (Platform.OS === "ios") {
            return this.refs.share.save();
        } else {
            this.snapshot_src = captureRef(this.refs.share, {
                quality: 0.5,
                width: 300,
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
    topBox: {
        alignItems: "center",
        width: px(710),
        height: px(280),
        // borderWidth: 1
    },
    headimgBox: {
        marginTop: px(60),
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: "hidden"
    },
    headimg: {
        width: 70,
        height: 70
    },
    nickname: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "700",
        color: "#000"
    },
    line: {
        marginTop: px(30),
        backgroundColor: "#eee",
        width: px(710),
        height: 1,
    },
    img: {
        marginTop: 1,
        width: px(710),
        height: px(710),
        // borderWidth: 1
    },
    bottom: {
        width: px(710),
        height: px(300),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fbfbfb",
        // borderWidth: 1
    },
    info: {
        marginLeft: 10,
        width: px(430),
    },
    priceBox: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    price1: {
        color: "#d0648f",
        fontSize: 20
    },
    price2: {
        color: "#d0648f",
        fontSize: 28,
        fontWeight: "700",
        marginBottom: -5
    },
    shui: {
        color: "#999",
        fontSize: 14,
        marginLeft: 8
    },
    descBox: {
        marginTop: px(10),
        height: px(70)
    },
    desc: {
        fontSize: 14,
        lineHeight: px(40)
    },
    temai: {
        marginTop: px(20),
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderColor: "#d0648f",
        borderWidth: 1
    },
    temai1: {
        backgroundColor: "#fff",
        alignItems: "center",
        padding: 5,
    },
    temaiTxt1: {
        color: "#d0648f",
        fontSize: px(28)
    },
    temai2: {
        backgroundColor: "#d0648f",
        alignItems: "center",
        flex: 1,
        padding: 5,
    },
    temaiTxt2: {
        color: "#fff",
        fontSize: px(28)
    },
    erweima: {
        marginRight: px(30),
        alignItems: "center"
    },
    maziBox: {
        marginTop: px(58),
    },
    mazi: {
        marginTop: 8,
        color: "#878787",
        fontSize: 13,
    },
    none: {
        width: px(710),
        backgroundColor: "#fafafa",
        height: px(10)
    },
    logo: {
        width: px(60),
        height: px(60),
        position: "absolute",
        top: px(72),
        left: px(70)
    }
})