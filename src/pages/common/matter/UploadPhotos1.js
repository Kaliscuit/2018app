/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    BackHandler,
    Image,
    ViewPagerAndroid,
    DeviceEventEmitter,
    PanResponder,
    TouchableWithoutFeedback,
    Animated,
    Easing 
} from 'react-native';

import { px, deviceHeight, deviceWidth } from '../../../utils/Ratio';
const IMG_WIDTH = (deviceWidth - 52) / 4;
const IMG_HEIGHT = (deviceHeight - 40) / 4;

export default class ImageView extends Component {
    constructor(props){
    super(props);
    this.state = {
      imgs: [
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2908558741,1476032262&fm=27&gp=0.jpg',
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2660096790,1445343165&fm=27&gp=0.jpg',
        'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=586492344,3997176522&fm=27&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1138659146,799893005&fm=27&gp=0.jpg',
        'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2634329296,2422503635&fm=27&gp=0.jpg',
        'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2793821546,4232499990&fm=27&gp=0.jpg',
      ],
      showDelModal: false,
      delText: '拖拽此处可以删除',
    };

    this.slideAniValue = new Animated.Value(-60);

    this.items = [];
  }
  static navigationOptions = ({navigation}) => {

    return {
      title: "照片拖拽删除",
      
      headerLeft: (
        <TouchableOpacity >
          <Text style={styles.titleText} onPress={()=>navigation.goBack(null)}>返回</Text>
        </TouchableOpacity>
      )
    }
  }

  componentDidMount() {
    //注册通知
    DeviceEventEmitter.addListener('ChangeImgData',(data)=>{
        //接收到详情页发送的通知，刷新首页的数据，改变按钮颜色和文字，刷新UI
        this.setState({
          imgs: data.imgData
        })
    });

  }

  pressImage(v, i) {
    const {navigation} = this.props;
    navigation.navigate('ImageShowScreen', {uri: v, index: i, images: this.state.imgs});
  } 

  _getIdByPosition(pageX, pageY) {
    let w = IMG_WIDTH;
    let h = IMG_HEIGHT;
    let id = -1;

    if(pageY >= 210 && pageY <= 210 + h){
      // 在第一排点击
      if(pageX >= 10 && pageX <= 10 + w){
        id = 0;
      }
      if(pageX >= 20 + w && pageX <= 20 + w + w){
        id = 1;
      }
      if(pageX >= 30 + 2*w){
        id = 2;
      }
      if(pageX >= 40 + 3*w){
        id = 3;
      }
    }
    if(pageY >= 210 + 20 + h && pageY <= 210 + 20 + h + h){
      // 在第二排点击
      if(pageX >= 10 && pageX <= 10 + w){
        id = 4;
      }
      if(pageX >= 20 + w && pageX <= 20 + w + w){
        id = 5;
      }
      if(pageX >= 30 + 2*w){
        id = 6;
      }
      if(pageX >= 40 + 3*w){
        id = 7;
      }
    }

    if(pageY >= 210 + 20 + h + h + 10 && pageY <= 210 + 20 + h + h + 10 + h){
      // 在第三排点击的
      if(pageX >= 10 && pageX <= 10 + w){
        id = 8;
      }
      
    }

    return id;
  }

  _getTopValueYById(id) {
    
    let top = 0;
    let left = 0;

    if(id >= 0 && id <= 3){
      left = (10 + IMG_WIDTH)*id + 10;
    }else if(id > 3 && id <= 7){
      left = (10 + IMG_WIDTH)*(id - 4) + 10;
    }else if(id > 7){
      left = 10;
    };

    top = Math.floor(id/4)*(10+IMG_HEIGHT)+10 + 200;

    return {
      top,
      left
    }

  }

  componentWillMount(){
    this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,   
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => {   // 手指触碰屏幕那一刻触发
            
            const {pageX, pageY, locationY, locationX} = evt.nativeEvent;  // pageY是相对于根节点的位置，locationY是相对于元素自己
            
            this.index = this._getIdByPosition(pageX, pageY);

            this.preY = pageY - locationY;   // 保存当前正确点击item的位置，为了后面移动item
            this.preX = pageX - locationX;   // 保存当前正确点击item的位置，为了后面移动item
            
            let item = this.items[this.index];

            item.setNativeProps({
                style: {
                    shadowColor: "#000",
                    shadowOpacity: 0.7,
                    shadowRadius: 5,
                    shadowOffset: {height: 4, width: 2},
                    elevation: 15,
                    zIndex: 999
                }
            });

            this.setState({
              showDelModal: true
            });

            // 删除区域出来
            // this.slideAniValue.setValue(-60);
            Animated.timing(this.slideAniValue, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear,// 线性的渐变函数
            }).start();

        },
        onPanResponderMove: (evt, gestureState) => {
          
            let top = this.preY + gestureState.dy;
            let left = this.preX + gestureState.dx;
            let item = this.items[this.index];

            item.setNativeProps({
                style: {top: top, left: left},
            });

            if(top >= deviceHeight- IMG_HEIGHT - 60){ // 图片进入删除区域
              this.setState({
                delText: '松开删除',
              });

            }else{
              this.setState({
                delText: '拖拽此处可以删除'
              })
            }
        },
        onPanResponderTerminationRequest: (evt, gestureState) => true,   // 当有其他不同手势出现，响应是否中止当前的手势  
        onPanResponderRelease: (evt, gestureState) => {  // 手指离开屏幕触发

            this.setState({
              showDelModal: false
            });

            // 删除区域隐藏
            // this.state.slideOutBottom.setValue(-60);
            Animated.timing(this.slideAniValue, {
                toValue: -60,
                duration: 300,
                easing: Easing.linear,// 线性的渐变函数
            }).start();

            if(this.state.delText == '松开删除'){
              // 删除图片
              this.delImage(this.index);
            }else{

              const shadowStyle = {
                  shadowColor: "#000",
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  shadowOffset: {height: 0, width: 0,},
                  elevation: 0,
                  zIndex: 1
              };
              let item = this.items[this.index];
              // 回到原来的位置
              item.setNativeProps({
                  style: {...shadowStyle, top: this._getTopValueYById(this.index).top, left: this._getTopValueYById(this.index).left}
              });
            }
            
        },
        onPanResponderTerminate: (evt, gestureState) => {    // 当前手势中止触发
          
        }
    });

  }

  imgDelAni(index) {
    
  }

  delImage(index) {
    // 删除照片
    this.imgDelAni(index);
    let cacheData = this.state.imgs;
    cacheData.splice(index,1);
    // 调整位置
    this.setState({
      imgs: cacheData
    });

    let l = 0; // left
    let t = 0; // top
    if(index>=0 && index<=3){
      l = (10+IMG_WIDTH)*index + 10;
    }else if(index>3 && index<=7){
      l = (10+IMG_WIDTH)*(index-4) + 10;
    }else if(index>7){
      l = 10;
    };
    t = Math.floor(index/4)*(10+IMG_HEIGHT)+10 + 200;

    this.items[index].setNativeProps({
      style: {
        left: l,
        top: t,
        zIndex: 1
      }
    })

  }

  render() {
    return (
      <View style={styles.imgContainer}>
        {
          this.state.imgs.map((v, i) => {
            let l = 0; // left
            let t = 0; // top
            if(i >= 0 && i <= 3){
              l = (10 + IMG_WIDTH)*i + 10;
            }else if(i > 3 && i <= 7){
              l = (10 + IMG_WIDTH)*(i - 4) + 10;
            }else if(i > 7){
              l = 10;
            };
            t = Math.floor(i/4)*(10+IMG_HEIGHT)+10 + 200;
            return (
              <View
                style={[styles.imageStyle, {left: l, top: t}]}
                {...this._panResponder.panHandlers}
                ref={ref => this.items[i] = ref}
                activeOpacity={0.2}
                key={i}
              >
                <TouchableOpacity onPress={() => this.pressImage(v, i)} style={[styles.imageStyle, {left: 0, top: 0}]}>
                  <Image  source={{uri: v}} style={[styles.imageStyle, {left: 0, top: 0}]} />
                </TouchableOpacity>
              </View>
            )
          })
        }

        <Animated.View style={[styles.delWraper, {bottom: this.slideAniValue}]}>
          <Text style={{color: '#fff'}}>{this.state.delText}</Text>
        </Animated.View>

        {
          this.state.showDelModal &&
          <View style={styles.shadowModal}></View>
        }
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1
  },
  imageStyle: {
    width: IMG_WIDTH,
    height: IMG_HEIGHT,
    position: 'absolute',
    borderRadius: 3,
  },
  delWraper:{
    width: deviceWidth,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    position: 'absolute',
    // bottom: 0,
    left: 0,
    zIndex: 998
  },
  shadowModal:{
    width: deviceWidth,
    height: deviceHeight,
    position: 'absolute',
    backgroundColor: '#000',
    opacity: 0.4,
    zIndex: 888,
    bottom: 0,
    left: 0,
  }
});