'use strict';

import React, { Component } from 'react';
import {
    Text, View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated
} from 'react-native'
import {deviceWidth, px} from '../../utils/Ratio';
import base from '../../styles/Base'


export default class extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0
        }
    }
    
    render() {
        const {tabs} = this.props
        if (!tabs || tabs.length == 0) return null;
        if (tabs.length < 5) {
            return <View
                style={{
                    height: px(80),
                    borderBottomWidth: px(1),
                    borderBottomColor: '#efefef',
                    marginBottom: px(20),
                    backgroundColor: '#fff',
                    justifyContent:'space-around',
                    width: deviceWidth,
                    flexDirection: 'row',
                }}
            >
                {this.props.tabs.map((tab, i) => <View style={[base.text_center, styles.tabbox]} key={i}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => this.click1(i)}
                        >
                            <View style={styles.tab}>
                                <Animated.Text
                                    style={this.state.activeTab == i ? [styles.textActive] : [styles.textNoActive]}>
                                    {tab.name}
                                </Animated.Text>
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.activeTab === i ? [styles.border, {backgroundColor: '#d0648f'}] : styles.border}></View>
                    </View>
                )}
            </View>
        }
        return <View style={styles.container}>
            <ScrollView style={styles.tabs} ref='tabView'
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                directionalLockEnabled={true}
                bounces={false}
                scrollsToTop={false} >
                {this.props.tabs.map((tab, i) => <View style={[base.text_center, styles.tabbox, {paddingHorizontal: px(45)}]} key={i} onLayout={e => this.setLaout(e.nativeEvent.layout, i)}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => this.click(i)}
                    >
                        <View style={styles.tab}>
                            <Text
                                style={this.state.activeTab == i ? [styles.textActive] : [styles.textNoActive]}>
                                {tab.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <Animated.View style={this.state.activeTab === i ? [styles.border, {backgroundColor: '#d0648f'}] : styles.border}></Animated.View>
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
    
    click(i) {
        if (this.state.activeTab === i) return;
        if (!this.refs.tabView) return;
        let layout = this.laout_list[i];
        let rx = deviceWidth / 2;
        let sx = layout.x - rx + layout.width / 2;
        if (sx < 0) sx = 0;
        sx < this.scrollW - deviceWidth && this.refs.tabView.scrollTo({ x: sx, animated: true });
        sx >= this.scrollW - deviceWidth && this.refs.tabView.scrollToEnd({ animated: true });
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }
    
    click1(i) {
        if (this.state.activeTab === i) return;
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }
    laout_list = [];
    scrollW = 0;
    setLaout(layout, index) {
        this.laout_list[index] = layout;
        this.scrollW += layout.width;
    }
}
const styles = StyleSheet.create({
    container: {
        height: px(80),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        marginBottom: px(20),
        backgroundColor: '#fff'
    },
    tabs: {
        width: deviceWidth,
        paddingHorizontal: px(15)
    },
    tabbox: {
        height: px(80),
        alignItems: 'center',
    },
    tab: {
        position: "relative",
    },
    textActive: {
        color: '#d0648f',
        fontSize: px(28),
    },
    textNoActive: {
        color: '#858385',
        fontSize: px(28),
    },
    border: {
        width: px(35),
        height: px(3),
        borderRadius: px(1.5),
        position: "absolute",
        bottom: px(10)
    }
})