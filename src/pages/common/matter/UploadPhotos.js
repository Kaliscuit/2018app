/**
 * 发布素材上传图片
 */

'use strict';
import React, { PureComponent } from 'react';
import {
    PanResponder, View, StyleSheet, Image, Text,
    TouchableWithoutFeedback, NativeModules,
    Animated
} from 'react-native'
import { px, deviceHeight, deviceWidth } from '../../../utils/Ratio';
import { LoadingRequest } from '../../../widgets/Loading';
import { LookBigImgModal } from '../ModalView';
import { UploadOperation } from './Operation';
import Event from '../../../services/Event';


class ImageMove extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            offset: new Animated.ValueXY(0, 0),
        }
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {
                this.move = true;
                this.props.setShowDeleteButton(true)
                this.props.setScroll(false)
                this.setState({zIndex:10})
                
            },
            onPanResponderMove: (evt, gestureState) => {

                let x = gestureState.moveX - gestureState.x0
                let y = gestureState.moveY - gestureState.y0
                
                this.state.offset.setValue({ x, y })
                if (gestureState.dy > deviceHeight - gestureState.y0 - 150){
                    this.arrive = true
                } else {
                    this.arrive = false
                }
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                this.move = false;
                this.props.setScroll(true)
                this.props.setShowDeleteButton(false)
                if (this.arrive){
                    this.props.delPhotos()
                } else {
                    this.props.moveEnd({
                        x: this.state.offset.x._value,
                        y: this.state.offset.y._value,
                    });
                }
                this.setState({zIndex:1})
                this.state.offset.setValue({ x: 0, y: 0 })
            },
            onPanResponderTerminate: (evt, gestureState) => {
                // this.move = false
            }
        });
    }
    _panResponder;
    move = false;
    arrive = false;
    offset = { x: 0, y: 0 }
    componentDidMount() {

    }
    render() {
        return <Animated.View {...this._panResponder.panHandlers} style={{
            width:px(232),
            height:px(232),
            zIndex:this.state.zIndex,
            transform: [{
                translateX: this.state.offset.x,
            }, {
                translateY: this.state.offset.y,
            }]
        }}>
            <TouchableWithoutFeedback onPress={() => this.props.click()}>
                <Image source={{ uri: this.props.src }} style={{
                    width: px(224),
                    height: px(224),
                    borderRadius: px(10)
                }} />
            </TouchableWithoutFeedback>

        </Animated.View>
    }
}

export default class UploadPhotos extends React.Component {
    constructor(props) {
        super(props)
        this.items = [];
        let images = [];
        this.order = [];
        
        this.emptyImgs = {
            uri: require('../../../images/uploadMatter'),
            upload: true
        }
        let height = 0;
        if (props.images) {
            images = props.images;
            // images.map((item, index) => {
            //     item.left = index % 3 * px(232);
            //     item.top = Math.floor(index / 3) * px(232)
            // })
            this.order = images;
            height = images.length < 10 ? Math.floor((images.length + 1) / 3) * px(232) : 3 * px(232);
        }
        this.state = {
            loading: false,
            detail: null,
            images: images,
            totalHeight: height
        }
    }

    index = -1;
    h = px(232)

    resetH(y) {
        this.y = this.backupsY - y;
    }

    getIndex(x, y) {
        let index = -1, h = this.h;
        index = Math.floor(x / h) + Math.floor(y / h) * 3;
        return index;
    }

    setTop(index) {
        return Math.floor(index / 3) * this.h;
    }
    setLeft(index) {
        return index % 3 * this.h;
    }
    deleteY = deviceHeight - px(140);
    setPageY(y) {
        this.deleteY = y;
    }

    canSet = false;
    moveLock = false;
    arrive = false;

    componentDidMount() {
        Event.on('matter.calPageY', this.setPageY)
    }
    _onLayout(e) {
        NativeModules.UIManager.measure(e.target, (x, y, width, height, pageX, pageY) => {
            this.x = pageX;
            this.y = pageY;
            this.backupsY = pageY;
        });
    }
    /**
     *销毁所有本地已经选择图片
     */

    componentWillUnmount() {
        Event.off('matter.calPageY', this.setPageY)
        UploadOperation.removeAllPhotos();
    }
    //px(224)
    moveEnd(index, e) {
        let imgs = this.state.images;
        let old = [index % 3, index / 3 >> 0];
        let len = px(224);
        let curr_x = +(e.x / len).toFixed(0);
        let curr_y = +(e.y / len).toFixed(0);
        old[0] = old[0] + curr_x;
        old[1] = old[1] + curr_y;
        if (old[0] < 0) old[0] = 0;
        if (old[0] > 3) old[0] = 3;
        if (old[1] < 0) old[1] = 0;
        if (old[1] > 3) old[1] = 3;
        let curr = old[1] * 3 + old[0];
        if (curr >= imgs.length) curr = imgs.length - 1;
        let cur_img = imgs.splice(index, 1);
        imgs.splice(curr, 0, ...cur_img);
        this.setState({ images: imgs })
    }


    render() {
        let images = this.state.images;
        //console.log(images, 'images')
        return <View pointerEvents='box-none' onLayout={(e) => this._onLayout(e)} ref="test2" style={[styles.upload, { height: 3 * px(232) + 150 }]}>
            <LookBigImgModal
                delPhotos={this.delPhotos.bind(this)}
                ref="lookBigImgModal" />
            <LoadingRequest status={this.state.loading} text={'正在上传中...'} />
            <View pointerEvents='auto' ref='row' style={[styles.row, { height: this.state.totalHeight }]}>
                {
                    images.map((item, index) => <ImageMove key={index}
                        setScroll={e => this.props.setScroll(e)}
                        moveEnd={e => this.moveEnd(index, e)}
                        delPhotos={e => this.delPhotos(index)}
                        setShowDeleteButton={e => this.props.setShowDeleteButton(e)}
                        click={e => this.click(index, item)}
                        src={item.uri} />)
                }
                {
                    images.length < 9 &&
                    <View style={{width:px(232), height:px(232), }}>
                        <TouchableWithoutFeedback onPress={() => this.click(9, this.emptyImgs)}>
                            <Image
                                resizeMethod="scale"
                                style={styles.img}
                                source={{ uri: this.emptyImgs.uri }} />
                            {/*<View><Text>{index}upload</Text></View>*/}
                        </TouchableWithoutFeedback>
                    </View>
                }
            </View>
        </View>
    }

    delPhotos(delindex) {
        this.items = []
        this.order = []
        //let images = [].concat(this.order);
        let images = this.state.images;
        images.splice(delindex, 1);
        this.order = images;
        let height = images.length < 9 ? (Math.floor(images.length / 3) + 1) * px(232) : 3 * px(232);
        this.props.updatePhotoTotalHeight(height)
        this.setState({
            images,
        }, () => {
            this.items.forEach((i, index) => {
                if (i) {
                    i.setNativeProps({
                        style: {
                            left: this.setLeft(index),
                            top: this.setTop(index),
                            zIndex: 1
                        }
                    })
                } else {
                    this.upload.setNativeProps({
                        style: {
                            left: this.setLeft(index),
                            top: this.setTop(index),
                            zIndex: 1
                        }
                    })
                }
            })
        })
        let l = 0, t = 0;
        l = this.setLeft(delindex)
        t = this.setTop(delindex)
        UploadOperation.removePhotos(delindex);
    }

    click(index, item) {
        let images = this.state.images;
        let bigImages = images.filter((i, kIndex) => kIndex < 9 && !i.upload);
        bigImages.map(i => i.url = i.uri);
        if (item.upload) {
            // 上传按钮
            this.upPhotos();
            //console.log('上传')
        } else {
            this.refs.lookBigImgModal && this.refs.lookBigImgModal.open(index, bigImages);
            //console.log('大图')
            //this.openBigImg()
        }
    }
    async upPhotos() {
        let images = await UploadOperation.upPhotos(9)
        if (images.status == 0) {
            //console.log(images.photos)
            let photos = images.photos;
            let height = photos.length < 9 ? Math.floor(photos.length / 3 + 1) * px(232) : 3 * px(232);
            this.setState({
                images: photos,
                totalHeight: height
            }, () => {
                //console.log(photos, this.state.images)
            });
            this.props.updatePhotoTotalHeight(height)
            this.order = images.photos;
        } else {
            if (images.err && images.err.indexOf('取消') !== -1) {
                //toast('您已取消了')
            } else {
                //toast('请您稍后再试')
            }
        }
    }

    getPhotos() {
        /*let images = this.state.images;
        images = this.order;*/
        //let images = this.state.images.filter(v => !v.upload);
        let images = this.order.filter(v => !v.upload);
        let imageArr = [];
        images.forEach((item, index) => {
            let file = null;
            if (/^http/.test(item)) {
                file = item;
            } else {
                file = { uri: item.uri, type: 'multipart/form-data', watermarkYn: 1, name: `image${Date.now()}.png`, size:item.size };
            }
            imageArr.push(file);
        })
        return imageArr;
    }

}

const styles = StyleSheet.create({
    upload: {
        paddingLeft: px(31),
        //backgroundColor: '#000',
        width: px(750)
    },
    row: {
        flexDirection: "row",
        flexWrap: 'wrap'
        //backgroundColor: '#ff0'
    },
    rowItem: {
        position: 'absolute',
        width: px(224),
        height: px(224),
        borderRadius: px(10),
        overflow: 'hidden',
        zIndex: 1
    },
    img: {
        width: px(224),
        height: px(224),
        borderRadius: px(10),
        overflow: 'hidden'
    }

})


