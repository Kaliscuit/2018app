/*
 * @Author: Aaron
 * @Email: shenweikang@daling.com
 * @Version: 1.0.0
 * @Date: 2018-10-17 12:24:25
 * @LastEditors: OBKoro1
 * @LastEditTime: 2018-10-17 12:28:50
 * @Description: 
 * @Class: LazyComponent
 * @Props: 
 * @Returns: Component
 * @Desc: 实现组件懒加载
 */

import React, { Component } from 'react'
import {
    View
} from 'react-native'

export default class extends Component {
    constructor () {
        super()

        this.state = {
            loaded: false
        }
    }

    render () {
        return (
            <View>
                
            </View>
        )
    }
}