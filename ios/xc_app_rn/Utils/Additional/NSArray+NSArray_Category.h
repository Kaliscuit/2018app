//
//  NSArray+NSArray_Category.h
//  GiftShop
//
//  Created by zl on 16/2/17.
//  Copyright © 2016年 zhang yintao. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSArray (NSArray_Category)
- (NSString *)stringAtIndex:(NSInteger)index;
- (NSArray *)arrayAtIndex:(NSInteger)index;
- (NSDictionary *)dictionaryAtIndex:(NSInteger)index;

@end
