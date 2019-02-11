'use strict';

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';


import { px } from '../../utils/Ratio';
import { get, post } from '../../services/Request'
import { SkuList } from './OrderItems';
import { show as toast } from '../../widgets/Toast';
import T from '../common/TabsTest'
import { TopHeader } from '../common/Header'
import { log, logErr, logWarm } from '../../utils/logs'
import Loading from '../../animation/Loading'
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view2'
const PAGE_SIZE = 30;

//列表的单项组件
class CustomerItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalStatus: false,
            reason: ''
        };
    }

    componentDidMount() {

    }

    goCustomerDetailPage = () => {
        this.props.navigation.navigate('CustomerDetailPage', {
            srNo: this.props.customer.srNo,
            callback: (isChange) => {
                isChange && this.props.reCan(this.props.customer.srNo)
            }
        });
    }

    agree = (srNo) => async () => {
        let confirm = await new Promise((resolve) => {
            Alert.alert('', `确定要退货么？`,
                [{
                    text: '我再想想', onPress: () => resolve(false)
                }, {
                    text: '确认退货', onPress: () => resolve(true)
                }]
            )
        });
        if (!confirm) {
            return;
        }
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

    submit = (srNo) => async () => {
        try {
            if (this.state.reason == '') {
                return toast('请填写您的拒绝理由')
            }
            await post(`/return/reject.do?srNo=${srNo}&remark=${this.state.reason}`);
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
        const customer = this.props.customer;
        let c_items = []

        customer.items.map(item => {
            c_items.push({
                prodPrice:item.salesPrice,
                prodQty: item.qty
                , ...item})

        })
        return <View>
            <View style={customerStyles.customer}>
                <TouchableOpacity activeOpacity={0.9} onPress={this.goCustomerDetailPage}>
                    <View style={customerStyles.customerHeader}>
                        <Text allowFontScaling={false} style={customerStyles.customerShop}>{customer.userName} </Text>
                        <Text allowFontScaling={false} style={customerStyles.customerStatus}>{customer.viewStatusName}</Text>
                    </View>
                </TouchableOpacity>
                <SkuList items={c_items} clickEvent={this.goCustomerDetailPage}  />
                <TouchableOpacity activeOpacity={0.9} onPress={this.goCustomerDetailPage}>
                    <View style={customerStyles.customerFooter}>
                        <View>
                            <Text style={customerStyles.customerTxt} allowFontScaling={false}>退货原因：{customer.reason_code}</Text>
                        </View>
                        {
                            this.props.index == 0 && <View style={{ flexDirection: 'row' }}>
                                <Text onPress={this.reject} style={[customerStyles.cBtn, customerStyles.refuse]}
                                    allowFontScaling={false}>拒绝退货</Text>
                                <Text onPress={this.agree(customer.srNo)} style={[customerStyles.cBtn, customerStyles.sure]}
                                    allowFontScaling={false}>确认退货</Text>
                            </View>
                        }
                    </View>
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
                    <View style={styles.modal}>
                        <View style={styles.modalBox}>
                            <View style={styles.modalBody}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle} allowFontScaling={false}>请输入拒绝理由</Text>
                                </View>
                                <View style={styles.inpBorder_}>
                                    <View style={styles.inpBorder}>
                                        <TextInput
                                            underlineColorAndroid="transparent"
                                            keyboardType="default"
                                            multiline
                                            placeholder="请输入拒绝理由"
                                            onChangeText={(text) => this.setState({ reason: text })}
                                            style={styles.inp}
                                        >
                                        </TextInput>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.modalFooter}>
                                <View style={styles.modalFooter_}>
                                    <TouchableOpacity activeOpacity={0.9} style={styles.modalBtn} onPress={() => {
                                        this.setState({modalStatus:false})
                                    }}>
                                        <Text style={[styles.cBtn, styles.cancel]}
                                            allowFontScaling={false}>取消</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.9} style={[styles.modalBtn, styles.modalBtn1]} onPress={this.submit(customer.srNo)}>
                                        <View style={styles.modalBtn1_}>
                                            <Text style={[styles.cBtn, styles.sure]}
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

    goDetail = (customerNo) => {
        this.props.navigation.navigate('OrderDetailPage', {
            customerNo: customerNo,
            type: this.props.type,
            callback: async () => {
                await this.props.reCan()
            }
        });
    }


}

//列表组件
class CustomerList extends React.Component {


    render() {
        return (
            <View style={{ flex: 1, width: px(750) }}>
                <FlatList
                    //style={{ flex: 1, width: px(750) }}
                    data={this.props.list || []}
                    refreshing={this.props.refreshing}
                    onRefresh={() => this.props.refresh(this.props.index)}
                    keyExtractor={(item) => item.srNo}
                    renderItem={({ item }) =>
                        <CustomerItem customer={item}
                            navigation={this.props.navigation}
                            index={this.props.index}
                            reCan={this.props.reCan.bind(null, item.srNo)}
                        />
                    }
                    onEndReached={() => this.props.next(this.props.index)}
                    ListEmptyComponent={
                        this.props.list && <Text allowFontScaling={false} style={customerStyles.emptyList}>暂无数据</Text>
                    }
                />
            </View>
        )
    }

    async componentDidMount() {

    }


}

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            list:[]
        };
        this.hasNext = true;
        this.nextPage = 1;
    }


    async componentDidMount() {
        this.refs.loading.open()
        await this.refresh(0);
    }
    async refresh(index) {
        this.hasNext = true;
        this.nextPage = 1;
        /*this.setState({
            refreshing: true
        });*/
        let list = await this.load(index);
        this.refs.loading.close()
        this.setState({
            list: list,
            refreshing: false
        });
    }

    async next(index) {
        let list = await this.load(index);
        this.setState({
            list: this.state.list.concat(list)
        });
    }

     load = async(index) => {
         if (!this.hasNext || this.loading) {
             return [];
         }

         this.loading = true;
         
         try {
             let res = []
             if (index == 0){
                 res = await get(`/return/shop_return_pending.do?page=${this.nextPage}`);
             } else if (index == 1){
                 res = await get(`/return/shop_return_processed.do?page=${this.nextPage}`);
             }
             this.nextPage = this.nextPage + 1;
             this.hasNext = (res.list || []).length == PAGE_SIZE;
             return res.list || [];
         } catch (e) {
             return [];
         } finally {
             this.loading = false;
         }
     }


    onChangeTab = async({i, ref, from}) => {
        this.refresh(i)
    }
    //重刷列表操作
    reCan = async (customerNo) => {
        const {list} = this.state
        list.forEach((item, index) => {
            if (customerNo == item.srNo){
                list.splice(index, 1)
                return
            }
        })
        this.setState({
            list:list
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TopHeader navigation={this.props.navigation} title={'退货/售后'}/>
                <ScrollableTabView
                    locked
                    onChangeTab={this.onChangeTab}
                    initialPage={0}
                    tabBarUnderlineStyle={{ backgroundColor: '#d0648f', height: px(4) }}
                    renderTabBar={() => <T
                        paddingValue={150}
                        borderColor={'#d0648f'}
                        color={'#858385'}
                        activeColor={"#d0648f"}
                        tabs={['待处理', '已处理']}
                    />}
                >
                    {
                        ['待处理', '已处理'].map((item, index) =>
                            <View tabLabel={item} key={index} style={{flex:1}}>
                                {
                                    <CustomerList
                                        index={index}
                                        list={this.state.list}
                                        refreshing={this.state.refreshing}
                                        next={() => this.next(index)}
                                        refresh={() => this.refresh(index)}
                                        reCan={this.reCan.bind(this)}
                                        navigation={this.props.navigation}/>

                                }
                            </View>
                        )
                    }
                </ScrollableTabView>
                <Loading ref='loading' />
            </View>
        )
    }

}

const customerStyles = StyleSheet.create({
    customer: {
        backgroundColor: '#fff',
        marginTop: px(20)
    },
    customerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: px(20),
        paddingBottom: px(20),
        paddingLeft: px(30),
        paddingRight: px(30),
        /* borderBottomWidth: px(1),
        borderColor: '#efefef'*/
    },
    customerShop: {
        fontSize: px(28),
        color: '#252426'
    },
    customerStatus: {
        fontSize: px(28),
        color:'#d0648f'
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
        fontSize:px(24),
        color:'#858385'
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
});

const styles = StyleSheet.create({
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
        //height:px(89),
        //flex:1,
        fontSize:px(34),
        fontWeight:'800',
        justifyContent:'center',
        alignItems:'center',
        // textAlign:'center',
        //paddingTop:px()
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
        borderColor:'#b2b3b5',
    }
});
