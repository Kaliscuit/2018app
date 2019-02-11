import React from 'react';
import {
    Image,
    Dimensions
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
 *  <Icon name="test" ext="png" width={375} height={100}/>
 * 自动根据倍率使用test.png或者test@x2.png图片,优先当前倍率,其次查找低倍率
 * 1倍图不需要添加其他后缀
 */
export default class Icon extends React.Component {

    static defaultProps = {
        name: "default",
        ext: "png",
        width: 16,
        height: 16,
        resizeMode: "stretch",
        resizeMethod: "auto"
    }
    imgSource = {}
    constructor(props) {
        super(props);
        const imgSrc = this.getPath(props);
        this.state = {
            imgSrc: imgSrc
        }
    }
    getPath(props) {
        let imgname = props.name;
        let ext = "." + props.ext;
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
        // log("使用icon", cdnUrl + imgSrc, props.name);
        return cdnUrl + imgSrc;
    }
    setNativeProps(obj) {
        if (this.refs.img) this.refs.img.setNativeProps(obj);
    }
    render() {
        const { children, width, height } = this.props;
        return <Image ref="img" source={{ uri: this.state.imgSrc, cache: "force-cache" }}
            onError={e => logWarm(this.props.name, e.nativeEvent)}
            resizeMode={this.props.resizeMode} resizeMethod={this.props.resizeMethod}
            style={[{ width: width, height: height }, this.props.style]} />
    }
    componentWillReceiveProps(pp) {
        if (pp.name !== this.props.name) {
            let imgSrc = this.getPath(pp);
            this.setState({ imgSrc })
        }
    }
}
