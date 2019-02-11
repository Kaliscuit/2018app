'use strict';

import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    PixelRatio,
    ImageBackground
} from 'react-native';

import { px, isIphoneX } from '../../utils/Ratio';
import base from '../../styles/Base';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class extends  React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            width: new Animated.Value(0),
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(0),
        }
        this.timer = null;
    }
    
    render() {
        return <TouchableWithoutFeedback onPress={() => this.props.go()}>
            <View style={[styles.box, base.inline, {
                bottom: isIphoneX() ? px(40) : px(40),
                height: this.props.height1,
                opacity: this.props.opacityTop,
                overflow: 'hidden',
                //width: px(180)
            }]}>
                <Animated.View
                    style={[{
                        position: 'absolute',
                        top: px(14),
                        width: this.state.width.interpolate({
                            inputRange: [0, 100],
                            outputRange: [px(0), px(110)]
                        }),
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow:'hidden',
                        zIndex: 1,
                        //backgroundColor: '#ff0',
                        height: px(1)}]}>
                    <Animated.Image
                        resizeMode="cover"
                        source={{ uri: require('../../images/icon-toTopBorder1') }}
                        style={[{
                            //zIndex: 1,
                            transform: [
                                { scaleX: this.state.width.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [1, 500] // transform影响层级，加zIndex：1
                                }) }
                            ],
                            width: px(1),
                            height: px(1)}]} />
                </Animated.View>
                <Image
                    resizeMode="cover"
                    source={{ uri: pxRatio > 2.51 ? require('../../images/icon-topLeft') : require('../../images/icon-topLeft') }}
                    style={{ width: px(50), height: px(100), marginRight: px(-35) }} />
                <Animated.View style={[styles.toTop, {
                    //bottom: isIphoneX() ? px(40) : px(40),
                    height: this.props.height,
                    opacity: this.props.opacityTop,
                    overflow: 'hidden',
                    width: this.state.width.interpolate({
                        inputRange: [0, 100],
                        outputRange: [px(70), px(180)]
                    }),
                    backgroundColor: 'rgba(255,255,255,.8)'
                }]}>
                    <Animated.Text allowFontScaling={false} style={[{
                        opacity: this.state.opacity
                        //backgroundColor: '#ff0'
                    }, styles.txt]}>回顶部</Animated.Text>
                    <View style={{height: px(70), justifyContent: 'center'}}>
                        <Image
                            resizeMode="cover"
                            source={{ uri: pxRatio > 2.51 ? require('../../images/icon-toTopLine') : require('../../images/icon-toTopLine') }}
                            style={{ width: px(25), height: pxRatio > 2.51 ? px(2) : px(2) }} />
                        <Animated.View style={[{
                            transform: [
                                { translateY: this.state.translateY.interpolate({
                                    inputRange: [0, 10],
                                    outputRange: [0, 10]
                                }) }
                            ],
                            marginTop: px(3)
                        }]}>
                            <Image
                                resizeMode="cover"
                                source={{ uri: pxRatio > 2.51 ? require('../../images/icon-toTop3x') : require('../../images/icon-toTop') }}
                                style={{ width: px(24), height: px(24) }} />
                        </Animated.View>
                    </View>
                </Animated.View>
                <Image
                    resizeMode="cover"
                    source={{ uri: pxRatio > 2.51 ? require('../../images/icon-TopRight') : require('../../images/icon-TopRight') }}
                    style={{ width: px(50), height: px(100), marginLeft: px(-36) }} />
                <Animated.View
                    style={[styles.bot, {
                        width: this.state.width.interpolate({
                            inputRange: [0, 100],
                            outputRange: [px(0), px(110)]
                        }),
                        //width: px(110),
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow:'hidden',
                        zIndex: 1,
                        //backgroundColor: '#ff0',
                        height: px(15)}]}>
                    <Animated.Image
                        resizeMode="cover"
                        source={{ uri: pxRatio > 2.51 ? require('../../images/icon-topCenter') : require('../../images/icon-topCenter') }}
                        style={[{
                            //zIndex: 1,
                            transform: [
                                { scaleX: this.state.width.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 500] // transform影响层级，加zIndex：1
                                }) }
                            ],
                            width: px(1),
                            height: px(15)}]} />
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    }
    
    
    run() {
        this.state.width.stopAnimation();
        this.state.opacity.stopAnimation();
        this.state.translateY.stopAnimation();
        Animated.sequence([
            Animated.timing(this.state.width, {
                toValue: 100,
                duration: 400,
                easing: Easing.linear
            }),
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear
            }),
            Animated.timing(this.state.translateY, {
                toValue: 3,
                duration: 100,
                easing: Easing.linear
            }),
            Animated.timing(this.state.translateY, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear
            }),
            Animated.timing(this.state.translateY, {
                toValue: 3,
                duration: 100,
                easing: Easing.linear
            }),
            Animated.timing(this.state.translateY, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear
            })
        ]).start(() => {
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(() => this.back(), 1500);
        })
    }
    
    back() {
        this.state.opacity.stopAnimation();
        this.state.width.stopAnimation();
        Animated.sequence([
            Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear
            }),
            Animated.timing(this.state.width, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear
            })
        ]).start()
    }
    
    componentWillUnmount() {
        if (!this.timer) return;
        clearTimeout(this.timer)
    }
    
}
const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        right: px(0),
        //backgroundColor:'#000'
    },
    toTop: {
        width: px(70),
        height: px(70),
        paddingRight: px(21),
        borderRadius: px(35),
        paddingTop: px(1),
        //zIndex: 1,
        //backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent:'flex-end',
        alignItems: 'center'
    },
    txt: {
        fontSize: px(26),
        color: '#222',
        marginRight: px(20),
        includeFontPadding: false,
    },
    bot: {
        position: 'absolute',
        bottom: px(0),
    },
    border: {
        position: 'absolute',
        //left: 0,
        zIndex: 2,
        left: px(15),
        top: px(15),
    }
})