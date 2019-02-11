import React, {Component} from 'react'
import {
    View,
    StyleSheet,
    Text,
    NativeModules,
    TouchableOpacity, BackHandler,
    TouchableWithoutFeedback
} from 'react-native'
import Page from '../../UI/Page'
import Icon from '../../UI/lib/Icon'
import {deviceWidth, px} from "../../utils/Ratio";
import {log, logErr} from "../../utils/logs"
import List from '../common/List'
import Empty from './empty'
import {get, post} from '../../services/Request'
import {dateFormat, nullStr} from './utils'
import Event from "../../services/Event";

class ShopList extends List {
    listStyle = {
        flex: 1,
        backgroundColor: '#fff'
    }

    renderItem(item, index) {
        let iconType = nullStr(item.info_ext && item.info_ext.icon_type)
        let iconUrl = ''
        switch (parseInt(iconType)) {
            case 1 : iconUrl = 'icon-message-boos';break;
            case 2 : iconUrl = 'icon-message-user';break;
            case 3 : iconUrl = 'icon-message-vip';break;
            case 4 : iconUrl = 'icon-message-success1';break;
            case 5 : iconUrl = 'icon-message-wallet';break;
            case 6 : iconUrl = 'icon-message-group';break;
            case 7 : iconUrl = 'icon-message-order_tip';break;
        }
        return <TouchableWithoutFeedback onPress={() => this.go(item.info_ext)}>
            <View style={styles.wrap}>
                <View style={[styles.listItem, {borderTopWidth: index == 0 ? 0 : px(1)}]}>
                    <View style={styles.itemIcon}>
                        {
                            iconUrl ? <Icon name={iconUrl} width={px(34)} height={px(34)}/> : null
                        }
                    </View>
                    <View style={styles.context}>
                        <View style={styles.head}>
                            <Text style={styles.name}>
                                {item.info_til}
                            </Text>
                            <Text style={styles.time}>
                                {dateFormat(item.info_date)}
                            </Text>
                        </View>
                        <Text style={styles.txt}>
                            {item.info_body}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
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

    empty() {
        return <Empty/>
    }

    footer() {
        return <View style={{width: deviceWidth, height: px(20)}}></View>
    }

    init() {
        this.pageIndex = 0
        this.loadEnd = this.props.list ? !this.props.list.next : true
        this.state.list = this.props.list ? (this.props.list.items || []) : []
        if (this.loadEnd && this.state.list.length > 0) {
            this.state.loadText = '已经到底了'
        }
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
            let res = await get("https://dalingjia.com/msg_box/api/msgList.do?msgType=shop_notice&start=" + page)
            return res || {}
        } catch (e) {
            //
        }
    }
}

export default class extends Page {
    title = '店铺通知'

    constructor(props) {
        super(props)

        this.state = {
            initList: {}
        }
    }

    pageBody() {
        return <View style={styles.container}>
            <View style={styles.list}>
                <View style={{
                    width: deviceWidth,
                    height: px(20),
                    backgroundColor: '#f5f3f6'
                }}></View>
                <ShopList list={this.state.initList}
                          refresh={this.refresh.bind(this)}/>
            </View>
        </View>
    }

    async onReady() {
        // 初始化请求
        BackHandler.addEventListener('hardwareBackPress', this.back);
        try {
            let res = await get("https://dalingjia.com/msg_box/api/msgList.do?msgType=shop_notice&start=0")
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
        backgroundColor: '#fff'
    },
    listItem: {
        width: px(726),
        paddingRight: px(24),
        paddingTop: px(25),
        paddingBottom: px(35),
        borderTopColor: '#efefef',
        flexDirection: 'row',
        // alignItems: 'center',
    },
    itemIcon: {
        position: 'relative',
        marginRight: px(24),
        height: px(62),
        justifyContent: "center"
    },
    wrap: {
        paddingLeft: px(24),
        backgroundColor: '#fff'
    },
    context: {
        flex: 1
    },
    head: {
        flexDirection: 'row',
        alignItems: 'center',
        height: px(62),
    },
    name: {
        flex: 1,
        fontSize: px(32),
        color: '#222',
    },
    time: {
        fontSize: px(24),
        color: '#999',
    },
    txt: {
        fontSize: px(26),
        color: '#666',
        lineHeight: px(36),
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    emptyTxt: {
        marginTop: px(88),
        fontSize: px(28),
        color: '#999'
    }
})
