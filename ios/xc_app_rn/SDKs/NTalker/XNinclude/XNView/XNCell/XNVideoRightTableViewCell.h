//
//  XNVideoRightTableViewCell.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 16/8/9.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

@class XNVideoMessage,XNBaseMessage;

@protocol XNResendVideoMsgDelegate <NSObject>

- (void)reloadTableView;

- (void)resendVideoMsg:(XNVideoMessage *)videoMessage;

- (void)videoWillPlay:(XNVideoMessage *)videoMessage;

@end

@interface XNVideoRightTableViewCell : UITableViewCell

@property (nonatomic, retain)UIImageView *headIcon;
@property (nonatomic, retain)UILabel *timeLabel;
@property (nonatomic, retain)UILabel *longLabel;
@property (nonatomic, retain)UIView *tipView;
@property (nonatomic, retain)UIButton *tapControl;
@property (nonatomic, retain)UIActivityIndicatorView *indicatorView;
@property (nonatomic, retain)UIImageView *contentImage;
@property (nonatomic, retain)UIView *lineView1;
@property (nonatomic, retain)UIView *lineView2;
@property (nonatomic, retain)UIButton *failedBtn;
@property (nonatomic, retain)UIImageView *contentBg;
@property (nonatomic, weak) id<XNResendVideoMsgDelegate> delegate;
+ (void)setHeadIconCircle:(BOOL)isCircle;
- (void)setChatVideoMessageCell:(XNBaseMessage *)dto hidden:(BOOL)hide;

@end
