'use strict'

import React, {Component} from 'react'
import {
    View,
    StyleSheet,
    Text,
    NativeModules,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image, BackHandler,
} from 'react-native'
import Page from '../../UI/Page'
import Icon from '../../UI/lib/Icon'
import {deviceWidth, px} from "../../utils/Ratio";
import {log, logErr} from "../../utils/logs"
import List from '../common/List'
import Empty from './empty'
import {get, post} from '../../services/Request'
import {dateFormat, nullStr, isGroup} from './utils'
import Event from "../../services/Event";

class ActivityList extends List {
    listStyle = {
        flex: 1,
        backgroundColor: 'transparent'
    }

    groupTitle = ''

    groupFlag = []

    renderItem(item, index) {
        let is = this.isExpired(nullStr(item.info_ext && item.info_ext.expired_date) ? item.info_ext.expired_date : null)
        let df = dateFormat(item.info_date)
        let group = true
        if (this.groupFlag.length > index) {
            group = this.groupFlag[index]
        } else {
            group = isGroup(this.groupTitle, df)
            this.groupFlag.push(group)
            this.groupTitle = df
        }
        if (group) {
            return <View style={styles.newWrap}>
                <View style={styles.newDate}>
                    <Text style={styles.newDateTxt}>
                        {df}
                    </Text>
                </View>
                <TouchableWithoutFeedback onPress={() => this.go(is, item.info_ext)}>
                    <View style={[styles.listItem]}>
                        <View style={styles.posterWrap}>
                            <Image style={styles.poster} source={{uri: nullStr(item.info_ext && item.info_ext.img_url) ? item.info_ext.img_url : ''}}/>
                            {is ? <View style={styles.modal}>
                                <Icon name={'icon-over'} width={px(182)} height={px(182)}/>
                            </View> : null}
                        </View>
                        <View style={styles.head}>
                            <View style={styles.title}>
                                <Text style={[styles.name, is ? {color: '#ccc'} : {}]}>{item.info_til}</Text>
                                {/*<Text style={[styles.time, is ? {color: '#ccc'} : {}]}>{dateFormat(item.info_date)}</Text>*/}
                            </View>
                            <Text numberOfLines={2} style={[styles.desc, is ? {color: '#ccc'} : {}]}>
                                {item.info_body}
                            </Text>
                        </View>
                        <View style={styles.foot}>
                            <Text style={[styles.detail, is ? {color: '#ccc'} : {}]}>查看详情</Text>
                            {
                                is ? <Icon name="icon-go-gray" style={{width: px(12), height: px(22)}}/> : <Icon name="icon-go" style={{width: px(12), height: px(22)}}/>
                            }
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        }
        return <TouchableWithoutFeedback onPress={() => this.go(is, item.info_ext)}>
            <View style={[styles.listItem]}>
                <View style={styles.posterWrap}>
                    <Image style={styles.poster} source={{uri: nullStr(item.info_ext && item.info_ext.img_url) ? item.info_ext.img_url : ''}}/>
                    {is ? <View style={styles.modal}>
                        <Icon name={'icon-over'} width={px(182)} height={px(182)}/>
                    </View> : null}
                </View>
                <View style={styles.head}>
                    <View style={styles.title}>
                        <Text style={[styles.name, is ? {color: '#ccc'} : {}]}>{item.info_til}</Text>
                        {/*<Text style={[styles.time, is ? {color: '#ccc'} : {}]}>{dateFormat(item.info_date)}</Text>*/}
                    </View>
                    <Text numberOfLines={2} style={[styles.desc, is ? {color: '#ccc'} : {}]}>
                        {item.info_body}
                    </Text>
                </View>
                <View style={styles.foot}>
                    <Text style={[styles.detail, is ? {color: '#ccc'} : {}]}>查看详情</Text>
                    {
                        is ? <Icon name="icon-go-gray" style={{width: px(12), height: px(22)}}/> : <Icon name="icon-go" style={{width: px(12), height: px(22)}}/>
                    }
                </View>
            </View>
        </TouchableWithoutFeedback>
    }

    go(is, extras) {
        if (!extras || is) return;
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

    isExpired(format) {
        if (format) {
            let date = new Date(format.replace(/-/g, '/'))
            if (date.getTime() && date.getTime() >= Date.now()) {
                return false
            } else {
                return true
            }
        }

        return true
    }

    empty() {
        return <Empty/>
    }

    footer() {
        return <View style={{width: deviceWidth, height: px(20)}}></View>
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
            let res = await get("https://dalingjia.com/msg_box/api/msgList.do?msgType=active_notice&start=" + page)
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

    title = '活动优惠'

    pageBody() {
        return <View style={[styles.container, {
            backgroundColor: this.state.color
        }]}>
            <View style={styles.list}>
                <ActivityList list={this.state.initList} updated={this.backgroundUpdated.bind(this)}
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
            let res = await get("https://dalingjia.com/msg_box/api/msgList.do?msgType=active_notice&start=0")
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
        marginHorizontal: px(24),
    },
    listItem: {
        width: px(702),
        marginTop: px(20),
        borderRadius: px(10),
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    head: {
        paddingHorizontal: px(24),
    },
    poster: {
        width: px(702),
        // height: px(238),
        height: px(308)
    },
    posterWrap: {
        position: 'relative',
        width: px(702),
        height: px(308),
    },
    name: {
        fontSize: px(32),
        color: '#222',
        flex: 1,
    },
    time: {
        fontSize: px(24),
        color: '#999',
    },
    desc: {
        fontSize: px(28),
        lineHeight: px(36),
        color: '#999',
        paddingBottom: px(30),
    },
    title: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: px(30),
        paddingBottom: px(14),

    },
    detail: {
        flex: 1,
        fontSize: px(28),
        color: '#222'
    },
    foot: {
        paddingVertical: px(20),
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: px(20),
        paddingHorizontal: px(4),
        borderTopColor: '#efefef',
        borderTopWidth: px(1)
    },
    modal: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: px(702),
        height: px(308),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(34,34,34,0.5)'
    },
    newWrap: {
        width: px(702),
    },
    newDate: {
        width: px(702),
        marginTop: px(40),
        justifyContent: 'center',
        alignItems: 'center'
    },
    newDateTxt: {
        fontSize: px(24),
        color: '#999'
    }
})
