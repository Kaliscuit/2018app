//
//  Constants.h
//  EMSApple
//
//  Created by zhangyintao on 13-5-28.
//  Copyright 2013年 zhangyintao. All rights reserved.
//

//keychain 钥匙串相关key -------不能变--------
#define KeyChain_Access_Group_Name          @"V26EY9ZA87.com.yoka.663"
#define KeyChain_Server_Name                @"GiftShop"
#define KeyChain_Key_ClientID               @"keyChain_ClientID"

//苹果支付 商户id -------不能变--------
#define kAppleMechantID         @"merchant.com.daling.unionPay"

//设备平台
#define AppPlatform        @"iphone"
#define AppName            @"com.daling.daling" //与andriod统一，达令app 标识com.daling.daling

//app 版本号
#define AppVersion         @"1.1.1"
//真机计算出的包内bundlemd5有变化，可能是压缩了，所以这里写死初始化的md5
#define projectBundleMd5 (@"13b2bcaba812600af5465c8c649f34d3")

//渠道号
#define AppChannelID       @"App Store"   //@"App Store",@"91",@"tongbutui" @"xyzhushou" @"aisizhushou" @"shuXiongWifi"
//#define AppChannelID         @"91"
//#define AppChannelID       @"tongbutui"
//#define AppChannelID       @"PP"
//#define AppChannelID       @"kuaiyong"
//#define AppChannelID       @"PUSH0311"

//银联支付环境，测试环境0，正式环境1      上线前一定切换到正式环境 1 ---------  紧急 ----------
#define UnionPayMode       1

//是否上传DeviceToken  上线前一定要切换到 1          ---------  紧急 ----------
#define IsNeedUploadDeviceToken 1

//是否打开友盟统计    上线前一定要切换到 1            ---------  紧急 ----------
#define IsOpenUmeng 1

//yoka接口服务器调试开关,上线版不要打开debug          ---------  紧急 ----------
#ifndef SERVER_INTERFACE_DEBUG
#define SERVER_INTERFACE_DEBUG 0
#endif

#if SERVER_INTERFACE_DEBUG

//测试

#define API_BASE_URL                       @"http://m.ymall.com/api/"
#define API_BASE_URL_JAVA                 @"http://zin.daling.com/dal_zin/"
//#define ALIPAY_NOTIFY_URL   @"http://m.ymall.com/api/paycenter/alipay?type=appalipay"
#define API_BASE_URL_SHARE                @"http://m.ymall.com/"
#define API_BASE_URL_USER_CENTER          @"http://passport.corp.daling.com/api/"
#define API_BASE_URL_WALLET               @"http://m.ymall.com/dal_wallet/"

#define UserCenter_SecretKey              @"lc@Q#HN_LvI_C4mkaABW95N%397d31vT6ZaLBh0AtfpV7V8sF6uIRLteOJIckz$"

#else               //正式地址    。。。记得修改。记得修改！！！！！！！！！！！！！！！！！！！！！！！！

//正式
#define API_BASE_URL                      @"https://api.daling.com/api/"
#define API_BASE_URL_JAVA                 @"https://zin.daling.com/dal_zin/"
//#define ALIPAY_NOTIFY_URL   @"http://m.ymall.com/api/paycenter/alipay?type=appalipay"
#define API_BASE_URL_SHARE                @"http://m.ymall.com/"
#define API_BASE_URL_USER_CENTER          @"https://passport.daling.com/api/"
#define API_BASE_URL_WALLET               @"https://api.daling.com/dal_wallet/"

#define UserCenter_SecretKey              @"lc@Q#HN_LvI_C4mkaABW95N%397d31vT6ZaLBh0AtfpV7V8sF6uIRLteOJIckz$"

#endif

//页面中用户引导提示次数
#define UserGuideTimes      3

//支付
#define SCHEME_FOR_ALIPAY   @"dalingjia.alipay"
//支付宝授权
//#define SCHEME_FOR_AUTH_ALIPAY   @"auth.dalingjia.alipay"

// 本程序 礼物店 itunes下载地址
#define kItunesURL_giftShop             @"https://itunes.apple.com/cn/app/id638143733?mt=8"
// 本程序 礼物店 appstore appID
#define kAppStoreAppID          638143733

//微信
#define kWeiXinAppID              @"wxbdb479c37530ef49"// //new wxc386d0f4097030cf
#define kWeixinSecrat             @"362322440aba655c0daf88f621c5aadb"

//share sdk key
#define ShareSdkKey               @"ff2df86a84"
//新浪微博
#define kXinLangAppKey                      @"781625557"
#define kXinLangAppSecret                   @"da49110301f6a893b518aaaa44a6d1cd"
#define kXinLangAppRedirectURI              @"http://www.ymall.com"
#define kXinLangAppCancelRedirect           @"http://www.ymall.com/cancle"  //暂时没用

//人人网 appkey
//#define kRenrenAppId                        @"243270"                       //暂时没用
//#define kRenrenAppKey                       @"5e36dfff18354a27bc616af9632a6b10"
//#define kRenrenAppSecret                    @"590626bf55d946068f2e6979a5f18999"


//QQ  修改此id 需要同步修改plist中的 url scheme
#define kQQAppId                            @"1101190044"
#define kQQAppkey                           @"yRLQF0jyL5zeF34q"

//腾讯微博 礼物店（官方版）修改此id 需要同步修改plist中的 url scheme
#define kQQWeiboAppkey                       @"801438852"
#define kQQWeiboAppSecret                    @"294e3a172b787a1bd83c015203e82b52"
#define kQQWeiboRedirectUri                  @"http://m.ymall.com"

//友盟
#define UMENG_APPKEY                        @"516fc339527015a6d9000012"
#define UMENG_ITUNESCONNECT                 @"UMENG_ITUNESCONNECT"

//莲子数据统计
#define LotuSeedAppKey                      @"j0mHIr7J5qwbLcybu4J1"

//talking data AdTracking appid
#define TalkingDataAdTrackingAppID                    @"f238c248bf9d414486359481d9dbe1e5"

//talking data App Analytics appid
#define TalkingDataAppAnalyticsAppID                    @"E6CF899975DC7C793D08917A6E2A1D7B"

//翼支付 scheme
#define SCHEME_FOR_YiPay   @"ymall.yipay"
