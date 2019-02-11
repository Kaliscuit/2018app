//
//  XNUIUtility.h
//  TestSDKII
//
//  Created by Ntalker on 16/4/21.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

#define XNSTRPRO(str) (str?:@"")

@interface XNUIUtility : NSObject

+ (UIColor *)colorWithHexString: (NSString *) stringToConvert;

+ (UIImage *)imageWithColor:(UIColor *)color;

@end
