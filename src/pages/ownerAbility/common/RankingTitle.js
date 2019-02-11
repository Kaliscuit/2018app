import React, { PureComponent } from 'react'

import {
    View,
    Text,
    StyleSheet,
} from 'react-native'

import { px } from "../../../utils/Ratio"

export default class extends PureComponent {
    render() {
        return (
            <View style={styles.container}>
                {
                    this.props.isSales && <View style={styles.noSalesBox}>
                        <Text style={styles.noSalesTitle}><Text style={styles.colorRed}>近30日</Text>商品销售排行</Text>
                        <Text style={styles.prompt}>近30日没有销售的商品呢</Text>
                        <Text style={styles.prompt}>别灰心~看看全网爆款吧~</Text>
                    </View>
                }
                <View style={styles.titleBox}>
                    {this.props.isSales ?
                        <Text style={styles.title}>达令家<Text style={styles.colorRed}>TOP10</Text></Text>
                        : <Text style={styles.title}><Text style={styles.colorRed}>近30日</Text>商品销售排行</Text>
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
    },
    noSalesBox: {
        backgroundColor: '#fff',
        alignItems: 'center',
        marginHorizontal: px(24),
        marginBottom: px(24),
        borderRadius: px(10),
        paddingTop: px(39),
        paddingBottom: px(50)
    },
    noSalesTitle: {
        fontSize: px(28),
        color: '#666',
        marginBottom: px(30)
    },
    colorRed: {
        color: '#C32259'
    },
    prompt: {
        fontSize: px(28),
        color: '#222',
        lineHeight: px(36)
    },
    titleBox: {
        backgroundColor: '#fff',
        height: px(104),
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: px(28),
        color: '#666'
    }
})