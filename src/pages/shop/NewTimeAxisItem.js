'use strict';
import React from 'react';

import {
    Text,
    View,
    Dimensions,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
    TouchableWithoutFeedback
} from 'react-native';

import NewTimeAxisTab from "./NewTimeAxisTab"
import Icon from '../../UI/lib/Icon'
import { User } from '../../services/Api';
import Background from '../../UI/lib/Background'
import base from '../../styles/Base'
import util_cools from '../../utils/tools';
import { TrackClick, TrackPage } from '../../services/Track';
import { deviceWidth, isIphoneX, px, px1 } from "../../utils/Ratio";
import { log } from "../../utils/logs"
import Event from '../../services/Event'
import { GoodItem3 } from "./GoodItem"
import Img from "../../UI/lib/Img"
import { Modules } from "./ShopPage_floor"
/**
 * 首页时间轴
 */

export default class NewTimeAxisItem extends React.Component {
    constructor(props) {
        super(props)
    }

    //#region
    // 渲染商品模版
    renderModuleGood(item) {
        if (!item) return null;
        return <View style={[goodModuleStyles.module]}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => this.goHtml(item)}>
                <Image resizeMode="cover" resizeMethod="scale" style={goodModuleStyles.moduleImage} source={{ uri: item.image }} />
                <View style={goodModuleStyles.jiao}>
                    <Icon name="time-line-jiao" style={{ width: deviceWidth, height: px(20) }} />
                </View>
            </TouchableOpacity>
            {
                item.items && item.items.length > 0 && <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    style={{
                        flex: 1,
                        paddingLeft: px(24),
                        backgroundColor: '#fff',
                        marginTop: px(20),
                    }}
                >
                    {
                        (item.items || []).map((k_item, i) =>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                key={i}
                                onPress={() => this.getDetail(k_item, item.title)}>
                                <View style={[{
                                    width: px(200),
                                    height: px(240),
                                    marginRight: px(20),
                                    justifyContent: 'space-between',
                                }]}>
                                    <Img style={[{ width: px(200), height: px(200) }]} src={k_item.original_img} width={100} height={100} />
                                    <View style={[goodModuleStyles.price, base.inline]}>
                                        <Text style={[{ fontSize: px(22), color: '#000' }]} allowFontScaling={false}>
                                            ￥{util_cools.parsePrice(k_item.salePrice)}
                                        </Text>
                                        {
                                            User.isLogin && !User.vip &&
                                            <Text style={[{ fontSize: px(22) }, base.color, base.inline, { marginLeft: px(10) }]} allowFontScaling={false}>
                                                <Text style={goodModuleStyles.priceTxt} allowFontScaling={false}>
                                                    /
                                                    </Text> 赚￥{util_cools.parsePrice(k_item.benefitMoney)}
                                            </Text>
                                        }
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    {
                        item.items.length > 3 && <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => this.goHtml(item)}>
                            <View style={{ width: px(200) }}>
                                <Image resizeMode="cover" resizeMethod="scale" style={[{ width: px(200), height: px(200) }, base.borderRadius10]} source={{ uri: 'http://img.daling.com/st/dalingjia/more.png' }} />
                            </View>
                        </TouchableOpacity>
                    }
                </ScrollView>
            }
            <View style={goodModuleStyles.line}></View>
        </View>
    }

    renderModule(item) {
        return <View >
            <View style={[{
                paddingBottom: 12,
                justifyContent: "center",
            }]}>
                {item.moduleTemplates && item.moduleTemplates.map((i, _index) => <View key={_index}>
                    {Modules.get(i.tplId, {
                        i,
                        p_index: item.key,
                        goOtherPage: this.props.goOtherPage,
                        isMargin: false,
                        isApplName: item.isApplName
                    })}
                </View>)}
            </View>
            <View style={goodModuleStyles.line}></View>
        </View>
    }
    render() {
        let { good } = this.props;
        if (!good) return null;
        return <View onLayout={e => this.props.onLayout(e)} style={[goodOtherStyles.goodsBox2]}>
            {good.type == '1' && <GoodItem3
                item={good}
                getDetail={() => this.getDetail(good)}
                addCart={(id, num, key, tit) => this.props.addCart(id, num, key, tit)}
                sharePage={() => this.sharePage(good)} />}
            {good.type == '2' && this.renderModuleGood(good)}
            {good.moduleName !== undefined && this.renderModule(good)}
        </View>
    }

    // 对外的懒加载更新渲染
    componentWillReceiveProps(nextProps) {
        if (this.props.show == nextProps.show) {
            this.updated = false
        } else {
            this.updated = true
        }
    }

    // 控制渲染
    updated = true
    shouldComponentUpdate() {
        if (this.updated) {
            return true;
        }
        return false;
    }

    getDetail(goods, title) {  //跳转商品详情
        TrackClick('Home-TimeAxisSKUlist', `Click-${goods.sku}`, '首页', `${title || goods.title}-${goods.sku}`);
        this.props.navigation.navigate('DetailPage', {
            sku: goods.sku
        });
    }

    goHtml(goods, title) {  //跳转专题
        let url = goods.topicUrl, topicId = '活动主题'
        if (url && url.indexOf('/subject/') > -1) {
            topicId = url.split('/subject/')[1]
        }
        TrackClick('Home-TimeAxis', `Cam-${title || goods.title}`, '首页', `${title || goods.title}-${topicId}`);

        if (goods.topicUrl.indexOf("/active/") > 0) {
            this.props.navigation.navigate('BrowerPage', {
                webPath: goods.topicUrl,
                img: goods.image
            });
        } else {
            this.props.navigation.navigate('HtmlViewPage', {
                webPath: goods.topicUrl,
                img: goods.image
            });
        }
    }

    sharePage(goods, title) {
        this.props.shareEvent && this.props.shareEvent(goods, '', title || goods.title);
    }
    //#endregion
}

const goodOtherStyles = StyleSheet.create({
    goodsBox2: {
        width: deviceWidth,
        //height: px(525),
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    goodBg: {
        width: deviceWidth,
        height: px(358),
        overflow: 'hidden',
        borderRadius: px(12),
    },
    bGood: {
        width: px(710),
        overflow: 'hidden',
        borderRadius: px(12),
        //backgroundColor: '#ff0',
        height: px(338),
        marginHorizontal: px(20)
    },
    goodsCoverBig: {
        width: px(710),
        height: px(240),
        //borderTopLeftRadius: px(12),
        //overflow: 'hidden',
        //borderRadius: px(12)
    },
    goods_img_coverBig: {
        position: 'absolute',
        left: px(275),
        top: px(40),
        zIndex: 1,
        width: px(160),
        height: px(160),
        borderRadius: px(80),
        overflow: 'hidden',
        // backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    goods_img_txt: {
        fontSize: px(36),
        color: '#fff'
    },
    bottom: {
        paddingRight: px(4),
        marginTop: px(15), //设计稿18兼容字体本身高度
        flexDirection: 'row',
        //backgroundColor:'#ff0',
        alignItems: 'center',
        width: px(710)
    },
    bond: {
        width: px(44),
        height: px(24),
        marginRight: px(10)
    },
    goodsShowDesc: {
        fontSize: px(26),
        color: '#000',
        flex: 1,
        //backgroundColor: '#ff0',
        includeFontPadding: false,
    },
    salePrice: {
        fontSize: px(24),
        color: "#000",
        includeFontPadding: false,
    },
    salePrice_: {
        fontSize: px(30),
        includeFontPadding: false,
    },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(24),
        includeFontPadding: false,
    },
    cartC: {
        width: px(86),
        height: px(52),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cartShare: {
        width: px(42),
        height: px(42)
    },
    timeBox: {
        width: px(750),
        paddingHorizontal: px(20),
        height: px(70)
    },
    timeTitle: {
        width: px(4),
        height: px(20),
        marginRight: px(10)
    },
    timeTxt: {
        fontSize: px(26),
        color: '#252426'
    }
});

const goodModuleStyles = StyleSheet.create({
    module: {
        width: deviceWidth,
        backgroundColor: '#fff',
        height: px(612),
    },
    moduleImage: {
        width: px(702),
        height: px(328),
        marginLeft: px(24),
        overflow: 'hidden'
    },
    jiao: {
        position: "absolute",
        bottom: 0,
    },
    price: {
        width: px(200),
        paddingVertical: 1
        //marginTop: px(16)
    },
    priceTxt: {
        color: '#d2d2d2',
        fontSize: px(24),
        marginHorizontal: px(10)
    },
    line: {
        backgroundColor: "#efefef",
        height: px1,
        width: px(702),
        marginLeft: px(24),
    }

})

const goodStyle = StyleSheet.create({
    box: {
        width: deviceWidth,
        height: px(258),
        flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    img_box: {
        width: px(200),
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
        width: px(200),
        height: px(200),
    },
    goods_img_coverBig: {
        position: 'absolute',
        left: px(20),
        top: px(20),
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
        height: px(170),
        // backgroundColor: "#ccc"
    },
    tit: {
        fontSize: px(26),
        color: "#000",
        marginBottom: px(10)
    },
    desc: {
        fontSize: px(22),
        color: "#666",
        marginBottom: px(6)
    },
    salePrice: {
        fontSize: px(16),
        color: "#000",
        includeFontPadding: false,
    },
    salePrice_: {
        fontSize: px(28),
        includeFontPadding: false,
    },
    benefitMoney: {
        color: '#d0648f',
        fontSize: px(22),
        includeFontPadding: false,
    },
    money: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottom: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    line: {
        height: px1,
        backgroundColor: "#efefef"
    }
})

