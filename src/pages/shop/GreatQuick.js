'use strict';

import React from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View, Animated, TouchableOpacity } from 'react-native';
import { TrackClick } from '../../services/Track';
import GreatSwiper from '../../UI/GreatSwiper';
import { deviceWidth, isIphoneX, px, deviceHeightHalf, deviceHeight } from "../../utils/Ratio";
import base from "../../styles/Base"
import Icon from "../../UI/lib/Icon"
import Img from "../../UI/lib/Img"
import { log } from '../../utils/logs';

const LeaveHeight = deviceHeightHalf - 100;

class QuickItem extends React.Component {

    static defaultProps = {
        item: { niceGoodsQuickEntranceDtoList: [] },
    }

    render() {
        const { item } = this.props;
        return <View style={GreatStyle.box} onLayout={e => this.onLayout(e)}>
            <TouchableOpacity activeOpacity={0.9} onPress={e => this.goPage(item)}>
                <Image source={{ uri: item.showImg }} style={GreatStyle.topImg} />
            </TouchableOpacity>
            <Animated.View style={[GreatStyle.list, { height: item.hei }]}>
                <View style={GreatStyle.listContainer}>
                    {item.niceGoodsQuickEntranceDtoList.map((goods, index) => <View key={index} style={GreatStyle.listBox}>
                        <TouchableOpacity activeOpacity={0.9} onPress={e => this.goDetail(goods)}>
                            <Img style={GreatStyle.img} width={157} height={157} src={goods.original_img} />
                            <Text numberOfLines={1} style={GreatStyle.sortTitle}>{goods.oneWordSellPoint}</Text>
                            <Text numberOfLines={1} style={GreatStyle.nameTitle}>{goods.goodsName}</Text>
                            <Text numberOfLines={1} style={GreatStyle.price}>￥{goods.salePrice}</Text>
                        </TouchableOpacity>
                    </View>)}
                </View>
            </Animated.View>
        </View>
    }
    onLayout(e) {
        this.props.onLayout && this.props.onLayout(e.nativeEvent);
    }

    goDetail(item) {
        this.props.navigation.navigate('DetailPage', {
            sku: item.sku
        });
    }
    goPage(item) {
        if (item.contextType == "sku") {
            this.props.navigation.navigate('DetailPage', {
                sku: item.context
            });
        }
        if (item.contextType == "url") {
            this.props.navigation.navigate('LookImagePage', {
                'title': "",
                'img': item.showImg,
                'shareImg': item.showImg
            });
        }
        if (item.contextType == "h5") {
            if (item.context.indexOf("/active/") > 0) {
                this.props.navigation.navigate('BrowerPage', {
                    webPath: item.context,
                    img: item.showImg
                });
            } else {
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: item.context,
                    img: item.showImg
                });
            }
        }
        if (item.contextType == "category") { //需要确定后台传的是id还是name
            this.props.onChangeF(item.context)
        }
    }
}
export default class extends React.Component {

    static defaultProps = {
        item: {}
    }
    constructor(props) {
        super(props);
        this.state = {
            list: props.item.quickList
        }
        this.state.list.map((item, index) => {
            if (!item.niceGoodsQuickEntranceDtoList) item.niceGoodsQuickEntranceDtoList = [];
            item.count = px(item.niceGoodsQuickEntranceDtoList.length / 2 * 490 + 26);
            item.hei = new Animated.Value(item.count);
            return item;
        });
    }
    render() {
        const { list } = this.state;
        return <View onLayout={e => this.onLayout(e)}>
            {list.map((item, index) => <QuickItem key={index}
                onLayout={e => this.setLayout(e, index)}
                navigation={this.props.navigation}
                item={item} open={item.open} />)}
        </View>
    }
    onLayout(e) {
        this.props.onLayout && this.props.onLayout(e.nativeEvent);
    }
    layout = []
    setLayout(e, i) {
        this.layout[i] = e.layout.height;
    }
    /**
     * 外部滚动的时候传入当前组件的scrollTop
     * @param {*} y 
     */
    // onScroll(y) {
    // let hei_count = 0;
    // let curr_hei = y + LeaveHeight;
    // if (curr_hei < 0) {
    //     return this.move(-1);
    // }
    // for (let index = 0; index < this.layout.length; index++) {
    //     const item = this.layout[index];
    //     if (curr_hei > hei_count && curr_hei < hei_count + item) {
    //         this.move(index);
    //         break;
    //     }
    //     hei_count += item;
    // }
    // }
    /**
     * 一起移动
     * @param {*} index 
     */
    move(index) {
        let list = [];
        let need_run = false;
        this.state.list.forEach((item, i) => {
            if (i > index && item.hei._value != 0) need_run = true;
            if (i <= index && item.hei._value != item.count) need_run = true;

            list.push(Animated.timing(item.hei, {
                toValue: i <= index ? item.count : 0,
                duration: 400,
            }));
        });
        if (need_run) {
            Animated.parallel(list).start();
            this.props.stopScroll();
        }
    }
}
const GreatStyle = StyleSheet.create({
    box: {
        paddingHorizontal: px(20),
        backgroundColor: "#fff",
    },
    topImg: {
        width: px(710),
        height: px(288),
    },
    list: {
        paddingHorizontal: px(16),
        backgroundColor: "#efefef",
        overflow: "hidden"
    },
    listContainer: {
        paddingTop: px(16),
        paddingBottom: px(0),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: "wrap",
    },
    listBox: {
        backgroundColor: "#fff",
        width: px(334),
        marginBottom: px(10),
        alignItems: 'center',
        height: px(480)
    },
    img: {
        width: px(334),
        height: px(334),
    },
    sortTitle: {
        fontSize: px(20),
        color: "#666",
        marginTop: px(20),
        marginBottom: px(8),
        textAlign: "center"
    },
    nameTitle: {
        fontSize: px(24),
        color: "#000",
        marginHorizontal: px(16),
        marginBottom: px(16),
        textAlign: "center"
    },
    price: {
        fontSize: px(28),
        color: "#000",
        marginBottom: px(20),
        textAlign: "center"
    }
})