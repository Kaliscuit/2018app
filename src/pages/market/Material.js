import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'
import { px2dp } from 'react-native-style-adaptive'
import Icon from '../../UI/lib/Icon'
import { ImgsModal } from '../common/ModalView'

const Goods = props => <TouchableOpacity
    style={ goodsStyle.container }
    activeOpacity={0.9}
    onPress={() => () => {} }
>
    <Image
        style={ goodsStyle.material }
        source={ { uri: 'https://img.alicdn.com/imgextra/i1/28834016/TB2lG_CmZfpK1RjSZFOXXa6nFXa_!!0-saturn_solar.jpg_220x220.jpg', cache: 'force-cache' } }
    />
    <View style={ goodsStyle.goodsBox }>
        <Text style={ goodsStyle.goodName } numberOfLines={ 2 }>凡品丹尼 韩字裙韩版收腰针织显瘦气质连衣裙中长款修身a字裙</Text>
        <View style={ goodsStyle.priceBox }>
            <Text style={ goodsStyle.price }>¥108.00</Text>
            <Text style={ goodsStyle.line }>/</Text>
            <Text style={ goodsStyle.make }>赚 ¥23</Text>
        </View>
    </View>
</TouchableOpacity>

const goodsStyle = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        padding: px2dp(22),
        backgroundColor: '#F7F7F7',
        borderRadius: px2dp(10)
    },
    material: {
        width: px2dp(120),
        height: px2dp(120),
        borderRadius: px2dp(8)
    },
    goodsBox: {
        flex: 1,
        marginLeft: px2dp(20),
        justifyContent: 'space-between'
    },
    goodName: {
        fontSize: px2dp(28),
        color: '#222',
        lineHeight: px2dp(36),
    },
    priceBox: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    price: {
        fontSize: px2dp(28),
        color: '#222'
    },
    line: {
        fontSize: px2dp(16),
        color: 'rgba(0,0,0,0.5)',
        marginLeft: px2dp(16),
        marginRight: px2dp(10),
        marginBottom: px2dp(6)
    },
    make: {
        fontSize: px2dp(22),
        color: '#D0648F',
        marginBottom: px2dp(2)
    }
})

class Operation extends Component {
    render () {
        const { iconStyle, name, title } = this.props

        return (
            <TouchableOpacity
                style={ operationStyle.container }
                activeOpacity={0.9}
                onPress={() => () => {} }
            >
                <Icon style={ [operationStyle.icon, iconStyle] } name={ name }/>
                <Text style={ operationStyle.text }>{ title }</Text>
            </TouchableOpacity>
        )
    }
}

const operationStyle = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: px2dp(28),
        height: px2dp(28)
    },
    text: {
        fontSize: px2dp(28),
        color: '#333',
        paddingLeft: px2dp(10)
    }
})

export default class extends Component {
    render () {
        return (
            <View style={ styles.container }>
                <View style={ [styles.header, styles.paddingH] }>
                    <View style={ styles.user }>
                        <Image
                            style={ styles.avatar }
                            source={ { uri: 'https://secure.gravatar.com/avatar/0ec437405312f839f6547da12f71d23e?s=128', cache: 'force-cache' } }
                        />
                        <Text style={ styles.name }>达令家官方</Text>
                    </View>
                    <Text style={ styles.forwarding }>4428人已转发</Text>
                </View>
                <Text style={ [styles.content, styles.paddingH] }>超级划算，跟同事两个人一人一个，蓝色超级好看额就是物流差些，5天才收到，等的好辛苦，不过总体来说还是一次愉快的购物。</Text>
                <View style={ [styles.materialBox, styles.paddingH] }>
                    <Image
                        style={ styles.material }
                        source={ { uri: 'https://img.alicdn.com/imgextra/i1/28834016/TB2lG_CmZfpK1RjSZFOXXa6nFXa_!!0-saturn_solar.jpg_220x220.jpg', cache: 'force-cache' } }
                    />
                    <Image
                        style={ styles.material }
                        source={ { uri: 'https://img.alicdn.com/imgextra/i1/28834016/TB2lG_CmZfpK1RjSZFOXXa6nFXa_!!0-saturn_solar.jpg_220x220.jpg', cache: 'force-cache' } }
                    />
                    <Image
                        style={ styles.material }
                        source={ { uri: 'https://img.alicdn.com/imgextra/i1/28834016/TB2lG_CmZfpK1RjSZFOXXa6nFXa_!!0-saturn_solar.jpg_220x220.jpg', cache: 'force-cache' } }
                    />
                    <Image
                        style={ styles.material }
                        source={ { uri: 'https://img.alicdn.com/imgextra/i1/28834016/TB2lG_CmZfpK1RjSZFOXXa6nFXa_!!0-saturn_solar.jpg_220x220.jpg', cache: 'force-cache' } }
                    />
                </View>
                <View style={ styles.paddingH }>
                    <Goods/>
                </View>
                <View style={ styles.operation }>
                    <Operation name="icon-matter-down" title="保存"/>
                    <Operation name="icon-matter-share" title="分享"/>
                    <Operation name="icon-matter-uncollect" title="收藏"/>
                </View>
                {/* <ImgsModal ref='imgsModal' list={ this.props.item.img_list.map(item => ({
                    width: item.img_width,
                    height: item.img_height,
                    image: item.subject_img_url_http
                })) }></ImgsModal> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginBottom: px2dp(20)
    },
    paddingH: {
        paddingHorizontal: px2dp(32)
    },
    header: {
        flexDirection: 'row',
        height: px2dp(130),
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    user: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatar: {
        width: px2dp(70),
        height: px2dp(70),
        borderRadius: px2dp(35),
        marginRight: px2dp(20)
    },
    name: {
        fontSize: px2dp(30),
        color: '#222'
    },
    forwarding: {
        fontSize: px2dp(24),
        color: '#999'
    },
    content: {
        fontSize: px2dp(30),
        color: '#333',
        // backgroundColor: 'red',
        lineHeight: px2dp(46)
    },
    materialBox: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: px2dp(22)
    },
    material: {
        width: px2dp(224),
        height: px2dp(224),
        borderRadius: px2dp(10),
        marginBottom: px2dp(8)
    },
    operation: {
        flexDirection: 'row',
        height: px2dp(80),
        borderTopColor: '#E5E5E5',
        borderTopWidth: 1,
        marginTop: px2dp(30)
    }
})
