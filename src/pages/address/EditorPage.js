import React from 'react'

import {
    TextInput,
    Text,
    View,
    Picker,
    Switch,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Keyboard,
    Alert,
    Image
} from 'react-native'
import Address from 'react-native-city-picker'

import { px } from '../../utils/Ratio'
import { get, post } from '../../services/Request'
import { show as toast } from '../../widgets/Toast'
import { log, logWarm, logErr } from '../../utils/logs'
import { TopHeader } from '../common/Header'
import Input from '../../UI/lib/Input'
import Icon from '../../UI/lib/Icon'
import base from '../../styles/Base'
import { getItem, setItem } from '../../services/Storage'
import { WarnPrompt } from '../../widgets/Prompt'

const os = Platform.OS == "ios" ? true : false

export default class extends React.Component {

    constructor(props) {
        super(props)

        const isSwitch = props.navigation.getParam('isSwitch', true)

        this.state = {
            name: '',
            phone: '',
            detail: '',
            newCardNo: '',
            address: {},
            isSwitch,
            checked: !isSwitch,
            province:'',
            city: '',
            district: '',
            provinceList: [],
            cityList: [],
            districtList: [],
            pickerStatus: false,
            localAddress: {},
            selectAddress: [],
            bondedPayerSwitchOnYn: this.props.navigation.state.params.bondedPayerSwitchOnYn || 'N',
            nameWarn: false,
            nameWarnText: '',
            detailWarn: false,
            detailWarnText: ''
        }

        this.needIds = false
        this.retAddressData = null
        this.network = true
        this.textInput = null
        this.setDefaultAddress = this.setDefaultAddress.bind(this)

        this.addressList = []
        this.resultAddress = ''
    }

    renderWarn() {
        return <Icon name="addressWarn" style={{width: px(24), height: px(24), marginRight: px(10)}}/>
    }

    renderTip(tip) {
        return <View style={[styles.warnBg, base.inline_left]}>
            <Text style={[styles.warnTxt, base.color]} allowFontScaling={false}>{tip}</Text>
        </View>
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

    // 数据调用及初始化
    async initPage (prev, index) {
        if (index === 0) {
            return this.state.provinceList
        }

        return this.dispatchData(prev, index)
    }
    
    render() {
        const pTextColor = os ? '#ccc' : '#999'

        return <View style={{ flex: 1 }}>
            <TopHeader navigation={this.props.navigation}
                title={this.props.navigation.state.params.addressId ? '编辑收货地址' : '添加收货地址'}
            />
            <WarnPrompt
                isShowLeftIcon={ false }
                isShowClose={ false }
                text="  温馨提醒：请确保收件人为真实姓名，否则可能无法收货"
                isShowArrow={false}
                style={ styles.security }
            />
            <Address
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
                result={ selectAddress => this.setState({ selectAddress }) }
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.page}>
                        <View style={styles.form}>
                            <View style={[styles.formGroup, base.inline_left]}>
                                <View style={styles.formLabel}>
                                    <TextInput
                                        style={styles.formLabelTxt}
                                        editable={false}
                                        underlineColorAndroid="transparent"
                                        value="收货人">
                                    </TextInput>
                                </View>
                                { this.state.nameWarn && this.renderWarn() }
                                <Input ref="names" style={[styles.formInput, base.inline_left]}
                                    value={this.state.name}
                                    underlineColorAndroid="transparent"
                                    onChangeText={ v => this.setState({ name: v })}
                                    placeholder="请输入收货人姓名"
                                    placeholderTextColor={ pTextColor }
                                    onFocus={() => {
                                        this.textInput = this.refs.names
                                    } }
                                />
                            </View>
                            {
                                this.state.nameWarn ?
                                    this.renderTip(this.state.nameWarnText) : null
                            }
                            <View style={styles.formGroup}>
                                <View style={styles.formLabel}>
                                    <Input
                                        style={styles.formLabelTxt}
                                        editable={false}
                                        underlineColorAndroid="transparent"
                                        value="手机号" />
                                </View>
                                <TextInput ref="mobile" style={styles.formInput}
                                    value={this.state.phone}
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    underlineColorAndroid="transparent"
                                    onChangeText={(v) => this.setState({ phone: v })}
                                    placeholderTextColor={ pTextColor }
                                    onFocus={() => {
                                        this.textInput = this.refs.mobile;
                                    }}
                                    placeholder="请输入收货人手机号码">
                                </TextInput>
                            </View>
                            <View style={styles.formGroup}>
                                <View style={styles.formLabel}>
                                    <TextInput
                                        style={styles.formLabelTxt}
                                        editable={false}
                                        underlineColorAndroid="transparent"
                                        value="选择省市区">
                                    </TextInput>
                                </View>
                                <TouchableOpacity activeOpacity={ 0.9 } onPress={() => this.switchCity()}>
                                    <View style={styles.txtView}>
                                        <Text allowFontScaling={false} style={[styles.txt1, !this.state.selectAddress.length && styles.txt2]}>
                                            {
                                                !this.state.selectAddress.length ? '请选择省市区' : this.state.selectAddress
                                            }
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.formGroup, base.inline_left]}>
                                <View style={styles.formLabel}>
                                    <TextInput
                                        editable={false}
                                        style={styles.formLabelTxt}
                                        underlineColorAndroid="transparent"
                                        value="详细地址">
                                    </TextInput>
                                </View>
                                { this.state.detailWarn && this.renderWarn() }
                                <TextInput ref="address" style={styles.formInput}
                                    value={this.state.detail}
                                    underlineColorAndroid="transparent"
                                    onChangeText={(v) => this.setState({ detail: v })}
                                    placeholderTextColor={ pTextColor }
                                    onFocus={() => {
                                        this.textInput = this.refs.address
                                    }}
                                    placeholder="请输入详细街道地址">

                                </TextInput>
                            </View>
                            { this.state.detailWarn &&  this.renderTip(this.state.detailWarnText) }
                        </View>
                        {
                            this.state.bondedPayerSwitchOnYn == 'N' &&
                            <View style={[styles.form, !this.state.isSwitch && {  marginBottom: 0 }]}>
                                <View style={styles.formGroup}>
                                    <View style={styles.formLabel}>
                                        <TextInput
                                            style={styles.formLabelTxt}
                                            editable={false}
                                            underlineColorAndroid="transparent"
                                            value="身份证">
                                        </TextInput>
                                    </View>
                                    <Input ref="ids" style={styles.formInput}
                                        onChangeText={(v) => this.setState({ newCardNo: v })}
                                        underlineColorAndroid="transparent"
                                        maxLength={18}
                                        onFocus={() => this.textInput = this.refs.ids}
                                        placeholderTextColor={ pTextColor }
                                        placeholder={this.state.cardNo || '选填'} />
                                </View>
                                <View style={styles.hint}>
                                    <Text allowFontScaling={false} style={styles.idHint}>
                                        应海关要求请填写身份证信息，我们会保护您的信息安全
                                    </Text>
                                </View>
                            </View>
                        }
                        {
                            this.state.isSwitch && <View style={styles.defaultAddress}>
                                <View style={styles.defaultField}>
                                    <Text allowFontScaling={false} style={styles.defaultTitle}>设为默认地址</Text>
                                    <Text allowFontScaling={false} style={styles.defaultDesc}>每次下单时会使用默认地址</Text>
                                </View>
                                <View style={styles.switch}>
                                    {
                                        Platform.OS == 'ios' ? <Switch
                                            onTintColor="#32C632"
                                            tintColor="#e5e5ea"
                                            value={this.state.checked}
                                            onValueChange={this.setDefaultAddress}
                                        /> :
                                            <Switch
                                                onTintColor="#32C632"
                                                tintColor="#e5e5ea"
                                                thumbTintColor="#fff"
                                                value={this.state.checked}
                                                onValueChange={this.setDefaultAddress}
                                            />
                                    }
                                </View>
                            </View>
                        }
                    </View>
                    <TouchableWithoutFeedback onPress={() => this.save()}>
                        <View style={styles.footer}>
                            <Text allowFontScaling={false} style={styles.footerTxt}>保存</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
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

        let addressId = this.props.navigation.state.params.addressId

        this.needIds = this.props.navigation.state.params.needIds
        this.setState({ provinceList })

        try {
            if (addressId) {
                let address = await get(`/address/query.do?id=${addressId}`)

                this.setState({
                    ...address,
                    nameWarn: address.name.length > 16,
                    detailWarn: address.detail.length > 100,
                    checked: address.defaultYn == 'Y' ? true : false,
                    selectAddress: [address.province, address.city, address.district]
                })
            }
        } catch (e) {
            logWarm(e.message)
        }
    }

    componentWillUnmount() {
        this.props.navigation.state.params.callback(this.retAddressData, this.state.checked, this.resultAddress);
    }

    setDefaultAddress(status) {
        this.setState({
            checked: status
        })
    }

    switchCity () {
        this.address.open()
    }

    secret(ids) {
        if (!ids) return ''

        let arr = ids.split("")

        arr.splice(4, 10, '**********')

        return arr.join("")
    }
    
    async save() {
        this.setState({
            nameWarn: false,
            detailWarn: false
        })
        
        if (!this.network) return

        this.network = false

        let regex = new RegExp('[^\\･\\·\\.\\•\\,\\，\\(\\)\\（\\）\\_\\-\\！\\!\\【\\】\\[\\]\\《\\》a-zA-Z0-9\u4e00-\u9fa5]', 'g')

        let selectAddress = this.state.selectAddress

        let data = {
            id: this.state.id,
            province: selectAddress[0] || '',
            city: selectAddress[1] || '',
            district: selectAddress[2] || '',
            name: this.state.name.replace(regex, ''),
            phone: this.state.phone.replace(regex, ''),
            detail: this.state.detail.replace(regex, ''),
            postCode: '',
            cardNo: this.state.newCardNo
        }
        let isErr = false

        if (!data.name) {
            toast('请输入收货人姓名')
            isErr = true
        }
        if (data.name.length > 16) {
            this.setState({ nameWarn: true, nameWarnText: '收货人姓名最多支持16个字' })
            toast('收货人姓名最多支持16个字')
            isErr = true
        }
        if (!data.phone) {
            toast('请输入收货人手机号码')
            isErr = true
        }
        if (!data.province) {
            toast('请选择省')
            isErr = true
        }
        if (!data.city) {
            toast('请选择市')
            isErr = true
        }
        if (!data.district) {
            toast('请选择区')
            isErr = true
        }
        if (!data.detail) {
            toast('请输入收货人详细地址')
            isErr = true
        }
        if (data.detail.length > 100) {
            this.setState({ detailWarn: true, detailWarnText: '收货人详细地址最多支持100个字' })
            toast('收货人详细地址最多支持100个字')
            isErr = true
        }
        if (this.needIds && !data.cardNo && this.state.bondedPayerSwitchOnYn == 'N') {
            toast('您购买的是保税仓商品，必须输入身份证号')
            isErr = true
        }

        if (!!data.cardNo && !/^(\d{15}|\d{18}|\d{17}X)$/gmi.test(data.cardNo)) {
            toast('身份证号格式不正确')
            isErr = true
        }

        if (isErr) {
            this.network = true
            return
        }

        data.defaultYn = this.state.checked ? 'Y' : 'N'

        try {
            if (this.state.id) {
                await post(`/address/update.do`, data)
            } else {
                const { addressId } = await post(`/address/save.do`, data)

                data.id = addressId
            }

            data.defaultYn === 'Y' && await setItem('defaultAddress', JSON.stringify(data))

            this.resultAddress = data

            await new Promise(resolve => {
                toast('保存成功')
                resolve()
            })

            if (this.needIds && this.state.bondedPayerSwitchOnYn == 'N') {
                data.cardNo = this.secret(data.cardNo)
                this.retAddressData = data
            }

            this.props.navigation.getParam('callAddress', () => {})(data)

            let timer = setTimeout(() => {
                this.props.navigation.goBack()
                if (timer) clearTimeout(timer)
            }, 800)
        } catch (e) {
            this.network = true
            toast(e.message)
        }
    }
    
}

const styles = StyleSheet.create({
    defaultAddress: {
        flexDirection: 'row',
        height: px(120),
        width: px(750),
        // marginBottom: px(30),
        backgroundColor: '#fff'
    },
    defaultField: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: px(30)
    },
    defaultTitle: {
        fontSize: px(28),
        color: '#252426',
        includeFontPadding: false
    },
    defaultDesc: {
        paddingTop: px(10),
        fontSize: px(26),
        color: '#b2b3b5',
        includeFontPadding: false
    },
    switch: {
        width: px(100),
        height: px(120),
        marginRight: px(30),
        justifyContent: 'center'
    },
    page: {
        backgroundColor: '#f5f3f6',
        flex: 1
    },
    form: {
        marginBottom: px(20),
        backgroundColor: '#fff'
    },
    formGroup: {
        flexDirection: 'row',
        width: px(750),
        height: px(80),
        borderBottomWidth: px(1),
        borderBottomColor: '#f5f4f6'
    },
    formLabel: {
        width: px(190),
        height: px(80),
        paddingLeft: px(30),
        justifyContent: 'center'
    },
    formLabelTxt: {
        flex: 1,
        fontSize: px(26),
        color: '#222',
        padding: 0,
        includeFontPadding: false
    },
    formInput: {
        height: px(80),
        width:px(500),
        fontSize: px(26),
        borderWidth: 0,
        textAlignVertical: 'center',
        padding: 0
    },
    footer: {
        width: px(690),
        height: px(80),
        marginTop: px(70),
        marginLeft: px(30),
        borderRadius: px(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d0648f'
    },
    footerTxt: {
        textAlign: 'center',
        fontSize: px(30),
        color: '#fff',
        includeFontPadding: false
    },
    idHint: {
        fontSize: px(22),
        color: '#d0648f',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    hint: {
        height: px(50),
        justifyContent: 'center',
        paddingLeft: px(30),
        backgroundColor: '#fcf0f3'
    },
    tab: {
        flexDirection: 'row',
        height: px(90),
        backgroundColor: '#d0648f'
    },
    txtView: {
        flex: 1,
        width: px(510),
        justifyContent: 'center'
    },
    txt1: {
        fontSize: px(26),
        color: '#222',
    },
    txt2: {
        color: os ? '#ccc' : '#999'
    },
    warnBg: {
        backgroundColor: '#fcf0f3',
        width: px(750),
        height: px(50),
        paddingLeft: px(30)
    },
    warnTxt: {
        fontSize: px(22)
    },
    security: {
        backgroundColor: '#ee5168',
        paddingTop: px(12),
        paddingBottom: px(12)
    }
})