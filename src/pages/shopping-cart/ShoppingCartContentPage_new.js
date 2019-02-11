import React from 'react';
import { observer } from "mobx-react";
import CartList from '../../services/Cart'
import Cart, {Footer} from './ShoppingCartPage_new'
import { FootView } from '../../UI/Page';
import { px, isIphoneX } from "../../utils/Ratio";
import {
    Text,
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
export default observer(class extends Cart {
    goDetail(id, sku) {
        this.props.navigation.navigate('DetailPage_fromCart', {
            id: sku ? '' : id,
            sku: sku
        });
    }

    

    renderOther(){
        return <View style={{ width: px(750), height: isIphoneX() ? px(165) : px(105), backgroundColor: '#fff' }} />
    }
    renderFooter() {
        return <Footer_
            editStatus={this.state.editStatus}
            total_count={CartList.data.total_count}
            total_price={CartList.data.total_price}
            selectAllStatus={CartList.isSelectAll}
            editSelectAllStatus={this.state.editSelectAllStatus}
            editSelectArr={this.state.editSelectArr}
            selectAllFn={CartList.selectAll}
            discount_amount={CartList.data.discount_amount}
            editSelectAllFn={this.editSelectAllFn.bind(this)}
            delete={this.delete.bind(this)}
            submit={this.submit.bind(this)}
            openCoupon={this.openCoupon.bind(this)}
        />
    }
})

class Footer_ extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectALL: false
        }
    }
    
    selectALL() {
        this.setState(prevState => {
            return {
                selectALL: !prevState.selectALL
            }
        });
    }
    
    goSubmit() {
        let {total_price, discount_amount} = this.props;
        if (total_price * 1 + discount_amount * 1 > 0) {
            this.props.submit && this.props.submit();
        }
    }
    
    render() {
        const {discount_amount, total_price, total_count} = this.props;
        if (CartList.data.list.length == 0) return null;
        return (
            <FootView>
                <View style={styles.footer}>
                    {this.props.editStatus
                        ? <View style={styles.operatingBtn}>
                            <TouchableOpacity activeOpacity={0.8}
                                style={styles.operatingBtnBox}
                                onPress={this.props.editSelectAllFn.bind(this)}>
                                {!this.props.editSelectAllStatus
                                    ? <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34), marginRight: px(10) }} />
                                    : <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34), marginRight: px(10) }} />
                                }
                            </TouchableOpacity>
                        </View>
                        : <View style={styles.operatingBtn}>
                            <TouchableOpacity activeOpacity={0.8}
                                style={styles.operatingBtnBox}
                                onPress={this.props.selectAllFn}>
                                {this.props.selectAllStatus
                                    ? <Image source={{ uri: require('../../images/tab-shopping-cart-selected') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34), marginRight: px(10) }} />
                                    : <Image source={{ uri: require('../../images/tab-shopping-cart-select') }}
                                        resizeMode='cover'
                                        style={{ width: px(34), height: px(34), marginRight: px(10) }} />
                                }
                            </TouchableOpacity>
                        </View>
                    }
                    {this.props.editStatus
                        ? <View style={styles.footerContent}>
                            <Text allowFontScaling={false} style={[styles.footerContentTxt0]}>全部</Text>
                            <TouchableOpacity activeOpacity={0.8} onPress={this.props.delete}>
                                <View style={[styles.delete]}>
                                    <Text allowFontScaling={false} style={styles.delete_txt}>删除</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        : <View style={styles.footerContent}>
                            <Text allowFontScaling={false} style={[styles.footerContentTxt0, styles.footerContentTxt1]}>全部</Text>
                            <View style={{alignItems: 'flex-end', marginRight: px(56)}}>
                                <View style={base.inline_left}>
                                    <Text allowFontScaling={false} style={styles.footerContentTxt1}>合计</Text>
                                    <Text allowFontScaling={false} style={styles.footerContentTxt2}>￥{this.props.total_price}</Text>
                                </View>
                                {
                                    discount_amount > 0 &&
                                    <Text allowFontScaling={false} style={styles.footerContentTxt3}>已优惠￥{discount_amount}</Text>
                                }
                            </View>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => this.goSubmit()}>
                                <View style={[styles.submit, total_price * 1 + discount_amount * 1 > 0 ? styles.submitAbled : styles.submitDisabled]}>
                                    <Text allowFontScaling={false} style={styles.submit_txt}>去结算({total_count})</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </FootView>
        )
        
    }
}

const styles = StyleSheet.create({
    footer: {
        paddingLeft: px(30),
        width: px(750),
        backgroundColor: '#fff',
        height: px(98),
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden'
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        height: px(98),
        backgroundColor: '#fff'
    },
    footerContentTxt0: {
        flex: 1,
        textAlign: 'left'
    },
    footerContentTxt1: {
        fontSize: px(28),
        color: '#252426'
    },
    footerContentTxt2: {
        fontSize: px(38),
        color: '#d0648f',
        //marginRight: px(56),
    },
    footerContentTxt3: {
        fontSize: px(24),
        color: '#222'
    },
    submit: {
        width: px(250),
        height: px(98),
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    submitAbled: {
        backgroundColor: '#d0648f'
    },
    submitDisabled: {
        backgroundColor: '#b2b3b5'
    },
    submit_txt: {
        fontSize: px(34),
        color: '#fff'
    },
    delete: {
        width: px(140),
        height: px(60),
        borderColor: '#d0648f',
        borderWidth: px(1),
        borderRadius: px(8),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: px(30)
    },
    delete_txt: {
        fontSize: px(26),
        color: '#d0648f'
    },
    footerTip: {
        width: px(750),
        height: px(70),
        backgroundColor: '#fff8f5',
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        paddingLeft: px(30)
    },
    footerTxt: {
        color: '#ed3f58',
        fontSize: px(28)
    }
});