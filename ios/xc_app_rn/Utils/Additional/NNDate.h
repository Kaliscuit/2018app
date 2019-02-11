//
//  NNDate.h
//  YMall
//
//  Created by li guoxian on 13-4-22.
//  Copyright (c) 2013年 NPNT. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSDate (GSLCAdditional)
-(NSTimeInterval)timeIntervalSince1970OfBeijingZone;
+(NSDate*)dateWithTimeIntervalSince1970OfBeijingZone:(NSTimeInterval)secs;
@end
