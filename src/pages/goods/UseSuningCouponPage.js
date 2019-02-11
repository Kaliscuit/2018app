'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Dimensions,
    Clipboard,
    TextInput,
    Platform
} from 'react-native';
import { px, isIphoneX } from "../../utils/Ratio";
import request, { domain } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { config } from '../../services/Constant';
import { Header, SearchView } from '../common/Header'
import Loading from '../../animation/Loading'
import TabView from 'react-native-scrollable-tab-view2'
import { TabBar } from "../common/Tabs"
import List from "../common/List"
import tools from "../../utils/tools"
import Icon from "../../UI/lib/Icon"
import Background from '../../UI/lib/Background'
import { EButton } from "../../UI/lib/Button"
import base from "../../styles/Base"
import Page, {FootView} from '../../UI/Page'
import { SuningCouponItem, USuningCouponItem, Empty } from '../common/SuningCoupon'

const deviceWidth = Dimensions.get('window').width;

class CouponList extends React.Component {
    render() {
        const {reTry} = this.props
        return <FlatList
            data={this.props.list}
            keyExtractor={(item, index) => index + ''}
            style={{ width: deviceWidth, backgroundColor: "#f2f2f2"}}
            numColumns={1}
            renderItem={({ item, index }) => this.renderItem(item, index)}
            initialNumToRender={2}
            ListEmptyComponent={<Empty />}
            ListFooterComponent={
                this.props.type == 1 && <View style={{ width: px(750), height: isIphoneX() ? px(155) : px(95) }} />
            }
        />
        
    }
    
    renderItem(item, index) {
        let type = this.props.type, couponUsed = this.props.couponUsed;
        if (type == 1) {
            return <SuningCouponItem
                key={index}
                btType="select"
                list={item}
                couponUsed={couponUsed}
                selectTo={this.props.selectTo.bind(this)}
            />
        } else {
            return <USuningCouponItem key={index} btType="null" list={item} />
        }
    }
}

export default class extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            count1: this.props.navigation.state.params.validCoupons.length || 0,
            count2: this.props.navigation.state.params.noValidCoupons.length || 0,
            list1: this.props.navigation.state.params.validCoupons || [],
            list2: this.props.navigation.state.params.noValidCoupons || [],
            couponUsed: this.props.navigation.state.params.couponUsed.successList || [],
            suningParams: this.props.navigation.state.params.suningParams || {},
            selected: [],
            refreshing: false,
            reTry: false
        };
    }
    
    title = '苏宁代金券'
    render() {
        const { list1, list2, refreshing, count1, count2, couponUsed } = this.state
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <Header navigation={this.props.navigation} title="苏宁代金券" />
            
            <View style={{marginBottom: px(23)}}>
                <TabBar ref={e => this.tabs = e}
                    index={0}
                    data={[{ name: "可用代金券(" + count1 + ")", id: 1 }, { name: "不可用代金券(" + count2 + ")", id: 2 }]}
                    onChange={index => this.tabChange(index)} />
            </View>
            <TabView page={this.state.index}
                prerenderingSiblingsNumber={2}
                initialPage={0}
                lazy={true}
                onChangeTab={(i) => this.pageChange(i)}
                renderTabBar={false}>
                <CouponList
                    list={list1}
                    refreshing={refreshing}
                    type="1"
                    couponUsed={couponUsed}
                    selectTo={this.select.bind(this)}
                />
                <CouponList
                    list={list2}
                    refreshing={refreshing}
                    type="2"
                />
            </TabView>
            <FootView>
                <TouchableWithoutFeedback onPress={() => this.confirm()}>
                    <View style={[styles.confirm, base.inline]}>
                        <Text allowFontScaling={false} style={styles.confirmTxt}>确定</Text>
                    </View>
                </TouchableWithoutFeedback>
            </FootView>
        </View>
    }
    
    tabChange(index) {
        if (this.state.index != index) this.setState({ index })
    }
    pageChange(i) {
        this.tabs.setIndex2(i.i);
    }
    loading = false;
    
    async componentDidMount() {
    
    }
    
    
    /*async select(couponNumber, fusionCouponList) {
        try {
    
            let { couponUsed } = this.state
            let fun = (fusionCouponList || []).concat([couponNumber])
            let f = fun.filter(v => couponUsed.includes(v));
            if (f.length === 0) { //no交集
                console.log('no交集')
                couponUsed = [couponNumber]
            } else { //yes交集
                if (couponUsed.indexOf(couponNumber) == -1) {
                    console.log('yes交集之前不在数组')
                    couponUsed.push(couponNumber)
                    console.log(couponUsed, 'yes交集之前不在数组')
                } else {
                    console.log('yes交集之前在数组===')
                    couponUsed.splice(couponUsed.indexOf(couponNumber), 1)
                    console.log(couponUsed, 'yes交集之前在数组===')
                }
            }
           
            //console.log(couponUsed, '======select')
            this.setState({
                couponUsed: couponUsed || []
            })
    
        } catch (e) {
            toast(e.message);
        }
        
        
        
        
        
        
    }*/
    async select(couponNumber, fusionCouponList) {
        try {
            //console.log(selected, '====')
            let { couponUsed } = this.state
            let fun = fusionCouponList || []
            if (couponUsed.indexOf(couponNumber) !== -1) {
                couponUsed.splice(couponUsed.indexOf(couponNumber), 1);
            } else {
                couponUsed = fun.filter(v => couponUsed.includes(v)).concat([couponNumber]);
            }
            //let fun = (fusionCouponList || []).concat([couponNumber])
            //f = fun.filter(v => couponUsed.includes(v)).concat([couponNumber]);
            //let f = fun.filter(v => couponUsed.includes(v))
            /*console.log(f, '========')
            if (f.indexOf(couponNumber) == -1) {
                f.push(couponNumber)
                console.log(f, 'yes交集之前不在数组')
            } else {
                f.splice(f.indexOf(couponNumber), 1)
                console.log(f, 'yes交集之前在数组===')
            }*/
            /*if (f.length === 0) { //no交集
                console.log('no交集')
                couponUsed = [couponNumber]
            } else { //yes交集
                if (couponUsed.indexOf(couponNumber) == -1) {
                    console.log('yes交集之前不在数组')
                    couponUsed.push(couponNumber)
                    console.log(couponUsed, 'yes交集之前不在数组')
                } else {
                    console.log('yes交集之前在数组===')
                    couponUsed.splice(couponUsed.indexOf(couponNumber), 1)
                    console.log(couponUsed, 'yes交集之前在数组===')
                }
            }*/
            
            //console.log(couponUsed, '======select')
            this.setState({
                couponUsed: couponUsed || []
            })
            
        } catch (e) {
            toast(e.message);
        }
        
        
        
        
        
        
    }
    
    confirm() {
        if (this.state.count1 == 0) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.state.params.callbackF(this.state.couponUsed);
            this.props.navigation.goBack();
        }
    }
}


const styles = StyleSheet.create({
    fansNum: {
        borderWidth: 1,
        paddingLeft: px(30),
        paddingRight: px(30),
        borderColor: '#fbfafc',
        height: px(80),
        display: 'flex',
        width: px(750),
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    fansNumItem: {
        color: '#858385'
    },
    recruit: {
        paddingLeft: px(30),
        paddingRight: px(30),
        paddingTop: px(25),
        paddingBottom: px(25),
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: px(140),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        backgroundColor: '#fff'
    },
    recruitHeadWrap: {
        marginRight: px(20),
        width: px(90),
        height: px(90)
    },
    recruitHead: {
        width: px(90),
        height: px(90),
        borderRadius: px(45),
    },
    recruitInfo: {
        flex: 1
    },
    recruitName: {
        fontSize: px(28),
        color: '#252426',
        height: px(45),
        textAlignVertical: 'center'
    },
    recruitName2: {
        fontSize: px(28),
        color: '#252426',
        height: px(45),
        textAlignVertical: 'center'
    },
    recruitDate: {
        marginTop: px(45),
        height: px(45),
        textAlignVertical: 'center',
        fontSize: px(24)
    },
    confirm: {
        width: px(750),
        height: px(96),
        backgroundColor: '#ffa914'
    },
    confirmTxt: {
        color: '#fff',
        fontSize: px(34)
    }
});
