import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import Icon from '../../UI/lib/Icon'
import util_cools from '../../utils/tools'
import { px, deviceWidth } from "../../utils/Ratio"

export class SlidingGoods extends Component {
    render() {
        const { owner, item } = this.props
        const {
            original_img,
            goodsShowDesc,
            salePrice,
            benefitMoney,
            id
        } = item

        const imageSrc = util_cools.cutImage(original_img, 200, 200)

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => this.props.toDetails(id)}
            >
                <View style={[goodsStyle.container, goodsStyle.slidingBox]}>
                    <Image resizeMode="cover" resizeMethod="scale"
                        style={[goodsStyle.imageCommon, goodsStyle.slidingImage]}
                        source={{ uri: imageSrc, cache: 'force-cache' }}
                    >
                    </Image>
                    <View>
                        <Text style={goodsStyle.goodName} numberOfLines={2} ellipsizeMode={"tail"}>{goodsShowDesc}</Text>
                        <View style={goodsStyle.priceContent}>
                            <Text style={goodsStyle.goodPriceBox} allowFontScaling={false}>
                                ￥<Text style={goodsStyle.goodPrice}>{salePrice}</Text>
                            </Text>
                            {
                                owner && <View style={goodsStyle.priceContent}>
                                    <Text allowFontScaling={false} style={goodsStyle.priceLine}>
                                        /
                                    </Text>
                                    <Text style={goodsStyle.goodMarket} allowFontScaling={false}>
                                        赚￥{util_cools.parsePrice(benefitMoney)}
                                    </Text>
                                </View>
                            }
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

export class DetailsGridGoods extends Component {
    render() {
        const { owner, item } = this.props
        const {
            original_img,
            goodsShowDesc,
            salePrice,
            benefitMoney,
            id
        } = item

        const imageSrc = util_cools.cutImage(original_img, 375, 375)

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => this.props.toDetails(id)}
            >
                <View style={[goodsStyle.container, goodsStyle.gridBox]}>
                    <Image resizeMode="cover" resizeMethod="scale"
                        style={[goodsStyle.imageCommon, goodsStyle.gridImage]}
                        source={{ uri: imageSrc, cache: 'force-cache' }}
                    >
                    </Image>
                    <View style={goodsStyle.goodsContent}>
                        <Text style={goodsStyle.goodName} numberOfLines={2} ellipsizeMode={"tail"}>{goodsShowDesc}</Text>
                        <View style={goodsStyle.priceContent}>
                            <Text style={goodsStyle.goodPriceBox} allowFontScaling={false}>
                                ￥<Text style={goodsStyle.goodPrice}>{salePrice}</Text>
                            </Text>
                            {
                                owner && <View style={goodsStyle.priceContent}>
                                    <Text allowFontScaling={false} style={goodsStyle.priceLine}>
                                        /
                                    </Text>
                                    <Text style={goodsStyle.goodMarket} allowFontScaling={false}>
                                        赚￥{util_cools.parsePrice(benefitMoney)}
                                    </Text>
                                </View>
                            }
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

export class GridGoods extends Component {
    render() {
        const { owner, item } = this.props
        const {
            originalImg,
            goodsShowDesc,
            salePrice,
            benefitMoney,
            goodsShowName,
            id,
            isInBond,
            isForeignSupply
        } = item

        const imageSrc = util_cools.cutImage(originalImg, 375, 375)

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => this.props.toDetails(id)}
            >
                <View style={forYou.container}>
                    <Image resizeMode="cover" resizeMethod="scale"
                        style={forYou.image}
                        source={{ uri: imageSrc }}
                    />
                    <View style={forYou.content}>
                        <Text style={forYou.goodsShowName} numberOfLines={2} ellipsizeMode={"tail"}>{goodsShowName}</Text>
                        <View style={forYou.goodNameBox}>
                            {isInBond == 1 && <Icon name="bond" style={forYou.flag} />}
                            {isForeignSupply == 2 && <Icon name="isForeignSupply" style={forYou.flag} />}
                            <Text style={forYou.goodName} numberOfLines={2} ellipsizeMode={"tail"}>
                                {(isInBond == 1 || isForeignSupply == 2) && <Text style={forYou.position}>flagLen</Text>}
                                {goodsShowDesc}
                            </Text>
                        </View>
                        <View style={forYou.priceBox}>
                            <View style={forYou.textBox}>
                                <Text style={forYou.price} allowFontScaling={false}>
                                    ￥<Text style={forYou.goodPrice}>{salePrice}</Text>
                                </Text>
                                {
                                    owner && <View style={forYou.textBox}>
                                        <Text allowFontScaling={false} style={forYou.priceLine}>
                                            /
                                        </Text>
                                        <Text style={forYou.goodMarket} allowFontScaling={false}>
                                            赚￥{util_cools.parsePrice(benefitMoney)}
                                        </Text>
                                    </View>
                                }
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => this.props.addCart(id, 1)}
                            >
                                <Icon name="icon-index-cartNew" style={forYou.cart} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const forYou = StyleSheet.create({
    container: {
        width: px(346),
        marginBottom: px(10),
        backgroundColor: '#fff',
        borderRadius: px(12),
        overflow: 'hidden'
    },
    image: {
        width: px(346),
        height: px(346)
    },
    content: {
        paddingHorizontal: px(16),
        paddingTop: px(20),
        paddingBottom: px(28)
    },
    goodsShowName: {
        fontSize: px(28),
        color: '#000',
        marginBottom: px(8)
    },
    goodNameBox: {
        flexDirection: 'row'
    },
    flag: {
        width: px(44),
        height: px(24),
        position: 'absolute',
        left: px(0),
        top: px(4),
        zIndex: 100,
    },
    position: {
        fontSize: px(16),
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: "center",
        color: '#fff',
    },
    goodName: {
        fontSize: px(24),
        color: '#666',
        // paddingVertical: px(20),
        lineHeight: px(32),
        height: px(70)
    },
    priceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: px(20),
        justifyContent: 'space-between'
    },
    textBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: px(22),
        color: '#000'
    },
    goodPrice: {
        fontSize: px(30)
    },
    priceLine: {
        fontSize: px(22),
        color: '#898989',
        includeFontPadding: false,
        marginHorizontal: px(6)
    },
    goodMarket: {
        fontSize: px(22),
        color: '#d0648f'
    },
    cart: {
        alignSelf: 'stretch',
        width: px(42),
        height: px(42)
    }
})

const goodsStyle = StyleSheet.create({
    container: {
        marginBottom: px(40)
    },
    gridBox: {
        width: px(340),
        marginBottom: px(40)
    },
    slidingBox: {
        width: px(200),
        marginRight: px(20)
    },
    imageCommon: {

    },
    gridImage: {
        width: px(340),
        height: px(340)
    },
    slidingImage: {
        width: px(200),
        height: px(200)
    },
    goodsContent: {
        paddingHorizontal: px(20)
    },
    goodName: {
        fontSize: px(24),
        color: '#252426',
        marginTop: px(17),
        height: px(68)
    },
    priceContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    goodPriceBox: {
        fontSize: px(22),
        color: '#222'
    },
    goodPrice: {
        fontSize: px(26)
    },
    goodMarket: {
        fontSize: px(22),
        color: '#d0649f'
    },
    priceLine: {
        fontSize: px(22),
        color: '#898989',
        lineHeight: px(35),
        includeFontPadding: false,
        marginHorizontal: px(10)
    }
})
