/**
 * Created by zhaoxiaobing on 2017/9/1.
 */


'use strict';

import React from 'react';
import { Platform } from 'react-native';
import {
    Text,
    TouchableWithoutFeedback,
    View,
    Image,
    NativeModules,
    StyleSheet,
    TouchableOpacity,
    PixelRatio
} from "react-native";
import { NavigationActions, StackActions } from 'react-navigation';
import { deviceWidth, px } from "../../utils/Ratio";
import { get, getHeader } from "../../services/Request";
import { show as toast } from '../../widgets/Toast';
import { User, logOut } from '../../services/Api';
import CartList from '../../services/Cart'
import { removeItem } from '../../services/Storage';
import Page from "../../UI/Page";
import { ImagesRes } from "../../utils/ContentProvider";
import CircleBackground from "../common/CircleBackground";
import HeaderImage from "../common/HeaderImage";
import Icon from '../../UI/lib/Icon'
import Item from "../common/InfoItem"
import base from '../../styles/Base'
import Event from "../../services/Event"
import { log, logErr } from "../../utils/logs"
import { config } from '../../services/Constant';

const AppModule = NativeModules.AppModule;
const HttpCacheModule = NativeModules.HttpCacheModule;

const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class extends Page {

    constructor(props) {
        super(props);
        this.state = {
            versionCode: '',
            cacheSize: '',
            showModal: false,
            newToken: '',
            debug: false,
            open: true,
            hasOpen: true
        };
        this.count = 0;
    }

    async onReady() {
        AppModule.getAppVersionCode((a, code) => {
            this.setState({
                versionCode: code
            });
        }), Platform.OS === 'android' && HttpCacheModule.getImageCacheSize().then((value) => {
            this.setState({
                cacheSize: Math.round(value / 1024 / 1024 * 100) / 100 + 'M'
            });
        })
        this.getPushStatus();

        if (!AppModule.getPushStatus) {
            this.setState({ hasOpen: false })
        }

        Event.on("app.active", this.getPushStatus);
    }

    componentWillUnmount() {
        Event.off("app.active", this.getPushStatus);
    }

    getPushStatus = () => {
        AppModule.getPushStatus && AppModule.getPushStatus((err, res) => {
            log(res);
            if (res) {
                this.setState({ open: true })
            } else {
                this.setState({ open: false })
            }
        });
    }
    async onSubmit() {
        Platform.OS === 'android' && HttpCacheModule.clearImageCache().then((value) => {
            this.setState({
                cacheSize: '0M'
            });
        })
        toast('清除缓存成功')
    }

    /**
     * 开启/关闭debug
     */
    openDevelopment() {
        this.count++;
        if (this.count == 1) {
            this.nowDate = Date.now();
            return;
        }
        if (this.count == 5 && Date.now() - this.nowDate < 2000) {
            this.count = 0;
            if (!this.state.debug) toast('开启调试模式');
            if (this.state.debug) toast('关闭');
            this.setState({ debug: !this.state.debug })
        }
        if (this.count > 5) this.count = 0;
    }

    /**
     * 进入debug页面
     */
    goDebug = () => this.state.debug && this.go_('DebugPage')

    /**
     * 进入页面
     */
    goInfoPage() {
        User.isLogin && this.props.navigation.navigate('InfoPage', {});
    }

    async logout() {
        this.$alert("提示", "确定要退出登录吗？",
            {
                txt: '取消'
            },
            {
                txt: '退出',
                click: async () => {
                    await logOut();
                    await removeItem('selectAddress')
                    CartList.init();
                    this.goTabPage()
                }
            })
    }
    goTabPage() {
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'HomePage'})
            ]
        }))
    }
    
    /**
     *隐私协议
     */
    async goPrivacy() {
        let source = await config();
        this.props.navigation.navigate('ImagePage', {
            title: '隐私协议',
            src: source.images['privacyAgreement']
        });
    }

    title = "设置";

    /**
     * 个人信息
     */
    _renderInfo() {
        let length = User.name.length;
        return (
            <View style={styles.headBox}>
                <View style={styles.headBorder}>
                    <TouchableOpacity onPress={() => this.goInfoPage()}>
                        <View style={styles.head}>
                            <HeaderImage imgSource={User.headImgUrl} />
                            <View style={{ flex: 1, flexDirection: length < 15 ? 'row' : 'column' }}>
                                <Text allowFontScaling={false} style={styles.headerName}>
                                    {User.name}
                                </Text>
                            </View>
                            <Icon style={styles.iconR} name="icon-mine-arrows-gray" />
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    pageBody() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
                {User.isLogin ? this._renderInfo() : <View />}
                <View style={{ marginTop: px(6) }}>
                    <View style={{ backgroundColor: '#fff' }}>
                        {this.state.hasOpen && <View style={[styles.row, styles.rowBorder, this.state.open ? {} : {borderBottomWidth: 0}]}>
                            <Text allowFontScaling={false} style={styles.rowLabel}>消息推送设置</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {!this.state.open && <TouchableOpacity style={base.inline} onPress={() => this.openPush()}>
                                    <Text allowFontScaling={false} style={{ color: '#858385', fontSize: px(26), paddingRight: 4 }}>去开启</Text>
                                    <Icon style={{
                                        width: 8,
                                        height: 15,
                                        alignSelf: 'center',
                                    }} name="icon-mine-arrows-gray" />
                                </TouchableOpacity>
                                }
                                {this.state.open &&
                                    <Text allowFontScaling={false} style={{ color: '#858385', fontSize: px(26), paddingRight: 4 }}>已开启</Text>
                                }
                            </View>
                        </View>}
                        {!this.state.open && <View style={styles.notice}>
                            <Text style={styles.noticeTxt}>建议您开启消息通知，以便接收到关于商品优惠、订单物流等重要通知。</Text>
                        </View>}
                        <Item onPress={() => this.onSubmit()} label="清除缓存" txt={this.state.cacheSize}/>
                        <Item onPress={() => this.goPrivacy()} label="隐私协议" />
                        <Item label="当前版本" txt={this.state.versionCode} right={false} />
                        <Item onPress={() => this.openDevelopment()} label="基带" txt={getHeader("bundle")} right={false} />
                        <Item onPress={() => this.goDebug()} label="UI版本" txt={getHeader("jsversion")} right={false} />
                    </View>
                    <Text allowFontScaling={false} style={styles.version}>Copyright © {new Date().getFullYear()}达令家 All Rights Reserved </Text>
                </View>
            </View>
        )
    }

    pageFooter() {
        return User.isLogin && <View style={styles.log}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => this.logout()}>
                <Text allowFontScaling={false} style={styles.logout}>退出登录</Text>
            </TouchableOpacity>
        </View>
    }

    openPush() {
        AppModule.openPushSetting && AppModule.openPushSetting();
    }

}


const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: px(30),
        paddingBottom: px(30),
        paddingRight: px(24),
        marginBottom: px(1),
        marginLeft: px(24),
    },
    rowBorder: {
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    iconR: {
        width: 8,
        height: 15,
        alignSelf: 'center',
    },
    version: {
        marginTop: px(50),
        color: '#b2b3b5',
        fontSize: px(22),
        width: px(750),
        textAlign: 'center',
    },
    head: {
        height: px(170),
        flexDirection: 'row',
        paddingRight: px(24),
        //paddingBottom: px(30),
        alignItems: 'center'
    },
    headBorder: {
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    headImg: {
        width: px(120),
        height: px(120),
        borderRadius: px(60)
    },
    headerName: {
        // flex: 1,
        paddingLeft: px(20),
        fontSize: px(30),
        color: '#252426'
    },
    headArrow: {
        width: px(15),
        height: px(26)
    },
    headBox: {
        marginBottom: px(20),
        paddingLeft: px(24),
        backgroundColor: '#fff'
    },
    headEdit: {
        width: px(178),
        color: '#858385',
        fontSize: px(24),
        textAlign: 'center',
    },
    headEditBox: {
        width: px(180),
        height: px(54),
        borderRadius: px(25),
        borderColor: '#b2b3b5',
        borderWidth: px(1),
        overflow: 'hidden',
        paddingTop: px(12)
    },
    address: {
        paddingLeft: px(0),
        marginLeft: px(0)
    },

    logout: {
        width: px(690),
        height: px(80),
        overflow: 'hidden',
        color: '#fff',
        backgroundColor: '#d0648f',
        marginBottom: px(54),
        marginLeft: px(30),
        fontSize: px(30),
        includeFontPadding: false,
        paddingTop: px(22),
        textAlign: 'center',
        borderRadius: px(10),
    },
    log: {
        flex: 0,
        position: 'absolute',
        bottom: px(10),
        left: 0
    },
    sty2: {
        textAlign: 'right',
        color: '#d0648f',
    },

    rowLabel: {
        fontSize: px(30),
        color: '#222222',
    },
    icon_right: {
        width: 8,
        height: 15,
        alignSelf: 'center',
    },
    notice: {
        paddingLeft: px(20),
        paddingRight: px(20),
        paddingTop: px(10),
        paddingBottom: px(32),
        backgroundColor: "#efefef"
    },
    noticeTxt: {
        fontSize: px(24),
        color: "#999",
        lineHeight: px(28)
    }
});
