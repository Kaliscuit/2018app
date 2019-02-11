//
//  verifyCodeManager.m
//  xc_app_rn
//
//  Created by zl on 2017/12/15.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "verifyCodeManager.h"

@implementation verifyCodeManager

+ (instancetype)sharedInstance {
  static verifyCodeManager *_sharedClient = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    _sharedClient = [[verifyCodeManager alloc] init];
  });
  return _sharedClient;
}

- (void)showView
{
  // sdk调用
  self.manager = [NTESVerifyCodeManager sharedInstance];
  self.manager.delegate = self;
  
  // 设置透明度
  self.manager.alpha = 0.7;
  
  // 设置frame
  self.manager.frame = CGRectNull;
  
  // captchaId从网易申请，比如@"a05f036b70ab447b87cc788af9a60974"
//  NSString *captchaId = @"044b32fa23d64765a23c1e9f9ac37b10";
  [self.manager configureVerifyCode:GETSTRING(self.strID) timeout:8.0];
  
  [self.manager openVerifyCodeView];
}

/**
 * 验证码组件初始化完成
 */
- (void)verifyCodeInitFinish{
  // App添加自己的处理逻辑
}
/**
 * 验证码组件初始化出错
 *
 * @param message 错误信息
 */
- (void)verifyCodeInitFailed:(NSString *)message{
  // App添加自己的处理逻辑
  if (self.blockVerifyFailed) {
    self.blockVerifyFailed(message);
  }
}
/**
 * 完成验证之后的回调
 *
 * @param result 验证结果 BOOL:YES/NO
 * @param validate 二次校验数据，如果验证结果为false，validate返回空
 * @param message 结果描述信息
 *
 */
- (void)verifyCodeValidateFinish:(BOOL)result
                        validate:(NSString *)validate
                         message:(NSString *)message{
  // App添加自己的处理逻辑
  if (self.blockVerifySucceed && result) {
    self.blockVerifySucceed(validate);
  }
  if (self.blockVerifyFailed && !result) {
    self.blockVerifyFailed(message);
  }
}
/**
 * 关闭验证码窗口后的回调
 */
- (void)verifyCodeCloseWindow{
  //App添加自己的处理逻辑
//  if (self.blockVerifyFailed) {
//    self.blockVerifyFailed(nil);
//  }
}
/**
 * 网络错误
 *
 * @param error 网络错误信息
 */
- (void)verifyCodeNetError:(NSError *)error{
  //App添加自己的处理逻辑
  if (self.blockVerifyFailed) {
    self.blockVerifyFailed(@"网络错误");
  }
}
@end
