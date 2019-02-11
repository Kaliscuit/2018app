/**
 * @ClassName: NavigationItem
 * @Desc:      屏幕工具类
 * <p>
 *    ui设计基准,iphone 6
 *    width:750
 *    height:1334
 *    设备的像素密度，例如：
 *    PixelRatio.get() === 1    mdpi Android 设备 (160 dpi)
 *    PixelRatio.get() === 1.5  hdpi Android 设备 (240 dpi)
 *    PixelRatio.get() === 2    iPhone 4, 4S,iPhone 5, 5c, 5s,iPhone 6,xhdpi Android 设备 (320 dpi)
 *    PixelRatio.get() === 3    iPhone 6 plus , xxhdpi Android 设备 (480 dpi)
 *    PixelRatio.get() === 3.5  Nexus 6
 * </p>
 * @Author:    luhua
 * @Date:      2018-04-10 18:38:56
 */

'use strict';

import {
    Dimensions,
    PixelRatio
} from 'react-native';

const deviceWidth = Dimensions.get('window').width;      //设备的宽度
const deviceHeight = Dimensions.get('window').height;    //设备的高度
const defaultPixel = 2; //iphone6的像素密度
const basePixelWidth = 750;
//px转换成dp
const w2 = basePixelWidth / defaultPixel;
const h2 = 1334 / defaultPixel;
const scale = Math.min(deviceHeight / h2, deviceWidth / w2);   //获取缩放比例

/**
 * 设置text为sp
 * @param size sp
 * return number dp
 */
export default class ScreenUtil {

    /**
     * 字体比例缩放
     * @param size
     * @returns {number}
     */
    static setSpText(size) {
        size = Math.round(size * scale);
        return size;
    }

    /**
     * 尺寸比例缩放
     * @param size
     * @returns {number}
     */
    static scaleSize(size) {
        if (size == 1) {
            return size;
        } else {
            size = Math.round(size * scale / defaultPixel);
            return size;
        }

    }

    /**
     * 单位转换
     * @param px
     * @returns {number}
     */
    static px2dp(px) {
        return px * deviceWidth / basePixelWidth
    }

    /**
     * 屏幕像密度
     * @returns {number}
     */
    static getRatio() {
        return PixelRatio.get();
    }
}

























