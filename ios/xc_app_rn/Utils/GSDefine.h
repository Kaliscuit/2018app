//
//  GSDefine.h
//  GiftShop
//
//  Created by yt on 15/8/13.
//  Copyright (c) 2015年 zhang yintao. All rights reserved.
//

#ifndef GiftShop_GSDefine_h
#define GiftShop_GSDefine_h

typedef enum{
    NNTencentWeixinType = 0,
    NNTencentWeiboType,
    NNSinaWeiboType
}NNSNSType;

//礼物店  订单状态
enum YmallOrderStatus
{
    Order_UnPay = 10,           //待付款
    Order_Payed = 11,           //待发货
    Order_Shipping = 12,        //已发货
    Order_Received = 13,        //已收货
    Order_Finished = 14,        //已完成
    Order_Close = 100           //关闭订单
};

//退货单 状态
enum YmallOrderRefundStatus
{
    Refund_Other = 0,           //0: 不退不换
    Refund_Appeal = 1,          //1 ：申诉
    Refund_ApplyReufnd = 2,     //2：申请退货
    Refund_SenderGoods = 4,     //4：寄回商品
    Refund_WaittingRefund = 8,  //8：等待退款
    Refund_ApplyCanceled = 10,  //取消退货
    Refund_RefundFinish = 16    //16：退款成功/失败
};

//------------------payment ukey 区分哪种支付方式（唯一）---------------

/**
 *  财付通
 */
#define PaymentUkey_tenpay   @"tenpay"
/**
 *  财付通 信用卡支付
 */
#define PaymentUkey_tenpay_credit   @"tenpay_credit"
/**
 *  财付通 储蓄卡支付
 */
#define PaymentUkey_tenpay_debit   @"tenpay_debit"
/**
 *  支付宝
 */
#define PaymentUkey_appalipay   @"appalipay"
/**
 *  支付宝 国际支付
 */
#define PaymentUkey_appalipayInternational   @"appalipay_international"
/**
 *  微信支付
 */
#define PaymentUkey_wxpay   @"wxpay"
/**
 *  货到付款（现金）
 */
#define PaymentUkey_cod_money   @"cod_money"
/**
 *  货到付款（刷卡）
 */
#define PaymentUkey_cod_pos   @"cod_pos"
/**
 *  农行直连
 */
#define PaymentUkey_abcpay   @"abcpay"
/**
 *  招行支付
 */
#define PaymentUkey_cmbpay   @"cmbpay"
/**
 *  苹果支付
 */
#define PaymentUkey_applePay   @"applepay"
/**
 *  翼支付
 **/
#define PaymentUkey_yiPay @"yipay"
/**
 *  苏宁金融支付
 **/
#define PaymentUkey_yfbPay @"yfbpay"
//------------------payment code 支付方式---------------





#define LAUNCH_FLAG                         @"launchFlag"
#define OPENUDID                            @"openUDID"
#define RESET_TIME                          @"reset_time"
#define KEY_COUNT                           @"key_count"
#define PROMPT                              @"prompt"
#define KeyImageViewInfo                    @"imageViewInfo"
#define KeyImageViewScr                     @"KeyImageViewScr"


//通知 Notification

//用户登录或退出
#define NOTIFY_USERLOGINANDLOGOUT                   @"NOTIFY_USERLOGINANDLOGOUT"
//社区 主题收藏或取消收藏
#define Notify_Community_SubjectFav                 @"Notify_Community_SubjectFav"
//社区 主题增加评论
#define Notify_Community_SubjectAddComment          @"Notify_Community_SubjectAddComment"
//社区 主题删除评论
#define Notify_Community_SubjectDeleteComment       @"Notify_Community_SubjectDeleteComment"
//社区 删除主题
#define Notify_Community_DeleteSubject              @"Notify_Community_DeleteSubject"
//社区 关注用户
#define Notify_Community_ConcernUser                @"Notify_Community_ConcernUser"

//支付状态通知，用于web页面支付
#define Notify_WebPage_Paystatus                @"Notify_WebPage_Paystatus"


#ifndef XCAppDelegate
#define XCAppDelegate ((AppDelegate*)([UIApplication sharedApplication].delegate))
#endif

//定义weak self
#define WS(weakSelf)  __weak __typeof(&*self)weakSelf = self;

//判断系统是否为7.0以后
#ifndef IOS7_OR_LATER
#define IOS7_OR_LATER	( [[[UIDevice currentDevice] systemVersion] compare:@"7.0" options:NSNumericSearch] != NSOrderedAscending )
#endif
#ifndef IOS8_OR_LATER
#define IOS8_OR_LATER	( [[[UIDevice currentDevice] systemVersion] compare:@"8.0" options:NSNumericSearch] != NSOrderedAscending )
#endif

#ifndef ScreenWidth
#define ScreenWidth   ([[UIScreen mainScreen] bounds].size.width)
#endif

#ifndef ScreenHeight
#define ScreenHeight ([[UIScreen mainScreen] bounds].size.height)
#endif


#ifndef IS_IPHONE
#define IS_IPHONE ( [ [ [ UIDevice currentDevice ] model ] isEqualToString: @"iPhone" ] )
#endif

#ifndef IS_IPOD
#define IS_IPOD   ( [ [ [ UIDevice currentDevice ] model ] isEqualToString: @"iPod touch" ] )
#endif

#ifndef IS_WIDESCREEN
#define IS_WIDESCREEN ( fabs( ( double )[ [ UIScreen mainScreen ] bounds ].size.height - ( double )568 ) < DBL_EPSILON )
#endif

#ifndef IS_IPHONE_5
#define IS_IPHONE_5 ( IS_IPHONE && IS_WIDESCREEN )
#endif

#ifndef IS_IPAD
#define IS_IPAD ( [ [ [ UIDevice currentDevice ] model ] isEqualToString: @"iPad" ] ||  [ [ [ UIDevice currentDevice ] model ] isEqualToString: @"iPad Simulator" ])
#endif

//用户是否打开了push
#ifndef IS_ALLOWED_NOTIFYCATION
#define IS_ALLOWED_NOTIFYCATION (IOS8_OR_LATER && ([[UIApplication sharedApplication]currentUserNotificationSettings].types!=UIUserNotificationTypeNone))
#endif

#ifdef DEBUG
#   define NNLog(fmt, ...) NSLog((@"%s [Line %d] " fmt), __PRETTY_FUNCTION__, __LINE__, ##__VA_ARGS__);
#   define NNError(fmt, ...) NSLog((@"%s [Line %d] " fmt), __PRETTY_FUNCTION__, __LINE__, ##__VA_ARGS__);
#   define NNDebug(fmt, ...) NSLog((@"%s [Line %d] " fmt), __PRETTY_FUNCTION__, __LINE__, ##__VA_ARGS__);
#   define NNCont(fmt, ...) NSLog((@"%s" fmt), __PRETTY_FUNCTION__, ##__VA_ARGS__);

#else
#   define NNLog(...)
#   define NNError(...)
#   define NNDebug(...)
#   define NNCont(...)
#endif

#define RATIO_SCREEN_WIDTH (ScreenWidth/320.f)

#define GETSTRING(x) (x&&[x isKindOfClass:[NSString class]]?x:@"")

#endif
