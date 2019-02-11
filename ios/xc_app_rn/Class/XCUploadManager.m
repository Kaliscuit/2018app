//
//  XCUploadManager.m
//  xc_app_rn
//
//  Created by zl on 2017/8/31.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "XCUploadManager.h"
#import "AFHTTPSessionManager.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import "FileHash.h"
#import "Constants.h"
#import "NNAppLauchConf.h"
#import "MBProgressHUD.h"

#define sandBoxBundleName (@"index.ios.bundle")
#define bundleName (@"main")
#define bundleType (@"bundle")
@implementation XCUploadManager

+ (instancetype)sharedInstance {
  static XCUploadManager *_sharedClient = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    _sharedClient = [[XCUploadManager alloc] init];
  });
  return _sharedClient;
}

//app启动的主入口
-(void)upDateBundleIfNeeded
{
  //重新启动app时，需要初始化数据
  self.upView = nil;
  self.updateSign = nil;
  self.oldSign = nil;
  self.downLoadUrl = nil;
  self.isLaunchImageFinished = NO;
  self.rctRootView = nil;
  
  //开启网络状态监测
  [[AFNetworkReachabilityManager sharedManager] startMonitoring];

  self.upView = [[NSBundle mainBundle]loadNibNamed:@"XCViewUpdate" owner:self options:nil][0];
  XCAppDelegate.window.rootViewController.view = self.upView;
  WS(ws);
  [self.upView setBlockStartButtonClicked:^{
    if([AFNetworkReachabilityManager sharedManager].isReachable)
    {
      [ws doCheckUpdate];
    }else
    {
      MBProgressHUD *HUD = [MBProgressHUD safeShowHUDAddedTo:([UIApplication sharedApplication].delegate).window animated:YES];
      HUD.mode = MBProgressHUDModeText;
      HUD.detailsLabelText = @"当前网络不可用，请检查是否允许或连接了可用的WiFi或移动网络";
      [HUD hide:YES afterDelay:2.f];
    }
  }];
  [self.upView setBlockAnimateImageFinished:^{
    ws.isLaunchImageFinished = YES;
    if (ws.rctRootView) {
      [ws animiateSetRNRootView];
    }
  }];
  
  self.upView.viewButtonStart.hidden = YES;
  
  if(![[NSUserDefaults standardUserDefaults] boolForKey:@"firstLaunch"]){
    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"firstLaunch"];
    
    //第一次启动
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC*1.5), dispatch_get_main_queue(), ^{
      self.upView.viewButtonStart.hidden = NO;
    });

  }else
  {
    //不是第一次启动了
    [self doCheckUpdate];
  }
}

//rn页面显露时的操作
- (void)handleRnViewApear
{
  if (XCAppDelegate.recievePushNotif) {
    [[NSNotificationCenter defaultCenter]postNotification:XCAppDelegate.recievePushNotif];
//    XCAppDelegate.recievePushNotif = nil;
  }
}

//启动图渐进撤出
- (void)animiateSetRNRootView
{
  XCAppDelegate.window.rootViewController.view = self.rctRootView;
  [XCAppDelegate.window addSubview:self.upView];
  [UIView animateWithDuration:(0.45) animations:^{
    self.upView.imageBG.frame = CGRectMake(-ScreenWidth/2, -ScreenHeight/2, ScreenWidth*2, ScreenHeight*2);
    self.upView.imageBG.alpha = 0.0f;
  } completion:^(BOOL finished) {
    [self.upView removeFromSuperview];
    [self handleRnViewApear];
    self.isRnViewAppear = YES;
}];
}

-(void)doCheckUpdate
{
  self.upView.viewButtonStart.hidden = YES;
  if ([XCUploadManager isFileExist:[XCUploadManager bundlePathUrl].path])
  {//沙盒里已经有了下载好的jsbundle，以沙盒文件优先
    self.oldSign = [FileHash md5HashOfFileAtPath:[XCUploadManager bundlePathUrl].path];
  }else
  {//真机计算出的包内bundlemd5有变化，可能是压缩了，所以这里写死初始化的md5
    //    NSString *ipPath = [[NSBundle mainBundle] pathForResource:@"main" ofType:@"jsbundle"];
    //    self.oldSign = [FileHash md5HashOfFileAtPath:ipPath];
    self.oldSign = projectBundleMd5;
  }
  
  AFHTTPSessionManager *_sharedClient = [[AFHTTPSessionManager alloc] initWithBaseURL:[NSURL URLWithString:@"https://dalingjia.com"]];
  
  _sharedClient.requestSerializer.timeoutInterval = 10;
  _sharedClient.securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
  [_sharedClient.requestSerializer setValue:@"ios" forHTTPHeaderField:@"platform"];
  [_sharedClient.requestSerializer setValue:GETSTRING(self.oldSign) forHTTPHeaderField:@"bundle"];
  [_sharedClient.requestSerializer setValue:GETSTRING([[NNAppLauchConf sharedInstance] getUDID]) forHTTPHeaderField:@"clientid"];
  [_sharedClient.requestSerializer setValue:AppVersion forHTTPHeaderField:@"version"];
  [_sharedClient.requestSerializer setValue:GETSTRING([[UIDevice currentDevice] model]) forHTTPHeaderField:@"devicemode"];
  
  NSString *deviceSize =  [NSString stringWithFormat:@"%@*%@",@([UIScreen mainScreen].currentMode.size.width),@([UIScreen mainScreen].currentMode.size.height)];
  [_sharedClient.requestSerializer setValue:GETSTRING(deviceSize) forHTTPHeaderField:@"devicesize"];
  [_sharedClient.requestSerializer setValue:GETSTRING([[UIDevice currentDevice]systemVersion]) forHTTPHeaderField:@"systemversion"];
  [_sharedClient.requestSerializer setValue:@"app store" forHTTPHeaderField:@"channelid"];

  
  [_sharedClient GET:@"xc_sale/resource/config/check.do" parameters:nil progress:nil success:^(NSURLSessionDataTask * __unused task, id JSON) {
    NSDictionary *dic = [JSON valueForKeyPath:@"data"];
    BOOL isNeedLoadBundle = YES;
    if ([dic isKindOfClass:[NSDictionary class]])
    {
      self.updateSign = [dic stringForKey:@"sign"];
      self.downLoadUrl = [dic stringForKey:@"downloadUrl"];
      if (self.updateSign.length && self.oldSign.length && (![self.updateSign isEqualToString:self.oldSign]))
      {
        //需要更新bundle文件了
        self.upView.viewUpdate.hidden = NO;
        [self updateBundleNow];
        isNeedLoadBundle = NO;
      }
    }
    if (isNeedLoadBundle) {
      [self loadBundle];
    }
  } failure:^(NSURLSessionDataTask *__unused task, NSError *error) {
    [self loadBundle];
  }];
}

-(void)updateBundleNow
{
  NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
  AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:configuration];
  
  NSURL *URL = [NSURL URLWithString:GETSTRING(self.downLoadUrl)];
  NSURLRequest *request = [NSURLRequest requestWithURL:URL];
  
  NSURLSessionDownloadTask *downloadTask = [manager downloadTaskWithRequest:request progress:^(NSProgress * _Nonnull uploadProgress) {
    // This is not called back on the main queue.
    // You are responsible for dispatching to the main queue for UI updates
    dispatch_async(dispatch_get_main_queue(), ^{
      //Update the progress view
      [self.upView setProgress:uploadProgress];
    });
  } destination:^NSURL *(NSURL *targetPath, NSURLResponse *response)
  {
    NSString *md5Str = [FileHash md5HashOfFileAtPath:targetPath.path];
    if (md5Str.length && self.updateSign.length && [md5Str isEqualToString:self.updateSign])
    {
      NSFileManager *fileMgr = [NSFileManager defaultManager];
      NSError* error;
      [fileMgr removeItemAtPath:[XCUploadManager bundlePathUrl].path error:&error];
      
      return [XCUploadManager bundlePathUrl];
    }else
    {
      return nil;
    }
  } completionHandler:^(NSURLResponse *response, NSURL *filePath, NSError *error) {
    [self loadBundle];
  }];
  [downloadTask resume];
}

-(void)loadBundle
{
  NSURL *filePath = nil;
  if ([XCUploadManager isFileExist:[XCUploadManager bundlePathUrl].path])
  {
    filePath = [XCUploadManager bundlePathUrl];
  }else
  {
    NSString *ipPath = [[NSBundle mainBundle] pathForResource:@"main" ofType:@"bundle"];
    filePath = [NSURL fileURLWithPath:ipPath];
  }
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:filePath
                                                      moduleName:@"Bootstrap"
                                               initialProperties:nil
                                                   launchOptions:XCAppDelegate.option];
  self.rctRootView = rootView;
  if (self.isLaunchImageFinished) {
    [self animiateSetRNRootView];
  }
}

+(NSURL*)bundlePathUrl
{
  NSURL *documentsDirectoryURL = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:nil];
  return [documentsDirectoryURL URLByAppendingPathComponent:sandBoxBundleName];
}

+ (BOOL) isFileExist:(NSString *)fileName
{
  NSFileManager *fileManager = [NSFileManager defaultManager];
  BOOL result = [fileManager fileExistsAtPath:fileName];
  return result;
}

/**
 *  删除Document中某项文件
 *
 *  @param fileName 文件名
 */
+(void)deleteDocumentFile:(NSString*)fileName
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString * path = [documentsDirectory stringByAppendingPathComponent:fileName];
  NSFileManager *fileMgr = [NSFileManager defaultManager];
  NSError* error;
  [fileMgr removeItemAtPath:path error:&error];
}
@end
