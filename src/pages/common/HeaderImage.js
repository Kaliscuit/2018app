import React, { Component } from 'react'
import {
    Image,
    View
} from 'react-native';

import CircleBackground from "./CircleBackground";
import {px} from '../../utils/Ratio'

/**
 * @ClassName: HeaderImage
 * @Desc:      圆形头控件
 * @Author:    luhua
 * @Date:      2018-04-10 18:38:56
 */
export default class HeaderImage extends Component{

    render() {
        return (
            <CircleBackground
                radius={px(55)}
                percent={px(112)}
                borderWidth={1}>
                <Image style={[this.props.Style, {width: px(110), height: px(110)}]}
                       resizeMode={'stretch'}
                       source={{uri: this.props.imgSource}}
                />
            </CircleBackground>
        );
    }


}