'use strict';

import React, { Component } from 'react';
import {
    Text, View,
    StyleSheet,
    Image,
    ImageBackground
} from 'react-native'
import { px } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import Background from '../../UI/lib/Background';

exports.GoodBonded = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        
        }
    }
    
    render() {
        return <Background style={[styles.container, base.line]} resizeMode='cover' name="icon-bg" >
            <Icon style={[{ width: px(750), height: px(877) }]}
                name="icon-specBg1" />
            <View style={[styles.comBox, {paddingHorizontal: px(40)}]}>
                <View style={[styles.item, base.inline_left]}>
                    <Icon name="icon-bond1" style={[{ width: px(80), height: px(82), marginRight: px(38) }]} />
                    <View style={{justifyContent:'space-between', height: px(75)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(32), color:'#333'}}>
                            海关监管，正品保障
                        </Text>
                        <Text allowFontScaling={false} style={{fontSize: px(26), color:'#999'}}>
                            海外直采商品，统一接受海关监管
                        </Text>
                    </View>
                </View>
                <View style={[styles.item, base.inline_left]}>
                    <Icon style={[{ width: px(80), height: px(82), marginRight: px(38) }]}
                        resizeMode="cover"
                        name="icon-bond2" />
                    <View style={{justifyContent:'space-between', height: px(75)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(32), color:'#333'}}>
                            正品保障，放心购买
                        </Text>
                        <Text allowFontScaling={false} style={{fontSize: px(26), color:'#999'}}>
                            进货渠道稳定，100%直采正品
                        </Text>
                    </View>
                </View>
                <View style={[styles.item, base.inline_left]}>
                    <Icon style={[{ width: px(80), height: px(82), marginRight: px(38) }]}
                        resizeMode="cover"
                        name="icon-bond3" />
                    <View style={{justifyContent:'space-between', height: px(75)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(32), color:'#333'}}>
                            无需换汇，货运到家
                        </Text>
                        <Text allowFontScaling={false} style={{fontSize: px(26), color:'#999'}}>
                            人民币便捷好货，极速送货上门
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[styles.comBox, styles.box1]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>购买说明</Text>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text style={styles.txt1}>出保税区商品视为进口，需向海关申报进口并缴纳相关税费。</Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text style={styles.txt1}>请保证身份信息真实有效，错误信息将导致海关退单；达令家会对您的信息保密。</Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text style={styles.txt1}>入保税区商品均在国家检验检疫局备案，法检类商品均已按国检要求进行检验检疫，保证商品质量。</Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text style={styles.txt1}>自2016年4月8日开始，根据国家出台的新政进行申报和缴费。</Text>
                </View>
                <View style={[styles.item1, {marginBottom: 0}]}>
                    <View style={styles.dian}></View>
                    <Text style={styles.txt1}>单次交易限值人民币2000元，个人年度交易限值为人民币20000元。</Text>
                </View>
            </View>
            <View style={[styles.comBox, {paddingTop: px(55), paddingBottom: px(60)}]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>关于包装</Text>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>国外商品（保税区、直邮商品）相当于您从国外当地直接购买，所以产品没有中文标签。</Text>
                </View>
                <View style={[styles.item1, {marginBottom: 0}]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>国外更注重环保和便捷性，而不是包装的奢华。大部分国际一线品牌、奢侈品的包装也很简单，所以保税区大部分产品无外盒，不塑封，开口处也没有封口贴。</Text>
                </View>
            </View>
            <View style={[styles.comBox, {paddingTop: px(55), paddingBottom: px(60)}]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>关于生产日期</Text>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        国外的商品一般不会单独列出保质期，只是在产品包装上标注生产日期或者有效期，也有只标注出厂批号的情况，有些品牌批号可以解读生产日期，有些则不能。例如：欧美规定化妆品保质期30个月以上就不会被强制要求标注生产日期及保质期，日本药事法规定：“通常保存条件下3年内会变质的产品”才必须标明保质期。如果没有标明，就说明这款产品在未开封条件下具有最少3年的保质期。在此不一一列举。所以包装上只有出厂批号，各个企业都是用自己的批号代替，每个企业批号格式不同。
                    </Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        商品开始使用后，可参考商品上的标志，6M代表6个月内用完，12M代表12个月内用完。
                    </Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        韩国产品一般会标注两个韩文：生产日期会标有韩文的제조（生产日期），以及默认不标的都是生产日期。截止日期后面会标有韩文的까지（截至）或者기한（期限）。
                    </Text>
                </View>
                <View style={[styles.item1, {marginBottom: 0}]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        有些喷印的日期，在运输过程中因为摩擦碰撞很容易被碰掉，属于正常现象。
                    </Text>
                </View>
            </View>
        </Background>
    }
}


exports.GoodOverseas = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        
        }
    }
    
    render() {
        return <Background style={[styles.container, base.line]} resizeMode='cover' name="icon-bg">
            <Icon style={[{ width: px(750), height: px(877) }]}
                name="icon-specBg" />
            <View style={[styles.comBox, {paddingHorizontal: px(40)}]}>
                <View style={[styles.item, base.inline_left]}>
                    <Icon name="icon-bond1" style={[{ width: px(80), height: px(82), marginRight: px(38) }]} />
                    <View style={{justifyContent:'space-between', height: px(75)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(32), color:'#333'}}>
                            海关监管，正品保障
                        </Text>
                        <Text allowFontScaling={false} style={{fontSize: px(26), color:'#999'}}>
                            海外直采商品，统一接受海关监管
                        </Text>
                    </View>
                </View>
                <View style={[styles.item, base.inline_left]}>
                    <Icon style={[{ width: px(80), height: px(82), marginRight: px(38) }]}
                        resizeMode="cover"
                        name="icon-bond2"/>
                    <View style={{justifyContent:'space-between', height: px(75)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(32), color:'#333'}}>
                            正品保障，放心购买
                        </Text>
                        <Text allowFontScaling={false} style={{fontSize: px(26), color:'#999'}}>
                            进货渠道稳定，100%直采正品
                        </Text>
                    </View>
                </View>
                <View style={[styles.item, base.inline_left]}>
                    <Icon style={[{ width: px(80), height: px(82), marginRight: px(38) }]}
                        resizeMode="cover"
                        name="icon-bond3" />
                    <View style={{justifyContent:'space-between', height: px(75)}}>
                        <Text allowFontScaling={false} style={{fontSize: px(32), color:'#333'}}>
                            无需换汇，货运到家
                        </Text>
                        <Text allowFontScaling={false} style={{fontSize: px(26), color:'#999'}}>
                            人民币便捷好货，极速送货上门
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[styles.comBox, {paddingTop: px(55), paddingBottom: px(60)}]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>购物流程</Text>
                <View style={[{paddingHorizontal: px(40), flexDirection: 'row'}]}>
                    <Icon name="icon-bond4" style={[{ width: px(81), height: px(831), marginRight: px(38) }]} />
                    <View style={{flex: 1}}>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>用户下单支付</Text>
                        </View>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>结算时入境申报</Text>
                            <Text allowFontScaling={false} style={styles.txt3}>
                                提供真实的收货人姓名、身份证号及有效地址(结算后无法修改)
                            </Text>
                        </View>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>海外订单出库</Text>
                            <Text allowFontScaling={false} style={styles.txt3}>
                                约1-3个工作日
                            </Text>
                        </View>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>海外订单配送</Text>
                            <Text allowFontScaling={false} style={styles.txt3}>
                                约3个工作日
                            </Text>
                        </View>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>海关监管清关放行</Text>
                            <Text allowFontScaling={false} style={styles.txt3}>
                                约3个工作日
                            </Text>
                        </View>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>国内物流配送</Text>
                            <Text allowFontScaling={false} style={styles.txt3}>
                                约3个工作日
                            </Text>
                        </View>
                        <View style={styles.box2}>
                            <Text allowFontScaling={false} style={styles.txt2}>商品送达用户签收</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={[styles.comBox, {paddingTop: px(55), paddingBottom: px(60)}]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>购物问答</Text>
                <View style={{flex: 1}}>
                    <View style={[styles.item2]}>
                        <Text allowFontScaling={false} style={[styles.txt4, {marginRight: px(8)}]}>Q</Text>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={[styles.txt4, {marginBottom:px(20), flex: 1}]}>海外直邮商品如何确保是原装正品?</Text>
                            <Text allowFontScaling={false} style={[styles.txt1, {flex: 1}]}>达令家海外直邮商品符合海外质量标准。销售方承诺正规渠道、原装正品。</Text>
                        </View>
                    </View>
                    <View style={[styles.item2]}>
                        <Text allowFontScaling={false} style={[styles.txt4, {marginRight: px(8)}]}>Q</Text>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={[styles.txt4, {marginBottom:px(20), flex: 1}]}>海外直邮为什么要提供身份证?</Text>
                            <Text allowFontScaling={false} style={[styles.txt1, {flex: 1}]}>根据中国海关要求，入境商品需提供真实的收货人姓名、身份证信息以配合进行入境申报。请您放心，我们将严格遵守信息保密原则。</Text>
                        </View>
                    </View>
                    <View style={[styles.item2]}>
                        <Text allowFontScaling={false} style={[styles.txt4, {marginRight: px(8)}]}>Q</Text>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={[styles.txt4, {marginBottom:px(20), flex: 1}]}>海外直邮商品对关税有什么特殊说明?</Text>
                            <Text allowFontScaling={false} style={[styles.txt1, {flex: 1}]}>购买海外商品需依法向中国海关申报及纳税。</Text>
                        </View>
                    </View>
                    <View style={[styles.item2]}>
                        <Text allowFontScaling={false} style={[styles.txt4, {marginRight: px(8)}]}>Q</Text>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={[styles.txt4, {marginBottom:px(20), flex: 1}]}>海外直邮商品为什么不提供发票?</Text>
                            <Text allowFontScaling={false} style={[styles.txt1, {flex: 1}]}>因为保税区商品或海外发货属于境外购买行为，因此我们无法为您开具发票，请您知晓并谅解。</Text>
                        </View>
                    </View>
                    <View style={[styles.item2]}>
                        <Text allowFontScaling={false} style={[styles.txt4, {marginRight: px(8)}]}>Q</Text>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={[styles.txt4, {marginBottom:px(20), flex: 1}]}>订单提交后能否取消订单或者修改信息?</Text>
                            <Text allowFontScaling={false} style={[styles.txt1, {flex: 1}]}>请您在下单时务必确认好收件人地址、电话等关键信息，下单支付后，订单已提交至海关申报及纳税，您将不能修改订单信息（收货地址、电话等），也不能取消订单，请知晓并谅解。</Text>
                        </View>
                    </View>
                    <View style={[styles.item2]}>
                        <Text allowFontScaling={false} style={[styles.txt4, {marginRight: px(8)}]}>Q</Text>
                        <View style={{flex: 1}}>
                            <Text allowFontScaling={false} style={[styles.txt4, {marginBottom:px(20), flex: 1}]}>海外直邮商品出现售后问题怎么办?</Text>
                            <Text allowFontScaling={false} style={[styles.txt1, {flex: 1}]}>您收到的海外商品若有售后问题，如符合达令家的退换规则，达令家客服与第三方商家协商一致后，可退货到达令家指定的境内地址。</Text>
                        </View>
                    </View>
                </View>
                <Text allowFontScaling={false} style={[styles.titleTxt, {marginTop: px(80)}]}>说明</Text>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>因商家会在没有任何通知的情况下更改产品包装、产地或者一些附件。达令家第三方商家不能确保客户收到的货物与APP图片、产地、附件说明完全一致。只能确保商品品质并与当时市场同样主流新品一致。若达令家第三方没有及时更新，请您谅解！</Text>
                </View>
            </View>
            <View style={[styles.comBox, {paddingTop: px(55), paddingBottom: px(60)}]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>关于包装</Text>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>国外商品（保税区、直邮商品）相当于您从国外当地直接购买，所以产品没有中文标签。</Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>国外更注重环保和便捷性，而不是包装的奢华。大部分国际一线品牌、奢侈品的包装也很简单，所以保税区大部分产品无外盒，不塑封，开口处也没有封口贴。</Text>
                </View>
            </View>
            <View style={[styles.comBox, {paddingTop: px(55), paddingBottom: px(60)}]}>
                <Text allowFontScaling={false} style={styles.titleTxt}>关于生产日期</Text>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        国外的商品一般不会单独列出保质期，只是在产品包装上标注生产日期或者有效期，也有只标注出厂批号的情况，有些品牌批号可以解读生产日期，有些则不能。例如：欧美规定化妆品保质期30个月以上就不会被强制要求标注生产日期及保质期，日本药事法规定：“通常保存条件下3年内会变质的产品”才必须标明保质期。如果没有标明，就说明这款产品在未开封条件下具有最少3年的保质期。在此不一一列举。所以包装上只有出厂批号，各个企业都是用自己的批号代替，每个企业批号格式不同。
                    </Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        商品开始使用后，可参考商品上的标志，6M代表6个月内用完，12M代表12个月内用完。
                    </Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        韩国产品一般会标注两个韩文：生产日期会标有韩文的제조（生产日期），以及默认不标的都是生产日期。截止日期后面会标有韩文的까지（截至）或者기한（期限）。
                    </Text>
                </View>
                <View style={[styles.item1]}>
                    <View style={styles.dian}></View>
                    <Text allowFontScaling={false} style={styles.txt1}>
                        有些喷印的日期，在运输过程中因为摩擦碰撞很容易被碰掉，属于正常现象。
                    </Text>
                </View>
            </View>
        </Background>
    }
}
const styles = StyleSheet.create({
    container: {
        width: px(750)
    },
    comBox: {
        width: px(690),
        backgroundColor: "#fff",
        paddingHorizontal: px(30),
        marginHorizontal: px(30),
        borderRadius: px(10),
        overflow: 'hidden',
        marginBottom: px(30)
    },
    item: {
        height: px(193),
        borderBottomColor: '#e4e4e4',
        borderBottomWidth: px(1),
        paddingLeft: px(37),
    },
    item2: {
        flexDirection: 'row',
        marginBottom: px(30),
        width: px(630)
    },
    box1: {
        paddingVertical: px(60)
    },
    box2: {
        height: px(125),
        paddingTop: px(20)
    },
    item1: {
        width: px(630),
        flexDirection:'row',
        marginBottom: px(9)
        //alignItems:'center'
    },
    txt1: {
        flex:1,
        color:'#666',
        fontSize: px(28),
        lineHeight: px(44),
        textAlign: 'justify'
    },
    txt3: {
        flex:1,
        color:'#666',
        fontSize: px(26),
        lineHeight: px(38)
    },
    txt2: {
        fontSize: px(32),
        color: '#333'
    },
    txt4: {
        fontSize: px(28),
        color: '#333'
    },
    titleTxt: {
        fontSize: px(36),
        color: '#333',
        marginBottom: px(40)
    },
    dian: {
        width: px(8),
        height: px(8),
        borderRadius: px(4),
        overflow: 'hidden',
        backgroundColor: '#999',
        marginRight: px(25),
        marginTop: px(22)
    },
    box_: {
        width: px(690)
    }
})