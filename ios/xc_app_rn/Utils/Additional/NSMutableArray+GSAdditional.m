//
//  NSMutableArray+GSAdditional.m
//  GiftShop
//
//  Created by yt on 16/1/13.
//  Copyright © 2016年 zhang yintao. All rights reserved.
//

#import "NSMutableArray+GSAdditional.h"

@implementation NSMutableArray (GSAdditional)

- (void)moveObjectFromIndex:(NSUInteger)fromIndex toIndex:(NSUInteger)toIndex
{
    if (toIndex != fromIndex && fromIndex < [self count] && toIndex< [self count])
    {
        id obj = [self objectAtIndex:fromIndex];
        [self removeObjectAtIndex:fromIndex];
        if (toIndex >= [self count]) {
            [self addObject:obj];
        } else {
            [self insertObject:obj atIndex:toIndex];
        }
    }
}
@end
