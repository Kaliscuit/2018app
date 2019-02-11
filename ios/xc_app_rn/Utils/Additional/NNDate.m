//
//  NNDate.m
//  YMall
//
//  Created by li guoxian on 13-4-22.
//  Copyright (c) 2013年 NPNT. All rights reserved.
//

#import "NNDate.h"

@implementation  NSDate (GSLCAdditional)
-(NSTimeInterval)timeIntervalSince1970OfBeijingZone{
    NSTimeInterval now=[self timeIntervalSince1970];
    NSTimeInterval t=now-8*60*60;
    //NNDebug(@"n:%f t:%f",now,t);
    return t;
}
+ (NSDate*)dateWithTimeIntervalSince1970OfBeijingZone:(NSTimeInterval)secs{
    return [NSDate dateWithTimeIntervalSince1970:secs-8*60*60];
}
@end
