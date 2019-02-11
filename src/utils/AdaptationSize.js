import {
    Dimensions,
    Platform
} from 'react-native';
import { getHeader } from '../services/Request'

const dimen = Dimensions.get('window');
const deviceWidth = dimen.width;      //设备的宽度
const defaultPixel = 2; //iphone6的像素密度
const basePixelWidth = 750;
//px转换成dp
const w2 = basePixelWidth / defaultPixel;
const scale = deviceWidth / w2;   //获取缩放比例

/**
 * 尺寸缩放比例
 * @param size
 * @returns {*}
 */
export function px(size) {

    if (size == 1) {
        return size;
    } else {
        size = Math.round(size * scale / defaultPixel);
        return size;
    }

}

/**
 * 字体缩放比例
 * @param size
 * @returns {*}
 */
export function setSpText(size) {
    size = Math.round(size * scale);
    return size;
}

let _isIphoneX = null;
export function isIphoneX() {
    if (_isIphoneX !== null) return _isIphoneX;
    if (Platform.OS !== 'ios') {
        _isIphoneX = false;
        return _isIphoneX;
    }
    let version = getHeader('version');
    if (version.length < 3) return false;
    let version_ = version.replace(/\./g, '') * 1;
    if (version_ < 106) {
        _isIphoneX = false;
    } else {
        _isIphoneX = !Platform.isPad &&
            !Platform.isTVOS &&
            (dimen.height === 812 || dimen.width === 812 || dimen.height === 896 || dimen.width === 896);
    }
    return _isIphoneX;
}