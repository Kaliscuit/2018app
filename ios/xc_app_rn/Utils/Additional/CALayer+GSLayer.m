//
//  CALayer+GSLayer.m
//  GiftShop
//
//  Created by zhang yintao on 14-3-29.
//  Copyright (c) 2014年 zhang yintao. All rights reserved.
//

#import "CALayer+GSLayer.h"

@implementation CALayer (GSLayer)
-(void)setborderWithBorderColor:(UIColor*)borderColor borderWidth:(float)width
{
    self.borderColor = borderColor.CGColor;
    self.borderWidth = width;
}
//设置固定样式边框
-(void)setGSBoreder
{
    //[self setborderWithBorderColor:[UIColor colorWithHexString:GSColorViewBorder] borderWidth:0.5];
}
- (void)setGSShadow{
    
    self.shadowOpacity = 0.8f;
    self.shadowOffset = CGSizeMake(0.0f, 1.0f);
    self.shadowRadius = 1.0f;
//    self.shadowPath = [UIBezierPath bezierPathWithRoundedRect:self.bounds cornerRadius:self.cornerRadius].CGPath;
    //self.shadowColor = [UIColor colorWithHexString:GSColorViewBorder].CGColor;
    
}
//设置小的圆角
-(void)setGSSmallCornerRadius
{
    self.cornerRadius = 3;
}
-(void)setGSCornerRadius
{
    self.cornerRadius = 3;
}
////设置固定样式 边框，圆角，阴影
-(void)setGSTypeLayer
{
    [self setGSBoreder];
    [self setGSCornerRadius];
    [self setGSShadow];
}
/*!
 *  设置整圆layer
 */
-(void)setCircleLayer
{
    self.cornerRadius = CGRectGetWidth(self.frame)/2.0;
    self.masksToBounds = YES;
}
/**
 *  设置一像素的 边框宽度
 */
-(void)setOnePixelBorderWidth
{
    CGFloat scale = [[UIScreen mainScreen] scale];
    CGFloat width = scale > 0.0 ? 1.0 / scale : 1.0;
    [self setBorderWidth:width];
}
@end
