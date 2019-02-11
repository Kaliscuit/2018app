import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import Page from "../../UI/Page";
import {deviceWidth, px} from "../../utils/Ratio";
import {TopHeader} from '../common/Header'
import Icon from "../../UI/lib/Icon";
import Background from '../../UI/lib/Background';
import {getShopDetail, User} from "../../services/Api";
import { get, post } from '../../services/Request';


export default class extends Page {
    constructor(props) {
        super(props)

        this.state = {
            shopId: ''
        }
    }
    pageHeader() {
        return <TopHeader
            navigation={this.props.navigation}
            title="扫描结果"
            hiddenBack={true}
            leftBtn={
                <TouchableOpacity onPress={() => this.goBack()}>
                    <View style={{ height: 30, width: 30, justifyContent: "center", marginLeft: px(20) }}>
                        <Icon name="gold-close" style={{ width: px(26), height: px(28) }} />
                    </View>
                </TouchableOpacity>
            }
        />
    }

    pageBody() {
        let { amount, shopName, startTime, endTime, code } = this.props.navigation.state.params
        return <View style={{flex: 1, paddingVertical: px(30), backgroundColor: '#fff'}}>
            <Background style={{width: px(750), height: px(674)}} name="scan-bg" resizeMode={'cover'}>
                <View style={styles.gold}>
                    <View style={styles.goldWrap}>
                        <Text allowFontScaling={false} style={styles.num}>{amount}</Text>
                        <Text allowFontScaling={false} style={styles.desc}>金币</Text>
                    </View>
                </View>
                <View style={styles.info}>
                    <Text allowFontScaling={false} style={styles.name}>
                        {shopName}
                    </Text>
                    <Text allowFontScaling={false} style={styles.timeTitle}>
                        金币有效期
                    </Text>
                    <Text allowFontScaling={false} style={styles.time}>
                        {startTime} ~ {endTime}
                    </Text>
                </View>
            </Background>
            <TouchableOpacity onPress={() => this.used(code)}>
                <View style={styles.btns}>
                    <Text allowFontScaling={false} style={{fontSize: px(36), color: '#fff'}}>确认使用</Text>
                </View>
            </TouchableOpacity>
        </View>
    }

    async onReady() {
        try {
            let shop = await getShopDetail();
            this.setState({
                shopId: shop.id
            })
        } catch (e) {
            this.$toast(e.message)
        }
    }

    goBack() {
        if (this.props.navigation.state.params) {
            this.props.navigation.state.params.callback && this.props.navigation.state.params.callback();
        }
        this.props.navigation.goBack();
    }

    async used(code) {
        try {
            let res = await get(`/stunner/useGold.do?id=${code}&shopId=${this.state.shopId}`)
            if (res.count == 0) {
                this.$toast("使用失败")
                return;
            }

            this.$toast("使用成功")
            setTimeout(() => {
                this.pop(2)
            }, 1000)
        } catch (e) {
            this.$toast(e.message)
        }
    }
}

const styles = StyleSheet.create({
    back: {
        marginLeft: px(10)
    },
    gold: {
        width: deviceWidth,
        height: px(376),
        justifyContent: 'center',
        alignItems: 'center'
    },
    goldWrap: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    num: {
        fontSize: px(200),
        color: '#fff',
        fontWeight: '600',
        lineHeight: px(204),
    },
    desc: {
        marginLeft: px(16),
        fontSize: px(36),
        color: '#fff',
        lineHeight: px(150),
    },
    info: {
        width: deviceWidth,
        height: px(298),
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        marginBottom: px(30),
        fontSize: px(40),
        color: '#222',
    },
    timeTitle: {
        marginBottom: px(10),
        fontSize: px(24),
        color: '#999999'
    },
    time: {
        fontSize: px(24),
        color: '#999999',
        marginBottom: px(30),
    },
    btns: {
        width: px(690),
        height: px(89),
        marginHorizontal: px(30),
        marginTop: px(10),
        borderRadius: px(10),
        overflow: 'hidden',
        backgroundColor: '#d0648f',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
