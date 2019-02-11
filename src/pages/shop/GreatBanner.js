'use strict';

import React from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View, Animated } from 'react-native';
import { TrackClick } from '../../services/Track';
import GreatSwiper from '../../UI/GreatSwiper';
import { deviceWidth, isIphoneX, px } from "../../utils/Ratio";
import base from "../../styles/Base"
import Icon from "../../UI/lib/Icon"

/**
 * 列表项高度460+底间距24+列表底部距离4+顶部距离20=484*x+24
 */
class GreatList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hei: 0
        }
        this.hei = px(props.item.niceGoodsQuickEntranceDtoList.length / 2 * 484 + 34);
        this.state.hei = new Animated.Value(this.hei);
    }
    static defaultProps = {
        reRender: function () { },
        item: { niceGoodsQuickEntranceDtoList: [] },
    }

    render() {
        const { item } = this.props;
        return <View style={GreatStyle.box}>
            <Image source={{ uri: item.showImg }} style={GreatStyle.topImg} />
            <Animated.View style={[GreatStyle.list, { height: this.state.hei }]}>
                {item.niceGoodsQuickEntranceDtoList.map((goods, index) => <View key={index} style={GreatStyle.listBox}>
                    <Image
                        source={{ uri: goods.original_img }}
                        style={GreatStyle.img}
                    />
                    <Text numberOfLines={1} style={GreatStyle.sortTitle}>{goods.oneWordSellPoint}</Text>
                    <Text numberOfLines={1} style={GreatStyle.nameTitle}>{goods.goodsName}</Text>
                    <Text numberOfLines={1} style={GreatStyle.price}>￥{goods.salePrice}</Text>
                </View>)}
            </Animated.View>
        </View>
    }

    componentDidMount() {

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
        paddingHorizontal: px(28),
        paddingTop: px(20),
        paddingBottom: px(4),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: "wrap",
        backgroundColor: "#efefef"

    },
    listBox: {
        backgroundColor: "#fff",
        width: px(314),
        marginBottom: px(24),
        alignItems: 'center',
        height: px(460)
    },
    img: {
        width: px(314),
        height: px(314),
    },
    sortTitle: {
        fontSize: px(20),
        color: "#666",
        marginTop: px(20),
        marginBottom: px(8)
    },
    nameTitle: {
        fontSize: px(24),
        color: "#000",
        marginHorizontal: px(16),
        marginBottom: px(16)
    },
    price: {
        fontSize: px(28),
        color: "#000",
        marginBottom: px(20),
    }
})
/**
 * 首页顶部banner
 */
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: this.props.item.bannerList || [],
            quick: this.props.item.quickList || [],
            status: false,
            scaleList: []
        }
        this.state.list.forEach((item, index) => {
            this.state.scaleList.push(new Animated.ValueXY({
                x: index === 0 ? px(680) : px(648),
                y: index === 0 ? px(1068) : px(948),
            }));
        })
    }
    renderRow = (item, index, curr) => {
        if (item === undefined) return null
        return <View style={{ width: px(680), height: px(1068), alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
            <Animated.Image resizeMode="cover" resizeMethod="scale"
                source={{ uri: item.showImg }}
                style={{ width: this.state.scaleList[index].x, height: this.state.scaleList[index].y }} />
        </View>
    }
    renderSwipe() {
        if (this.state.list.length === 1) {
            return <TouchableWithoutFeedback
                onPress={() => this.onPressRow(this.state.list[0], 0)}>
                <Image style={[bannerStyle.bannerBox, { marginHorizontal: px(35) }]}
                    source={{ uri: this.state.list[0].showImg }} resizeMode="cover" resizeMethod="scale" />
            </TouchableWithoutFeedback>
        }
        if (this.state.list.length > 1) {
            return <GreatSwiper tp={this.props.id == "dev"}
                style={{ width: deviceWidth }}
                dataSource={this.state.list}
                width={px(680)}
                height={px(1068)}
                loop={true}
                renderRow={this.renderRow}
                onWillChange={(a, index) => this.scaleImage(a, index)}
                onDidChange={(a, index) => this.scaleImage(a, index)}
                onPress={this.onPressRow.bind(this)} />
        }
    }
    render() {
        if (this.state.list.length === 0) return <View onLayout={e => this.onLayout(e)}></View>;
        return <View onLayout={e => this.onLayout(e)}>
            <View style={[bannerStyle.bannerBox, bannerStyle.bannerList]}>
                {this.renderSwipe()}
            </View>
            <View style={[base.inline, bannerStyle.title]}>
                <Icon name="great_title" style={{ width: px(486), height: px(18) }} />
            </View>
        </View>
    }
    onLayout(e) {
        this.props.onLayout && this.props.onLayout(e.nativeEvent);
    }
    shouldUpdate = true;
    shouldComponentUpdate(e) {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    reRender() {
        this.shouldUpdate = true;
    }

    scaleImage(a, index) {
        this.state.scaleList.forEach((item, i) => {
            item.stopAnimation();
            if (index === i) {
                Animated.timing(item, {
                    toValue: { x: px(680), y: px(1068) },
                    duration: 300
                }).start();
            } else {
                Animated.timing(item, {
                    toValue: { x: px(648), y: px(948) },
                    duration: 300
                }).start()
            }
        })
    }
    //#region
    onPressRow(e, i) {
        this.trackBannerHandle(e.title, i);
        this.getDetail(e.contextType, e.context, e.title, e.showImg)
    }
    trackBannerHandle(title, i) {
        let name = '', index = i + 1, from = '', location = '', channel = this.props.tabName;
        if (!this.props.tab) {
            name = `HomepageRotation-${index}`;
            from = '首页';
            location = 'Homepage';
        } else {
            name = `ChannelpageRotation-${index}`;
            from = '频道页';
            location = 'Channelpage';
        }
        TrackClick(location, name, from, `${channel}-${title}`)
    }
    goPage(item, i) {
        this.trackGoPage(item, i);
        if (item.contextType == "sku") {
            this.props.navigation.navigate('DetailPage', {
                id: item.prodId,
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
    trackGoPage(item, i) {
        let index = i + 1;
        if (item.contextType == "sku") {
            TrackClick('Homepage', `HomepageIcon-${index}`, '首页', item.title)
        }

        if (item.contextType == "h5") {
            TrackClick('Homepage', `HomepageIcon-${index}`, '首页', item.title)
        }
    }
    getDetail(type, context, img, title, shareImg) {
        type == 1 && this.props.navigation.navigate('DetailPage', {
            sku: context
        });
        if (type == 2) {
            this.props.navigation.navigate('LookImagePage', {
                'title': title,
                'img': context,
                'shareImg': shareImg
            });
        }
        if (type == 3) {
            this.props.navigation.navigate('HtmlViewPage', {
                webPath: context,
                img: shareImg
            });
        }
    }
    componentWillReceiveProps(pp) {
        if (pp.item.tt !== this.props.item.tt) {
            this.setState({
                list: pp.item.bannerList,
                quick: pp.item.quickList,
            })
            this.shouldUpdate = true;
            // this.shouldComponentUpdate = true;
        }
    }
    //#endregion

}

const bannerStyle = StyleSheet.create({
    box: {
        width: deviceWidth,
        height: px(168),
        marginTop: px(-12),
        marginBottom: px(20)
    },
    container: {
        height: px(168),
        width: deviceWidth,
        paddingHorizontal: px(30),
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        // borderRadius: px(10),
        overflow: 'hidden'
    },
    imgbox: {
        alignItems: 'center',
        //width: px(164),
        flex: 1
    },
    img: {
        width: px(160),
        height: px(112)
    },
    txt: {
        marginTop: px(14),
        fontSize: px(22),
        color: "#252426"
    },
    bottom: {
        width: deviceWidth,
        height: px(60),
        position: "absolute",
        bottom: 0,
        left: 0,

    },
    bannerList: {
        width: deviceWidth
    },
    bannerBox: {
        width: px(680), height: px(1068),
        backgroundColor: "#fff"
    },
    title: {
        backgroundColor: "#fff",
        paddingTop: px(60),
        paddingBottom: px(50)
    },
})
