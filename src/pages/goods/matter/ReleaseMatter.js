'use strict';
/**
 *
 */
import React from "react";

import {
    View,
    ScrollView,
    Platform,
    KeyboardAvoidingView
} from "react-native";

import ReleaseHeader from '../../common/matter/ReleaseHeader';
import ReleaseContent from '../../common/matter/ReleaseContent';
import UploadPhotos from '../../common/matter/UploadPhotos';
import UploadVideo from '../../common/matter/UploadVideo';
import RelationGood from '../../common/matter/RelationGood';
import DeleteView from '../../common/matter/DeleteView';
import Request, { uploadImage } from "../../../services/Request";
import { LoadingRequest } from '../../../widgets/Loading';
import { show as toast } from '../../../widgets/Toast';
import Page from '../../../UI/Page'
import { FootView } from '../../../UI/Page'
import { px, isIphoneX } from '../../../utils/Ratio'

export default class extends Page {
    constructor(props) {
        super(props);
        const images = this.props.navigation.state.params.photos || []
        const height =  images.length < 9 ? (Math.floor(images.length / 3) + 1)  * px(232) : 3  * px(232);
        this.state = {
            photos: this.props.navigation.state.params.photos || [],
            goods: this.props.navigation.state.params.goods,
            video: this.props.navigation.state.params.video || null,
            type: this.props.navigation.state.params.type,
            loading: false,
            scrollFlag: true,
            photosTotalHeight: height, //已上传图片区域高度
        };
    }

    pageHeader() {
        return <ReleaseHeader goBack={this.goBack.bind(this)} publishFn={this.publishFn.bind(this)} navigation={this.props.navigation}/>
    }

    // 提示框的字体
    alertBodyTextStyle = {
        fontSize: px(34)
    }

    pageBody() {
        const {goods, type, video, photos} = this.state;
        return <View style={{flex: 1, backgroundColor: '#fff'}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                {/*<View style={{flex: 1}}>*/}
                <ScrollView
                    ref="scroll"
                    style={{flex: 1}}
                    scrollEventThrottle={10}
                    alwaysBounceVertical={false}
                    bounces={false}
                    onScroll={e => this._onScroll(e)}
                    //canCancelContentTouches={false}
                    //keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"

                    scrollEnabled={this.state.scrollFlag}
                    automaticallyAdjustContentInsets={false}
                >
                    <ReleaseContent ref="releaseContent"/>
                    {type == 'photo' && 
                    <UploadPhotos 
                        setScroll={this.setScroll.bind(this)} 
                        ref="uploadPhotos" 
                        images={photos} 
                        updatePhotoTotalHeight={this.updatePhotoTotalHeight} 
                        setShowDeleteButton={this.setShowDeleteButton}
                    />}
                    {type == 'video' && <UploadVideo ref="uploadVideo" video={video}/>}
                    <RelationGood
                        style={
                            type == 'photo' ? {
                                position:'absolute',
                                top: this.state.photosTotalHeight + 150,
                                right:px(0),
                                left:px(0),
                                zIndex:-1, } : {}
                        }
                        ref="relationGood"
                        navigation={this.props.navigation}
                        goods={goods}/>
                    {
                        type == 'photo' &&
                    <View style={{height: isIphoneX() ? px(160) + 34 : px(160)}}/>
                    }
                    
                </ScrollView>
                {/*</View>*/}
                
                
            </KeyboardAvoidingView>
            <LoadingRequest status={this.state.loading} text={'正在发布中'} />
        </View>
    }

    //上传的图片数量变化导致高度变化
    updatePhotoTotalHeight=(height) => {
        this.setState({photosTotalHeight:height})
    }

    //根据用户操作控制是否显示删除按钮
    setShowDeleteButton = (showDeleteButton) => {
        // this.setState({showDeleteButton:showDeleteButton})
        this.deleteView && this.deleteView.setShowDeleteView(showDeleteButton)

    }

    _onScroll(e) {
        let y = e.nativeEvent.contentOffset.y;
        //console.log(y)
        //return;
        this.refs.uploadPhotos && this.refs.uploadPhotos.resetH(y);
    }

    setScroll(scrollFlag) {
        this.refs.scroll.setNativeProps({ scrollEnabled: scrollFlag })
    }

    pageFooter() {
        const {type, showDeleteButton} = this.state;
        if (type == 'video') return null;
        return <FootView>
            <DeleteView ref={ref => this.deleteView = ref}/>
        </FootView>
    }

    async onReady() {

    }

    goBack() {
        this.refs.dialog.open({
            content: [`确定放弃发布素材吗`],
            btns: [{
                txt: '取消',
                click: () => {
                    this.isCollect = false;
                }
            }, {
                txt: '确定',
                click: async () => {
                    this.props.navigation.goBack();
                }
            }]
        });
    }

    async publishFn() {
        let content = this.refs.releaseContent.getContent(),
            photos = this.refs.uploadPhotos && this.refs.uploadPhotos.getPhotos(),
            video = this.refs.uploadVideo && this.refs.uploadVideo.getVideo(),
            goods = this.refs.relationGood.getGoods(),
            type = this.state.type;
        //console.log(video, 'video')
        if (content == '') {
            return toast('请输入心得内容');
        } else if (type == 'photo' && (!photos || photos.length == 0)) {
            return toast('请选择您要发布的图片')
        } else if (type == 'video' && !video.uri) {
            return toast('请选择您要发布的视频')
        } else if (type == 'video' && video.size > 31457280) {
            return toast('视频不可超过30M')
        } else if (!goods) {
            return toast('请选择关联商品')
        }
        this.setState({
            loading: true
        })
        //'photo'
        let phtArr = '';
        let phtUrl = [], imgWidth = [], imgHeight = [], subjectVideoUrl = [];
        if (type == 'photo') {
            //this.uploadPhotos(photos)
            //判断所选的图片是否有超过10M的
            let photoOverSize = false
            photos.some(item => {
                if (item.size && item.size > 10485760) {
                    photoOverSize = true
                    return true;
                }
            })
            //所选的图片有超过10M的
            if (photoOverSize){
                toast('您上传的部分图片过大，请重新选择后再上传哦~')
                this.setState({loading: false})
                return
            }
            
            phtArr = await this.uploadPhotos(photos);
            if (!phtArr) return;
            phtArr.forEach(i => {
                phtUrl.push(i.img);
                imgWidth.push(i.width);
                imgHeight.push(i.height);
            });
        } else {
            phtArr = await this.uploadVideo(video);
            if (!phtArr) return;
            phtUrl = [phtArr.subject_img_url];
            imgWidth = [phtArr.img_width];
            imgHeight = [phtArr.img_height];
            subjectVideoUrl = [phtArr.videofile];
        }
        //console.log(phtArr, 'phtArr')
        //return;

        let data = {
            // content: content,
            content: content.replace(/(^\s*)|(\s*$)/g, ""),
            sku: goods.sku,
            type: type == 'photo' ? 1 : 2,
            subjectImgUrl: phtUrl.join(),
            imgWidth: imgWidth.join(),
            imgHeight: imgHeight.join(),
            subjectVideoUrl: subjectVideoUrl.join()
        }
        await this.submit(data)
        //console.log(content, photos, video, goods, type, 'content')
    }


    async submit(data) {
        try {
            let res = await Request.post(`/xczin/front/publishSubject/saveSubject.do`, data)
            this.setState({
                loading: false
            })
            toast('发布成功～')
            this.props.navigation.goBack();
            this.props.navigation.state.params.call && this.props.navigation.state.params.call();
            return;
        } catch (e) {
            toast(e.message);
            this.setState({
                loading: false
            })
        }
    }

    async uploadPhotos(photos) {
        try {
            let phtArr = []

            let i = 0;
            while (i < photos.length) {
                let data = new FormData();
                data.append("file", photos[i]);
                //data.append("type", i.type);
                data.append("watermarkYn", photos[i].watermarkYn);
                let hhh = await uploadImage('/xczin/front/publishSubject/uploadPicture.do', data);
                phtArr.push(hhh.t)
                i++;
            }
            //console.log(phtArr, '=======')
            return phtArr
        } catch (e) {
            toast(e.message);
            this.setState({
                loading: false
            })
        }
    }

    async uploadVideo(video) {
        try {
            let data = new FormData();
            data.append("file", video);
            data.append("watermarkYn", video.watermarkYn);
            let res = await uploadImage('/xczin/front/publishSubject/uploadVideo.do', data)
            return res.t;
        } catch (e) {
            toast(e.message);
            this.setState({
                loading: false
            })
        }
    }

}
