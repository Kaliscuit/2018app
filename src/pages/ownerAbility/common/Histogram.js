import React, { PureComponent } from 'react'

import {
    View,
    Text,
    StyleSheet,
} from 'react-native'

import { px, deviceWidth } from "../../../utils/Ratio"
import Echarts from '../../common/echarts/index'

function padStart(str, len, pd) {
    str = str + "";
    while (str.length < len) {
        str = pd + str;
    }
    return str;
}

export default class extends PureComponent {

    initOptions() {
        const { xAxisData, seriesData, dimension, type, typeText } = this.props
        const isYesterday = dimension === 1
        let now = "";
        let now_date = new Date();

        if (isYesterday) now_date.setDate(now_date.getDate() - 1)

        if (xAxisData.length > 0) {
            let testData = xAxisData[0];
            if (testData.length > 7) {
                now = padStart(now_date.getFullYear(), 2, "0") + "-" + padStart(now_date.getMonth() + 1, 2, "0") + "-" + padStart(now_date.getDate(), 2, "0");
            } else {
                now = padStart(now_date.getFullYear(), 2, "0") + "-" + padStart(now_date.getMonth() + 1, 2, "0");
            }
        }
        let index = xAxisData.indexOf(now);
        const dimensionText = !type ? '日' : '月'
        const name = (!type && isYesterday ? '昨' : '当') + dimensionText

        const defaultOptions = {
            title: `近7${dimensionText}${typeText}`,
            legendData: [name],
            xAxisData: xAxisData,
            seriesName: name,
            seriesData: seriesData,
            index,
            now
        }
        return defaultOptions
    }

    render() {
        const histogramClick = this.props.histogramClick || function () { }

        return (
            <View style={styles.container}>
                <Echarts option={this.initOptions()} height={px(590)} onPress={e => histogramClick(e)} scalesPageToFit={true} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: px(600),
        backgroundColor: '#fff',
        margin: px(24),
        borderRadius: px(10),
        overflow: 'hidden',
        paddingTop: px(38)
    }
})