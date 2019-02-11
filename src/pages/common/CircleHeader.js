import React, {PureComponent} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';
import {px} from "../../utils/Ratio";

/**
 * @ProjectName: xc_app_rn
 * @ClassName:  CircleHeader
 * @Desc:
 * @Author: win7
 * @Date: 2018-06-05 18:10:03
 */

export default class CircleHeader extends PureComponent {

    render() {
        return (
            <View style={[styles.container, this.props.headerStyle]}>
                <Image style={styles.icon}
                    resizeMode={'contain'}
                    source={{uri: this.props.imgSource}}
                />
            </View>
        );
    }

}


const styles = StyleSheet.create({
    container: {
        // width: 55,
        // height: 55,
        width: px(110),
        height: px(110),
        borderRadius: px(55),
        overflow:'hidden',
        borderWidth: px(3),
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: px(110),
        height: px(110),
    }
});