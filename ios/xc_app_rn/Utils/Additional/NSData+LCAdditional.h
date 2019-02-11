//
//  NSData+Additional.h
//  FlyintheSky
//
//  Created by LiJia on 12-11-30.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSData (LCAdditional)
- (NSData *)AES256EncryptWithKey:(NSString *)key;
- (NSData *)AES256DecryptWithKey:(NSString *)key;
- (NSData *)DESDecryptWithKey:(NSString *)key;
- (NSData *)DESEncryptWithKey:(NSString *)key;
@end
