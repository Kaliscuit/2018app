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
    Modal,
    TouchableOpacity
} from 'react-native';

import { px } from '../../utils/Ratio';
import { getLogs } from '../../utils/logs';
import Page from '../../UI/Page'

export default class extends Page {

    constructor(props) {
        super(props);
        this.state = {
            logs: []
        };
    }

    onLoad() {
        let logs = getLogs();
        this.setState({
            logs: logs
        });
    }
    show(index) {
        this.go("LogTxtPage", { id: index });
    }
    title = "日志"
    pageBody() {
        return <ScrollView style={styles.container}>
            <View style={styles.logs}>
                {this.state.logs.map((item, index) =>
                    <TouchableOpacity key={index} onPress={() => this.show(index)}>
                        <View style={styles.line}>
                            {item.msg[2] && <Text allowFontScaling={false} style={styles.rowTxt}>{item.msg[0] + item.msg[2]}</Text>}
                            {!item.msg[2] && <Text allowFontScaling={false} style={styles.rowTxt}>{item.msg[0]}</Text>}
                        </View>
                    </TouchableOpacity>
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
    title: {
        margin: px(10)
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: px(26),
        paddingBottom: px(26),
        paddingLeft: px(30),
        paddingRight: px(30),
        marginBottom: px(1),
        backgroundColor: '#fff'
    },
    rowLabel: {
        color: '#222',
        fontSize: px(28)
    },
    rowInput: {
        height: px(50),
        padding: px(10),
        width: px(500),
        borderColor: '#ccc',
        borderWidth: px(1)
    },
    rowBtn: {
        color: '#fff',
        fontSize: px(25),
        backgroundColor: '#eb83b2',
        padding: px(10)
    },
    rowTxt: {
        color: '#858385',
        fontSize: px(25)
    },
    headImg: {
        width: px(120),
        height: px(120),
        borderRadius: px(60)
    }
});