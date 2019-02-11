import React, {Component} from 'react';
import {View, Text, Image, TextInput, Platform, StyleSheet, Keyboard, TouchableOpacity} from 'react-native';
import Picker, {PickerExpress} from './Picker';
// import BarCode from './BarCode';
import {px} from '../../../utils/Ratio';
import tools from '../../../utils/tools';
import Icon from '../../../UI/lib/Icon'

export class Steps extends Component {
    constructor(props) {
        super(props);
    }

    stepPro(activeId, id, a, b, c) {
        let next = parseInt(activeId);
        let prev = parseInt(id);
        if (next == prev) {
            return a
        } else if (next > prev) {
            return b
        } else {
            return c
        }
    }

    getStepIcon(activeId, id) {
        let activedIcon = activeId == '10' || activeId == '32' ? require('../../../images/icon-step-error') : require('../../../images/icon-selector');
        return this.stepPro(activeId, id, activedIcon, require('../../../images/icon-nodes-active'), require('../../../images/icon-nodes'))
    }

    getStepLineState(activeId, id) {
        return this.stepPro(activeId, id, false, true, false);
    }

    getStepTextState(activeId, id) {
        return this.stepPro(activeId, id, true, true, false);
    }

    render() {
        let {steps, step} = this.props;
        return <View style={styles.stepList}>
            {steps && steps.map((item, index) => <View key={index} style={styles.stepItem}>
                <Image style={item.id == step ? styles.stepIconActive : styles.stepIcon}
                    source={{uri: this.getStepIcon(step, item.id)}}></Image>
                {index != steps.length - 1 &&
                <View style={[this.getStepLineState(step, item.id) ? styles.stepLineActive : styles.stepLine]}/>}
                <Text allowFontScaling={false} style={this.getStepTextState(step, item.id) ? styles.stepTitleActive : styles.stepTitle}>
                    {item.name}
                </Text>
            </View>)}
        </View>
    }
}


const GoodsCard = ({goods}) => <View style={styles.goodsCard}>
    <Image style={styles.goodsImg} source={{uri: goods.prodImg}}></Image>
    <View style={styles.goodsInfo}>
        <Text allowFontScaling={false} style={styles.goodsTitle} numberOfLines={2}>
            {goods.goodsName}
        </Text>
    </View>
    <View style={styles.goodsStatus}>
        <Text allowFontScaling={false} style={styles.goodsPrice}>￥{goods.prodPrice}</Text>
        <Text allowFontScaling={false} style={styles.goodsNum}>x{goods.prodQty}</Text>
    </View>
</View>

export const GoodsCardView = ({list}) => <View style={{backgroundColor: '#fff'}}>
    {
        list && list.map((goods, index) => <View key={index} style={styles.goodsCard}>
            <Image style={styles.goodsImg} source={{uri: goods.goodsImage}}></Image>
            <View style={styles.goodsInfo}>
                <Text allowFontScaling={false} style={styles.goodsTitle} numberOfLines={2}>
                    {goods.goodsName}
                </Text>
            </View>
            <View style={styles.goodsStatus}>
                <Text allowFontScaling={false} style={styles.goodsPrice}>￥{goods.salePrice}</Text>
                <Text allowFontScaling={false} style={styles.goodsQh}>退货数量{goods.qty}件</Text>
            </View>
        </View>)
    }
</View>

class GoodsBar extends Component {

    math(type) {
        let num = parseInt(this.state.num || 1);
        if (type == 'plus') {
            num = num + 1;

        } else if (type == 'reduce') {
            num = num - 1;
        }
        this.setState({
            num: String(num || 1)
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            num: '1'
        }
    }

    render() {
        let max = parseInt(this.props.max || 1);
        let num = parseInt(this.state.num);

        return <View style={styles.goodsBarCard}>
            <Text allowFontScaling={false} style={styles.goodsBarTitle}>退货数量</Text>
            <View style={styles.goodsBarTools}>
                {num == 1 ?
                    <TouchableOpacity>
                        <View style={styles.goodsBarReduce}>
                            <Text allowFontScaling={false} style={[styles.goodsBarBtn, {color: '#b2b3b5'}]}>-</Text>
                        </View>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => this.math('reduce')}>
                        <View style={styles.goodsBarReduce}>
                            <Text allowFontScaling={false} style={styles.goodsBarBtn}>-</Text>
                        </View>
                    </TouchableOpacity>
                }
                <View style={styles.goodsBarInput}>
                    {false && <TextInput allowFontScaling={false}
                        defaultValue={this.state.num}
                        keyboardType="numeric"
                        onChangeText={(v) => {}}
                        underlineColorAndroid="transparent">
                    </TextInput>}
                    <Text allowFontScaling={false} style={styles.goodsBarText}>{this.state.num}</Text>
                </View>
                {num >= max ?
                    <TouchableOpacity>
                        <View style={styles.goodsBarPlus}>
                            <Text allowFontScaling={false} style={[styles.goodsBarBtn, {color: '#b2b3b5'}]}>+</Text>
                        </View>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => this.math('plus')}>
                        <View style={styles.goodsBarPlus}>
                            <Text allowFontScaling={false} style={styles.goodsBarBtn}>+</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        </View>
    }

    getNum() {
        return this.state.num;
    }
}


export class Goods extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {goods} = this.props;
        if (!goods) return null;
        let r = goods.refundQty || 0;
        return <View style={styles.goodsContainer}>
            {
                goods && <GoodsCard goods={goods}/>
            }
            {
                goods && <GoodsBar ref="goodsBar" max={(goods.prodQty - r)}/>
            }
        </View>
    }

    getNum() {
        let bar = this.refs['goodsBar'];
        if (bar) {
            return bar.getNum();
        } else {
            return 0;
        }
    }
}


export class ReasonCard extends Component {

    open() {
        this.refs['picker'].open();
    }

    constructor(props) {
        super(props);
        let {text, desc} = this.props;
        this.text = text;
        this.desc = desc;
        this.state = {
            reason: text || '请选择',
            desc: desc || ''
        }
    }
    render() {
        let {type, list} = this.props;
        this.type = type || '0';
        this.list = list;
        return <View style={styles.goodsContainer}>
            <View style={styles.reason}>
                <Text allowFontScaling={false} style={styles.goodsBarTitle}>退货理由</Text>
                {
                    this.type == '0' ?
                        <TouchableOpacity onPress={() => this.open()}>
                            <View style={styles.reasonSelect}>
                                <Text allowFontScaling={false} style={styles.reasonText}>{this.state.reason}</Text>
                                <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                            </View>
                        </TouchableOpacity>
                        :
                        <View style={styles.reasonSelect}>
                            <Text allowFontScaling={false} style={styles.reasonText}>{this.state.reason}</Text>
                        </View>
                }
            </View>
            <View style={styles.editorContainer}>
                <TextInput
                    allowFontScaling={false}
                    defaultValue={this.state.desc}
                    style={styles.editor}
                    multiline={true}
                    editable={this.type == '0'}
                    placeholderTextColor='#858385'
                    onChangeText={(v) => this.setState({desc: v})}
                    placeholder={this.type == '0' ? '请填写问题描述' : ''}
                    underlineColorAndroid="transparent">
                </TextInput>
            </View>
            {this.type == '0' && this.list && <Picker ref="picker" list={this.list} select={(index, item) => this.select(index, item)}/>}
        </View>
    }

    select(index, item) {
        this.reason = item;
        this.setState({
            reason: item.name
        })
    }

    getReason() {
        return this.reason;
    }

    getRemark() {
        return this.state.desc;
    }

}

const OrderHead = ({item}) => <View style={styles.orderHdr}>
    <Text allowFontScaling={false} style={styles.goodsBarTitle}>{`${item.group_name}`}</Text>
    <Text allowFontScaling={false} style={styles.orderHeadText}>{`${item.totalTxt ? item.totalTxt : ''}${item.totalMoney}`}</Text>
</View>

const OrderItem = ({item}) => <View style={styles.orderItem}>
    <Text allowFontScaling={false} style={styles.goodsBarTitle}>{item.txt}</Text>
    <Text allowFontScaling={false} style={styles.orderItemText}>{item.money}</Text>
</View>


export class OrderCard extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        let orderCard = this.props.list || {};
        let list = orderCard.fee_list || [];
        return <View style={{backgroundColor: '#fff'}}>
            <OrderHead item={orderCard}/>
            {
                list && list.map((item, index) => <OrderItem key={index} item={item}/>)
            }
        </View>
    }
}

export class ReturnDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            packing: 0,
            enclosure: 0,
            good: 0,
        }
    }

    click(key, val) {
        if (this.props.mode == 1) return
        let obj = {}
        obj[key] = val
        this.setState(obj)
    }

    getDetailInfo() {
        return this.state
    }

    render() {
        let good = this.props.good ? this.props.good == 'Y' ? -1 : 1 : 0
        let enclosure = this.props.enclosure ? this.props.enclosure == 'Y' ? 1 : -1 : 0
        let packing = this.props.packing ? this.props.packing == 'Y' ? 1 : -1 : 0

        return <View style={styles.returnDetail}>
            <View style={styles.detailItem}>
                <Text allowFontScaling={false} style={styles.itemField}>包装</Text>
                <View style={styles.itemSection}>
                    <TouchableOpacity onPress={() => this.click('packing', -1)}>
                        <View style={[styles.itemVal, this.state.packing < 0 || packing < 0 ? styles.itemValActive : {}]}>
                            <Text allowFontScaling={false} style={[styles.val, this.state.packing < 0 || packing < 0 ? styles.valActive : {}]}>破损</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.click('packing', 1)}>
                        <View style={[styles.itemVal, this.state.packing > 0 || packing > 0 ? styles.itemValActive : {}]}>
                            <Text allowFontScaling={false} style={[styles.val, this.state.packing > 0 || packing > 0 ? styles.valActive : {}]}>完好</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.detailItem, styles.detailCenter]}>
                <Text allowFontScaling={false} style={styles.itemField}>附件</Text>
                <View style={styles.itemSection}>
                    <TouchableOpacity onPress={() => this.click('enclosure', -1)}>
                        <View style={[styles.itemVal, this.state.enclosure < 0 || enclosure < 0 ? styles.itemValActive : {}]}>
                            <Text allowFontScaling={false} style={[styles.val, this.state.enclosure < 0 || enclosure < 0 ? styles.valActive : {}]}>破损</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.click('enclosure', 1)}>
                        <View style={[styles.itemVal, this.state.enclosure > 0 || enclosure > 0 ? styles.itemValActive : {}]}>
                            <Text allowFontScaling={false} style={[styles.val, this.state.enclosure > 0 || enclosure > 0 ? styles.valActive : {}]}>完好</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.detailItem}>
                <Text allowFontScaling={false} style={styles.itemField}>商品</Text>
                <View style={styles.itemSection}>
                    <TouchableOpacity onPress={() => this.click('good', -1)}>
                        <View style={[styles.itemVal, this.state.good < 0 || good < 0 ? styles.itemValActive : {}]}>
                            <Text allowFontScaling={false} style={[styles.val, this.state.good < 0 || good < 0 ? styles.valActive : {}]}>已使用</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.click('good', 1)}>
                        <View style={[styles.itemVal, this.state.good > 0 || good > 0 ? styles.itemValActive : {}]}>
                            <Text allowFontScaling={false} style={[styles.val, this.state.good > 0 || good > 0 ? styles.valActive : {}]}>未使用</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }
}

export class HelperCard extends Component {

    constructor(props) {
        super(props);
    }
    render() {
        return <View style={styles.helpCard}>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text allowFontScaling={false} style={styles.phoneField}>如有其它疑问请拨打客服电话：</Text>
                <TouchableOpacity onPress={() => tools.toCall('400-005-5566')}>
                    <View>
                        <Text allowFontScaling={false} style={styles.phoneValue}>400-005-5566</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <Text allowFontScaling={false} style={styles.serviceDate}>服务时间：周一到周日 09:00-21:00</Text>
        </View>
    }
}

export const ButtonCard = ({title, enabled, submit}) => <TouchableOpacity onPress={() => submit && submit()}>
    <View style={[styles.buttonCard, enabled ? {} : {backgroundColor: '#b2b3b5'}]}>
        <Text allowFontScaling={false} style={[styles.buttonCardText]}>{title}</Text>
    </View>
</TouchableOpacity>

export const ButtonGroupCard = ({leftBtn, rightBtn}) => <View style={styles.buttonGroup}>
    <TouchableOpacity onPress={() => leftBtn.submit && leftBtn.submit()}>
        <View style={[styles.buttonGroupCard, leftBtn.enabled ? {} : {backgroundColor: '#b2b3b5'}]}>
            <Text allowFontScaling={false} style={[styles.buttonCardText]}>{leftBtn.title}</Text>
        </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => rightBtn.submit && rightBtn.submit()}>
        <View style={[styles.buttonGroupCard, rightBtn.enabled ? {} : {backgroundColor: '#b2b3b5'}]}>
            <Text allowFontScaling={false} style={[styles.buttonCardText]}>{rightBtn.title}</Text>
        </View>
    </TouchableOpacity>
</View>

export class CancelCard extends Component {
    constructor(props){
        super(props);
    }
    goDetail() {
        let srNo = this.props.srNo;
        this.props.navigation.navigate('ProgressTrack', {
            srNo: srNo,
            isWeCatHistory: this.props.isWeCatHistory
        });
    }
    render() {
        let {refundStatusTitle, refundStatusSub, refundStatusTime} = this.props;
        return <View style={{backgroundColor: '#fff'}}>
            <View style={styles.cancelCard}>
                <View style={styles.cancelContent}>
                    <Text allowFontScaling={false} style={styles.cancelFont1}>{refundStatusTitle}</Text>
                    <Text allowFontScaling={false} style={styles.cancelFont2}>{refundStatusSub}</Text>
                    <Text allowFontScaling={false} style={styles.cancelFont3}>{refundStatusTime}</Text>
                </View>
                <TouchableOpacity onPress={() => this.goDetail()}>
                    <View style={styles.cancelBtn}>
                        <Text allowFontScaling={false} style={styles.cancelBtnText}>进度详情</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    }
}

export const Refuse = ({text}) => <View style={{backgroundColor: '#fff'}}>
    <View style={styles.refuseTitle}>
        <Text allowFontScaling={false} style={{fontSize: px(26), color: '#252426'}}>拒绝理由</Text>
    </View>
    <View style={styles.refuseText}>
        <Text allowFontScaling={false} style={{fontSize: px(24), color: '#252426'}}>{text}</Text>
    </View>
</View>

export const Tip = ({list, title}) => <View style={styles.tipCard}>
    <View style={styles.tipTitle}>
        <Text allowFontScaling={false} style={{fontSize: px(26), color: '#252426'}}>{title}</Text>
    </View>
    {
        list && list.map((item, index) => <View key={index} style={styles.tipItem}>
            <Text allowFontScaling={false} style={{fontSize: px(26), color: '#858385', paddingRight: px(20)}}>{item.title}</Text>
            <View style={{flex: 1}}>
                {
                    item.txt ? item.txt.split('\\n').map((ite, index) => {
                        return <Text key={index} allowFontScaling={false} style={{fontSize: px(26), color: '#252426', flex: 1}}>{ite}</Text>
                    }) : null
                }
            </View>
        </View>)
    }
    <View style={{ marginTop: px(40), flexDirection: 'row', width: px(254 * 3) }}>
        {[...Array(3)].map((i, idx) =>
            <Icon key={idx} name="bg-address-line" style={{ width: px(254), height: px(4) }} resizeMode='contain' />
        )}
    </View>
</View>


const expressCodeText = '填写物流单号';
export class ExpressInfo extends Component {

    open() {
        let e = this.refs['pickerExpress'];
        if (e) {
            e.open();
        }
    }

    openCode() {
        // let e = this.refs['barCode'];
        // if (e) {
        //     e.open();
        // }
    }

    select(index, item) {
        this.express = item;
        this.setState({
            expressText: item.name
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            expressText: this.props.text || '快递公司',
            expressCode: this.props.code
        }
    }

    render() {
        this.list = this.props.list;
        this.type = this.props.type;
        return <View style={styles.goodsContainer}>
            <View style={styles.tipTitle}>
                <Text allowFontScaling={false} style={{fontSize: px(26), color: '#252426'}}>寄回物流信息</Text>
            </View>
            <TouchableOpacity onPress={() => this.open()}>
                <View style={styles.reason}>
                    <Text allowFontScaling={false} style={styles.goodsBarTitle}>{this.state.expressText}</Text>
                    <View style={styles.reasonSelect}>
                        <Icon name="icon-arrow" style={{ width: px(15), height: px(26) }} />
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
                <View style={styles.reason}>
                    <TextInput
                        allowFontScaling={false}
                        defaultValue={this.state.expressCode}
                        style={[styles.goodsBarTitle, {padding: 0}]}
                        placeholderTextColor='#858385'
                        onChangeText={(v) => this.setState({expressCode: v})}
                        placeholder={expressCodeText}
                        underlineColorAndroid="transparent">
                    </TextInput>
                    <TouchableOpacity onPress={() => this.openCode()}>
                        <View style={styles.reasonSelect}>
                            <Icon name="icon-scanner" style={{width: px(41), height: px(40)}}/>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            {this.list && <PickerExpress ref="pickerExpress" list={this.list} code={this.props.textCode} select={(index, item) => this.select(index, item)}/>}
            {/* <BarCode ref="barCode"/> */}
        </View>;
    }

    getExpressItem() {
        if (!this.express) {
            if (this.props.textCode) {
                this.express = {
                    code: this.props.textCode,
                    name: this.state.expressText
                }
            }
        }
        return this.express;
    }

    getExpressCode() {
        return this.state.expressCode;
    }
}

const font1 = {
    fontSize: px(26)
}
const color1 = {
    color: '#252426'
}
const color2 = {
    color: '#858385'
}
const icon = {
    position: 'absolute',
    zIndex: 6
}
const line = {
    position: 'absolute',
    zIndex: -1,
    top: px(89),
    left: px(90),
    width: px(180),
    height: px(4)
}
const btn = {
    width: px(58),
    height: px(58),
    alignItems: 'center',
    justifyContent: 'center'
}
const text = {
    marginTop: px(124),
    fontSize: px(24)
}
const card = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: px(720),
    marginLeft: px(30),
    paddingRight: px(30),
    borderTopWidth: px(1),
    borderTopColor: '#efefef'
}
const styles = StyleSheet.create({
    returnDetail: {
        position: 'relative',
        width: px(750),
        backgroundColor: '#fff',
        marginVertical: px(20),
        paddingHorizontal: px(30),
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: px(90),
    },
    detailCenter: {
        borderColor: '#efefef',
        borderTopWidth: px(1),
        borderBottomWidth: px(1),
    },
    itemField: {
        fontSize: px(26),
        color: '#252426',
        textAlignVertical: 'center',
        flex: 1,
    },
    itemSection: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    itemVal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: px(140),
        height: px(50),
        marginLeft: px(20),
        borderWidth: px(1),
        borderColor: '#ccc',
        borderRadius: px(30),
        overflow: 'hidden'
    },
    val: {
        fontSize: px(26),
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#b2b3b5',
    },
    itemValActive: {
        borderColor: '#222',
    },
    valActive: {
        color: '#222'
    },
    stepList: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: px(750),
        backgroundColor: '#fff'
    },
    stepItem: {
        width: px(180),
        height: px(200),
        alignItems: 'center'
    },
    stepIcon: {
        ...icon,
        left: px(81),
        top: px(82),
        width: px(18),
        height: px(18)
    },
    stepIconActive: {
        ...icon,
        left: px(68),
        top: px(69),
        width: px(44),
        height: px(44)
    },
    stepLine: {
        ...line,
        backgroundColor: '#b2b3b5'
    },
    stepLineActive: {
        ...line,
        backgroundColor: '#d0648f'
    },
    stepTitle: {
        ...text,
        color: '#b2b3b5'
    },
    stepTitleActive: {
        ...text,
        color: '#d0648f'
    },
    goodsCard: {
        ...card,
        height: px(190)
    },
    goodsBarCard: {
        ...card,
        height: px(90)
    },
    goodsImg: {
        width: px(150),
        height: px(150),
        borderRadius: px(10)
    },
    goodsInfo: {
        marginLeft: px(20),
        flex: 1,
        height: px(150),
    },
    goodsStatus: {
        height: px(150),
        marginLeft: px(60),
        alignItems: 'flex-end'
    },
    goodsTitle: {
        ...font1,
        ...color1,
        lineHeight: px(36)
    },
    goodsPrice: {
        ...font1,
        ...color1,
        lineHeight: px(36)
    },
    goodsNum: {
        ...font1,
        ...color2,
        lineHeight: px(46)
    },
    goodsQh: {
        marginTop: px(55),
        ...font1,
        ...color2,
        lineHeight: px(36)
    },
    goodsBarTitle: {
        ...font1,
        ...color1,
        lineHeight: px(36),
        flex: 1
    },
    goodsBarTools: {
        flexDirection: 'row',
        alignItems: 'center',
        width: px(200),
        height: px(60),
        borderColor: '#e5e5e5',
        borderWidth: px(1),
        borderRadius: px(10),
        overflow: 'hidden'
    },
    goodsBarReduce: {
        ...btn
    },
    goodsBarPlus: {
        ...btn
    },
    goodsBarBtn: {
        fontSize: px(36),
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    goodsBarInput: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: px(1),
        borderLeftWidth: px(1),
        borderColor: '#e5e5e5'
    },
    goodsBarText: {
        backgroundColor: 'transparent',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: px(28),
        color: '#252426'
    },
    goodsContainer: {
        backgroundColor: '#fff'
    },
    reason: {
        ...card,
        height: px(80)
    },
    editorContainer: {
        ...card,
        paddingVertical: px(24)
    },
    reasonSelect: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    reasonText: {
        ...font1,
        ...color2,
        marginRight: px(10)
    },
    editor: {
        flex: 1,
        minHeight: px(142),
        padding: 0,
        fontSize: px(24),
        color: '#252426',
        lineHeight: px(34),
        textAlignVertical: 'top'
    },
    orderHeadText: {
        fontSize: px(30),
        color: '#d0648f'
    },
    orderItemText: {
        ...font1,
        ...color2,
        lineHeight: px(36)
    },
    helpCard: {
        marginVertical: px(40),
        alignItems: 'center'
    },
    phoneField: {
        fontSize: px(24),
        color: '#858385'
    },
    phoneValue: {
        fontSize: px(24),
        color: '#44b7ea'
    },
    serviceDate: {
        fontSize: px(24),
        color: '#858385',
        lineHeight: px(44)
    },
    buttonCard: {
        alignItems: 'center',
        justifyContent: 'center',
        width: px(690),
        height: px(80),
        marginLeft: px(30),
        marginBottom: px(30),
        borderRadius: px(10),
        backgroundColor: '#d0648f'
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: px(30),
        marginBottom: px(30)
    },
    buttonGroupCard: {
        alignItems: 'center',
        justifyContent: 'center',
        width: px(335),
        height: px(80),
        borderRadius: px(10),
        backgroundColor: '#d0648f'
    },
    buttonCardText: {
        fontSize: px(30),
        color: '#fff'
    },
    cancelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: px(30),
        paddingVertical: px(25),
        paddingRight: px(30),
        borderTopWidth: px(1),
        borderTopColor: '#efefef',
        backgroundColor: '#fff'
    },
    cancelContent: {
        flex: 1
    },

    cancelBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(160),
        height: px(54),
        borderWidth: px(1),
        borderColor: '#b2b3b5',
        borderRadius: px(35),
    },
    cancelBtnText: {
        fontSize: px(24),
        color: '#515151'
    },
    cancelFont1: {
        fontSize: px(26),
        color: '#252426',
        lineHeight: px(46)
    },
    cancelFont2: {
        fontSize: px(24),
        color: '#858385',
        lineHeight: px(34)
    },
    cancelFont3: {
        fontSize: px(20),
        color: '#858385',
        lineHeight: px(40)
    },
    orderHdr: {
        width: px(750),
        height: px(80),
        paddingHorizontal: px(30),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: px(720),
        height: px(80),
        marginLeft: px(30),
        paddingRight: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    refuseTitle: {
        width: px(750),
        height: px(80),
        justifyContent: 'center',
        paddingLeft: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    refuseText: {
        width: px(750),
        padding: px(30)
    },
    tipCard: {
        backgroundColor: '#fff'
    },
    tipTitle: {
        width: px(750),
        height: px(80),
        justifyContent: 'center',
        paddingLeft: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    tipItem: {
        width: px(750),
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: px(40),
        paddingHorizontal: px(30)
    }
})
