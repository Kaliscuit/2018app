'use strict';

import React from 'react';

import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    Modal, TouchableWithoutFeedback,
    Alert,
    Platform, TouchableOpacity,
    Clipboard,
    TextInput,
    NativeModules
} from 'react-native';
import { px, deviceWidth } from '../../utils/Ratio';
import { get, getHeader, post } from '../../services/Request';
import { Status, payType } from './Status';

import { ExpressListDetail, ReturnListDetail } from './DetailOrderItems';
import util_tools from '../../utils/tools'
import { show as toast } from '../../widgets/Toast';
import { TopHeader } from '../common/Header'
import { log, logErr, logWarm } from '../../utils/logs'
import { IdsConfirmModal, AlertModal } from '../common/ModalView';
import Loading from '../../animation/Loading'
import PayPlatform from '../common/PayPlatform';
import { setItem, removeItem, getItem } from '../../services/Storage';
import { pay as wxPay, isWXAppInstalled } from '../../services/WeChat';
import { FootView } from '../../UI/Page'
import Icon from '../../UI/lib/Icon'
import base from '../../styles/Base'

import { GoodsRecommendedForYou } from '../recommended/GoodsRecommended'
import { WarnPrompt } from '../../widgets/Prompt'
import PopIm from "../profile/help/Pop"
import Button from "../../UI/lib/Button"

const aliPay = NativeModules.Alipay;

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            order: {},
            orderNo: this.props.navigation.state.params.orderNo,
            type: this.props.navigation.state.params.type || 0,
            actionType: this.props.navigation.state.params.actionType,
            modalVisible: false,
            shopName: '',
            shopUserMobile: '',
            time: '',
            hideMoney: false,
            isInBond: 0,
            isForeignSupply: 1,
            addressTime: '',
            addressExpired: false,
            address: {},
            hasGoods: false,
            isShow: false,
            recommends: []
        };
        this.message = "";
        this.warning = 0;
        this.timeset = null;
        this.goodsIds = [];

        this.isWeCatHistory = props.navigation.getParam('isWeCatHistory', false)
    }

    render() {
        let order = this.state.order;
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <TopHeader navigation={this.props.navigation}
                title="订单详情"
                rightBtn={this.state.type == 1 ? <TouchableOpacity onPress={() => {
                    this.setState({ hideMoney: !this.state.hideMoney })
                }}>
                    {this.state.hideMoney ? <Icon name="icon-eye2"
                        style={{ width: px(40), height: px(40), marginRight: px(20), marginTop: px(5) }} /> :
                        <Icon name="icon-eye1"
                            style={{ width: px(40), height: px(40), marginRight: px(20), marginTop: px(5) }} />}
                </TouchableOpacity> : null} />
            {
                this.state.type !== 1 && <WarnPrompt
                    text="近期诈骗事件多发，为了您的资金安全，任何陌生号码、微信或者链接，要求您提供支付宝账号密码、银行卡密码、验证码，要求扫二维码等，都是诈骗行为，均不要相信！！！"
                    isShowArrow={false}
                    style={[
                        styles.security,
                        this.state.isShow && this.warning == '1' && { marginBottom: px(2) }
                    ]}
                />
            }
            {this.state.isShow && this.warning == '1' &&
                <View style={styles.notice}>
                    <View style={styles.left15}>
                        <Icon name="icon-notice" style={{ width: px(26), height: px(28) }} />
                    </View>
                    <View style={[styles.notice_container, styles.left6]}>
                        <Text allowFontScaling={false} style={styles.content}>
                            {this.message}
                        </Text>
                    </View>
                    <TouchableWithoutFeedback onPress={() => this.closeFlag()}>
                        <View style={styles.actionWrap}>
                            <Icon name="icon-close-white-order" style={{ width: px(18), height: px(18) }} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            }
            <ScrollView style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
            >
                <View style={styles.head}>
                    <View>
                        <Text allowFontScaling={false} style={[styles.headTxt, { fontSize: px(30), marginBottom: px(16) }]}>
                            {order.orderStatusNm}
                        </Text>
                    </View>
                    <View style={styles.rows}>
                        <Text allowFontScaling={false} style={[styles.headTxt, { fontSize: px(24), marginBottom: px(7) }]}>
                            订单编号 {order.orderNo}   </Text>
                        <TouchableWithoutFeedback><View style={styles.copyBtn}>
                            <Text style={styles.copyText} onPress={() => this.copy(order.orderNo)} >复制</Text>
                        </View></TouchableWithoutFeedback>

                    </View>
                    <Text allowFontScaling={false} style={[styles.headTxt, { fontSize: px(24) }]}>
                        下单时间 {order.orderDate}
                    </Text>
                    {order.payPlatform && <Text allowFontScaling={false} style={[styles.headTxt, { fontSize: px(24) }]}>
                        支付方式 {payType[order.payPlatform]}
                    </Text>}
                </View>

                {
                    order.isShowReceive && <View>
                        <View style={styles.address}>
                            <Icon style={styles.addressIcon}
                                name="icon-address" />
                            <View style={styles.addressInfo}>
                                <Text allowFontScaling={false}
                                    style={styles.addressLine1}>{this.state.address.name} {this.state.address.phone}</Text>
                                {order.isShowPrivate && <Text allowFontScaling={false} style={styles.addressLine2}>
                                    {this.state.address.province}-{this.state.address.city}-{this.state.address.district}
                                    {this.state.address.detail}
                                </Text>}

                                {order.isShowPrivate && this.state.address.cardNo && this.state.order.bondedPayerSwitchOnYn == 'N' ? <Text
                                    allowFontScaling={false}
                                    style={styles.addressLine2}>
                                    身份证号 {this.state.address.cardNo}
                                </Text> : null}
                                {!order.isShowPrivate && <Text allowFontScaling={false}
                                    style={styles.addressLine2}>因涉及用户隐私隐藏下单用户资料</Text>}
                            </View>
                        </View>
                        {
                            this.state.type == 0 && (order.orderStatus == 0 || order.orderStatus == 2) && order.isEditOrderAddr && !this.state.addressExpired && <View style={styles.changeBtn}>
                                <TouchableWithoutFeedback onPress={() => this._onChangeAddress()}>
                                    <View style={styles.addressChange}>
                                        <Text allowFontScaling={false} style={[styles.btnFont, { color: order.isEditOrderAddr && !this.state.addressExpired ? '#515151' : '#b2b3b5' }]}>
                                            修改地址 {order.isEditOrderAddr && !this.state.addressExpired ? this.state.addressTime : ''}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        }
                        {
                            this.state.order.bondedPayerSwitchOnYn == 'Y' && this.state.order.buyerRealName != '' && (this.state.isInBond == 1 || this.state.isForeignSupply == 2) &&
                            <View style={payerStyles.c}>
                                <View style={[payerStyles.box, base.inline_left]}>
                                    <View style={{ flexDirection: 'row', marginRight: px(55) }}>
                                        <Icon name="icon-payer-submit" style={{ width: px(28), height: px(24), marginRight: px(15) }} />
                                        <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.txt]}>支付人</Text>
                                    </View>
                                    <Text allowFontScaling={false} style={[base.includeFontPadding, payerStyles.txt]}>{this.state.order.buyerRealName}({this.state.order.buyerIdCard})</Text>
                                </View>
                            </View>
                        }
                        <View style={{ marginBottom: px(20), flexDirection: 'row', width: px(254 * 3) }}>
                            {[...Array(3)].map((i, idx) =>
                                <Icon name="bg-address-line" key={idx} style={{ width: px(254), height: px(4) }}
                                    resizeMode='contain' />
                            )}
                        </View>
                    </View>
                }
                {order.isShowPrivate && <View style={[styles.section, { justifyContent: 'flex-start', marginTop: px(20) }]}>
                    <Image style={{ width: px(38), height: px(38), borderRadius: px(19), marginRight: px(10) }}
                        resizeMode='cover'
                        source={{ uri: this.state.type == 1 ? order.userImg : order.indexImg }} />
                    <Text allowFontScaling={false}
                        style={styles.sectionLabel}>{this.state.type == 1 ? order.userName : order.shopName}</Text>
                </View>}
                <View style={styles.returnList}>
                    <ExpressListDetail
                        type={this.state.type}
                        order={order}
                        role={this.state.type}
                        load={() => this.load()}
                        showTell={(a, b) => this.showTell(a, b)}
                        items={order.expressList}
                        actionRouter={this.state.actionType}
                        isWeCatHistory={this.isWeCatHistory}
                        navigation={this.props.navigation} />
                </View>
                {
                    order.returnList && order.returnList.length > 0 &&
                    <View style={styles.returnList}>
                        <Text allowFontScaling={false} style={styles.itemTitle}>退货信息</Text>
                        <ReturnListDetail
                            navigation={this.props.navigation}
                            isWeCatHistory={this.isWeCatHistory}
                            type={this.state.type}
                            items={order.returnList} />
                    </View>
                }
                <View style={styles.sectionBox}>
                    <View style={styles.section1}>
                        <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>商品金额</Text>
                        <Text allowFontScaling={false}
                            style={{ fontSize: px(28), color: '#858385' }}>￥{order.prodAmount}</Text>
                    </View>
                    {
                        order.shipFee &&
                        <View style={styles.section1}>
                            <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>运费</Text>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#858385' }}>+￥{order.shipFee}</Text>
                        </View>
                    }
                    {
                        (this.state.isInBond == 1 || this.state.isForeignSupply == 2) &&
                        <View style={styles.section1}>
                            <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>税费</Text>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#858385' }}>+￥{order.taxesFee}</Text>
                        </View>

                    }
                    {
                        order.stunnerAmount != 0 &&
                        <View style={styles.section1}>
                            <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>金币</Text>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#858385' }}>-￥{order.stunnerAmount}</Text>
                        </View>

                    }
                    {order.couponPayAmount != 0 &&
                        <View style={styles.section1}>
                            <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>达令家代金券</Text>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#858385' }}>-￥{order.couponPayAmount}</Text>
                        </View>
                    }
                    {
                        order.suningCouponAmount && order.suningCouponAmount != 0 ?
                            <View style={styles.section1}>
                                <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>苏宁代金券</Text>
                                <Text allowFontScaling={false}
                                    style={{ fontSize: px(28), color: '#858385' }}>-￥{order.suningCouponAmount || 0}</Text>
                            </View> : null
                    }
                    {
                        order.suningBonusAmount && order.suningBonusAmount != 0 ?
                            <View style={styles.section1}>
                                <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>活动优惠</Text>
                                <Text allowFontScaling={false}
                                    style={{ fontSize: px(28), color: '#858385' }}>-￥{order.suningBonusAmount || 0}</Text>
                            </View> : null
                    }
                    {order.balancePayAmount != 0 &&
                        <View style={styles.section1}>
                            <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>余额支付</Text>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#858385' }}>-￥{order.balancePayAmount}</Text>
                        </View>
                    }
                    {order.bondedProdAmount != 0 &&
                        <View style={styles.section1}>
                            <Text allowFontScaling={false} style={{ fontSize: px(26), color: '#858385' }}>保税区商品通关服务费</Text>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#858385' }}>+￥{order.bondedProdAmount}</Text>
                        </View>
                    }
                </View>
                <View style={styles.section}>
                    <View style={{
                        borderTopWidth: px(1),
                        borderTopColor: '#efefef', width: px(690), height: px(80)
                    }}>
                        <View style={styles.section2}>
                            <Text allowFontScaling={false}
                                style={{ fontSize: px(28), color: '#252426' }}>{order.orderStatus == 0 ? '应付金额' : '实付金额'}</Text>
                            <Text allowFontScaling={false} style={{
                                fontSize: px(32),
                                color: '#eb83b2'
                            }}>￥{order.orderStatus == 0 ? order.payableAmount : order.payAmount}</Text>
                        </View>
                    </View>
                </View>
                {(this.state.type == 0 || this.state.type == 1 && order.isOwner) && order.orderStatus == 0 && <PayPlatform ref="payPlatform" />}
                <View style={{ paddingHorizontal: px(24) }}>
                    <GoodsRecommendedForYou
                        navigation={this.props.navigation}
                        list={this.state.recommends}
                    />
                </View>
            </ScrollView>
            {
                order.seckillYn == '1' && (this.state.type == 0 || order.isOwner) && order.orderStatus == 0 && <View style={styles.seckillTip}>
                    <Text allowFontScaling={false} style={styles.seckillTipMessage}>您的订单中包含抢购商品,请抓紧时间支付,好物不等人哦~</Text>
                </View>
            }
            {this.state.type == 1 &&
                <View style={{ height: px(100), width: px(750) }}>
                    <FootView style={styles.foot}>
                        <View style={[styles.footer2, styles.footer]}>
                            <View style={[styles.footer1]}>
                                {!this.state.hideMoney &&
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(28) }}>
                                            本订单我能赚到
                                            <Text allowFontScaling={false} style={{ color: '#eb83b2' }}>
                                                {[5, 6, 7, 8, 10].indexOf(order.orderStatus) >= 0 ?
                                                    '￥0.00(退款无法结算)' : [99].indexOf(order.orderStatus) >= 0 ?
                                                        '￥0.00' :
                                                        '￥' + Number(order.earnAmount).toFixed(2)
                                                }
                                            </Text>
                                        </Text>
                                    </View>
                                }
                                {
                                    order.orderStatus == 0 &&
                                    <Text allowFontScaling={false} style={{ fontSize: px(20), color: '#858385' }}>付款剩余时间{this.state.time}</Text>

                                }
                            </View>
                            {order.orderStatus == 0 && order.isOwner && <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={this.cancel}>
                                    <View style={[styles.Btn, styles.cancelBtn]}>
                                        <Text style={[styles.cBtn, styles.cBtn1]}
                                            allowFontScaling={false}>取消订单</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.pay}>
                                    <View style={[styles.Btn, styles.payBtn]}>
                                        <Text style={[styles.cBtn, styles.cBtn2]}
                                            allowFontScaling={false}>去支付</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>}
                        </View>
                    </FootView>
                </View>
            }
            {this.state.type == 0 && order.orderStatus == 0 &&
                <View style={{ height: px(100), width: px(750) }}>
                    <FootView style={styles.foot}>
                        <View style={[styles.footer2, styles.footer]}>
                            <Text allowFontScaling={false} style={{ fontSize: px(20), color: '#858385' }}>付款剩余时间{this.state.time}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={this.cancel}>
                                    <View style={[styles.Btn, styles.cancelBtn]}>
                                        <Text style={[styles.cBtn, styles.cBtn1]}
                                            allowFontScaling={false}>取消订单</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.pay}>
                                    <View style={[styles.Btn, styles.payBtn]}>
                                        <Text style={[styles.cBtn, styles.cBtn2]}
                                            allowFontScaling={false}>去支付</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </FootView>
                </View>
            }
            <View style={{ height: px(100), width: px(750) }}>
                <FootView>
                    <Button style={styles.btnKefu} icon="zaixiankefu" value="在线客服" onPress={this.kefu.bind(this)} />
                </FootView>
            </View>
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                }}
            >
                <View style={styles.modal}>
                    <View style={styles.closeWrap}>
                        <TouchableWithoutFeedback onPress={() => {
                            this.setState({ modalVisible: false });
                        }}>
                            <View style={{ width: px(60), height: px(80), marginRight: px(20) }}>
                                <Icon name="icon-close" style={styles.modalClose} />
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                    <View style={styles.modalBox}>
                        {this.state.type != 1 &&
                            <View>
                                <Text allowFontScaling={false} style={styles.modalLine}>若购买的商品出现问题，请联系店主进行售后服务：</Text>
                                <Text allowFontScaling={false} style={styles.modalLine}>店铺名称：{this.state.shopName}</Text>
                                <Text allowFontScaling={false} style={styles.modalLine}>店主电话：<Text onPress={() => {
                                    util_tools.toCall(this.state.shopUserMobile)
                                }} style={{ color: '#44b7ea' }}
                                    allowFontScaling={false}>{this.state.shopUserMobile}</Text></Text>
                                <Text> </Text>
                                <Text allowFontScaling={false} style={styles.modalLine}>如您无法联系店主，请联系达令家客服：</Text>
                            </View>
                        }
                        {
                            this.state.type == 1 &&
                            <Text allowFontScaling={false} style={styles.modalLine}>若购买的商品出现问题，请联系我们的客服进行售后服务：</Text>
                        }
                        <Text allowFontScaling={false} style={styles.modalLine}>电话：<Text onPress={() => {
                            util_tools.toCall('400-005-5566')
                        }} style={{ color: '#44b7ea' }} allowFontScaling={false}>400-005-5566</Text></Text>
                        <Text allowFontScaling={false} style={styles.modalLine}>微信公众号：达令家(搜索dalingfamily)</Text>
                        <Text allowFontScaling={false} style={styles.modalLine}>客服时间：周一至周日 9:00-21:00</Text>

                    </View>
                </View>
            </Modal>
            <IdsConfirmModal ref="idsModal" close={() => this.__close()} change={(address) => this._onChangeAddress(address)} edit={(address) => this.__edit(address)} />
            <AlertModal ref="alertModal" />
            <Loading ref='loading' />
        </View>
    }

    async componentDidMount() {
        await this.load();
    }

    kefu() {
        this.props.navigation.navigate('CustomSC');
    }

    async load() {
        const _url = this.isWeCatHistory ? 'findTouchHistorySaleOrderDetail' : 'findSaleOrderDetail'

        try {

            let order = await get(`/saleOrderApp/${_url}.do?type=${this.state.type}&orderNo=${this.state.orderNo}`);

            if (!order.isShowPrivate) {
                order.receiveName = "***";
                order.receiveMobile = "***********";
            }
            this.setState({
                order: order,
                address: {
                    name: order.receiveName,
                    phone: order.receiveMobile,
                    province: order.receiveProvinceName,
                    city: order.receiveCityName,
                    district: order.receiveAreaName,
                    cardNo: order.receiveIdCard,
                    detail: order.receiveAddress
                }
            }, () => {
                let isInBond = null,
                    isForeignSupply = null;
                (this.state.order && this.state.order.expressList || []).forEach(item => {
                    (item.skuList || []).forEach(i => {
                        this.goodsIds.push(i.prodId);
                        if (i.isInBond == 1) {
                            isInBond = 1;
                        }
                        if (i.isForeignSupply == 2) {
                            isForeignSupply = 2;
                        }
                        this.setState({
                            isInBond: isInBond,
                            isForeignSupply: isForeignSupply,
                            hasGoods: true
                        })
                    })
                })
            });
        } catch (e) {
            log(_url, e.message)
        }
        let time = this.state.order.endPayTime
        let h = Math.floor(time / 60 / 60)
        let m = Math.floor(time / 60 % 60)
        let s = Math.floor(time % 60)
        this.setState({
            time: (h < 10 ? '0' + h : h) + "时" + (m < 10 ? '0' + m : m) + "分" + (s < 10 ? '0' + s : s) + '秒'
        })
        //
        if (this.state.type == '0' && this.state.order.isEditOrderAddr) {
            this.tick();
        }

        this.getRecommends()
    }

    // 获取推荐列表
    async getRecommends() {
        let result = await get(`/shoppingFlow/getRecommendList.do?sn=${this.state.orderNo}&recType=orderDetail`);
        // let result = await get(`/shoppingFlow/getRecommendList.do?sn=001823614352870365&recType=orderDetail`);

        this.setState({
            recommends: result.item || []
        })
    }


    copy(str) {
        Clipboard.setString(str);
        toast('复制成功');
    }

    closeFlag() {
        this.setState({
            isShow: false
        })
    }

    _onChangeAddress(address) {
        // WebCat历史订单
        if (this.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        if (!this.state.addressExpired && this.state.order.isEditOrderAddr) {
            this.selectAddress(address);
        }
    }

    selectAddress(address) {
        this.props.navigation.navigate('AddressListPage', {
            selected: address && address.id || this.state.address && this.state.address.id,
            notDefault: true,
            callback: (address) => {
                if (!address) return;
                if (!address.cardNo && this.state.order.isExBond && this.state.order.bondedPayerSwitchOnYn == 'N') {
                    this.refs.idsModal.open(address);
                } else if (this.state.hasGoods) {
                    this.saveOrder(address);
                }
            }
        });
    }

    __close() {
        // this.setState({
        //     'address': address,
        // })
    }

    __edit(address) {
        this.props.navigation.navigate('AddressEditorPage', {
            addressId: address && address.id,
            needIds: true,
            callback: (address) => {
                if (!address) {
                    return;
                }
                this.saveOrder(address);
            }
        });
    }

    setCheckState(show, message, warning) {
        this.message = message;
        this.warning = warning;
        return {
            isShow: show
        }
    }

    async saveOrder(address) {
        // if (address.id == this.state.address.id) return;
        let checks = {};
        this.refs.loading.open();
        try {
            let checkJson = {};
            if (this.state.order.orderType == '0') {
                checkJson = await get(`/saleOrder/checkAddr.do?addressId=${address.id}&prodIds=${this.goodsIds.join(',')}`)
                if (checkJson.alertFlag == '0') {
                    checks = this.setCheckState(false, '', '0');
                } else {
                    if (checkJson.isCreateOrder == '0') {
                        this.refs.loading.close()
                        this.refs.alertModal.open(checkJson.msg);
                        return;
                    }
                }
            } else {
                checks = this.setCheckState(false, '', '0');
            }

            let data = await get(`/saleOrderApp/editSaleOrderAddr.do?orderNo=${this.state.orderNo}&addrId=${address.id}`)
            this.refs.loading.close()

            if (this.state.order.orderType == '0') {
                if (checkJson.alertFlag == '1') {
                    if (checkJson.type == '0') {
                        checks = this.setCheckState(true, checkJson.msg, '1');
                    } else {
                        checks = this.setCheckState(true, checkJson.msg, '2');
                        this.refs.alertModal.open(checkJson.msg);
                    }
                }
            }
            this.setState({
                'address': address,
                'cardNo': address.cardNo ? address.cardNo : '',
                ...checks
            })
            toast('修改成功');
        } catch (e) {
            this.refs.loading.close()
            toast(e.message);
        }
    }

    tick() {
        let time = this.state.order.editOrderEndTime;
        this.setState({
            addressTime: this.parseTimeHandler(time)
        })
        this.timeset = setInterval(() => {
            --time;
            if (time == 0) {
                this.setState({
                    addressExpired: true
                })
                clearInterval(this.timeset);
                return;
            }
            this.setState({
                addressTime: this.parseTimeHandler(time)
            })
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timeset);
    }


    parseTimeHandler(time) {
        let m = Math.floor(time / 60);
        let s = Math.floor(time % 60);
        return `${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}`
    }

    showTell(shopName, shopUserMobile) {
        this.setState({
            modalVisible: true,
            shopName,
            shopUserMobile
        });
    }

    aliPayErr(ret) {
        return /9000/.test(ret);
    }

    pay = async () => {
        // WebCat历史订单
        if (this.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        let data = {}
        let code = this.refs['payPlatform'].getCode();
        try {
            data = await post('/saleOrderApp/payOrder.do', { ///saleOrder/createOrder.do
                orderNo: this.state.orderNo,
                payPlatform: code
            });
        } catch (e) {
            return toast(e.message)
        }
        let uid = getHeader('uid')
        await setItem(`payPlatform${uid}`, data.payform);
        try {
            if ('weixin' == data.payform) {
                let isInstalled = await isWXAppInstalled();
                if (!isInstalled) {
                    toast('没有安装微信');
                    return;
                }
                let res = await wxPay(data.paydata);
            } else if ('ialipayFz' == data.payform) {
                let param = [];
                let payInfo = data.paydata || {};
                for (let k in payInfo) {
                    param.push(`${k}=${payInfo[k]}`);
                }
                let paramStr = param.join('&');
                let res = await aliPay.pay({ orderString: paramStr });
                // let isErr = this.aliPayErr(res);
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
            // if ((e + '').indexOf('WechatError: -2') == 0) {
            //     toast('已取消')
            // } else {
            //     toast("支付失败")
            // }
            toast('您已取消了支付')
            return;
        }
        this.props.navigation.navigate('SuccessPage', {
            orderNo: data.orderNo
        });
    }
    cancel = async () => {
        // WebCat历史订单
        if (this.isWeCatHistory) return toast('请解绑微信后从微信端操作')

        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要取消么？`,
                [{
                    text: '我再想想', onPress: () => resolve(false)
                }, {
                    text: '确定取消', onPress: () => resolve(true)
                }]
            )
        });
        if (!confirm) {
            return;
        }
        try {
            await post(`/saleOrderApp/cancelOrder.do?orderNo=${this.state.orderNo}`);
            toast('取消成功')
        } catch (e) {
            toast(e.message)
        }
        this.state.order.orderStatus = 99
        this.setState({
            order: this.state.order
        })
    }
}

const styles = StyleSheet.create({
    seckillTip: {
        justifyContent: 'center',
        width: px(750),
        minHeight: px(70),
        paddingLeft: px(30),
        paddingVertical: px(10),
        backgroundColor: '#fbf0f3'
    },
    seckillTipMessage: {
        fontSize: px(24),
        color: '#e86d78',
        includeFontPadding: false,
        textAlignVertical: 'center'
    },
    head: {
        backgroundColor: '#eb83b2',
        height: px(180),
        justifyContent: 'center',
        paddingLeft: px(70)
    },
    headTxt: {
        color: '#fff'
    },
    address: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: px(25),
        paddingBottom: px(25),
        backgroundColor: '#fff'
    },
    addressChange: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(200),
        height: px(54),
        borderWidth: 1,
        borderColor: '#b2b3b5',
        borderRadius: px(30)
    },
    addressIcon: {
        width: px(25),
        height: px(32),
        marginLeft: px(30),
        marginRight: px(20)
    },
    addressIconArrow: {
        width: px(15),
        height: px(26),
        marginRight: px(30),
        marginLeft: px(20)
    },
    addressHint: {
        color: '#222',
        fontSize: px(28),
        paddingTop: px(20),
        paddingBottom: px(20),
        textAlignVertical: 'center',
        flex: 1,
        includeFontPadding: false
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
        marginRight: px(30),
        paddingTop: px(6),
        fontSize: px(27),
        color: '#858385',
        includeFontPadding: false
    },
    sectionBox: {
        //paddingLeft: px(30),
        //paddingRight: px(30),
        paddingVertical: px(20),
        backgroundColor: '#fff',
    },
    section: {
        height: px(80),
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: px(30),
        marginBottom: px(1)
    },
    section2: {
        height: px(80),
        width: px(690),
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    section1: {
        height: px(45),
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: px(30),
        marginBottom: px(1)
    },
    sectionLabel: {
        fontSize: px(26),
        color: '#252426',
    },
    foot: {
        borderTopColor: '#efefef',
        borderTopWidth: px(1),
        height: px(100),
        width: px(750)
    },
    footer: {
        height: px(100),
        paddingHorizontal: px(30),
        backgroundColor: '#fff',
        width: px(750)
    },
    footer1: {
        flexDirection: 'column',
        //alignItems:'center',
        justifyContent: 'center'
    },
    footer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    returnList: {
        marginBottom: px(20),
        backgroundColor: '#fff',
    },
    itemTitle: {
        paddingVertical: px(20),
        paddingHorizontal: px(30),
    },
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: px(20),
        borderRadius: px(10),
        width: px(650),
    },
    closeWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: px(690)
    },
    modalClose: {
        // position: 'absolute',
        // top: px(-50),
        // right: px(-10),
        width: px(60),
        height: px(80),
        //marginRight: px(20)
    },
    modalLine: {
        color: '#666',
        padding: px(10),
        alignItems: 'center'
    },
    Btn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: px(52),
        borderWidth: px(1),
        marginLeft: px(14),
        width: px(150),
        borderRadius: px(6),
        overflow: 'hidden'
    },
    cBtn: {
        fontSize: px(24),
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    cBtn1: {
        color: '#252426',
    },
    cancelBtn: {
        borderColor: '#b2b3b5'
    },
    cBtn2: {
        color: '#fff'
    },
    payBtn: {
        backgroundColor: '#d0648f',
        borderColor: '#d0648f'
    },
    copyBtn: {
        marginLeft: px(10),
        marginTop: px(-5),
        borderWidth: px(1),
        borderColor: '#fff',
        borderRadius: px(2),
        paddingHorizontal: px(20),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: px(5)
    },
    rows: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    copyText: {
        color: '#fff',
        fontSize: px(20)
    },
    changeBtn: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingBottom: px(25),
        paddingRight: px(30),
        backgroundColor: '#fff'
    },
    btnFont: {
        fontSize: px(24),
        includeFontPadding: false
    },
    id_card: {
        height: px(122),
        backgroundColor: '#fff',
        paddingHorizontal: px(30)
    },
    id_card_number: {
        height: px(60),
        paddingHorizontal: 0,
        paddingVertical: px(15),
        lineHeight: px(60),
        fontSize: px(28),
        marginLeft: px(44)
    },
    id_card_txt: {
        fontSize: px(23),
        backgroundColor: '#fcf0f3',
        color: '#d0648f',
        padding: px(10),
        overflow: 'hidden',
        borderRadius: px(10)
    },
    notice: {
        backgroundColor: '#d0648f',
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
        paddingVertical: px(10)
    },
    content: {
        fontSize: px(24),
        color: '#fff',
        lineHeight: px(28)
    },
    security: {
        backgroundColor: '#ee5168',
        paddingTop: px(10),
        paddingBottom: px(10)
    },
    btnKefu: {
        width: deviceWidth
    }
});
const payerStyles = StyleSheet.create({
    c: {
        width: px(750),
        backgroundColor: '#fff',
        paddingLeft: px(24),
    },
    box: {
        paddingVertical: px(30),
        borderTopWidth: px(1),
        borderTopColor: '#efefef'
    },
    txt: {
        color: '#222',
        fontSize: px(26),
    }
})

