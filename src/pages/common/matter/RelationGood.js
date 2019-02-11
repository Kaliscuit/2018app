/**
 * 发布素材关联商品
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Text, View, StyleSheet,
    TouchableWithoutFeedback
} from 'react-native'
import { px } from '../../../utils/Ratio';
import base from '../../../styles/Base';
import {Relation} from './Extra'
import Icon from '../../../UI/lib/Icon'
export default class RelationGood extends React.Component {
    constructor(props) {
        super(props);
        let goods = null, originGoods = null
        if (props.goods) {
            // console.log(props.goods, 'props.goods')
            goods = props.goods;
            originGoods = props.goods;
        }
        this.state = {
            goods,
            originGoods,
        };

    }

    goRelationList() {
        const {style} = this.props
        this.props.navigation.navigate('SearchMatterPage', {
        //goods: this.props.goods
            call: (goods) => {
                this.setState({goods})
            }
        });
    }

    getGoods() {
        return this.state.goods;
    }

    render() {
        const {goods, originGoods} = this.state;
        const {style = {}} = this.props

        if (!goods) {
            return <TouchableWithoutFeedback onPress={() => this.goRelationList()}>
                <View style={[styles.empty, base.inline_between, style]}>
                    <Text style={styles.txt} allowFontScaling={false}>
                    选择关联商品
                    </Text>
                    <Icon name="icon-arrow1" style={styles.arrow} />
                </View>
            </TouchableWithoutFeedback>
        }
        if (originGoods) {
            return <Relation style={style} goods={goods} originGoods={originGoods}/>
        }
        return <TouchableWithoutFeedback  onPress={() => this.goRelationList()}>
            <View style={style}>
                <Relation goods={goods} originGoods={originGoods}/>
            </View>
        </TouchableWithoutFeedback>
    }


}

const styles = StyleSheet.create({
    empty: {
        marginHorizontal: px(30),
        marginTop: px(42), //设计的50-上传图片留下的8
        padding: px(20),
        backgroundColor: '#f7f7f7',
        borderRadius: px(10),
        overflow: 'hidden',
    },
    txt: {
        fontSize: px(28),
        color: '#222'
    },
    arrow: {
        width: px(15),
        height: px(26)
    }

});


