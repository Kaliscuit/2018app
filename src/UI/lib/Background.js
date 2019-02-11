import React from 'react';
import {
    ImageBackground,
    Dimensions,
    View,
} from 'react-native';
import img_config from '../../../rev-manifest.json'
import os from '../../../os.json'
import { log, logWarm } from '../../utils/logs'

const dimen = Dimensions.get('window');
let cdnUrl = os.ip;
if (cdnUrl.indexOf("http") < 0) {
    cdnUrl = "http://" + os.ip + ":18097/";
}
const scale = parseInt(dimen.scale.toFixed());

/**
 * 使用远程图片,本地使用app的缓存
 *  <Background name="test" ext="png" />
 * 自动根据倍率使用test.png或者test@x2.png图片,优先当前倍率,其次查找低倍率
 * 1倍图不需要添加其他后缀
 */
export default class Background extends React.Component {

    static defaultProps = {
        name: "default",
        ext: "png",
        resizeMode: "cover",
        resizeMethod: "auto",
        onLayout: null
    }
    imgSource = {}
    constructor(props) {
        super(props);
        this.state = {
            refresh: false,
        }
        this.setImgSrc(props.name);
    }
    setImgSrc(name) {
        let imgname = name;
        if (imgname === "") {
            return this.imgSource = null;
        }
        let ext = "." + this.props.ext;
        let imgscale = scale;
        let imgSrc = img_config[imgname + ext];
        while (imgscale > 1) {
            if (img_config[imgname + "@x" + imgscale + ext]) {
                imgSrc = img_config[imgname + "@x" + imgscale + ext];
                break;
            }
            imgscale--;
        }
        if (!imgSrc) imgSrc = "default.png";
        this.imgSource = { uri: cdnUrl + imgSrc, cache: "force-cache" }
        // log("使用Background", this.imgSource, props.name);
    }
    setNativeProps(obj) {
        if (this.refs.img) this.refs.img.setNativeProps(obj);
    }
    render() {
        if (this.imgSource === null) {
            return <View style={this.props.style} onLayout={this.props.onLayout}>
                {this.props.children}
            </View>
        }
        const { children, width, height } = this.props;
        return <ImageBackground ref="img" source={this.imgSource}
            onLayout={this.props.onLayout}
            onError={e => logWarm(this.props.name, e.nativeEvent)}
            // onLoad={e => console.log(e.nativeEvent)}
            // onLoadEnd={console.log(this.imgSource)}
            resizeMode={this.props.resizeMode} resizeMethod={this.props.resizeMethod}
            style={this.props.style} >
            {this.props.children}
        </ImageBackground>
    }
    componentWillReceiveProps(pp) {
        if (pp.name != this.props.name) {
            this.setImgSrc(pp.name);
            this.setState({ refresh: !this.state.refresh })
        }
    }
}
