/**
 * Created by zhaoxiaobing on 2017/9/1.
 */
'use strict';

import React from 'react';

import {
    Text,
    View,
    FlatList,
    StyleSheet,
} from "react-native";
import { px } from "../../../utils/Ratio";
import request, { get } from "../../../services/Request";
import { show as toast } from '../../../widgets/Toast';
import List from "../../common/List"
import Page from '../../../UI/Page'

export default class extends Page {

    constructor(props) {
        super(props);
        this.state = {
        
        }
    }
    async onReady() {
    
    }
    title = '提现记录'
    pageBody() {
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <WithdrawList show/>
        </View>;
    }
}

const styles = StyleSheet.create({
    record_list: {
        width: px(750),
        paddingHorizontal: px(30),
        paddingVertical: px(10),
        backgroundColor: '#fff',
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        justifyContent: 'center'
    },
    record_view1: {
        flex: 0,
        flexDirection: 'row',
        height: px(55)
    },
    record_view2: {
        flex: 0,
        height: px(30),
        flexDirection: 'row'
    },
    sty1: {
        flex: 1,
        fontSize: px(28),
        color: '#252426'
    },
    sty2: {
        fontSize: px(36),
        color: '#252426'
    },
    sty3: {
        fontSize: px(24),
        color: "#858585"
    },
    sty4: {
        fontSize: px(24),
        color: "#858585"
    },
    sty5: {
        fontSize: px(22),
        color: "#d0648f"
    },
    empty: {
        textAlign: 'center',
        fontSize: px(30),
        paddingVertical: px(60)
    }
});

class WithdrawList extends List {
    
    renderInfo(text) {
        let list = [];
        let tmp = "";
        for (let j = 0; j < text.length; j++) {
            const t = text[j];
            tmp += t;
            if (tmp.length > 30) {
                list.push(tmp);
                tmp = "";
            }
        }
        if (tmp.length !== 0) list.push(tmp);
        return list.map((item, index) => <View key={index} style={[styles.record_view2, { marginTop: px(10) }]}>
            <Text allowFontScaling={false} style={styles.sty5}>
                {item}
            </Text>
        </View>)
        
    }

    payStyle(val) {
        let txt = ''
        switch (val) {
            case 0: txt = '支付宝';break;
            case 1: txt = '银行卡';break;
            case 2: txt = '微信';break;
        }
        return txt;
    }
    
    renderItem(item, index) {
        return <View style={styles.record_list}>
            <View style={styles.record_view1}>
                <Text allowFontScaling={false} style={styles.sty1}>申请单号 {item.applyNo}</Text>
                <Text allowFontScaling={false} style={styles.sty2}>¥{item.applyAmount}</Text>
            </View>
            <View style={styles.record_view2}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text allowFontScaling={false} style={styles.sty3}>
                        {item.applyDate}
                    </Text>
                    <Text allowFontScaling={false} style={[styles.sty3, {marginLeft: px(25)}]}>
                        提现方式:{this.payStyle(item.accountType)}
                    </Text>
                </View>
                {
                    item.status == 1 &&
                    <Text allowFontScaling={false} style={styles.sty4}>提现成功</Text>
                }
                {
                    item.status == 2 &&
                    <Text allowFontScaling={false} style={styles.sty4}>受理中</Text>
                }
                {
                    item.status == 0 &&
                    <Text allowFontScaling={false} style={styles.sty5}>失败</Text>
                }
            </View>
            {item.failRemark && this.renderInfo(item.failRemark)}
        </View>
    }
    
    key = 'applyDate'
    
    async load(start) {
        try {
            let res = await request.get(`/withdrawalsApply/findWithdrawalsApplyLog.do?`, {
                start
            });
            return res;
        } catch (e) {
            toast(e.message);
            return { items: [] };
        }
    }
}