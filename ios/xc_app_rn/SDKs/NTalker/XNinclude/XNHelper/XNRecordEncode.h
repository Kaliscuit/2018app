//
//  XNRecordEncode.h
//  TestVideoRecord
//
//  Created by Ntalker on 16/8/31.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

@protocol  XNRecordEncodeDelegate <NSObject>

- (void)recordWillCompleted;

@end

@interface XNRecordEncode : NSObject

@property (weak, nonatomic) id<XNRecordEncodeDelegate> delegate;

- (instancetype)initWithPath:(NSString *)path
                       width:(NSInteger)width
                      height:(NSInteger)height
                     channel:(int)ch
                     samples:(Float64)rate;

- (BOOL)encodeFrame:(CMSampleBufferRef) sampleBuffer isVideo:(BOOL)isVideo;

- (void)finishRecord:(void(^)(void))handle;

- (void)cancelWrite;

@end
