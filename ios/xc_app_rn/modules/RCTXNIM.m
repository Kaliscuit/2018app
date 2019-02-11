//
//  RCTXNIM.m
//  xc_app_rn
//
//  Created by zl on 2018/11/22.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "RCTXNIM.h"
#import "NTalker.h"
#import "XNTextMessage.h"
#import <React/RCTImageLoader.h>

@implementation RCTXNIM

RCT_EXPORT_MODULE(XNIMModule);

- (instancetype)init
{
  self = [super init];
  if (self) {
    //注册未读消息通知
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendIMMessageEvent:)
                                                 name:NOTIFINAME_XN_UNREADMESSAGE
                                               object:nil];    
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"EventIM"];
}

- (void)sendIMMessageEvent:(NSNotification *)sender
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([sender.object isKindOfClass:[NSDictionary class]]) {
      NSDictionary *dict = (NSDictionary *)sender.object;
      [self sendEventWithName:@"EventIM" body:dict];
    }
  });
}

//RCT_EXPORT_METHOD(showToast:(NSString *)str :(NSString *)str)

RCT_REMAP_METHOD(login,userID:(NSString *)ID userName:(NSString *)name level:(NSString *)level :(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    NSInteger ret = [[NTalker standardIntegration] loginWithUserid:ID andUsername:name andUserLevel:level];
    callback(@[[NSNull null], @(ret)]);
  });
}

RCT_EXPORT_METHOD(logout:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[NTalker standardIntegration] logout];
  });
}

RCT_REMAP_METHOD(startChat,ID:(NSString *)ID headImgUrl:(NSString *)imageUrl :(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [XCAppDelegate startXNIM:ID];
    
    //下载用户头像
    if (imageUrl.length && self.bridge.imageLoader) {
      NSURL *url = [NSURL URLWithString:imageUrl];
      NSURLRequest *imageRequest = [NSURLRequest requestWithURL:url];
      [self.bridge.imageLoader loadImageWithURLRequest:imageRequest callback:^(NSError *error, UIImage *image) {
        if (image)
        {
          [[NTalker standardIntegration] setUserIconImage:image];
        }
      }];
    }
  });
}

RCT_EXPORT_METHOD(sendTextMessage:(NSString *)message :(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (message.length) {
      XNTextMessage *nmassage = [[XNTextMessage alloc]init];
      nmassage.textMsg = message;
      nmassage.cardJsonStr = message;
      nmassage.textMessageType = ONLY_TEXT;
      [[NTalker standardIntegration]sendMessage:nmassage resend:NO];
    }
  });
}

@end
