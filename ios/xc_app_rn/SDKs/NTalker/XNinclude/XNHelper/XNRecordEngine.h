//
//  XNRecordEngine.h
//  TestVideoRecord
//
//  Created by Ntalker on 16/8/30.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>

@protocol XNRecordEngineDelegate <NSObject>

- (void)videoRecordDidCompleted:(NSString *)videoPath;

- (void)recordProgress:(CGFloat)progress;

@end

@class AVCaptureVideoPreviewLayer;
@interface XNRecordEngine : NSObject

@property (weak, nonatomic) id<XNRecordEngineDelegate> delegate;

//视频分辨率的宽
@property (assign, nonatomic) NSInteger cx;
//视频分辨率的高
@property (assign, nonatomic) NSInteger cy;


- (AVCaptureVideoPreviewLayer *)videoPreviewLayer;

- (void)startUp;

- (void)startRecord;

- (void)stopRecord;

- (void)cancelRecord;

@end
