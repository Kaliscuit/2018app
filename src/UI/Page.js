/**
 * 页面基础类
 */
import React from 'react'
import {
    StyleSheet, View,
    Image, TouchableOpacity,
    Platform, Text, Modal,
    Dimensions
} from 'react-native';
import { log, logWarm } from '../utils/logs'
import { px, isIphoneX } from '../utils/Ratio'
import { Header } from '../pages/common/Header'
import Load, { LoadView } from '../animation/Loading'
import base from '../styles/Base'
import { DialogModal, AlertModal } from '../pages/common/ModalView'
import { show as toast } from '../widgets/Toast'

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

//360x760

class FootView extends React.Component {

    render() {
        if (!isIphoneX()) {
            return <View style={[styles.footer2, this.props.style]} onLayout={e => this.layout(e.nativeEvent)}>
                {this.props.children}
            </View>
        }
        return <View style={[styles.footer, this.props.boxStyle]} onLayout={e => this.layout(e.nativeEvent)}>
            <View style={this.props.style}>
                {this.props.children}
            </View>
        </View>
    }

    layout(e) {
        this.props.onLayout && this.props.onLayout(e);
    }
}
exports.FootView = FootView;

exports.SafeFootView = FootView;

/**
 * extends title<string> 顶部的标题
 * extends pageHeader<fun> 顶部的渲染方法,非定制不建议改动
 * extends pageBody<fun> 内容的渲染方法,建议使用这个
 * extends pageFooter<fun> 底部的渲染方法,放在body平级的容器内
 * extends render<fun> React的渲染方法,非定制不建议使用
 * extends onLoad<fun> 渲染之前的方法,componentWillMount调用
 * extends onReady<fun> 渲染之后的方法,componentDidMount调用
 * extends componentWillMount<fun> React的渲染方法,非定制不建议使用
 * extends componentDidMount<fun> React的渲染方法,非定制不建议使用
 * extends update<fun> 返回的刷新方法
 * extends go<fun> 跳转方法
 */
export default class extends React.Component {
    constructor(props, state) {
        super(props)
        this.state = {
            loaded: false,
            ...state
        }
    }
    /**
     * 顶部标题
     */
    title = null;
    /**
     * 顶部渲染方法
     */
    pageHeader() {
        return <Header navigation={this.props.navigation}
            title={this.title}></Header>
    }
    /**
     * 内容渲染方法
     */
    pageBody() {
        return null
    }
    /**
     * 顶部渲染方法
     */
    pageFooter() {
        return null
    }
    backgroundColor = "#f5f3f6";
    alertStyle = {}
    alertBodyTextStyle = {}
    /**
     * 默认渲染
     */
    render() {
        return <View style={{ flex: 1, backgroundColor: this.backgroundColor }}>
            {this.pageHeader()}
            {!this.state.loaded && this.isLoading && <View style={base.flex_middle}><LoadView /></View>}
            {this.state.loaded && this.pageBody()}
            {this.state.loaded && this.pageFooter()}
            <DialogModal ref="dialog" bodyTextStyle={this.alertBodyTextStyle} bodyStyle={{ paddingTop: 20, paddingBottom: 20, ...this.alertStyle }} />
            <Load ref="loading" />
            <AlertModal ref="alert" />
        </View>
    }

    isLoading = true

    /**
     * 渲染之前的方法
     */
    onLoad() { }
    /**
     * 渲染之后的方法
     */
    onReady() { }
    /**
     * 渲染组件之前的方法,
     * 尽量少用耗时操作
     */
    async componentWillMount() {
        await this.onLoad();
    }
    /**
     * 第一次渲染结束
     * 自带一个取消loading层的状态
     */
    async componentDidMount() {
        await this.onReady();
        this.setState({ loaded: true })
    }
    /**
     * 自带刷新方法
     */
    update() { }
    /**
     * 自带的页面跳转方法
     * @param {*} name
     * @param {*} data
     */
    go(name, data) {
        this.props.navigation.navigate(name, Object.assign({
            callback: () => {
                this.update()
            }
        }, data));
    }

    go_(name, data) {
        this.props.navigation.navigate(name, Object.assign({
        }, data));
    }
    goBack() {
        this.props.navigation.goBack();
    }
    /**
     * 跳回
     * @param {}} index // 跳转到1...
     * @param {*} params
     */
    pop(index, params) {
        this.props.navigation.pop(index, params)
    }
    //=============继承自index的方法=========

    /**
    * alert提示
    * @param {*} title 标题
    * @param {*} content<array> 内容
    * @param {*} success<array> 成功
    * @param {*} cancel<array> 取消
    * @param {*} success.txt 按钮标题
    * @param {*} success.click 按钮点击事件
    * 重载,(content<string|array>)
    * 重载,(title<string>,content<string|array>)
    * 重载,(title<string>,content<string|array>,success<string|object>)
    * 重载,(title<string>,content<string|array>,success<string|object>,cancel<string|object>)
    */
    $alert(title, content, success, cancel) {
        if (!title) {
            title = null
        }
        if (title && !content) {
            const tmp = content;
            content = title;
            title = tmp;
        }
        if (typeof content === "string") content = [content]
        if (typeof success === "string") success = { txt: success }
        if (typeof cancel === "string") cancel = { txt: cancel }
        this._alert(title, content, success, cancel)
    }
    _alert(title, content, success, cancel, code) {
        let opt = {
            title, content, code,
            btns: []
        }
        if (success) opt.btns.push(success)
        if (cancel) opt.btns.push(cancel)
        this.refs.dialog.open(opt);
    }
    $dialog(title, code, success, cancel) {
        if (!title) {
            title = null
        }
        if (title && !code) {
            const tmp = code;
            code = title;
            title = tmp;
        }
        if (typeof success === "string") success = { txt: success }
        if (typeof cancel === "string") cancel = { txt: cancel }
        this._alert(title, null, success, cancel, code)
    }
    /**
     * 小提示
     * @param {*} msg
     */
    $toast(msg) {
        toast(msg);
    }
    /**
     * 开启loading动画
     */
    $loading() {
        this.refs.loading && this.refs.loading.open();
    }
    /**
     * 关闭loading动画
     */
    $loadend() {
        this.refs.loading && this.refs.loading.close();
    }

    $openAlert(message) {
        this.refs.alert && this.refs.alert.open(message)
    }
}

const styles = StyleSheet.create({
    footer: {
        position: "absolute",
        left: 0,
        width: deviceWidth,
        bottom: 0,
        paddingBottom: 34,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: "#fff",
    },
    footer2: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: deviceWidth,
        zIndex: 100,
        backgroundColor: "#fff",
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
})
