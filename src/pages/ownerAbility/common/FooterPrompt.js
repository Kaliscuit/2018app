import React, { PureComponent } from 'react'
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet
} from 'react-native'
import { px } from "../../../utils/Ratio"

export class Load extends PureComponent {
    constructor() {
        super()

        this.state = {
            loading: false
        }
    }
    render() {
        return this.state.loading ? <View style={styles.container}>
            <ActivityIndicator size="small" color="#ccc" />
            <Text style={styles.loadText}>加载中...</Text>
        </View> : null
    }

    open() {
        this.setState({ loading: true })
    }

    close() {
        this.setState({ loading: false })
    }
}

export class NoData extends PureComponent {
    static defaultProps = {
        text: '没有更多商品惹'
    }

    render() {
        const { style, textStyle, lineStyle, text } = this.props

        return (
            <View style={[styles.container, style]}>
                <View style={[styles.line, lineStyle]} />
                <Text style={[styles.NoDataText, textStyle]}>{text}</Text>
                <View style={[styles.line, lineStyle]} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        marginVertical: px(30),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    line: {
        width: px(160),
        height: 1,
        backgroundColor: '#ccc'
    },
    NoDataText: {
        fontSize: px(24),
        color: '#999',
        marginHorizontal: px(30),
    },
    loadText: {
        fontSize: px(28),
        color: '#ccc',
        marginLeft: px(20)
    }
})