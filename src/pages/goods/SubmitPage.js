'use strict';

import React, { Component } from 'react';
import { NativeModules } from 'react-native';
import {
    Image,
    Text,
    TextInput,
    View,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    Switch,
    Modal,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Dimensions
} from "react-native";
import { getShopDetail, User } from '../../services/Api';
import {isIphoneX, px} from "../../utils/Ratio";
import request, { get, post, getHeader, setHeader } from "../../services/Request";
import { show as toast } from '../../widgets/Toast';
import { pay as wxPay, isWXAppInstalled } from '../../services/WeChat';
import { LoadingInit, LoadingRequest } from '../../widgets/Loading';
import { TopHeader } from '../common/Header'
import { log, logErr, logWarm } from '../../utils/logs'
import { PwdModal, DialogModal, AlertModal } from '../common/ModalView';
import Loading, {LoadViewCanBack} from '../../animation/Loading';
import PayPlatform from '../common/PayPlatform';
import {setItem, removeItem, getItem} from '../../services/Storage';
import Page, {FootView} from '../../UI/Page'
import Icon from '../../UI/lib/Icon'
import Background from '../../UI/lib/Background'
import base from '../../styles/Base'
import {FreightModal} from '../common/FreightModal';
import {PreSale} from '../order/OrderItems'
import SubmitItem from '../common/SubmitItem';
import { Tip } from '../common/ExplainModal'
import util_tools from "../../utils/tools";
import { SubmitAddress, SubmitPicker } from './SubmitAddress'
import DismissKeyboard from 'dismissKeyboard';

const aliPay = NativeModules.Alipay;
const deviceHeight = Dimensions.get('window').height;
const os = Platform.OS == "ios" ? true : false;
export default class extends Component {
    selectPayPlatform(index, id) {
        this.payPlatformType = index;
    }
    constructor(props) {
        super(props);
        this.state = {
            'address': {},
            balanceYn: 0, //是否使用余额
            couponCount: 0,
            couponId: '', //优惠券id
            stunnerId: '',
            suningId: '',
            warning: 0,
            msg: '',
            type: '',
            isCreateOrder: '',
            notice_show: true,
            priceIsHidden: false,
            manualAddress: {
                name: '',
                province: '',
                city: '',
                district: '',
                detail: '',
                phone: ''
            },
            psw: '',
            preSaleYn: 'N',
            preSaleShipDateStr: '',
            showMobile: 1,
        };
        this.topHeaderHeight = isIphoneX() ? px(50) + 59 :  Platform.OS === 'ios' ? 59 : 44
        this.payModeHeight = deviceHeight - this.topHeaderHeight
        this.isSubmit = true
        this.selectPayPlatform = this.selectPayPlatform.bind(this);
        this.defaultAddress = {}
        this.navigationCallback = props.navigation.getParam('callback', () => {})
    }
    
    pageHeader() {
        
    }
    
    topHeaderLayout(e) {
        let { height } = e.nativeEvent.layout
        this.topHeaderHeight = height || this.topHeaderHeight;
        this.payModeHeight = deviceHeight - this.topHeaderHeight
    }
    /**
     * tip
     */
    renderNotice() {
        return <View>
            {
                this.state.notice_show && (this.state.warning == 1 && this.state.type == '0') ? <View style={styles.notice}>
                    <View style={styles.left15}>
                        <Icon name="icon-notice" style={{ width: px(26), height: px(28) }} />
                    </View>
                    <View style={[styles.notice_container, styles.left6]}>
                        <Text allowFontScaling={false} style={styles.content}>
                            {this.state.msg}
                        </Text>
                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        this.onClick()
                    }}>
                        <View style={styles.actionWrap}>
                            <Text allowFontScaling={false} style={[styles.close]}>×</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View> : null
            }
        </View>
    }
    /**
     * 收货地址支付人
     */
    setAddress(txt, label) {
        if (label == 'card') {
            this.setState({
                cardNo: txt
            })
        } else {
            let manualAddress = this.state.manualAddress;
            manualAddress[label] = txt
            this.setState({
                manualAddress
            })
        }
    }



    openPicker() {
        let selectAddress = JSON.stringify(this.state.address) === '{}' ? this.state.manualAddress : this.state.address
        this.refs.submitPicker.switchCity(selectAddress.province, selectAddress.city, selectAddress.district)
    }
    confirmPicker(selectAddress, province, city, district) {
        this.refs.submitAddress.confirmPicker(selectAddress);
        let manualAddress = this.state.manualAddress;
        manualAddress.province = province
        manualAddress.city = city
        manualAddress.district = district
        this.setState({
            manualAddress
        })
    }
    hidePicker() {
        this.refs.submitPicker.hide()
        
    }
    renderPerson() {
        let address = JSON.stringify(this.state.address) === '{}' ? this.state.manualAddress : this.state.address
        if (this.state.addressYn == 0) return null;

        return <View>
            <SubmitAddress
                ref="submitAddress"
                selectAddress_={`${address.province || ''}${address.city || ''}${address.district || ''}`}
                openPicker={this.openPicker.bind(this)}
                selectAddress={this.selectAddress.bind(this)}
                goPayerPage={this.goPayerPage.bind(this)}
                hidePicker={this.hidePicker.bind(this)}
                setAddress={this.setAddress.bind(this)}
                data={this.state}/>     
        </View>
    }
    /**
     * 确认订单商品渲染
     */
    renderGoods() {
        if (!this.state.goods) return null;
        return <View>
            <View style={styles.goodsShop}>
                <Text allowFontScaling={false} style={styles.goodsShopText}>{this.state.shopName}</Text>
            </View>
            {this.state.goods && this.state.goods.map(res =>
                <View key={res.id} style={{
                    borderBottomWidth: px(2),
                    borderBottomColor: '#FFF'
                }}>
                    <View style={styles.goods} key={res.id}>
                        <View style={styles.goodsDetail}>
                            <Image style={styles.goodsCover}
                                resizeMode="cover"
                                resizeMethod="resize"
                                source={{
                                    uri: res.image
                                }}/>
                            <View style={styles.goodsDetailView1}>
                                <View style={{justifyContent: 'space-between'}}>
                                    {res.isInBond == 1 &&
                                    <View style={[styles.flag, styles.flag1]}>
                                        <Text allowFontScaling={false} style={[styles.flagBaoShui]}> 保税 </Text>
                                    </View>
                                    }
                                    {res.isForeignSupply == 2 &&
                                    <View style={[styles.flag, styles.flag2]}>
                                        <Text allowFontScaling={false} style={[styles.flagZhiYou]}> 直邮 </Text>
                                    </View>
                                    }
                                    <Text allowFontScaling={false} style={styles.goodsName} numberOfLines={2}>
                                        {res.isInBond == 1 && <Text style={styles.flagLen}>flagLen</Text>}
                                        {res.isForeignSupply == 2 && <Text style={styles.flagLen}>flagLen</Text>}
                                        {res.goodsName}
                                    </Text>
                                    <PreSale
                                        order={{preSaleYn: this.state.preSaleYn, preSaleShipDateStr: this.state.preSaleShipDateStr}}
                                        item={{preSaleShipDateStr: this.state.preSaleShipDateStr}}
                                    />
                                </View>
                                <View style={styles.goodsDetailView2}>
                                    <Text allowFontScaling={false} style={styles.goodsPrice}>
                                        ￥{Number(res.salePrice).toFixed(2)}
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.goodsQty}>
                                        x{res.qty}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    }
    /**
     * 商品价格，优惠方式
     */
    renderOthers() {
        let flag1 = this.state.couponCount > 0 ? true : false
        let flag2 = this.state.coupons2 && this.state.coupons2.length > 0 ? true : false
        let flag3 = this.state.stunnerUseAmount > 0 ? true : false
        let flag4 = this.state.stunners2 && this.state.stunners2.length > 0 ? true : false
        let t = this.state;
        return <View>
            <SubmitItem
                label={'商品金额'}
                txt={`￥${Number(t.totalAmount).toFixed(2)}`}
            />
            <SubmitItem
                label={'运费'}
                style={{height: px(100)}}
                extraStyle={{height: px(100)}}
                border
                haveExtra = {t.freeShippingTitle && t.freeShippingTitle !== ''}
                onPressTip={() => {
                    this.refs.freight.open()
                }}
                extraTxt={t.freeShippingTitle || ''}
                isNeedTip={t.shipFeeTotalAmount > 0}
                txt={`+￥${Number(t.shipFeeTotalAmount).toFixed(2)}`}
            />
            {
                (this.state.isInBond == 1 || this.state.isForeignSupply == 2) &&
                <SubmitItem
                    label={'税费'}
                    isAllow
                    border
                    txt={`+￥${Number(t.totalTax).toFixed(2)}`}
                    onPress_={() => this.props.navigation.navigate('TaxationDetail', { taxDetails: t.taxDetails })}
                />
        
            }
            <View style={styles.otherBox}>
                <View style={{ backgroundColor: '#fff', marginBottom: px(20) }}>
                    {
                        (flag1 || flag2) && (flag3 || flag4) &&
                        <View style={[{ backgroundColor: '#fcf0f3', height: px(50), paddingHorizontal: px(24) }, base.inline_between]}>
                            <Text style={[styles.couponName, { color: '#e86d78', fontSize: px(22) }]} allowFontScaling={false}>
                                选择优惠方式(金币与达令家代金券不可叠加使用)
                            </Text>
                        </View>
                
                    }
                    {
                        (flag1 || flag2 || flag3 || flag4) &&
                        <View>
                            {
                                (flag3 || flag4) &&
                                <TouchableOpacity onPress={() => this.onChangeGold()} activeOpacity={0.8}>
                                    <View style={[styles.comItem, base.inline_between]}>
                                        <View style={styles.couponCount}>
                                            <Text style={styles.couponName} allowFontScaling={false}>
                                                金币
                                            </Text>
                                            <View style={styles.couponTip}>
                                                <Text style={styles.couponTipTxt} allowFontScaling={false}>
                                                    {this.state.stunnerId == '' || this.state.stunnerId == null ? flag3 ? `本单最高可用${(this.state.stunnerUseAmount * 1).toFixed(0)}元` : '无可用' : `已选${(this.state.stunnerAmount * 1).toFixed(0)}元`}
                                                </Text>
                                            </View>
                                
                                        </View>
                                        {
                                            this.state.stunnerAmount && this.state.stunnerAmount != 0 &&
                                            <Text style={styles.couponMoney} allowFontScaling={false}>
                                                -￥{this.state.stunnerAmount}
                                            </Text>
                                    
                                        }
                                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                                    </View>
                                </TouchableOpacity>
                        
                            }
                            {
                                (flag1 || flag2) &&
                                <TouchableOpacity onPress={this.onChange} activeOpacity={0.8}>
                                    <View style={[base.inline_between, styles.comItem, styles.border]}>
                                        <View style={styles.couponCount}>
                                            <Text style={styles.couponName} allowFontScaling={false}>
                                                达令家代金券
                                            </Text>
                                            <View style={styles.couponTip}>
                                                <Text style={styles.couponTipTxt} allowFontScaling={false}>
                                                    {this.state.couponId == '' || this.state.couponId == null ? flag1 ? `${this.state.couponCount}张可用` : '无可用' : '已用1张'}
                                                </Text>
                                            </View>
                                        </View>
                                        {
                                            this.state.couponAmount && this.state.couponAmount != 0 &&
                                            <Text style={styles.couponMoney} allowFontScaling={false}>
                                                -￥{this.state.couponAmount}
                                            </Text>
                                    
                                        }
                                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                                    </View>
                        
                                </TouchableOpacity>
                        
                            }
                        </View>
                    }
                    <TouchableOpacity onPress={() => this.onChangeSuning()} activeOpacity={0.8}>
                        <View style={[base.inline_between, styles.comItem, styles.border, {backgroundColor: '#fff'}]}>
                            <View style={styles.couponCount}>
                                <Text style={styles.couponName} allowFontScaling={false}>
                                    苏宁代金券
                                </Text>
                                <View style={styles.couponTip}>
                                    <Text style={styles.couponTipTxt} allowFontScaling={false}>
                                        {
                                            (!t.validCoupons || t.validCoupons.length == 0) &&
                                            `无可用`
                                        }
                                        {
                                            (!t.couponUsed || t.couponUsed.couponAmount == 0) && t.validCoupons && t.validCoupons.length > 0 &&
                                            `${this.state.validCoupons.length}张可用`
                                        }
                                        {
                                            t.couponUsed && t.couponUsed.couponAmount != 0 && t.validCoupons && t.validCoupons.length > 0 &&
                                            `已用优惠`
                                        }
                                    </Text>
                                </View>
                            </View>
                            {
                                t.couponUsed && t.couponUsed.couponAmount != 0 &&
                                <Text style={styles.couponMoney} allowFontScaling={false}>
                                    -￥{(t.couponUsed.couponAmount || 0).toFixed(2)}
                                </Text>
                            }
                            {
                                (t.validCoupons && t.validCoupons.length > 0 || t.noValidCoupons && t.noValidCoupons.length > 0)
                                &&
                                <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                            }
                        </View>
            
                    </TouchableOpacity>
                    {
                        this.state.bonusAmount > 0 &&
                        <SubmitItem
                            border
                            txtStyle={{fontSize: px(28)}}
                            label={'活动优惠'}
                            txt={`-￥${Number(this.state.bonusAmount || 0).toFixed(2)}`}
                        />
                    }
                </View>
                <View style={{ backgroundColor: '#fff' }}>
                    {
                        this.state.balanceAmount > 0 &&
                        <View style={[styles.comItem, base.inline_between]}>
                            <Text allowFontScaling={false} style={styles.balanceLabel}>
                                可用余额￥{this.state.balanceAmount}，本单支付
                                <Text allowFontScaling={false} style={{ color: '#d0648f' }}>
                                    ￥{this.state.balancePayAmount}
                                </Text>
                            </Text>
                            {
                                Platform.OS == 'ios' ? <Switch
                                    onTintColor="#d0648f"
                                    tintColor="#e5e5ea"
                                    style={styles.switchBox}
                                    value={this.state.balanceYn == 0 ? false : true}
                                    onValueChange={this.switchOnChange}
                                /> : <Switch
                                    onTintColor="#d0648f"
                                    tintColor="#e5e5ea"
                                    thumbTintColor="#ffffff"
                                    style={styles.switchBox}
                                    value={this.state.balanceYn == 0 ? false : true}
                                    onValueChange={this.switchOnChange}
                                />
                            }
                        </View>
                    }
                    {
                        (this.state.isInBond == 1 || this.state.isForeignSupply == 2) &&
                    <SubmitItem
                        label={'保税区商品通关服务'}
                        border
                        onPressTip={() => {
                            this.refs.tip && this.refs.tip.show()
                        }}
                        isNeedTip
                        txt={`+￥${this.state.bondedAmount}`}
                    />
                    }
                    <View style={[styles.comItem, base.inline_between, styles.border]}>
                        <Text allowFontScaling={false} style={styles.balanceLabel}>
                            不希望Ta看到带有价格的发货单
                        </Text>
                        {
                            Platform.OS == 'ios' ? <Switch
                                onTintColor="#d0648f"
                                tintColor="#e5e5ea"
                                style={styles.switchBox}
                                value={this.state.priceIsHidden}
                                onValueChange={this.dontSwitchForOther}
                            /> : <Switch
                                onTintColor="#d0648f"
                                tintColor="#e5e5ea"
                                thumbTintColor="#ffffff"
                                style={styles.switchBox}
                                value={this.state.priceIsHidden}
                                onValueChange={this.dontSwitchForOther}
                            />
                        }
                    </View>
                </View>
                <View style={{
                    marginTop: px(20),
                    backgroundColor: '#fff'
                }}>
                    <View style={[styles.comItem1, base.inline_between]}>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={styles.newLabel}>
                                手机号对店主可见
                            </Text>
                            <Text allowFontScaling={false} style={{
                                fontSize: px(20),
                                color: '#858385',
                                lineHeight: px(30)
                            }}>
                                默认对店主显示您的真实手机号
                            </Text>
                        </View>
                        {
                            Platform.OS == 'ios' ? <Switch
                                onTintColor="#d0648f"
                                tintColor="#e5e5ea"
                                value={this.state.showMobile != "0"}
                                onValueChange={(lab) => {
                                    this.setState({
                                        showMobile: lab ? 1 : 0
                                    })
                                }
                                }
                            /> : <Switch
                                onTintColor="#d0648f"
                                tintColor="#e5e5ea"
                                thumbTintColor="#ffffff"
                                value={this.state.showMobile != "0"}
                                onValueChange={(lab) => {
                                    this.setState({
                                        showMobile: lab ? 1 : 0
                                    })
                                }}
                            />
                        }
                    </View>
                </View>
            </View>
        </View>
    }
    
    render () {
        let _scrollView = ScrollView;
        return (
            <View style={ { flex: 1 } }>
                <TopHeader
                    title='订单确认'
                    onLayout={e => this.topHeaderLayout(e)}
                    navigation={this.props.navigation}
                />
                <View style={styles.container}>
                    {this.renderNotice()}
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                        <ScrollView style={styles.page} ref={(scrollView) => {
                            _scrollView = scrollView;
                        }}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        >
                            {this.renderPerson()}
                            {this.renderGoods()}
                            {this.renderOthers()}
                            {User.isLogin && <PayPlatform ref="payPlatform" select={this.selectPayPlatform}/>}
                        </ScrollView>
                    </KeyboardAvoidingView>
                    
                    <Tip
                        ref="tip"
                        tip = {'您购买的商品包含保税区商品，应中国海关要求，保税区商品不允许0元通关，因此每购买一件保税区商品，需增加保税区通关服务费0.10元，若出现退货此费用将退还，还望谅解！'}
                    />
                    <PwdModal ref="pwdModal" onComplete={(token) => this.pay(token)}></PwdModal>
                    {/*<AlertModal callback={() => {
                        this.submit();
                    }} ref="alertModal"></AlertModal>*/}
                    <Loading ref='loading' />
                    <LoadViewCanBack ref='loadingPay' />
                    <FreightModal
                        ref="freight"
                        shipFeeDetails={this.state.shipFeeDetails}
                    ></FreightModal>
                    
                </View>
                <DialogModal ref="dialog" bodyStyle={{ paddingTop: 20, paddingBottom: 20, ...this.alertStyle }} />
                <AlertModal  ref="alert" />
                { this.pageFooter() }
            </View>
        );
    }
    
    pageFooter() {
        if (!this.state.totalAmount) return null;
        return <FootView style={{
            borderTopWidth: px(1),
            borderTopColor: '#ededed',
        }}>
            <View style={styles.footer}>
                <View style={styles.footerMain}>
                    <Text allowFontScaling={false} style={styles.footerTxtLabel}>
                        应付金额￥
                    </Text>
                    <Text allowFontScaling={false} style={styles.footerTxtAmount}>
                        {Number(this.state.payableAmount).toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity onPress={this.areaCheckForOrder.bind(this)} activeOpacity={0.8}>
                    <View style={styles.footerBuy}>
                        <Text allowFontScaling={false} style={styles.footerBuyTxt}>确定支付</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <SubmitPicker
                ref="submitPicker"
                confirmPicker={this.confirmPicker.bind(this)}
            />
        </FootView>
    }

    async componentDidMount () {
        this.onReady()
    }

    onReady() {
        this.getDetail()
    }
    
    paramAddress = {}
    getDetail = async (newAddress) => {
        let uid = getHeader('uid')
        let prodIds = this.props.navigation.state.params.prodIds,
            prodQtys = this.props.navigation.state.params.prodQtys,
            from = this.props.navigation.state.params.from,
            addressFrom = newAddress || this.props.navigation.state.params.addressFrom,
            selectAddress = JSON.parse(await getItem(`selectAddress${uid}`)),
            paramAddress = {}

        this.defaultAddress = await request.get('/goods/defaultAddress.do');

        if (!prodIds || !prodQtys || !from || !addressFrom) {
            return toast('参数错误')
        }
        if (!selectAddress) {
            paramAddress = addressFrom
        } else {
            paramAddress = selectAddress
        }
        this.paramAddress = paramAddress;
        let val = await getItem(`recordShowMobile${uid}`);

        this.setState({
            from: from,
            showMobile: val ? parseInt(val) : 1
        })
        
        try {

            let res = await post(`/saleOrderApp/prepareOrder.do`, {
                prodIds: prodIds,
                prodQtys: prodQtys,
                from: from,
                province: paramAddress.province,
                city: paramAddress.city,
                district: paramAddress.district || paramAddress.area,
                addressId: paramAddress.addressId || paramAddress.id || 0
            })
            let address = {},
                manualAddress = this.state.manualAddress;
            if (!this.defaultAddress.id) {
                this.goBack({
                    city: '北京市',
                    district: '朝阳区',
                    province: '北京市'
                })
                this.$alert('', '您还没有收货地址，请点击添加', {
                    txt: '添加',
                    click: () => this.address()
                })
            } else {
                if (!res.addressId) {
                    address = this.defaultAddress

                    await setItem('defaultAddress', JSON.stringify(address))

                    this.$alert('是否新建地址？', `您在浏览商品过程中选择了${paramAddress.province}-${paramAddress.city}-${paramAddress.district || paramAddress.area}，若确认配送到该地区请新建一个收货地址`, {
                        txt: '取消',
                        click: () => this.setDefaultAddress(this.defaultAddress)
                    }, {
                        txt: '新建地址',
                        click: () => this.goCreateAddress()
                    })
                } else {
                    address = await get(`/address/query.do?id=${res.addressId}`);
                }
            }

            let isInBond = null,
                isForeignSupply = null;
            res.goods.forEach(v => {
                if (v.isInBond == 1) {
                    isInBond = 1;
                }
                if (v.isForeignSupply == 2) {
                    isForeignSupply = 2;
                }
            });

            //this.refs.loading.close()
            this.setState(Object.assign({}, res, {
                //selectAddress,
                manualAddress,
                "isInBond": isInBond,
                "isForeignSupply": isForeignSupply,
                "address": address ? address : {},
                suningId: res.availSuningCouponResponse && res.availSuningCouponResponse.couponUsed ? res.availSuningCouponResponse.couponUsed.successList : [],
                "cardNo": address  ? address.cardNo : null,
            }, res.availSuningCouponResponse), () => {
                this.checkAddress()
            });
        } catch (e) {
            this.refs.loading.close()
            toast(e.message);
            this.props.navigation.goBack();
        }
    }

    async setDefaultAddress (address) {
        let uid = getHeader('uid')
        await setItem(`selectAddress${uid}`, JSON.stringify(address))
        setHeader('province', encodeURIComponent(address.province));
        setHeader('city', encodeURIComponent(address.city));
        setHeader('district', encodeURIComponent(address.district));
        await this.navigationCallback()
    }

    goCreateAddress () {
        this.props.navigation.navigate('AddressEditorPage', {
            bondedPayerSwitchOnYn: this.state.bondedPayerSwitchOnYn,
            callback: () => {},
            callAddress: address => this.goBack(address)
        })
    }

    async goBack (address) {
        let uid = getHeader('uid')
        this.setState({ address })
        await setItem(`selectAddress${uid}`, JSON.stringify(address))
        setHeader('province', encodeURIComponent(address.province));
        setHeader('city', encodeURIComponent(address.city));
        setHeader('district', encodeURIComponent(address.district));
        await this.navigationCallback()
    }

    address () {
        this.refs.submitAddress && this.refs.submitAddress.focus()
    }
    
    onClick() {
        this.setState({
            notice_show: false
        })
    }
    async checkAddress() {
        try {
            if (!this.state.address.name) return;
            if (!this.state.goods || this.state.goods.length == 0) return;
            let ret = [];
            this.state.goods.map((values) => {
                ret.push(values.id);
            });
            let prodIds = ret.join(',');
            let res = await get(`/saleOrder/checkAddr.do?addressId=${this.state.address.id}&prodIds=${prodIds}&prodQtys=${this.state.prodQtys}`)

            this.setState({
                warning: res.alertFlag,
                msg: res.msg,
                type: res.type,
                isCreateOrder: res.isCreateOrder,
                notice_show: true,
                preSaleYn: res.preSaleYn,
                preSaleShipDateStr: res.preSaleShipDateStr
            })

            
        } catch (e) {
            if (e.message === '510') {
                let uid = getHeader('uid')
                let defaultAddress = await request.get('/goods/defaultAddress.do')

                await setItem(`selectAddress${uid}`, JSON.stringify(defaultAddress))
                setHeader('province', encodeURIComponent(defaultAddress.province));
                setHeader('city', encodeURIComponent(defaultAddress.city));
                setHeader('district', encodeURIComponent(defaultAddress.district));
                await setItem('defaultAddress', JSON.stringify(defaultAddress))
                this.getDetail(defaultAddress)
            } else {
                toast(e.message);
                this.props.navigation.goBack();
            }
        }
    }
    
    reCalculation = async () => {
        let {
                prodIds,
                prodQtys,
                balanceYn,
                couponId,
                stunnerId,
                suningId,
                cartTwoNo,
                address,
                manualAddress
            } = this.state, params = {}, addrParams = {};
        let paramAddress = this.paramAddress;
        manualAddress = manualAddress.province ? manualAddress : paramAddress;
        if (address.id || address.addressId) { //不需要手动填地址
            addrParams = {
                province: address.province,
                city: address.city,
                district: address.district
            }
        } else {
            addrParams = {
                province: manualAddress.province,
                city: manualAddress.city,
                district: manualAddress.district
            }
        }
        params = Object.assign(addrParams, {
            prodIds: prodIds,
            prodQtys: prodQtys,
            couponId: couponId == null ? '' : couponId,
            balanceYn: balanceYn * 1,
            stunnerId: stunnerId == null ? '' : stunnerId,
            couponUsedDate: (suningId || []).join(','),
            cartTwoNo: cartTwoNo,
            usefalg: '1'
        })
        try {
            let res = await post(`/saleOrderApp/calculateAmount.do`, params);
            this.setState(Object.assign(res, res.availSuningCouponResponse))
        } catch (error) {
            toast(error.message);
            this.setState({
                balanceYn: balanceYn === 0 ? 1 : 0
            })
        }
        
    }
    dontSwitchForOther = () => {
        this.setState({
            priceIsHidden: !this.state.priceIsHidden
        })
    }
    //开启余额支付开关
    switchOnChange = async (v) => {
        const { balanceYn } = this.state
        let shop = await request.post('/saleOrderApp/openBalancePay.do');
        if (balanceYn == 0 && shop.notifyFlag == 0) {
            this.$alert("提示", [`您还没有设置支付密码，无法使用余额支付，为保证您的账户安全，请设置后使用。`],
                {
                    txt: '取消'
                },
                {
                    txt: '去设置',
                    click: async () => {
                        this.props.navigation.navigate('AddPswPage', {
                            call: async () => {
                                this.setState({
                                    balanceYn: 1
                                }, async () => {
                                    await this.reCalculation()
                                })
                            }
                        });
                    }
                })
        } else {
            this.setState({
                balanceYn: v * 1
            }, async () => {
                await this.reCalculation()
            })
        }
    }
    onChange = () => {
        this.props.navigation.navigate('UseCouponPage', {
            coupons1: this.state.coupons1,
            coupons2: this.state.coupons2,
            id: this.state.couponId,
            callbackF: (id) => {
                this.setState({
                    couponId: id,
                    stunnerId: ''
                }, async () => {
                    await this.reCalculation()
                })
            },
            test: this.state.couponId
        });
    }
    onChangeGold = () => {
        this.props.navigation.navigate('UseGoldPage', {
            stunners1: this.state.stunners1,
            stunners2: this.state.stunners2,
            id: this.state.stunnerId,
            callbackF: (id) => {
                this.setState({
                    stunnerId: id,
                    couponId: ''
                }, async () => {
                    await this.reCalculation()
                })
            }
        });
    }
    onChangeSuning = () => {
        let {validCoupons, noValidCoupons} = this.state
        if ((!validCoupons || validCoupons.length == 0) && (!noValidCoupons || noValidCoupons.length == 0)) {
            return;
        }
        this.props.navigation.navigate('UseSuningCouponPage', {
            validCoupons: this.state.validCoupons || [],
            noValidCoupons: this.state.noValidCoupons || [],
            couponUsed: this.state.couponUsed || [],
            failedList: this.state.failedList || [],
            //address: this.state.address,
            callbackF: async(selected) => {
                this.setState({
                    suningId: selected
                }, async () => {
                    await this.reCalculation()
                })
                //await this.reCalculation(selected)
            }
        });
    }
    selectAddress() {
        this.props.navigation.navigate('AddressListPage', {
            selected: this.state.address,
            callback: (address) => {
                if (!address) return;

                if (!(address.id || address.addressId)) {
                    this.getDetail(address)

                    return false
                }
                let uid = getHeader('uid')
                let thisAddress = this.state.address,
                    isRefesh = true;
                if (thisAddress.province == address.province && thisAddress.city == address.city && thisAddress.district == address.district) {
                    isRefesh = false;
                }
                this.setState({
                    'address': address,
                    'cardNo': address.cardNo ? address.cardNo : ''
                }, async() => {
                    await this.checkAddress()
                    if (isRefesh) {
                        await this.reCalculation()
                    }
                    await setItem(`selectAddress${uid}`, JSON.stringify(address))
                    setHeader('province', encodeURIComponent(address.province));
                    setHeader('city', encodeURIComponent(address.city));
                    setHeader('district', encodeURIComponent(address.district));
                    await this.navigationCallback()
                    //let res = await this.getSuningCoupons(address)
                    //this.setState(Object.assign({}, res));
                })
            }
        });
        
        //cardNo: !this.state.cardNo ? address.cardNo : this.state.cardNo
    }
    
    goPayerPage() {
        this.go('PayerListPage', {
            address: this.state.address,
            payer: {
                id: this.state.buyerInfoId,
                payerName: this.state.buyerRealName,
                payerCardNo: this.state.buyerIdCard
            },
            from: 'submit',
            callback: (payer) => {
                if (!payer) return;
                this.setState({
                    buyerInfoId: payer.id,
                    buyerRealName: payer.payerName,
                    buyerIdCard: payer.payerCardNo
                })
            }
        });
        
        //cardNo: !this.state.cardNo ? address.cardNo : this.state.cardNo
    }
    /**
     * 使用密码
     */
    prePay() {
        if (this.state.balanceYn == 0) {
            this.pay('')
        } else {
            this.refs.pwdModal.Open();
        }
    }
    aliPayErr(ret) {
        return /9000/.test(ret);
    }
    /**
     * 苏宁用券失败提示，继续支付会继续生单
     */
    openAlert(error) {
        this.$alert("", [error],
            {
                txt: '取消'
            },
            {
                txt: '继续支付',
                click: async () => {
                    await this.pay('fromError')
                }
            })
    }
    async pay(token) {
        let uid = getHeader('uid')
        if (token !== 'fromError') {
            this.setState({
                psw: token
            })
        }
        this.refs.loadingPay.open(this.payModeHeight, this.topHeaderHeight);
        this.isSubmit = false;
        let datas = {};
        let code = this.refs['payPlatform'].getCode(),
            add = this.state.address,
            manualAddress = this.state.manualAddress,
            params = {}, addrParams = {};
        let regex = new RegExp('[^\\･\\·\\.\\•\\,\\，\\(\\)\\（\\）\\_\\-\\！\\!\\【\\】\\[\\]\\《\\》a-zA-Z0-9\u4e00-\u9fa5]', 'g');
        if (add.id || add.addressId) { //不需要手动填地址
            addrParams = {
                receiveAddressId: this.state.address.id
            }
        } else {
            addrParams = {
                name: manualAddress.name.replace(regex, ''),
                province: manualAddress.province,
                city: manualAddress.city,
                district: manualAddress.district,
                detail: manualAddress.detail.replace(regex, ''),
                phone: manualAddress.phone,
                cardNo: this.state.cardNo
            }
        }
        if (token == 'fromError') {
            addrParams = Object.assign(addrParams, {
                isPaySuning: 1
            })
        }
        params = Object.assign(addrParams, {
            prodIds: this.state.prodIds,
            prodQtys: this.state.prodQtys,
            from: this.state.from,
            couponId: this.state.couponId,
            stunnerId: this.state.stunnerId,
            balanceYn: this.state.balanceYn,
            payPwd: '',
            payToken: token == 'fromError' ? this.state.psw : token,
            inviteCode: '',
            hidePriceYn: this.state.priceIsHidden ? '1' : '0',
            payPlatform: code,
            buyerInfoId: this.state.buyerInfoId,
            itemIds: this.state.suningIteamIds,
            cartTwoNo: this.state.cartTwoNo,
            //couponUsedList: '111'
            couponUsedList: this.state.couponUsed ? (this.state.couponUsed.successList || []).join() : '',
            showMobileYn: this.state.showMobile
        })

        if (util_tools.checkAddr(params.name, params.detail)) {
            this.isSubmit = true;
            this.refs.loadingPay.close()
            toast('收货人地址规则更新，需重新编辑')
            return false
        }

        try {
            datas = await request.post('/saleOrderApp/createOrder.do', params, true);

            
            let defaultAddress = await request.get('/goods/defaultAddress.do')

            await setItem(`selectAddress${uid}`, JSON.stringify(defaultAddress))
            setHeader('province', encodeURIComponent(defaultAddress.province));
            setHeader('city', encodeURIComponent(defaultAddress.city));
            setHeader('district', encodeURIComponent(defaultAddress.district));
            await setItem('defaultAddress', JSON.stringify(defaultAddress))
            await this.navigationCallback()

            // this.setState({
            //     address: defaultAddress
            // })
            
            if (datas.error) {
                this.openAlert(datas.error);
                this.isSubmit = true;
                this.refs.loadingPay.close();
                return;
            }
        } catch (e) {
            this.refs.loadingPay.close()
            this.isSubmit = true;
            let xiaoxi = this.ClearBr(e.message);
            if (Platform.OS === 'android') {
                return toast(xiaoxi);
             }else if(Platform.OS === 'ios'){
                return toast(e.message);
             }

        }

        await setItem(`payPlatform${uid}`, datas.payform);
        if (this.state.payableAmount == 0) {
            this.refs.loadingPay.close()
            return this.props.navigation.navigate('SuccessPage', {
                orderNo: datas.orderNo
            });
        }
        try {
            if ('weixin' == datas.payform) {
                let isInstalled = await isWXAppInstalled();
                if (!isInstalled && this.state.payableAmount != 0) {
                    toast('没有安装微信');
                    throw new Error('没有安装微信');
                }
                let res = await wxPay(datas.paydata);
            } else if ('ialipayFz' == datas.payform) {
                let param = [];
                let payInfo = datas.paydata || {};
                for (let k in payInfo) {
                    let val = payInfo[k] || "";
                    if (k && val)param.push(`${k}=${val}`);
                }
                if (!payInfo.sign || !payInfo.out_trade_no || param.length < 5){
                    toast('请重新支付');
                    logErr("支付宝支付失败", datas);
                    throw new Error('请重新支付');
                }
                let paramStr = param.join('&');
                let res = await aliPay.pay({orderString: paramStr});
                let isErr = true;
                if (Platform.OS == "ios") {
                    if (!(res.resultStatus && res.resultStatus == '9000')) {
                        isErr = false;
                    }
                } else {
                    isErr = this.aliPayErr(res);
                }
                
                if (!isErr) {
                    throw new Error('您已取消了支付');
                }
            } else {
                throw new Error('您已取消了支付');
            }
        } catch (e) {
            this.refs.loadingPay.close()
            let {params} = this.props.navigation.state;
            return this.props.navigation.navigate('PayFailResult', {
                orderNo: datas.orderNo,
                from: params && params.from,
                prodIds: params && params.prodIds
            });
        }
        this.refs.loadingPay.close()
        this.isSubmit = true;
        await setItem(`recordShowMobile${uid}`, String(this.state.showMobile));
        this.props.navigation.navigate('SuccessPage', {
            orderNo: datas.orderNo
        });
    }
    
    areaCheckForOrder() {

        if (this.state.warning == 1 && this.state.type == '1') {
            this.$openAlert(this.state.msg);
            //this.refs.alertModal.open(this.state.msg);
        } else {
            this.submit();
        }
    }
    
    async submit() {

        if (!this.isSubmit) return;
        
        // 物流异常不能生单
        if (this.state.warning == 1 && this.state.isCreateOrder == "0") return;
        
        let goodsTypes = this.state.isInBond == 1 || this.state.isForeignSupply == 2,
            sw = this.state.bondedPayerSwitchOnYn,
            add = this.state.address,
            manualAddress = this.state.manualAddress
        if (this.state.addressYn == 1) { // 没有包含虚拟商品
            if (!add.id && !add.addressId) { //需要手动加地址
                if (!manualAddress.name) {
                    return toast('请填写收货人姓名');
                }
                if (!manualAddress.phone) {
                    return toast('请填写收货人手机号');
                }
                if (!manualAddress.province) {
                    return toast('请选择省市区');
                }
                if (!manualAddress.detail) {
                    return toast('请填写收货人详细地址');
                }
            } else {
                if (util_tools.checkAddr(add.name, add.detail)) {
                    return toast('收货人地址规则更新，需重新编辑')
                }
            }
            /*if (!this.state.address.name) {
                toast('请选择地址');
                return;
            }*/
            if (goodsTypes && !this.state.cardNo && sw == 'N') {
                toast('请填写身份证号');
                return;
            }
    
            if (!this.state.address.cardNo && goodsTypes && sw == 'N' && !/^(\d{15}|\d{18}|\d{17}X)$/gmi.test(this.state.cardNo)) {
                toast('身份证号格式不正确');
                return;
            }
            /*支付人开关开启并且生单有保税区商品*/
            if (sw == 'Y' && !this.state.buyerInfoId && goodsTypes) {
                toast('请选择支付人');
                return;
            }
        }
        //(add.id || add.addressId) 有地址，单独需要填写身份证号的情况才去更新地址表
        if ((add.id || add.addressId) && goodsTypes && !this.state.address.cardNo && this.state.bondedPayerSwitchOnYn == 'N' && this.state.addressYn == 1) {
            try {
                await post('/address/update.do', Object.assign({}, this.state.address, {
                    'cardNo': this.state.cardNo
                }));

            } catch (e) {
                toast(e.message)
            }
            this.prePay();
        } else {
            this.prePay();
        }
    }
    //移除换行
     ClearBr(key) {
        key = key.replace(/<\/?.+?>/g,"");
        key = key.replace(/[\r\n]/g, "");
        return key;
    }

    $alert(title, content, success, cancel) {
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
        if (typeof cancel === "string") cancel = { txt: cancel }
        this._alert(title, content, success, cancel)
    }
    _alert(title, content, success, cancel, code) {
        let opt = {
            title, content, code,
            btns: []
        }
        if (success) opt.btns.push(success)
        if (cancel) opt.btns.push(cancel)
        this.refs.dialog.open(opt);
    }

    $openAlert(message) {
        this.refs.alert && this.refs.alert.open(message)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    page: {
        flex: 1,
        backgroundColor: '#f5f3f6'
    },
    comItem: {
        height: px(80),
        width: px(726),
        marginLeft: px(24),
        paddingRight: px(24)
    },
    comItem1: {
        width: px(726),
        marginLeft: px(24),
        paddingRight: px(24),
        paddingVertical: px(21)
    },
    border: {
        borderTopColor: '#efefef',
        borderTopWidth: px(1)
    },
    goods: {
        backgroundColor: '#fbfafc',
        padding: px(30),
    },
    goodsShop: {
        height: px(80),
        paddingHorizontal: px(24),
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    goodsShopText: {
        fontSize: px(26),
        color: '#222'
    },
    goodsDetail: {
        flexDirection: 'row'
    },
    goodsDetailView1: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: px(20)
    },
    goodsDetailView2: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    goodsName: {
        width: px(400),
        lineHeight: px(40),
        fontSize: px(24),
        color: '#222',
    },
    goodsCover: {
        width: px(150),
        height: px(150),
        borderRadius: px(8),
    },
    goodsPrice: {
        fontSize: px(22),
        color: '#222',
        marginTop: px(8)
    },
    goodsQty: {
        fontSize: px(22),
        color: '#858385',
        marginTop: px(20)
    },
    footer: {
        width:px(750),
        height: px(90),
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    footerMain: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    footerTxtLabel: {
        fontSize: px(28),
        backgroundColor: 'transparent',
        includeFontPadding: false,
        color: '#d0648f'
    },
    footerTxtAmount: {
        fontSize: px(38),
        includeFontPadding: false,
        color: '#d0648f',
        marginRight: px(40)
    },
    footerBuy: {
        width: px(250),
        height: px(90),
        paddingTop: px(30),
        backgroundColor: '#d0648f'
    },
    footerBuyTxt: {
        fontSize: px(30),
        color: '#fff',
        textAlign: 'center',
        includeFontPadding: false
    },
    otherBox: {
        marginTop: px(20)
    },
    coupon: {
        height: px(80),
        paddingHorizontal: px(30),
        alignItems: 'center',
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1)
    },
    couponCount: {
        flexDirection: 'row',
        //justifyContent:'center',
        flex: 1
    },
    couponName: {
        fontSize: px(26),
        marginTop: px(3),
        color: '#222'
    },
    couponTipTxt: {
        fontSize: px(24),
        color: '#d0648f',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    couponTip: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: px(14),
        paddingHorizontal: px(10),
        height: px(34),
        borderWidth: px(1),
        borderRadius: px(3),
        borderColor: '#d0648f',
        overflow: 'hidden',
    },
    couponMoney: {
        flex: 1,
        textAlign: 'right',
        color: '#d0648f',
        fontSize: px(28),
        paddingRight: px(17)
    },
    balanceLabel: {
        flex: 1,
        fontSize: px(26),
        color: '#222'
    },
    newLabel: {
        fontSize: px(26),
        lineHeight: px(36),
        color: '#222'
    },
    switchBox: {
        //width: px(102),
        //height: px(62)
    },
    flag: {
        width: px(45),
        height: px(27),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        left: px(10),
        top: px(5),
        zIndex: 100,
        borderRadius: px(4),
        overflow: 'hidden'
    },
    flag1: {
        backgroundColor: '#56beec'
    },
    flag2: {
        backgroundColor: '#6cd972'
    },
    flagLen: {
        fontSize: px(17),
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: "center",
        color: '#fbfafc',
    },
    flagBaoShui: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    flagZhiYou: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    notice: {
        backgroundColor: '#ee5168',
        minHeight: px(50),
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    left15: {
        marginLeft: px(30),
    },
    close: {
        color: '#fff',
        fontSize: px(50),
        fontWeight: '200',
        textAlign: 'left',
    },
    actionWrap: {
        marginRight: px(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    left6: {
        marginLeft: px(15),
    },
    notice_container: {
        flex: 1,
        marginRight: px(15),
        width: 0,
        paddingTop: px(10),
        paddingBottom: px(10)
    },
    content: {
        fontSize: px(24),
        color: '#fff',
        lineHeight: px(28)
    }
});
