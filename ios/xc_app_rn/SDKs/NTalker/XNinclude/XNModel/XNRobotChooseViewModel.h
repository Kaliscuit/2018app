//
//  NTalkerRobotChooseChatController.h
//  NTalkerUIKitSDK
//
//  Created by wu xiang on 16/4/14.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "NTalkerMLEmojiLabel.h"


@protocol XNRobotChooseViewModelDelegate <NSObject>

- (void)didSelectedEmojiLabelLink:(NSString *)link withType:(NTalkerMLEmojiLabelLinkType)type;

@end

@interface XNRobotChooseViewModel : NSObject

/// 内容 
@property (nonatomic, copy) NSString *textMsg;
/// 字体大小 默认是14
@property (nonatomic, assign) CGFloat fontSize;
/// tableView的宽度 默认是200 
@property (nonatomic, assign) CGFloat tableViewWidth;
/// 可选的cell的字体颜色  默认蓝色
@property (nonatomic, strong) UIColor *fontColor;
// 能选择
@property (nonatomic, assign) BOOL canSelected;

//可点击范围（每行）
@property (nonatomic,assign) NSRange clickRange;

/// tableView 
@property (nonatomic, strong, readonly) UITableView *tableView;

@property (nonatomic, copy) void (^didSelectCellBlock)(NSString *text);

@property (nonatomic, weak) id <XNRobotChooseViewModelDelegate> delegate;

@end
