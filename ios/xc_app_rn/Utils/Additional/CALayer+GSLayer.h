//
//  CALayer+GSLayer.h
//  GiftShop
//
//  Created by zhang yintao on 14-3-29.
//  Copyright (c) 2014年 zhang yintao. All rights reserved.
//

#import <QuartzCore/QuartzCore.h>

@interface CALayer (GSLayer)
/*!
 *  设置边框
 *
 *  @param borderColor 边框颜色
 *  @param width       边框宽度
 */
-(void)setborderWithBorderColor:(UIColor*)borderColor borderWidth:(float)width;
/*!
 *  设置固定样式边框
 */
-(void)setGSBoreder;
/*!
 *  设置固定样式阴影
 */
- (void)setGSShadow;
/*!
 *  设置固定样式圆角
 */
-(void)setGSCornerRadius;
/*!
 *  设置小的圆角
 */
-(void)setGSSmallCornerRadius;
/*!
 *  设置固定样式 边框，圆角，阴影
 */
-(void)setGSTypeLayer;
/*!
 *  设置整圆layer
 */
-(void)setCircleLayer;
/**
 *  设置一像素的 边框宽度
 */
-(void)setOnePixelBorderWidth;
@end
