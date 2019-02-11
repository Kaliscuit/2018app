/**
 * 发布素材删除按钮
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Text, View, StyleSheet, NativeModules
} from 'react-native'
import { px } from '../../../utils/Ratio';
import base from '../../../styles/Base';
import Icon from '../../../UI/lib/Icon';
import Event from '../../../services/Event';

export default class DeleteView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
        
    }
    
    onChange(v) {
        this.setState({
            content: v
        })
        //console.log(v)
    }
    componentDidMount() {
        Event.on('matter.copy', this.showPopover)
    }

    setShowDeleteView(showDelete){
        this.setState({show:showDelete})
    }
    
    x = 0;
    y = 0;
    _onLayout(e) {
        NativeModules.UIManager.measure(e.target, (x, y, width, height, pageX, pageY) => {
            //console.log(x, y, width, height, pageX, pageY, '===delete==');
            this.x = pageX;
            this.y = pageY;
        });
    }
    
    render() {
        const {show} = this.state
        if (!show) return <View/>
        
        return <View  onLayout={(e) => this._onLayout(e)} ref="deleteView" style={[styles.bottom, base.line]}>
            <Icon name="trashWhite" style={styles.icon}/>
            <Text allowFontScaling={false} style={styles.txt}>
                拖到此处删除
            </Text>
        </View>
    }
    
    
}

const styles = StyleSheet.create({
    bottom: {
        width: px(750),
        height: px(140),
        backgroundColor: 'rgba(237,63,88,.9)'
    },
    icon: {
        width: 19,
        height: 18,
        marginBottom: px(13)
    },
    txt: {
        color: '#fff',
        includeFontPadding: false,
        fontSize: px(28)
    }
});


