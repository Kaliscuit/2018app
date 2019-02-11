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
    TouchableOpacity
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import ImagePicker from 'react-native-image-crop-picker';
import Page, { FootView } from '../../UI/Page'
import { deviceWidth, px, px1 } from '../../utils/Ratio';
import request, { domain } from '../../services/Request';
import { Header } from '../common/Header'
import Input from "../../UI/lib/Input"
import base from "../../styles/Base"
import Button, { EButton } from "../../UI/lib/Button"
import Icon from '../../UI/lib/Icon';
import { log, logWarm, logErr } from '../../utils/logs'

export default class extends Page {

    constructor(props) {
        super(props, {
            wechatId: "",
            imgFile: "",
            detail: {}
        })
    }
    pageHeader() {
        return <Header navigation={this.props.navigation}
            title="微信名片"
            rightBtn={<TouchableOpacity onPress={() => this.go_("WechatPage")}>
                <Text style={{ color: "#858385" }}>帮助</Text>
            </TouchableOpacity>} />
    }

    pageBody() {
        return <View style={[base.line, style.box]}>
            <View style={style.content}>
                <Text style={style.tit}>微信号</Text>
                <Input value={this.state.wechatId} onChangeText={v => this.setState({ wechatId: v })} style={style.wecode} placeholder="请输入微信号" />
                <Text style={style.txt}>微信号不能超过20个字符，支持字母、数字、下划线和减号，必须用字母开头。</Text>
            </View>
            {this.state.imgFile && <View style={[base.line]}>
                <TouchableOpacity onPress={() => this.chooseShopImg()}>
                    <Image source={{ uri: this.state.imgFile }} style={style.uploadBox} />
                </TouchableOpacity>
                <EButton onPress={() => this.chooseShopImg()} style={{ marginTop: 10 }} value="从手机相册选择" round={true} width={250} />
                <Text style={style.tip}>
                    上传二维码能够方便您的客户主动联系您
                </Text>
            </View>}
            {!this.state.imgFile && <View style={[base.line]}>
                <TouchableOpacity onPress={() => this.chooseShopImg()}>
                    <Icon name="upload_box" style={style.uploadBox} />
                </TouchableOpacity>
                <Text style={style.tip}>
                    上传二维码能够方便您的客户主动联系您
                </Text>
            </View>}
        </View>
    }
    pageFooter() {
        return <FootView>
            <Button disabled={this.state.wechatId.length <= 0 || this.state.wechatId.length > 20} onPress={() => this.save()} value="保存" width={deviceWidth} />
        </FootView>
    }

    async onReady() {
        try {
            let detail = await request.get('/ucenter/detail.do');
            this.setState({
                detail: detail,
                wechatId: detail.wechatId == null ? "" : detail.wechatId,
                imgFile: detail.wechatIdQrcode
            });
        } catch (e) {
            this.$toast(e.message);
        }
    }
    async chooseShopImg() {
        let image
        try {
            image = await ImagePicker.openPicker({
                width: 400,
                height: 400,
                cropping: true
            });
        } catch (e) {
            if (e.message.indexOf('access') > 0) {
                this.$alert('', '请进入iPhone的"设置-隐私-照片"选项，允许达令家访问您的手机相机');
            }
            log(e.message); return;
        }
        this.setState({ imgFile: image.path });
    }
    async uploadImg() {
        try {
            let data = new FormData();
            let file = { uri: this.state.imgFile, type: 'multipart/form-data', name: 'image.png' };
            data.append("imgFile", file);
            // data.append("wechatId", this.state.wechatId);
            let res = await request.uploadImage(domain + "/xc_uc/uc/manager/my/uploadImg.do?wechatId=" + this.state.wechatId, data)
            this.$toast('修改成功!');
            setTimeout(() => {
                this.props.navigation.goBack();
            }, 1000);
        } catch (error) {
            this.$toast(error.message)
        }
    }
    async changeName() {
        try {
            // data.append("wechatId", this.state.wechatId);
            let res = await request.get(domain + "/xc_uc/uc/manager/my/uploadImg.do?wechatId=" + this.state.wechatId)
            this.$toast('修改成功!');
            this.props.navigation.state.params.callback();
            setTimeout(() => {
                this.props.navigation.goBack();
            }, 1000);
        } catch (error) {
            this.$toast(error.message)
        }
    }
    // save(){
    //     // this.go_("SuccessPage")
    //     this.props.navigation.replace("PayFailResult", {from:"cart"})
    //     // this.props.navigation.replace("FansPage")
    // }
    async save() {
        if (!/^[a-zA-Z]{1}[a-zA-Z0-9_-]{0,19}$/.test(this.state.wechatId)) {
            this.$toast("微信号不符合规则");
            return;
        }
        if (this.state.imgFile) {
            this.uploadImg();
        } else {
            this.changeName();
        }
    }
}
const style = StyleSheet.create({
    box: {
        paddingHorizontal: 20,
    },
    content: {
        width: 250,
        alignItems: 'center',
    },
    tit: {
        marginTop: 30,
        marginBottom: 15,
        fontSize: 15,
        color: "#666"
    },
    wecode: {
        width: 250,
        borderWidth: px1,
        borderColor: "#ccc",
        lineHeight: 20,
        height: 40,
        backgroundColor: "#fff",
        textAlign: "center",
        borderRadius: 2.5
    },
    txt: {
        marginTop: 5,
        marginBottom: 25,
        fontSize: 12,
        lineHeight: 15,
        color: "#999",
        textAlign: "center"
    },
    tip: {
        marginTop: 10,
        marginBottom: 25,
        fontSize: 12,
        color: "#999"
    },
    uploadBox: {
        width: 250,
        height: 250
    },
})