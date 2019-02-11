//
//  UIXNChatViewController.h
//  CustomerServerSDK2
//
//  Created by NTalker on 15/4/3.
//  Copyright (c) 2015年 NTalker. All rights reserved.
//


#import <UIKit/UIKit.h>

@class XNGoodsInfoModel,XNGoodsInfoView;

@protocol goodsInfoViewDelegate, XNGoodsCardDelegate, XNOrderCardDelegate, XNHeaderCardDelegate,XNClickTextCellDelegate,XNNavgationBarDelegate;

/*咨询聊窗类*/
@interface NTalkerChatViewController : UIViewController

@property(nonatomic, weak) id <goodsInfoViewDelegate> delegate;
@property(nonatomic, weak) id <XNGoodsCardDelegate> goodsCardDelegate;
@property(nonatomic, weak) id <XNOrderCardDelegate> orderCardDelegate;
@property(nonatomic, weak) id <XNHeaderCardDelegate> headerCardDelegate;
@property(nonatomic, weak) id <XNNavgationBarDelegate> navgationBarDelegate;
@property(nonatomic, weak) id <XNClickTextCellDelegate> clickTextCellDelegate;
/*客服配置id【必填】*/
@property (nonatomic, strong) NSString *settingid;
/*进入咨询界面的方式（YES:push方式  NO:present方式）*/
@property (nonatomic, assign) BOOL pushOrPresent;
/*客服ID*/
@property (nonatomic, strong) NSString *kefuId;
/*请求固定的客服(不建议使用)*/
@property (nonatomic, strong) NSString *kefuName;
/*用户ID*/
@property (nonatomic, strong) NSString *userId;
/*用户名称*/
@property (nonatomic, strong) NSString *userName;
/*商品信息模型*/
@property (nonatomic, strong) XNGoodsInfoModel *productInfo;
/*erp信息*/
@property (nonatomic, strong) NSString *erpParams;
/*咨询发起页标题*/
@property (nonatomic, strong) NSString *pageTitle;
/*咨询发起页URL*/
@property (nonatomic, strong) NSString *pageURLString;
/*请求客服的方式,0:组内客服,-1:组间客服,1:固定客服*/
@property (nonatomic, strong) NSString *isSingle;
/*集成类型*/
@property (nonatomic, assign) BOOL isSimpleIntegration;
/*将自定义文本类消息（比如订单信息）加入发送队列*/
+(void)sendExtendTextMessage:(NSString*)extendString;

#pragma mark ---导航栏设置----
/*!
 导航标题设置
 */
/*请求到客服前的默认导航栏标题显示内容，默认显示：”在线客服“ 比如商铺咨询入口想显示商铺名称*/
@property(nonatomic, strong) NSString * defaultTitle;
/*请求到客服后是否刷新导航标题显示内容：YES：会更新成客服名称  NO：保持显示默认标题不变  默认为YES*/
@property(nonatomic, assign) BOOL isRefrashTitle;
/*标题字体大小 ,默认18.0*/
@property(nonatomic, assign) CGFloat  titleFontSize;
/*标题字体颜色 ,默认blackColor*/
@property(nonatomic, strong) UIColor *titleColor;
/*返回按钮是否隐藏，默认NO，显示*/
@property(nonatomic, assign) BOOL isBackButtonHiden;
/*叉号按钮是否隐藏，默认NO，显示*/
@property(nonatomic, assign) BOOL isCancelButtonHiden;
/*返回按钮执行叉号按钮的方法，默认NO，执行默认返回方法 (常用于去掉叉号按钮，并将叉号方法合并到返回按钮的情形)*/
@property(nonatomic, assign) BOOL isBackBtnFollowCancelChatAction;
/*默认返回按钮方法*/
- (void)chatEnterBackground;
/*默认叉号按钮方法*/
- (void)cancelChat;

#pragma mark ---工具栏设置栏设置----
/*
 *设置是否有语音按钮 (YES：有  NO：没有，默认YES)，可选
 */
@property(nonatomic, assign) BOOL isHaveVoice;

#pragma mark ---聊天界面设置----
/*
 *设置聊天界面背景色 (默认色值：f3f3f7)，可选
 */
@property(nonatomic,  strong) UIColor * chatBackgroundColor;
/*
 *设置输入工具条背景色 (默认色值：f3f3f7)，可选
 */
@property(nonatomic,  strong) UIColor * inputViewBackgroundColor;
/*
 *设置表情键盘背景色 (默认色值：f3f3f7)，可选
 */
@property(nonatomic,  strong) UIColor * emojiViewBackgroundColor;
/*
 *设置功能view背景色 (默认色值：f3f3f7)，可选
 */
@property(nonatomic,  strong) UIColor * functionViewBackgroundColor;

@end

#pragma mark ---自定义商品头图View----

@protocol goodsInfoViewDelegate <NSObject>
@optional
/**
 设置商品头图View （可选用）
 
 @param goodsInfo    商品相关模型数据
 @param oldGoodsView 默认商品View
 
 @return 新修改后的商品头图View
 */
-(UIView*)setNewGoodsViewWithGoodsInfo:(XNGoodsInfoModel*)goodsInfo  andOldGoodsView:(XNGoodsInfoView*)oldGoodsView;
/**
 自定义商品链接跳转 （可选用）
 
 @param link 消息中的链接
 @param chatViewController 聊天界面
 */

- (void)setGoodsViewJumpActionByLink:(NSString *)link andChatViewController:(NTalkerChatViewController *)chatViewController;
/**
 设置聊窗导航栏 （可选用）
 
 @param superNavigationBar 聊窗默认导航
 @param chatViewcontroller 会话界面控制器
 @return           自定义按钮数组
 */
-(NSMutableArray *)setNavationBar:(UINavigationBar *)superNavigationBar withChatViewContrller:(NTalkerChatViewController *)chatViewcontroller;

@end

#pragma mark ---自定义导航上的相关内容----
@protocol XNNavgationBarDelegate <NSObject>
@optional
/**
 在返回按钮上增加自定义事件方法
 @param chatViewController 聊天控制器 （可选用）
*/
-(void)setGoBackItemAction:(NTalkerChatViewController *)chatViewController;
/**
 在关闭按钮（右侧）上增加自定义事件方法
 @param chatViewController 聊天控制器 （可选用）
 */
-(void)setCloseChatItemAction:(NTalkerChatViewController *)chatViewController;
@end

#pragma mark ---自定义商品消息卡片展示样式----

@protocol XNGoodsCardDelegate <NSObject>
@optional
/**
 设置消息中商品卡片显示 （可选用）
 
 @param messageStr 卡片展示数据
 @param goodsCardView 默认商品卡片
 @return 自定义商品卡片View
 */

- (UIView *)setGoodsCardViewWithMessageString:(NSString *)messageStr GoodsCardView:(UIView *)goodsCardView;

@end

#pragma mark ---自定义订单消息卡片展示样式----

@protocol XNOrderCardDelegate <NSObject>
@optional
/**
 设置消息中订单卡片显示（可选用）
 
 @param messageStr 卡片展示数据
 @param orderCardView 默认订单卡片
 @return 自定义订单卡片View
 */

- (UIView *)setOrderCardViewWithMessageString:(NSString *)messageStr OrderCardView:(UIView *)orderCardView;

@end

#pragma mark ---自定义订单消息卡片展示样式----

@protocol XNHeaderCardDelegate <NSObject>
/**
 设置消息中头图卡片显示 （可选用）
 
 @param messageStr 卡片展示数据
 @param headerCardView 默认头图卡片
 @return 自定义头图卡片View
 */
@optional
- (UIView *)setHeaderCardViewWithMessageString:(NSString *)messageStr HeaderCradView:(UIView *)headerCardView;

@end

#pragma mark ---自定义点击文本消息内容的事件----

@protocol XNClickTextCellDelegate <NSObject>
/**
 自定义消息链接跳转 （可选用）
 
 @param link 消息中的链接
 @param chatViewController 聊天界面
*/
@optional
- (void)setJumpActionByLink:(NSString *)link andChatViewController:(NTalkerChatViewController *)chatViewController;

@end

