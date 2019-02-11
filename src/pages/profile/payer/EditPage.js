'use strict';

import React, {PureComponent} from 'react';
import {
    Image,
    Text,
    View,
    Switch,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import {px, isIphoneX} from "../../../utils/Ratio";
import request, {get, post} from "../../../services/Request";
import {show as toast} from '../../../widgets/Toast';
import Loading from '../../../animation/Loading'
import {TopHeader} from '../../common/Header'
import Page, {FootView} from '../../../UI/Page'
import util_tools from "../../../utils/tools";
import base from '../../../styles/Base'
import Icon from '../../../UI/lib/Icon'
import Input from '../../../UI/lib/Input'
import {config} from '../../../services/Constant';
export default class extends Page {
    
    constructor(props) {
        super(props);
        this.state = {
            payerName: '',
            payerCardNo: '',
            payerId: this.props.navigation.state.params.payerId || '',
            checked: false,
        };
        this.loading = true;
        
    }
    title = (this.props.navigation.state.params || {}).payerId == 'new' ?
        '添加支付人信息' : '编辑支付人信息'
    
    pageHeader() {
        return <TopHeader
            title={this.title}
            navigation={this.props.navigation}
        />
    }
    
    pageFooter() {
        return <TouchableWithoutFeedback onPress={() => this.save()}>
            <View style={[styles.footer, base.inline, base.backgroundColor]}>
                <Text style={[styles.footerTxt, base.includeFontPadding]} allowFontScaling={false}>保存</Text>
            </View>
        </TouchableWithoutFeedback>
    }
    pageBody() {
        return (
            <View>
                <View style={[styles.item, base.inline_left]}>
                    <Text style={styles.label} allowFontScaling={false}>支付人</Text>
                    <Input ref="payerName" style={styles.input}
                        value={this.state.payerName}
                        underlineColorAndroid="transparent"
                        maxLength={20}
                        onChangeText={(v) => this.setState({ payerName: v })}
                        placeholder="请输入支付人姓名"
                        placeholderTextColor={'#b2b3b5'}
                    />
                </View>
                <View style={[styles.item, base.inline_left]}>
                    <View style={[styles.border, base.inline_left]}>
                        <Text style={[styles.label, styles.comTxt]} allowFontScaling={false}>身份证</Text>
                        <Input ref="payerCardNo" style={styles.input}
                            value={this.state.payerCardNo}
                            underlineColorAndroid="transparent"
                            maxLength={20}
                            onChangeText={(v) => this.setState({ payerCardNo: v })}
                            placeholder="请输入支付人身份证号"
                            placeholderTextColor={'#b2b3b5'}
                        />
                    </View>
                </View>
                <View style={[styles.item1, base.inline_between]}>
                    <View style={styles.defaultField}>
                        <Text allowFontScaling={false} style={[styles.defaultTitle, base.includeFontPadding]}>设为默认支付人</Text>
                        <Text allowFontScaling={false} style={[styles.defaultDesc, base.includeFontPadding]}>每次下单时会使用默认支付人</Text>
                    </View>
                    <View style={styles.sw}>
                        {
                            Platform.OS == 'ios' ? <Switch onTintColor="#32C632"
                                tintColor="#e5e5ea"
                                value={this.state.checked} onValueChange={(v) => this.setDefaultPayer(v)} /> :
                                <Switch onTintColor="#32C632"
                                    tintColor="#e5e5ea"
                                    thumbTintColor="#ffffff"
                                    value={this.state.checked} onValueChange={(v) => this.setDefaultPayer(v)} />
                        }
                    </View>
                </View>
                <TouchableWithoutFeedback onPress={() => this.goHelp()}>
                    <View style={styles.tip_}>
                        <Text allowFontScaling={false} style={[base.includeFontPadding, styles.tip]}>
                            支付实名认证相关信息帮助说明
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
    
    
    async onReady() {
        let payerId = this.props.navigation.state.params.payerId;
        try {
            if (payerId !== 'new') {
                let payer = await get(`/xc_uc/payer/query.do?payerId=${payerId}`);
                this.setState({
                    payerName: payer.payerName || '',
                    payerCardNo: payer.payerCardNo || '',
                    checked: payer.defaultYn == 'Y' ? true : false,
                })
            } else {
                this.setState({});
            }
        } catch (e) {
            toast(e)
        }
    }
    
    setDefaultPayer(status) {
        this.setState({
            checked: status
        })
    }
    
    async save() {
        if (!this.loading) return;
        this.loading = false;
        let data = {
            id: this.state.payerId == 'new' ? '' : this.state.payerId,
            payerName: this.state.payerName,
            payerCardNo: this.state.payerCardNo
        };
        let isErr = false;
        if (!data.payerName) {
            toast('请输入支付人姓名'); isErr = true;
        }
        if (!data.payerCardNo) {
            toast('请输入支付人身份证号'); isErr = true;
        }
        
        if (isErr) {
            this.loading = true;
            return;
        }
        data.defaultYn = this.state.checked ? 'Y' : 'N';
        try {
            if (this.state.payerId != 'new') {
                await post(`/xc_uc/payer/update.do`, data);
            } else {
                await post(`/xc_uc/payer/save.do`, data);
            }
            await new Promise(resolve => {
                toast('保存成功');
                resolve();
            });
            data.payerCardNo = this.secret(data.payerCardNo);
            let timer = setTimeout(() => {
                this.props.navigation.state.params.callback();
                this.props.navigation.goBack();
                if (timer) clearTimeout(timer);
            }, 800);
        } catch (e) {
            this.loading = true;
            toast(e.message);
        }
    }
    secret(ids) {
        if (!ids) return '';
        let arr = ids.split("");
        arr.splice(4, 10, '**********');
        return arr.join("");
    }
    
    async goHelp() {
        let cfg = await config();
        this.go('ImagePage', {
            'title': '实名认证帮助中心',
            src: cfg.images['payer_help']
        });
    }
    
}

const styles = StyleSheet.create({
    footer: {
        marginTop: px(90),
        height: px(90),
        marginHorizontal: px(32),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    
    footerTxt: {
        fontSize: px(30),
        color: '#fff',
        includeFontPadding: false
    },
    item: {
        width: px(750),
        height: px(90),
        backgroundColor: '#fff',
        paddingLeft: px(24),
        
    },
    input: {
        height: px(90),
        flex: 1
    },
    comTxt: {
        fontSize: px(30),
    },
    label: {
        width: px(150),
        color: '#222',
        //marginRight: px(50)
    },
    border: {
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        flex: 1,
        height: px(90),
    },
    item1: {
        backgroundColor: '#fff',
        paddingHorizontal: px(24),
        height: px(120),
        marginTop: px(24)
    },
    defaultField: {
        height: px(120),
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: px(24)
    },
    defaultTitle: {
        fontSize: px(30),
        color: '#222',
    },
    defaultDesc: {
        fontSize: px(26),
        color: '#b2b3b5'
    },
    sw: {
        width: px(100),
        height: px(120),
        justifyContent: 'center'
    },
    tip_: {
        paddingVertical: px(30),
        paddingLeft: px(24)
    },
    tip: {
        fontSize: px(26),
        color: '#44b7ea'
    }
});