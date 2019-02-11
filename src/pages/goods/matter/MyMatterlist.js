'use strict';

import React from 'react';
import {
    View,
    StyleSheet,
    Clipboard,
    NativeModules,
    Dimensions,
    Platform
} from 'react-native';

import { px, isIphoneX } from '../../../utils/Ratio';
import { show as toast } from '../../../widgets/Toast';

import { User, getShopDetail } from '../../../services/Api';
import { touchBaseUrl, getHeader } from "../../../services/Request";
import {MatterTab} from '../../common/matter/MatterTab';
import Page from '../../../UI/Page'
const os = Platform.OS == "ios" ? true : false;
const AppModule = NativeModules.AppModule;
const WeChat = NativeModules.WeChat;

export default class extends Page {
    
    constructor(props) {
        super(props);
        this.height = px(240)
        this.state = {
            requestStatus: false,
            isPopover: false,
            buttonRect: {},
            net: 'WIFI',
            refreshing: false,
            list: [],
        };
    }
    title="素材管理"
    
    async onReady() {
    
    }
   
    
    pageBody() {
        return <View style={{ flex: 1 }}>
            <MatterTab type="1" navigation={this.props.navigation}/>
        </View>
    }
    
  
}


