'use strict';

import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { getShopDetail } from '../../services/Api';
import { px } from '../../utils/Ratio';
import { get } from '../../services/Request';
import { show as toast } from '../../widgets/Toast';
import { TopHeader } from '../common/Header'
import T from '../common/TabsTest'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view2'
import Tab from '../common/TabsTest'
import base from '../../styles/Base'
import {FootView} from '../../UI/Page'
import Icon from '../../UI/lib/Icon'

const deviceHeight = Dimensions.get('window').height;
const PAGE_SIZE = 20;

//列表项
class CouponItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { stunner, selectedList } = this.props
        return <View>
            {this.props.use &&
                <View style={stunner_style.stunner}>
                    <Icon name="icon-gold-bg" style={{ width: px(690), height: px(264), position: 'absolute' }} />
                    <View style={[stunner_style.stunnerBox]}>
                        <View style={stunner_style.body}>
                            <View style={[base.text_center, stunner_style.moneyBox]}>
                                <View style={base.inline}>
                                    <Icon name="goldMoney" 
                                        style={{ width: px(28), height: px(28), marginRight: px(6), marginTop: px(20) }} />
                                    <Text allowFontScaling={false} style={stunner_style.stunnerMoney}>{stunner.amountStr}</Text>
                                </View>
                            </View>
                            <Icon name="icon-gold-line"
                                resizeMode='cover'
                                style={{ width: px(1), height: px(190) }} />
                            <View style={stunner_style.infoBox}>
                                <View>
                                    <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerName}>{stunner.name}</Text>
                                    <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerShop}>使用店铺:{stunner.shopName}</Text>
                                </View>
                                <Text numberOfLines={3} allowFontScaling={false} style={stunner_style.desc}>{stunner.describe}</Text>
                            </View>
                            <View style={stunner_style.btn}>
                                <TouchableOpacity style={stunner_style.stunnerSelect} onPress={() => this.props.selectTo()}>
                                    {this.props.selectedList !== stunner.stunnerLogId && <Icon name="icon-gold-radiusCheck" style={{ width: px(34), height: px(34) }} />}
                                    {this.props.selectedList == stunner.stunnerLogId && <Icon name="icon-gold-radiusChecked" style={{ width: px(34), height: px(34) }} />}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[base.inline_between, stunner_style.foot]}>
                            <Text allowFontScaling={false} style={stunner_style.footDate}>{stunner.startDateStr} - {stunner.endDateStr}</Text>
                        </View>
                    </View>
                </View>
            }
            {!this.props.use && <View style={stunner_style.stunner}>
                <Icon name="icon-gold-bg1"
                    resizeMode='cover'
                    style={{ width: px(690), height: px(264), position: 'absolute' }} />
                <View style={[stunner_style.stunnerBox]}>
                    <View style={stunner_style.body}>
                        <View style={[base.text_center, stunner_style.moneyBox]}>
                            <View style={base.inline}>
                                <Icon name="goldMoney" 
                                    resizeMode='cover'
                                    style={{ width: px(28), height: px(28), marginRight: px(6), marginTop: px(20) }} />
                                <Text allowFontScaling={false} style={stunner_style.stunnerMoney}>{stunner.amountStr}</Text>
                            </View>
                        </View>
                        <Icon name="icon-gold-line"
                            resizeMode='cover'
                            style={{ width: px(1), height: px(190) }} />
                        <View style={stunner_style.infoBox}>
                            <View>
                                <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerName}>{stunner.name}</Text>
                                <Text numberOfLines={1} allowFontScaling={false} style={stunner_style.stunnerShop}>使用店铺:{stunner.shopName}</Text>
                            </View>
                            <Text numberOfLines={3} allowFontScaling={false} style={stunner_style.desc}>{stunner.describe}</Text>
                        </View>
                    </View>
                    <View style={[base.inline_between, stunner_style.foot]}>
                        <Text allowFontScaling={false} style={stunner_style.footDate}>{stunner.startDateStr} - {stunner.endDateStr}</Text>
                    </View>
                </View>
            </View>}
        </View>
    }

}

class CouponList extends React.Component {

    constructor(props) {
        super(props)
    }
    render() {
        let list = this.props.list;
        return <View style={{ flex: 1 }}>
            <FlatList
                style={{ flex: 1 }}
                keyExtractor={(item) => item.code}
                data={list || []}
                renderItem={({ item }) =>
                    <CouponItem
                        navigation={this.props.navigation}
                        use={this.props.use}
                        selectTo={() => this.props.selectTo(item.stunnerLogId)}
                        stunner={item}
                        selectedList={this.props.id} />
                }
                ListFooterComponent={
                    <View style={{ height: px(120) }}></View>
                }
                ListEmptyComponent={
                    list && <View style={{ flex: 1, height: deviceHeight - px(300), justifyContent: 'center' }}><Text style={styles.emptyList} allowFontScaling={false}>{this.props.use ? '小主，您没有可使用金币哦~' : '小主，您没有不可使用金币哦~'}</Text></View>
                }
            />
            {
                this.props.use && list.length != 0 && 
                    <FootView style={styles.shareBox}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.props.shareTo()}>
                            <View style={styles.shareBtn}>
                                <Text allowFontScaling={false} style={styles.share}>确定</Text>
                            </View>
                        </TouchableOpacity>
                    </FootView>
                
            }
        </View>
    }

}

//列表
export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            stunners1: this.props.navigation.state.params.stunners1,
            stunners2: this.props.navigation.state.params.stunners2,
            id: this.props.navigation.state.params.id || "",
        };
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <TopHeader navigation={this.props.navigation}
                    title="使用金币"></TopHeader>
                <ScrollableTabView
                    locked
                    initialPage={0}
                    tabBarBackgroundColor="#fff"
                    tabBarInactiveTextColor="#858385"
                    tabBarActiveTextColor="#d0648f"
                    tabBarUnderlineStyle={{ backgroundColor: '#d0648f' }}
                    tabBarTextStyle={{}}
                    renderTabBar={() => <T paddingValue={80} />}
                    onChangeTab={(t) => this.onChangeT(t)}>
                    <CouponList
                        id={this.state.id}
                        navigation={this.props.navigation}
                        key={1}
                        tabLabel='可使用金币'
                        use={true}
                        selectTo={(id) => this.selectTo(id)}
                        shareTo={() => this.shareTo()}
                        list={this.state.stunners1} />
                    <CouponList navigation={this.props.navigation} key={2} tabLabel='不可使用金币' use={false} list={this.state.stunners2} />
                </ScrollableTabView>

            </View>
        )
    }
    onChangeT(page) {
        this.setState({ page: page.i })
    }
    selectTo(id) {
        if (this.state.id === id) id = '';
        this.setState({ id: id })
    }
    shareTo = () => {
        const pid = this.props.navigation.state.params.id
        if (this.state.id) {
            this.props.navigation.state.params.callbackF(this.state.id);
        } else {
            if (pid == null || pid == '') {
                //
            } else {
                this.props.navigation.state.params.callbackF(this.state.id);
            }
        }
        this.props.navigation.goBack();
    }
}

const styles = StyleSheet.create({
    shareBox: {
        width: px(750),
        height: px(100),
        backgroundColor: '#fff',
        borderTopWidth: px(1),
        borderTopColor: '#cecece'
    },
    shareBtn: {
        width: px(750),
        height: px(100),
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor: '#fff',
    },
    share: {
        textAlign: 'center',
        fontSize: px(34),
        color: '#d0648f'
    },
    emptyList: {
        fontSize: px(26),
        marginTop: px(50),
        textAlign: 'center',
        color: '#858585'
    },
    tab_title: {
        height: px(80)
    }
})
const stunner_style = StyleSheet.create({
    stunner: {
        width: px(690),
        height: px(264),
        marginTop: px(20),
        marginLeft: px(30),
        marginRight: px(30),
        // backgroundColor: '#d0648f',
        borderRadius: px(10),
        overflow: 'hidden',
        /*shadowColor: '#000',
        shadowOffset: { width: 0, height: px(10) },
        shadowRadius: px(10),
        shadowOpacity: 0.12,
        elevation: 4,*/
    },
    stunnerBox: {
        flex: 1
    },
    body: {
        flexDirection: 'row',
        paddingHorizontal: px(10),
        //paddingTop: px(30),
        paddingBottom: px(20),
        height: px(194)
    },
    moneyBox: {
        width: px(210),
        paddingTop: px(30),
        //height:px(194),
        /*borderRightColor: '#e698b7',
        borderRightWidth: px(1)*/
    },
    stunnerMoneyI: {
        color: '#fff',
        fontSize: px(40),
        marginTop: px(20),
        backgroundColor: 'transparent'
    },
    stunnerMoney2: {
        color: '#fff',
        fontSize: px(22),
        backgroundColor: 'transparent'
    },
    stunnerMoney: {
        color: '#fff',
        fontSize: px(70),
        backgroundColor: 'transparent'
    },
    infoBox: {
        width: px(370),
        paddingTop: px(30),
        paddingHorizontal: px(40),
        //height: px(162),
        overflow: "hidden",
    },
    desc: {
        marginTop: px(10),
        color: '#fff',
        fontSize: px(22),
        backgroundColor: 'transparent'
    },
    btn: {
        paddingTop: px(80),
        paddingRight: px(10)
    },
    foot: {
        paddingHorizontal: px(20),
        paddingBottom: px(5),
        flex: 1
    },
    footDate: {
        fontSize: px(22),
        color: '#929292',
        lineHeight: px(30),
        backgroundColor: 'transparent'
    },
    btnUse: {
        borderColor: '#d1d1d1',
        borderWidth: px(2),
        borderRadius: px(30),
        paddingHorizontal: px(20),
        paddingVertical: px(5)
    },
    btnUseTxt: {
        fontSize: px(22),
        color: '#404040',
        backgroundColor: 'transparent'
    },
    stunnerName: {
        fontSize: px(32),
        color: '#fff',
        marginBottom: px(10),
        backgroundColor: 'transparent'
    },
    stunnerShop: {
        fontSize: px(22),
        color: '#fff',
        marginBottom: px(5),
        backgroundColor: 'transparent'
    },
    stunnerSelect: {
        width: px(82),
        justifyContent: 'center',
        alignItems: 'center'
    },
})