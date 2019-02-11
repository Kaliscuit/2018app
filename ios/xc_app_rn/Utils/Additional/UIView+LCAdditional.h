//
//  UIView+Additional.h
//  FlyintheSky
//
//  Created by zhangyintao on 12-11-16.
//  Copyright (c) 2012年 zhangyintao. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>

@interface UIView (LCAdditional)
@property (nonatomic,strong) UIImage *backgroundImage;
/*!
 *  设置frame的，origin x
 *
 *  @param x x坐标
 */
-(void)setViewOriginX:(CGFloat)x;
/*!
 *  设置frame的，origin y
 *
 *  @param x y坐标
 */
-(void)setViewOriginY:(CGFloat)y;
/*!
 *  设置frame的宽度，frame其他不变
 *
 *  @param width frame宽度
 */
-(void)setViewWidth:(CGFloat)width;
/*!
 *  设置frame的高度，frame其他不变
 *
 *  @param height frame高度
 */
-(void)setViewHeight:(CGFloat)height;
/*!
 *  设置坐标X偏移 坐标Y偏移
 *
 *  @param x x偏移量
 *  @param y y偏移量
 */
-(void)setViewMove:(CGFloat)x Y:(CGFloat)y;
/*!
 *  设置Center x
 *
 *  @param x x坐标
 */
-(void)setCenterX:(CGFloat)x;
/*!
 *  设置Center y
 *
 *  @param y y坐标
 */
-(void)setCenterY:(CGFloat)y;
/*!
 *  设置centerX偏移 坐标Y偏移
 *
 *  @param x x偏移量
 *  @param y y偏移量
 */
-(void)setCenterMove:(CGFloat)x Y:(CGFloat)y;
/*!
 *  查找UIview 所属的 UIViewController
 *
 *  @return UIViewController
 */
- (UIViewController *)viewController;

//指定大小的圆角处理
- (void)cornerRadius:(CGFloat)radius;

//指定大小圆角，且带border
- (void)cornerRadius:(CGFloat)radius borderColor:(UIColor*)borderColor borderWidth:(CGFloat)borderWidth;

//添加border
- (void)borderWithColor:(UIColor*)borderColor borderWidth:(CGFloat)borderWidth;

// 对UIView的四个角进行选择性的圆角处理
- (void)makeRoundedCorner:(UIRectCorner)byRoundingCorners cornerRadii:(CGSize)cornerRadii;
@end
