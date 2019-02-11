//
//  XCUploadManager.h
//  xc_app_rn
//
//  Created by zl on 2017/8/31.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "XCViewUpdate.h"

#define NotificationPush (@"NotificationPush")

@interface XCUploadManager : NSObject
@property (nonatomic, strong) NSDictionary *option;
@property (nonatomic, strong) XCViewUpdate *upView;
@property (nonatomic, strong) NSString *updateSign;
@property (nonatomic, strong) NSString *oldSign;
@property (nonatomic, strong) NSString *downLoadUrl;
@property (nonatomic, assign) BOOL isLaunchImageFinished;
@property (nonatomic, assign) BOOL isRnViewAppear;
@property (nonatomic, strong) UIView *rctRootView;

-(void)upDateBundleIfNeeded;
+ (instancetype)sharedInstance;
+(NSURL*)bundlePathUrl;
+(void)deleteDocumentFile:(NSString*)fileName;
@end
