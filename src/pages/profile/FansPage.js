'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Dimensions,
    Clipboard,
    TextInput,
    Platform
} from 'react-native';
import { px } from '../../utils/Ratio';
import request, { domain } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { config } from '../../services/Constant';
import { Header, SearchView } from '../common/Header'
import Loading from '../../animation/Loading'
import TabView from 'react-native-scrollable-tab-view2'
import { TabBar } from "../common/Tabs"
import List from "../common/List"
import tools from "../../utils/tools"
import Icon from "../../UI/lib/Icon"
import { EButton } from "../../UI/lib/Button"
import base from "../../styles/Base"

const deviceWidth = Dimensions.get('window').width;


class VipList extends List {

    header() {
        return <View style={vipStyle.topline}>
            <SearchView goSearch={txt => this.search(txt)} placeholder="请输入VIP的手机号/微信号/微信名" />
        </View>
    }
    renderItem(item, index) {
        return <View style={vipStyle.box}>
            <View style={vipStyle.leftBox}>
                <View style={vipStyle.imgBox}>
                    <Image style={vipStyle.img} source={{ uri: item.headimgurl }} />
                </View>
                <View style={vipStyle.info}>
                    <Text style={vipStyle.tit}>{item.nickname ? item.nickname : "未绑定微信"}</Text>
                    <View style={[base.inline_left, vipStyle.txtBox]}>
                        <Text style={vipStyle.txt2}>微信号 {item.wechatid ? item.wechatid : "未填写"}</Text>
                        {/* {item.wechatid && <EButton onPress={() => this.copy(item.wechatid)} value="复制" style={vipStyle.btn1} txtStyle={vipStyle.btn1Txt} />} */}
                        {item.wechatid && <TouchableOpacity style={vipStyle.btn1} onPress={() => this.copy(item.wechatid)}>
                            <Text style={vipStyle.btn1Txt}>复制</Text>
                        </TouchableOpacity>}
                    </View>
                    <Text style={vipStyle.txt}>注册时间 {tools.formatStr(item.time, "yyyy.MM.dd")}</Text>
                </View>
            </View>
            <View style={vipStyle.tellBox}>
                {item.mobile != "" && item.showmobileyn == "Y" && <TouchableOpacity onPress={() => tools.toCall(item.mobile)}>
                    <View>
                        <Icon name="icon-tell" style={vipStyle.tell} />
                    </View>
                </TouchableOpacity>}
                {(!item.mobile || item.showmobileyn != "Y") &&
                    <Icon name="icon-tell2" style={vipStyle.tell} />}

            </View>
        </View>
    }

    emptyTxt = "没有找到相关客户";
    txt = "";
    search(txt) {
        this.txt = txt;
        this.refresh();
    }
    async load(start) {
        try {
            let res = await request.get(`${domain}/xc_uc/uc/manager/my/queryUserBrowse.do?`, {
                type: 1,
                start,
                searchValue: this.txt
            });
            this.props.setTabCount && this.props.setTabCount(res.totalCount);
            return res;
        } catch (e) {
            toast(e.message);
            return { items: [] };
        }
    }

    copy(link) {
        Clipboard.setString(link);
        toast("微信号已复制到剪切板，可直接粘贴使用")
    }
}
const vipStyle = StyleSheet.create({
    topline: {
        borderTopColor: "#efefef",
        borderTopWidth: 1,
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#fff",
        paddingVertical: 15,
        marginTop: 12,
        marginHorizontal: 12,
        borderRadius: 6,
    },
    leftBox:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    imgBox: {
        width: 75,
        height: 45,
        borderRadius: 6,
        overflow: "hidden",
        alignItems: 'center',
    },
    img: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
    },
    info: {
        width: 180,
    },
    tit: {
        fontSize: 16,
        color: "#222",
        marginBottom: 10,
        fontWeight: "700"
    },
    txtBox: {
        marginBottom: 5
    },
    txt2: {
        fontSize: 12,
        color: "#666",
    },
    txt: {
        fontSize: 12,
        color: "#666",
    },
    tell: {
        width: 18,
        height: 18,
    },
    tellBox: {
        width: 80,
        height: 20,
        borderLeftWidth: 1,
        borderColor: "#e1e1e1",
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn1: {
        borderColor: "#ccc",
        width: 30,
        height: 14,
        marginLeft: 5,
        borderWidth: 1,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn1Txt: {
        fontSize: 10,
        color: "#222222",
        lineHeight: Platform.OS === "ios" ? 10 : 13,
    },
})

class TrvList extends List {

    header() {
        return <View style={trvStyle.topline}>
            <SearchView goSearch={txt => this.search(txt)} placeholder="请输入游客的微信名" />
        </View>
    }

    renderItem(item, index) {
        return <View style={trvStyle.box}>
            <View style={trvStyle.imgBox}>
                <Image style={trvStyle.img} source={{ uri: item.headimgurl }} />
            </View>
            <View style={trvStyle.info}>
                <Text style={trvStyle.tit}>{item.nickname}</Text>
                <Text style={trvStyle.txt}>最近浏览 {tools.formatStr(item.time, "yyyy.MM.dd")}</Text>
            </View>
        </View>
    }
    txt = "";
    emptyTxt = "没有找到相关客户";
    search(txt) {
        this.txt = txt;
        this.refresh();
    }

    async load(start) {
        try {
            let res = await request.get(`${domain}/xc_uc/uc/manager/my/queryUserBrowse.do?`, {
                type: 2,
                start,
                searchValue: this.txt
            });
            this.props.setTabCount && this.props.setTabCount(res.totalCount);
            return res;
        } catch (e) {
            toast(e.message);
            return { items: [] };
        }
        // try {
        //     let res = await request.get(`/recruit/list.do?type=2&start=${start}&limit=20`);
        //     return res;
        // } catch (e) {
        //     toast(e.message);
        //     return { items: [] };
        // }
    }
}

const trvStyle = StyleSheet.create({
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: "#fff",
        marginTop: 12,
        marginHorizontal: 12,
        paddingVertical: 15,
        borderRadius: 6,
    },
    topline: {
        borderTopColor: "#efefef",
        borderTopWidth: 1,
    },
    leftBox:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    imgBox: {
        width: 45,
        height: 45,
        borderRadius: 23,
        overflow: "hidden",
        marginHorizontal: 15,
    },
    img: {
        width: 45,
        height: 45,
    },
    info: {
        width: 200,
    },
    tit: {
        fontSize: 16,
        color: "#222",
        marginBottom: 8,
        fontWeight: "700"
    },
    txt: {
        fontSize: 12,
        color: "#666",
    },
})

export default class extends Component {

    constructor(props) {
        super(props);
        this.hasNext = true;
        this.start = 0;
        this.state = {
            index: 0,
            count1: 0,
            count2: 0
        };
    }
    render() {
        const { list, refreshing, invitationCode, fansCount } = this.state
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
            <Header navigation={this.props.navigation} title="客户管理" rightBtn={<TouchableOpacity onPress={() => this.goVip()}>
                <Text style={{ color: "#858385" }}>邀请VIP</Text>
            </TouchableOpacity>} />

            <TabBar ref={e => this.tabs = e}
                index={0}
                data={[{ name: "VIP列表(共" + this.state.count1 + ")", id: 1 }, { name: "游客列表(共" + this.state.count2 + ")", id: 2 }]}
                onChange={index => this.tabChange(index)} />

            <TabView page={this.state.index}
                prerenderingSiblingsNumber={3}
                initialPage={0}
                lazy={true}
                onChangeTab={(i) => this.pageChange(i)}
                renderTabBar={false}>
                <VipList show={true} setTabCount={this.setTabCount1.bind(this)} />
                <TrvList show={true} setTabCount={this.setTabCount2.bind(this)} />
            </TabView>
        </View>
    }
    setTabCount1(count1) {
        this.setState({ count1 })
        this.tabs.refresh();
    }
    setTabCount2(count2) {
        this.setState({ count2 })
        this.tabs.refresh();
    }

    tabChange(index) {
        if (this.state.index != index) this.setState({ index })
    }
    pageChange(i) {
        this.tabs.setIndex2(i.i);
    }
    goVip() {
        this.props.navigation.navigate('InvitationVipPage')
    }
}


const styles = StyleSheet.create({
    fansNum: {
        borderWidth: 1,
        paddingLeft: px(30),
        paddingRight: px(30),
        borderColor: '#fbfafc',
        height: px(80),
        display: 'flex',
        width: px(750),
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    fansNumItem: {
        color: '#858385'
    },
    recruit: {
        paddingLeft: px(30),
        paddingRight: px(30),
        paddingTop: px(25),
        paddingBottom: px(25),
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: px(140),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef',
        backgroundColor: '#fff'
    },
    recruitHeadWrap: {
        marginRight: px(20),
        width: px(90),
        height: px(90)
    },
    recruitHead: {
        width: px(90),
        height: px(90),
        borderRadius: px(45),
    },
    recruitInfo: {
        flex: 1
    },
    recruitName: {
        fontSize: px(28),
        color: '#252426',
        height: px(45),
        textAlignVertical: 'center'
    },
    recruitName2: {
        fontSize: px(28),
        color: '#252426',
        height: px(45),
        textAlignVertical: 'center'
    },
    recruitDate: {
        marginTop: px(45),
        height: px(45),
        textAlignVertical: 'center',
        fontSize: px(24)
    }
});