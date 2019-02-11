'use strict';

import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image
} from 'react-native';
import Page from '../../../UI/Page'
import { px } from '../../../utils/Ratio';
import { show as toast } from '../../../widgets/Toast';
import request, { getHeader } from '../../../services/Request'
import Loading from '../../../animation/Loading';
import List from '../../common/List'
import base from '../../../styles/Base';
import {GoodItem, SearchMatterBar} from '../../common/matter/Extra'

export default class extends Page {
    
    constructor(props) {
        super(props)
        if (!this.props.navigation.state.params) {
            this.props.navigation.state.params = {}
        }
        this.state = {
            type: this.props.navigation.state.params.type || 0,
            list: [],
            refreshing: false,
            empty: '',
            modalVisible: false,
            shopName: "",
            shopUserMobile: "",
            show: false
        }
        this.isWeCatHistory = props.navigation.getParam('isWeCatHistory', false)
    }
    pageHeader() {
        return <SearchMatterBar
            goSearch={(t) => this.search(t)}
            navigation={this.props.navigation} />
    }
    pageBody() {
        return <View style={{ flex: 1 }}>
            <SearchList navigation={this.props.navigation} show={this.state.show} ref="searchList" />
        </View>
    }
    pageFooter() {
        return <Loading ref="loading" />
    }
    searchTxt = '';
    async search(t) {
        //this.pageIndex = -1;
        this.searchTxt = t;
        this.refs.loading.open();
        this.setState({
            show: true
        })
        this.refs.searchList && this.refs.searchList.search(this.searchTxt);
    }
    
}

class SearchList extends List {
    renderItem(item, index) {
        return <GoodItem navigation={this.props.navigation} goods={item}/>
    }
    key = 'goodsId'
    init() {
        this.loading = true;
    }
    txt = ''
    search(txt) {
        this.loading = false;
        this.txt = txt;
        this.refresh();
    }
    
    async load(start) {
        //if (!this.props.show) return;
        try {
            let res = await request.get(`/goods/search/multiListV1.do?sKey=default&sValue=${this.txt}&start=${start}&sortType=desc&limit=10&channel=SC`);
            return res.dataResult;
        } catch (e) {
            toast(e.message);
            return { items: [] };
        }
    }
}