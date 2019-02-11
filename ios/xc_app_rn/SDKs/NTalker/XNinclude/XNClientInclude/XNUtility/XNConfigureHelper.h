//
//  XNConfigureHelper.h
//  NTalkerClientSDK
//
//  Created by Ntalker on 16/1/25.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface XNConfigureHelper : NSObject

//获取客服端留言配置信息
+ (void)configureLeaveMessageScene:(NSString *)settingid;

//*****link******(获取链接图片信息)
+ (void)configureLinkCardViewWithSessionid:(NSString*)sessionid andurl:(NSString *)urlstring andMessageid:(NSString*)messageid withBlock:(void(^)(id))block;

@end
