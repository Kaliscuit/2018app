/**
 * Created by zhaoxiaobing on 2017/9/5.
 */

'use strict';

import React from 'react';

import {
    View,
    ActivityIndicator,
    StyleSheet,
    Modal,
    Text
} from "react-native";

import { px } from "../utils/Ratio";


/*
    引用方法 import { LoadingInit, LoadingRequest } from  '路径/widgets/Loading';
    LoadingInit      初始化loading菊花，  页面初始化请求之前只出现一次，不提供状态管理  <LoadingInit />
    LoadingRequest   request请求中loading菊花，  自己控制出现与隐藏，提供状态管理参数status，     <LoadingRequest status={true/false} />
    status 参数最好是在state中设置，不要设置为私有或在当前组件之外
 */

class LoadingInit extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <View style={styles.sty1}>
                <ActivityIndicator
                    animating={true}
                    style={{ width: px(80), height: px(80) }}
                    size="large"
                />
            </View>
        )
    }
}

/**
 * 遮罩的菊花
 * @param status [false] 是否显示loading层
 * @param text [string] 显示在下面的文字
 */
class LoadingRequest extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return <Modal
            animationType="fade"
            transparent={true}
            visible={this.props.status}
            onRequestClose = {() => null }>
            <View style={styles.sty2}>
                <ActivityIndicator
                    animating={true}
                    style={{ width: px(80), height: px(80) }}
                    size="large"
                    color="#ffffff"
                />
                <Text style={styles.text}>{this.props.text}</Text>
            </View>
        </Modal>
    }
}

/**
 * 遮罩的菊花
 */
class Loading extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        if (!this.props.status) return null;
        return (
            <View style={styles.sty3}>
                <ActivityIndicator
                    animating={this.props.status}
                    style={{ width: px(80), height: px(80) }}
                    size="large"
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    sty1: {
        alignItems: 'center',
        paddingVertical: px(100)
    },
    sty2: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sty3: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 10,
        //backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        color: '#fff',
        marginTop: px(20)
    }

});




export { LoadingInit, LoadingRequest, Loading }