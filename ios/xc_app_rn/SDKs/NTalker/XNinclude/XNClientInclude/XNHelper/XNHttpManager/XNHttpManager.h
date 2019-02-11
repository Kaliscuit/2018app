//
//  XNHttpManager.h
//  XNChatCore
//
//  Created by Ntalker on 15/8/19.
//  Copyright (c) 2015年 Kevin. All rights reserved.
//

#import <Foundation/Foundation.h>

@class XNFirstHttpService,XNSecondHttpService;
@interface XNHttpManager : NSObject

+ (XNHttpManager *)sharedManager;

- (XNFirstHttpService *)getFirstHttpService;

- (XNSecondHttpService *)getSecondHttpService;

@end
