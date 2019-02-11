import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import BadgeStyle from './style/badge';


const BadgeStyles = StyleSheet.create(BadgeStyle);

export default class Badge extends React.Component {
    static defaultProps = {
        size: 'small',
        overflowCount: 99,
        dot: false,
        styles: BadgeStyles,
    };

    render() {
        let {
            styles,
            style,
            children,
            text,
            size,
            overflowCount,
            dot,
            ...restProps // todo: hot
        } = this.props;
        text =
            typeof text === 'number' && text > overflowCount
                ? `${overflowCount}`
                : text;

        // dot mode don't need text
        if (dot) {
            text = '';
        }
        // fake styles
        const fakeStyles = styles
        const badgeCls = this.props.text > 9 ? 'textDomlarge' : 'textDom';
        const reverseCls = this.props.reverse ? `dotreverse` : ''
        const contentDom = !dot ? (
            <View {...restProps} style={[styles[badgeCls], fakeStyles[`${badgeCls}${size}`]]}>
                <View
                    style={[styles.txtWrap, this.props.text > 9 ? styles.txtWraplarge : {}]}
                >
                    <Text style={[styles.text]}>{text}</Text>
                </View>
            </View>
        ) : (
            <View {...restProps} style={[styles.dot, styles[reverseCls], fakeStyles[`dotSize${size}`]]}/>
        );
        return (
            <View style={[styles.wrap, style]}>
                <View style={[fakeStyles[`${badgeCls}Wrap`]]}>
                    {children}
                    {text || dot ? contentDom : null}
                </View>
            </View>
        );
    }
}


