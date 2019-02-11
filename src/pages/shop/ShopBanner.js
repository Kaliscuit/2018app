'use strict';

import React from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { TrackClick } from '../../services/Track';
import Swiper from '../../UI/Swiper';
import { deviceWidth, isIphoneX, px } from "../../utils/Ratio";

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
        }
    }
    renderRow = (item) => {
        if (item === undefined) return null
        return <Image resizeMode="cover" resizeMethod="scale"
            source={{ uri: item.showImg }}
            style={{ width: deviceWidth, height: px(400) }} />
    }
    renderSwipe() {
        if (this.state.list.length === 1) {
            return <TouchableWithoutFeedback
                onPress={() => this.onPressRow(this.state.list[0], 0)}>
                <Image style={{
                    position: "absolute", bottom: 0,
                    width: deviceWidth, height: px(400)
                }} source={{ uri: this.state.list[0].showImg }} resizeMode="contain" resizeMethod="scale" />
            </TouchableWithoutFeedback>
        }
        if (this.state.list.length > 1) {
            return <Swiper tp={this.props.id == "dev"}
                style={{ position: "absolute", bottom: 0 }}
                dataSource={this.state.list}
                width={deviceWidth}
                height={px(400)}
                loop={true}
                renderRow={this.renderRow}
                onPress={(item, index) => this.onPressRow(this.state.list[index], index)} />
        }
    }
    render() {
        if (this.state.list.length === 0 && this.state.quick.length === 0) return <View></View>;
        return <View>
            <View style={{ width: deviceWidth, height: px(400) }}>
                {this.renderSwipe()}
            </View>
            {this.state.quick.length > 0 && <View style={bannerStyle.box}>
                <View style={bannerStyle.container}>
                    {this.state.quick.map((item, index) => <TouchableWithoutFeedback
                        key={item.quickEntranceId} onPress={() => this.goPage(item, index)}>
                        <View style={bannerStyle.imgbox}>
                            <Image resizeMode="contain" resizeMethod="scale"
                                source={{ uri: item.showImg }}
                                style={bannerStyle.img} />
                            <Text style={[bannerStyle.txt, { color: item.titleColor }]}>{item.title}</Text>
                        </View>
                    </TouchableWithoutFeedback>)}
                </View>
            </View>}
        </View>
    }
    shouldUpdate = true;
    shouldComponentUpdate(e) {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
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
    // componentWillUpdate() {
    //     console.log(1)
    // }
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

    }
})
