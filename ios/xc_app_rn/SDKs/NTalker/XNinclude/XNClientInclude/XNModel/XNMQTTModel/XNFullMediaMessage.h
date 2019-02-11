//
//  XNFullMediaMessage.h
//  NTalkerClientSDK
//
//  Created by Ntalker on 16/6/3.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import "XNBaseMessage.h"

@interface XNFullMediaMessage : XNBaseMessage

@property (strong, nonatomic) NSString *desc;
@property (strong, nonatomic) NSString *image;
@property (strong, nonatomic) NSString *url;
@property (strong, nonatomic) NSString *content;

+ (XNFullMediaMessage *)fullMediaMessageWithMsgTime:(long long)msgTime
                                          andUserid:(NSString *)userid
                                        andUserInfo:(NSString *)userInfo
                                         andMsgInfo:(NSString *)msgInfo;

@end
