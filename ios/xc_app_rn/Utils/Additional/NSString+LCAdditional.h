//
//  NSString+Additional.h
//  FlyintheSkyLib
//
//  Created by LiJia on 12-12-4.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (LCAdditional)
- (NSString*)appendURLPathComponentIfNeeded;
- (NSString*)urlEncodedString;
- (NSString*)urlDecodedString;
- (NSString *)md5;
- (BOOL)isNotEmpty;
- (NSString*)trimWhitespace;
- (NSString*)trimWhitespaceInNewline;
- (NSDate*)stringToDate;
/**
 *  利用 boudingRectWithSize:options:attributes:context 获取字符串高度
 *
 *  @param fontSize 字号size
 *  @param size     约束size
 *
 *  @return size
 */
-(CGSize)sizeWithFontSize:(UIFont*)font constrainedToSize:(CGSize)size;

@end
