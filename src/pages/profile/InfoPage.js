'use strict';

import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    PixelRatio,
    Platform,
    Switch,
    TouchableOpacity
} from 'react-native';

import { deviceWidth, px } from '../../utils/Ratio';
import request, { get, domain } from '../../services/Request';
import { UpdateUnionid, getUnionid, User } from '../../services/Api';
import { show as toast } from '../../widgets/Toast';
import { isWXAppInstalled, sendAuthRequest } from '../../services/WeChat';
import { logWarm } from '../../utils/logs'
import Page from '../../UI/Page'
import { ImagesRes } from "../../utils/ContentProvider";
import ScreenUtil from "../../utils/ScreenUtil";
import CircleBackground from "../common/CircleBackground";
import HeaderImage from "../common/HeaderImage";
import Icon from "../../UI/lib/Icon";
import Item from "../common/InfoItem"
import tools from "../../utils/tools"

const pxRatio = PixelRatio.get();  // 屏幕像密度


/**
 * 个人资料 页面
 */
export default class InfoPage extends Page {

    constructor(props) {
        super(props);
        this.state = {
            detail: {},
            type: this.props.navigation.state.params.type,
            unionid: ''
        };
        this.timer = null;
    }

    title = "个人资料";

    pageBody() {
        return <View style={styles.container}>
            <View style={{ backgroundColor: '#ffffff' }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: ScreenUtil.scaleSize(13),
                    paddingHorizontal: ScreenUtil.scaleSize(24),
                }}>
                    <Text allowFontScaling={false} style={styles.rowLabel}>头像</Text>
                    <HeaderImage imgSource={this.state.detail.headImgUrl} />
                </View>

                {/** 分割线*/}
                <View style={styles.diverLine} />
                <Item label="昵称" right={false} txt={this.state.detail.name} />
                {/** 分割线*/}
                <View style={styles.diverLine} />
                <Item label="性别" right={false} txt={this.state.detail.sex == 0 ? '未知' : this.state.detail.sex == 1 ? '男' : '女'} />
            </View>

            <View style={{
                backgroundColor: '#ffffff',
                marginTop: ScreenUtil.scaleSize(24)
            }}>

                <Item onPress={() => this.bindWechat()} label="微信" txt={!this.state.unionid ? '未绑定' : this.state.detail.name} />
                {/** 分割线*/}
                <View style={styles.diverLine} />
                {!User.vip && <Item onPress={() => this.go("ShopWechatPage", { callback: () => this.refresh() })} label="微信名片" txt={!this.state.detail.wechatId ? '未绑定' : this.state.detail.wechatId} />}

                {User.vip && <Item onPress={() => this.go("ChangeInvitePage", { id: this.state.detail.wechatId, callback: () => this.refresh() })} label="微信号" txt={!this.state.detail.wechatId ? '未绑定' : this.state.detail.wechatId} />}
                {/** 分割线*/}
                <View style={styles.diverLine} />
                <Item right={false} label="手机号" txt={this.state.detail.shopMobile ? this.state.detail.shopMobile : ''} />
                {!User.vip && <View>
                    <View style={styles.diverLine} />
                    <Item onPress={() => this.goUserPage()} label="账户设置" txt={''} />
                    {/** 分割线*/}
                    <View style={styles.diverLine} />
                    {this.state.detail.paymentSet == 1 ?
                        <Item onPress={() => this.goEditPsw()} label="余额支付密码" txt="修改" />
                        : <Item onPress={() => this.goAddPsw()} label="余额支付密码" txt="未设置" />
                    }
                </View>}
            </View>
            {!User.vip && <View style={styles.bottomLink}>
                <Item onPress={() => this.go_("InvetrPage", { code: User.followInviteCode, reg: this.state.detail.changeInviteCodeTimes, mobile: this.state.detail.shopMobile })} label="我的邀请店铺" txt={this.state.detail.followerUserNickName ? this.state.detail.followerUserNickName : ""} />
            </View>}
            {User.vip && this.state.detail.followerUserNickName != null && <View style={styles.bottomLink}>
                <Item onPress={() => this.go_("InvetrPage", { code: User.followInviteCode, reg: this.state.detail.changeInviteCodeTimes, mobile: this.state.detail.shopMobile })} label="我的邀请店铺" txt={this.state.detail.followerUserNickName} />
            </View>}
            {User.vip && this.state.detail.followerUserNickName == null && <View style={styles.bottomLink}>
                <Item onPress={() => this.go_("SendCode", { mobile: this.state.detail.shopMobile })} label="我的邀请店铺" txt={"点击绑定店铺"} />
            </View>}

            {User.vip && this.state.detail.followerUserNickName != "" && this.state.detail.changeInviteCodeTimes * 1 == 0 && <View style={styles.bottomLink2}>
                <TouchableOpacity onPress={this.changeInvite.bind(this)}>
                    <View style={styles.bottomLinkBox}>
                        <Text style={{ color: "#d0648f", fontSize: 12 }}>绑定7天内可更换一次邀请人，点击前往 &gt;&gt;</Text>
                    </View>
                </TouchableOpacity>
            </View>}
            {User.vip && this.state.detail.followerUserNickName != "" && <View style={styles.bottomLink2}>
                <View style={styles.diverLine} />
                <Item onPress={() => { }} label="手机号对邀请人可见" right={false}>
                    {/*<Switch onValueChange={this.changeIsShow.bind(this)} value={this.state.detail.showMobileYn != "N"} />*/}
                    {
                        Platform.OS == 'ios' ? <Switch
                            onTintColor="#d0648f"
                            tintColor="#e5e5ea"
                            value={this.state.detail.showMobileYn != "N"}
                            onValueChange={this.changeIsShow.bind(this)}
                        /> : <Switch
                            onTintColor="#d0648f"
                            tintColor="#e5e5ea"
                            thumbTintColor="#ffffff"
                            value={this.state.detail.showMobileYn != "N"}
                            onValueChange={this.changeIsShow.bind(this)}
                        />
                    }
                </Item>
            </View>}
            {User.isLogin && !User.vip && <View style={styles.bottomLink2}>
                <View style={styles.diverLine} />
                <Item onPress={() => { }} label="手机号对邀请人可见" right={false}>
                    {
                        Platform.OS == 'ios' ? <Switch
                            onTintColor="#d0648f"
                            tintColor="#e5e5ea"
                            value={this.state.detail.showMobileYn != "N"}
                            onValueChange={this.changeIsShow.bind(this)}
                        /> : <Switch
                            onTintColor="#d0648f"
                            tintColor="#e5e5ea"
                            thumbTintColor="#ffffff"
                            value={this.state.detail.showMobileYn != "N"}
                            onValueChange={this.changeIsShow.bind(this)}
                        />
                    }
                </Item>
            </View>}
        </View>
    }


    async onLoad() {
        let unionid = await getUnionid();
        this.setState({ unionid: unionid })
    }

    async onReady() {
        await this.refresh()
    }
    update() {
        this.refresh()
    }

    async changeIsShow(lab) {
        let last = lab ? "Y" : "N";
        let detail = Object.assign({}, this.state.detail);
        detail.showMobileYn = last
        this.setState({ detail })
        try {
            let res = await request.post(domain + "/xc_uc/uc/manager/my/showMobileYn.do", {
                showYn: last
            });
        } catch (e) {
            toast(e.message);
        }
    }

    async refresh() {
        try {
            let detail = await get('/ucenter/detail.do');
            this.setState({
                detail: detail
            });
        } catch (e) {
            toast(e.message);
        }
    }

    /**
     * 解除绑定
     */
    async unbind() {
        try {
            let res = await request.get('/wechat/open/unbind.do')
            toast('解绑成功')
            UpdateUnionid('')
            this.setState({
                unionid: ''
            })
            this.props.navigation.state.params.callback && this.props.navigation.state.params.callback()
        } catch (e) {
            toast(e.message)
            let unionid = await getUnionid();
            this.setState({
                unionid: unionid
            })
        } finally {
            await this.refresh()
        }
    }

    /**
     * 微信绑定换绑
     */
    async bindWechat() {

        const { isWeCatHistory, callback, showToast } = this.props.navigation.state.params

        if (this.state.unionid) {
            this.$alert("提示", '解除绑定后，将不支持微信登录达令家APP',
                {
                    txt: '取消'
                }, {
                    txt: '确定解绑',
                    click: () => this.unbind()
                });
            return;
        }
        let installed = await isWXAppInstalled();
        if (!installed) {
            toast('没有安装微信');
            return;
        }
        let wxRes;
        try {
            wxRes = await sendAuthRequest('snsapi_userinfo', '');
        } catch (e) {
            logWarm(e.message)
            return;
        }
        try {
            let res = await request.get('/wechat/open/bind.do', {
                code: wxRes.code
            })

            toast('绑定成功', () => {
                showToast && showToast()
            });

            UpdateUnionid(res.unionid, res.uid, res.utoken)

            callback && callback()

            this.setState({
                unionid: res.unionid
            })
            
            isWeCatHistory && this.props.navigation.goBack()
        } catch (e) {
            toast(e.message)
            logWarm(e.message)
            let unionid = await getUnionid();
            this.setState({
                unionid: unionid
            })
        } finally {
            await this.refresh()
        }
    }

    async componentWillUnmount() {
        if (this.timer) clearTimeout(this.timer);
    }

    goAddressList() {
        this.props.navigation.navigate('AddressListPage', {});
    }

    goBank() {
        this.props.navigation.navigate('BankCardPage', {
            callback: async () => {
                await this.refresh()
            }
        });
    }
    
    goUserPage() {
        this.props.navigation.navigate('UserPage', {
            /* callback: async () => {
                await this.refresh()
            }*/
        });
    }

    goAddBank() {
        this.props.navigation.navigate('AddBankCardPage', {
            type: 2,
            callback: async () => {
                await this.refresh()
            }
        });
    }

    goEditPsw() {
        this.props.navigation.navigate('EditPswPage', {
            call: async () => {
                await this.refresh()
            }
        });
    }

    goAddPsw() {
        this.props.navigation.navigate('AddPswPage', {
            call: async () => {
                await this.refresh()
            }
        });
    }

    changeInvite() {
        this.$alert("更换邀请人", "达令家VIP只能更换一次邀请人", "取消", {
            txt: "确认更换",
            click: () => this.go_("SendCode", { mobile: this.state.detail.shopMobile })
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
        paddingTop: px(26),
        paddingBottom: px(26),
        paddingLeft: px(30),
        paddingRight: px(30),
        marginBottom: px(1),
        backgroundColor: '#fff'
    },
    rowLabel: {
        color: '#222',
        fontSize: px(30)
    },
    rowTxt: {
        color: '#858385',
        fontSize: px(26),
        alignSelf: 'center'
    },
    headImg: {
        width: px(120),
        height: px(120),
        borderRadius: px(60)
    },
    address: {
        marginBottom: px(20)
    },
    logo: {
        width: px(120),
        height: px(120)
    },
    shopImg: {
        width: px(300),
        height: px(120),
        borderRadius: px(6)
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
    diverLine: {
        width: deviceWidth,
        height: px(1),
        backgroundColor: '#efefef',
        marginLeft: ScreenUtil.scaleSize(24),
    },
    bottomLink: {
        backgroundColor: '#fff',
        marginTop: ScreenUtil.scaleSize(24),
    },
    bottomLink2: {
        backgroundColor: '#fff',
    },
    bottomLinkBox: {
        backgroundColor: "#fcf0f3",
        marginHorizontal: 12,
        marginBottom: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5
    }
});