'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ImageBackground
} from 'react-native';

import { px, deviceWidth } from "../../utils/Ratio"
import { get } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import util_cools from '../../utils/tools';
import { log } from '../../utils/logs';

let Modules = {
    get(id, props) {
        if (!Modules["id_" + id]) return;
        return Modules["id_" + id](props);
    }
};

/**
 * 模版实现
 */
Modules.id_1 = Modules.id_2 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={[floorStyles.module, {
        justifyContent: 'space-between',
        width: px(710),
        marginLeft: px(20),
        paddingBottom: p_index == 0 && isMargin ? px(0) : px(16),
    }]}>
        {
            i.moduleTemplateImages.map((k, k_index) =>
                <TouchableWithoutFeedback
                    key={k.imgId}
                    onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                    <View style={floorStyles.moduleImage_}>
                        <Image resizeMode="cover" resizeMethod="scale"
                            style={[{
                                height: i.tplId == 13 ? px(220) : i.tplId == 11 ? px(450) : px(240),
                                width: i.tplId == 2 ? px(347) : i.tplId == 12 ? px(226) : px(710)
                            }]}
                            source={{ uri: k.imageUrl }}
                        />
                    </View>
                </TouchableWithoutFeedback>
            )
        }
    </View>
}
/**
 * 模板3，4
 */
Modules.id_3 = Modules.id_4 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={[floorStyles.module, { justifyContent: 'space-between', width: px(710) }]}>
        {
            i.moduleTemplateImages.map((k, k_index) =>
                <TouchableWithoutFeedback
                    key={k.imgId}
                    onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                    <View style={floorStyles.moduleImage_}>
                        <Image resizeMode="cover" resizeMethod="scale"
                            style={[{
                                width: k_index == 0 ? i.tplId == 4 ? px(468) : px(226) : i.tplId == 4 ? px(226) : px(468),
                                height: px(240)
                            }]}
                            source={{ uri: k.imageUrl }}
                        />
                    </View>
                </TouchableWithoutFeedback>
            )
        }
    </View>
}
/**
 * 模板6
 */
Modules.id_6 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={[floorStyles.module]}>
        <View style={{ marginRight: px(16) }}>
            <TouchableWithoutFeedback
                onPress={() => props.goOtherPage(i.moduleTemplateImages[0], 0, i.tplId, p_index)}>
                <View style={[floorStyles.moduleImage_, { width: px(258), height: px(476) }]}>
                    <Image resizeMode="cover" resizeMethod="scale"
                        style={[{ width: px(258), height: px(476) }]}
                        source={{ uri: i.moduleTemplateImages[0].imageUrl }}
                    />
                </View>
            </TouchableWithoutFeedback>
        </View>
        <View style={{ width: px(436), flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', width: px(436) }}>
                {
                    i.moduleTemplateImages.map((k, k_index) => {
                        return k_index > 0 && k_index < 3 ? <TouchableWithoutFeedback
                            key={k.imgId}
                            onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                            <View style={[floorStyles.moduleImage_, {
                                width: px(210),
                                height: px(230),
                                marginRight: k_index == 1 ? px(16) : px(0),
                                marginBottom: px(16)
                            }]}>
                                <Image resizeMode="cover" resizeMethod="scale"
                                    style={[{ width: px(210), height: px(230) }]}
                                    source={{ uri: k.imageUrl }}
                                />
                            </View>
                        </TouchableWithoutFeedback> : null
                    })
                }
            </View>
            <View style={{ flexDirection: 'row', width: px(436) }}>
                {
                    i.moduleTemplateImages.map((k, k_index) => {
                        return k_index > 2 && k_index < 5 ? <TouchableWithoutFeedback
                            key={k.imgId}
                            onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                            <View style={[floorStyles.moduleImage_, {
                                width: px(210),
                                height: px(230),
                                marginRight: k_index == 3 ? px(16) : px(0)
                            }]}>
                                <Image resizeMode="cover" resizeMethod="scale"
                                    style={[{ width: px(210), height: px(230) }]}
                                    source={{ uri: k.imageUrl }}
                                />
                            </View>
                        </TouchableWithoutFeedback> : null
                    })
                }
            </View>
        </View>
    </View>
}
Modules.id_8 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View
        style={[floorStyles.module]}>
        <View style={{ marginRight: px(16) }}>
            <TouchableWithoutFeedback
                onPress={() => props.goOtherPage(i.moduleTemplateImages[0], 0, i.tplId, p_index)}>
                <View style={[floorStyles.moduleImage_, { width: px(347), height: px(496) }]}>
                    <Image resizeMode="cover" resizeMethod="scale"
                        style={[{ width: px(347), height: px(496) }]}
                        source={{ uri: i.moduleTemplateImages[0].imageUrl }}
                    >
                    </Image>
                </View>
            </TouchableWithoutFeedback>
        </View>
        <View style={{ flexDirection: 'row', width: px(347), flexWrap: 'wrap' }}>
            {
                i.moduleTemplateImages.map((k, k_index) => {
                    return k_index > 0 ? <TouchableWithoutFeedback
                        key={k.imgId}
                        onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                        <View style={[floorStyles.moduleImage_, {
                            width: px(347),
                            height: px(240),
                            marginBottom: k_index == 1 ? px(16) : px(0)
                        }]}>
                            <Image resizeMode="cover" resizeMethod="scale"
                                style={[{ width: px(347), height: px(240) }]}
                                source={{ uri: k.imageUrl }}
                            />
                        </View>
                    </TouchableWithoutFeedback> : null
                })
            }

        </View>
    </View>
}
Modules.id_9 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={[floorStyles.module, {
        justifyContent: 'space-between',
        width: px(710),
        marginLeft: px(20)
    }]}>
        <View style={{ justifyContent: 'space-between' }}>
            {
                i.moduleTemplateImages.map((k, k_index) => {
                    return k_index < 2 ? <TouchableWithoutFeedback
                        key={k.imgId}
                        onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                        <View style={[floorStyles.moduleImage_, {
                            width: px(347),
                            height: px(240),
                            marginBottom: k_index == 0 ? px(16) : px(0)
                        }]}>
                            <Image resizeMode="cover" resizeMethod="scale"
                                style={[{ width: px(347), height: px(240) }]}
                                source={{ uri: k.imageUrl }}
                            />
                        </View>
                    </TouchableWithoutFeedback> : null
                })
            }
        </View>
        <TouchableWithoutFeedback
            onPress={() => props.goOtherPage(i.moduleTemplateImages[2], 2, i.tplId, p_index)}>
            <View style={floorStyles.moduleImage_}>
                <Image resizeMode="cover" resizeMethod="scale"
                    style={[{ height: px(496), width: px(347) }]}
                    source={{ uri: i.moduleTemplateImages[2].imageUrl }}
                />
            </View>
        </TouchableWithoutFeedback>
    </View>
}
Modules.id_10 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={[floorStyles.module]}>
        {i.moduleTemplateImages.map((k, k_index) =>
            <TouchableWithoutFeedback
                key={k.imgId}
                onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                <Image resizeMode="cover" resizeMethod="scale"
                    style={[{
                        height: px(300),
                        width: px(750)
                    }]}
                    source={{ uri: k.imageUrl }}
                />
            </TouchableWithoutFeedback>
        )}
    </View>
}
/**
 * 11,12,13
 */
Modules.id_11 = Modules.id_12 = Modules.id_13 = Modules.id_1;
/**
 * 14,15
 */
Modules.id_14 = Modules.id_15 = function (props) {
    const { i, p_index, isMargin } = props;

    let wid = Dimensions.get('window').width >= 414 ? px(200) : px(220);
    return <View style={[floorStyles.module]}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            style={{ paddingLeft: px(20) }} >
            {
                i.moduleTemplateImages.map((k, k_index) =>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        key={k.imgId}
                        onPress={() => props.goOtherPage(k, k_index, i.tplId, p_index)}>
                        <View style={[floorStyles.moduleImage_, {
                            width: wid,
                            height: i.tplId == 14 ? px(280) : 'auto',
                            marginRight: px(16)
                        }]}>
                            <Image resizeMode="cover" resizeMethod="scale"
                                style={[{ width: 110, height: i.tplId == 14 ? px(280) : 110 }]}
                                source={{ uri: k.imageUrl }}
                            >
                            </Image>
                        </View>
                        {i.tplId == 15 && k.urlType == 'sku' &&
                            <View style={{ width: 110, alignItems: 'center' }}>
                                <Text style={floorStyles.moduleGoodName} allowFontScaling={false}>{k.title}</Text>
                                <View style={floorStyles.modulePrice}><Text style={floorStyles.moduleGoodPrice}
                                    allowFontScaling={false}>￥{util_cools.parsePrice(k.salePrice)}</Text>
                                    <Text style={floorStyles.moduleGoodMarket} allowFontScaling={false}>￥{util_cools.parsePrice(k.marketPrice)}</Text></View>
                            </View>
                        }
                    </TouchableOpacity>
                )
            }
        </ScrollView>
    </View>
}
/**
 * 霸屏4连
 */
Modules.id_16 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={ModuleStyle.box2}>
        {i.moduleTemplateImages.map((item, index) => <TouchableOpacity activeOpacity={.9} key={index} onPress={() => props.goOtherPage(item, index, i.tplId, p_index)}>
            <Image style={{ width: px(item.width), height: px(item.height) }}
                source={{ uri: item.imageUrl }} />
        </TouchableOpacity>)}
    </View>
}
Modules.id_19 = Modules.id_18 = Modules.id_17 = Modules.id_16;
/**
 * 21，新的1拖2
 */
Modules.id_20 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={ModuleStyle.box1}>
        <TouchableOpacity activeOpacity={.9} onPress={() => props.goOtherPage(i.moduleTemplateImages[0], 0, i.tplId, p_index)}>
            <Image style={ModuleStyle.img_20_1} source={{ uri: i.moduleTemplateImages[0].imageUrl }} />
        </TouchableOpacity>
        <View style={ModuleStyle.b_21_2}>
            <TouchableOpacity activeOpacity={.9} onPress={() => props.goOtherPage(i.moduleTemplateImages[1], 1, i.tplId, p_index)}>
                <Image style={ModuleStyle.img_20_2} source={{ uri: i.moduleTemplateImages[1].imageUrl }} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={.9} onPress={() => props.goOtherPage(i.moduleTemplateImages[2], 2, i.tplId, p_index)}>
                <Image style={ModuleStyle.img_20_3} source={{ uri: i.moduleTemplateImages[2].imageUrl }} />
            </TouchableOpacity>
        </View>
    </View>
}
/**
 * 702*240的一张图，高度可调
 */
Modules.id_21 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={ModuleStyle.box1}>
        <TouchableOpacity activeOpacity={.9} onPress={() => props.goOtherPage(i.moduleTemplateImages[0], 0, i.tplId, p_index)}>
            <Image style={ModuleStyle.img_21_1} source={{ uri: i.moduleTemplateImages[0].imageUrl }} />
        </TouchableOpacity>
    </View>
}
/**
 * 346*240的两张并列
 */
Modules.id_22 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={ModuleStyle.box1}>
        {i.moduleTemplateImages.map((item, index) => <TouchableOpacity activeOpacity={.9} key={index} onPress={() => props.goOtherPage(item, index, i.tplId, p_index)}>
            <Image style={[ModuleStyle.img_22_1, { marginRight: index === 0 ? px(10) : 0 }]} source={{ uri: item.imageUrl }} />
        </TouchableOpacity>)}
    </View>
}
/**
 * 227*240的三列
 */
Modules.id_23 = function (props) {
    const { i, p_index, isMargin } = props;
    return <View style={ModuleStyle.box1}>
        {i.moduleTemplateImages.map((item, index) => <TouchableOpacity key={index} onPress={() => props.goOtherPage(item, index, i.tplId, p_index)}>
            <Image style={[ModuleStyle.img_23_1, { marginRight: index === i.moduleTemplateImages.length - 1 ? 0 : px(10) }]} source={{ uri: item.imageUrl }} />
        </TouchableOpacity>)}
    </View>
}

exports.Modules = Modules;
const ModuleStyle = StyleSheet.create({
    box1: {
        paddingBottom: 5,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor:"#bb0000"
    },
    box2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    img_16: {
        width: px(382),
        height: px(290),
    },
    img_20_1: {
        width: px(382),
        height: px(290),
        marginRight: 5
    },
    img_20_2: {
        width: px(310),
        height: px(140),
    },
    img_20_3: {
        marginTop: px(10),
        width: px(310),
        height: px(140),
    },
    img_21_1: {
        width: px(702),
        height: px(240),
    },
    img_22_1: {
        width: px(346),
        height: px(240),
    },
    img_23_1: {
        width: px(227),
        height: px(240),
    },
});

/**
 * 模版项
 */
exports.Module = class extends React.Component {
    renderTitle(item, index) {
        if (item.isApplName == 0 && item.titleImg) {
            return <View style={[floorStyles.floorTitle, { paddingBottom: px(0) }]}>
                <Image source={{ uri: item.titleImg }}
                    style={{ width: px(item.titleImgWidth), height: px(item.titleImgHeight) }} />
            </View>
        }
        if (item.isApplName == 1) {
            return <View style={[floorStyles.floorTitle, { paddingBottom: px(24) }]}>
                <Text allowFontScaling={false} style={floorStyles.floorTitleTxt}>{item.moduleName}</Text>
            </View>
        }
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23].indexOf(item.moduleTemplates[0].tplId * 1) >= 0) {
            return <View style={{ height: index === 0 ? px(10) : px(24) }}></View>
        }
        return null;
    }
    render() {
        const { item, index } = this.props;

        if (!item) return null;
        let top = index == 0 && item.tplId == 13 ? 0 : 12;
        return <View onLayout={e => this.setLayout(e.nativeEvent)}>
            {item.hasBackgroundImg && <ImageBackground resizeMode="cover" source={{ uri: item.backgroundImg }} style={[floorStyles.floor, {
                marginBottom: 12,
                paddingBottom: 12,
                width: px(item.backgroundImgWidth),
                height: px(item.backgroundImgHeight),
            }]}>
                {this.renderTitle(item, index)}
                <View>
                    {item.moduleTemplates && item.moduleTemplates.map((i, _index) => <View key={_index}>
                        {Modules.get(i.tplId, {
                            i,
                            p_index: index,
                            goOtherPage: this.props.goOtherPage,
                            isMargin: false,
                            isApplName: item.isApplName
                        })}
                    </View>)}
                </View>
            </ImageBackground>}
            {!item.hasBackgroundImg && <View style={[floorStyles.floor, {
                marginBottom: top,
                paddingBottom: 7,
                justifyContent: "center",
            }]}>
                {this.renderTitle(item, index)}
                <View>
                    {item.moduleTemplates && item.moduleTemplates.map((i, _index) => <View key={_index}>
                        {Modules.get(i.tplId, {
                            i,
                            p_index: index,
                            goOtherPage: this.props.goOtherPage,
                            isMargin: false,
                            isApplName: item.isApplName
                        })}
                    </View>)}
                </View>
            </View>}
        </View>
    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }
    setLayout(e) {
        this.props.onLayout && this.props.onLayout(e);
    }
    // componentWillUpdate(){
    //     console.log("楼层")
    // }
    // componentWillReceiveProps(pp) {
    //     if (pp.show === true && pp.show != this.props.show) this.shouldUpdate = true;
    // }
}

const floorStyles = StyleSheet.create({
    floorTitle: {
        height: 50,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingLeft: px(20)
    },
    floorTitleTxt: {
        fontSize: px(30)
    },
    floor: {
        backgroundColor: '#fff',
        marginBottom: px(20),
        paddingBottom: px(20)
    },
    module: {
        width: px(750),
        //paddingBottom: px(10),
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: px(16)
    },
    moduleImage_: {
        borderRadius: px(12),
        overflow: 'hidden'
    },
    moduleImage: {
        borderRadius: px(12),
        overflow: 'hidden'
    },
    moduleGoodName: {
        fontSize: px(24),
        color: '#252426',
        marginTop: px(20),
        marginBottom: px(6)
    },
    modulePrice: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    moduleGoodPrice: {
        fontSize: px(24),
        color: '#d0648f'
    },
    moduleGoodMarket: {
        fontSize: px(20),
        color: '#858385',
        textDecorationLine: 'line-through',
        marginLeft: px(10)
    }
})
