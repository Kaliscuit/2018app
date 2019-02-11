import React, {Component} from 'react'
import {
    View,
    ScrollView,
    Image,
    PixelRatio,
    Clipboard,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    NativeModules
} from 'react-native'
import {px} from "../../utils/Ratio";
import { OldHeader, TopHeader } from '../common/Header';
import {ImagesRes} from "../../utils/ContentProvider";
import { show as toast } from '../../widgets/Toast';
import base from "../../styles/Base";
import Loading from '../../animation/Loading';
const AppModule = NativeModules.AppModule;
const pxRatio = PixelRatio.get();  // 屏幕像密度
import Icon from '../../UI/lib/Icon'


export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            info : this.props.navigation.state.params.info || {},
            images: [],
            total: 0,
            isHave: false
        }
    }

    componentDidMount() {
        let info = this.props.navigation.state.params.info || {}, total = 0, images = [], isHave = false;
        info.virtualInfoList.forEach(item => {
            if (item.virtualStatus == 1) {
                total++;
                isHave = true;
                images.push(item.virtualDLImgUrl)
            }
        })
        this.setState({
            total,
            images,
            isHave
        })
    }

    skuInfo(info) {
        info = info || {}
        return <View style={styles.SkuWrap}>
            <Image style={styles.SkuImage} source={{uri: info.prodImg}}></Image>
            <View style={styles.SkuInfo}>
                <Text numberOfLines={2} allowFontScaling={false} style={styles.SkuTxt}>
                    {info.goodsName}
                </Text>
            </View>
            <View style={styles.SkuProp}>
                <Text allowFontScaling={false} style={styles.SkuPropTxt}>
                    ¥{info.prodPrice}
                </Text>
                <Text allowFontScaling={false} style={[styles.SkuPropTxt, {color: '#666'}]}>
                    x{info.prodQty}
                </Text>
            </View>
        </View>
    }

    saveImage() {
        let images = this.state.images
        if (!images || images.length == 0) return toast('没有可以保存的二维码');
        this.refs.loading.open()
        try {
            images.forEach(item => {
                AppModule.saveImageToAlbum(item, (ignore, res) => {
                    if (res) {
                        this.refs.loading.close()
                        toast('保存成功');
                    } else {
                        //Platform.OS == 'ios' && toast('保存失败');
                    }
                });
            })
        } catch (e) {
            toast('保存失败');
        }
    }

    skuCode(info) {
        info = info || {}
        const {total, isHave} = this.state
        const len = info.virtualInfoList && info.virtualInfoList.length
        let isOld = false
        if (len > 0) {
            isOld = info.virtualInfoList[0].passwordCode ? true : false
        }
        return <View style={styles.skuCodeWrap}>
            <View style={styles.skuCodeTop}>
                <Text allowFontScaling={false} style={styles.skuCodeTTxt}>请在{info.virtualExpireDate}之前领取</Text>
                <Text allowFontScaling={false} style={styles.skuCodeTTxt}>过期视频课程将无法领取</Text>
                {
                    info.virtualStatus == '1' &&
                    <ScrollView
                        bounces={false}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        style={[{width: px(750), height: px(762), marginTop: px(15)}, len > 1 ? {height: px(825)} : {}]}
                        contentContainerStyle={info.virtualInfoList && info.virtualInfoList.length < 2 ? {flex: 1, alignItems: 'center', justifyContent: 'center'}:{
                            paddingLeft: px(105),
                            paddingRight: px(85),
                        }}>
                        {
                            info.virtualInfoList.map((item, index) => (
                                <View key={index} style={[{width: px(540), height: px(760)}, len > 1 ? {marginTop: px(30), height: px(795), marginRight: px(20)} : {}]}>
                                    <View style={[styles.skuCodePre, len > 1 ? {height: px(770)} : {}]} >
                                        <View style={[styles.klWrap, len > 1 ? {marginTop: px(60)} : {}, item.passwordCode ? {} : {height: px(150)}]}>
                                            {item.passwordCode ? <Icon name="icon-hand" style={styles.klHand}
                                                  resizeMode='contain' /> : null}
                                            <View style={[styles.klBox, item.passwordCode ? {} : {height: px(150)}]}>
                                                {item.passwordCode ? <Text allowFontScaling={false} onLongPress={() => this.copy(item.passwordCode)} style={[styles.klCode, item.virtualStatus == '1' ? {} : {
                                                    color: '#666'
                                                }]}>
                                                    {" " + item.passwordCode + " "}
                                                </Text> : null}
                                                <Text allowFontScaling={false} style={[styles.klTTxt, item.virtualStatus == '1' ? {} : {
                                                    color: '#999'
                                                }]}>
                                                    {item.passwordCode ? '口令码' : ' '}
                                                </Text>
                                                <Text allowFontScaling={false} style={styles.klDTxt}>
                                                    {item.passwordCode ? '长按指纹可复制口令码' : '如果没有口令码，请保存二维码到相册'}
                                                </Text>
                                                {!item.passwordCode ? <Text allowFontScaling={false} style={styles.klDTxt}>
                                                在微信里扫描领取课程
                                                </Text> : null}
                                            </View>
                                        </View>
                                        <Icon name="icon-line" style={{width: px(458), height: px(1)}}
                                              resizeMode='cover' />
                                        <Image style={styles.skuCodeImage} source={{uri: item.virtualImgUrl}}></Image>
                                        <Text style={[styles.skuCodeText, item.virtualStatus == '1' ? {} : styles.skuDisabled]}>好字在公众号</Text>
                                    </View>
                                    {len > 1 && <View style={styles.order}>
                                        <Text allowFontScaling={false} style={styles.orderTxt}> 课程{index + 1} </Text>
                                    </View>}
                                </View>
                            ))
                        }
                    </ScrollView>
                }
                <TouchableWithoutFeedback onPress={() => this.saveImage()}>
                    <View style={[styles.skuCodeBtnNew, isHave ? {} : styles.skuCodeBtnNewDis]}>
                        <Text allowFontScaling={false} style={[styles.skuCodeBTxtNew, isHave ? {} : styles.skuCodeBTxtNewDis]}>{isOld ? '保存口令码和二维码到相册' : '保存二维码到相册'}</Text>
                    </View>
                </TouchableWithoutFeedback>
                <Image style={styles.lines} source={{uri: require('../../images/icon-virtual')}}></Image>
            </View>
            <View style={[styles.skuCodeBottom]}>
                <Text allowFontScaling={false} style={styles.skuCodeBH1}>领取流程</Text>
                <Text allowFontScaling={false} style={styles.skuCodeBP}>1. 请先长按指纹处复制口令码</Text>
                <Text allowFontScaling={false} style={styles.skuCodeBP}>2. 保存图片到相册</Text>
                <Text allowFontScaling={false} style={styles.skuCodeBP}>3. 通过微信长按识别或者扫描二维码，关注“好字在”公众号</Text>
                <Text allowFontScaling={false} style={styles.skuCodeBP}>4. 粘帖或者按照图片信息直接输入口令码，激活课程观看权限（注：本口令码一次有效，激活后立即失效）</Text>
                <Text allowFontScaling={false} style={styles.skuCodeBP}>5. 在公众号底部菜单选择“字有道理”- “我的课程”进行观看</Text>
                <View style={styles.skuCodeBPTipWrap}>
                    <Text allowFontScaling={false} style={styles.skuCodeBPTip}>
                        温馨提示
                    </Text>
                    <View style={styles.tipLine}></View>
                    <View>
                        <Text allowFontScaling={false} style={styles.skuCodeBPTip1}>如果将课程转赠好友，请将保存图片和口令码</Text>
                        <Text allowFontScaling={false} style={styles.skuCodeBPTip1}>一并分享给好友，并由对方操作领取</Text>
                    </View>
                </View>
            </View>
        </View>
    }

    copy(str) {
        Clipboard.setString(str);
        toast('复制成功');
    }

    render() {
        let {info} = this.state
        return <View style={{flex: 1, backgroundColor: '#f6f5f7' }}>
            <TopHeader navigation={this.props.navigation} title="领取视频课程"></TopHeader>
            <ScrollView style={{flex: 1, paddingBottom: px(100)}}>
                {this.skuInfo(info)}
                {this.skuCode(info)}
            </ScrollView>
            <Loading ref='loading' />
        </View>
    }
}

const styles = StyleSheet.create({
    SkuWrap: {
        flexDirection: 'row',
        width: px(750),
        height: px(190),
        paddingVertical: px(20),
        paddingHorizontal: px(25),
        backgroundColor: '#fff'
    },
    SkuImage: {
        width: px(150),
        height: px(150),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    SkuInfo: {
        marginLeft: px(20),
        flex: 1,
        marginTop: px(42)
        // justifyContent: 'center'
    },
    SkuTxt: {
        fontSize: px(28),
        lineHeight: px(35),
        color: '#222222',
        includeFontPadding: false
    },
    SkuProp: {
        marginTop: px(42),
        alignItems: 'flex-end',
        marginLeft: px(15)
    },
    SkuPropTxt: {
        lineHeight: px(40),
        fontSize: px(26),
        color: '#252426',
        includeFontPadding: false
    },
    skuCodePre: {
        position: 'relative',
        alignItems: 'center',
        width: px(540),
        height: px(735),
        marginTop: px(25),
        borderWidth: px(2),
        borderColor: '#ebebeb',
        borderRadius: px(12),
        overflow: 'hidden'
    },
    klWrap: {
        position: 'relative',
        width: px(540),
        height: px(256),
    },
    klCode: {
        fontSize: px(60),
        color: '#222',
        fontWeight: "500",
        includeFontPadding: false
    },
    klTTxt: {
        fontSize: px(30),
        color: '#666',
        marginTop: px(20),
        includeFontPadding: false
    },
    klDTxt: {
        fontSize: px(22),
        color: '#999',
        marginTop: px(5),
        includeFontPadding: false
    },
    klBox: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 2,
        top: 0,
        left: 0,
        width: px(540),
        height: px(256)
    },
    klHand: {
        position: 'absolute',
        top: px(15),
        right: px(108),
        zIndex: 1,
        width: px(140),
        height: px(141),
    },
    skuCodeWrap: {
        marginTop: px(24),
        backgroundColor: '#fff'
    },
    skuCodeTop: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(750),
        paddingTop: px(38)
    },
    skuCodeTTxt: {
        fontSize: px(28),
        color: '#222222',
        lineHeight: px(35),
        includeFontPadding: false
    },
    skuCodeImage: {
        //marginTop: px(24),
        // marginRight: px(30),
        width: px(310),
        height: px(310),
        marginTop: px(60)
    },
    skuCodeText: {
        marginTop: px(10),
        fontSize: px(30),
        color: '#666',
        includeFontPadding: false
    },
    skuDisabled: {
        color: '#999',
    },
    skuCodeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: px(300),
        height: px(70),
        marginTop: px(30),
        borderRadius: px(40),
        overflow: 'hidden',
        backgroundColor: '#d0648f'
    },
    skuCodeBtnNew: {
        alignItems: 'center',
        justifyContent: 'center',
        width: px(410),
        height: px(70),
        marginTop: px(30),
        borderWidth: px(2),
        borderColor: '#222222',
        borderRadius: px(40),
        overflow: 'hidden',
    },
    skuCodeBtnNewDis: {
        borderColor: '#ebebeb',
    },
    skuCodeBTxt: {
        fontSize: px(26),
        color: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    skuCodeBTxtNew: {
        fontSize: px(26),
        color: '#222',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false
    },
    skuCodeBTxtNewDis: {
        color: '#666',
    },
    lines: {
        marginTop: px(40),
        width: px(700),
        height: px(1)
    },
    skuCodeBottom: {
        width: px(750),
        height: px(444),
        paddingHorizontal: px(25)
    },
    skuCodeBH1: {
        paddingTop: px(26),
        paddingBottom: px(18),
        fontSize: px(28),
        color: '#222',
        includeFontPadding: false
    },
    skuCodeBP: {
        lineHeight: px(36),
        fontSize: px(24),
        color: '#666',
        includeFontPadding: false
    },
    skuCodeBPTipWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: px(682),
        height: px(82),
        marginTop: px(20),
        borderRadius: px(8),
        overflow: 'hidden',
        backgroundColor: '#999',
    },
    tipLine: {
        width: px(1),
        height: px(24),
        marginHorizontal: px(15),
        backgroundColor: '#ccc'
    },
    skuCodeBPTip: {
        fontSize: px(24),
        color: '#fff',
        textAlignVertical: 'center',
        textAlign: 'center',
        includeFontPadding: false
    },
    skuCodeBPTip1: {
        lineHeight: px(30),
        fontSize: px(24),
        color: '#fff',
        includeFontPadding: false
    },
    order: {
        width: px(120),
        height: px(50),
        borderRadius: px(26),
        backgroundColor: '#222',
        position: 'absolute',
        top: 0,
        left: px(210),
        justifyContent: 'center',
        alignItems: 'center'
    },
    orderTxt: {
        color: '#fff',
        fontSize: px(28),
        fontWeight: '600'
    }
})
