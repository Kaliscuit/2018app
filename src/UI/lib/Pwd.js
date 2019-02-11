'use strict';

import React from 'react';

import {
    Text,
    TextInput,
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView
} from "react-native";

export default class Pwd extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pwd: ""
        }
    }
    render() {
        return <TextInput
            style={this.props.style}
            value={this.state.pwd}
            placeholder={this.props.placeholder}
            keyboardType='default'
            autoCapitalize="none"
            secureTextEntry={true}
            maxLength={this.props.maxLength || 20}
            underlineColorAndroid="transparent"
            onChangeText={this.setPwd.bind(this)}>
        </TextInput>
    }

    pwd = [];
    setPwd(txt) {
        // let list = txt.split('');
        // if (list.length === 0) {
        //     this.pwd[0] = txt;
        // } else {
        //     this.pwd.length = list.length;
        //     list.forEach((item, index) => {
        //         if (item !== "*") {
        //             this.pwd[index] = item;
        //             list[index] = "*";
        //         }
        //     })
        // }
        // for (let index = 0; index < this.pwd.length; index++) {
        //     const item = this.pwd[index];
        //     if (item === undefined) {
        //         this.pwd[index] = "*"
        //     }
        // }

        this.setState({
            pwd: txt
        })
        this.props.onChangeText && this.props.onChangeText(txt);
    }
}