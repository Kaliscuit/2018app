//
//  XNVideoRecordView.h
//  TestVideoRecord
//
//  Created by Ntalker on 16/8/30.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol XNVideoRecordViewDelegate <NSObject>

- (void)videoRecordDidFinished:(NSString *)videoPath;

- (void)videoRecordDidCanceled;

- (void)videoRecordIsTooShort;

@end

@interface XNVideoRecordView : UIView

//录制最大时间
@property (assign, nonatomic) CGFloat recordMaxTime;
//录制最短时间
@property (assign, nonatomic) CGFloat recordMinTime;

- (instancetype)initWithFrame:(CGRect)frame delegate:(id<XNVideoRecordViewDelegate>)delegate;

- (void)viewWillReappear;

@end
