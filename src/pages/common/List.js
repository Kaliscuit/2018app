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
    Dimensions
} from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default class List extends React.Component {

    static defaultProps = {
        show: false,
    }

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            loadText: "",
            list: [],
        }
        this.pageIndex = -1;
        this.loading = false;
        this.init();
    }

    listStyle = {}
    contentStyle = {}
    numColumns = 1;
    render() {
        return <View style={{ flex: 1 }}>
            <FlatList ref="flatlist"
                data={this.state.list}
                keyExtractor={item => item._key}
                style={[{ width: deviceWidth, backgroundColor: "#f2f2f2" }, this.listStyle]}
                refreshing={this.state.refreshing}
                numColumns={this.numColumns}
                onRefresh={() => this.refresh()}
                onEndReached={() => this.next()}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                extraData={this.state}
                initialNumToRender={this.minCount}
                ListHeaderComponent={this.header()}
                ListEmptyComponent={this.empty()}
                ListFooterComponent={this.footer()}
            />
            {this.other()}
        </View>
    }

    componentWillMount() {
        if (this.props.show) this.next();
    }
    componentWillReceiveProps(pp) {
        if (pp.show != this.props.show && pp.show) this.next();
    }
    pageIndex = -1;
    loading = false;
    loadEnd = false;
    key = "id";
    /**
     * 可继承,最小长度,将显示底部信息
     */
    minCount = 10;
    emptyTxt = "暂无数据";
    refresh() {
        if (this.loading) return;
        this.pageIndex = -1;
        this.loadEnd = false;
        this.setState({ list: [] }, () => {
            this.next();
        });
    }
    async next() {
        if (this.loadEnd) return;
        if (this.loading) return;
        this.loading = true;
        this.pageIndex++;
        this.setState({ loadText: "加载中..." })
        let data = await this.load(this.pageIndex);
        this.loading = false;
        if (!data || data.items.length == 0) {
            this.loadEnd = true;
            if (this.state.list.length > this.minCount) this.setState({ loadText: "已经到底了" });
            if (this.state.list.length <= this.minCount) this.setState({ loadText: "" });
            return;
        }
        data.items.map((item, index) => {
            item._key = item[this.key] + "" + index;
            return item;
        })
        this.setState({ list: this.state.list.concat(data.items) });
        if (!data.totalPages) {
            if (data.items.length < 20) {
                this.loadEnd = true;
                let txt = "已经到底了";
                if (this.state.list.length <= this.minCount) txt = "";
                this.setState({ loadText: txt });
            }
        } else if (this.pageIndex + 1 >= data.totalPages) {
            this.loadEnd = true;
            let txt = "已经到底了";
            if (this.state.list.length <= this.minCount) txt = "";
            this.setState({ loadText: txt });
        }
    }

    header() {
        return null;
    }
    footer() {
        return <View style={listStyle.loading}>
            <Text>{this.state.loadText}</Text>
        </View>;
    }
    empty() {
        return <View style={listStyle.empty}>
            <Text style={listStyle.emptyTxt}>{this.emptyTxt}</Text>
        </View>;
    }
    other() {
        return null
    }
    /**
     * 可继承,渲染子项目
     */
    renderItem(item, index) {
        return <View></View>
    }
    /**
     * 可继承,加载数据
     */
    async load() { }
    /**
     * 可继承,初始化设置
     */
    init() { }
}
const listStyle = StyleSheet.create({
    empty: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTxt: {
        color: "#ccc",
    },
    loading: {
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
    }
});