//
//  NSTextLeftTableViewCell.h
//  CustomerServerSDK2
//
//  Created by NTalker on 15/4/29.
//  Copyright (c) 2015年 黄 倩. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "NTalkerMLEmojiLabel.h"

//链接名片***link****

@class XNLinkShowCardModel,XNTextMessage;
@protocol XNTapSuperLinkDeleate <NSObject>

- (void)jumpToWebViewByLink:(NSString *)linkString;
- (void)clickBlueText;//点击机器人链接进留言
-(void)clickBlueTextToChangeManual;//点击连接转人工
- (void)didSelectedToSendMsg:(XNTextMessage *)textMessage;//点击发送反问引导

@end

@class XNBaseMessage;

@interface NTalkerTextLeftTableViewCell : UITableViewCell
{
    UIImageView *headIcon;
    UIImageView *contentBg;
    UILabel *timeLabel;
    UIView *lineView1;
    UIView *lineView2;
    NTalkerMLEmojiLabel *emojiLabel;
//    UIActivityIndicatorView *indicatorView;
    
}
//@property (nonatomic, strong)UIButton *failedBtn;
@property (nonatomic, strong)UIButton *publicButton;
@property (nonatomic, weak) id<XNTapSuperLinkDeleate> delegate;
//反问引导是否可点
@property (nonatomic, assign) BOOL canSelected;
+ (void)setHeadIconCircle:(BOOL)isCircle;
- (void)setChatTextMessageInfo:(XNBaseMessage *)dto hidden:(BOOL)hide;

@end
