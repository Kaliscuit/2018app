/**
 * 发布素材上传视频
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    PanResponder, Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback, NativeModules
} from 'react-native'
import { px, deviceHeight } from '../../../utils/Ratio';
import { LoadingRequest } from '../../../widgets/Loading';
import Event from '../../../services/Event';
import {UploadOperation} from './Operation';
import Icon from '../../../UI/lib/Icon'
import Video from 'react-native-video'
import {VideoModal} from './Extra'

export default class UploadVideo extends React.Component {
    constructor(props) {
        super(props)
        this.empty = {
            uri: require('../../../images/uploadMatter')
        };
        this.w = 1;
        this.h = 1;
        //console.log(props.video)
        if (props.video) {
            let video = props.video, size = video.width / video.height;
            if (video.width > video.height) {
                this.w = px(690)
                this.h = px(690) / size;
            }
            if (video.width == video.height) {
                this.w = px(456)
                this.h = px(456) / size;
            }
            if (video.width < video.height) {
                this.w = px(388)
                this.h = px(388) / size;
            }
            this.left = this.w / 2 - px(50);
            this.top = this.h / 2 - px(50);
            this.state = {
                loading: false,
                video: video
            }
        }
    }

    index = -1;
    h = px(200)
    deleteY = deviceHeight - px(140);
    setPageY(y) {
        this.deleteY = y;
    }
    componentDidMount() {
        Event.on('matter.calPageY', this.setPageY)
    }
    _onLayout(e) {
        NativeModules.UIManager.measure(e.target, (x, y, width, height, pageX, pageY) => {
            //console.log(x, y, width, height, pageX, pageY, '=====');
            this.x = pageX;
            this.y = pageY;
        });
    }

    // componentWillMount(){
    //     this._panResponder = PanResponder.create({
    //         onStartShouldSetPanResponder: (evt, gestureState) => true,
    //         onMoveShouldSetPanResponder: (evt, gestureState) => true,
    //         onPanResponderGrant: (evt, gestureState) => {
    //             const {pageY, pageX, locationY, locationX} = evt.nativeEvent;
    //             let y = pageY - this.y, x = pageX, h = this.h;
    //             //console.log(x, y, h, '===========', Math.floor(x / h), Math.floor(y / h) * 3, i)
    //             this.preY = pageY - locationY;
    //             this.preX = pageX - locationX;
    //             //console.log(pageY, pageX, locationY, locationX, evt.nativeEvent, '触摸屏幕')
    //             return;
    //         },
    //         onPanResponderMove: (evt, gestureState) => {
    //             //return;
    //             const {pageY, pageX, locationY} = evt.nativeEvent;
    //             //console.log(gestureState, evt.nativeEvent, '移动屏幕')
    //             let top = this.preY + gestureState.dy - this.y;
    //             let left = this.preX + gestureState.dx ;
    //             //console.log(this.index, top, left, '=========move')
    //             this.video.setNativeProps({
    //                 style: {top: top, left: left}
    //             });
    //             return;



    //         },
    //         onPanResponderTerminationRequest: (evt, gestureState) => true,
    //         onPanResponderRelease: (evt, gestureState) => {
    //             const {pageY, pageX, locationY} = evt.nativeEvent;
    //             //console.log(evt.nativeEvent, '结束屏幕')
    //             //go back the correct position
    //             //console.log(this.index, '结束屏幕')
    //             /*if (pageY > this.deleteY) {
    //                 this.delPhotos(this.index)
    //             }*/

    //             let top = this.preY + gestureState.dy - this.y
    //             //console.log(top, this.y, this.deleteY)
    //             if (top + this.y > this.deleteY - this.h - 50) {
    //                 this.delVideo();
    //             }
    //             return;
    //         },
    //         onPanResponderTerminate: (evt, gestureState) => {
    //             // Another component has become the responder, so this gesture
    //             // should be cancelled
    //         }
    //     });
    // }

    render() {
        const {video} = this.state;
        //if (!video) return null;
        //return null;
        return <View style={styles.upload} onLayout={(e) => this._onLayout(e)} >
            <VideoModal ref="videoModal" delVideo={this.delVideo.bind(this)}/>
            <LoadingRequest status={this.state.loading} text={'正在上传中...'} />
            <View style={[styles.row, {height: video ? this.h : px(224)}]}>
                {
                    video ?
                        <View style={{position: 'absolute'}} ref={(ref) => this.video = ref}>
                            <TouchableWithoutFeedback onPress={() => this.openVideo()}>
                                <View style={[styles.video, {
                                    width: this.w,
                                    height: this.h
                                }]}>
                                    <Video
                                        resizeMode='contain'
                                        paused
                                        source={{uri: video.path}}
                                        style={[styles.video, {
                                            width: this.w,
                                            height: this.h
                                        }]}
                                    />
                                    <Icon name="icon-detail-play" style={[styles.icon, {
                                        top: this.top,
                                        left: this.left,
                                    }]} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        :
                        <TouchableOpacity onPress={() => this.click()}>
                            <View
                                /*{...this._panResponder.panHandlers}*/
                                //ref={(ref) => this.items[index] = ref}
                                style={[styles.rowItem]}
                            >
                                <Image
                                    style={styles.img}
                                    source={{ uri: this.empty.uri }} />
                            </View>
                        </TouchableOpacity>
                }
            </View>
            <Text style={styles.tip} allowFontScaling={false}>上传视频大小不可超过30M</Text>
        </View>
    }

    openVideo() {
        let src = this.state.video.path;
        this.refs.videoModal && this.refs.videoModal.open(src)
    }

    delVideo() {
        this.setState({
            video: null
        })
    }

    async click() {
        let video = await UploadOperation.uploadVideo();
        //console.log(video, '0000000000')

        let size = video.width / video.height;
        if (video.width > video.height) {
            this.w = px(690)
            this.h = px(690) / size;
        }
        if (video.width == video.height) {
            this.w = px(456)
            this.h = px(456) / size;
        }
        if (video.width < video.height) {
            this.w = px(388)
            this.h = px(388) / size;
        }
        this.left = this.w / 2 - px(50);
        this.top = this.h / 2 - px(50);
        
        this.setState({
            video
        })
    }

    getVideo() {

        let video = this.state.video;
        let path = video ? video.path : null, size = video.size;
        let file = { uri: path, type: 'multipart/form-data', watermarkYn: 1, name: `video${Date.now()}.mp4`, size: size };
        return file;
    }

}

const styles = StyleSheet.create({
    upload: {
        paddingHorizontal: px(31),
    },
    row: {
        //flexDirection: "row"
    },
    rowItem: {
        width: px(224),
        height: px(224),
        borderRadius: px(8),
        overflow: 'hidden'

    },
    img: {
        width: px(224),
        height: px(224),
        borderRadius: px(8),
        overflow: 'hidden'
    },
    video: {
        width: px(690),
        height: px(388),
        backgroundColor: '#000',
        borderRadius: px(10),
        overflow: 'hidden'
    },
    icon: {
        width: px(100),
        height: px(100),
        position: 'absolute',
        zIndex: 1
    },
    tip: {
        color: '#ccc',
        fontSize: px(24),
        includeFontPadding: false,
        marginTop: px(10)
    }

})


