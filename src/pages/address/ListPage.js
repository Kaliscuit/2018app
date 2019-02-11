'use strict';

import React, {PureComponent} from 'react';
import {
    Image,
    Text,
    View,
    Alert,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import {px, isIphoneX} from "../../utils/Ratio";
import Request, {get, getHeader, setHeader, post} from "../../services/Request";
import {show as toast} from '../../widgets/Toast';
import Loading from '../../animation/Loading'
import {TopHeader} from '../common/Header'
import {FootView} from '../../UI/Page'
import SearchViewBar from "../common/SearchViewBar";
import util_tools from "../../utils/tools";
import Icon from '../../UI/lib/Icon'
import {TipRed} from '../common/ExplainModal'
import { setItem, getItem } from '../../services/Storage'
import base from '../../styles/Base'
//列表项
class AddressItem extends PureComponent {
    
    render() {
        const {address, selected, isSelect, isSelected, bondedPayerSwitchOnYn} = this.props;
        return <View style={styles.addressItem} key={address.id}>
            <TouchableWithoutFeedback onPress={() => this.props.select(address)}>
                <View style={styles.addressInfo}>
                    {isSelect &&
                    <View style={styles.addressCheck}>
                        {isSelected && <Icon name="icon-address-check"
                            style={{width: px(30), height: px(20), marginTop: px(50)}}/>
                        }
                    </View>
                    }
                    <View style={styles.addressDetail}>
                        <View style={styles.head}>
                            <View style={ styles.headWrap }>
                                <Text allowFontScaling={false} style={[styles.addressDetail1, {
                                    lineHeight: px(35)
                                }]}>{address.name} </Text>
                                <Text allowFontScaling={false} style={[styles.addressDetail1, {
                                    lineHeight: px(35)
                                }]}>{address.phone}</Text>
                            </View>
                            {(this.props.navigation.state.params || {}).callback && address.defaultYn == 'Y' &&
                            <View style={[styles.normalBtn, base.borderColor, base.line]}>
                                <Text allowFontScaling={false} style={[styles.normalText, base.color]}>默认</Text>
                            </View>}
                        </View>
                        <View>
                            <Text allowFontScaling={false} style={styles.addressDetail2}>
                                {address.province}-{address.city}-{address.district}
                                {address.detail}
                            </Text>
                        </View>
                        {
                            bondedPayerSwitchOnYn == 'N' && address.cardNo ?
                                <View>
                                    <Text allowFontScaling={false} style={styles.addressDetail2}>{address.cardNo}</Text>
                                </View> : null
                        }
                        {
                            util_tools.checkAddr(address.name, address.detail) &&
                            <TipRed
                                txt="地址规则更新，请重新编辑后保存"
                                styles={{marginBottom: px(24), marginTop: px(4)}}
                                width={635}/>
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View style={styles.addressAction}>
                {
                    !(this.props.navigation.state.params || {}).callback &&
                    <TouchableWithoutFeedback onPress={() => this.props.defaultSelect(address.id)}>
                        <View style={styles.radio}>
                            {
                                address.defaultYn == 'Y' &&
                                <Icon name="icon-default-address"
                                    resizeMode='cover'
                                    style={{width: px(34), height: px(34)}}/>
                            }
                            {
                                address.defaultYn == 'N' &&
                                <Icon name="icon-default-address-un"
                                    resizeMode='cover'
                                    style={{width: px(34), height: px(34)}}/>
                            }
                            <Text allowFontScaling={false} style={styles.radioLabel}>{
                                address.defaultYn == 'Y' ? '默认地址' : '设为默认'
                            }</Text>
                        </View>
                    </TouchableWithoutFeedback>
                }
                <TouchableWithoutFeedback onPress={() => this.props.goEdit(address)}>
                    <View style={styles.addressActionBtn}>
                        <Icon style={{width: px(24), height: px(24), marginTop: px(1)}}
                            name="icon-address-edit" />
                        <Text allowFontScaling={false} style={styles.addressActionBtnTxt}>编辑</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.props.delAddress(address.id)}>
                    <View style={styles.addressActionBtn}>
                        <Icon style={{width: px(25), height: px(25)}}
                            name="icon-address-del"/>
                        <Text allowFontScaling={false} style={styles.addressActionBtnTxt}>删除</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    }
    
}

export default class extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            initStatus: true, //是否显示初始化loading
            refreshing: false, //是否显示下拉加载菊花
            list: [],
            initSelected: this.props.navigation.state.params.selected,
            isSelect: !!(this.props.navigation.state.params || {}).callback,
            defaultSelected: '',
            isEnd: false,
            inputTxt: '', // 输入框输入的文本
            empty: '',    // 搜索结果为空 消息提示
            bondedPayerSwitchOnYn: 'N' // 支付人开关
        }

        this.noSelectDefault = this.props.navigation.state.params.notDefault;
        this.isCallBack = this.noSelectDefault || false;

        this.callback = (this.props.navigation.state.params || {}).callback
        
        this.deliveryAddressList = []; // 缓存全部收货地址
        this.searchs = 0;  // 搜索分页
        
        this.searchInfo_lp = '';        // 搜索信息
        this.searchs_lp = 0;            // 分页搜索
        this.isSearchAction_lp = false; // 是否是搜索动作
        this.isRequest_lp = false;      // 是否正在请求数据

        this.isDefaultAddress = false
        this.isSelectedAddress = false
        this.isDefaultSelected = false

        this.isDeleteAddress = false
    }
    
    
    render() {
        const {list, refreshing} = this.state;

        return (
            <View style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                    
                    <TopHeader navigation={this.props.navigation}
                        title={this.state.isSelect ? '选择收货地址' : '收货地址'}/>
                    <SearchViewBar
                        ref={ ref => this.textInput = ref }
                        text={"请输入收货人姓名/电话/地址"}
                        rightText={"搜索"}
                        searchAction={(event) => {
                            // 执行搜索
                            if (util_tools.isNotEmpty(event)) {
                                this.isSearchAction_lp = true;
                                this._searcDelAddress(event);
                            }
                        }}
                        onPressCancel={() => {
                            // 取消搜索
                            this.isSearchAction_lp = false;
                            this._cancelSearch();
                        }}
                        
                        onPressClear={() => {
                            this.isSearchAction_lp = false;
                            this._cancelSearch();
                        }}
                        
                        restPose={() => {
                            this.isSearchAction_lp = false;
                            this._cancelSearch();
                        }}
                    />
                    
                    <FlatList
                        data={list}
                        refreshing={refreshing}
                        onRefresh={() => this._pullToRefresh_LP()}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) =>
                            <AddressItem
                                address={item}
                                selected={this.state.selected}
                                bondedPayerSwitchOnYn={this.state.bondedPayerSwitchOnYn}
                                isSelected={item.id == (this.state.selected && this.state.selected.id)}
                                isSelect={this.state.isSelect}
                                navigation={this.props.navigation}
                                defaultSelect={this.defaultSelect.bind(this, item.id)}
                                goCreate={this.goCreate.bind(this)}
                                goEdit={this.goEdit.bind(this, item)}
                                delAddress={this.delAddress.bind(this, item.id)}
                                select={this.select.bind(this, item)}
                            />
                        }
                        onEndReached={() => {
                            // this.setState({isEnd:true}, () => this.next());
                            this._pullOnLoadingMore_LP()
                        }}
                        ListEmptyComponent={
                            <Text style={styles.emptyList} allowFontScaling={false}>{this.state.empty}</Text>
                        }
                    />
                    
                    <View style={{width: px(750), height: isIphoneX() ? px(155) : px(95)}}/>
                    <Loading ref='loading'/>
                    <FootView>
                        <TouchableWithoutFeedback onPress={() => this.goCreate()}>
                            <View style={styles.footer}>
                                <Text allowFontScaling={false} style={styles.footerTxt}>添加地址</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </FootView>
                </KeyboardAvoidingView>
            </View>
        )
    }
    
    async componentDidMount() {
        this.refs.loading.open()
        await this.refresh();
    }
    loading = false;
    isEnd = false;
    start = 0;
    async load() {
        if (this.loading) return
        let uid = getHeader('uid')

        this.loading = true;

        try {
            let res_ = await get(`/address/nqueryListV1.do?start=${this.start}`);
            let res = res_.addressList, bondedPayerSwitchOnYn = res_.bondedPayerSwitchOnYn
            let datas = res.items; //res.items
            this.refs.loading.close && this.refs.loading.close();

            this.deliveryAddressList = datas; // 缓存数据
            this.loading = false;
            if (res.totalPages < 2) {
                this.setState({
                    loadText: '别扯了，到底啦'
                })
                this.isEnd = true;
            }
            if (!res.items && res.items.length == 0) {
                this.isEnd = true;
                return;
            }

            
            const defaultAddress = this.deliveryAddressList.filter(item => item.defaultYn === 'Y')[0]

            this.isDefaultAddress && await setItem('defaultAddress', JSON.stringify(defaultAddress || {}))
            if (this.isDefaultSelected) {
                await setItem(`selectAddress${uid}`, JSON.stringify(defaultAddress || {}))
                setHeader('province', encodeURIComponent(defaultAddress.province));
                setHeader('city', encodeURIComponent(defaultAddress.city));
                setHeader('district', encodeURIComponent(defaultAddress.district));
            }

            this.setState({
                list: datas || [],
                bondedPayerSwitchOnYn
            }, async () => {
                let uid = getHeader('uid')
                if (this.state.list.length != 0) {
                    let selected = this.state.initSelected || !this.noSelectDefault && this.state.list[0]
                    if (this.isSelectedAddress) {
                        await setItem(`selectAddress${uid}`, JSON.stringify(defaultAddress))

                        setHeader('province', encodeURIComponent(defaultAddress.province));
                        setHeader('city', encodeURIComponent(defaultAddress.city));
                        setHeader('district', encodeURIComponent(defaultAddress.district));

                        this.callback && this.callback(defaultAddress)

                        selected = defaultAddress
                    }

                    this.setState({
                        selected: selected || !this.noSelectDefault && this.state.list[0]
                    });
                } else {

                    let newSelectAddress = {
                        city: '北京市',
                        district: '朝阳区',
                        province: '北京市'
                    }
                    
                    await setItem(`selectAddress${uid}`, JSON.stringify(newSelectAddress))
                    setHeader('province', encodeURIComponent('北京市'));
                    setHeader('city', encodeURIComponent('北京市'));
                    setHeader('district', encodeURIComponent('朝阳区'));

                    this.setState({
                        selected: newSelectAddress
                    })

                    if (this.isSelectedAddress && this.isCallBack) {
                        this.props.navigation.goBack()
                    }
                }

                this.isSelectedAddress = false
            })
        } catch (e) {
            toast(e.message)
        } finally {
            this.loading = false;
            this.isSearchAction_lp = false;
            this.isDefaultSelected = false;
            this.isDefaultAddress = false;
            this.setState({
                initStatus: false,
                refreshing: false,
                empty: "暂无收货地址"
            });
        }
    }
    
    refresh() {
        this.loading = false;
        this.load();
    }
    
    async next() {
        if (this.loading || this.isEnd) return;
        this.loading = true;
        if (!this.start) this.start = 0;
        this.start = this.start + 1;
        try {
            let res_ = await get(`/address/nqueryListV1.do?start=${this.start}`);
            let res = res_.addressList, bondedPayerSwitchOnYn = res_.bondedPayerSwitchOnYn
            let datas = this.state.list.slice().concat(res.items); //res.items
            this.refs.loading.close && this.refs.loading.close();
            
            this.deliveryAddressList = datas; // 缓存数据
            if (res.totalPages <= this.start + 1) {
                this.setState({
                    loadText: '别扯了，到底啦'
                })
                this.isEnd = true;
            }
            if (!res.items && res.items.length == 0) {
                this.isEnd = true;
                return;
            }
            this.setState({
                list: datas || [],
                //selected: selected || !this.noSelectDefault && res.items[0]
            }, () => {
                if (this.state.list.length != 0) {
                    let selected = this.state.initSelected;
                    this.setState({
                        selected: selected || !this.noSelectDefault && this.state.list[0]
                    })
                }
            });
        } catch (e) {
            toast(e.message);
        } finally {
            this.loading = false;
            this.isSearchAction_lp = false;
            this.setState({
                initStatus: false,
                refreshing: false,
                empty: "暂无收货地址"
            });
        }
    }
    
    componentWillUnmount() {
        if (this.state.selected && this.state.isSelect && !this.isCallBack) {
            this.props.navigation.state.params.callback(this.state.selected);
        }
    }

    defaultSelect(id) {
        let uid = getHeader('uid')
        this.setState({
            defaultSelected: id
        })
        
        this.state.list.map(async (item) => {
            if (item.id == id) {
                if (item.defaultYn == 'Y') return

                item.defaultYn = 'Y'
                let data = Object.assign({}, item);
                delete data.cardNo;
                try {
                    await post(`/address/update_default.do?id=${item.id}&defaultYn=${item.defaultYn}`);
                    
                    await setItem(`selectAddress${uid}`, JSON.stringify(item))
                    await setItem('defaultAddress', JSON.stringify(item))
                    setHeader('province', encodeURIComponent(item.province));
                    setHeader('city', encodeURIComponent(item.city));
                    setHeader('district', encodeURIComponent(item.district));
                } catch (e) {
                    toast(e.message);
                }
            } else {
                item.defaultYn = 'N'
            }
        })
    }

    goBack (isSelected, data) {
        console.log(data, isSelected)
        if (!data) return false
        this.isDefaultSelected = isSelected
        this.deliveryAddressList = []
        this.textInput.manuallyRemove()
        this.refresh()
    }
    
    goCreate() {
        this.props.navigation.navigate('AddressEditorPage', {
            bondedPayerSwitchOnYn: this.state.bondedPayerSwitchOnYn,
            callback: (data, isSelected, address) => this.goBack(isSelected, address),
            isSwitch: !!this.state.list.length
        })
    }
    
    goEdit(address) {
        this.props.navigation.navigate('AddressEditorPage', {
            bondedPayerSwitchOnYn: this.state.bondedPayerSwitchOnYn,
            addressId: address.id,
            callback: (data, isSelected, address) => this.goBack(isSelected, address),
            isSwitch: address.defaultYn == 'N' ? true : false
        })
    }
    
    async delAddress(id) {
        let uid = getHeader('uid')
        let selectAddress = JSON.parse(await getItem(`selectAddress${uid}`)) || {}
        
        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要删除么？`,
                [{
                    text: '取消', onPress: () => resolve(false)
                }, {
                    text: '删除', onPress: () => resolve(true)
                }]
            )
        })

        if (!confirm) return

        this.isDefaultAddress = this.state.list.some(item => {
            if (item.id === id) return item.defaultYn === 'Y'
        })

        this.isSelectedAddress = id === selectAddress.id

        await post('/address/delete.do', {id: id})
        await this._pullToRefresh_LP()
    }
    
    select(address) {

        if (!this.state.isSelect) return
        if (util_tools.checkAddr(address.name, address.detail)) return

        if (this.isSelectedAddress) return

        this.setState({
            selected: address
        })

        if (this.isCallBack) {
            this.callback && this.callback(address)
            this.isCallBack = !this.isCallBack;
        }

        this.props.navigation.goBack();
    }

    totalPages = 2;
    
    /**
     * 搜索收货地址
     * @param searchCriteria 搜索条件
     * @private
     */
    async _searcDelAddress(searchCriteria) {
        this.isSearch = true
        this.searchInfo_lp = searchCriteria;
        let searchResult = [];
        this.searchs_lp = 0;
        try {
            let res_ = await Request.get('/address/nqueryListV1.do', {
                start: this.searchs_lp,
                prodIds: this.state.id,
                name: searchCriteria
            });
            let res = res_.addressList
            searchResult = res.items;

            const defaultAddress = this.deliveryAddressList.filter(item => item.defaultYn === 'Y')[0]

            this.isDefaultAddress && await setItem('defaultAddress', JSON.stringify(defaultAddress || {}))

            this.totalPages = res.totalPages
            
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
        this.refresh()
        // this.setState({list: this.deliveryAddressList});
    }
    
    /**
     * 搜索信息 分页加载
     *
     * @private
     */
    async _padingSearch_LP() {
        if (this.searchs_lp >= this.totalPages || this.isRequest_lp) return 
        if (!this.searchInfo_lp || this.searchInfo_lp == '') return;

        this.searchs_lp++;
        this.isRequest_lp = true

        let searchRes = [];
        
        try {
            let res_ = await Request.get('/address/nqueryListV1.do', {
                start: this.searchs_lp,
                prodIds: this.state.id,
                name: this.searchInfo_lp
            });
            searchRes = res_.addressList.items;
            if (!searchRes || searchRes.constructor !== Array) return;
        } catch (e) {
            toast(e.message);
        } finally {
            this.isRequest_lp = false
            if (searchRes != null) {
                this.setState({
                    list: this.state.list.concat(searchRes),
                    empty: `没有"${this.searchInfo_lp}"相关的地址`
                });
            } else {
                this.setState({
                    list: this.state.list,
                    empty: `没有"${this.searchInfo_lp}"相关的地址`
                });
            }
        }
    }
    
    /**
     * 下拉刷新
     * @private
     */
    _pullToRefresh_LP() {
        if (this.isSearchAction_lp){
            this._searcDelAddress(this.searchInfo_lp);
        } else {
            this.refresh()
        }
    }
    
    _pullOnLoadingMore_LP() {
        if (this.isSearchAction_lp){
            this._padingSearch_LP();
        } else {
            this.next();
        }
    }
}

const styles = StyleSheet.create({
    
    container: {
        // flex: 1,
        height:'100%',
        backgroundColor: '#f5f3f6',
        overflow: 'hidden'
    },
    
    page: {
        flex: 1
    },
    radio: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: px(40)
    },
    radioLabel: {
        position: 'relative',
        top: px(4),
        paddingLeft: px(15),
        fontSize: px(26),
        color: '#858385',
        includeFontPadding: false
    },
    head: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: px(22),
        marginBottom: px(12)
    },
    headWrap: {
        maxWidth: px(470),
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    normalBtn: {
        borderWidth: px(1),
        marginLeft: px(10),
        width: px(48),
        height: px(28),
        borderRadius: px(3),
        overflow: 'hidden'
    },
    normalText: {
        fontSize: px(20),
        textAlign: 'center'
    },
    addressItem: {
        backgroundColor: '#fff',
        marginTop: px(24)
    },
    
    addressInfo: {
        flexDirection: 'row',
        paddingHorizontal: px(40)
    },
    
    addressCheck: {
        width: px(60)
    },
    
    addressDetail: {
        flex: 1
    },
    
    addressDetail1: {
        color: '#212121',
        fontSize: px(28),
        includeFontPadding: false
    },
    
    addressDetail2: {
        color: '#7a787a',
        fontSize: px(24),
        marginBottom: px(10),
        includeFontPadding: false
    },
    
    addressAction: {
        borderTopWidth: px(1),
        borderTopColor: '#edeced',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: px(28),
        paddingBottom: px(22),
        paddingRight: px(60)
    },
    
    addressActionBtn: {
        flexDirection: 'row',
        marginLeft: px(40)
    },
    
    addressActionBtnTxt: {
        fontSize: px(24),
        marginLeft: px(12),
        includeFontPadding: false
    },
    
    footer: {
        height: px(90),
        width: px(750),
        paddingTop: px(30),
        backgroundColor: '#d0648f',
    },
    
    footerTxt: {
        fontSize: px(30),
        textAlign: 'center',
        color: '#fff',
        includeFontPadding: false
    },
    
    emptyList: {
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    }
})
