'use strict';

import React from 'react';

import {
    ScrollView, Image, View, StyleSheet,
    ActivityIndicator
} from 'react-native';
import { px } from '../../utils/Ratio';
import base from '../../styles/Base'
import { log, logErr, logWarm } from '../../utils/logs'

/**
 * 加入等待加载框的图片组件
 * 预请求宽高
 * props name 图片组件的名字
 * props source 图片地址
 * props w|h 默认宽高
 * event onError
 */
exports.LoadImage = class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            w: this.props.w || 0,
            h: this.props.h || 0,
            hide: false
        }
        this.name = props.name || '';
    }

    render() {
        return <View style={{ width: this.state.w, height: this.state.h }}>
            {!this.state.hide && <ActivityIndicator
                animating={true}
                style={[{ width: this.state.w, height: this.state.h }, base.position]}
                size="large"
                color="#ffffff"
            />}
            <Image source={{ uri: this.props.source }}
                onLoadStart={(e) => this.startEvent(e)}
                onError={(e) => this.errorEvent(e)}
                onLoad={() => this.setState({ hide: true })}
                style={[{ width: this.state.w, height: this.state.h }, this.props.style || {}]} />
        </View>
    }
    startEvent(e) {
        this.start = {
            target: e.nativeEvent.target,
            time: new Date().getTime()
        }
    }
    errorEvent(e) {
        this.props.onError && this.props.onError(e.nativeEvent)
        if (!e.nativeEvent) e.nativeEvent = {};
        let end = {
            target: e.nativeEvent.target,
            msg: e.nativeEvent.error,
            time: new Date().getTime()
        }
        // logErr(this.name + "图片加载失败", { "start": this.start, end: end }, this.props.source);
    }
}
/**
 * 自适应图片
 * @prop src<String> 图片地址
 * @prop w<Number> 图片宽度,不传自适应
 * @prop h<Number> 图片高度,不传自适应 
 */
exports.MediaImage = class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            w: this.props.w || 0,
            h: this.props.h || 0,
        }
    }
    render() {
        return <Image source={{ uri: this.props.src }}
            style={[{ width: this.state.w, height: this.state.h }]} />
    }
    componentWillMount() {
        if (this.state.w === 0 || this.state.h === 0) {
            Image.getSize(this.props.src, (w, h) => {
                if (this.state.w === 0 && this.state.h !== 0) {
                    w = w / h * this.state.h;
                    this.setState({
                        w: w,
                    })
                }
                if (this.state.h === 0 && this.state.w !== 0) {
                    h = h / w * this.state.w;
                    this.setState({
                        h: h,
                    })
                }
                if (this.state.w === 0 && this.state.h === 0) {
                    this.setState({
                        w: w,
                        h: h
                    })
                }
            });
        }
    }
}

/**
 * cdn使用到的图片
 * props    width   尽量填写图片宽度
 * props    height  图片高度
 * props    style   外层样式
 * props    resizeMethod    压缩方法
 */
exports.CdnImage = class extends React.Component {

    static defaultProps = {
        resizeMethod: "auto",
        width: 300,
        height: 400,
        style: null
    }
    constructor(props) {
        super(props);
        this.state = {
            src: props.src,
            hide: true,
        }
        this.timer = null;
    }

    render() {
        const { style } = this.props;

        if (!this.state.src) return null;
        return <View style={[{ width: this.props.width, height: this.props.height }]}>
            {this.state.hide && <ActivityIndicator
                animating={true}
                style={[cdnStyle.position, style]}
                size="large"
                color="#ffffff"
            />}
            <Image style={{ width: this.props.width, height: this.props.height }}
                resizeMethod={this.props.resizeMethod}
                onLoadStart={this.loadStart.bind(this)}
                onLoad={this.load.bind(this)}
                onLoadEnd={this.loadEnd.bind(this)}
                onError={this.error.bind(this)}
                source={{ uri: this.state.src }} />
        </View>
    }

    shouldUpdate = false;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    timer = null;
    loadStart() {
        this.load_count = 0;
        this.timer = setTimeout(() => this.loadFail(), 6000);
        log("cdn图片加载开始", this.state.src)
    }
    componentWillUnmount() {
        if (this.timer) clearTimeout(this.timer);
    }
    load_error = false;
    load_count = 0;
    error({ nativeEvent }) {
        this.load_count++;
        this.load_error = true;
        log("cdn图片加载失败", nativeEvent)
    }
    load_img = false;
    load({ nativeEvent }) {
        this.load_count++;
        this.load_img = true;
        // console.log(nativeEvent)
    }
    loadEnd({ nativeEvent }) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        //加载成功
        if (this.load_img) return this.setState({ hide: false })
        //加载失败
        if (this.load_error) this.loadFail();
    }
    //换源再次加载
    loadFail() {
        if (this.load_img) return;
        let src = this.state.src.replace(/img[0-9]{1}\.daling\.com/, "imgx.daling.com");
        this.setState({ hide: false, src })
        this.load_img = true;
    }

}

const cdnStyle = StyleSheet.create({
    position: {
        position: 'absolute',
        left: 118,
        top: 160,
    },
})