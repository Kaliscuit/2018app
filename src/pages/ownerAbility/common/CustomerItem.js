import React from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback
} from 'react-native'

import { px } from '../../../utils/Ratio'
import { post } from '../../../services/Request'

import { show as toast } from '../../../widgets/Toast'
import { dataFormat } from '../../../utils/dataFormat'


class SkuList extends React.Component {
    constructor(props) {
        super(props);
        this.locationX = 0;
        this.locationY = 0;
    }
    
    render() {
        const items = this.props.items || [];
        const order = this.props.order;
        
        if (items && items.length == 1) {
            let item = items[0];
            return <TouchableWithoutFeedback onPress={() => this.props.clickEvent && this.props.clickEvent()}>
                <View style={[styles.skuItemBase, styles.skuItem]}>
                    <Image style={styles.skuItemImage} source={{ uri: item.prodImg }} />
                    <View style={[styles.skuItemInfo]}>
                        <View>
                            {item.isInBond == 1 &&
                            <View style={[styles.flag, styles.flag1]}>
                                <Text allowFontScaling={false} style={[styles.flagBaoShui]}> 保税 </Text>
                            </View>
                            }
                            {item.isForeignSupply == 2 &&
                            <View style={[styles.flag, styles.flag2]}>
                                <Text allowFontScaling={false} style={[styles.flagZhiYou]}> 直邮 </Text>
                            </View>
                            }
                            <Text allowFontScaling={false}>
                                {item.isInBond == 1 && <Text style={styles.flagLen}>flagLen</Text>}
                                {item.isForeignSupply == 2 && <Text style={styles.flagLen}>flagLen</Text>}
                                <Text allowFontScaling={false} style={styles.skuItemFont}>{item.goodsName}</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.skuItemPrice}>
                        <Text allowFontScaling={false} style={styles.skuItemFont2}>¥{item.prodPrice}</Text>
                        <Text allowFontScaling={false} style={styles.skuItemFontSmall}>x{item.prodQty}</Text>
                        {item.refundQty > 0 &&
                        <Text allowFontScaling={false} style={styles.skuItemFontShow}>已退货:{item.refundQty}</Text>}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        }
        return <View style={styles.skuItemBase}>
            <ScrollView
                horizontal={true}
                onTouchStart={(e) => this.touchStart(e.nativeEvent)}
                onTouchEnd={(e) => this.touchEnd(e.nativeEvent)}>
                {items.map(item =>
                    <View key={item.itemId} style={[styles.skuItem]}>
                        <Image style={styles.skuItemImage} source={{ uri: item.prodImg }} />
                        <View style={styles.skuItemList}>
                            <Text allowFontScaling={false} style={styles.skuItemFont}>¥{item.prodPrice}</Text>
                            <Text allowFontScaling={false} style={styles.skuItemFontSmall}>x{item.prodQty}</Text>
                            {item.refundQty > 0 &&
                            <Text allowFontScaling={false} style={styles.skuItemFontShow}>已退货:{item.refundQty}</Text>}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    }

    touchStart(event) {
        this.locationX = event.locationX;
        this.locationY = event.locationY;
    }

    touchEnd(event) {
        let jl = event.locationX - this.locationX;
        let jt = event.locationY - this.locationY;

        if (jl > -10 && jl < 10 && jt > -10 && jt < 10) {
            this.props.clickEvent && this.props.clickEvent();
        }
    }
}

const styles = StyleSheet.create({
    skuItemBase: {
        backgroundColor: '#fbfafc',
        paddingHorizontal: px(30),
        paddingVertical: px(20),
        alignItems: 'center'
    },
    skuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skuItemImage: {
        backgroundColor: '#fff',
        width: px(120),
        height: px(120),
        borderRadius: px(10)
    },
    skuItemInfo: {
        flex: 1,
        paddingHorizontal: px(30),
        justifyContent: 'center'
    },
    skuItemPrice: {
        alignItems: 'flex-end'
    },
    skuItemFont: {
        fontSize: px(24),
        color: '#666',
        marginBottom: px(10)
    },
    skuItemFont2: {
        fontSize: px(26),
        color: '#666',
        marginBottom: px(10)
    },
    skuItemFontSmall: {
        color: '#999',
        fontSize: px(24),
    },
    skuItemFontShow: {
        marginTop: px(10),
        color: '#d0648f',
        fontSize: px(24),
    },
    skuItemList: {
        marginLeft: px(20),
        marginRight: px(10),
        width: px(130),
        justifyContent: 'center'
    },
    flag: {
        width: px(45),
        height: px(27),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        left: 0,
        ...Platform.select({
            ios: {
                top: px(1),
            },
            android: {
                top: px(5)
            }
        }),
        zIndex: 100,
        borderRadius: px(4),
        overflow: 'hidden'
    },
    flag1: {
        backgroundColor: '#56beec'
    },
    flag2: {
        backgroundColor: '#6cd972'
    },
    flagLen: {
        fontSize: px(17),
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: "center",
        color: '#fbfafc',
    },
    flagBaoShui: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    flagZhiYou: {
        includeFontPadding: false,
        color: '#fff',
        fontSize: px(17)
    },
    expressTip: {
        fontSize: px(24),
        color: '#ed3f58',
        includeFontPadding: false
    }
});

//列表的单项组件
export default class CustomerItem extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            modalStatus: false,
            reason: ''
        }
    }

    goCustomerDetailPage = () => {
        this.props.navigation.navigate('CustomerDetailPage', {
            srNo: this.props.customer.srNo,
            callback: (isChange) => {
                isChange && this.props.reCan(this.props.customer.srNo)
            }
        })
    }

    async agree (srNo) {
        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要退货么？`,
                [{
                    text: '我再想想', onPress: () => resolve(false)
                }, {
                    text: '确认退货', onPress: () => resolve(true)
                }]
            )
        })

        if (!confirm) return

        try {
            await post(`/return/pass.do?srNo=${srNo}`);
            toast('确认退货成功')
            this.props.reCan(this.props.customer.srNo)
        } catch (e) {
            toast(e.message)
        }
    }

    reject = () => {
        this.setState({
            modalStatus: true
        })
    }

    async submit (srNo) {
        try {
            if (this.state.reason == '') return toast('请填写您的拒绝理由')

            await post(`/return/reject.do?srNo=${srNo}&remark=${this.state.reason}`)
            toast('拒绝退货成功')
            this.props.reCan(this.props.customer.srNo)
            this.setState({
                modalStatus: false
            })
        } catch (e) {
            toast(e.message)
        }
    }

    render() {
        const customer = this.props.customer
        const c_items = customer.items.map(item => {
            return {
                prodPrice: item.salesPrice,
                prodQty: item.qty,
                goodsName: item.goodsShowName,
                ...item
            }
        })

        return <View>
            <View style={customerStyles.customer}>
                <TouchableOpacity activeOpacity={0.9} onPress={this.goCustomerDetailPage}>
                    <View style={customerStyles.customerHeader}>
                        <View>
                            <View style={ customerStyles.row }>
                                <Text allowFontScaling={false} style={customerStyles.customerShop}>退货单号 </Text>
                                <Text allowFontScaling={false} style={customerStyles.customerShop}>{ customer.srNo }</Text>
                            </View>
                            <View style={ [customerStyles.row, { marginTop: 3 }] }>
                                <Text allowFontScaling={false} style={customerStyles.customerDate}>申请时间 </Text>
                                <Text allowFontScaling={false} style={customerStyles.customerDate}>{ dataFormat(customer.orderDate, 'YYYY-MM-DD hh:mm:ss') }</Text>
                            </View>
                        </View>
                        <Text allowFontScaling={false} style={customerStyles.customerStatus}>{customer.viewStatusName}</Text>
                    </View>
                </TouchableOpacity>
                <SkuList items={c_items} clickEvent={this.goCustomerDetailPage}  />
                <TouchableOpacity activeOpacity={0.9} onPress={this.goCustomerDetailPage}>
                    <View style={customerStyles.customerFooter}>
                        <Text style={customerStyles.customerTxt} allowFontScaling={false}>{ customer.receiveName }(收件人) { customer.receiveMobile }</Text>
                        <Text style={customerStyles.totalAmount} allowFontScaling={false}>退款金额 <Text style={customerStyles.totalAmountNum}>¥{ customer.goodsAmount }</Text></Text>
                    </View>
                    {
                        customer.status == 1 && <View style={customerStyles.customerBtn}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text onPress={this.reject} style={[customerStyles.cBtn, customerStyles.refuse]}
                                    allowFontScaling={false}>拒绝退货</Text>
                                <Text onPress={() => this.agree(customer.srNo)} style={[customerStyles.cBtn, customerStyles.refuse]}
                                    allowFontScaling={false}>确认退货</Text>
                            </View>
                        </View>
                    }
                </TouchableOpacity>
            </View>
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalStatus}
                onRequestClose={() => {
                }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                    <View style={itemsStyles.modal}>
                        <View style={itemsStyles.modalBox}>
                            <View style={itemsStyles.modalBody}>
                                <View style={itemsStyles.modalHeader}>
                                    <Text style={itemsStyles.modalTitle} allowFontScaling={false}>请输入拒绝理由</Text>
                                </View>
                                <View style={itemsStyles.inpBorder_}>
                                    <View style={itemsStyles.inpBorder}>
                                        <TextInput
                                            underlineColorAndroid="transparent"
                                            keyboardType="default"
                                            multiline
                                            placeholder="请输入拒绝理由"
                                            onChangeText={(text) => this.setState({ reason: text })}
                                            style={itemsStyles.inp}
                                        >
                                        </TextInput>
                                    </View>
                                </View>
                            </View>
                            <View style={itemsStyles.modalFooter}>
                                <View style={itemsStyles.modalFooter_}>
                                    <TouchableOpacity activeOpacity={0.9} style={itemsStyles.modalBtn} onPress={() => {
                                        this.setState({modalStatus:false})
                                    }}>
                                        <Text style={[itemsStyles.cBtn, itemsStyles.cancel]}
                                            allowFontScaling={false}>取消</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.9} style={[itemsStyles.modalBtn, itemsStyles.modalBtn1]} onPress={() => this.submit(customer.srNo)}>
                                        <View style={itemsStyles.modalBtn1_}>
                                            <Text style={[itemsStyles.cBtn, itemsStyles.sure]}
                                                allowFontScaling={false}>确定</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    }

    goDetail (customerNo) {
        this.props.navigation.navigate('OrderDetailPage', {
            customerNo: customerNo,
            type: this.props.type,
            callback: async () => {
                await this.props.reCan()
            }
        })
    }
}

const customerStyles = StyleSheet.create({
    customer: {
        backgroundColor: '#fff',
        marginTop: px(20)
    },
    row: {
        flexDirection: 'row'
    },
    customerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: px(20),
        paddingBottom: px(20),
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    customerShop: {
        fontSize: px(24),
        color: '#000'
    },
    customerDate: {
        fontSize: px(22),
        color: '#999'
    },
    customerStatus: {
        fontSize: px(28),
        color:'#D0648F'
    },
    customerFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        height: px(80),
        paddingLeft: px(30),
        paddingRight: px(30)
    },
    customerTxt: {
        fontSize:px(22),
        color:'#999'
    },
    totalAmount: {
        fontSize:px(23),
        color:'#252426'
    },
    totalAmountNum: {
        fontSize:px(26),
        fontWeight: 'bold'
    },
    customerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#fff',
        height: px(80),
        paddingLeft: px(30),
        paddingRight: px(30),
        borderTopColor: '#f6f5f7',
        borderTopWidth: 1
    },
    emptyList: {
        flex: 1,
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858385'
    },
    cBtn: {
        fontSize: px(24),
        height: px(48),
        borderWidth: px(1),
        marginLeft: px(14),
        width: px(128),
        borderRadius: px(6),
        overflow: 'hidden',
        textAlign: 'center',
        paddingTop: px(11)
    },
    refuse: {
        color: '#252426',
        borderColor: '#b2b3b5'
    },
    sure: {
        color: '#d0648f',
        backgroundColor: '#fff',
        borderColor: '#d0648f'
    }
})

const itemsStyles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBox: {
        backgroundColor: '#f3f3f3',
        //padding: px(20),
        borderRadius: px(25),
        overflow:'hidden',
        width: px(540),
        height:px(390)
    },
    modalBody: {
        flex:1,
        alignItems:'center'
    },
    modalHeader: {
        height:px(112),
        justifyContent:'center'
    },
    modalTitle: {
        fontSize:px(34),
        color:'#000'
    },
    modalFooter: {
        height:px(89),
        width: px(540),
        borderTopWidth:px(1),
        borderTopColor:'#d4d5d7',

    },
    modalFooter_: {
        height:px(89),
        width: px(540),
        backgroundColor:'#f3f3f3',
        flexDirection:'row'
    },
    modalBtn: {
        flex:1,
        height:px(89),
        alignItems:'center',
        justifyContent:'center'
    },
    modalBtn1: {
        borderLeftWidth:px(1),
        borderLeftColor:'#d4d5d7'
    },
    modalBtn1_: {
        width:px(270),
        height:px(89),
        backgroundColor:'#f3f3f3',
        alignItems:'center',
        justifyContent:'center'
    },
    cBtn: {
        fontSize:px(34),
        fontWeight:'800',
        justifyContent:'center',
        alignItems:'center'
    },
    cancel: {
        color:'#252426'
    },
    sure: {
        color:'#d0648f'
    },
    inp: {
        paddingHorizontal: 0,
        paddingVertical: px(15),
        lineHeight: px(60),
        fontSize: px(28),
        marginLeft: px(20),
        backgroundColor:'#f3f3f3'
    },
    inpBorder: {
        height:px(168),
        width:px(474),

        backgroundColor:'#f3f3f3'
    },
    inpBorder_:{
        borderWidth:px(1),
        borderColor:'#b2b3b5'
    }
})