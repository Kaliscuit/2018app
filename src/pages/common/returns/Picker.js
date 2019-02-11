import React, {Component} from 'react';
import {View, Text, ScrollView, StyleSheet, Image, TouchableWithoutFeedback} from 'react-native';
import Picker from '../../../UI/Picker';
import {px} from '../../../utils/Ratio'

class PickerContent extends Component {

    selected(index, item) {
        this.setState({
            activeIndex: index
        }, () => {
            this.props.select && this.props.select(index, item);
        })
    }

    constructor(props) {
        super(props);
        let {actived} = this.props;
        this.state = {
            activeIndex: actived
        }
    }

    render() {
        let {list} = this.props;
        return  <ScrollView style={styles.container}>
            {
                list && list.map((item, index) => <TouchableWithoutFeedback key={index} onPress={() => this.selected(index, item)}>
                    <View style={styles.item}>
                        <Text allowFontScaling={false}style={styles.font}>{item.name}</Text>
                        {
                            this.state.activeIndex == index ?
                                <Image source={{ uri: require('../../../images/tab-shopping-cart-selected') }}
                                    resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />
                                :
                                <Image source={{ uri: require('../../../images/tab-shopping-cart-select') }}
                                    resizeMode='cover'
                                    style={{ width: px(34), height: px(34) }} />
                        }

                    </View>
                </TouchableWithoutFeedback>)
            }
        </ScrollView>
    }
}


export class PickerExpress extends Component {

    select(index, item) {
        this.activeIndex = index;
        this.activeItem = item;
        this.setState({
            activeIndex: this.activeIndex
        }, () => {
            this.refs['picker'].cancel();
            this.props.select && this.props.select(index, item);
        })
    }

    constructor(props) {
        super(props);
        let i = null;
        if (this.props.code) {
            this.props.list && this.props.list.map((item, index) => {
                if (item.code == this.props.code) {
                    i = index;
                }
            })
        }
        this.state = {
            list: this.props.list || [],
            activeIndex: i
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.activeIndex == this.state.activeIndex) {
            return false;
        } else {
            return true;
        }
    }

    render() {
        return <Picker ref="picker" body={
            <PickerContent list={this.state.list} actived={this.state.activeIndex} select={(index, id) => this.select(index, id)} />
        } title={
            <Text allowFontScaling={false} style={{fontSize: px(30)}}>快递公司</Text>
        } settings={settings}/>
    }

    getIndex() {
        return this.activeIndex;
    }

    getId() {
        return this.activeItem;
    }

    open() {
        this.refs['picker'].open();
    }
}


export default class extends Component {

    select(index, item) {
        this.activeIndex = index;
        this.activeItem = item;
        this.setState({
            activeIndex: this.activeIndex
        }, () => {
            this.refs['picker'].cancel();
            this.props.select && this.props.select(index, item);
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            list: this.props.list || [],
            activeIndex: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.activeIndex == this.state.activeIndex) {
            return false;
        } else {
            return true;
        }
    }

    renderTitle() {
        return <Text allowFontScaling={false} style={{fontSize: px(30)}}>退货理由</Text>
    }


    render() {
        return <Picker ref="picker" body={
            <PickerContent list={this.state.list} actived={this.state.activeIndex}  select={(index, id) => this.select(index, id)} />
        } title={
            this.renderTitle()
        } settings={settings}/>
    }

    getIndex() {
        return this.activeIndex;
    }

    getId() {
        return this.activeItem;
    }

    open() {
        this.refs['picker'].open();
    }
}

const settings = {
    titleStyle: {
        paddingTop: px(40),
        paddingBottom: px(60)
    },
    bodyStyle: {
        paddingHorizontal: px(20)
    }
}

const styles = StyleSheet.create({
    container: {
        height: px(400),
        backgroundColor: '#fff'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: px(24),
        borderBottomWidth: px(1),
        borderBottomColor: '#efefef'
    },
    font: {
        flex: 1,
        fontSize: px(28)
    }
})