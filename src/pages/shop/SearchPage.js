'use strict'

import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    Platform, TouchableOpacity, TextInput, Text, Image,
    FlatList,
    Keyboard,
    Animated,
    ScrollView
} from 'react-native'
import { deviceHeight, deviceWidth, isIphoneX, px } from "../../utils/Ratio";
import Icon from "../../UI/lib/Icon";
import { User } from "../../services/Api";
import { GoodItem2 } from "./GoodItem";
import { LoadingRequest } from "../../widgets/Loading";
import { DialogModal } from "../common/ModalView";
import ShareView, { SHARETYPE } from "../common/ShareView";
import { TrackClick } from "../../services/Track";
import { getItem, setItem } from "../../services/Storage";
import { baseUrl, get, touchBaseUrl } from "../../services/Request";
import { show as toast } from "../../widgets/Toast";
import utils_tools from "../../utils/tools";
import CartList from "../../services/Cart";
import { emit } from '../../services/Event'
import { log, logErr, logWarm } from '../../utils/logs';
import ShareGoods from "../../share/goods"

/**
 *  全新搜索页
 */
export default class SearchPage extends Component {

    height = Platform.OS === 'ios' ? isIphoneX() ? px(190) : px(140) : px(96)

    constructor(props) {
        super(props);
        this.defaultTxt = this.props.navigation.state.params ? this.props.navigation.state.params.searchTxt : ''
        this.state = {
            type: 'search',
            sortTabs: User.isLogin && !User.vip ? [{
                name: '默认', id: 'default', isSort: false
            }, {
                name: '销量', id: 'sales', isSort: false
            }, {
                name: '新品', id: 'shelfOnTime', isSort: false
            }, {
                name: '高佣', id: 'benefitMoney', isSort: false
            }, {
                name: '价格', id: 'salesPrice', isSort: true, flag: 'asc'
            }] : [{
                name: '默认', id: 'default', isSort: false
            }, {
                name: '销量', id: 'sales', isSort: false
            }, {
                name: '新品', id: 'shelfOnTime', isSort: false
            }, {
                name: '价格', id: 'salesPrice', isSort: true, flag: 'asc'
            }],
            y: new Animated.Value(this.height),
            o: new Animated.Value(1),
            showFilter: true,
            keyWords: []
        }
    }

    render() {
        return <View style={search.container}>
            {
                this.state.type === 'view' ?
                    <NewList ref="list" animate={this.animate} navigation={this.props.navigation} /> : null
            }
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: deviceWidth,
                backgroundColor: '#fff'
            }}>
                <Animated.View style={{
                    width: deviceWidth,
                    height: this.state.y,
                    overflow: 'hidden'
                }}>
                    <NewSearchBar ref="searchBar" defaultTxt={this.defaultTxt} search={this.search}
                        changed={this.changed}
                        navigation={this.props.navigation} />
                </Animated.View>
                {
                    this.state.type === 'view' ? <Animated.View style={{
                        width: deviceWidth,
                        height: px(1),
                        backgroundColor: '#efefef',
                        opacity: this.state.o
                    }}></Animated.View> : null
                }
                {
                    this.state.type === 'tip' ? <View style={{
                        width: deviceWidth, height: deviceHeight - this.height
                    }}>
                        <NewTipList list={this.state.keyWords} search={this.search} searchTxt={this.searchTxt} />
                    </View> : null
                }
                {
                    this.state.type === 'search' ? <NewHistoryPanel search={this.search} /> : null
                }
                {
                    this.state.type === 'search' ? <NewHotPanel search={this.search} navigate={this.navigate} /> : null
                }
                {
                    this.state.type === 'view' && this.state.showFilter ?
                        <NewFilter sortTab={this.state.sortTabs} switched={this.switched} /> : null
                }
            </View>
        </View>
    }

    animate = (is) => {
        if (is) {
            let height = Platform.OS === 'ios' ? isIphoneX() ? px(94) : px(44) : 0
            this.state.y.setValue(height)
            this.state.o.setValue(0)
        } else {
            let height = Platform.OS === 'ios' ? isIphoneX() ? px(190) : px(140) : px(96);
            this.state.y.setValue(height)
            this.state.o.setValue(1)
        }
    }

    changed = (type, list, txt) => {
        if (this.state.type === type && !list) return;
        if (this.state != 'view') {
            if (this.refs.searchBar) this.refs.searchBar.searchStatus = false
        }
        this.searchTxt = txt ? txt : ''
        let is = list && list.length > 0 ? true : false
        if (!is) {
            this.setState({
                type: 'search',
                keyWords: []
            })
            return;
        }
        this.setState({
            type: type,
            keyWords: list
        })
    }

    searchTxt = ''

    search = async (searchTxt, is, sku, dont) => {
        if (!searchTxt && this.defaultTxt) {
            searchTxt = this.defaultTxt
            this.refs.searchBar && this.refs.searchBar.inputTxt(searchTxt)
        }
        if (searchTxt && is) {
            this.refs.searchBar && this.refs.searchBar.inputTxt(searchTxt)
        }

        if (this.refs.searchBar) this.refs.searchBar.searchType = 'search'

        if (searchTxt) {
            Keyboard.dismiss()
            if (!dont) {
                await this.remHis(searchTxt)
            }
            this.setState({
                type: 'view'
            }, () => {
                if (this.refs.searchBar) this.refs.searchBar.searchStatus = true
                this.refs.list && this.refs.list.show({
                    searchTxt: sku ? sku : searchTxt,
                    sort: this.state.sortTabs[0],
                    searchKey: sku ? 'sku_list' : 'default'
                }, (show) => {
                    this.setState({
                        showFilter: !show
                    })
                })
            })
        }
    }

    navigate = (searchTxt, type, param) => {
        if (type == 1) { // 商品详情
            this.props.navigation.navigate("DetailPage", {
                sku: param
            });
        } else if (type == 2) { // 专题
            this.props.navigation.push("HtmlViewPage", {
                webPath: param,
                img: ""
            });
        } else if (type == 3) { // 频道
            this.props.navigation.navigate("ShopPage")
            emit("top.tab.change", param)
        } else if (type == 4) { // 运营分类
            this.props.navigation.push('SecondCategoryPage', {
                categoryId: param,
                updatePage: () => {
                }
            })
        } else if (type == 5) { // 商品列表
            this.search(searchTxt, true, param, true)
        }
    }

    switched = (index) => {
        this.animate(false)
        this.refs.list && this.refs.list.show({
            sort: this.state.sortTabs[index],
        })
    }

    async remHis(txt) {
        let list = await getItem("record") || []
        if (list.indexOf(txt) == -1) {
            if (list.length >= 10) {
                list.pop()
            }
            list.unshift(txt)
        }

        await setItem("record", list)
    }

}

const search = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
})

class NewTipList extends Component {
    constructor(props) {
        super(props);
    }

    keys(searchTxt, txt) {
        if (!txt) {
            return ['']
        }
        if (!searchTxt) {
            return [txt]
        }
        if (txt.indexOf(searchTxt) > -1) {
            let arr = txt.split(searchTxt)
            arr.splice(1, 0, searchTxt);

            return arr;
        } else {
            return [txt]
        }
    }

    render() {
        let list = this.props.list || []
        return (
            <View style={{ flex: 1, paddingBottom: px(60) }}>
                <ScrollView style={{ flex: 1 }} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="always">
                    <View style={{
                        width: deviceWidth,
                        height: px(22)
                    }}></View>
                    {
                        list.map((item, index) => {
                            let keysList = this.keys(this.props.searchTxt, item)
                            return <TouchableOpacity key={index} onPress={() => this.props.search(item, true)}>
                                <View style={{
                                    width: deviceWidth,
                                    paddingLeft: px(69),
                                    paddingVertical: px(30),
                                    flexDirection: 'row'
                                }}>
                                    {
                                        keysList.map((key, idx) => {
                                            return key ? <Text key={idx} style={{
                                                fontSize: px(28),
                                                color: key == this.props.searchTxt ? '#222' : '#666'
                                            }}>
                                                {key}
                                            </Text> : null
                                        })
                                    }
                                </View>
                            </TouchableOpacity>
                        })
                    }
                </ScrollView>
            </View>
        );
    }

}

class NewFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sortTabs: this.props.sortTab || [],
            index: 0
        }
    }

    click(index) {
        let sortTabs = this.state.sortTabs
        if (this.state.index == index && sortTabs[index].flag) {
            sortTabs[index].flag = sortTabs[index].flag == 'asc' ? 'desc' : 'asc';
        } else if (this.state.index == index && !sortTabs[index].flag) {
            return;
        }
        this.props.switched(index);
        TrackClick('Search-category', `Search-category-${index + 1}`, '搜索结果页', sortTabs[index].name);
        this.setState({
            index: index,
            sortTabs: sortTabs
        })
    }


    render() {
        return (
            <View style={filter.container}>
                {
                    this.state.sortTabs.map((item, index) => {
                        return <TouchableOpacity style={filter.item} key={index} onPress={() => this.click(index)}>
                            <View style={filter.item}>
                                <Text allowFontScaling={false}
                                    style={[filter.itemTxt, this.state.index == index ? { color: '#d0648f' } : {}]}>{item.name}</Text>
                                {
                                    item.isSort ? <View style={filter.sort}>
                                        {this.state.index == index && item.flag == 'asc' ? <Image
                                            style={filter.sortIcon}
                                            source={{ uri: require("../../images/icon-sort-top-a") }} /> : <Image
                                                style={filter.sortIcon}
                                                source={{ uri: require("../../images/icon-sort-top") }} />}
                                        <View style={{ height: px(4) }}></View>
                                        {this.state.index == index && item.flag == 'desc' ?
                                            <Icon name="icon-sort-bottom-a" style={filter.sortIcon} /> :
                                            <Icon name="icon-sort-bottom" style={filter.sortIcon} />}
                                    </View> : null
                                }
                            </View>
                        </TouchableOpacity>
                    })
                }
            </View>
        );
    }
}

const filter = StyleSheet.create({
    container: {
        width: deviceWidth,
        height: px(80),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        flexDirection: 'row',
    },
    item: {
        flex: 1,
        height: px(80),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemTxt: {
        fontSize: px(28),
        color: '#252426'
    },
    sort: {
        width: px(14),
        marginLeft: px(10)
    },
    sortIcon: {
        width: px(14),
        height: px(7)
    }
})

class NewList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isDone: false,
            list: [],
            benefitMoney: 0,
            isShow: false,
            showMsg: false,
        }

        this.searchTxt = ''
        this.sort = {}
        this.searchKey = ''
    }

    async show(param, cb) {
        this.searchTxt = param.searchTxt || this.searchTxt;
        this.sort = param.sort;
        this.searchKey = param.searchKey || this.searchKey
        if (!this.state.isShow) {
            this.setState({
                isShow: true
            })
        }
        await this.refresh()
        cb && cb(this.state.showMsg)
    }

    // hide() {
    //     this.searchKey = ''
    //     this.sort = {}
    //     this.searchTxt = ''
    //
    //     this.setState({
    //         isLoading: false,
    //         isDone: false,
    //         list: [],
    //         benefitMoney: 0,
    //         isShow: false,
    //         showMsg: false,
    //     })
    // }

    async loadShop() {
        if (!this.searchTxt) return;
        try {
            let sortKey = this.sort.id;
            let sortType = this.sort.flag || 'desc'
            let list = await get(`/goods/search/multiListV1.do?sKey=${this.searchKey}&sValue=${this.searchTxt}&sortKey=${sortKey}&sortType=${sortType}&limit=10&start=${this.start}`)
            let { dataType, showMsg, dataResult } = list
            if (dataType === 'sku_list') {
                let { currPageNo, totalPages, items } = dataResult
                if (currPageNo >= totalPages) {
                    this.next = false
                }

                if (items && items.length > 0) {
                    let list = []
                    list.push({
                        id: String(Date.now() + 101),
                        type: 'padding'
                    })
                    if (showMsg) {
                        list.push({
                            type: 'nothing',
                            id: String(Date.now() + 100),
                        })
                    }
                    items.map((item, index) => {
                        list.push({
                            type: 'good',
                            data: item,
                            id: String(index + Date.now()),
                        })
                    });
                    this.setState({
                        list: list,
                        showMsg: showMsg
                    })
                }
            } else if (dataType === 'subject') {
                let { subject_url } = dataResult
                this.props.navigation.navigate("HtmlViewPage", {
                    webPath: subject_url,
                    img: ""
                });
            }
        } catch (e) {
            toast(e.message);
            this.next = false;
        }
    }

    scrollY = 0
    ani = true

    onScroll(e) {
        let scrollHeight = e.contentSize.height - e.layoutMeasurement.height;
        if (e.contentOffset.y < 0 || e.contentOffset.y > scrollHeight) {
            return;
        }
        let y = e.contentOffset.y - this.scrollY;
        if (y > 0 && e.contentOffset.y > 0) {
            if (this.ani) {
                this.ani = false;
                this.props.animate(true)
            }
        } else {
            if (!this.ani) {
                this.ani = true
                this.props.animate(false)
            }
        }

        this.scrollY = e.contentOffset.y
    }

    next = true

    start = 0

    async refresh() {
        if (this.state.isLoading) return;
        this.next = true
        this.start = 0
        this.setState({
            isLoading: true,
            isDone: false
        });
        await this.loadShop();
        this.setState({
            isLoading: false,
            isDone: true
        });
    }

    /**
     * 点击进入详情页
     */
    getDetail(goods) {
        TrackClick('Search-SKUlist', 'Search-SKUlistClick', '搜索结果页', '商详页');
        this.props.navigation.navigate('DetailPage', {
            id: goods.sku ? '' : goods.id,
            sku: goods.sku
        });
    }

    /**
     * 分享商品
     */
    goodId = 0

    currGoodInfo = {}

    shareGood(goods) {
        let desc = utils_tools.goodDesc(goods);
        this.goodId = goods.id;
        this.salePrice = goods.salePrice;
        this.setState({ benefitMoney: goods.benefitMoney })
        this.currGoodInfo = goods;
        this.refs.shareView.Share({
            title: goods.shareTitle,
            desc: desc,
            img: goods.shareImage,
            url: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            link: `${touchBaseUrl}/goods-detail?id=${goods.id}`,
            track: (type) => {
                TrackClick('Search-SKUlist', 'Search-SKUlistShare', '搜索结果页', `分享商品-${type}`);
            },
            shareType: 'goods',
            extra: goods.goodsShowName
        });
    }

    async getQrCode() {
        let res1 = await get(`/goods/touch/createQrcode.do?id=${this.goodId}&salePrice=${this.salePrice}`)
        if (typeof res1 === 'string') {
            return {
                share_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${res1}`,
                down_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${res1}`
            }
        } else {
            return {
                height: res1.showHeight,
                width: res1.showWidth,
                share_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${res1.showKey}`,
                down_img: `${baseUrl}/goods/touch/getQrcodeImg.do?keyStr=${res1.downloadKey}`
            }
        }
    }

    async addCart(id, num) {
        if (User.isLogin) {
            TrackClick('Search-SKUlist', 'Search-SKUlistAddcart', '搜索结果页', '加入购物车');
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
     * 下一页
     */
    nextLoading = false

    async nextPage() {
        if (this.nextLoading) return;
        if (!this.next) return;
        this.nextLoading = true
        try {
            this.start++;
            let sortKey = this.sort.id;
            let sortType = this.sort.flag || 'desc'
            let list = await get(`/goods/search/multiListV1.do?sKey=${this.searchKey}&sValue=${this.searchTxt}&sortKey=${sortKey}&sortType=${sortType}&limit=10&start=${this.start}`)//this.start + 1
            let { dataType, showMsg, dataResult } = list
            this.nextLoading = false
            if (dataType === 'sku_list') {
                let { currPageNo, totalPages, items } = dataResult
                if (currPageNo >= totalPages) {
                    this.next = false
                }

                if (items && items.length > 0) {
                    let list = []
                    items.map((item, index) => {
                        list.push({
                            id: String(index + Date.now()),
                            type: 'good',
                            data: item
                        })
                    });
                    this.setState({
                        list: this.state.list.concat(list),
                        showMsg: showMsg
                    })
                }
            } else if (dataType === 'subject') {
                let { subject_url } = dataResult
                this.props.navigation.navigate("HtmlViewPage", {
                    webPath: subject_url,
                    img: ""
                });
            }

        } catch (e) {
            toast(e.message);
            this.next = false;
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

    height = Platform.OS === 'ios' ? isIphoneX() ? px(270) : px(220) : px(176)

    render() {
        if (!this.state.isShow) {
            return null;
        }
        return (
            <View style={list.container}>
                {
                    this.state.isDone ? <FlatList
                        ref="dataList"
                        style={list.container}
                        refreshing={this.state.isLoading}
                        onRefresh={() => this.refresh()}
                        data={this.state.list}
                        renderItem={({ item, index }) => {
                            if (item.type == 'padding') {
                                return <View style={{ width: deviceWidth, height: this.height }}>
                                </View>
                            }
                            if (item.type == 'nothing') {
                                return <NewTip searchTxt={this.searchTxt} />;
                            } else if (item.type == 'good') {
                                return <GoodItem2 item={item.data} navigation={this.props.navigation}
                                    getDetail={() => this.getDetail(item.data)}
                                    sharePage={() => this.shareGood(item.data)}
                                    addCart={this.addCart.bind(this)}
                                />
                            }
                        }
                        }
                        keyExtractor={(item) => item.id}
                        onEndReached={() => this.nextPage()}
                        initialNumToRender={10}
                        onScroll={(e) => this.onScroll(e.nativeEvent)}
                        scrollEventThrottle={100}
                    /> : null
                }
                <LoadingRequest status={this.state.isLoading} text={'正在搜索中...'} />
                <DialogModal ref="dialog" />
                <ShareView ref='shareView'
                    navigation={this.props.navigation}
                    getQrCode2={() => this.getQrCode2()}
                    getQrCode={() => this.getQrCode()}
                    QRCodeType={utils_tools.isNewAndroid() ? "old" : "product"}
                    types={[SHARETYPE.WEIXIN, SHARETYPE.PENGYOUQUAN, SHARETYPE.LIANJIE, SHARETYPE.ERWEIMA]}>
                    <ShareGoods money={this.state.benefitMoney} />
                </ShareView>
            </View>
        )
    }

}

const list = StyleSheet.create({
    container: {
        flex: 1,
    }
})

class NewTip extends Component {
    constructor(props) {
        super(props);

    }

    shouldComponentUpdate(props, state) {
        if (props.searchTxt == this.props.searchTxt) {
            return false
        }

        return true
    }

    render() {
        return (
            <View style={tip.container}>
                <View style={tip.sorry}>
                    <Text style={tip.txt}>
                        很抱歉，没有找到“
                    </Text>
                    <Text style={tip.key}>
                        {this.props.searchTxt}
                    </Text>
                    <Text style={tip.txt}>
                        ”相关商品
                    </Text>
                </View>
                <View style={tip.foot}>
                    <View style={tip.footLine}></View>
                    <View style={tip.footContent}>
                        <Text style={tip.footText}>
                            为您推荐
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

}

const tip = StyleSheet.create({
    container: {
        width: deviceWidth,
    },
    sorry: {
        width: deviceWidth,
        height: px(178),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    txt: {
        fontSize: px(26),
        color: '#666'
    },
    key: {
        fontSize: px(26),
        color: '#222'
    },
    foot: {
        width: deviceWidth,
        height: px(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    footLine: {
        width: px(702),
        height: px(1),
        backgroundColor: '#efefef',
    },
    footContent: {
        position: 'absolute',
        top: 0,
        width: px(142),
        height: px(40),
        left: px(304),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    footText: {
        fontSize: px(26),
        color: '#999'
    }
})

class NewHotPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            isDone: false
        }
    }

    async componentDidMount() {
        try {
            let data = await get("/search/tag/list.do")
            let { success, searchTag } = data;

            if (success) {
                this.setState({
                    list: searchTag || [],
                    isDone: true
                })
            }
        } catch (e) {
            //
        }
    }

    render() {
        if (!this.state.isDone) return null;
        return <View style={hot.container}>
            <View style={hot.title}>
                <Text style={hot.titleTxt}>热门搜索</Text>
            </View>
            <View style={hot.list}>
                {
                    this.state.list.map((item, index) => {
                        return <TouchableOpacity key={index} onPress={() => this.search(item)}>
                            <View style={hot.item}>
                                <Text
                                    style={[hot.itemTxt, item.obviousYn === 'Y' ? { color: '#d0648f' } : {}]}>{item.tagName}</Text>
                            </View>
                        </TouchableOpacity>
                    })
                }

            </View>
        </View>
    }

    search(item) {
        if (item.contextType == 99) {
            this.props.search(item.tagName, true)
        } else {
            this.props.navigate(item.tagName, item.contextType, item.context)
        }
    }

}

const hot = StyleSheet.create({
    container: {
        marginTop: px(54),
        width: deviceWidth,
        paddingHorizontal: px(24)
    },
    title: {
        flexDirection: 'row',
        height: px(30),
        alignItems: 'center',
        marginBottom: px(30)
    },
    titleTxt: {
        fontSize: px(26),
        color: '#999',
    },
    list: {
        flexDirection: 'row',
        width: deviceWidth,
        flexWrap: 'wrap'
    },
    item: {
        paddingHorizontal: px(24),
        backgroundColor: '#f5f5f5',
        borderRadius: px(5),
        overflow: 'hidden',
        height: px(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: px(20),
        marginBottom: px(20)
    },
    itemTxt: {
        fontSize: px(28),
        color: '#222'
    }
})

class NewHistoryPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            list: []
        }
    }

    async componentDidMount() {
        let list = await getItem("record")
        this.setState({
            list: list || []
        })
    }


    render() {
        if (this.state.list && this.state.list.length == 0) {
            return null;
        }
        return (
            <View style={history.container}>
                <View style={history.title}>
                    <Text style={history.titleTxt}>搜索记录</Text>
                    <TouchableOpacity onPress={() => {
                        this.setState({
                            list: []
                        })
                        setItem("record", []);
                    }}>
                        <Icon name="icon-search-del" style={{ width: px(30), height: px(30) }} />
                    </TouchableOpacity>
                </View>
                <View style={history.historyList}>
                    {
                        this.state.list.map((item, index) => {
                            return <TouchableOpacity key={index} onPress={() => this.props.search(item, true)}>
                                <View style={history.item}>
                                    <Text style={history.itemTxt}>{item}</Text>
                                </View>
                            </TouchableOpacity>
                        })
                    }
                </View>
            </View>
        );
    }

}

const history = StyleSheet.create({
    container: {
        width: deviceWidth,
        marginTop: px(54),
    },
    title: {
        width: deviceWidth,
        height: px(30),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: px(24),
        marginBottom: px(28)
    },
    titleTxt: {
        fontSize: px(26),
        color: '#999',
        flex: 1,
    },
    historyList: {
        flexDirection: 'row',
        width: deviceWidth,
        paddingHorizontal: px(24),
        flexWrap: 'wrap'

    },
    item: {
        paddingHorizontal: px(24),
        backgroundColor: '#f5f5f5',
        borderRadius: px(5),
        overflow: 'hidden',
        height: px(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: px(20),
        marginBottom: px(20)
    },
    itemTxt: {
        fontSize: px(28),
        color: '#222'
    }
})

class NewSearchBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTxt: ''
        }
    }

    render() {
        return (
            <View style={searchHead.container}>
                {
                    isIphoneX() ? <View style={searchHead.x}></View> : null
                }
                {
                    Platform.OS === 'ios' ? <View style={searchHead.ios}></View> : null
                }
                <View style={searchHead.wrap}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Icon name="icon_back"
                            style={{ width: px(34), height: px(34) }} />
                    </TouchableOpacity>
                    <View style={searchHead.searchWrap}>
                        <TouchableOpacity onPress={() => {
                            this.searchType = 'search'
                            this.props.search(this.state.searchTxt)
                        }}>
                            <Icon name="icon_search_gray"
                                style={{ width: px(34), height: px(34), marginRight: px(14), marginLeft: px(18) }} />
                        </TouchableOpacity>
                        <TextInput style={searchHead.searchInput}
                            ref="searchInput"
                            placeholder={this.props.defaultTxt || ''}
                            placeholderTextColor="#b2b3b5"
                            autoCorrect={false}
                            autoFocus={true}
                            keyboardType="web-search"
                            maxLength={20}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            value={this.state.searchTxt}
                            onFocus={() => this.focus()}
                            onChangeText={(val) => this.input(val)}
                            onChange={(event) => this.change(event)}
                            onSubmitEditing={() => {
                                this.searchType = 'search'
                                this.props.search(this.state.searchTxt)
                            }}
                        />
                    </View>
                    <TouchableOpacity onPress={() => {
                        this.searchType = 'search'
                        this.props.search(this.state.searchTxt)
                    }}>
                        <Text style={searchHead.searchTxt}>搜索</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    startSearch = false

    input(val) {
        if (this.inputStatus) {
            this.setState({
                searchTxt: val
            })
        }
    }

    inputTxt(val) {
        this.inputStatus = false
        this.setState({
            searchTxt: val
        })
    }

    timer = null

    counter = 0

    searchStatus = false

    inputStatus = true

    change(event) {
        if (this.timer) {
            clearTimeout(this.timer)
        }

        let txt = event.nativeEvent.text
        if (txt) {
            this.timer = setTimeout(async () => {
                try {
                    let counter = ++this.counter;
                    let res = await get(`https://dalingjia.com/xc_search/api/search/suggest/list?word=${txt}`)
                    let list = res.items || []
                    if (counter == this.counter && list) {
                        if (!this.searchStatus) {
                            this.searchType = 'tip'
                            this.props.changed(this.searchType, list, txt)
                        }
                    }
                } catch (e) {
                    toast(e.message)
                }
            }, 300)
        } else {
            this.searchType = 'search'
            this.props.changed(this.searchType)
        }
    }

    searchType = 'search'

    focus() {
        // if (this.state.searchTxt) {
        //     this.setState({
        //         searchTxt: ''
        //     })
        // }
        this.inputStatus = true
        this.props.changed(this.searchType)

        if (this.startSearch) {
            TrackClick('TOP', 'TOPSearchBar', '搜索结果页', '搜索');
        } else {
            this.startSearch = true;
        }
    }
}

const searchHead = StyleSheet.create({
    container: {
        width: deviceWidth,
        backgroundColor: '#fff'
    },
    x: {
        width: deviceWidth,
        height: px(50)
    },
    ios: {
        width: deviceWidth,
        height: px(44)
    },
    wrap: {
        marginTop: px(9),
        width: deviceWidth,
        height: px(64),
        marginBottom: px(23),
        paddingLeft: px(18),
        paddingRight: px(24),
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchWrap: {
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(15),
        marginRight: px(24),
        alignItems: "center",
        flex: 1,
        height: px(64)
    },
    searchInput: {
        color: "#222",
        fontSize: px(28),
        padding: 0,
        flex: 1,
    },
    searchTxt: {
        fontSize: px(28),
        color: '#222'
    }
})