//
//  XNStandardIntegration.h
//  NTalkerUIKitSDK
//
//  Created by 郭天航 on 16/9/28.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "XNFunctionView.h"
#import "XNBaseMessage.h"
#import "NTalkerChatViewController.h"
#import "XNEvalueColorManager.h"

@interface XNStandardIntegration : NSObject

@property (nonatomic, strong) XNFunctionView *extensionArea;
@property (nonatomic, strong) XNEvalueColorManager *evaluateColorManager;


#pragma mark - 基本方法

/**
 *  程序开启,注册连接
 *
 *  @param siteid 企业ID
 *  @param SDKKey 唯一标示符
 *
 *  @return 参数判断的返回值,0为参数正确
 */
- (NSInteger)initSDKWithSiteid:(NSString *)siteid andSDKKey:(NSString *)SDKKey;
/**
 *  程序开启,注册连接(与上面的初始化方式二选一，需要传入自己APP的设备ID的才调用该种初始化方式)【可选】
 *
 *  @param siteid 企业ID
 *  @param SDKKey 唯一标示符
 *  @param PCid 传入的PCid
 *  @return 参数判断的返回值,0为参数正确
 */
- (NSInteger)initSDKWithSiteid:(NSString *)siteid andSDKKey:(NSString *)SDKKey andPCid:(NSString*)pcid;

/**
 *  开始聊天，返回聊窗controller
 *
 *  @param settingid 接待组id
 *
 *  @return 聊天窗口controller
 */
- (NTalkerChatViewController *)startChatWithSettingId:(NSString *)settingid;

/**
 *  程序关闭,断开连接
 */
- (void)destroy;

/**
 *  用户登录时调用此方法
 *
 *  @param userid    用户ID,字母,数字,下划线或@符号
 *  @param username  字母,数字,下划线,汉字或@符号
 *  @param userLevel 0到5字符串  0:普通身份   1—5：VIP用户
 *
 *  @return 参数判断的返回值,0为参数正确 401:userid传错；402：username传错  403：userLevel传错  404：SDK初始化出错 405:登录出错。
 */
- (NSInteger)loginWithUserid:(NSString *)userid
                 andUsername:(NSString *)username
                andUserLevel:(NSString *)userLevel;

/**
 用户登录时调用此方法

 @param userid 用户ID,字母,数字,下划线或@符号
 @param username 字母,数字,下划线,汉字或@符号
 @param userLevel 0到5字符串  0:普通身份   1—5：VIP用户
 @param userRank 用户等级
 @param userTag 用户标签
 @return 参数判断的返回值,0为参数正确  401:userid传错；402：username传错  403：userLevel传错  404：SDK初始化出错 405:登录阻塞。
 */
- (NSInteger)loginWithUserid:(NSString *)userid
                 andUsername:(NSString *)username
                andUserLevel:(NSString *)userLevel
                andUserRank:(NSString *)userRank
                andUserTag:(NSString *)userTag;
/**
 *  集成推送的时候调用此方法
 *
 *  @param xpushInfo    推送消息
 *
 */
//-(void)getXPushUnreadCount:(NSDictionary *)remoteNotificatInfo;


/**
 *  用户注销是调用
 */
- (void)logout;

/**
 *  轨迹调用
 *
 *  @param title        页面标题,必填
 *  @param sellerid     商户ID,针对平台版
 *  @param orderid      订单ID
 *  @param orderprice   订单价格
 *  @param ref
 *  @param ntalkerparam 特定参数
 *  @param isVip        用户等级
 *  @param URLString    链接
 *
 *  @return 参数判断的返回值,0为参数正确
 */

- (NSInteger)startHomeAction;

- (NSInteger)startHomeActionWithTitle:(NSString *)title
                         andURLString:(NSString *)URLString;

- (NSInteger)startGoodsListAction;

- (NSInteger)startGoodsListActionWithTitle:(NSString *)title
                              andURLString:(NSString *)URLString
                                    andRef:(NSString *)ref;

- (NSInteger)startGoodsDetailAction;

- (NSInteger)startGoodsDetailActionWithTitle:(NSString *)title
                                andURLString:(NSString *)URLString
                                      andRef:(NSString *)ref;

- (NSInteger)startShoppingCartAction;

- (NSInteger)startShoppingCartActionWithTitle:(NSString *)title
                                 andURLString:(NSString *)URLString
                                       andRef:(NSString *)ref;


- (NSInteger)startOrderActionWithOrderid:(NSString *)orderid
                           andOrderprice:(NSString *)orderprice;

- (NSInteger)startOrderActionWithTitle:(NSString *)title
                          andURLString:(NSString *)URLString
                                andRef:(NSString *)ref
                            andOrderid:(NSString *)orderid
                         andOrderprice:(NSString *)orderprice;

- (NSInteger)startPayActionWithOrderid:(NSString *)orderid
                         andOrderprice:(NSString *)orderprice;

- (NSInteger)startPayActionWithTitle:(NSString *)title
                        andURLString:(NSString *)URLString
                              andRef:(NSString *)ref
                          andOrderid:(NSString *)orderid
                       andOrderprice:(NSString *)orderprice;

- (NSInteger)startPaySuccessActionWithOrderid:(NSString *)orderid
                                andOrderprice:(NSString *)orderprice;

- (NSInteger)startPaySuccessActionWithTitle:(NSString *)title
                               andURLString:(NSString *)URLString
                                     andRef:(NSString *)ref
                                 andOrderid:(NSString *)orderid
                              andOrderprice:(NSString *)orderprice;

#pragma mark - 扩展方法

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

- (void)sendMessage:(XNBaseMessage *)message resend:(BOOL)resend;

#pragma mark - 设置的处理

/*
 *设置头像形状 (YES：圆形头像  NO：默认圆角头像)，可选
 */
- (void)setHeadIconCircle:(BOOL) isCircle;

/*
 * 设置访客头像图片,可选
 * @param userImage  访客头像图片
 */
- (void)setUserIconImage:(UIImage *) userImage;

/*
 *设置FlashServerAddress，可选
 */
- (void)setServerAddress:(NSString *)serverAddress;

/**
 *  设置未读消息持续时间
 *
 *  @param maxTime 未读消息持续时间(1~10,单位:分钟)，默认5分钟
 */
- (void)setCloseChatSessionTime:(NSInteger)maxTime;

/**
 *  链接名片的开关
 *
 *  @param enable YES打开,NO关闭(默认打开)
 */
- (void)setShowCard:(BOOL)enable;

/**
 *  日志的开关
 *
 *  @param enableLog YES打开,NO关闭(默认关闭)
 */
- (void)setLogSwitch:(BOOL)enableLog;

#pragma mark - 扩展方法（H5）
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
 *  订单专用接口
 *
 *  @return 返回访客信息和轨迹会话id
 */
-(NSMutableDictionary *)getUserInfo;


@end
