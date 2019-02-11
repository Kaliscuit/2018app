'use strict'

import React, {Component} from 'react'

import {
    View,
    Text,
    StyleSheet
} from 'react-native'

import {deviceHeight, deviceWidth, px, isIphoneX} from "../../utils/Ratio";
import Icon from '../../UI/lib/Icon'

export default class extends Component {
    constructor(props) {
        super(props);

        let headerHeight = isIphoneX() ? px(50) + 44 : 44
        this.emptyMarginTop = deviceHeight / 2 - px(470) / 2 - headerHeight - px(160)
    }

    render() {
        return (
            <View style={[styles.container, {
                marginTop: this.emptyMarginTop
            }]}>
                <Icon name={'icon-message-none'} width={px(438)} height={px(335)}/>
                <Text style={styles.emptyTxt}>暂无消息</Text>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        width: px(750), height: px(470), backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    emptyTxt: {
        fontSize: px(28),
        color: '#999'
    }
})