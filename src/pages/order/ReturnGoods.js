import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ScrollView, BackHandler, Keyboard} from 'react-native';
import {get, post, uploadImage} from '../../services/Request'
import {show as toast} from '../../widgets/Toast';
import {TopHeader} from '../common/Header'
import {px} from '../../utils/Ratio'
import {ReturnDetail, Steps, Goods, ReasonCard, CancelCard, ExpressInfo, Tip, Refuse, GoodsCardView, OrderCard, HelperCard, ButtonCard, ButtonGroupCard} from "../common/returns/Index";
import Loading from '../../animation/Loading'
import { DialogModal, AlertModal } from '../common/ModalView'
import {Upload} from './Upload';
import { config } from '../../services/Constant';
import { ImgsModal } from '../common/ModalView'

const Space = ({child}) => <View style={{marginTop: px(20)}}>
    {child}
</View>

const buttonSettings = {
    "step2": {
        "btn1": {
            enabled: true,
            title: '提交申请',
        },
        "btn2": {
            enabled: true,
            title: '取消退货'
        },
        "btn3": {
            leftBtn: {
                enabled: true,
                title: '提交修改'
            },
            rightBtn: {
                enabled: true,
                title: '取消退货'
            }
        },
        "btn6": {
            enabled: true,
            title: "取消退货"
        }
    },
    "step4": {
        "btn4": {
            leftBtn: {
                enabled: true,
                title: '提交寄回'
            },
            rightBtn: {
                enabled: true,
                title: '取消退货'
            }
        },
        "btn5": {
            enabled: true,
            title: '提交修改'
        },
        "btn7": {
            enabled: true,
            title: '取消退货'
        }
    }
}

export default class extends Component {

    getParams() {
        let {params} = this.props.navigation.state;
        let param = params || {};
        return param;
    }


    async goApply() {
        let settings = this.state.settings || {};
        let {orderNo, orderId, expressCode} = this.getParams();
        let goodsNum = this.refs['goodsCard'].getNum();
        let info = {}
        let reason = this.refs['reasonCard'].getReason();
        let desc = this.refs['reasonCard'].getRemark();
        let imgUp = this.refs['imgUpdate'];
        let needUpImgs = [];
        if (!reason) {
            toast('请选择退货理由');
            return;
        }
        if (reason.id != '10' && reason.id != '11') {
            if (!desc) {
                toast('请填写问题描述');
                return;
            }
        }

        if ((reason.id != '6' && reason.id != '7') || settings.suningYn == 'Y') {
            if (imgUp) {
                needUpImgs = imgUp.getImages();
                if (!needUpImgs || needUpImgs.length == 0) {
                    toast('请上传图片凭证');
                    return;
                }
            }
        }

        if (imgUp) {
            info = this.refs['detail'].getDetailInfo()
            if (!info.packing) {
                toast('请选择包装是否完整');
                return;
            }
            if (!info.enclosure) {
                toast('请选择附件是否完好');
                return;
            }
            if (!info.good) {
                toast('请选择商品是否使用');
                return;
            }
        }


        let data = new FormData();
        data.append("orderNo", orderNo);
        data.append("lineId", orderId);
        data.append("qtys", goodsNum);
        data.append("returnMemo", reason.id);
        data.append("remark", desc);
        data.append("aoNo", expressCode);
        if (imgUp) {
            needUpImgs = imgUp.getImages();
            needUpImgs.forEach((item, index) => {
                data.append("img", item);
            })
            data.append("packYn", info.packing > 0 ? 'Y' : 'N');
            data.append("attachYn", info.enclosure > 0 ? 'Y' : 'N');
            data.append("useYn", info.good > 0 ? 'N' : 'Y');
        }
        try {
            this.refs.loading.open();
            let res = await uploadImage(`/return/save.do`, data)
            await this.lookit(res.srNo);
            this.refs.loading.close();
            toast('申请退货提交成功');
        } catch (e) {
            toast(e.message);
            this.refs.loading.close();
            return;
        }
    }

    async goCancel() {
        let settings = this.state.settings || {};
        let {srNo} = settings;
        try {
            this.refs.loading.open();
            let res = await get(`/return/cancel.do?srNo=${srNo}`);
            if (res.status != '0') {
                toast(res.message);
                this.refs.loading.close();
                return;
            }
            await this.lookit(srNo);
            this.refs.loading.close();
            toast('退货申请已取消');
        } catch (e) {
            toast(e.message);
            this.refs.loading.close();
            return;
        }

    }

    async uploadImg() {
        let settings = this.state.settings || {};
        let {srNo} = settings;
        let imgUp = this.refs['imgUpdate'];
        let needUpImgs = [];
        if (imgUp) {
            needUpImgs = imgUp.getImages();
            if (!needUpImgs || needUpImgs.length == 0) {
                toast('请上传图片凭证');
                return;
            }
        }
        let data = new FormData();
        data.append("srNo", srNo);
        if (imgUp) {
            needUpImgs.forEach((item, index) => {
                data.append("img", item);
            })
        }
        try {
            this.refs.loading.open();
            let res = await uploadImage(`/return/update_img.do`, data)
            if (res.status != '0') {
                toast(res.message);
                this.refs.loading.close();
                return;
            }
            await this.lookit(srNo);
            this.refs.loading.close();
            toast('图片修改成功');
        } catch (e) {
            toast(e.message);
            this.refs.loading.close();
            return;
        }
    }

    async goReturn() {
        let settings = this.state.settings || {};
        let {srNo} = settings;
        let express = this.refs['express'];
        let expressCode = express.getExpressCode();
        let expressName = express.getExpressItem();
        let name = expressName ? expressName.code : '';

        if (!name) {
            toast('请选择快递公司')
            return;
        }

        if (!expressCode) {
            toast('请扫一扫商品条形码')
            return;
        }

        try {
            this.refs.loading.open();
            let res = await get(`/return/logiInfoSubmit.do?srNo=${srNo}&expressNo=${expressCode}&logiCode=${name}`)
            if (res.status != '0') {
                toast(res.message);
                this.refs.loading.close();
                return;
            }
            await this.lookit(srNo);
            this.refs.loading.close();
            toast('寄回商品提交成功');
        } catch (e) {
            toast(e.message);
            this.refs.loading.close();
            return;
        }
    }

    buttonController(step, index) {
        if (step != '2' && step != '4') return {};
        
        if (index) {
            let settings = buttonSettings[`step${step}`][`btn${index}`];

            // 微信历史订单提示toast
            if (this.isWeCatHistory) {
                const submit = () => toast('请解绑微信后从微信端操作')
                
                settings.submit = submit
                if (settings.leftBtn) settings.leftBtn = { ...settings.leftBtn, submit }
                if (settings.rightBtn) settings.rightBtn = { ...settings.rightBtn, submit }

                return settings
            }

            if (index == '1') {
                settings.submit = () => {
                    this.goApply();
                }
            } else if (index == '2') {
                settings.submit = () => {
                    this.refs.dialog.open({
                        content: ['确认要取消本次退货申请吗？'],
                        btns: [{
                            txt: '否',
                            click: () => {}
                        }, {
                            txt: '是',
                            click: async () => {
                                await this.goCancel();
                            }
                        }]
                    });
                }
            } else if (index == '3') {
                settings.leftBtn.submit = async () => {
                    // todo
                    await this.uploadImg();
                }
                settings.rightBtn.submit = async () => {
                    this.refs.dialog.open({
                        content: ['确认要取消本次退货申请吗？'],
                        btns: [{
                            txt: '否',
                            click: () => {}
                        }, {
                            txt: '是',
                            click: async () => {
                                await this.goCancel();
                            }
                        }]
                    });
                }
            } else if (index == '4') {
                settings.leftBtn.submit = async () => {
                    await this.goReturn();
                }
                settings.rightBtn.submit = async () => {
                    this.refs.dialog.open({
                        content: ['确认要取消本次退货申请吗？'],
                        btns: [{
                            txt: '否',
                            click: () => {}
                        }, {
                            txt: '是',
                            click: async () => {
                                await this.goCancel();
                            }
                        }]
                    });
                }
            } else if (index == '5') {
                settings.submit = async () => {
                    await this.goReturn();
                }
            } else if (index == '6') {
                settings.submit = async () => {
                    this.refs.dialog.open({
                        content: ['确认要取消本次退货申请吗？'],
                        btns: [{
                            txt: '否',
                            click: () => {}
                        }, {
                            txt: '是',
                            click: async () => {
                                await this.goCancel();
                            }
                        }]
                    });
                }
            } else if (index == '7') {
                settings.submit = async () => {
                    this.refs.dialog.open({
                        content: ['确认要取消本次退货申请吗？'],
                        btns: [{
                            txt: '否',
                            click: () => {}
                        }, {
                            txt: '是',
                            click: async () => {
                                await this.goCancel();
                            }
                        }]
                    });
                }
            }
            return settings || {};
        }
        return {};
    }

    constructor(props) {
        super(props);
        let {type} = this.getParams();
        this.state = {
            settings: {},
            type: type || '0',
            done: false,
            buttonIndex: 0
        }

        this.isWeCatHistory = props.navigation.getParam('isWeCatHistory', false)
    }

    render() {
        if (!this.state.done) return <Loading ref='loading'/>

        let settings = this.state.settings || {};
        let {step,
            srNo,
            stepGroupList,
            refundStatusTitle,
            refundStatusSub,
            refundStatusTime,
            lines,
            refundKindList,
            reason,
            return_desc,
            applyResult,
            expressList,
            expressName,
            expressCode,
            returnTipGroup,
            expressCompany,
            reasonCode,
            imgShowYn,
            images,
            suningYn,
            showReturnGoodsInfo,
            packYn,
            attachYn,
            useYn,
            moneyGroupList} = settings;
        let {type, buttonIndex} = this.state;
        let {goods} = this.getParams();
        let btnSettings = this.buttonController(step, buttonIndex);
        return <View style={{flex: 1, backgroundColor: '#f5f3f6'}}>
            <TopHeader navigation={this.props.navigation}
                title="办理售后"
                rightBtn={<TouchableOpacity onPress={() => {
                    this.goHelper();
                }}>
                    <View style={{width: px(160), alignItems: 'flex-end'}}>
                        <Text allowFontScaling={false} style={{fontSize: px(30), color: '#858385', marginRight: px(30)}}>退货帮助</Text>
                    </View>
                </TouchableOpacity>}></TopHeader>

            <ScrollView
                style={{ flex: 1 }}
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
            >
                <Steps steps={stepGroupList} step={step}/>

                {!(step == '2' && type == '0') &&
                    <CancelCard navigation={this.props.navigation}
                        srNo={srNo}
                        // 微信历史订单
                        isWeCatHistory={this.isWeCatHistory}
                        refundStatusTitle={refundStatusTitle}
                        refundStatusSub={refundStatusSub} refundStatusTime={refundStatusTime}/>}

                {step == '2' && type == '1' &&
                    <Space child={<GoodsCardView list={lines} />}/>}

                {step == '2' && type == '0' &&
                    <Goods ref="goodsCard" goods={goods}/>}
                {(showReturnGoodsInfo == 'Y' || type == '0') && ((step == '2' && imgShowYn == 'Y') || (step == '4' && suningYn != 'Y')) && <ReturnDetail ref="detail" good={useYn} packing={packYn} enclosure={attachYn} mode={type} />}
                {step == '2' &&
                    <Space child={<ReasonCard ref="reasonCard" type={type} textCode={reasonCode}
                        list={refundKindList} text={reason} desc={return_desc} />}/>}
                {step == '2' && imgShowYn == 'Y' && <Upload ref="imgUpdate" images={images}/>}
                {step == '4' && suningYn != 'Y' && <Space child={<Tip list={returnTipGroup.tipList} title={returnTipGroup.groupName}/>}/>}
                {step == '4' && suningYn != 'Y' && <Space child={<ExpressInfo ref="express" type={type} list={expressList} textCode={expressCompany} text={expressName} code={expressCode}/>}/>}
                {step != '10' && step != '30' && moneyGroupList && moneyGroupList.length > 0 &&
                    <Space child={<OrderCard list={moneyGroupList[0]}/>}/>}

                {step == '16' && moneyGroupList && moneyGroupList.length > 1 &&
                    <Space child={<OrderCard list={moneyGroupList[1]}/>}/>}

                {step == '32' && <Space child={<Refuse text={applyResult}/>}/>}

                <HelperCard/>

                {(step == '2' || step == '4') && btnSettings && !btnSettings.leftBtn && <ButtonCard title={btnSettings.title} enabled={btnSettings.enabled} submit={btnSettings.submit}/>}
                {(step == '2' || step == '4') && btnSettings && btnSettings.leftBtn && <ButtonGroupCard leftBtn={btnSettings.leftBtn} rightBtn={btnSettings.rightBtn}/>}

            </ScrollView>
            <Loading ref='loading'/>
            <DialogModal ref="dialog"/>
        </View>

    }

    async componentDidMount() {
        this.refs.loading.open();
        await this.load();
        this.refs.loading.close();
    }

    componentWillUnmount() {
        let {params} = this.props.navigation.state;
        let {cb} = params || {};
        cb && cb();
    }

    async goHelper() {
        let cfg = await config();
        this.props.navigation.navigate('ImagePage', {
            'title': '退货帮助',
            src: cfg.images['return_img']
        });
    }

    async load() {
        let {type} = this.getParams();
        if (type == '0') {
            // 申请
            let {orderNo, orderId, prodQty, expressCode} = this.getParams();
            await this.apply(orderNo, orderId, prodQty, expressCode);
        } else if (type == '1') {
            // 查看
            let {orderNo} = this.getParams();
            await this.lookit(orderNo);
        }
    }

    async apply(orderNo, orderId, prodQty, expressCode) {
        try {
            let res = await get(`/return/apply.do?orderNo=${orderNo}&lineId=${orderId}&qtys=${prodQty}&ao_no=${expressCode}`);
            this.setState({
                settings: res,
                done: true,
                buttonIndex: 1,
                type: '0'
            })
        } catch (e) {
            toast(e.message);
            this.props.navigation.goBack();
            return;
        }
    }

    async lookit(orderNo) {
        try {
            const _url = this.isWeCatHistory ? 'touchHistoryView' : 'view'

            let res = await get(`/return/${ _url }.do?srNo=${orderNo}`);
            let {step, imgShowYn, expressCode, suningYn} = res;
            let index = 1;

            if (step == '2' && imgShowYn == 'Y') {
                if (suningYn == 'Y') {
                    index = 6;
                } else {
                    index = 3;
                }
            } else if (step == '2' && imgShowYn == 'N') {
                index = 2;
            } else if (step == '4' && expressCode) {
                index = 5;
            } else if (step == '4' && !expressCode) {
                if (suningYn == 'Y') {
                    index = 7;
                } else {
                    index = 4;
                }
            }

            this.setState({
                settings: res,
                done: true,
                type: '1',
                buttonIndex: index
            })
        } catch (e) {
            toast(e.message);
            this.props.navigation.goBack();
            return;
        }

    }
}
