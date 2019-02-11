/**
 * Created by qiaopanpan on 2017/9/1.
 
 */
'use strict';

import React, { PureComponent } from 'react';
import {
    Text, View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native'
import { px } from '../../utils/Ratio';
import { logWarm } from '../../utils/logs'

export default class extends PureComponent {
    /*propTypes = {
        goToPage: React.PropTypes.func, // 跳转到对应tab的方法
        activeTab: React.PropTypes.number, // 当前被选中的tab下标
        tabs: React.PropTypes.array, // 所有tabs集合
    }*/

    render() {
        const { paddingValue, style, color, activeColor, borderColor } = this.props

        return (
            <View style={[styles.container, { paddingLeft: px(paddingValue), paddingRight: px(paddingValue) }, style]}>
                <View style={styles.tabs}>
                    {this.props.tabs.map((tab, i) => 
                        <TouchableOpacity
                            activeOpacity={0.9}
                            key={i}
                            onPress={() => this.props.goToPage(i)}
                            style={[styles.tab, { borderBottomColor: this.props.activeTab == i ? borderColor ? borderColor : '#e86d78' : '#fff' }]}>
                            <Text style={{ color: this.props.activeTab == i ? activeColor ? activeColor : '#252426' : color ? color : '#858385' }}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

        )
    }
}
const styles = StyleSheet.create({
    container: {
        width: px(750),
        height: px(80),
        //borderColor:'#000',
        backgroundColor: '#fff',
        //borderBottomWidth:px(1),
        flexDirection: 'row',
        // marginBottom: px(20)
    },
    tabs: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tab: {
        //flex:-1,
        height: px(80),
        //paddingLeft:px(27),
        //paddingRight:px(27),
        //flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: px(5)
    }
})

export class Tab2 extends PureComponent {
    render() {
        const { paddingValue, style, color, activeColor, borderColor } = this.props

        return (
            <View style={ tab2Styles.container }>
                <View style={ tab2Styles.tabs }>
                    {this.props.tabs.map((tab, i) => {
                        return <TouchableOpacity
                            activeOpacity={0.9}
                            key={i}
                            onPress={() => this.props.goToPage(i)}
                            style={ tab2Styles.tabTouchable }>
                            <Text style={ [
                                tab2Styles.tab,
                                this.props.activeTab == i && tab2Styles.activeColor
                            ] }>
                                {tab}
                            </Text>
                            <View style={ this.props.activeTab == i && tab2Styles.activeLine }></View>
                        </TouchableOpacity>
                    })}
                </View>
            </View>

        )
    }
}

const tab2Styles = StyleSheet.create({
    container: {
        height: px(80),
        backgroundColor: '#FBFAFC',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    tabs: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tabTouchable: {
        flex: 1,
        height: px(80),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
    },
    activeColor: {
        color: '#D0648F'
    },
    activeLine: {
        height: 3,
        width: px(32),
        position: 'absolute',
        bottom: px(13),
        borderRadius: 2,
        backgroundColor: '#D0648F'
    }
})

export class OwnerTab extends PureComponent {
    render() {
        const { paddingValue, style, color, activeColor, borderColor } = this.props

        return (
            <View style={ ownerStyle.container }>
                <View style={ ownerStyle.tabs }>
                    {this.props.tabs.map((tab, i) => {
                        return <TouchableOpacity
                            activeOpacity={0.9}
                            key={i}
                            onPress={() => this.props.goToPage(i)}
                            style={ ownerStyle.tabTouchable }>
                            <Text style={ [
                                ownerStyle.tab,
                                this.props.activeTab == i && ownerStyle.activeColor
                            ] }>
                                {tab}
                            </Text>
                            <View style={ this.props.activeTab == i && ownerStyle.activeLine }></View>
                        </TouchableOpacity>
                    })}
                </View>
            </View>

        )
    }
}

const ownerStyle = StyleSheet.create({
    container: {
        height: px(80),
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
        marginHorizontal: px(185)
    },
    tabs: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
    },
    tabTouchable: {
        flex: 1,
        height: px(80),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#222'
    },
    activeColor: {
        color: '#D0648F'
    },
    activeLine: {
        height: px(4),
        width: px(28),
        position: 'absolute',
        bottom: 0,
        borderRadius: 2,
        backgroundColor: '#D0648F'
    }
})

export class AfterSalesT extends PureComponent {
    render() {
        const { paddingValue, style, color, activeColor, borderColor } = this.props

        return (
            <View style={[afterSalesStyles.container, { paddingLeft: px(paddingValue), paddingRight: px(paddingValue) }, style]}>
                <View style={afterSalesStyles.tabs}>
                    {this.props.tabs.map((tab, i) => 
                        <TouchableOpacity
                            activeOpacity={0.9}
                            key={i}
                            onPress={() => this.props.goToPage(i)}
                            style={[afterSalesStyles.tab, { borderBottomColor: this.props.activeTab == i ? '#D0648F' : '#fff' }]}>
                            <Text style={{ color: this.props.activeTab == i ? '#D0648F' : '#858385' }}>
                                { tab }
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

        )
    }
}
const afterSalesStyles = StyleSheet.create({
    container: {
        width: px(750),
        height: px(80),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center'
    },
    tabs: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tab: {
        height: px(60),
        justifyContent: 'space-around',
        borderBottomWidth: px(3)
    }
})