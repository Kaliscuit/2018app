import React, { PureComponent } from 'react'

import {
    View,
    Text,
    Animated,
    Easing,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'

import { px, deviceWidth } from "../../../utils/Ratio"

import Swicth from './Swicth'

import Icon from '../../../UI/lib/Icon'
import { digitalUnit } from '../../../utils/digitalProcessing'
import { dataFormat, milliseconds } from '../../../utils/dataFormat'

const conversion = digitalUnit(10000, ['', '万', '亿', '万亿', '兆'])

const Plate = (props) => {
    const amountObj = conversion(props.amount, 2, '元')

    return <TouchableOpacity
        activeOpacity={1}
        style={styles.plate}
        onPress={e => props.onPress(props)}
    >
        <View style={styles.row}>
            <Text style={[styles.plateNumber, styles.plateColor]}>{amountObj.num}</Text>
            <Text style={[styles.yuan, styles.plateColor, {marginRight: -18 * amountObj.unit.length}]}>{amountObj.unit}</Text>
        </View>
        <Text style={styles.instructions} allowFontScaling={false}>{props.instructions}</Text>
    </TouchableOpacity>
}

export default class extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            leftDeep: new Animated.Value(0),
            leftShallow: new Animated.Value(0),
            tab: props.initTab,
            tabText: props.type === 1 ? '收益' : '销售额'
        }
    }

    render() {
        const { amount, btnAmounts, initTab, onDimension } = this.props

        const amountObj = conversion(amount, 2, '元')

        return (
            <View style={styles.container}>
                <View style={styles.bg}>
                    { this.props.type === 1 && <TouchableOpacity
                        style={styles.moneyManagement}
                        activeOpacity={0.8}
                        onPress={() => this.props.totalNumberClick() }
                    >
                        <Text suppressHighlighting={false} style={styles.moneyBtn} >资金管理</Text>
                    </TouchableOpacity> }
                    <TouchableOpacity
                        activeOpacity={0.8} 
                        style={styles.row}
                        onPress={() => this.props.totalNumberClick() }
                    >
                        <Text style={styles.amount}>{amountObj.num}</Text>
                        <Text style={[styles.yuan, {marginRight: -10 * amountObj.unit.length}]}>{amountObj.unit}</Text>
                    </TouchableOpacity>
                    <View style={[styles.row, styles.topMargin]}>
                        <Text style={styles.sales}>累计{ this.state.tabText }</Text>
                        <TouchableOpacity
                            style={styles.exclamationBox}
                            activeOpacity={0.8}
                            onPress={() => this.props.bounced ? this.props.bounced(this.props) : () => { }}
                        >
                            <Text suppressHighlighting={false} style={styles.exclamation} >?</Text>
                        </TouchableOpacity>
                    </View>
                    <Swicth
                        style={styles.swicth}
                        initTab={initTab}
                        onChange={index => this.changeSwicth(index)}
                    />
                    <Animated.View style={[
                        styles.wave,
                        { left: this.state.leftDeep }
                    ]}>
                        <Icon name="wave-deep" style={styles.wavesImg} />
                        <Icon name="wave-deep" style={styles.wavesImg} />
                    </Animated.View>
                    <Animated.View style={[
                        styles.wave,
                        { left: this.state.leftShallow, zIndex: 1 }
                    ]}>
                        <Icon name="wave-shallow" style={styles.wavesImg} />
                        <Icon name="wave-shallow" style={styles.wavesImg} />
                    </Animated.View>
                </View>
                <View style={styles.groupBox}>
                    <Plate
                        amount={btnAmounts.leftAmount}
                        instructions={this._controlInstructions('left')}
                        onPress={e => this.onPlate(e, 'left')}
                    />
                    <Plate
                        amount={btnAmounts.rightAmount}
                        instructions={this._controlInstructions('right')}
                        onPress={e => this.onPlate(e, 'right')}
                    />
                </View>
            </View>
        )
    }

    changeSwicth(index) {
        this.setState({ tab: index })

        this.props.onDimension && this.props.onDimension(index)
    }

    onPlate(e, type) {
        if (!this.props.onPlate) return

        const now = Date.now()
        let startDate = ''
        let endDate = ''

        if (this.state.tab === 0) {
            let value = ''

            if (type === 'left' && this.props.dimension === 1) {
                let sDate = new Date()

                sDate.setDate(sDate.getDate() - 1)

                startDate = dataFormat(sDate)
                value = startDate
            } else {
                value = dataFormat(now, 'YYYY-MM-DD')
                startDate = value
            }

            if (type === 'right') {
                let date = new Date()
                date.setDate(date.getDate() - 6)
                startDate = dataFormat(date)
            }

            endDate = value
        } else {
            let date = new Date(milliseconds(startDate))

            if (type === 'right') {
                let date = new Date()
                date.setMonth(date.getMonth() - 1)
                startDate = dataFormat(date, 'YYYY-MM') + '-01'
                let relativeDate = new Date(milliseconds(startDate))
                relativeDate.setMonth(relativeDate.getMonth() + 1)
                relativeDate.setDate(relativeDate.getDate() - 1)
                endDate = dataFormat(relativeDate)
            } else {
                startDate = dataFormat(now, 'YYYY-MM') + '-01'
                let date = new Date(milliseconds(startDate))
                date.setMonth(date.getMonth() + 1)
                date.setDate(date.getDate() - 1)
                endDate = date.getTime() - now > 0 ? dataFormat(now) : dataFormat(date)
            }
        }

        this.props.onPlate({
            startDate,
            endDate,
            value: e.amount
        })
    }

    _controlInstructions(dimension) {
        const type = this.props.type === 1 ? '收益' : '销售额'
        const precision = this.props.dimension === 1 ? '昨' : '今'

        if (this.state.tab === 0) {

            return dimension === 'left' ? `${ precision }日${type}` : `近7日${type}`
        } else {
            return dimension === 'left' ? `本月${type}` : `上月${type}`
        }
    }

    start() {
        this.state.leftDeep.stopAnimation()
        this.state.leftShallow.stopAnimation()
        this.state.leftDeep.setValue(0)
        this.state.leftShallow.setValue(0)

        const deviceW = deviceWidth
        const duration = deviceW * 20

        this.runDeep()
        this.runShallow()
    }

    runDeep() {
        this.state.leftDeep.setValue(0)
        Animated.timing(this.state.leftDeep, {
            toValue: -deviceWidth,
            duration: deviceWidth * 20,
            easing: Easing.linear
        }).start(() => {
            this.runDeep()
        })
    }

    runShallow() {
        this.state.leftShallow.setValue(0)
        Animated.timing(this.state.leftShallow, {
            toValue: -deviceWidth,
            duration: deviceWidth * 40,
            easing: Easing.linear
        }).start(() => {
            this.runShallow()
        })
    }

    componentDidMount() {
        this.start()
    }

    componentWillUnmount() {
        this.state.leftDeep.stopAnimation()
        this.state.leftShallow.stopAnimation()
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: px(512),
        position: 'relative'
    },
    bg: {
        backgroundColor: '#D02D65',
        height: px(426),
        paddingTop: px(90),
        position: 'relative'
    },
    moneyManagement: {
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 60,
        padding: px(24)
    },
    moneyBtn: {
        fontSize: px(26),
        color: '#fff'
    },
    swicth: {
        position: 'absolute',
        bottom: px(114),
        zIndex: 10,
        right: px(30)
    },
    wave: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: deviceWidth * 2,
        flexDirection: 'row'
    },
    wavesImg: {
        width: deviceWidth,
        height: px(150)
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    amount: {
        color: '#fff',
        fontSize: px(72),
        fontWeight: 'bold'
    },
    yuan: {
        color: '#fff',
        fontSize: px(26),
        lineHeight: px(62),
        alignSelf: 'flex-end',
        marginLeft: px(6)
    },
    sales: {
        fontSize: px(28),
        color: '#fff',
        lineHeight: px(34)
    },
    exclamationBox: {
        width: px(27),
        height: px(27),
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: px(14),
        marginLeft: px(10),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: px(3)
    },
    exclamation: {
        fontSize: px(20),
        color: '#fff'
    },
    topMargin: {
        marginTop: px(20),
        alignItems: 'center',
        justifyContent: 'center'
    },
    groupBox: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: px(180),
        flexDirection: 'row',
        paddingLeft: px(24)
    },
    plate: {
        flex: 1,
        height: px(180),
        marginRight: px(24),
        backgroundColor: '#fff',
        borderRadius: px(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    plateNumber: {
        fontSize: px(48),
        fontWeight: 'bold'
    },
    plateColor: {
        color: '#D02D65'
    },
    instructions: {
        fontSize: px(24),
        color: '#666',
        marginTop: px(6),
        // lineHeight: px(40),
        height: px(30)
    }
})