//
//  NSDate+Additional.h
//  FlyintheSky
//
//  Created by LiJia on 12-11-22.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSDate (LCAdditional)
-(NSDate *) toLocalTime;
//把时间转化成yyyy-MM-dd格式
-(NSString*)toShortFormatString;
//
-(NSString*)toShortDotFormatString;
//把时间转化成yyyy-MM-dd HH:mm:ss格式
-(NSString*)toLongFormatString;
@end
