//
//  XNDeviceManager.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 17/3/21.
//  Copyright © 2017年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol XNDeviceManagerProximitySensorDelegate <NSObject>

- (void)proximitySensorChanged:(BOOL)isNearToUser;

@end

@interface XNDeviceManager : NSObject

@property (nonatomic, assign) BOOL  isSupportProximitySensor;

@property (nonatomic, assign) BOOL isNearToUser;

@property (nonatomic, weak) id <XNDeviceManagerProximitySensorDelegate> delegate;

+(XNDeviceManager *)sharedInstance;

-(BOOL)allowProximitySensor;

-(BOOL)cancelProximitySensor;

@end
