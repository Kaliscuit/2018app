import React from 'react';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';

export default class extends React.Component {

    static defaultProps = {
        flex: false
    }
    style = {}
    constructor(props) {
        super(props);
        if (props.flex) {
            this.style.flex = 1;
        }
    }

    render() {
        const { children } = this.props;
        return <View style={[this.style, this.props.style]}>
            {children}
        </View>
    }
}