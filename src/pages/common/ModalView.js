'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback, TextInput,
    KeyboardAvoidingView, Dimensions, Animated,
    ScrollView, NativeModules, Platform,
    ActivityIndicator
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import { log, logErr, logWarm } from '../../utils/logs'
import { User, getShopDetail } from '../../services/Api';
import request, { get, getHeader } from '../../services/Request';
import { getNavigation } from '../../utils/NavigationHolder'
import base from '../../styles/Base'
import { LoadImage, CdnImage } from '../common/ImageView'
import { TrackPage } from "../../services/Track";
import { config, getConstant, setConstant } from "../../services/Constant";
import Icon from '../../UI/lib/Icon'
import EZSwiper from 'react-native-ezswiper';
import Background from '../../UI/lib/Background';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Header } from './Header';
import { ComfirmDelete } from './matter/Extra'
import { isWXAppInstalled, sendAuthRequest } from "../../services/WeChat";
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const AppModule = NativeModules.AppModule;
const aliPay = NativeModules.Alipay;
const os = Platform.OS == "ios" ? true : false;

/**
 * 支付失败
 */

exports.PayFailConfirmModal = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlertModal: false
        };
    }

    render() {
        return <Modal
            visible={this.state.showAlertModal}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}
        >
            <View style={[styles.view, {
                alignItems: 'center'
            }]}>
                <View style={styles.bg} ></View>
                <View style={styles.alertContainer}>
                    <View style={[styles.alertBox, {
                        width: px(600),
                        height: px(320)
                    }]}>
                        <View>
                            <View style={{
                                width: px(600),
                                height: px(230),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text allowFontScaling={false} style={{ color: '#000', fontSize: px(34), lineHeight: px(45) }}>
                                    确认要放弃付款吗？
                                </Text>
                                <Text allowFontScaling={false} style={{ paddingHorizontal: px(30), color: '#000', textAlign: 'center', fontSize: px(26), lineHeight: px(38) }}>
                                    好货不等人哦，超过订单支付时效后，订单将被取消，请尽快完成支付。
                                </Text>
                            </View>
                        </View>
                        <View style={{
                            width: px(600),
                            height: px(90),
                            flexDirection: 'row',
                            borderTopWidth: px(1),
                            borderTopColor: '#e5e5e5'
                        }}>
                            <TouchableWithoutFeedback onPress={() => this.change()}>
                                <View style={{
                                    width: px(299),
                                    height: px(90),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRightWidth: px(1),
                                    borderRightColor: '#e5e5e5'
                                }}>
                                    <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(34) }}>放弃支付</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.edit()}>
                                <View style={{
                                    width: px(300),
                                    height: px(90),
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text allowFontScaling={false} style={{ color: '#d0648f', fontSize: px(34) }}>继续支付</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    }

    close() {
        this.setState({
            showAlertModal: false
        })
    }

    change() {
        this.setState({
            showAlertModal: false
        }, () => {
            this.props.cancel && this.props.cancel();
        })
    }

    edit() {
        this.setState({
            showAlertModal: false
        })
    }

    open() {
        this.setState({
            showAlertModal: true
        })
    }
}

/**
 * Alert
 */

exports.AlertModal = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlertModal: false,
            message: ''
        }
    }

    render() {
        return <Modal
            visible={this.state.showAlertModal}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}
        >
            <View style={[styles.view, {
                alignItems: 'center'
            }]}>
                <TouchableWithoutFeedback onPress={() => this.close()}><View style={styles.bg} ></View></TouchableWithoutFeedback>
                <View style={styles.alertContainer}>
                    <View style={styles.alertBox}>
                        <View style={[styles.alertWrap, {
                            width: px(600),

                        }]}>
                            <View style={styles.alertMessage}>
                                <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(23), lineHeight: px(38) }}>
                                    {this.state.message}
                                </Text>
                            </View>

                        </View>
                        <TouchableWithoutFeedback onPress={() => this.close()}>
                            <View style={styles.alertBtn}>
                                <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(30) }}>确定</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
        </Modal>
    }

    close() {
        this.setState({
            showAlertModal: false,
            message: ''
        })
        this.props.callback && this.props.callback();
    }

    open(message) {
        this.setState({
            showAlertModal: true,
            message
        })
    }
}

/**
 * need ID
 */

exports.IdsConfirmModal = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlertModal: false
        }
        this.address = {};
    }

    render() {
        return <Modal
            visible={this.state.showAlertModal}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}
        >
            <View style={[styles.view, {
                alignItems: 'center'
            }]}>
                <TouchableWithoutFeedback onPress={() => this.close()}><View style={styles.bg} ></View></TouchableWithoutFeedback>
                <View style={styles.alertContainer}>
                    <View style={[styles.alertBox, {
                        width: px(600),
                        height: px(320)
                    }]}>
                        <View>
                            <View style={{
                                width: px(600),
                                height: px(230),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(30), lineHeight: px(38) }}>
                                    您购买的是保税仓商品
                                </Text>
                                <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(30), lineHeight: px(38) }}>
                                    必须输入身份证号
                                </Text>
                            </View>
                        </View>
                        <View style={{
                            width: px(600),
                            height: px(90),
                            flexDirection: 'row',
                            borderTopWidth: px(1),
                            borderTopColor: '#e5e5e5'
                        }}>
                            <TouchableWithoutFeedback onPress={() => this.change()}>
                                <View style={{
                                    width: px(299),
                                    height: px(90),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRightWidth: px(1),
                                    borderRightColor: '#e5e5e5'
                                }}>
                                    <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(32) }}>更换收货地址</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.edit()}>
                                <View style={{
                                    width: px(300),
                                    height: px(90),
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text allowFontScaling={false} style={{ color: '#d0648f', fontSize: px(32) }}>填写身份证号</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    }

    close() {
        this.setState({
            showAlertModal: false
        })
        this.props.close && this.props.close();
    }

    change() {
        this.setState({
            showAlertModal: false
        })
        this.props.change && this.props.change(this.address);
    }

    edit() {
        this.setState({
            showAlertModal: false
        })
        this.props.edit && this.props.edit(this.address);
    }

    open(address) {
        this.address = address;
        this.setState({
            showAlertModal: true
        })
    }
}

/**
 * 密码弹出层
 * method Open 打开弹层
 * event onComplete 完成，校验结束
 * event onClose 关闭，点击关闭按钮
 */
exports.PwdModal = class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showPwdModal: false,
            pwd: ''
        };
        this.isSubmit = false
    }

    render() {
        return <Modal
            visible={this.state.showPwdModal}
            onRequestClose={() => null}
            animationType="none"
            transparent={true}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                <View style={styles.view}>
                    <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={styles.bg} ></View></TouchableWithoutFeedback>
                    <View style={styles.boxbg}>
                        <View style={styles.box}>
                            <View style={styles.title}>
                                <Text>请输入您的余额支付密码</Text>
                            </View>
                            <View style={styles.txtBox}>
                                <TextInput
                                    style={styles.txts}
                                    value={String(this.state.pwd)}
                                    keyboardType='default'
                                    maxLength={20}
                                    secureTextEntry={true}
                                    underlineColorAndroid="transparent"
                                    onChangeText={(pwd) => this.setState({ pwd: pwd })}>
                                </TextInput>
                            </View>
                            <View style={styles.rowsR}>
                                <TouchableOpacity onPress={() => this.resetPwd()}><Text style={styles.reset}>忘记密码？</Text></TouchableOpacity>
                            </View>
                            <View style={styles.rows}>
                                <TouchableOpacity
                                    onPress={() => this.close()}
                                    activeOpacity={0.8}>
                                    <View style={[styles.btn, styles.btnCancel]}>
                                        <Text style={styles.btnTxt1}>取消</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.submit()}
                                    activeOpacity={0.8}>
                                    <View style={[styles.btn, styles.btnSubmit]}>
                                        <Text style={styles.btnTxt2}>确定</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>

    }
    async componentWillMount() {

    }

    pwd = [];
    setPwd(txt) {
        // let list = txt.split('');
        // if (list.length === 0) {
        //     this.pwd[0] = txt;
        // } else {
        //     this.pwd.length = list.length;
        //     list.forEach((item, index) => {
        //         if (item !== "*") {
        //             this.pwd[index] = item;
        //             list[index] = "*";
        //         }
        //     })
        // }
        // for (let index = 0; index < this.pwd.length; index++) {
        //     const item = this.pwd[index];
        //     if (item === undefined) {
        //         this.pwd[index] = "*"
        //     }
        // }

        this.setState({
            pwd: txt
        })
    }

    /**
     * 打开弹窗
     */
    async Open() {
        this.setState({
            showPwdModal: true
        })
    }
    /**
     * 取消
     */
    cancel() {
        this.setState({
            showPwdModal: false, pwd: ''
        })
    }
    /**
     * 关闭
     */
    close() {
        this.setState({
            showPwdModal: false, pwd: ''
        })
        this.props.onClose && this.props.onClose();
    }
    /**
     * 去忘记密码的地方
     */
    resetPwd() {
        this.cancel()
        getNavigation().navigate('EditPswPage', {
            call: () => {

            }
        });
    }
    show() { }
    /**
     * 提交密码
     */
    async submit() {
        const pwd = this.state.pwd;
        if (this.isSubmit) return;
        this.isSubmit = true;
        try {
            let token = await request.post('/saleOrder/checkPwd.do', { payPwd: this.state.pwd });
            this.props.onComplete && this.props.onComplete(token)
        } catch (e) {
            toast(e.message)
        } finally {
            this.setState({ pwd: '', showPwdModal: false }, () => {
                this.isSubmit = false;
            })
        }
    }
}

const styles = StyleSheet.create({
    imageContianer: {
        flex: 1,
        position: 'absolute',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageBody: {
        width: px(650),
        height: px(980),
        backgroundColor: '#fff',
        borderRadius: px(14),
        overflow: 'hidden'
    },
    imageOK: {
        height: px(90),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: px(1),
        borderTopColor: '#E5E5E5',
    },
    imageOkText: {
        fontSize: px(34),
        color: '#D0648F'
    },
    view: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.6)',
        justifyContent: 'center',
    },
    bg: {
        flex: 1,
        width: deviceWidth,
        height: deviceHeight,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    goldContainer: {
        flex: 1,
        position: 'absolute',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goldBody: {
        width: px(540),
        height: px(745),
        borderRadius: px(10),
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    goldTitle: {
        width: px(540),
        height: px(207),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    qrCodes: {
        paddingHorizontal: px(55),
        paddingVertical: px(54),
    },
    loginBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: deviceWidth,
        height: px(886),
        zIndex: 100,
    },
    loginBg: {
        width: deviceWidth,
        height: px(773)
    },
    loginClose: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 101,
        width: px(84),
        height: px(84),
    },
    loginAgree: { position: 'absolute', bottom: 0, left: 0, flex: 1, backgroundColor: "rgba(0, 0, 0, .5)", },
    loginWrap: { flex: 1, justifyContent: 'flex-end' },
    loginAgreeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: px(30) },
    loginCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    loginBtns: { width: deviceWidth, height: isIphoneX() ? px(150) : px(110), flexDirection: 'row', backgroundColor: '#fff' },
    loginBtn: { width: deviceWidth / 2 - 1, height: px(110), justifyContent: 'center', alignItems: 'center' },
    alertContainer: {
        flex: 1,
        position: 'absolute',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        width: px(650),
        height: px(355),
        borderRadius: px(24),
        backgroundColor: '#fff'
    },
    alertWrap: {
        width: px(590),
        paddingTop: px(30),
        paddingHorizontal: px(30)
    },
    alertMessage: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(590),
        height: px(234)
    },
    alertBtn: {
        width: px(650),
        height: px(90),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: px(1),
        borderTopColor: '#e5e5e5'
    },
    boxbg: {
        flex: 1,
        position: 'absolute',
        width: deviceWidth,
        zIndex: 10
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: px(10),
        overflow: 'hidden',
        marginHorizontal: px(70)
    },
    title: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: px(20),
        padding: px(20),
    },
    txtBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginVertical: px(20),
        marginHorizontal: px(30),
        paddingVertical: px(10)
    },
    txts: {
        padding: px(10)
    },
    rows: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: px(1),
        borderColor: '#ddd'
    },
    rowsR: {
        alignItems: 'flex-end',
        marginHorizontal: px(20),
        marginVertical: px(10)
    },
    reset: {
        color: '#858385',
        fontSize: px(26),
        marginBottom: px(20)
    },
    btn: {
        flex: 1,
        paddingVertical: px(30),
        width: px(300),
        alignItems: 'center',

    },
    btnTxt1: {
        color: '#252426',
    },
    btnTxt2: {
        color: '#fff',
    },
    btnCancel: {
        backgroundColor: '#fff',

    },
    btnSubmit: {
        backgroundColor: '#d0648f',
    }
})

/**
 * 传入列表，展示pop菜单
 * props list<Object>{title,onPress} 传入的菜单项
 */
exports.PopModal = class extends React.Component {
    constructor(props) {
        super(props);
        this.height = px(115)
        if (this.props.list) {
            this.height = px(115 + this.props.list.length * 100)
        }
        this.state = {
            showModal: false,
            boxY: new Animated.Value(this.height),
        };
    }
    render() {
        return <Modal
            visible={this.state.showModal}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <View style={styles.view}>
                <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={styles.bg} ></View></TouchableWithoutFeedback>
                <Animated.View style={[popStyles.box, {
                    transform: [
                        { translateY: this.state.boxY }
                    ]
                }]}>
                    {this.props.list && this.props.list.map((item, index) => <TouchableOpacity key={index} onPress={() => {
                        item.onPress && item.onPress(); this.cancel()
                    }} activeOpacity={0.5}>
                        <View style={[base.line, popStyles.btn]} >
                            <Text>{item.title}</Text>
                        </View>
                    </TouchableOpacity>)}
                    <TouchableOpacity onPress={() => this.cancel()} activeOpacity={0.5}>
                        <View style={[base.line, popStyles.btn, popStyles.cancel]} >
                            <Text>取消</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    }

    cancel() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 200
            }
        ).start(() => {
            this.setState({
                showModal: false
            })
        });
    }
    Open() {
        if (!this.state.showModal) {
            this.setState({
                showModal: true
            })
            Animated.timing(
                this.state.boxY,
                {
                    toValue: 0,
                    duration: 200
                }
            ).start();
        }
    }
}
const popStyles = StyleSheet.create({
    box: {
        paddingTop: px(1),
        backgroundColor: '#eee',
        overflow: 'hidden',
    },
    boxbg: {
        flex: 1,
        position: 'absolute',
        width: deviceWidth,
        zIndex: 10
    },
    btn: {
        paddingVertical: px(30),
        backgroundColor: '#fff',
        borderBottomWidth: px(2),
        borderColor: '#eee',
        height: px(100)
    },
    btnTxt: {
        fontSize: px(34)
    },
    cancel: {
        marginTop: px(15)
    }
})

/**
 * 查看大图的弹层
 * props list 图片列表
 */
exports.ImgsModal = class extends React.Component {

    scroll = null
    currentSrc = ''
    maxH = deviceHeight * 0.95;
    constructor(props) {
        super(props);
        this.height = px(240)
        this.state = {
            showModal: false,
            boxY: new Animated.Value(this.height),
            current: 1,
        };
    }
    render() {
        return <Modal
            visible={this.state.showModal}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <View style={imgsStyles.view}>
                <View style={imgsStyles.imgBox}>
                    <ScrollView ref='scroll'
                        contentContainerStyle={[{ height: deviceHeight }, base.line]}
                        keyboardDismissMode='on-drag'
                        onScroll={() => this.cancel()}
                        onMomentumScrollEnd={(e) => {
                            this.setPage(e.nativeEvent.contentOffset)
                        }}
                        pagingEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        directionalLockEnabled={true}
                        horizontal={true}>
                        {this.props.list.map((item, index) => <TouchableWithoutFeedback key={index}
                            delayLongPress={1400}
                            onLongPress={() => this.pop(item.image)}
                            onPress={() => this.close()}>
                            <View style={[imgsStyles.imgItem, base.line]}>
                                {this.resizeImg(item)}
                            </View>
                        </TouchableWithoutFeedback>
                        )}
                    </ScrollView>
                </View>
                <View style={[base.position, imgsStyles.pageBox]}>
                    <Text style={imgsStyles.pageTxt}>{this.state.current}/{this.props.list.length}</Text>
                </View>
                <Animated.View style={[imgsStyles.box, {
                    transform: [
                        { translateY: this.state.boxY }
                    ]
                }]}>
                    <TouchableOpacity onPress={() => this.save()} activeOpacity={0.5}>
                        <View style={[base.line, imgsStyles.btn]} >
                            <Text style={imgsStyles.btnSave}>保存图片到相册</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.cancel()} activeOpacity={0.5}>
                        <View style={[base.line, imgsStyles.btn, imgsStyles.cancel]} >
                            <Text style={imgsStyles.btnCancel}>取消</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    }
    timer = null;
    componentWillUnmount() {
        if (this.timer) clearTimeout(this.timer);
    }
    /**
     * 重新计算图片
     * @param {*} w
     * @param {*} h
     */
    resizeImg(item) {
        if (!item) return null;
        let nw = px(Number(item.width));
        let nh = px(Number(item.height));
        //超过宽度
        if (nw != deviceWidth) {
            nh = nh / nw * deviceWidth
            nw = deviceWidth
        }
        if (nh > this.maxH) {
            nw = nw / nh * this.maxH;
            nh = this.maxH;
        }
        return <LoadImage
            source={item.image}
            w={nw}
            h={nh}
        />
    }
    /**
     * 设置页面
     */
    setPage(offset) {
        this.setState({
            current: (offset.x / deviceWidth >> 0) + 1
        })
    }
    /**
     * 取消弹层
     */
    close() {
        this.setState({
            showModal: false
        })
        this.state.boxY.setValue(this.height)
    }
    /**
     * 取消弹出的保存
     */
    cancel() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 200
            }
        ).start();
    }
    /**
     * 弹出保存
     */
    pop(src) {
        this.currentSrc = src;
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 200
            }
        ).start();
    }
    /**
     * 保存图片
     */
    async save() {
        if (!this.currentSrc) return;
        AppModule.saveImageToAlbum(this.currentSrc, (ignore, res) => {
            if (res) {
                toast('保存成功');
            } else {
                toast('保存失败');
            }
        });
        this.cancel();
    }
    /**
     * 打开弹层
     * @param {*} key
     */
    Open(key) {
        this.setState({
            showModal: true
        }, () => {
            for (let index = 0; index < this.props.list.length; index++) {
                const item = this.props.list[index];
                if (item.image === key) {
                    this.setState({
                        current: index + 1
                    })
                    Platform.OS === 'ios'
                        &&
                        this.refs
                        &&
                        this.refs.scroll
                        &&
                        this.refs.scroll.scrollTo({ x: deviceWidth * index, y: 0, animated: false })

                    break;
                }
            }
            if (Platform.OS !== 'ios') {
                this.timer = setTimeout(() => {
                    this.refs
                        &&
                        this.refs.scroll
                        &&
                        this.refs.scroll.scrollTo({ x: deviceWidth * (this.state.current - 1), y: 0, animated: false })
                }, 0);
            }
        })
    }
}

const imgsStyles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,1)',
        justifyContent: 'center',
    },
    imgBox: {
        width: deviceWidth,
        height: deviceHeight,
    },
    imgItem: {
        width: deviceWidth,
        height: deviceHeight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff'
    },
    box: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        paddingHorizontal: px(25),
        paddingBottom: px(10)
    },
    btn: {
        paddingVertical: px(25),
        backgroundColor: '#fff',
        borderBottomWidth: px(2),
        borderColor: '#eee',
        height: px(100),
        borderRadius: px(15)
    },
    btnSave: {
        color: '#d0648f'
    },
    cancel: {
        marginTop: px(25),
    },
    btnCancel: {
        color: '#252426'
    },
    pageBox: {
        backgroundColor: 'rgba(0,0,0,.5)',
        alignItems: 'center',
        borderRadius: px(20),
        right: px(30),
        bottom: px(80),
        paddingHorizontal: px(20),
        paddingVertical: px(10)
    },
    pageTxt: {
        color: '#fff'
    }
})

/**
 * 图片弹框
 */

exports.ImageModal = class extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            loading: true,
        }
    }

    height = 0
    image = ''
    open(image) {
        this.image = image;
        Image.getSize(image, (width, height) => {
            this.height =  height / (width / px(560))
            this.setState({
                show: true
            })
        }, () => {
            this.height = 0
            this.setState({
                show: true
            })
        })
    }

    render() {
        return <Modal
            visible={this.state.show}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <View style={[base.flex_middle, { backgroundColor: "rgba(0,0,0,.5)" }]}>
                <TouchableWithoutFeedback onPress={() => {
                    this.setState({ show: false })
                }}>
                    <View style={styles.bg}></View>
                </TouchableWithoutFeedback>
                {this.state.show ? <View style={styles.imageContianer}>
                    <View style={styles.imageBody}>
                        <View style={{flex: 1, paddingTop: px(75), paddingBottom: px(44)}}>
                            <ScrollView style={{flex: 1}}>
                                <View style={{alignItems: 'center'}}>
                                    <Image style={{width: px(560), height: this.height}} source={{ uri: this.image || '' }} onLoadEnd={() => {
                                        this.setState({
                                            loading: false,
                                        })
                                    }} />
                                </View>
                            </ScrollView>
                        </View>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({ show: false })
                        }}>
                            <View style={styles.imageOK}>
                                <Text style={styles.imageOkText}>
                                    我同意
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View> : null}
                {this.state.loading ? <View style={{ position: 'absolute', right: 0, top: 0, width: deviceWidth, height: deviceHeight, zIndex: 101, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator
                        animating={true}
                        size="large"
                        color="#000"
                    />
                </View> : null}
            </View>
        </Modal>
    }
}

/**
 * 金币二维码弹框
 */

exports.GoldQrCodeModal = class extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            loading: false,
            qrCodeUrl: ''
        }
    }

    amountStr = ''
    id = ''

    render() {
        return <Modal
            visible={this.state.show}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <View style={[base.flex_middle, { backgroundColor: "rgba(0,0,0,.5)" }]}>

                <TouchableWithoutFeedback onPress={() => {
                    this.setState({ show: false, loading: false, qrCodeUrl: '' })
                }}>
                    <View style={styles.bg}></View>
                </TouchableWithoutFeedback>
                {this.state.show ? <View style={styles.goldContainer}>
                    <View style={styles.goldBody}>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({ show: false, loading: false, qrCodeUrl: '' })
                        }}>
                            <View style={{ position: 'absolute', right: 0, top: 0, width: px(72), height: px(72), zIndex: 100 }}></View>
                        </TouchableWithoutFeedback>
                        <Background style={styles.goldTitle} name="gold-bg" resizeMode={'cover'}>
                            <View style={{ height: px(114), overflow: 'hidden', flexDirection: 'row', alignItems: 'flex-end' }}>
                                <Text allowFontScaling={false} style={{ fontSize: px(110), color: '#fff', fontWeight: '600', lineHeight: px(114) }}>{this.amountStr}</Text>
                                <Text allowFontScaling={false} style={{ marginLeft: px(5), fontSize: px(30), color: '#fff', lineHeight: px(100) }}>金币</Text>
                            </View>
                        </Background>
                        <View style={styles.qrCodes}>
                            {this.state.qrCodeUrl ? <Image style={{ width: px(430), height: px(430) }} source={{ uri: this.state.qrCodeUrl }} onLoadEnd={() => {
                                this.setState({
                                    loading: false,
                                })
                            }} /> : null}
                        </View>
                    </View>
                </View> : null}
                {this.state.loading ? <View style={{ position: 'absolute', right: 0, top: 0, width: deviceWidth, height: deviceHeight, zIndex: 101, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator
                        animating={true}
                        size="large"
                        color="#000"
                    />
                </View> : null}
            </View>
        </Modal>
    }

    open(gold) {
        let { amountStr, stunnerLogId } = gold
        this.amountStr = amountStr
        this.id = stunnerLogId
        this.setState({
            loading: true,
            show: true,
        });

        this.getQrCode()
    }

    async getQrCode() {
        try {
            let res = await get(`/stunner/generateCode.do?id=${this.id}`);
            this.setState({
                qrCodeUrl: res.goldCode
            })
        } catch (e) {
            this.setState({
                loading: false,
            })
        }
    }
}

/**
 * alert提示
 * @param {*} opt.title 标题
 * @param {*} opt.content<array> 内容
 * @param {*} opt.btns<array> 按钮组
 * @param {*} opt.btns.txt 按钮标题
 * @param {*} opt.btns.click 按钮点击事件
 */
exports.DialogModal = class extends React.Component {
    constructor(props) {
        super(props)
        this.enabledExit = this.props.enabledExit;
        this.state = {
            show: false,
            opt: { title: "", content: [], btns: [], code: null }
        }
    }
    render() {
        let opt = this.state.opt;
        return <Modal
            visible={this.state.show}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            {this.state.show && <View style={[base.flex_middle, { backgroundColor: "rgba(0,0,0,.5)" }]}>
                <TouchableWithoutFeedback onPress={() => {
                    this.enabledExit && this.setState({ show: false })
                }}>
                    <View style={styles.bg}></View>
                </TouchableWithoutFeedback>
                <View style={styles.alertContainer}>
                    <View style={[DialogStyle.alert_box, this.props.style]}>
                        {opt.title && <View style={DialogStyle.alert_title}>
                            <Text style={DialogStyle.alert_title_txt}>{opt.title}</Text>
                        </View>}
                        <View style={[DialogStyle.alert_body, opt.content && opt.content.length > 3 ? { alignItems: 'flex-start' } : null, this.props.bodyStyle]}>
                            {opt.content && opt.content.map((txt, index) =>
                                <Text key={index} style={[DialogStyle.alert_body_txt, this.props.bodyTextStyle]}>{txt}</Text>
                            )}
                            {opt.code}
                        </View>
                        <View style={DialogStyle.alert_foot}>
                            {opt.btns.map((btn, index) => <TouchableOpacity key={index} onPress={() => this.onClick(btn)}><View style={[DialogStyle.alert_foot_btn, { borderLeftWidth: index > 0 ? px(1) : 0 }]} ><Text style={{ color: btn.color }}>{btn.txt}</Text></View></TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>}
        </Modal>
    }

    onClick(btn) {
        if (!btn.click) return this.setState({ show: false });
        if (btn.click() !== false) this.setState({ show: false });
    }
    open(opt) {
        if (!opt || !opt.content && !opt.code) return logWarm("alert没有传入内容参数");
        if (!opt.btns || opt.btns.length === 0) {
            opt.btns = [{ txt: "确定", click: () => { } }]
        }
        if (opt.btns.length == 1) {
            opt.btns[0].color = "#d0648f";
        }
        if (opt.btns.length == 2) {
            opt.btns[1].color = "#d0648f";
        }
        this.setState({
            show: true, opt
        })
    }
    /**
    * alert提示
    * @param {*} title 标题
    * @param {*} content<array> 内容
    * @param {*} success<array> 成功
    * @param {*} cancel<array> 取消
    * @param {*} success.txt 按钮标题
    * @param {*} success.click 按钮点击事件
    * 重载,(content<string|array>)
    * 重载,(title<string>,content<string|array>)
    * 重载,(title<string>,content<string|array>,success<string|object>)
    * 重载,(title<string>,content<string|array>,success<string|object>,cancel<string|object>)
    */
    alert(title, content, success, cancel) {
        if (!title) {
            title = null
        }
        if (title && !content) {
            const tmp = content;
            content = title;
            title = tmp;
        }
        if (typeof content === "string") content = [content]
        if (typeof success === "string") success = { txt: success }
        if (typeof cancel === "string") success = { txt: cancel }
        this._alert(title, content, success, cancel)
    }
    _alert(title, content, success, cancel) {
        let opt = {
            title, content,
            btns: []
        }
        if (success) opt.btns.push(success)
        if (cancel) opt.btns.push(cancel)
        this.open(opt);
    }
}
const DialogStyle = StyleSheet.create({
    alert_box: {
        width: px(600),
        backgroundColor: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: px(25),
        overflow: "hidden"
    },
    alert_title: {
        paddingTop: px(40),
    },
    alert_title_txt: {
        fontSize: px(34),
        color: '#222'
    },
    alert_body: {
        paddingHorizontal: px(24),
        paddingTop: px(5),
        paddingBottom: px(30),
        alignItems: 'center',
    },
    alert_body_txt: {
        lineHeight: px(40),
        fontSize: px(26),
    },
    alert_foot: {
        borderTopWidth: px(1),
        borderColor: "#ccc",
        width: px(600),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    alert_foot_btn: {
        width: px(300),
        alignItems: 'center',
        borderColor: "#ccc",
        paddingVertical: px(30)
    }
})

exports.LoginProtocol = class extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            agree: true,
        }
    }

    render() {
        return this.state.show ? <View style={styles.loginAgree}>
            <TouchableWithoutFeedback onPress={() => {
                this.setState({ show: false })
            }}>
                <View style={styles.bg}></View>
            </TouchableWithoutFeedback>
            <View style={[styles.loginBottom, isIphoneX() ? { height: px(926) } : {}]}>
                <Background resizeMode="cover" style={styles.loginBg} name="login-p">
                    <View style={styles.loginWrap}>
                        <View style={styles.loginAgreeContent}>
                            <TouchableWithoutFeedback onPress={() => {
                                this.setState({ agree: !this.state.agree })
                            }}>
                                <View style={styles.loginCenter}>
                                    <View style={{ width: px(24), height: px(24), position: 'relative' }}>
                                        {this.state.agree ? <Icon resizeMethod="scale" name="agree" style={{ width: px(24), height: px(24), position: 'absolute', top: 0, left: 0, zIndex: 9 }} /> : null}
                                        <Icon resizeMethod="scale" name="agree-un" style={{ width: px(24), height: px(24) }} />
                                    </View>
                                    <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#ccc', paddingHorizontal: px(10) }}>我已阅读并同意遵守</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <Text onPress={() => {
                                this.props.navigation.navigate('LoginAgree', {});
                            }} allowFontScaling={false} style={{ fontSize: px(26), color: '#44b7ea' }}>达令家店主服务协议</Text>
                        </View>
                    </View>
                </Background>
                <View style={styles.loginBtns}>
                    <TouchableWithoutFeedback onPress={() => {
                        this.props.login1 && this.props.login1(this.token, () => {
                            this.setState({ show: false })
                        })
                    }}>
                        <View style={styles.loginBtn}>
                            <Text allowFontScaling={false} style={{ fontSize: px(34), color: '#222' }}>暂不领取</Text>
                            <Text allowFontScaling={false} style={{ fontSize: px(24), color: '#999' }}>以VIP身份登录</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{ width: px(1), height: px(110), backgroundColor: '#efefef' }}></View>
                    <TouchableWithoutFeedback onPress={() => {
                        this.props.login2 && this.props.login2(this.token, this.state.agree, () => {
                            this.setState({ show: false })
                        })
                    }}>
                        <View style={styles.loginBtn}>
                            <Text allowFontScaling={false} style={{ fontSize: px(34), color: '#d0648f' }}>领取并登录</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </View> : null
    }
    token = ''
    open(token) {
        this.token = token;
        this.setState({
            show: true,
        });
    }
}

exports.GGModal = class extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            show: false,
            img: "",
            height: deviceHeight * 0.75,
            width: deviceWidth,
            list: [],
            itemIndex: 0
        }
    }
    static defaultProps = {
        click: () => { }
    }
    render() {
        return <Modal
            visible={this.state.show}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <View style={[base.flex_middle, { backgroundColor: "rgba(0,0,0,.7)", flex: 1 }]}>
                <View style={GGModalStyle.box}>
                    {this.state.list.length === 1 && this.renderItem2(this.state.list[0])}
                    {this.state.list.length > 1 && <EZSwiper
                        loop={false}
                        width={deviceWidth}
                        height={px(800)}
                        style={GGModalStyle.swipe}
                        onDidChange={this.change.bind(this)}
                        dataSource={this.state.list}
                        renderRow={this.renderItem.bind(this)}
                        onPress={this.click.bind(this)} />}
                    <View style={GGModalStyle.dotbox}>
                        {this.state.list.length > 1 && this.state.list.map((item, index) => <View style={[GGModalStyle.dot, index === this.state.itemIndex ? GGModalStyle.active : null]} key={index}></View>)}
                    </View>
                </View>
                <TouchableOpacity onPress={() => this.close()}>
                    <View style={GGModalStyle.closeBtn}>
                        <Icon resizeMethod="scale" name="icon-close2" style={GGModalStyle.close} />
                    </View>
                </TouchableOpacity>
            </View>
        </Modal>
    }
    renderItem(item) {
        return <View style={GGModalStyle.img}>
            <CdnImage
                style={{ left: 118 }}
                resizeMethod="scale"
                src={item.showImg}
                width={px(item.width)}
                height={px(item.height)}
            />
        </View>
    }
    renderItem2(item) {
        return <TouchableOpacity onPress={() => this.click(item)}>
            <View style={GGModalStyle.img}>
                <CdnImage
                    style={{ left: 118 }}
                    resizeMethod="scale"
                    src={item.showImg}
                    width={px(item.width)}
                    height={px(item.height)}
                />
            </View>
        </TouchableOpacity >
    }
    //#region 方法
    click(item) {
        this.close(item.id);
        this.props.click(item);
    }
    shouldUpdate = false;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    // show(src) {
    //     setConstant('gg_time', Date.now());
    //     this.shouldUpdate = true;
    //     if (src && src.img) {
    //         src.width = px(src.width) || deviceWidth;
    //         src.height = px(src.height) || deviceHeight * 0.75;
    //         this.setState({ show: true, ...src })
    //     }
    // }
    open(list) {
        // setConstant('gg_time', Date.now());
        this.shouldUpdate = true;
        this.setState({ show: true, list })
    }
    end() {
        this.shouldUpdate = true;
        this.setState({ show: false })
    }
    close(id = "") {
        const ids = this.state.list.map(item => item.id).join(',')

        this.shouldUpdate = true;
        this.setState({ show: false }, () => {
            this.trackGG();
        });

        // 关闭时将所有id传递给后端
        id = id || ids

        request.get("/popupLayer/counter.do", { id });
    }
    change(e, id) {
        let itemIndex = this.state.itemIndex;
        itemIndex++;
        if (itemIndex >= this.state.list.length) {
            itemIndex = 0;
        }
        this.shouldUpdate = true;
        this.setState({ itemIndex })
    }

    trackGG() {
        let prev_gg_time = parseInt(getConstant('gg_time')) || Date.now();
        let gg_time = Date.now() - prev_gg_time;

        TrackPage('ShopPage', 'GGModal', gg_time)
        setConstant('gg_time', Date.now());
    }
    //#endregion
}

const GGModalStyle = StyleSheet.create({
    box: {
        width: deviceWidth,
        height: px(940),
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    swipe: {
        width: deviceWidth,
        height: px(800),
    },
    img: {
        width: deviceWidth,
        height: px(800),
        alignItems: 'center',
    },
    bg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.7)',
    },
    closeBtn: {
        width: px(120),
        height: px(80),
        alignItems: 'center',
        justifyContent: 'center',
    },
    close: {
        width: px(60),
        height: px(60),
    },
    dotbox: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: px(30),
        marginBottom: px(50)
    },
    dot: {
        marginHorizontal: 3,
        width: 10,
        height: 3,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,.5)",
    },
    active: {
        backgroundColor: "#fff",
    }
})

/**
 * 发送手机短信验证码的弹层
 */
exports.SendMsgModal = class extends React.Component {
    constructor(props) {
        super(props)
        this.enabledExit = this.props.enabledExit;
        this.state = {
            show: false,
            opt: { title: "", content: [], btns: [] },
            code: '',
            timeout: 0
        }
    }
    render() {
        let opt = this.state.opt;
        return <Modal
            visible={this.state.show}
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            {this.state.show &&
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                    <View style={[base.flex_middle, { backgroundColor: "rgba(0,0,0,.5)" }]}>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({ show: false })
                        }}>
                            <View style={styles.bg}></View>
                        </TouchableWithoutFeedback>
                        <View style={styles.alertContainer}>
                            <View style={[DialogStyle.alert_box, this.props.style]}>
                                <View style={DialogStyle.alert_title}>
                                    <Text style={DialogStyle.alert_title_txt}>手机验证码</Text>
                                </View>
                                <View style={[DialogStyle.alert_body, this.props.bodyStyle]}>
                                    <Text style={DialogStyle.alert_body_txt}>
                                        点击获取验证码，会向您绑定的手机号
                                    </Text>
                                    <Text style={DialogStyle.alert_body_txt}>
                                        "{this.filter(opt.mobile)}"发送验证码
                                    </Text>
                                    <View style={[sentStyles.sendMsg, base.inline_between]}>
                                        <TextInput
                                            placeholder='输入验证码'
                                            placeholderTextColor="#b2b3b5"
                                            style={sentStyles.sendMsgTxt}
                                            value={String(this.state.code)}
                                            keyboardType='numeric'
                                            maxLength={10}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(code) => this.setState({ code: code })}
                                        >
                                        </TextInput>
                                        <TouchableWithoutFeedback onPress={() => this.sendCode()}>
                                            <View style={[sentStyles.sendBox, base.inline]}>
                                                <Text allowFontScaling={false} style={this.state.sent ? sentStyles.sent : sentStyles.send}
                                                >
                                                    {this.state.sent ?
                                                        `重新获取${this.state.timeout}S` :
                                                        `获取验证码`
                                                    }
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>
                                <View style={DialogStyle.alert_foot}>
                                    <TouchableOpacity onPress={() => {
                                        this.setState({ show: false })
                                    }}>
                                        <View style={[DialogStyle.alert_foot_btn]} >
                                            <Text>取消</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.submit()}>
                                        <View style={[DialogStyle.alert_foot_btn, { borderLeftWidth: px(1) }]} >
                                            <Text style={{ color: '#d0648f' }}>确定</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            }
        </Modal>
    }

    filter(num) {
        if (!num) return;
        return num.substr(0, 3) + '****' + num.substr(7, 10)
    }

    async sendCode() {
        if (this.state.sent) {
            return;
        }
        try {
            let { opt } = this.state
            if (!opt) return;
            let res = await request.post(`/userBank/sendVerifyCode.do`, {
                mobile: opt.mobile,
                type: opt.type
            });
            this.startTimer();
            toast(res.message);
        } catch (e) {
            toast(e.message);
        }
    }

    startTimer() {
        this.setState({
            sent: Date.now(),
            timeout: 60
        });
        this.timer = setInterval(() => {
            let elapsed = Math.ceil((Date.now() - this.state.sent) / 1000);
            if (elapsed > 30) {
                this.setState({
                    showTip: true
                });
            }
            if (elapsed > 59) {
                this.setState({
                    sent: null,
                    timeout: null
                });
                clearInterval(this.timer);
                delete this.timer;
            } else {
                this.setState({
                    timeout: 60 - elapsed
                });
            }
        }, 100);
    }

    async submit() {
        let code = this.state.code
        try {
            let { opt } = this.state
            if (!opt) return;
            if (code == '') {
                return toast('请输入验证码')
            }
            let res = {}
            try {
                res = await request.post(`/userBank/checkVerifyCode.do`, {
                    verifyCode: code,
                    accountType: opt.type
                });
            } catch (e) {
                toast(e.message)
                return;
            }
            toast('校验成功')
            if (opt.type == 0) {
                await this.getToken_(res.token)
            } else if (opt.type == 1) {
                this.props.navigation.navigate('AddBankCardPage', {
                    token: res.token,
                    mobile: opt.mobile,
                    callback: () => {
                        toast('添加成功')
                        this.props.refresh()
                    }
                });
            } else if (opt.type == 2) {
                let installed = await isWXAppInstalled();
                if (!installed) {
                    toast('没有安装微信');
                    return;
                }
                let wxRes;
                try {
                    wxRes = await sendAuthRequest('snsapi_userinfo', '');
                } catch (e) {
                    logWarm(e.message)
                    return;
                }
                try {
                    let app = getHeader('app')
                    let newRes = await request.post('/userBank/saveUserBankWx.do', {
                        authCode: wxRes.code,
                        type: opt.type,
                        token: res.token,
                        app: app
                    });
                    toast('添加成功')
                    this.props.refresh()
                } catch (e) {
                    log('绑定错误原因', e)
                    toast(e.message)
                }
            }
            //this.props.getToken_(res.token)
        } catch (e) {
            log('绑定错误原因', e)
        }
        this.setState({ show: false })
    }

    async getToken_(token) {
        try {
            let res = await request.get(`/userBank/getAlicashParam.do?token=${token}`);
            let param = [];
            for (let k in res) {
                param.push(`${k}=${res[k]}`);
            }
            let paramStr = param.join('&');
            let app_ = await aliPay.auth({ infoString: paramStr });
            /*os && toast(app_.result)
            !os && toast(app_)*/
            //console.log(app_)
            let request_ = ''
            if (os) {
                request_ = app_.result
            } else {
                request_ = app_
            }
            let save_ = await request.get(`/userBank/saveUserAlicash.do?token=${token}&${request_}`);
            toast('添加成功')
            //toast(save_.errorMsg)
            this.props.refresh()
        } catch (e) {
            toast(e.message)
        }
    }

    open(opt) {
        if (!opt || !opt.mobile) return logWarm("alert没有传入内容参数");
        if (!opt.btns || opt.btns.length === 0) {
            opt.btns = [{ txt: "确定", click: () => { } }]
        }
        if (opt.btns.length == 2) {
            opt.btns[1].color = "#d0648f";
        }
        this.setState({
            code: '',
            show: true, opt
        })
    }
}

const sentStyles = StyleSheet.create({
    sendMsg: {
        width: px(474),
        height: px(68),
        borderColor: '#808080',
        borderWidth: px(1),
        marginTop: px(45)
    },
    sendMsgTxt: {
        padding: px(10),
        fontSize: px(28),
        flex: 1
    },
    sent: {
        color: '#d0648f',
        fontSize: px(28),
        marginRight: px(16)
    },
    send: {
        color: '#d0648f',
        fontSize: px(28),
        marginRight: px(16)
    },
    sendBox: {
        height: px(68)
    }
});

/**
 *查看大图的弹层（可缩放用于素材）
 * bigImages: [{url:''}, {url: ''}]
 * imageIndex 第一次打开是第几张图片
 */

exports.ZoomImgModal = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageShow: false,
            bigImages: [],
            imageIndex: 0
        }

    }

    onBack = () => {
        this.setState({
            imageShow: false,
            imageIndex: 0,
            bigImages: []
        })
    }

    renderHead = () => {
        const { bigImages, imageIndex } = this.state;
        let title = `${imageIndex + 1}/${bigImages.length}`;
        return <Header
            style={{ backgroundColor: '#fff' }}
            title={title}
            onBack={this.onBack}
            navigation={{ state: { params: null } }}
        >
        </Header>
    }

    render() {
        const { bigImages, imageShow, imageIndex } = this.state;
        if (bigImages.length == 0) return null;
        return <Modal
            visible={imageShow}
            onShow={() => this.open()}
            onRequestClose={() => this.cancel()}
            transparent={true}>
            <View style={lookStyles.modal}>
                {this.renderHead()}

                <ImageViewer
                    imageUrls={bigImages}
                    index={imageIndex}
                    renderHeader={() => null}
                    renderIndicator={() => null}
                    onChange={(index) => this.onChange(index)}
                    onLongPress={(image) => this.refs.comBtn && this.refs.comBtn.pop(image)}
                    saveToLocalByLongPress={false}
                    onClick={() => this.cancel()}
                    renderFooter={() => null}
                />
                <CommonBtnList ref="comBtn" />
            </View>
        </Modal>
    }

    onChange(index) {
        this.setState({
            imageIndex: index
        });
    }

    open(index, images) {
        if (!images) {
            return;
        }
        this.setState({
            imageShow: true,
            imageIndex: index,
            bigImages: images
        })
    }

    save() {
        const { bigImages, imageIndex } = this.state;
        let img = bigImages[imageIndex].url;
        this.refs.comBtn && this.refs.comBtn.saveToAlbum(img);
    }

    cancel() {
        this.refs.comBtn && this.refs.comBtn.cancel()
        this.setState({
            imageShow: false,
            imageIndex: 0,
            bigImages: []
        })
    }

}

const zoomStyles = StyleSheet.create({
    box: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        paddingHorizontal: px(25),
        paddingBottom: px(10)
    },
    btn: {
        //paddingVertical: px(25),
        backgroundColor: '#fff',
        borderBottomWidth: px(2),
        borderColor: '#eee',
        height: px(100),
        borderRadius: px(15)
    },
    btnSave: {
        color: '#d0648f'
    },
    cancel: {
        marginTop: px(25),
    },
    btnCancel: {
        color: '#252426'
    },
    down: {
        position: 'absolute',
        right: px(51),
        bottom: px(51)
    }
});

class CommonBtnList extends React.Component {
    constructor(props) {
        super(props)
        this.height = px(240)
        this.state = {
            boxY: new Animated.Value(this.height),
            needSaveImage: ''
        }
    }

    render() {
        const { needSaveImage } = this.state;
        return <Animated.View style={[zoomStyles.box, {
            transform: [
                { translateY: this.state.boxY }
            ]
        }]}>
            <TouchableOpacity onPress={() => this.saveToAlbum(needSaveImage)} activeOpacity={0.5}>
                <View style={[base.line, zoomStyles.btn]} >
                    <Text allowFontScaling={false} style={zoomStyles.btnSave}>保存图片到相册</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.cancel()} activeOpacity={0.5}>
                <View style={[base.line, zoomStyles.btn, zoomStyles.cancel]} >
                    <Text allowFontScaling={false} style={zoomStyles.btnCancel}>取消</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    }

    pop(src) {
        if (!src) return;
        this.setState({
            needSaveImage: src.url
        })
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 200
            }
        ).start();
    }

    /**
     * 保存图片
     */
    async saveToAlbum(needSaveImage) {
        const img = needSaveImage;
        try {
            await new Promise((resolve, reject) => {
                AppModule.saveImageToAlbum(img, (ignore, res) => {
                    if (res) {
                        toast('保存成功');
                        resolve()
                    } else {
                        reject()
                    }
                });
            });
        } catch (e) {
            toast('保存失败，请稍后重试');
        }
        this.cancel()
    }

    cancel() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 200
            }
        ).start();
    }
}
exports.CommonBtnList = CommonBtnList

/*const BTNLIST = {
    /!**
     * 保存图片
     *!/
    SAVEPIC: {
        method: "savePic", txt: '保存图片到相册'
    },
    /!**
     * 取消
     *!/
    CANCEL: {
        method: 'cancel', txt: '取消'
    }
}
exports.BTNLIST = BTNLIST*/

exports.BtnModal = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            bigImages: [],
            imageIndex: 0
        }

    }

    render() {
        const { show } = this.state;
        let { list } = this.props;
        if (list.length == 0) return null;
        return <Modal
            visible={show}
            style={{ flex: 1 }}
            onShow={() => this.open()}
            transparent={true}>
            <TouchableWithoutFeedback onPress={() => this.cancel()}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}></View>
            </TouchableWithoutFeedback>
            {this.renderBtn(list)}
        </Modal>
    }

    renderBtn(list) {
        if (!list || list.length == 0) return null;
        return <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            {
                list.map((i, k) =>
                    <TouchableOpacity key={k} activeOpacity={0.5} onPress={() => {
                        i.click && i.click()
                    }}>
                        <View style={[base.line, zoomStyles.btn, i.styles]} >
                            <Text allowFontScaling={false} style={[zoomStyles.btnSave, i.txtStyles]}>{i.txt}</Text>
                        </View>
                    </TouchableOpacity>
                )
            }
        </View>

    }


    open() {
        this.setState({
            show: true
        })
    }


    cancel() {
        this.setState({
            show: false
        })
    }

}


/**
 *替换删除按钮，加载失败的图片需要给一个
 */
exports.LookBigImgModal = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageShow: false,
            bigImages: [],
            imageIndex: 0
        }
        this.renderHead = this.renderHead.bind(this);

    }

    onBack() {
        this.setState({
            imageShow: false,
            imageIndex: 0,
            bigImages: []
        })
    }

    del() {
        let bigImages = this.state.bigImages,
            imageIndex = this.state.imageIndex;
        //console.log(1, bigImages, imageIndex)
        bigImages.splice(imageIndex, 1);
        if (bigImages.length > 0 && imageIndex > bigImages.length - 1) {
            imageIndex = bigImages.length - 1
        }
        if (bigImages.length == 0) {
            this.onBack()
        }
        this.setState({
            bigImages,
            imageIndex
        });
        this.props.delPhotos && this.props.delPhotos(imageIndex);
    }

    deleteFn() {
        this.refs.comfirmDelete && this.refs.comfirmDelete.pop();
    }

    renderHead() {
        const { bigImages, imageIndex } = this.state;
        let title = `${imageIndex + 1}/${bigImages.length}`;
        return <Header
            style={{ backgroundColor: '#fff' }}
            title={title}
            onBack={() => this.onBack()}
            navigation={{ state: { params: null } }}
            rightBtn={
                <TouchableOpacity activeOpacity={0.9} onPress={() => this.deleteFn()}>
                    <Icon name="trash" style={{ width: 21, height: 21, marginRight: 10 }} />
                </TouchableOpacity>
            }
        >
        </Header>
    }

    render() {
        const { bigImages, imageShow, imageIndex } = this.state;
        //console.log(imageIndex, 'imageIndex')
        if (bigImages.length == 0) return null;
        return <Modal
            visible={imageShow}
            onShow={() => this.open()}
            transparent={true}>
            <View style={lookStyles.modal}>
                {this.renderHead()}
                <ImageViewer
                    imageUrls={bigImages}
                    index={imageIndex}
                    //failImageSource=""
                    //renderHeader={() => this.renderHead()}
                    renderHeader={() => null}
                    renderIndicator={() => null}
                    onChange={(index) => this.onChange(index)}
                    saveToLocalByLongPress={false}
                    renderFooter={() => null}
                />
                <ComfirmDelete
                    type="image"
                    ref="comfirmDelete"
                    del={this.del.bind(this)}
                />
            </View>
        </Modal>
    }

    onChange(index) {
        this.setState({
            imageIndex: index
        });
    }

    open(index, images) {
        if (!images) {
            return;
        }
        this.setState({
            imageShow: true,
            imageIndex: index,
            bigImages: images
        })
    }

}
const lookStyles = StyleSheet.create({
    modal: {
        flex: 1,
        height: deviceHeight,
        backgroundColor: '#000'
    },
})
