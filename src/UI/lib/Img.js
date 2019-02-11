import React from 'react';
import {
    Image,
    Dimensions
} from 'react-native';
import { log, logWarm } from '../../utils/logs'
const dimen = Dimensions.get('window');
import tools from "../../utils/tools"

const scale = parseInt(dimen.scale.toFixed()) || 1;

/**
 * 自动使用分辨率合适的图片
 * props width 图片宽度，原始1倍图大小
 * props height 图片高度，原始1倍图大小
 * props resizeMode 
 * props resizeMethod 
 * props style 
 * props setNativeProps 
 * props src
 */
export default class Img extends React.Component {

    static defaultProps = {
        width: 0,
        height: 0,
        resizeMode: "stretch",
        resizeMethod: "auto"
    }
    imgSource = {}
    constructor(props) {
        super(props);
        this.state = {
            src: props.src
        }
        if (props.src.indexOf("data:image") < 0) {
            this.state.src = this.getSrc(props.src);
        }
    }

    setNativeProps(obj) {
        if (this.refs.img) this.refs.img.setNativeProps(obj);
    }
    getSrc(src) {
        if (src.indexOf("data:image") < 0 && src.indexOf(".gif") < 0) {
            return tools.cutImage(src, this.props.width * scale, this.props.height * scale);
        }
        return src;
    }
    render() {
        // log(this.state.src)
        const { children, width, height } = this.props;
        return <Image ref="img"
            source={{ uri: this.state.src }}
            onError={e => logWarm(this.props.name, e.nativeEvent)}
            resizeMode={this.props.resizeMode}
            resizeMethod={this.props.resizeMethod}
            style={this.props.style} />
    }
    componentWillReceiveProps(pp) {
        if (pp.src != this.props.src) {
            this.setState({ src: this.getSrc(pp.src) })
        }
    }
}
