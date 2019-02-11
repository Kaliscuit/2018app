'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback, TextInput,
    KeyboardAvoidingView, Dimensions, Animated,
    ScrollView
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

exports.FreightModal = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false
        }
    }
    
    render() {
        const {shipFeeDetails} = this.props
        if (!shipFeeDetails) return null;
        return <Modal
            visible={this.state.show}
            onRequestClose={() => null}
            animationType="none"
            transparent={true}>
            <View style={freightStyles.view}>
                <TouchableWithoutFeedback onPress={() => this.cancel()}><View style={freightStyles.bg} ></View></TouchableWithoutFeedback>
                <View style={freightStyles.boxbg}>
                    <View style={freightStyles.box}>
                        <View style={freightStyles.titleBox}>
                            <Text allowFontScaling={false} style={[freightStyles.title, base.includeFontPadding, freightStyles.color]}>
                                运费详情
                            </Text>
                        </View>
                        <ScrollView
                            style={freightStyles.contain}
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                        >
                            {
                                shipFeeDetails.map((item, index) =>
                                    <View key={index}>
                                        <Text style={[freightStyles.itemTitle, base.includeFontPadding, freightStyles.color]} allowFontScaling={false}>
                                            {item.shipFeeTitle}
                                        </Text>
                                        <ScrollView
                                            bounces={false}
                                            showsHorizontalScrollIndicator={false}
                                            showsVerticalScrollIndicator={false}
                                            horizontal={true}>
                                            {
                                                item.goods.map((k_item, k_index) =>
                                                    <Image key={k_index} style={freightStyles.image}
                                                        resizeMode="cover"
                                                        resizeMethod="resize"
                                                        source={{
                                                            uri: k_item.image
                                                        }}
                                                    />
                                                )
                                            }
                                        </ScrollView>
                                        <Text style={[freightStyles.itemDesc, base.includeFontPadding, freightStyles.color]} allowFontScaling={false}>
                                            {item.shipFeeExplain}
                                        </Text>
                                    </View>
                                )
                            }
                        </ScrollView>
                        <TouchableWithoutFeedback onPress={() => this.cancel()}>
                            <View style={[freightStyles.foot, base.line]}>
                                <Text allowFontScaling={false} style={[freightStyles.title, freightStyles.btn, base.includeFontPadding, base.color]}>
                                    我知道了
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
        </Modal>
        
    }
    
    async open() {
        this.setState({
            show: true
        })
    }
    
    cancel() {
        this.setState({
            show: false
        })
    }
}

const freightStyles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.6)',
        justifyContent: 'center',
    },
    bg: {
        flex: 1,
        width: deviceWidth,
        height: deviceHeight,
        zIndex: 1
    },
    boxbg: {
        flex: 1,
        position: 'absolute',
        width: deviceWidth,
        zIndex: 10
    },
    box: {
        width: px(540),
        backgroundColor: '#f2f2f2',
        borderRadius: px(12),
        overflow: 'hidden',
        //paddingHorizontal: px(32),
        marginHorizontal: px(105)
    },
    titleBox: {
        width: px(540),
        alignItems:'center',
        marginTop: px(45),
        marginBottom: px(24)
        //justifyContent: 'center'
    },
    color: {
        color: '#222'
    },
    title: {
        fontSize: px(34)
        //textAlign: 'center'
    },
    foot: {
        height: px(87),
        borderTopWidth: px(1),
        borderTopColor: '#d4d5d7'
    },
    btn: {
        fontWeight: '900'
    },
    image: {
        width: px(120),
        height: px(120),
        marginRight: px(20),
        borderRadius: px(12),
        overflow: 'hidden'
    },
    contain: {
        paddingLeft: px(32),
        maxHeight: px(514)
    },
    itemTitle: {
        fontSize: px(26),
        marginBottom: px(24)
    },
    itemDesc: {
        fontSize: px(24),
        marginBottom: px(44),
        marginTop: px(20)
    }
});

exports.Explain = class extends React.Component {
    height = px(deviceHeight)
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            boxY: new Animated.Value(px(400)),
            width: 0,
            height: 0
        };
        
    }
    render() {
        const {shipFeeDetail} = this.props
        if (!shipFeeDetail) return null;
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
                            运费说明
                        </Text>
                        <TouchableWithoutFeedback onPress={() => this.cancel()}>
                            <View style={[explainStyles.titleClose, base.inline]}>
                                <Icon
                                    style={{ width: px(21), height: px(21) }}
                                    name="icon-promise-close"/>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={[explainStyles.contain]}>
                        <Text allowFontScaling={false} style={explainStyles.labelTxt}>
                            {shipFeeDetail.shipFeeTitle}
                        </Text>
                        <Text allowFontScaling={false} style={explainStyles.content}>
                            {shipFeeDetail.shipFeeExplain}
                        </Text>
                    </View>
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
        this.state.boxY.setValue(px(400));
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
        height: px(400),
        overflow: 'hidden'
    },
    box_: {
        backgroundColor: '#fff',
        flex:1,
        height: px(400),
    },
    title: {
        height: px(80),
        width: px(750),
        paddingLeft: px(310)
    },
    titleTxt: {
        fontSize: px(30),
        color: '#222'
    },
    titleClose: {
        width: px(81),
        height:px(80)
    },
    contain: {
        /*height: px(700),
        width: px(750),*/
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
    }
});