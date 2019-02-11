/**
 * Created by zhaoxiaobing on 2017/9/1.
 */


'use strict';

import React from 'react';

import {
    Text,
    TextInput,
    View,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import {
    px
} from "../../utils/Ratio";

import {
    get
} from "../../services/Request";

import { show as toast } from '../../widgets/Toast';
import { updateShopDetail } from '../../services/Api'
import { TopHeader } from '../common/Header'

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initloading: false,
            data: {
                shopName: ''
            },
            status: true
        }
    }
    async componentDidMount() {
        try {
            let res = await get(`/ucenter/detail.do`);
            this.setState(Object.assign({}, res, {
                initloading: true
            }));
        } catch (e) {
            toast(e.message);
        } 
    }
    clearSpace(v) {
        if (!v) {
            return v;
        } else {
            return String(v).replace(/\s/g, '');
        }
    }
    async onSubmit() {
        let shopName = this.clearSpace(this.state.shopName)
        if (!shopName) {
            return toast('请输入店铺名称');
        }
        if (shopName.length > 10) {
            return toast('店铺名不能超过10个字符');
        }
        let res = await get(`/shop/updateShopName.do?shopName=${shopName}`);
        this.props.navigation.state.params.callback();
        this.props.navigation.goBack();
    }
    render() {
        return <View style={{ flex: 1, backgroundColor: '#f5f3f6', alignItems: 'center' }}>
            <TopHeader navigation={this.props.navigation}
                title="店铺名称"></TopHeader>
            {this.state.initloading
                ? <View style={styles.main_box}>
                    <View style={styles.view0}>
                        <TextInput
                            style={styles.sty2}
                            value={this.state.shopName}
                            placeholder='请输入店铺名称'
                            onChangeText={res => this.setState({ shopName: res })}
                            underlineColorAndroid="transparent">
                        </TextInput>
                    </View>
                    <View style={styles.view1}>
                        <Text allowFontScaling={false} style={styles.sty0}>店铺名称不能超过10个字符，支持汉字、字母和数字</Text>
                    </View>
                    <TouchableOpacity style={styles.submitBox} activeOpacity={0.8} onPress={this.onSubmit.bind(this)}>
                        <Text allowFontScaling={false} style={styles.submit}>
                            保存
                        </Text>
                    </TouchableOpacity>
                </View>

                : <View>
                    <ActivityIndicator
                        animating={true}
                        style={{ width: 80, height: 80 }}
                        size="large"
                    />
                </View>}
        </View>;
    }
}


const styles = StyleSheet.create({
    view0: {
        width: px(750),
        height: px(82),
        backgroundColor: '#fff',
        paddingHorizontal: px(30),
        borderBottomWidth: px(1),
        borderBottomColor: '#f6f5f7',
        flexDirection: 'row'
    },
    view1: {
        width: px(750),
        height: px(58),
        paddingLeft: px(40),
        paddingTop: px(29),
        paddingBottom: px(55)
    },
    sty0: {
        fontSize: px(22),
        color: '#858385',
        lineHeight: px(34)
    },
    sty2: {
        flex: 1,
        height: px(80),
        //lineHeight: px(80),
        textAlign: 'left',
        color: '#252426',
        fontSize: px(28)
    },
    main_box: {
        flex: 1,
        position: 'relative',
        zIndex: 0,
        paddingTop: px(40),
        paddingBottom: px(40)
    },
    submit: {
        height: px(80),
        //lineHeight: px(80),
        backgroundColor: '#d0648f',
        color: '#fff',
        fontSize: px(28),
        paddingTop: px(26),
        textAlign: 'center',
        width: px(690),
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 0,
        marginBottom: 0,
        borderRadius: px(5)
    }
});
