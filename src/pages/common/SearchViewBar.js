import React, {PureComponent} from 'react';
import {
    StyleSheet,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    Text,
    Platform
} from 'react-native';

import {ImagesRes} from "../../utils/ContentProvider";
import util_tools from "../../utils/tools";
import {pxRatio} from "../../utils/Ratio";
import Icon from '../../UI/lib/Icon'

/**
 * @ProjectName: xc_app_rn
 * @ClassName:  SearchBar
 * @Desc:       搜索框
 * @Author: win7
 * @Date: 2018-05-22 17:36:03
 */

export default class SearchViewBar extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            isShowClearBtn: false,         // 是否显示清空按钮
            isChangeSearchBtnTxt: false,   // 搜索按钮文本 是否从 "搜索" 变成 "取消"
            inputTxt: '',                  // 输入的搜索条件
            isDisabled: false,             // 搜索按钮是否灰显
        };
    }

    render() {
        return (
            <View style={styles.container_bar}>
                <View style={styles.searchRow}>
                    <Icon name="icon_search_gray"  style={styles.icon}
                    />
                    <TextInput
                        style={styles.searchTextInput}
                        underlineColorAndroid="transparent"
                        ref={(c) => this.textInput = c}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder={this.props.text}
                        placeholderTextColor={"#b2b3b5"}
                        returnKeyType='search'
                        keyboardType="web-search"
                        autoFocus={false}
                        value={this.state.inputTxt}
                        onChangeText={(text) => this._changeText(text)}
                        onSubmitEditing={this._onSubmit.bind(this)}
                    />

                    {
                        this.state.isShowClearBtn ? <TouchableOpacity onPress={this._clickClear.bind(this)}>
                            <Icon name="icon_clear" style={styles.icon} />
                        </TouchableOpacity>
                            : <View/>
                    }

                </View>

                {
                    this.state.isChangeSearchBtnTxt ?
                        <TouchableOpacity onPress={this._clickCancel.bind(this)}>
                            <View style={styles.cancelView}>
                                <Text style={styles.touchTxt}>
                                    取消
                                </Text>
                            </View>
                        </TouchableOpacity>
                        : <TouchableOpacity onPress={this._onSubmit.bind(this)}>
                            <View style={styles.cancelView}>
                                <Text style={[styles.touchTxt, {color: this.state.isDisabled ? '#222222' : '#b2b3b5'}]}>
                                    搜索
                                </Text>
                            </View>
                        </TouchableOpacity>
                }

            </View>
        );
    }

    /**
     * 输入框文本捕获
     * @param text
     * @private
     */
    _changeText(text) {
        if (util_tools.isNotEmpty(text)) {
            if (text != this.state.inputTxt) {
                this.setState({
                    isShowClearBtn: true,
                    inputTxt: text,
                    isDisabled: true,
                    isChangeSearchBtnTxt: false,
                });
            }
        } else {
            this.setState({
                isShowClearBtn: false,
                isDisabled: false,
                isChangeSearchBtnTxt: false,
                inputTxt: '',
            });
            this.props.restPose(); // 恢复初始状态
        }
    }

    /**
     * 搜索动作
     * @private
     */
    _onSubmit() {
        if (this.state.isDisabled)  {
            this.setState({
                isChangeSearchBtnTxt: true,
            });
            this.textInput && this.textInput.blur();
            this.props.searchAction(this.state.inputTxt);
        }
    }

    /**
     * 取消按钮
     * @private
     */
    _clickCancel() {
        this.setState({
            inputTxt: '',
            isDisabled: false,
            isShowClearBtn: false,
            isChangeSearchBtnTxt: false,
        });
        this.textInput && this.textInput.blur();
        this.props.onPressCancel();
    }

    manuallyRemove () {
        this.setState({
            inputTxt: '',
            isDisabled: false,
            isShowClearBtn: false,
            isChangeSearchBtnTxt: false,
        })
        this.textInput && this.textInput.blur()
    }

    /**
     * 清空按钮
     * @private
     */
    _clickClear() {
        this.setState({
            inputTxt: '',
            isShowClearBtn: false,
            isDisabled: false,
            isChangeSearchBtnTxt: false,
        });
        this.textInput && this.textInput.blur();
        this.props.onPressClear();
    }

}


const styles = StyleSheet.create({
    container_bar: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fbfbfc',
        paddingVertical: 7,
        paddingLeft: 12,
    },
    searchRow: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#efefef',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: Platform.OS === 'ios' ? 6 : 0
    },

    icon: {
        width: 20,
        height: 20
    },

    searchTextInput: {
        flex: 1,
        textAlignVertical: 'center',
        fontSize: 14,
        color: '#222222',
        paddingVertical: 0,
    },
    cancelView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    touchTxt: {
        fontSize: 15,
        color: '#222222'
    }

});