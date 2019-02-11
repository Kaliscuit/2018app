//
//  NNAppLauchConf.h
//  YMall
//
//  Created by zhangyintao on 13-4-16.
//  Copyright (c) 2013年. All rights reserved.
//

#import <Foundation/Foundation.h>

//定义各种公共key

//未登录状态 用户收货地址 手机号
#define AppConfigKeyAddressUserPhone         @"AppConfigKeyAddressUserPhone"
//未登录状态 用户收货地址 姓名
#define AppConfigKeyAddressUserName          @"AppConfigKeyAddressUserName"
//未登录状态 用户收货地址 地区
#define AppConfigKeyAddressUserArea          @"AppConfigKeyAddressUserArea"
//未登录状态 用户收货地址 地址
#define AppConfigKeyAddressUserAddress       @"AppConfigKeyAddressUserAddress"
//未登录状态 用户收货地址 购买人手机号
#define AppConfigKeyAddressUserBuyerPhone    @"AppConfigKeyAddressUserBuyerPhone"
//未登录状态 用户收货地址 购买人身份证号
#define AppConfigKeyAddressUserIDCard    @"AppConfigKeyAddressUserIDCard"


@interface NNAppLauchConf : NSObject

+ (id)sharedInstance;

//2.0版本增加

//登录成功后的token
@property(nonatomic,retain,getter = getAccessToken) NSString* accessToken;
//登录成功后的userID
@property(nonatomic,retain,getter = getUserID) NSString* userId;
//上次登录的手机号码
@property(nonatomic,retain,getter = getPhoneNumber) NSString* phoneNumber;

//@property (nonatomic,assign,getter= getUserPassWord) NSString* userPassWord;
//是否有密码
@property (nonatomic,assign,getter= isUserHavePassWord) BOOL isHavePassWord;

@property (nonatomic,assign) BOOL isFavListNeedRefresh;//标志收藏页面是否需要刷新

//method

//蒙版相关配置

//单品页面点击查看大图 提示
-(NSInteger)getUserGuidClickLookBigPic;
//设置单品页面点击查看大图 提示 times为显示了 增加次数。如果用户误操作 显示5次后 不再显示
-(void)setUserGuidClickLookBigPicAdd:(int)times;
//大图浏览模式左右滑动 提示
-(NSInteger)getUserGuidSwipeBigPic;
//设置大图浏览模式左右滑动 提示  times为显示了 增加次数。如果用户误操作 显示5次后 不再显示
-(void)setUserGuidSwipeBigPicAdd:(int)times;


//是否显示过用户引导界面
-(BOOL)isShowedUserGuide;
//设置是否显示过用户引导界面
-(void)setIsShowedUserGuide:(BOOL)isShowed;

//是否处于登录状态
-(BOOL)isLogInStatus;
//推出登录
-(void)exitLogIn;
//获取UDID
-(NSString*)getUDID;
//设置UDID
-(void)setUDID:(NSString*)udid;
//获取是否为第一次运行app
-(BOOL)getIsFirstRun;
//设置是否为第一次运行app
-(void)setIsFirstRun:(BOOL)isFirst;
//服务器最新版本 记录到本地
-(void)setLastVersion:(NSString*)lastVersion;
//获取最新版本
-(NSString*)getLastVersion;
//设置上次版本提示的时间
-(void)setLastPromptDate;
//获取上次版本提示的时间
-(NSDate*)getLastPromptDate;
//上传通讯录
-(void)uploadContactBook;
//设置pushtoken
-(void)setDeviceToken:(NSString*)pushtoken;
//获取pushtoken
-(NSString*)getDeviceToken;

//是否显示开机大图秀,如果开关为关闭或者下载成功的图片为0个 则不显示
-(BOOL)isShowStartPic;
//保存开机大图秀的数据
-(BOOL)saveStartPicData:(NSDictionary*)dic;
//获取开机大图秀的数据
-(NSDictionary*)getStartPicData;
//下载大图秀图片
-(void)downloadStartPic;
//保存公司相关信息
-(BOOL)saveCompanyInfo:(NSDictionary*)dic;
//获取公司相关信息
-(NSDictionary*)getCompanyInfo;
//保存支付宝账户支付相关信息
-(BOOL)saveAlipayCountInfo:(NSDictionary*)dic;
//获取支付宝账户支付相关信息
-(NSDictionary*)getAlipayCountInfo;
//保存财付通支持的 信用卡  银行列表相关信息
-(BOOL)saveCaiFuTongCreditBanksInfo:(NSArray*)arr;
//获取财付通支持的 信用卡  银行列表相关信息
-(NSArray*)getCaiFuTongCreditBanksInfoInfo;
//保存财付通支持的 储蓄卡  银行列表相关信息
-(BOOL)saveCaiFuTongDebitBanksInfo:(NSArray*)arr;
//获取财付通支持的 储蓄卡  银行列表相关信息
-(NSArray*)getCaiFuTongDebitBanksInfoInfo;
//保存更多分类信息
-(BOOL)saveMoreCategoryInfo:(NSArray*)arr;
//获取更多分类信息
-(NSArray*)getMoreCategoryInfo;
//设置bar最后一次的更新时间
-(void)setBarLastUpdateTime:(NSString*)time;
//获取bar最后一次的更新时间
-(NSString*)getBarLastUpdateTime;
//记录用户保存的商品列表样式，大图or小图 模式
-(void)setGoodsListListStyle:(BOOL)isListStyle;
//获取用户保存的商品列表样式，大图or小图 模式 yes为大图
-(BOOL)getGoodsListListStyle;
//获取分享平台列表
-(NSArray*)getSharePlatList;
//保存未登录状态 用户的默认地址
-(BOOL)saveUnLoginUserAddress:(NSString*)Name Phone:(NSString*)phone Area:(NSString*)area Address:(NSString*)address BuyerPhone:(NSString*)buyerPhone IDCard:(NSString *)idCard;
//获取未登录状态 用户的默认地址
-(NSDictionary*)getUnLoginUserAddress;
//保存分类菜单信息
-(void)SaveCategoryData:(NSArray*)arrayData;
//获取分类菜单信息
-(NSArray*)GetCategoryData;

//设置上次支付选择的支付类型
-(void)setLastPaymentUkey:(NSString*)payUkey;
//获取上次支付选择的类型
-(NSString*)getLastPaymentUkey;

//设置紧急通知的id和上次提醒时间
-(void)setLastEmergencyMsg:(NSString*)msgId showDate:(NSDate*)date;
//获取上次紧急通知的id和上次提醒时间
-(NSDictionary*)getLastEmergencyMsg;
//保存用户个人资料
-(BOOL)saveUserInfos:(NSDictionary*)infos;
//获取用户个人资料
-(NSDictionary*)getUserInfos;
//保存省市区信息
-(BOOL)SaveAddressData:(NSArray*)arrayData;
//获取省市区信息
-(NSArray*)GetAddressData;
//设置本地最新地址省市区数据版本号
-(void)setLastAddressDataVersion:(NSInteger)version;
//获取本地最新地址省市区数据版本号
-(NSInteger)getLastAddressDataVersion;
//获取已经点击过的商品列表banner的id
-(NSMutableDictionary *)getGoodListBannerClikedID;
//设置已经点击过的商品列表banner的id
-(void)setGoodListBannerClikedID:(NSMutableDictionary *)dic;
//app启动次数 +1
-(void)addAppStartCount;
//获取自从安装之后app启动次数
-(NSInteger)getAppStartCount;
//设置是否隐藏 app 评分提醒
-(void)setIsHidenAppRateAlert:(BOOL)isHiden;
//获取是否隐藏 app 评分提醒
-(BOOL)getIsHidenAppRateAlert;
//获取app升级url
-(NSURL*)getAppUpdateUrl;
//获取首页fitting数据
-(NSMutableDictionary *)getFittingData;
//设置首页fitting数据
-(BOOL)setFittingData:(NSMutableDictionary *)dic;
//获取首页广告
-(NSMutableDictionary *)getMainPageActivity;
//设置首页广告
-(BOOL)setMainPageActivity:(NSMutableDictionary *)dic;
/**
 *  保存登录状态信息
 *
 *  @param username       手机号
 *  @param userId         用户id
 *  @param accessToken    accessToken
 *  @param isHavePassWord 是否有密码
 *  @param dlfp dl fingerPrint
 *  @param dltoken dl token
 */
-(void)saveLoginInfoWithUserName:(NSString*)username userId:(NSString*)userId accessToken:(NSString*)accessToken isHavePassWord:(BOOL)isHavePassWord dlFinger:(NSString*)dlfp dlToken:(NSString*)dltoken;

//保存自己搜索词信息
-(BOOL)saveMySearchKeys:(NSArray*)arr;
//获取自己搜索词信息
-(NSArray*)getMySearchKeys;
/**
 *  保存用户dl token
 *
 *  @param token dl token
 */
-(void)saveUserToken:(NSString*)token;
/**
 *  获取用户dl token
 *
 *  @return 用户dl token
 */
-(NSString*)getUserToken;

/**
 *  保存用户checkversion成功的信息
 *
 */
- (void)saveUserCheckVersionSucceed;

/**
 *  获取用户是否checkversion成功！
 *
 */
- (BOOL)isUserCheckVersionSucceed;

/**
 *  保存用户dl_fingerprint
 *
 *  @param token dl_fingerprint
 */
-(void)saveUserFingerPrint:(NSString*)fingerprint;
/**
 *  获取用户dl_fingerprint
 *
 *  @return 用户dl_fingerprint
 */
-(NSString*)getUserFingerPrint;
/**
 *  获取 app启动广告数据
 *
 *  @return app启动广告数据
 */
-(NSDictionary *)getLaunchAdData;
/**
 *  保存 app启动广告数据
 *
 *  @param dic 广告数据，如果传nil，则是删除老数据
 *
 *  @return 保存是否成功
 */
-(BOOL)saveLaunchAdData:(NSDictionary *)dic;
/**
 *  保存 JS补丁数据
 *
 *  @param dic JS补丁数据
 *
 *  @return 保存是否成功
 */
-(BOOL)saveJSPatchData:(NSDictionary *)dic;
/**
 *  获取 JS补丁数据
 *
 *  @return JS补丁数据
 */
-(NSDictionary *)getJSPatchData;
/**
 *  保存达令帮首页缓存数据
 *
 *  @param dic 达令帮首页缓存数据
 *
 *  @return 是否保存成功
 */
-(BOOL)saveCommunityCommendData:(NSDictionary *)dic;
/**
 *  获取达令帮首页缓存数据
 *
 *  @return 达令帮首页缓存数据
 */
-(NSDictionary*)getCommunityCommendData;
/**
 *  保存一个商品id 到浏览记录，最多保存100条
 *
 *  @param goodsID 商品id
 */
-(void)saveBrowseHistoryWithGoodsId:(NSString*)goodsID;
/**
 *  删除浏览记录中的某一个商品id
 *
 *  @param goods_id 商品id
 */
-(void)deleteBrowseHistoryWithGoodsID:(NSString*)goods_id;
/**
 *  获取浏览记录 ids
 *
 *  @return 浏览记录 ids
 */
-(NSArray*)getBrowseHistoryGoodsIDs;
/**
 *  删除 浏览记录所有商品 id
 */
-(void)deleteBrowseHistoryGoodsIDs;
/**
 *  保存 非wifi网络 是否允许播放视频
 *
 *  @param isContinue 是否允许
 */
-(void)saveNoWifiContinuePlay:(BOOL)isContinue;
/**
 *  获取 非wifi网络 是否允许播放视频
 *
 *  @return 是否允许
 */
-(BOOL)getNoWifiContinuePlay;
/**
 *  删除App 自己缓存的文件
 */
-(void)deleteAppCacheFiles;
@end
