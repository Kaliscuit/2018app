import React from 'react'
import {
    View,
    ScrollView, TouchableWithoutFeedback, Text, StyleSheet,
    NativeModules,
    TouchableOpacity
} from 'react-native'
import Page, { SafeFootView } from "../../../UI/Page";
import { deviceWidth, isIphoneX, px } from "../../../utils/Ratio";
import Icon from "../../../UI/lib/Icon";
import Pop from "./Pop"
import Button from "../../../UI/lib/Button"
import { User } from "../../../services/Api"
import request from '../../../services/Request';

const IM = NativeModules.XNIMModule

export default class extends Page {
    constructor(props) {
        super(props, {
            id: props.navigation.state.params.id,
            info: {}
        });
    }

    title = '查看解决方案'

    backgroundColor = '#fff'

    pageBody() {
        return <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.title}>
                    <Icon name="icon-answer-q" style={{ width: px(42), height: px(42) }} />
                    <Text allowFontScaling={false} style={styles.titleTxt}>
                        {this.state.info.title}
                    </Text>
                </View>
                <View style={styles.detailWrap}>
                    <Icon name="icon-answer-a" style={{ width: px(42), height: px(42) }}></Icon>
                    <Text allowFontScaling={false} style={{ fontSize: px(28), color: '#666', lineHeight: px(44), flex: 1, marginLeft: px(14) }}>
                        {this.state.info.contents}
                    </Text>
                </View>
                <View style={styles.detailWrap}>
                    <View style={{ width: px(42), height: px(42) }}></View>
                    <TouchableOpacity onPress={() => this.go_("BrowerPage", { webPath: this.state.info.url })}>
                        <Text style={{ color: "#56beec", marginLeft: px(14) }}>{this.state.info.url}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={{ height: isIphoneX() ? px(148) : px(88) }}>
                <TouchableWithoutFeedback>
                    <View style={styles.foot}>
                        <Icon name="zaixiankefu" style={{ width: px(36), height: px(36) }}></Icon>
                        <Text allowFontScaling={false}
                            style={{ marginLeft: px(10), fontSize: px(28), color: '#fff' }}>在线客服</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View >
    }
    pageFooter() {
        return <View>
            <SafeFootView>
                <Button style={styles.btnKefu} txtStyle={{ fontSize: px(28) }} icon="zaixiankefu" value="在线客服" onPress={this.kefu.bind(this)} />
            </SafeFootView>
            <Pop openGroup={this.openGroup.bind()} ref="pop" navigation={this.props.navigation} />
        </View>
    }

    async onReady() {
        try {
            let info = await request.get("/dal_cec/sale/front/qa/detail.do", { id: this.state.id });
            this.setState({ info })
        } catch (error) {
            this.$toast(error.message)
        }
    }
    kefu() {
        this.refs.pop.open()
    }
    async  openGroup(name) {
        try {
            let img = User.headImgUrl;
            if (img === "http://img.cdn.daling.com/data/files/mobile/img/dalingjia.jpg") {
                img = "http://img.daling.com/st/dalingjia/app/im_default_logo.png";
            }
            await IM.startChat(name, img, function (err) { });
        } catch (error) {
            // console.log(error)
        }
    }
}

const styles = StyleSheet.create({
    foot: {
        width: deviceWidth,
        height: px(88),
        backgroundColor: '#D0648F',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        height: px(116),
        marginHorizontal: px(30),
        borderBottomColor: '#EFEFEF',
        borderBottomWidth: px(1),
        alignItems: 'center',
        flexDirection: 'row'
    },
    titleTxt: {
        fontSize: px(36),
        color: '#222',
        marginLeft: px(14)
    },
    detailWrap: {
        marginHorizontal: px(30),
        marginTop: px(42),
        flexDirection: 'row',
    },
    btnKefu: {
        width: deviceWidth
    }
})