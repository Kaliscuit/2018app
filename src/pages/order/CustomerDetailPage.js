'use strict';

import React from 'react';

import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    Modal,
    Alert,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    PixelRatio
} from 'react-native';
import { px } from '../../utils/Ratio';
import { get, post } from '../../services/Request';

import { show as toast } from '../../widgets/Toast';
import { OldHeader } from '../common/Header'
import { log } from '../../utils/logs'
import Loading from '../../animation/Loading'
import { config } from '../../services/Constant';
import Base from '../../styles/Base'
import { ImgsModal } from '../common/ModalView'
import { GoodsCardView } from '../common/returns/Index'
import {ImagesRes} from "../../utils/ContentProvider";
import Icon from '../../UI/lib/Icon'


const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class extends React.Component {
    
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            customer: {},
            srNo: this.props.navigation.state.params.srNo,
            modalStatus: false,
            reason: '',
            lines: [],
            images: [],
            isChange: false
        }
    }
    
    render() {
        const {customer, lines, images} = this.state
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <OldHeader navigation={this.props.navigation}
                isNeedLookBorder
                style={{
                    backgroundColor: "#fff",
                }}
                titleStyle={{
                    color: "#000"
                }}
                title="退货/售后"
                leftBtn={
                    <TouchableOpacity style={styles.back} onPress={() => {
                        this.props.navigation.state.params.callback(this.state.isChange);
                        this.props.navigation.goBack()
                    }}>
                        <Icon name="icon_back"
                            style={{ width: px(44), height: px(44) }} />
                    </TouchableOpacity>
                }
                rightBtn={
                    <Text
                        style={{ color: '#858385', width: px(140) }}
                        onPress={() => this.goHelp()}>
                               退货帮助
                    </Text>
                }/>
            <ScrollView style={{ flex: 1 }}>
                <View style={[styles.head, styles.common, Base.inline_between]}>
                    <View>
                        <Text style={{fontSize:px(26), color:'#252426', marginBottom:px(9)}}
                            allowFontScaling={false}>{customer.refundStatusTitle}</Text>
                        <Text style={{fontSize:px(24), color:'#858385', marginBottom:px(9)}}
                            allowFontScaling={false}>{customer.refundStatusSub}</Text>
                        <Text style={{fontSize:px(20), color:'#858385'}}
                            allowFontScaling={false}>{customer.refundStatusTime}</Text>
                    </View>
                    <TouchableOpacity style={styles.headBtn} onPress={() => {
                        this.props.navigation.navigate('ProgressTrack', {
                            srNo: this.state.srNo
                        })
                    }}>
                        <Text style={styles.goReturnProcess}
                            allowFontScaling={false}>进度详情</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.good, styles.common]}>
                    <GoodsCardView list={lines}  />
                </View>
                <View style={[styles.returnGood, styles.common]}>
                    <View style={[styles.returnHead, Base.inline_between]}>
                        <Text style={{fontSize:px(26), color:'#252426'}}
                            allowFontScaling={false}>退货理由</Text>
                        <Text style={{fontSize:px(26), color:'#858385'}}
                            allowFontScaling={false}>{customer.reason}</Text>
                    </View>
                    <View>
                        <Text style={{fontSize:px(26), color:'#252426'}}
                            allowFontScaling={false}>{customer.return_desc}</Text>
                        {
                            this.state.customer.imgShowYn == 'Y' && this.state.customer.images != '' &&
                            <View style={styles.imageContain}>
                                {
                                    this.state.customer.images.split(',').map((item, index) => 
                                        <TouchableOpacity onPress={() => this.openBigImg(item)} key={index}>
                                            <Image source={{ uri: item }}
                                                style={{ width: px(157), height: px(157), marginRight:px(20)}} />
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                        }
                    </View>
                </View>
                {
                    (customer.moneyGroupList || []).map((item, index) =>
                        <View key={index} style={[styles.pay, styles.common]}>
                            <View style={[styles.total, Base.inline_between, styles.session]}>
                                <Text style={styles.label}
                                    allowFontScaling={false}>{item.group_name}</Text>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <Text style={styles.otherPrice}
                                        allowFontScaling={false}>{item.totalTxt}</Text>
                                    <Text style={styles.totalPrice}
                                        allowFontScaling={false}>{item.totalMoney}</Text>
                                </View>
                            </View>
                            {
                                item.fee_list.map(k =>
                                    <View key={k.code} style={[styles.other, Base.inline_between, styles.session]}>
                                        <Text style={styles.label}
                                            allowFontScaling={false}>{k.txt}</Text>
                                        <Text style={styles.otherPrice}
                                            allowFontScaling={false}>{k.money}</Text>
                                    </View>
                                )
                            }
                        </View>
                    )
                }
            </ScrollView>
            {
                this.state.customer.appoved && <View style={styles.footer}>
                    <View style={[styles.foot, Base.inline_between]}>
                        <View>
                            <Text style={[styles.footTxt1]}
                                allowFontScaling={false}>佣金：￥108.00</Text>
                            <Text style={[styles.footTxt2]}
                                allowFontScaling={false}>退款不结算</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text onPress={this.reject} style={[styles.cBtn, styles.refuse]}
                                allowFontScaling={false}>拒绝退货</Text>
                            <Text onPress={this.agree(this.state.srNo)} style={[styles.cBtn, styles.sure]}
                                allowFontScaling={false}>确认退货</Text>
                        </View>
                    </View>
                </View>
            }
            
            <Loading ref='loading' />
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalStatus}
                onRequestClose={() => {
                }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                    <View style={mStyles.modal}>
                        <View style={mStyles.modalBox}>
                            <View style={mStyles.modalBody}>
                                <View style={mStyles.modalHeader}>
                                    <Text style={mStyles.modalTitle} allowFontScaling={false}>请输入拒绝理由</Text>
                                </View>
                                <View style={mStyles.inpBorder_}>
                                    <View style={mStyles.inpBorder}>
                                        <TextInput
                                            underlineColorAndroid="transparent"
                                            keyboardType="default"
                                            multiline
                                            placeholder="请输入拒绝理由"
                                            onChangeText={(text) => this.setState({ reason: text })}
                                            style={mStyles.inp}
                                        >
                                        </TextInput>
                                    </View>
                                </View>
                            </View>
                            <View style={mStyles.modalFooter}>
                                <View style={mStyles.modalFooter_}>
                                    <TouchableOpacity activeOpacity={0.9} style={mStyles.modalBtn} onPress={() => {
                                        this.setState({modalStatus:false})
                                    }}>
                                        <Text style={[mStyles.cBtn, mStyles.cancel]}
                                            allowFontScaling={false}>取消</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.9} style={[mStyles.modalBtn, mStyles.modalBtn1]} onPress={this.submit(customer.srNo)}>
                                        <View style={mStyles.modalBtn1_}>
                                            <Text style={[mStyles.cBtn, mStyles.sure]}
                                                allowFontScaling={false}>确定</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <ImgsModal ref='imgs' list={images}></ImgsModal>
        </View>
    }
    
    async componentDidMount() {
        await this.getDetail()
    }
    
    getDetail = async () => {
        try {
            let customer = await get(`/return/view.do?type=1&srNo=${this.state.srNo}`);
            
            let c_items = [];
            customer.lines.forEach(item => {
                c_items.push({
                    prodPrice:item.salePrice,
                    prodQty: item.qty,
                    prodImg: item.goodsImage
                    , ...item})
        
            })
            let s = []
            if (customer.images == '') {
                s = []
            } else {
                customer.images.split(',').forEach(item => {
                    s.push({
                        image: item,
                        width: px(700),
                        height: px(700)
                    })
                })
            }
            this.setState({
                customer: customer,
                lines: c_items,
                images: s
            });
        } catch (e) {
            log("findSaleOrderDetail", e.message)
        }
    }
    
    async goHelp() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '退货帮助',
            src: cfg.images['return_img']
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
            this.setState({
                isChange: true
            })
        } catch (e) {
            toast(e.message)
        }
        await this.getDetail()
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
            await this.getDetail()
            this.setState({
                modalStatus: false,
                isChange: true
            })
        } catch (e) {
            toast(e.message)
        }
    }
    
    openBigImg(key) {
        this.refs.imgs.Open(key);
    }
}

const styles = StyleSheet.create({
    common: {
        backgroundColor: '#fff',
        marginBottom:px(20)
    },
    head: {
        height: px(145),
        paddingLeft:px(30),
        paddingRight:px(30)
    },
    headBtn: {
        width:px(158),
        height:px(52),
        borderRadius:px(26),
        borderWidth:px(1),
        borderColor:'#b2b3b5',
        justifyContent:'center',
        alignItems:'center'
    },
    goReturnProcess: {
        fontSize:px(24),
        color:'#515151'
    },
    good: {
        height:px(190)
    },
    returnGood: {
        //height:px(425),
        paddingLeft:px(30),
        paddingRight:px(30),
        paddingBottom:px(30)
    },
    returnHead: {
        height:px(79),
        width:px(690),
        borderBottomColor:'#efefef',
        borderBottomWidth:px(1),
        marginBottom:px(23)
    },
    imageContain: {
        flexDirection:'row',
        marginTop:px(50)
    },
    pay: {
    
    },
    total: {
        paddingLeft:px(30),
        paddingRight:px(30)
    },
    other: {
        width:px(690),
        marginLeft:px(30)
    },
    session: {
        height:px(79),
        borderBottomColor:'#efefef',
        borderBottomWidth:px(1)
    },
    label: {
        color:'#252426',
        fontSize:px(26)
    },
    totalPrice: {
        color:'#d0648f',
        fontSize:px(30)
    },
    otherPrice: {
        color:'#858385',
        fontSize:px(26)
    },
    foot: {
        height: px(98),
        backgroundColor: '#fff',
        paddingLeft:px(30),
        paddingRight:px(30)
    },
    footer:{
        borderTopColor: '#efefef',
        borderTopWidth: px(1),
    },
    footTxt1: {
        fontSize:px(28),
        color:'#fff',
        marginBottom:px(5)
    },
    footTxt2: {
        fontSize:px(20),
        color:'#fff'
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
const mStyles = StyleSheet.create({
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

