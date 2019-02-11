import React from 'react'
import {
    View,
    ScrollView,
    StyleSheet, Text, TouchableWithoutFeedback, Image,
    NativeModules,
    TouchableOpacity
} from 'react-native'
import Page, { SafeFootView } from "../../../UI/Page";
import { deviceWidth, px, isIphoneX } from "../../../utils/Ratio";
import Icon from "../../../UI/lib/Icon";
import Button from "../../../UI/lib/Button"
import Pop from "./Pop"
import Span from "../../../UI/lib/Span"
import base from "../../../styles/Base"
import { User } from "../../../services/Api"
import request from "../../../services/Request"
import { log } from "../../../utils/logs"

const IM = NativeModules.XNIMModule

function ZizhuItem(props) {
    return <TouchableOpacity onPress={() => props.onPress()}>
        <View style={styles.customItem}>
            <Icon style={styles.zizhuIcon} name={props.icon} />
            <Text style={styles.zizhuTxt}>{props.txt}</Text>
        </View>
    </TouchableOpacity>
}

export default class extends Page {
    constructor(props) {
        super(props, {
            gg: [],
            curr: {},
        });
    }

    title = '客服中心'

    pageBody() {
        return <View style={{ flex: 1 }}>
            <View style={styles.notice}>
                <View style={{ marginLeft: px(30) }}>
                    <Icon name="icon-notice" style={{ width: px(26), height: px(28) }} />
                </View>
                <TouchableWithoutFeedback onPress={() => this.go_("Notice", { id: this.state.curr.id })}>
                    <View style={styles.notice_container}>
                        <Text numberOfLines={1} allowFontScaling={false} style={styles.content}>
                            公告：
                        </Text>
                        <ScrollView ref="notice"
                            androidoverScrollMode="never"
                            pagingEnabled={true}
                            ioscanCancelContentTouches={false}
                            showsVerticalScrollIndicator={false}>
                            {this.state.gg.map((item, index) => <Text key={index} numberOfLines={1} allowFontScaling={false} style={styles.content}>
                                {item.title}
                            </Text>)}
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.actionWrap}>
                    <Icon name="icon-right" style={{ width: px(15), height: px(26) }} />
                </View>
            </View>

            <ScrollView iosalwaysBounceVertical={false} style={{ flex: 1 }}>
                <View style={styles.customCard}>
                    <View style={styles.customHead}>
                        <Span style={styles.headTxt}>自助服务</Span>
                    </View>
                    <View style={styles.customList}>
                        <ZizhuItem icon="tuihuo" txt="退货售后" onPress={() => this.go_("OrderListPage")} />
                        <ZizhuItem icon="dizhi" txt="修改地址" onPress={() => this.go_("OrderListPage")} />
                        <ZizhuItem icon="wuliu" txt="物流查询" onPress={() => this.go_("OrderListPage")} />
                        <ZizhuItem icon="weixin" txt="换绑微信" onPress={() => this.go_("InfoPage")} />
                        {!User.vip && <ZizhuItem icon="tixian" txt="我要提现" onPress={() => this.go_("MyBalancePage")} />}
                        {!User.vip && <ZizhuItem icon="gaimima" txt="支付密码设置" onPress={() => this.go_("InfoPage")} />}
                    </View>
                </View>

                <View style={styles.helpCenter}>
                    <View style={styles.helpHead}>
                        <Span style={[styles.headTxt, { flex: 1 }]}>帮助中心</Span>
                        <TouchableOpacity activeOpacity={.8} onPress={() => this.go_("CustomerServiceSearchPage")}>
                            <View style={styles.search}>
                                <Icon style={styles.searchIcon} name="icon-top-search" />
                                <Text style={styles.searchTxt}>输入关键字搜索</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <HelpBody navigation={this.props.navigation} />
                </View>
                <View style={styles.line}></View>
            </ScrollView>
        </View >
    }

    pageFooter() {
        return <View>
            <SafeFootView>
                <Button style={styles.btnKefu} txtStyle={{ fontSize: px(28) }} icon="zaixiankefu" value="在线客服" onPress={this.kefu.bind(this)} />
            </SafeFootView>
            <Pop openGroup={this.openGroup.bind()} ref="pop" navigation={this.props.navigation} />
        </View>
    }
    async onReady() {
        try {
            let res = await request.get("/dal_cec/sale/front/notice/list.do");
            this.setState({ gg: res.items }, () => this.start())
        } catch (error) {
            //
        }
    }

    timer = null;
    timeIndex = 0;
    start() {
        if (this.state.gg.length <= 0) return;
        this.setState({ curr: this.state.gg[0] })
        this.timer = setInterval(() => {
            if (!this.refs.notice) return;
            this.timeIndex++;
            if (this.timeIndex > this.state.gg.length - 1) {
                this.timeIndex = 0;
                this.refs.notice.scrollTo({ y: 0, animated: false });
            } else {
                this.refs.notice.scrollTo({ y: px(30) * this.timeIndex });
            }
            this.setState({ curr: this.state.gg[this.timeIndex] })
        }, 3000);
    }
    componentWillMount() {
        clearInterval(this.timer);
        this.timer = null;
    }
    kefu() {
        this.refs.pop.open()
    }
    async  openGroup(name) {
        try {
            let img = User.headImgUrl;
            if (img === "http://img.cdn.daling.com/data/files/mobile/img/dalingjia.jpg") {
                img = "http://img.daling.com/st/dalingjia/app/im_default_logo.png";
            }
            await IM.startChat(name, img, function (err) { });
        } catch (error) {
            // console.log(error)
        }
    }
}

class HelpBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            curr: "",
        }
    }

    render() {
        return <View style={styles.helpWrap}>
            {this.state.list.map((item, index) => <View style={styles.helps} key={index}>
                <TouchableOpacity activeOpacity={1} onPress={() => this.lockItem(index, item.child.length)}>
                    <View style={[base.line, styles.itemLabel]}>
                        <Image style={styles.labelImg} resizeMode='cover' source={{ uri: item.imgUrl }} />
                        <Span style={styles.label}>{item.cateName}</Span>
                        {item.child.length > 4 && <Icon name={this.state.curr.includes(index + ",") ? "shangjiantou" : "xiajiantou"} style={styles.labelIcon}></Icon>}
                    </View>
                </TouchableOpacity>
                <Items show={this.state.curr.includes(index + ",")} click={this.click.bind(this)} list={item.child} />
            </View>)}
        </View>
    }

    async componentDidMount() {
        try {
            let res = await request.get("/dal_cec/sale/front/qa/list.do");
            this.setState({ list: res.items })
        } catch (error) {
            //
        }
    }
    click(id) {
        this.props.navigation.navigate("AnswerPage", { id });
    }
    lockItem(i, len) {
        let curr = this.state.curr;
        const label = i + ",";
        if (curr.includes(label)) {
            curr = curr.replace(label, "");
        } else {
            curr += label
        }
        this.setState({ curr })
    }
}

function Items(props) {
    let list = [].concat(props.list);
    if (list.length > 4 && !props.show) {
        list.length = 4;
    }
    if (list.length == 1) {
        list.push({})
    }

    if (list.length == 2) {
        list.push({})
    }
    return <View style={[base.wrap_left, styles.items]}>
        {list.map((item, index) => <TouchableOpacity onPress={() => props.click(item.id)} key={index}>
            <View style={[base.inline, styles.item]}>
                <Span style={styles.itemTxt} numberOfLines={1}>{item.title}</Span>
            </View>
        </TouchableOpacity>)}
        {list.length % 2 != 0 && <View style={[base.inline, styles.item]}>
            <Span style={styles.itemTxt} numberOfLines={1}></Span>
        </View>}
    </View>
}

const styles = StyleSheet.create({
    helpItemCel: {
        width: px(236),
        height: px(90),
        borderTopWidth: px(1),
        borderTopColor: '#EFEFEF',
        borderLeftWidth: px(1),
        borderLeftColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    helpCel2: {
        width: px(474),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    helpItem: {
        flexDirection: 'row',
        width: px(710),
    },
    helpCel: {
        width: px(236), height: px(180),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: px(1),
        borderTopColor: '#EFEFEF',
    },
    notice: {
        flexDirection: 'row',
        alignItems: 'center',
        width: deviceWidth,
        height: px(50),
        backgroundColor: '#ED3F58'
    },
    notice_container: {
        flex: 1,
        marginLeft: px(11),
        marginRight: px(11),
        paddingVertical: px(10),
        flexDirection: 'row',
    },
    content: {
        fontSize: px(24),
        color: '#fff',
        lineHeight: px(28),
        height: px(30)
    },
    actionWrap: {
        marginRight: px(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    customCard: {
        width: px(710),
        borderRadius: px(12),
        backgroundColor: '#fff',
        marginLeft: px(20),
        marginTop: px(24),
        overflow: 'hidden'
    },
    customHead: {
        height: px(100),
        marginHorizontal: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#EFEFEF',
        flexDirection: 'row',
        alignItems: 'center'
    },
    headTxt: {
        fontSize: px(30),
        color: '#222',
        lineHeight: px(34)
    },
    customList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    customItem: {
        width: px(233),
        height: px(158),
        justifyContent: 'center',
        alignItems: 'center'
    },
    zizhuIcon: {
        width: px(60),
        height: px(60)
    },
    zizhuTxt: {
        marginTop: px(14),
        fontSize: px(22),
        color: "#454545"
    },
    helpCenter: {
        width: px(710),
        borderRadius: px(12),
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginLeft: px(20),
        marginTop: px(24),
    },
    helpHead: {
        height: px(100),
        paddingHorizontal: px(30),
        flexDirection: 'row',
        alignItems: 'center'
    },
    search: {
        width: px(300),
        height: px(64),
        backgroundColor: "#efefef",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    searchIcon: {
        width: px(28),
        height: px(28),
        marginLeft: px(20)
    },
    searchTxt: {
        marginLeft: px(14),
        fontSize: px(28),
        color: "#B2B3B5"
    },
    helpWrap: {
        width: px(710)
    },
    btnKefu: {
        width: deviceWidth
    },
    line: {
        height: px(180)
    },
    helps: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    itemLabel: {
        width: px(236),
        borderTopColor: "#efefef",
        height: px(180),
        borderTopWidth: px(1),
    },
    labelImg: {
        width: px(44),
        height: px(44),
        marginBottom: px(20)
    },
    label: {
        fontSize: px(28),
        color: '#222'
    },
    labelIcon: {
        width: px(24),
        height: px(12),
        marginTop: px(14)
    },
    items: {
        width: px(475)
    },
    item: {
        width: px(235),
        height: px(90),
        borderTopWidth: px(1),
        borderLeftWidth: px(1),
        borderColor: "#efefef"
    },
    itemTxt: {
        fontSize: px(28),
        color: '#222'
    }
})