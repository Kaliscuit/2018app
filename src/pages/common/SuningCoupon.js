'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    ScrollView, Image,
    TouchableWithoutFeedback, TextInput,
    Easing, Dimensions, Animated
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import Background from '../../UI/lib/Background'
import request from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;


class Item extends  React.PureComponent {
    
    render() {
        const { btType, nothing, item, area, isOwner, couponUsed } = this.props
        //console.log(item, btType, '=======')
        if (!item) return null;
        if (item.stateTime) {
            item.startTime = item.stateTime
        }
        return <View style={[couponStyles.item, base.inline]}>
            <View style={[couponStyles.left, base.line]}>
                {
                    isNaN(item.amount) ?
                        <View style={[base.inline_left]}>
                            <Text allowFontScaling={false} style={[couponStyles.money, couponStyles.colorFFF]}>{item.amount.replace(/[^0-9]/ig, "")}</Text>
                            <Text allowFontScaling={false} style={[couponStyles.money_, couponStyles.colorFFF, {marginTop: px(12)}]}>折</Text>
                        </View> :
                        <View style={base.inline_left}>
                            <Text allowFontScaling={false} style={[couponStyles.money_, couponStyles.colorFFF, {marginTop: px(12)}]}>￥</Text>
                            <Text allowFontScaling={false} style={[couponStyles.money, couponStyles.colorFFF]}>{(item.amount * 1).toFixed(0)}</Text>
                        </View>
                }
                <Text allowFontScaling={false} style={[couponStyles.rule, couponStyles.colorFFF]}>{item.bonusRulesDesc}</Text>
            </View>
            <View style={[couponStyles.right, base.inline_left]}>
                <View style={[couponStyles.moddle]}>
                    <Text allowFontScaling={false} style={[couponStyles.desc, {color: nothing ? '#b2b3b5' : '#222'}]}>
                        {item.couponDesc}
                    </Text>
                    <Text allowFontScaling={false} style={[couponStyles.time, {color: nothing ? '#b2b3b5' : '#222'}]}>
                        {`${item.startTime}-${item.endTime}` || `${item.stateTime}-${item.endTime}`}
                    </Text>
                </View>
                {
                    btType == 'null' && <View style={{width: px(83)}}></View>
                }
                {
                    btType == 'select' &&
                    <SelectCoupon
                        item={item}
                        couponUsed={couponUsed}
                        selectTo={this.props.selectTo.bind(this)}
                    />
                }
                {
                    btType == 'get' && <GetCoupon
                        area={area}
                        isOwner={isOwner}
                        item={item}/>
                }
            </View>
        </View>
    }
    
    getCoupon() {
    
    }
    
}

class ItemExtra extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDown: false,
            height: new Animated.Value(px(70)),
        }
    }
    render() {
        const { isDown } = this.state
        return <View style={{justifyContent:'center', marginLeft: px(14)}}>
            <View style={[base.inline, {width: px(722), overflow: 'hidden'}]}>
                <Animated.Image
                    source={{ uri: require('../../images/suningLeft') }}
                    resizeMode='cover'
                    style={{
                        width: px(6),
                        height: px(40),
                        transform: [
                            { scaleY: this.state.height.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 3] // transform影响层级，加zIndex：1
                            }) }
                        ],
                    }} />
                <Animated.View style={[extraStyles.item, {
                    height: this.state.height.interpolate({
                        inputRange: [0, 100],
                        outputRange: [px(70), px(212)]
                    }),
                }]}>
                    <View style={extraStyles.itemBox}>
                        <TouchableWithoutFeedback onPress={() => this.start()}>
                            <View style={[extraStyles.title, base.inline_left]}>
                                <Text allowFontScaling={false} style={extraStyles.txt}>
                                    以下商品还差
                                    <Text allowFontScaling={false} style={extraStyles.txt1}>￥21</Text>
                                    可用券
                                </Text>
                                {
                                    !isDown ?
                                        <Icon name="icon-detail-shousuo" style={{width: px(22), height: px(12), marginLeft: px(10)}}/>
                                        :
                                        <Icon name="icon-detail-zhankai" style={{width: px(22), height: px(12), marginLeft: px(10)}}/>
                                }
                            </View>
                        </TouchableWithoutFeedback>
                        <ScrollView
                            horizontal
                            style={{paddingHorizontal: px(20)}}
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                        >
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                            <Image
                                source={{ uri: 'http://imgbeta.daling.com/data/files/mobile/2015/02/28/14250917223001.jpg_710x440.jpg' }}
                                resizeMode='cover'
                                style={{
                                    width: px(120),
                                    height: px(120),
                                    borderRadius: px(8),
                                    overflow: 'hidden',
                                    marginRight: px(20)
                                }} />
                        </ScrollView>
                    </View>
                </Animated.View>
                <Animated.Image
                    source={{ uri: require('../../images/suningRight') }}
                    resizeMode='cover'
                    style={{
                        width: px(6),
                        height: px(40),
                        transform: [
                            { scaleY: this.state.height.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 3] // transform影响层级，加zIndex：1
                            }) }
                        ],
                    }} />
            </View>
            <Icon name="suningBottom" style={{width: px(722), height: px(30), marginTop: px(-24)}}/>
        </View>
    }
    
    start() {
        this.setState({
            isDown: !this.state.isDown
        })
        if (this.state.isDown) {
            this.state.height.stopAnimation();
            Animated.timing(this.state.height, {
                toValue: 0,
                duration: 400,
                easing: Easing.linear
            }).start()
        } else {
            this.state.height.stopAnimation();
            Animated.timing(this.state.height, {
                toValue: 100,
                duration: 400,
                easing: Easing.linear
            }).start()
        }
        
    }
}

class SelectCoupon extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selected: false }
    }
    select() {
        
        /*  this.setState({
            selected: !this.state.selected
        }, () => {
            this.props.selectTo && this.props.selectTo(this.props.item.couponNumber, this.props.item.fusionCouponList, this.state.selected );
        })*/
        this.props.selectTo && this.props.selectTo(this.props.item.couponNumber, this.props.item.fusionCouponList);
    }
    
    render() {
        const {selected} = this.state
        const {couponUsed, item} = this.props
        let fun = (item.fusionCouponList || []).concat([this.props.item.couponNumber])
        //fun.filter(v => couponUsed.includes(v))
        //console.log(couponUsed, '=========')
        //let isEx = fun.filter(v => couponUsed.includes(v));
        //[6,2,3,4,5,1].filter(n => [2,3,6].includes(n))
        let common = fun.filter(n => couponUsed.includes(n));
        let isEx = common.filter(n => couponUsed.includes(n)),
            isMutex = true;
        if (isEx.length == couponUsed.length && common.length == couponUsed.length) {
            isMutex = false
        }
        //console.log(fun, couponUsed, isEx, 'item===========')
        //console.log(isEx, 'item===========')
        return <TouchableWithoutFeedback onPress={() => this.select()}>
            <View style={[couponStyles.select, base.inline]}>
                {
                    isMutex ?
                        <Icon name="suningSelectOther" style={{width: px(32), height: px(32)}}/> :
                        (couponUsed || []).indexOf(item.couponNumber) !== -1 ?
                            <Icon name="suningSelected" style={{width: px(32), height: px(32)}}/>
                            :
                            <Icon name="suningSelect" style={{width: px(32), height: px(32)}}/>
          
                }
                {/*<Text>{(item.couponNumber + '').substr(10)}</Text>
                <Text>,{isEx.length}</Text>*/}
            </View>
        </TouchableWithoutFeedback>
    }
}

class GetCoupon extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isNextCoupon: 2,
            receiveTimes: this.props.item.receiveTimes || 0
        }
    }
    
    async getCoupon() {
        const {item, area} = this.props;
        try {
            let url = '/coupon/receiveSuningCoupon.do';
            let res = await request.get(`${url}?couponAmount=${item.amount}&activitySecretKey=${item.activitySecretKey}&activityId=${item.activityId}&receiveTimes=${item.receiveTimes || 0}&city=${area.city}&province=${area.province}&district=${area.area}`);
            toast(res.message);
            this.setState({
                isNextCoupon: res.isNextCoupon,
                receiveTimes: res.receiveTimes
            });
        } catch (e) {
            toast(e.message);
        }
    }
    
    render() {
        const { item, isOwner } = this.props
        const { isNextCoupon, receiveTimes } = this.state
        return <View style={[couponStyles.getCoupon, base.line, {justifyContent:'flex-end', paddingBottom: 12}]}>
            {
                item.receiveTimes > 0 &&
                <Text style={couponStyles.btnDesc} allowFontScaling={false}>已领取{receiveTimes}次</Text>
            }
            {
                isNextCoupon == 2 && !isOwner &&
                <TouchableWithoutFeedback onPress={() => this.getCoupon()}>
                    <View style={[couponStyles.getBtn, base.inline]}>
                        <Text style={couponStyles.getBtnTxt} allowFontScaling={false}>{receiveTimes == 0 ? '立即领取' : '继续领取'}</Text>
                    </View>
                </TouchableWithoutFeedback>
            }
            {
                (isNextCoupon == 1 || isOwner) &&
                <View style={[couponStyles.getBtn, base.inline, couponStyles.ugetBtn]}>
                    <Text style={couponStyles.getBtnTxt} allowFontScaling={false}>已领取</Text>
                </View>
            }
            {
                isNextCoupon == 0 && !isOwner &&
                <View style={[couponStyles.getBtn, base.inline, couponStyles.ugetBtn]}>
                    <Text style={couponStyles.getBtnTxt} allowFontScaling={false}>已抢光</Text>
                </View>
            }
            {/*<View style={[couponStyles.getBtn, base.inline, couponStyles.ugetBtn]}>
                <Text style={couponStyles.getBtnTxt} allowFontScaling={false}>已抢光</Text>
            </View>
            <View style={[couponStyles.getBtn, base.inline, couponStyles.ugetBtn]}>
                <Text style={couponStyles.getBtnTxt} allowFontScaling={false}>已领取</Text>
            </View>*/}
        </View>
    }
}

class SuningCouponItem extends React.Component {
    render() {
        const {nothing, btType, list, area, isOwner, couponUsed} = this.props
        return <Background
            name={nothing ? "suningCouponBg4" : 'suningCouponBg1'}
            style={[couponStyles.suning, base.inline, couponStyles.comBg]}
            resizeMode={'cover'}>
            <Item
                btType={btType}
                nothing={nothing}
                item={list}
                area={area}
                isOwner={isOwner}
                couponUsed={couponUsed}
                selectTo={btType == 'select' ? this.props.selectTo.bind(this) : null}
            />
        </Background>
    }
}
exports.SuningCouponItem = SuningCouponItem

exports.USuningCouponItem = class extends React.Component {
    render() {
        const {nothing, btType, list} = this.props
        return <Background
            name="suningCouponBg2"
            style={[couponStyles.uSuning, couponStyles.comBg]}
            resizeMode={'cover'}>
            <Item btType={btType} nothing={nothing} item={list} />
            <View style={couponStyles.bottom}>
                <Text style={couponStyles.bottomTxt} allowFontScaling={false}>
                    {list.unavailableReazon}
                </Text>
            </View>
        </Background>
    }
    
};
/*btType item单项右边按钮类型 nothing置灰状态*/
exports.UnableSuningCouponItem = class extends React.Component {
    render() {
        return <View>
            <Background
                name="suningCouponBg5"
                style={[couponStyles.suning, base.inline, couponStyles.comBg, {marginBottom: 0, height: px(167)}]}
                resizeMode={'cover'}>
                <Item btType="null" nothing />
            </Background>
            <ItemExtra/>
        </View>
    }
};

exports.Empty = class extends React.Component {
    render() {
        const {reTry} = this.props
        return <View style={[couponStyles.empty]}>
            <Icon name="suningCouponEmpty" style={couponStyles.emptyImage}/>
            <Text allowFontScaling={false} style={couponStyles.defaultTxt}>暂无代金券</Text>
            {
                reTry &&
                <TouchableWithoutFeedback onPress={() => this.props.reRefresh()}>
                    <View style={[couponStyles.reTry, base.line]}>
                        <Text style={couponStyles.reTryTxt} allowFontScaling={false}>
                            点击重试
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            }
        </View>
    }
}
const couponStyles = StyleSheet.create({
    comBg: {
        marginLeft: px(14),
        marginBottom: px(12)
    },
    suning: {
        width: px(722), //6px齿轮6px阴影
        height: px(176), //上下6px阴影
    },
    uSuning: {
        width: px(722),
        height: px(246),
        paddingLeft: px(12),
        //alignItems: 'center'
    },
    item: {
        width: px(698),
        height: px(164),
    },
    left: {
        width: px(184),
        height: px(164)
    },
    moddle: {
        height: px(164),
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: px(24),
        paddingBottom: px(40)
    },
    right: {
        flex: 1,
        height: px(164),
        paddingLeft: px(20)
    },
    right_: {
        width: px(83),
        height: px(164)
    },
    money_: {
        fontWeight: '900',
        fontSize: px(28),
        textAlignVertical: "bottom"
    },
    money: {
        fontWeight: '900',
        fontSize: px(60)
    },
    rule: {
        fontSize: px(20),
        textAlign: 'center'
    },
    desc: {
        fontSize: px(28),
        lineHeight: 16
    },
    time: {
        fontSize: px(20),
    },
    select: {
        width: px(83),
    },
    colorFFF: {
        color: '#fff',
    },
    bottom: {
        height: px(70),
        paddingLeft: px(20),
        justifyContent: 'center'
    },
    bottomTxt: {
        color: '#222',
        fontSize: px(26)
    },
    empty: {
        width: px(750),
        height: px(915),
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    emptyImage: {
        height: px(335),
        width: px(750),
        marginVertical: px(90)
    },
    defaultTxt: {
        fontSize: px(28),
        color: '#999'
    },
    reTry: {
        width: px(240),
        height: px(60),
        borderRadius: px(30),
        overflow: 'hidden',
        backgroundColor: '#d0648f',
        marginTop: px(30)
    },
    reTryTxt: {
        color: '#fff',
        fontSize: px(28)
    },
    getCoupon: {
        width: px(190),
        height: px(164)
    },
    btnDesc: {
        fontSize: px(18)
    },
    getBtn: {
        width: px(150),
        height: px(50),
        backgroundColor: '#ffa914',
        borderRadius: px(5),
        overflow: 'hidden',
        marginTop: px(10)
    },
    ugetBtn: {
        backgroundColor: '#b2b3b5',
    },
    getBtnTxt: {
        color: '#fff',
        fontSize: px(24)
    }
});

const extraStyles = StyleSheet.create({
    item: {
        borderBottomLeftRadius: px(30),
        borderBottomRightRadius: px(30),
        //marginHorizontal: px(14),
        overflow: 'hidden',
        width: px(710)
    },
    itemBox: {
        backgroundColor: '#fff',
        flex: 1
    },
    title: {
        height: px(70),
        paddingLeft: px(20)
    },
    txt: {
        fontSize: px(26),
        color: '#222'
    },
    txt1: {
        color: '#ed3f58'
    }
});