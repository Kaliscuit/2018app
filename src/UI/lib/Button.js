import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import Icon from './Icon'

export default class extends React.Component {

    static defaultProps = {
        value: "",
        disabled: false,
        style: null,
        icon: null,
        txtStyle: null,
        width: null,
        round: false,
        onPress: () => { }
    }

    render() {
        const { loadingProps, loading, icon } = this.props;
        return <TouchableOpacity activeOpacity={this.props.disabled ? 1 : 0.5} onPress={() => !this.props.disabled && this.props.onPress()}>
            <View style={[styles.btn, this.props.width ? { width: this.props.width } : null, this.props.round ? { borderRadius: 4 } : null, this.props.style, this.props.disabled ? { backgroundColor: "#ccc" } : null]}>
                {!loading && icon && <Icon name={icon} style={styles.icon} />}
                {!loading && <Text style={[styles.txt, this.props.txtStyle]}>{this.props.value}</Text>}
            </View>
        </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 16,
        paddingRight: 16,
        backgroundColor: "#d0648f"
    },
    icon: {
        marginRight: 5,
    },
    txt: {
        fontSize: 17,
        color: "#fff"
    },
    ebtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 2,
        borderColor: "#d0648f",
        borderWidth: 1
    },
    etxt: {
        fontSize: 14,
        color: "#d0648f"
    },
})

/**
 * 空心按钮
 * value 显示文字
 */
exports.EButton = class extends React.Component {

    static defaultProps = {
        value: "",
        disabled: false,
        style: null,
        icon: null,
        txtStyle: null,
        width: null,
        round: false,
        onPress: () => { }
    }

    render() {
        const { loadingProps, loading, icon } = this.props;
        return <TouchableOpacity onPress={() => this.props.onPress()}>
            <View style={[styles.ebtn, this.props.width ? { width: this.props.width } : null, this.props.round ? { borderRadius: 4 } : null, this.props.disabled ? { backgroundColor: "#ccc" } : null, this.props.style]}>
                <Text style={[styles.etxt, this.props.txtStyle]}>{this.props.value}</Text>
            </View>
        </TouchableOpacity>
    }
}