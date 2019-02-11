'use strict';

import React from 'react';

import {
    View
} from "react-native";

import {TopHeader} from '../common/Header';
import {get} from "../../services/Request";
import {show as toast} from '../../widgets/Toast';
import { Balance } from './income/CommpnBalance';

/**
 * @ClassName:  MyBalancePage
 * @Desc:  我的余额 页面
 * @Author: luhua
 * @Date: 2018-04-28 14:52:08
 */
export default class MyBalancePage extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            withdrawalsAmount: 0
        };
    }
    
    async componentDidMount() {
        try {
            let benefit = await get(`/benefit/index.do`);
            if (benefit != null) {
                this.setState({
                    withdrawalsAmount: benefit.withdrawalsAmount
                })
            }
            
        } catch (e) {
            toast(e.message);
        }
    }
    
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#f5f3f6'}}>
                <TopHeader
                    title="我的余额"
                    navigation={this.props.navigation}
                />
                <Balance
                    label={'可提现收入'}
                    navigation={this.props.navigation}
                    withdrawalsAmount={this.state.withdrawalsAmount}/>
            
            </View>
        )
    }
}