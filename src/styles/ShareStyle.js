'use strict';

import React from 'react';
import { px } from '../utils/Ratio';
import {
    StyleSheet,
} from 'react-native';

/**
 * 分享弹窗样式
 */
export default StyleSheet.create({
    shareBox: {
        alignItems: 'center',
        marginTop: px(20),
    },
    shareTitle: {
        fontSize: px(42),
        color: '#d0648f',
    },
    shareDesc: {
        fontSize: px(26),
        color: '#858385',
        textAlign: 'center',
        lineHeight: px(32)
    }
})