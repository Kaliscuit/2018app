'use strict';

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    NativeModules,
    Dimensions,
    Modal,
    ActivityIndicator,
    Slider,
    Animated,
    Easing,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';

import { px, isIphoneX } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import Video from 'react-native-video';
import Icon from '../../UI/lib/Icon';
import base from '../../styles/Base';

const AppModule = NativeModules.AppModule;
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

exports.MyVideo = class extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            fullScreenStatus: false,
            src: '',
            videoStatus: false,
            isEnd: false,
            paused: true,
            currentTime:0, //当前播放时间
            loadEnd: false,
            duration: 0, //总时长
            totalTime: 0,
            isShowMenu: false,
            requestStatus: false, //
            rotateStatus: false, //是否旋转
            rotate: new Animated.Value(0),
            saveTipAfterRotate: false,
            saveTip: ''
        };
        //this.rotateStatus = false
    }
    
    /**
     *退出全屏按钮
     */
    renderBackBtn(isShowMenu, rotateStatus) {
        if (!isShowMenu) return null;
        return <TouchableWithoutFeedback onPress={ () => this.outerFullScreen()}>
            <View style={[!rotateStatus ? modalStyles.back : modalStyles.back_, modalStyles.comBack, {
                top:!rotateStatus ? Platform.OS === 'ios' ? isIphoneX() ? px(98) : px(54) : px(94) : px(30),
                left:!rotateStatus ? px(30) : Platform.OS === 'ios' ? isIphoneX() ? px(98) : px(54) : px(94)
            }]}>
                <Icon
                    name='icon-video-back'
                    resizeMode="cover"
                    resizeMethod="resize"
                    style={{width:px(70), height:px(70)}}
                />
            </View>
        </TouchableWithoutFeedback>
    }
    
    /**
     *video
     */
    renderVideo() {
        const {rotateStatus, paused, src} = this.state;
        return <Video
            ref={(ref) => this.videoPlayer_ = ref}
            source={{uri: src}}
            style={{ width:!rotateStatus ? deviceWidth : deviceHeight, height:!rotateStatus ? deviceHeight : deviceWidth}}
            resizeMode='contain'
            rate={1.0}
            volume={1.0}
            muted={false}
            //currentTime={this.state.currentTime}
            playWhenInactive={false}
            playInBackground={false}
            ignoreSilentSwitch={'ignore'}
            progressUpdateInterval={100}
            paused={paused}
            onProgress={(e) => this.onProgress(e)}
            repeat={false}
            onLoadStart={() => this.changeVideoStatus('onLoadStart')}
            onLoad={(data) => this.onLoaded(data)}
            onEnd={() => this.onPlayEnd()}
            onError={() => this.changeVideoStatus('error')}
        />
    }
    
    /**
     *播放，重播等中心按钮
     */
    renderCenter(state) {
        if (state.videoStatus) { //播放视频之前
            return <TouchableWithoutFeedback onPress={() => this.outerFullScreen()}>
                <View style={styles.sty2}>
                    <ActivityIndicator
                        animating={true}
                        style={{ width: px(80), height: px(80) }}
                        size="large"
                        color="#ffffff"
                    />
                    <Text style={styles.text}>{state.hint}</Text>
                </View>
            </TouchableWithoutFeedback>
        } else {
            if (state.requestStatus) {
                return <View style={[styles.sty2, state.rotateStatus && styles.sty3]}>
                    <ActivityIndicator
                        animating={true}
                        style={{ width: px(80), height: px(80) }}
                        size="large"
                        color="#ffffff"
                    />
                    <Text allowFontScaling={false} style={styles.text}>正在保存</Text>
                </View>
            }
            if (state.saveTipAfterRotate) {
                return <View style={modalStyles.saveTipAfterRotate}>
                    <Text allowFontScaling={false} style={modalStyles.saveSuccess}>{state.saveTip}</Text>
                </View>
            }
            if (state.paused) {
                return <TouchableWithoutFeedback onPress={ () => this.play()}>
                    <View style={[modalStyles.videoSwitch, state.rotateStatus && modalStyles.vs_]}>
                        <Icon name="icon-detail-play" style={{width: px(100), height: px(100)}} />
                    </View>
                </TouchableWithoutFeedback>
            }
            if (state.isEnd) {
                return <TouchableWithoutFeedback onPress={ () => this.rePlay()}>
                    <View style={[modalStyles.rePlay, state.rotateStatus && modalStyles.re_]}>
                        <Icon
                            name="icon-rePlay"
                            style={{width: px(174), height: px(80)}}
                        />
                    </View>
                </TouchableWithoutFeedback>
            }
            if (state.isEnd || !state.paused) {
                return <TouchableWithoutFeedback onPress={() => this.switchMenu()}>
                    <View style={[modalStyles.modal_click, !state.rotateStatus ? modalStyles.mc : modalStyles.mc_]}></View>
                </TouchableWithoutFeedback>
            }
        }
    }
    
    /**
     *底部菜单
     */
    renderControl(isShowMenu) {
        if (!isShowMenu) return null;
        return <View 
            style={[modalStyles.control, !this.state.rotateStatus ? modalStyles.ct : modalStyles.ct_, {
                bottom:!this.state.rotateStatus ? isIphoneX() ? px(60) : 0 : 0,
                paddingLeft:!this.state.rotateStatus ? 0 : Platform.OS === 'ios' && !isIphoneX() ? 0 : px(50),
                paddingRight:!this.state.rotateStatus ? 0 : Platform.OS === 'ios' && !isIphoneX() ? 0 : px(50),
            }]}>
            <TouchableWithoutFeedback onPress={ () => this.play()}>
                <View style={[{width:px(131)}, base.line]}>
                    <Icon name={!this.state.paused ? "icon-fullScreenPlay" : "icon-fullScreenPause"}
                        resizeMode="cover"
                        style={{width: px(31), height: px(34)}}
                    />
                </View>
            </TouchableWithoutFeedback>
            <View style={modalStyles.control_}>
                <Text style={[modalStyles.time, {marginRight: px(20)}]} allowFontScaling={false}>{this.betterTime(Math.round(this.state.currentTime))}</Text>
                <Slider
                    style={{flex: 1}}
                    maximumTrackTintColor={'#fff'}
                    minimumTrackTintColor={'#d0648f'}
                    thumbTintColor={'#fff'}
                    thumbImage={{uri: require('../../images/icon-slider')}}
                    value={this.state.currentTime}
                    minimumValue={0}
                    maximumValue={this.state.duration}
                    /*onValueChange={(currentTime) => {
                        this.onSliderValueChanged(currentTime)
                    }}*/
                    onSlidingComplete={(currentTime) => {
                        this.onSliderValueChanged(currentTime)
                    }}
                />
                <Text style={[modalStyles.time, {marginLeft: px(20)}]} allowFontScaling={false}>{this.state.totalTime}</Text>
            </View>
            <TouchableWithoutFeedback onPress={() => this.saveVideo()}>
                <View style={[{marginLeft: px(25), width: px(82)}, base.line]}>
                    <Icon
                        name="icon-detail-download1"
                        resizeMode="cover"
                        style={{width: px(32), height: px(32)}}
                    />
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.rotateVideo()}>
                <View style={[{marginRight: px(20), width: px(84)}, base.line]}>
                    <Icon
                        name="icon-video-r"
                        resizeMode="cover"
                        resizeMethod="resize"
                        style={{width: px(33), height: px(34)}}
                    >
                    </Icon>
                </View>
            </TouchableWithoutFeedback>
        </View>
    }
    
    render() {
        const {isShowMenu, rotateStatus, fullScreenStatus, src, isEnd} = this.state;
        if (!src || src == '') return null;
        return <Modal
            style={modalStyles.modal}
            visible={fullScreenStatus}
            onShow={() => this.enterFullScreen()}
            onRequestClose={() => this.outerFullScreen()}
            animationType="none"
            transparent={true}
        >
            <View style={{flex:1, backgroundColor:'#000'}}>

        
                <Animated.View style={{
                    transform: [
                        {
                            rotate: this.state.rotate.interpolate({
                                inputRange: [0, 90],
                                outputRange: ['0deg', '90deg']
                            })
                        }
                    ], 
                    flex: 1, 
                    width: !this.state.rotateStatus ? deviceWidth : deviceHeight,
                    height: !this.state.rotateStatus ? deviceHeight : deviceWidth,
                    // top:!this.state.rotateStatus ? 0 : (deviceHeight - deviceWidth) / 2,
                    backgroundColor: '#000', 
                    position:'absolute',
                    bottom:!this.state.rotateStatus ? 0 : (deviceHeight - deviceWidth) / 2,
                    left:!this.state.rotateStatus ? 0 : (deviceWidth - deviceHeight) / 2
                }}>
                    {this.renderBackBtn(isShowMenu, rotateStatus)}
                    {this.renderVideo()}
                    {this.renderCenter(this.state)}
                    {this.renderControl(isShowMenu)}
                </Animated.View>
            </View>
        </Modal>
    }
    
    /**
     *视频加载，出错的情况
     */
    changeVideoStatus(status) {
        let tip = ''
        if (status == 'onLoadStart') {
            tip = '视频载入中...'
        } else if (status == 'onBuffering') {
            tip = '视频缓冲中...'
        } else if (status == 'error') {
            tip = '网络不给力，视频没打开，请点击屏幕退出重试'
        }
        this.setState({
            videoStatus: true,
            hint: tip
        })
    }
    
    /**
     *视频加载完成
     */
    onLoaded(data) {
        let duration_ = this.betterTime(Math.round(data.duration))
        //console.log('视频加载完成', data);
        this.setState({
            videoStatus: false,
            hint: '视频加载中...',
            duration: data.duration,
            totalTime: duration_,
            loadEnd: true,
            //isEnd: false,
            paused: false
        })
    }
    
    /**
     *视频播放结束
     */
    onPlayEnd() {
        //console.log(1)
        this.setState({
            isEnd: true,
            isShowMenu: true
        })
    }
    
    /**
     *视频转换横屏
     */
    run() {
        Animated.timing(this.state.rotate, {
            toValue: 90,
            duration: 100,
            easing: Easing.linear
        }).start()
    }
    
    /**
     *视频退出横屏
     */
    out() {
        Animated.timing(this.state.rotate, {
            toValue: 0,
            duration: 100,
            easing: Easing.linear
        }).start()
    }
    
    /**
     *进入全屏
     */
    enterFullScreen(src) {
        if (!src) return;
        this.setState({
            fullScreenStatus: true,
            src
        })
    }
    
    /**
     *初始化参数，退出全屏也需要
     */
    init() {
        this.setState({
            fullScreenStatus: false,
            src: '',
            videoStatus: false,
            isEnd: false,
            paused: true,
            currentTime:0, //当前播放时间
            loadEnd: false,
            duration: 0, //总时长
            totalTime: 0,
            isShowMenu: false,
            requestStatus: false, //
            rotateStatus: false, //是否旋转
            rotate: new Animated.Value(0),
            saveTipAfterRotate: false,
            saveTip: ''
        });
    }
    
    /**
     *视频退出全屏
     */
    outerFullScreen() {
        this.init()
    }
    
    /**
     *横竖屏切换操作
     */
    rotateVideo() {
        if (!this.state.rotateStatus) {
            this.run()
        } else {
            this.out()
        }
        this.setState({
            rotateStatus: !this.state.rotateStatus
        })
    }
    
    /**
     *播放和暂停
     */
    play() {
        this.state.loadEnd && this.setState({
            paused: !this.state.paused,
            //isEnd: false
        })
    }
    
    /**
     *重播操作
     */
    rePlay() {
        this.videoPlayer_.seek(0)
        
        this.setState({
            isEnd: false
            //paused: !this.state.paused
        })
    }
    
    /**
     *控制进度
     */
    onSliderValueChanged(currentTime) {
        //console.log(currentTime)
        this.videoPlayer_.seek(currentTime);
        this.setState({
            currentTime: currentTime
        })
    }
    
    /**
     *格式化时间
     */
    betterTime(time) {
        let time_m = Math.floor(Math.floor(time) / 60)
        let time_s = Math.floor(Math.floor(time) % 60)
        let time_ = (time_m < 10 ? '0' + time_m : time_m) + ':' + (time_s < 10 ? '0' + time_s : time_s)
        return time_
    }
    
    /**
     *视频播放进度
     */
    onProgress(data) {
        //console.log(data)
        let currentTime = data.currentTime;//当前播放时间
        if (this.state.isEnd) {
            currentTime = this.state.duration
        }
        this.setState({
            currentTime
        })
    }
    
    _onProgressFs(data) {
        //console.log(data, (this.state.duration + '').substr(0, (this.state.duration + '').indexOf('.') + 2))
        let _total = this.state.duration
        if ((this.state.duration + '').indexOf('.') > -1) {
            _total = (this.state.duration + '').substr(0, (this.state.duration + '').indexOf('.') + 2)
        } else {
            _total = this.state.duration
        }
        let _cur = (data.currentTime + '').substr(0, (data.currentTime + '').indexOf('.') + 2)
        if (Math.floor(data.currentTime) == 0) {
            //this.isEnd = false
            /*this.setState({
                isEnd: false
            })*/
        }
        //let duration = data.playableDuration;//视频进度
        let current_time = data.currentTime;//当前播放时间
        let percent = Number(current_time / duration).toFixed(2);//视频总分钟数
        let current_ = this.betterTime(Math.floor(current_time))
        //let duration_ = this.betterTime(Math.floor(duration))
        this.setState({
            //duration:duration_,
            currentTime: current_time
        });
        if (_cur != 0 && _total * 1 - _cur * 1 <= 0.3) {
            if (!this.isEnd) {
                this.play()
                this.setState({
                    isShowMenu: true,
                    isEnd: true
                })
                this.isEnd = true
            } else {
                //this.isEnd = false
            }
        } else {
            this.setState({
                isEnd: false
            })
            this.isEnd = false
        }
    }
    
    /**
     *视频横屏的提示，此时不能用toast
     */
    saveTip(status) { //视频旋转后提示文案需要手动旋转
        //console.log(status)
        this.setState({
            saveTip: status,
            saveTipAfterRotate: true
        }, () => {
            if (this.timer2) return;
            this.timer2 = setTimeout(() => {
                this.setState({
                    saveTipAfterRotate: false
                });
                if (this.timer2) clearTimeout(this.timer2);
                this.timer2 = null;
            }, 1500);
        })
    }
    
    async saveVideo() {
        //console.log(1)
        let goodName = '',
            video = this.state.src,
            currentTime = new Date().getTime();
        let videoFileName = `${currentTime}.mp4`;
        this.setState({
            requestStatus: true
        }, () => {
            try {
                AppModule.saveVideoToAlbum(video, videoFileName).then((res) => {
                    if (res) {
                        this.setState({
                            requestStatus: false
                        });
                        !this.state.rotateStatus && toast('保存成功');
                        this.state.rotateStatus && this.saveTip('保存成功')
                    }
                }).catch((res) => {
                    !this.state.rotateStatus && toast('视频下载失败，可能是您的网络不稳定，请稍候重试');
                    this.state.rotateStatus && this.saveTip('视频下载失败，可能是您的网络不稳定，请稍候重试')
                });
            } catch (e) {
                !this.state.rotateStatus && toast('视频下载失败，可能是您的网络不稳定，请稍候重试');
                this.state.rotateStatus && this.saveTip('视频下载失败，可能是您的网络不稳定，请稍候重试')
            } finally {
            }
        })
    }
    
    /**
     *控制菜单的出现
     */
    
    switchMenu() {
        this.setState({
            isShowMenu: !this.state.isShowMenu
        })
    }
}

const modalStyles = StyleSheet.create({
    modal: {
        flex:1,
        // alignItems: 'center',
        // justifyContent: 'center',
        // height:deviceHeight,
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // bottom: 0,
        // zIndex: 999
        //width: px(750)
    },
    modalWrap: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,1)'
    },
    modal_click: {
        //backgroundColor: '#ff0',
        position: 'absolute',
    },
    mc: {
        width: px(750),
        top: px(165),
        left: 0,
        bottom: px(105),
    },
    mc_: {
        width:deviceHeight - px(165),
        top: px(105),
        left: px(135),
        bottom: px(105),
    },
    comBack: {
        position:'absolute',
        zIndex:1
    },
    back: {
        //left:px(30),
        //top:Platform.OS === 'ios' ? isIphoneX() ? px(98) : px(54) : px(94),
    },
    back_: {
        //left:Platform.OS === 'ios' ? isIphoneX() ? px(98) : px(54) : px(94),
        //top:px(30)
        //top:px(40) + (deviceHeight - deviceWidth),
        //left:px(200),
        //top:px(500),
    },
    videoSwitch: {
        position: 'absolute',
        top: deviceHeight / 2 - px(50),
        left: deviceWidth / 2 - px(50),
        zIndex:1
    },
    vs_: {
        //top: (deviceWidth/2 - px(50)) + (deviceHeight-deviceWidth),
        left: deviceHeight / 2 - px(50),
        top: deviceWidth / 2 - px(50),
        //bottom: 0, top: 0,
    },
    rePlay: {
        position: 'absolute',
        top: deviceHeight / 2 - px(40),
        left: px(288),
        zIndex:1
    },
    re_: {
        //top: (deviceWidth/2 - px(50)) + (deviceHeight-deviceWidth),
        left: deviceHeight / 2 - px(50),
        top: deviceWidth / 2 - px(50)
    },
    control: {
        height:px(100),
        backgroundColor: 'rgba(0,0,0,.4)',
        //backgroundColor:'#ff0',
        position:'absolute',
        zIndex:999,
        flexDirection:'row',
        alignItems:'center',
        left:px(0),
        
    },
    ct: {
        width:px(750),
        //bottom:isIphoneX() ? px(60) : px(0)
    },
    ct_: {
        bottom: px(0),
        width:deviceHeight,
        //paddingLeft:Platform.OS === 'ios' && !isIphoneX() ? 0 : px(50),
        //paddingRight:Platform.OS === 'ios' && !isIphoneX() ? 0 : px(50),
        //top:deviceHeight / 2 - px(50),
        //transform:[{rotate: '90deg'}]
    },
    control_: {
        flex:1,
        flexDirection:'row',
        alignItems:'center'
    },
    time: {
        color:'#fff',
        fontSize:px(22)
    },
    saveTipAfterRotate: {
        position: 'absolute',
        /*top: (deviceWidth/2 - px(50)) + (deviceHeight-deviceWidth),
        left: deviceHeight / 2 - px(50),*/
        left: 0, right: 0, margin: 'auto',
        //left: deviceHeight / 2 - px(50),
        top: deviceWidth / 2 - px(40),
        zIndex:1,
        minWidth: px(174),
        height: px(80),
        paddingHorizontal: px(10),
        backgroundColor: 'rgba(0,0,0,.4)',
        borderRadius: px(30),
        justifyContent:'center',
        alignItems:'center'
    },
    saveSuccess: {
        color:'#fff',
        fontSize:px(22)
    }
})

const styles = StyleSheet.create({
    sty2: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 10,
        flex:1,
        //backgroundColor: 'rgba(0,0,0,0.4)',
        //backgroundColor: '#ff0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sty3:{
        bottom: px(0)
    },
    text: {
        color: '#fff',
        marginTop: px(0)
    }
    
});
