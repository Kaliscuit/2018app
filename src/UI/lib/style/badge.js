import {px} from "../../../utils/Ratio";

const brand_important = '#ee6ea6'
const color_text_base_inverse = '#fff'

export default {
    wrap: {
        flexDirection: 'row',
    },
    textCornerWrap: {
        overflow: 'hidden',
    },
    dot: {
        width: px(16),
        height: px(16),
        borderRadius: px(8),
        backgroundColor: brand_important,
        position: 'absolute',
        top: -px(2),
        right: -px(2),
    },
    dotreverse: {
        backgroundColor: color_text_base_inverse,
    },
    dotSizelarge: {
        width: px(32),
        height: px(32),
        borderRadius: px(16),
    },
    txtWrap: {
        width: px(36),
        height: px(36),
        justifyContent: 'center',
        backgroundColor: brand_important,
        borderRadius: px(36),
        overflow: 'hidden'
    },
    txtWraplarge: {
        width: px(45),
        height: px(36),
        justifyContent: 'center',
        backgroundColor: brand_important,
        borderRadius: px(36),
        overflow: 'hidden'
    },
    textDom: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(40),
        height: px(40),
        backgroundColor: '#fff',
        position: 'absolute',
        top: -px(12),
        right: -px(16),
        borderRadius: px(40),
        overflow: 'hidden'
    },
    textDomlarge: {
        justifyContent: 'center',
        alignItems: 'center',
        width: px(49),
        height: px(40),
        backgroundColor: '#fff',
        borderRadius: px(36),
        overflow: 'hidden',
        position: 'absolute',
        top: -px(18),
        right: -px(17)
    },
    text: {
        fontSize: px(22),
        color: color_text_base_inverse,
        textAlign: 'center'
    }
};
