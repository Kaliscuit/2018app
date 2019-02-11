/**
 * Created by qiaopanpan on 2017/9/1.
 *目前用于首页的tab，待优化
 */
'use strict';

import React, { PureComponent } from 'react';
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    TouchableWithoutFeedback,
    Animated,
    Platform
} from 'react-native'
import { px } from "../../utils/Ratio"
import { setSpText } from '../../utils/AdaptationSize';
import { MediaImage } from './ImageView'
import base from '../../styles/Base'
import { log } from '../../utils/logs';

const deviceWidth = Dimensions.get('window').width;

/**
 * 首页顶部tabBar
 * event goToPage
 * props tabs<arrary>
 * props scrollTop
 */
export default class extends React.Component {

    txtlist = []
    middle = deviceWidth / 2;

    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0
        }
    }

    render() {
        let isChange = this.props.scrollTop._value < 10 ? this.props.tabState : false;
        return <View onLayout={this.setLayout.bind(this)} style={styles.container}>
            <ScrollView
                style={styles.tabs}
                ref='tabView'
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                directionalLockEnabled={true}
                bounces={false}
                // pagingEnabled
                scrollsToTop={false}>
                {this.props.tabs.map((tab, i) =>
                    <View style={[base.text_center, styles.tabbox]} onLayout={e => this.setListLayout(e.nativeEvent, i)} key={i}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => this.click(i)}  >
                            <View style={styles.tab}>
                                {tab.isShowImg == "0" && isChange && <Animated.Text
                                    style={[styles.text2]}>
                                    {tab.name}
                                </Animated.Text>}
                                {tab.isShowImg == "0" && !isChange && <Animated.Text
                                    style={[styles.text]}>
                                    {tab.name}
                                </Animated.Text>}
                                {tab.isShowImg == "1" && isChange && <Animated.Image
                                    source={{ uri: tab.imgUrl }} style={[styles.tabimg1, {
                                        width: px(tab.img2W),
                                        height: px(tab.img2H),
                                    }]} />}
                                {tab.isShowImg == "1" && !isChange && <Animated.Image
                                    source={{ uri: tab.img2Url }} style={[styles.tabimg1, {
                                        width: px(tab.img2W),
                                        height: px(tab.img2H),
                                    }]} />}
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.activeTab === i ? [styles.label, {
                            backgroundColor: isChange ? "#fff" : "#d0648f"
                        }] : styles.label} />
                    </View>
                )}
            </ScrollView>
        </View>
    }
    setLayout(e) {
        if (this.props.setLayout) this.props.setLayout(e);
    }
    list = []
    list_len = 0;
    setListLayout(e, i) {
        this.list[i] = e.layout.width;
        this.list_len += e.layout.width;
    }
    go(i) {
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }

    set(i) {
        this.setState({ activeTab: i });
        let len = 0;
        for (let index = 0; index < i; index++) {
            len += this.list[index];

        }
        if (len > deviceWidth / 2 && len < this.list_len - deviceWidth / 2) {
            len -= deviceWidth / 2 - this.list[i] / 2;
            this.refs.tabView.scrollTo({ x: len });
        } else if (len > this.list_len - deviceWidth / 2) {
            this.refs.tabView.scrollToEnd()
        } else {
            this.refs.tabView.scrollTo({ x: 0 });
        }
    }

    /**
     * 点击跳转
     * @param {*} i
     */
    click(i) {
        if (this.state.activeTab === i) return;
        this.setState({ activeTab: i })
        this.props.goToPage(i)
    }

    /**
     * 计算宽度
     * @param {*} i
     * @param {*} e
     */
    cal(i, e) {
        if (this.txtlist[i]) return;
        this.txtlist[i] = e.nativeEvent.layout.width
    }
}
const styles = StyleSheet.create({
    container: {
        height: 40,
    },
    tabs: {
        backgroundColor: 'transparent'
    },
    tabbox: {
        height: 40,
        alignItems: 'center',
    },
    tab: {
        paddingLeft: 15,
        paddingRight: 15,
        position: "relative",
    },
    text: {
        color: "#000",
        fontSize: setSpText(14),
    },
    text2: {
        color: '#fff',
        fontSize: setSpText(14),
    },
    label: {
        width: px(44),
        height: px(4),
        borderRadius: px(1.5),
        position: "absolute",
        bottom: 5
    },
    tabimg1: {},
    tabimg2: {
        position: "absolute",
        top: 0,
        left: px(25),
    }
})

exports.TabBar = class extends React.Component {

    static defaultProps = {
        data: [],
        index: -1,
        onChange: () => { },
    }
    constructor(props) {
        super(props);
        this.state = {
            index: this.props.index,
        }
        this.scroll = null;
        this.laout_list = []
        this.scrollW = 0;
    }
    render() {
        return <View style={[base.inline, tabBarStyle.tab]}>
            {this.props.data.length <= 5 && <View style={base.inline}>
                {this.props.data.map((item, index) =>
                    <TouchableOpacity onPress={() => this.setIndex2(index)} key={item.id} style={tabBarStyle.itemBtn2}>
                        <Text style={[tabBarStyle.item, this.state.index === index ? tabBarStyle.active : null]} > {item.name}</Text>
                        <View style={[tabBarStyle.line2, this.state.index === index ? tabBarStyle.active2 : null, { width: 16 }]}></View>
                    </TouchableOpacity>
                )}
            </View>}
            {this.props.data.length > 5 &&
                <ScrollView ref={e => this.scroll = e}
                    horizontal directionalLockEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center">
                    {this.props.data.map((item, index) =>
                        <TouchableOpacity onPress={() => this.setIndex(index)} onLayout={e => this.setLaout(e.nativeEvent.layout, index)} key={item.id} style={tabBarStyle.itemBtn}>
                            <Text style={[tabBarStyle.item, this.state.index === index ? tabBarStyle.active : null]} > {item.name}</Text>
                            <View style={[tabBarStyle.line, this.state.index === index ? tabBarStyle.active2 : null]}></View>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            }
        </View>
    }
    scroll = null;
    laout_list = []
    scrollW = 0;

    componentDidMount() {

    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    setLaout(layout, index) {
        this.laout_list[index] = layout;
        this.scrollW += layout.width;
    }
    refresh() {
        this.shouldUpdate = true;
    }
    setIndex2(index) {
        this.setState({ index })
        this.props.onChange && this.props.onChange(index);
        this.shouldUpdate = true;
    }

    setIndex(index, bl = true) {
        this.setState({ index })
        if (!this.scroll) return;
        let layout = this.laout_list[index];
        let rx = deviceWidth / 2;
        let sx = layout.x - rx + layout.width / 2;
        if (sx < 0) sx = 0;
        sx < this.scrollW - deviceWidth && this.scroll.scrollTo({ x: sx, animated: bl });
        sx >= this.scrollW - deviceWidth && this.scroll.scrollToEnd({ animated: bl });
        this.props.onChange && this.props.onChange(index);
        this.shouldUpdate = true;
    }
}
const tabBarStyle = StyleSheet.create({
    tab: {
        backgroundColor: '#fbfafc',
        // backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: "flex-end",
        height: 35
    },
    itemBtn: {
        paddingHorizontal: 12,
        paddingTop: 2,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center"
    },
    itemBtn2: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingTop: 2,
    },
    line2: {
        width: 20,
        height: 2,
        backgroundColor: "#fbfafc",
        marginTop: 5,
    },
    item: {
        fontSize: px(28),
        color: "#858385",
    },
    active: {
        color: "#d0648f"
    },
    line: {
        width: 20,
        height: 2,
        backgroundColor: "#fbfafc",
        marginTop: 5,
        marginBottom: 2,
    },
    active2: {
        backgroundColor: "#d0648f"
    },
    sortimg: {
        width: 55,
        height: 40,
    }
});