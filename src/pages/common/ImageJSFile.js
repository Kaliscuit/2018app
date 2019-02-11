import React, { PureComponent } from 'react';
import {
    Image
} from 'react-native';
import { pxRatio, px } from "../../utils/Ratio";

/**
 * @ProjectName: xc_app_rn
 * @ClassName:  ImageJSFile
 * @Desc:       显示 base64文件的组件
 * <p>
 *     imageJsFile2x: 2倍图
 *     imageJsFile3x：3倍图
 *     imageStyle： 图片颜色
 * </p>
 * @Author: luhua
 * @Date: 2018-06-14 15:34:03
 */

export default class ImageJSFile extends PureComponent {

    render() {
        return (
            <Image
                style={[{ width: px(44), height: px(44) }, this.props.imageStyle]}
                resizeMode="cover"
                source={pxRatio > 2.51 ? this.props.imageJsFile3x : this.props.imageJsFile2x} />
        );
    }

}
