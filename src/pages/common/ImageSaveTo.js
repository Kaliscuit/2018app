/**
 * Created by qiaopanpan on 2017/9/1.
 * 达令家的保存图片弹框
 */
'use strict';

import React, { PureComponent } from 'react';
import { Modal, Text, View, StyleSheet, NativeModules, Image } from 'react-native'
import { px } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';

const AppModule = NativeModules.AppModule;
export default class extends PureComponent {
    static defaultProps = {
        show: false,
        img: null
    }

    async saveToAlbum(img) {
        try {
            await new Promise((resolve, reject) => {
                AppModule.saveImageToAlbum(img, (ignore, res) => {
                    if (res) {
                        resolve()
                    } else {
                        reject()
                    }
                });
            });
            toast('保存成功');
        } catch (e) {
            toast('保存失败');
        }
        this.props.onCancel()
    }

    render() {
        const { show, onCancel, img } = this.props;

        return (
            <Modal
                transparent={true}
                animationType='slide'
                visible={show}
            >
                <View style={modalStyles.introduction}>
                    <View style={modalStyles.intBox}>
                        <Text allowFontScaling={false} onPress={() => this.saveToAlbum(img)}
                            style={[modalStyles.save, modalStyles.btn]}>保存图片到相册</Text>
                        <Text allowFontScaling={false} onPress={onCancel} style={[modalStyles.cancel, modalStyles.btn]}>取消</Text>
                    </View>
                </View>

            </Modal>
        )
    }
}
const modalStyles = StyleSheet.create({
    introduction: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(36, 37, 38, 0.3)'
    },
    intBox: {
        width: px(750),
        paddingLeft: px(20),
        paddingRight: px(20),
        height: px(240),
        position: 'absolute',
        bottom: px(20), left: px(0),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    save: {},
    cancel: {},
    btn: {
        flex: 1,
        textAlign: 'center',
        paddingTop: px(32),
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: '#0080ff',
        fontSize: px(35),
        borderRadius: px(24),
        overflow: 'hidden',
        marginTop: px(20),
        fontWeight: '900'
    }
})