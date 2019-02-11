import React, { Component } from 'react'
import {
    View,
    Platform,
    StyleSheet
} from 'react-native'
import DatePicker from 'react-native-datepicker'
import { px, isIphoneX } from "../../utils/Ratio"

const isIos = Platform.OS === 'ios'

export default class extends Component {
    static defaultProps = {
        type: 'date', // date | datetime | time
        value: '', // string | date | Moment instance
        placeholder: {
            text: '',
            style: {}
        },
        style: {},
        inputStyle: {
            style: {},
            textStyle: {}
        },
        disabled: {
            status: false,
            style: {}
        },
        icon: {
            status: false,
            style: {},
            source: null, // {uri: string} | number
            component: null // element
        },
        onChange: e => { },
        onOpen: e => { },
        onClose: e => { },
        min: isIos ? null : undefined,
        max: isIos ? null : undefined,
        confirm: {
            btnText: '确定',
            style: {},
            textStyle: {}
        },
        cancel: {
            btnText: '取消',
            style: {},
            textStyle: {}
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            data: props.value
        }
    }

    render() {
        const {
            style,
            type,
            value,
            format,
            confirm,
            cancel,
            min,
            max,
            icon,
            disabled,
            placeholder,
            onOpen,
            onClose,
            onPress
        } = this.props

        return <DatePicker
            minDate={min}
            maxDate={max}
            onOpenModal={e => onOpen(e)}
            onCloseModal={e => onClose(e)}
            {...this.props}
            ref={ref => this.datePicker = ref}
            style={[styles.container, style]}
            date={value}
            mode={type}
            format={format ? format : this._format()}
            customStyles={this._customStyles()}
            onDateChange={this.props.onChange.bind(this)}
            placeholder={placeholder.text}
            showIcon={icon.status}
            disabled={disabled.status}
            confirmBtnText={confirm.btnText}
            cancelBtnText={cancel.btnText}
        />
    }

    _format() {
        switch (this.props.type) {
            case 'date':
                return 'YYYY-MM-DD'
            case 'time':
                return 'HH:mm:ss '
            case 'date-time':
                return 'YYYY-MM-DD HH:mm:ss'
            default:
                return 'YYYY-MM-DD'
        }
    }

    _customStyles() {
        const {
            confirm,
            cancel,
            disabled,
            placeholder,
            icon,
            pickerBoxStyle,
            pickerStyle,
            inputStyle
        } = this.props

        return this.props.customStyles ? this.props.customStyles : {
            dateInput: [styles.dateInput, inputStyle.style],
            disabled: disabled.style,
            dateTouchBody: {},
            dateIcon: icon.style,
            placeholderText: placeholder.style,
            dateText: inputStyle.textStyle,
            datePickerCon: pickerBoxStyle,
            datePicker: pickerStyle,
            btnConfirm: confirm.style,
            btnTextConfirm: [styles.btnTextConfirm, confirm.textStyle],
            btnCancel: cancel.style,
            btnTextCancel: [styles.btnTextCancel, cancel.textStyle]
        }
    }

    open() {
        this.datePicker.onPressDate()
    }

    cancel() {
        this.datePicker.onPressCancel()
    }
}

const styles = StyleSheet.create({
    container: {
        width: px(250)
    },
    dateInput: {
        borderRadius: 4,
        borderColor: '#ccc',
        borderWidth: StyleSheet.hairlineWidth,
    },
    btnTextConfirm: {
        color: '#D0648F',
    },
    btnTextCancel: {
        color: '#222'
    }
})