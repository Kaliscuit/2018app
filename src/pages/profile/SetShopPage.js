'use strict';

import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    Alert,
    Platform
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';
import {px, pxRatio} from '../../utils/Ratio';
import { get, uploadImage } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { LoadingRequest } from '../../widgets/Loading';
import { log } from '../../utils/logs';
import { TopHeader } from '../common/Header'

import ScreenUtil from "../../utils/ScreenUtil";
import HeaderImage from "../common/HeaderImage";
import Icon from "../../UI/lib/Icon";
import {ImagesRes} from "../../utils/ContentProvider";



export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            detail: null,
            type: this.props.navigation.state.params.type,
            loading: false
        };
        this.timer = null;
        this.pressNums = 0;
    }

    render() {
        return <View style={{ flex: 1, width: px(750) }}>
            <TopHeader navigation={this.props.navigation}
                title="店铺设置"/>
            <LoadingRequest status={this.state.loading} text={'正在上传中...'} />
            {this.state.detail && 
                <ScrollView style={styles.container}>
                    <View>
                        <TouchableWithoutFeedback onPress={() => this.choosePic()}>
                            <View style={styles.row}>
                                <Text allowFontScaling={false} style={styles.rowLabel}>店铺头像</Text>
                                <View style={styles.rowItem}>
                                    <HeaderImage imgSource={this.state.detail.shopIndexImg}/>
                                    <Icon name="icon-arrow" style={styles.arrto} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => this.changeName()}>
                            <View style={styles.row}>
                                <Text allowFontScaling={false} style={styles.rowLabel}>店铺名称</Text>
                                <View style={styles.rowItem}>
                                    <Text allowFontScaling={false} style={styles.rowTxt}>{this.state.detail.shopName}</Text>
                                    <Icon name="icon-arrow" style={styles.arrto} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => this.chooseShopImg()}>
                            <View style={styles.row}>
                                <Text allowFontScaling={false} style={styles.rowLabel}>店招图片</Text>
                                <View style={styles.rowItem}>
                                    <Image
                                        style={styles.shopImg}
                                        source={{ uri: this.state.detail.shopImg }} />
                                    <Icon name="icon-arrow" style={styles.arrto} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => this.changeDec()}>
                            <View style={styles.row}>
                                <Text allowFontScaling={false} style={styles.rowLabel}>店铺介绍</Text>
                                <View style={styles.rowItem}>
                                    <Text allowFontScaling={false} style={styles.rowTxt}>{this.state.detail.shopDesc}</Text>
                                    <Icon name="icon-arrow" style={styles.arrto} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                </ScrollView>
            }
        </View>
    }

    async componentDidMount() {
        await this.getDetail()
    }

    getDetail = async () => {
        try {
            let detail = await get('/ucenter/detail.do');
            this.setState({
                'detail': detail
            });
        } catch (e) {
            toast(e.message);
        }
    }

    async uploadImg(url, uri) {
        this.setState({
            loading: true
        });
        let data = new FormData();
        let file = { uri: uri, type: 'multipart/form-data', name: 'image.png' };
        data.append("imgFile", file);
        return uploadImage(url, data);
    }
    async chooseShopImg() {
        if (this.state.loading) return;
        let image
        try {
            image = await ImagePicker.openPicker({
                width: 600,
                height: 240,
                cropping: true
            });
        } catch (e) {
            if (e.message.indexOf('access') > 0) {
                Alert.alert('', '请进入iPhone的"设置-隐私-照片"选项，允许达令家访问您的手机相机', { text: 'ok' });
            }
            log(e.message); return;
        }
        try {
            let res = await this.uploadImg('/shop/uploadImg.do?type=2', image.path);
            this.setState({
                detail: Object.assign(this.state.detail, { shopImg: image.path }),
                loading: false
            });
            toast('上传成功!');
        } catch (e) {
            log(e.message)
            toast('图片太大，请重新选择');
            this.setState({
                loading: false
            });
        }
    }
    async choosePic() {
        if (this.state.loading) return;
        let image;
        try {
            image = await ImagePicker.openPicker({
                width: 150,
                height: 150,
                cropping: true
            });
        } catch (e) {
            if (e.message.indexOf('access') > 0) {
                Alert.alert('', '请进入iPhone的"设置-隐私-照片"选项，允许达令家访问您的手机相机', { text: 'ok' });
            }
            log(e); return;
        }

        try {
            let res = await this.uploadImg('/shop/uploadImg.do?type=1', image.path);
            this.setState({
                detail: Object.assign(this.state.detail, { shopIndexImg: image.path }),
                loading: false
            });
            toast('上传成功!');
        } catch (e) {
            log(e.message)
            toast('图片太大，请重新选择');
            this.setState({
                loading: false
            });
        }
    }
    changeName() {
        this.props.navigation.navigate('ChangeShopNamePage', {
            callback: async () => {
                await this.getDetail()
            }
        });
    }
    changeDec() {
        this.props.navigation.navigate('ChangeShopDecPage', {
            callback: async () => {
                await this.getDetail()
            }
        });
    }
    goBank() {
        this.props.navigation.navigate('BankCardPage', {
            callback: async () => {
                await this.getDetail()
            }
        });
    }
    goAddBank() {
        this.props.navigation.navigate('AddBankCardPage', {
            type: 2,
            callback: async () => {
                await this.getDetail()
            }
        });
    }
    goEditPsw() {
        this.props.navigation.navigate('EditPswPage', {
            call: async () => {
                await this.getDetail()
            }
        });
    }
    goAddPsw() {
        this.props.navigation.navigate('AddPswPage', {
            call: async () => {
                await this.getDetail()
            }
        });
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f3f6',
        flex: 1
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: px(1),
        paddingHorizontal: px(24),
        paddingVertical: px(26),
        backgroundColor: '#fff'
    },
    line: {
        width: px(750),
        height: px(25)
    },
    rowLabel: {
        color: '#222',
        fontSize: px(28)
    },
    rowTxt: {
        color: '#858385',
        fontSize: px(25),
        marginRight: px(20)
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: px(510),
        justifyContent: 'flex-end',
        overflow: 'hidden',
        paddingLeft: px(2)
    },
    arrto: {
        width: px(15),
        height: px(26),
        marginLeft: px(10)
    },
    headImg: {
        width: px(120),
        height: px(120),
        borderRadius: px(60)
    },
    logo: {
        width: px(120),
        height: px(120),
        borderRadius: Platform.OS === 'ios' ? ScreenUtil.scaleSize(50) : ScreenUtil.scaleSize(60),
        borderWidth: 1.5,
        borderColor: '#ffffff'
    },
    shopImg: {
        width: px(300),
        height: px(120),
        borderRadius: px(6),
        marginRight: px(20)
    },
    logout: {
        width: px(580),
        height: px(80),
        overflow: 'hidden',
        color: '#fff',
        backgroundColor: '#d0648f',
        marginTop: px(60),
        marginBottom: px(20),
        marginLeft: px(85),
        fontSize: px(30),
        includeFontPadding: false,
        paddingTop: px(22),
        textAlign: 'center',
        borderRadius: px(40)
    },
    sty1: {
        textAlign: 'right',
        flex: 1,
        paddingRight: px(20)
    },
    sty2: {
        textAlign: 'right',
        color: '#d0648f',
        flex: 1,
        paddingRight: px(20)
    },
    icon_arrow: {
        width: 8,
        height: 15,
    },
});