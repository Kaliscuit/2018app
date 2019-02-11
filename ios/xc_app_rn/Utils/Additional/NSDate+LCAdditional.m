//
//  NSDate+Additional.m
//  FlyintheSky
//
//  Created by LiJia on 12-11-22.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import "NSDate+LCAdditional.h"

@implementation NSDate (LCAdditional)

-(NSDate *) toLocalTime{
    NSTimeZone *tz = [NSTimeZone localTimeZone];
    NSInteger seconds = [tz secondsFromGMTForDate: self];
    return [NSDate dateWithTimeInterval: seconds sinceDate: self];
}
-(NSString*)toShortFormatString
{
    NSDateFormatter* dateFormat=[[NSDateFormatter alloc] init];
    dateFormat.dateFormat=@"yyyy-MM-dd";
    return [dateFormat stringFromDate:self];
}
-(NSString*)toShortDotFormatString
{
    NSDateFormatter* dateFormat=[[NSDateFormatter alloc] init];
    dateFormat.dateFormat=@"yyyy.MM.dd";
    return [dateFormat stringFromDate:self];
}
//把时间转化成yyyy-MM-dd HH:mm:ss格式
-(NSString*)toLongFormatString
{
    NSDateFormatter* dateFormat=[[NSDateFormatter alloc] init];
    dateFormat.dateFormat=@"yyyy-MM-dd HH:mm";
    return [dateFormat stringFromDate:self];
}
@end
