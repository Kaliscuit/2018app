'use strict';

import React from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View, Platform, ImageBackground } from 'react-native';
import { TrackClick } from '../../services/Track';
import Swiper from '../../UI/Swiper';
import { deviceWidth, isIphoneX, px } from "../../utils/Ratio";
import Event from '../../services/Event'

let BannerHeight = Platform.OS === "ios" ? isIphoneX() ? px(340) + 128 : px(536) + 10 : px(500) + 10
/**
 * 首页顶部banner
 */
export default class extends React.Component {

    static defaultProps = {
        item: {
            bannerList: [],
            quickList: []
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            list: props.item.bannerList,
            quick: props.item.quickList,
            status: false,
        }
    }
    renderRow = (obj, index) => {
        let item = this.props.item.bannerList[index];
        if (item === undefined) return null
        return <View style={bannerStyle.bannerBox}>
            <Image resizeMode="cover" resizeMethod="scale"
                source={{ uri: item.showImg }}
                style={{ width: deviceWidth, height: item.bannerHeight ? px(item.bannerHeight) : px(330) }} />
        </View>
    }
    renderSwipe() {
        if (this.state.list.length === 1) {
            return <TouchableWithoutFeedback
                onPress={() => this.onPressRow(this.state.list[0], 0)}>
                <Image style={{
                    width: deviceWidth, height: this.state.list[0].bannerHeight ? px(this.state.list[0].bannerHeight) : px(330)
                }} source={{ uri: this.state.list[0].showImg }} resizeMode="contain" resizeMethod="scale" />
            </TouchableWithoutFeedback>
        }
        if (this.state.list.length > 1) {
            return <Swiper tp={true}
                onDidChange={(a, b) => this.changeColor(b)}
                dataSource={this.state.list}
                width={deviceWidth}
                height={BannerHeight}
                loop={true}
                renderRow={this.renderRow}
                onPress={(item, index) => this.onPressRow(this.state.list[index], index)} />
        }
    }
    changeColor(a) {
        if (!this.props.item.bannerList[a]) return;
        Event.emit("change_color", this.props.item.bannerList[a].fullScreenYn)
    }
    render() {
        if (this.state.list.length === 0 && this.state.quick.length === 0) return null;
        return <View onLayout={e => this.setLayout(e)} style={{ backgroundColor: "#fff" }}>
            <View style={bannerStyle.banner}>
                {this.renderSwipe()}
            </View>
            {this.state.quick.length > 0 && <View style={[bannerStyle.box]}>
                {this.props.item.quickListFullScreenImg === null && <View style={bannerStyle.container}>
                    {this.props.item.quickList.map((item, index) => <TouchableWithoutFeedback
                        key={item.quickEntranceId} onPress={() => this.goPage(item, index)}>
                        <View style={bannerStyle.imgbox}>
                            <Image resizeMode="contain" resizeMethod="scale"
                                source={{ uri: item.showImg }}
                                style={bannerStyle.img} />
                            <Text style={[bannerStyle.txt, { color: item.titleColor }]}>{item.title}</Text>
                        </View>
                    </TouchableWithoutFeedback>)}
                </View>}
                {this.props.item.quickListFullScreenImg !== null && <ImageBackground source={{ uri: this.props.item.quickListFullScreenImg }} style={bannerStyle.container}>
                    {this.props.item.quickList.map((item, index) => <TouchableWithoutFeedback
                        key={item.quickEntranceId} onPress={() => this.goPage(item, index)}>
                        <View style={bannerStyle.imgbox}>
                            <Image resizeMode="contain" resizeMethod="scale"
                                source={{ uri: item.showImg }}
                                style={bannerStyle.img} />
                            <Text style={[bannerStyle.txt, { color: item.titleColor }]}>{item.title}</Text>
                        </View>
                    </TouchableWithoutFeedback>)}
                </ImageBackground>}

            </View>}
        </View>
    }
    shouldUpdate = true;
    shouldComponentUpdate(e) {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    setLayout(e) {
        this.props.onLayout && this.props.onLayout(e);
    }
    componentDidMount() {
        if (this.props.item.bannerList.length > 0) this.changeColor(0)
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
            if (context.indexOf("/active/") > 0) {
                this.props.navigation.navigate('BrowerPage', {
                    webPath: context,
                    img: shareImg
                });
            } else {
                this.props.navigation.navigate('HtmlViewPage', {
                    webPath: context,
                    img: shareImg
                });
            }
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
        height: px(170),
    },
    banner: {
        width: deviceWidth,
        height: BannerHeight,
        justifyContent: 'flex-end',
    },
    bannerBox: {
        width: deviceWidth,
        height: BannerHeight,
        justifyContent: 'flex-end',
    },
    container: {
        height: px(170),
        width: deviceWidth,
        paddingHorizontal: px(30),
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
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

    }
})
