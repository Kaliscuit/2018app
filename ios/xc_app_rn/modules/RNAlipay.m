#import "RNAlipay.h"
#import "Order.h"
#import "DataSigner.h"
#import <AlipaySDK/AlipaySDK.h>
#import "Constants.h"

@implementation RNAlipay

RCT_EXPORT_MODULE(Alipay)
RCT_REMAP_METHOD(pay, options:(NSDictionary *)options
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *orderString = [options objectForKey:@"orderString"];
  
  XCAppDelegate.alipayResolveBlock = resolve;
  
  [[AlipaySDK defaultService] payOrder:orderString fromScheme:@"dalingjia.alipay" callback:^(NSDictionary *resultDic){
    resolve(resultDic);
  }];

  if(!orderString)
  {
    NSError *error = nil;
    reject(@"支付失败", @"参数错误", error);
  }
}

RCT_EXPORT_METHOD(auth:(NSDictionary *)options
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *orderString = [options objectForKey:@"infoString"];
  
  XCAppDelegate.alipayAuthResolveBlock = resolve;
  
  [[AlipaySDK defaultService] auth_V2WithInfo:orderString fromScheme:SCHEME_FOR_ALIPAY callback:^(NSDictionary *resultDic) {
    resolve(resultDic);
  }];
  
  if(!orderString)
  {
    NSError *error = nil;
    reject(@"支付失败", @"参数错误", error);
  }
}

@end
