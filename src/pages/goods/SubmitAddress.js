'use strict';
import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback, TextInput,
    FlatList, Dimensions, Animated,
    KeyboardAvoidingView, Picker,
    Platform,
    Keyboard,
} from 'react-native'
import Address from 'react-native-city-picker';

import { px, isIphoneX } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import { getItem } from '../../services/Storage';
import Input from '../../UI/lib/Input'
import util_tools from "../../utils/tools";
import {TipRed} from '../common/ExplainModal';


const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const os = Platform.OS == "ios" ? true : false;

exports.SubmitPicker = class extends React.Component {
    height = px(deviceHeight)
    constructor(props) {
        super(props);
        this.state = {
            province:'',
            city: '',
            district: '',
            provinceList: [],
            cityList: [],
            districtList: [],
            localAddress: {},
            selectAddress: []
        }

        this.addressList = []
    }
    async componentDidMount() {
        let localAddress = JSON.parse(await getItem('address'))
        let provinceList = []
        for (let i in localAddress) {
            for (let j in localAddress[i]) {
                provinceList.push(j)
            }
        }

        this.addressList.push(localAddress)

        this.setState({ provinceList })
    }

    // 处理省份数据
    dispatchData (prev, index) {
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

    sure(selectAddress) {
        this.setState({ selectAddress })
        this.props.confirmPicker(selectAddress.join(''), ...selectAddress)
    }

    // 数据调用及初始化
    async initPage (prev, index) {
        if (index === 0) {
            return this.state.provinceList
        }

        return this.dispatchData(prev, index)
    }

    async switchCity(province, city, district) {
        let selectAddress = [province, city, district]

        if (!province || !city || !district) selectAddress = []
        
        this.setState({ selectAddress }, () => {
            this.address.open()
        })
    }
    
    cancel() {
        this.address.close()
    }
    
    render() {
        return <Address
            ref={ ref => this.address = ref }
            load={ this.initPage.bind(this) }
            tabs={ this.state.selectAddress }
            prompt="请选择"
            titleStyle={ {
                content: { borderTopLeftRadius: px(20), borderTopRightRadius: px(20) }
            } }
            contentStyle={ { backgroundColor: '#F2F2F2' } }
            listStyle={ {
                content: {},
                text: { color: '#666', fontSize: px(28) }
            } }
            tabStyle={ {
                content: { borderBottomWidth: 0 },
                line: { bottom: 4 },
                text: { fontSize: px(28), color: '#222', fontWeight: '500' }
            } }
            activeColor="#D0648F"
            result={ selectAddress => this.sure(selectAddress) }
        />
    }
    
    keyBlur() {
        Keyboard.dismiss()
    }
    
    hide() {
        this.address.close()
    }
}

const modalStyles = StyleSheet.create({
    view: {
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor:'rgba(0,0,0,0.4)',
        //flex: 1,
        position: 'absolute',
        left: 0,
        top: -deviceHeight + px(90),
        //bottom: 0,
        //right: 0,
        justifyContent: 'flex-end',
        zIndex: 9999
    },
    bg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    formPicker: {
        flex: 1,
        borderWidth: 0,
        padding: 0,
    },
    picker_box: {
        justifyContent: 'flex-end',
        //position: 'absolute',
        //top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    tab: {
        flexDirection: 'row',
        height: px(90),
        backgroundColor: '#d0648f'
    },
    tab_view1: {
        flex: 1,
        justifyContent: 'center'
    },
    tab_txt1: {
        textAlign: 'left',
        fontSize: px(30),
        color: '#fff',
        paddingLeft: px(30),
    },
    tab_txt2: {
        
        textAlign: 'right',
        fontSize: px(30),
        color: '#fff',
        paddingRight: px(30),
    },
    picker1: {
        flex: 1,
        flexDirection: 'row'
    },
    picker2: {
        flexDirection: 'row',
        backgroundColor: '#fff'
    }
})

exports.SubmitAddress = class extends React.Component {
    height = px(deviceHeight)
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            phone: '',
            detail: '',
            selectAddress: props.selectAddress_,
            card: '',
            focus: false,
            isDefaultAddress: false
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.selectAddress_ !== this.state.selectAddress) {
            this.setState({ selectAddress: nextProps.selectAddress_ })
        }
        this.getDefaultAddress()
    }
    
    renderItems(keyboardType, maxLength, value, label, placeholder, type) {
        const pTextColor = os ? '#ccc' : '#999'

        return <View style={[itemStyles.item, base.inline_left]}>
            <Text allowFontScaling={false} style={itemStyles.label}>{label}</Text>
            <TextInput
                ref={ `${type}Ref` }
                allowFontScaling={false}
                adjustsFontSizeToFit={false}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                underlineColorAndroid="transparent"
                keyboardType={keyboardType || "default"}
                maxLength={maxLength}
                value={value}
                placeholder={`请输入${placeholder}` || "输入收货人身份证号"}
                placeholderTextColor={ pTextColor }
                onChangeText={(v) => this.onChange(v, type)}
                style={itemStyles.input}
                onBlur={ this.onBlur.bind(this) }
            />
        </View>
    }

    async getDefaultAddress () {
        const defaultAddress = JSON.parse(await getItem('defaultAddress'))

        const id = this.props.data.address.id || this.props.data.address.addressId

        this.setState({
            isDefaultAddress: id === defaultAddress.id
        })
    }
    
    confirmPicker(selectAddress) {
        this.setState({
            selectAddress
        })
    }
   
    render() {
        const {data} = this.props
        let isBond = data.goods && (data.isInBond == 1 || data.isForeignSupply == 2),
            isB = isBond && (!data.address.cardNo && data.bondedPayerSwitchOnYn == 'N' || data.bondedPayerSwitchOnYn == 'Y')
        const {name, phone, detail, card} = this.state

        const selectAddress = this.state.selectAddress

        return <View>
            {
                data.address.id || data.address.addressId ?
                    <TouchableWithoutFeedback onPress={() => this.props.selectAddress()}>
                        <View style={[styles.address, {marginBottom: isB ? px(20) : px(0)}]}>
                            <Icon style={styles.addressIcon}
                                name="icon-address" />
                            {!data.address.name && <Text allowFontScaling={false} style={styles.addressHint}>选择地址</Text>}
                            {data.address.name &&
                            <View style={styles.addressInfo}>
                                <View style={ styles.addressDefault }>
                                    <View style={ styles.addressWrap }>
                                        <Text
                                            allowFontScaling={false}
                                            style={styles.addressLine1}
                                        >
                                            {data.address.name}
                                        </Text>
                                        <Text
                                            allowFontScaling={false}
                                            style={styles.addressLine1}
                                        >
                                            {data.address.phone}
                                        </Text>
                                    </View>
                                    {
                                        this.state.isDefaultAddress && <View
                                            style={[styles.default_, base.borderColor, base.line]}>
                                            <Text style={[styles.defaultTxt, base.color]} allowFontScaling={false}>默认</Text>
                                        </View>
                                    }
                                </View>
                                <Text allowFontScaling={false} style={styles.addressLine2}>
                                    {data.address.province}-{data.address.city}-{data.address.district}
                                    {data.address.detail}
                                </Text>
                                {!!data.address.cardNo && data.bondedPayerSwitchOnYn == 'N' && <Text
                                    allowFontScaling={false}
                                    style={styles.addressLine1}>
                                    身份证号 {data.address.cardNo}
                                </Text>}
                                {
                                    util_tools.checkAddr(data.address.name, data.address.detail) ?
                                        <TipRed
                                            txt="地址规则更新，请重新编辑后保存"
                                            styles={{marginBottom: px(24), marginTop: px(24)}}
                                            width={635}/> : null
                                }
                            </View>
            
                            }
                            <Icon name="icon-arrow" style={styles.addressIconArrow} />
                        </View>
                    </TouchableWithoutFeedback>
                    :
                    <View style={[styles.box, {marginBottom: isB ? px(20) : px(0)}]}>
        
                        <TouchableWithoutFeedback onPress={() => this.props.selectAddress && this.props.selectAddress()}>
                            <View style={[styles.empty, base.inline_left]}>
                                <Icon style={styles.addressIcon}
                                    name="icon-address" />
                                <Text allowFontScaling={false} style={styles.addressHint}>
                                    选择地址
                                </Text>
                                <Icon
                                    name="icon-arrow"
                                    style={styles.addressIconArrow} />
                            </View>
                        </TouchableWithoutFeedback>
                        {this.renderItems("default", 16, name, "收货人", "收货人姓名", "name")}
                        {this.renderItems("phone-pad", 11, phone, "手机号", "收货人手机号", "phone")}
                        <View style={[itemStyles.item, base.inline_left]}>
                            <Text allowFontScaling={false} style={itemStyles.label}>省市区</Text>
                            <TouchableOpacity activeOpacity={ 0.9 } onPress={() => this.open()}>
                                <View style={styles.txtView}>
                                    <Text allowFontScaling={false} style={[styles.txt1, !selectAddress.length && styles.txt2]}>
                                        {
                                            !selectAddress.length ? '请选择省市区' : selectAddress
                                        }
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {this.renderItems("default", 100, detail, "详细地址", "详细街道地址", "detail")}
                    </View>
            }
            
            {
                isB
                && <View style={styles.box2}>
                    {
                        !data.address.cardNo && data.bondedPayerSwitchOnYn == 'N' && isBond &&
                        this.renderItems("phone-pad", 18, card, "身份证号", "收货人身份证号", "card")
                    
                    }
    
                    {
                        data.bondedPayerSwitchOnYn == 'Y' && isBond &&
                        <View style={payerStyles.contain}>
                            <TouchableWithoutFeedback onPress={() => this.props.goPayerPage()}>
                                <View style={[payerStyles.top, base.inline_between]}>
                                    {
                                        data.buyerInfoId ?
                                            <View style={[payerStyles.write, {justifyContent: 'space-between'}]}>
                                                <View style={[base.inline_left]}>
                                                    <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.unWriteTxt, {width: px(140), marginLeft: px(43)}]}>支付人</Text>
                                                    <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.unWriteTxt]}>{data.buyerRealName}</Text>
                                                </View>
                                                <View style={[base.inline_left]}>
                                                    <Icon name="icon-payer-submit" style={{width: px(28), height: px(24), marginRight: px(15)}}/>
                                                    <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.unWriteTxt, {fontSize: px(26), width: px(140)}]}>身份证号</Text>
                                                    <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.unWriteTxt, {fontSize: px(26)}]}>{data.buyerIdCard}</Text>
                                                </View>
                                            </View>
                                            :
                                            <View style={[payerStyles.unWrite, base.inline_left]}>
                                                <Icon name="icon-payer-submit" style={{width: px(28), height: px(24), marginRight: px(15)}}/>
                                                <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.unWriteTxt]}>因海关要求，需填写支付人实名信息</Text>
                                            </View>
                                    }
                                    <Icon name="icon-arrow" style={styles.addressIconArrow}/>
                                </View>
                            </TouchableWithoutFeedback>
                            {/*<View style={payerStyles.bottom}>
                            <Background style={[{
                                width: px(690),
                                height: px(69),
                            }, base.inline]} resizeMode={'cover'} name="icon-payerSubmit-bg" >
                                <View style={payerStyles.bottomBg}>
                                    <Text allowFontScaling={false} style={[base.includeFontPadding, base.color, {fontSize: px(22)}]}>应海关要求,购买海外商品需提供支付人实名信息，我们会保护您的信息安全</Text>
                                </View>
                            </Background>
                        </View>*/}
                        </View>
                    }
    
                    <View style={styles.tip}>
                        <Icon
                            name="submitCardTip"
                            style={{width: px(10), height: px(5), marginLeft: px(35)}}/>
                        <View style={styles.tipContain}>
                            <View style={[styles.tipContain_]}>
                                <Text allowFontScaling={false} style={[styles.tip_txt, base.color]}>
                                    {
                                        data.bondedPayerSwitchOnYn == 'Y' && (data.goods && (data.isInBond == 1 || data.isForeignSupply == 2))
                                            ?
                                            '应海关要求,购买海外商品需提供支付人实名信息，我们会保护您的信息安全'
                                            :
                                            '应海关要求请填写身份证信息，平台保证个人信息安全'
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            }
            <View style={{ marginBottom: px(20), flexDirection: 'row', width: px(254 * 3) }}>
                {[...Array(3)].map((i, idx) =>
                    <Icon key={idx} name="bg-address-line" style={{ width: px(254), height: px(4) }} resizeMode='contain' />
                )}
            </View>
        </View>
    }

    componentDidMount () {
        this.getDefaultAddress()
        this.state.focus && this.refs['nameRef'] && this.refs['nameRef'].focus()
    }

    componentDidUpdate () {
        this.state.focus && this.refs['nameRef'] && this.refs['nameRef'].focus()
    }
    
    onChange(e, label) {
        if (label == 'name') {
            this.setState({
                name: e
            })
        } else if (label == 'phone') {
            this.setState({
                phone: e
            })
        } else if (label == 'detail') {
            this.setState({
                detail: e
            })
        } else if (label == 'card') {
            this.setState({
                card: e
            })
        }
        this.props.setAddress && this.props.setAddress(e, label)
        
    }
    open() {
        Keyboard.dismiss();
        this.props.openPicker && this.props.openPicker()
    }

    onBlur() {
        this.setState({ focus: false })
    }

    focus () {
        this.setState({ focus: true })
    }
}

const styles = StyleSheet.create({
    box: {
        width: px(750),
        backgroundColor: '#fff',
        paddingLeft: px(24),
        marginBottom: px(20)
    },
    box2: {
        width: px(750),
        backgroundColor: '#fff',
        paddingLeft: px(24),
        marginBottom: px(20)
    },
    empty: {
        height: px(80)
    },
    addressIcon: {
        width: px(25),
        height: px(32),
        marginRight: px(20)
    },
    addressHint: {
        color: '#222',
        fontSize: px(28),
        //paddingVertical: px(20),
        textAlignVertical: 'center',
        flex: 1,
        includeFontPadding: false
    },
    addressIconArrow: {
        width: px(15),
        height: px(26),
        marginRight: px(24),
        //marginLeft: px(20)
    },
    tip: {
        marginVertical: px(15)
    },
    tipContain: {
        width: px(690),
        minHeight: px(40),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    tipContain_: {
        backgroundColor: '#fcf0f3',
        flex: 1,
        paddingVertical: px(8),
        paddingLeft: px(18),
        justifyContent: 'center'
    },
    tip_txt: {
        fontSize: px(22)
    },
    address: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: px(35),
        paddingHorizontal: px(24),
        backgroundColor: '#fff',
        marginBottom: px(20)
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
    txtView: {
        //backgroundColor: '#ff0',
        height: px(80),
        flex: 1,
        width: px(540),
        justifyContent: 'center'
    },
    txt1: {
        fontSize: px(26),
        color: '#222',
    },
    txt2: {
        color: os ? '#ccc' : '#999'
    },
    addressDefault: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    addressWrap: {
        maxWidth: px(460),
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    default_: {
        borderWidth: px(1),
        marginLeft: px(10),
        marginRight: px(30),
        width: px(48),
        height: px(28),
        borderRadius: px(3),
        overflow: 'hidden'
    },
    defaultTxt: {
        fontSize: px(20),
        textAlign: 'center'
    }
});
const itemStyles = StyleSheet.create({
    item: {
        height: px(80),
        borderTopWidth: px(1),
        borderTopColor: '#efefef'
    },
    label: {
        width: px(172),
        fontSize: px(28),
        includeFontPadding: false
    },
    input: {
        flex: 1,
        height: px(80),
        paddingHorizontal: 0,
        paddingVertical: px(15),
        //lineHeight: px(60),
        fontSize: px(28),
        includeFontPadding: false
    },
    
});


const payerStyles = StyleSheet.create({
    contain: {
        backgroundColor: '#fff',
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        //paddingVertical: px(34),
        //paddingHorizontal: px(30)
    },
    top: {
        paddingHorizontal: px(30)
    },
    unWrite: {
        height: px(100)
    },
    unWriteTxt: {
        color: '#222',
        fontSize: px(28)
    },
    write: {
        height: px(140),
        paddingVertical: px(34)
    },
    bottomBg: {
        width: px(690),
        height: px(60),
        paddingVertical: px(10),
        paddingLeft: px(8),
        paddingRight: px(15)
    },
    bottom: {
        marginBottom: px(15),
        paddingHorizontal: px(30)
    }
})