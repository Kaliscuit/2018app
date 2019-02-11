import React, {Component} from 'react';
import {View, Modal, TouchableWithoutFeedback, StyleSheet, Animated, TouchableOpacity, Text} from 'react-native';
import {px} from '../utils/Ratio'

export default class extends Component {

    show() {
        if (this.state.isShow) {
            Animated.timing(
                this.state.boxY,
                {
                    toValue: 0,
                    duration: 200
                }
            ).start();
        }
    }

    cancel() {
        Animated.timing(
            this.state.boxY,
            {
                toValue: this.height,
                duration: 200
            }
        ).start(() => {
            this.setState({
                isShow: false
            });
            this.props.cancelAction && this.props.cancelAction();
        });
    }

    open() {
        this.setState({
            isShow: true
        })
    }

    constructor(props) {
        super(props);
        this.settings = this.props.settings;
        this.height = this.settings.height || px(500);
        this.state = {
            boxY: new Animated.Value(this.height),
            isShow: false,
        };
    }

    render() {
        return <View>
            <Modal
                visible={this.state.isShow}
                onShow={() => this.show()}
                onRequestClose={() => {
                }}
                animationType="none"
                transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.cancel()}>
                    <View style={styles.background}/>
                </TouchableWithoutFeedback>
                <Animated.View style={[styles.box, {
                    transform: [
                        { translateY: this.state.boxY }
                    ]
                }]}>
                    <View style={[styles.titleBox, this.settings.titleStyle]}>
                        {this.props.title}
                    </View>
                    <View style={[styles.bodyBox, this.settings.bodyStyle]}>
                        {this.props.body}
                    </View>
                    <TouchableOpacity
                        style={[styles.cancelBtn, this.settings.cancelBtnStyle]}
                        onPress={() => this.cancel()}>
                        <Text allowFontScaling={false} style={[styles.cancelTxt, this.settings.cancelTextStyle]}>取消</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>
        </View>
    }
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)'
    },
    box: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: px(750),
        backgroundColor: '#fff'
    },
    cancelBtn: {
        width: px(750),
        padding: px(20),
        justifyContent: 'center',
        backgroundColor: '#efefef'
    },
    cancelTxt: {
        fontSize: px(36),
        textAlign: 'center'
    },
    titleBox: {
        paddingHorizontal: px(20),
        paddingTop: px(20),
        alignItems: 'center',
    },
    bodyBox: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: px(50)
    }
})