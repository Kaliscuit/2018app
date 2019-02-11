//
//  XNUtilityCell.h
//  NTalkerUIKitSDK
//
//  Created by Ntalker on 16/3/16.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol XNUtilityCellDelegate <NSObject>

- (void)blueTextClicked;

@end

@class XNBaseMessage;
@interface XNUtilityCell : UITableViewCell

@property (weak, nonatomic) id<XNUtilityCellDelegate> delegate;

- (void)setUtilityCell:(XNBaseMessage *)message;

@end
