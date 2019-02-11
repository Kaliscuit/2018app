//
//  NSArray+NSArray_Category.m
//  GiftShop
//
//  Created by zl on 16/2/17.
//  Copyright © 2016年 zhang yintao. All rights reserved.
//

#import "NSArray+NSArray_Category.h"

@implementation NSArray (NSArray_Category)
- (NSString *)stringAtIndex:(NSInteger)index
{
    if ([self isKindOfClass:[NSArray class]] && index < self.count && [self[index]isKindOfClass:[NSString class]]) {
        return self[index];
    }
    return nil;
}
- (NSArray *)arrayAtIndex:(NSInteger)index
{
    if ([self isKindOfClass:[NSArray class]] && index < self.count && [self[index]isKindOfClass:[NSArray class]]) {
        return self[index];
    }
    return nil;
}
- (NSDictionary *)dictionaryAtIndex:(NSInteger)index
{
    if ([self isKindOfClass:[NSArray class]] && index < self.count && [self[index]isKindOfClass:[NSDictionary class]]) {
        return self[index];
    }
    return nil;
}
@end
