'use strict';

import React, { Component, PureComponent } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { px } from '../../utils/Ratio';
import { log } from '../../utils/logs';
import request, { get, getHeader, post } from "../../services/Request";
import { setItem, removeItem, getItem } from '../../services/Storage';
import Icon from '../../UI/lib/Icon'

class PayPlatformItem extends PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let { item, index, selectIndex, select } = this.props;
        let isSelect = selectIndex == index ? 0 : 1;
        return <TouchableWithoutFeedback onPress={() => select(index, item.code)}>
            <View style={styles.platformItem}>
                <Image style={styles.payLogo} source={{ uri: item.logo }} />
                <View style={[styles.wrap, {
                    borderBottomColor: index ? '#fff' : '#efefef'
                }]}>
                    <View style={styles.content}>
                        <View style={styles.name}>
                            <Text allowFontScaling={false} style={styles.nameFont}>{item.name}</Text>
                            {item.isDefault ? <View style={styles.recommendRoot}>
                                <Text allowFontScaling={false} style={styles.recommend}>推荐</Text>
                            </View> : null}
                        </View>
                        <Text allowFontScaling={false} style={[styles.desc, {
                            color: `#${item.color}`
                        }]}>{item.promptMessage}</Text>
                    </View>
                    <View style={styles.selectWrap}>
                        {isSelect === 1 ? <Icon name="icon-default-address-un" style={styles.selectBar} /> :
                            <Icon name="icon-default-address" style={styles.selectBar} />}
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }
}

class PayPlatformItemController extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { selectIndex, select, isAll, payList, openAll } = this.props;
        return <View>
            {
                isAll && payList && payList.map((item, index) =>
                    <PayPlatformItem key={index} item={item} index={index} selectIndex={selectIndex} select={select} />)
            }
            {
                !isAll && payList && payList[0] && <PayPlatformItem item={payList[0]} index={0} selectIndex={selectIndex} select={select} />
            }
            {
                !isAll && payList && payList.length > 1 && <TouchableWithoutFeedback onPress={() => openAll()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: px(750), height: px(80) }}>
                        <Text allowFontScaling={false} style={styles.titleFont}>查看更多支付方式</Text>
                        <Image style={{ width: px(19), height: px(11), marginLeft: px(10) }} source={{ uri: require('../../images/pay-more') }}></Image>
                    </View>
                </TouchableWithoutFeedback>
            }
        </View>
    }
}

class PayPlatformList extends Component {
    select(index, id) {
        this.setState({
            selectIndex: index
        }, () => {
            this.selectEvent(index, id)
        });
    }
    openAll() {
        this.setState({
            isAll: true
        })
    }
    constructor(props) {
        super(props);
        this.state = {
            selectIndex: 0,
            done: false,
            payList: [],
            isAll: true
        };
        this.selectEvent = this.props.select
            ? this.props.select
            : (index, id) => {
                log('selected handle.', id)
            };
        this.select = this.select.bind(this);
        this.openAll = this.openAll.bind(this);
    }

    render() {
        if (!this.state.done) return null;
        return <View style={styles.payList}>
            {
                this.state.payList && <PayPlatformItemController openAll={this.openAll} isAll={this.state.isAll} payList={this.state.payList} selectIndex={this.state.selectIndex} select={this.select}></PayPlatformItemController>
            }
        </View>
    }

    async componentDidMount() {
        let payList = await this.getPayInfoList();
        let uid = getHeader('uid')
        let paycode = await getItem(`payPlatform${uid}`);
        let defaultIndex = 0;
        let states = {
            done: true,
        }

        payList.map((item, index) => {
            if (item.code == paycode) {
                defaultIndex = index;
            }
        })

        if (!paycode) {
            states.isAll = true;
        } else {
            let lists = []
            if (payList[defaultIndex]) {
                lists.push(payList[defaultIndex])
            }
            let others = payList.filter(item => item.code != paycode) || []
            lists = lists.concat(others);

            payList = lists;
            defaultIndex = 0;
            states.isAll = false;
        }
        states.payList = payList;
        states.selectIndex = defaultIndex
        this.setState(states)
    }

    getPayPlatformCode() {
        return this.state.payList[this.state.selectIndex] && this.state.payList[this.state.selectIndex].code;
    }

    async getPayInfoList() {
        try {
            let payList = await get(`/payType/list.do`) || [];
            return payList;
        } catch (e) {
            return [];
        }
    }
}

export default class extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <View style={[styles.platformContainer, this.props.fixed ? {marginBottom: 0} : {}]}>
            <View style={styles.title}>
                <Text allowFontScaling={false} style={styles.titleFont}>选择支付方式</Text>
            </View>
            <PayPlatformList ref="payPlatform" select={this.props.select} />
        </View>
    }

    getCode() {
        let code = this.refs['payPlatform'].getPayPlatformCode();
        return code ? code : '';
    }
}

const styles = StyleSheet.create({
    platformContainer: {
        marginTop: px(20),
        backgroundColor: '#fff',
        marginBottom: px(200)
    },
    title: {
        justifyContent: 'center',
        height: px(80),
        paddingLeft: px(30),
        marginBottom: px(2),
        borderBottomWidth: px(1),
        borderBottomColor: '#f6f5f7'
    },
    titleFont: {
        fontSize: px(24),
        color: '#858385',
        includeFontPadding: false
    },
    payList: {
        // height: px(200)
    },
    platformItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: px(100),
        paddingLeft: px(30)
    },
    payLogo: {
        width: px(44),
        height: px(44)
    },
    content: {
        flex: 1
    },
    name: {
        flexDirection: 'row',
        alignItems: 'center',
        height: px(26)
    },
    nameFont: {
        fontSize: px(26),
        color: '#252426',
        includeFontPadding: false
    },
    recommendRoot: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(44),
        height: px(24),
        marginLeft: px(10),
        backgroundColor: '#d0648f',
        borderRadius: px(4),
        overflow: 'hidden'
    },
    recommend: {
        fontSize: px(18),
        color: '#fff',
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    desc: {
        paddingTop: px(10),
        fontSize: px(20),
        color: '#858385',
        includeFontPadding: false
    },
    wrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: px(100),
        marginLeft: px(20),
        borderBottomWidth: px(1)
    },
    selectBar: {
        width: px(34),
        height: px(34)
    },
    selectWrap: {
        marginRight: px(32)
    }
});
