'use strict';

import React, { PureComponent } from 'react';
import {
    Modal, Text, View, StyleSheet,
    ScrollView
} from 'react-native'
import { px, isIphoneX } from '../../utils/Ratio';
import { show as toast } from '../../widgets/Toast';
import { shareToSession, isWXAppInstalled, shareToTimeline } from '../../services/WeChat';
import { User, getShopDetail } from '../../services/Api';
import request, { baseUrl, touchBaseUrl } from '../../services/Request';
import base from '../../styles/Base'
import Icon from '../../UI/lib/Icon'
import { LoadingRequest, Loading } from '../../widgets/Loading';
import GoodsSnapshot from "../snapshot/goods"
import TimelineSnapshot from "../snapshot/timeline"


export default class extends React.Component {

    render() {
        return <View></View>
    }
}