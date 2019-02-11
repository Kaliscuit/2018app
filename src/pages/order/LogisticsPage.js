'use strict';

import React from 'react';

import {
    View,
    Text,
    Image,
    Linking,
    ScrollView,
    TouchableWithoutFeedback,
    Clipboard, StyleSheet
} from 'react-native';


import { px } from '../../utils/Ratio';
import { get } from '../../services/Request'
import { show as toast } from '../../widgets/Toast';
import { TopHeader } from '../common/Header'
import Icon from '../../UI/lib/Icon'
import Tabs from './LogisticsTab'
import TabView from 'react-native-scrollable-tab-view2'
import Page from '../../UI/Page'
import base from '../../styles/Base'
export default class extends Page {

    constructor(props) {
        super(props)
        this.state = {
            date: this.props.navigation.state.params.date,
            notice_show: true,
            logistics: [],
            tipMsg: '',
            tabs: [],
            expressNoNum: this.props.navigation.state.params.expressNoNum || 0,
            activeTab: 0
        }
    }
    title='物流详情'
    pageHeader() {
        return <TopHeader navigation={this.props.navigation}
            title='物流详情'></TopHeader>
    }
    pageBody() {
        const {expressNoNum, logistics, date} = this.state
        return <View style={{ flex: 1 }}>
            {
                this.state.notice_show && this.state.tipMsg ? <View style={styles.notice}>
                    <View style={styles.left15}>
                        <Icon name="icon-notice" style={{ width: px(26), height: px(28) }} />
                    </View>
                    <View style={[styles.notice_container, styles.left6]}>
                        <Text allowFontScaling={false} style={styles.content}>
                            {this.state.tipMsg}
                        </Text>
                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        this.onClick()
                    }}>
                        <View style={styles.actionWrap}>
                            <Text allowFontScaling={false} style={[styles.close]}>×</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View> : null
            }
            {
                expressNoNum && expressNoNum > 1 &&
                <Tabs ref="tab" tabs={this.state.tabs} goToPage={(e) => this.goToPage(e)} />
            }
            <TabView page={this.state.activeTab}
                initialPage={0} locked
                onChangeTab={(i) => this.ChangeTab(i)}
                renderTabBar={false}>
                {
                    (logistics || []).map((item, i) => 
                        <View key={i} style={{flex: 1}}>
                            <TabItem
                                date={date}
                                logistics={item}
                            />
                        </View>
                    )
                }
               
            </TabView>
        </View>
    }
    pageFooter() {
        return null;
    }
    async onReady() {
        try {
            let {aoNo, skus, expressNoNum, expressNo} = this.props.navigation.state.params;
            let res = await get(`/saleOrderApp/viewLogisticsDetailNew.do?aoNo=${aoNo}&skus=${skus}`);
            let logistics = res.logistics || [];
            let alertMsg = res.alertMsg || '';
            let tabs = []
            for (let i = 1; i < expressNoNum + 1; i++) {
                tabs.push({
                    name: `包裹${i}`
                })
            }
            this.setState({
                tabs,
                logistics,
                tipMsg: alertMsg,
                expressNoNum: expressNoNum
            });
        } catch (e) {
            toast(e.message);
        }
    }
    onClick() {
        this.setState({
            notice_show: false
        })
    }
    goToPage(i) {
        this.setState({
            activeTab: i
        })
    }
    ChangeTab(i) {
        this.refs.tab && this.refs.tab.set(i.i)
    }
    

}


class TabItem extends React.Component {
    
    call(i, matchArr) {
        if (matchArr.indexOf(i) > -1) {
            this.goContact(i)
        }
    }
    
    renderItem(item, index, logistics) {
        //let str = "【北京市】  已签收, 签收人凭取货码签收, 如有疑问请电联: 17610875909 / 17610875909, 您的快递已经妥投, 如果您对我们的服务感到满意, 请给个五星好评, 鼓励一下我们【请在评价快递员处帮忙点亮五颗星星哦~】"
        //let str = 'a18811502787bcd18811502787ef15853224861aaa'
        let str = item.context
        let matchArr = str.match(/(86)?(1\d{10}|\d{7,8}|\d{3,4}-?\d{7,8})/g) || []
        let content = [], ind = 0, pre = 0;
        matchArr.forEach((i, m) => {
            let sub = str.indexOf(i, pre)
            content.push(str.substring(pre, sub), i)
            pre = sub + i.length
            ind = str.indexOf(i) + i.length
            if (m == matchArr.length - 1) {
                content.push(str.substring(pre, str.length))
            }
        })
        return <View key={index} style={{ flexDirection: 'row' }}>
            <View style={{ width: px(55), alignItems: 'stretch' }}>
                {index < logistics.data.length - 1 &&
                <View style={{
                    width: px(1), backgroundColor: '#e5e5e5', position: 'absolute', left: px(13),
                    bottom: 0, top: 0
                }} />
                }
                {!(index < logistics.data.length - 1) &&
                <View style={{
                    width: px(1), backgroundColor: '#e5e5e5', position: 'absolute', left: px(13),
                    height: px(14), top: 0
                }} />
                }
                <View style={{
                    width: px(1), backgroundColor: '#e5e5e5', position: 'absolute', left: px(13),
                    bottom: index < logistics.data.length - 1 ? px(0) : undefined,
                    height: index < logistics.data.length - 1 ? undefined : px(14),
                }} />
                {
                    index == 0 ?
                        <Icon name="icon-exoress1"
                            style={{ width: px(28), height: px(28) }} />
                        :
                        <View style={[{width: px(28), height: px(28)}, base.line]}>
                            <Icon name="icon-exoress2"
                                style={{ width: px(18), height: px(18) }} />
                        </View>
                }
            </View>
            <View key={index} style={{ paddingBottom: px(40), flex: 1 }}>
                <Text
                    allowFontScaling={false}
                    style={[ styles.normalTxt, { marginBottom: px(4), color: index == 0 ? '#d0648f' : '#858385' }]}>
                    {
                        content.length > 0 ? content.map((i, index) =>
                            <Text
                                onPress={() => this.call(i, matchArr)}
                                allowFontScaling={false}
                                key={index}
                                style={{color: matchArr.indexOf(i) > -1 ? '#44b7ea' : '#858385'}}>
                                {i}
                            </Text>) : item.context
                    }
                </Text>
                <Text allowFontScaling={false} style={[styles.normalTxt, {color: index == 0 ? '#d0648f' : '#858385' }]}>
                    {item.time || this.props.date}
                </Text>
            </View>
        </View>
    }
    
    render() {
        const { logistics } = this.props
        return <ScrollView style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <View style={{
                backgroundColor: '#fff',
                justifyContent: 'space-around',
                marginBottom: px(20),
                paddingTop: px(30),
                paddingLeft: px(70),
                paddingBottom: px(30)
            }}>
                <Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(28), marginBottom: px(10) }}>{logistics.name}</Text>
                {
                    logistics.nu != '' &&
                    <View style={styles.rows}>
                        <View><Text allowFontScaling={false} style={{ color: '#252426', fontSize: px(28), marginBottom: px(2) }}>快递单号: {logistics.nu}  </Text>
                        </View>
                        <TouchableWithoutFeedback><View style={styles.copyBtn}>
                            <Text style={styles.copyText} onPress={() => this.copy(logistics.nu)} >复制</Text>
                        </View></TouchableWithoutFeedback>
                    </View>
                }
                <TouchableWithoutFeedback onPress={() => this.goContact(logistics.tel)}>
                    <View>
                        <Text allowFontScaling={false} style={[styles.normalTxt, {color: '#252426', fontSize: px(28)}]}>快递电话:
                            <Text allowFontScaling={false} style={{ color: '#44b7ea'}}> {logistics.tel}</Text>
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={{ backgroundColor: '#fff', paddingLeft: px(70), paddingRight: px(70), paddingTop: px(20) }}>
                {(logistics.data || []).map((item, index) =>
                    this.renderItem(item, index, logistics)
                )}
            </View>
        </ScrollView>
    }
    
    copy(str) {
        Clipboard.setString(str)
        toast('复制成功');
    }
    
    goContact(tel) {
        //TODO
        Linking.openURL('tel://' + tel);
    }
}
const styles = StyleSheet.create({
    copyBtn: {
        marginLeft: px(10),
        borderWidth: px(1),
        borderColor: '#252426',
        borderRadius: px(2),
        paddingHorizontal: px(20),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: px(5),
        marginTop: px(-3),
    },
    rows: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    copyText: {
        color: '#252426',
        fontSize: px(20)
    },
    notice: {
        backgroundColor: '#ee5168',
        minHeight: px(50),
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center'
    },
    left15: {
        marginLeft: px(30),
    },
    close: {
        color: '#fff',
        fontSize: px(50),
        fontWeight: '200',
        textAlign: 'left',
    },
    actionWrap: {
        marginRight: px(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    left6: {
        marginLeft: px(15),
    },
    notice_container: {
        flex: 1,
        marginRight: px(15),
        width: 0,
        paddingTop: px(10),
        paddingBottom: px(10)
    },
    content: {
        fontSize: px(24),
        color: '#fff',
        lineHeight: px(28)
    },
    normalTxt: {
        fontSize: px(26),
        color: '#858385',
        includeFontPadding: false
    }
})
