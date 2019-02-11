'use strict';

import React from 'react';

import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    NativeModules,
    Platform
} from 'react-native';
import { px, deviceWidth, deviceHeight } from '../../../utils/Ratio';
import { SafeFootView } from '../../../UI/Page'
import Button from "../../../UI/lib/Button"
import { log } from "../../../utils/logs"
import { setItem, removeItem, getItem } from '../../../services/Storage';
import { getHeader } from "../../../services/Request";

const IM = NativeModules.XNIMModule

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            top: new Animated.Value(0),
            hei: 240,
            active: -1
        };
    }
    render() {
        return <Modal
            onShow={() => { }}
            onRequestClose={() => { }}
            animationType="none"
            transparent={true}
            visible={this.state.show}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity activeOpacity={1} onPress={this.end.bind(this)}>
                    <View style={styles.bg} ></View>
                </TouchableOpacity>
                <Animated.View style={[styles.box, {
                    transform: [
                        { translateY: this.state.top }
                    ]
                }]}>
                    <SafeFootView style={styles.foot}>
                        <View style={styles.title}>
                            <Text style={styles.tit}>请选择您还要咨询的问题类型</Text>
                        </View>
                        <View style={styles.items}>
                            <TouchableOpacity onPressIn={() => this.pressIn(0)} onPressOut={() => this.presOut()} onPress={() => this.go("kf_9496_1501573712265")} activeOpacity={.8}>
                                <View style={[styles.item, this.state.active === 0 ? styles.active : null]}>
                                    <Text style={[styles.itemTxt, this.state.active === 0 ? styles.itemTxt2 : null]}>APP使用及账户问题 </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPressIn={() => this.pressIn(1)} onPressOut={() => this.presOut()} onPress={() => this.go("kf_9496_1501573712265")} activeOpacity={.8}>
                                <View style={[styles.item, this.state.active === 1 ? styles.active : null]}>
                                    <Text style={[styles.itemTxt, this.state.active === 1 ? styles.itemTxt2 : null]}>物流配送问题 </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPressIn={() => this.pressIn(2)} onPressOut={() => this.presOut()} onPress={() => this.go("kf_9496_1501573712265")} activeOpacity={.8}>
                                <View style={[styles.item, this.state.active === 2 ? styles.active : null]}>
                                    <Text style={[styles.itemTxt, this.state.active === 2 ? styles.itemTxt2 : null]}>售后问题 </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPressIn={() => this.pressIn(3)} onPressOut={() => this.presOut()} onPress={() => this.go("kf_9496_1501573712265")} activeOpacity={.8}>
                                <View style={[styles.item, this.state.active === 3 ? styles.active : null]}>
                                    <Text style={[styles.itemTxt, this.state.active === 3 ? styles.itemTxt2 : null]}>发票问题 </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Button onPress={this.end.bind(this)} style={styles.btn} txtStyle={styles.btnTxt} value="取消" />
                    </SafeFootView>
                </Animated.View>
            </View>
        </Modal>
    }
    pressIn(active) {
        this.setState({ active })
    }
    presOut() {
        this.setState({ active: -1 })
    }
    open() {
        this.setState({ show: true })
        this.start()
    }
    close() {
        this.setState({ show: false })
    }
    start() {
        const val = Platform.OS === "ios" ? -px(503) : -px(548);
        Animated.timing(this.state.top, {
            toValue: val,
            duration: 300,
        }).start()
    }
    end() {
        Animated.timing(this.state.top, {
            toValue: 0,
            duration: 300
        }).start(() => this.close())
    }
    // 发票组问题    kf_9496_1543283760309 
    // 售后问题       kf_9496_1543283739760 
    // 物流配送问题     kf_9496_1543283721758 
    // App使用及账户问题     kf_9496_1543283697110
    async go(name) {
        this.close()
        setTimeout(() => {
            let uid = getHeader('uid')
            setItem(`prevSetId${uid}`, name)
            this.props.openGroup(name)
        }, 100);
    }
}
const styles = StyleSheet.create({
    bg: {
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    box: {
        width: deviceWidth,
        position: "absolute",
        left: 0,
        top: deviceHeight,
        height: px(503),
        backgroundColor: "#ccc"
    },
    title: {
        height: px(134),
        width: deviceWidth,
        alignItems: 'center',
        justifyContent: "center",
        borderBottomWidth: px(1),
        borderBottomColor: "#EFEFEF"
    },
    tit: {
        fontSize: px(36),
        color: "#222"
    },
    items: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: 'center',
        marginHorizontal: px(50),
        marginVertical: px(35)
    },
    item: {
        backgroundColor: "#efefef",
        width: px(290),
        height: px(70),
        alignItems: 'center',
        justifyContent: "center",
        borderRadius: px(6),
        margin: px(15),
    },
    active: {
        backgroundColor: "#D0648F",
    },
    itemTxt: {
        color: "#666",
        fontSize: px(28)
    },
    itemTxt2: {
        color: "#fff",
        fontSize: px(28)
    },
    btn: {
        backgroundColor: "#fff",
        height: px(97),
        borderTopColor: "#efefef",
        borderTopWidth: px(1),
        width: deviceWidth,
    },
    btnTxt: {
        fontSize: px(34),
        color: "#252426"
    },
    foot: {
        position: "relative",
        height: px(503)
    }
})