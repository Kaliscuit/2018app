import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    ViewStyle,
    TouchableOpacity,
    StyleSheet
} from 'react-native'

import { px } from "../utils/Ratio"

import Icon from '../UI/lib/Icon'

export class WarnPrompt extends Component {

    static defaultProps = {
        isShowClose: true,
        isShowLeftIcon: true,
        isShowArrow: true,
        opacity: 0.9,
        text: '',
        leftIcon: 'icon-bell',
        clickCallback: () => { },
        closeCallback: () => { }
    }
    constructor() {
        super()

        this.state = {
            isShow: true
        }

        this.close = this.close.bind(this)
    }

    render() {
        const {
            style,
            isShowClose,
            isShowLeftIcon,
            isShowArrow,
            opacity,
            text,
            leftIcon,
            clickCallback,
        } = this.props

        return (
            this.state.isShow ? <View style={[styles.container, style]}>
                {isShowLeftIcon && <Icon name={leftIcon} style={styles.leftIcon} />}
                <TouchableOpacity
                    style={styles.centerBox}
                    activeOpacity={opacity}
                    onPress={(e) => clickCallback(e)}
                >
                    <Text style={styles.text}>{text}</Text>
                    {isShowArrow && <Icon name="icon-arrow-right" style={styles.arrowIcon} />}
                </TouchableOpacity>
                {
                    isShowClose && <TouchableOpacity
                        style={styles.closeIconBox}
                        activeOpacity={opacity}
                        onPress={this.close}
                    >
                        <Icon name="icon-close-white-order" style={styles.closeIcon} />
                    </TouchableOpacity>
                }
            </View> : null
        )
    }

    close(e) {
        this.props.closeCallback(e)
        this.setState({ isShow: false })
    }
}


const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        // paddingHorizontal: px(30),
    },
    leftIcon: {
        width: px(26),
        height: px(28),
        marginLeft: px(40)
    },
    centerBox: {
        flex: 1,
        paddingHorizontal: px(16),
        alignItems: 'center',
        flexDirection: 'row',
        marginRight: px(18)
    },
    text: {
        color: '#fff',
        fontSize: px(24),
        lineHeight: px(30)
    },
    arrowIcon: {
        width: px(10),
        height: px(17),
        marginLeft: px(12)
    },
    closeIconBox: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'space-around',
        paddingHorizontal: px(30)
    },
    closeIcon: {
        width: px(18),
        height: px(18)
    }
})