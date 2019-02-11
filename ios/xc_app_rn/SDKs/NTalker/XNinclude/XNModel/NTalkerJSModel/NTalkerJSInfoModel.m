//
//  NTalkerJSInfoModel.m
//  CustomerServerSDK2
//
//  Created by NTalker-zhou on 15/12/17.
//  Copyright © 2015年 黄 倩. All rights reserved.
//

#import "NTalkerJSInfoModel.h"
#import "XNSDKCore.h"

@implementation NTalkerJSInfoModel

-(instancetype)init{
    if (self = [super init]) {
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(getUnreadMsg:) name:NOTIFINAME_XN_UNREADMESSAGE object:nil];
    }
    return self;
}

//【接口1】获取ID
- (NSString *)getIdentityID{
    NSString *result =  [[XNSDKCore sharedInstance] cidFromLocalStore];
    return result;
}
//【接口2】打开原生SDK
- (int)openChatWindow:(NSString *)params {
    //    DLog(@"Js调用了OC的方法，openChatWindow 参数为：%@", params);
    NSDictionary *ntalkerParam =[self dictionaryWithJsonString:params];
    [[NSNotificationCenter  defaultCenter]postNotificationName:@"SendParamsFromJSToOpenSDK" object:ntalkerParam];
    if (!([ntalkerParam[@"siteid"] length]>0)) {
        return 604;
    }
    
    return 0;
    
}
//【接口3】获取用户信息
- (NSString *)getIdentityInfo{
    
    XNSDKCore *score = [XNSDKCore sharedInstance];
    NSDictionary *dic =[score getUserInfo].copy;
    
    NSDictionary *obj = @{
                          @"device":@2,
                          @"pcid": dic[@"clientId"],
                          @"tid": dic[@"tid"],//轨迹会话ID
                          @"uid": dic[@"userId"],
                          @"shortid": dic[@"shortId"],
                          };
    
    return [self dictionaryToJson:obj];
    
}
//【接口4】获取咨询列表信息(主动调用，可选)
- (NSString *)getChatList{
    NSArray *chatListArray = [[XNSDKCore sharedInstance]chatListMessagFromDB];
    NSData *data = [NSJSONSerialization dataWithJSONObject:chatListArray options:NSJSONWritingPrettyPrinted error:nil];
    NSString *chatListString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    return chatListString;
}
//【接口5】wap页面内未读消息接收（可选）
- (void)getUnreadMsg:(NSNotification *)sender{
    
    NSDictionary *dic = sender.userInfo;
    NSString *unReadMsgString = [NSString stringWithFormat:@"%@%@%@%d",dic[@"settingid"],dic[@"username"],dic[@"msgcontent"],0];
    
    __weak typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        
        __strong typeof(self) strongSelf = weakSelf;
        
        [strongSelf.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"showUnReadMsg(\"+\"'\"+%@+\"'\"+\")",unReadMsgString]];
        
    });
}
//json转字典
-(NSDictionary *)dictionaryWithJsonString:(NSString *)jsonString {
    if (jsonString == nil) {
        return nil;
    }
    
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *err;
    NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:jsonData
                                                        options:NSJSONReadingMutableContainers
                                                          error:&err];
    if(err) {
        //        DLog(@"json解析失败：%@",err);
        return nil;
    }
    return dic;
}

- (NSString*)dictionaryToJson:(NSDictionary *)dic

{
    NSError *parseError = nil;
    if (dic) {
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dic options:NSJSONWritingPrettyPrinted error:&parseError];
        return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        
    }else {
        
        return [NSString stringWithFormat:@""];
    }
}
@end
