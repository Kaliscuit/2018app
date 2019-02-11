'use strict';
/**
 * loading动画
 */
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Modal,
    Animated,
    Easing
} from 'react-native';

import { px, deviceWidth, deviceHeight } from '../utils/Ratio';
import Icon from '../UI/lib/Icon'
// import base from '../styles/Base';

class LoadView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            rotate: new Animated.Value(0),
        };
    }
    render() {
        return <View style={styles.load_box}>
            <Animated.View style={[styles.bg, {
                transform: [
                    {
                        rotate: this.state.rotate.interpolate({
                            inputRange: [0, 360],
                            outputRange: ['0deg', '360deg']
                        })
                    }
                ]
            }]}>
                <Icon name="ani-loading-bg" width={px(74)} height={px(74)} />
            </Animated.View>
            <Icon name="ani-loading-logo" width={px(47)} height={px(29)} />
        </View>
    }
    componentWillMount() {
        this.run()
        this.start()
    }
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.state.rotate.stopAnimation()
    }
    start() {
        if (this.timer) clearInterval(this.timer);
        this.state.rotate.stopAnimation()
        this.timer = setInterval(() => this.run(), 1000);
    }
    run() {
        Animated.timing(this.state.rotate, {
            toValue: 360,
            duration: 1000,
            easing: Easing.linear
        }).start(() => this.state.rotate.setValue(0))
    }
    // run2() {
    //     this.state.rotate.setValue(0)
    //     Animated.timing(this.state.rotate, {
    //         toValue: 360,
    //         duration: 1000,
    //         easing: Easing.linear
    //     }).start(() => this.run())
    // }
}
exports.LoadView = LoadView;
class LoadViewCanBack extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }

    render() {
        if (this.state.show) {
            return <View style={[styles.newLoad, {
                height: this.payModeHeight,
                top: this.topHeaderHeight
            }]}>
                <LoadView />
            </View>
        }

        return null;
    }

    open(payModeHeight, topHeaderHeight) {
        this.payModeHeight = payModeHeight
        this.topHeaderHeight = topHeaderHeight
        this.setState({
            show: true
        });
    }

    close() {
        this.setState({
            show: false
        });
    }
}
exports.LoadViewCanBack = LoadViewCanBack
export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.timer = null;
    }

    render() {
        if (this.state.show) {
            return <View style={[styles.full, this.props.style]}>
                <LoadView />
            </View>
        }

        return null;
    }

    open() {
        this.setState({
            show: true
        });
        this.timer = setTimeout(() => {
            this.setState({
                show: false
            });
        }, 6000);
    }

    close() {
        this.setState({
            show: false
        }, () => {
            if (this.timer) clearTimeout(this.timer);
        });
    }

    componentWillUnmount() {
        if (!this.timer) return;
        clearTimeout(this.timer)
    }

}
// export default class extends React.Component {
//
//     constructor(props) {
//         super(props)
//         this.state = {
//             showModal: false,
//         }
//     }
//     render() {
//         return <Modal ref={e => this.load = e}
//             visible={this.state.showModal}
//             onShow={() => { }}
//             onRequestClose={() => { }}
//             animationType="none"
//             transparent={true}>
//             <View style={styles.full}>
//                 <LoadView />
//             </View>
//         </Modal>
//     }
//     close() {
//         this.setState({ showModal: false })
//     }
//     open() {
//         this.setState({ showModal: true })
//     }
// }
const styles = StyleSheet.create({
    full: {
        position: 'absolute',
        zIndex: 999,
        left: 0,
        top: 0,
        width: deviceWidth,
        height: deviceHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    load_box: {
        width: deviceWidth * 0.16,
        height: deviceWidth * 0.16,
        backgroundColor: 'rgba(37,36,38,.8)',
        borderRadius: px(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    bg: {
        position: 'absolute',
    },
    newLoad: {
        position: 'absolute',
        left: 0,
        width: px(750),
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
