//
//  Ntalker.h
//  NTalkerUIKitSDK
//
//  Created by 郭天航 on 16/9/28.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "XNStandardIntegration.h"
#import "XNSimpleIntegration.h"

@interface NTalker : NSObject

+ (XNSimpleIntegration *)simpleIntegration;

+ (XNStandardIntegration *)standardIntegration;

@end


extern NSString * const NOTIFINAME_XN_UNREADMESSAGE;
extern NSString * const NOTIFINAME_XN_NETSTATUS;
