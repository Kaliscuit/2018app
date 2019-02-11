import React from 'react'
import {
    View, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, Image
} from 'react-native'
import Page from "../../UI/Page";
import Icon from '../../UI/lib/Icon'
import { px, isIphoneX, deviceWidth } from "../../utils/Ratio";
import { get } from "../../services/Request";
import request from "../../services/Request";
import { config } from "../../services/Constant";
const PAY_TYPES = {
    'weixin': '微信支付',
    'ialipayFz': '支付宝支付'
};
export default class extends Page {
    constructor(props) {
        let sku = props.navigation.state.params && props.navigation.state.params.orderNo
        super(props, {
            orderNo: sku,
            image: '',
            height: 0,
            noSelf: false,
        });
    }
    pageBody() {
        return <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Icon name="icon-spe-success" style={{ width: px(90), height: px(90), marginBottom: px(30) }} />
                    <Text style={{ fontSize: px(36), color: '#D1648F' }}>感谢您购买达令家精选商品</Text>
                </View>
                {
                    !this.state.noSelf ? <View style={styles.container2}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: px(26), color: '#252426', lineHeight: px(36), }}>订单编号  {this.state.orderNo}</Text>
                            <Text style={{ fontSize: px(26), color: '#252426', lineHeight: px(36) }}>
                                已付金额
                            {'  '}
                                <Text style={{ fontSize: px(26), color: '#D0648F' }}>
                                    ￥{this.state.payAmount}
                                </Text>
                            </Text>
                            <Text style={{ fontSize: px(26), color: '#252426', lineHeight: px(36) }}>支付方式  {PAY_TYPES[this.state.payPlatform]}</Text>
                        </View>
                        <TouchableWithoutFeedback onPress={() => {
                            this.props.navigation.replace('OrderDetailPage', {
                                orderNo: this.state.orderNo
                            });
                        }}>
                            <View style={styles.btn}>
                                <Text style={{ fontSize: px(26), color: '#252426' }}>查看订单</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View> : null
                }
                <View style={{ marginTop: px(20), backgroundColor: '#fff' }}>
                    <Image style={{ width: deviceWidth, height: this.state.height }} source={{ uri: this.state.image || '' }} />
                </View>
            </ScrollView>
        </View>
    }

    async onReady() {
        try {
            let cfg = await config();
            let image = cfg.images['newintroduction']
            Image.getSize(image, (width, height) => {
                let r = height / (width / deviceWidth)
                this.setState({
                    image,
                    height: r
                })
            })

            let res = await request.get(`/saleOrderApp/findSaleOrderDetail.do?orderNo=${this.state.orderNo}&type=0`);
            if (!!res) {
                this.setState(res);
            } else {
                this.setState({
                    noSelf: true
                })
            }
        } catch (e) {
            this.$toast(e.message);
            this.setState({
                noSelf: true
            })
        }
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        height: px(270),
        borderBottomColor: '#efefef',
        borderBottomWidth: px(2)
    },
    container2: {
        height: px(190),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: px(120),
        paddingRight: px(30)
    },
    btn: {
        width: px(150),
        height: px(54),
        borderRadius: px(6),
        borderWidth: px(1),
        borderColor: '#B2B3B5',
        justifyContent: 'center',
        alignItems: 'center'
    }
})