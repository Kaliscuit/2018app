import React, { PureComponent } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'

import { px, deviceWidth } from "../../../utils/Ratio"

import Icon from '../../../UI/lib/Icon'
const TYPE_TEXT_HIGHLIGHT = ['ORDER_COMING_RETURN', 'ORDER_SUCCESS_RETURN'];

export default class extends PureComponent {
    static defaultProps = {
        isRanking: false,
        onPress: () => {}
    }

    render() {
        const { dateTime, sumAmount, refundAmount } = this.props.item

        const isRefund = parseFloat(refundAmount || 0, '元')

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => this.props.onPress(this.props.item)}
            >
                <View style={styles.container}>
                    <Text style={styles.dataText}>{dateTime}</Text>
                    <View style={styles.earningsBox}>
                        <View>
                            <Text style={styles.earningsText}>销售收益和</Text>
                            {!!isRefund && <Text style={styles.earningsAmount}>退款扣除总和 {refundAmount}元</Text>}
                        </View>
                        <View style={styles.amountBox}>
                            <Text style={styles.amount}>{sumAmount}</Text>
                            <Icon name="icon-mine-arrows-gray" style={styles.go} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // height: px(169),
        // paddingVertical: px(30),
        // paddingHorizontal: px(30),
        marginBottom: px(24),
        borderRadius: px(10),
        backgroundColor: '#fff',
        marginHorizontal: px(24),
        overflow: 'hidden'
    },
    dataText: {
        lineHeight: px(43),
        backgroundColor: '#FAFAFA',
        fontSize: px(24),
        color: '#999',
        paddingLeft: px(24)
    },
    earningsBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: px(24),
        paddingVertical: px(30),
    },
    earningsText: {
        fontSize: px(30),
        color: '#222'
    },
    earningsAmount: {
        fontSize: px(24),
        color: '#666',
        marginTop: px(10)
    },
    amountBox: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    amount: {
        fontSize: px(30),
        color: '#222',
        marginRight: px(9)
    },
    go: {
        width: px(16),
        height: px(30)
    }
})

export class Detail extends PureComponent {
    render() {
        const {
            benefitDate,
            isDetail,
            benefitNo,
            benefitTimeDesc,
            benefitValue,
            eventDesc,
            fullName
        } = this.props.item

        const openShop = isDetail === 1

        return (
            <TouchableOpacity
                style={detailStyles.container}
                activeOpacity={openShop ? 0.8 : 1}
                onPress={() => openShop ? this.props.onPress(this.props.item) : () => { }}
            >
                <View style={detailStyles.main}>
                    <View>
                        <Text style={detailStyles.title}>{eventDesc}</Text>
                        <Text style={detailStyles.orderNumber}>{fullName}</Text>
                        <Text style={detailStyles.orderNumber}>{benefitDate}</Text>
                    </View>
                    <View style={detailStyles.amountBox}>
                        <View>
                            <Text style={[detailStyles.amount, parseFloat(benefitValue || 0) < 0 && { color: '#000' }]}>{benefitValue}</Text>
                            { !!benefitTimeDesc && <Text style={detailStyles.orderNumber}>{benefitTimeDesc}</Text> }
                        </View>
                        {
                            openShop ?
                                <Icon name="icon-mine-arrows-gray" style={detailStyles.go} /> :
                                <View style={detailStyles.go}/>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const detailStyles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    main: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: px(24),
        borderBottomColor: '#EFEFEF',
        borderBottomWidth: 1,
        paddingVertical: px(30),
        paddingRight: px(24)
    },
    title: {
        fontSize: px(30),
        color: '#222',
        marginBottom: px(10)
    },
    orderNumber: {
        fontSize: px(24),
        color: '#666',
        marginTop: px(8)
    },
    amountBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    amount: {
        fontSize: px(34),
        color: '#D02D65', 
        textAlign: 'right'
    },
    go: {
        width: px(16),
        height: px(30),
        marginLeft: 4
    }
})