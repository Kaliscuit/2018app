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
            taxation: 0
        },
        shopDetail: {},
    }

    render() {
        const { goods, shopDetail } = this.props;

        return <QS.Snapshot ref="share" style={styles.box}>
            <Image style={styles.headimg} source={{ uri: shopDetail.indexImg }} />
            <Text style={styles.nickname}>{shopDetail.name}</Text>
            
            <View style={styles.none}></View>
        </QS.Snapshot>
    }

    snapshot_src = "";
    async snapshot() {
        if (this.snapshot_src) return this.snapshot_src;
        if (Platform.OS === "ios") {
            return this.refs.share.save();
        } else {
            this.snapshot_src = captureRef(this.refs.share)
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
        alignItems: "center"
    },
    headimg: {
        marginTop: 14,
        width: 70,
        height: 70
    },
    nickname: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "700",
        color: "#000"
    },
    
    none: {
        backgroundColor: "#fafafa",
        height: px(50)
    }
})