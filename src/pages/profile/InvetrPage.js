'use strict';

import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Clipboard,
    NativeModules,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

import Page, { FootView } from '../../UI/Page'
import { deviceWidth, px } from '../../utils/Ratio';
import request, { domain } from '../../services/Request';
import { Header } from '../common/Header'
import base from "../../styles/Base"
import Button, { EButton } from "../../UI/lib/Button"
import Icon from '../../UI/lib/Icon';
import { log, logWarm, logErr } from '../../utils/logs'
import { show as toast } from '../../widgets/Toast';
import { User } from "../../services/Api"

const AppModule = NativeModules.AppModule;

export default class extends Page {

    constructor(props) {
        super(props, {
            empty: true,
            inviteCode: props.navigation.state.params.code,
            reg: props.navigation.state.params.reg * 1,
            qcode: true,
            mobile: props.navigation.state.params.mobile
        })
    }
    pageHeader() {
        return <Header navigation={this.props.navigation}
            title="我的邀请店铺"
            rightBtn={<TouchableOpacity onPress={() => this.go_("InvetrHelpPage")}>
                <Text style={{ color: "#858385" }}>帮助</Text>
            </TouchableOpacity>} />
    }
    backgroundColor = "#fff";
    pageBody() {
        if (this.state.empty) {
            return <View style={style.emptyBox}>
                <Icon name="inviter-empty" style={style.emptyImg} />
                <Text style={{ color: "#858385", marginTop: 30 }}>微信号及二维码均未填写</Text>
            </View>
        }
        return <ScrollView keyboardShouldPersistTaps={true}>
            <View style={style.bg}>
                {this.state.reg == 0 && User.vip && <View style={style.bottomLinkBox}>
                    <TouchableOpacity onPress={this.changeInvite.bind(this)}>
                        <Text style={style.linkTxt}>绑定7天内可更换一次邀请人，点击前往 &gt;&gt;</Text>
                    </TouchableOpacity>
                </View>}
                <View style={style.tit}>
                    <Text style={style.titTxt}>微信号</Text>
                </View>
                <View style={style.code}>
                    <Text style={style.codeTxt}>{this.state.wechatId}</Text>
                    {this.state.wechatId && <TouchableOpacity onPress={this.copy.bind(this)} style={style.cpBtn}>
                        <Text style={style.cpTxt}>复制</Text>
                    </TouchableOpacity>}
                </View>
                <View style={style.img}>
                    <Image source={{ uri: this.state.wechatIdQrcode }} style={style.wxImg} />
                </View>
                {this.state.qcode && <View style={style.tit}>
                    <Text style={style.titTxt2}>保存上图二维码并在微信扫一扫中打开</Text>
                    <Text style={style.titTxt2}>即可加他为微信好友</Text>
                </View>}
            </View>
        </ScrollView>
    }
    pageFooter() {
        if (this.state.empty) return null;
        return <FootView>
            {this.state.qcode && <Button onPress={this.save.bind(this)} value="保存二维码" width={deviceWidth} />}
        </FootView>
    }

    async onReady() {
        try {
            let res = await request.get("/ucenter/myFollowerUser.do", { inviteCode: this.state.inviteCode });
            let empty = false;
            if (!res.wechatId && !res.wechatIdQrcode) empty = true;
            this.setState({
                empty: empty,
                wechatId: res.wechatId,
                wechatIdQrcode: res.wechatIdQrcode || "",
                qcode: !!res.wechatIdQrcode
            })
        } catch (error) {
            toast(error.message);
        }
    }
    changeInvite() {
        this.$alert("更换邀请人", "达令家VIP只能更换一次邀请人", "取消", {
            txt: "确认更换",
            click: () => this.go_("SendCode", { mobile: this.state.mobile })
        });
    }
    copy() {
        Clipboard.setString(this.state.wechatId);
        this.$toast("复制成功")
    }
    save() {
        AppModule.saveImageToAlbum(this.state.wechatIdQrcode, (ignore, res) => {
            if (res) {
                toast('保存成功');
            } else {
                toast('保存失败');
            }
        });
    }
}
const style = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: "#fff"
    },
    bottomLinkBox: {
        backgroundColor: "#fcf0f3",
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: "center"
    },
    emptyBox: {
        paddingTop: 100,
        alignItems: "center",
        flex: 1,
        backgroundColor: "#fff"
    },
    emptyImg: {
        width: 237.5,
        height: 177.5
    },
    linkTxt: {
        color: "#e86d78", fontSize: 12
    },
    tit: {
        alignItems: "center",
        marginTop: 20,
    },
    titTxt: {
        color: "#666",
        fontSize: px(30)
    },
    titTxt2: {
        color: "#999",
        fontSize: px(22),
        lineHeight: 14
    },
    code: {
        alignItems: "center",
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "center",
    },
    codeTxt: {
        color: "#222",
        fontSize: px(36)
    },
    cpBtn: {
        borderWidth: 1,
        borderColor: "#ccc",
        width: 35,
        height: 14,
        borderRadius: 7,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 5,
        marginTop: Platform.OS === "ios" ? 0 : 1
    },
    cpTxt: {
        fontSize: 10,
        color: "#666",
    },
    img: {
        alignItems: "center",
        // width: 250,
        marginTop: 35
    },
    wxImg: {
        width: 250,
        height: 250
    }
})