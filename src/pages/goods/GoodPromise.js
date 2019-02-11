'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    Image,
    Animated,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'

const deviceHeight = Dimensions.get('window').height;

export default class extends React.Component {
    static defaultProps = {
        types: []
    }
    height = px(deviceHeight)
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            boxY: new Animated.Value(px(500)),
            width: 0,
            height: 0
        };
        
    }
    
    render() {
        return <View>
            <Modal
                style={styles.view}
                visible={this.state.isShow}
                onShow={() => this.show()}
                onRequestClose={() => { }}
                animationType="none"
                transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={styles.bg} ></View></TouchableWithoutFeedback>
                <Animated.View style={[styles.box, {paddingBottom:isIphoneX() ? px(80) : px(20)}, {
                    transform: [
                        { translateY: this.state.boxY }
                    ]
                }]}>
                    <View style={[styles.title, base.inline_between]}>
                        <Text allowFontScaling={false} style={styles.titleTxt}>
                            达令家品牌服务承诺
                        </Text>
                        <TouchableWithoutFeedback onPress={() => this.cancel()}>
                            <View style={[styles.titleClose, base.inline]}>
                                <Icon
                                    style={{ width: px(21), height: px(21) }}
                                    name="icon-promise-close"/>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={[styles.contain]}>
                        <View style={[styles.item, {marginTop:px(0)}]}>
                            <View style={[styles.label, base.inline_left]}>
                                <Icon
                                    style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                    name="icon-new-promise1" />
                                <Text allowFontScaling={false} style={styles.labelTxt}>
                                    正品保障
                                </Text>
                            </View>
                            <Text allowFontScaling={false} style={styles.content}>
                                所有商品均由中华联合财产保险股份有限公司进行承保
                            </Text>
                        </View>
                        {/*{
                            this.props.goods.shipFeeDetail.shipFeeType == 0 &&
                            <View style={[styles.item]}>
                                <View style={[styles.label, base.inline_left]}>
                                    <Icon
                                        style={{ width: px(41), height: px(34), marginRight: px(25) }}
                                        name="icon-promise2" />
                                    <Text allowFontScaling={false} style={styles.labelTxt}>
                                        一件包邮
                                    </Text>
                                </View>
                                <Text allowFontScaling={false} style={styles.content}>
                                    全场包邮，暂不支持寄往港澳台、国外及国内偏远地区，具体配送区域以页面说明为准。
                                </Text>
                            </View>
                        }*/}
                        {
                            this.props.goods.canReturn == 1 ?  <View style={styles.item}>
                                <View style={[styles.label, base.inline_left]}>
                                    <Icon
                                        style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                        name="icon-new-promise3" />
                                    <Text allowFontScaling={false} style={styles.labelTxt}>
                                        7天无理由退货
                                    </Text>
                                </View>
                                <Text allowFontScaling={false} style={styles.content}>
                                    达令家大部分商品支持7天无理由退货
                                </Text>
                            </View> : <View style={styles.item}>
                                <View style={[styles.label, base.inline_left]}>
                                    <Icon
                                        style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                        name="icon-new-promise5" />
                                    <Text allowFontScaling={false} style={styles.labelTxt}>
                                        不支持7天退换
                                    </Text>
                                </View>
                                <Text allowFontScaling={false} style={styles.content}>
                                    海外直邮商品、食品、美护、贴身用品及其他页面特别说明商品不支持无理由退货。
                                </Text>
                            </View>
                        }
                        {
                            this.props.goods.isInBond == 1 && <TouchableWithoutFeedback onPress={() => this.go_()}>
                                <View style={styles.item}>
                                    <View style={[styles.label, base.inline_between]}>
                                        <View style={base.inline_left}>
                                            <Icon
                                                style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                                name="icon-new-promise7" />
                                            <Text allowFontScaling={false} style={styles.labelTxt}>
                                                保税区发货
                                            </Text>
                                        </View>
                                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                                    </View>
                                    <Text allowFontScaling={false} style={styles.content}>
                                        当天17:00前支付的订单当天24点前发货（涉及海关核查、节假日等因素可能有所延迟，敬请谅解）
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        }
                        {
                            this.props.goods.isForeignSupply == 2 && <TouchableWithoutFeedback onPress={() => this.go_()}>
                                <View style={styles.item}>
                                    <View style={[styles.label, base.inline_between]}>
                                        <View style={base.inline_left}>
                                            <Icon
                                                style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                                name="icon-new-promise6" />
                                            <Text allowFontScaling={false} style={styles.labelTxt}>
                                                海外直邮
                                            </Text>
                                        </View>
                                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                                    </View>
                                    <Text allowFontScaling={false} style={styles.content}>
                                        订单支付后 48 小时发货(节假日延迟，敬请谅解)
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        }
                        {
                            this.props.goods.skuType != 'yiguo' && this.props.goods.isInBond != 1 && this.props.goods.isForeignSupply != 2 &&
                            <View style={styles.item}>
                                <View style={[styles.label, base.inline_left]}>
                                    <Icon
                                        style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                        name="icon-new-promise4" />
                                    <Text allowFontScaling={false} style={styles.labelTxt}>
                                        极速发货
                                    </Text>
                                </View>
                                <Text allowFontScaling={false} style={styles.content}>
                                    达令家发货:订单支付后 24 小时内发货，17点前付款当日发货，17点后次日发货。
                                </Text>
                                <Text allowFontScaling={false} style={styles.content}>
                                    商家发货:订单支付后 48 小时内发货。
                                </Text>
                            </View>
                        }
                        {
                            this.props.goods.skuType == 'yiguo' && <TouchableWithoutFeedback onPress={() => this.go_()}>
                                <View style={styles.item}>
                                    <View style={[styles.label, base.inline_between]}>
                                        <View style={base.inline_left}>
                                            <Icon
                                                style={{ width: px(41), height: px(40), marginRight: px(25) }}
                                                name="icon-new-promise8" />
                                            <Text allowFontScaling={false} style={styles.labelTxt}>
                                                易果直供
                                            </Text>
                                        </View>
                                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                                    </View>
                                    <Text allowFontScaling={false} style={styles.content}>
                                        易果战略合作伙伴
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        }
                    </View>
                </Animated.View>
            </Modal>
        </View>
    }
    
    async componentDidMount() {
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
        this.state.boxY.setValue(px(500));
        Animated.timing(
            this.state.boxY,
            {
                toValue: 0,
                duration: 500
            }
        ).start();
    }
    
    go_() {
        this.cancel()
        this.props.go()
    }
    
}

const styles = StyleSheet.create({
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
        backgroundColor: '#fff'
    },
    title: {
        height: px(80),
        width: px(750),
        paddingLeft: px(240),
        borderBottomWidth: px(1),
        borderBottomColor: '#e4e4e4'
    },
    titleTxt: {
        fontSize: px(30),
        color: '#333'
    },
    titleClose: {
        width: px(81),
        height:px(80)
    },
    contain: {
        /*height: px(700),
        width: px(750),*/
        paddingHorizontal: px(30),
        paddingVertical: px(40),
        flex:1
    },
    item :{
        marginTop: px(80)
    },
    label: {
        marginBottom: px(20)
    },
    labelTxt: {
        fontSize: px(34),
        color:'#333'
    },
    content: {
        fontSize: px(28),
        color:'#898989',
        lineHeight: px(38)
    }
})
