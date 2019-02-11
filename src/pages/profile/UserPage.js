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
    NativeModules,
    Platform
} from 'react-native';

import { px } from '../../utils/Ratio';
import request, {getHeader} from '../../services/Request';
import {show as toast} from '../../widgets/Toast';
import Page from '../../UI/Page'
import Icon from "../../UI/lib/Icon";
import base from '../../styles/Base';
import {SendMsgModal} from '../common/ModalView'
const aliPay = NativeModules.Alipay;
const os = Platform.OS == "ios" ? true : false;

export default class extends Page {
    
    constructor(props) {
        super(props);
        this.state = {
            aliAccount: {},
            bankAccount: {},
            wxAccount: {},
            mobile: '',
            version: getHeader('version').replace(/\./g, '') * 1
        };
    }
    
    title = "账户设置";
    
    pageBody() {
        const {aliAccount, bankAccount, version, wxAccount} = this.state
        return (
            <View style={styles.container}>
                {
                    version > 106 &&
                    <TouchableWithoutFeedback onPress={() => this.ali()}>
                        <View style={[styles.row, styles.border, base.inline_between]}>
                            <Text allowFontScaling={false} style={styles.label}>
                                支付宝账号
                            </Text>
                            <View style={[styles.right, base.inline_between]}>
                                <Text allowFontScaling={false} style={styles.value}>
                                    {aliAccount && aliAccount.nickName}
                                </Text>
                                <View style={base.inline}>
                                    <Text allowFontScaling={false} style={styles.value}>
                                        {aliAccount ? '修改' : '添加'}
                                    </Text>
                                    <Icon name="icon-arrow" style={styles.arrow}/>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                }
                <TouchableWithoutFeedback onPress={() => this.wx()}>
                    <View style={[styles.row, styles.border, base.inline_between]}>
                        <Text allowFontScaling={false} style={styles.label}>
                            微信账号
                        </Text>
                        <View style={[styles.right, base.inline_between]}>
                            <Text allowFontScaling={false} style={styles.value}>
                                {wxAccount && wxAccount.wxNickName}
                            </Text>
                            <View style={base.inline}>
                                <Text allowFontScaling={false} style={styles.value}>
                                    {wxAccount ? '修改' : '添加'}
                                </Text>
                                <Icon name="icon-arrow" style={styles.arrow}/>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.acc()}>
                    <View style={[styles.row, base.inline_between]}>
                        <Text allowFontScaling={false} style={styles.label}>
                            银行卡
                        </Text>
                        <View style={[styles.right, base.inline_between]}>
                            <Text allowFontScaling={false} style={styles.value}>
                                {bankAccount && bankAccount.accountNo}
                            </Text>
                            <View style={base.inline}>
                                <Text allowFontScaling={false} style={styles.value}>
                                    {bankAccount ? '修改' : '添加'}
                                </Text>
                                <Icon name="icon-arrow" style={styles.arrow}/>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <SendMsgModal
                    navigation={this.props.navigation}
                    refresh={this.refresh.bind(this)}
                    ref="sendMsgModal"/>
            </View>
        
        )
    }
    
    
    async onReady() {
        await this.refresh()
    }
    
    async test() {
        let res = await aliPay.auth({ infoString: 'apiname=com.alipay.account.auth&app_id=2018071860659409&app_name=mc&auth_type=AUTHACCOUNT&biz_type=openservice&pid=2088231007774991&product_id=APP_FAST_LOGIN&scope=kuaijie&sign_type=RSA2&target_id=dalingjia&sign=Kkk%2bqN3JaGVoYnU1i8SdbstBCBTU0ILsi6e7LhzWCYJ5yDmGVV0qvK585eq7AXa6u6n6nvmavNhip9h5wmUEtM4QCXTEDMFxLOfh9yOEoTduBcLgpFS1tgR9jDx3wnYR3x1OlMVDW1sAZY6zab8iFB05Wg6mYuos%2fwg3JFTaI5wtKDu7Bw%2b3hm3ZL%2fhqS2R6OCfo3HUDOIDj%2bxoJS2c5vHYXvkYMUDWHwhL6rkjapN34mg3mYg5dU4V%2bl7hfQNU6p7zWdW9rb8EbIrZfcdCs8NOCmhtjVuwcV68hRxf743sRudLg%2br2lZVzqKXiaQd%2bH3sD6eetf5NHgLncM2YxuOQ%3d%3d' });
        os && toast(res.result)
        !os && toast(res)
        //console.log(res)
        let isErr = true;
        if (os) {
            if (!(res.resultStatus && res.resultStatus == '9000')) {
                isErr = false;
            }
        } else {
            isErr = /9000/.test(res);
        }
        if (!isErr) {
            throw new Error('您已取消');
        }
        //ios:{
        //   memo:'',
        //   result: "success=true&result_code=200&app_id=2018071860659409&auth_code=c2b305a09c3f468e8b172fd710c3NX20&scope=kuaijie&alipay_open_id=20880012318658760628919692016520&user_id=2088022683314201&target_id=dalingjia"
        //   resultStatus: '9000'
        // }
        
    }
    
    
    async ali() {
        let aliAccount = this.state.aliAccount, mobile = this.state.mobile;
        if (!aliAccount) {
            // 添加支付宝账号
            this.refs.sendMsgModal.open({
                mobile: mobile,
                type: 0
            })
        } else {
            this.$alert("如需更换请解绑后重新添加", ["您当前已绑定支付宝账户", aliAccount.nickName],
                {
                    txt: '取消'
                },
                {
                    txt: '解绑',
                    click: async () => {
                        await this.untie(0)
                    }
                })
        }
    }

    wx() {
        let wxAccount = this.state.wxAccount, mobile = this.state.mobile;
        if (!wxAccount) {
            this.refs.sendMsgModal.open({
                mobile: mobile,
                type: 2
            })
        } else {
            this.$alert("如需更换请解绑后重新添加", [`您当前已绑定微信账户`, wxAccount.wxNickName],
                {
                    txt: '取消'
                },
                {
                    txt: '解绑',
                    click: async () => {
                        await this.untie(2)
                    }
                })
        }
    }
    
    acc() {
        let bankAccount = this.state.bankAccount, mobile = this.state.mobile
        if (!bankAccount) {
            this.refs.sendMsgModal.open({
                mobile: mobile,
                type: 1
            })
        } else {
            this.$alert("如需更换请解绑后重新添加", [`您当前已绑定${bankAccount.bankName}`, bankAccount.accountNo],
                {
                    txt: '取消'
                },
                {
                    txt: '解绑',
                    click: async () => {
                        await this.untie(1)
                    }
                })
        }
    }
    
    /**
     * 解绑支付宝或者银行卡
     */
    async untie(type) {
        try {
            let res = await request.post('/userBank/untie.do', {
                accountType: type
            })
            if (typeof res === 'string') {
                this.$toast(res)
            }
            if (type == 0) {
                this.setState({
                    aliAccount: null
                })
            } else if (type == 1) {
                this.setState({
                    bankAccount: null
                })
            } else if (type == 2) {
                this.setState({
                    wxAccount: null
                })
            }
        } catch (e) {
            this.$toast(e.message)
        }
    }
    
    async refresh() {
        try {
            /*let user = {
                "aliAccount": {
                    "nickName": "李",//用户昵称
                },
                "bankAccount": {
                    "bankCode": "102",//未设置过银行卡信息时为空
                    "accountName": "过五关",//真是姓名
                    "accountNo": "**** **** **** *** 3242",//未设置过银行卡信息时为空
                    "mobile": "18600752502",//手机号
                    "bankName": "工商银行"//未设置过银行卡信息时为空
                },
                "mobile": "18811502787"
            }*/
            let user = await request.get('/userBank/findUserBankWithAlicash.do');
            this.setState({
                aliAccount: user.aliAccount,
                bankAccount: user.bankAccount,
                wxAccount: user.wxAccount,
                mobile: user.mobile
            });
        } catch (e) {
            toast(e.message);
        }
    }
    
    
    
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    row: {
        marginLeft: px(24),
        height: px(90),
        width: px(726),
        backgroundColor: '#fff',
        paddingRight: px(24)
    },
    border: {
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    label: {
        width: px(175),
        fontSize: px(30),
        color: '#222'
    },
    right: {
        flex: 1,
    },
    arrow: {
        width: px(15),
        height: px(26),
        marginLeft: px(8)
    },
    value: {
        fontSize: px(28),
        color: '#666'
    }
});