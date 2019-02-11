import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    Text,
    NativeModules,
    TouchableOpacity
} from 'react-native'
import Page from '../../UI/Page'
import Icon from '../../UI/lib/Icon'
import { px } from "../../utils/Ratio";
import { log, logErr } from "../../utils/logs"
import Event from "../../services/Event"
import List from '../common/List'
import Badge from '../../UI/lib/Badge'
import { get, getHeader, post } from '../../services/Request'
import { dateFormat, nullStr } from './utils'
import { User } from "../../services/Api";
import { setConstant } from "../../services/Constant";
import { getItem, setItem } from '../../services/Storage'

const AppModule = NativeModules.AppModule;
const IM = NativeModules.XNIMModule

class Task extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: true,
            hasOpen: true
        }
    }

    render() {
        return this.state.hasOpen && !this.state.open && <View style={styles.task}>
            <View style={styles.taskLeft}>
                <Text style={styles.title}>打开消息通知</Text>
                <Text style={styles.desc}>以免错过商品优惠，订单物流等重要通知。</Text>
            </View>
            <TouchableOpacity onPress={this.openPush}>
                <View style={styles.taskRight}>
                    <Text style={styles.open}>
                        去开启
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    }

    getPushStatus = () => {
        AppModule.getPushStatus && AppModule.getPushStatus((err, res) => {
            // log(res);
            if (res) {
                this.setState({ open: true })
            } else {
                this.setState({ open: false })
            }
        });
    }

    openPush() {
        AppModule.openPushSetting && AppModule.openPushSetting();
    }

    componentDidMount() {
        this.getPushStatus()
        if (!AppModule.getPushStatus) {
            this.setState({ hasOpen: false })
        }
        Event.on("app.active", this.getPushStatus);
    }

    componentWillUnmount() {
        Event.off("app.active", this.getPushStatus);
    }
}

class CenterList extends List {
    listStyle = {
        flex: 1,
    }

    async go(url, item) {
        if (url == 'Help') {
            try {
                let img = User.headImgUrl;
                if (img === "http://img.cdn.daling.com/data/files/mobile/img/dalingjia.jpg") {
                    img = "http://img.daling.com/st/dalingjia/app/im_default_logo.png";
                }
                await IM.startChat(item.setId, img, function (cb) {
                });
                let uid = getHeader('uid')
                let helpItem = await getItem(`HelpCenterContent${uid}`)
                if (helpItem) {
                    helpItem.unreadMsgNum = '0'
                    await setItem(`HelpCenterContent${uid}`, helpItem)
                    await this.refresh()
                }
            } catch (e) {
                logErr("客服打开失败", e.message, e)
            }
            return;
        }
        this.props.navigation.navigate(url);
    }

    renderItem(item, index) {
        return <TouchableOpacity onPress={() => this.go(item.url, item)}>
            <View style={styles.listWrap}>
                <View style={[styles.listItem, { borderTopWidth: index == 0 ? 0 : px(1) }]}>
                    <View style={styles.itemIcon}>
                        <Badge text={item.badge}>
                            <Icon name={item.icon} width={this.iconSize} height={this.iconSize} />
                        </Badge>
                    </View>
                    <View style={styles.context}>
                        <View style={styles.head}>
                            <Text style={styles.name}>
                                {item.title}
                            </Text>
                            <Text style={styles.time}>
                                {dateFormat(item.time)}
                            </Text>
                        </View>
                        <Text numberOfLines={1} style={styles.txt}>
                            {item.desc}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    }

    iconSize = px(90)

    footer() {
        return null
    }

    empty() {
        return null
    }

    init() {
        this.state.list = this.props.list || []

    }

    async refresh() {
        this.props.refresh && this.props.refresh()
    }

    async next() {
    }
}

export default class extends Page {

    constructor(props) {
        super(props)

        this.state = {
            initList: []
        }
    }

    title = '消息中心'
    didFocus = null
    pageBody() {
        return <View style={styles.container}>
            <Task />
            <View style={styles.list}>
                <CenterList list={this.state.initList} navigation={this.props.navigation}
                    refresh={this.refresh.bind(this)} />
            </View>
        </View>
    }

    filter(list, type) {
        if (list && list.length > 0) {
            let newList = list.filter(item => item.msgType === type)
            if (newList && newList.length > 0) {
                return newList[0]
            } else {
                return {};
            }
        }
        return {};
    }

    async onReady() {
        // 初始化请求
        this.didFocus = this.props.navigation.addListener(
            'didFocus',
            async payload => {
                await this.refresh()
            }
        );
    }

    componentWillUnmount() {
        this.didFocus && this.didFocus.remove()
    }

    getData = async () => {
        try {
            let uid = getHeader('uid')
            let setId = await getItem(`prevSetId${uid}`)
            let res = await get("https://dalingjia.com/msg_box/api/msgGroupList.do")
            let item1 = this.filter(res, "shop_notice")
            let item2 = this.filter(res, "capital_notice")
            let item3 = this.filter(res, "active_notice")
            let item4 = this.filter(res, "trade_logi")
            let item5 = this.filter(res, "system_notice")
            let item6 = await getItem(`HelpCenterContent${uid}`) || {
                content: '',
                settingId: setId || 'kf_9496_1501573712265',
                unreadMsgNum: '0',
                userName: '',
                date: ''
            }
            let list = User.isLogin && !User.vip ? [{
                id: 0,
                icon: 'icon-message-help',
                title: '达令家客服助手',
                setId: item6.settingId,
                desc: item6.content || '暂无消息',
                time: item6.date || '',
                badge: parseInt(item6.unreadMsgNum) || 0,
                url: 'Help'
            }, {
                id: 1,
                icon: 'icon-message-sys',
                title: '达令家公告',
                desc: item5.firstMsg || '暂无消息',
                time: item5.info_date || '',
                badge: parseInt(item5.unreadCount) || 0,
                url: 'SysMessage'
            }, {
                id: 2,
                icon: 'icon-message-market',
                title: '店铺通知',
                desc: item1.firstMsg || '暂无消息',
                time: item1.info_date || '',
                badge: parseInt(item1.unreadCount) || 0,
                url: 'ShopMessage'
            }, {
                id: 3,
                icon: 'icon-message-gold',
                title: '资产信息',
                desc: item2.firstMsg || '暂无消息',
                time: item2.info_date || '',
                badge: parseInt(item2.unreadCount) || 0,
                url: 'AssetsMessage'
            }, {
                id: 4,
                icon: 'icon-message-activity',
                title: '活动优惠',
                desc: item3.firstMsg || '暂无消息',
                time: item3.info_date || '',
                badge: parseInt(item3.unreadCount) || 0,
                url: 'ActivityMessage'
            }, {
                id: 5,
                icon: 'icon-message-trans',
                title: '交易物流',
                desc: item4.firstMsg || '暂无消息',
                time: item4.info_date || '',
                badge: parseInt(item4.unreadCount) || 0,
                url: 'TransMessage'
            }] : [{
                id: 0,
                icon: 'icon-message-help',
                title: '达令家客服助手',
                setId: item6.settingId,
                desc: item6.content || '暂无消息',
                time: item6.date || '',
                badge: parseInt(item6.unreadMsgNum) || 0,
                url: 'Help'
            }, {
                id: 1,
                icon: 'icon-message-sys',
                title: '达令家公告',
                desc: item5.firstMsg || '暂无消息',
                time: item5.info_date || '',
                badge: parseInt(item5.unreadCount) || 0,
                url: 'SysMessage'
            }, {
                id: 2,
                icon: 'icon-message-gold',
                title: '资产信息',
                desc: item2.firstMsg || '暂无消息',
                time: item2.info_date || '',
                badge: parseInt(item2.unreadCount) || 0,
                url: 'AssetsMessage'
            }, {
                id: 3,
                icon: 'icon-message-activity',
                title: '活动优惠',
                desc: item3.firstMsg || '暂无消息',
                time: item3.info_date || '',
                badge: parseInt(item3.unreadCount) || 0,
                url: 'ActivityMessage'
            }, {
                id: 4,
                icon: 'icon-message-trans',
                title: '交易物流',
                desc: item4.firstMsg || '暂无消息',
                time: item4.info_date || '',
                badge: parseInt(item4.unreadCount) || 0,
                url: 'TransMessage'
            }]
            let hadMessage = false
            list.forEach(item => {
                if (item.badge > 0) {
                    hadMessage = true;
                }
            })
            setConstant("isMsgBox", hadMessage);
            this.setState({
                initList: list
            })
        } catch (e) {
            this.$toast(e.message)
        }
    }

    isInit = true

    async refresh() {
        this.setState({ loaded: false })
        await this.getData();
        this.setState({ loaded: true })
        if (this.isInit) {
            this.isInit = false
            this.isLoading = false
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    task: {
        width: px(750),
        height: px(120),
        marginBottom: px(20),
        paddingHorizontal: px(24),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center'
    },
    taskLeft: {
        flex: 1
    },
    taskRight: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(120),
        height: px(50),
        borderRadius: px(8),
        overflow: 'hidden',
        backgroundColor: '#d0648f'
    },
    open: {
        fontSize: px(24),
        color: '#fff'
    },
    title: {
        fontSize: px(28),
        color: '#222',
        paddingBottom: px(14)
    },
    desc: {
        fontSize: px(22),
        color: '#999'
    },
    list: {
        flex: 1,
        backgroundColor: '#f2f2f2'
    },
    listWrap: {
        paddingLeft: px(24),
        backgroundColor: '#fff'
    },
    listItem: {
        width: px(726),
        height: px(160),
        paddingRight: px(24),
        borderTopColor: '#efefef',
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        position: 'relative',
        width: px(90),
        height: px(90),
        marginRight: px(24)
    },
    context: {
        flex: 1
    },
    head: {
        flexDirection: 'row',
    },
    name: {
        flex: 1,
        fontSize: px(32),
        color: '#222',
        lineHeight: px(52),
    },
    time: {
        fontSize: px(24),
        color: '#999',
        lineHeight: px(52),
    },
    txt: {
        fontSize: px(26),
        color: '#666',
        lineHeight: px(46)
    }
})
