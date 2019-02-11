//
//  XNRichMediaView.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 16/6/3.
//  Copyright © 2016年 NTalker. All rights reserved.
// 富媒体展示

#import <UIKit/UIKit.h>
#import "XNFullMediaMessage.h"

//@class XNRichMediaModel;
@protocol XNFullMediaViewDelegate <NSObject>
- (void)jumpToWebViewByFullMediaViewURL:(NSString *)urlString;
@end


@interface XNFullMediaView : UIView


-(instancetype)initWithFrame:(CGRect)frame andFullMediaMeaasge:(XNFullMediaMessage*)fullMediaMessage  andDelegate:(id <XNFullMediaViewDelegate>)delegate;

@end
