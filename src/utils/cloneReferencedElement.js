/*
 * @ClassName(func):  cloneReferencedElement
 * @Desc:             克隆指定了一个新的ref，它仍然保留了原始元素的ref
 * @Author:           luhua 
 * @Date:             2018-04-10 18:39:40 
  */

'use strict';

import React from 'react';
import { logWarm } from './logs'


function cloneReferencedElement(element, config, ...children) {

    let cloneRef = config.ref;
    let originalRef = element.ref;
    if (originalRef == null || cloneRef == null) {
        return React.cloneElement(element, config, ...children);
    }

    if (typeof originalRef !== 'function') {
        if (__DEV__) {
            logWarm('克隆一个带有ref的元素，它将被覆盖，因为它不是一个函数。使用可组合的回调式ref代替 ---> ref: ' + originalRef);
        }
        return React.cloneElement(element, config, ...children);
    }

    return React.cloneElement(element, {
        ...config,
        ref(component) {
            cloneRef(component);
            originalRef(component);
        },
    }, ...children);
}

module.exports = cloneReferencedElement;