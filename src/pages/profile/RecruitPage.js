'use strict';

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableWithoutFeedback
} from 'react-native';

import { px, isIphoneX } from '../../utils/Ratio';
import { get } from '../../services/Request';
import { log, logErr, logWarm } from '../../utils/logs'
import { show as toast } from '../../widgets/Toast';
import { TopHeader } from '../common/Header'
import Loading from '../../animation/Loading'
import {FootView} from '../../UI/Page'

const PAGE_SIZE = 30;

class RecruitItem extends React.PureComponent {

    render() {
        const recruit = this.props.recruit;
        return <View style={styles.recruit}>
            <View style={styles.recruitHeadWrap}>
                {
                    recruit.headImgUrl &&
                        <Image source={{ uri: recruit.headImgUrl }}
                            style={styles.recruitHead} />
                     || <View></View>
                }
            </View>
            <View style={styles.recruitInfo}>
                <View style={{flexDirection: 'row', alignItems: 'center', height: px(45)}}>
                    <Text allowFontScaling={false} style={styles.recruitName}>{recruit.nickName}</Text>
                    {recruit.status == '2' ? <View style={styles.wjWrap}>
                        <Text allowFontScaling={false} style={styles.wj}>{recruit.statusName}</Text>
                    </View> : null}
                </View>
                <Text allowFontScaling={false} style={styles.recruitName2}>{recruit.realName} {recruit.mobile}</Text>
            </View>
            <Text allowFontScaling={false} style={styles.recruitDate}>销售日期 {recruit.recruitDate}</Text>
        </View>
    }

}

class RecruitGroupItem extends React.PureComponent {

    render() {
        const recruit = this.props.recruit;
        return <View style={styles.recruit}>
            <View style={styles.recruitHeadWrap}>
                {
                    recruit.headImgUrl &&
                        <Image source={{ uri: recruit.headImgUrl }}
                            style={styles.recruitHead} />
                     || <View></View>
                }
            </View>
            <View style={styles.recruitInfo}>
                <View style={{flexDirection: 'row', alignItems: 'center', height: px(45)}}>
                    <Text allowFontScaling={false} style={styles.recruitName}>{recruit.nickName}</Text>
                </View>
                <Text allowFontScaling={false} style={styles.recruitName2}>{recruit.realName} {recruit.mobile}</Text>
            </View>
            <View>
                <Text allowFontScaling={false} style={styles.sales}>精选销售 ({recruit.recruitCount})</Text>
            </View>
        </View>
    }

}

const TabItem = ({ label, actived, click }) =>
    <TouchableWithoutFeedback onPress={click}>
        <View style={styles.tabItem}>
            <View style={styles.name}>
                <Text style={{
                    fontSize: px(28),
                    color: actived ? '#d0648f' : '#858385'
                }}>{label}</Text>
            </View>
            {
                actived && <View style={styles.curor}></View>
            }
        </View>
    </TouchableWithoutFeedback>
;

class Sale extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { listData, reload, reloading, nextPage, activedTabName } = this.props;
        return <FlatList
            ref="list"
            style={{ flex: 1 }}
            data={listData || []}
            refreshing={reloading}
            onRefresh={() => reload()}
            keyExtractor={(item, index) => index}
            renderItem={({ item, index }) =>
                activedTabName == 'Personal' ? <RecruitItem recruit={item} /> : <RecruitGroupItem recruit={item} />
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => nextPage()}
            ListEmptyComponent={
                listData && <Text allowFontScaling={false} style={{
                    fontSize: px(26),
                    marginTop: px(50),
                    textAlign: 'center',
                    color: '#858385'
                }}>
                    暂无相关数据</Text>
            }
        />
    }
}

export default class RecruitPage extends React.Component {

    constructor(props) {
        super(props);
        this.hasNext = true;
        this.start = 0;
        this.state = {
            personList: [],
            teamList: [],
            shopCount: null,
            isPink: false,
            lastMonthCount: 0,
            currentMonthCount: 0,
            personTotal: 0,
            teamTotal: 0,
            activedTabName: 'Personal',
            date: ''
        };
        this.tabName = 'Personal';
        this.once = false;
    }

    render() {
        return <View style={{ flex: 1, backgroundColor: '#f6f5f7' }}>
            <TopHeader boxStyles={{
                borderBottomColor: "#efefef",
                borderBottomWidth: px(1),
            }} navigation={this.props.navigation}
            title="精选销售"></TopHeader>

            <View style={styles.tabContainer}>
                <TabItem label="个人精选销售" click={() => this.__onSwitchTab('Personal')} actived={this.state.activedTabName == 'Personal'} />
                <TabItem label="渠道精选销售" click={() => this.__onSwitchTab('Team')} actived={this.state.activedTabName == 'Team'} />
            </View>
            {
                this.state.activedTabName == 'Personal' && <View style={styles.tipBorder}>
                    <View style={styles.tip}>
                        {(this.state.personTotal || this.state.personTotal == '0') &&
                            <Text allowFontScaling={false} style={{
                                backgroundColor: '#fff', fontSize: px(28),
                                color: '#858385'
                            }}>
                                精选销售记录（{this.state.personTotal}）
                            </Text>
                        }
                        {
                            this.state.isPink &&
                                <View style={styles.tip_right}>
                                    <Text style={styles.month} allowFontScaling={false}>热度：</Text>
                                    <Text style={[styles.month, { marginLeft: px(20) }]} allowFontScaling={false}>上月{this.state.lastMonthCount}</Text>
                                </View>

                        }
                    </View>
                </View>
            }
            {
                this.state.activedTabName == 'Team' && <View style={styles.tipBorder}>
                    <View style={styles.tip}>
                        {(this.state.teamTotal || this.state.teamTotal == '0') &&
                            <Text allowFontScaling={false} style={{
                                backgroundColor: '#fff', fontSize: px(28),
                                color: '#858385'
                            }}>
                                渠道精选销售记录({this.state.teamTotal})
                            </Text>
                        }
                        <Text allowFontScaling={false} style={{
                            backgroundColor: '#fff', fontSize: px(22),
                            color: '#858385'
                        }}>
                            数据截止:{this.state.date} 0点
                        </Text>
                    </View>
                </View>
            }

            <Sale ref="flatlist" listData={this.state.activedTabName == 'Team' ? this.state.teamList : this.state.personList} reload={() => this.refresh()} activedTabName={this.state.activedTabName} reloading={false} nextPage={() => this.next()} />
            <View style={{ width: px(750), height: isIphoneX() ? px(155) : px(95) }} />
            <Loading ref='loading' />
            <FootView>
                <Text allowFontScaling={false} style={{
                    fontSize: px(30),
                    includeFontPadding: false,
                    paddingTop: px(28),
                    height: px(90),
                    width:px(750),
                    color: '#fff',
                    backgroundColor: '#d0648f',
                    textAlign: 'center'
                }}
                onPress={() => this.goInvitePage()}>
                    推荐好友成为店主
                </Text>
            </FootView>
        </View>
    }

    async __onSwitchTab(tabName) {
        if (this.loading) return false;
        if (this.state.activedTabName == tabName) {
            return false;
        }
        this.tabName = tabName;

        if (!this.once) {
            this.teamTotal = await this.totalGroup();
            this.once = true;
        }

        this.refs.loading.open();
        await this.refresh();
    }

    async componentDidMount() {
        this.refs.loading.open();
        await this.refresh();
        let now = new Date()
        let y = now.getFullYear()
        let m = now.getMonth()
        let d = now.getDate()
        this.setState({
            date: y + '年' + (m + 1 < 10 ? '0' + (m + 1) : m + 1) + '月' + (d < 10 ? '0' + d : d) + '日'
        })
    }

    goInvitePage() {
        this.props.navigation.navigate('InvitePage', {});
    }

    async refresh() {
        this.hasNext = true;
        this.start = 0;
        let res = {};
        if (this.tabName == 'Personal') {
            res = await this.load();
            this.refs.loading.close()
            this.setState({
                personList: res.items || [],
                personTotal: res.shopCount,
                currentMonthCount: res.currentMonthCount,
                isPink: res.isPink,
                lastMonthCount: res.lastMonthCount,
                activedTabName: this.tabName
            });
        } else if (this.tabName == 'Team') {
            res = await this.loadGroup();
            this.refs.loading.close()
            this.setState({
                teamList: res.items || [],
                teamTotal: this.teamTotal,
                activedTabName: this.tabName
            });
        }

    }

    async next() {
        let res = {};
        if (this.state.activedTabName == 'Personal') {
            res = await this.load();
            this.setState({
                personList: (this.state.personList || []).concat(res.items || [])
            });
        } else if (this.state.activedTabName == 'Team') {
            res = await this.loadGroup();
            this.setState({
                teamList: (this.state.teamList || []).concat(res.items || [])
            });
        }

    }

    async load() {
        if (!this.hasNext || this.loading) {
            return [];
        }
        this.loading = true;
        try {
            let res = await get(`/recruit/list.do?type=1&start=${this.start}&limit=${PAGE_SIZE}`);
            this.start = this.start + 1;
            this.hasNext = this.start * PAGE_SIZE < res.shopCount;
            this.loading = false;
            return res;
        } catch (e) {
            toast(e.message);
            this.loading = false;
            return { items: [] };
        } finally {
            // this.loading = false;
        }
    }

    async loadGroup() {
        if (!this.hasNext || this.loading) {
            return [];
        }
        this.loading = true;

        try {
            let res = await get(`/recruit/community/list.do?start=${this.start}&limit=${PAGE_SIZE}`);
            this.start = this.start + 1;
            this.hasNext = this.start * PAGE_SIZE < res.totalCount;
            this.loading = false;
            return res;
        } catch (e) {
            toast(e.message);
            this.loading = false;
            return { items: [] };
        } finally {
            // this.loading = false;
        }
    }

    async totalGroup() {
        try {
            let res = await get(`/recruit/community/total.do`);
            return res;
        } catch (e) {
            toast(e.message);
            return 0;
        }
    }

}


const styles = StyleSheet.create({
    recruit: {
        paddingLeft: px(30),
        paddingRight: px(30),
        paddingTop: px(25),
        paddingBottom: px(25),
        flexDirection: 'row',
        alignItems: 'flex-end',
        minHeight: px(140),
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
        textAlignVertical: 'center'
    },
    wjWrap: {
        width: px(88),
        height: px(32),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: px(10),
        borderWidth: px(1),
        borderColor: '#ccc',
        borderRadius: px(5),
        overflow: 'hidden'
    },
    wj: {
        fontSize: px(22),
        color: '#999',
    },
    recruitName2: {
        fontSize: px(28),
        color: '#252426',
        minHeight: px(45),
        textAlignVertical: 'center'
    },
    recruitDate: {
        marginTop: px(45),
        height: px(45),
        textAlignVertical: 'center',
        fontSize: px(24),
        color: '#858385'
    },
    tip: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingLeft: px(30),
        paddingRight: px(30),
        alignItems: 'center'
    },
    tipBorder: {
        width: px(750),
        height: px(60),
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1),
    },
    tip_right: {
        flexDirection: 'row',
    },
    month: {
        fontSize: px(28),
        color: '#858385'
    },
    tabContainer: {
        flexDirection: 'row',
        width: px(750),
        height: px(80),
        marginBottom: px(20),
        backgroundColor: '#fbfafc',
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    tabItem: {
        width: px(375),
        height: px(80),
        alignItems: 'center'
    },
    name: {
        width: px(375),
        height: px(77),
        alignItems: 'center',
        justifyContent: 'center'
    },
    curor: {
        width: px(60),
        height: px(3),
        backgroundColor: '#d0648f'
    },
    sales: {
        height: px(45),
        fontSize: px(24),
        color: '#ed3f58',
        textAlignVertical: 'center',
        textAlign: 'right'
    },
    roles: {
        height: px(45),
        fontSize: px(28),
        color: '#252426',
        textAlignVertical: 'center',
        textAlign: 'right'
    }
});
