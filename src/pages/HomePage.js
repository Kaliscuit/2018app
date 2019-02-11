'use strict';

import React from 'react';

import { NavigationActions, StackActions } from 'react-navigation';
import { setNavigation } from '../utils/NavigationHolder';
import { AppUp, User } from '../services/Api';
import { log, logErr, logWarm } from '../utils/logs'
import Page from "../UI/Page"
import tools from "../utils/tools"

export default class extends React.Component {

    constructor(props) {
        super(props);
        setNavigation(props.navigation);
    }
    
    render() {
        return null;
    }

    async componentDidMount() {
        // await AppUp();
        
        await tools.sleep(500);
        if (User.vip || !User.isLogin) {
            this.goShop("TabPage2");
        } else {
            this.goShop("TabPage1");
        }
    }

    goShop(name) {
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: name })
            ]
        }))
    }
}