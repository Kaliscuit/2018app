//
//  NNAppLauchConf.m
//  YMall
//
//  Created by 干 小强 on 13-4-16.
//  Copyright (c) 2013年 NPNT. All rights reserved.
//

#import "NNAppLauchConf.h"
#import "OpenUDID.h"

@interface NNAppLauchConf(){
  //2.0
  NSString* _accessToken;
  //登录成功后的userID
  NSString* _userId;
  //上次登录的手机号码
  NSString* _phoneNumber;
  //    NSString* _userPassWord;
  BOOL _isHavePassWord;
}

@end

@implementation NNAppLauchConf

static NNAppLauchConf *_sharedInstance = nil;

#pragma  mark singleton class implemention
+ (id)sharedInstance
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    _sharedInstance = [[self alloc] init];
  });
  
  return _sharedInstance;
}
/**
 *  删除Document中某项文件
 *
 *  @param fileName 文件名
 */
-(void)deleteDocumentFile:(NSString*)fileName
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString * path = [documentsDirectory stringByAppendingPathComponent:fileName];
  NSFileManager *fileMgr = [NSFileManager defaultManager];
  NSError* error;
  [fileMgr removeItemAtPath:path error:&error];
}
/**
 *  删除Cache目录中某项文件
 *
 *  @param fileName 文件名
 */
-(void)deleteCacheFile:(NSString*)fileName
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString * path = [documentsDirectory stringByAppendingPathComponent:fileName];
  NSFileManager *fileMgr = [NSFileManager defaultManager];
  NSError* error;
  [fileMgr removeItemAtPath:path error:&error];
}

//蒙版相关配置

//单品页面点击查看大图 提示
-(NSInteger)getUserGuidClickLookBigPic
{
  NSInteger LookBigPic = 0;
  if([[NSUserDefaults standardUserDefaults] boolForKey:@"UserGuidClickLookBigPic"])
  LookBigPic = [[NSUserDefaults standardUserDefaults] integerForKey:@"UserGuidClickLookBigPic"];
  return LookBigPic;
}
//设置单品页面点击查看大图 提示  times为显示了 增加次数。如果用户误操作 显示5次后 不再显示
-(void)setUserGuidClickLookBigPicAdd:(int)times
{
#if 0
  if(times >0)
  {
    NSInteger LookBigPic = 0;
    if([[NSUserDefaults standardUserDefaults] boolForKey:@"UserGuidClickLookBigPic"])
    LookBigPic = [[NSUserDefaults standardUserDefaults] integerForKey:@"UserGuidClickLookBigPic"];
    if(LookBigPic > UserGuideTimes)
    return;
    LookBigPic += times;
    
    [[NSUserDefaults standardUserDefaults] setValue:[NSNumber numberWithInteger:LookBigPic] forKey:@"UserGuidClickLookBigPic"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
#endif
}

//大图浏览模式左右滑动 提示
-(NSInteger)getUserGuidSwipeBigPic
{
  NSInteger SwipeBigPic = 0;
  if([[NSUserDefaults standardUserDefaults] boolForKey:@"UserGuidSwipeBigPic"])
  SwipeBigPic = [[NSUserDefaults standardUserDefaults] integerForKey:@"UserGuidSwipeBigPic"];
  return SwipeBigPic;
}
//设置大图浏览模式左右滑动 提示  times为显示了 增加次数。如果用户误操作 显示UserGuideTimes次后 不再显示
-(void)setUserGuidSwipeBigPicAdd:(int)times
{
#if 0
  if(times >0)
  {
    NSInteger SwipeBigPic = 0;
    if([[NSUserDefaults standardUserDefaults] boolForKey:@"UserGuidSwipeBigPic"])
    SwipeBigPic = [[NSUserDefaults standardUserDefaults] integerForKey:@"UserGuidSwipeBigPic"];
    if(SwipeBigPic > UserGuideTimes)
    return;
    SwipeBigPic += times;
    [[NSUserDefaults standardUserDefaults] setValue:[NSNumber numberWithInteger:SwipeBigPic] forKey:@"UserGuidSwipeBigPic"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
#endif
}

//设置pushtoken
-(void)setDeviceToken:(NSString*)pushtoken
{
  [[NSUserDefaults standardUserDefaults] setValue:pushtoken forKey:@"deviceToken"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
//获取pushtoken
-(NSString*)getDeviceToken
{
  NSString *token = [[NSUserDefaults standardUserDefaults] objectForKey:@"deviceToken"];
  return token;
}
//上传通讯录
-(void)uploadContactBook
{
  //[MyAppDelegate GetUserAddressBook];
}
-(void)setAccessToken:(NSString *)accessToken
{
#if 0
  if ([self getAccessToken] != accessToken) {
    _accessToken = nil;
    _accessToken = accessToken;
    if([_accessToken isNotEmpty])
    {
      [[NSUserDefaults standardUserDefaults] setObject:_accessToken forKey:@"AccessToken"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
    else
    {
      [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"AccessToken"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
  }
  
  //发送登录或退出的通知
  NSNotification *notification=[NSNotification notificationWithName:NOTIFY_USERLOGINANDLOGOUT object:nil
                                                           userInfo:nil];
  [[NSNotificationQueue defaultQueue] enqueueNotification:notification postingStyle:NSPostASAP];
  
  //    [self uploadContactBook];
  //登录成功 ，上传pushtoken
  [AppDelegate uploadPushToken];
  //刷新用户信息
  [AppDelegate sendGetUserInfoRequest];
  [AppDelegate sendGetUpPayOrderCountRequest];
  [AppDelegate sendGetMyInfoCurData];
#endif
}
-(NSString*)getAccessToken
{
  if (_accessToken) {
    return _accessToken;
  }
  NSString *token = [[NSUserDefaults standardUserDefaults] stringForKey:@"AccessToken"];
  if (token != nil) {
    return token;
  }
  return nil;
}
//登录成功后UserID
-(void)setUserId:(NSString *)userId
{
  if ( [self getUserID]!= userId) {
    _userId = nil;
    _userId = userId;
    if([_userId isNotEmpty])
    {
      [[NSUserDefaults standardUserDefaults] setObject:_userId forKey:@"userId"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
    else
    {
      [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"userId"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
  }
}
-(NSString*)getUserID
{
  if (_userId) {
    return _userId;
  }
  NSString *userID = [[NSUserDefaults standardUserDefaults] stringForKey:@"userId"];
  if (userID != nil) {
    return userID;
  }
  return nil;
}
//上次登录手机号码
-(void)setPhoneNumber:(NSString *)phoneNumber
{
  if ([self getPhoneNumber] != phoneNumber) {
    _phoneNumber = nil;
    _phoneNumber = phoneNumber;
    if([_phoneNumber isNotEmpty])
    {
      [[NSUserDefaults standardUserDefaults] setObject:_phoneNumber forKey:@"phoneNumber"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
    else
    {
      [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"phoneNumber"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
  }
}
-(NSString*)getPhoneNumber
{
  if (_phoneNumber) {
    return _phoneNumber;
  }
  NSString *phone = [[NSUserDefaults standardUserDefaults] objectForKey:@"phoneNumber"];
  if (phone != nil) {
    return phone;
  }
  return nil;
}
//-(void)setUserPassWord:(NSString *)userPassWord
//{
//    if ([self getUserPassWord] != userPassWord) {
//        _userPassWord = nil;
//        _userPassWord = userPassWord;
//        if([_userPassWord isNotEmpty])
//        {
//            [[NSUserDefaults standardUserDefaults] setObject:_userPassWord forKey:@"UserPassWord"];
//            [[NSUserDefaults standardUserDefaults] synchronize];
//        }
//        else
//        {
//            [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"UserPassWord"];
//            [[NSUserDefaults standardUserDefaults] synchronize];
//        }
//    }
//}
//-(NSString*)getUserPassWord
//{
//    if (_userPassWord) {
//        return _userPassWord;
//    }
//    NSString *phone = [[NSUserDefaults standardUserDefaults] objectForKey:@"UserPassWord"];
//    if (phone != nil) {
//        return phone;
//    }
//    return nil;
//}
//是否有密码
-(void)setIsHavePassWord:(BOOL)isHavePassWord
{
  if ([self isUserHavePassWord] != isHavePassWord) {
    _isHavePassWord = isHavePassWord;
    NSNumber *toNum = [NSNumber numberWithBool:_isHavePassWord];
    [[NSUserDefaults standardUserDefaults] setObject:toNum forKey:@"IsHavePassWord"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
}
-(BOOL)isUserHavePassWord
{
  NSNumber *isHavePass = [[NSUserDefaults standardUserDefaults] objectForKey:@"IsHavePassWord"];
  if (isHavePass != nil && isHavePass.boolValue == YES) {
    _isHavePassWord = YES;
  }
  else
  _isHavePassWord = NO;
  
  return _isHavePassWord;
}
//是否处于登录状态
-(BOOL)isLogInStatus
{
  if([self getPhoneNumber] && [self getAccessToken]&&[self getUserID])
  return YES;
  return NO;
}
//推出登录
-(void)exitLogIn
{
  [self setUserId:nil];
  [self setAccessToken:nil];
  [self deleteUserInfosFile];
}
//获取UDID
-(NSString*)getUDID
{
  NSString* udid = nil;
  udid = [[NSUserDefaults standardUserDefaults] stringForKey:@"UDID"];
  if([udid isNotEmpty] == NO)
  {
    udid = [OpenUDID value];
    [[NNAppLauchConf sharedInstance]setIsFirstRun:NO];
    [[NNAppLauchConf sharedInstance]setUDID:udid];
  }
  return udid;
}
//设置UDID
-(void)setUDID:(NSString*)udid
{
  [[NSUserDefaults standardUserDefaults] setValue:udid forKey:@"UDID"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
//获取是否为第一次运行app
-(BOOL)getIsFirstRun
{
  BOOL isFirst = NO;
  isFirst = [[NSUserDefaults standardUserDefaults] boolForKey:@"isfirstrun"];
  return isFirst;
}
//设置是否为第一次运行app
-(void)setIsFirstRun:(BOOL)isFirst
{
  [[NSUserDefaults standardUserDefaults] setBool:isFirst forKey:@"isfirstrun"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setLastVersion:(NSString*)lastVersion
{
  [[NSUserDefaults standardUserDefaults] setValue:lastVersion forKey:@"LastVersion"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
-(NSString*)getLastVersion
{
  return [[NSUserDefaults standardUserDefaults] objectForKey:@"LastVersion"];
}
-(void)setLastPromptDate
{
  [[NSUserDefaults standardUserDefaults] setValue:[NSDate date] forKey:@"LastVersionPromptDate"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
-(NSDate*)getLastPromptDate
{
  return [[NSUserDefaults standardUserDefaults] objectForKey:@"LastVersionPromptDate"];
}
-(void)setPushDeviceToken:(NSString*)pushtoken
{
  [[NSUserDefaults standardUserDefaults] setValue:pushtoken forKey:@"deviceToken"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
-(NSString*)getPushDeviceToken
{
  return [[NSUserDefaults standardUserDefaults] objectForKey:@"deviceToken"];
}
//是否显示过用户引导界面
-(BOOL)isShowedUserGuide
{
  BOOL isShowedUserGuide = NO;
  isShowedUserGuide = [[NSUserDefaults standardUserDefaults] boolForKey:@"isShowedUserGuide"];
  return isShowedUserGuide;
}
//设置是否显示过用户引导界面
-(void)setIsShowedUserGuide:(BOOL)isShowed
{
  [[NSUserDefaults standardUserDefaults] setBool:isShowed forKey:@"isShowedUserGuide"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

//保存开机大图秀的数据
-(BOOL)saveStartPicData:(NSDictionary*)dic
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"StartPic.plist"];
  
  bool result = [dic writeToFile:filePath atomically:YES];
  
  return result;
  
}
//获取开机大图秀的数据
-(NSDictionary*)getStartPicData
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"StartPic.plist"];
  NSDictionary* dic = [NSDictionary dictionaryWithContentsOfFile:filePath];
  return dic;
}
//下载大图秀图片
-(void)downloadStartPic
{
#if 0
  NSDictionary* dic = [self getStartPicData];
  if(dic != nil)
  {
    if([dic objectForKey:@"list"] != [NSNull null] && [[dic objectForKey:@"list"] isKindOfClass:[NSArray class]])
    {
      NSArray* dicPicList = [dic objectForKey:@"list"];
      for (NSDictionary* dicOb in dicPicList) {
        //                NSString* urlstring = [dicOb objectForKey:@"url"];
        [NNUtil preDownloadImage:[dicOb objectForKey:@"url"]];
      }
    }
  }
#endif
}
//保存公司相关信息
-(BOOL)saveCompanyInfo:(NSDictionary*)dic
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"CompanyInfo.plist"];
  
  bool result = [dic writeToFile:filePath atomically:YES];
  
  return result;
}
//获取公司相关信息
-(NSDictionary*)getCompanyInfo
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"CompanyInfo.plist"];
  NSDictionary* dic = [NSDictionary dictionaryWithContentsOfFile:filePath];
  return dic;
  
}
//保存支付宝账户支付相关信息
-(BOOL)saveAlipayCountInfo:(NSDictionary*)dic
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"AlipayCountInfo.plist"];
  
  bool result = [dic writeToFile:filePath atomically:YES];
  
  return result;
}
//获取支付宝账户支付相关信息
-(NSDictionary*)getAlipayCountInfo
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"AlipayCountInfo.plist"];
  NSDictionary* dic = [NSDictionary dictionaryWithContentsOfFile:filePath];
  return dic;
}
//保存财付通支持的 信用卡  银行列表相关信息
-(BOOL)saveCaiFuTongCreditBanksInfo:(NSArray*)arr
{
  if([arr isKindOfClass:[NSArray class]])
  return [arr writeToPlistFile:@"CaiFuTongCreditBanksInfo.plist"];
  return NO;
}
//获取财付通支持的 信用卡  银行列表相关信息
-(NSArray*)getCaiFuTongCreditBanksInfoInfo
{
  return [NSArray readFromPlistFile:@"CaiFuTongCreditBanksInfo.plist"];
}

//保存财付通支持的 储蓄卡  银行列表相关信息
-(BOOL)saveCaiFuTongDebitBanksInfo:(NSArray*)arr
{
  if([arr isKindOfClass:[NSArray class]])
  return [arr writeToPlistFile:@"CaiFuTongDebitBanksInfo.plist"];
  return NO;
}
//获取财付通支持的 储蓄卡  银行列表相关信息
-(NSArray*)getCaiFuTongDebitBanksInfoInfo
{
  return [NSArray readFromPlistFile:@"CaiFuTongDebitBanksInfo.plist"];
}

//保存菜单搜索热词信息
-(BOOL)saveMenuHotInfo:(NSArray*)arr
{
  if(arr && [arr isKindOfClass:[NSArray class]])
  return [arr writeToPlistFile:@"MenuHot.plist"];
  return NO;
}
//获取菜单搜索热词信息
-(NSArray*)getMenuHotInfo
{
  return [NSArray readFromPlistFile:@"MenuHot.plist"];
}
//保存更多分类信息
-(BOOL)saveMoreCategoryInfo:(NSArray*)arr
{
  if(arr && [arr isKindOfClass:[NSArray class]])
  return [arr writeToPlistFile:@"TabGoodsCategory.plist"];
  return NO;
}
//获取更多分类信息
-(NSArray*)getMoreCategoryInfo
{
  return [NSArray readFromPlistFile:@"TabGoodsCategory.plist"];
}
//2.0.2 新增
//设置bar最后一次的更新时间
-(void)setBarLastUpdateTime:(NSString*)time
{
  [[NSUserDefaults standardUserDefaults] setValue:time forKey:@"BarLastUpdateTime"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
//获取bar最后一次的更新时间
-(NSString*)getBarLastUpdateTime
{
  return [[NSUserDefaults standardUserDefaults] objectForKey:@"BarLastUpdateTime"];
}
//记录用户保存的商品列表样式，大图or小图 模式
-(void)setGoodsListListStyle:(BOOL)isListStyle
{
  [[NSUserDefaults standardUserDefaults] setBool:isListStyle forKey:@"GoodsListListStyle"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
//获取用户保存的商品列表样式，大图or小图 模式  yes为大图
-(BOOL)getGoodsListListStyle
{
  return [[NSUserDefaults standardUserDefaults] boolForKey:@"GoodsListListStyle"];
}
//获取分享平台列表
-(NSArray*)getSharePlatList
{
  //return [ShareSDK getShareListWithType:ShareTypeWeixiSession,ShareTypeWeixiTimeline,ShareTypeSinaWeibo,ShareTypeQQ,nil];
  return nil;
}
//保存未登录状态 用户的默认地址
-(BOOL)saveUnLoginUserAddress:(NSString*)Name Phone:(NSString*)phone Area:(NSString*)area Address:(NSString*)address BuyerPhone:(NSString*)buyerPhone IDCard:(NSString *)idCard
{
  NSDictionary* dic = @{AppConfigKeyAddressUserName: Name,
                        AppConfigKeyAddressUserPhone:phone,
                        AppConfigKeyAddressUserArea:area,
                        AppConfigKeyAddressUserAddress:address,
                        AppConfigKeyAddressUserBuyerPhone:buyerPhone,
                        AppConfigKeyAddressUserIDCard:idCard?idCard:@""};
  return [dic writeToPlistFile:@"unLoginUserAddress.plist"];
}
//获取未登录状态 用户的默认地址
-(NSDictionary*)getUnLoginUserAddress
{
  return [NSDictionary readFromPlistFile:@"unLoginUserAddress.plist"];
}
//保存分类菜单信息
-(void)SaveCategoryData:(NSArray*)arrayData
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"YamllHomeChannelData.plist"];
  
  [arrayData writeToFile:filePath atomically:YES];
}
//获取分类菜单信息
-(NSArray*)GetCategoryData
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:@"YamllHomeChannelData.plist"];
  NSArray *arr =[NSMutableArray arrayWithContentsOfFile:filePath];
  return arr;
}

//设置上次支付选择的支付类型
-(void)setLastPaymentUkey:(NSString*)payUkey
{
  [[NSUserDefaults standardUserDefaults] setValue:payUkey forKey:@"lastPaymentUkey"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
//获取上次支付选择的类型
-(NSString*)getLastPaymentUkey
{
  return [[NSUserDefaults standardUserDefaults] stringForKey:@"lastPaymentUkey"];
}
//设置紧急通知的id和上次提醒时间
-(void)setLastEmergencyMsg:(NSString*)msgId showDate:(NSDate*)date
{
  if([msgId isNotEmpty])
  {
    NSDictionary* dic = @{@"msgId":msgId,@"showDate":date?date:[NSNull null]};
    [[NSUserDefaults standardUserDefaults] setValue:dic forKey:@"lastEmergencyMsg"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
}
//获取上次紧急通知的id和上次提醒时间
-(NSDictionary*)getLastEmergencyMsg
{
  return [[NSUserDefaults standardUserDefaults] dictionaryForKey:@"lastEmergencyMsg"];
}
//保存用户个人资料
-(BOOL)saveUserInfos:(NSDictionary*)infos
{
  if(infos == nil || [infos isKindOfClass:[NSDictionary class]]==NO)
  {
    [self deleteUserInfosFile];
    return YES;
  }
  
  return [infos writeToPlistFile:@"userAllInfos"];
}
//获取用户个人资料
-(NSDictionary*)getUserInfos
{
  return [NSDictionary readFromPlistFile:@"userAllInfos"];
}
//删除用户个人资料
-(void)deleteUserInfosFile
{
  [self deleteDocumentFile:@"userAllInfos"];
}
//保存省市区信息
-(BOOL)SaveAddressData:(NSArray*)arrayData
{
  if(arrayData == nil || [arrayData isKindOfClass:[NSArray class]]==NO||arrayData.count<=0)
  {
    return NO;
  }
  
  return [arrayData writeToPlistFile:@"dalingAddressData"];
}
//获取省市区信息
-(NSArray*)GetAddressData
{
  return [NSArray readFromPlistFile:@"dalingAddressData"];
}
//设置本地最新地址省市区数据版本号
-(void)setLastAddressDataVersion:(NSInteger)version
{
  if(version > 0)
  {
    [[NSUserDefaults standardUserDefaults] setInteger:version forKey:@"dalingLastAddressVersion"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
}
//获取本地最新地址省市区数据版本号
-(NSInteger)getLastAddressDataVersion
{
  return [[NSUserDefaults standardUserDefaults]integerForKey:@"dalingLastAddressVersion"];
}

//获取已经点击过的商品列表banner的id
-(NSMutableDictionary *)getGoodListBannerClikedID
{
  NSDictionary * dic = [[NSUserDefaults standardUserDefaults] objectForKey:@"goodlistbannerclikedID"];
  return dic&& [dic isKindOfClass:[NSDictionary class]]?[NSMutableDictionary dictionaryWithDictionary:dic]:nil;
}
//设置已经点击过的商品列表banner的id
-(void)setGoodListBannerClikedID:(NSMutableDictionary *)dic
{
  [[NSUserDefaults standardUserDefaults] setValue:dic forKey:@"goodlistbannerclikedID"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
//删除首页fitting数据
-(void)deleteFittingData
{
  [self deleteCacheFile:@"fitting.plist"];
}
//获取首页fitting数据
-(NSMutableDictionary *)getFittingData
{
  return (NSMutableDictionary *)[NSMutableDictionary readFromCachePlistFile:@"fitting.plist"];
}
//设置首页fitting数据
-(BOOL)setFittingData:(NSMutableDictionary *)dic
{
  if(dic && [dic isKindOfClass:[NSDictionary class]])
  return [dic writeToCachePlistFile:@"fitting.plist"];
  return NO;
}
//删除首页广告数据
-(void)deleteMainPageActivityData
{
  [self deleteCacheFile:@"mainPageAcitivity.plist"];
}
//获取首页广告
-(NSMutableDictionary *)getMainPageActivity
{
  return (NSMutableDictionary *)[NSMutableDictionary readFromCachePlistFile:@"mainPageAcitivity.plist"];
}
//设置首页广告
-(BOOL)setMainPageActivity:(NSMutableDictionary *)dic
{
  if(dic && [dic isKindOfClass:[NSDictionary class]])
  return [dic writeToCachePlistFile:@"mainPageAcitivity.plist"];
  return NO;
}
//app启动次数 +1
-(void)addAppStartCount
{
  NSInteger count = [[NSUserDefaults standardUserDefaults]integerForKey:@"appStartCount"];
  count ++ ;
  [[NSUserDefaults standardUserDefaults]setValue:[NSNumber numberWithInteger:count] forKey:@"appStartCount"];
}
//获取自从安装之后app启动次数
-(NSInteger)getAppStartCount
{
  return [[NSUserDefaults standardUserDefaults]integerForKey:@"appStartCount"];
  
}
//设置是否隐藏 app 评分提醒
-(void)setIsHidenAppRateAlert:(BOOL)isHiden
{
  [[NSUserDefaults standardUserDefaults]setBool:isHiden forKey:@"isHidenAppRateAlert"];
}
//获取是否隐藏 app 评分提醒
-(BOOL)getIsHidenAppRateAlert
{
  return [[NSUserDefaults standardUserDefaults]boolForKey:@"isHidenAppRateAlert"];
}

-(void)saveLoginInfoWithUserName:(NSString*)username userId:(NSString*)userId accessToken:(NSString*)accessToken isHavePassWord:(BOOL)isHavePassWord dlFinger:(NSString*)dlfp dlToken:(NSString*)dltoken
{
  if([username isNotEmpty] && [userId isNotEmpty]&&[accessToken isNotEmpty])
  {
    [[NNAppLauchConf sharedInstance]saveUserFingerPrint:dlfp];
    [[NNAppLauchConf sharedInstance]saveUserToken:dltoken];
    [[NNAppLauchConf sharedInstance]setPhoneNumber:username];
    [[NNAppLauchConf sharedInstance]setUserId:userId];
    [[NNAppLauchConf sharedInstance]setAccessToken:accessToken];
    [[NNAppLauchConf sharedInstance]setIsHavePassWord:isHavePassWord];
  }
}
//删除自己搜索词信息数据
-(void)deleteMySearchKeysData
{
  [self deleteDocumentFile:@"searchKeys.plist"];
}
//保存自己搜索词信息
-(BOOL)saveMySearchKeys:(NSArray*)arr
{
  if(arr && [arr isKindOfClass:[NSArray class]])
  return [arr writeToPlistFile:@"searchKeys.plist"];
  return NO;
}
//获取自己搜索词信息
-(NSArray*)getMySearchKeys
{
  return [NSArray readFromPlistFile:@"searchKeys.plist"];
}
/**
 *  保存用户token
 *
 *  @param token token
 */
-(void)saveUserToken:(NSString*)token
{
  if([token isNotEmpty])
  {
    [[NSUserDefaults standardUserDefaults] setValue:token forKey:@"userToken"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
}
/**
 *  获取用户token
 *
 *  @return 用户token
 */
-(NSString*)getUserToken
{
  return [[NSUserDefaults standardUserDefaults]stringForKey:@"userToken"];
}

- (void)saveUserCheckVersionSucceed
{
  [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"userCheckVersion"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

- (BOOL)isUserCheckVersionSucceed
{
  return [[NSUserDefaults standardUserDefaults] boolForKey:@"userCheckVersion"];
}

/**
 *  保存用户dl_fingerprint
 *
 *  @param token dl_fingerprint
 */
-(void)saveUserFingerPrint:(NSString*)fingerprint
{
  if([fingerprint isNotEmpty])
  {
    [[NSUserDefaults standardUserDefaults] setValue:fingerprint forKey:@"userfingerprint"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
}
/**
 *  获取用户dl_fingerprint
 *
 *  @return 用户dl_fingerprint
 */
-(NSString*)getUserFingerPrint
{
  return [[NSUserDefaults standardUserDefaults]stringForKey:@"userfingerprint"];
}
/**
 *  删除 app启动广告数据
 */
-(void)deleteLaunchAdData
{
  [self deleteCacheFile:@"appLaunchAdData.plist"];
}
/**
 *  获取 app启动广告数据
 *
 *  @return app启动广告数据
 */
-(NSDictionary *)getLaunchAdData
{
  return [NSDictionary readFromCachePlistFile:@"appLaunchAdData.plist"];
}
/**
 *  保存 app启动广告数据
 *
 *  @param dic 广告数据，如果传nil，则是删除老数据
 *
 *  @return 保存是否成功
 */
-(BOOL)saveLaunchAdData:(NSDictionary *)dic
{
  if(dic && [dic isKindOfClass:[NSDictionary class]] && dic.count>0)
  {
    return [dic writeToCachePlistFile:@"appLaunchAdData.plist"];
  }
  else
  {
    [self deleteCacheFile:@"appLaunchAdData.plist"];
    return YES;
  }
  return NO;
}
/**
 *  保存 JS补丁数据
 *
 *  @param dic JS补丁数据
 *
 *  @return 保存是否成功
 */
-(BOOL)saveJSPatchData:(NSDictionary *)dic
{
  if(dic && [dic isKindOfClass:[NSDictionary class]] && dic.count>0)
  {
    return [dic writeToCachePlistFile:@"appJSPatchData.plist"];
  }
  else
  {
    [self deleteCacheFile:@"appJSPatchData.plist"];
    return YES;
  }
  return NO;
}
/**
 *  获取 JS补丁数据
 *
 *  @return JS补丁数据
 */
-(NSDictionary *)getJSPatchData
{
  return [NSDictionary readFromCachePlistFile:@"appJSPatchData.plist"];
}
/**
 *  删除达令帮首页缓存数据
 */
-(void)deleteCommunityCommendData
{
  [self deleteCacheFile:@"CommunityCommendData.plist"];
}
/**
 *  保存达令帮首页缓存数据
 *
 *  @param dic 达令帮首页缓存数据
 *
 *  @return 是否保存成功
 */
-(BOOL)saveCommunityCommendData:(NSDictionary *)dic
{
  if(dic && [dic isKindOfClass:[NSDictionary class]])
  return [dic writeToCachePlistFile:@"CommunityCommendData.plist"];
  return NO;
}
/**
 *  获取达令帮首页缓存数据
 *
 *  @return 达令帮首页缓存数据
 */
-(NSDictionary*)getCommunityCommendData
{
  return [NSDictionary readFromCachePlistFile:@"CommunityCommendData.plist"];
}
/**
 *  保存一个商品id 到浏览记录
 *
 *  @param goodsID 商品id
 */
-(void)saveBrowseHistoryWithGoodsId:(NSString*)goodsID
{
  goodsID = [NSString stringWithFormat:@"%@",goodsID];
  
  if([goodsID isNotEmpty])
  {
    NSMutableArray* marr = [[NSMutableArray alloc]initWithArray:[self getBrowseHistoryGoodsIDs]];
    //如果以前有数据，则匹配商品id 然后挪到最前面
    __block NSInteger index = -1;
    if(marr.count>0)
    {
      [marr enumerateObjectsUsingBlock:^(NSString* obj, NSUInteger idx, BOOL * _Nonnull stop) {
        obj = [NSString stringWithFormat:@"%@",obj];
        if([obj isEqualToString:goodsID])
        {
          index = idx;
          *stop = YES;
        }
      }];
    }
    //匹配到
    if(index>=0)
    {
      //如果匹配到是在第一位则不做任何处理
      if(index>=1)
      {
        [marr moveObjectFromIndex:index toIndex:0];
      }
    }
    else
    {
      //如果多于100条则 删除最老的一条
      if(marr.count>=100)
      {
        [marr removeLastObject];
      }
      [marr insertObject:goodsID atIndex:0];
    }
    [marr writeToPlistFile:@"browseHistoryGoodsIDs.plist"];
  }
}
/**
 *  删除浏览记录中的某一个商品id
 *
 *  @param goods_id 商品id
 */
-(void)deleteBrowseHistoryWithGoodsID:(NSString*)goods_id
{
  goods_id = [NSString stringWithFormat:@"%@",goods_id];
  
  if([goods_id isNotEmpty])
  {
    NSMutableArray* marr = [[NSMutableArray alloc]initWithArray:[self getBrowseHistoryGoodsIDs]];
    __block NSInteger index = -1;
    if(marr.count>0)
    {
      [marr enumerateObjectsUsingBlock:^(NSString* obj, NSUInteger idx, BOOL * _Nonnull stop) {
        obj = [NSString stringWithFormat:@"%@",obj];
        if([obj isEqualToString:goods_id])
        {
          index = idx;
          *stop = YES;
        }
      }];
    }
    //匹配到
    if(index>=0 && index<marr.count)
    {
      [marr removeObjectAtIndex:index];
      [marr writeToPlistFile:@"browseHistoryGoodsIDs.plist"];
    }
  }
}
/**
 *  获取浏览记录 ids
 *
 *  @return 浏览记录 ids
 */
-(NSArray*)getBrowseHistoryGoodsIDs
{
  return [NSArray readFromPlistFile:@"browseHistoryGoodsIDs.plist"];
}
/**
 *  删除 浏览记录所有商品 id
 */
-(void)deleteBrowseHistoryGoodsIDs
{
  [self deleteDocumentFile:@"browseHistoryGoodsIDs.plist"];
}
/**
 *  保存 非wifi网络 是否允许播放视频
 *
 *  @param isContinue 是否允许
 */
-(void)saveNoWifiContinuePlay:(BOOL)isContinue
{
  [[NSUserDefaults standardUserDefaults] setBool:isContinue forKey:@"noWifiContinuePlay"];
  [[NSUserDefaults standardUserDefaults] synchronize];
}
/**
 *  获取 非wifi网络 是否允许播放视频
 *
 *  @return 是否允许
 */
-(BOOL)getNoWifiContinuePlay
{
  if([[NSUserDefaults standardUserDefaults]objectForKey:@"noWifiContinuePlay"])
  {
    return [[NSUserDefaults standardUserDefaults]boolForKey:@"noWifiContinuePlay"];
  }
  else
  return NO;
}
/**
 *  删除App 自己缓存的文件
 */
-(void)deleteAppCacheFiles
{
  [self deleteFittingData];
  [self deleteMainPageActivityData];
  [self deleteCommunityCommendData];
  [self deleteLaunchAdData];
}
@end
