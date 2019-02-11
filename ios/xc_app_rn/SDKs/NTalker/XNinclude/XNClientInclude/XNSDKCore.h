//
//  XNSDKCore.h
//  XNChatCore
//  XNVersion @"2.6.5.8"
//  Created by Ntalker on 15/8/19.
//  Copyright (c) 2015年 Kevin. All rights reserved.
//


#import <Foundation/Foundation.h>

@protocol XNNotifyInterfaceDelegate, XNFinishGetFlashServer;
@class UIViewController,XNBaseMessage,XNChatBasicUserModel,XNProductionMessage;

@interface XNSDKCore : NSObject

@property (nonatomic, weak) id<XNNotifyInterfaceDelegate> delegate;
@property (nonatomic, weak) id<XNFinishGetFlashServer> integrationDelegate;

+ (XNSDKCore *)sharedInstance;

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
 *  程序关闭,断开连接
 */
- (void)destroy;

/**
 *  用户登录时调用此方法
 *
 *  @param userid    用户ID,字母,数字,下划线或@符号
 *  @param username  字母,数字,下划线,汉字或@符号
 *  @param userLevel 1到5
 *
 *  @return 参数判断的返回值,0为参数正确
 */
- (NSInteger)loginWithUserid:(NSString *)userid
                 andUsername:(NSString *)username
                andUserLevel:(NSString *)userLevel;

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
- (NSInteger)startActionWithTitle:(NSString *)title
                      andSellerId:(NSString *)sellerid
                       andOrderid:(NSString *)orderid
                    andOrderprice:(NSString *)orderprice
                           andRef:(NSString *)ref
                  andNtalkerparam:(NSString *)ntalkerparam
                         andIsVip:(NSString *)isVip
                     andURLString:(NSString *)URLString;

/**
 *  设置未读消息持续时间)
 *
 *  @param maxTime 未读消息持续时间(1~10,单位:分钟)
 */
- (void)setUnreadMessageNotifyMaxTime:(NSInteger)maxTime;

/**
 *  链接名片的开关
 *
 *  @param enable YES打开,NO关闭(默认打开)
 */
- (void)setLinkCardEnable:(BOOL)enable;

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

/**
 *  注册推送通知接口
 *
 * @param deviceToken       token值
 */
- (void)regiestPushService:(NSData *)deviceToken;

/*
 *【推送】环境是开发环境还是生产环境(YES：生产环境  NO：研发环境)，重要！
 */

@property (nonatomic, assign) BOOL isProduction;

/*
 * 推送消息清零接口：访客客户端查看某接待组未读消息后，清零该接待组未读消息
 */
-(void)cleanXPushMessageBySettingid:(NSString *)settingid;

/**
 日志开关

 @param enableLog 是否打开开关
 */
- (void)setLogSwitch:(BOOL)enableLog;

#pragma mark =======================chat api========================

- (void)closeChatViewSettingid:(NSString *)settingid;

- (void)startChatWithSettingid:(NSString *)settingid kefuId:(NSString *)kefuId isSingle:(NSString *)isSingle;

- (void)sendMessage:(XNBaseMessage *)message resend:(BOOL)resend;

- (void)chatIntoBackGround:(NSString *)settingId;

- (NSMutableArray *)messageFromDBByNum:(NSInteger)num andOffset:(NSInteger)offset;

//消息预知相关

/**
 发送正用户在输入的消息

 @param messageString 用户正在输入的内容
 @param settingId     客服组ID
 */
- (void)predictMessage:(NSString *)messageString settingId:(NSString *)settingId;
/**
 客服正在输入的状态

 @param settingId 客服组ID
 */
-(void)remoteNotifyUserInputingWithSettingId:(NSString *)settingId;

/**
 隐藏正在输入的状态
 @param settingId 客服组ID
 */
-(void)hideInputingWithSettingId:(NSString *)settingId;

/**
 取出咨询列表数据
 @return 咨询列表数据
 */
-(NSMutableArray *)chatListMessagFromDB;

//咨询列表（更新消息未读<--->已读）
/**
 更新咨询列表最后一条消息阅读状态

 @param lastMessageObject 最后一条消息
 */
-(void)updateChatListMessageDB:(NSDictionary *)lastMessageObject;
/**
 删除某一条列表信息
 
 @param messageObject 要删除的消息
 */
-(void)deleteChatListMessageDBWithMessage:(NSDictionary *)messageObject;
/**
 xpush消息更新到消息列表

@param messageObject 待更新的消息
*/
//-(void)putXPushMessageToListDB:(NSDictionary *)XPushMessageinfo;

/**
 更新机器人输入框转人工按钮
 
 @param isCanChangeManual 转人工按钮是否可点击
 */
-(void)updateRobotInputView:(BOOL)isCanChangeManual;
/**
 获取全部接待组未读消息数集合 【可选】
 
 @return 全部接待组未读消息数集合
 */
-(NSMutableArray *)getAllSettingidUnreadCountFromDB;
/**
 获取某一接待组未读消息数 【可选】
 
 @return 某一接待组未读消息数
 */
-(NSString *)getUnreadCountBySettingId:(NSString *)settingid;
/**
 清空未读消息数【可选】
 
 @param settingid 要清空的未读消息的接待组ID
 */
-(void)cleanUnreadBySettingid:(NSString *)settingid;

/**
 *  集成推送的时候调用此方法
 *
 *  @param xpushInfo    推送消息
 *
 */
-(void)setXPushUnreadCount:(NSDictionary *)remoteNotificatInfo;
/**
 设置用户标签
 
 @param userTag 用户标签
 */
- (void)setupUserTag:(NSString *)userTag;

/**
 设置用户等级
 
 @param userRank 用户等级
 */
- (void)setupUserRank:(NSString *)userRank;
@end

extern NSString * const NOTIFINAME_XN_UNREADMESSAGE;
extern NSString * const NOTIFINAME_XN_NETSTATUS;


@protocol XNNotifyInterfaceDelegate <NSObject>

- (void)connectStatus:(NSInteger)status isError:(BOOL)isError;
- (void)message:(XNBaseMessage *)message changeTitle:(BOOL)changeTitle;
- (void)requestEvaluate:(NSString *)userName;
- (void)sceneChanged:(BOOL)couldEvaluate //是否可以评价
    couldForceEvalue:(BOOL)enableevaluation//是否可以强制评价
         andEvaluted:(BOOL)evaluated;    //是否评价过
- (void)userList:(XNChatBasicUserModel *)user;
//排队
- (void)currentWaitingNum:(NSInteger)num;
//刷新客服输入状态（消息预知）
-(void)freshKefuInputing;
-(void)hideKefuInputing;
//机器人重置输入框
-(void)reSetInputBarWithRobot:(NSInteger)scenemode;
//转人工按钮恢复可点击
-(void)robotChangeManualCanClicked:(BOOL)isCanClick;

@end
//集成时，在getflashserver完成之后，进行其余操作
@protocol XNFinishGetFlashServer <NSObject>
@optional
- (void)loginAndConnectTChat;

- (void)getFlashServerFailure;

@end

