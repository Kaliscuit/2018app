import React from 'react'
import {
    Text,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    ScrollView,
    NativeModules, DeviceEventEmitter, TextInput, TouchableOpacity, Platform
} from 'react-native'
import Page from '../../UI/Page'
import {px, isIphoneX} from "../../utils/Ratio";
import base from "../../styles/Base";
import Input from "../../UI/lib/Input";
import Icon from '../../UI/lib/Icon'
import {SubmitPicker} from "./SubmitAddress";
import request, {domain, getHeader} from "../../services/Request";
import {getItem, setItem} from "../../services/Storage";
import util_tools from "../../utils/tools";
import {TipRed} from "../common/ExplainModal";
import {log} from "../../utils/logs";
import Router from "../../services/Router";
import {User} from "../../services/Api";
import PayPlatform from "../common/PayPlatform";
import Address from "react-native-city-picker";
import {DialogModal, ImageModal} from '../common/ModalView'
import {config} from "../../services/Constant";
import {show as toast} from "../../widgets/Toast.ios";
import {isWXAppInstalled, pay as wxPay} from "../../services/WeChat";

const App = NativeModules.AppModule;

export default class extends Page {
    constructor(props) {
        super(props, {
            selected: true,
            realName: '',
            realPhone: '',
            realCode: '',
            userName: '',
            userPhone: '',
            userAddr: '',
            address: {},
            detail: {},
            time: 0,
            provinceList: [],
            selectAddress: [],
            isTip: false,
        })
    }

    title = '订单确认'

    pageBody() {
        let isDefaultAddress = this.state.address && this.state.address.name
        return <View style={{flex: 1}}>
            <ScrollView style={{flex: 1}}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled">
                {
                    this.state.detail.virtualYn != 1 &&
                    <View style={{marginBottom: px(20)}}>
                        <View style={styles.hint}>
                            <Text allowFontScaling={false} style={styles.idHint}>
                                为保证您能及时收到商品，请认真填写您的收货地址
                            </Text>
                        </View>
                        {
                            isDefaultAddress &&
                            <TouchableWithoutFeedback onPress={() => {
                                this.selectAddress()
                            }}>
                                <View style={styles.address}>
                                    <Icon style={styles.addressIcon}
                                          name="icon-address"/>
                                    <View style={styles.addressInfo}>
                                        <Text
                                            allowFontScaling={false}
                                            style={styles.addressLine1}>{this.state.address.name} {this.state.address.phone}</Text>
                                        <Text allowFontScaling={false} style={styles.addressLine2}>
                                            {this.state.address.province}-{this.state.address.city}-{this.state.address.district}
                                            {this.state.address.detail}
                                        </Text>
                                        {
                                            util_tools.checkAddr(this.state.address.name, this.state.address.detail) ?
                                                <TipRed
                                                    txt="地址规则更新，请重新编辑"
                                                    styles={{marginBottom: px(24), marginTop: px(24)}}
                                                    width={635}/> : null
                                        }
                                    </View>
                                    <Icon name="icon-arrow" style={styles.addressIconArrow}/>
                                </View>
                            </TouchableWithoutFeedback>
                        }
                        {
                            !isDefaultAddress &&
                            <View style={{backgroundColor: '#fff'}}>
                                <View style={styles.item}>
                                    <Input
                                        underlineColorAndroid="transparent"
                                        keyboardType={"default"}
                                        maxLength={16}
                                        value={this.state.userName}
                                        placeholder={'收货人姓名'}
                                        onChangeText={(val) => {
                                            this.setState({
                                                userName: val
                                            })
                                        }}
                                        style={styles.input}
                                        onFocus={() => {
                                        }}
                                    >
                                    </Input>
                                </View>
                                <View style={styles.item}>
                                    <Input
                                        underlineColorAndroid="transparent"
                                        keyboardType={"default"}
                                        maxLength={11}
                                        value={this.state.userPhone}
                                        placeholder={'收货人手机'}
                                        onChangeText={(val) => {
                                            this.setState({
                                                userPhone: val
                                            })
                                        }}
                                        style={styles.input}
                                        onFocus={() => {
                                        }}
                                    >
                                    </Input>
                                </View>
                                <View style={styles.item}>
                                    <TouchableOpacity activeOpacity={0.9} onPress={() => this.switchCity()}>
                                        <View style={styles.txtView}>
                                            <Text allowFontScaling={false}
                                                  style={[styles.txtV1, !this.state.selectAddress.length && styles.txtV2]}>
                                                {
                                                    !this.state.selectAddress.length ? '请选择省市区' : this.state.selectAddress
                                                }
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.item}>
                                    <Input
                                        underlineColorAndroid="transparent"
                                        keyboardType={"default"}
                                        value={this.state.userAddr}
                                        placeholder={'详细街道地址'}
                                        onChangeText={(val) => {
                                            this.setState({
                                                userAddr: val
                                            })
                                        }}
                                        style={styles.input}
                                        onFocus={() => {
                                        }}
                                    >
                                    </Input>
                                </View>
                            </View>
                        }
                        <View style={{flexDirection: 'row', width: px(254 * 3)}}>
                            {[...Array(3)].map((i, idx) =>
                                <Icon key={idx} name="bg-address-line" style={{width: px(254), height: px(4)}}
                                      resizeMode='contain'/>
                            )}
                        </View>
                    </View>
                }
                <View style={styles.tip}>
                    <Text allowFontScaling={false} style={styles.tipTxt}>
                        请输入真实姓名和登录手机号，否则会影响资金提现
                    </Text>
                    {
                        this.state.detail.virtualYn != '1' && <TouchableWithoutFeedback onPress={() => {
                            this.async()
                        }}>
                            <View style={styles.btn2}>
                                <Text allowFontScaling={false} style={styles.btnText2}>同收货人信息</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    }
                </View>
                <View style={{backgroundColor: '#fff'}}>
                    <View style={styles.item}>
                        <Input
                            underlineColorAndroid="transparent"
                            keyboardType={"default"}
                            maxLength={16}
                            value={this.state.realName}
                            placeholder={'请输入真实姓名'}
                            onChangeText={(val) => {
                                this.setState({
                                    realName: val
                                })
                            }}
                            style={styles.input}
                            onFocus={() => {
                            }}
                        >
                        </Input>
                    </View>
                    <View style={styles.item}>
                        <Input
                            underlineColorAndroid="transparent"
                            keyboardType={"phone-pad"}
                            maxLength={11}
                            value={this.state.realPhone}
                            placeholder={'请输入登录手机号'}
                            onChangeText={(val) => {
                                this.setState({
                                    realPhone: val
                                })
                            }}
                            style={styles.input}
                            onFocus={() => {
                            }}
                        >
                        </Input>
                    </View>

                    <View style={styles.item2}>
                        <Input
                            underlineColorAndroid="transparent"
                            keyboardType={"default"}
                            maxLength={6}
                            value={this.state.realCode}
                            placeholder={'请输入短信验证码'}
                            onChangeText={(val) => {
                                this.setState({
                                    realCode: val
                                })
                            }}
                            style={styles.input}
                            onFocus={() => {
                            }}
                        >
                        </Input>
                        <TouchableWithoutFeedback onPress={() => {
                            this.sendCode()
                        }}>
                            <View style={styles.btn}>
                                {this.state.time > 0 ? <Text allowFontScaling={false}
                                                             style={[styles.btnText, {color: '#b2b5b5'}]}>重新获取{this.state.time}s</Text> :
                                    <Text allowFontScaling={false} style={styles.btnText}>获取验证码</Text>}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>

                {
                    this.state.time && this.state.time <= 30 ?
                    <View style={{
                        paddingTop: px(20),
                        paddingHorizontal: px(30),
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}>
                        <TouchableOpacity onPress={() => this.tips()}>
                            <Text style={styles.outText}>收不到验证码?</Text>
                        </TouchableOpacity>
                    </View> : null
                }

                {/*{User.isLogin &&*/}
                {/*<PayPlatform ref="payPlatform" fixed={true} select={this.selectPayPlatform.bind(this)}/>}*/}

                <View style={styles.selected}>
                    <TouchableWithoutFeedback onPress={() => this.change()}>
                        <View style={styles.select}>
                            {
                                this.state.selected ?
                                    <Icon style={styles.selectedIcon} name="check-box-select"></Icon> :
                                    <Icon style={styles.selectedIcon} name="check-box"></Icon>
                            }
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text allowFontScaling={false} style={styles.txt}>同意</Text>
                        <Text onPress={() => this.modal()} allowFontScaling={false}
                              style={styles.txt2}> 达令家用户服务协议 </Text>
                        <Text allowFontScaling={false} style={styles.txt}>领取399金币获赠店主权益</Text>
                    </View>
                </View>
            </ScrollView>
            <View style={isIphoneX() ? {paddingBottom: px(60), backgroundColor: null} : {}}>
                {this.state.isTip &&
                <View style={styles.tipP}>
                    <Text style={{fontSize: px(26), color: '#D0648F'}}>
                        本商品暂不支持该区域配送哦，快去选购其他精选商品吧
                    </Text>
                </View>}
                <View style={{
                    flexDirection: 'row',
                    height: px(98),
                    backgroundColor: '#fff'
                }}>
                    <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingRight: px(42)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(28), color: '#D0648F'}}>
                            应付金额 ¥
                            <Text allowFontScaling={false} style={{fontSize: px(38), color: '#D0648F'}}>
                                {Number(this.state.detail.salePrice).toFixed(2)}
                            </Text>
                        </Text>
                    </View>
                    <TouchableWithoutFeedback onPress={() => this.pay()}>
                        <View style={{
                            width: px(250),
                            height: px(98),
                            backgroundColor: '#D0648F',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text allowFontScaling={false} style={{fontSize: px(34), color: '#fff'}}>
                                确定支付
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </View>
    }

    tips() {
        this.refs.dialog.alert([
            "1.尝试获取语音验证码；",
            "2.请切换网络，重新获取验证码；",
            "3.查看是否有短信拦截；",
            "4.重新启动手机，然后再次获取验证码；",
            "5.每个手机号每天只能获取20次验证码，",
            "    如果今日已超过次数请明天再尝试；",
            "6.是否为国外手机号，国外手机号不支持",
            "    获取验证码；",
            "7.以上情况都不是或者携号转网的用户请",
            "    联系客服；"
        ])
    }

    address = null

    pageFooter() {
        return <View>
            <Address
                ref={ref => this.address = ref}
                load={this.initPage.bind(this)}
                tabs={this.state.selectAddress}
                prompt="请选择"
                titleStyle={{
                    content: {borderTopLeftRadius: px(20), borderTopRightRadius: px(20)}
                }}
                contentStyle={{backgroundColor: '#F2F2F2'}}
                listStyle={{
                    content: {},
                    text: {color: '#666', fontSize: px(28)}
                }}
                tabStyle={{
                    content: {borderBottomWidth: 0},
                    line: {bottom: 4},
                    text: {fontSize: px(28), color: '#222', fontWeight: '500'}
                }}
                activeColor="#D0648F"
                result={selectAddress => this.setState({selectAddress})}
            />
            <ImageModal ref="imageModal" image={this.state.protocol}/>
            <DialogModal ref='dialog'
                         bodyStyle={styles.alertBody}/>
        </View>
    }

    async modal() {
        let cfg = await config();
        let image = cfg.images['protocol']
        if (image) {
            this.refs.imageModal && this.refs.imageModal.open(image)
        }
    }

    selectAddress() {
        this.props.navigation.navigate('AddressListPage', {
            selected: this.state.address,
            callback: (address) => {
                if (!address) return;
                this.setState({
                    'address': address,
                }, async () => {
                    this.track(address.province)
                    this.setState({
                        isTIp: !this.nopay
                    })
                })
            }
        });
    }

    switchCity() {
        this.address && this.address.open()
    }

    selectPayPlatform(index, id) {
        this.payPlatformType = index;
    }

    // 处理省份数据
    dispatchData(prev, index) {
        const prevAddress = this.addressList[index - 1]
        let result = []

        if (typeof prevAddress[0] === 'string') return false

        let firstFilter = prevAddress.filter(address => {
            let current = Object.keys(address)[0]
            return current === prev
        })[0]

        result = firstFilter[prev]
        this.addressList[index] = firstFilter[prev]

        if (typeof firstFilter[prev][0] === 'object') {
            result = firstFilter[prev].map(item => Object.keys(item)[0])
        }

        return result
    }

    // 数据调用及初始化
    async initPage(prev, index) {
        if (index === 0) {
            return this.state.provinceList
        }

        return this.dispatchData(prev, index)
    }

    addressList = []

    async handlerAddr() {
        let localAddress = JSON.parse(await getItem('address'))
        let provinceList = []

        for (let i in localAddress) {
            for (let j in localAddress[i]) {
                provinceList.push(j)
            }
        }

        this.addressList.push(localAddress)
        this.setState({provinceList})
    }

    lock = false
    vl = false
    smsType = null

    async sendCode() {
        if (this.state.time > 0) {
            return;
        }

        if (!this.state.realPhone || this.state.realPhone.length != 11) {
            this.$toast('请输入正确的手机号')
            return;
        }

        if (this.lock) {
            return;
        }
        this.lock = true;

        let timer = setTimeout(() => {
            this.lock = false;
            if (timer) clearTimeout(timer);
        }, 500);

        try {
            let vl = await request.post('/saleOrder/captchaEnabled.do', {
                mobile: this.state.realPhone
            })

            this.vl = vl;
        } catch (e) {
            this.$toast(e.message)
            this.vl = true;
        }

        let viftcode = 'null';
        let that = this;
        if (this.vl) {
            if (App.startValidateV2) {
                let version = getHeader("version");
                let version_ = version.replace(/\./g, '') * 1;
                if (version_ < 107) {
                    this.smsType = 'text'
                    App.startValidateV2('044b32fa23d64765a23c1e9f9ac37b10');
                } else {
                    this.smsType = 'text'
                    App.startValidateV2('2083786765');
                }
            }
            if (App.startValidate) {
                let version = getHeader("version");
                let version_ = version.replace(/\./g, '') * 1;
                try {
                    if (version_ < 107) {
                        this.smsType = null
                        viftcode = await App.startValidate('044b32fa23d64765a23c1e9f9ac37b10');
                        if (viftcode) that.postCode(viftcode);
                    } else {
                        this.smsType = null
                        viftcode = await App.startValidate('2083786765');
                        if (viftcode) that.eventCaptcha({validate: viftcode})
                    }
                } catch (e) {
                    log(e.message)
                }
            }
        } else {
            that.postCode(viftcode);
        }
    }

    async postCode(viftcode, randStr = "") {
        try {
            let res = await request.post('/saleOrderApp/sendVerifyCode4Gift.do', {
                "mobile": this.state.realPhone,
                "validate": viftcode,
                randStr
            })
            this.startTimer();
            this.$toast('短信验证码发送成功，请注意查收')
        } catch (e) {
            this.$toast(e.message)
        }
    }

    timer = null;

    startTimer() {
        this.setState({
            'time': 60
        });
        this.timer = setInterval(() => {
            if (this.state.time == 0) {
                clearInterval(this.timer)
            }
            this.setState({
                time: this.state.time - 1
            })
        }, 1000);
    }

    eventCaptcha = ({validate}) => {
        let pageName = Router.current();
        if (pageName != 'SpeSubmitPage') return;
        if (this.smsType == 'voice') {
            return;
        }
        if (validate.indexOf("{") >= 0) {
            validate = JSON.parse(validate);
            if (validate.ticket && validate.randstr) this.postCode(validate.ticket, validate.randstr);
        } else {
            this.postCode(validate);
        }
    }


    async() {
        if (this.state.address && this.state.address.name) {
            this.setState({
                realName: this.state.address.name,
                realPhone: this.state.address.phone
            })
        } else {
            this.setState({
                realName: this.state.userName,
                realPhone: this.state.userPhone
            })
        }
    }

    async onReady() {
        await this.handlerAddr()
        let detail = {}
        let address = {}
        let sku = this.props.navigation.state.params && this.props.navigation.state.params.sku
        try {
            detail = await request.post(`/saleOrder/choiceGoodPrepareOrder.do?sku=${sku}`);
            detail = detail && detail.items && detail.items[0]
            address = await request.get('/address/queryDefault.do');
            if (address) {
                // console.log(address)
                this.track(address.province)
            }
            this.setState({
                address: address || {},
                detail: detail || {},
                isTip: !this.nopay
            })
        } catch (e) {
            this.$toast(e.message)
        }

        DeviceEventEmitter.addListener('EventCaptcha', this.eventCaptcha);
    }

    async pay() {
        if (!this.nopay) {
            return;
        }
        let sku = this.props.navigation.state.params && this.props.navigation.state.params.sku
        let rname = this.state.realName.replace(
            /[^\･\·\.\•\,\，\(\)\（\）\_\-\！\!\【\】\[\]\《\》a-zA-Z0-9\u4e00-\u9fa5]/g, '');
        let sname = this.state.userName.replace(
            /[^\･\·\.\•\,\，\(\)\（\）\_\-\！\!\【\】\[\]\《\》a-zA-Z0-9\u4e00-\u9fa5]/g, '');
        let addressId = this.state.address && this.state.address.id;
        if (!addressId && this.state.detail.virtualYn != '1') {
            if (!sname) {
                return this.$toast('收货人名字不能为空')
            }
            if (!this.state.userPhone) {
                return this.$toast('收货人手机号码不能为空')
            }
            if (!/^1\d{10}$/.test(this.state.userPhone)) {
                return this.$toast('收货人手机号码不正确')
            }
            if (!this.state.selectAddress || this.state.selectAddress.length != 3) {
                return this.$toast('请选择省市区')
            }
            if (!this.state.userAddr) {
                return this.$toast('详细地址不能为空')
            }
            if (this.state.userName.length > 16) {
                return this.$toast('收货人姓名最多支持16个字');
            }
            if (this.state.userAddr.length > 100) {
                return this.$toast('详细地址最多支持100个字');
            }
        }
        if (!rname) {
            return this.$toast('请输入真实姓名')
        }
        if (rname.length > 16) {
            return this.$toast('真实姓名最多支持16个字');
        }
        if (!this.state.realPhone) {
            return this.$toast('请输入登录手机号')
        }
        if (!/^1\d{10}$/.test(this.state.realPhone)) {
            return this.$toast('登录手机号码不正确')
        }
        if (util_tools.checkAddr(this.state.userName || this.state.address.name, this.state.userAddr || this.state.address.detail)) {
            return this.$toast('收货人地址规则更新，请重新编辑');
        }
        if (!this.state.realCode) {
            return this.$toast('验证码不能为空')
        }
        if (!this.state.selected) {
            return this.$toast('请阅读并同意协议')
        }

        let resp = {}

        try {
            if (addressId) {
                resp = await request.post('/saleOrder/choiceGoodCreateOrder.do', {
                    prodIds: sku,
                    applyName: rname,
                    applyMobile: this.state.realPhone,
                    validateCode: this.state.realCode,
                    agreementCheckYn: this.state.selected ? 1 : 0,
                    receiveAddressId: addressId
                })
            } else {
                resp = await request.post('/saleOrder/choiceGoodCreateOrder.do', {
                    prodIds: sku,
                    applyName: rname,
                    applyMobile: this.state.realPhone,
                    validateCode: this.state.realCode,
                    agreementCheckYn: this.state.selected ? 1 : 0,
                    receiveAddressId: 0,
                    name: sname,
                    phone: this.state.userPhone,
                    province: this.state.selectAddress[0],
                    city: this.state.selectAddress[1],
                    district: this.state.selectAddress[2],
                    detail: this.state.userAddr
                })
            }

            let isInstalled = await isWXAppInstalled();
            if (!isInstalled) {
                this.$toast('没有安装微信');
                throw new Error('没有安装微信');
            }
            try {
                await wxPay(resp);
            } catch (e) {
                throw new Error('微信支付失败')
            }
        } catch (e) {
            this.$toast(e.message)
            return;
        }
        this.props.navigation.navigate('SpeSuccessPage', {
            orderNo: resp.orderNo
        });
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('EventCaptcha', this.eventCaptcha);
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    nopay = true

    track(province) {
        let sku = this.props.navigation.state.params && this.props.navigation.state.params.sku
        if (sku == 'XY6DFPZI1D001') {
            if (province == '西藏自治区') {
                this.nopay = false;
            } else {
                this.nopay = true;
            }
        }
    }

    change() {
        this.setState({
            selected: !this.state.selected
        })
    }
}
const os = Platform.OS == "ios" ? true : false

const styles = StyleSheet.create({
    outText: {
        color: '#858385',
        fontSize: px(24),
    },
    alertBody: {
        alignItems: 'flex-start',
        justifyContent: "flex-start"
    },
    address: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: px(35),
        paddingHorizontal: px(24),
        backgroundColor: '#fff',
    },
    addressIcon: {
        width: px(25),
        height: px(32),
        marginRight: px(20)
    },
    addressInfo: {
        flex: 1
    },
    addressLine1: {
        fontSize: px(27),
        color: '#222',
        includeFontPadding: false
    },
    addressLine2: {
        fontSize: px(27),
        color: '#222',
        includeFontPadding: false
    },
    addressIconArrow: {
        width: px(15),
        height: px(26),
        marginRight: px(24),
        //marginLeft: px(20)
    },
    idHint: {
        fontSize: px(22),
        color: '#E86D78',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    hint: {
        height: px(50),
        justifyContent: 'center',
        paddingLeft: px(30),
        backgroundColor: '#fcf0f3'
    },
    txtView: {
        width: px(510),
        height: px(80),
        justifyContent: 'center',
    },
    txtV1: {
        fontSize: px(26),
        color: '#222',
    },
    txtV2: {
        color: os ? '#ccc' : '#999'
    },
    tip: {
        height: px(70),
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: px(30),
        backgroundColor: '#FCF0F3'
    },
    tipTxt: {
        flex: 1,
        fontSize: px(22),
        color: '#E86D78',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    item: {
        height: px(80),
        paddingLeft: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    input: {
        flex: 1,
        height: px(80),
        paddingHorizontal: 0,
        paddingVertical: px(15),
        fontSize: px(28),
        includeFontPadding: false
    },
    item2: {
        flexDirection: 'row',
        alignItems: 'center',
        height: px(80),
        paddingLeft: px(30),
    },
    btn: {
        width: px(180),
        height: px(60),
        marginRight: px(30),
        borderWidth: px(1),
        borderColor: '#B2B3B5',
        borderRadius: px(6),
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnText: {
        fontSize: px(26),
        color: '#D0648F'
    },
    btn2: {
        width: px(168),
        height: px(50),
        marginRight: px(30),
        borderWidth: px(1),
        borderColor: '#B2B3B5',
        borderRadius: px(6),
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnText2: {
        fontSize: px(22),
        color: '#666666'
    },
    selected: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    select: {
        paddingLeft: px(30),
        paddingRight: px(12),
        paddingVertical: px(30)
    },
    selectedIcon: {
        width: px(28),
        height: px(28),
    },
    txt: {
        fontSize: px(24),
        color: '#858385'
    },
    txt2: {
        fontSize: px(24),
        color: '#44B7EA'
    },
    tipP: {
        height: px(70),
        backgroundColor: '#FCF0F3',
        justifyContent: 'center',
        alignItems: 'center'
    }
})