//
//  NSDictionary+LCAdditional.h
//  GiftShop
//
//  Created by zhang yintao on 13-11-8.
//  Copyright (c) 2013年 zhang yintao. All rights reserved.
//

#import <Foundation/Foundation.h>

//如果是老的方法写入的数据 不能用下面新方法读取。。否则。。你懂得。。

@interface NSDictionary (LCAdditional)
//NSDictionary 写入文件，此方法可防止 有些字段为null导致写入失败的情况  yintao
-(BOOL)writeToPlistFile:(NSString*)filename;
//与上面的方法 配对使用
+(NSDictionary*)readFromPlistFile:(NSString*)filename;
//cache目录下的缓存
-(BOOL)writeToCachePlistFile:(NSString*)filename;
+(NSDictionary*)readFromCachePlistFile:(NSString*)filename;
@end
