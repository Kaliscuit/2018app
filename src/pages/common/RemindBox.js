import React, { Component } from 'react'
import {
    View,
    Text,
    StyleSheet
} from 'react-native'
import { px } from "../../utils/Ratio"

export default class extends Component {
    static defaultProps = {
        title: '',
        titleColor: '#fff',
        width: px(500)
    }

    render() {
        const {
            style,
            bgColor,
            width,
            title,
            titleColor,
            children
        } = this.props

        return (
            <View style={[styles.container, {
                width,
                backgroundColor: bgColor
            }]}>
                <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
                <View style={[styles.line, { backgroundColor: titleColor }]}></View>
                <View>
                    {children}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: px(17),
        borderRadius: 999,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap'
    },
    title: {
        fontSize: px(26),
        color: '#fff'
    },
    line: {
        width: 1,
        height: px(18),
        marginHorizontal: px(20),
        opacity: .6
    }
})