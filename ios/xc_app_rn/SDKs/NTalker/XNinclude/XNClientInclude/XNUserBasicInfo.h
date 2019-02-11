//
//  XNUserBasicInfo.h
//  XNChatCore
//
//  Created by Ntalker on 15/8/19.
//  Copyright (c) 2015年 Kevin. All rights reserved.
//

#import <Foundation/Foundation.h>

@class XNGetflashserverDataModel,XNLeaveMsgConfigureModel;
@interface XNUserBasicInfo : NSObject

@property (nonatomic, strong) NSString *cid;
@property (nonatomic, strong) NSString *siteid;
@property (nonatomic, strong) NSString *uid;
@property (nonatomic, strong) NSString *shortUid;
@property (nonatomic, strong) NSString *userName;
@property (nonatomic, strong) NSString *userLevel;
@property (nonatomic, strong) NSString *version;
@property (nonatomic, strong) NSString *appKey;
@property (nonatomic, strong) NSString *appKeyValid;
@property (nonatomic, strong) NSString *trailSessionid;
@property (nonatomic, strong) NSString *device;
@property (nonatomic, strong) NSString *netType;
//初始化成功失败参数
@property (nonatomic, assign) BOOL initSuccess;
@property (nonatomic, strong) XNGetflashserverDataModel *serverData;
@property (nonatomic, strong) XNLeaveMsgConfigureModel *leaveMsgConfigureModel;
//消息版本号
@property (nonatomic, strong) NSNumber * msgversion;
//储存最后回复的客服头像/名称
@property (nonatomic, strong) NSMutableDictionary *lastReplyKefuPool;
/**用户等级，新增参数*/
@property (nonatomic, strong) NSString *userrank;
/**用户标签，新增参数*/
@property (nonatomic, strong) NSString *usertag;

+ (XNUserBasicInfo *)sharedInfo;

@end
