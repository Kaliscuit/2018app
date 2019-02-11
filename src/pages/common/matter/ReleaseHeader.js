/**
 * 发布素材标题
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    TouchableOpacity
} from 'react-native'
import { px } from '../../../utils/Ratio';
import Icon from '../../../UI/lib/Icon'
import { TopHeader, Header } from '../Header';
export default class ReleaseHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.submit = this.submit.bind(this)
        
    }
    
    publishFn() {
        this.props.publishFn && this.props.publishFn();
    }

    goBack() {
        this.props.goBack && this.props.goBack();
    }
    
    
    title = "发布素材"
    render() {
        return <Header
            title={this.title}
            //hiddenBack
            // leftBtn={
            //     <TouchableOpacity onPress={() => this.goBack()}>
            //         <View style={styles.back}>
            //             <Icon name="icon_back"
            //                 style={{ width: 20, height: 20 }} />
            //         </View>
            //     </TouchableOpacity>
            // }
            onBack={() => this.goBack()}
            rightBtn={
                <TouchableOpacity
                    onPress={() => this.publishFn()}>
                    <View style={styles.right}>
                        <Text style={styles.txt} allowFontScaling={false}>发布</Text>
                    </View>
                </TouchableOpacity>
            }
            navigation={this.props.navigation}
        >
        </Header>
    }
    
    submit() {
    
    }
    
}

const styles = StyleSheet.create({
    right: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        //backgroundColor: '#000'
    },
    txt: {
        fontSize: px(30),
        color: "#252426"
    },
    back: {
        height: 44,
        width: 44,
        justifyContent: "center"
    }
});


