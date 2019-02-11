'use strict';

import React from "react";

import {
    Image,
    Text,
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    TouchableWithoutFeedback,
    ImageBackground,
    PixelRatio
} from "react-native";

import { px, isIphoneX, deviceWidth, isIphone } from "../../utils/Ratio";
import { config } from '../../services/Constant';
import { ImgsModal, DialogModal } from '../common/ModalView'
import base from '../../styles/Base'
import Tabs from './GoodTabs'
import TabView from 'react-native-scrollable-tab-view2'
import util_cools from '../../utils/tools'
import GoodPromise from './GoodPromise'
import { GoodBonded, GoodOverseas } from './GoodBonded'
import mDate from '../../utils/Date'
import Icon from '../../UI/lib/Icon'
import Background from '../../UI/lib/Background'
import { User } from '../../services/Api'
import Explain from '../common/ExplainModal'
import RemindBox from '../common/RemindBox'
import { GoodBasic } from './GoodBasic'
import { DetailsGoodsRecommended } from '../recommended/GoodsRecommended'

const pxRatio = PixelRatio.get();  // 屏幕像密度

const PreheatView = ({ isStart, preheat_time }) => {
    return <View style={goodStyles.preheatNew}>
        <View style={[goodStyles.preheatBgNew, base.line, { backgroundColor: 'red' }]}
            name={isStart ? "shopdetail-preheat-done" : "shopdetail-preheat"}
            resizeMode='cover'>
            <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: px(30) }}>
                <View style={{ height: px(40), flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[goodStyles.preheatTxtNew, { fontSize: px(26), color: '#ffffff', paddingRight: px(20) }]} allowFontScaling={false}>{isStart ? '距结束' : '距开始'}</Text>
                    <Timer preheat_time={preheat_time} styles={{ height: px(40) }} />
                </View>
            </View>
        </View>
    </View>
}

const PreheatPreSaleView = ({ isStart, preheat_time, preSaleShipDateStr }) => {
    return <View style={goodStyles.preheatNew}>
        <Background style={[goodStyles.preheatBgNew, base.line, { height: px(96) }]}
            name={isStart ? "shopdetail-preheat-doneMerge" : "shopdetail-preheatMerge"}
            resizeMode='cover'>
            <View style={[preStyles.sale_hot, base.inline_between]}>
                <View style={[preStyles.box]}>
                    <Text style={[preStyles.leftTxt1, preStyles.colorFFF]} allowFontScaling={false}>限时特卖</Text>
                    <Text style={[preStyles.leftTxt2, preStyles.colorFFF]} allowFontScaling={false}>
                        预计
                        <Text allowFontScaling={false}>
                            {preSaleShipDateStr}
                        </Text>
                        前发货
                    </Text>
                </View>
                <View style={base.inline_left}>
                    <View style={{ width: px(1), height: px(62), backgroundColor: '#fff', marginRight: px(30) }}></View>
                    <View style={preStyles.box}>
                        <Text style={[goodStyles.preheatTxtNew, { fontSize: px(24), color: '#ffffff' }]} allowFontScaling={false}>{isStart ? '距结束' : '距开始'}</Text>
                        <Timer preheat_time={preheat_time} styles={{ height: px(30) }} />
                    </View>
                </View>
            </View>
        </Background>
    </View>
}


class Timer extends React.Component {
    static defaultProps = {
        textColor: '#fff'
    }

    constructor(props) {
        super(props)

        this.state = {
            width: 0
        }
    }

    render() {
        const { preheat_time, textColor } = this.props
        const size = this.props.size || 28

        return <View style={[base.inline, this.state.width && { width: this.state.width, justifyContent: 'flex-start' }]} onLayout={(e) => {
            !this.state.width && this.setState({ width: e.nativeEvent.layout.width + 1 })
        }}>
            <View style={[goodStyles.preheatTimeNew, base.inline]}>
                <Text style={[goodStyles.preheatTxtNew, { fontSize: px(size), color: textColor }]} allowFontScaling={false}>{preheat_time.hour}</Text>
            </View>
            <Icon style={promptStyle.promptTimerIcon}
                name="icon-preheatTime" />
            <View style={[goodStyles.preheatTimeNew, base.inline]}>
                <Text style={[goodStyles.preheatTxtNew, { fontSize: px(size), color: textColor }]} allowFontScaling={false}>{preheat_time.minute}</Text>
            </View>
            <Icon style={promptStyle.promptTimerIcon}
                name="icon-preheatTime" />
            <View style={[goodStyles.preheatTimeNew, base.inline]}>
                <Text style={[goodStyles.preheatTxtNew, { fontSize: px(size), color: textColor }]} allowFontScaling={false}>{preheat_time.second}</Text>
            </View>
        </View>
    }
}

class SuningController extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            suningTime: {
                day: '0',
                hour: '00',
                minute: '00',
                second: '00'
            },
        }
        this.timer = null;
        this.diffTime = 0;
    }

    componentDidMount() {
        if (this.props.goods.ext_sub_time && this.props.goods.ext_sub_time != 0) {
            this.timeTo()
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
    timeTo() {
        let time = this.props.goods.ext_end_time;
        let now = Date.now();
        let time2 = time - now;

        this.setState({
            suningTime: util_cools.formatDay(time2)
        })

        this.timer = setInterval(() => {
            let now = Date.now();
            time2 = time - now;
            if (time2 <= 0) {
                clearInterval(this.timer);
                return;
            }

            this.setState({
                suningTime: util_cools.formatDay(time2)
            })
        }, 100)
    }
    render() {
        return <RemindBox
            bgColor="rgba(255, 250, 47, 0.8)"
            title="苏宁特惠 限时抢购"
            width={px(560)}
            titleColor="#222"
        >
            <View style={promptStyle.preheatBox}>
                <Text style={[promptStyle.promptTextBlack, promptStyle.promptTextMarginRight]}>
                    距结束
                </Text>
                <Text style={promptStyle.promptTextBlack}>{this.state.suningTime.day}</Text>
                <Text style={[promptStyle.promptTextBlack, promptStyle.promptSmallText]}>天</Text>
                <View style={promptStyle.promptTimerBox}>
                    <Text style={promptStyle.promptTextBlack}>{this.state.suningTime.hour}</Text>
                    <Icon style={promptStyle.promptTimerIcon} name="icon-suningTime" />
                    <Text style={promptStyle.promptTextBlack}>{this.state.suningTime.minute}</Text>
                    <Icon style={promptStyle.promptTimerIcon} name="icon-suningTime" />
                    <Text style={promptStyle.promptTextBlack}>{this.state.suningTime.second}</Text>
                    <Icon style={promptStyle.promptTimerIcon} name="icon-suningTime" />
                    <Text style={promptStyle.promptTextBlack}>{this.state.suningTime.ms}</Text>
                </View>
            </View>
        </RemindBox>
    }
}

class PreheatController extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.initState()
        this.timer = null;
        this.diffTime = 0;
    }

    componentDidMount() {
        this.action(this.props)
    }

    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }

    controller = () => {
        let state = {}
        this.diffTime -= 1;
        if (this.diffTime > 0) {
            state = {
                preheat_times: util_cools.formatDate(this.diffTime)
            }
        } else {
            if (this.state.isStart) {
                state = this.initState()
                clearInterval(this.timer)
            } else {
                let goods = this.props.goods || {}
                this.setDiffTime(goods.salesEndTimeDiff)
                state = {
                    isStart: true,
                    preheat_times: util_cools.formatDate(this.diffTime)
                }
            }
        }

        this.setState(state);
    }

    initState() {
        return {
            isShow: false,
            isStart: false,
            preheat_times: {
                hour: '00',
                minute: '00',
                second: '00'
            }
        }
    }

    setDiffTime(time) {
        if (!time) {
            this.diffTime = 0
            return;
        }
        this.diffTime = parseInt(time / 1000)
    }

    action(props) {
        let goods = props.goods || {}, area = props.area || {}, preSaleYn = props.area.preSaleYn == 'Y';
        let isTime = false, s = goods.salesTimeDiff > 0, e = goods.salesEndTimeDiff > 0;
        let state = {
            isShow: e,
            isStart: s ? false : true,
            preSaleShipDateStr: area.preSaleShipDateStr,
            preSaleYn: preSaleYn
        }
        isTime = e;
        if (s) {
            this.setDiffTime(goods.salesTimeDiff);
            state.preheat_times = util_cools.formatDate(this.diffTime)
        } else if (e) {
            this.setDiffTime(goods.salesEndTimeDiff)
            state.preheat_times = util_cools.formatDate(this.diffTime)
        }
        this.setState(state);

        if (isTime) {
            if (this.timer) clearInterval(this.timer);
            this.timer = setInterval(this.controller, 1000);
        }
    }

    render() {
        const { isStart, preheat_times, preSaleShipDateStr } = this.state

        return <RemindBox
            bgColor={isStart ? 'rgba(237, 63, 88, 0.8)' : 'rgba(232, 62, 137, 0.8)'}
            title="限时特卖"
        >
            <View style={promptStyle.preheatBox}>
                <Text style={[promptStyle.promptText, promptStyle.promptTextMarginRight, this.state.preSaleYn && promptStyle.smallText]}>
                    {isStart ? '距结束' : '距开始'}
                </Text>
                <Timer size={this.state.preSaleYn ? 22 : 28} preheat_time={preheat_times || {}} />
            </View>
            {
                this.state.preSaleYn &&
                <View style={[promptStyle.preheatBox, { marginTop: px(2) }]}>
                    <Text style={[promptStyle.promptText, promptStyle.promptTextMarginRight, this.state.preSaleYn && promptStyle.smallText]}>
                        发货日
                    </Text>
                    <Text style={[promptStyle.promptText, this.state.preSaleYn && promptStyle.smallText]}>
                        {preSaleShipDateStr}
                    </Text>
                </View>
            }
        </RemindBox>
    }
}

class PreSale extends React.Component {
    render() {
        return <RemindBox
            bgColor="rgba(166, 92, 217, 0.8)"
            title="预售"
        >
            <View style={promptStyle.preheatBox}>
                <Text style={promptStyle.promptText}>预计</Text>
                <Text style={[promptStyle.promptText, promptStyle.promptTextPadding]}>
                    {this.props.area.preSaleShipDateStr}
                </Text>
                <Text style={promptStyle.promptText}>前发货</Text>
            </View>
        </RemindBox>
    }
}


const promptStyle = StyleSheet.create({
    preheatBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    promptText: {
        color: '#fff',
        fontSize: px(26)
    },
    promptTextBlack: {
        color: '#222',
        fontSize: px(26)
    },
    promptSmallText: {
        fontSize: px(20),
        marginTop: px(4),
        marginHorizontal: px(4)
    },
    promptTextMarginRight: {
        marginRight: px(20)
    },
    promptTextPadding: {
        marginHorizontal: px(10)
    },
    promptTimerIcon: {
        width: px(4),
        height: px(11),
        marginHorizontal: px(7)
    },
    promptTimerBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    smallText: {
        fontSize: px(22)
    }
})

const PromptController = (props) => {
    const { goods, area } = props

    if (goods.salesEndTimeDiff > 0) {
        return <PreheatController {...props} />
    }

    if (goods.ext_sub_time > 0 && goods.salesEndTimeDiff <= 0) {
        return <SuningController goods={goods} />
    }

    if (area.preSaleYn == 'Y' && goods.salesEndTimeDiff <= 0) {
        return <PreSale area={area} />
    }

    if (goods.salesTimeStr && goods.salesTimeDiff > 0 && goods.salesEndTime == 0 && goods.ext_end_time == 0) {
        return <View style={goodStyles.preheat}>
            <ImageBackground style={[goodStyles.preheatBg, base.line]} source={{ uri: require('../../images/preheat-bg') }} resizeMode='cover'>
                <Text allowFontScaling={false} style={goodStyles.preheatTxt}>{goods.salesTimeStr} 开始售卖</Text>
            </ImageBackground>
        </View>
    }
    return null
}
exports.PromptController = PromptController

exports.Good = class extends React.Component {
    _scrollView;
    constructor(props) {
        super(props);
        this.state = {
            cfg: {}, //静态资源
            introduct: [], //海购政策
            copyTxt: '',
            isCanUp: false,
            tabs: [{ name: '图文详情' }, { name: '购买须知' }],
            purchase_notes_height: px(100),
            purchase_notes_width: px(750),
            notification_height: px(100),
            notification_width: px(750),
            showTab: true,
            isShowTab: false,
            activeTab_: 0,
            explain: {
                type: '',
                title: ''
            }
        }
        this._scrollY = 0;
        this.isRun = true;
        this.i = 0
        this.y = 0;
        this._scroll = 0;
        this.s = 0;
        this.isNeedScrollTo = false;
        this.headerTop = isIphoneX() ? 88 : isIphone() ? 64 : 44;
        this.recommendedY = 0;
        this.isRecommendedYLoad = false
    }

    async componentDidMount() {
        let goods = this.props.goods
        let tabs = []
        if (goods.skuType == 'yiguo') {
            tabs = [{ name: '图文详情' }, { name: '购买须知' }, { name: '易果直供' }]
        } else if (goods.isInBond == 1) {
            tabs = [{ name: '图文详情' }, { name: '购买须知' }, { name: '保税特色' }]
        } else if (goods.isForeignSupply == 2) {
            tabs = [{ name: '图文详情' }, { name: '购买须知' }, { name: '直邮特色' }]
        } else {
            tabs = [{ name: '图文详情' }, { name: '购买须知' }]
        }
        this.setState({
            tabs
        })
        await this.getInctroduct()
    }

    go() {
        this.ChangeTab(2)
        this.goToPage_(2)
        this._scrollView.scrollTo({ y: this.y });
        this.refs.tab_.go(2)
    }

    goToPage_(i, type) {
        this.setState({
            activeTab_: i
        })
        this.i = i
        //console.log(l, this.y)
        if (type == 1) {
            this.isNeedScrollTo = true;
            // setTimeout(() => {
            //     this._scrollView.scrollTo({ y: this.y + 100 })
            // }, 200)

            /*if (this.s > 0) {
                this._scrollView.scrollTo({ y: this.y + this.s + 100 });
            } else {
                this._scrollView.scrollTo({ y: this.y + 100 });
            }*/

        }
        //console.log(i)
    }

    ChangeTab(i) {
        /* console.log(this.refs, 1)
        this.refs.tab_.set(i.i)
        this.props.ChangeTab_(i)*/
    }

    setLay(e) {
        this.y = e.nativeEvent.layout.height
    }

    render() {
        let { area, goods, current, activity } = this.props
        const { introduct } = this.state
        if (!area) area = {}
        if (!this.props.goods.goodsName) {
            return <View style={{ flex: 1, backgroundColor: '#f3f3f3' }}></View>;
        }
        let arr1 = this.props.area.province + '-' + this.props.area.city + '-' + this.props.area.area
        let arr = this.props.area.province + this.props.area.city + this.props.area.area + this.props.area.address
        if (this.props.area.deliveryAreaStatus == 0) {
            if (arr.length > 14) {
                arr = arr.substr(0, 14) + '...'
            }
            if (arr1.length > 15) {
                arr1 = arr1.substr(0, 15) + '...'
            }
        } else {
            if (arr.length > 18) {
                arr = arr.substr(0, 18) + '...'
            }
            if (arr1.length > 18) {
                arr1 = arr1.substr(0, 18) + '...'
            }
        }
        return (
            <View style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
                {
                    !this.state.showTab && <View style={{ position: 'absolute', top: this.headerTop, zIndex: 1 }}>
                        <Tabs activeTab={this.state.activeTab_} ref="tab_" tabs={this.state.tabs} goToPage={(i) => this.goToPage_(i, 1)} />
                    </View>
                }
                <ScrollView
                    ref={(scrollView) => this._scrollView = scrollView}
                    style={{ flex: 1 }}
                    onContentSizeChange={() => {
                        if (this.isNeedScrollTo) {
                            this._scrollView.scrollTo({ y: this.y })
                            this.isNeedScrollTo = false;
                        }
                    }}
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustContentInsets={false}
                    scrollEventThrottle={500}
                    keyboardShouldPersistTaps="never"
                    alwaysBounceVertical={false}
                    onMomentumScrollEnd={e => this.scrollEnd(e)}
                    bounces={false}
                    onScroll={(e) => this._onScroll(e)}
                >
                    <GoodBasic
                        navigation={this.props.navigation}
                        goods={goods}
                        area={area}
                        current={current}
                        activity={activity}
                        setLay={this.setLay.bind(this)}
                        showPopover_={this.props.showPopover}
                        onLoadEnd={this.props.onLoadEnd.bind(this)}
                        openExplain={this.openExplain.bind(this)}
                        getArea={this.props.getArea.bind(this)}
                        getActivities={this.props.getActivities.bind(this)}
                        cartShow={this.props.cartShow.bind(this)}
                        openPromise={this.openPromise.bind(this)}
                        moreProperty={this.props.detail['more_property']}
                    />
                    {
                        this.state.showTab ?
                            <Tabs activeTab={this.state.activeTab_} ref="tab_" tabs={this.state.tabs} goToPage={(i) => this.goToPage_(i, 2)} />
                            : <View style={goodStyles.tabSubstitute}></View>
                    }
                    <View>
                        {
                            this.state.activeTab_ == 0 && <View style={{ backgroundColor: '#fff' }}>
                                <View style={goodStyles.detail}>
                                    {
                                        this.props.detail.mobile_detail.list.map((img, index) =>
                                            <TouchableWithoutFeedback key={index} onPress={() => this.openBigImg(img.image)}><Image
                                                style={{ width: px(img.width), height: px(img.height) }}
                                                source={{
                                                    uri: img.image
                                                }}
                                                onLoad={() => this.props.onLoadEnd(img.show, img.index)}
                                                resizeMode="cover"
                                                resizeMethod={Platform.OS == 'ios' ? "resize" : "auto"}
                                            >
                                            </Image></TouchableWithoutFeedback>)
                                    }
                                    {(!this.props.detail.mobile_detail.list || this.props.detail.mobile_detail.list.length == 0) &&
                                        [{ content: this.props.detail.shows, title: '产品展示' },
                                        { content: this.props.detail.specials, title: '特别之处' },
                                        { content: this.props.detail.usage, title: '使用方法' }]
                                            .filter(item => item.content != null)
                                            .map((item, index) =>
                                                <View key={index}>
                                                    <Text allowFontScaling={false} style={goodStyles.detailContentHead}>{item.title}</Text>
                                                    <Text allowFontScaling={false} style={goodStyles.detailContentTxt}>{item.content.txt}</Text>
                                                    {
                                                        item.content.list.length % 2 == 1 &&
                                                        item.content.list.slice(0, 1).map((listItem, index) =>
                                                            <TouchableWithoutFeedback key={index} onPress={() => this.openBigImg(listItem.image)}>
                                                                <Image
                                                                    source={{ uri: listItem.image }}
                                                                    onLoad={() => this.props.onLoadEnd(listItem.show, listItem.index)}
                                                                    resizeMode="cover"
                                                                    resizeMethod="resize"
                                                                    style={{
                                                                        width: px(726),
                                                                        height: px(357),
                                                                        marginLeft: px(12),
                                                                        marginBottom: px(12)
                                                                    }} />
                                                            </TouchableWithoutFeedback>
                                                        )
                                                    }
                                                    {
                                                        (item.content.list.length % 2 == 1 ?
                                                            item.content.list.slice(1) :
                                                            item.content.list).reduce((state, current, index) => {
                                                                if (index % 2 == 0) {
                                                                    state.push([current]);
                                                                } else {
                                                                    state[state.length - 1].push(current);
                                                                }
                                                                return state;
                                                            }, []).map((arr, index) =>
                                                                <View key={index + 1} style={{ flexDirection: 'row' }}>
                                                                    {
                                                                        arr.map((arrItem, index) =>
                                                                            <TouchableWithoutFeedback key={index} onPress={() => this.openBigImg(arrItem.image)}>
                                                                                <Image
                                                                                    source={{ uri: arrItem.image }}
                                                                                    onLoad={() => this.props.onLoadEnd(arrItem.show, arrItem.index)}
                                                                                    resizeMode="cover"
                                                                                    resizeMethod="resize"
                                                                                    style={{
                                                                                        width: px(357),
                                                                                        height: px(357),
                                                                                        marginLeft: px(12),
                                                                                        marginBottom: px(12)
                                                                                    }} />
                                                                            </TouchableWithoutFeedback>
                                                                        )
                                                                    }
                                                                </View>
                                                            )}
                                                </View>
                                            )
                                    }
                                </View>
                                {

                                    <View
                                        onLayout={(e) => this.recommendedY = e.nativeEvent.layout.y}
                                    >
                                        {
                                            this.props.isRecommendedLoad ?

                                                <Text style={goodStyles.loading}>加载中...</Text>
                                                : <View
                                                    style={goodStyles.recommendedBox}
                                                >
                                                    <DetailsGoodsRecommended
                                                        title="猜你喜欢"
                                                        list={this.props.link}
                                                        isSliding={true}
                                                        navigation={this.props.navigation}
                                                    ></DetailsGoodsRecommended>
                                                    <DetailsGoodsRecommended
                                                        title="大家都在买"
                                                        list={this.props.everybody}
                                                        navigation={this.props.navigation}
                                                    ></DetailsGoodsRecommended>
                                                </View>
                                        }
                                    </View>
                                }
                            </View>
                        }
                        {
                            this.state.activeTab_ == 1 && <View style={{ backgroundColor: '#fff' }}>
                                <Image
                                    resizeMode="contain"
                                    source={{ uri: this.state.cfg.images && this.state.cfg.images.purchase_notes }}
                                    style={{ width: px(750), height: px(750 * this.state.purchase_notes_height / this.state.purchase_notes_width) }} />
                                {
                                    (goods.isInBond == 1 || goods.isForeignSupply == 2) &&
                                    <Image
                                        resizeMode="contain"
                                        source={{ uri: this.state.cfg.images && this.state.cfg.images.notification }}
                                        style={{ width: px(750), height: px(750 * this.state.notification_height / this.state.notification_width) }} />
                                }
                            </View>
                        }
                        {
                            this.state.activeTab_ == 2 && goods.isInBond == 1 && <GoodBonded />
                        }
                        {
                            this.state.activeTab_ == 2 && goods.isForeignSupply == 2 && <GoodOverseas />
                        }
                        {
                            this.state.activeTab_ == 2 && goods.skuType == 'yiguo' && <View></View>
                        }
                    </View>
                    <View style={{ width: px(750), height: isIphoneX() ? px(155) : px(95) }} />
                </ScrollView>
                <GoodPromise
                    ref='goodPromise'
                    goods={goods}
                    go={this.go.bind(this)}
                >
                </GoodPromise>
                <ImgsModal ref='imgsModal' list={this.props.imgs}></ImgsModal>
                {
                    this._scrollY > 1000 && this.state.isCanUp &&
                    <TouchableOpacity activeOpacity={0.9} onPress={() => {
                        this.toTop()
                    }} style={{ position: 'absolute', right: px(20), bottom: isIphoneX() ? px(165) : px(105) }}>
                        <Image
                            style={{ width: px(100), height: px(100) }}
                            source={{ uri: pxRatio > 2.51 ? require('../../images/iconToTop3x') : require('../../images/iconToTop') }} />
                    </TouchableOpacity>
                }
                <Explain
                    ref="explain"
                    data={Object.assign(goods, { introduct: introduct, activity: activity, area: this.props.area })}
                    explain={this.state.explain}
                ></Explain>
            </View>
        )
    }

    async getInctroduct() {
        let cfg = await config();
        let size = await new Promise((resolve, reject) =>
            Image.getSize(cfg.images.purchase_notes,
                (w, h) => resolve({ width: w, height: h }),
                reject)
        );
        let size_ = await new Promise((resolve, reject) =>
            Image.getSize(cfg.images.notification,
                (w, h) => resolve({ width: w, height: h }),
                reject)
        );
        this.setState({
            notification_width: size_.width,
            notification_height: size_.height,
            purchase_notes_width: size.width,
            purchase_notes_height: size.height
        })
        this.setState({
            cfg: cfg,
            introduct: this.props.goods.bondedPayerSwitchOnYn == 'N' ? cfg.policy : cfg.policy_payer
        })
    }

    toTop() {
        this._scrollView.scrollTo({ y: 0 });
    }

    _recommended(e) {
        if (this.isRecommendedYLoad) return

        if (e.nativeEvent.contentOffset.y + this.recommendedY / 2 > this.recommendedY) {
            this.isRecommendedYLoad = true
            this.props.recommended()
        }
    }

    _onScroll(e) {
        this.headerScroll(e)
        if (e.nativeEvent.contentOffset.y > this.y - this.headerTop) {
            this.props.showTab()
            this.setState({
                showTab: false
            })
        } else {
            this.props.hideTab()
            this.setState({
                showTab: true
            })
        }
        if (this._scrollY > e.nativeEvent.contentOffset.y) { // shang
            if (!this.isRun) {
                this.setState({
                    isCanUp: true
                })
                this.isRun = true;
                return;
            }
        } else if (this._scrollY < e.nativeEvent.contentOffset.y) { // xia
            //console.log('xia')
            if (this.isRun) {
                this.setState({
                    isCanUp: false
                })
                this.isRun = false;
                return;
            }
        }
        this._scrollY = e.nativeEvent.contentOffset.y;
        this._recommended(e)
    }

    headerScroll(e) {
        this.props.scrollCallback && this.props.scrollCallback(e.nativeEvent.contentOffset.y);
    }

    scrollEnd(e) {
        // this.headerScroll(e)
        this.s = e.nativeEvent.contentOffset.y - this._scroll
        //console.log(this.s)
        this._scroll = e.nativeEvent.contentOffset.y;
    }

    openBigImg(key) {
        this.refs.imgsModal.Open(key);
    }

    openPromise() {
        this.refs.goodPromise.show()
    }

    openExplain(type, title) {
        this.refs.explain.show()
        this.setState({
            explain: {
                type: type,
                title: title
            }
        })
    }
}


const goodStyles = StyleSheet.create({
    cover: {
        width: px(750),
        height: px(750)
    },
    preheat: {
        position: 'absolute',
        bottom: px(50),
        left: 0,
        width: px(750),
        zIndex: 9,
        alignItems: 'center'
    },
    preheatBg: {
        width: px(404),
        height: px(60)
    },
    preheatTxt: {
        padding: 0,
        fontSize: px(28),
        color: '#ffffff',
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: 'transparent'
    },
    preheatNew: {
        width: px(710),
        alignItems: 'center'
    },
    preheatBgNew: {
        width: px(710),
        height: px(80),
        flexDirection: 'row'
    },
    preheatTxtNew: {
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: 'transparent'
    },
    preheatTimeNew: {
        // width: px(36),
        // height: px(36),
        overflow: 'hidden'
    },
    detail: {
        backgroundColor: '#fff'
    },
    detailContentHead: {
        paddingLeft: px(30),
        paddingRight: px(12),
        paddingTop: px(45),
        paddingBottom: px(30),
        fontSize: px(36),
        color: '#333333'
    },
    detailContentTxt: {
        lineHeight: px(44),
        paddingHorizontal: px(30),
        marginBottom: px(24),
        fontSize: px(28),
        color: '#666',
        textAlign: 'justify'
    },
    suningTime: {
        width: px(40),
        height: px(30),
        backgroundColor: '#fcf9eb',
        borderRadius: px(3),
        overflow: 'hidden'
    },
    preSaleBg: {
        width: px(710),
        height: px(80)
    },
    preSale: {
        width: px(710),
        height: px(80),
        paddingHorizontal: px(30)
    },
    preTitle: {
        fontSize: px(30),
        color: '#fff',
        fontWeight: '900'
    },
    preExplain: {
        fontSize: px(26),
        color: '#fff',
        fontWeight: '900',
        textAlignVertical: "center"
    },
    preExplain1: {
        fontSize: px(30)
    },
    tabSubstitute: {
        height: px(97),
        backgroundColor: '#fff'
    },
    recommendedBox: {
        backgroundColor: '#f2f2f2'
    },
    loading: {
        textAlign: 'center',
        fontSize: px(28),
        paddingVertical: px(20),
        color: "#ccc"
    }
});

const preStyles = StyleSheet.create({
    sale_hot: {
        flex: 1,
        paddingHorizontal: px(30)
    },
    box: {
        height: px(96),
        paddingVertical: px(16),
        justifyContent: 'space-between'
    },
    leftTxt1: {
        includeFontPadding: false,
        fontSize: px(28),
        fontWeight: '900'
    },
    leftTxt2: {
        includeFontPadding: false,
        fontSize: px(24)
    },
    colorFFF: {
        color: '#fff'
    }
});