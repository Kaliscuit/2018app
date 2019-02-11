//
//  XNChatKefuUserModel.h
//  XNChatCore
//
//  Created by Ntalker on 15/9/3.
//  Copyright (c) 2015年 Kevin. All rights reserved.
//

#import "XNChatBasicUserModel.h"

@interface XNChatKefuUserModel : XNChatBasicUserModel

@property (nonatomic, strong) NSString *externalname;
@property (nonatomic, strong) NSString *nickname;
@property (nonatomic, strong) NSString *sessionid;
//判断客服优先级类型
@property (nonatomic, assign) int usertype;//0:人工优先  1:机器人优先  nil:没有机器人

+ (XNChatKefuUserModel *)dataFromJsonStr:(NSDictionary *)dict;

- (XNChatKefuUserModel *)clone:(XNChatKefuUserModel *)data;

- (BOOL)mergeUser:(XNChatKefuUserModel *)user WithAnotherUser:(XNChatKefuUserModel *)anotherUser;

@end
