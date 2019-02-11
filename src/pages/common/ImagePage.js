'use strict';

import React from 'react';

import {
    ScrollView, Image, View, StyleSheet,
    ActivityIndicator, Dimensions
} from 'react-native';
import { px } from '../../utils/Ratio';
import { TopHeader } from './Header'
import base from '../../styles/Base'
import { log, logWarm, logErr } from '../../utils/logs'

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let img = [];
        if (this.state.image && this.state.image.height < 2000) {
            img.push(<Image source={{ uri: this.state.image.src }} key={0}
                style={{ width: px(this.state.image.width), height: px(this.state.image.height) }} />);
        } else if (this.state.image) {
            let len = Math.ceil(this.state.image.height / 1000);
            for (let i = 1; i <= len; i++) {
                let url = this.state.image.src + `!${i}_${len}_1000.${this.state.image.src.indexOf('.jpg') == -1 ? 'png' : 'jpg'}`
                if (i == len) {
                    img.push(<Image source={{ uri: url }} key={i}
                        style={{ width: px(this.state.image.width), height: px(this.state.image.height - (len - 1) * 1000) }} />);
                } else {
                    img.push(<Image source={{ uri: url }} key={i}
                        style={{ width: px(this.state.image.width), height: px(1000) }} />);
                }
            }
        }
        return <View style={{ flex: 1 }}>
            <TopHeader navigation={this.props.navigation}
                title={this.props.navigation.state.params.title}></TopHeader>
            <ScrollView style={{ flex: 1, backgroundColor: '#f5f4f6' }}>
                {img}
            </ScrollView>
        </View>
    }
    //   {this.state.image &&
    //   <Image source={{uri:this.state.image.src}}
    //          style={{width:px(this.state.image.width),height:px(this.state.image.height)}}/>
    //   }

    componentDidMount() {
        let src = this.props.navigation.state.params.src;
        new Promise((resolve, reject) => {
            Image.getSize(src,
                (w, h) => resolve({
                    src: src,
                    width: w,
                    height: h
                }),
                (e) => reject(e)
            )
        })
            .then(res => {
                this.setState({
                    image: res
                })
            }


            );
    }

}

/**
 * 加入等待加载框的图片组件
 * 预请求宽高
 * props source 图片地址
 * props w|h 默认宽高
 * props fixW 最大宽
 */
exports.MagicImage = class extends React.Component {
    
    fixH = deviceHeight * 0.8;

    constructor(props) {
        super(props)
        this.state = {
            img_url: '',
            fixW: px(this.props.fixW) || 0,
            w: px(this.props.w) || px(640),
            h: px(this.props.h) || px(900),
            loaded: false
        }
        this.name = props.name || '';
    }

    render() {
        return <View style={{ width: this.state.w, height: this.state.h }}>
            {!this.state.hide && <ActivityIndicator
                animating={true}
                style={{ width: this.state.w, height: this.state.h }}
                size="large"
                color="#ffffff"
            />}
            <Image source={{ uri: this.props.source }}
                onLoad={() => {
                    this.props.onLoadImage && this.props.onLoadImage()
                    let timer = setTimeout(() => {
                        this.setState({ hide: true })
                        if (timer) clearTimeout(timer)
                    }, 100);
                }}
                // onLoadStart={(e) => this.startEvent(e)}
                // onError={(e) => this.errorEvent(e)}
                style={[{ width: this.state.w, height: this.state.h, opacity: this.state.hide ? 1 : 0 }, this.props.style]} />
        </View>
    }
    async componentWillReceiveProps(nextP) {
        if (nextP.source) {
            if (nextP.w && nextP.h) {
                this.resize(nextP.w, nextP.h)
            } else {
                Image.getSize(nextP.source, (w, h) => {
                    this.resize(w, h)
                }, (e) => { })
            }
        }
    }

    resize(w, h) {
        //console.log(w, h, this.state.fixW, this.fixH, w / h * this.fixH >> 0)
        w = px(w);
        h = px(h);
        if (this.state.fixW !== 0) {
            h = h / w * this.state.fixW >> 0;
            w = this.state.fixW
        }
        /*if (h > this.fixH) {
            w = w / h * this.fixH >> 0;
            h = this.fixH;
        }*/
        this.setState({ w: w, h: h, loaded: true })
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
        // logErr(this.name + "魔法图片加载失败", { "start": this.start, end: end }, this.props.source);
    }
}
const styles = StyleSheet.create({

})