'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ImageBackground,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native';

import { px } from '../../utils/Ratio';
import Tab from './TimeAxisTab'
import { User } from '../../services/Api';
import request, { baseUrl, touchBaseUrl } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import util_cools from '../../utils/tools';
import base from '../../styles/Base'
import TabView from 'react-native-scrollable-tab-view2'
import Icon from '../../UI/lib/Icon'
import Background from '../../UI/lib/Background'
import { log } from "../../utils/logs"

const deviceWidth = Dimensions.get('window').width;
import { TrackClick, TrackPage } from '../../services/Track';

exports.TimeAxis = class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.axisList_ = [];
    }

    render() {
        const { activeTabAxis } = this.props;
        let h = 0
        if (this.axisList_[activeTabAxis] && this.axisList_[activeTabAxis].dateType == 1) {
            h = this.axisList_[activeTabAxis].len1 * px(358) + this.axisList_[activeTabAxis].len2 * px(527) + this.axisList_[activeTabAxis].len * px(70) + px(10)
        } else if (this.axisList_[activeTabAxis] && !this.axisList_[activeTabAxis].type) {
            h = this.axisList_[activeTabAxis].len1 * px(358) + this.axisList_[activeTabAxis].len2 * px(527) + px(10)
        } else {
            h = px(1000)
        }

        if (!this.props.tabsTxis || this.props.tabsTxis.length == 0) return null;
        return <View style={{ backgroundColor: '#fff' }} onLayout={e => this.onLayout(e.nativeEvent)}>
            <Tab ref="test" tabs={this.props.tabsTxis} goToPage={(e) => this.goToPage(e)} />
            <View style={[styles.border, base.inline_between]}>
                <View style={{
                    borderBottomColor: '#d2d2d2',
                    borderBottomWidth: px(1),
                    width: px(293)
                }}></View>
                <View style={{
                    borderBottomColor: '#d2d2d2',
                    borderBottomWidth: px(1),
                    width: px(293)
                }}></View>
            </View>
            <View style={{ height: h }}>
                <TabView page={this.props.activeTabAxis}
                    initialPage={this.props.currentTab}
                    locked
                    onChangeTab={(i) => this.ChangeTab(i)}
                    renderTabBar={false}>
                    {
                        this.props.tabsTxis.map((i, index) =>
                            <View key={index}>
                                {/*<Text>{index}</Text>*/}
                                <AxisTab
                                    navigation={this.props.navigation}
                                    tabs={i}
                                    order={index}
                                    defaultData={this.props.defaultData}
                                    all={this.all.bind(this)}
                                    onLayoutTom={this.props.onLayoutTom.bind(this)}
                                    shareEvent={this.props.shareEvent.bind(this)}
                                    addCart={(id, num, key, type) => this.props.addCart(id, num, key, type)}
                                />
                            </View>
                        )
                    }
                </TabView>
            </View>
        </View>
    }

    ChangeTab(i) {
        this.props.ChangeTabAxis(i)
        this.refs.test && this.refs.test.set(i.i)
    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    goToPage(i) {
        this.shouldUpdate = true;
        this.props.goToPageAxis(i)
    }

    onLayout(e) {
        this.props.onLayout && this.props.onLayout(e);
    }

    componentDidMount() {
        this.refs.test && this.refs.test.set(this.props.currentTab)
    }
    componentWillReceiveProps(pp) {
        if (pp.activeTabAxis !== this.props.activeTabAxis) {
            this.shouldUpdate = true;
        }
    }

    all(order, list) {
        this.axisList_[order] = list;
        this.shouldUpdate = true;
    }

}

const styles = StyleSheet.create({
    border: {
        marginTop: px(-2),
        width: px(710),
        marginHorizontal: px(20),
        marginBottom: px(20)
    }
})
class GoodItem extends React.Component {

    renderGood(item) {
        if (!item) return null;
        return <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this.getDetail(item)}>
            <Background resizeMode="cover" style={goodOtherStyles.goodBg} name="icon-timegood-bg">
                <View style={goodOtherStyles.bGood}>
                    <Image
                        //onLoad={() => this.props.onLoadImage(this.props.index)}
                        resizeMethod="scale"
                        source={{ uri: this.props.tabShow ? item.image : require('../../images/img2') }}
                        style={goodOtherStyles.goodsCoverBig} />
                    {
                        item.limitStock === 0 &&
                        <Icon name="soldout"
                            style={goodOtherStyles.goods_img_coverBig} />
                    }
                    <View style={[goodOtherStyles.bottom]}>
                        <View style={{ paddingLeft: px(20), width: User.isLogin ? px(527) : px(567) }}>
                            <View style={[{ width: User.isLogin ? px(527) : px(567) }, base.inline_between]}>
                                {
                                    item.isInBond == 1 &&
                                    <Icon name="bond"
                                        style={goodOtherStyles.bond} />
                                }
                                {
                                    item.isForeignSupply == 2 &&
                                    <Icon name="isForeignSupply"
                                        style={goodOtherStyles.bond} />
                                }
                                <Text style={goodOtherStyles.goodsShowDesc} allowFontScaling={false}
                                    numberOfLines={1}>
                                    {item.goodsShowDesc}
                                </Text>
                            </View>
                            <View style={[base.inline_left]}>
                                <Text allowFontScaling={false}
                                    style={goodOtherStyles.salePrice}>
                                    ￥
                                    <Text allowFontScaling={false} style={goodOtherStyles.salePrice_}>
                                        {util_cools.parsePrice(item.salePrice)}
                                    </Text>
                                </Text>
                                {
                                    User.isLogin && !User.vip && <Text allowFontScaling={false}
                                        style={{
                                            fontSize: px(24),
                                            color: '#898989',
                                            marginHorizontal: px(10)
                                        }}>
                                        /
                                    </Text>
                                }
                                {
                                    User.isLogin && !User.vip && <Text allowFontScaling={false}
                                        style={goodOtherStyles.benefitMoney}>
                                        赚￥{util_cools.parsePrice(item.benefitMoney)}
                                    </Text>
                                }
                            </View>
                        </View>
                        <View style={[base.inline, { justifyContent: 'flex-end', flex: 1 }]}>
                            {
                                User.isLogin && !User.vip && <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.sharePage(item)}>
                                    <View style={goodOtherStyles.cartC}>
                                        <Icon name="icon-index-shareNew"
                                            style={goodOtherStyles.cartShare} />
                                    </View>
                                </TouchableOpacity>
                            }
                            {
                                User.isLogin && !User.vip && <Icon name="icon-index-line"
                                    style={{ width: px(2), height: px(24) }} />
                            }
                            <TouchableWithoutFeedback
                                onPress={() => this.props.addCart(item.id, 1, item.key, item.sku + '/' + this.props.timelineRound)}>
                                <View style={goodOtherStyles.cartC}>
                                    <Icon name="icon-index-cartNew"
                                        style={goodOtherStyles.cartShare} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </Background>
        </TouchableOpacity>
    }

    renderOther(item) {
        if (!item) return null;
        return <View style={goodModuleStyles.module}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => this.goHtml(item)}>
                <Image resizeMode="cover" resizeMethod="scale"
                    style={[goodModuleStyles.moduleImage]}
                    source={{ uri: this.props.tabShow ? item.coverUrl : require('../../images/img2') }}
                //onLoad={() => this.props.onLoadImage(this.props.index)}
                >
                </Image>
            </TouchableOpacity>
            {
                item.item && item.item.length > 0 && <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    style={{
                        flex: 1,
                        paddingLeft: px(20),
                        backgroundColor: '#fff',
                        marginTop: px(16),
                        marginBottom: px(31)
                    }}
                //pagingEnabled={true}

                >
                    {
                        (item.item || []).map((k_item, i) =>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                key={i}
                                onPress={() => this.getDetail(k_item)}>
                                <View style={[{
                                    width: px(200),
                                    height: px(240),
                                    marginRight: px(16),
                                    justifyContent: 'space-between'
                                }]}>
                                    <Image resizeMode="cover" resizeMethod="scale"
                                        style={[{ width: px(200), height: px(200) }, base.borderRadius10]}
                                        source={{ uri: this.props.tabShow ? k_item.image : require('../../images/img2') }}
                                    //onLoad={() => this.props.onLoadImage(this.props.index)}
                                    >
                                    </Image>
                                    <View style={[goodModuleStyles.price, base.inline]}>
                                        <Text style={[{ fontSize: px(22), color: '#000' }]} allowFontScaling={false}>
                                            ￥{util_cools.parsePrice(k_item.salePrice)}
                                        </Text>
                                        {
                                            User.isLogin && !User.vip && <View style={{ flexDirection: 'row' }}>
                                                {/*<Text style={goodModuleStyles.priceTxt} allowFontScaling={false}>
                                                     /
                                                </Text>*/}
                                                <Text style={[{ fontSize: px(22) }, base.color, { marginLeft: px(10) }]}
                                                    allowFontScaling={false}>
                                                    <Text style={goodModuleStyles.priceTxt} allowFontScaling={false}>
                                                        /
                                                    </Text> 赚￥{util_cools.parsePrice(k_item.benefitMoney)}
                                                </Text>
                                            </View>
                                        }
                                        {/*{
                                            User.isLogin && <Text style={goodModuleStyles.priceTxt} allowFontScaling={false}>
                                                赚￥
                                            </Text>
                                        }
                                        {
                                            User.isLogin && <Text style={[{fontSize: px(22)}, base.color]} allowFontScaling={false}>
                                                赚￥{util_cools.parsePrice(k_item.benefitMoney)}
                                            </Text>
                                        }*/}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )

                    }
                    {
                        item.item.length > 3 && <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => this.goHtml(item)}>
                            <View style={[{
                                width: px(200)
                            }]}>
                                <Image resizeMode="cover" resizeMethod="scale"
                                    style={[{ width: px(200), height: px(200) }, base.borderRadius10]}
                                    source={{ uri: 'http://img.daling.com/st/dalingjia/more.png' }}
                                //onLoad={() => this.props.onLoadImage(this.props.index)}
                                >
                                </Image>
                            </View>
                        </TouchableOpacity>
                    }
                </ScrollView>
            }
        </View>
    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    render() {
        //console.log('render item--------');
        const { axis } = this.props;
        if (!axis) return null;
        return <View style={goodOtherStyles.goodsBox2}>
            {this.props.type == 1 && this.renderGood(axis)}
            {this.props.type == 2 && this.renderOther(axis)}
        </View>
    }

    getDetail(goods) {  //跳转商品详情
        TrackClick('Home-TimeAxisSKUlist', `Click-${goods.sku}`, '首页', `${this.props.timelineRound}-${goods.sku}`);
        this.props.navigation.navigate('DetailPage', {
            sku: goods.sku
        });
    }

    goHtml(goods) {  //跳转专题
        let url = goods.topicUrl, topicId = '活动主题'
        if (url && url.indexOf('/subject/') > -1) {
            topicId = url.split('/subject/')[1]
        }
        TrackClick('Home-TimeAxis', `Cam-${this.props.timelineRound}`, '首页', `${this.props.timelineRound}-${topicId}`);
        this.props.navigation.navigate('HtmlViewPage', {
            webPath: goods.topicUrl,
            img: goods.coverUrl
        });
    }

    sharePage(goods) {
        this.props.shareEvent && this.props.shareEvent(goods, '', this.props.timelineRound);
    }

}

class AxisTab extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            list: []
        }
        this.page = 0;
        this.loading = false;
    }

    render() {
        //console.log('render tabs ---------');
        return <View>
            {
                (this.state.list || []).map((item, index) =>
                    <View key={index}
                        onLayout={e => this.props.tabs && this.props.tabs.timelineRound == '明日预告' && this.props.onLayoutTom(e.nativeEvent, index)}>
                        {
                            this.props.tabs && this.props.tabs.timelineRound == '明日预告' &&
                            <View style={[base.inline_left, goodOtherStyles.timeBox]}>
                                <View style={[goodOtherStyles.timeTitle, base.backgroundColor]}></View>
                                <Text style={goodOtherStyles.timeTxt}>{item.timelineRound}开抢</Text>
                            </View>
                        }
                        {
                            item.timelineGroup.map((axis, i) =>
                                <View key={i}>
                                    {
                                        axis.type == 1 && axis.item.map((k_axis, k) => {
                                            return <GoodItem
                                                navigation={this.props.navigation}
                                                axis={k_axis}
                                                key={k}
                                                index={k}
                                                timelineRound={this.props.tabs.timelineRound}
                                                onLoadImage={this.onLoadImage.bind(this)}
                                                tabShow={this.props.tabs.tabShow}
                                                type={axis.type}
                                                shareEvent={this.props.shareEvent.bind(this)}
                                                addCart={(id, num, key, type) => this.props.addCart(id, num, key, type)}
                                            />
                                        })
                                    }
                                    {
                                        axis.type == 2 && <GoodItem
                                            navigation={this.props.navigation}
                                            axis={axis}
                                            key={i}
                                            index={i}
                                            timelineRound={this.props.tabs.timelineRound}
                                            onLoadImage={this.onLoadImage.bind(this)}
                                            tabShow={this.props.tabs.tabShow}
                                            type={axis.type}
                                            shareEvent={this.props.shareEvent.bind(this)}
                                            addCart={(id, num, key, type) => this.props.addCart(id, num, key, type)}
                                        />
                                    }
                                </View>
                            )
                        }
                    </View>
                )
            }
        </View>
    }
    /*shouldUpdate = true;
    shouldComponentUpdate() {
        
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }*/

    onLoadImage(index) {
        //加载下一个
        const list = this.state.list
        if (!list[index + 1]) return;
        try {
            list[index + 1] = true
            this.setState({ list })
        } catch (e) {
            //log(e.message);
        }
    }

    componentDidMount() {
        this.getData()
    }

    async getData() {
        if (this.loading) return;
        this.loading = true;
        if (this.props.tabs && this.props.tabs.timelineRound == '昨日精选') {
            this.page = this.props.tabs.id.join('&ids=')
        } else if (this.props.tabs && this.props.tabs.timelineRound == '明日预告') {
            this.page = this.props.tabs.id.join('&ids=')
        } else if (this.props.tabs && !this.props.tabs.day) {
            this.page = this.props.tabs.id
        }

        let defaultData = this.props.defaultData, res
        try {
            if (defaultData.currentId == this.props.tabs.id) { // 默认场次跟当前的id一致
                res = defaultData
            } else {
                res = await request.get(`/timeline/list-v2.do?ids=${this.page}`);
            }
            let timeline = res.timeline, len = res.timeline.length, len1 = 0, len2 = 0
            timeline.forEach((item, i) => {
                item.timelineGroup.forEach((k_item, k) => {
                    if (k_item.type == 1) {
                        len1 += k_item.item.length
                    } else if (k_item.type == 2) {
                        len2++
                    }
                })
            })
            let timeAxisObj = {
                len: len,
                len1: len1,
                len2: len2,
                arr: timeline,
                dateType: this.props.tabs && this.props.tabs.timelineRound == '明日预告' ? 1 : 0
            }
            this.props.all(this.props.order, timeAxisObj)
            this.setState({
                list: res.timeline
            })
        } catch (e) {
            // toast(e.message);
        } finally {
            this.loading = false;
        }
    }

}

const goodOtherStyles = StyleSheet.create({
    goodsBox2: {
        width: deviceWidth,
        //height: px(525),
        overflow: 'hidden'
    },
    goodBg: {
        width: deviceWidth,
        height: px(358),
        overflow: 'hidden',
        borderRadius: px(12),
    },
    bGood: {
        width: px(710),
        overflow: 'hidden',
        borderRadius: px(12),
        //backgroundColor: '#ff0',
        height: px(338),
        marginHorizontal: px(20)
    },
    goodsCoverBig: {
        width: px(710),
        height: px(240),
        //borderTopLeftRadius: px(12),
        //overflow: 'hidden',
        //borderRadius: px(12)
    },
    goods_img_coverBig: {
        position: 'absolute',
        left: px(275),
        top: px(40),
        zIndex: 1,
        width: px(160),
        height: px(160),
        borderRadius: px(80),
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    goods_img_txt: {
        fontSize: px(36),
        color: '#fff'
    },
    bottom: {
        paddingRight: px(4),
        marginTop: px(15), //设计稿18兼容字体本身高度
        flexDirection: 'row',
        //backgroundColor:'#ff0',
        alignItems: 'center',
        width: px(710)
    },
    bond: {
        width: px(44),
        height: px(24),
        marginRight: px(10)
    },
    goodsShowDesc: {
        fontSize: px(26),
        color: '#000',
        flex: 1,
        //backgroundColor: '#ff0',
        includeFontPadding: false,
    },
    salePrice: {
        fontSize: px(24),
        color: "#000",
        includeFontPadding: false,
    },
    salePrice_: {
        fontSize: px(30),
        includeFontPadding: false,
    },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(24),
        includeFontPadding: false,
    },
    cartC: {
        width: px(86),
        height: px(52),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cartShare: {
        width: px(42),
        height: px(42)
    },
    timeBox: {
        width: px(750),
        paddingHorizontal: px(20),
        height: px(70)
    },
    timeTitle: {
        width: px(4),
        height: px(20),
        marginRight: px(10)
    },
    timeTxt: {
        fontSize: px(26),
        color: '#252426'
    }
});
const goodModuleStyles = StyleSheet.create({
    module: {
        width: deviceWidth,
        backgroundColor: '#fff',
        height: px(527)
    },
    moduleImage: {
        width: px(710),
        height: px(240),
        marginHorizontal: px(20),
        //marginBottom: px(16),
        borderRadius: px(12),
        overflow: 'hidden'
    },
    price: {
        width: px(200),
        //marginTop: px(16)
    },
    priceTxt: {
        color: '#d2d2d2',
        fontSize: px(24),
        marginHorizontal: px(10)
    },
    salePrice: {}

})
