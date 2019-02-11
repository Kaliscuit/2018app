/**
 * Created by zhaoxiaobing on 2017/9/7.
 */

'use strict';

import React from 'react';

import {
    Text,
    TextInput,
    View,
    Image,
    FlatList,
    ScrollView,
    StyleSheet,
    Alert,
    DeviceEventEmitter,
    TouchableOpacity,
    Platform,
    PixelRatio,
    SectionList,
    KeyboardAvoidingView,
    TouchableWithoutFeedback
} from "react-native";
import { observer } from "mobx-react";
import { CartHeader, TopMsg } from '../common/Header';
import { px, isIphoneX, deviceWidth, deviceHeight } from "../../utils/Ratio";
import { User } from "../../services/Api";
import { get, post } from '../../services/Request'
import CartList from '../../services/Cart'
import { show as toast } from '../../widgets/Toast';
import { LoadingInit, LoadingRequest } from '../../widgets/Loading';
import { DialogModal, AlertModal } from '../common/ModalView';
import Icon from '../../UI/lib/Icon';
import base from '../../styles/Base';
import { toJS } from 'mobx';
import { FootView } from '../../UI/Page';
import Explain, { ExplainCart } from '../common/ExplainModal';
import Img from "../../UI/lib/Img";
import { setItem, getItem, removeItem } from "../../services/Storage"
import Badge from '../../UI/lib/Badge'
import Event from "../../services/Event";
import { getUnReadMsg } from "../../services/Push";

import { GoodsRecommendedForYou } from '../recommended/GoodsRecommended'


let GoodList = observer(class GoodList extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, this.props.items, {
            selectStatus: false
        });
    }
    renderTitle(items) {
        return <View style={[cartStyles.activityTitle, base.inline_left]}>
            <View style={[cartStyles.icon, base.text_center]}>
                <Text style={[cartStyles.iconTxt]} allowFontScaling={false}>满减</Text>
            </View>
            <Text style={cartStyles.activityDesc} allowFontScaling={false}>{items.bonusRules_Desc}</Text>
        </View>
    }
    renderGoods(items) {
        return <View style={{
            borderBottomLeftRadius: items.last ? px(12) : 0,
            borderBottomRightRadius: items.last ? px(12) : 0,
            overflow: 'hidden'
        }}>
            <View style={[styles.goods_list, { backgroundColor: items.activityType == 1 ? '#fff8f5' : '#fff' }]}>
                {
                    this.props.editStatus
                        ? <View style={styles.operatingBtn}>
                            <TouchableOpacity activeOpacity={0.8}
                                style={styles.operatingBtnBox}
                                onPress={this.props.editSelect.bind(null, this.props.items.id)}>
                                {this.props.editSelectArr.indexOf(this.props.items.id) == -1
                                    ? <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34) }} />
                                    : <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34) }} />
                                }
                            </TouchableOpacity>
                        </View>
                        : items.preSaleYn == 'N' ?
                            <View style={styles.operatingBtn}>
                                {this.props.items.limitStock > 0 && this.props.items.can_select == 1
                                    ? <TouchableOpacity activeOpacity={0.8}
                                        style={styles.operatingBtnBox}
                                        onPress={CartList.select.bind(null, this.props.items.id, this.props.items.select_status)}>
                                        {this.props.items.select_status == 0
                                            ? <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                                resizeMode='cover'
                                                style={{ width: px(34), height: px(34) }} />
                                            : <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                                resizeMode='cover'
                                                style={{ width: px(34), height: px(34) }} />
                                        }
                                    </TouchableOpacity>
                                    : null}
                            </View> : <View style={{ width: px(88) }}></View>
                }


                <View style={styles.goods_img}>
                    <TouchableOpacity onPress={() => this.props.goDetail(this.props.items.id, this.props.items.sku)}>
                        <Img src={this.props.items.original_img} width={100} height={100} resizeMode='cover' style={styles.img} />
                        {/*{
                            this.props.items.can_select == 0 &&
                            <View style={styles.goods_limit}>
                                <Text
                                    allowFontScaling={false}
                                    style={styles.goods_limit_txt}>
                                    {this.props.items.invalidDesc}
                                </Text>
                            </View>
                        }*/}
                        {this.props.items.can_select == 0 && this.props.items.invalidDesc
                            ? <View style={[styles.goods_img_cover, { paddingHorizontal: this.props.items.invalidDesc.length == 4 ? px(20) : px(0) }]}>
                                <Text
                                    allowFontScaling={false}
                                    style={[styles.goods_img_txt]}>
                                    {this.props.items.invalidDesc}
                                </Text>
                            </View>
                            : null
                        }
                        {items.limitStock > 0 && items.limitStock < 10 && items.preSaleYn == 'N'
                            ? <View style={[styles.comGoods_limit, styles.goods_limit]}>
                                <Text allowFontScaling={false} style={styles.goods_limit_txt}>仅剩{this.props.items.limitStock}件</Text>
                            </View>
                            : null
                        }
                        {
                            items.limitStock > 0 && items.limitStock < 10 && items.preSaleYn == 'Y' &&
                            <View style={[styles.comGoods_limit, styles.goods_limit1]}>
                                <Text allowFontScaling={false} style={styles.goods_limit_txt}>预售  仅剩{this.props.items.limitStock}件</Text>
                            </View>
                        }
                        {
                            items.preSaleYn == 'Y' && items.limitStock >= 10 &&
                            <View style={[styles.comGoods_limit, styles.goods_limit1]}>
                                <Text allowFontScaling={false} style={styles.goods_limit_txt}>预售</Text>
                            </View>
                        }
                        {
                            items.isBuyLimit == 1 &&
                            <View style={[styles.comGoods_limit, styles.goods_limit]}>
                                <Text allowFontScaling={false} style={styles.goods_limit_txt}>限购{items.buyLimitNum}件</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                <View style={styles.goods_content}>
                    <TouchableOpacity onPress={() => this.props.goDetail(this.props.items.id, this.props.items.sku)}>
                        {this.props.items.isInBond == 1 &&
                            <Icon name="bond"
                                style={styles.bond} />
                        }
                        {this.props.items.isForeignSupply == 2 &&
                            <Icon name="isForeignSupply"
                                style={styles.bond} />
                        }
                        <Text allowFontScaling={false}
                            style={[styles.goods_name, this.props.items.limitStock == 0 || this.props.items.can_select == 0 ? styles.color_disabled : '']}
                            numberOfLines={2}>
                            {this.props.items.isInBond == 1 && <Text style={styles.flagLen}>flagLen</Text>}
                            {this.props.items.isForeignSupply == 2 && <Text style={styles.flagLen}>flagLen</Text>}
                            <Text allowFontScaling={false}>{this.props.items.goodsShowDesc}</Text>
                        </Text>
                    </TouchableOpacity>
                    {
                        items.preSaleYn == 'Y' &&
                        <Text allowFontScaling={false} style={{ color: '#a65cd9', fontSize: px(24), marginTop: px(20), marginBottom: px(24) }}>
                            预售商品只可单独购买，点击进入商品详情
                        </Text>
                    }
                    {(items.salesTimeDiff > 0 || items.salesEndTimeDiff > 0) && <View style={styles.preheat}>
                        <Text allowFontScaling={false} style={styles.preheatTxt}>
                            {items.salesTimeDiff > 0 && items.salesTimeStr}
                            {items.salesTimeDiff <= 0 && items.salesEndTimeDiff > 0 && items.salesEndTimeStr}
                        </Text>
                        <Image style={styles.preheatLine} source={{ uri: require('../../images/preheat-line') }} />
                        <Text allowFontScaling={false} style={styles.preheatTxt}>
                            {items.salesTimeDiff > 0 && '开始售卖'}
                            {items.salesTimeDiff <= 0 && items.salesEndTimeDiff > 0 && '恢复原价'}

                        </Text>
                    </View>}
                    <View style={[styles.operating, base.inline_between]}>
                        <View style={base.inline_left}>
                            <Text allowFontScaling={false}
                                style={[styles.money, this.props.items.limitStock == 0 || this.props.items.can_select == 0 ? styles.color_disabled : '']}>
                                ¥{this.props.items.salePrice}
                            </Text>
                            {
                                (this.props.items.limitStock == 0 || this.props.items.can_select == 0) &&
                                <Text allowFontScaling={false}
                                    style={[styles.quantity, styles.color_disabled]}>
                                    x{this.props.items.quantity}
                                </Text>
                            }
                        </View>

                        {/*&& !this.props.editStatus*/}
                        {this.props.items.limitStock > 0 && this.props.items.can_select != 0 && items.preSaleYn == 'N'
                            ? <View style={styles.operatingBox}>
                                {this.props.items.quantity == 1
                                    ? <TouchableOpacity
                                        activeOpacity={0.8}>
                                        <View style={styles.reduce}>
                                            <Text allowFontScaling={false} style={[styles.btn1, styles.color_disabled1]}>-</Text>
                                        </View>
                                    </TouchableOpacity>
                                    : <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={CartList.reduce.bind(null, this.props.items.id, this.props.items.quantity)}>
                                        <View style={styles.reduce}>
                                            <Text allowFontScaling={false} style={[styles.btn1]}>-</Text>
                                        </View>
                                    </TouchableOpacity>
                                }
                                <View style={styles.inpBox}>
                                    <TextInput allowFontScaling={false}
                                        style={styles.inp1}
                                        defaultValue={String(this.props.items.quantity)}
                                        keyboardType="numeric"
                                        onChangeText={(txt) => this.props.goodsChangeQty(this.props.items.id, txt)}
                                        onBlur={(event) => this.props.changeQty(this.props.items.id)}
                                        autoFocus={false}
                                        underlineColorAndroid="transparent">
                                    </TextInput>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={CartList.plus.bind(null, this.props.items.id, this.props.items.quantity, this.props.items.isBuyLimit, this.props.items.buyLimitNum, this.props.items.buyLimitMsg)}>
                                    <View style={styles.plus}>
                                        <Text allowFontScaling={false} style={[styles.btn1]}>+</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            : null
                        }
                    </View>
                </View>
            </View>
        </View>
    }
    render() {
        let items = this.props.items;
        return <View>
            {items.activity_Type == 1 ?
                this.renderTitle(items) : this.renderGoods(items)
            }
        </View>

    }
})

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectALL: false
        }
    }

    selectALL() {
        this.setState(prevState => {
            return {
                selectALL: !prevState.selectALL
            }
        });
    }

    goSubmit() {
        let { total_price, discount_amount } = this.props;
        if (total_price * 1 + discount_amount * 1 > 0) {
            this.props.submit && this.props.submit();
        }
    }

    render() {
        const { discount_amount, total_price, total_count } = this.props;
        return (
            <View style={styles.footer}>
                {this.props.editStatus
                    ? <View style={styles.operatingBtn}>
                        <TouchableOpacity activeOpacity={0.8}
                            style={styles.operatingBtnBox}
                            onPress={this.props.editSelectAllFn.bind(this)}>
                            {!this.props.editSelectAllStatus
                                ? <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                    resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />
                                : <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                    resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />
                            }
                        </TouchableOpacity>
                    </View>
                    : <View style={styles.operatingBtn}>
                        <TouchableOpacity activeOpacity={0.8}
                            style={styles.operatingBtnBox}
                            onPress={this.props.selectAllFn}>
                            {this.props.selectAllStatus
                                ? <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                    resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />
                                : <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                    resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />
                            }
                        </TouchableOpacity>
                    </View>
                }
                {this.props.editStatus
                    ? <View style={styles.footerContent}>
                        <Text allowFontScaling={false} style={[styles.footerContentTxt0]}>全部</Text>
                        <TouchableOpacity activeOpacity={0.8} onPress={this.props.delete}>
                            <View style={[styles.delete]}>
                                <Text allowFontScaling={false} style={styles.delete_txt}>删除</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    : <View style={styles.footerContent}>
                        <Text allowFontScaling={false} style={[styles.footerContentTxt0, styles.footerContentTxt1]}>全部</Text>
                        <View style={{ alignItems: 'flex-end', marginRight: px(56) }}>
                            <View style={base.inline_left}>
                                <Text allowFontScaling={false} style={styles.footerContentTxt1}>合计</Text>
                                <Text allowFontScaling={false} style={styles.footerContentTxt2}>￥{this.props.total_price}</Text>
                            </View>
                            {
                                discount_amount > 0 &&
                                <Text allowFontScaling={false} style={styles.footerContentTxt3}>已优惠￥{discount_amount}</Text>
                            }
                        </View>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => this.goSubmit()}>
                            <View style={[styles.submit, total_price * 1 + discount_amount * 1 > 0 ? styles.submitAbled : styles.submitDisabled]}>
                                <Text allowFontScaling={false} style={styles.submit_txt}>去结算({total_count})</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )

    }
}
exports.Footer = Footer
export default observer(class Cart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            txt: '编辑',
            requestStatue: false, //请求状态  是否请求中
            refreshing: false, //下拉刷新状态
            editStatus: false, //编辑状态
            selectAllStatus: false,
            editSelectAllStatus: false,
            SelectArr: [],
            editSelectArr: [],
            list: [],
            goodsNumber: 0,
            from: this.props.navigation.state.params && this.props.navigation.state.params.isNeedBack ? true : false,
            showLead: false,
            recommends: []
        };
        this.edit = this.edit.bind(this);
    }

    didFocus = null

    async componentDidMount() {
        await CartList.getDefaultArea();
        await CartList.update();
        if (User.isLogin) {
            this.didFocus = this.props.navigation.addListener(
                'didFocus',
                async payload => {
                    let un = await getUnReadMsg(); // 获取未读消息
                    Event.emit("top.msg.updated", un)
                    await CartList.getDefaultArea();
                    await CartList.update();
                    await this.getRecommend();
                }
            );
        }
        this.rightNameCart = DeviceEventEmitter.addListener('rightNameCart', () => {
            this.edit();
        });
        // setItem("cart_first", "first");
        let first = await getItem("cart_first");
        if (first === "first") {
            this.setState({ showLead: true });
        }
    }

    goDetail(id, sku) {
        this.props.navigation.navigate('DetailPage', {
            id: sku ? '' : id,
            sku: sku
        });
    }

    componentWillUnmount() {
        // this.refreshCart && this.refreshCart.remove();
        this.rightNameCart && this.rightNameCart.remove();
        this.didFocus && this.didFocus.remove();
    }

    //全部选中的状态
    selectAllStatus() {
        let status = this.state.list.every(res => {
            if (res.can_select == 0 || res.limitStock == 0) {
                return true;
            }
            return res.select_status == 1;
        });
        this.setState({
            selectAllStatus: status
        });
    }

    //获取所有选中的商品ID  status :   1(所有的)/2(所有有货的能选择的)/3(所有选中的)
    getGoodsId(status) {
        let listArr = [];
        if (CartList.data.list.length > 0 && CartList.data.list[0].data) {
            CartList.data.list.forEach(item => {
                item.data.forEach(res => {
                    if (status == 1) {
                        listArr.push(res.id);
                    } else if (status == 2 && res.can_select == 1) { // && res.limitStock >= 0
                        listArr.push(res.id);
                    } else if (status == 3 && res.select_status == 1 && res.quantity > 0) {
                        listArr.push(res.id);
                    }
                })
            })
        } else {
            CartList.data.list.forEach(res => {
                if (status == 1) {
                    listArr.push(res.id);
                } else if (status == 2 && res.can_select == 1) { // && res.limitStock >= 0
                    listArr.push(res.id);
                } else if (status == 3 && res.select_status == 1 && res.quantity > 0) {
                    listArr.push(res.id);
                }
            });
        }

        return listArr;
    }

    //获取所有选中的商品个数  status :   1(所有的)/2(所有有货的能选择的)/3(所有选中的)
    getGoodsQuantity(status) {
        let listArr = [];
        this.state.list.forEach(res => {
            if (status == 1) {
                listArr.push(res.quantity);
            } else if (status == 2 && res.can_select == 1) { // && res.limitStock >= 0
                listArr.push(res.quantity);
            } else if (status == 3 && res.select_status == 1 && res.quantity > 0) {
                listArr.push(res.quantity);
            }
        });
        return listArr;
    }
    

    // 获取推荐数据
    async getRecommend () {

        let ids = toJS(CartList.data.list).map(item => {
            return item.goods_list.filter(item => !!item.id).map(items => {
                return items.id
            })
        }).toString()

        let result = await post(`/shoppingFlow/getRecommendList.do`, {
            sn: ids,
            recType: 'cart'
        })

        this.setState({
            recommends: result.item || []
        })
    }

    //下拉刷新
    async refresh() {
        this.setState({
            refreshing: true,
            editSelectAllStatus: false,
            editSelectArr: [],
            editStatus: false
        });
        CartList.update();
        this.getRecommend();
        this.setState({
            refreshing: false
        });
    }

    goodsChangeQty(id, num) {
        if (num < 0) {
            num = -num;
        }
        this.setState({
            goodsNumber: num
        });
        CartList.setNum(id, num);
    }

    changeQty(id) {
        let qty = this.state.goodsNumber,
            quantity = Number(this.state.goodsNumber) + 1,
            lists = CartList.list;

        lists.forEach(res => {
            if (res.id == id) {
                quantity = res.limitStock;
            }
        });
        if (Number(qty) > quantity) {
            toast(`库存不足`);
            CartList.setNum(id, 1);
        }
        CartList.changeNum(id, Number(qty));
    }

    //删除
    async delete() {
        if (this.state.editSelectArr.length === 0) {
            toast('请选择要操作的商品');
            return;
        }

        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要删除这${this.state.editSelectArr.length}种商品嘛？`,
                [{
                    text: '先留着', onPress: () => resolve(false)
                }, {
                    text: '删除', onPress: () => resolve(true)
                }]
            )
        });
        if (!confirm) {
            return;
        }

        if (this.state.editSelectArr.length === CartList.data.list_length) {
            await CartList.deleteAll();
            this.setState({
                editSelectArr: [],
                editStatus: false,
                editSelectAllStatus: false
            });
            this.props.navigation.setParams({
                rightName: "编辑"
            });
        } else if (this.state.editSelectArr.length < CartList.data.list_length) {
            await CartList.deleteGoods(this.state.editSelectArr);
            this.setState({
                editSelectArr: [],
                editSelectAllStatus: false
            });
        }

        await this.getRecommend()
    }

    //进入编辑状态
    edit() {
        this.setState(prevState => {
            return {
                editStatus: !prevState.editStatus,
                editSelectArr: [],
                editSelectAllStatus: false
            }
        });
        this.props.navigation.setParams({
            rightName: this.state.editStatus ? "编辑" : "完成"
        });
    }

    isExist(ids) {
        let editSelectArr = this.state.editSelectArr,
            isExist = false;
        if (editSelectArr.length < ids.data.length) return false;
        ids.data.map(item => {
            if (editSelectArr.indexOf(item.id) > -1) {
                isExist = true;
            }
        })
        return isExist;
    }

    editSelectGroup(info, isExist) {
        let editSelectArr = this.state.editSelectArr.slice();
        info.data.map(item => {
            if (isExist == 'delete') { //删除
                if (editSelectArr.indexOf(item.id) > -1) {
                    editSelectArr.splice(editSelectArr.indexOf(item.id), 1);
                }
            } else { //增加
                if (editSelectArr.indexOf(item.id) == -1) {
                    editSelectArr.push(item.id)
                }
            }
        })
        if (editSelectArr.length == CartList.data.list_length) {
            this.setState({
                editSelectArr,
                editSelectAllStatus: true,
            });
        } else {
            this.setState({
                editSelectArr,
                editSelectAllStatus: false
            });
        }
    }
    //编辑状态下选中 取消选中
    editSelect(id) {
        let editSelectArr = this.state.editSelectArr.slice();
        if (editSelectArr.indexOf(id) === -1) {
            editSelectArr.push(id)
        } else {
            editSelectArr.splice(editSelectArr.indexOf(id), 1);
        }
        if (editSelectArr.length == CartList.data.list_length) {
            this.setState({
                editSelectArr,
                editSelectAllStatus: true,
            });
        } else {
            this.setState({
                editSelectArr,
                editSelectAllStatus: false
            });
        }

    }
    //编辑状态下全选或全不选
    editSelectAllFn() {
        if (this.state.editSelectAllStatus) {
            this.setState({
                editSelectArr: [],
                editSelectAllStatus: false
            });
        } else {
            this.setState({
                editSelectArr: this.getGoodsId(1),
                editSelectAllStatus: true
            });
        }
    }

    async submit() {
        this.setState({
            requestStatue: true
        });
        try {
            if (CartList.data.total_count == 0) {
                return
            } else {
                let data = await CartList.submit();
                let { preheat, prodIds } = data;
                if (!prodIds && preheat > 0) {
                    this.refs.dialog.open({
                        content: ['您所选中商品现在还没开售呢，再等等哟~'],
                        btns: [{
                            txt: '我知道了',
                            click: () => { }
                        }]
                    });
                } else if (prodIds && preheat > 0) {
                    this.refs.dialog.open({
                        content: [`您有${preheat}个商品未到售卖时间，是否先结算其他商品？`],
                        btns: [{
                            txt: '我再想想',
                            click: () => { }
                        }, {
                            txt: '去结算',
                            click: async () => {
                                this.props.navigation.navigate('SubmitPage', data);
                            }
                        }]
                    });
                } else {
                    this.props.navigation.navigate('SubmitPage', data);
                }
            }
        } catch (e) {
            toast(e.message);
        } finally {
            this.setState({
                requestStatue: false
            });
        }
    }

    //回首页
    goHome() {
        this.props.navigation.navigate('ShopPage');
    }

    goLogin() {
        this.props.navigation.navigate('LoginPage');
    }

    TogetherPage(section) {
        this.props.navigation.navigate('TogetherPage', {
            supplier_code: section.supplier_code,
            callback: () => {
                CartList.update();
            }
        });
    }

    //组头部
    renderSectionHeader(info) {
        let section = info.section, state = this.state, isExist = this.isExist(section);
        return <View style={cartStyles.header}>
            <View style={[cartStyles.sectionHeader, base.inline_between]}>
                <View style={cartStyles.hLeft}>
                    {state.editStatus
                        ? <View style={styles.operatingBtn}>
                            {
                                !isExist ?
                                    <TouchableOpacity activeOpacity={0.8}
                                        style={styles.operatingBtnBox}
                                        onPress={() => this.editSelectGroup(section, 'add')}>
                                        <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                            resizeMode='cover'
                                            style={{ width: px(34), height: px(34) }} />
                                    </TouchableOpacity> :
                                    <TouchableOpacity activeOpacity={0.8}
                                        style={styles.operatingBtnBox}
                                        onPress={() => this.editSelectGroup(section, 'delete')}>
                                        <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                            resizeMode='cover'
                                            style={{ width: px(34), height: px(34) }} />
                                    </TouchableOpacity>
                            }
                        </View>
                        : <View style={styles.operatingBtn}>
                            <TouchableOpacity activeOpacity={0.8}
                                style={styles.operatingBtnBox}
                                onPress={CartList.selectGroup.bind(null, section.data, section.select_status)}
                            >
                                {section.select_status == 0
                                    ? <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34) }} />
                                    : <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34) }} />
                                }
                            </TouchableOpacity>
                        </View>
                    }
                    <Text allowFontScaling={false}
                        style={cartStyles.title}>
                        {section.shipFee_title}
                    </Text>
                </View>
                <View style={[base.inline_left]}>
                    {
                        section.shipFee_explain &&
                        <Text allowFontScaling={false}
                            style={cartStyles.explain}>
                            {section.shipFee_explain}
                        </Text>
                    }
                    {
                        section.isShow_addBt == 1 &&
                        <Text allowFontScaling={false}
                            style={[cartStyles.btn, base.color]}
                            onPress={() => this.TogetherPage(section)}
                        >
                            去凑单
                        </Text>
                    }
                </View>
            </View>
        </View>
    }

    openCoupon() {
        this.refs.explain.show()
    }

    renderFooter() {
        if (CartList.data.list.length == 0) return null;
        return <Footer
            editStatus={this.state.editStatus}
            total_count={CartList.data.total_count}
            total_price={CartList.data.total_price}
            selectAllStatus={CartList.isSelectAll}
            editSelectAllStatus={this.state.editSelectAllStatus}
            editSelectArr={this.state.editSelectArr}
            selectAllFn={CartList.selectAll}
            discount_amount={CartList.data.discount_amount}
            editSelectAllFn={this.editSelectAllFn.bind(this)}
            delete={this.delete.bind(this)}
            submit={this.submit.bind(this)}
            openCoupon={this.openCoupon.bind(this)}
        />
    }

    renderOther() {
        return null;
    }

    goMessageCenter() {
        this.props.navigation.navigate('MessageCenter', {});
    }

    render() {
        let { state } = this.props.navigation;
        if (!state.params) state.params = {};
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
                <CartHeader
                    title={`购物车(${CartList.data.goods_count || 0})`}
                    titleStyle={{
                        color: "#000"
                    }}
                    navigation={this.props.navigation}
                    rightBtn={CartList.data.list.length > 0 ?
                        <Text allowFontScaling={false}
                            onPress={() => DeviceEventEmitter.emit('rightNameCart')}
                            style={{
                                color: !this.props.navigation.state.params || this.props.navigation.state.params.rightName == '编辑' ? '#d0648f' : '#858385',
                                paddingVertical: px(17),
                                marginRight: px(24),
                                width: px(90),
                                justifyContent: 'flex-start',
                                textAlign: 'right'
                            }}>
                            {this.props.navigation.state.params && this.props.navigation.state.params.rightName || '编辑'}
                        </Text>
                        : null
                    }
                    leftBtn={state.params && state.params.isNeedBack ?
                        <TouchableOpacity style={styles.back} onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                            <Icon name="icon_back"
                                style={{ width: px(44), height: px(44) }} />
                        </TouchableOpacity> : <TopMsg rev={true} navigation={this.props.navigation} />
                    }
                />
                {!User.isLogin && <View style={styles.goLogin}>
                    <Text allowFontScaling={false} style={styles.explain}>您还没有登录</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => this.goLogin()}>
                        <View style={styles.loginBtn}>
                            <Text allowFontScaling={false} style={styles.loginBtnText}>去登录</Text>
                        </View>
                    </TouchableOpacity>
                </View>}
                {User.isLogin &&
                    CartList.isLoaded && <SectionList
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.refresh()}
                    style={cartStyles.list}
                    stickySectionHeadersEnabled={false}
                    ItemSeparatorComponent={() => null}
                    renderSectionHeader={this.renderSectionHeader.bind(this)}
                    renderItem={({ item }) => <GoodList
                        items={item}
                        editStatus={this.state.editStatus}
                        limitStock={this.limitStock}
                        editSelectArr={this.state.editSelectArr}
                        editSelect={this.editSelect.bind(this)}
                        goodsChangeQty={this.goodsChangeQty.bind(this)}
                        changeQty={this.changeQty.bind(this)}
                        goDetail={(id, sku) => this.goDetail(id, sku)}
                    />}
                    ListFooterComponent={ () => <GoodsRecommendedForYou 
                        navigation={this.props.navigation}
                        list={ this.state.recommends }
                        isCart={ true }
                        carRefresh={ this.getRecommend.bind(this) }
                    />}
                    /*ListFooterComponent={() => {
                        if (CartList.data.list.length === 0) {
                            return <View style={styles.empty}>
                                <Text allowFontScaling={false} style={styles.empty_txt}>购物车没有商品哦</Text>
                                <TouchableOpacity activeOpacity={0.8} onPress={this.goHome.bind(this)}>
                                    <View style={styles.empty_btn}>
                                        <Text allowFontScaling={false} style={styles.empty_btn_txt}>去首页看看</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        } else {
                            return <View></View>
                        }
                        }}*/
                    ListEmptyComponent={() => {
                        if (CartList.data.list.length === 0) {
                            return <View style={styles.empty}>
                                <Text allowFontScaling={false} style={styles.empty_txt}>购物车没有商品哦</Text>
                                <TouchableOpacity activeOpacity={0.8} onPress={this.goHome.bind(this)}>
                                    <View style={styles.empty_btn}>
                                        <Text allowFontScaling={false} style={styles.empty_btn_txt}>去首页看看</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        } else {
                            return <View style={{ height: px(24), width: px(750) }}></View>
                        }
                    }}
                    sections={toJS(CartList.data.list)}
                    keyExtractor={(item, index) => index}
                />}
                
                {User.isLogin && !CartList.isLoaded && <LoadingInit />}
                {
                    CartList.data.discountDesc && CartList.data.discountDesc != '' ?
                        <TouchableWithoutFeedback onPress={() => this.openCoupon()}>
                            <View style={[styles.footerTip, base.inline_left]}>
                                <Text numberOfLines={1} allowFontScaling={false} style={styles.footerTxt}>
                                    {CartList.data.discountDesc}
                                </Text>
                                <Icon name="icon-detail-shousuo" style={{ width: px(22), height: px(12), marginLeft: px(10) }} />
                            </View>
                        </TouchableWithoutFeedback> : null
                }
                {this.renderOther()}
                {this.renderFooter()}

                <LoadingRequest status={this.state.requestStatue} />
                <DialogModal ref="dialog" />
                <ExplainCart
                    data={{}}
                    explain={{
                        type: 'cart'
                    }}
                    ref="explain" />
                {this.state.showLead && CartList.data.total_price > 0 && <View style={state.params.isNeedBack ? styles.lead2 : styles.lead}>
                    <TouchableOpacity activeOpacity={.9} onPress={this.closeLead.bind(this)}>
                        <Image source={{ uri: "http://img.daling.com/st/dalingjia/app/lead4.png" }} style={styles.leadImg} />
                    </TouchableOpacity>
                </View>}
            </View>
        )
    }
    /**
     * 关闭引导层
     */
    closeLead() {
        this.setState({ showLead: false })
        removeItem("cart_first")
    }
})


const styles = StyleSheet.create({
    back: {
        marginLeft: px(34),
    },
    messageCenter: {
        width: px(98),
        height: 39,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goods_list: {
        width: px(702),
        //height: px(190),
        paddingVertical: px(20),
        paddingRight: px(24),
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    operatingBtn: {
        width: px(88),
        alignItems: 'center',
        justifyContent: 'center'
    },
    operatingBtnBox: {
        width: px(82),
        height: px(80),
        alignItems: 'center',
        justifyContent: 'center'
    },
    goods_img: {
        width: px(180),
        height: px(180),
        position: 'relative'
    },
    img: {
        width: px(180),
        height: px(180),
        borderRadius: px(10),
        overflow: 'hidden',
        position: 'relative',
        zIndex: 0
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
        color: '#fff',
        backgroundColor: 'transparent'
    },
    comGoods_limit: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: px(30),
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: px(10),
        borderBottomRightRadius: px(10)
    },
    goods_limit: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    goods_limit1: {
        backgroundColor: 'rgba(190,133,211,0.7)',
    },
    goods_limit_txt: {
        color: '#fff',
        fontSize: px(22)
    },
    goods_content: {
        paddingVertical: px(8),
        flex: 1,
        paddingLeft: px(23),
        justifyContent: 'space-between'
    },
    goods_name: {
        color: '#252426',
        //height: px(92),
        //lineHeight: px(30),
        fontSize: px(26)
    },
    bond: {
        width: px(44),
        height: px(24),
        position: "absolute",
        left: px(0),
        zIndex: 100,
        ...Platform.select({
            ios: {
                top: px(1),
            },
            android: {
                top: px(4)
            }
        }),
    },
    preheat: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: px(330),
        height: px(38),
        //marginLeft: px(90),
        marginTop: px(20),
        marginBottom: px(24),
        borderRadius: px(8),
        borderWidth: px(1),
        borderColor: '#ed3f58',
        overflow: 'hidden'
    },
    preheatTxt: {
        padding: 0,
        fontSize: px(22),
        color: '#ed3f58',
        includeFontPadding: false,
        backgroundColor: 'transparent'
    },
    preheatLine: {
        width: px(1),
        height: px(28),
        marginHorizontal: px(10)
    },
    operating: {
        height: px(58),
        flexDirection: 'row',
        alignItems: 'center'
    },
    money: {
        color: '#f25ca0',
        fontSize: px(28),
        marginRight: px(20)
    },
    quantity: {
        //flex: 1,
        color: '#666',
        fontSize: px(28)
    },
    operatingBox: {
        width: px(210),
        height: px(68),
        borderColor: '#ddd',
        borderWidth: px(1),
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: px(10),
        overflow: 'hidden'
    },
    reduce: {
        width: px(68),
        height: px(68),
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: px(1),
        borderRightColor: '#ddd',
    },
    plus: {
        width: px(68),
        height: px(68),
        alignItems: 'center',
        justifyContent: 'center'
    },
    btn1: {
        fontSize: px(36),
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    inpBox: {
        flex: 1,
        borderRightWidth: px(1),
        borderRightColor: '#ddd',
    },
    inp1: {
        flex: 1,
        backgroundColor: 'transparent',
        textAlign: 'center',
        padding: 0,
        fontSize: px(28)
    },
    footer: {
        backgroundColor: '#fff',
        height: px(98),
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden'
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        height: px(98),
        backgroundColor: '#fff'
    },
    footerContentTxt0: {
        flex: 1,
        textAlign: 'left'
    },
    footerContentTxt1: {
        fontSize: px(28),
        color: '#252426'
    },
    footerContentTxt2: {
        fontSize: px(38),
        color: '#d0648f',
    },
    footerContentTxt3: {
        fontSize: px(24),
        color: '#222'
    },
    submit: {
        width: px(250),
        height: px(98),
        alignItems: 'center',
        justifyContent: 'center',

    },
    submitAbled: {
        backgroundColor: '#d0648f'
    },
    submitDisabled: {
        backgroundColor: '#b2b3b5'
    },
    submit_txt: {
        fontSize: px(34),
        color: '#fff'
    },
    delete: {
        width: px(140),
        height: px(60),
        borderColor: '#d0648f',
        borderWidth: px(1),
        borderRadius: px(8),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: px(30)
    },
    delete_txt: {
        fontSize: px(26),
        color: '#d0648f'
    },
    empty: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: px(80)
    },
    goLogin: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty_txt: {
        paddingTop: px(140),
        paddingBottom: px(28),
        color: '#858385',
        fontSize: px(28)
    },
    explain: {
        paddingBottom: px(30),
        color: '#858385',
        fontSize: px(26)
    },
    empty_btn: {
        width: px(180),
        height: px(60),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: px(4),
        borderWidth: 1,
        borderColor: '#d0648f'
    },
    loginBtn: {
        width: px(180),
        height: px(60),
        backgroundColor: '#d0648f',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: px(6)

    },
    empty_btn_txt: {
        fontSize: px(28),
        color: '#d0648f'
    },
    loginBtnText: {
        fontSize: px(26),
        color: '#fff'
    },
    load_finished: {
        alignItems: 'center',
        paddingVertical: px(60)
    },
    load_finished_txt: {
        fontSize: px(20),
        color: '#858385'
    },
    color_disabled: {
        color: '#858385'
    },
    color_disabled1: {
        color: '#b2b3b5'
    },
    flag: {
        width: px(45),
        height: px(27),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        left: 0,
        ...Platform.select({
            ios: {
                top: px(1),
            },
            android: {
                top: px(4)
            }
        }),
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
    flagLen: {
        fontSize: px(17),
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: "center",
        color: '#fbfafc',
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
    footerTip: {
        width: px(750),
        height: px(70),
        backgroundColor: '#fff8f5',
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        paddingHorizontal: px(30),
        //marginTop: px(24)
    },
    footerTxt: {
        color: '#ed3f58',
        fontSize: px(28),
        maxWidth: px(658)
    },
    lead: {
        width: deviceWidth,
        height: px(560),
        position: "absolute",
        left: 0,
        bottom: 35,
        zIndex: 1000,
    },
    lead2: {
        width: deviceWidth,
        height: px(560),
        position: "absolute",
        left: 0,
        bottom: isIphoneX() ? 70 : 35,
        zIndex: 1000,
    },
    leadImg: {
        width: deviceWidth,
        height: px(560),
    },
});

const cartStyles = StyleSheet.create({
    list: {
        width: px(702),
        marginHorizontal: px(24),
        flex: 1
    },
    header: {
        borderTopLeftRadius: px(12),
        borderTopRightRadius: px(12),
        overflow: 'hidden',
        height: px(100),
        marginTop: px(24)
    },
    sectionHeader: {
        paddingRight: px(24),
        flexDirection: 'row',
        backgroundColor: '#fff',
        height: px(100)
    },
    hLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: px(28),
        color: '#222',
        //marginLeft: px(24)
    },
    explain: {
        fontSize: px(26),
        color: '#222'
    },
    btn: {
        fontSize: px(26),
        marginLeft: px(10)
    },
    activityTitle: {
        height: px(69),
        backgroundColor: '#fff8f5',
        paddingLeft: px(88),
        paddingTop: px(20)
    },
    icon: {
        height: px(26),
        borderWidth: px(1),
        width: px(50),
        borderRadius: px(3),
        overflow: 'hidden',
        borderColor: '#ffa914'
    },
    iconTxt: {
        fontSize: px(18),
        color: '#ffa914'
    },
    activityDesc: {
        fontSize: px(26),
        marginLeft: px(10)
    },

});
