'use strict';

import React from 'react';
import {
    Image,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    Platform
} from "react-native";
import { User } from '../../services/Api';
import { isIphoneX, px } from "../../utils/Ratio";
import request, { get, post, getHeader } from "../../services/Request";
import { show as toast } from '../../widgets/Toast';
import Page, { FootView } from '../../UI/Page';
import Icon from '../../UI/lib/Icon';
import base from '../../styles/Base';
import CartList from '../../services/Cart';

class ListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.goods;
    }
    render() {
        const {goods} = this.props
        return <TouchableOpacity activeOpacity={0.9} onPress={() => this.getDetail(goods)}>
            <View style={[styles.good]} onLayout={(e => this.setLayout_(e.nativeEvent))}>
                <View>
                    <Image
                        source={{ uri: goods.show ? goods.image : require('../../images/img2') }}
                        style={styles.image}
                    />
                    {goods.limitStock === 0 &&
                    <View style={styles.goods_img_cover}>
                        <Text allowFontScaling={false} style={styles.goods_img_txt}>抢光了</Text>
                    </View>
                    }
                    <View style={styles.labels2}>
                        {goods.labelList && goods.labelList.length > 0 && goods.labelList.map((label) =>
                            <Image key={label.labelId}
                                resizeMode="contain" resizeMethod="scale"
                                style={[styles.labelImg, { width: px(label.width), height: px(label.height) }]}
                                source={{ uri: label.labelLogo, cache: "force-cache" }} />
                        )}
                    </View>
                </View>
                <View style={styles.right}>
                    <View>
                        <Text allowFontScaling={false}
                            numberOfLines={1}
                            style={styles.goodsShowName}>
                            {goods.goodsShowName}
                        </Text>
                        <View style={styles.txt}>
                            {goods.isInBond == 1 &&
                            <Icon name="bond"
                                style={styles.bond}/>
                            }
                            {goods.isForeignSupply == 2 &&
                            <Icon name="isForeignSupply"
                                style={styles.bond}/>
                            }
                            <Text allowFontScaling={false} style={styles.goodsShowDesc} numberOfLines={2}>
                                {goods.isInBond == 1 && <Text style={styles.flagLen}>flagLen</Text>}
                                {goods.isForeignSupply == 2 && <Text style={styles.flagLen}>flagLen</Text>}
                                {goods.goodsShowDesc}
                            </Text>
                        </View>
                    </View>
                    <View style={base.inline_between}>
                        <Text allowFontScaling={false} style={styles.salePrice}>
                            ￥<Text allowFontScaling={false} style={styles.salePrice_}>
                                {goods.salePrice}
                            </Text>
                        </Text>
                        <TouchableWithoutFeedback
                            onPress={() => this.props.addCart(goods.id, 1)}>
                            <View style={[styles.cartC, base.line]}>
                                <Icon name="icon-index-cartNew"
                                    style={styles.cart}/>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
    
                
            </View>
        </TouchableOpacity>
    }
    /**
     * 跳转到详情页
     */
    setLayout_(e) {
        this.props.setLayout_ && this.props.setLayout_(e, this.props.index);
    }
    
    getDetail() {
        this.props.navigation.navigate('DetailPage', {
            id: this.props.goods.sku ? '' : this.props.goods.id,
            sku: this.props.goods.sku
        });
    }
}
export default class extends Page {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            isrefresh: false,
            loadText: '加载中...',
            total_price: '',
            postal_explain: '',
            error_detail: '',
            supplier_code: this.props.navigation.state.params.supplier_code || ''
        };

        this.layout = [];
    }
    
    title = '凑单包邮'
    
    pageBody() {
        
        return (
            <View style={styles.container}>
                <FlatList
                    onScroll={(e) => this._onScroll(e.nativeEvent)}
                    refreshing={this.state.isrefresh}
                    onRefresh={() => this.refresh()}
                    renderItem={({ item, index }) =>
                        <ListItem
                            goods={item}
                            index={index}
                            navigation={this.props.navigation}
                            addCart={this.addCart.bind(this)}
                            setLayout_={this.setLayout_.bind(this)}
                        />}
                    data={this.state.list}
                    initialNumToRender={2}
                    keyExtractor={(goods, index) => goods.id + ''}
                    onEndReached={() => this.nextPage()}
                    ListEmptyComponent={() => <View style={[styles.textCenter, { height: px(1000) }]}>
                        <Text style={[styles.listEnd, { width: px(750), textAlign: 'center' }]}>
                            暂无数据
                        </Text>
                    </View>}
                    ListFooterComponent={<View style={[styles.textCenter, styles.listEndBox]}>
                        {this.state.list.length > 0 && <Text style={{
                            textAlign: 'center',
                            fontSize: px(28), marginBottom: px(20),
                            color: "#ccc"
                        }}>{this.state.loadText}</Text>}
                    </View>} />
                <View style={{ width: px(750), height: isIphoneX() ? px(155) : px(95) }} />
            </View>
        );
    }
    
    pageFooter() {
        const {total_price, postal_explain, error_detail} = this.state
        //if (!this.state.totalAmount) return null;
        return <FootView>
            {
                error_detail &&
                <View style={[styles.footerTip, base.inline]}>
                    <Text allowFontScaling={false} style={styles.footerTxt}>
                        {error_detail}
                    </Text>
                </View>
            }
            <View style={[styles.bottom, base.inline_between]}>
                <View style={styles.b_left}>
                    <Text allowFontScaling={false} style={styles.total}>
                        商品总计
                        <Text allowFontScaling={false} style={base.color}>
                            ￥{total_price || ''}
                        </Text>
                    </Text>
                    <Text allowFontScaling={false} style={styles.explain}>
                        {postal_explain || ''}
                    </Text>
                </View>
                <TouchableWithoutFeedback onPress={() => this.goCart()}>
                    <View style={[styles.b_right, base.backgroundColor, base.line]}>
                        <Text allowFontScaling={false} style={styles.btn}>
                            回购物车结算
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </FootView>
    }
    
    start = 0;
    isEnd = false;
    loading = false;
    layout = [];
    itemHeight = px(180);
    setLayout_(e, index) {
        this.layout[index] = e.layout.height
    }
    
    showImage(index) {
        if (this.timer) return;
        this.timer = setTimeout(() => {
            let list = this.state.list.filter((item, i) => {
                item.show = i >= index - 7 && i < index + 7
                return item;
            })
            this.setState({ list })
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        }, 200);
    }
    _onScroll(e) {
        const y = e.contentOffset.y;
        let index = 0;
        let curr = 0;
        while (y > curr) {
            if (!this.layout[index]) break;
            curr += this.layout[index];
            index++;
        }
        this.showImage(index);
    }
    
    async onReady() {
        await this.refresh();
        this.showImage(0)
    }
    async nextPage() {
        if (this.loading || this.isEnd) return;
        this.loading = true;
        if (!this.start) this.start = 0;
        this.start = this.start + 1;
        try {
            let res = await request.get(`/goods/search/addonOrderGoods.do?start=${this.start}&supplierCode=${this.state.supplier_code}`);
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
            let h = this.itemHeight
            this.layout.push({ h });
            this.setState({
                list: this.state.list.concat(res.items),
            });
        } catch (e) {
            //
        } finally {
            this.loading = false;
        }
    }
    
    async getTotal() {
        try {
            let res = await request.get(`/api/cartnew/cartExt?supplierCode=${this.state.supplier_code}`);
            this.setState({
                total_price: res.total_price || 0,
                postal_explain: res.postal_explain || '',
                error_detail: res.error_detail
            });
        } catch (e) {
        
        } finally {
            this.loading = false;
        }
    }
    
    async refresh() {
        this.loading = true;
        this.isEnd = false;
        this.start = 0;
        try {
            let res = await request.get(`/goods/search/addonOrderGoods.do?start=${this.start}&supplierCode=${this.state.supplier_code}`);
            this.loading = false;
            if (res.totalPages < 2) {
                this.setState({
                    loadText: ''
                })
                this.isEnd = true;
            }
            if (!res.items && res.items.length == 0) {
                this.isEnd = true;
                return;
            }
            await this.getTotal()
            this.setState({ list: res.items });
        } catch (e) {
        
        } finally {
            this.loading = false;
        }
    }
    async addCart(id, num) {
        if (User.isLogin) {
            try {
                await CartList.addCartNum(id, num);
                toast('加入购物车成功');
                await this.getTotal()
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
    
    
    goCart() { //加个刷新回调
        this.props.navigation.state.params.callback()
        this.props.navigation.goBack()
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    good: {
        height: px(180),
        width: px(702),
        marginHorizontal: px(24),
        marginTop: px(24),
        flexDirection: 'row'
    },
    image: {
        width: px(180),
        height: px(180),
        borderRadius: px(8),
        overflow: 'hidden',
        position: 'relative',
    },
    goods_img_cover: {
        position: 'absolute',
        left: px(35),
        top: px(35),
        zIndex: 1,
        width: px(110),
        height: px(110),
        borderRadius: px(55),
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    goods_img_txt: {
        fontSize: px(26),
        color: '#fff'
    },
    labelImg: {
        width: px(60),
        height: px(60),
        marginRight: px(8)
    },
    labels2: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? px(8) : px(8),
        //left: Platform.OS === 'ios' ? px(28) : px(28),
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    right: {
        flex: 1,
        marginLeft: px(24),
        paddingVertical: px(8),
        justifyContent: 'space-between',
    },
    goodsShowName: {
        fontSize: 14,
        color: '#222',
        includeFontPadding: false,
    },
    txt: {
        flexDirection: "row",
        marginTop: px(10)
    },
    bond: {
        width: px(44),
        height: px(24),
        position: "absolute",
        //left: px(30),
        top: px(5),
        zIndex: 100,
    },
    flagLen: {
        fontSize: px(17),
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: "center",
        color: '#fff',
    },
    goodsShowDesc: {
        flex: 1,
        fontSize: px(24),
        color: '#666',
        fontWeight: 'normal'
    },
    salePrice: {
        fontSize: px(24),
        color: "#222",
        includeFontPadding: false,
    },
    salePrice_: {
        fontSize: px(30),
        includeFontPadding: false,
    },
    cartC: {
        width: px(86),
        height: px(52),
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    cart: {
        width: px(42),
        height: px(42)
    },
    bottom: {
        width: px(750),
        height: px(98),
        backgroundColor: '#fbfafc',
        paddingLeft: px(30)
    },
    total: {
        fontSize: px(28),
        color: '#222',
        marginBottom: px(8)
    },
    explain: {
        fontSize: px(20),
        color: '#858385'
    },
    b_right: {
        width: px(250),
        height: px(98)
    },
    btn: {
        color: '#fff',
        fontSize: px(34)
    },
    footerTip: {
        width: px(750),
        height: px(72),
        backgroundColor: 'rgba(248,240,242,0.7)',
        /*position: 'absolute',
        bottom: px(90),
        left: 0,*/
        zIndex: 111
    },
    footerTxt: {
        color: '#e86d78',
        fontSize: px(28)
    }
});
