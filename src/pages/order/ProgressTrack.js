'use strict';

import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import {TopHeader} from '../common/Header';
import {px} from '../../utils/Ratio';
import {get} from '../../services/Request'
import {show as toast} from '../../widgets/Toast';

const ProgressIcon = ({actived}) => <View style={styles.progressIcon}>
    {
        actived ? <Image style={styles.activeIcon} source={{uri: require('../../images/progress-active')}}/> :
            <Image style={styles.disabledIcon} source={{uri: require('../../images/progress')}}/>
    }
</View>

const ProgressItem = ({status, actived, item}) => <View style={styles.progressItem}>
    <ProgressIcon actived={actived}/>
    <View style={[styles.itemWrap, {
        borderLeftColor: status ? '#e5e5e5' : '#fff'
    }]}>
        <View style={[styles.progressContent, {
            paddingBottom: status ? px(60) : 0
        }]}>
            <Text style={[styles.font2, {
                fontWeight: actived ? 'bold' : 'normal',
                color: actived ? '#252426' : '#858385'
            }]}>{item.refundStatusTitle}</Text>
            <Text style={styles.font1}>{item.refundStatusSubheading}</Text>
            <Text style={styles.font1}>{item.refundStatusTime}</Text>
        </View>
    </View>
</View>

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            done: false
        }

        this.isWeCatHistory = props.navigation.getParam('isWeCatHistory', false)
    }

    render() {
        let len = (this.state.list || []).length;
        len = len ? --len : 0;
        return <View style={styles.trackContainer}>
            <TopHeader navigation={this.props.navigation} title="退货进度"/>
            <ScrollView>
                {!this.state.done || !this.state.list || this.state.list.length == 0 ? null : <View style={styles.progressList}>
                    {
                        this.state.list.map((item, index) =>
                            <ProgressItem key={index}
                                status={index == len ? false : true}
                                actived={index ? false : true} item={item}/>)
                    }
                </View>}
            </ScrollView>
        </View>
    }

    async componentDidMount() {
        await this.load();
    }

    async load() {
        let {params} = this.props.navigation.state;
        let srNo = params.srNo;
        try {
            const _url = this.isWeCatHistory ? 'touchHistoryReturnNodeLogList' : 'returnNodeLogList'

            let res = await get(`/return/${ _url }.do?srNo=${srNo}`)
            this.setState({
                list: res.dataList,
                done: true
            })
        } catch (e) {
            toast(e.message);
            this.props.navigation.goBack();
            return;
        }
    }


}

const styles = StyleSheet.create({
    trackContainer: {
        flex: 1
    },
    progressList: {
        justifyContent: 'center',
        paddingVertical: px(30),
        backgroundColor: '#fff'
    },
    progressItem: {
        width: px(648),
        marginHorizontal: px(51),
        paddingHorizontal: px(13)
    },
    itemWrap: {
        paddingLeft: px(50),
        borderLeftWidth: px(2)
    },
    progressContent: {
        width: px(570)
    },
    font1: {
        paddingTop: px(10),
        fontSize: px(24),
        color: '#858385'
    },
    font2: {
        fontSize: px(26)
    },
    progressIcon: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: px(28),
        height: px(28),
        zIndex: 9
    },
    activeIcon: {
        width: px(28),
        height: px(28)
    },
    disabledIcon: {
        width: px(18),
        height: px(18),
        marginHorizontal: px(5),
        marginVertical: px(5)
    }
});