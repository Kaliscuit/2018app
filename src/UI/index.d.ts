import * as React from 'react';
import {
    ViewStyle,
    TextStyle,
    Image,
    ImageProperties,
    ImageStyle,
    ImageURISource,
    TouchableWithoutFeedbackProps,
    TouchableHighlightProperties,
    TouchableOpacityProperties,
    ViewProperties,
    TextInputProperties,
    TextInput,
    TextProperties,
    StatusBarProperties,
    KeyboardType,
    KeyboardTypeIOS,
    StyleProp,
    GestureResponderEvent,
    Animated,
    TransformsStyle,
    ActivityIndicatorProperties,
} from 'react-native';

export interface LoadingProps {
    color?: string,
    size?: string
}
export interface ButtonProps extends TouchableWithoutFeedbackProps {
    //按钮显示的文字
    value: string,
    /**
     * 是否可点击
     */
    disabled?: boolean,
    /**
     * 按钮使用的皮肤
     */
    theme?: string,
    /**
     * 按钮的样式
     */
    style?: StyleProp<ViewStyle>,
    /**
     * 图标
     */
    icon?: any,
    /**
     * 是否展示loading
     */
    loading?: boolean,
    /**
     * loading的样式
     */
    loadingStyle?: StyleProp<ViewStyle>,
    /**
     * loading组件的参数
     */
    loadingProps?: LoadingProps,
    /**
     * 按钮的点击事件
     */
    onPress?(): void
}
/**
 * 自定义的按钮
 */
export class button extends React.Component<ButtonProps, any> { }


interface IconProps {
    /**
     * 图标的图片地址,require或者远程地址
     */
    name: string,
    /**
     * 图标的宽高
     */
    width?: number,
    /**
     * 图标的点击事件
     */
    onPress?(): void
}
/**
 * 自定义的图标
 */
export class icon extends React.Component<IconProps, any> { }

interface DivProps {

}
/**
 * 自定义容器
 */
export class div extends React.Component<DivProps, any> { }

interface SpanProps{

}
/**
 * 自定义文本框
 */
export class span extends React.Component<SpanProps, any> { }

export class input extends React.Component<SpanProps, any> { }