//
//  UIView+Additional.m
//  FlyintheSky
//
//  Created by zhangyintao on 12-11-16.
//  Copyright (c) 2012年 zhangyintao. All rights reserved.
//

#import "UIView+LCAdditional.h"

@implementation UIView (LCAdditional)

-(UIImage*)backgroundImage {
    return (UIImage*)self.layer.contents;
}

-(void)setBackgroundImage:(UIImage *)image {
    self.layer.contents = (id)[image CGImage];
}
/*!
 *  设置frame的，origin x
 *
 *  @param x x坐标
 */
-(void)setViewOriginX:(CGFloat)x
{
    CGRect rect = self.frame;
    rect.origin.x = x;
    self.frame = rect;
}
/*!
 *  设置frame的，origin y
 *
 *  @param x y坐标
 */
-(void)setViewOriginY:(CGFloat)y
{
    CGRect rect = self.frame;
    rect.origin.y = y;
    self.frame = rect;
}
/*!
 *  设置frame的宽度，frame其他不变
 *
 *  @param width frame宽度
 */
-(void)setViewWidth:(CGFloat)width
{
    CGRect rect = self.frame;
    rect.size.width = width;
    self.frame = rect;
}
/*!
 *  设置frame的高度，frame其他不变
 *
 *  @param height frame高度
 */
-(void)setViewHeight:(CGFloat)height
{
    CGRect rect = self.frame;
    rect.size.height = height;
    self.frame = rect;
}
/*!
 *  设置坐标X偏移 坐标Y偏移
 *
 *  @param x x偏移量
 *  @param y y偏移量
 */
-(void)setViewMove:(CGFloat)x Y:(CGFloat)y
{
	[UIView beginAnimations:nil context:nil];
	[UIView setAnimationDuration:0.3];
	[self setCenter:CGPointMake(self.center.x + x, self.center.y + y)];
	[UIView commitAnimations];
}
/*!
 *  设置Center x
 *
 *  @param x x坐标
 */
-(void)setCenterX:(CGFloat)x
{
    CGPoint center = self.center;
    center.x = x;
    self.center = center;
}
/*!
 *  设置Center y
 *
 *  @param y y坐标
 */
-(void)setCenterY:(CGFloat)y
{
    CGPoint center = self.center;
    center.y = y;
    self.center = center;
}
/*!
 *  设置centerX偏移 坐标Y偏移
 *
 *  @param x x偏移量
 *  @param y y偏移量
 */
-(void)setCenterMove:(CGFloat)x Y:(CGFloat)y
{
    CGPoint center = self.center;
    center.x += x;
    center.y += y;
    self.center = center;
}
/*!
 *  查找UIview 所属的 UIViewController
 *
 *  @return UIViewController
 */
- (UIViewController *)viewController {
    /// Finds the view's view controller.
    
    // Traverse responder chain. Return first found view controller, which will be the view's view controller.
    UIResponder *responder = self;
    while ((responder = [responder nextResponder]))
        if ([responder isKindOfClass: [UIViewController class]])
            return (UIViewController *)responder;
    
    // If the view controller isn't found, return nil.
    return nil;
}
- (void)cornerRadius:(CGFloat)radius {
    self.layer.masksToBounds = YES;
    self.layer.cornerRadius  = radius;
}

- (void)cornerRadius:(CGFloat)radius borderColor:(UIColor*)borderColor borderWidth:(CGFloat)borderWidth {
    self.layer.masksToBounds = YES;
    self.layer.cornerRadius  = radius;
    self.layer.borderColor = borderColor.CGColor;
    self.layer.borderWidth = borderWidth;
}

- (void)borderWithColor:(UIColor*)borderColor borderWidth:(CGFloat)borderWidth {
    self.layer.borderColor = borderColor.CGColor;
    self.layer.borderWidth = borderWidth;
}

- (void)makeRoundedCorner:(UIRectCorner)byRoundingCorners cornerRadii:(CGSize)cornerRadii {
    UIBezierPath* path = [UIBezierPath bezierPathWithRoundedRect:self.bounds byRoundingCorners:byRoundingCorners cornerRadii:cornerRadii];
    CAShapeLayer* shape = [CAShapeLayer layer];
    shape.path = path.CGPath;
    self.layer.mask = shape;
}
@end
