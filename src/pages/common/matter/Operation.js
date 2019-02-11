'use strict';

import React, {Component} from 'react';
import SyanImagePicker from 'react-native-syan-image-picker';
import ImagePicker from 'react-native-image-crop-picker';

exports.UploadOperation = {
    async upPhotos(maxFiles) {
        try {
            const photos = await SyanImagePicker.asyncShowImagePicker({
                imageCount: maxFiles,
                isRecordSelected: true
            });
            return {
                photos: photos,
                status: 0
            };
        } catch (err) {
            //console.log(err.message)
            return {
                photos: [],
                err: err.message
            }
            //
        }
        
    },
    removePhotos(index) {
        SyanImagePicker.removePhotoAtIndex(index);
    },
    removeAllPhotos() {
        SyanImagePicker.removeAllPhoto();
    },
    async uploadVideo() {
        let video = null;
        try {
            video = await ImagePicker.openPicker({
                mediaType: "video",
                loadingLabelText: '正在上传中 ...',
                compressImageQuality: 0.9
            });
            //console.log(video, 0);
            return video;
        } catch (e) {
            if (e.message.indexOf('access') > 0) {
                this.refs.alertModal.open('请进入iPhone的"设置-隐私-照片"选项，允许达令家访问您的手机相机');
            }
            return video;
        }
    }
    
}