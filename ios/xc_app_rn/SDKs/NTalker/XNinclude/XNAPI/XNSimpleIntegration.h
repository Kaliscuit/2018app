//
//  XNFastIntegration.h
//  NTalkerUIKitSDK
//
//  Created by 郭天航 on 16/9/28.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NTalkerChatViewController.h"

@interface XNSimpleIntegration : NSObject

#pragma mark - 快速集成方法
/**
 *  程序开启,注册连接
 *
 *  @param siteid     企业ID 【必传，不能为空】
 *  @param SDKKey     企业唯一标示符，从小能技术人员那获取 【必传，不能为空】
 *  @param userid     用户ID:字母,数字,下划线或@符号
 *  @param username   用户名称：字母,数字,下划线,汉字或@符号
 *  @param userLevel  用户级别： ”0“非会员，“1-5”：会员，默认“0”
 *  @param settingid  接待组ID 【必传，不能为空】
 
 */

- (NTalkerChatViewController *)startChatWithSiteid:(NSString *)siteid SDKKey:(NSString *)SDKKey userid:(NSString *)userid username:(NSString *)username userLevel:(NSString *)userLevel settingid:(NSString *)settingid;

@end
