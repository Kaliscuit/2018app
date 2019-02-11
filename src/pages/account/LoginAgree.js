'use strict';

import React from 'react'
import {
    View,
    TouchableOpacity,
    FlatList,
    Image
} from 'react-native'
import Page from "../../UI/Page";
import Icon from "../../UI/lib/Icon";
import {TopHeader} from '../common/Header'
import {deviceWidth, px} from "../../utils/Ratio";

export default class extends Page {
    constructor(props) {
        super(props, {
            list: []
        })

        this.list = [{
            height: px(1468),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_1.png'
        }, {
            height: px(1468),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_2.png'
        }, {
            height: px(1468),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_3.png'
        }, {
            height: px(1620),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_4.png'
        }, {
            height: px(1632),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_5.png'
        }, {
            height: px(1220),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_6.png'
        }, {
            height: px(1420),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_7.png'
        }, {
            height: px(1943),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_8.png'
        }, {
            height: px(1677),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_9.png'
        }, {
            height: px(1301),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_10.png'
        }, {
            height: px(1955),
            src: 'http://img.daling.com/st/topic/agrees/login_agree_11.png'
        }]

        this.page = 0
    }

    pageHeader() {
        return <TopHeader
            navigation={this.props.navigation}
            title="达令家店主服务协议"
            hiddenBack={true}
            leftBtn={
                <TouchableOpacity onPress={() => this.goBack()}>
                    <View style={{ height: 30, width: 30, justifyContent: "center", marginLeft: px(20) }}>
                        <Icon name="gold-close" style={{ width: px(26), height: px(28) }} />
                    </View>
                </TouchableOpacity>
            }
        />
    }

    goBack() {
        if (this.props.navigation.state.params) {
            this.props.navigation.state.params.callback && this.props.navigation.state.params.callback();
        }
        this.props.navigation.goBack();
    }

    pageBody() {
        let { list } = this.state
        return <FlatList style={{flex: 1, backgroundColor: '#fff'}}
            data={list || []}
            refreshing={false}
            keyExtractor={(item, index) => index + ''}
            renderItem={(item) => {
                return <Image style={{width: deviceWidth, height: item.item.height}} source={{uri: item.item.src}} />
            }}
            contentContainerStyle={{ backgroundColor: "#fff" }}
            onEndReached={() => this.loadNext()}
            onEndReachedThreshold={100}
        >
        </FlatList>
    }

    onReady() {
        this.page ++
        this.setState({list: this.list.slice(0, this.page)})
    }

    loadNext() {
        if (this.page <= this.list.length) {
            this.page ++
            this.setState({list: this.list.slice(0, this.page)})
        }
    }
}
