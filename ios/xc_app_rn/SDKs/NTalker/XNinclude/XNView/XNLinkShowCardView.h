//
//  XNLinkShowCardView.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 16/2/24.
//  Copyright © 2016年 NTalker. All rights reserved.
//  链接名片展示

#import <UIKit/UIKit.h>
#import "XNTextMessage.h"

@class XNLinkShowCardModel;

@protocol XNLinkShowCardViewDelegate <NSObject>
//跳转到链接
- (void)jumpToWebViewByLinkViewURL:(NSString *)linkString;
//复制链接
//-(void)copyTheLink;

@end

@interface XNLinkShowCardView : UIView
@property(nonatomic,strong)NSString *linkUrl;//名片的链接

-(instancetype)initWithFrame:(CGRect)frame andTextMeaasge:(XNTextMessage*)textMessage isHaveShawLine:(BOOL)isShaw andDelegate:(id <XNLinkShowCardViewDelegate>)delegate;

@end
