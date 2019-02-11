//
//  XNStatisticsHelper.h
//  NTalkerClientSDK
//
//  Created by Ntalker on 15/12/16.
//  Copyright © 2015年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef void(^statusCodeBlock)(NSInteger statusCode);

@interface XNStatisticsHelper : NSObject

+ (void)XNStatistics:(NSString *)action
      isOpenChatCtrl:(BOOL)openChatCtrl
           sessionId:(NSString *)sessionId
           settingId:(NSString *)settingId statusCodeBlock:(statusCodeBlock)status;

@end
