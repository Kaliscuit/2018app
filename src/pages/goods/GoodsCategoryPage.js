import React, { PureComponent } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    Platform,
    FlatList,
} from 'react-native';

import { SafeHeadView } from '../common/Header'
import { px } from "../../utils/Ratio";
import { get } from '../../services/Request'
import { show as toast } from '../../widgets/Toast';
import SecondCategoryPage from "./SecondCategoryPage";
import Icon from '../../UI/lib/Icon'
import {TrackClick, TrackPage} from '../../services/Track';
import request from "../../services/Request";

/**
 * @ProjectName: xc_app_rn
 * @ClassName:  GoodsCategoryPage
 * @Desc:       商品分类页面
 * @Author: luhua
 * @Date: 2018-06-14 15:58:03
 */


export default class GoodsCategoryPage extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            selectedRootCate: 0,
            selectedFCIndex: 0,
            firstCategoryList: [],
            secondCategoryList: [],
            selectedSCIndex: 0,
            searchTxt: '',
        };

    }

    componentDidMount() {
        this.onLoad();  // 加载数据
        this.getSearchLabel() // 搜索标签
    }

    async onLoad() {
        // 网络请求
        let categoryList = await get('/operate_category/list.do'); // 一级列表 && 默认第一项的一级列表对应的二级列表数据
        let fcList = categoryList.firstCategoryList;
        let scList = categoryList.groups;
        if (categoryList != null) {
            this.setState({
                firstCategoryList: fcList,
                selectedFCIndex: fcList[0].id,
                secondCategoryList: scList
            });
        }
    }

    async onRefresh() {
        await this.onLoad();
    }

    /**
     * 头部搜索条
     * @returns {*}
     * @private
     */
    _renderHeader() {
        return (
            <SafeHeadView style={styles.header}>
                <TouchableOpacity style={styles.back}
                    onPress={() => this.goBack()}>
                    <Icon name="icon_back"
                        style={{ width: 20, height: 20 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => this.goSearchPage()}>
                    <View style={styles.headerSearchBar}>
                        <Icon style={styles.icon_search}
                            name="icon-search" />
                        <Text style={{
                            alignItems: 'center',
                            color: '#858385'
                        }}
                            allowFontScaling={false}
                        >{this.state.searchTxt}</Text>

                    </View>
                </TouchableOpacity>
            </SafeHeadView>
        )
    }

    /**
     * 绘制一级列表项
     * @param item
     * @returns {*}
     * @private
     */
    _renderFCItem = (item, index_) => {
        let index = item.id;
        let title = item.name;
        return (
            <TouchableOpacity
                key={index}
                style={[{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: px(182),
                    height: px(100),
                },
                this.state.selectedFCIndex === index ? {
                    backgroundColor: '#ffffff',
                    borderLeftWidth: px(6),
                    borderLeftColor: '#d0648f'
                } : {
                        borderLeftWidth: px(6),
                        backgroundColor: '#f7f7f7',
                        borderLeftColor: '#f7f7f7'
                    }
                ]}
                onPress={() => {
                    this.setState({ selectedFCIndex: index });
                    this._requestSCList(index, title, index_);
                }}
            >
                <Text style={{
                    fontSize: px(28),
                    color: this.state.selectedFCIndex === index ? '#d0648f' : '#222222'
                }}>
                    {title}
                </Text>
            </TouchableOpacity>
        )
    };

    /**
     * 绘制一级列表
     * @returns {*}
     * @private
     */
    _renderFCList() {
        return (
            <View style={[styles.fcList]}>
                <FlatList
                    data={this.state.firstCategoryList}
                    horizontal={false}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={() => (<View />)}
                    ListFooterComponent={() => (<View />)}
                    renderItem={({ item, index }) => this._renderFCItem(item, index)}
                    onEndReachedThreshold={1}
                    showsVerticalScrollIndicator={false}
                >
                </FlatList>
            </View>
        )
    }

    /**
     * 二级列表 item
     * @param item
     * @returns {null}
     * @private
     */
    _renderSCItem(scItem) {
        return <View style={{
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            marginTop: px(30)
        }}>
            <View style={{
                flexDirection: 'row',
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: px(30),
                marginBottom: px(5),
            }}>
                <View style={{
                    width: px(100),
                    height: px(1),
                    backgroundColor: '#efefef'
                }} />
                <Text style={{
                    color: '#222222',
                    fontSize: px(28),
                    marginHorizontal: px(14)
                }}
                allowFontScaling={false}
                >{scItem.name}</Text>
                <View style={{
                    width: px(100),
                    height: px(1),
                    backgroundColor: '#efefef'
                }} />
            </View>

            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
            }}>
                {
                    scItem.secondCategory != null && scItem.secondCategory.map((item, index) =>
                        <View key={index} style={{
                            marginTop: px(30),
                        }}>
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.9}
                                onPress={() => this.goSecondCategoryPage(item, index)}
                            >
                                <View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <View style={{
                                        flexDirection: 'column',
                                        marginLeft: px(52),
                                        alignItems: 'center',
                                        width: px(120)
                                    }}>
                                        <Image style={{
                                            width: px(120),
                                            height: px(120),
                                        }}
                                        source={{ uri: item.iconUrl }}
                                        />
                                    </View>

                                    <View style={{
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginLeft: px(52),
                                        width: px(120),
                                        marginTop: px(20),
                                    }}>
                                        <Text style={{
                                            color: '#222222',
                                            fontSize: px(22),
                                            lineHeight: px(24),
                                        }}
                                        numberOfLines={2}
                                        allowFontScaling={false}
                                        >{item.name}</Text>
                                    </View>

                                </View>

                            </TouchableOpacity>
                        </View>
                    )
                }
            </View>



        </View>
    }

    /**
     * 二级列表 List
     * @returns {*}
     * @private
     */
    _renderSCList() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                paddingTop: px(30),
                paddingBottom: px(30)
            }}>
                <FlatList
                    data={this.state.secondCategoryList}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={() => (<View />)}
                    ListFooterComponent={() => (<View />)}
                    ItemSeparatorComponent={() => <View />}
                    renderItem={({ item, separators }) => this._renderSCItem(item)}
                    onEndReachedThreshold={1}
                    showsVerticalScrollIndicator={false}
                >
                </FlatList>
            </View>
        )
    }

    renderCategory() {
        return (
            <View style={{ flexDirection: 'row', flex: 1, backgroundColor: '#F5F5F5' }}>
                {this._renderFCList()}
                {this._renderSCList()}
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this._renderHeader()}
                {this.renderCategory()}
            </View>
        )
    }

    async _requestSCList(categoryId, title, index) {
        TrackClick('Classify', `ClassifyFirstCategory-${index+1}`, '一级分类页面', `${title}`);
        try {
            let resource = await get(`/operate_category/list.do?categoryId=${categoryId}`);
            if (resource != null) {
                this.setState({
                    secondCategoryList: resource.groups
                });
            }
        } catch (e) {
            if (e.data.status != 0) {
                toast("您来晚了，页面已经飞走啦~");
                this.timer = setTimeout(() => {
                    this.onLoad();
                }, 1000);
            }
        }

    };

    /**
     * 返回到上一页
     */
    goBack() {
        this.props.navigation.goBack();
    }

    /**
     * 调转到搜索页
     */
    goSearchPage() {
        TrackClick('Classify', 'ClassifyFirstSearchBar', '分类页面', '分类列表-搜索’');
        this.props.navigation.navigate('SearchPage', {
            searchTxt: this.state.searchTxt
        });
    }

    async getSearchLabel() {
        try {
            let res = await request.get('/search/tag/getSearchBarTag.do')
            if (res) {
                this.setState({
                    searchTxt: res || ''
                })
            }
        } catch (e) {
            //
        }
    }

    /**
     * 调转到二级列表页面
     */
    goSecondCategoryPage(item, index) {
        TrackClick('Classify', `ClassifyFirstCategoryList-${index+1}`, '一级分类页面', `分类列表-${item.name}`);
        if (item.urlYn == 1) {   // 是否跳转url，如果是1，actionUrl就是需要跳转的页面
            this.props.navigation.navigate('HtmlViewPage', {
                webPath: item.actionUrl,
                img: ''
            });
        } else {
            this.props.navigation.navigate('SecondCategoryPage', {
                categoryId: item.id,
                updatePage: (msg) => {
                    if (msg.actionType === 'LocationFCIndex') {
                        this.setState({
                            selectedFCIndex: msg.categoryId
                        });
                    } else if (msg.actionType === 'onRefresh' && msg.categoryId === -1000) {
                        this.onRefresh()
                    }
                }
            });
        }
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: px(20),
        ...Platform.select({
            ios: {
                paddingTop: px(60),
                height: px(140)
            },
            android: {
                paddingTop: px(20),
                height: px(100)
            }
        })
    },
    back: {
        marginLeft: px(20)
    },
    headerSearchBar: {
        height: px(40),
        backgroundColor: "#efefef",
        flexDirection: "row",
        marginLeft: px(20),
        marginRight: px(20),
        alignItems: "center",
        borderRadius: px(30),
        paddingVertical: px(28)
    },
    headerSearchImg: {
        marginLeft: px(15)
    },
    headerSearchInput: {
        width: px(540),
        color: "#252426",
        fontSize: px(28),
        height: px(60),
        padding: 0
    },

    icon_search: {
        width: px(40),
        height: px(40),
        marginRight: px(10),
        marginLeft: px(20),
        alignItems: "center",
    },

    fcList: {
        backgroundColor: '#f7f7f7',
        width: px(180),
    }

});