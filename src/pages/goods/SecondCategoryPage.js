import React, { PureComponent, Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    FlatList,
    Image,
    Platform,
    PixelRatio,
    Animated,
    Dimensions
} from 'react-native';
import { TopHeader } from '../common/Header'
import ImageJSFile from "../common/ImageJSFile";
import { show as toast } from '../../widgets/Toast';
import { deviceHeight, deviceWidth, isIphoneX, px } from "../../utils/Ratio";
import { baseUrl, get, touchBaseUrl } from '../../services/Request';
import { User } from '../../services/Api';
import { ImagesRes } from "../../utils/ContentProvider";
import Background from '../../UI/lib/Background'
import { setSpText } from "../../utils/AdaptationSize";
import util_cools from "../../utils/tools";
import { TrackClick } from "../../services/Track";
import ShareView, { SHARETYPE } from '../common/ShareView'
import CartList from "../../services/Cart";
import { LoadingRequest } from '../../widgets/Loading';
import Loading from "../../animation/Loading"
import { DialogModal } from '../common/ModalView';
import Icon from '../../UI/lib/Icon';
import TabView from 'react-native-scrollable-tab-view2'
import base from "../../styles/Base"
import { GoodItem2 } from "../shop/GoodItem"
import request from "../../services/Request";
import ShareGoods from "../../share/goods"

const sortTermLogin = [
    { sortKey: 'default', name: '默认', sortType: 'desc' },
    { sortKey: 'sales', name: '销量', sortType: 'desc' },
    { sortKey: 'shelfOnTime', name: '新品', sortType: 'desc' },
    { sortKey: 'benefitMoney', name: '高佣', sortType: 'desc' },
    { sortKey: 'salesPrice_asc', name: '价格从低到高', sortType: 'asc' },
    { sortKey: 'salesPrice_desc', name: '价格从高到低', sortType: 'desc' }
];

const sortTerm = [
    { sortKey: 'default', name: '默认', sortType: 'desc' },
    { sortKey: 'sales', name: '销量', sortType: 'desc' },
    { sortKey: 'shelfOnTime', name: '新品', sortType: 'desc' },
    { sortKey: 'salesPrice_asc', name: '价格从低到高', sortType: 'asc' },
    { sortKey: 'salesPrice_desc', name: '价格从高到低', sortType: 'desc' },

];

class TabBar extends Component {

    static defaultProps = {
        data: [],
        index: -1,
        onChange: () => { },
        onOpen: () => { }
    }
    constructor(props) {
        super(props);
        this.state = {
            index: -1,
        }
        this.scroll = null;
        this.laout_list = []
        this.scrollW = 0;
    }
    render() {
        return <View style={[base.inline, tabBarStyle.tab]}>
            <ScrollView ref={e => this.scroll = e}
                horizontal directionalLockEnabled
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center">
                {this.props.data.map((item, index) =>
                    <TouchableOpacity onPress={() => this.setIndex(index, item.name)} onLayout={e => this.setLaout(e.nativeEvent.layout, index)} key={item.id} style={tabBarStyle.itemBtn}>
                        <Text style={[tabBarStyle.item, this.state.index === index ? tabBarStyle.active : null]} > {item.name}</Text>
                        <View style={[tabBarStyle.line, this.state.index === index ? tabBarStyle.active2 : null]}></View>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <TouchableOpacity activeOpacity={0.9} style={{ marginTop: -2 }}
                onPress={() => this.props.onOpen()}>
                <ImageJSFile
                    imageStyle={tabBarStyle.sortimg}
                    imageJsFile2x={ImagesRes.icon_sort2x}
                    imageJsFile3x={ImagesRes.icon_sort3x}
                />
            </TouchableOpacity>
        </View>
    }
    scroll = null;
    laout_list = []
    scrollW = 0;

    componentDidMount() {
    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    componentWillReceiveProps(pp) {
        if (pp.index != this.props.index) {
            this.shouldUpdate = true
            let index = pp.index
            setTimeout(() => {
                this.setIndex(index, '', false);
            }, 200)
        }
    }
    setLaout(layout, index) {
        this.laout_list[index] = layout;
        this.scrollW += layout.width;
    }

    setIndex(index, name, bl = true) {
        if (name != '') {
            TrackClick('Classify', `ClassifySecondCategory-${index + 1}`, '二级分类页面', `${name}`);
        }
        this.shouldUpdate = true;
        this.setState({ index })
        if (!this.scroll) return;
        let layout = this.laout_list[index];
        let rx = deviceWidth / 2;
        let sx = layout.x - rx + layout.width / 2;
        if (sx < 0) sx = 0;
        sx < this.scrollW - deviceWidth && this.scroll.scrollTo({ x: sx, animated: bl });
        sx >= this.scrollW - deviceWidth && this.scroll.scrollToEnd({ animated: bl });
        this.props.onChange && this.props.onChange(index);
    }
}
const tabBarStyle = StyleSheet.create({
    tab: {
        backgroundColor: '#fbfafc',
        // backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: "center",
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1),
        height: 40
    },
    itemBtn: {
        paddingHorizontal: 12,
        paddingTop: 2,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center"
    },
    item: {
        fontSize: px(28),
        color: "#858385",
    },
    active: {
        color: "#d0648f"
    },
    line: {
        width: 20,
        height: 2,
        backgroundColor: "#fbfafc",
        marginTop: 5,
        marginBottom: 2,
    },
    active2: {
        backgroundColor: "#d0648f"
    },
    sortimg: {
        width: 55,
        height: 40,
    }
});

// class GoodList extends Component {
//     static defaultProps = {
//         cid: 0
//     }
//     constructor(props) {
//         super(props)
//         this.state = {

//         }
//     }

//     render() {
//         return <View>

//         </View>
//     }
// }

let GoodTop = 0;
if (Platform.OS === 'ios' && PixelRatio.get() >= 3) {
    GoodTop = px(495);
} else if (Platform.OS === 'ios' && deviceWidth <= 320) { // 适配 小屏(4/4s/5/5s)
    GoodTop = px(515)
} else if (Platform.OS === 'android' && deviceWidth <= 360) {  // 适配 android 小屏
    GoodTop = px(500);
} else {
    GoodTop = px(495);
}

class GoodItem extends Component {
    render() {
        let item = this.props.item || {};
        return <TouchableOpacity onLayout={e => this.props.onLayout(e)}
            activeOpacity={0.9}
            onPress={() => this.getDetail(item)}>

            <View style={[styles.bGood, { height: GoodTop }]}>

                <View style={{
                    width: deviceWidth,
                    alignItems: 'center',
                    marginTop: 10
                }}>

                    <View style={styles.imageBox}>
                        <Image
                            resizeMethod="scale"
                            source={{ uri: item.show ? item.image : require('../../images/img2') }}
                            style={styles.goodsCoverBig} />
                        {
                            item.salesTimeDiff > 0 && !item.salesEndTimeDiff &&
                            <View style={[styles.preheatBgContainer, styles.pC2]}>
                                <Background style={styles.preheatBigBg} name="icon-pre2">
                                    <Text allowFontScaling={false} style={styles.preheatTxt}>{item.salesTimeStr}
                                        开始售卖
                                    </Text>
                                </Background>
                            </View>
                        }

                        {
                            item.salesEndTimeDiff > 0 &&
                            <View style={[styles.preheatBgContainer, styles.pC1]}>
                                <Background style={styles.preheatBigBg} name="icon-pre1">
                                    {
                                        item.salesTimeDiff > 0 &&
                                        <Text allowFontScaling={false} style={styles.preheatTxt}>
                                            限时特卖 预热中
                                        </Text>
                                    }

                                    {
                                        item.salesTimeDiff < 0 && item.salesEndTimeDiff > 0 &&
                                        <Text allowFontScaling={false} style={styles.preheatTxt}>
                                            限时特卖 抢购中
                                        </Text>
                                    }
                                </Background>
                            </View>
                        }

                    </View>

                    {
                        item.limitStock === 0 &&
                        <View style={styles.goods_img_coverBig}>
                            <Text allowFontScaling={false} style={styles.goods_img_txt}>
                                抢光了
                            </Text>
                        </View>
                    }

                    <View style={styles.labels2}>
                        {
                            item.labelList && item.labelList.length > 0 && item.labelList.map((label) =>
                                <Image key={label.labelId}
                                    resizeMode="contain" resizeMethod="scale"
                                    style={[styles.labelImg, { width: px(label.width), height: px(label.height) }]}
                                    source={{ uri: label.labelLogo }} />
                            )}
                    </View>
                </View>

                <View style={{
                    width: deviceWidth,
                    flexDirection: 'row',
                    paddingLeft: 10,
                    alignItems: 'flex-start',
                    paddingTop: Platform.OS === "ios" ? 10 : 6,
                    height: 60,
                    // borderColor:"#333",
                    // borderWidth:1
                }}>

                    <View style={{
                        flex: 3,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}>

                        <Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            style={styles.goodsShowName}>
                            {item.goodsShowName}
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            marginTop: Platform.OS === "ios" ? 4 : 2,
                        }}>

                            {
                                (item.isInBond == 1 || item.isForeignSupply == 2) &&
                                <View
                                    style={[styles.flag_, item.isInBond == 1 ? styles.flagB : styles.flagZ]}>
                                    <Text
                                        style={styles.flagTxt}
                                        allowFontScaling={false}>
                                        {item.isInBond == 1 ? '保税' : item.isForeignSupply == 2 ? '直邮' : ''}
                                    </Text>
                                </View>
                            }
                            <Text style={[styles.goodsShowDesc]} allowFontScaling={false}
                                numberOfLines={1}>
                                {item.goodsShowDesc}
                            </Text>
                        </View>

                        <View style={styles.inline_left}>
                            <Text allowFontScaling={false}
                                style={styles.salePrice}>
                                ￥
                                <Text allowFontScaling={false} style={styles.salePrice_}>
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
                                    style={styles.benefitMoney}>
                                    赚￥{util_cools.parsePrice(item.benefitMoney)}
                                </Text>
                            }
                        </View>

                    </View>

                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        flexDirection: 'row',
                        // marginTop: 12,
                        alignItems: 'center'  // TODO 是否要区分 android iOS
                    }}>

                        {
                            User.isLogin && !User.vip && <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    this.setState({
                                        benefitMoney: item.benefitMoney,
                                        shareId: item.id
                                    });
                                    this.props.sharePage(item)
                                }}>
                                <View style={styles.cartC}>
                                    <Icon name="icon-index-shareNew" style={styles.cartShare} />
                                </View>
                            </TouchableOpacity>
                        }

                        {
                            User.isLogin && !User.vip && <Icon
                                name="icon-index-line"
                                style={{
                                    width: px(2),
                                    height: px(24),
                                }} />
                        }
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                this.addCart(item.id, 1)
                            }
                            }>
                            <View style={styles.cartC}>
                                <Icon name="icon-index-cartNew" style={styles.cartShare} />
                            </View>
                        </TouchableOpacity>

                    </View>


                </View>

            </View>

        </TouchableOpacity>
    }

    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    componentDidUpdate() {
        // console.log("刷新")
    }
    componentWillReceiveProps(pp) {
        // if (pp.item.show != this.props.item.show) {
        //     this.shouldUpdate = true;
        // }
        this.shouldUpdate = true;
    }
    addCart(id, i) {
        this.props.addCart(id, i)
    }
    getDetail() {
        this.props.getDetail();
    }
    setHeight() {
        this.shouldUpdate = true;

        if (Platform.OS === 'ios' && PixelRatio.get() >= 3) {
            return px(495);
        } else if (Platform.OS === 'ios' && deviceWidth <= 320) { // 适配 小屏(4/4s/5/5s)
            return px(515)
        } else if (Platform.OS === 'android' && deviceWidth <= 360) {  // 适配 android 小屏
            return px(500);
        } else {
            return px(495);
        }
    }
}

export default class SecondCategoryPage extends PureComponent {

    constructor(props) {
        super(props);
        this.state = { //状态机变量声明
            tabs: [],
            isLoading: false,
            categoryId: null,
            activeTab: 0,
            goodsList: [],
            emptyTxt: "",
            refreshing: false, // 下拉刷新
            isShowLayer: false,
            selectedSTIndex: '默认',   // 选中的排序条件
            scrollX: new Animated.Value(300),  // tabBar在X轴上滑动的距离
            index: -1,
            tablist: [],
            searchTxt: ''
        };
        this.title = '分类';
        this.categoryId = this.props.navigation.state.params.categoryId;

        this.fcId = 0;
        this.sortKey = 'default';
        this.sortType = 'desc';
        this.start = 0;
        this.goodsName = '';

        this.loading = false;
        this.isEnd = false;

        this.isQurest = true;

    }

    componentDidMount() {
        this.onQueryCategory();
        this.getSearchLabel()
        // if (this._scrollView !== null) {
        //     this.timer = setTimeout(() => {
        //         this._scrollView.scrollTo({x: 120, y: 0, animated: true})
        //     }, 100);
        // }
    }

    /**
     * 获取 tabBar 数据
     */
    async onQueryCategory() {
        let childListObj;
        this.load.open()
        try {
            if (this.categoryId != null) {
                childListObj = await get(`/operate_category/childList.do?categoryId=${this.categoryId}`);
                this.fcId = childListObj.parent_cate_id;
                this.title = childListObj.parent_cate_name;
                if (childListObj.cate_list.length > 0) {
                    let index = 0;
                    childListObj.cate_list.map((item, i) => {
                        if (this.categoryId == item.id) {
                            this.goodsName = item.name;
                            index = i;
                        }
                    });
                    // this.tabs.setIndex(index);

                    this.setState({
                        index,
                        // tabs: tempArr,
                        // isLoading: true,
                        tablist: childListObj.cate_list
                    });



                    this.start = 0;
                    let goodsList = await this.onFirstPage(this.categoryId, this.sortKey, this.sortType, this.start);
                    let len = 5;
                    if (goodsList.items.length < 5) len = goodsList.items.length;
                    if (goodsList.items.length > 0) {
                        for (let i = 0; i < len; i++) {
                            goodsList.items[i].show = true;
                        }
                        this.setState({
                            goodsList: goodsList.items,
                            emptyTxt: '',
                        })
                    } else {
                        this.setState({
                            emptyTxt: this.goodsName
                        })
                    }
                }
            }
        } catch (e) {
            if (e.data.status != 0) {
                toast("您来晚了，页面已经飞走啦~");
                this.timer = setTimeout(() => {
                    this.props.navigation.state.params.updatePage({ actionType: 'onRefresh', categoryId: -1000 });
                    this.props.navigation.goBack()
                }, 1000);
            }
        } finally {
            this.setState({
                // isLoading: false,
                refreshing: false
            });
            this.load.close();
        }
    }

    /**
     * 加载第一屏
     */
    async onFirstPage(categoryId, sortKey, sortType, start) {
        try {
            if (sortKey === 'salesPrice_asc' || sortKey === 'salesPrice_desc') {
                sortKey = "salesPrice";
            }

            let goodsList = await get(`/search/operate_cate/goodsList.do?operateCateId=${categoryId}&sortKey=${sortKey}&sortType=${sortType}&start=${start}&limit=10`); // 运营分类商品搜索列表
            this.isQurest = false;
            return goodsList
        } catch (e) {
            //
        } finally {
            this.setState({
                // isLoading: false,
                refreshing: false
            })
        }
    }

    /**
     * 下拉刷新
     */
    async onRefresh() {
        if (this.state.isLoading) return;
        this.isEnd = false;
        this.loading = true;
        this.start = 0;
        this.load.open()
        this.setState({
            refreshing: true
        });
        try {
            let goodsList = await this.onFirstPage(this.categoryId, this.sortKey, this.sortType, this.start);
            if (!goodsList.items) this.isEnd = true;
            let len = 5;
            if (goodsList.items.length < 5) len = goodsList.items.length;
            if (goodsList.items.length > 0) {
                for (let i = 0; i < len; i++) {
                    goodsList.items[i].show = true;
                }
                this.setState({
                    goodsList: goodsList.items,
                    emptyTxt: '',
                });
                this.isEnd = false;
            } else {
                this.setState({
                    goodsList: [],
                    emptyTxt: this.goodsName
                });
                this.isEnd = true;
            }
            this.loading = false;
        } catch (e) {
            toast(e.message);
            this.isEnd = true;
        } finally {
            this.load.close()
        }

    }

    /**
     * 上拉加载更多
     * @returns {Promise<void>}
     */
    async next() {

        if (this.state.isLoading || this.loading || this.isEnd || this.isQurest) return;
        this.loading = true;
        this.start++;
        try {
            let moreList = await this.onFirstPage(this.categoryId, this.sortKey, this.sortType, this.start);
            if (!moreList.items) this.isEnd = true;
            if (moreList && moreList.items.length > 0) {
                this.setState({
                    goodsList: this.state.goodsList.concat(moreList.items),
                });
                this.isEnd = false;
            } else {
                this.setState({
                    goodsList: this.state.goodsList.concat(moreList.items),
                });
                this.isEnd = true;
            }
        } catch (e) {
            toast(e.message);
            this.isEnd = true;
        } finally {
            this.loading = false;
        }

    }

    /**
     * 头部导航
     * @returns {*}
     * @private
     */
    _renderHeader() {
        return <TopHeader
            title={this.title}
            navigation={this.props.navigation}
            hiddenBack={true}
            boxStyles={{
                backgroundColor: '#fbfafc',
                borderBottomColor: "rgba(0,0,0,0)",
                borderBottomWidth: 1,
            }}
            leftBtn={
                <TouchableOpacity
                    style={{ marginLeft: px(10) }}
                    onPress={() => this.goBackPageParams()}>
                    <View style={{ height: 30, width: 30, justifyContent: "center" }}>
                        <Icon name="icon_back"
                            style={{ width: 20, height: 20 }} />
                    </View>
                </TouchableOpacity>
            }

            rightBtn={
                <TouchableOpacity
                    style={{
                        paddingRight: px(24)
                    }}
                    onPress={() => this.goSearchPage()}
                >
                    <ImageJSFile
                        imageJsFile2x={ImagesRes.icon_search_black2x}
                        imageJsFile3x={ImagesRes.icon_search_black3x}
                    />
                </TouchableOpacity>
            }
        />
    }

    /**
     * 浮层
     * @private
     */

    setTop() {
        if (isIphoneX()) {
            return px(250);
        } else if (Platform.OS === 'ios' && deviceWidth <= 320) { // 适配 小屏(4/4s/5/5s)
            return px(174)
        } else if (Platform.OS === 'android' && deviceWidth <= 360) {  // 适配 android 小屏
            return px(174);
        } else {
            return px(179);
        }
    }

    _renderFloatLayer() {
        let dataSource = User.isLogin && !User.vip ? sortTermLogin : sortTerm;

        return (
            <View style={[styles.layerView, { top: this.setTop() }]}>
                <View style={{backgroundColor: '#fbfafc'}}>
                    {
                        dataSource.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.9}
                                    onPress={() => this.onFloatLayerChange(item, index)}>
                                    <View style={styles.layerChildView}>
                                        <Text style={{ fontSize: px(28), color: this.state.selectedSTIndex === item.name ? '#d0648f' : '#222222' }}
                                            allowFontScaling={false}>
                                            {item.name}
                                        </Text>
                                        {
                                            this.state.selectedSTIndex === item.name ? <ImageJSFile
                                                imageJsFile2x={ImagesRes.icon_sort_selected2x}
                                                imageJsFile3x={ImagesRes.icon_sort_selected3x} />
                                                : null
                                        }
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </View>
        )
    }

    /**
     * 商品列表
     * @private
     */
    _renderSCList = (item, index) => {
        if (!item) return null;
        return <GoodItem2
            onLayout={e => this.setLaout(e.nativeEvent, index)}
            item={item}
            getDetail={() => this.getDetail(item)}
            sharePage={() => this.sharePage(item)}
            addCart={(id, i) => this.addCart(id, i)}
        />
    };


    render() {
        return (
            <View style={styles.container}>

                {this._renderHeader()}
                <TabBar ref={e => this.tabs = e}
                    index={this.state.index}
                    data={this.state.tablist}
                    onOpen={() => {
                        TrackClick('Classify', 'ClassifySort', '二级分类页面', '排序');
                        this.setState({
                            isShowLayer: !this.state.isShowLayer
                        });
                    }}

                    onChange={index => this.onTabBarChange2(index)} />
                {this.state.isShowLayer ? this._renderFloatLayer() : null}
                {/* <TabView page={1}
                    initialPage={0} locked
                    onChangeTab={() => { }}
                    renderTabBar={false}>
                    {this.state.tablist.map((item, index) =>
                        <GoodList key={index} cid={item} />
                    )}
                </TabView> */}
                <FlatList ref={e => this.goodList = e}
                    data={this.state.goodsList}
                    numColumns={1}
                    extraData={this.state}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.onRefresh()}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={() => <View />}
                    renderItem={(item, separators) => this._renderSCList(item.item, item.index)}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => this.next()}
                    onScroll={e => this.scrolling(e.nativeEvent)}
                    ListEmptyComponent={() => this.state.emptyTxt != "" &&
                        <View style={[styles.textCenter, { height: px(1000) }]}>
                            <Text allowFontScaling={false} style={styles.listEnd}>没有"{this.state.emptyTxt}"相关的商品</Text>
                        </View>}
                />

                {/* <View style={isIphoneX() ? { height: 30 } : { height: 15 }}></View> */}

                <ShareView ref='shareView'
                    navigation={this.props.navigation}
                    getQrCode2={() => this.getQrCode2()}
                    getQrCode={() => this.getQrCode()}
                    QRCodeType={util_cools.isNewAndroid() ? "old" : "product"}
                    types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
                    <ShareGoods money={this.state.benefitMoney} />
                </ShareView>

                <LoadingRequest status={this.state.isLoading} text={'正在搜索中...'} />
                <Loading ref={e => this.load = e} style={{}} />
                <DialogModal ref="dialog" />
            </View>
        );
    }
    goodList = {};
    load = null;
    layout = 0;
    timer = null;
    tabs = null;
    /**
     * 切换tab
     */
    async onTabBarChange2(index) {
        this.setState({
            // isLoading: true,
            isShowLayer: false
        });
        this.load.open()
        this.start = 0;
        this.isEnd = false;
        this.categoryId = this.state.tablist[index].id;
        let goodsList = await this.onFirstPage(this.categoryId, this.sortKey, this.sortType, this.start);
        if (goodsList.items && goodsList.items.length > 0) {
            let len = 5;
            if (goodsList.items.length < 5) len = goodsList.items.length;
            for (let i = 0; i < len; i++) {
                goodsList.items[i].show = true;
            }
            this.setState({
                goodsList: goodsList.items || [],
            }, () => {
                this.state.goodsList.length > 0 && this.goodList && this.goodList.scrollToIndex({ index: 0, animated: false })
            })
        } else {
            this.setState({
                goodsList: [],
                emptyTxt: this.goodsName
            })
        }

        this.load.close()
    }
    /**
     * tabBar点击切换事件
     */
    // async onTabBarChange(item, index) {
    //     if (item != null) {
    //         this.setState({
    //             activeTab: index,
    //             isLoading: true,
    //             isShowLayer: false
    //         });
    //     }
    //     this.categoryId = item.id;
    //     let goodsList = await this.onFirstPage(this.categoryId, this.sortKey, this.sortType, this.start);
    //     if (goodsList != null && goodsList.items.length > 0) {
    //         this.setState({
    //             goodsList: goodsList.items,
    //         })
    //     }
    // }
    setLaout(e, index) {
        this.layout = e.layout.height;
        // console.log(e.layout.height)
    }
    showImage(index) {
        if (this.timer) return;
        this.timer = setTimeout(() => {
            // console.log("延迟显示:当前第" + index + "行");
            let list = this.state.goodsList.filter((item, i) => {
                item.show = i >= index - 2 && i < index + 5;
                return item;
            })
            // this.shouldComponentUpdate = true;
            this.setState({ goodsList: list })
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 200);
    }

    scrolling(e) {
        const y = e.contentOffset.y;
        let index = Math.floor(y / this.layout);
        // console.log("当前第" + index + "行");
        this.showImage(index);
    }
    /**
     * 浮层 点击事件
     */
    async onFloatLayerChange(item, index) {
        TrackClick('Classify', `ClassifySort-${index + 1}`, '排序页面', `${item.name}`);
        this.setState({
            selectedSTIndex: item.name,
            isShowLayer: false,
        });

        this.start = 0;
        this.sortKey = item.sortKey;
        this.sortType = item.sortType;

        let goodsList = await this.onFirstPage(this.categoryId, this.sortKey, this.sortType, this.start);
        let len = goodsList.items.length > 5 ? 5 : goodsList.items.length;
        for (let i = 0; i < len; i++) {
            goodsList.items[i].show = true;
        }

        if (goodsList != null) {
            this.setState({
                goodsList: goodsList.items,
            })
        }


    }

    /**
     * 返回到上一页
     */
    goBackPageParams() {
        this.props.navigation.state.params.updatePage({ actionType: 'LocationFCIndex', categoryId: this.fcId });
        this.props.navigation.goBack()
    }

    /**
     * 调转到搜索页
     */
    goSearchPage() {
        TrackClick('Classify', 'ClassifySecondSearchBar', '二级分类列表', '二级列表-搜索');
        this.props.navigation.navigate('SearchPage', {
            searchTxt: this.state.searchTxt
        });
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

    /**
     * 添加到购物车
     * @param id
     * @param num
     * @returns {Promise<void>}
     */
    async addCart(id, num) {
        if (User.isLogin) {
            //TrackClick('Search-SKUlist', 'Search-SKUlistAddcart', '搜索结果页', '加入购物车');
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
                                txt: "去购物车", click: () => this.props.navigation.navigate('ShoppingCartContentPage')
                            }
                        ]
                    })
                }
            }
        } else {
            this.goLoginPage();
        }
    }

    /**
     * 跳转登录页
     */
    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {});
    }

    /**
     * 分享
     */
    currGoodInfo = {}
    sharePage(item) {
        this.setState({ benefitMoney: item.benefitMoney, shareId: item.id })
        let desc = util_cools.goodDesc(item);
        this.currGoodInfo = item;
        this.refs.shareView.Share({
            title: item.shareTitle,
            desc: desc,
            img: item.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${item.id}`,
            link: `${touchBaseUrl}/goods-detail?id=${item.id}`,
            track: (type) => {
                TrackClick('Search-SKUlist', 'Search-SKUlistShare', '搜索结果页', `分享商品-${type}`);
            },
            shareType: 'goods',
            extra: item.goodsShowName
        });
    }

    /**
     * 跳转到详情页
     */
    getDetail(item) {
        TrackClick('Classify', 'ClassifySku', '二级分类页面', `${item.sku}`);
        this.props.navigation.navigate('DetailPage', {
            id: item.sku ? '' : item.goodsId,
            sku: item.sku
        });
    }

    /**
     * 获取分享二维码图片
     * @returns {Promise<*>}
     */
    async getQrCode() {
        let res1 = await get(`/goods/touch/createQrcode.do?id=${this.state.shareId}&join=0`);
        return {
            height: res1.showHeight,
            width: res1.showWidth,
            share_img: res1.showUrl,
            down_img: res1.downloadUrl,
        }
    }
    async getQrCode2() {
        return {
            id: this.currGoodInfo.id,
            image: this.currGoodInfo.shareImage,
            price: this.currGoodInfo.salePrice,
            showName: this.currGoodInfo.goodsShowDesc,
            taxation: this.currGoodInfo.taxation,
            temai: this.currGoodInfo.salesTime,
            temaiTxt: this.currGoodInfo.salesTimeStr,
            temaiEnd: this.currGoodInfo.salesEndTime,
            temaiEndTxt: this.currGoodInfo.salesEndTimeStr
        }
    }

    /**
     * 适配 iphone6 和 iPhone6p
     * 暂时，待优化
     * @returns {*}
     */
    // setHeight() {
    //     if (Platform.OS === 'ios' && PixelRatio.get() >= 3) {
    //         return px(495);
    //     } else if (Platform.OS === 'ios' && deviceWidth <= 320) { // 适配 小屏(4/4s/5/5s)
    //         return px(515)
    //     } else if (Platform.OS === 'android' && deviceWidth <= 360) {  // 适配 android 小屏
    //         return px(500);
    //     } else {
    //         return px(495);
    //     }
    // }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

}


const styles = StyleSheet.create({

    container: {
        flex: 1,
    },
    layerView: {
        zIndex: 66,
        position: 'absolute',
        left: 0,
        height: deviceHeight,
        width: deviceWidth,
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.5)",
    },

    layerChildView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: deviceWidth,
        height: px(80),
        paddingLeft: px(50),
        paddingRight: px(24),
        backgroundColor: '#fbfafc',
        paddingVertical: Platform.OS === 'ios' ? px(28) : px(16)
    },

    tabBarView: {
        // height: px(80),
        backgroundColor: '#fbfafc',
        flexDirection: 'row',
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1)
    },

    tabBarChildView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    tabBarTouch: {
        marginLeft: px(50),
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabBarTxt: {
        fontSize: px(28),
    },

    tabBarUnderLine: {
        marginTop: px(14),
        height: px(3),
        width: px(36),
    },

    btnSort: {
        width: px(110),
        height: px(80),
    },

    scImg: {
        width: px(710),
        height: px(356),
        overflow: 'hidden',
        borderRadius: px(12)
    },

    startScale: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: px(50),
        width: px(600),
        zIndex: 99,
        borderBottomLeftRadius: px(12),
        borderBottomRightRadius: px(12),
        overflow: 'hidden'
    },

    preHeat: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: px(50),
        width: px(450),
        zIndex: 99,
        borderBottomLeftRadius: px(12),
        borderBottomRightRadius: px(12),
        overflow: 'hidden'
    },

    preImg: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: px(10)
    },

    preheatBigBg: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: px(10)
    },

    preTxt: {
        padding: 0,
        fontSize: setSpText(12),
        color: '#ffffff',
        textAlignVertical: 'center',
        includeFontPadding: false,
        backgroundColor: 'transparent'
    },

    preLogo: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? px(8) : px(8),
        left: Platform.OS === 'ios' ? px(28) : px(28),
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },

    preLogoImg: {
        width: px(60),
        height: px(60),
        marginRight: px(8)
    },

    barView: {
        width: deviceWidth,
        flexDirection: 'row',
        paddingLeft: 10,
        marginTop: Platform.OS === "ios" ? 10 : 6,
    },

    barTxt1: {
        fontSize: px(24),
        color: '#898989',
        marginHorizontal: px(10)
    },

    barView2: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        marginTop: 12
    },

    bGood: {
        alignItems: 'flex-start',
        width: deviceWidth,
        backgroundColor: '#fff',
        // height: px(510),
    },
    goodsCoverBig: {
        width: px(710),
        height: px(356),
        overflow: 'hidden',
        borderRadius: px(12)
    },
    imageBox: {
        width: px(710),
        height: px(356),
        position: 'relative',
        zIndex: 0,
        borderRadius: px(12),
        overflow: 'hidden'
    },
    goods_img_coverBig: {
        position: 'absolute',
        left: px(285),
        top: px(100),
        zIndex: 1,
        width: px(180),
        height: px(180),
        borderRadius: px(90),
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    goods_img_txt: {
        fontSize: px(36),
        color: '#fff'
    },
    labels2: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? px(8) : px(8),
        left: Platform.OS === 'ios' ? px(28) : px(28),
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    labelImg: {
        width: px(60),
        height: px(60),
        marginRight: px(8)
    },
    goodsShowNameBox: {
        paddingHorizontal: px(20),
        paddingTop: Platform.OS === 'ios' ? px(18) : 7,
        backgroundColor: '#fff',
    },
    goodsShowName: {
        fontSize: 14,
        color: '#000',
        includeFontPadding: false,
    },
    goodsShowDesc_: {
        width: px(527),
    },
    flag_: {
        paddingLeft: px(5),
        paddingRight: px(5),
        height: px(25),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: px(4),
        overflow: 'hidden',
        marginRight: px(10)
    },
    flagB: {
        backgroundColor: '#56beec',
    },
    flagZ: {
        backgroundColor: '#6cd972',
    },
    flagTxt: {
        color: '#fff',
        fontSize: px(18),
        includeFontPadding: false,
    },
    goodsShowDesc: {
        // width: 300,
        // height: 14,
        fontSize: 12,
        color: '#858385',
        includeFontPadding: false,
    },
    flag: {
        fontSize: px(18),
        color: '#fff'
    },
    salePrice: {
        fontSize: 12,
        color: "#000",
        includeFontPadding: false,
    },
    salePrice_: {
        fontSize: 15,
        includeFontPadding: false,
    },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(24),
        includeFontPadding: false,
    },
    cartC: {
        width: 48,
        height: 26,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cartShare: {
        overflow: 'hidden',
        width: 21,
        height: 21
    },

    preheatBgContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: px(50),
        zIndex: 99,
        borderBottomLeftRadius: px(12),
        borderBottomRightRadius: px(12),
        overflow: 'hidden'
    },

    preheatTxt: {
        padding: 0,
        fontSize: setSpText(12),
        color: '#ffffff',
        //textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        backgroundColor: 'transparent'
    },

    listContainer: {
        zIndex: 10,
        backgroundColor: "#fff",
        marginBottom: px(100)
    },

    pC1: {
        width: px(450),
    },

    pC2: {
        width: px(600)
    },

    textCenter: {
        justifyContent: "center",
        alignItems: "center"
    },

    listEnd: {
        color: "#ccc"
    },

    inline_left: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginBottom: px(20),
    },

});