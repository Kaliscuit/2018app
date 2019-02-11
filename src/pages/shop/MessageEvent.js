'use strict';

import React from 'react';

import {
    DeviceEventEmitter
} from 'react-native';
import { log, logWarm, logErr } from '../../utils/logs'

/**
 * 消息事件
 */
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.events = this.events.bind(this);
        this.id = Date.now();
        this.date = 0;
    }
    render() {
        return null;
    }
    componentDidMount() {
        let date = 0;
        const id = Date.now();
        DeviceEventEmitter.addListener("EventPush", this.events);
    }
    date = 0;
    events(e) {
        log("原始消息的消息", e);
        if (e.activePushMsg) return;
        const navigate = this.props.navigation.navigate;
        const now = Date.now();
        if (now - this.date < 3000) return;
        this.date = now;
        let data = JSON.parse(e.pushMsg);
        let content = data.extras.typeUrl;
        log("push消息:" + this.id, data.extras, data.extras.type + ":" + data.extras.typeUrl);
        //商品页 （typeUrl为skuID）
        if (data.extras.type == 2) {
            navigate("DetailPage", {
                sku: content
            });
        }
        //专题页（typeUrl为url地址）
        if (data.extras.type == 3) {
            navigate("HtmlViewPage", {
                webPath: content,
                img: ""
            });
        }
        //频道页（typeUrl为频道ID）
        if (data.extras.type == 4) {
            if (content) {
                this.props.goToPage3(content);
            }
        }
        //代金券列表
        if (data.extras.type == 5) {
            navigate("CouponPage", {
                callback: () => { }
            });
        }
        //金币列表
        if (data.extras.type == 6) {
            navigate("GoldPage");
        }
        //我的
        if (data.extras.type == 7) {
            navigate("ProfilePage");
        }
        //福袋销售
        if (data.extras.type == 8) {
            navigate("InvitePage");
        }
        //售后管理
        if (data.extras.type == 11) {
            navigate("CustomerServicePage");
        }
        //资金管理
        if (data.extras.type == 14) {
            navigate("IncomeManagePage");
        }
        //代金券-分享被领取页
        if (data.extras.type == 15) {
            navigate("CouponPage", {
                page: 3
            });
        }
        //我的金币-分享被领取页
        if (data.extras.type == 16) {
            navigate("GoldPage", {
                page: 3
            })
        }
        //提现记录
        if (data.extras.type == 17) {
            navigate("WithdrawRecordPage");
        }
    }
    // componentWillMount() {
    //
    // }
}