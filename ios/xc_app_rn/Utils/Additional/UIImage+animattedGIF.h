//
//  UIImage+animattedGIF.h
//  xc_app_rn
//
//  Created by zl on 2017/12/19.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface UIImage(animatedGIF)
+ (NSArray *)xc_animatedGIFWithData:(NSData *)data completeBlock:(void(^)())blockComplete;
@end
