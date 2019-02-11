import React, {
    Component,
} from 'react'
import {
    View,
    StyleSheet,
    Alert,
    Text,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native'
import {deviceHeight, deviceWidth, px} from "../../utils/Ratio";

import Barcode from 'react-native-smart-barcode'
import Page from "../../UI/Page";
import {TopHeader} from '../common/Header'
import Icon from "../../UI/lib/Icon";
import { get, post } from '../../services/Request';

export default class GoldQrCode extends Page {

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            viewAppear: false,
            loading: false,
        };
    }

    pageHeader() {
        return <TopHeader
            navigation={this.props.navigation}
            title="扫描二维码"
            hiddenBack={true}
            leftBtn={
                <TouchableOpacity onPress={() => this.goBack()}>
                    <View style={{ height: 30, width: 30, justifyContent: "center", marginLeft: px(20) }}>
                        <Icon name="gold-close" style={{ width: px(26), height: px(28) }} />
                    </View>
                </TouchableOpacity>
            }
        />
    }

    pageBody() {
        return (
            <View onLayout={e => this.layout(e)} style={{flex: 1, backgroundColor: 'black'}}>
                {this.state.viewAppear ?
                    <Barcode
                        style={{flex: 1}}
                        ref={component => this._barCode = component}
                        scannerRectWidth={px(570)}
                        scannerRectHeight={px(570)}
                        scannerRectCornerColor="#d0648f"
                        onBarCodeRead={this._onBarCodeRead} /> : null}
                <View style={{position: 'absolute', top: this.top, left: 0, width: deviceWidth, height: px(90), justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: px(28), color: '#fff'}} allowFontScaling={false}>
                        将二维码放入框内，即可自动扫描
                    </Text>
                </View>
                {this.state.loading ? <View style={{position: 'absolute', top: 0, left: 0, width: deviceWidth, height: deviceHeight, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator
                        animating={true}
                        size="large"
                        color="#ffffff"
                    />
                </View> : null}
            </View>
        )
    }

    layout(e) {
        this.top = e.nativeEvent.layout.height / 2 + px(570) / 2
    }

    timer = null
    top = -100

    onReady() {
        this.timer = setTimeout(() => {
            this.setState({
                viewAppear: true,
            })
        }, 200)
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer)
    }

    _onBarCodeRead = (e) => {
        this._stopScan()
        this.validCode(e.nativeEvent.data.code)
    }

    async validCode(code) {
        if (!code) {
            return
        }
        this.setState({
            loading: true
        })
        // 请求接口
        try {
            let res = await get(`/stunner/scanGoldCode.do?id=${code}`)
            let status = res.status
            let title = '', context = '';

            if (status == '0') {
                title = '二维码无法识别';
                context = '请确认扫描二维码是否为达令家金币二维码'
            } else if (status == '1') {
                title = '金币已使用';
                context = '该金币已使用，请扫描未使用的金币二维码'
            } else if (status == '2') {
                title = '金币已过期';
                context = '该金币已过期，请确认后扫描未过期的未使用金币二维码'
            } else if (status == '3') {
                title = '金币已分享被领取';
                context = '该金币已分享，并被其他小伙伴领取，请使用其他金币~'
            }
            if (status == '4') {
                // 跳转
                this.go("UseGold", {...res, code})
                return;
            }

            this.s(title, context)
        } catch (e) {
            this.$toast(e.message)
            this._startScan()
        } finally {
            this.setState({
                loading: false
            })
        }
    }

    s(title, context) {
        this.$alert(title, context, {
            txt: '好',
            click: () => {
                this._startScan()
            }
        })
    }

    update() {
        this._barCode && this._barCode.startScan()
    }

    _startScan = () => {
        this._barCode.startScan()
    }

    _stopScan = () => {
        this._barCode.stopScan()
    }
}
