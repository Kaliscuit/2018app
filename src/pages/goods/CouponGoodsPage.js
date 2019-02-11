'use strict';

import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Platform,
    ImageBackground
} from 'react-native';
import { px } from '../../utils/Ratio';
import request, { touchBaseUrl, baseUrl } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { TopHeader } from '../common/Header'
import { User, getShopDetail } from '../../services/Api'
import CartList from '../../services/Cart'
import Loading from '../../animation/Loading'
import Icon from '../../UI/lib/Icon'

import { DialogModal } from '../common/ModalView'
import utils_tools from '../../utils/tools'
import { GoodItem2 } from "../shop/GoodItem"

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isrefresh: false,
            id: this.props.navigation.state.params.id,
            name: this.props.navigation.state.params.name || '',
            from: this.props.navigation.state.params.from || '',
            list: [],
            loadText: '加载中...'

        };
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <TopHeader navigation={this.props.navigation}
                    title={'[' + this.state.name + ']适用商品'}></TopHeader>
                <FlatList
                    refreshing={this.state.isrefresh}
                    onRefresh={() => this.refresh()}
                    renderItem={({ item }) =>
                        <GoodItem2
                            item={item}
                            getDetail={() => this.getDetail(item)}
                            showShare={false}
                            navigation={this.props.navigation}
                            addCart={this.addCart.bind(this)}
                        />}
                    data={this.state.list}
                    initialNumToRender={2}
                    keyExtractor={(goods, index) => goods.uid}
                    onEndReached={() => this.nextPage()}
                    ListEmptyComponent={() => <View style={[styles.textCenter, { height: px(1000) }]}>
                        <Text style={[styles.listEnd, { width: px(750), textAlign: 'center' }]}>{this.state.from == 'stunner' ? '一大波好货正在赶来的路上' : '一大波好货正在赶来的路上，敬请期待~'}</Text>
                        {/*{
                            this.state.from == 'stunner' &&
                            <Text style={styles.listEnd}>1月15日揭晓，敬请期待～</Text>

                        }*/}
                    </View>}
                    ListFooterComponent={<View style={[styles.textCenter, styles.listEndBox]}>
                        {this.state.list.length > 0 && <Text style={{
                            textAlign: 'center',
                            fontSize: px(28), marginBottom: px(20),
                            color: "#ccc"
                        }}>{this.state.loadText}</Text>}
                    </View>} />
                <Loading ref='loading' />
                <DialogModal ref="dialog" />
            </View>)
    }

    start = 0;
    isEnd = false;
    loading = false;
    async componentDidMount() {
        this.refs.loading.open()
        await this.refresh();
    }
    /**
     * 加载下一页
     */
    async nextPage() {
        if (this.loading || this.isEnd) return;
        this.loading = true;
        if (!this.start) this.start = 0;
        this.start = this.start + 1;
        try {
            let res = ''
            if (this.state.from == 'coupon') {
                res = await request.get('/search/coupon/goodsList.do', {
                    couponId: this.state.id,
                    start: this.start,
                    limit: 30
                });
            } else if (this.state.from == 'stunner') {
                res = await request.get('/search/sc/goodsList.do', {
                    stunnerId: this.state.id,
                    start: this.start,
                    limit: 30
                });
            }
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
            res.items.map(item => item.uid = item.id + '' + this.start);
            this.setState({
                list: this.state.list.concat(res.items),
            });
        } catch (e) {
            //
        } finally {
            this.loading = false;
        }
    }

    async refresh() {
        this.loading = true;
        /* this.setState({
             isrefresh: true
         })*/
        try {
            let res = ''
            if (this.state.from == 'coupon') {
                res = await request.get('/search/coupon/goodsList.do', {
                    couponId: this.state.id,
                    start: this.start,
                    limit: 30
                });
            } else if (this.state.from == 'stunner') {
                res = await request.get('/search/sc/goodsList.do', {
                    stunnerId: this.state.id,
                    start: this.start,
                    limit: 30
                });
            }
            this.refs.loading.close()
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
            res.items.map(item => item.uid = item.id + '' + this.start);
            this.setState({ list: res.items });
        } catch (e) {
            this.refs.loading.close()
        } finally {
            /* this.setState({
                 isrefresh: false
             })*/
            this.loading = false;
            this.refs.loading.close()
        }
    }
    async addCart(id, num) {
        if (User.isLogin) {
            try {
                await CartList.addCartNum(id, num);
                toast('加入购物车成功');
            } catch (e) {
                if (e.data.oos !== 'oos') {
                    toast(e.message);
                } else {
                    this.setState({
                        specStatus: false,
                        cartStatus: false
                    });
                    this.refs.dialog.open({
                        content: [e.data.error_detail],
                        btns: [
                            { txt: "我知道了" },
                            {
                                txt: "去购物车", click: () => this.props.navigation.navigate('ShoppingCartContentPage', { isNeedBack: true })
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

    getDetail(goods) {
        this.props.navigation.navigate('DetailPage', {
            id: goods.sku ? '' : goods.id,
            sku: goods.sku
        });
    }
}

const styles = StyleSheet.create({
    imageBox: {
        position: 'relative',
        width: px(710),
        height: px(506),
    },
    textCenter: {
        justifyContent: "center",
        alignItems: "center"
    },
    goodsBox: {
        width: px(710),
        marginLeft: px(20),
        marginBottom: px(20),
    },
    goods: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    goodsCover: {
        width: px(710),
        height: px(506),
        position: 'relative',
        zIndex: 0
    },
    goods_img_cover: {
        position: 'absolute',
        left: px(267),
        top: px(172),
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
    goodsWrap: {
        paddingTop: px(25)
    },
    goodsName: {
        fontSize: px(32),
        color: '#252426',
        height: px(34),
        marginBottom: px(15),
        includeFontPadding: false
    },
    goodsDesc: {
        height: px(64),
        fontSize: px(24),
        color: '#858385',
        lineHeight: px(28),
        includeFontPadding: false,
        marginBottom: px(10)
    },
    good_under: {
        //flex:1,
        width: px(710),
        flexDirection: 'row',
        //height:px(129),
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: px(33)
    },
    priceBox: {
        // flex:1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    salePrice: {
        color: "#d0648f",
        fontSize: px(38),
        marginRight: px(12)
    },
    marketPrice: {
        color: '#858385',
        fontSize: px(24),
        textDecorationLine: 'line-through',
        marginTop: px(13)
    },
    join_share: {
        //flex:1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cartBorder: {
        width: px(78),
        height: px(64),
        borderColor: '#b2b3b5',
        borderWidth: px(1),
        borderRadius: px(10),
        marginLeft: px(20)
    },
    shareBorder: {
        height: px(64),
        paddingLeft: px(18),
        paddingRight: px(18),
        borderColor: '#b2b3b5',
        borderWidth: px(1),
        borderRadius: px(10),
        marginLeft: px(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBox_: {
        flexDirection: 'row',
    },
    goodsActionShareBtn: {
        color: '#d0648f',
        fontSize: px(26),
    },
    goodsShareIcon: {
        width: px(24),
        height: px(24),
        marginRight: px(8)
    },
    goodsActionBtn: {
        overflow: 'hidden',
        width: px(46),
        height: px(39),
        paddingTop: px(10),
        paddingBottom: px(6)
    },
    listEnd: {
        color: "#ccc"
    },
    flag: {
        width: px(45),
        height: px(27),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 100,
        borderRadius: px(4),
        overflow: 'hidden'
    },
    flag1: {
        backgroundColor: '#56beec'
    },
    flag2: {
        backgroundColor: '#6cd972'
    },
    flagBaoShui: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    flagZhiYou: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    labels: {
        position: 'absolute',
        top: px(5),
        left: px(5),
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    labelImg: {
        width: px(60),
        height: px(60),
        marginRight: px(8)
    },
    preheatBg: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: px(367),
        height: px(50),
        zIndex: 99,
        justifyContent: 'center'
    },
    preheatBigBg: {
        flex: 1,
        justifyContent: 'center',
    },
    preheatBgContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: px(710),
        height: px(50),
        zIndex: 99,
        overflow: 'hidden'
    },
    preheatTxt: {
        padding: 0,
        fontSize: px(24),
        color: '#ffffff',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        backgroundColor: 'transparent'
    }
})
