'use strict';

import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import Api, { Viplogin } from '../../services/Api';
import request, { domain } from '../../services/Request';
import base from "../../styles/Base";
import Button from "../../UI/lib/Button";
import Icon from "../../UI/lib/Icon";
import Input from "../../UI/lib/Input";
import Page from "../../UI/Page";
import { px } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';


const deviceWidth = Dimensions.get('window').width;

export default class extends Page {

    constructor(props) {
        if (!props.navigation) props.navigation = { state: { params: {} } };
        if (!props.navigation.state.params) props.navigation.state.params = {};
        super(props, {
            inviteCode: "",
            bCanSkipBindInviteCode: props.navigation.state.params.bCanSkipBindInviteCode
        })
        this.sessionToken = props.navigation.state.params.sessionToken;
        this.home = props.navigation.state.params.home;
    }

    title = "绑定店铺"
    pageBody() {
        return <ScrollView keyboardDismissMode="on-drag">
            <View style={style.body}>
                <Icon name="regcode-top" style={style.top} />
                <View style={style.box}>
                    <View style={style.inBox}>
                        <Input keyboardType="numeric" onChangeText={(v) => this.setState({ inviteCode: v })} style={style.inp} placeholder="请输入店铺邀请码" />
                    </View>
                    <View style={style.tipBox}>
                        <TouchableOpacity onPress={() => this.what()}>
                            <Text style={style.whatTxt}>什么是店铺邀请码？</Text>
                        </TouchableOpacity>
                    </View>
                    <Button disabled={this.state.inviteCode.length < 3} onPress={() => this.check()} style={style.btn} txtStyle={style.btnTxt} value="提交" />

                    {this.state.bCanSkipBindInviteCode && <TouchableOpacity onPress={() => this.next()}>
                        <View style={style.nextBox}>
                            <Text style={style.next}>跳过此步</Text>
                        </View>
                    </TouchableOpacity>}
                </View>
            </View>
        </ScrollView>
    }
    onReady() { }

    what() {
        let context = [
            "1.店主登录后可在“我的店铺”中查看",
            "店铺邀请码，您可以联系邀请您的",
            "店主获取其店铺邀请码；",
            "2.每个VIP用户可在本次绑定成功后7",
            "天内更换一次店铺绑定"
        ]
        this.$alert(null, context, "我已了解");
    }
    async check() {
        let context;
        try {
            let res = await Api.shopByInviteCode(this.state.inviteCode);
            if (res) {
                context = <View style={base.inline}>
                    <View style={style.headimgBox}>
                        <Image style={style.headimg} source={{ uri: res.shopImg }} />
                    </View>
                    <Text>{res.shopName}</Text>
                </View>
            }
        } catch (error) {
            toast(error.message);
            return;
        }
        this.$dialog("确认成为以下店铺VIP用户？", context, "取消", { txt: "确认", click: this.gobind.bind(this) });
    }
    async next() {
        try {
            let res = await Api.bindInviteCode({ sessionToken: this.sessionToken });
            await Viplogin(res.uid, res.utoken);
            if (this.home) {
                this.goTabPage();
            } else {
                this.go_("RegEndPage");
            }
        } catch (error) {
            toast(error.message);
            return;
        }
    }
    async gobind() {
        try {
            let res = await Api.bindInviteCode({
                inviteCode: this.state.inviteCode,
                sessionToken: this.sessionToken
            });
            await Viplogin(res.uid, res.utoken);
            if (this.home) {
                this.goTabPage();
            } else {
                this.go_("RegEndPage");
            }
        } catch (error) {
            toast(error.message);
            return;
        }
    }
    goTabPage() {
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'HomePage' })
            ]
        }))
    }
}

const style = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: "#fff",
    },
    top: {
        width: deviceWidth,
        height: px(468),
    },
    box: {
        marginTop: 40,
        paddingHorizontal: 15,
    },
    inBox: {
        height: 30,
        borderBottomWidth: 1,
        borderColor: "#efefef",
    },
    inp: {
        height: 30,
        padding: 0
    },
    tipBox: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    whatTxt: {
        color: "#c9a760",
    },
    btn: {
        marginTop: 30,
        backgroundColor: "#c9a760",
        borderRadius: 5
    },
    btnTxt: {
        fontSize: px(36)
    },
    nextBox: {
        alignItems: 'center',
    },
    next: {
        marginTop: 20,
        color: "#c9a760",
    },
    headimgBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
        marginRight: 10,
    },
    headimg: {
        width: 40,
        height: 40,
    }
})