/**
 * 发布素材心得
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Text, View, StyleSheet
} from 'react-native'
import Input from '../../../UI/lib/Input';
import { px } from '../../../utils/Ratio';
import Event from '../../../services/Event';
export default class ReleaseContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: ''
        };
        this.getContent = this.getContent.bind(this)
    }
    
    getContent() {
        const {content} = this.state
        let newContent = content
        while (newContent.endsWith('\r\n')){
            newContent = newContent.slice(0, -4)
        }
        while (newContent.endsWith('\n')){
            newContent = newContent.slice(0, -2)
        }
        while (newContent.endsWith('\r')){
            newContent = newContent.slice(0, -2)
        }

        return newContent;
    }
    
    async componentDidMount() {
        Event.on('matter.getContent', this.getContent)
    }
    
    
    componentWillUnmount() {
        Event.off('matter.getContent', this.getContent)
    }
    
    
    onChange(v) {
        this.setState({
            content: v
        })
    }
    
    render() {
        
        return <View style={styles.content}>
            <Input
                multiline
                maxLength={200}
                placeholderTextColor="#ccc"
                placeholder="说说你的心得"
                value={this.state.content}
                onChangeText={(v) => this.onChange(v)}
                style={styles.input}
            ></Input>
            <Text allowFontScaling={false} style={styles.len}>
                {this.state.content.length}/200
            </Text>
        </View>
    }
    
    
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: px(30),
        paddingTop: px(30),
        paddingBottom: px(10),
        //backgroundColor: '#000'
    },
    input: {
        //marginHorizontal: px(25),
        width: px(690),
        height: px(207),
        backgroundColor: '#fff',
        fontSize: px(32),
        color: '#222',
        textAlignVertical: 'top'
    },
    len: {
        fontSize: px(24),
        color: '#ccc',
        marginVertical: px(11),
        textAlign: 'right'
    }
});


