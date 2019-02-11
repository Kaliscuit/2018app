'use strict';

import React from 'react';
import { px } from '../utils/Ratio';
import {
    StyleSheet,
} from 'react-native';

/**
 * 基础样式
 */
export default StyleSheet.create({
    /**
     * 一行，居中
     */
    line: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    position: {
        position: 'absolute',
    },
    right: {
        alignItems: 'flex-end',
    },
    inline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inline_left: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inline_between: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    text_center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    flex: {
        flexDirection: 'row',
    },
    flex_between: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flex_middle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: "wrap"
    },
    wrap_left: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: "wrap"
    },
    color: {
        color: '#d0648f'
    },
    color1: {
        color: '#858385'
    },
    backgroundColor: {
        backgroundColor: '#d0648f'
    },
    borderColor: {
        borderColor: '#d0648f'
    },
    border: {
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1)
    },
    borderRadius10: {
        borderRadius: px(10),
        overflow: 'hidden'
    },
    includeFontPadding: {
        includeFontPadding: false
    }
})