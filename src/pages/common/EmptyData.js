import React, { PureComponent } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import Icon from '../../UI/lib/Icon'

export default class extends PureComponent {

    render () {
        const { style, name, prompt, btnText, onPress } = this.props

        return (
            <View style={ [styles.container, style] }>
                <Icon name={ name } style={ styles.icon }/>
                <Text style={ styles.prompt }>{ prompt }</Text>
                {
                    btnText && <TouchableOpacity
                        style={ styles.btn }
                        activeOpacity={ 0.8 }
                        onPress={() => onPress ? onPress(this.props) : () => {}}
                    >
                        <Text style={ styles.btnText }>{ btnText }</Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center'
    },
    icon: {
        width: 375,
        height: 167,
        marginTop: 96
    },
    prompt: {
        fontSize: 14,
        color: '#999',
        marginTop: 48,
        marginBottom: 15
    },
    btn: {
        width: 120,
        height: 30,
        borderRadius: 30,
        backgroundColor: '#D0648F',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnText: {
        fontSize: 14,
        color: '#fff'
    }
})