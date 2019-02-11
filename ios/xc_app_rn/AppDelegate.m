/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import <UMMobClick/MobClick.h>
#import "NNAppLauchConf.h"
#import "OpenUDID.h"
#import "UICKeyChainStore.h"
#import "Constants.h"
#import "AFHTTPSessionManager.h"
#import "FileHash.h"
#import "XCUploadManager.h"
#import <AlipaySDK/AlipaySDK.h>

#import "XNSDKCore.h"
#import "NTalker.h"
//震动音效
#import <AudioToolbox/AudioToolbox.h>
//#import "RCTApp.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC*5), dispatch_get_global_queue(QOS_CLASS_USER_INTERACTIVE, 0), ^{
//    [[AlipaySDK defaultService] auth_V2WithInfo:@"apiname=com.alipay.account.auth&app_id=2018071860659409&app_name=mc&auth_type=AUTHACCOUNT&biz_type=openservice&pid=2088231007774991&product_id=APP_FAST_LOGIN&scope=kuaijie&sign_type=RSA2&target_id=dalingjia&sign=Kkk%2bqN3JaGVoYnU1i8SdbstBCBTU0ILsi6e7LhzWCYJ5yDmGVV0qvK585eq7AXa6u6n6nvmavNhip9h5wmUEtM4QCXTEDMFxLOfh9yOEoTduBcLgpFS1tgR9jDx3wnYR3x1OlMVDW1sAZY6zab8iFB05Wg6mYuos%2fwg3JFTaI5wtKDu7Bw%2b3hm3ZL%2fhqS2R6OCfo3HUDOIDj%2bxoJS2c5vHYXvkYMUDWHwhL6rkjapN34mg3mYg5dU4V%2bl7hfQNU6p7zWdW9rb8EbIrZfcdCs8NOCmhtjVuwcV68hRxf743sRudLg%2br2lZVzqKXiaQd%2bH3sD6eetf5NHgLncM2YxuOQ%3d%3d" fromScheme:SCHEME_FOR_ALIPAY callback:^(NSDictionary *resultDic) {
//    }];
//
//  });

  
  //注册UDID
  [self createDeviceID];
  
  self.option = launchOptions;
  
  UMConfigInstance.appKey = @"599bddf2717c1971f500189d";
  UMConfigInstance.eSType = E_UM_GAME;
  [MobClick startWithConfigure:UMConfigInstance];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

#if DEBUG
  [[AFNetworkReachabilityManager sharedManager] startMonitoring];
 
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  
  __block RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Bootstrap"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  rootViewController.view = rootView;
  [self.window makeKeyAndVisible];
#else
  [[XCUploadManager sharedInstance]upDateBundleIfNeeded];
//  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC*3), dispatch_get_main_queue(), ^{
//    rootViewController.view = rootView;
//  });
#endif
//  _locationManager.delegate = self;
  
  [[NTalker standardIntegration] initSDKWithSiteid:@"kf_9496" andSDKKey:@"CE3EBB42-CF7D-4328-89B2-3D026A02A2B9"];
  
#if 0
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC*8
                               ), dispatch_get_main_queue(), ^{
    [[NTalker standardIntegration] loginWithUserid:@"ddddd" andUsername:@"dddd" andUserLevel:0];
    
    NTalkerChatViewController *chat = [[NTalker standardIntegration] startChatWithSettingId:@"kf_9496_1527609383219"];
    
    UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:chat];
    [[nav navigationBar] setTranslucent:NO];
    chat.pushOrPresent = NO;
    [self.window.rootViewController presentViewController:nav animated:YES completion:nil];
    
  });
#endif
  
  
  return YES;
}

//拉起小能
- (void)startXNIM:(NSString *)ID
{
  NTalkerChatViewController *chat = [[NTalker standardIntegration] startChatWithSettingId:ID];
  
  UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:chat];
  [[nav navigationBar] setTranslucent:NO];
  chat.pushOrPresent = NO;
  [self.window.rootViewController presentViewController:nav animated:YES completion:nil];
}

//强制重新加载rn
- (void)reStartApp
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[XCUploadManager sharedInstance]upDateBundleIfNeeded];
  });
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<NSString*, id> *)options
{
  if ([[url scheme] isEqualToString:SCHEME_FOR_ALIPAY])
  {
    //跳转支付宝钱包进行支付，需要将支付宝钱包的支付结果回传给SDK
    if ([url.host isEqualToString:@"safepay"]) {
      WS(wself);
      [[AlipaySDK defaultService]
       processOrderWithPaymentResult:url
       standbyCallback:^(NSDictionary *resultDic) {
         wself.alipayResolveBlock(resultDic);
       }];
      [[AlipaySDK defaultService]processAuth_V2Result:url standbyCallback:^(NSDictionary *resultDic) {
        wself.alipayAuthResolveBlock(resultDic);
      }];
    }
  }
//  else if ([[url scheme] isEqualToString:SCHEME_FOR_AUTH_ALIPAY])
//  {
//    WS(wself);
//    [[AlipaySDK defaultService]processAuth_V2Result:url standbyCallback:^(NSDictionary *resultDic) {
//      wself.alipayAuthResolveBlock(resultDic);
//      UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@""
//                                                          message:@"----------------"  delegate:self
//                                                cancelButtonTitle:@"token"
//                                                otherButtonTitles:@"忽略", nil];
//      [alertView show];
//    }];
//
//  }
  
  return [RCTLinkingManager application:application openURL:url
                        sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                               annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
}
  
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  if ([[url scheme] isEqualToString:SCHEME_FOR_ALIPAY])
  {
    //跳转支付宝钱包进行支付，需要将支付宝钱包的支付结果回传给SDK
    if ([url.host isEqualToString:@"safepay"]) {
      WS(wself);
      [[AlipaySDK defaultService]
       processOrderWithPaymentResult:url
       standbyCallback:^(NSDictionary *resultDic) {
         wself.alipayResolveBlock(resultDic);
       }];
      [[AlipaySDK defaultService]processAuth_V2Result:url standbyCallback:^(NSDictionary *resultDic) {
        wself.alipayAuthResolveBlock(resultDic);
      }];
    }
  }
  
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

-(void)downLoadNewBundle
{
  NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
  AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:configuration];
  
  //http://l-fedev1.ops.bj0.daling.com:8080/index.ios.bundle
  NSURL *URL = [NSURL URLWithString:@"http://l-fedev1.ops.bj0.daling.com:8080/index.ios.bundle"];
  NSURLRequest *request = [NSURLRequest requestWithURL:URL];
  
  NSURLSessionDownloadTask *downloadTask = [manager downloadTaskWithRequest:request progress:^(NSProgress * _Nonnull uploadProgress) {
    // This is not called back on the main queue.
    // You are responsible for dispatching to the main queue for UI updates
    dispatch_async(dispatch_get_main_queue(), ^{
      //Update the progress view
//      [progressView setProgress:uploadProgress.fractionCompleted];
    });
  } destination:^NSURL *(NSURL *targetPath, NSURLResponse *response) {
    NSURL *documentsDirectoryURL = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:nil];
    return [documentsDirectoryURL URLByAppendingPathComponent:[response suggestedFilename]];
  } completionHandler:^(NSURLResponse *response, NSURL *filePath, NSError *error) {
    
    NSString *md5Str = [FileHash md5HashOfFileAtPath:filePath.path];
    NSString *ipPath = [[NSBundle mainBundle] pathForResource:@"main" ofType:@"jsbundle"];
    md5Str = [FileHash md5HashOfFileAtPath:ipPath];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:filePath
                                                                moduleName:@"Bootstrap"
                                                         initialProperties:nil
                                                             launchOptions:self.option];
    self.window.rootViewController.view = rootView;
  }];
  [downloadTask resume];
}

/**
 *  创建UUID
 */
-(void)createDeviceID
{
  //钥匙串
  UICKeyChainStore* keychain = [UICKeyChainStore keyChainStoreWithService:KeyChain_Server_Name accessGroup:KeyChain_Access_Group_Name];
  
  if([[NNAppLauchConf sharedInstance]getIsFirstRun] == NO)
  {
    //查看keychain里面有没有 udid,如果有，用keychain里面的 udid 保持 udid不变
    
    if([[keychain stringForKey:KeyChain_Key_ClientID] isNotEmpty])
    {
      NSString *openUdid = [keychain stringForKey:KeyChain_Key_ClientID];
      [[NNAppLauchConf sharedInstance]setIsFirstRun:YES];
      [[NNAppLauchConf sharedInstance]setUDID:openUdid];
    }
    else
    {
      NSString *openUdid = [OpenUDID value];
      [[NNAppLauchConf sharedInstance]setIsFirstRun:YES];
      [[NNAppLauchConf sharedInstance]setUDID:openUdid];
      
      [keychain setString:[[NNAppLauchConf sharedInstance]getUDID] forKey:KeyChain_Key_ClientID];
    }
  }
  else
  {
    //检查有没有存入keychain
    if([[keychain stringForKey:KeyChain_Key_ClientID] isNotEmpty] == NO &&
       [[[NNAppLauchConf sharedInstance]getUDID]isNotEmpty])
    {
      [keychain setString:[[NNAppLauchConf sharedInstance]getUDID] forKey:KeyChain_Key_ClientID];
    }
  }
  
}

/**
 *  注册push
 */
-(void)registerRemoteNotification
{
  [[UIApplication sharedApplication]registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeBadge|UIUserNotificationTypeAlert|UIUserNotificationTypeSound categories:nil]];
  [[UIApplication sharedApplication]registerForRemoteNotifications];
}

#pragma - mark <UIApplicationDelegate>
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  //NSLog(@"%@",@"token success");
  NSString *sdeviceToken = [[deviceToken description] stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"<>"]];
  sdeviceToken = [sdeviceToken stringByReplacingOccurrencesOfString:@" " withString:@""];
  NSLog(@"device token is:%@",sdeviceToken);
  
//#warning
//  UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@""
//                                                      message:sdeviceToken  delegate:self
//                                            cancelButtonTitle:@"token"
//                                            otherButtonTitles:@"忽略", nil];
//  [alertView show];

  [[NNAppLauchConf sharedInstance]setDeviceToken:sdeviceToken];
  //通知rn已经获取了
  if (self.blockTokenDidGet) {
    self.blockTokenDidGet(sdeviceToken);
  }
//  [self uploadPushToken];
}
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  //    NSString* errorDes = [NSString stringWithFormat:@"FailToRegister:%@",error];
  //失败上传日志
  //    [NNStatisticManager eventErrorRegisterDeviceToken:errorDes];
  NNDebug(@"FailToRegisterForRemoteNotifications error is:%@",[error localizedDescription]);
  if (self.blockTokenGetFailed) {
    self.blockTokenGetFailed(error);
  }
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSNotification* notify = [NSNotification notificationWithName:NotificationPush object:nil userInfo:@{@"pushMsg":GETSTRING([userInfo stringForKey:@"custom"])}];
  if ( application.applicationState == UIApplicationStateActive) {
    notify = [NSNotification notificationWithName:NotificationPush object:nil userInfo:@{@"activePushMsg":GETSTRING([userInfo stringForKey:@"custom"])}];
  }

  if (![XCUploadManager sharedInstance].isRnViewAppear) {
    //等rnview出现的时候延缓加载push
    self.recievePushNotif = notify;
  }else{
    //使用时直接加载push
    [[NSNotificationCenter defaultCenter]postNotification:notify];
  }
//#warning
//  UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@""
//                                                      message:[notify description]  delegate:self
//                                            cancelButtonTitle:@"token"
//                                            otherButtonTitles:@"111", nil];
//  [alertView show];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
//  self.NotificationUserInfo = userInfo;
  NNDebug(@"recive RemoteNotification when application active %@",[userInfo description]);
  NSNotification* notify = [NSNotification notificationWithName:NotificationPush object:nil userInfo:@{@"pushMsg":GETSTRING([userInfo stringForKey:@"custom"])}];
  
  if ( application.applicationState == UIApplicationStateActive) {
    notify = [NSNotification notificationWithName:NotificationPush object:nil userInfo:@{@"activePushMsg":GETSTRING([userInfo stringForKey:@"custom"])}];
  }
  
  if (![XCUploadManager sharedInstance].isRnViewAppear) {
    //等rnview出现的时候延缓加载push
    self.recievePushNotif = notify;
  }else{
    //使用时直接加载push
    
    [[NSNotificationCenter defaultCenter]postNotification:notify];
  }
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
  if (application.applicationIconBadgeNumber > 0) {
    application.applicationIconBadgeNumber = 0;
  }
}
@end
