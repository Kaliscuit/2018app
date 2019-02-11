'use strict';

import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList
} from 'react-native'

import Page from "../../UI/Page";
import {TopHeader} from '../common/Header'
import {config} from "../../services/Constant";
import {deviceWidth, isIphoneX, px, deviceHeight} from "../../utils/Ratio";
import { get, post } from '../../services/Request';
import {getShopDetail} from "../../services/Api";

/**
 *  元素项
 */
class Item extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let { data } = this.props;
        if (!data) {
            return null;
        }
        return <View style={item.wrap}>
            <View style={item.info}>
                <Text allowFontScaling={false} style={item.name}>
                    {data.shopName}
                </Text>
                <Text allowFontScaling={false} style={item.time}>
                    {data.useDate}
                </Text>
            </View>
            <View style={item.price}>
                <Text allowFontScaling={false} style={item.num}>
                    {data.amount}
                </Text>
                <Text allowFontScaling={false} style={item.desc}>
                    金币
                </Text>
            </View>
        </View>
    }
}

const item = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        width: px(690),
        height: px(125),
        marginHorizontal: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#ebebeb',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: px(30),
        lineHeight: px(46),
        color: '#222',
    },
    time: {
        fontSize: px(24),
        lineHeight: px(40),
        color: '#999999'
    },
    price: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: px(52),
        overflow: 'hidden',
    },
    num: {
        fontSize: px(48),
        lineHeight: px(52),
        fontWeight: '600',
        color: '#222',
    },
    desc: {
        marginLeft: px(10),
        fontSize: px(24),
        lineHeight: px(46),
        color: '#666666'
    }
})

/**
 *  金币核验页面
 *  展示金币交易记录，扫描二维码
 * */
export default class extends Page {
    constructor(props) {
        super(props)

        this.state = {
            refreshing: false,
            list: [],
        }
    }
    alertStyle = {
        paddingHorizontal: px(50),
        alignItems: 'flex-start'
    }
    async goHelp() {
        this.refs.dialog.open({
            title: '使用帮助',
            content: ['1.点击扫描金币二维码，打开摄像头；', '2.确认对方已打开金币二维码，并扫描金币二维码；', '3.扫描成功会提示已扫金币二维码面额，确认后完成。'],
            btns: [{
                txt: '我知道了'
            }]
        })
    }

    pageHeader() {
        return <TopHeader
            navigation={this.props.navigation}
            title="金币核验"
            rightBtn={
                <Text style={{color: '#858385', width: px(140)}} onPress={() => this.goHelp()}>
                    使用帮助
                </Text>
            }
        />
    }

    pageBody() {
        let { list, refreshing } = this.state;
        return <View style={{flex: 1}}>
            <FlatList
                style={{flex: 1, backgroundColor: '#fff'}}
                data={list || []}
                refreshing={refreshing}
                onRefresh={() => this.refresh()}
                keyExtractor={(item, index) => index + ''}
                renderItem={(item) => <Item data={item.item} />}
                contentContainerStyle={{ backgroundColor: "#fff" }}
            />
        </View>
    }

    pageFooter() {
        let is = isIphoneX()
        return <View style={{width: deviceWidth}}>
            <View style={styles.tipWrap}>
                <Text allowFontScaling={false} style={styles.tip}>
                    若扫码异常，请检查手机是否开启相机访问权限
                </Text>
            </View>
            <TouchableOpacity onPress={() => this.goQrCode()}>
                <View style={[styles.qrCodeFooter, is ? {
                    marginBottom: px(40),
                } : {}]}>
                    <Text allowFontScaling={false} style={styles.qrCodeFooterText}>
                        扫描金币二维码
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    }

    // 打开二维码页面
    goQrCode() {
        //
        this.props.navigation.navigate('GoldQrCode', {});
    }

    // 加载
    async componentDidMount() {
        this.props.navigation.addListener('didFocus', async () => {
            await this.refresh()
            this.setState({ loaded: true })
        })
    }

    async refresh() {
        try {
            let shop = await getShopDetail();
            let res = await get(`/stunner/goldCheckList.do?shopId=${shop.id}`)
            this.setState({
                list: res.goldCheckList || [],
            })
        } catch (e) {
            this.$toast(e.message)
        }
    }
}

const styles = StyleSheet.create({
    qrCodeFooter: {
        width: deviceWidth,
        height: px(98),
        backgroundColor: '#d0648f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrCodeFooterText: {
        fontSize: px(34),
        color: '#fff'
    },
    tip: {
        fontSize: px(24),
        color: '#d0648f',
    },
    tipWrap: {
        justifyContent: 'center',
        alignItems: 'center',
        width: deviceWidth,
        height: px(45),
        backgroundColor: 'rgba(252,240,243,0.9)'
    }
})
