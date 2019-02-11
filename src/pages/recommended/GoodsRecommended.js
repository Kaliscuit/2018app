import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { get } from '../../services/Request'
import { User } from '../../services/Api'
import CartList from "../../services/Cart"
import { px, deviceWidth, isIphoneX } from "../../utils/Ratio"

import { show as toast } from '../../widgets/Toast'
import { DetailsGridGoods, GridGoods, SlidingGoods } from './Goods'
import { DialogModal } from '../common/ModalView';
import Icon from '../../UI/lib/Icon'

const EachGoods = (props) => {
    if (props.isSliding) return <SlidingGoods {...props} />

    return <DetailsGridGoods {...props} />
}

export class DetailsGoodsRecommended extends Component {

    render() {
        const { navigation, list, isSliding } = this.props

        return (
            list.length ? <View style={styles.container}>
                <Text style={styles.title}>{this.props.title}</Text>
                {
                    !isSliding ?
                        <View style={styles.grid}>
                            {list.map((item, index) => <EachGoods
                                key={item.id}
                                item={item}
                                navigation={navigation}
                                isSliding={isSliding}
                                owner={User.isLogin && !User.vip}
                                toDetails={this.toDetails.bind(this)}
                            />)}
                        </View>
                        : <ScrollView
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                        >
                            {list.map((item, index) => <EachGoods
                                key={item.id}
                                item={item}
                                navigation={navigation}
                                isSliding={isSliding}
                                owner={User.isLogin && !User.vip}
                                toDetails={this.toDetails.bind(this)}
                            />)}
                        </ScrollView>
                }
            </View> : null
        )
    }

    toDetails(id) {
        this.props.navigation.push('DetailPage', { id })
    }
}

export class GoodsRecommendedForYou extends Component {
    render() {
        const { navigation, list, isData } = this.props

        return (
            !list.length ? null : <View style={styles.goodsContainer}>
                <View style={styles.goodsTitleBox}>
                    <Icon name="recommended-left" style={styles.recommendedIcon} />
                    <Text style={styles.goodsTitle}>为您推荐</Text>
                    <Icon name="recommended-right" style={styles.recommendedIcon} />
                </View>
                <View style={styles.goodsGrid}>
                    {
                        list.map((item, index) => <GridGoods
                            key={item.id}
                            item={item}
                            owner={User.isLogin && !User.vip}
                            navigation={navigation}
                            addCart={this.addCart.bind(this)}
                            toDetails={this.toDetails.bind(this)}
                        />)
                    }
                </View>
                {!!list.length && <Text
                    style={[
                        styles.goodsFooter,
                        !this.props.isCart && isIphoneX() ? { marginBottom: px(90) } : null
                    ]}>已经到底了，不挑几件好货么？~</Text>
                }
                <DialogModal ref="dialog" />
            </View>
        )
    }

    toDetails(id) {
        this.props.navigation.push('DetailPage', { id })
    }

    async addCart(id, num) {
        if (User.isLogin) {
            try {
                await CartList.addCartNum(id, num)
                toast('加入购物车成功')
                this.props.isCart && await CartList.update()
                await this.props.carRefresh && this.props.carRefresh()
            } catch (e) {
                if (e.data.oos !== 'oos') {
                    return toast(e.message);
                }

                if (!this.props.isCart) {
                    this.refs.dialog.open({
                        content: [e.data.error_detail],
                        btns: [
                            { txt: "我知道了" },
                            {
                                txt: "去购物车", click: () => this.props.navigation.navigate('ShoppingCartContentPage', { isNeedBack: true })
                            }
                        ]
                    })
                }
            }
        } else {
            this.goLoginPage()
        }
    }

    goLoginPage() {
        this.props.navigation.navigate('LoginPage', {})
    }
}

const styles = StyleSheet.create({
    container: {
        width: deviceWidth,
        paddingLeft: px(24),
        backgroundColor: '#fff',
        marginTop: px(16)
    },
    title: {
        fontSize: px(28),
        color: '#222',
        paddingBottom: px(30),
        paddingTop: px(40)
    },
    goodsContainer: {
        // paddingHorizontal: px(24)
    },
    goodsTitleBox: {
        marginTop: px(60),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: px(30),
    },
    recommendedIcon: {
        width: px(38),
        height: px(18)
    },
    goodsTitle: {
        fontSize: px(32),
        color: '#d0648f',
        marginHorizontal: px(20)
    },
    goodsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingRight: px(24)
    },
    goodsFooter: {
        marginTop: px(60),
        marginBottom: px(60),
        fontSize: px(24),
        color: '#999',
        textAlign: 'center'
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    loading: {
        textAlign: 'center',
        fontSize: px(28),
        paddingVertical: px(20),
        color: "#ccc",
        marginLeft: px(10)
    }
})