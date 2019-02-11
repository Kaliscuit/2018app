//
//  NSString+Additional.m
//  FlyintheSkyLib
//
//  Created by LiJia on 12-12-4.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import "NSString+LCAdditional.h"
#import <CommonCrypto/CommonDigest.h>

@implementation NSString (LCAdditional)
- (NSString*)appendURLPathComponentIfNeeded {
    if ([self isNotEmpty]) {
        NSString *trimStr = [self trimWhitespace];
        NSString *lastString = [trimStr substringFromIndex:trimStr.length - 1];
        if (![lastString isEqualToString:@"/"]) {
            NSString *combString = [NSString stringWithFormat:@"%@/",trimStr];
            return combString;
        }else{
            return trimStr;
        }
    }else{
        return nil;
    }
}

- (NSString*)urlEncodedString {
    if ([self isNotEmpty]) {
        return [self stringByAddingPercentEncodingWithAllowedCharacters:[[NSCharacterSet alloc]init]];
    }else{
        return nil;
    }
}

- (NSString*)urlDecodedString{
    if ([self isNotEmpty]) {
        return [self stringByRemovingPercentEncoding];
    }else{
        return nil;
    }
}

- (NSString*)md5
{
    const char *cStr = [self UTF8String];
    unsigned char result[16];
    CC_MD5( cStr, (unsigned int) strlen(cStr), result);
    return [NSString stringWithFormat:
			@"%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x",
			result[0], result[1], result[2], result[3],
			result[4], result[5], result[6], result[7],
			result[8], result[9], result[10], result[11],
			result[12], result[13], result[14], result[15]
			];
}

-(BOOL)isNotEmpty{
    return (self != nil && [self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]].length > 0);
}

-(NSString*)trimWhitespace{
    return [self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
}

-(NSString*)trimWhitespaceInNewline{
    return [self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
}

- (NSDate*)stringToDate{
    
    if (self) {
        
        NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
        [formatter setDateFormat:@"yyyy-MM-dd"];
        return [formatter dateFromString:self];
        
    }else{
        
        return [NSDate date];
        
    }
}
/**
 *  利用 boudingRectWithSize:options:attributes:context 获取字符串高度
 *
 *  @param font     字体
 *  @param size     约束size
 *
 *  @return size
 */
-(CGSize)sizeWithFontSize:(UIFont*)font constrainedToSize:(CGSize)size
{
    if([self isNotEmpty])
    {
        NSDictionary *attribute = @{NSFontAttributeName:font};
        return [self boundingRectWithSize:size options: NSStringDrawingTruncatesLastVisibleLine | NSStringDrawingUsesLineFragmentOrigin | NSStringDrawingUsesFontLeading attributes:attribute context:nil].size;
    }
    return CGSizeZero;
}
@end
