//
//  verifyCodeManager.h
//  xc_app_rn
//
//  Created by zl on 2017/12/15.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <VerifyCode/NTESVerifyCodeManager.h>

@interface verifyCodeManager : NSObject<NTESVerifyCodeManagerDelegate>
@property (copy, nonatomic) void(^blockVerifyFailed)(NSString *message);
@property (copy, nonatomic) void(^blockVerifySucceed)(NSString *validat);
@property (nonatomic,strong)NTESVerifyCodeManager *manager;
@property (nonatomic,strong) NSString *strID;
+ (instancetype)sharedInstance ;
- (void)showView;
@end
