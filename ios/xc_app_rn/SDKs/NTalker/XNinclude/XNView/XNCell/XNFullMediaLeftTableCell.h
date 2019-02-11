//
//  XNRichMediaLeftTableCell.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 16/6/3.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

@class XNBaseMessage;

@protocol XNTapSuperFullMediaDeleate <NSObject>
@optional
- (void)jumpToWebViewByFullMediaString:(NSString *)fullMediaString;

@end

@interface XNFullMediaLeftTableCell : UITableViewCell
{
    UIImageView *headIcon;
    UIImageView *contentBg;
    UILabel *timeLabel;
    UIView *lineView1;
    UIView *lineView2;
}
@property (nonatomic, weak) id<XNTapSuperFullMediaDeleate> delegate;
+ (void)setHeadIconCircle:(BOOL)isCircle;
- (void)setChatTextMessageInfo:(XNBaseMessage *)dto hidden:(BOOL)hide;
@end
