//
//  XNGoodsInfoView.h
//  XNChatCore
//
//  Created by Ntalker on 15/10/26.
//  Copyright © 2015年 Kevin. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol XNJumpProductDelegate <NSObject>

- (void)jumpByProductURL;

- (void)productInfoShowFailed;

- (void)productInfoSuccess:(UIColor*)backgroundClor;

@end

@class XNGoodsInfoModel;

@interface XNGoodsInfoView : UIView
//头图背景色
@property(nonatomic,strong)UIColor *goodsViewBackgroundColor;
//图片设置
@property(nonatomic,assign)CGRect goodsImageFrame;
//标题设置
@property(nonatomic,assign)CGRect titleFrame;
@property(nonatomic,assign)NSInteger titleLine;
@property(nonatomic,assign)CGFloat titleTextFont;
@property(nonatomic,strong)UIColor *titleTextColor;
//价格设置
@property(nonatomic,assign)CGRect priceFrame;
@property(nonatomic,assign)NSInteger priceLine;
@property(nonatomic,assign)CGFloat priceTextFont;
@property(nonatomic,strong)UIColor *priceTextColor;

- (instancetype)initWithFrame:(CGRect)frame andGoodsInfoModel:(XNGoodsInfoModel *)goodsInfo andDelegate:(id<XNJumpProductDelegate>)delegate;
- (void)congfigureGoodsView:(XNGoodsInfoModel *)goodsModel;
//点击商品View回调方法（重写该方法可以实现自定义点击操作）
-(void)clickGoodsView;

@end
