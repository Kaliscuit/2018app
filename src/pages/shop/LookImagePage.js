'use strict';

import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList,
    TouchableOpacity,
    Platform,
    PixelRatio
} from 'react-native';

import { px } from '../../utils/Ratio';
import { User } from '../../services/Api';
import { show as toast } from '../../widgets/Toast';
import { shareToSession, isWXAppInstalled } from '../../services/WeChat';
import { OldHeader } from '../common/Header';
import { log, logErr, logWarm } from '../../utils/logs'
import {ImagesRes} from "../../utils/ContentProvider";
import Icon from '../../UI/lib/Icon'


const pxRatio = PixelRatio.get();  // 屏幕像密度

export default class extends React.Component {

    constructor(props) {
        super(props);
        const { state: { params } } = this.props.navigation
        this.state = {
            title: params.title,
            img: params.img,
            isShow: false,
            start: 0
        };
    }


    render() {
        const { img, width, height, isShow } = this.state
        const navigation = this.props.navigation;
        return <View style={{ flex: 1 }}>
            <OldHeader
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: 'space-between',
                    backgroundColor: "#fff",
                    paddingLeft: px(30),
                    paddingRight: px(30),
                    ...Platform.select({
                        ios: {
                            paddingTop: px(50),
                            height: px(130),
                        },
                        android: {
                            paddingTop: px(10),
                            height: px(80),
                        }
                    })
                }}
                title={this.state.title}
                leftBtn={
                    <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
                        <Icon name="icon_back"
                            style={{ width: px(44), height: px(44) }} />
                    </TouchableOpacity>
                }
                rightBtn={
                    <TouchableWithoutFeedback
                        onPress={async () => {
                            if (!User.isLogin) {
                                navigation.navigate('LoginPage', {});
                                return;
                            }
                            let isInstalled = await isWXAppInstalled();
                            if (!isInstalled) {
                                toast('没有安装微信');
                                return;
                            }
                            try {
                                await shareToSession({
                                    type: 'imageUrl',
                                    title: navigation.state.params.title,
                                    webpageUrl: 'http://touch.daling.com',
                                    userName: 'gh_3d81a3490164',
                                    imageUrl: navigation.state.params.img,
                                    thumbImage: navigation.state.params.shareImg,
                                    hdImageData: navigation.state.params.img
                                });
                            } catch (e) {
                                log(e)
                            }
                        }}
                    ><Icon
                            style={{ width: px(40), height: px(40), marginTop: px(3) }}
                            name="icon-goodShare" />
                    </TouchableWithoutFeedback>
                }
            />
            <FlatList style={styles.content}
                data={[{ key: img }]}
                keyExtractor={(item, index) => index}
                onEndReached={() => {
                    this.setState({
                        start: this.state.start + 1
                    })
                    if (this.state.start == 5) {
                        this.setState({
                            isShow: true
                        })
                    }
                }}
                renderItem={({ item }) =>
                    <Image
                        resizeMode="contain"
                        style={{ height: px(750 * height / width), width: px(750) }}
                        source={{uri:item.key}} />}
            />
        </View>
        ;
    }

    async componentDidMount() {
        let size = await new Promise((resolve, reject) =>
            Image.getSize(this.state.img,
                (w, h) => resolve({ width: w, height: h }),
                reject)
        );
        this.setState({
            width: size.width,
            height: size.height
        })
    }

}

const styles = StyleSheet.create({
    content: {
        flex: 1
    }
});