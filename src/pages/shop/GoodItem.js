'use strict';

import React from 'react';
import { Dimensions, Image, PixelRatio, Platform, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import { User } from '../../services/Api';
import { TrackClick } from '../../services/Track';
import base from '../../styles/Base';
import Background from '../../UI/lib/Background';
import Icon from '../../UI/lib/Icon';
import { px, px1 } from "../../utils/Ratio"
import { setSpText } from '../../utils/AdaptationSize';
import util_cools from '../../utils/tools';
import { log } from '../../utils/logs';
import Img from "../../UI/lib/Img"

const deviceWidth = Dimensions.get('window').width;
const pxRatio = PixelRatio.get();  // 屏幕像密度

//original_img

/**
 * 列表商品单独一项的样式
 * @property    tab     tab的id
 * @property    show    显示
 * @property    shareEvent  分享
 * @property    item
 * @property    onLayout
 * @property    navigation
 * @property    addCart
 */
export default class extends React.Component {

    /**
     * 适配 iphone6 和 iPhone6p
     * 暂时，待优化
     * @returns {*}
     */
    setHeight() {
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
    // renderOther(item) {
    //     if (!item) return null;
    //     return <TouchableOpacity activeOpacity={0.9} onPress={() => this.getDetail(item)}>
    //         <View style={[GoodStyle.bGood, { height: this.setHeight() }]}>
    //             <View style={GoodStyle.box1}>
    //                 <View style={GoodStyle.imageBox}>
    //                     <Image
    //                         resizeMethod="scale"
    //                         source={{ uri: this.props.show ? item.image : require('../../images/img2') }}
    //                         style={GoodStyle.goodsCoverBig} />
    //                     {!this.props.show && <Icon name="default_img" style={GoodStyle.goodsCoverBig2} />}
    //                     {item.salesTimeDiff > 0 && !item.salesEndTimeDiff && <View style={[GoodStyle.preheatBgContainer, GoodStyle.pC2]}>
    //                         <Background style={GoodStyle.preheatBigBg} name="icon-pre2" >
    //                             <Text allowFontScaling={false} style={GoodStyle.preheatTxt}>{item.salesTimeStr} 开始售卖</Text>
    //                         </Background>
    //                     </View>}
    //                     {item.salesEndTimeDiff > 0 && <View style={[GoodStyle.preheatBgContainer, GoodStyle.pC1]}>
    //                         <Background style={GoodStyle.preheatBigBg} name="icon-pre1" >
    //                             {
    //                                 item.salesTimeDiff > 0 && <Text allowFontScaling={false} style={GoodStyle.preheatTxt}>限时特卖 预热中</Text>
    //                             }
    //                             {
    //                                 item.salesTimeDiff < 0 && item.salesEndTimeDiff > 0 &&
    //                                 <Text allowFontScaling={false} style={GoodStyle.preheatTxt}>限时特卖 抢购中</Text>
    //                             }
    //                         </Background>
    //                     </View>}
    //                 </View>
    //                 {item.limitStock === 0 &&
    //                     <View style={GoodStyle.goods_img_coverBig}>
    //                         <Text allowFontScaling={false} style={GoodStyle.goods_img_txt}>抢光了</Text>
    //                     </View>
    //                 }
    //                 <View style={GoodStyle.labels2}>
    //                     {item.labelList && item.labelList.length > 0 && item.labelList.map((label) =>
    //                         <Image key={label.labelId}
    //                             resizeMode="contain" resizeMethod="scale"
    //                             style={[GoodStyle.labelImg, { width: px(label.width), height: px(label.height) }]}
    //                             source={{ uri: label.labelLogo, cache: "force-cache" }} />
    //                     )}
    //                 </View>
    //             </View>

    //             <View style={GoodStyle.box2}>
    //                 <View style={GoodStyle.box3}>
    //                     <View style={base.inline_left}>
    //                         {
    //                             item.preSaleYn == 'N' &&
    //                             <Icon name="preSale" style={{ width: px(44), height: px(24), marginRight: px(10) }} />
    //                         }
    //                         <Text allowFontScaling={false}
    //                             numberOfLines={1}
    //                             style={GoodStyle.goodsShowName}>
    //                             {item.goodsShowName}
    //                         </Text>
    //                     </View>
    //                     <View style={GoodStyle.txt1}>
    //                         {(item.isInBond == 1 || item.isForeignSupply == 2) &&
    //                             <View
    //                                 style={[GoodStyle.flag_, item.isInBond == 1 ? GoodStyle.flagB : GoodStyle.flagZ]}>
    //                                 <Text
    //                                     style={GoodStyle.flagTxt}
    //                                     allowFontScaling={false}>
    //                                     {item.isInBond == 1 ? '保税' : item.isForeignSupply == 2 ? '直邮' : ''}
    //                                 </Text>
    //                             </View>
    //                         }
    //                         <Text style={[GoodStyle.goodsShowDesc, { flex: 1 }]} allowFontScaling={false}
    //                             numberOfLines={1}>
    //                             {item.goodsShowDesc}
    //                         </Text>
    //                     </View>

    //                     <View style={base.inline_left}>
    //                         <Text allowFontScaling={false}
    //                             style={GoodStyle.salePrice}>
    //                             ￥
    //                             <Text allowFontScaling={false} style={GoodStyle.salePrice_}>
    //                                 {util_cools.parsePrice(item.salePrice)}
    //                             </Text>
    //                         </Text>
    //                         {
    //                             User.isLogin && !User.vip && <Text allowFontScaling={false}
    //                                 style={GoodStyle.gan}>
    //                                 /
    //                             </Text>
    //                         }
    //                         {
    //                             User.isLogin && !User.vip && <Text allowFontScaling={false}
    //                                 style={GoodStyle.benefitMoney}>
    //                                 赚￥{util_cools.parsePrice(item.benefitMoney)}
    //                             </Text>
    //                         }
    //                     </View>
    //                 </View>
    //                 <View style={GoodStyle.box4}>
    //                     {User.isLogin && !User.vip && <TouchableOpacity
    //                         activeOpacity={0.8}
    //                         onPress={() => this.sharePage(item)}>
    //                         <View style={GoodStyle.cartC}>
    //                             <Icon name="icon-index-shareNew" style={GoodStyle.cartShare} />
    //                         </View>
    //                     </TouchableOpacity>}
    //                     {User.isLogin && (!User.vip || item.preSaleYn == 'Y') && <Icon
    //                         name="icon-index-line"
    //                         style={{ width: px(2), height: px(24), marginHorizontal: px(22) }} />
    //                     }
    //                     {
    //                         item.preSaleYn == 'N' &&
    //                         <TouchableOpacity
    //                             activeOpacity={0.8}
    //                             onPress={() => this.props.addCart(item.id, 1, item.key, 'shop')}>
    //                             <View style={GoodStyle.cartC}>
    //                                 <Icon name="icon-index-cartNew" style={GoodStyle.cartShare} />
    //                             </View>
    //                         </TouchableOpacity>
    //                     }
    //                 </View>
    //             </View>
    //         </View>
    //     </TouchableOpacity>
    // }
    render2(item) {
        if (!item) return null;
        let image = util_cools.cutImage(item.original_img, 250, 250);
        return <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this.getDetail(item)}>
            <View style={goodStyle.box}>
                <View style={goodStyle.img_box}>
                    <Image
                        resizeMethod="scale"
                        source={{ uri: this.props.show ? image : require('../../images/img2') }}
                        style={goodStyle.goodsCoverBig} />
                    {
                        item.limitStock === 0 &&
                        <Icon name="soldout" style={goodStyle.goods_img_coverBig} />
                    }
                    <View style={goodStyle.labels}>
                        {item.labelList && item.labelList.length > 0 && item.labelList.map((label) =>
                            <Image key={label.labelId}
                                resizeMode="contain" resizeMethod="scale"
                                style={[goodStyle.labelImg, { width: px(label.width), height: px(label.height) }]}
                                source={{ uri: label.labelLogo, cache: "force-cache" }} />
                        )}
                    </View>
                </View>
                <View style={goodStyle.info_box}>
                    <Text numberOfLines={1} style={goodStyle.tit}>{item.goodsShowName}</Text>
                    <Text numberOfLines={2} style={goodStyle.desc}>{item.goodsShowDesc}</Text>
                    <View style={base.inline_left}>
                        {
                            item.preSaleYn == 'Y' &&
                            <Icon name="preSale" style={{ width: px(44), height: px(24), marginRight: 4 }} />
                        }
                        {
                            item.isInBond == 1 &&
                            <Icon name="bond" style={goodStyle.bond} />
                        }
                        {
                            item.isForeignSupply == 2 &&
                            <Icon name="isForeignSupply" style={goodStyle.bond} />
                        }
                        {item.salesTimeDiff > 0 && !item.salesEndTimeDiff &&
                            <View style={goodStyle.preheatBigBg}  >
                                <Text allowFontScaling={false} style={goodStyle.preheatTxt}>{item.salesTimeStr} 开始售卖</Text>
                            </View>}
                        {item.salesEndTimeDiff > 0 &&
                            <View style={goodStyle.preheatBg}  >
                                {
                                    item.salesTimeDiff > 0 && <Text allowFontScaling={false} style={goodStyle.preheatTxt_s}>限时特卖 预热中</Text>
                                }
                                {
                                    item.salesTimeDiff < 0 && item.salesEndTimeDiff > 0 &&
                                    <Text allowFontScaling={false} style={goodStyle.preheatTxt_s}>限时特卖 抢购中</Text>
                                }
                            </View>
                        }
                    </View>

                    <View style={goodStyle.money}>
                        <Text allowFontScaling={false} style={goodStyle.salePrice}>
                            ￥
                        </Text>
                        <Text allowFontScaling={false} style={goodStyle.salePrice_}>
                            {util_cools.parsePrice(item.salePrice)}
                        </Text>
                        {
                            User.isLogin && !User.vip &&
                            <Text allowFontScaling={false} style={goodStyle.priceLine}>
                                /
                            </Text>
                        }
                        {
                            User.isLogin && !User.vip &&
                            <Text allowFontScaling={false} style={goodStyle.benefitMoney}>
                                赚￥{util_cools.parsePrice(item.benefitMoney)}
                            </Text>
                        }
                    </View>
                    <View style={[goodStyle3.bottom]}>
                        <View style={goodStyle3.btnGroup}>
                            {
                                User.isLogin && !User.vip && <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.sharePage(item)}>
                                    <Icon name="btn-share3" style={goodStyle3.btnGroupShare} />
                                </TouchableOpacity>
                            }
                            {
                                User.isLogin && !User.vip && <View style={goodStyle3.btnGroupLine}></View>
                            }
                            <TouchableOpacity activeOpacity={.8}
                                onPress={() => this.props.addCart(item.id, 1, item.key, "shop")}>
                                <Text style={goodStyle3.btnGroupCart}>马上抢</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            <View style={goodStyle.line}></View>
        </TouchableOpacity>
    }
    render() {
        const { item } = this.props;
        if (!item) return null;
        return <View
            onLayout={(e => this.props.onLayout && this.props.onLayout(e.nativeEvent))}
            style={[GoodStyle.goodsBox2, { height: px(298) }]}>
            {this.render2(item.data)}
        </View>
    }
    // #region   方法
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    componentWillReceiveProps(pp) {
        if (pp.show != this.props.show) this.shouldUpdate = true;
    }
    getDetail(goods) {
        this.trackClickShopDetail(goods.key)
        this.props.navigation.navigate('DetailPage', {
            id: goods.sku ? '' : goods.id,
            sku: goods.sku
        });
    }
    trackClickShopDetail(i) {
        let index = i + 1;
        if (!this.props.tab) {
            TrackClick('Home-SKUlist', `Home-SKUlistClick-${index}`, '首页', `商详页-${index}`)
        } else {
            TrackClick('Channel-SKUlist', `Channel-SKUlistClick-${index}`, '首页', `商详页-${index}`)
        }
    }
    sharePage(goods) {
        this.props.shareEvent && this.props.shareEvent(goods, this.props.tab, 'shop');
    }
    // #endregion
}

const GoodStyle = StyleSheet.create({
    goodsBox2: {
        width: deviceWidth,
        // height: px(500),
        overflow: 'hidden'
    },
    bGood: {
        alignItems: 'flex-start',
        width: deviceWidth,
        overflow: 'hidden',
        backgroundColor: '#fff',
        // height: px(500),
    },
    box1: {
        width: deviceWidth,
        alignItems: 'center',
        marginTop: 10,
    },
    imageBox: {
        width: px(710),
        height: px(356),
        position: 'relative',
        zIndex: 0,
        borderRadius: px(12),
        overflow: 'hidden'
    },
    goodsCoverBig: {
        width: px(710),
        height: px(356),
        overflow: 'hidden',
        borderRadius: px(12)
    },
    goodsCoverBig2: {
        width: px(115),
        height: px(71),
        marginLeft: px(297),
        marginTop: px(142)
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
    preheatBigBg: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: px(10)
    },
    pC1: {
        width: px(450),
    },
    pC2: {
        width: px(600)
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
    box2: {
        width: deviceWidth,
        flexDirection: 'row',
        paddingLeft: 10,
        marginTop: Platform.OS === "ios" ? 10 : 6,
    },
    box3: {
        width: px(527),
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    goodsShowName: {
        fontSize: px(32),
        color: '#000',
        includeFontPadding: false,
    },
    txt1: {
        flexDirection: 'row',
        marginTop: Platform.OS === "ios" ? 4 : 2
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
    salePrice: {
        fontSize: px(20),
        color: "#000",
        includeFontPadding: false,
    },
    salePrice_: {
        color: "#000",
        fontSize: px(32),
        includeFontPadding: false,
    },
    gan: { fontSize: px(24), color: '#898989', marginHorizontal: px(10) },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(24),
        includeFontPadding: false,
    },
    box4: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
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
    }
})

exports.GoodItem2 = class extends React.Component {

    static defaultProps = {
        showShare: true,
        onLayout: function () { },
        getDetail: function () { },
        sharePage: function () { },
        addCart: function () { },
    }

    render() {
        const item = this.props.item;

        if (!item) return null;
        return <TouchableOpacity onLayout={e => this.props.onLayout(e)}
            activeOpacity={0.8}
            onPress={() => this.props.getDetail()}>
            <View style={goodStyle.box}>
                <View style={goodStyle.img_box}>
                    <Img resizeMethod="scale"
                        width={125} height={125} style={goodStyle.goodsCoverBig}
                        src={item.original_img} />
                    {
                        item.limitStock === 0 &&
                        <Icon name="soldout" style={goodStyle.goods_img_coverBig} />
                    }
                    <View style={goodStyle.labels}>
                        {item.labelList && item.labelList.length > 0 && item.labelList.map((label) =>
                            <Image key={label.labelId}
                                resizeMode="contain" resizeMethod="scale"
                                style={[goodStyle.labelImg, { width: px(label.width), height: px(label.height) }]}
                                source={{ uri: label.labelLogo, cache: "force-cache" }} />
                        )}
                        {/* <Image
                                resizeMode="contain" resizeMethod="scale"
                                style={[goodStyle.labelImg, { width: px(90), height: px(90) }]}
                                source={{ uri: "http://img8.daling.com/zin/2018/01/10/FA163E0C4D3EI1AF2VN2AM51OIK.png", cache: "force-cache" }} /> */}
                    </View>
                </View>
                <View style={goodStyle.info_box}>
                    <Text numberOfLines={1} style={goodStyle.tit}>{item.oneWordSellPoint ? item.oneWordSellPoint : item.goodsShowName}</Text>
                    <Text numberOfLines={2} style={goodStyle.desc}>{item.goodsShowDesc}</Text>
                    <View style={base.inline_left}>
                        {
                            item.preSaleYn == 'Y' &&
                            <Icon name="preSale" style={{ width: px(44), height: px(24), marginRight: 4 }} />
                        }
                        {
                            item.isInBond == 1 &&
                            <Icon name="bond" style={goodStyle.bond} />
                        }
                        {
                            item.isForeignSupply == 2 &&
                            <Icon name="isForeignSupply" style={goodStyle.bond} />
                        }
                        {item.salesTimeDiff > 0 && !item.salesEndTimeDiff &&
                            <View style={goodStyle.preheatBigBg}  >
                                <Text allowFontScaling={false} style={goodStyle.preheatTxt}>{item.salesTimeStr} 开始售卖</Text>
                            </View>}
                        {item.salesEndTimeDiff > 0 &&
                            <View style={goodStyle.preheatBg}  >
                                {
                                    item.salesTimeDiff > 0 && <Text allowFontScaling={false} style={goodStyle.preheatTxt_s}>限时特卖 预热中</Text>
                                }
                                {
                                    item.salesTimeDiff < 0 && item.salesEndTimeDiff > 0 &&
                                    <Text allowFontScaling={false} style={goodStyle.preheatTxt_s}>限时特卖 抢购中</Text>
                                }
                            </View>
                        }
                    </View>
                    <View style={goodStyle.money}>
                        <Text allowFontScaling={false} style={goodStyle.salePrice}>
                            ￥
                        </Text>
                        <Text allowFontScaling={false} style={goodStyle.salePrice_}>
                            {util_cools.parsePrice(item.salePrice)}
                        </Text>
                        {
                            User.isLogin && !User.vip &&
                            <Text allowFontScaling={false} style={goodStyle.priceLine}>
                                /
                            </Text>
                        }
                        {
                            User.isLogin && !User.vip &&
                            <Text allowFontScaling={false} style={goodStyle.benefitMoney}>
                                赚￥{util_cools.parsePrice(item.benefitMoney)}
                            </Text>
                        }
                    </View>
                    <View style={[goodStyle3.bottom]}>
                        <View style={goodStyle3.btnGroup}>
                            {
                                this.props.showShare && User.isLogin && !User.vip && <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.props.sharePage()}>
                                    <Icon name="btn-share3" style={goodStyle3.btnGroupShare} />
                                </TouchableOpacity>
                            }
                            {
                                this.props.showShare && User.isLogin && !User.vip && <View style={goodStyle3.btnGroupLine}></View>
                            }
                            <TouchableOpacity activeOpacity={.8}
                                onPress={() => this.props.addCart(item.id, 1, item.key, item.sku + '/' + item.title)}>
                                <Text style={goodStyle3.btnGroupCart}>马上抢</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    }

}

const goodStyle = StyleSheet.create({
    box: {
        width: deviceWidth,
        height: px(298),
        flexDirection: 'row',
        backgroundColor: "#fff",
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    img_box: {
        width: px(250),
        marginLeft: px(24),
        marginTop: px(24)
    },
    labels: {
        position: 'absolute',
        left: px(8),
        top: px(8),
        zIndex: 10
    },
    labelImg: {
        width: px(60),
        height: px(60),
        marginRight: px(8)
    },
    goodsCoverBig: {
        width: px(250),
        height: px(250),
    },
    goods_img_coverBig: {
        position: 'absolute',
        left: px(45),
        top: px(45),
        zIndex: 1,
        width: px(160),
        height: px(160),
        borderRadius: px(80),
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center'
    },
    info_box: {
        flex: 1,
        marginLeft: px(20),
        marginTop: px(44),
        marginRight: px(30),
        height: px(206),
        // backgroundColor: "#ccc"
    },
    tit: {
        fontSize: px(32),
        color: "#000",
        marginBottom: px(10)
    },
    desc: {
        fontSize: px(22),
        color: "#666",
        marginBottom: px(6)
    },
    salePrice: {
        fontSize: px(20),
        color: "#000",
        lineHeight: px(35),
        includeFontPadding: false,
    },
    priceLine: {
        fontSize: px(22),
        color: '#898989',
        lineHeight: px(35),
        includeFontPadding: false,
        marginHorizontal: px(10)
    },
    salePrice_: {
        color: "#000",
        fontSize: px(32),
        lineHeight: px(35),
        includeFontPadding: false,
    },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(22),
        lineHeight: px(35),
        includeFontPadding: false,
    },
    money: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    bottom: {
        position: 'absolute',
        bottom: -2,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    line: {
        height: px1,
        backgroundColor: "#efefef"
    },
    cartC: {
        width: px(42),
        height: px(52),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    bond: {
        width: px(44),
        height: px(24),
        marginRight: 4,
    },
    cartShare: {
        width: px(42),
        height: px(42)
    },
    preheatBigBg: {
        marginRight: 4,
        backgroundColor: "#f2788a",
        borderRadius: px(4)
    },
    preheatBg: {
        marginRight: 4,
        backgroundColor: "#f2788a",
        borderRadius: px(4)
    },
    preheatTxt: {
        paddingHorizontal: 3,
        paddingVertical: 1,
        fontSize: setSpText(9),
        color: '#ffffff',
        includeFontPadding: false,
    },
    preheatTxt_s: {
        paddingHorizontal: 4,
        paddingVertical: 1,
        fontSize: setSpText(9),
        color: '#ffffff',
        includeFontPadding: false,
    },
})


exports.GoodItem3 = class extends React.Component {

    static defaultProps = {
        showShare: true,
        onLayout: function () { },
        getDetail: function () { },
        sharePage: function () { },
        addCart: function () { },
    }

    render() {
        const item = this.props.item;
        let image = util_cools.cutImage(item.original_img, 250, 250);

        if (!item) return null;
        return <TouchableOpacity onLayout={e => this.props.onLayout(e)}
            activeOpacity={0.8}
            onPress={() => this.props.getDetail()}>
            <View style={goodStyle3.box}>
                <View style={goodStyle3.img_box}>
                    <Img width={125} height={125} style={goodStyle3.goodsCoverBig}
                        src={item.original_img} />
                    {
                        item.limitStock === 0 &&
                        <View style={goodStyle3.goods_img_coverBig}><Icon name="soldout" style={goodStyle3.goods_img_cover_close} /></View>
                    }
                    <View style={goodStyle3.labels}>
                        {item.labelList && item.labelList.length > 0 && item.labelList.map((label) =>
                            <Image key={label.labelId}
                                resizeMode="contain" resizeMethod="scale"
                                style={[goodStyle3.labelImg, { width: px(label.width), height: px(label.height) }]}
                                source={{ uri: label.labelLogo, cache: "force-cache" }} />
                        )}
                    </View>
                </View>
                <View style={goodStyle3.info_box}>
                    <Text numberOfLines={1} style={goodStyle3.tit}>{item.oneWordSellPoint ? item.oneWordSellPoint : item.goodsShowName}</Text>
                    <Text numberOfLines={2} style={goodStyle3.desc}>{item.goodsShowDesc}</Text>
                    <View style={base.inline_left}>
                        {
                            item.isInBond == 1 &&
                            <Icon name="bond" style={goodStyle3.bond} />
                        }
                        {
                            item.isForeignSupply == 2 &&
                            <Icon name="isForeignSupply" style={goodStyle3.bond} />
                        }
                    </View>
                    <View style={goodStyle3.money}>
                        <Text allowFontScaling={false} style={goodStyle3.salePrice}>
                            ￥
                        </Text>
                        <Text allowFontScaling={false} style={goodStyle3.salePrice_}>
                            {util_cools.parsePrice(item.salePrice)}
                        </Text>
                        {
                            User.isLogin && !User.vip &&
                            <Text allowFontScaling={false} style={goodStyle3.priceLine}>
                                /
                            </Text>
                        }
                        {
                            User.isLogin && !User.vip &&
                            <Text allowFontScaling={false} style={goodStyle3.benefitMoney}>
                                赚￥{util_cools.parsePrice(item.benefitMoney)}
                            </Text>
                        }
                    </View>
                    <View style={[goodStyle3.bottom]}>
                        <View style={goodStyle3.btnGroup}>
                            {
                                this.props.showShare && User.isLogin && !User.vip && <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.props.sharePage()}>
                                    <Icon name="btn-share3" style={goodStyle3.btnGroupShare} />
                                </TouchableOpacity>
                            }
                            {
                                this.props.showShare && User.isLogin && !User.vip && <View style={goodStyle3.btnGroupLine}></View>
                            }
                            <TouchableOpacity activeOpacity={.8}
                                onPress={() => this.props.addCart(item.id, 1, item.key, item.sku + '/' + item.title)}>
                                <Text style={goodStyle3.btnGroupCart}>马上抢</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    }

}

const goodStyle3 = StyleSheet.create({
    box: {
        width: deviceWidth,
        height: px(308),
        flexDirection: 'row',
        backgroundColor: "#fff",
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    img_box: {
        width: px(250),
        marginLeft: px(24),
        marginTop: px(24),
    },
    labels: {
        position: 'absolute',
        left: px(8),
        top: px(8),
        zIndex: 10,
    },
    labelImg: {
        width: px(60),
        height: px(60),
        marginRight: px(8)
    },
    goodsCoverBig: {
        width: px(250),
        height: px(250),
    },
    goods_img_coverBig: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        width: px(250),
        height: px(250),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goods_img_cover_close: {
        width: px(160),
        height: px(160),
        borderRadius: px(80),
    },
    info_box: {
        flex: 1,
        marginLeft: px(20),
        marginTop: px(44),
        marginRight: px(30),
        height: px(195),
        // backgroundColor: "#ccc"
    },
    tit: {
        fontSize: px(32),
        color: "#000",
        marginBottom: px(12),
        includeFontPadding: false,
    },
    desc: {
        fontSize: px(22),
        color: "#666",
        marginBottom: px(16)
    },
    salePrice: {
        fontSize: px(20),
        color: "#000",
        includeFontPadding: false,
        lineHeight: px(35),
    },
    salePrice_: {
        color: "#000",
        fontSize: px(32),
        lineHeight: px(35),
        includeFontPadding: false,
    },
    priceLine: {
        fontSize: px(22),
        color: '#898989',
        lineHeight: px(35),
        marginHorizontal: px(10),
        includeFontPadding: false,
    },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(22),
        lineHeight: px(35),
        includeFontPadding: false,
    },
    money: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    bottom: {
        position: 'absolute',
        bottom: -2,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    line: {
        height: px1,
        backgroundColor: "#efefef"
    },
    cartC: {
        width: px(42),
        height: px(52),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    bond: {
        width: px(44),
        height: px(24),
        marginRight: px(10)
    },
    cartShare: {
        width: px(42),
        height: px(42)
    },
    btnGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#ea6992",
        height: px(54),
        borderRadius: px(28),
        paddingHorizontal: px(10),
    },
    btnGroupShare: {
        width: px(38),
        height: px(38),
        marginRight: px(12)
    },
    btnGroupLine: {
        backgroundColor: "#fff",
        width: px1,
        height: px(24),
        marginLeft: px(0),
        marginRight: px(2)
    },
    btnGroupCart: {
        color: "#fff",
        fontSize: px(24),
        fontWeight: "700",
        marginHorizontal: px(10),
    },
})