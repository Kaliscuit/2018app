//
//  XNHistoryTipTableViewCell.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 16/2/23.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface XNHistoryTipTableViewCell : UITableViewCell

@property (strong, nonatomic) NSDictionary *languageDict;

-(void)configureHistoryMessageTipCell:(BOOL)isShowTip;

@end
