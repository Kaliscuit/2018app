//
//  NSMutableArray+GSAdditional.h
//  GiftShop
//
//  Created by yt on 16/1/13.
//  Copyright © 2016年 zhang yintao. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSMutableArray (GSAdditional)
/**
 *  移动元素
 *
 *  @param fromIndex 从index
 *  @param toIndex   到index
 */
- (void)moveObjectFromIndex:(NSUInteger)fromIndex toIndex:(NSUInteger)toIndex;
@end
