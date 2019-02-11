//
//  NSDictionary+LCAdditional.m
//  GiftShop
//
//  Created by zhang yintao on 13-11-8.
//  Copyright (c) 2013年 zhang yintao. All rights reserved.
//

#import "NSDictionary+LCAdditional.h"

@implementation NSDictionary (LCAdditional)

-(BOOL)writeToPlistFile:(NSString*)filename{
    NSData * data = [NSKeyedArchiver archivedDataWithRootObject:self];
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString * path = [documentsDirectory stringByAppendingPathComponent:filename];
    BOOL didWriteSuccessfull = [data writeToFile:path atomically:YES];
    return didWriteSuccessfull;
}

+(NSDictionary*)readFromPlistFile:(NSString*)filename{
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString * path = [documentsDirectory stringByAppendingPathComponent:filename];
    NSData * data = [NSData dataWithContentsOfFile:path];
    return  [NSKeyedUnarchiver unarchiveObjectWithData:data];
}

-(BOOL)writeToCachePlistFile:(NSString*)filename{
    NSData * data = [NSKeyedArchiver archivedDataWithRootObject:self];
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString * path = [documentsDirectory stringByAppendingPathComponent:filename];
    BOOL didWriteSuccessfull = [data writeToFile:path atomically:YES];
    return didWriteSuccessfull;
}

+(NSDictionary*)readFromCachePlistFile:(NSString*)filename{
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString * path = [documentsDirectory stringByAppendingPathComponent:filename];
    NSData * data = [NSData dataWithContentsOfFile:path];
    return  [NSKeyedUnarchiver unarchiveObjectWithData:data];
}

@end
