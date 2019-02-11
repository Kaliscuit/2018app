/**
 * 素材item
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    Text, View, StyleSheet,
    TouchableOpacity, Image,
    TouchableWithoutFeedback,
    ActivityIndicator
} from 'react-native'
import { px, deviceWidth } from '../../../utils/Ratio';
import base from '../../../styles/Base';
import Icon from '../../../UI/lib/Icon';
import Event from '../../../services/Event';
import { ListGood } from './Extra';
import { show as toast } from '../../../widgets/Toast'
import utils_tools from "../../../utils/tools"

const img2 = require('../../../images/img2');

exports.MatterItem = class MatterItem extends React.Component {
    static defaultProps = {
        share: () => { }, //分享素材
        lookBigImg: () => { }, //查看大图
        enterFull: () => { }, //查看视频
        showPopover: () => { }, //长按复制文本
        save: () => { }, //保存素材
    }
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    shouldUpdate = true;
    shouldComponentUpdate() {
        //console.log(this.props.shouldUpdate, 'shouldComponentUpdate')
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    componentWillReceiveProps(pp) {
        //console.log(pp.shouldUpdate, 'shouldComponentUpdate')
        if (pp.show !== this.props.show || pp.shouldUpdate) {
            this.shouldUpdate = true;
            this.setState({
                shouldUpdate: true
            })
            //console.log(this.shouldUpdate, 'his.shouldUpdate')
        } else {
            this.setState({
                shouldUpdate: false
            })
        }
    }

    render() {
        // let item = this.props.item,
        //     sub = item.subjectContent[0],
        //     listType = this.props.listType,
        //     show = this.props.show,
        //     index = this.props.index;

        const {item, listType, show, index} = this.props;
        const sub = item.subjectContent[0];
        const imgList = sub.img_list.filter(item => item)

        const deleteFn = this.props.deleteFn || function () { }
        //console.log(item)
        return <View style={[styles.item, { marginTop: index == 0 ? px(20) : 0 }]} onLayout={e => this.props.setLay && this.props.setLay(e.nativeEvent)}>
            <Publisher listType={listType} item={item} />
            <Content text={sub.content} id={item.id} showPopover={this.props.showPopover} />
            {
                item.contentType == 1 &&
                <ImageView
                    images={imgList}
                    show={show}
                    shouldUpdate={this.state.shouldUpdate}
                    lookBigImg={this.props.lookBigImg}
                />
            }
            {
                item.contentType == 2 &&
                <VideoView
                    video={imgList[0]}
                    show={show}
                    shouldUpdate={this.state.shouldUpdate}
                    enterFull={this.props.enterFull}
                />
            }
            {
                (listType == 'my' || listType == 'collect' || listType === 'marketBottom') && <ListGood goods={item.goodList} navigation={this.props.navigation} shouldUpdate={this.state.shouldUpdate} />
            }
            <FooterView
                share={this.props.share}
                save={this.props.save}
                listType={listType}
                collect={this.props.collect}
                deleteFn={deleteFn}
                item={item}
                shouldUpdate={this.state.shouldUpdate}
            />
        </View>
    }


}
const styles = StyleSheet.create({
    item: {
        marginBottom: px(20),
        backgroundColor: '#fff'
    }
})
class Publisher extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const { item, listType } = this.props;
        return <View style={[base.inline_between, publisherStyles.box]}>
            <View style={[publisherStyles.line, base.inline_left]}>
                <Image
                    resizeMethod="scale"
                    source={{ uri: item.shoplogo }}
                    style={publisherStyles.logo} />
                <View style={publisherStyles.right}>
                    <Text style={publisherStyles.name} allowFontScaling={false}>{item.shopName || ''}</Text>
                    {
                        listType !== 'marketBottom' &&
                        <Text style={publisherStyles.date} allowFontScaling={false}>{item.dateTime || ''}</Text>
                    }
                </View>
            </View>
            {
                item.status !== 1 &&
                <Text style={publisherStyles.status} allowFontScaling={false}>{item.status == 0 ? '审核中' : '审核不通过'}</Text>
            }
            {
                listType === 'marketBottom' && !!item.transmitNumber &&
                <Text style={publisherStyles.sharePeopleText} allowFontScaling={false}>{`${item.transmitNumber}人已转发`}</Text>
            }
        </View>
    }
}

const publisherStyles = StyleSheet.create({
    box: {
        width: px(690),
        marginHorizontal: px(30),
        marginTop: px(30)
    },
    line: {
        height: px(70),
        //width: px(690),

    },
    logo: {
        width: px(70),
        height: px(70),
        borderRadius: px(35),
        overflow: 'hidden'
    },
    right: {
        marginLeft: px(20),
        height: px(70),
        justifyContent: 'center'
    },
    name: {
        fontSize: px(30),
        color: '#222'
    },
    date: {
        fontSize: px(24),
        color: '#999'
    },
    status: {
        fontSize: px(30),
        color: '#ed3f58'
    },
    sharePeopleText: {
        fontSize: px(24),
        color: '#999999'
    }
})

exports.Publisher = Publisher


class Content extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            numberOfLines: null,
            showExpandText: false,
            expandText: '展开',
            measureFlag: true,
        }
        this.numberOfLines = 3;
        this.needExpand = true;
        this.measureFlag = true;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.text !== this.props.text) {
            this.measureFlag = true
            this.numberOfLines = 3;
            this.needExpand = true;
            this.setState({
                expanded: true,
                numberOfLines: null,
                showExpandText: false,
                expandText: '展开',
                measureFlag: true,
            })
        }
    }

    //Event.on('matter.copy', this.copy)

    onPressExpand() {
        if (!this.state.expanded) {
            this.setState({ numberOfLines: null, expandText: '收起', expanded: true })
        } else {
            this.setState({ numberOfLines: this.numberOfLines, expandText: '展开', expanded: false })
        }
    }

    onTextLayout(event) {
        if (this.measureFlag) {
            if (this.state.expanded) {
                this.maxHeight = event.nativeEvent.layout.height;
                this.setState({ expanded: false, showExpandText: false, numberOfLines: this.numberOfLines });
            } else {
                this.mixHeight = event.nativeEvent.layout.height;
                if (this.mixHeight == this.maxHeight) {
                    this.needExpand = false;
                    this.setState({ showExpandText: false })
                } else {
                    this.needExpand = true;
                    this.setState({ showExpandText: true })
                }
                this.measureFlag = false;
            }
        }

    }

    showPopover(ref) {
        let text = this.props.text;
        this.props.showPopover(text, this.refs[ref])
        // Event.emit('matter.copy', text, this.refs[ref])
        // Event.emit('storeMatter.copy', text, this.refs[ref])
        //this.props.showPopover && this.props.showPopover(content, this.refs[re]);
    }

    /**
     *empty 是没有按钮的占位符，30px保持间距统一
     */
    render() {
        let expandText = this.state.showExpandText ?
            <TouchableOpacity activeOpacity={0.9} onPress={this.onPressExpand.bind(this)}>
                <View style={[contentStyles.btn]}>
                    <Text allowFontScaling={false} style={contentStyles.btnTxt}>{this.state.expandText}</Text>
                    {this.state.expanded && <Icon name="icon-detail-shousuo" style={contentStyles.icon} />}
                    {!this.state.expanded && <Icon name="icon-detail-zhankai" style={contentStyles.icon} />}
                </View>
            </TouchableOpacity>
            : <View style={contentStyles.empty}></View>;
        return <View style={[contentStyles.line]}>
            <Text onLongPress={() => this.showPopover('button' + this.props.id)} ref={`button${this.props.id}`} numberOfLines={this.state.numberOfLines} onLayout={this.onTextLayout.bind(this)} style={contentStyles.txt} allowFontScaling={false}>
                {this.props.text}
            </Text>
            {expandText}
        </View>
    }
}

const contentStyles = StyleSheet.create({
    line: {
        width: px(690),
        marginHorizontal: px(30),
        marginTop: px(30),
    },
    txt: {
        color: '#333',
        fontSize: px(30),
        lineHeight: px(42)
    },
    btn: {
        paddingTop: px(24), // 30-6 6文字行高
        paddingBottom: px(30),
        flexDirection: 'row',
        alignItems: 'center'
    },
    empty: {
        height: px(24)
    },
    btnTxt: {
        color: '#d0648f',
        fontSize: px(28)
    },
    icon: {
        width: px(22),
        height: px(12),
        marginLeft: px(17)
    }
})

exports.Content = Content

class ImageView extends React.Component {
    constructor(props) {
        super(props);
        // this.max = px(18);
        // this.min = px(8);
        // let images, width = 1, length = 1;
        let images;
        if (props.images) {
            images = props.images;
            // length = images.length;
            // const h1 = px(224);
            // const h2 = px(456);
            // width = length == 1 ? h2 : h1;
            // length - index <= 3 ? 0 : this.min
            //length == 4 ? index % 2 ? this.max : this.min : (index + 1) % 3 ? this.min : 0,
            images.map((item, index) => {
                if (item === null) return item;
                if (index == 0) {
                    item.show = true;
                } else {
                    item.show = false;
                }
                // item.bottom = length - index <= 3 ? 0 : this.min;
                // if (length == 4) {
                //     if (index % 2) {
                //         item.right = this.max;
                //     } else {
                //         item.right = this.min;
                //     }
                // } else {
                //     if ((index + 1) % 3) {
                //         item.right = this.min;
                //     } else {
                //         item.right = 0;
                //     }
                // }

            })
        }

        this.state = {
            images: images,
            // width: width,
            // length: length
        }
    }

    next(index) {
        //加载下一个
        const img = this.state.images[index + 1];
        if (!img) return;
        try {
            // this.shouldUpdate = true;
            let obj = this.state.images;
            const item = obj[index + 1];
            item.show = true;
            this.setState({ images: obj })
            this.shouldUpdate = true;
        } catch (e) {
            //
        }
    }

    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    componentWillReceiveProps(pp) {
        //console.log(pp.shouldUpdate, '==========')
        if (pp.show !== this.props.show || pp.shouldUpdate) {
            this.shouldUpdate = true;
        }

        // let images, width = 1, length = 1;
        let images;
        if (pp.images) {
            images = pp.images;
            // length = images.length;
            // const h1 = px(224);
            // const h2 = px(456);
            // width = length == 1 ? h2 : h1;
            // length - index <= 3 ? 0 : this.min
            //length == 4 ? index % 2 ? this.max : this.min : (index + 1) % 3 ? this.min : 0,
            images.map((item, index) => {
                if (item === null) return item;
                if (index == 0) {
                    item.show = true;
                } else {
                    item.show = false;
                }
                // item.bottom = length - index <= 3 ? 0 : this.min;
                // if (length == 4) {
                //     if (index % 2) {
                //         item.right = this.max;
                //     } else {
                //         item.right = this.min;
                //     }
                // } else {
                //     if ((index + 1) % 3) {
                //         item.right = this.min;
                //     } else {
                //         item.right = 0;
                //     }
                // }

            })
            this.setState({
                images, 
                // width,
                // length
            })
        }
    }

    lookImg(index) {
        let list = this.props.images;
        let images = []
        list.forEach(i => {
            if (i && i.subject_img_url_http){
                images.push({ url: i.subject_img_url_http })
            }
            
        })
        this.props.lookBigImg(index, images)
        // Event.emit('matter.lookImg', index, images)
        // Event.emit('storeMatter.lookImg', index, images)
    }

    render() {
        // const { images, width } = this.state;
        // if (images.length == 0) {
        //     return null;
        // }
        let { images } = this.state;
        const tempimages = images.slice()
        if (tempimages.length == 0) return null;

        if (tempimages.length == 1) return this.render1(tempimages);
        if (tempimages.length == 4) {
            tempimages.splice(2, 0, null);
        }
        return this.render0(tempimages);

        //console.log(images)
        // return <View style={[imageViewStyles.imageContain]}>
        //     {
        //         (images || []).map((i, index) =>
        //             <TouchableOpacity activeOpacity={0.8} onPress={() => this.lookImg(index)} key={index}>
        //                 <Image
        //                     onLoad={() => this.next(index)}
        //                     source={{ uri: this.props.show ? i.subject_img_url_http : img2 }}
        //                     resizeMode="cover"
        //                     resizeMethod="resize"
        //                     style={[imageViewStyles.images, {
        //                         width: width, height: width,
        //                         marginRight: i.right,
        //                         marginBottom: i.bottom,
        //                     }]}
        //                 >
        //                 </Image>
        //             </TouchableOpacity>
        //         )
        //     }
        // </View>
    }
    render0(images) {
        return <View style={imageViewStyles.imageContain}>
            {images.map((i, index) => {
                if (i === null) return <View style={imageViewStyles.images} key={index}></View>
                return <TouchableOpacity activeOpacity={0.8} onPress={() => this.lookImg(images.length === 5 && index > 2 ? index - 1 : index)} key={index}>
                    <Image
                        onLoad={() => this.next(index)}
                        source={{ uri: this.props.show ? utils_tools.cutImage(i.subject_img_url_http, 200, 200) : img2 }}
                        resizeMode="stretch"
                        resizeMethod="resize"
                        style={imageViewStyles.images}
                    />
                </TouchableOpacity>
            }
            )}
        </View>
    }
    render1(images) {
        let index = 0;
        let i = images[0];
        return <View style={imageViewStyles.imageContain}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => this.lookImg(index)} key={index}>
                <Image
                    onLoad={() => this.next(index)}
                    source={{ uri: this.props.show ? utils_tools.cutImage(i.subject_img_url_http, 400, 400) : img2 }}
                    resizeMode="stretch"
                    resizeMethod="resize"
                    style={[imageViewStyles.images, { width: px(456), height: px(456) }]}
                />
            </TouchableOpacity>
        </View>
    }

}

const imageViewStyles = StyleSheet.create({
    imageContain: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // paddingHorizontal: px(30)
        paddingLeft: px(26),
        paddingRight: px(22)
    },
    images: {
        overflow: 'hidden',
        // borderRadius: px(10)
        borderRadius: px(10),
        width: px(224),
        height: px(224),
        margin: px(4)
    },
})

exports.ImageView = ImageView

class VideoView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: px(456),
            height: px(456),
        }
    }

    componentWillMount() {
        const { video, matter } = this.props;
        Image.getSize(video.subject_img_url_http, (width, height) => {
            this.calculationWH(width, height)
        })
    }

    calculationWH = (width, height) => {
        let size = width / height;

        if (width > height) {
            this.w = px(690)
            this.h = px(690) / size;
        }
        if (width == height) {
            this.w = px(456)
            this.h = px(456) / size;
        }
        if (width < height) {
            this.w = px(388)
            this.h = px(388) / size;
        }
        this.setState({ width: this.w, height: this.h })
    }



    enter() {
        //subject_video_size
        let video = this.props.video;
        
        if (video.subject_video_url_http == "") {
            toast("小主，下拉刷新试试哦~")
        } else {
            this.props.enterFull(video)
        }

        // Event.emit('matter.openVideo', video)
        // Event.emit('storeMatter.openVideo', video)
    }
    shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }



    componentWillReceiveProps(pp) {
        //console.log(pp.shouldUpdate, '==========')
        if (pp.show !== this.props.show || pp.shouldUpdate) {
            this.shouldUpdate = true;
        }
        if (pp.video.subject_img_url_http != this.props.video.subject_img_url_http) {
            Image.getSize(pp.video.subject_img_url_http, (width, height) => {
                this.calculationWH(width, height)
            })
        }
    }

    render() {
        const { video, matter } = this.props;
        if (!video) {
            return null;
        }
        const { width, height } = this.state
        return <TouchableOpacity activeOpacity={0.9} onPress={() => this.enter()}>
            <View style={videoViewStyles.videoContain}>
                <Image
                    source={{ uri: this.props.show ? video.subject_img_url_http : img2 }}
                    resizeMode="cover"
                    resizeMethod="resize"
                    style={[videoViewStyles.video, {
                        width: width * 1,
                        height: height * 1,
                        borderRadius: px(10),
                        overflow: 'hidden'
                    }]}
                >
                </Image>
                <Icon name="icon-detail-play" style={[videoViewStyles.play, {
                    left: (width * 1 - px(100)) / 2 + px(30),
                    top: (height * 1 - px(100)) / 2,
                }]} />
            </View>
        </TouchableOpacity>
    }
}

const videoViewStyles = StyleSheet.create({
    videoContain: {
        paddingHorizontal: px(30),
    },
    video: {
        overflow: 'hidden',
        borderRadius: px(10)
    },
    play: {
        width: px(100),
        height: px(100),
        position: 'absolute',
        zIndex: 1
    }
})

class FooterView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    /*shouldUpdate = true;
    shouldComponentUpdate() {
        if (!this.shouldUpdate) return false;
        return !(this.shouldUpdate = false);
    }

    componentWillReceiveProps(pp) {
        if (pp.item !== this.props.item) {
            this.shouldUpdate = true;
        }
    }*/

    renderBtn(icon, txt) {
        return <View style={[footStyles.matterBtn, base.inline]}>
            <Icon
                name={icon}
                style={footStyles.icon}
            />
            <Text allowFontScaling={false} style={footStyles.btnTxt}>{txt}</Text>
        </View>
    }

    render() {
        const { item, listType } = this.props;
        if (!item) {
            return null;
        }
        return <View style={[footStyles.matterFooter]}>
            <View style={[base.inline, { flex: 1 }]}>
                {
                    item.contentType == 1 && item.status == 1 ?
                        <TouchableWithoutFeedback onPress={() => this.save(1)}>
                            {this.renderBtn("icon-matter-down", '保存')}
                        </TouchableWithoutFeedback> : null
                }
                {
                    item.contentType == 2 && item.status == 1 ?
                        <TouchableWithoutFeedback onPress={() => this.save(2)}>
                            {this.renderBtn("icon-matter-down", '保存')}
                        </TouchableWithoutFeedback> :
                        null
                }
                {
                    item.status == 1 && <TouchableWithoutFeedback onPress={() => this.share(item)}>
                        {
                            this.renderBtn("icon-matter-share", '分享')
                        }
                    </TouchableWithoutFeedback>
                }
                {
                    listType != 'selected' && listType != 'collect' && listType !== 'marketBottom' ? <TouchableWithoutFeedback onPress={() => this.deleteFn()}>
                        {
                            this.renderBtn("icon-matter-delete", item.status == 0 ? '删除素材' : '删除')
                        }
                    </TouchableWithoutFeedback> : null
                }
                {
                    listType == 'selected' || listType == 'collect' || listType === 'marketBottom' ?
                        <TouchableWithoutFeedback onPress={() => this.collect_()}>
                            {
                                item.isCollet == 0 ?
                                    this.renderBtn("icon-matter-uncollect", '收藏')
                                    :
                                    this.renderBtn("icon-matter-collect", '已收藏')
                            }
                        </TouchableWithoutFeedback> : null
                }
            </View>
        </View>
    }

    getFoot() {
        let renderArr = [
            { txt: '保存', icon: 'icon-matter-down', method: 'savePhotos' },
            { txt: '保存', icon: 'icon-matter-down', method: 'saveVideo' },
            { txt: '分享', icon: 'icon-matter-share', method: 'share' },
            { txt: '收藏', icon: 'icon-matter-uncollect', method: 'savePhotos' },
            { txt: '已收藏', icon: 'icon-matter-collect', method: 'savePhotos' },
            { txt: '删除', icon: 'icon-matter-delete', method: 'savePhotos' },

        ]
        let { item } = this.props;
        if (item) {

        }
    }


    save(type) {
        let item = this.props.item;
        this.props.save(type, item)
        // Event.emit('matter.save', type, item);
        // Event.emit('storeMatter.save', type, item);
    }

    share(item) {
        // Event.emit('matter.share', item);
        // Event.emit('storeMatter.share', item);
        this.props.share(item)
    }

    collect_() {
        let item = this.props.item, type = !item.isCollet * 1;
        this.props.collect && this.props.collect(item, type);
        //Event.emit('matter.collect', item, type);
    }

    deleteFn() {
        let item = this.props.item;
        this.props.deleteFn && this.props.deleteFn(item);
        //Event.emit('matter.deleteFn', item);
    }
}

const footStyles = StyleSheet.create({
    matterFooter: {
        height: px(80),
        borderTopColor: '#e5e5e5',
        borderTopWidth: px(1),
        marginTop: px(30)
    },
    matterBtn: {
        flex: 1
    },
    btnTxt: {
        color: '#333',
        fontSize: px(28)
    },
    icon: {
        width: px(28),
        height: px(28),
        marginRight: px(12)
    }
})
