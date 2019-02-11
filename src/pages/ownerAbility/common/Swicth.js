import React, { PureComponent } from 'react'
import {
    View,
    Text,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    StyleSheet
} from 'react-native'

import {px} from "../../../utils/Ratio"

export default class extends PureComponent {
    constructor (props) {
        super(props)

        this.containerWidth = px(66)

        const initTab = props.initTab

        this.state = {
            firstSelected: initTab === 0 ? true : false,
            left: new Animated.Value(initTab === 0 ? 0 : this.containerWidth)
        }
    }

    render () {
        return <TouchableWithoutFeedback onPress={() => this.switchTab()}>
            <View style={ [styles.container, this.props.style] }>
                <Animated.View 
                    style={ [styles.slider, { left: this.state.left }] }
                />
                <View style={ styles.caseBox }>
                    <Text  style={ [styles.case, this.state.firstSelected && styles.caseColorRed] }>日 </Text>
                    <Text  style={ [styles.case, !this.state.firstSelected && styles.caseColorRed] }>月</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }

    switchTab () {
        this.state.left.stopAnimation()
        this.state.left.setValue(!this.state.firstSelected ? this.containerWidth : 0)

        this.setState({
            firstSelected: !this.state.firstSelected
        }, () => {
            this.props.onChange && this.props.onChange(this.state.firstSelected ? 0 : 1)
        })
        
        Animated.timing(
            this.state.left,
            {
                toValue: this.state.firstSelected ? this.containerWidth : 0,
                duration: 300,
                easing: Easing.linear
            }
        ).start()
    }
}

const styles = StyleSheet.create({
    container: {
        width: px(129),
        borderWidth: 1,
        height: px(66),
        borderColor: 'rgba(255, 207, 226, 0.6)',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: px(33),
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    slider: {
        position: 'absolute',
        left: 0,
        width: px(48),
        height: px(48),
        backgroundColor: '#fff',
        borderRadius: px(24),
        margin: px(6)
    },
    caseBox: {
        position: 'absolute',
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        zIndex: 1,
        marginHorizontal: -1
    },
    case: {
        flex: 1,
        fontSize: px(26),
        color: '#fff',
        textAlign: 'center',
    },
    caseColorRed: {
        color: '#D02D65',
    }
})