import React, { PureComponent } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'

import { px, deviceWidth } from "../../../utils/Ratio"

import Icon from '../../../UI/lib/Icon'

import { digitalUnit } from '../../../utils/digitalProcessing'

const conversion = digitalUnit(10000, ['', '万', '亿', '万亿', '兆'])

export default class extends PureComponent {
    static defaultProps = {
        isRanking: false,
        onPress: () => { }
    }

    render() {
        const results = this.styleCalculation()

        const { isBorder, isRanking, item, onPress, goShare } = this.props
        const {
            salesVolume,
            image,
            goodsShowDesc,
            salePrice,
            marketPrice,
            browsingVolume,
            limitStock,
            is_deep_stock,
            flag,
            benefitMoney
        } = item

        const browsingObj = browsingVolume ? conversion(browsingVolume, 2, '人', true) : { num: 0, unit: '' }

        const isShare = is_deep_stock === '1' || !limitStock || flag === '1'

        return (
            <TouchableOpacity
                style={styles.bg}
                activeOpacity={0.8}
                onPress={() => onPress(item)}
            >
                <View style={[
                    styles.container,
                    { backgroundColor: results.bgColor },
                    results.remaining && (isRanking ? styles.remaining : styles.noRanking),
                    !isBorder && styles.noBorder
                ]}>
                    {
                        isRanking && <View style={[styles.salesBox, results.remaining && styles.remainingSales]}>
                            <Text style={[styles.ranking, !results.remaining && styles.rankingRed]}>{salesVolume}</Text>
                            <Text style={styles.salesText}>销量</Text>
                        </View>
                    }
                    <View style={[
                        styles.goodsBox, !results.remaining && !isRanking && styles.goodsPadding]}>
                        <View style={styles.imgBox}>
                            <Image
                                style={styles.img}
                                source={{ uri: image, cache: 'force-cache' }}
                            />
                            {
                                (!limitStock || flag === '1') && <View style={styles.mask}>
                                    <Text style={styles.gone}>已抢光</Text>
                                </View>
                            }
                        </View>
                        <View style={styles.introductionBox}>
                            <Text style={styles.name} numberOfLines={2}>{goodsShowDesc}</Text>
                            <View style={styles.detailed}>
                                <View style={styles.priceBox}>
                                    <Text style={styles.price}>¥{salePrice}</Text>
                                    <Text style={styles.line}>/</Text>
                                    <Text style={styles.make}>赚 ¥{benefitMoney}</Text>
                                </View>
                                <View style={styles.browse}>
                                    {/* {!isRanking && <Text style={styles.browseText}><Text style={styles.browseTextBig}>{browsingObj.num}</Text>{browsingObj.unit}浏览</Text>} */}
                                    <TouchableOpacity
                                        activeOpacity={ isShare ? 0.8 : 1}
                                        onPress={() => goShare(item)}
                                    >
                                        <Icon name={isShare ? "icon-index-share-new-disabled" : "icon-index-share-no-bottom" } style={styles.browseIcon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    styleCalculation() {
        const opacity = 0.15 - 0.05 * this.props.index

        return {
            bgColor: opacity > 0 ? `rgba(208, 45, 101, ${opacity})` : '#fff',
            remaining: opacity <= 0 ? true : false
        }
    }
}

const styles = StyleSheet.create({
    bg: {
        backgroundColor: '#fff',
        paddingHorizontal: px(10)
    },
    container: {
        height: px(200),
        flexDirection: 'row',
        marginBottom: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: px(20),
        borderRadius: px(8)
    },
    remaining: {
        marginBottom: 0,
        marginLeft: px(28),
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF'
    },
    noRanking: {
        marginBottom: 0,
        marginLeft: px(22),
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF'
    },
    noBorder: {
        borderBottomWidth: 0,
        marginBottom: 0
    },
    salesBox: {
        width: px(135),
        alignItems: 'center',
        justifyContent: 'center'
    },
    remainingSales: {
        marginLeft: -px(28)
    },
    ranking: {
        fontSize: px(32),
        color: '#222',
        fontWeight: 'bold'
    },
    rankingRed: {
        color: '#D02D65'
    },
    salesText: {
        fontSize: px(22),
        color: '#999',
        marginTop: px(10)
    },
    goodsBox: {
        flex: 1,
        flexDirection: 'row'
    },
    goodsPadding: {
        paddingLeft: px(20)
    },
    imgBox: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: px(8),
        width: px(120),
        height: px(120),
        justifyContent: 'center',
        alignItems: 'center'
    },
    img: {
        width: px(120),
        height: px(120)
    },
    mask: {
        width: px(100),
        height: px(100),
        position: 'absolute',
        backgroundColor: 'rgba(37, 36, 38, 0.5)',
        borderRadius: px(100),
        justifyContent: 'center',
        alignItems: 'center'
    },
    gone: {
        fontSize: px(24),
        color: '#fff'
    },
    introductionBox: {
        flex: 1,
        marginLeft: px(22),
        justifyContent: 'space-between'
    },
    name: {
        fontSize: px(28),
        color: '#222',
        lineHeight: px(36)
    },
    detailed: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    priceBox: {
        flexDirection: 'row'
    },
    price: {
        fontSize: px(28),
        color: '#222',
        lineHeight: px(36)
    },
    line: {
        fontSize: px(22),
        color: '#898989',
        lineHeight: px(35),
        includeFontPadding: false,
        marginHorizontal: px(10)
    },
    make: {
        fontSize: px(22),
        color: '#D0648F',
        lineHeight: px(36)
    },
    browse: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    browseText: {
        fontSize: px(22),
        color: '#222'
    },
    browseTextBig: {
        fontSize: px(28)
    },
    browseIcon: {
        width: px(36),
        height: px(34),
        marginLeft: px(40),
        // marginTop: px(2)
    }
})