//
//  XNExtendInstanceMethod.h
//  NTalkerUIKitSDK
//
//  Created by 郭天航 on 16/9/28.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol XNExtendInstanceMethod <NSObject>

@required

/**
 *  H5混排专用接口
 *
 *  @param siteId          企业ID
 *  @param SDKKey          唯一标示符
 *  @param serverURLString server地址
 *  @param pcId            唯一识别符
 *
 *  @return 参数判断的返回值,0为参数正确
 */
- (NSInteger)initSDKWithSiteid:(NSString *)siteId
                     andSDKKey:(NSString *)SDKKey
             andFlashServerUrl:(NSString *)serverURLString
                       andPcid:(NSString *)pcId;
/**
 *  H5混排专用接口
 *
 *  @return 返回H5接口需要的ID信息
 */
- (NSString *)cidFromLocalStore;

/**
 *  注册推送通知接口
 *
 * @param deviceToken       token值
 */
- (void)regiestPushService:(NSData *)deviceToken;

/*
 *【推送】环境是开发环境还是生产环境(YES：生产环境  NO：研发环境)，重要！
 */
- (void)developEnviroment:(BOOL) isProduction;

#pragma mark - 设置的处理
/*
 *设置头像形状 (YES：圆形头像  NO：默认圆角头像)，可选
 */
- (void)setHeadIconCircle:(BOOL) isCircle;

/*
 *设置FlashServerAddress，可选
 */
- (void)setServerAddress:(NSString *)serverAddress;
/**
 *  设置未读消息持续时间)
 *
 *  @param maxTime 未读消息持续时间(1~10,单位:分钟)
 */
- (void)setCloseChatSessionTime:(NSInteger)maxTime;

/**
 *  链接名片的开关
 *
 *  @param enable YES打开,NO关闭(默认打开)
 */
- (void)setShowCard:(BOOL)enable;

@end
