import React, {Component} from 'react'
import {
    View,
    StyleSheet,
    Text,
    NativeModules,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image, BackHandler
} from 'react-native'
import Page from '../../UI/Page'
import Icon from '../../UI/lib/Icon'
import {deviceWidth, px} from "../../utils/Ratio";
import {log, logErr} from "../../utils/logs"
import List from '../common/List'
import {get, post} from '../../services/Request'
import Empty from "./empty";
import {dateFormat, nullStr} from './utils'
import Event from "../../services/Event";

class TransList extends List {
    listStyle = {
        flex: 1,
        backgroundColor: 'transparent'
    }

    renderItem(item, index) {
        let txt = ''
        if (nullStr(item.info_ext && item.info_ext.logi_sn)) {
            txt = `运单号：${item.info_ext.logi_sn}`
        } else if (nullStr(item.info_ext && item.info_ext.order_sn)) {
            txt = `订单号：${item.info_ext.order_sn}`
        }

        if (nullStr(item.info_ext && item.info_ext.sr_no)) {
            txt = `退货号：${item.info_ext.sr_no}`
        }

        return <TouchableWithoutFeedback onPress={() => this.go(item.info_ext)}>
            <View style={styles.listItem}>
                <View style={styles.headWrap}>
                    <View style={styles.head}>
                        <Text style={styles.status}>
                            {item.info_til}
                        </Text>
                        <Text style={styles.time}>
                            {dateFormat(item.info_date)}
                        </Text>
                    </View>
                    {
                        nullStr(item.info_ext && item.info_ext.remark) ?
                            <Text numberOfLines={1} style={styles.desc}>
                                {item.info_ext.remark}
                            </Text> : null
                    }
                </View>
                <View style={styles.body}>
                    <Image style={styles.prodImg}
                           source={{uri: nullStr(item.info_ext && item.info_ext.img_url) ? item.info_ext.img_url : ''}}/>
                    <View style={styles.contxt}>
                        <Text numberOfLines={2} style={styles.name}>
                            {item.info_body}
                        </Text>
                        <Text style={styles.txt}>
                            {txt}
                        </Text>

                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }

    footer() {
        return <View style={{width: deviceWidth, height: px(20)}}></View>
    }

    go(extras) {
        if (!extras) return;
        let param = {
            extras: {
                type: extras.type,
                typeUrl: extras.type_url,
            }
        }
        Event.emit("push.go", JSON.stringify(param))
    }

    init() {
        this.pageIndex = 0
        this.loadEnd = this.props.list ? !this.props.list.next : true
        this.state.list = this.props.list ? (this.props.list.items || []) : []
        if (this.loadEnd && this.state.list.length > 0) {
            this.state.loadText = '已经到底了'
        }
        if (this.state.list && this.state.list.length > 0) {
            this.bgUpdate("transparent")
        } else {
            this.bgUpdate("#fff")
        }
    }

    empty() {
        return <Empty/>
    }


    bgUpdate(color) {
        this.props.updated && this.props.updated(color)
    }

    async refresh() {
        if (this.loading) return;
        this.props.refresh && this.props.refresh()
    }

    async next() {
        if (this.loadEnd) return;
        if (this.loading) return;
        this.loading = true;
        this.pageIndex++;
        this.setState({loadText: "加载中..."})
        let data = await this.load(this.pageIndex);
        this.loading = false;
        if (data) {
            this.setState({list: this.state.list.concat(data.items)});
        }
        if (!data || !data.next) {
            this.setState({loadText: "已经到底了"});
            this.loadEnd = true;
            return;
        }
    }

    async load(page) {
        try {
            let res = await get("https://dalingjia.com/msg_box/api/msgList.do?msgType=trade_logi&start=" + page)
            return res || {}
        } catch (e) {
            //
        }
    }
}

export default class extends Page {
    constructor(props) {
        super(props)

        this.state = {
            color: 'transparent',
            initList: {}
        }
    }

    title = '交易物流'

    pageBody() {
        return <View style={[styles.container, {
            backgroundColor: this.state.color
        }]}>
            <View style={styles.list}>
                <TransList list={this.state.initList} updated={this.backgroundUpdated.bind(this)}
                           refresh={this.refresh.bind(this)}/>
            </View>
        </View>
    }

    backgroundUpdated(color) {
        if (this.state.backgroundColor == color) return;
        this.setState({
            color
        })
    }

    async onReady() {
        // 初始化请求
        BackHandler.addEventListener('hardwareBackPress', this.back);
        try {
            let res = await get("https://dalingjia.com/msg_box/api/msgList.do?msgType=trade_logi&start=0")
            this.setState({
                initList: res || {}
            })
        } catch (e) {
            this.$toast(e.message)
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.back);
    }

    back = () => {
        if (this.props.navigation.state.params && this.props.navigation.state.params.callback) {
            this.props.navigation.state.params.callback.call(this);
        }
    }

    async refresh() {
        this.setState({loaded: false})
        await this.onReady();
        this.setState({loaded: true})
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    list: {
        flex: 1,
        position: 'relative',
    },
    listItem: {
        width: px(750),
        marginTop: px(20),
        paddingHorizontal: px(24),
        backgroundColor: '#fff'
    },
    headWrap: {
        paddingVertical: px(20),
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1),
    },
    head: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    status: {
        fontSize: px(32),
        color: '#222',
        flex: 1,
        lineHeight: px(52)
    },
    time: {
        fontSize: px(24),
        color: '#999',
        lineHeight: px(44)
    },
    desc: {
        fontSize: px(26),
        color: '#666',
        lineHeight: px(46)
    },
    body: {
        paddingVertical: px(30),
        flexDirection: 'row',
        alignItems: 'center',
    },
    prodImg: {
        width: px(120),
        height: px(120),
        marginRight: px(24),
        overflow: 'hidden',
        borderRadius: px(8)
    },
    contxt: {
        flex: 1
    },
    name: {
        fontSize: px(26),
        color: '#222',
        lineHeight: px(34),
        flex: 1
    },
    txt: {
        fontSize: px(26),
        color: '#666'
    }
})
