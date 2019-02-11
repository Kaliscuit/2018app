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
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Button
} from "react-native";
import { px } from "../../utils/Ratio";
import request, { getHeader, setBaseUrl, getBaseUrl, baseUrl, getHeaders } from "../../services/Request";
import { show as toast } from '../../widgets/Toast';
import { log, testLog } from '../../utils/logs';
import { TopHeader } from '../common/Header'
import { config } from '../../services/Constant';
import Page from '../../UI/Page'
import Input from '../../UI/lib/Input'
import { NavigationActions, StackActions } from 'react-navigation';
import Icon from '../../UI/lib/Icon'

export default class extends Page {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            newToken: '',
            webPath: '',
            webPath2: '',
            baseUrl: '',
        }
    }

    /**
     * 弹出日志tag输入框
     */
    openLogs() {
        this.setState({ showModal: true })
    }
    /**
     * 设置日志的tag
     */
    logTag() {
        if (this.state.newToken) {
            testLog(this.state.newToken)
            toast('开启远程日志');
        }
        this.setState({
            showModal: false
        })
    }

    title = "调试菜单";
    pageBody() {
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <TouchableWithoutFeedback onPress={() => this.openLogs()}>
                <View style={styles.row}>
                    <Text allowFontScaling={false} style={styles.rowLabel}>开启远程日志</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text></Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.lookLogs()}>
                <View style={styles.row}>
                    <Text allowFontScaling={false} style={styles.rowLabel}>查看本地日志</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text></Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View style={styles.row}>
                <TextInput onChangeText={t => this.setState({ webPath: t })}
                    autoCorrect={false}
                    spellCheck={false}
                    style={modalStyle.rowInput_s} />
                <TouchableWithoutFeedback onPress={() => this.logWeb()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text allowFontScaling={false}>调试网页</Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={styles.row}>
                <TextInput onChangeText={t => this.setState({ webPath2: t })}
                    autoCorrect={false}
                    spellCheck={false}
                    style={modalStyle.rowInput_s} />
                <TouchableWithoutFeedback onPress={() => this.logWeb2()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text allowFontScaling={false}>调试浏览器</Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            {/*修改根域名*/}
            <View style={styles.row}>
                <Input value={this.state.baseUrl} onChangeText={t => this.setState({ baseUrl: t })}
                    style={modalStyle.rowInput_s} />
                <TouchableWithoutFeedback onPress={() => this.modifyBaseUrl()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text allowFontScaling={false}>修改根域名</Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <TouchableWithoutFeedback onPress={() => this.upnifo()}>
                <View style={styles.row}>
                    <Text allowFontScaling={false} style={styles.rowLabel}>上传客户端信息</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text></Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => this.go_("TestPage")}>
                <View style={styles.row}>
                    <Text allowFontScaling={false} style={styles.rowLabel}>进入测试页</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text></Text>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26), marginLeft: px(15) }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <Modal
                animationType={"fade"}
                visible={this.state.showModal}
                onRequestClose={() => { }}
                transparent={true}
            >
                <View style={modalStyle.bg}>
                    <View style={modalStyle.box}>
                        <View style={modalStyle.title}>
                            <Text>请输入手机号/提示代码</Text>
                            <TextInput
                                style={modalStyle.rowInput}
                                onChangeText={(text) => this.setState({ newToken: text })}
                            /></View>
                        <View style={modalStyle.btns}>
                            <Button
                                onPress={() => {
                                    this.setState({ showModal: false })
                                }}
                                style={modalStyle.btn}
                                title="取消"
                                color="#333"
                            />
                            <Button
                                onPress={() => this.logTag()}
                                style={modalStyle.btn}
                                title="确定"
                                color="#841584"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>;
    }
    async onReady() {
        let baseUrl = getBaseUrl();
        this.setState({ baseUrl });
    }
    /**
     * 查看本地日志
     */
    lookLogs() {
        this.go_("LogPage");
    }
    /**
     * 打开网页地址
     * @param {*} uri 
     */
    logWeb() {
        this.go_("HtmlViewPage", {
            webPath: this.state.webPath,
            img: "http://img.daling.com/st/topic/xc_wxapp/logo_share1.png"
        })
    }
    /**
     * 调试新的浏览器
     */
    logWeb2() {
        this.go_("BrowerPage", {
            webPath: this.state.webPath2,
            img: "http://img.daling.com/st/topic/xc_wxapp/logo_share1.png"
        })
    }
    //修改根
    modifyBaseUrl() {
        if (!this.state.baseUrl || this.state.baseUrl.indexOf("http") !== 0) {
            this.$toast("请填写正确的url")
            return;
        }
        setBaseUrl(this.state.baseUrl);
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'TabPage' })
            ]
        }))
    }
    async upnifo() {
        let header = Object.assign({}, getHeaders());
        header.uid = "0040000000000114007006443";
        header.utoken = "123";
        try {
            let res = await fetch(baseUrl + "/device/manager/active.do?type=open_app&pushToken=", {
                method: 'GET',
                headers: header,
            });
            let json = await res.text();
            log("调试上传用户信息", header, json);
            this.$toast("提交成功");
        } catch (error) {
            this.$toast("网络连接失败");
        }
    }
}


const styles = StyleSheet.create({
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
    version: {
        marginTop: px(50),
        color: '#858385',
        fontSize: px(25), width: px(750),
        textAlign: 'center',
    }
});

const modalStyle = StyleSheet.create({
    bg: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        padding: px(40)
    },
    title: {
        paddingTop: px(10),

    },
    rowInput_s: {
        borderColor: '#ccc',
        borderWidth: 1,
        width: px(400),
        marginVertical: px(10),
        padding: px(10)
    },
    rowInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        width: px(650),
        marginVertical: px(10),
        padding: px(10)
    },
    btns: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    btn: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: px(10),
        marginHorizontal: px(20)
    }
})
