import React from 'react';
import {
    StyleSheet,
    View,
    TextInput,
} from 'react-native';

/**
 * 输入框
 * onChangeText
 */
export default class extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <TextInput
            allowFontScaling={false}
            adjustsFontSizeToFit={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            underlineColorAndroid="transparent"
            {...this.props}>
        </TextInput>
    }
}
