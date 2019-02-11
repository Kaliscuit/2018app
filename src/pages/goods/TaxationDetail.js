import React from "react";

import {
    Image,
    Text,
    TextInput,
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Modal,
    NativeModules,
    Platform
} from "react-native";
import { Header } from '../common/Header';
import { px } from "../../utils/Ratio";
import { get, baseUrl, touchBaseUrl } from "../../services/Request";
import { User, getShopDetail } from "../../services/Api";
import CartList from '../../services/Cart'
import { show as toast } from '../../widgets/Toast';
import { shareToSession, isWXAppInstalled } from '../../services/WeChat';
import { getItem } from '../../services/Storage';
import { config } from '../../services/Constant';
import { TopHeader } from '../common/Header'

const AppModule = NativeModules.AppModule;
const flagLen = Platform.OS == "ios" ? "---  " : "直]  ";
export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }

    render() {
        const { list, total } = this.state
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f3f6' }}>
                <TopHeader navigation={this.props.navigation}
                    title="税费明细"></TopHeader>
                <ScrollView style={{ flex: 1 }}>
                    {
                        list.map((item, index) =>
                            <View key={index} style={styles.contain}>
                                <View style={styles.listView}>
                                    <View style={styles.listLine}>
                                        <Text numberOfLines={1} style={{ fontSize: px(28) }}>{item.goodsName}</Text>
                                    </View>
                                    <View style={styles.listLine}>
                                        <Text style={{ fontSize: px(24), color: '#858385' }}>税费</Text>
                                        <Text style={{ fontSize: px(28) }}>￥{item.tax}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    }
                    <View style={[styles.listLine, styles.total]}>
                        <Text style={{ fontSize: px(28) }}>合计</Text>
                        <Text style={{ fontSize: px(32), color: '#d0648f' }}>￥{(total * 1).toFixed(2)}</Text>
                    </View>
                </ScrollView>
            </View>
        )
    }

    async componentDidMount() {
        let taxDetails = this.props.navigation.state.params.taxDetails;
        let total = 0
        taxDetails.map(item => {
            total += item.tax * 1
        })
        this.setState({
            list: taxDetails,
            total: total
        });
    }

}

const styles = StyleSheet.create({
    contain: {
        height: px(140),
        borderBottomColor: '#efefef',
        borderBottomWidth: px(1),
        backgroundColor: '#fff'
    },
    listView: {
        flex: 1,
        padding: px(30),
        justifyContent: 'space-between'
    },
    listLine: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    total: {
        height: px(80),
        backgroundColor: '#fff',
        paddingLeft: px(30),
        paddingRight: px(30),
        alignItems: 'center'
    }
});
