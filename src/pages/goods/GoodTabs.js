'use strict';

import React, { Component } from 'react';
import {
    Text, View,
    StyleSheet,
    TouchableWithoutFeedback,
    Image
} from 'react-native'
import { px } from '../../utils/Ratio';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'


export default class extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0
        }
    }
    
    render() {
        return <View style={[styles.container]}>
            {this.props.tabs.map((tab, i) => <TouchableWithoutFeedback
                onPress={() => this.click(i)}
                key={i}
            >
                <View style={[styles.tab, base.inline, {backgroundColor: this.props.activeTab != i ? '#fcfcfc' : '#fff'}]}>
                    {
                        this.props.activeTab == i && <Icon
                            style={{width: px(19), height: px(24), marginRight: px(10)}}
                            name="icon-detail-tab1"/>
                    }
                    <Text
                        allowFontScaling={false}
                        style={this.props.activeTab == i ? [styles.textActive] : [styles.textNoActive]}>
                        {tab.name}
                    </Text>
                    {
                        this.props.tabs.length - 1 != i && <Text
                            allowFontScaling={false}
                            style={styles.border}>
                            |
                        </Text>
                    }
                </View>
            </TouchableWithoutFeedback>
            )}
        </View>
    }
    go(i) {
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }
    set(i) {
        this.setState({ activeTab: i })
    }
    /**
     * 点击跳转
     * @param {*} i
     */
    click(i) {
        /*if (this.state.activeTab === i) return;
        this.setState({ activeTab: i })*/
        this.props.goToPage(i)
    }
}
const styles = StyleSheet.create({
    container: {
        height: px(97),
        width:px(750),
        backgroundColor: '#fff',
        //marginTop:px(20),
        flexDirection:'row'
    },
    tab: {
        height: px(97),
        flex: 1
    },
    textActive: {
        color: '#333',
        fontSize: px(28)
        
    },
    textNoActive: {
        color: '#999',
        fontSize: px(28),
    },
    border: {
        color:'#e3e3e3',
        fontSize: px(28),
        marginBottom:px(1),
        position:'absolute',
        right:px(0)
    }
})