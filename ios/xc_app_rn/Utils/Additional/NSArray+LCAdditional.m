//
//  NSArray+Additional.m
//  FlyintheSkyLib
//
//  Created by LiJia on 12-12-4.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import "NSArray+LCAdditional.h"

@implementation NSArray (LCAdditional)
-(BOOL) isNotEmpty {
    return (self != nil && self.count > 0) ;
}
-(BOOL)writeToPlistFile:(NSString*)filename{
    NSData * data = [NSKeyedArchiver archivedDataWithRootObject:self];
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString * path = [documentsDirectory stringByAppendingPathComponent:filename];
    BOOL didWriteSuccessfull = [data writeToFile:path atomically:YES];
    return didWriteSuccessfull;
}

+(NSArray*)readFromPlistFile:(NSString*)filename{
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString * path = [documentsDirectory stringByAppendingPathComponent:filename];
    NSData * data = [NSData dataWithContentsOfFile:path];
    return  [NSKeyedUnarchiver unarchiveObjectWithData:data];
}
@end
