//
//  RCTApp.m
//  xc_app_rn
//
//  Created by zl on 2017/8/22.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "RCTApp.h"
#import "NNAppLauchConf.h"
#import <React/RCTImageLoader.h>
#import "MBProgressHUD.h"
#import "Constants.h"
#import "AFHTTPSessionManager.h"
#import "FileHash.h"
#import "XCUploadManager.h"
#import <VerifyCode/NTESVerifyCodeManager.h>
#import "verifyCodeManager.h"
#import <TCWebCodesSDK/TCWebCodesBridge.h>
#import <BMKLocationkit/BMKLocationComponent.h>

@implementation RCTApp

RCT_EXPORT_MODULE(AppModule);

static char *sucessKey = "sucessKey";
static char *rejectKey = "rejectKey";
static char *fileNameKey = "fileNameKey";

- (instancetype)init
{
  self = [super init];
  if (self) {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(sendPushEvent:) name:NotificationPush object:nil];
    
    [[AFNetworkReachabilityManager sharedManager] setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status)
    {
      switch (status) {
          
        case AFNetworkReachabilityStatusNotReachable:{
          
          NSLog(@"无网络");
          [self sendEvent:@"NULL"];
          
          break;
          
        }
          
        case AFNetworkReachabilityStatusReachableViaWiFi:{
          
          NSLog(@"WiFi网络");
          [self sendEvent:@"WIFI"];

          break;
          
        }
          
        case AFNetworkReachabilityStatusReachableViaWWAN:{
          
          NSLog(@"3G网络");
          [self sendEvent:@"MOBILE"];
          
          break;
          
        }
          
        default:
          
          break;
      }
      
    }];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"EventNetwork"];
}

- (void)sendEvent:(NSString *)status
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self sendEventWithName:@"EventNetwork" body:@{@"status": status}];
  });
}

- (void)sendPushEvent:(NSNotification *)notificaiton
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([notificaiton.userInfo isKindOfClass:[NSDictionary class]]) {
      [self sendEventWithName:@"EventPush" body:notificaiton.userInfo];
      
//      UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@""
//                                                          message:[notificaiton.userInfo description]  delegate:self
//                                                cancelButtonTitle:@"userinfo"
//                                                otherButtonTitles:@"忽略", nil];
//      [alertView show];
    }
  });
}

#pragma verifyCodeDelegate


//
RCT_EXPORT_METHOD(getDeviceID:(RCTResponseSenderBlock)callback)
{
  callback(@[[NSNull null], [[NNAppLauchConf sharedInstance] getUDID]]);
}

RCT_EXPORT_METHOD(saveImageToAlbum:(NSString *)imageUrl :(RCTResponseSenderBlock)callback)
{
  if (imageUrl.length && self.bridge.imageLoader) {
    NSURL *url = [NSURL URLWithString:imageUrl];
    NSURLRequest *imageRequest = [NSURLRequest requestWithURL:url];
    [self.bridge.imageLoader loadImageWithURLRequest:imageRequest callback:^(NSError *error, UIImage *image) {
                                   if (image)
                                   {
                                     UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil);
                                     callback(@[[NSNull null], @(YES)]);
                                   }else
                                   {
                                     callback(@[[NSNull null], @(NO)]);
                                   }
                                 }];
  }
}

RCT_REMAP_METHOD(saveVideoToAlbum,url:(NSString *)imageUrl file:(NSString *)fileName resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
  AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:configuration];
  
  //@"http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
  NSURL *URL = [NSURL URLWithString:imageUrl];
  NSURLRequest *request = [NSURLRequest requestWithURL:URL];
  
  NSURLSessionDownloadTask *downloadTask = [manager downloadTaskWithRequest:request progress:^(NSProgress * _Nonnull uploadProgress) {
    // This is not called back on the main queue.
    // You are responsible for dispatching to the main queue for UI updates
  } destination:^NSURL *(NSURL *targetPath, NSURLResponse *response) {
    //    [XCUploadManager deleteDocumentFile:@"temp_video"];
    NSURL *documentsDirectoryURL = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:nil];
    
    objc_setAssociatedObject(self, fileNameKey, [response suggestedFilename], OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    return [documentsDirectoryURL URLByAppendingPathComponent:[response suggestedFilename]];//
  } completionHandler:^(NSURLResponse *response, NSURL *filePath, NSError *error)
  {
    objc_setAssociatedObject(self, sucessKey, resolve, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    objc_setAssociatedObject(self, rejectKey, reject, OBJC_ASSOCIATION_RETAIN_NONATOMIC);

    if (error) {
      reject(@"视频保存失败", @"失败", error);
    }else
    {
      UISaveVideoAtPathToSavedPhotosAlbum(filePath.path, self, @selector(video:didFinishSavingWithError:contextInfo:), nil);
    }
  }];
  [downloadTask resume];
}

- (void)video:(NSString *)videoPath didFinishSavingWithError:(NSError *)error contextInfo:(void *)contextInf{
  NSString *name = objc_getAssociatedObject(self, fileNameKey);
  RCTPromiseResolveBlock resolve = objc_getAssociatedObject(self, sucessKey);
  RCTPromiseRejectBlock reject = objc_getAssociatedObject(self, rejectKey);
  if (error) {
    reject(@"视频保存失败", @"失败", error);
  }else{
    resolve(@"视频保存成功");
  }
  [XCUploadManager deleteDocumentFile:name];
}

RCT_EXPORT_METHOD(showToast:(NSString *)str)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    MBProgressHUD *HUD = [MBProgressHUD safeShowHUDAddedTo:([UIApplication sharedApplication].delegate).window animated:YES];
    HUD.mode = MBProgressHUDModeText;
    HUD.detailsLabelText = str;
    [HUD hide:YES afterDelay:1.5f];
  });
  
}

RCT_EXPORT_METHOD(getAppVersionCode:(RCTResponseSenderBlock)callback)
{
  callback(@[[NSNull null], AppVersion]);
}

RCT_EXPORT_METHOD(getAppNetType:(RCTResponseSenderBlock)callback)
{
  NSString *status = @"NULL";
  if ([AFNetworkReachabilityManager sharedManager].isReachableViaWiFi)
  {
    status = @"WIFI";
  }else
  if ([AFNetworkReachabilityManager sharedManager].isReachableViaWWAN) {
    status = @"MOBILE";
  }
  callback(@[[NSNull null], status]);
}

RCT_EXPORT_METHOD(getAppOSVersion:(RCTResponseSenderBlock)callback)
{
  NSString* phoneVersion = [[UIDevice currentDevice] systemVersion];
  callback(@[[NSNull null], phoneVersion]);
}

RCT_EXPORT_METHOD(getAppDeviceModel:(RCTResponseSenderBlock)callback)
{
  NSString * iponeM = [[UIDevice currentDevice] systemName];
  callback(@[[NSNull null], iponeM]);
}

RCT_EXPORT_METHOD(getBundleMD5:(RCTResponseSenderBlock)callback)
{
  NSString* md5Str = [FileHash md5HashOfFileAtPath:[XCUploadManager bundlePathUrl].path];
  if (md5Str.length) {
    callback(@[[NSNull null], md5Str]);
  }else
  {
    callback(@[[NSNull null], projectBundleMd5]);
  }
}

RCT_REMAP_METHOD(getPushToken,resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [XCAppDelegate registerRemoteNotification];
  
  [XCAppDelegate setBlockTokenDidGet:^(NSString *token)
  {
    if ([token isKindOfClass:[NSString class]]&&token.length) {
      resolve(token);
    }else
    {
      NSError *error = nil;
      reject(@"pushtoken获取失败", @"失败", error);
    }
  }];
  [XCAppDelegate setBlockTokenGetFailed:^(NSError *error)
   {
       reject(@"pushtoken获取失败", @"失败", error);
   }];

}
//强制重新启动app
RCT_EXPORT_METHOD(restartApp:(NSString *)str)
{
  [XCAppDelegate reStartApp];
}

RCT_REMAP_METHOD(startValidate,ID:(NSString *)strID resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    // 加载腾讯验证码
    [[TCWebCodesBridge sharedBridge] loadTencentCaptcha:XCAppDelegate.window appid:strID callback:^(NSDictionary *resultJSON) { // appid在验证码接入平台注册申请，
      NSString* jsonStr = [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:resultJSON options:0 error:NULL] encoding:NSUTF8StringEncoding];
      resolve(jsonStr);
    }];
  });
  
//  verifyCodeManager *manager = [verifyCodeManager sharedInstance];
//  manager.strID = strID;
//  [manager setBlockVerifySucceed:^(NSString *valid){
//    resolve(valid);
//  }];
//  [manager setBlockVerifyFailed:^(NSString *message){
////    NSError *error = nil;
////    reject(message,@"失败",error);
//  }];
//  dispatch_async(dispatch_get_main_queue(), ^{
//    [manager showView];
//  });
}

RCT_EXPORT_METHOD(openPushSetting)
{
  NSURL*url =[NSURL URLWithString:UIApplicationOpenSettingsURLString];
  if([[UIApplication sharedApplication] canOpenURL:url])
  {
    [[UIApplication sharedApplication] openURL:url];
  }
}

RCT_EXPORT_METHOD(getPushStatus:(RCTResponseSenderBlock)callback)
{
  if ([[UIApplication sharedApplication]isRegisteredForRemoteNotifications]) {
    callback(@[[NSNull null], @(YES)]);
  }else
  {
    callback(@[[NSNull null], @(NO)]);
  }
}

RCT_EXPORT_METHOD(getDeviceSize:(RCTResponseSenderBlock)callback)
{
  NSString *deviceSize =  [NSString stringWithFormat:@"%@*%@",@([UIScreen mainScreen].currentMode.size.width),@([UIScreen mainScreen].currentMode.size.height)];
  callback(@[[NSNull null], GETSTRING(deviceSize)]);
}

RCT_REMAP_METHOD(getLocationInfo,getLocationResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    // 加载腾讯验证码
    [[BMKLocationAuth sharedInstance] checkPermisionWithKey:@"riZBjv6GbGrocHqqRaOouo9Rwg4f5haM" authDelegate:self];
    //初始化实例
    XCAppDelegate.locationManager = [[BMKLocationManager alloc] init];
    XCAppDelegate.locationManager.delegate=self;
    [XCAppDelegate.locationManager requestLocationWithReGeocode:YES withNetworkState:YES completionBlock:^(BMKLocation *location, BMKLocationNetworkState state, NSError *error)
     {
       if (error)
       {
         reject(@"位置获取失败", @"失败", error);
         NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
       }
       if (location) {//得到定位信息，添加annotation
         NSMutableDictionary *dic = [NSMutableDictionary dictionary];
         [dic setObject:GETSTRING(location.rgcData.country) forKey:@"country"];
         [dic setObject:GETSTRING(location.rgcData.countryCode) forKey:@"countryCode"];
         [dic setObject:GETSTRING(location.rgcData.province) forKey:@"province"];
         [dic setObject:GETSTRING(location.rgcData.city) forKey:@"city"];
         [dic setObject:GETSTRING(location.rgcData.district) forKey:@"district"];
         [dic setObject:GETSTRING(location.rgcData.street) forKey:@"street"];
         [dic setObject:GETSTRING(location.rgcData.streetNumber) forKey:@"streetNumber"];
         [dic setObject:GETSTRING(location.rgcData.cityCode) forKey:@"cityCode"];
         [dic setObject:GETSTRING(location.rgcData.adCode) forKey:@"adCode"];
         [dic setObject:GETSTRING(@(location.location.coordinate.latitude)) forKey:@"latitude"];
         [dic setObject:GETSTRING(@(location.location.coordinate.longitude)) forKey:@"lontitude"];
         
         NSData *data = [NSJSONSerialization dataWithJSONObject:dic
                                                        options:NSJSONReadingMutableLeaves | NSJSONReadingAllowFragments
                                                          error:nil];
         NSString *retStr = @"";
         if (data) {
           retStr = [[NSString alloc] initWithData:data
                                          encoding:NSUTF8StringEncoding];
         }
         resolve(GETSTRING(retStr));
         
         //       if (location.location) {
         //         NSLog(@"LOC = %@",location.location);
         //       }
         //       if (location.rgcData) {
         //         NSLog(@"rgc = %@",[location.rgcData description]);
         //       }
       }
       NSLog(@"netstate = %d",state);
     }];
  });
  
  
}

+(void)notifyNetworkChanged
{
  
}

@end
