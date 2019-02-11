'use strict';

import React from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, View, Animated, TouchableWithoutFeedback } from 'react-native';
import GoodItem from "./GoodItem";
import ShopShare from "./ShopShare";
import ShopBanner from "./ShopBanner";
import { Module } from './ShopPage_floor';
import { User } from "../../services/Api";
import CartList from '../../services/Cart';
import request from '../../services/Request';
import { TrackClick } from '../../services/Track';
import { DialogModal } from '../common/ModalView';
import { show as toast } from '../../widgets/Toast';
import { deviceWidth, isIphoneX, px, deviceHeight } from "../../utils/Ratio";
import { log } from "../../utils/logs"
import Icon from '../../UI/lib/Icon'
import base from "../../styles/Base";

/**
 * 首页的频道列表组件
 */
export default class extends React.Component {
    openShare = (goods, tab, type) => {
        this.refs['shareGoods'].share(goods, tab, type);
    }
    constructor(props) {
        super(props)
        this.state = {
            part: 0,
            list: [],
            loadText: "加载中...",
            refreshing: false,
            isLogin: User.isLogin,
        };
        this.isEnd = false;
        this.layout = [];
    }

    hasBanner = false;
    hasModule = false;
    scroll_y = 0;

    render() {
        if (this.props.id === undefined) return <View style={{ flex: 1 }}></View>;
        return <View style={{ flex: 1 }}>
            <View
                style={{ width: deviceWidth, height: Platform.OS === "ios" ? isIphoneX() ? 132 : px(196) + 10 : px(170) + 10 }}></View>
            <FlatList ref="flatlist"
                style={{ width: deviceWidth, backgroundColor: "#f2f2f2", height: deviceHeight }}
                refreshing={this.state.refreshing}
                numColumns={1}
                onRefresh={() => this.refresh()}
                onEndReached={() => this.loadNext()}
                onEndReachedThreshold={0.1}
                renderItem={({ item, index }) => {
                    if (item.type === 'banner') {
                        return <ShopBanner ref='banner' id={this.props.id} tab={this.props.id}
                            item={item}
                            tabName={this.props.name}
                            refresh={this.state.refreshing}
                            navigation={this.props.navigation}
                            onChangeF={this.props.onChangeF} />
                    }
                    if (item.type === 'module') {
                        return <Module item={item} index={item.key}
                            ref={"item_" + index}
                            show={item.show}
                            onLayout={e => this.onLayout(e, index)}
                            navigation={this.props.navigation}
                            onChangeF={this.props.onChangeF}
                            goOtherPage={this.goOtherPage.bind(this)} />
                    }
                    if (this.props.id !== "dev" && item.type === 'title') {
                        return <View style={{
                            height: 50,
                            backgroundColor: '#f2f2f2',
                            paddingLeft: px(20)
                        }}>
                            <Image
                                style={{ height: 50, width: 140 }}
                                source={{ uri: require('../../images/index_goodTitle') }}
                            />
                        </View>
                    }
                    if (item.type === 'product') {
                        return <GoodItem
                            ref={"item_" + index}
                            show={item.show}
                            tab={this.props.id}
                            shareEvent={this.openShare.bind(this)}
                            item={item}
                            onLayout={e => this.onLayout(e, index)}
                            navigation={this.props.navigation}
                            addCart={(id, num, key, type) => this.addCart(id, num, key, type)}
                        />
                    }
                }}
                ListFooterComponent={this._footer.bind(this)}
                onScroll={(e) => this._onScroll(e.nativeEvent)}
                scrollEventThrottle={100}
                keyExtractor={(goods) => goods.index}
                data={this.state.list}
                extraData={this.state}
                initialNumToRender={2} />
            <ShopShare ref="shareGoods" navigation={this.props.navigation} />
            <DialogModal ref="dialog" />
        </View>
    }
    componentDidMount() {
        if (this.props.show) this.loadBanner();
    }

    _footer() {
        return <View>
            <View style={{ width: deviceWidth, height: px(20) }}></View>
            <Text style={styles.loading}>{this.state.loadText}</Text>
        </View>
    }

    userUpdate() {
        this.shouldUpdate = true;
    }
    onLayout(e, index) {
        this.layout[index].h = e.layout.height
    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (this.state.refreshing) return true;
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    componentWillReceiveProps(pp) {
        if (!this.props.show && pp.show) {
            this.loadBanner();
        }
    }
    step = 0;
    start = 0;
    loading = false;
    totalPages = 2;
    layout = [];
    hasTitle = false;
    moduleL = 0; //楼层的长度，为了计算时间轴滚动高度
    //请求banner
    //请求楼层
    //请求时间轴
    //请求商品
    async loadBanner() {
        if (this.loading) return;
        this.loading = true;
        try {
            let id = this.props.id;
            if (id === "dev") id = "";
            let res = await request.get(`/banner/findBannerAndQuickList.do`, {
                categoryId: id
            });
            res.type = "banner";
            res.index = "banner";
            res.tt = Date.now();
            let h = 0;
            if (res.bannerList.length > 0) {
                h = px(400);
            }
            if (res.quickList.length > 0) {
                h += px(176)
            }
            this.layout[0] = { h };
            this.shouldUpdate = true;
            this.setState({ list: [res] });
        } catch (e) {
            // toast(e.message);
        } finally {
            this.loading = false
            this.step = 1;
            this.loadNext();
        }
    }
    //加载下一页
    async loadNext() {
        if (this.step === 1) this.getModules();
        // if (this.step === 2) this.getTimeAxis();
        if (this.step === 3) this.getNextProducts();
    }
    //获取楼层
    async getModules() {
        if (this.loading) return;
        this.loading = true;
        let list = [];
        try {
            let id = this.props.id;
            if (id === "dev") id = "";
            let moduleList = await request.get(`/module/findModuleListV2.do?categoryId=${id}`);
            if (moduleList.constructor === Array) {
                moduleList.forEach((item, key) => {
                    item.type = 'module';
                    item.index = 'module_' + item.moduleId;
                    item.key = key;
                    list.push(item);
                    this.layout.push({ h: 0 });
                })
                this.moduleL = moduleList.length || 0
                if (moduleList.length > 0) this.hasTitle = true;
            }
        } catch (e) {
            // log(e.message);
        } finally {
            this.step = 3;
            this.loading = false;
            this.shouldUpdate = true;
            this.setState({ list: this.state.list.concat(list) });
            this.loadNext();
        }
    }

    productSH = px(654)
    productBH = px(695)
    //加载商品
    async getNextProducts() {
        if (this.start >= this.totalPages) return;
        if (this.loading) return;
        this.loading = true;
        try {
            let res = {
                totalPages: 0,
                items: []
            };
            let id = this.props.id;
            if (id === "dev") id = "";
            console.log('参数', `/goods/list.do?limit=20&start=${this.start}&categoryId=${id}`)
            res = await request.get(`/goods/list.do?limit=20&start=${this.start}&categoryId=${id}`);
            //console.log(res)
            this.shouldUpdate = true;
            this.totalPages = res.totalPages;
            let list = [];
            for (let index = 0, j = res.items.length; index < j; index++) {
                const item = res.items[index];
                if (!item) continue;
                let temp = {
                    type: "product",
                    index: "product_" + item.sku + this.start,
                    key: index
                };
                temp.data = item;
                let h = this.productSH;
                /*if ((index + 1) % 5 !== 0) {
                    temp.data2 = Object.assign({}, res.items[index + 1]);
                    h = this.productBH;
                    res.items[index + 1] = null;
                }*/
                this.layout.push({ h });
                list.push(temp);
            }
            this.shouldUpdate = true;
            this.setState({ list: this.state.list.concat(list) });
            if (res.items.length < 20) this.totalPages = 1;
        } catch (e) {
            // toast(e.message);
        } finally {
            if (this.start == 0) {
                setTimeout(() => {
                    this.setShopPositionY()
                }, 10)
            }
            this.start++;
            this.loading = false;
            if (this.start >= this.totalPages) {
                this.shouldUpdate = true;
                this.setState({ loadText: "别扯啦,到底了..." })
            }
            if (this.start < 2) {
                this.showImage(0);
            }
        }
    }
    timer = null;
    showImage(index) {
        if (this.timer) return;
        this.timer = setTimeout(() => {
            // console.log("延迟显示:当前第" + index + "行");
            let list = this.state.list.filter((item, i) => {
                item.show = i >= index - 2 && i < index + 5;
                return item;
            })
            this.shouldComponentUpdate = true;
            this.setState({ list })
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 200);
    }
    // 图片懒加载
    lazyShow(y) {
        let index = 0;
        let curr = 0;
        while (y > curr) {
            if (!this.layout[index]) break;
            curr += this.layout[index].h;
            index++;
        }
        this.showImage(index);
    }

    /**
     * 滚动的时候传值
     * @param {*} e
     */
    _onScroll(e) {
        // console.log(e.contentOffset.y, e.contentSize)
        // console.log(e.contentOffset.y, this.layout)
        const y = e.contentOffset.y;

        if (this.props.id !== "dev") { // 暂时去掉懒加载
            this.lazyShow(y)
        }

        if (e.contentOffset.y < -10) this.shouldUpdate = true; // 下拉刷新

        this.props.onScrollOther(y, this.productTop)
    }

    // 精选好货距离屏幕高度
    productTop = 0
    setShopPositionY() {
        let cur = 0;
        for (let i = 0; i < this.state.list.length; i++) {
            const tmp = this.state.list[i];
            if (tmp.type === "title") {
                this.productTop = cur
                break;
            } else {
                cur += this.layout[i].h;
            }
        }
    }

    scrollToTop(offset) {
        setTimeout(() => {
            this.refs.flatlist.scrollToOffset({
                offset,
            });
        }, 100);
    }
    //刷新
    refresh() {
        this.step = 0;
        this.start = 0;
        this.loading = false;
        this.totalPages = 2;
        this.setState({ list: [], loadText: "加载中..." });
        this.loadBanner();
        // this.props.loadlist && this.props.loadlist();
    }
    /**
     * 重载界面
     */
    reload() {
        this.step = 0;
        this.start = 0;
        this.loading = false;
        this.totalPages = 2;
        if (this.state.list.length > 0) {
            this.setState({ list: [], loadText: "加载中..." });
            this.loadBanner();
        }
    }

    trackAddCart(i, type) { // 20180409时间轴商品加埋点
        if (type == 'shop') {
            let index = i + 1;
            if (this.props.id == "dev") {
                TrackClick('Home-SKUlist', `Home-SKUlistAddcart-${index}`, '首页', `加入购物车-${index}`);
            } else {
                TrackClick('Channel-SKUlist', `Channel-SKUlistAddcart-${index}`, '频道页', `加入购物车-${index}`);
            }
        } else {
            let sku = type.split('/')[0],
                time = type.split('/')[1]
            TrackClick('Home-TimeAxis', `Addcar-${sku}`, '首页', `加入购物车-${time}-${sku}`);
        }
    }


    async addCart(id, num, key, type) {
        if (User.isLogin) {
            this.trackAddCart(key, type);
            try {
                await CartList.addCartNum(id, num);
                toast('加入购物车成功');
            } catch (e) {
                if (e.data.oos !== 'oos') {
                    toast(e.message);
                } else {
                    this.refs.dialog.open({
                        content: [e.data.error_detail],
                        btns: [
                            { txt: "我知道了" },
                            {
                                txt: "去购物车", click: () => this.props.navigation.navigate('ShoppingCartPage')
                            }
                        ]
                    })
                }
            }
        } else {
            this.goLoginPage();
        }
    }

    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {});
    }

    /**
     * banner floor 跳转其他页面
     * @param {*} e
     * @param k 图片下标号
     * @param j 楼层编码
     * @param i 楼层下标
     */
    goOtherPage(item, k, j, i, moduleName) {
        this.trackModuleHandle(item, k, i, j, moduleName)
        if (item.urlType == "sku" && item.prodId) {
            this.props.navigation.navigate('DetailPage', {
                id: item.prodId
            });
        }
        if (item.urlType == "url" && item.urlTypeValue) {
            if (item.urlTypeValue.indexOf(".jpg") > 0) {
                this.props.navigation.navigate('LookImagePage', {
                    'title': "",
                    'img': item.urlTypeValue,
                    'shareImg': item.urlTypeValue
                });
            } else {
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: item.urlTypeValue,
                    img: item.imageUrl
                });
            }
        }
        if (item.urlType == "h5") {
            this.props.navigation.navigate('HtmlViewPage', {
                webPath: item.urlTypeValue,
                img: item.imageUrl
            });
        }
        if (item.urlType == "category") { //需要确定后台传的是id还是name
            this.props.onChangeF(item.urlTypeValue)
        }
    }
    trackModuleHandle(item, k, i, j, moduleName) {
        if (item.urlType == 'category') return
        let location = '', name = '', from = '', kk = k + 1, ii = i + 1, jj = j + 1, content = '', channel = this.props.name;
        if (this.props.id == "dev") {
            location = 'Homepage';
            name = `HomepageFloor${ii}-${jj}-${kk}`;
            from = '首页'
        } else {
            location = 'Channelpage';
            name = `Floor${ii}-${jj}-${kk}`;
            from = '频道页'
        }
        if (item.urlType == 'sku') {
            content = `${channel}-${moduleName}-图片-${kk}`
        } else {
            content = `${channel}-${moduleName}-${item.title}`
        }
        TrackClick(location, name, from, content)
    }
}

const styles = StyleSheet.create({
    nextWrap: {
        flexDirection: 'row',
        marginTop: px(20),
        marginBottom: px(50),
        width: px(480),
        height: px(60),
        borderWidth: px(1),
        borderColor: '#d0648f',
        borderRadius: px(30),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(208,100,143, 0.05)',
    },
    next: {
        fontSize: px(24),
        color: '#222',
        marginRight: px(10)
    },
    loading: {
        marginVertical: 5,
        textAlign: 'center',
        fontSize: px(28),
        color: "#ccc"
    },
    timeLine: {
        borderBottomColor: '#d2d2d2',
        borderBottomWidth: px(1),
        width: px(293)
    },
    timeBorder: {
        marginTop: px(-2),
        width: px(710),
        marginHorizontal: px(20),
        marginBottom: px(20)
    }

});
