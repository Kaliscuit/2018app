//
//  UITextField+GSAdditional.m
//  GiftShop
//
//  Created by zhang yintao on 14-3-29.
//  Copyright (c) 2014年 zhang yintao. All rights reserved.
//

#import "UITextField+GSAdditional.h"

@implementation UITextField (GSAdditional)

//设置文字左边距
-(void)setTextLeftMargin:(float)leftMargin
{
    CGRect rect = self.frame;
    rect.size.width = leftMargin;
    UIView* view = [[UIView alloc]initWithFrame:rect];
    view.backgroundColor = [UIColor clearColor];
    
    self.leftView = view;
    self.leftViewMode = UITextFieldViewModeAlways;
}
@end
