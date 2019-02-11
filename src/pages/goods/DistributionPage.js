import React, {PureComponent, Component} from "react";

import {
    Image,
    Text,
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Picker,
    KeyboardAvoidingView
} from "react-native";
import Address from 'react-native-city-picker';

import {TopHeader} from '../common/Header';
import {px, isIphoneX} from "../../utils/Ratio";
import Request, {get, baseUrl, touchBaseUrl, setHeader, getHeader} from "../../services/Request";
import {show as toast} from '../../widgets/Toast';
import Page, {FootView} from '../../UI/Page';
import base from '../../styles/Base';

const PAGE_SIZE = 30;
import {getItem, setItem} from '../../services/Storage';
import SearchViewBar from "../common/SearchViewBar";
import util_tools from "../../utils/tools";
import {TipRed} from '../common/ExplainModal'

const os = Platform.OS == "ios" ? true : false;

class AddressItem extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            fullScreenStatus: false,
        }
    }

    render() {
        const {address} = this.props;
        return (
            <TouchableWithoutFeedback onPress={() => this.props.select(address)}>
                <View style={addressStyles.address}>
                    <View style={addressStyles.line1}>
                        <Text
                            allowFontScaling={false}
                            style={[addressStyles.line1Txt, address.isCreateOrder == 0 ? addressStyles.noSendText : addressStyles.line1Txt_]}>
                            {address.name} {address.phone}
                        </Text>
                        {
                            address.isCreateOrder == 0 &&
                                <View style={[addressStyles.noSend, base.line]}>
                                    <Text style={addressStyles.noSendTxt} allowFontScaling={false}>暂不配送</Text>
                                </View>
                        }
                        {
                            address.defaultYn == 'Y' && <View
                                style={[addressStyles.default_, base.borderColor, base.line, {marginLeft: address.isCreateOrder == 0 ? px(10) : px(0)}]}>
                                <Text style={[addressStyles.defaultTxt, base.color]} allowFontScaling={false}>默认</Text>
                            </View>
                        }
                    </View>
                    <Text allowFontScaling={false}
                        style={[{marginBottom: address.cardNo ? px(20) : px(0)}, addressStyles.line2Txt, address.isCreateOrder == 0 ? addressStyles.noSendText : addressStyles.line2Txt_]}>
                        {address.province}-{address.city}-{address.district}
                        {address.detail}
                    </Text>
                    {
                        address.cardNo && <Text allowFontScaling={false}
                            style={[addressStyles.line2Txt, address.isCreateOrder == 0 ? addressStyles.noSendText : addressStyles.line2Txt_]}>{address.cardNo}</Text>
                    }
                    {
                        util_tools.checkAddr(address.name, address.detail) &&
                        <TipRed
                            txt="地址规则更新，请重新编辑后保存"
                            styles={{marginBottom: px(24), marginTop: px(24)}}
                            width={635}/>
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    }

}

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.navigation.state.params.id,
            from: this.props.navigation.state.params.from,
            refreshing: false,
            list: [],
            empty: '',
            province: '',
            city: '',
            district: '',
            provinceList: [],
            cityList: [],
            districtList: [],
            localAddress: {},
            selectAddress: [],
            isSearchAction: false,
            searchRefreshing: false,
            searchList: [],
            searchEmpty: '',

        };
        this.loading = false;
        this.hasNext = true;
        this.start = 0;

        this.searchInfo = '';        // 搜索信息
        this.searchs = 0;            // 分页搜索
        this.AddressList = [];       // 缓存全部地址数据
        this.isSearchAction = false; // 是否是搜索动作
        this.isRequest = false;      // 是否正在请求数据

        this.addressList = [] // 缓存地址数据
    }

    title = "配送至";

    // 处理省份数据
    dispatchData (prev, index) {
        const prevAddress = this.addressList[index - 1]
        let result = []

        if (typeof prevAddress[0] === 'string') return false

        let firstFilter = prevAddress.filter(address => {
            let current = Object.keys(address)[0]
            return current === prev
        })[0]

        result = firstFilter[prev]
        this.addressList[index] = firstFilter[prev]

        if (typeof firstFilter[prev][0] === 'object') {
            result = firstFilter[prev].map(item => Object.keys(item)[0])
        }

        return result
    }

    // 数据调用及初始化
    async initPage (prev, index) {
        if (index === 0) {
            return this.state.provinceList
        }

        return this.dispatchData(prev, index)
    }

    render() {
        return <View style={{flex: 1}}>
            <TopHeader
                title={this.title}
                navigation={this.props.navigation}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                <SearchViewBar
                    rightText={"搜索"}
                    text={"请输入收货人姓名/电话/地址"}
                    searchAction={(event) => {
                        if (util_tools.isNotEmpty(event)) {
                            this.isSearchAction = true;
                            this._searchShiAddress(event);
                        }
                    }}
                    onPressCancel={() => {
                        this.isSearchAction = false;
                        this._cancelSearch();
                    }}

                    onPressClear={() => {
                        this.isSearchAction = false;
                        this._cancelSearch();
                    }}

                    restPose={() => {
                        this.isSearchAction = false;
                        this._cancelSearch();
                    }}
                />
                <FlatList
                    data={this.state.list}
                    refreshing={this.state.refreshing}
                    initialNumToRender={3}
                    numColumns={1}
                    extraData={this.state}
                    onRefresh={() => this._pullToRefresh()}
                    onEndReached={() => this._pullOnLoadingMore()}
                    renderItem={({item, index}) => {
                        return <AddressItem
                            index_={index}
                            address={item}
                            navigation={this.props.navigation}
                            select={this.select.bind(this)}
                        />
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <Text allowFontScaling={false} style={[styles.emptyList, base.color1]}>{this.state.empty}</Text>
                    }/>

                <View style={{width: px(750), height: isIphoneX() ? px(155) : px(95)}}/>
            </KeyboardAvoidingView>
            <Address
                ref={ ref => this.address = ref }
                load={ this.initPage.bind(this) }
                tabs={ this.state.selectAddress }
                prompt="请选择"
                titleStyle={ {
                    content: { borderTopLeftRadius: px(20), borderTopRightRadius: px(20) }
                } }
                contentStyle={ { backgroundColor: '#F2F2F2' } }
                listStyle={ {
                    content: {},
                    text: { color: '#666', fontSize: px(28) }
                } }
                tabStyle={ {
                    content: { borderBottomWidth: 0 },
                    line: { bottom: 4 },
                    text: { fontSize: px(28), color: '#222', fontWeight: '500' }
                } }
                activeColor="#D0648F"
                result={ selectAddress => this.iosSelect(selectAddress) }
            />
            <FootView>
                <TouchableWithoutFeedback onPress={() => this.switchCity()}>
                    <View style={[styles.footer, base.backgroundColor, base.line]}>
                        <Text style={styles.footerTxt} allowFontScaling={false}>选择其他地址区域</Text>
                    </View>
                </TouchableWithoutFeedback>
            </FootView>
        </View>
    }

    componentDidMount () {
        this.onReady()
    }

    async iosSelect(selectAddress) {
        let address = {
            province: selectAddress[0],
            city: selectAddress[1],
            district: selectAddress[2],
        }
        let uid = getHeader('uid')
        await setItem(`selectAddress${uid}`, JSON.stringify(address))
        setHeader('province', encodeURIComponent(address.province));
        setHeader('city', encodeURIComponent(address.city));
        setHeader('district', encodeURIComponent(address.district));
        this.props.navigation.state.params.call(selectAddress[0], selectAddress[1], selectAddress[2]);
        this.props.navigation.goBack();
    }

    async onReady() {
        await this.refreshDistri();
        let localAddress = JSON.parse(await getItem('address'));
        let provinceList = [];
        for (let i in localAddress) {
            for (let j in localAddress[i]) {
                provinceList.push(j)
            }
        }

        this.addressList.push(localAddress)
        this.setState({ provinceList })
    }

    async refreshDistri() {
        this.hasNext = true
        this.start = 0

        let list = await this.getList()

        this.AddressList = list
        this.setState({
            list: list
        })
    }

    async getList() {
        if (!this.hasNext || this.loading) {
            return [];
        }
        this.loading = true;
        try {
            let res = await Request.get(`/address/nqueryList.do?start=${this.start}&prodIds=${this.state.id}`);
            this.start = this.start + 1;
            this.hasNext = (res.items || []).length == PAGE_SIZE;
            return res.items || [];
        } catch (e) {
            toast(e.message);
            return [];
        } finally {
            this.loading = false;
            this.setState({empty: "暂无收货地址"})
        }
    }

    async next() {
        let list = await this.getList();
        this.setState({
            list: this.state.list.concat(list)
        });
    }

    /**
     * 搜索配送地址
     * @param searchCriteria 搜索条件
     * @private
     */
    async _searchShiAddress(searchCriteria) {
        this.searchInfo = searchCriteria;
        let searchResult = [];
        this.searchs = 0;
        try {
            let res = await Request.get('/address/nqueryList.do', {
                start: this.searchs,
                prodIds: this.state.id,
                name: searchCriteria
            });
            searchResult = res.items;


            if (!searchResult || searchResult.constructor !== Array) return;
        } catch (e) {
            toast(e.message);
        } finally {
            if (searchResult != null) {
                this.setState({
                    list: searchResult,
                    empty: `没有"${searchCriteria}"相关的地址`
                });
            } else {
                this.setState({
                    list: [],
                    empty: `没有"${searchCriteria}"相关的地址`
                });
            }
        }
    }

    /**
     * 取消搜索，展示地址数据
     * @private
     */
    _cancelSearch() {
        this.setState({list: this.AddressList});
    }

    /**
     * 分页搜索
     */
    async _padingSearch() {
        if (this.isRequest) return;  // 如果正在请求数据,
        if (!this.searchInfo || this.searchInfo == '') return; // 如果搜索信息为空

        this.isRequest = true;
        this.searchs++;
        let searchRes = [];
        try {
            let res = await Request.get('/address/nqueryList.do', {
                start: this.searchs,
                prodIds: this.state.id,
                name: this.searchInfo,
            });
            searchRes = res.items;
            if (!searchRes || searchRes.constructor !== Array) return;
        } catch (e) {
            toast(e.message);
        } finally {
            this.isRequest = false;
            if (searchRes != null) {
                this.setState({
                    list: this.state.list.concat(searchRes),
                    empty: `没有"${this.searchInfo}"相关的地址`
                });
            } else {
                this.setState({
                    list: this.state.list,
                    empty: `没有"${this.searchInfo}"相关的地址`
                });
            }


        }
    }

    /**
     * 下拉刷新
     * @private
     */
    _pullToRefresh() {
        if (this.isSearchAction) {
            this._padingSearch();
        } else {
            this.refreshDistri();
        }
    }

    /**
     * 上拉加载更多
     */
    _pullOnLoadingMore() {
        if (this.isSearchAction) {
            this._padingSearch();
        } else {
            this.next();
        }

    }

    keyBlur() {
        Keyboard.dismiss();
    }

    switchCity() {
        this.address.open()
    }

    async select(address) { // 选中列表之后
        if (address.isCreateOrder == 0) {
            return;
        } else {
            let uid = getHeader('uid')
            await setItem(`selectAddress${uid}`, JSON.stringify(address))
            setHeader('province', encodeURIComponent(address.province));
            setHeader('city', encodeURIComponent(address.city));
            setHeader('district', encodeURIComponent(address.district));
            let {province, city, district} = address
            this.props.navigation.state.params.call(province, city, district, address);
            this.props.navigation.goBack();
        }

    }
}

const styles = StyleSheet.create({
    header: {
        height: px(96),
        //backgroundColor: "#f2f2f2",
        paddingHorizontal: px(30)
    },
    headerSearchBar: {
        borderRadius: px(35),
        height: px(56),
        width: px(605),
        overflow: 'hidden',
        marginLeft: px(10),
        backgroundColor: '#fff'
    },
    headerSearchImg: {
        marginLeft: px(16),
        width: px(28),
        height: px(28),
        marginRight: px(8)
    },
    headerSearchInput: {
        width: px(570),
        color: "#b2b3b5",
        fontSize: px(26),
    },
    emptyList: {
        flex: 1,
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center'
    },
    footer: {
        width: px(750),
        height: px(98)
    },
    footerTxt: {
        color: '#fff',
        fontSize: px(34)
    },
    formPicker: {
        flex: 1,
        borderWidth: 0,
        padding: 0
    },
    picker_box: {
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 99999,
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    picker2: {
        flexDirection: 'row',
        backgroundColor: '#fff'
    },
    tab: {
        flexDirection: 'row',
        height: px(90)
    },
    tab_view1: {
        flex: 1,
        justifyContent: 'center'
    },
    tab_txt1: {
        textAlign: 'left',
        fontSize: px(30),
        color: '#fff',
        paddingLeft: px(30),
    },
    tab_txt2: {
        textAlign: 'right',
        fontSize: px(30),
        color: '#fff',
        paddingRight: px(30),
    }
});

const addressStyles = StyleSheet.create({
    address: {
        backgroundColor: "#fff",
        padding: px(30),
        paddingTop: px(25),
        flex: 1,
        justifyContent: 'space-between',
        marginBottom: px(20)
    },
    noSendText: {
        color: '#b5b5b5'
    },
    line1Txt: {
        maxWidth: px(560),
        fontSize: px(34),
        marginRight: px(20)
    },
    line1Txt_: {
        color: '#333'
    },
    line2Txt: {
        fontSize: px(26)
    },
    line2Txt_: {
        color: '#848484'
    },
    line1: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: px(15)
    },
    noSend: {
        backgroundColor: '#ec4158',
        borderRadius: px(3),
        overflow: 'hidden',
        width: px(89),
        height: px(28)
    },
    noSendTxt: {
        color: '#fff',
        fontSize: px(20),
        textAlign: 'center'
    },
    default_: {
        borderWidth: px(1),
        marginLeft: px(10),
        width: px(48),
        height: px(28),
        borderRadius: px(3),
        overflow: 'hidden'
    },
    defaultTxt: {
        fontSize: px(20),
        textAlign: 'center'
    }
})