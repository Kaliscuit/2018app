//
//  NSObject+Invocation.m
//  Pegasus
//
//  Copyright 2012 Jonathan Ellis
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

#import "NSObject+LCAdditional.h"

@implementation NSObject (LCAdditional)

- (void *)performSelector:(SEL)selector withValue:(void *)value {
    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[self methodSignatureForSelector:selector]];
    [invocation setSelector:selector];
    [invocation setTarget:self];
    [invocation setArgument:value atIndex:2];
    
    [invocation invoke];
    
    NSUInteger length = [[invocation methodSignature] methodReturnLength];
    
    // If method is non-void:
    if (length > 0) {
        void *buffer = (void *)malloc(length);
        [invocation getReturnValue:buffer];
        return buffer;
    }
    
    // If method is void:
    return NULL;
}
- (id)valueForUndefinedKey:(NSString *)key{
    return objc_getAssociatedObject(self, CFBridgingRetain(key));
}
- (void)setValue:(id)value forUndefinedKey:(NSString *)key{
    objc_setAssociatedObject(self, CFBridgingRetain(key), value, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

//判断对象是否为 [NSNull null]
-(BOOL)isNotNSNull
{
    return (self != [NSNull null]);
}
@end