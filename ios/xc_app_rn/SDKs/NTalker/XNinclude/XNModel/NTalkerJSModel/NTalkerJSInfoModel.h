//
//  NTalkerJSInfoModel.h
//  CustomerServerSDK2
//
//  Created by NTalker-zhou on 15/12/17.
//  Copyright © 2015年 黄 倩. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <JavaScriptCore/JavaScriptCore.h>


@protocol JavaScriptobjectiveCDelegate <JSExport>
//【接口1】获取ID
- (NSString *)getIdentityID;
//【接口2】打开原生SDK 通过JSON字符串传过来
- (int)openChatWindow:(NSString *)params;
//【接口3】获取用户信息
- (NSString *)getIdentityInfo;
//【接口4】获取咨询列表信息(主动调用，可选)
- (NSString *)getChatList;
@end

// 此模型用于注入JS的模型，这样就可以通过模型来调用方法。
@interface NTalkerJSInfoModel : NSObject<JavaScriptobjectiveCDelegate>
@property(nonatomic,strong) UIWebView *webView;
@property(nonatomic,strong) JSContext *jsContext;

@end
