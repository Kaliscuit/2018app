'use strict';

import React, {PureComponent} from 'react';
import {
    Image,
    Text,
    View,
    Alert,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import {px, isIphoneX} from "../../../utils/Ratio";
import request, {get, post} from "../../../services/Request";
import {show as toast} from '../../../widgets/Toast';
import Loading from '../../../animation/Loading'
import {TopHeader} from '../../common/Header'
import Page, {FootView} from '../../../UI/Page'
import util_tools from "../../../utils/tools";
import base from '../../../styles/Base'
import Icon from '../../../UI/lib/Icon'

//列表项
class PayerItem extends PureComponent {
    
    constructor(props) {
        super(props);
        
    }
    
    render() {
        const {payer, selected, isSelect, isSelected, from} = this.props;
        return <View style={payerStyles.payerItem}>
            <TouchableWithoutFeedback onPress={() => this.props.select(payer)}>
                <View style={[payerStyles.top]}>
                    {
                        from == 'submit' && isSelected &&
                        <View style={payerStyles.select}>
                            <Icon name="icon-address-check"
                                style={{width: px(30), height: px(20)}}/>
                        </View>
                    }
                    <View style={[payerStyles.info]}>
                        <View style={[base.inline_left]}>
                            <Text style={[payerStyles.name, payerStyles.infoTxt, base.includeFontPadding]} allowFontScaling={false}>{payer.payerName}</Text>
                            {
                                from == 'submit' && payer.defaultYn == 'Y' &&
                                <View style={[payerStyles.defaultBox, base.borderColor]}>
                                    <Text allowFontScaling={false} style={[payerStyles.defaultBoxTxt, base.color]}>默认</Text>
                                </View>
                            }
                        </View>
                        <Text style={[payerStyles.card, payerStyles.infoTxt, base.includeFontPadding]} allowFontScaling={false}>{payer.payerCardNo}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View style={[payerStyles.bottom, base.inline_between]}>
                <View style={{flex: 1}}>
                    {
                        from == 'my' &&
                        <TouchableWithoutFeedback onPress={() => this.props.defaultSelect(payer.id, payer.defaultYn)}>
                            <View style={[payerStyles.radio]}>
                                {
                                    payer.defaultYn == 'Y' &&
                                        <Icon name="icon-default-address"
                                            resizeMode='cover'
                                            style={{width: px(34), height: px(34)}}/>
                                }
                                {
                                    payer.defaultYn == 'N' &&
                                    <Icon name="icon-default-address-un"
                                        resizeMode='cover'
                                        style={{width: px(34), height: px(34)}}/>
                                }
                                <Text allowFontScaling={false} style={[payerStyles.bottomTxt, base.includeFontPadding]}>
                                    {payer.defaultYn == 'Y' ? '默认支付人' : '设为默认'}
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    }
                </View>
                <View style={payerStyles.payerOperation}>
                    {/*<TouchableWithoutFeedback onPress={() => this.props.goEdit(payer.id)}>
                        <View style={payerStyles.operation}>
                            <Icon name="icon-address-edit" style={{width: px(24), height: px(24), marginTop: px(1)}} />
                            <Text allowFontScaling={false} style={[payerStyles.bottomTxt, base.includeFontPadding]}>编辑</Text>
                        </View>
                    </TouchableWithoutFeedback>*/}
                    <TouchableWithoutFeedback onPress={() => this.props.delPayer(payer.id)}>
                        <View style={payerStyles.operation}>
                            <Icon name="icon-address-del" style={{width: px(24), height: px(24), marginTop: px(1)}} />
                            <Text allowFontScaling={false} style={[payerStyles.bottomTxt, base.includeFontPadding]}>删除</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </View>
    }
    
}

export default class extends Page {
    
    constructor(props) {
        super(props);
        this.state = {
            isrefresh: false,
            id: 0,
            name: 0,
            from: this.props.navigation.state.params.from || '',
            list: [],
            loadText: '加载中...',
            selected: ''
        };
        
    }
    title = (this.props.navigation.state.params || {}).from == 'my' ?
        '支付人信息' : '选择支付人信息'
    
    pageHeader() {
        return <TopHeader
            title={this.title}
            navigation={this.props.navigation}
        />
    }
    
    pageFooter() {
        //if (!this.state.goods) return null;
        return <FootView>
            <TouchableWithoutFeedback onPress={() => this.goEdit('new')}>
                <View style={[styles.footer, base.inline, base.backgroundColor]}>
                    <Text style={[styles.footerTxt, base.includeFontPadding]} allowFontScaling={false}>添加支付人</Text>
                </View>
            </TouchableWithoutFeedback>
        </FootView>
    }
    pageBody() {
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={this.state.list}
                    refreshing={this.state.isrefresh}
                    onRefresh={() => this.refresh()}
                    initialNumToRender={2}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) =>
                        <PayerItem
                            payer={item}
                            from={this.state.from}
                            isSelected={item.id == (this.state.selected && this.state.selected.id)}
                            delPayer={this.delPayer.bind(this)}
                            goEdit={this.goEdit.bind(this)}
                            defaultSelect={this.defaultSelect.bind(this)}
                            select={this.select.bind(this)}
                        />
                    }
                   
                    onEndReached={() => this.nextPage()}
                    ListEmptyComponent={() => <View style={[base.line, { height: px(1000) }]}>
                        <Text style={[{ width: px(750), textAlign: 'center', color: "#ccc" }]}>暂无支付人</Text>
                    </View>}
                    /*ListFooterComponent={<View style={[styles.textCenter, styles.listEndBox]}>
                        {this.state.list.length > 0 && <Text style={{
                            textAlign: 'center',
                            fontSize: px(28), marginBottom: px(20),
                            color: "#ccc"
                        }}>{this.state.loadText}</Text>}
                    </View>}*/
                />
                <View style={{width: px(750), height: isIphoneX() ? px(155) : px(95)}}/>
            </View>
        )
    }
    
    start = 0;
    isEnd = false;
    loading = false;
    
    async onReady() {
        await this.refresh();
    }
    
    async nextPage() {
        if (this.loading || this.isEnd) return;
        this.loading = true;
        if (!this.start) this.start = 0;
        this.start = this.start + 1;
        try {
            let res = ''
            res = await request.get(`/xc_uc/payer/queryList.do?start=${this.start}`);
            if (res.totalPages <= this.start + 1) {
                this.setState({
                    loadText: '别扯了，到底啦'
                })
                this.isEnd = true;
            }
            if (!res.items || res.items.length == 0) {
                this.isEnd = true;
                return;
            }
            this.setState({
                list: this.state.list.concat(res.items),
            });
        } catch (e) {
            //
        } finally {
            this.loading = false;
        }
    }
    
    async refresh() {
        this.loading = true;
        try {
            let res = ''
            res = await request.get(`/xc_uc/payer/queryList.do?start=${this.start}`);
            this.loading = false;
            if (res.totalPages < 2) {
                this.setState({
                    loadText: '别扯了，到底啦'
                })
                this.isEnd = true;
            }
            if (!res.items || res.items.length == 0) {
                let address = this.props.navigation.state.params.address
                if (address.cardNo && this.state.from == 'submit') {
                    this.$alert("", '是否使用当前收货人姓名、身份证信息为支付人姓名、身份证信息？', {
                        txt: '使用',
                        click: () => this.useAddress(address)
                    }, {
                        txt: '去添加',
                        click: () => this.goEdit('new')
                    });
                }
                this.isEnd = true;
                return;
            }
            let payer = this.props.navigation.state.params.payer
            this.setState({
                list: res.items,
                selected: payer ? payer : res.items[0]
            });
        } catch (e) {
            //this.refs.loading.close()
        } finally {
            this.loading = false;
            //this.refs.loading.close()
        }
    }
    
    
    componentWillUnmount() {
    }
    
    async defaultSelect(id, defaultYn) {
        this.state.list.map(async (item) => {
            if (item.id == id) {
                item.defaultYn = item.defaultYn == 'Y' ? 'N' : 'Y';
                try {
                    await request.post(`/xc_uc/payer/updateDefault.do`, {
                        payerId: id,
                        defaultYn: item.defaultYn
                    });
                } catch (e) {
                    toast(e.message);
                }
            } else {
                item.defaultYn = 'N'
            }
        })
        this.setState({
            list: this.state.list
        })
        /*try {
            defaultYn = defaultYn == 'Y' ? 'N' : 'Y';
            await post(`http://10.36.11.60:8080/xc_uc/payer/updateDefault.do`, {
                payerId: id,
                defaultYn: defaultYn
            });
        } catch (e) {
            toast(e.message);
        }*/
    }
    
    goEdit(payerId) {
        this.go('PayerEditPage', {
            payerId: payerId
        });
    }
    
    async update() {
        await this.refresh();
    }
    /**
     * 删除支付人信息
     */
    async delPayer(id) {
        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要删除么？`,
                [{
                    text: '取消', onPress: () => resolve(false)
                }, {
                    text: '删除', onPress: () => resolve(true)
                }]
            )
        });
        if (!confirm) {
            return;
        }
        
        this.state.list.forEach((item, index) => {
            if (item.id == id) {
                return this.state.list.splice(index, 1);
            }
        });
        this.setState({
            list: this.state.list
        });
        try {
            request.post('/xc_uc/payer/delete.do', {payerId: id});
        } catch (e) {
            toast(e)
        }
        
    }
    select(payer) {
        this.setState({
            selected: payer
        });
        this.props.navigation.state.params.callback(payer);
        this.props.navigation.goBack();
    }
    async useAddress(address) {
        try {
            let res = await request.get(`/xc_uc/payer/createPayerInfoByAddressId.do?addressId=${address.id}`);
            this.setState({
                list: [
                    res
                ],
                selected: res
            })
            this.select(res)
        } catch (e) {
            toast(e)
        }
    }
    
    
    
}

const styles = StyleSheet.create({
    footer: {
        height: px(90),
        width: px(750),
    },
    
    footerTxt: {
        fontSize: px(30),
        color: '#fff',
        includeFontPadding: false
    },
    
    emptyList: {
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    }
});

const payerStyles = StyleSheet.create({
    payerItem: {
        backgroundColor: '#fff',
        marginTop: px(24),
        width: px(750),
        paddingLeft: px(24)
    },
    top: {
        height: px(134),
        paddingVertical: px(25),
        alignItems: 'center',
        //justifyContent: 'space-between',
        flexDirection: 'row'
    },
    select: {
        marginRight: px(20),
        width: px(30),
        height: px(20)
    },
    info: {
        height: px(84),
        justifyContent: 'space-between'
    },
    infoTxt: {
        color: '#222'
    },
    name: {
        fontSize: px(32)
    },
    card: {
        fontSize: px(28)
    },
    bottom: {
        height: px(80),
        //marginLeft: px(25),
        borderTopWidth: px(1),
        borderTopColor: '#edeced',
    },
    radio: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    payerOperation: {
        height: px(80),
        flexDirection: 'row',
        alignItems: 'center',
    },
    operation: {
        paddingHorizontal: px(29),
        //width: px(146),
        height: px(80),
        alignItems: 'center',
        flexDirection: 'row'
    },
    bottomTxt: {
        fontSize: px(26),
        color: '#666',
        marginLeft: px(11)
    },
    defaultBox: {
        width: px(48),
        height: px(28),
        borderWidth: px(1),
        borderRadius: px(3),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: px(10),
        overflow: 'hidden'
    },
    defaultBoxTxt: {
        fontSize: px(20)
    }
})