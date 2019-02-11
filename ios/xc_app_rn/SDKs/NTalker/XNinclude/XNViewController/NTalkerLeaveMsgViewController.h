//
//  UIXNLeaveMsgViewController.h
//  CustomerServerSDK2
//
//  Created by NTalker on 15/5/1.
//  Copyright (c) 2015年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>
/*!留言界面*/
@interface NTalkerLeaveMsgViewController : UIViewController
/*!企业ID*/
@property (nonatomic, strong) NSString *siteId;
/*!接待组ID*/
@property (nonatomic, strong) NSString *settingId;
/*!用户名称*/
@property (nonatomic, copy) NSString *userName;
/*!责任客服*/
@property (nonatomic, strong) NSString *responseKefu;
/*!发起页标题*/
@property (nonatomic, strong) NSString *pageTitle;
/*!发起页URL*/
@property (nonatomic, strong) NSString *pageURLString;

@end
