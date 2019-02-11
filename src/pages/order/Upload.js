'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';


const {screenWidth, screenHeight} = Dimensions.get('window');
import {px} from '../../utils/Ratio';
import ImagePicker from 'react-native-image-crop-picker';
import {show as toast} from '../../widgets/Toast';
import { log } from '../../utils/logs';
import { LoadingRequest } from '../../widgets/Loading';
import { ImgsModal, BtnModal } from '../common/ModalView'

class Upload extends React.Component {
    constructor(props) {
        super(props)
        let image = [];
        this.viewImage = [];
        this.btnList = [
            {txt: '拍照', click: () => this.upload(1)},
            {txt: '上传图片', click: () => this.upload(2), styles: {marginTop: px(25)}},
            {txt: '取消', click: () => this.cancelChoice(), styles: {marginTop: px(25)}, txtStyles: {color: '#252426'}}
        ];
        if (props.images) {
            let imageArr = props.images.split(',');
            imageArr.map((item, index) => {
                image.push(item);
                this.viewImage.push({
                    image: item,
                    width: px(700),
                    height: px(700)
                })
            })
        }
        this.state = {
            loading: false,
            detail: null,
            image: image
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.images) {
            let image = [];
            this.viewImage = [];
            let imageArr = nextProps.images.split(',');
            imageArr.map((item, index) => {
                image.push(item);
                this.viewImage.push({
                    image: item,
                    width: px(700),
                    height: px(700)
                });
            })
            if (image.length > 0) {
                this.setState({
                    image: image
                })
            }
        }
    }

    render() {
        return <View style={styles.upload}>
            <ImgsModal ref='imgs' list={this.viewImage}></ImgsModal>
            <LoadingRequest status={this.state.loading} text={'正在上传中...'} />
            <BtnModal ref="btnModal" list={this.btnList}/>
            <View style={styles.row}>
                {
                    (this.state.image || []).map((item, index) =>
                        <View key={index} style={styles.rowItem}>
                            <TouchableOpacity onPress={() => this.openBigImg(item)}>
                                <Image
                                    style={styles.shopImg}
                                    source={{ uri: item }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.close} onPress={this.deleteFn(index)}>
                                <Image
                                    style={{width:px(40), height:px(40)}}
                                    source={{ uri: require('../../images/icon-upload-close') }} />
                            </TouchableOpacity>
                        </View>
                    )
                }
                
                <TouchableOpacity onPress={() => this.openChoice()}>
                    <Image
                        style={{width:px(157), height:px(157)}}
                        source={{ uri: require('../../images/icon-upload') }} />
                </TouchableOpacity>
                
            </View>
        </View>
    }
    
    async componentDidMount() {
    
    }

    openBigImg(item) {
        this.refs.imgs.Open(item);
    }
    
    openChoice() {
        this.refs.btnModal && this.refs.btnModal.open()
    }
    cancelChoice() {
        this.refs.btnModal && this.refs.btnModal.cancel()
    }
    async upload(flag) {
        log(this.state.image.length, 'test')
        if (this.state.image.length == 3) {
            return toast('最多上传三张');
        }
        if (this.state.loading) return;
        let image
        try {
            if (flag == 1) {
                image = await ImagePicker.openCamera({
                    width: px(700),
                    height: px(700),
                    cropping: true,
                    //cropperCircleOverlay: true,
                    compressImageQuality: 0.8
                });
            } else {
                image = await ImagePicker.openPicker({
                    width: px(700),
                    height: px(700),
                    cropping: true
                });
            }
            
            this.state.image.push(image.path)
            this.viewImage.push({
                image: image.path,
                width: image.width,
                height: image.height
            })
            this.setState({
                image: this.state.image,
            })
            this.cancelChoice();
        } catch (e) {
            if (e.message.indexOf('access') > 0) {
                Alert.alert('', '请进入iPhone的"设置-隐私-照片"选项，允许达令家访问您的手机相机', { text: 'ok' });
            }
            this.cancelChoice();
            log(e.message); return;
        }
    }
    deleteFn = (index) => () => {
        let {image} = this.state
        log(index)
        image.forEach((item, i) => {
            if (i == index) {
                image.splice(i, 1)
                this.viewImage.splice(i, 1)
                return
            }
        })
        this.setState({
            image:image
        })
    }
    
    getImages() {
        let imageArr = [];
        this.state.image && this.state.image.forEach((item, index) => {
            let file = null;
            if (/^http/.test(item)) {
                file = item;
            } else {
                file = { uri: item, type: 'multipart/form-data', name: `image${Date.now()}.png` };
            }
            imageArr.push(file);
        })
        return imageArr;
    }
}

exports.Upload = Upload;
const styles = StyleSheet.create({
    upload: {
        padding: px(30),
        backgroundColor:'#fff',
    },
    row: {
        flexDirection: "row"
    },
    rowItem: {
        position:'relative',
        marginRight:px(20)
    },
    shopImg: {
        width: px(157),
        height: px(157),
        //borderRadius: px(6)
    },
    close: {
        position:'absolute',
        right:px(-17),
        top:px(-17)
    }
   
})
