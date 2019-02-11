'use strict';

import React from 'react';

import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    Modal
} from 'react-native';

import { px } from '../../utils/Ratio';
import { getLog } from '../../utils/logs';
import Page from '../../UI/Page'

export default class extends Page {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.navigation.state.params.id || 0,
            logs: []
        };
    }

    onLoad() {
        let logs = getLog(this.state.id);
        if (!logs || !logs.msg || logs.msg.constructor !== Array) return;
        let list = []
        list = logs.msg.map(item => {
            if (typeof (item) === "string") return item;
            return JSON.stringify(item);
        })
        this.title = list.shift();
        this.setState({
            logs: list
        });
    }
    title = "日志"
    pageBody() {
        return <ScrollView style={styles.container}>
            <View style={styles.logs}>
                {this.state.logs.map((item, index) =>
                    <View style={styles.line} key={index}>
                        <TextInput defaultValue={item}
                            allowFontScaling={false}
                            multiline={true}
                            style={styles.rowTxt} />
                    </View>
                )}
            </View>
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f3f6',
        flex: 1
    },
    logs: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    line: {
        borderBottomWidth: px(1),
        width: px(750),
        padding: px(10)
    },
    rowTxt: {
        color: '#858385',
        fontSize: px(25)
    },
});