
'use strict';

import React from "react";

import {
    Image,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ImageBackground,
    Platform
} from "react-native";
import { px, isIphoneX, deviceWidth } from "../../utils/Ratio";
import base from '../../styles/Base'
import util_cools from '../../utils/tools'
import Icon from '../../UI/lib/Icon'
import { PromptController } from './Good'

exports.GoodBasic = class extends React.Component {
    showPopover_ = (txt, re) => () => {
        this.props.showPopover_ && this.props.showPopover_(txt, this.refs[re])
    }
    setLay(e) {
        this.props.setLay && this.props.setLay(e)
    }
    
    send() {
        if (this.props.goods.flag == '1') {
            return;
        }
        this.props.navigation.navigate('DistributionPage', {
            id: this.props.goods.id,
            call: (province, city, district, address) => {
                this.props.getArea(this.props.goods.id)
                //this.props.getActivities(this.props.goods.id, city)
            }
        });
    }
    
    render() {
        const {goods, area, activity} = this.props
        let arr1 = this.props.area.province + '-' + this.props.area.city + '-' + this.props.area.area
        let arr = this.props.area.province + this.props.area.city + this.props.area.area + this.props.area.address
        if (this.props.area.deliveryAreaStatus == 0) {
            if (arr.length > 14) {
                arr = arr.substr(0, 14) + '...'
            }
            if (arr1.length > 15) {
                arr1 = arr1.substr(0, 15) + '...'
            }
        } else {
            if (arr.length > 18) {
                arr = arr.substr(0, 18) + '...'
            }
            if (arr1.length > 18) {
                arr1 = arr1.substr(0, 18) + '...'
            }
        }
        let salePrice = area.salePrice ? area.salePrice : goods.salePrice

        const isMoreProperty = this.props.moreProperty && this.props.moreProperty.length > 0

        return <View onLayout={(e) => this.setLay(e)}>
            <View style={ goodStyles.container }>
                <View style={goodStyles.goodImage}>
                    <Image style={goodStyles.cover}
                        source={{
                            uri: goods.image
                        }}
                        onLoad={() => this.props.onLoadEnd(true, -1)}
                        resizeMode="cover"
                        resizeMethod="resize">
                    </Image>
                </View>
                <View style={goodStyles.labels}>
                    {goods.labelList.map((item) =>
                        <Image key={item.labelId} style={[goodStyles.labelImg, { width: px(item.width), height: px(item.height) }]}
                            resizeMode="cover"
                            resizeMethod="resize"
                            source={{
                                uri: item.labelLogo
                            }} />)}
                </View>
                <View style={ goodStyles.remindBox }>
                    <PromptController area={area} goods={goods} />
                </View>
            </View>
            <View style={goodStyles.GoodInfo}>
                <View style={goodStyles.GoodBox}>
                    <View style={goodStyles.GoodBoxBody}>
                        <View style={goodStyles.basic}>
                            <View style={goodStyles.goodBasic}>
                                <Text allowFontScaling={false} style={goodStyles.goodShowName}>
                                    {goods.goodsShowDesc + " "}
                                </Text>
                                <View style={goodStyles.goodsWrap}>
                                    {goods.isInBond == 1 &&
                                    <View style={[goodStyles.flag, goodStyles.flag1, base.line]}>
                                        <Text allowFontScaling={false} style={[goodStyles.flagBaoShui]}> 保税 </Text>
                                    </View>
                                    }
                                    {goods.isForeignSupply == 2 &&
                                    <View style={[goodStyles.flag, goodStyles.flag2, base.line]}>
                                        <Text allowFontScaling={false} style={[goodStyles.flagZhiYou]}> 直邮 </Text>
                                    </View>
                                    }
                                    <Text onLongPress={this.showPopover_(`${goods.goodsShowName}+${goods.goodsShowDesc}`, 'button1')} ref='button1' allowFontScaling={false} style={goodStyles.goodsWrapTxt}>
                                        {goods.isInBond == 1 && <Text style={goodStyles.flagLen}>flagLen</Text>}
                                        {goods.isForeignSupply == 2 && <Text style={goodStyles.flagLen}>flagLen</Text>}
                                        {goods.goodsShowName}
                                    </Text>
                                </View>
                                <View style={goodStyles.price}>
                                    {
                                        util_cools.parsePrice(salePrice) % 1 ?
                                            <Text allowFontScaling={false}
                                                style={goodStyles.salePrice}>
                                                ￥<Text allowFontScaling={false}
                                                    style={goodStyles.salePrice_}>
                                                    {util_cools.spliceNum(util_cools.parsePrice(salePrice))[0]}
                                                </Text>.{util_cools.spliceNum(util_cools.parsePrice(salePrice))[1] + " "}
                                            </Text> : <Text allowFontScaling={false}
                                                style={goodStyles.salePrice}>
                                                ￥<Text allowFontScaling={false}
                                                    style={goodStyles.salePrice_}>
                                                    {util_cools.parsePrice(salePrice) + " "}
                                                </Text>
                                            </Text>}
                                    <Text allowFontScaling={false} style={goodStyles.marketPrice}>
                                        ￥{util_cools.parsePrice(goods.marketPrice)}
                                    </Text>
                        
                                </View>
                        
                                {
                                    (goods.isInBond == 1 || goods.isForeignSupply == 2) &&
                                    <View style={[base.inline_between, goodStyles.baoshui]}>
                                        <View style={base.inline}>
                                            <Text allowFontScaling={false} style={goodStyles.itemLabel}>
                                                税费
                                            </Text>
                                            <Text allowFontScaling={false} style={{ fontSize: px(24), color: '#333', marginLeft: px(-4) }}>
                                                ￥{util_cools.parsePrice(goods.taxation)}
                                            </Text>
                                            <TouchableOpacity activeOpacity={0.8} onPress={() => this.props.openExplain('shui', '税费')}>
                                                <Image source={{ uri: require('../../images/icon-wenhao1') }}
                                                    style={{ width: px(20), height: px(20), marginLeft: px(5) }} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={base.inline}>
                                            <Text allowFontScaling={false} onPress={() => this.props.openExplain('introduct', '海购政策')} style={goodStyles.gou}>
                                                海购政策
                                            </Text>
                                            <TouchableOpacity activeOpacity={0.8}>
                                                <Icon name="icon-arrow" style={{ width: px(12), height: px(22) }} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            {
                (activity.coupons.length > 0 || goods.stunnerCurrency > 0 || activity.bonus.length > 0) &&
                <View style={[goodStyles.comBox, {padding: px(20)}]}>
                    {
                        activity.coupons.length > 0 &&
                        <TouchableWithoutFeedback onPress={() => this.props.openExplain('suningCoupon', '代金券')}>
                            <View style={[base.inline_left, {paddingVertical: px(20), paddingLeft: px(10)}]}>
                                <Text allowFontScaling={false} style={[goodStyles.itemLabel]}>
                                    优惠
                                </Text>
                                <View style={[base.inline_left, {flex: 1, marginRight: px(100), marginLeft: px(1)}]}>
                                    <View style={[goodStyles.goldView, base.text_center, { marginLeft: px(0), width: px(70) }, base.borderColor]}>
                                        <Text style={[goodStyles.goldTxt, base.color]} allowFontScaling={false}>代金券</Text>
                                    </View>
                                    <Text numberOfLines={1} style={[goodStyles.itemNormalTxt, { marginLeft: px(7), flex: 1 }]} allowFontScaling={false}>
                                        {activity.coupons || ''}
                                    </Text>
                                </View>
                                <Icon name="icon-arrow" style={{ width: px(12), height: px(22) }} />
                            </View>
                        </TouchableWithoutFeedback>
                    }
                    {
                        goods.stunnerCurrency > 0 ?
                            <View style={[base.inline_left, {marginVertical: px(20), paddingLeft: px(10)}]}>
                                <Text allowFontScaling={false} style={[goodStyles.itemLabel, {color: !activity || !activity.coupons || activity.coupons == '' ? '#999' : '#fff'}]}>
                                    优惠
                                </Text>
                                <View style={[base.inline_left]}>
                                    <View style={[goodStyles.goldView, base.text_center, { marginLeft: px(1)}, base.borderColor]}>
                                        <Text style={[goodStyles.goldTxt, base.color]} allowFontScaling={false}>金币</Text>
                                    </View>
                                    <Text style={[goodStyles.itemNormalTxt, { marginLeft: px(7) }]} allowFontScaling={false}>可用￥{util_cools.parsePrice(goods.stunnerCurrency)}金币</Text>
                                </View>
                            </View> : null
                    }
                    {
                        activity.bonus.length > 0 &&
                        <TouchableWithoutFeedback onPress={() => this.props.openExplain('activity', '促销')}>
                            <View style={[base.inline_left, {marginVertical: px(20)}]}>
                                <Text allowFontScaling={false} style={[goodStyles.itemLabel]}>
                                    促销
                                </Text>
                                <View style={[base.inline_left, {flex: 1, marginRight: px(60)}]}>
                                    <View style={[goodStyles.goldView, base.text_center, { marginLeft: px(1), borderColor: '#ffa914'}]}>
                                        <Text style={[goodStyles.goldTxt, {color: '#ffa914'}]} allowFontScaling={false}>满减</Text>
                                    </View>
                                    <Text numberOfLines={1} style={[goodStyles.itemNormalTxt, { marginLeft: px(7), flex: 1 }]} allowFontScaling={false}>
                                        {activity.bonus}
                                    </Text>
                                </View>
                                <Icon name="icon-arrow" style={{ width: px(12), height: px(22) }} />
                            </View>
                        </TouchableWithoutFeedback>
                    }
                </View>
            } 
            {/*{
                goods.stunnerCurrency > 0 && <View style={[ base.inline_left, goodStyles.comBox, base.borderRadius10]}>
                    <Text allowFontScaling={false} style={goodStyles.itemLabel}>
                        优惠
                    </Text>
                    <View style={[goodStyles.goldView, base.text_center, { marginLeft: px(1) }, base.borderColor]}>
                        <Text style={[goodStyles.goldTxt, base.color]} allowFontScaling={false}>金币</Text>
                    </View>
                    <Text style={[goodStyles.itemNormalTxt, { marginLeft: px(7) }]} allowFontScaling={false}>可用￥{util_cools.parsePrice(goods.stunnerCurrency)}金币</Text>
                </View>
            }*/}
            {
                goods.treeInfo && goods.flag == '0' &&
                <TouchableWithoutFeedback activeOpacity={0.9} onPress={() => this.props.cartShow && this.props.cartShow('spu')}>
                    <View style={[goodStyles.Specifications, goodStyles.goodItem, goodStyles.comBox, base.inline_between]}>
                        <View style={goodStyles.SpecificationsLeft}>
                            <Text allowFontScaling={false} style={goodStyles.itemLabel}>已选</Text>
                            <Text allowFontScaling={false} style={goodStyles.itemNormalTxt}>
                                {this.props.current.join('，').length > 12 ? this.props.current.join('，').substr(0, 14) + '...' : this.props.current.join('，')}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{ color: '#666', fontSize: px(24), marginRight: px(10) }}>更多规格</Text>
                            <Icon name="icon-arrow" style={{ width: px(12), height: px(22) }} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            }
            <View style={goodStyles.comBox}>
                <TouchableWithoutFeedback onPress={() => this.send()}>
                    <View style={[base.inline_between, goodStyles.goodItem_]}>
                        <View style={base.inline}>
                            <Text allowFontScaling={false} style={goodStyles.itemLabel}>
                                送至
                            </Text>
                            {
                                goods.flag && goods.flag == '0' && this.props.area.address != '' &&
                                <Text style={[goodStyles.itemNormalTxt, { color: this.props.area.deliveryAreaStatus == 0 ? '#999' : '#333' }]} allowFontScaling={false}>
                                    {arr}
                                </Text>
                            }
                            {
                                goods.flag && goods.flag == '0' && this.props.area.address == '' &&
                                <Text style={[goodStyles.itemNormalTxt, { color: this.props.area.deliveryAreaStatus == 0 ? '#999' : '#333' }]} allowFontScaling={false}>
                                    {arr1}
                                </Text>
                            }
                            {
                                goods.flag && goods.flag == '1' &&
                                <Text style={[goodStyles.itemNormalTxt, { color: this.props.area.deliveryAreaStatus == 0 ? '#999' : '#333' }]} allowFontScaling={false}>
                                    {`${this.props.area.province}${this.props.area.city}${this.props.area.area}`}
                                </Text>
                            }
                            {
                                goods.flag && goods.flag == '0' && area.deliveryAreaStatus == 0 && <Icon
                                    style={{ width: px(89), height: px(28), marginLeft: px(10) }}
                                    name="icon-nosend" />
                            }
                        </View>
                        {
                            goods.flag && goods.flag == '0' &&
                            <Icon name="icon-arrow" style={{ width: px(12), height: px(22) }} />
                        }
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.props.openExplain('freight', '运费')}>
                    <View style={[base.inline_left, goodStyles.goodItem_, goodStyles.feright]}>
                        <Text allowFontScaling={false} style={goodStyles.itemLabel}>运费</Text>
                        <View style={base.inline_left}>
                            <Text allowFontScaling={false} style={[{ fontSize: px(28), color: goods.shipFeeDetail.shipFeeType == 3 ? '#d0648f' : '#333' }]}>
                                {goods.shipFeeDetail.goodShipFee || ''}
                            </Text>
                            <Image source={{ uri: require('../../images/icon-wenhao1') }}
                                style={{ width: px(20), height: px(20), marginLeft: px(10) }} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <View style={[goodStyles.goodItem1_, base.inline_left]}>
                    <Text allowFontScaling={false} style={goodStyles.itemLabel}>库存</Text>
                    <Text allowFontScaling={false} style={[goodStyles.itemLabel, { color: '#333' }]}>{this.props.area.goodsStockMsg || ''}</Text>
                </View>
            </View>
            <TouchableWithoutFeedback onPress={() => this.props.openPromise()}>
                <View style={[goodStyles.promise, goodStyles.comBox]}>
                    <View style={[base.inline_between, goodStyles.promiseTop]}>
                        <Text allowFontScaling={false} style={goodStyles.itemLabel}>
                            达令家品牌服务承诺
                        </Text>
                        <Icon name="icon-arrow" style={{ width: px(12), height: px(22) }} />
                    </View>
                    <View style={[base.inline, { flex: 1, paddingHorizontal: px(68) }]}>
                        {this.getPromiseComponment('正品保障', "icon-new-promise1")}
                        {
                            goods.canReturn == 1 ?
                                this.getPromiseComponment('7天无理由退货', "icon-new-promise3")
                                :
                                this.getPromiseComponment('不支持7天退换', "icon-new-promise5")
                        }
                        {goods.isForeignSupply == 2 && this.getPromiseComponment('海外直邮', "icon-new-promise6")}
                        {goods.isInBond == 1 && this.getPromiseComponment('保税区发货', "icon-new-promise7")}
                        {goods.skuType == 'yiguo' && this.getPromiseComponment('易果直供', "icon-new-promise8")}
                        {goods.skuType != 'yiguo' && goods.isInBond != 1 && goods.isForeignSupply != 2 && this.getPromiseComponment('极速发货', "icon-new-promise4")}
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View style={[goodStyles.comBox, isMoreProperty && { marginBottom: px(20) }]}>
                {isMoreProperty &&
                    <View 
                        style={ goodStyles.productSpecificationBox }
                    >
                        <Text 
                            allowFontScaling={false}
                            style={ goodStyles.productSpecification }
                        >产品规格</Text>
                        {this.props.moreProperty.map((prop, index) =>
                            <View key={index} style={ goodStyles.detailProp }>
                                <Text allowFontScaling={false} style={[goodStyles.detailPropKey, { color: '#666' }]}>{prop.key}</Text>
                                <Text allowFontScaling={false} style={goodStyles.detailPropValue}>{prop.value}</Text>
                            </View>
                        )}
                    </View>
                }
            </View>
        </View>
    }
    
    /**
     *一件包邮:运费上线之后去掉
     */
    getPromiseComponment(txt, icon) {
        /*const list = [
            {txt: '正品保障', icon: "icon-promise1"},
            {txt: '7天无理由退货', icon: 'icon-promise3'},
            {txt: '海外直邮', icon: "icon-promise6"},
            {txt: '保税区发货', icon: 'icon-promise7'},
            {txt: '易果直供', icon: "icon-promise8"},
            {txt: '极速发货', icon: 'icon-promise4'},
            {txt: '不支持7天退换', icon: 'icon-promise5'}
        ]*/
        return <View style={goodStyles.promiseBottom}>
            <Icon
                style={{ width: px(58), height: px(58) }}
                name={icon} />
            <Text allowFontScaling={false} style={{ fontSize: px(24), color: '#333', marginTop: px(8) }}>
                {txt}
            </Text>
        </View>
    }
}


const goodStyles = StyleSheet.create({
    container: {
        position: 'relative'
    },
    remindBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    comBox: {
        // width: px(710),
        marginTop: px(20),
        // marginH: px(20),
        // marginBottom: px(0),
        backgroundColor: '#fff',
    },
    goodImage: {
        width: px(750),
        height: px(750)
    },
    cover: {
        width: px(750),
        height: px(750)
    },
    preheat: {
        position: 'absolute',
        bottom: px(50),
        left: 0,
        width: px(750),
        zIndex: 9,
        alignItems: 'center'
    },
    preheatBg: {
        width: px(404),
        height: px(60)
    },
    preheatTxt: {
        padding: 0,
        fontSize: px(28),
        color: '#ffffff',
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: 'transparent'
    },
    preheatNew: {
        width: px(710),
        alignItems: 'center'
    },
    preheatBgNew: {
        width: px(710),
        height: px(80),
        flexDirection: 'row'
    },
    preheatTxtNew: {
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: 'transparent'
    },
    preheatTimeNew: {
        width: px(40),
        height: px(40),
        backgroundColor: '#ffffff',
        borderRadius: px(4),
        overflow: 'hidden'
    },
    labels: {
        position: 'absolute',
        top: px(5),
        left: px(10),
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    labelImg: {
        width: px(80),
        height: px(80),
        marginRight: px(8)
    },
    basic: {
        flex: 1
    },
    goodBasic: {
        paddingTop: px(15),
        backgroundColor: "#fff",
        // borderBottomLeftRadius: px(10),
        // borderBottomRightRadius: px(10),
        //paddingBottom: px(40)
    },
    goodShowName: {
        fontSize: px(32),
        color: '#222',
        fontWeight: 'bold',
        paddingHorizontal: px(30),
        lineHeight: px(40),
        paddingTop: px(20)
    },
    goodsWrap: {
        flexDirection: "row",
        paddingHorizontal: px(30),
        marginTop: px(14)
    },
    goodsWrapTxt: {
        flex: 1,
        fontSize: px(28),
        //lineHeight: px(50),
        color: '#666',
        fontWeight: 'normal',
        textAlignVertical: 'center',
        lineHeight: px(40)
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
    flag: {
        width: px(45),
        height: px(28),
        position: "absolute",
        left: px(30),
        top: Platform.OS === 'ios' ? 3 : px(6),
        zIndex: 100,
        borderRadius: px(4),
    },
    flag1: {
        backgroundColor: '#56beec'
    },
    flag2: {
        backgroundColor: '#6cd972'
    },
    flagLen: {
        fontSize: px(16),
        includeFontPadding: false,
        textAlign: 'justify',
        color: '#fff',
        textAlignVertical: 'center'
    },
    price: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: px(26),
        marginBottom: px(28),
        paddingLeft: px(30)
    },
    salePrice: {
        color: '#222',
        fontSize: px(30),
        includeFontPadding: false,
        marginRight: px(18),
        fontWeight: '600'
    },
    salePrice_: {
        fontSize: px(60)
    },
    marketPrice: {
        fontSize: px(30),
        color: '#999',
        textDecorationLine: 'line-through',
        // marginBottom: px(2)
        lineHeight: px(50)
    },
    baoshui: {
        height: px(70),
        paddingHorizontal: px(30),
        backgroundColor: '#fbfbfb',
        borderBottomLeftRadius: px(10),
        borderBottomRightRadius: px(10),
    },
    gou: {
        color: '#666',
        fontSize: px(24),
        marginRight: px(15)
    },
    goodItem: {
        height: px(100),
        paddingHorizontal: px(30),
    },
    goodItem2: {
        height: px(171),
    },
    goodItem_: {
        height: px(100),
        backgroundColor: '#fff',
        paddingHorizontal: px(30),
    },
    feright: {
        height: 'auto',
        //alignItems: 'flex-start',
        paddingBottom: px(30)
    },
    goodItem1_: {
        height: px(71),
        backgroundColor: '#fbfbfb',
        paddingHorizontal: px(30),
    },
    itemLabel: {
        fontSize: px(24),
        color: '#999',
        marginRight: px(30)
    },
    itemNormalTxt: {
        fontSize: px(28),
        color: '#333',
        includeFontPadding: false
    },
    goldView: {
        height: px(26),
        borderWidth: px(1),
        width: px(50),
        borderRadius: px(3),
        overflow: 'hidden'
    },
    goldTxt: {
        fontSize: px(18)
    },
    Specifications: {
        height: px(100),
        backgroundColor: '#fff',
        marginTop: px(20),
        paddingHorizontal: px(30)
    },
    SpecificationsLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    promise: {
        height: px(235)
    },
    promiseTop: {
        height: px(100),
        paddingRight: px(30),
        marginLeft: px(30)
    },
    promiseBottom: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        // height: px(155),
        paddingTop: px(10),
        paddingBottom: px(40)
    },
    GoodInfo: {
        // marginTop: px(-40),
        position: "relative"
    },
    GoodBox: {

        
    },
    GoodBoxBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: px(90)
    },
    productSpecificationBox: {
        paddingBottom: px(40),
        paddingHorizontal: px(30)
    },
    productSpecification: {
        fontSize: px(24),
        color: '#999',
        paddingTop: px(40)
    },
    detailProp: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'row',
        paddingTop: px(40)
    },
    detailPropKey: {
        color: '#666',
        fontSize: px(28),
        width: px(160),
        lineHeight: px(40)
    },
    detailPropValue: {
        flex: 1,
        color: '#222',
        fontSize: px(28),
        lineHeight: px(40),
        paddingLeft: px(12)
    }
});
