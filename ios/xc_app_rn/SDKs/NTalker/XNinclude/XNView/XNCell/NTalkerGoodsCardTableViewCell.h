//
//  NTalkerGoodsCardTableViewCell.h
//  NTalkerUIKitSDK
//
//  Created by 郭天航 on 16/10/26.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "XNGoodsCardView.h"

@class XNTextMessage;

@protocol XNResendTextMsgDelegate <NSObject>
@optional
- (void)toWebViewBySuperLink:(NSString *)link;
- (void)resendTextMsg:(XNTextMessage *)textMessage;

@end


@class XNBaseMessage;
@interface NTalkerGoodsCardTableViewCell : UITableViewCell
{
    UIImageView *headIcon;
    UIImageView *contentBg;
    UILabel *timeLabel;
    UIView *lineView1;
    UIView *lineView2;
    UIActivityIndicatorView *indicatorView;
    
}

@property (nonatomic, strong)UIButton *failedBtn;
@property (nonatomic, strong)UIButton *publicButton;
@property (nonatomic, strong)UIView *XNGoodsCardView;

@property (nonatomic, weak) id<XNResendTextMsgDelegate> delegate;

+ (void)setHeadIconCircle:(BOOL)isCircle;
- (void)setChatTextMessageInfo:(XNBaseMessage *)dto andGoodsCardView:(UIView*)goodsCardView hidden:(BOOL)hide;

@end
