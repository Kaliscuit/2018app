import React from 'react'
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native'
import Page from "../../../UI/Page";
import { px } from "../../../utils/Ratio";
import Span from "../../../UI/lib/Span"
import request from '../../../services/Request';

export default class extends Page {

    backgroundColor = '#fff'

    constructor(props) {
        super(props, {
            id: props.navigation.state.params.id,
            info: {}
        });
    }

    title = '公告'

    pageBody() {
        return <ScrollView style={{ flex: 1 }}>
            <View style={styles.title}>
                <Span style={styles.titleTxt}>
                    {this.state.info.title}
                </Span>
            </View>
            <View style={{ marginHorizontal: px(28), marginTop: px(30) }}>
                <Span style={{ fontSize: px(28), color: '#666', lineHeight: px(44) }}>
                    {this.state.info.contents}
                </Span>
                <TouchableOpacity onPress={() => this.go_("BrowerPage", { webPath: this.state.info.url })}>
                    <Text style={{ color: "#56beec" }}>{this.state.info.url}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    }

    async onReady() {
        try {
            let info = await request.get("/dal_cec/sale/front/notice/detail.do", { id: this.state.id });
            this.setState({ info })
        } catch (error) {
            this.$toast(error.message)
        }
    }
}

const styles = StyleSheet.create({
    title: {
        height: px(114),
        marginHorizontal: px(28),
        borderBottomColor: '#EFEFEF',
        borderBottomWidth: px(1),
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleTxt: {
        fontSize: px(36),
        color: '#222'
    }
})