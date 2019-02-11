'use strict';

import React from 'react';
import {
    Image,
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Animated,
    ImageBackground,
    ScrollView
} from "react-native";

import { px, isIphoneX, deviceWidth, deviceHeight } from '../../utils/Ratio';
import { User } from "../../services/Api";
import CartList from '../../services/Cart'
import { show as toast } from '../../widgets/Toast';
import { TrackClick } from "../../services/Track";
import util_cools from '../../utils/tools'
import Icon from '../../UI/lib/Icon'
import { log } from '../../utils/logs';
import {getItem} from "../../services/Storage";

//弹出规格
exports.GoodSpu = class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.current,
            labelHeight: 0,
            // current: [],
            initQuantity: 1,
            smallImage: this.props.goods.shareImage,
            translateValue: new Animated.Value(px(500)),
            specStatus: false,
            paySelected: false
        }
    }
    /**
     *商品信息
     */
    renderBasic(goods, smallImage, salePrice) {
        return <View style={SpecificationsStyle.pos_}>
            <View style={SpecificationsStyle.pos}></View>
            <View style={SpecificationsStyle.detail_}>
                <View style={SpecificationsStyle.coverImageBox}>
                    <Image style={SpecificationsStyle.coverImage}
                        source={{
                            uri: smallImage
                        }}
                        resizeMode="cover"
                        resizeMethod="resize">
                    </Image>
                </View>
                <View style={SpecificationsStyle.detail}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {
                            !User.vip && User.isLogin ?
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text allowFontScaling={false} style={{ fontSize: px(35), color: '#252426' }}>
                                            ￥{util_cools.parsePrice(salePrice)}
                                        </Text>
                                        <Text allowFontScaling={false} style={{ fontSize: px(24), color: '#858385', textDecorationLine: 'line-through', marginLeft: px(13) }}>
                                            ￥{util_cools.parsePrice(goods.marketPrice)}
                                        </Text>
                                    </View>
                                    <Text allowFontScaling={false} style={{ fontSize: px(28), color: '#d0648f', marginTop: px(13) }}>
                                        佣金: ￥{util_cools.parsePrice(goods.benefitMoney)}
                                    </Text>
                                </View> :
                                <View>
                                    <Text allowFontScaling={false} style={{ fontSize: px(35), color: '#252426' }}>￥{util_cools.parsePrice(salePrice)}</Text>
                                    <Text allowFontScaling={false} style={{ fontSize: px(24), color: '#858385', textDecorationLine: 'line-through', marginTop: px(13) }}>
                                        ￥{util_cools.parsePrice(goods.marketPrice)}
                                    </Text>
                                </View>
                            
                        }
                    </View>
                    <TouchableOpacity activeOpacity={0.9} onPress={this.cancelSpecStatus} style={SpecificationsStyle.closeImageBox}>
                        <Icon style={SpecificationsStyle.closeImage}
                            name="icon-closeSpu"
                            resizeMode="cover" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }
    /**
     *spu
     */
    
    /**
     *规格  exist()
     */
    exist(index, value) { //i=3
        let {goods} = this.props;
        let tree_select = goods.treeInfo.tree_select, selected = this.state.selected;
        if (index == 0) {
            return tree_select[selected[0]];
        }
        let i = 1, obj = tree_select;
        while (i <= index) {
            obj = obj[selected[i - 1]]
            if (obj) {
            } else {
                obj = {};
                break;
            }
            i++;
        }
        return obj[value];
    }
    
    renderSpec(goods, selected) {
        if (!goods.treeInfo || !selected || selected.length == 0) return null;
        let treeInfo = goods.treeInfo
        return <View style={SpecificationsStyle.specification} onLayout={e => this.setState({ labelHeight: e.nativeEvent.layout.height })}>
            {
                (treeInfo.tree_view || []).map((item, index) =>
                    <View key={index} style={SpecificationsStyle.spuContent}>
                        {
                            selected[index] !== '' ?
                                <Text allowFontScaling={false} style={SpecificationsStyle.spuTitle}>{item.attr_name}</Text> :
                                <Text allowFontScaling={false} style={[SpecificationsStyle.spuTitle, { color: '#ed3f58' }]}>请选择{item.attr_name}</Text>
                        }
                        <View style={SpecificationsStyle.spu}>
                            {
                                (item.attr_values || []).map((i, k_index) => {
                                    return <View key={i}>
                                        {
                                            selected[index] == i ?
                                                <View style={[SpecificationsStyle.spuItem, SpecificationsStyle.bgMain]}>
                                                    <Text style={[SpecificationsStyle.spuItemTxt, SpecificationsStyle.bgMainTxt]} allowFontScaling={false}>{i}</Text>
                                                </View>
                                                : this.exist(index, i) ?
                                                    <TouchableWithoutFeedback onPress={() => this.changeTab(index, i)} >
                                                        <View style={[SpecificationsStyle.spuItem, SpecificationsStyle.bgunSelect]}>
                                                            <Text style={SpecificationsStyle.spuItemTxt} allowFontScaling={false}>{i}</Text>
                                                        </View>
                                                    </TouchableWithoutFeedback> :
                                                    <View style={[SpecificationsStyle.spuItem, SpecificationsStyle.bgUnable]}>
                                                        <Text style={[SpecificationsStyle.spuItemTxt, SpecificationsStyle.spuItemUnSelect]} allowFontScaling={false}>{i}</Text>
                                                    </View>
                                        }
                                    </View>
                                }
                                )
                            }
                        </View>
                    </View>
                )
            }
        </View>
    }

    renderSpu(goods, selected) {
        let tip = this.state.labelHeight + px(218)
        let noTip = this.state.labelHeight + px(180)
        let noPay = goods.choiceFlag != '1' || !User.vip && User.isLogin && goods.choiceFlag == '1' && goods.canBeCommon == '1'
        let shopNotPay = !User.vip && User.isLogin && goods.choiceFlag == '1' && goods.canBeCommon != '1'
        let height = noPay
            ? this.state.labelHeight
            : shopNotPay
                ? noTip
                : tip;

        let plus = shopNotPay || User.vip && User.isLogin && goods.choiceFlag == '1' && !this.state.paySelected
        height = plus ? height : height + px(113)
        height = height > 400 ? 400 : height;

        return <ScrollView iosalwaysBounceVertical={false} style={{height: height, backgroundColor: "#fff"}}>
            {
                noPay ? null : this.renderPayStyle(goods)
            }
            {this.renderSpec(goods, selected)}
            {
                !plus ?
                    <View style={[SpecificationsStyle.other]}>
                        <View style={SpecificationsStyle.quantityBox}>
                            <Text allowFontScaling={false} style={SpecificationsStyle.quantity}>数量</Text>
                            <Text allowFontScaling={false} style={{ fontSize: px(24), color: '#858385', marginRight: px(45) }}>
                                {this.props.area.goodsStockMsg}
                            </Text>
                            <View style={SpecificationsStyle.quantityMain}>
                                <TouchableOpacity activeOpacity={0.8} onPress={this.reduce.bind(this)} style={SpecificationsStyle.reduce}>
                                    <Text
                                        style={[SpecificationsStyle.reduceText, this.state.initQuantity == 1 ? SpecificationsStyle.quantityBtnDisabled : '']}>
                                        -
                                    </Text>
                                </TouchableOpacity>
                                <View style={SpecificationsStyle.quantityInputBox}>
                                    <TextInput
                                        style={SpecificationsStyle.quantityInput}
                                        value={String(this.state.initQuantity)}
                                        autoFocus={false}
                                        underlineColorAndroid="transparent"
                                        keyboardType="numeric"
                                        onChangeText={this.quantityChange.bind(this)}>
                                    </TextInput>
                                </View>
                                <TouchableOpacity activeOpacity={0.8} onPress={this.plus.bind(this)} style={SpecificationsStyle.plus}>
                                    <Text
                                        style={[SpecificationsStyle.plusText, this.state.initQuantity == this.props.area.limitStock ? SpecificationsStyle.quantityBtnDisabled : '']}>
                                        +
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View> : null
            }
        </ScrollView>
    }
    /**
     * 可配送无库存：   已抢光
     * 不可配送无库存： 暂不配送
     * 不可配送有库存： 暂不配送
     * 店主:
     *    left：
     *     可配送有库存：   加入购物车(预售商品隐藏)
     *    right:           立即购买
     * vip:
     *     可配送有库存：    确定
     * c:                  立即购买
     */
    renderFooterBtn(extraStyles, txt) {
        return <View style={[SpecificationsStyle.btn, extraStyles]}>
            <Text allowFontScaling={false} style={[SpecificationsStyle.btnTxt]}>
                {txt}
            </Text>
        </View>
    }
    /**
     *底部按钮
     */
    renderFooter(goods, area) {
        let spe = !User.vip && User.isLogin && goods.choiceFlag == '1' && goods.canBeCommon != '1'
        let nol = goods.choiceFlag != '1' || !User.vip && User.isLogin && goods.choiceFlag == '1' && goods.canBeCommon == '1' || User.vip && User.isLogin && goods.choiceFlag == '1' && goods.canBeCommon == '1' && this.state.paySelected
        // nol && goods.isBuyLimit == 1 || spe ? {height: px(156)} : {height: px(90)}
        return <View style={[{ backgroundColor: '#fff', width: deviceWidth, flexDirection: 'column' }, {height: px(180)}]}>
            <View style={{
                height: px(90),
                justifyContent: 'flex-end',
            }}>
                {
                    spe &&
                    <View style={[SpecificationsStyle.tipLimitBuy, {alignItems: 'center'}]}>
                        <Text style={SpecificationsStyle.tipLimitBuyTip} allowFontScaling={false}>精选商品每个店主限购一次，好宝贝快和朋友一起分享吧</Text>
                    </View>
                }

                {
                    nol && goods.isBuyLimit == 1 &&
                    <View style={SpecificationsStyle.tipLimitBuy}>
                        <Text style={SpecificationsStyle.tipLimitBuyTip} allowFontScaling={false}>{goods.buyLimitMsg}</Text>
                    </View>
                }
            </View>
            <View style={SpecificationsStyle.bottom}>
                {
                    !spe && area.deliveryAreaStatus == 0 &&
                    this.renderFooterBtn(SpecificationsStyle.bgGray, '暂不配送')
                }
                {
                    !spe && area.deliveryAreaStatus == 1 && area.limitStock == 0 &&
                    this.renderFooterBtn(SpecificationsStyle.bgGray, '已抢光')
                }
                {
                    spe &&
                    <TouchableWithoutFeedback
                        onPress={() => {
                            if (this.props.sharePage) {
                                this.cancelSpecStatus(null, () => {
                                    this.props.sharePage && this.props.sharePage(1)
                                })
                            }
                        }}>
                        {this.renderFooterBtn(SpecificationsStyle.bgMain, '立即分享')}
                    </TouchableWithoutFeedback>
                }
                {
                    !spe && area.deliveryAreaStatus == 1 && area.limitStock > 0 &&
                    <View style={{flexDirection: 'row', flex: 1}}>
                        {
                            User.vip && User.isLogin && goods.choiceFlag == '1' && !this.state.paySelected &&
                            <TouchableWithoutFeedback
                                onPress={this.goSubmit2.bind(this)}>
                                {this.renderFooterBtn(SpecificationsStyle.bgMain, '立即购买')}
                            </TouchableWithoutFeedback>
                        }
                        {
                            nol && User.isLogin && (!area.preSaleYn || area.preSaleYn == 'N') ?
                                <TouchableWithoutFeedback
                                    onPress={this.addCartFn.bind(this)}>
                                    {this.renderFooterBtn(SpecificationsStyle.bgBlue, '加入购物车')}
                                </TouchableWithoutFeedback> : null
                        }
                        {
                            nol &&
                            <TouchableWithoutFeedback
                                activeOpacity={0.8}
                                onPress={this.goSubmit.bind(this)}>
                                {
                                    User.isLogin ?
                                        this.renderFooterBtn(SpecificationsStyle.bgMain, '立即购买')
                                        : this.renderFooterBtn(SpecificationsStyle.bgBlue, '立即购买')
                                }
                            </TouchableWithoutFeedback>
                        }
                    </View>
                }
                {/*{User.vip && this.props.st === 0 && <TouchableWithoutFeedback onPress={this.addCartFn.bind(this)}>
                            {this.renderFooterBtn(SpecificationsStyle.bgMain, '确认')}
                        </TouchableWithoutFeedback>}
                        {User.vip && this.props.st === 1 && <TouchableWithoutFeedback onPress={this.goSubmit.bind(this)}>
                            {this.renderFooterBtn(SpecificationsStyle.bgMain, '确认')}
                        </TouchableWithoutFeedback>}*/}
            </View>
        
        
        
        </View>
    }

    renderPayStyle(goods) {
        let role = User.vip && User.isLogin ? 0 : !User.vip && User.isLogin ? 1 : 0
        return <View style={!role && !this.state.paySelected ? SpecificationsStyle.payWrap2 : SpecificationsStyle.payWrap1}>
            <Text style={SpecificationsStyle.payTitle}>购买方式</Text>
            <View style={{flexDirection: 'row'}}>
                <TouchableWithoutFeedback onPress={() => this.payClick(false)}>
                    <View style={!this.state.paySelected ? SpecificationsStyle.payBlock2 : SpecificationsStyle.payBlock1}>
                        <Text style={!this.state.paySelected ? {color: '#fff', fontSize: px(26)} : {color: '#515151', fontSize: px(26)}}>精选商品</Text>
                    </View>
                </TouchableWithoutFeedback>
                <View style={{width: px(25)}}></View>
                {
                    !role && goods.choiceFlag == '1' && goods.canBeCommon == '1' ? <TouchableWithoutFeedback onPress={() => this.payClick(true)}>
                        <View style={this.state.paySelected ? SpecificationsStyle.payBlock2 : SpecificationsStyle.payBlock1}>
                            <Text style={!this.state.paySelected ? {color: '#515151', fontSize: px(26)} : {color: '#fff', fontSize: px(26)}}>正常购买</Text>
                        </View>
                    </TouchableWithoutFeedback> : null
                }
            </View>
            {
                !role && !this.state.paySelected ? <Text style={{fontSize: px(22), color: '#D0648F', marginTop: px(15)}}>购买精选商品可以获赠店主权益哦，还有金币优惠券等你来拿</Text> : null
            }
        </View>
    }

    payClick(is) {
        if (this.state.paySelected == is) return;
        this.setState({
            paySelected: is
        })
        this.setState({
            initQuantity: 1
        })
    }
    
    
    render() {
        const { goods, area } = this.props
        const { selected, specStatus, smallImage } = this.state
        if (!specStatus) return null;
        let salePrice = area.salePrice ? area.salePrice : goods.salePrice
        return <Modal
            animationType="none"
            transparent={true}
            visible={this.state.specStatus}
            onRequestClose={() => null}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                <View style={SpecificationsStyle.warp}>
                    <TouchableOpacity activeOpacity={0.9}
                        style={{ width: px(750), flex: 1 }} onPress={this.cancelSpecStatus}>
                    </TouchableOpacity>
                    <Animated.View style={[SpecificationsStyle.content, {
                        transform: [
                            { translateY: this.state.translateValue }, // y轴移动
                        ]
                    }]}>
                        {/*<View style={SpecificationsStyle.pos_}></View>*/}
                        <View style={{ paddingBottom: isIphoneX() ? px(60) : 0 }}>
                            {this.renderBasic(goods, smallImage, salePrice)}
                            {this.renderSpu(goods, selected)}
                            {this.renderFooter(goods, area)}
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Modal >
    
    }
    async componentDidMount() {
        if (this.props.area.limitStock > 0 && this.state.initQuantity > this.props.area.limitStock) {
            this.setState({
                initQuantity: this.props.area.limitStock
            })
        }
    }

    startAnimation() {
        this.state.translateValue.setValue(px(500));
        Animated.timing(
            this.state.translateValue,
            {
                toValue: 0,
                duration: 500
            }
        ).start();
    }
    cancelSpecStatus = (e, cb) => {
        Animated.timing(
            this.state.translateValue,
            {
                toValue: px(1000),
                duration: 500
            }
        ).start(() => {
            this.setState({
                specStatus: false
            }, () => {
                cb && cb()
            })
        });
    }
    plus() {
        if (this.props.goods.isBuyLimit == 1 && this.state.initQuantity >= this.props.goods.buyLimitNum) {
            return toast(`该商品为限购商品,${this.props.goods.buyLimitMsg}`);
        }
        if (this.props.area.limitStock >= 0 && this.state.initQuantity >= this.props.area.limitStock) {
            return toast(`库存仅剩${this.props.area.limitStock}件`);
        }
        let qty = this.state.initQuantity || 1;
        this.setState({
            initQuantity: ++qty
        })
    }
    reduce() {
        if (this.state.initQuantity == 1) {
            return;
        }
        let qty = this.state.initQuantity || 2;
        this.setState({
            initQuantity: --qty
        });
    }
    quantityChange(num) {
        if (num > this.props.area.limitStock) {
            num = 1
            toast(`库存不足`);
        }
        if (num < 0) {
            num = -num;
        }
        this.setState({
            initQuantity: num
        });
    }
    Open() {
        /*if (!User.isLogin) {
            this.props.navigation.navigate('LoginPage');
            return;
        }*/
        this.setState({
            specStatus: true
        }, () => {
            this.startAnimation();
        });
    }
    
    getTip() {
        let selected = this.state.selected, tree_current = this.props.goods.treeInfo.tree_current;
        let emptyIndex = -1;
        if (selected[selected.length - 1] == '') {
            emptyIndex = selected.filter(v => v != '').length
            let tip = tree_current[emptyIndex].attr_name;
            toast(`请先选择${tip}`);
        }
    }
    
    async addCartFn() {
        if (!User.isLogin) {
            this.setState({
                specStatus: false
            }, () => {
                this.props.navigation.navigate('LoginPage');
            })
            return;
        }
        let selected = this.state.selected;
        if (selected[selected.length - 1] == '') {
            this.getTip();
            return;
        }
        TrackClick('SKUdetailpage', 'SKUdetailpageAddcar', '商品详情页', '加入购物车');
        try {
            let num = await CartList.addCartNum(this.props.goods.id, this.state.initQuantity);
            this.props.changeCartNum(num)
            this.setState({
                specStatus: false
            });
            toast('加入购物车成功');
        } catch (e) {
            if (e.data.oos !== 'oos') {
                toast(e.message);
            } else {
                this.setState({
                    specStatus: false
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
    }
    goSubmit2() {
        if (!User.isLogin) {
            this.setState({
                specStatus: false
            }, () => {
                this.props.navigation.navigate('LoginPage');
            })
            return;
        }

        let selected = this.state.selected;
        if (selected[selected.length - 1] == '') {
            this.getTip();
            return;
        }
        TrackClick('SKUdetailpage', 'SKUdetailpageBuynow', '商品详情页', '订单结算');
        if (!this.props.isShoping) {
            /*toast(`该商品${this.state.salesTimeStr}开始售卖，现在还没开售呢，再等等哟~`);
            return;*/
            let localDiffTime = Date.now() - this.props.preheatTime;
            if (this.props.preheatDiffTime > localDiffTime) {
                toast(`该商品${this.props.goods.salesTimeStr}开始售卖，现在还没开售呢，再等等哟~`);
                return;
            } else {
                this.props.changeShopping()
            }
        }

        this.setState({
            specStatus: false
        }, () => {
            this.props.navigation.navigate('SpeSubmitPage', {
                sku: this.props.goods.sku,
                salePrice: this.props.goods.salePrice,
                virtualYn: this.props.goods.virtualYn
            });
        });
    }
    goSubmit() {
        if (!User.isLogin) {
            this.setState({
                specStatus: false
            }, () => {
                this.props.navigation.navigate('LoginPage');
            })
            return;
        }

        let selected = this.state.selected;
        if (selected[selected.length - 1] == '') {
            this.getTip();
            return;
        }
        TrackClick('SKUdetailpage', 'SKUdetailpageBuynow', '商品详情页', '订单结算');
        if (!this.props.isShoping) {
            /*toast(`该商品${this.state.salesTimeStr}开始售卖，现在还没开售呢，再等等哟~`);
            return;*/
            let localDiffTime = Date.now() - this.props.preheatTime;
            if (this.props.preheatDiffTime > localDiffTime) {
                toast(`该商品${this.props.goods.salesTimeStr}开始售卖，现在还没开售呢，再等等哟~`);
                return;
            } else {
                this.props.changeShopping()
            }
        }

        this.setState({
            specStatus: false
        }, () => {
            this.props.navigation.navigate('SubmitPage', {
                prodIds: this.props.goods.id,
                prodQtys: this.state.initQuantity || 1,
                from: 'buy_now',
                addressFrom: this.props.area,
                callback: () => this.props.getArea && this.props.getArea(this.props.goods.id, this.props.goods)
            })
        })
    }
    
    async changeTab(index, i) {
        try {
            let arr = this.state.selected;
            let select = this.props.goods.treeInfo.tree_select;
    
            if (index === 0) {
                arr[0] = i;
                select = select[i];
            } else {
                select = select[arr[0]]
            }
    
            arr.reduce((total, currentValue, currIndex) => {
                if (currIndex == 1) total = select;
                if (currIndex == index) {
                    arr[currIndex] = i;
                    return total[i];
                } else {
                    let obj = total[arr[currIndex]];
                    if (!obj){
                        arr[currIndex] = '';
                        obj = {};
                    }
                    return obj;
                }
            })
            this.setState({
                selected:arr
            })
            if (arr[arr.length - 1] !== '') {
                let lastObj = this.exist(arr.length - 1, arr[arr.length - 1])
                this.setState({
                    sku: lastObj.sku,
                    smallImage: lastObj.shareImage,
                    initQuantity: 1
                })
                this.props.spuChangeBind()
                await this.props.getData(lastObj.sku)
            }
        } catch (e) {
            //
        }
    }
}

const SpecificationsStyle = StyleSheet.create({
    payWrap1: {
        backgroundColor: '#fff',
        height: px(180),
        paddingTop: px(57),
        paddingLeft: px(31)
    },
    payWrap2: {
        backgroundColor: '#fff',
        height: px(218),
        paddingTop: px(57),
        paddingLeft: px(31)
    },
    payTitle: {
        fontSize: px(28),
        color: '#252426',
        paddingBottom: px(23)
    },
    payBlock1: {
        width: px(161),
        height: px(55),
        backgroundColor: '#F6F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: px(6)
    },
    payBlock2: {
        width: px(161),
        height: px(55),
        backgroundColor: '#D0648F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: px(6)
    },
    warp: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(36, 37, 38, 0.5)'
    },
    content: {
        width: px(750),
        flexDirection: 'column'
    },
    pos: {
        height: px(60),
    },
    detail_: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        //height: px(159),
        position: 'relative',
    },
    coverImageBox: {
        width: px(208),
        height: px(208),
        borderRadius: px(10),
        paddingLeft: px(4),
        paddingTop: px(4),
        zIndex: 10,
        backgroundColor: '#fff',
        position: 'absolute',
        left: px(26),
        top: px(-60),
        bottom: 0
    },
    detail: {
        width: px(750),
        paddingLeft: px(259),
        paddingRight: px(30),
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: px(148),
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    coverImage: {
        width: px(200),
        height: px(200),
        borderRadius: px(10)
    },
    close: {
        fontSize: px(50),
        color: '#bcbdbf'
    },
    closeImage: {
        width: px(22),
        height: px(22),
    },
    closeImageBox: {
        width: px(110),
        height: px(79),
        //backgroundColor:'#000',
        paddingTop: px(29),
        paddingLeft: px(30),
        alignItems: 'flex-end'
    },
    specification: {
        backgroundColor: '#fff',
        paddingLeft: px(30)
    },
    spuContent: {
        paddingTop: px(58),
        width: px(750)
    },
    spuTitle: {
        fontSize: px(28),
        color: '#252426',
        marginBottom: px(20)
    },
    spu: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    spuItem: {
        minWidth: px(154),
        paddingHorizontal: px(20),
        height: px(55),
        borderRadius: px(10),
        overflow: 'hidden',
        paddingTop: px(13),
        backgroundColor: '#f6f5f7',
        marginRight: px(27),
        marginBottom: px(27),
    },
    spuItemTxt: {
        textAlign: 'center',
        fontSize: px(26),
        color: '#515151', //fff
    },
    bgunSelect: {
        backgroundColor: '#f6f5f7',
    },
    bgUnable: {
        backgroundColor: '#efefef', //d0648f
    },
    bgMainTxt: {
        backgroundColor: '#d0648f', //d0648f
        color: '#fff', //fff
    },
    spuItemUnSelect: {
        backgroundColor: '#efefef', //d0648f
        color: '#b2b3b5', //fff
    },
    other: {
        width: px(750),
        // height: px(282),
        height: px(113),
        backgroundColor: '#fff',
        flexDirection: 'column',
        paddingTop: px(33)
    },
    spuCartMain: {
        flex: 1
    },
    bottom: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    btn: {
        flex: 1,
        //backgroundColor: '#56beec',
        //width: px(310),
        height: px(90),
        justifyContent: 'center',
        alignItems: 'center'
    },
    bgMain: {
        backgroundColor: '#d0648f',
    },
    bgBlue: {
        backgroundColor: '#56beec',
    },
    bgGray: {
        backgroundColor: '#b2b3b5'
    },
    btnTxt: {
        fontSize: px(30),
        color: '#fff',
        includeFontPadding: false
    },
    tipLimitBuy: {
        paddingTop: px(18),
        paddingBottom: px(18),
        alignItems: 'flex-end',
        paddingRight: px(30)
    },
    tipLimitBuyTip: {
        color: '#ed3f58',
        fontSize: px(22)
    },
    quantityBox: {
        paddingHorizontal: px(30),
        flexDirection: 'row',
        height: px(80),
        alignItems: 'center',
    },
    quantity: {
        fontSize: px(30),
        flex: 1
    },
    quantityMain: {
        width: px(198),
        height: px(58),
        borderWidth: px(1),
        borderColor: '#e5e5e5',
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: px(10)
    },
    quantityInputBox: {
        flex: 1,
        backgroundColor: '#fff',
        borderRightWidth: px(1),
        borderRightColor: '#e5e5e5'
    },
    quantityInput: {
        flex: 1,
        textAlign: 'center',
        padding: 0,
        fontSize: px(28)
    },
    quantityBtnBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    quantityBtnDisabled: {
        color: '#ddd'
    },
    reduce: {
        width: px(58),
        height: px(58),
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: px(1),
        borderRightColor: '#e5e5e5'
    },
    reduceText: {
        fontSize: px(28),
        color: '#252426',
    },
    plus: {
        width: px(58),
        height: px(58),
        alignItems: 'center',
        justifyContent: 'center'
    },
    plusText: {
        fontSize: px(28),
        color: '#252426',
    }
});