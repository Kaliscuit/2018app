import React from 'react';
import { View, Text, TouchableWithoutFeedback, Image, StyleSheet, } from 'react-native';
import NoticeStyle from './style';
import Marquee from './Marquee';
import { px } from '../../../utils/Ratio';
import Icon from '../../../UI/lib/Icon'

const NoticeStyles = StyleSheet.create(NoticeStyle);
export default class NoticeBar extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = () => {
            const { mode, onClick } = this.props;
            if (onClick) {
                onClick();
            }
            if (mode === 'closable') {
                this.setState({
                    show: false,
                });
            }
        };
        this.state = {
            show: true,
        };
    }
    render() {
        const { children, mode, icon, style, action, marqueeProps } = this.props;
        const styles = this.props.styles;
        let operationDom = null;
        if (mode === 'closable') {
            operationDom = <TouchableWithoutFeedback onPress={this.onClick}>
                <View style={styles.actionWrap}>
                    {action ? action : <Text allowFontScaling={false} style={[styles.close]}>×</Text>}
                </View>
            </TouchableWithoutFeedback>;
        } else if (mode === 'link') {
            operationDom = <View style={styles.actionWrap}>
                {action ? action : <Text allowFontScaling={false} style={[styles.link]}>∟</Text>}
            </View>;
        }
        const main = <View style={[styles.notice, style]}>
            {icon && <View style={styles.left15}>{icon}</View>}
            <View style={[styles.container, icon ? styles.left6 : styles.left15]}>
                <Marquee style={styles.content} text={children} {...marqueeProps}/>
            </View>
            {operationDom}
        </View>;
        return this.state.show ? mode === 'closable' ? main : <TouchableWithoutFeedback onPress={this.onClick}>
            {main}
        </TouchableWithoutFeedback> : null;
    }
}
NoticeBar.defaultProps = {
    mode: '',
    onClick() { },
    icon: <Icon name="icon-notice" style={{ width: px(26), height: px(28) }}/>,
    styles: NoticeStyles,
};
