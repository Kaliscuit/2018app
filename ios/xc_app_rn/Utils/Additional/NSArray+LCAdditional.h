//
//  NSArray+Additional.h
//  FlyintheSkyLib
//
//  Created by LiJia on 12-12-4.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSArray (LCAdditional)
-(BOOL) isNotEmpty;
//NSArray 写入文件，此方法可防止 有些字段为null导致写入失败的情况  yintao
-(BOOL)writeToPlistFile:(NSString*)filename;
//与上面的方法 配对使用
+(NSArray*)readFromPlistFile:(NSString*)filename;
@end
