/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <BMKLocationkit/BMKLocationComponent.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) NSDictionary *option;
@property (nonatomic, strong) NSNotification *recievePushNotif;

@property (nonatomic, copy) void(^blockTokenDidGet)(NSString *token);
@property (nonatomic, copy) void(^blockTokenGetFailed)(NSError *erroStr);
@property (nonatomic, copy) RCTPromiseResolveBlock alipayResolveBlock;
@property (nonatomic, copy) RCTPromiseResolveBlock alipayAuthResolveBlock;
@property (nonatomic, strong)BMKLocationManager* locationManager;
-(void)registerRemoteNotification;
//强制重新加载rn
- (void)reStartApp;
- (void)startLocation;
//拉起小能弹框
- (void)startXNIM:(NSString *)ID;

@end
