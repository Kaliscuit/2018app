import React from 'react';
import {
    Image,
    Dimensions
} from 'react-native';
import { log, logWarm } from '../../utils/logs'

/**
 * 自动加载图片宽高
 * props src 图片地址
 * props resizeMode 
 * props resizeMethod 
 * props style 
 * props width 
 * props height 
 */
export default class extends React.PureComponent {

    static defaultProps = {
        src: "",
        resizeMode: "stretch",
        resizeMethod: "auto",
        style: null,
        width: 0,
        height: 0,
        loaded: () => { }
    }
    constructor(props) {
        super(props);
        this.state = {
            width: 1,
            height: 1
        }
    }

    render() {
        if (this.props.src === "") return null;
        return <Image ref="img"
            source={{ uri: this.props.src }}
            onError={e => logWarm(this.props.name, e.nativeEvent)}
            onLoad={e => this.loaded(e.nativeEvent)}
            onLoadEnd={() => this.props.loaded()}
            resizeMode={this.props.resizeMode}
            resizeMethod={this.props.resizeMethod}
            style={[this.props.style, {
                width: this.state.width,
                height: this.state.height
            }]} />
    }
    setNativeProps(obj) {
        if (this.refs.img) this.refs.img.setNativeProps(obj);
    }
    loaded(e) {
        let w = e.source.width;
        let h = e.source.height;
        if (this.props.width === 0 && this.props.height === 0) return;
        if (this.props.height === 0) {
            h = this.props.width / w * h;
        }
        if (this.props.width === 0) {
            w = this.props.height / h * w;
        }
        if (this.props.width !== 0) {
            w = this.props.width;
        }
        if (this.props.height !== 0) {
            h = this.props.height;
        }
        this.setState({
            width: w,
            height: h
        })
    }
}