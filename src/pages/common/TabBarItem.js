/**
 * @ClassName: TabBarItem
 * @Desc:      底部导航封装点击效果封装
 * @Author:    luhua
 * @Date:      2018-04-10 18:38:56
  */

import React, {PureComponent} from 'react';
import {
    View,
    Image,
    PixelRatio,
    StyleSheet
} from 'react-native';

import ScreenUtil from '../../utils/ScreenUtil';

const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class TabBarItem extends PureComponent {

    /**
     * 绘制 TabBar Item
     * @private
     */
    _renderTabBarItem(focused,selected3x,normal3x,selected2x,normal2x) {
        if (pxRatio > 2.51) {
            if (focused) {
                return(
                    <Image source={selected3x} style={styles.tabBarIcon}/>
                )
            } else {
                return(
                    <Image source = {normal3x} style={styles.tabBarIcon}/>
                )
            }
        } else {
            if (focused) {
                return(
                    <Image source={selected2x} style={styles.tabBarIcon}/>
                )
            } else {
                return(
                    <Image source = {normal2x} style={styles.tabBarIcon}/>
                )
            }
        }

    }


    render() {
        return(
            <View testId={this.props.id}>
                {this._renderTabBarItem(this.props.focused,
                    this.props.selected3x,
                    this.props.normal3x,
                    this.props.selected2x,
                    this.props.normal2x)}
            </View>
        )
    }

}


const styles = StyleSheet.create({

    tabBarIcon: {
        width: 22,
        height: 22,
        marginTop: 5,
        marginBottom: 2,
    }

});