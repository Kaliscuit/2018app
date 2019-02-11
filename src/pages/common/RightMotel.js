import React, { Component } from 'react'
import {
    View,
    Text,
    Platform,
    ScrollView,
    Animated,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'
import { ifIPhoneX, getStatusBarHeight, getBottomSpace } from 'react-native-style-adaptive'
import { px } from "../../utils/Ratio"

import DatePicker from '../common/DatePicker'
import { TopHeaderNoAdapter } from './Header'

import { dataFormat, milliseconds } from '../../utils/dataFormat'

const isIos = Platform.OS === 'ios'

const mergeData = (list, checked) => {
    const len = checked.length

    return list.map(item => {
        let i = 0

        for (; i < len; i++) {
            if (checked[i].value === item.value) return checked[i]
        }

        item.selected = false

        return item
    })
}
export class DateSelect extends Component {
    static defaultProps = {
        leftProps: {
            placeholder: {
                text: '请选择开始时间',
            },
            date: '',
            max: dataFormat(new Date())
        },
        rightProps: {
            placeholder: {
                text: '请选择结束时间',
            },
            date: '',
            max: dataFormat(new Date())
        }
    }

    constructor(props) {
        super(props)

        this.state = this.initState()
    }

    setTimeInterval (startDate, endDate) {
        let {leftProps, rightProps} = this.props

        leftProps.date = startDate || ''
        leftProps.max = endDate || dataFormat(new Date())

        rightProps.date = endDate || dataFormat(new Date())
        rightProps.min = startDate || dataFormat(new Date())
        rightProps.max = dataFormat(new Date())

        return {
            leftProps,
            rightProps
        }
    }

    initState() {
        const props = this.props
        let list = props.list
        const selected = list.filter(item => item.selected)
        let startDate = ''
        let endDate = ''

        startDate = props.startDate
        endDate = props.endDate

        let datell = new Date();
        let currTime = milliseconds(`${datell.getFullYear()}-${datell.getMonth() + 1}-${datell.getDate()}`);
        let endTime = milliseconds(endDate);
        let startTime = milliseconds(startDate)
        let diff = 0
        if (endTime >= currTime) {
            diff = parseInt((endTime - startTime) / 1000)
        }

        list = list.map(item => {
            if ((item.value / 1000) === diff) {
                item.selected = true
            } else {
                item.selected = false
            }

            return item
        })

        const dateProps = this.setTimeInterval(startDate, endDate)

        return {
            startDate,
            endDate,
            list,
            ...dateProps,
            checked: list.filter(item => item.selected)
        }
    }

    render() {
        return (
            <View>
                {this.props.title && <Text style={selectStyles.title}>{this.props.title}</Text>}
                <View style={dateStyles.container}>
                    <DatePicker
                        {...this.state.leftProps}
                        value={this.state.startDate}
                        onChange={value => this.onChange('startDate', value)}
                    />
                    <View style={dateStyles.line}></View>
                    <DatePicker
                        {...this.state.rightProps}
                        ref={ref => this.dateBtn = ref}
                        value={this.state.endDate}
                        onChange={value => this.onChange('endDate', value)}
                        min={this.state.startDate ? this.state.startDate : this.props.leftProps.max}
                    />
                </View>
                <Radio
                    list={this.state.list}
                    checked={ this.state.checked }
                    onChange={(value) => this.timeRange(value)}
                />
            </View>
        )
    }

    _defaultTimeFactory(result) {
        if (this.props.timeFactory) return this.props.timeFactory()

        let max = this.props.rightProps.max

        if (typeof max === 'string') {
            max = milliseconds(max)
        } else if (Object.prototype.toString.call(max) === '[object Date]') {
            max = max.getTime()
        } else if (typeof max !== 'number') {
            max = 0
        }

        const time = max - result.value

        return dataFormat(time)
    }

    timeRange(value) {
        let startDate = ''
        let endDate = ''

        if (value) {
            startDate = this._defaultTimeFactory(value)
            endDate = this.props.rightProps.max
        }

        const result = {
            endDate,
            startDate
        }

        const dateProps = this.setTimeInterval(startDate, endDate)

        const checked = value ? [value] : []
        const list = mergeData(this.state.list, checked)

        this.setState({ ...result, ...dateProps, checked, list })

        this.props.onChange && this.props.onChange(result)
    }

    onChange(type, value) {
        const { startDate, endDate } = this.state

        const list = JSON.parse(JSON.stringify(this.state.list))

        let oldDate = {
            startDate,
            endDate
        }

        oldDate[type] = value

        let datell = new Date();
        let currTime = milliseconds(`${datell.getFullYear()}-${datell.getMonth() + 1}-${datell.getDate()}`);
        let endTime = milliseconds(oldDate.endDate);
        let startTime = milliseconds(oldDate.startDate)

        let diff = 0
        if (endTime >= currTime) {
            diff = parseInt((endTime - startTime) / 1000)
        }

        const newList = list.map(item => {
            if ((item.value / 1000) === diff) {
                item.selected = true
            } else {
                item.selected = false
            }

            return item
        })

        const dateProps = this.setTimeInterval(startDate, endDate)

        this.setState({ ...oldDate, ...dateProps, list: newList, checked: newList.filter(item => item.selected) })

        this.props.onChange && this.props.onChange(type, value)
    }

    getDate() {
        const { startDate, endDate, checked } = this.state

        return {
            startDate,
            endDate,
            dateChecked: checked
        }
    }
}

const dateStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: px(22)
    },
    line: {
        width: px(22),
        height: 1,
        backgroundColor: '#222',
        marginHorizontal: px(21)
    }
})

export class Radio extends Component {
    static propTypes = {
        title: PropTypes.string,
        list: PropTypes.array.isRequired
    }

    constructor(props) {
        super(props)
        
        this.state = {
            list: JSON.parse(JSON.stringify(mergeData(props.list, props.checked))),
            selected: ''
        }
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            list: JSON.parse(JSON.stringify(mergeData(nextProps.list, nextProps.checked)))
        })
    }

    _btnFactory() {
        return this.state.list.map((item, index) => {
            return <TouchableOpacity
                key={item.value}
                style={[selectStyles.button, selectStyles[item.selected ? 'buttonActive' : 'buttonUnCheck']]}
                activeOpacity={0.9}
                onPress={() => this.onChange(index, item)}
            >
                <Text style={[selectStyles.text, selectStyles[item.selected ? 'textActive' : 'textUnCheck']]}>{item.text}</Text>
            </TouchableOpacity>
        })
    }

    onChange(index, target) {
        const list = this.state.list.map((item, i) => {
            if (i !== index) {
                item.selected = false
            } else {
                item.selected = !item.selected
            }
            return item
        })

        this.setState({ list })
        this.props.onChange && this.props.onChange(list.filter(item => item.selected)[0])
    }

    render() {
        return (
            <View>
                {this.props.title && <Text style={selectStyles.title}>{this.props.title}</Text>}
                <View style={selectStyles.main}>
                    {this._btnFactory()}
                </View>
            </View>
        )
    }

    getSelected() {
        return this.state.list.filter(item => item.selected)[0]
    }
}

export class Checkbox extends Component {
    static propTypes = {
        title: PropTypes.string,
        list: PropTypes.array.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            list: JSON.parse(JSON.stringify(mergeData(props.list, props.checked)))
        }
    }

    _btnFactory() {
        return this.state.list.map((item, index) => {
            return <TouchableOpacity
                key={item.value}
                style={[selectStyles.button, selectStyles[item.selected ? 'buttonActive' : 'buttonUnCheck']]}
                activeOpacity={0.9}
                onPress={() => this.onChange(index, item)}
            >
                <Text style={[selectStyles.text, selectStyles[item.selected ? 'textActive' : 'textUnCheck']]}>{item.text}</Text>
            </TouchableOpacity>
        })
    }

    onChange(index, target) {
        const list = this.state.list.map((item, i) => {
            if (index === i) item.selected = !item.selected

            return item
        })

        this.setState({ list })
        this.props.onChange && this.props.onChange(list.filter(item => item.selected))
    }

    render() {
        return (
            <View>
                {this.props.title && <Text style={selectStyles.title}>{this.props.title}</Text>}
                <View style={selectStyles.main}>
                    {this._btnFactory()}
                </View>
            </View>
        )
    }

    getSelected() {
        return this.state.list.filter(item => item.selected)
    }
}

export default class extends Component {
    constructor() {
        super()

        this.state = {
            visible: false,
            right: new Animated.Value(-325)
        }

        this.close = this.close.bind(this)
    }
    render() {
        const interpolates = {
            inputRange: [-325, 0],
            outputRange: [0, 1]
        }

        const opacity = this.state.right.interpolate(interpolates)

        return (
            this.state.visible ? <Animated.View style={[styles.container, {
                opacity
            }]}>
                <TouchableOpacity
                    style={styles.motel}
                    activeOpacity={1}
                    onPress={this.close}
                />
                <Animated.View style={[styles.main, {
                    right: this.state.right
                }]}>
                    <View style={styles.iPhoneXTop}></View>
                    <TopHeaderNoAdapter
                        boxStyles={{ backgroundColor: '#FBFAFC', borderBottomColor: '#EFEFEF' }}
                        title="筛选"
                        goBack={() => this.close()}
                    />
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        directionalLockEnabled={true}
                        bounces={false}
                    >
                        {this.props.children}
                    </ScrollView>
                    <View style={styles.confirmBox}>
                        <TouchableOpacity
                            style={styles.reset}
                            activeOpacity={1}
                            onPress={() => this.reset()}
                        >
                            <Text style={styles.confirmText}>重置</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.confirm}
                            activeOpacity={1}
                            onPress={() => this.determine()}
                        >
                            <Text style={styles.confirmText}>确定</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.iPhoneXBottom}></View>
                </Animated.View>
            </Animated.View> : null
        )
    }

    reset() {
        this.props.reset && this.props.reset()
        this.close()
    }

    determine() {
        this.props.determine && this.props.determine()
        this.close()
    }

    open() {
        this.setState({ visible: true }, () => {
            Animated.spring(
                this.state.right,
                {
                    toValue: 0,
                    velocity: 10,
                    friction: 10
                }
            ).start()
        })
    }

    close() {
        Animated.spring(
            this.state.right,
            {
                toValue: -325,
                velocity: 10,
                friction: 10
            }
        ).start(() => {
            this.setState({ visible: false })
        })
    }
}

const selectStyles = StyleSheet.create({
    main: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    title: {
        fontSize: px(30),
        color: '#333',
        fontWeight: 'bold',
        marginTop: px(36),
        marginBottom: px(30)
    },
    button: {
        paddingHorizontal: px(39),
        minWidth: px(155),
        height: px(70),
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: px(22),
        marginBottom: px(22),
        borderWidth: StyleSheet.hairlineWidth
    },
    buttonUnCheck: {
        borderColor: '#ccc'
    },
    buttonActive: {
        backgroundColor: '#D0648F',
        borderColor: '#D0648F'
    },
    text: {
        fontSize: px(26)
    },
    textUnCheck: {
        color: '#222'
    },
    textActive: {
        color: '#fff'
    }
})

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0
    },
    motel: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0, 0.4)'
    },
    main: {
        position: 'absolute',
        right: -325,
        top: 0,
        bottom: 0,
        width: 325,
        backgroundColor: '#fff'
    },
    iPhoneXTop: {
        height: ifIPhoneX(getStatusBarHeight(true), 20, 0),
        backgroundColor: '#FBFAFC'
    },
    iPhoneXBottom: {
        height: getBottomSpace(),
        backgroundColor: '#fff'
    },
    content: {
        flex: 1,
        paddingVertical: px(22),
        paddingHorizontal: px(30)
    },
    confirmBox: {
        flexDirection: 'row',
        height: px(98)
    },
    reset: {
        width: px(270),
        backgroundColor: '#56BEEC',
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirm: {
        flex: 1,
        backgroundColor: '#D0648F',
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmText: {
        color: '#fff',
        fontSize: px(34)
    }
})