'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Easing,
    StatusBar,
    TextInput,
    Dimensions,
    PixelRatio
} from 'react-native';
import { isIphoneX, px, isIphone } from '../../utils/Ratio';
import { setSpText } from '../../utils/AdaptationSize';
import { getNavigation } from '../../utils/NavigationHolder'
import { observer } from "mobx-react";
import { User, getShopDetail, ShopDetail } from '../../services/Api';
import ShareView, { SHARETYPE } from './ShareView'
import request, { baseUrl, touchBaseUrl } from '../../services/Request';
import { TrackClick } from '../../services/Track';
import { ImagesRes } from "../../utils/ContentProvider";
import Icon from '../../UI/lib/Icon'
import Background from "../../UI/lib/Background"
import ImageJSFile from "./ImageJSFile";
import base from "../../styles/Base"
import Badge from '../../UI/lib/Badge'
import Event from '../../services/Event'
import { getConstant, setConstant } from "../../services/Constant";
import { getUnReadMsg } from "../../services/Push";
import CartList from '../../services/Cart';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const pxRatio = PixelRatio.get();  // 屏幕像密度


class SafeHeadView extends React.Component {
    render() {
        return <View onLayout={e => this.props.onLayout && this.props.onLayout(e)} style={[isIphoneX() ? safeViewStyle.top : null, this.props.boxStyle]}>
            <View style={this.props.style}>
                {this.props.children}
            </View>
        </View>
    }
}
const safeViewStyle = StyleSheet.create({
    top: {
        paddingTop: px(50),
        backgroundColor: "#fff"
    }
})
exports.SafeHeadView = SafeHeadView;
/**
 * 头部组件
 * rightBtn 右侧按钮
 */
exports.OldHeader = class extends React.Component {
    static defaultProps = {
        isNeedLookBorder: false
    }
    constructor(props) {
        super(props);
    }
    render() {
        return <SafeHeadView boxStyle={{ backgroundColor: '#fbfafc' }} style={styles.header}>
            {Platform.OS === 'ios' && <View style={styles.topBox} />}
            <View style={[styles.headerBar, this.props.style]}>
                <View style={styles.leftBtn}>
                    {this.props.leftBtn}
                </View>
                <View style={styles.title}>
                    <Text allowFontScaling={false} style={[styles.titleStyle, this.props.titleStyle]}>{this.props.title}</Text>
                </View>
                <View style={styles.rightBtn}>
                    {this.props.rightBtn}
                </View>
            </View>
        </SafeHeadView>
    }
    /**
     * 设置动画
     */
    setOffset() {

    }
}
const styles = StyleSheet.create({
    headBox: {
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    header: {
        backgroundColor: '#fbfafc',
        width: deviceWidth
    },

    topBox: {
        width: deviceWidth,
        height: 15
    },

    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
        height: 44,
        paddingTop: 5,
    },

    title: {
        flex: 1,
    },
    titleStyle: {
        color: "#333",
        textAlign: "center",
        fontSize: px(30)
    },
    leftBtn: {
        width: px(100),
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
    rightBtn: {
        width: px(100),
        //justifyContent:"flex-end",
        alignItems: "flex-end",
    }
});

/**
 * 头部组件，
 * boxStyles,外层样式
 * props title<string> 标题
 * props navigation
 * props leftBtn
 * props rightBtn 右边按钮
 */
exports.TopHeader = class extends React.Component {

    static defaultProps = {
        topTitle: null,
        hiddenBack: false
    }
    goBack() {
        if (this.props.navigation.state.params) {
            this.props.navigation.state.params.callback && this.props.navigation.state.params.callback();
        }
        if (this.props.action) {
            this.props.action()
        } else {
            this.props.navigation.goBack();
        }
    }

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }
    render() {
        let hiddenBack = this.props.hiddenBack;
        return <SafeHeadView boxStyle={{ backgroundColor: '#fbfafc' }} style={topStyles.header} onLayout={this.props.onLayout}>
            {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
            <View style={[topStyles.bar, this.props.boxStyles]}>
                <View style={[topStyles.leftBtn, this.props.backStyle]}>
                    {!hiddenBack && <TouchableOpacity style={topStyles.back} onPress={this.goBack}>
                        <View style={{ height: 30, width: 30, justifyContent: "center" }}>
                            <Icon name="icon_back"
                                style={{ width: 20, height: 20 }} />
                        </View>
                    </TouchableOpacity>}
                    {this.props.leftBtn}
                </View>
                {this.props.titleType == 'other' ? this.props.titleExtra : this.props.title && this.props.title != '' && <Text allowFontScaling={false} style={topStyles.title}>{this.props.title}</Text>}
                {this.props.topTitle}
                <View style={topStyles.rightBtn}>
                    {this.props.rightBtn}
                </View>
            </View>
        </SafeHeadView>
    }
}

exports.TopHeaderNoAdapter = class extends React.Component {

    static defaultProps = {
        topTitle: null,
        hiddenBack: false
    }

    goBack() {
        const { navigation, action } = this.props
        const callback = navigation.getParam('callback', () => { })

        callback && callback()

        if (action) return action()

        navigation.goBack()
    }

    render() {
        // let hiddenBack = this.props.hiddenBack;

        const {
            onLayout,
            hiddenBack,
            boxStyles,
            leftBtn,
            titleType,
            titleExtra,
            title,
            topTitle,
            rightBtn
        } = this.props

        return <View style={[topStyles.bar, boxStyles]} onLayout={onLayout}>
            <View style={topStyles.leftBtn}>
                {!hiddenBack && <TouchableOpacity style={topStyles.back} onPress={() => this.props.goBack ? this.props.goBack() : this.goBack()}>
                    <View style={{ height: 30, width: 30, justifyContent: "center" }}>
                        <Icon name="icon_back"
                            style={{ width: 20, height: 20 }} />
                    </View>
                </TouchableOpacity>}
                {leftBtn}
            </View>
            {titleType == 'other' ? titleExtra : title && title != '' && <Text allowFontScaling={false} style={topStyles.title}>{title}</Text>}
            {topTitle}
            <View style={topStyles.rightBtn}>
                {typeof rightBtn === 'function' && rightBtn()}
            </View>
        </View>
    }
}

const topStyles = StyleSheet.create({
    header: {
        backgroundColor: '#fbfafc',
        width: deviceWidth
    },
    topBox: {
        width: deviceWidth,
        height: 15
    },
    bar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
        height: 44,
        paddingTop: 5
    },
    title: {
        flex: 1,
        fontSize: px(30),
        textAlign: "center",
        color: "#252426"
    },
    leftBtn: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: px(120),
    },
    rightBtn: {
        width: px(120),
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    back: {
        marginLeft: px(20)
    },
})

const HomeTopMsg = class extends React.Component {
    updated = (is) => {
        if (this.state.isMsg == is) return;
        this.setState({
            isMsg: is
        })
    }

    // check = async () => {
    //     let un = await getUnReadMsg(); // 获取未读消息
    //     // let is = getConstant("isMsg"); // 是否有推送消息
    //
    //     if (this.state.isMsg == un) return;
    //     this.setState({
    //         isMsg: un
    //     })
    // }

    constructor(props) {
        super(props)

        this.state = {
            isMsg: false
        }
    }

    goMessageCenter() {
        if (!User.isLogin) {
            this.props.navigation.navigate('LoginPage', {});
            return;
        }
        this.props.navigation.navigate('MessageCenter', {});
    }

    render() {
        let isChange = this.props.isChange;
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => this.goMessageCenter()}>
                <View style={styleSearchHeader.messageBox}>
                    <Badge dot={this.state.isMsg && User.isLogin}>
                        {
                            isChange ? <Icon name={'icon-message-center'} width={px(44)} height={px(44)} />
                                : <Icon name={'icon-message-center-rev'} width={px(44)} height={px(44)} />
                        }
                    </Badge>
                    {
                        isChange ? <Text style={{ fontSize: px(16), marginTop: 2, color: "#fff" }}>消息</Text> : <Text style={{ fontSize: px(16), marginTop: 2, color: "#000" }}>消息</Text>
                    }
                </View>
            </TouchableOpacity>
        );
    }

    componentWillMount() {
        Event.on("top.msg.updated", this.updated)
        // Event.on("top.msg.check", this.check)
    }

    componentWillUnmount() {
        Event.off("top.msg.updated", this.updated)
        // Event.off("top.msg.check", this.check)
    }
}

const TopMsg = class extends React.Component {
    updated = (is) => {
        if (this.state.isMsg == is) return;
        this.setState({
            isMsg: is
        })
    }

    // check = async () => {
    //     let un = await getUnReadMsg(); // 获取未读消息
    //     // let is = getConstant("isMsg"); // 是否有推送消息
    //
    //     if (this.state.isMsg == un) return;
    //     this.setState({
    //         isMsg: un
    //     })
    // }

    constructor(props) {
        super(props)

        this.state = {
            isMsg: false
        }
    }

    goMessageCenter() {
        if (!User.isLogin) {
            this.props.navigation.navigate('LoginPage', {});
            return;
        }
        this.props.navigation.navigate('MessageCenter', {});
    }

    render() {
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => this.goMessageCenter()}>
                <View style={{
                    width: px(104),
                    height: px(76),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {
                        this.props.rev ? <Badge dot={this.state.isMsg && User.isLogin} reverse={this.props.cl}>
                            <Icon name={'icon-message-center-rev'} width={px(44)} height={px(44)} />
                        </Badge> :
                            <Badge dot={this.state.isMsg && User.isLogin} reverse={this.props.cl}>
                                <Icon name={'icon-message-center'} width={px(44)} height={px(44)} />
                            </Badge>
                    }
                </View>
            </TouchableOpacity>
        );
    }

    componentWillMount() {
        Event.on("top.msg.updated", this.updated)
        // Event.on("top.msg.check", this.check)
    }

    componentWillUnmount() {
        Event.off("top.msg.updated", this.updated)
        // Event.off("top.msg.check", this.check)
    }
}

exports.HomeTopMsg = HomeTopMsg
exports.TopMsg = TopMsg

/**
 * 首页搜索顶部
 * props scrollTop
 */
exports.SearchHeader = observer(class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shop: {},
            searchTxt: ''
        }
        this.transY = 0;
    }

    render() {
        this.transY = parseFloat(JSON.stringify(this.props.scrollTop)); // 根据Y轴的滑动距离更换右侧按钮图片
        let isChange = this.props.scrollTop._value < 10 ? this.props.tabState : false;
        return <SafeHeadView2 onLayout={e => this.props.onLayout && this.props.onLayout(e)} backgroundColor='transparent' boxStyle={{ backgroundColor: 'transparent' }} style={styleSearchHeader.header}>
            {/*<TouchableOpacity activeOpacity={0.9} onPress={() => this.shareTo()}>*/}
            {/*<View style={styleSearchHeader.back}>*/}
            {/*<Image source={{ uri: ShopDetail.indexImg }}*/}
            {/*style={styleSearchHeader.shopLogo} />*/}
            {/*<Image style={styleSearchHeader.headerShareImg}*/}
            {/*source={pxRatio > 2.51 ? ImagesRes.shareIcon3x : ImagesRes.shareIcon2x} />*/}
            {/*</View>*/}
            {/*</TouchableOpacity>*/}
            <HomeTopMsg isChange={isChange} navigation={this.props.navigation} />
            <TouchableOpacity onPress={() => this.goSearch()}>
                <View name="home-top-search" style={styleSearchHeader.searchBox}>
                    <Icon name="icon-top-search" style={styleSearchHeader.headerSearchImg} />
                    {
                        this.state.searchTxt ?
                            <Text allowFontScaling={false} style={styleSearchHeader.headerSearchInput}>{this.state.searchTxt}</Text> : null
                        // : <Text allowFontScaling={false} style={styleSearchHeader.headerSearchInput}>在<Text allowFontScaling={false} style={{ color: '#d0648f' }}>{ShopDetail.name}</Text>中搜索</Text>
                    }
                </View>
            </TouchableOpacity>

            {isChange && <TouchableOpacity
                style={[base.line, { marginLeft: px(10) }]}
                activeOpacity={0.9}
                onPress={() => this.goGoodsCategory()}>
                <Icon name="icon-class-wh" style={{ width: px(44), height: px(44) }} />
                <Text style={{ fontSize: px(18), marginTop: 2, color: "#fff" }}>分类</Text>
            </TouchableOpacity>}
            {!isChange && <TouchableOpacity
                style={[base.line, { marginLeft: px(10) }]}
                activeOpacity={0.9}
                onPress={() => this.goGoodsCategory()}>
                <Icon name="icon-class-black" style={{ width: px(44), height: px(44) }} />
                <Text style={{ fontSize: px(18), marginTop: 2, color: "#000" }}>分类</Text>
            </TouchableOpacity>}

            <ShareView ref='shareView'
                navigation={this.props.navigation}
                getQrCode={() => this.getQrCode()}
                types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
                {!User.vip && <View style={styleSearchHeader.modalHead}>
                    <Text style={styleSearchHeader.modalTxt1} allowFontScaling={false}>分享店铺</Text>
                    <Text style={styleSearchHeader.modalTxt2} allowFontScaling={false}>只要你的好友通过你的分享购买商品，你就能赚到利润收入哦～</Text>
                </View>}
                {User.vip && <View style={styleSearchHeader.modalHead}>
                    <Text style={styleSearchHeader.modalTxt1} allowFontScaling={false}>分享好店:{ShopDetail.name}</Text>
                </View>}
            </ShareView>
        </SafeHeadView2>
    }

    async getSearchLabel() {
        try {
            let res = await request.get('/search/tag/getSearchBarTag.do')
            if (res) {
                this.setState({
                    searchTxt: res || ''
                })
            }
        } catch (e) {
            //
        }
    }

    async componentDidMount() {
        await this.getSearchLabel() // 搜索标签
        try {
            // let shop = await getShopDetail();
            // this.setState({shop})

        } catch (error) {
            //
        }
    }

    goSearch() {
        // track
        TrackClick('TOP', 'TOPSearchBar', '顶部', '搜索');
        this.props.navigation.navigate('SearchPage', {
            searchTxt: this.state.searchTxt
        });
    }

    /**
     * 跳转到分类
     */
    goGoodsCategory() {
        TrackClick('TOP', 'TOPClassify', '顶部', '分类页');
        this.props.navigation.navigate('GoodsCategoryPage');
    }

    /**
     * 实现分享店铺
     */
    async shareTo() {
        if (User.isLogin) {
            this.refs.shareView.Share({
                title: `给您推荐一个不错的店铺:{shopName}`,
                desc: ShopDetail.desc,
                url: `${touchBaseUrl}/`,
                img: ShopDetail.indexImg,
                link: `${touchBaseUrl}/`,
                track: (type) => {
                    TrackClick('TOP', 'TOPShareShop', '首页', `分享店铺-${type}`);
                }
            });
        } else {
            this.props.navigation.navigate("LoginPage");
        }
        // track
    }
    /**
     * 实现店铺下载二维码
     */
    async getQrCode() {
        let res1 = await request.get('/shop/touch/createQrcodeV1.do');
        return res1.showUrl;
    }
});

const styleSearchHeader = StyleSheet.create({
    messageBox: {
        marginRight: px(10),
        width: px(60),
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBox: {
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: deviceWidth - 84 - px(24),
        backgroundColor: "#efefef"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        width: deviceWidth,
        paddingLeft: px(22),
        paddingRight: px(22),
        height: 44,
        marginTop: 8,

    },
    back: {
        width: 40,
        height: 30,
        marginLeft: px(6),
        justifyContent: 'center',
        alignItems: "flex-start",
    },
    shopLogo: {
        width: 28,
        height: 28,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: px(2),
        borderColor: "#fff"
    },
    headerShareImg: {
        width: 15,
        height: 15,
        borderRadius: px(14),
        borderWidth: px(1),
        borderColor: '#efefef',
        overflow: 'hidden',
        position: 'absolute',
        left: 18,
        top: 14
    },
    headerSearchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: px(35),
        justifyContent: "flex-start",
        height: 28,
        overflow: 'hidden',
        // marginLeft: 5
    },
    headerSearchImg: {
        width: 16,
        height: 16,
        marginRight: px(8)
    },
    headerSearchInput: {
        color: "#b2b3b5",
        fontSize: setSpText(15),
    },
    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
        height: px(169),
        paddingLeft: px(145),
        paddingRight: px(145),
    },
    modalTxt1: {
        fontSize: setSpText(21),
        color: '#d0648f',
        fontWeight: '900'
    },
    modalTxt2: {
        fontSize: setSpText(13),
        color: '#858385',
        textAlign: 'center',
        marginTop: px(10),
        lineHeight: px(30)
    }
});

exports.SearchBar = class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isEdit: !props.immediately,
            txt: ''
        }
    }
    static defaultProps = {
        goSearch: () => { },
        onFocus: null,
        placeholder: "请输入商品关键字"
    }
    render() {
        return <SafeHeadView style={[styleSearchBar.header, this.props.style || {}]}>
            {!this.state.isEdit &&
                <TouchableOpacity style={styleSearchBar.back} onPress={() => this.goBack()}>
                    <Icon name="icon_back"
                        style={{ width: px(44), height: px(44) }} />
                </TouchableOpacity>}
            <View style={[styleSearchBar.headerSearchBar, this.props.bodyStyle || {}]}>
                <TouchableOpacity style={styleSearchBar.headerSearchImg} onPress={() => this.submit()}>
                    <Icon name="icon_search_gray"
                        style={{ width: px(40), height: px(40), marginRight: px(10) }} />
                </TouchableOpacity>
                <TextInput
                    style={[styleSearchBar.headerSearchInput, { width: this.state.isEdit ? px(540) : this.props.type == 1 ? px(500) : px(540) }]}
                    ref="searchInput"
                    placeholder={this.props.placeholder}
                    placeholderTextColor={this.props.inputColor || "#858385"}
                    autoCorrect={false}
                    autoFocus={this.state.isEdit}
                    keyboardType="web-search"
                    maxLength={20}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                    value={this.state.txt}
                    onChangeText={(t) => this.mindText(t)}
                    onBlur={() => this.endEdit()}
                    onSubmitEditing={() => this.submit()}
                    onFocus={() => this.beginEdit()}
                //onEndEditing={() => this.endEdit()}
                />
            </View>
            {this.state.isEdit && <TouchableOpacity onPress={() => this.goBack()}
                style={[styleSearchBar.headerSearchCancelBtn, { marginRight: px(22) }]}>
                <Text allowFontScaling={false} style={styleSearchBar.headerSearchCancel}>取消</Text>
            </TouchableOpacity>}
            {this.props.type == 1 && !this.state.isEdit && <View style={styleSearchBar.rightBtns}><TouchableOpacity onPress={() => this.props.hide()}
                style={styleSearchBar.headerSearchCancelBtn}>
                {this.props.hideMoney ? <Icon name="icon-eye2"
                    style={styleSearchBar.headerIcon} /> :
                    <Icon name="icon-eye1"
                        style={styleSearchBar.headerIcon} />}
            </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: px(22) }} onPress={() => this.props.selected()}>
                    <Icon name={this.props.isSelected ? 'selected' : 'disable-selected'} style={styleSearchBar.headerIcon} />
                </TouchableOpacity>
            </View>}
        </SafeHeadView>
    }

    goBack() {
        this.props.navigation.goBack()
    }

    setTxt(t) {
        this.setState({
            txt: t
        });
    }

    mindText(t) {
        let obj = {
            txt: t
        }
        if (!this.state.isEdit) {
            obj.isEdit = true
        }
        this.setState(obj);
    }

    beginEdit() {
        if (this.state.txt == "") {
            this.setState({
                isEdit: true,
                txt: ""
            });
        } else {
            this.setState({
                isEdit: true
            });
        }
        this.props.onFocus && this.props.onFocus();
    }

    endEdit() {
        if (this.state.txt == "") {
            this.setState({
                txt: "",
                isEdit: false
            });
        } else {
            this.setState({
                isEdit: false
            });
        }

    }

    submit() {
        this.endEdit();
        this.refs.searchInput.blur();
        this.props.goSearch(this.state.txt);
    }
}
const styleSearchBar = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: px(20),
        ...Platform.select({
            ios: {
                paddingTop: px(60),
                height: px(140)
            },
            android: {
                paddingTop: px(20),
                height: px(100)
            }
        })
    },
    back: {
        marginLeft: px(20)
    },
    headerSearchBar: {
        flex: 1,
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(20),
        marginRight: px(20),
        alignItems: "center"
    },
    headerSearchImg: {
        marginLeft: px(15)
    },
    headerSearchInput: {
        flex: 1,
        color: "#252426",
        fontSize: px(28),
        height: px(60),
        padding: 0
    },
    headerSearchCancel: {
        color: "#858385",
        fontSize: px(30),
        textAlign: "center",
        marginLeft: px(10)
    },
    rightBtns: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: px(10)
    },
    headerSearchCancelBtn: {

    },
    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
        height: px(169),
        paddingLeft: px(145),
        paddingRight: px(145),
        paddingTop: px(53)
    },
    modalTxt1: {
        fontSize: px(42),
        color: '#d0648f',
        fontWeight: '900'
    },
    modalTxt2: {
        fontSize: px(26),
        color: '#858385',
        textAlign: 'center',
        marginTop: px(10),
        lineHeight: px(30)
    },
    headerIcon: {
        width: px(40), height: px(40),
        marginTop: px(5),
        marginLeft: px(10),
    },
});

/**
 * 新逻辑的iPhoneX适配
 */
class SafeHeadView2 extends React.Component {
    static defaultProps = {
        backgroundColor: "#fff"
    }
    render() {
        if (Platform.OS !== 'ios') {
            return <View style={this.props.style}
                onLayout={e => this.props.onLayout && this.props.onLayout(e)}>
                {this.props.children}
            </View>
        }
        return <View onLayout={e => this.props.onLayout && this.props.onLayout(e)}
            style={{ backgroundColor: this.props.backgroundColor }}>
            {isIphoneX() && <View style={SafeHeadView2Style.xBox}></View>}
            <View style={SafeHeadView2Style.topBox}></View>
            <View style={this.props.style}>
                {this.props.children}
            </View>
        </View>
    }
}
const SafeHeadView2Style = StyleSheet.create({
    topBox: {
        width: deviceWidth,
        height: 20,
    },
    xBox: {
        width: deviceWidth,
        height: 20,
    }
})
exports.SafeHeadView2 = SafeHeadView2;
/**
 * 头部组件，
 * style,外层样式
 * props title<string> 标题
 * props hiddenBack  是否隐藏后退按钮
 * props navigation
 * props leftBtn
 * props rightBtn 右边按钮
 * props onBack  点击后退按钮
 */
exports.Header = class extends React.Component {

    static defaultProps = {
        title: null,
        hiddenBack: false,
        leftBtn: null,
        rightBtn: null,
        onBack: null
    }
    constructor(props) {
        super(props);
    }
    render() {
        let hiddenBack = this.props.hiddenBack;
        return <SafeHeadView2 boxStyle={{ backgroundColor: '#fbfafc' }} style={headStyles.header} onLayout={this.props.onLayout}>
            <View style={[headStyles.bar, this.props.style]}>
                <View style={headStyles.leftBtn}>
                    {!hiddenBack && <TouchableOpacity onPress={this.goBack.bind(this)}>
                        <View style={headStyles.back}>
                            <Icon name="icon_back"
                                style={{ width: 20, height: 20 }} />
                        </View>
                    </TouchableOpacity>}
                    {this.props.leftBtn}
                </View>
                <View style={headStyles.center}>
                    {this.props.title && <Text allowFontScaling={false} style={headStyles.title}>{this.props.title}</Text>}
                    {this.props.children}
                </View>
                <View style={headStyles.rightBtn}>
                    {this.props.rightBtn}
                </View>
            </View>
        </SafeHeadView2>
    }

    goBack() {
        if (this.props.navigation.state.params && this.props.navigation.state.params.callback) {
            this.props.navigation.state.params.callback.call(this);
        }
        if (this.props.onBack) {
            this.props.onBack();
        } else {
            this.props.navigation.goBack();
        }
    }
}

const headStyles = StyleSheet.create({
    topBox: {
        width: deviceWidth,
        height: 15
    },
    bar: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        borderBottomColor: "#efefef",
        borderBottomWidth: 1,
        height: 44,
        paddingTop: 5,
        // backgroundColor:"#ccc"
    },
    center: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: px(30),
        textAlign: "center",
        color: "#252426"
    },
    leftBtn: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: px(120),
        height: 44,
        marginLeft: 5
    },
    rightBtn: {
        marginRight: 10,
        width: px(120),
        height: 44,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    back: {
        height: 44,
        width: 44,
        justifyContent: "center"
    },
})

/*
 * @class: GradientHeader
 * @Param: {
 * 
 * 
 * }
 * @Desc: 过度效果header
 */

class GradientContainer extends React.Component {
    static defaultProps = {
        isBack: true,
        isRightBtn: true,
        rightPress: () => { },
        leftIconName: 'icon_back',
        rightIconName: 'goodsDetailShare',
        title: ''
    }

    constructor() {
        super()

        this.state = {
            springValue: new Animated.Value(0)
        }

        this.goBack = this.goBack.bind(this)
        this.imgBoxHeight = parseInt(px(750))
    }

    render() {
        const {
            style,
            isFirst,
            isBack,
            isRightBtn,
            title,
            rightPress,
            opacity,
            leftIconName,
            rightIconName
        } = this.props

        const interpolates = {
            inputRange: [0, this.imgBoxHeight],
            outputRange: isFirst ? [1, 0] : [0, 1]
        }

        const spin = this.state.springValue.interpolate(interpolates)

        return (

            <Animated.View style={[gradientContainerStyle.main, style, {
                opacity: spin
            }]}>
                <View style={[gradientContainerStyle.leftBtn, isFirst && gradientContainerStyle.radius]}>
                    {isBack && <TouchableOpacity onPress={this.goBack.bind(this)}>
                        <View style={gradientContainerStyle.back}>
                            <Icon name={leftIconName} style={gradientContainerStyle.leftIcon} />
                        </View>
                    </TouchableOpacity>}
                </View>
                {!isFirst && <View style={gradientContainerStyle.center}>
                    {title && <Text allowFontScaling={false} style={gradientContainerStyle.title}>{title}</Text>}
                    {this.props.children}
                </View>}
                <View style={[gradientContainerStyle.rightBtn, isRightBtn && isFirst && gradientContainerStyle.radius]}>
                    {isRightBtn && <TouchableOpacity onPress={rightPress}>
                        <Icon name={rightIconName} style={gradientContainerStyle.rightIcon} />
                    </TouchableOpacity>}
                </View>
            </Animated.View>
        )
    }

    setNativeProps(value) {
        value = value <= 0 ? 0 : parseInt(value)

        if (value > this.imgBoxHeight) value = this.imgBoxHeight

        this.state.springValue.setValue(value)
    }

    goBack() {
        const { navigation, onBack } = this.props
        const params = navigation.state.params

        if (params && params.callback) params.callback.call(this)
        onBack ? onBack() : navigation.goBack()
    }
}

const gradientContainerStyle = StyleSheet.create({
    main: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        paddingHorizontal: px(24),
        height: isIphoneX() ? 88 : isIphone() ? 64 : 44,
        paddingTop: isIphoneX() ? 44 : isIphone() ? 20 : 0,
        zIndex: 1
    },
    leftBtn: {
        justifyContent: "center",
        alignItems: 'center',
        width: px(70),
        height: px(70),

        // marginLeft: 5
    },
    back: {
        width: px(44),
        height: px(44),
        justifyContent: "center"
    },
    center: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: px(30),
        textAlign: "center",
        color: "#252426"
    },
    rightBtn: {
        // marginRight: 10,
        width: px(70),
        height: px(70),
        justifyContent: "center",
        alignItems: 'center'
    },
    leftIcon: {
        width: px(44),
        height: px(44)
    },
    rightIcon: {
        width: px(44),
        height: px(44)
        // marginRight: 10
    },
    radius: {
        backgroundColor: 'rgba(0, 0, 0, .3)',
        borderRadius: px(70)
    }
})

exports.GradientHeader = class extends React.Component {
    render() {
        return (
            <View style={gradientStyle.containerBox}>
                <View style={gradientStyle.container}>
                    <GradientContainer
                        {...this.props}
                        ref={ref => this.firstHeader = ref}
                        isFirst={true}
                        leftIconName="icon-back-white"
                        rightIconName="icon-goodShare-white"
                    />
                    <GradientContainer
                        {...this.props}
                        ref={ref => this.afterHeader = ref}
                        style={gradientStyle.afterMain}
                    />
                </View>
            </View>
        )
    }

    setNativeProps(y) {
        y = y >= 0 ? y : 0
        this.firstHeader.setNativeProps(y)
        this.afterHeader.setNativeProps(y)
    }
}


const gradientStyle = StyleSheet.create({
    containerBox: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'transparent',
    },
    container: {
        position: 'relative',
        height: 44
    },
    afterMain: {
        borderBottomColor: "#efefef",
        borderBottomWidth: px(1),
        backgroundColor: '#fbfafc'
    },
})

exports.SearchView = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            txt: "",
        };
    }
    static defaultProps = {
        goSearch: () => { },
        onFocus: null,
        placeholder: "请输入搜索关键字"
    }
    render() {
        return <View style={styleSearchView.box}>
            <View style={styleSearchView.headerSearchBar}>
                <TouchableOpacity style={styleSearchView.headerSearchImg} onPress={() => this.submit()}>
                    <Icon name="icon_search_gray"
                        style={{ width: px(35), height: px(35), marginRight: px(10) }} />
                </TouchableOpacity>
                <View>
                    <TextInput
                        style={[styleSearchView.headerSearchInput, { width: px(540) }]}
                        ref="searchInput"
                        placeholder={this.props.placeholder}
                        placeholderTextColor="#858385"
                        autoCorrect={false}
                        keyboardType="web-search"
                        maxLength={20}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        value={this.state.txt}
                        onChangeText={(t) => this.mindText(t)}
                        onSubmitEditing={() => this.submit()}
                    />
                </View>
            </View>
            <TouchableOpacity onPress={() => this.submit()}
                style={styleSearchView.headerSearchCancelBtn}>
                <Text allowFontScaling={false} style={styleSearchView.headerSearchCancel}>搜索</Text>
            </TouchableOpacity>
        </View>
    }
    mindText(txt) {
        this.setState({ txt });
    }
    submit() {
        this.props.goSearch(this.state.txt);
    }
}

const styleSearchView = StyleSheet.create({
    box: {
        backgroundColor: "#fbfafc",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 5
    },
    headerSearchBar: {
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(20),
        marginRight: px(20),
        alignItems: "center",
        borderRadius: px(30)
    },
    headerSearchImg: {
        marginLeft: px(15)
    },
    headerSearchInput: {
        width: px(540),
        color: "#252426",
        fontSize: px(28),
        height: px(60),
        padding: 0
    },
    headerSearchCancel: {
        color: "#858385",
        fontSize: px(30),
        textAlign: "center",
        marginLeft: px(10)
    },
    headerSearchCancelBtn: {
        paddingRight: 5
    },
    modalHead: {
        alignItems: 'center',
        flexDirection: 'column',
        height: px(169),
        paddingLeft: px(145),
        paddingRight: px(145),
        paddingTop: px(53)
    },
    modalTxt1: {
        fontSize: px(42),
        color: '#d0648f',
        fontWeight: '900'
    },
    modalTxt2: {
        fontSize: px(26),
        color: '#858385',
        textAlign: 'center',
        marginTop: px(10),
        lineHeight: px(30)
    },
    headerIcon: {
        width: px(40), height: px(40),
        marginTop: px(5),
        marginLeft: px(10),
    },
})
/**
 * 购物车头部
 */
let CartHeader = observer(class CartHeader extends React.Component {
    static defaultProps = {
    }
    constructor(props) {
        super(props);
    }

    render() {
        return <SafeHeadView boxStyle={{ backgroundColor: '#fbfafc' }} style={cartStyles.header}>
            {Platform.OS === 'ios' && <View style={cartStyles.topBox} />}
            <View style={[cartStyles.headerBar, base.inline_between]}>
                <View style={cartStyles.leftBtn}>
                    {this.props.leftBtn}
                </View>
                <TouchableWithoutFeedback onPress={() => this.goArea()}>
                    <View style={[cartStyles.title, base.inline]}>
                        <Text allowFontScaling={false} style={[cartStyles.titleStyle]}>
                            {this.props.title}
                        </Text>
                        <Icon name="icon-address"
                            style={{ width: px(20), height: px(27) }} />
                        <Text allowFontScaling={false} style={[cartStyles.titleArea]}>
                            {CartList.data.area.district}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
                <View style={cartStyles.rightBtn}>
                    {this.props.rightBtn}
                </View>
            </View>
        </SafeHeadView>
    }

    goArea() {
        let ids = [];
        CartList.data.list.forEach(item => {
            item.data.filter(i => i.select_status == 1 && i.can_select == 1).forEach(k => {
                ids.push(k.id);
            })
        })
        this.props.navigation.navigate('DistributionPage', {
            call: () => {
                CartList.getSelectArea()
            },
            from: 'cart',
            id: ids.toString()
        });
    }
})
exports.CartHeader = CartHeader

const cartStyles = StyleSheet.create({
    header: {
        backgroundColor: '#fbfafc',
        width: deviceWidth
    },
    topBox: {
        width: deviceWidth,
        height: 15
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
        height: 44,
        paddingTop: 5,
    },

    title: {
        flex: 1,
    },
    titleStyle: {
        color: "#333",
        textAlign: "center",
        fontSize: px(30),
        marginRight: px(10)
    },
    titleArea: {
        fontSize: px(26),
        color: '#858385',
        marginLeft: px(5)
    },
    leftBtn: {
        width: px(100),
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
    rightBtn: {
        width: px(100),
        //justifyContent:"flex-end",
        alignItems: "flex-end",
    }
})
