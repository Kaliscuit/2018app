import React, { Component } from 'react'
import {
    View, NativeModules,
    ScrollView, TouchableWithoutFeedback, Text, StyleSheet,
    Platform, TouchableOpacity, TextInput, Animated, FlatList
} from 'react-native'

import SearchViewBar from "../common/SearchViewBar";
import { deviceWidth, isIphoneX, px } from "../../utils/Ratio";
import Icon from "../../UI/lib/Icon";
import { get } from "../../services/Request";
import { show as toast } from "../../widgets/Toast.android";
import { TrackClick } from "../../services/Track";
import request from "../../services/Request";
import Page, { SafeFootView } from '../../UI/Page'
import Button from "../../UI/lib/Button";
import Pop from "./help/Pop";
import { User } from "../../services/Api";

const IM = NativeModules.XNIMModule

export default class extends Page {

    height = Platform.OS === 'ios' ? isIphoneX() ? px(190) : px(140) : px(96)
    constructor(props) {
        super(props);
        this.defaultTxt = this.props.navigation.state.params ? this.props.navigation.state.params.searchTxt : '请输入关键字搜索';

        this.state = {
            dataSource: [],
            shezhi: 0,
            refreshing: false,
            loadText: "",
            findText: ""

        };
    }

    pageSize = 0;
    title = '客服中心';
    minCount = 10;
    beginStart = false;
    totoalPage = 0;
    loading = false;
    loadEnd = false;

    pageBody() {
        return <View style={search.container}>
            <NewSearchBar ref="searchBar"
                defaultTxt={this.defaultTxt}
                goBack={this.goBack.bind(this)}
                search={this.search.bind(this)} />
            {this.state.shezhi === 0 || this.state.shezhi === 1 && <FlatList ref="flatlist"
                data={this.state.dataSource}
                keyExtractor={item => item.id + ''}
                style={[{ width: deviceWidth, backgroundColor: "#f2f2f2", flex: 1 }]}
                refreshing={this.state.refreshing}
                numColumns={1}
                onRefresh={() => this.refresh()}
                onEndReached={() => this.next()}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                extraData={this.state}
                // initialNumToRender={this.minCount}
                ListEmptyComponent={this.empty()}
                ListFooterComponent={this.footer()}
            />}
            {this.state.shezhi === 2 && <View style={{ flex: 1, marginTop: px(10), width: deviceWidth, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>未找到相关问题，可以更换搜索关键词试试哦~</Text>
            </View>}
        </View>
    }

    pageFooter() {
        return <View>
            <View style={{ height: isIphoneX() ? 79 : 45 }}></View>
            <SafeFootView style={{ height: 45 }}>
                <Button style={search.btnKefu} txtStyle={{ fontSize: px(28) }} icon="zaixiankefu" value="在线客服" onPress={this.kefu.bind(this)} />
            </SafeFootView>
            <Pop openGroup={this.openGroup.bind()} ref="pop" navigation={this.props.navigation} />
        </View>
    }

    //
    footer() {
        return <View style={search.loading}>
            <Text>{this.state.loadText}</Text>
        </View>;
    }
    empty() {
        return <View></View>;
    }
    renderItem(item, index) {
        return <View >
            <TouchableOpacity style={search.contain} activeOpacity={0.8} onPress={() => this.click(item.id)} key={index}>
                <View style={search.listView}>
                    <View style={search.listLine}>
                        <Text style={{ fontSize: px(30), color: '#000000' }}>{item.title}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: px(25), color: '#858385' }} numberOfLines={4}>{item.contents}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>

    }
    refresh() {
        this.search(this.state.findText)
    }
    next() {
        if (this.loadEnd) {
            this.setState({ loadText: "已经到底啦，没有更多结果啦~" });
            return;
        } else {
            this.beginStart = true;
            this.onSubmit(this.state.findText);
        }
    }


    /**搜索的结构**/
    search(item) {
        this.$loading();
        this.pageSize = 0;
        this.loadEnd = false;
        this.setState({ dataSource: [], findText: item });
        this.onSubmit(item);
    }
    async onSubmit(item) {
        if (this.loading) return;
        this.loading = true;
        try {
            this.pageSize++;
            let res = await request.get(`/dal_cec/sale/front/qa/search.do`, {
                keyword: item,
                index: this.pageSize,
            });
            this.setState({ dataSource: this.state.dataSource.concat(res.items), shezhi: 1 });

            if (res.items.length === 0) this.loadEnd = true;
            if (this.state.dataSource.length === 0) {
                this.setState({ shezhi: 2 });
            }
        } catch (e) {
            //
        }
        this.loading = false;
        this.$loadend()
    }
    click(id) {
        this.props.navigation.navigate("AnswerPage", { id });
    }
    kefu() {
        this.refs.pop.open()
    }

    async  openGroup(name) {
        try {
            await IM.startChat(name, User.headImgUrl, function (err) { });
        } catch (error) {
            // console.log(error)
        }
    }
}

const search = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    btnKefu: {
        width: deviceWidth
    },

    contain: {
        height: px(200),
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1),
        backgroundColor: '#fff'
    },
    listView: {
        flex: 1,
        padding: px(30),
        justifyContent: 'space-between'
    },
    listLine: {
        flexDirection: 'row',
    },
    loading: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

class NewSearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTxt: '',
            isCancel: true
        }
    }
    render() {
        return (
            <View style={searchHead.container}>
                <View style={searchHead.wrap}>
                    <View style={searchHead.searchWrap}>
                        <TouchableOpacity onPress={() => {
                            this.search();
                            this.setState({ isCancel: true })
                        }}>
                            <Icon name="icon_search_gray"
                                style={{ width: px(34), height: px(34), marginRight: px(14), marginLeft: px(18) }} />
                        </TouchableOpacity>
                        <TextInput style={searchHead.searchInput}
                            ref="searchInput"
                            placeholder={'请输入关键字搜索'}
                            placeholderTextColor="#b2b3b5"
                            autoCorrect={false}
                            autoFocus={true}
                            keyboardType="web-search"
                            maxLength={20}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            value={this.state.searchTxt}
                            onChangeText={(val) => this.input(val)}
                            onChange={(event) => this.change(event)}
                            onSubmitEditing={() => {
                                this.search();
                                this.setState({ isCancel: true })
                            }}
                        />
                    </View>
                    <TouchableOpacity onPress={() => {
                        this.search();
                        if (this.state.isCancel) {
                            this.setState({ isCancel: false })
                            this.props.goBack();
                        } else {
                            this.setState({ isCancel: true })
                        }
                    }}>
                        <Text style={this.state.isCancel ? searchHead.searchHighLight : searchHead.searchTxt}>{this.state.isCancel ? "取消" : "搜索"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    startSearch = false
    search() {
        this.searchType = 'search'
        this.props.search(this.state.searchTxt)
    }
    input(val) {
        if (this.inputStatus) {
            this.setState({
                searchTxt: val
            })
        }
    }

    inputTxt(val) {
        this.inputStatus = false
        this.setState({
            searchTxt: val
        })
    }

    inputStatus = true

    change(event) {
        this.setState({ searchTxt: event.nativeEvent.text, isCancel: false });
    }

    searchType = 'search'

}

const searchHead = StyleSheet.create({
    container: {
        width: deviceWidth,
        backgroundColor: '#fff'
    },
    x: {
        width: deviceWidth,
        height: px(50)
    },
    ios: {
        width: deviceWidth,
        height: px(44)
    },
    wrap: {
        marginTop: px(9),
        width: deviceWidth,
        height: px(64),
        marginBottom: px(23),
        paddingLeft: px(18),
        paddingRight: px(24),
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchWrap: {
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(15),
        marginRight: px(24),
        alignItems: "center",
        flex: 1,
        height: px(64),
        borderRadius: 30,
    },
    searchInput: {
        color: "#222",
        fontSize: px(28),
        padding: 0,
        flex: 1,
        backgroundColor: "#efefef"
    },
    searchTxt: {
        fontSize: px(28),
        color: '#222'
    },
    searchHighLight: {
        fontSize: px(28),
        color: '#00BFFF'
    }
})



