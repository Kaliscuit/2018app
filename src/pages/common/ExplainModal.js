/**
 * Created by qiaopanpan on 2017/9/1.
 * 解释型弹窗
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback, TextInput,
    FlatList, Dimensions, Animated,
    ScrollView, SectionList
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import util_cools from '../../utils/tools'
import List from './List'
import request, { domain } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import {SuningCouponItem, USuningCouponItem, Empty} from './SuningCoupon';
import CartList from '../../services/Cart';
import Loading from '../../animation/Loading';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default class Explain extends React.Component {
    height = px(deviceHeight)
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            boxY: new Animated.Value(this.height),
            width: 0,
            height: 0
        };
        
    }
    
    renderFreight(data, explain) {
        return <View style={[explainStyles.contain]}>
            <Text allowFontScaling={false} style={explainStyles.labelTxt}>
                {
                    explain.type == 'freight' && data.shipFeeDetail.shipFeeTitle
                }
                {
                    explain.type == 'shui' && `税费￥${util_cools.parsePrice(data.taxation)}`
                }
            </Text>
            <Text allowFontScaling={false} style={explainStyles.content}>
                {explain.type == 'freight' && data.shipFeeDetail.shipFeeExplain}
                {
                    explain.type == 'shui' &&
                    `根据海关规则，本商品由海关收取综合税费，税率为${(data.taxRate * 100).toFixed(2)}%`
                }
            </Text>
        </View>
    }
    
    renderActivity(data, explain) {
        return <View style={[explainStyles.contain, {flexDirection: 'row', justifyContent: 'center'}]}>
            <View style={[explainStyles.icon, base.line, {marginTop: 1}]}>
                <Text style={explainStyles.iconTxt} allowFontScaling={false}>满减</Text>
            </View>
            <Text style={[explainStyles.content1, {flex: 1}]} allowFontScaling={false}>
                {data.activity.bonus}
            </Text>
        </View>
    }
    
    renderIntroduct(data, explain) {
        return <ScrollView style={explainStyles.inctroduct}>
            <View style={{marginBottom: px(20)}}>
                {data.introduct.map((item, index) =>
                    <Text allowFontScaling={false} style={{ fontSize: px(23), lineHeight: px(30), paddingBottom: px(10) }} key={index}>{item}</Text>
                )}
            </View>
        </ScrollView>
    }
    
    renderSuningCoupon(data, explain) {
        return <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={explainStyles.coupon}>
            <SuningList data={data}/>
        </ScrollView>
    }
    render() {
        const { data, explain} = this.props
        if (!data) return null;
        return <Modal
            style={explainStyles.view}
            visible={this.state.isShow}
            onShow={() => this.show()}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={explainStyles.bg} ></View></TouchableWithoutFeedback>
            <Animated.View style={[explainStyles.box, {
                transform: [
                    { translateY: this.state.boxY }
                ]
            }]}>
                <View style={[explainStyles.box_, {paddingBottom:isIphoneX() ? px(80) : px(0)}]}>
                    <View style={[explainStyles.title, base.inline_between]}>
                        <Text allowFontScaling={false} style={explainStyles.titleTxt}>
                            {explain.title}
                        </Text>
                        <TouchableWithoutFeedback onPress={() => this.cancel()}>
                            <View style={[explainStyles.titleClose, base.inline]}>
                                <Icon
                                    style={{ width: px(21), height: px(21) }}
                                    name="icon-promise-close"/>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    {(explain.type == 'freight' || explain.type == 'shui') && this.renderFreight(data, explain)}
                    {explain.type == 'introduct' && this.renderIntroduct(data, explain)}
                    {explain.type == 'suningCoupon' && this.renderSuningCoupon(data, explain)}
                    {explain.type == 'activity' && this.renderActivity(data, explain)}
                </View>
            </Animated.View>
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
                isShow: false,
            })
            //this.props.test()
        });
    }
    
    show() {
        this.setState({
            isShow: true
        })
        //this.state.boxY.setValue(px(400));
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 200
            }
        ).start();
    }
}

const explainStyles = StyleSheet.create({
    view: {
        flex: 1
    },
    bg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    box: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: px(750),
        borderTopLeftRadius: px(30),
        borderTopRightRadius: px(30),
        //height: px(400),
        overflow: 'hidden'
    },
    box_: {
        backgroundColor: '#fff',
        flex:1,
        //height: px(400),
    },
    title: {
        height: px(80),
        width: px(750),
        //paddingLeft: px(310)
    },
    titleTxt: {
        marginLeft: px(81),
        flex: 1,
        textAlign: 'center',
        fontSize: px(30),
        color: '#222'
    },
    titleClose: {
        width: px(81),
        height:px(80)
    },
    contain: {
        height: px(320),
        paddingHorizontal: px(50),
        paddingVertical: px(24),
        flex:1
    },
    labelTxt: {
        fontSize: px(32),
        color:'#222',
        includeFontPadding: false,
        marginBottom: px(18)
    },
    content: {
        fontSize: px(26),
        color:'#858385',
        //lineHeight: px(38),
        includeFontPadding: false,
    },
    content1: {
        fontSize: px(28),
        color:'#222',
        //lineHeight: px(38),
        includeFontPadding: false,
    },
    inctroduct: {
        width: px(750),
        padding: px(20),
        height: px(500),
        overflow: 'hidden'
    },
    icon: {
        width: px(52),
        height: px(28),
        borderWidth: px(1),
        borderColor: '#ffa914',
        borderRadius: px(3),
        overflow: 'hidden',
        marginRight: px(10)
    },
    iconTxt: {
        fontSize: px(18),
        color: '#ffa914'
    },
    coupon: {
        width: px(750),
        height: px(915),
        backgroundColor: '#f2f2f2'
    }
});

class SuningList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            isReTry: false
        }
        this.loading = false;
    }
    
    async componentDidMount() {
        await this.load()
    }
    async load() {
        try {
            this.refs.loading.open()
            this.loading = true;
            let data = this.props.data, section = []
            let res = await request.get(`/coupon/getCoupons.do?prodId=${data.id}&city=${data.area.city}&province=${data.area.province}&district=${data.area.area}`)
            section = [
                {key: 0, data: res.activities},
                {key: 1, data: res.receivedCoupons}
            ]
            this.setState({
                list: section
            })
            this.refs.loading.close()
        } catch (e) {
            this.refs.loading.close()
            toast(e.message);
            this.setState({
                list:  [],
                isReTry: true
            })
        }
    }
    
    renderItem(info) {
        let section = info.section
        /*if (section.key == 0) {
            return <SuningCouponItem btType="get" list={info.item} area={this.props.data.area}/>
        }*/
        return <SuningCouponItem btType="get" isOwner={section.key == 1} list={info.item} area={this.props.data.area}/>
    }
    
    //组头部
    renderSectionHeader(info) {
        let section = info.section;
        return <View>
            {
                section.data && section.data.length > 0 ?
                    <Text
                        allowFontScaling={false}
                        style={couponStyles.title}
                    >
                        {section.key == 0 ? '可领取代金券' : '已领取代金券'}
                    </Text> : null
            }
        </View>
    }
    
    render() {
        const {list, isReTry} = this.state
        return <View>
            <SectionList
                style={{flex: 1}}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={() => null}
                renderSectionHeader={this.renderSectionHeader.bind(this)}
                renderItem={(info) => this.renderItem(info)
                
                }
                sections={list}
                ListEmptyComponent={<Empty reTry={isReTry} reRefresh={this.load.bind(this)}/>}
                keyExtractor={(item, index) => index}
            />
            <Loading ref='loading' />
        </View>
    }
}

const couponStyles = StyleSheet.create({
    title: {
        fontSize: px(26),
        color: '#222',
        marginTop: px(30),
        marginBottom: px(20),
        marginLeft: px(20)
    },
    secTitle: {
        marginTop: px(60)
    }
});

class CartCoupon extends React.Component {
    render() {
        let bestCoupon_list = CartList.data.bestCoupon_list,
            coupon_list = CartList.data.coupon_list,
            discount_amount = CartList.data.discount_amount
        return <View style={{paddingBottom: px(20)}}>
            {
                discount_amount > 0 &&
                <Text allowFontScaling={false} style={couponStyles.title}>
                    已抵扣代金券
                </Text>
            }
            {
                bestCoupon_list.map((item, index) =>
                    <SuningCouponItem key={index} btType="null" list={item} />
                )
            }
            
            <Text allowFontScaling={false} style={[couponStyles.title, couponStyles.secTitle]}>
                未达到最优使用条件代金券
            </Text>
            {
                coupon_list.map((item, index) =>
                    <USuningCouponItem key={index} btType="null" list={item} />
                )
            }
        </View>
    }
}

exports.ExplainCart = class extends React.Component {
    height = px(deviceHeight)
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            boxY: new Animated.Value(this.height)
        };
        
    }
    
    renderCartCoupon() {
        return <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={explainStyles.coupon}>
            <CartCoupon />
        </ScrollView>
    }
    
    render() {
        return <Modal
            style={explainStyles.view}
            visible={this.state.isShow}
            onShow={() => this.show()}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}>
            <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={explainStyles.bg} ></View></TouchableWithoutFeedback>
            <Animated.View style={[explainStyles.box, {
                transform: [
                    { translateY: this.state.boxY }
                ]
            }]}>
                <View style={[explainStyles.box_, {paddingBottom:isIphoneX() ? px(80) : px(0)}]}>
                    <View style={[explainStyles.title, base.inline_between, {backgroundColor: '#fff8f5'}]}>
                        <Text allowFontScaling={false} style={[explainStyles.titleTxt, {color: '#ed3f58'}]}>
                            {CartList.discountDesc}
                        </Text>
                        <TouchableWithoutFeedback onPress={() => this.cancel()}>
                            <View style={[explainStyles.titleClose, base.inline]}>
                                <Icon
                                    style={{ width: px(21), height: px(21) }}
                                    name="icon-promise-close"/>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    {this.renderCartCoupon()}
                </View>
            </Animated.View>
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
                isShow: false,
            })
            //this.props.test()
        });
    }
    
    show() {
        this.setState({
            isShow: true
        })
        //this.state.boxY.setValue(this.height);
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 200
            }
        ).start();
    }
}
/**
 * Created by qiaopanpan on 2017/9/1.
 * 目前用于下单页保税区通关服务费，资金管理解释
 */
exports.Tip = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false
        };
        
    }
    render() {
        const { tip, isNeedLine } = this.props;
        return <Modal
            animationType={"fade"}
            transparent={true}
            visible={this.state.isShow}
            onRequestClose={() => { }}
            onShow={() => this.show()}
        >
            <View style={tipStyles.modal}>
                <View style={tipStyles.closeWrap}>
                    <TouchableWithoutFeedback onPress={() => this.hide()}>
                        <View style={tipStyles.modalClose}>
                            <Icon name="icon-close" style={tipStyles.icon_close} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View style={tipStyles.modalBox}>
                    {
                        isNeedLine ?
                            this.renderLine(tip)
                            :
                            <Text allowFontScaling={false} tipStyles={tipStyles.modalLine}>
                                {tip}
                            </Text>
                    }
                    
                </View>
            </View>
        </Modal>
    }
    
    renderLine(tip) {
        return <View>
            {
                tip.map((i, index) =>
                    <Text key={index} allowFontScaling={false} tipStyles={tipStyles.modalLine}>
                        {i}
                    </Text>
                )
            }
        </View>
    }
    
    show() {
        this.setState({
            isShow: true
        })
    }
    hide() {
        this.setState({
            isShow: false
        })
    }
}

const tipStyles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: px(40),
        borderRadius: px(10),
        width: px(650)
    },
    modalClose: {
        width: px(60),
        height: px(80),
        marginRight: px(20)
    },
    icon_close: {
        width: px(60),
        height: px(80)
    },
    closeWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: px(690)
    },
    modalLine: {
        color: '#666',
    }
});

exports.TipRed = class extends React.Component {
    render() {
        const {txt, width, styles} = this.props
        return <View style={[TipRedStyles.box, styles]}>
            <Icon name="submitCardTip" style={TipRedStyles.triangle}/>
            <View style={[TipRedStyles.border, {width: px(width)}]}>
                <View style={[TipRedStyles.tip, base.inline_left, {width: px(width)}]}>
                    <Text allowFontScaling={false} style={[TipRedStyles.txt, base.color]}>
                        {txt}
                    </Text>
                </View>
            </View>
        </View>
    }
}
const TipRedStyles = StyleSheet.create({
    border: {
        height: px(45),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    tip: {
        flex: 1,
        backgroundColor: '#fcf0f3',
        paddingLeft: px(11),
    },
    triangle: {
        width: px(10),
        height: px(5),
        marginLeft: px(35)
    },
    txt: {
        fontSize: px(22)
    }
});
