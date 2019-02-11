import { px } from '../../../../utils/Ratio';
export default {
    notice: {
        backgroundColor: '#ee5168',
        height: px(50),
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        marginRight: px(15),
        overflow: 'hidden',
        width: 0,
    },
    content: {
        fontSize: px(24),
        color: '#fff',
    },
    left6: {
        marginLeft: px(15),
    },
    left15: {
        marginLeft: px(30),
    },
    actionWrap: {
        marginRight: px(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    close: {
        color: '#fff',
        fontSize: px(50),
        fontWeight: '200',
        textAlign: 'left',
    },
    link: {
        transform: [{ rotate: '225deg' }],
        color: '#fff',
        fontSize: px(50),
        fontWeight: '500',
        textAlign: 'left',
    },
};
