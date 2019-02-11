'use strict';

import React from 'react';

import RN, {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    VirtualizedList,
    PanResponder,
    Platform,
    Animated,
    FlatList,
    Dimensions,
    NativeModules,
    DeviceEventEmitter,
    CameraRoll
} from 'react-native';

import { px } from '../../utils/Ratio';
import request from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import base from '../../styles/Base'
import Page from '../../UI/Page'
import Button from "../../UI/lib/Button"
import GoodsShare from "../snapshot/goods"
import TimelineShare from "../snapshot/timeline"
import { User, getShopDetail } from "../../services/Api"

import ShareView, { SHARETYPE } from "../common/ShareView"
import ShareModel from "../common/ShareModel"


const deviceWidth = Dimensions.get('window').width;


export default class extends Page {

    constructor(props) {
        super(props, {
            img: "",
            shop: {}
        });
    }

    title = "测试页"
    pageBody() {
        return <View style={{ backgroundColor: "#333", alignItems: "center" }}>
            <ScrollView>
                <ShareView ref="sv" types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]} >
                    <Text style={{
                        color: "#D0648F",
                        fontSize: px(42),
                        marginBottom: px(19)
                    }}>分享赚 ￥27.28</Text>
                    <Text style={{
                        color: "#858385",
                        fontSize: px(26)
                    }}>只要你的好友通过你的分享购买此商品，</Text>
                    <Text style={{
                        color: "#858385",
                        fontSize: px(26)
                    }}>你就能赚到至少27.28元利润哦~</Text>
                </ShareView>
                <ShareModel ref="sm" />
                <Text>测试渲染</Text>
                <Button value="旧版" onPress={this.btn1.bind(this)}></Button>
                <Button value="新版" onPress={this.btn2.bind(this)}></Button>
            </ScrollView>
        </View>
    }
    btn1() {
        this.refs.sv.Share({
            title: "test"
        })
    }
    btn2() {

    }
}
