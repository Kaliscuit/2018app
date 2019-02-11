//
//  XNVideoMessage.h
//  NTalkerClientSDK
//
//  Created by NTalker-zhou on 16/8/9.
//  Copyright © 2016年 NTalker. All rights reserved.
// 视频消息

#import "XNBaseMessage.h"
//小视频
@interface XNVideoMessage : XNBaseMessage
@property (nonatomic, strong) NSString *videoName;
@property (nonatomic, strong) NSString *videoType;
@property (nonatomic, strong) NSString *videoPath;
@property (nonatomic, strong) NSString *videoLocalPath;
@property (nonatomic, strong) NSString *imageLocalPath;
@property (nonatomic, strong) NSString *extension;
@property (nonatomic, strong) NSString *oldFile;
@property (nonatomic, strong) NSString *imageSourcePath;
@property (nonatomic, strong) NSString *imageThumbPath;
@property (nonatomic, assign) NSInteger videoLength;
@property (nonatomic, strong) NSString *fileSize;
@property (nonatomic, strong) NSString *displayImageURL;


+ (XNVideoMessage *)videoMessageWithMsgTime:(long long)msgTime
                                  andUserid:(NSString *)userid
                                andUserInfo:(NSString *)userInfo
                                 andMsgInfo:(NSString *)msgInfo;
+ (NSString *)XMLStrFromVideoMessage:(XNVideoMessage *)videoMessage;

@end
