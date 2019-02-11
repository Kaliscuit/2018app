import React from 'react';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';

export default class Icon extends React.Component {

    constructor(props) {
        super(props);
    }

    static defaultProps = {
        allowFontScaling: false,
        adjustsFontSizeToFit: false
    }
    render() {
        const { children } = this.props;
        return <Text ref="txt" {...this.props}>
            {children}
        </Text>
    }

    setNativeProps(obj) {
        if (this.refs.txt) this.refs.txt.setNativeProps(obj);
    }
}
