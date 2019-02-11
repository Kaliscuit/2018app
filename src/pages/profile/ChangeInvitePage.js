'use strict';

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

import { deviceWidth, px } from '../../utils/Ratio';
import Icon from "../../UI/lib/Icon";
import Page from '../../UI/Page'
import Input from "../../UI/lib/Input"
import Button from "../../UI/lib/Button"
import { logWarm } from '../../utils/logs'
import base from "../../styles/Base"
import { Header } from '../common/Header'
import request, { domain } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';

export default class extends Page {

    constructor(props) {
        super(props, {
            code: props.navigation.state.params.id,
        })
    }

    pageHeader() {
        return <Header navigation={this.props.navigation}
            title="微信号"
            rightBtn={<TouchableOpacity onPress={e => this.go_("Wechat2Page")}>
                <Text>帮助</Text>
            </TouchableOpacity>} />
    }

    pageBody() {
        return <View style={style.box}>
            <View style={style.row}>
                <Input value={this.state.code} onChangeText={(v) => this.setState({ code: v })} style={style.inpu} />
            </View>
            <View style={style.tips}>
                <Text style={style.code}>微信号不能超过20个字符，支持字母、数字、下划线和减号，必须用字母开头。</Text>
            </View>
            <View style={style.btnBox}>
                <Button disabled={this.state.code == ""} onPress={() => this.next()} round={true} style={style.btn} value="保存" />
            </View>
        </View>
    }

    async next() {
        if (!/^[a-zA-Z]{1}[a-zA-Z0-9_-]{0,19}$/.test(this.state.code)) {
            this.$toast("微信号不符合规则");
            return;
        }
        try {
            let res = await request.get(domain + "/xc_uc/uc/manager/my/uploadImg.do", {
                wechatId: this.state.code
            });
            toast("设置成功");
            this.props.navigation.state.params.callback();
            setTimeout(() => {
                this.goBack();
            }, 500);
        } catch (error) {
            toast(error.message)
        }
    }
}
const style = StyleSheet.create({
    box: {
        flex: 1,
        marginTop: 12,
        marginBottom: 5
    },
    inpu: {
        width: deviceWidth,
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
    },
    tips: {
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 40
    },
    code: {
        fontSize: px(24),
        color: "#999"
    },
    btnBox: {
        paddingHorizontal: 15,
    },
    btn:{

    }
})