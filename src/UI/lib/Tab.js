'use strict';

import React, { PureComponent } from 'react';
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Platform
} from 'react-native'

import { px, deviceWidth } from "../../utils/Ratio"
import base from '../../styles/Base'
import { log } from '../../utils/logs';

/**
 * tab选项组件
 */
export default class extends React.PureComponent {

    static defaultProps = {
        setLayout: null,
        data: [],
        onClick: null,
        renderItem: function (item, index, curr) { },
        contentContainerStyle: null
    }
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
        }
    }
    render() {
        return <ScrollView ref="tabView"
            horizontal={true}
            contentContainerStyle={this.props.contentContainerStyle}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            directionalLockEnabled={true}
            scrollsToTop={false}
            bounces={false} >
            {this.props.data.map((item, index) => this.renderItem(item, index))}
        </ScrollView>
    }
    renderItem(item, index) {
        return <View key={index} onLayout={e => this.setListLayout(e.nativeEvent, index)}>
            <TouchableOpacity activeOpacity={.8} onPress={() => this.click(item, index)}>
                {this.props.renderItem(item, index, this.state.activeTab)}
            </TouchableOpacity>
        </View>
    }
    setLayout(e) {
        if (this.props.setLayout) this.props.setLayout(e);
    }
    list = []
    list_len = 0;
    setListLayout(e, i) {
        this.list[i] = e.layout.width;
        this.list_len = this.list.reduce((a, b) => {
            if (b) a += b;
            return a;
        }, 0);
        if (this.list.length === this.props.data.length) this.set(this.state.activeTab)
    }
    goTo(i) {
        this.setState({ activeTab: i })
        this.props.onClick && this.props.onClick(i)
    }
    set(i) {
        this.setState({ activeTab: i });
        let len = 0;
        for (let index = 0; index < i; index++) {
            len += this.list[index];
        }
        if (len > deviceWidth / 2 && len < this.list_len - deviceWidth / 2) {
            len -= deviceWidth / 2 - this.list[i] / 2;
            this.refs.tabView.scrollTo({ x: len });
        } else if (len > this.list_len - deviceWidth / 2) {
            this.refs.tabView.scrollToEnd()
        } else {
            this.refs.tabView.scrollTo({ x: 0 });
        }
    }
    click(item, i) {
        if (this.state.activeTab === i) return;
        this.set(i)
        this.props.onClick && this.props.onClick(i)
    }
}