//
//  RCTApp.h
//  xc_app_rn
//
//  Created by zl on 2017/8/22.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCTApp : RCTEventEmitter<RCTBridgeModule>
+(void)notifyNetworkChanged;

@end
