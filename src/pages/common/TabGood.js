'use strict';

import React, { Component } from 'react';
import {
    Text, View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated
} from 'react-native'
import { px } from '../../utils/Ratio';
import base from '../../styles/Base'


export default class extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0
        }
    }
    
    render() {
        return <View style={styles.container}>
            <ScrollView style={styles.tabs} ref='tabView'
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                directionalLockEnabled={true}
                bounces={false}
                scrollsToTop={false} >
                {this.props.tabs.map((tab, i) => <View style={[base.text_center, styles.tabbox]} key={i}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.click(i)}
                    >
                        <View style={styles.tab}>
                            <Animated.Text
                                style={this.state.activeTab == i ? [styles.textActive] : [styles.textNoActive]}>
                                {tab.name}
                            </Animated.Text>
                        </View>
                    </TouchableOpacity>
                    <Animated.View style={this.state.activeTab === i ? [styles.border, {backgroundColor: '#252426'}] : styles.border}></Animated.View>
                </View>
                )}
            </ScrollView>
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
        if (this.state.activeTab === i) return;
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }
}
const styles = StyleSheet.create({
    container: {
        height: px(70),
    },
    tabbox: {
        height: px(60),
        alignItems: 'center',
    },
    tab: {
        paddingLeft: px(25),
        paddingRight: px(25),
        position: "relative",
    },
    textActive: {
        color: '#252426',
        fontSize: px(30),
    },
    textNoActive: {
        color: '#858385',
        fontSize: px(30),
    },
    border: {
        width: px(35),
        height: px(3),
        borderRadius: px(1.5),
        position: "absolute",
        bottom: 0
    }
})