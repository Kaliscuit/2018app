//
//  UIImage+animattedGIF.m
//  xc_app_rn
//
//  Created by zl on 2017/12/19.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "UIImage+animattedGIF.h"
#import <ImageIO/ImageIO.h>

@implementation UIImage(animatedGIF)

+ (NSArray *)xc_animatedGIFWithData:(NSData *)data completeBlock:(void(^)())blockComplete
{
  if (!data) {
    return nil;
  }
  
  CGImageSourceRef source = CGImageSourceCreateWithData((__bridge CFDataRef)data, NULL);
  
  size_t count = CGImageSourceGetCount(source);
  
  UIImage *animatedImage;
  NSMutableArray *images = [NSMutableArray array];
 
  if (count <= 1) {
    animatedImage = [[UIImage alloc] initWithData:data];
  }
  else {
    
#if 0
    NSTimeInterval duration = 0.0f;
#endif
    
    for (size_t i = 0; i < count; i++) {
      CGImageRef image = CGImageSourceCreateImageAtIndex(source, i, NULL);

#if 0
      duration += [self xc_frameDurationAtIndex:i source:source];
#endif
      
      [images addObject:[UIImage imageWithCGImage:image scale:[UIScreen mainScreen].scale orientation:UIImageOrientationUp]];
      
      CGImageRelease(image);
    }
#if 0
    if (!duration) {
      duration = (1.0f / 10.0f) * count;
    }
#endif
    
  }
  
  CFRelease(source);
  
  return images;
}

+ (float)xc_frameDurationAtIndex:(NSUInteger)index source:(CGImageSourceRef)source {
  float frameDuration = 0.1f;
  CFDictionaryRef cfFrameProperties = CGImageSourceCopyPropertiesAtIndex(source, index, nil);
  NSDictionary *frameProperties = (__bridge NSDictionary *)cfFrameProperties;
  NSDictionary *gifProperties = frameProperties[(NSString *)kCGImagePropertyGIFDictionary];
  
  NSNumber *delayTimeUnclampedProp = gifProperties[(NSString *)kCGImagePropertyGIFUnclampedDelayTime];
  if (delayTimeUnclampedProp) {
    frameDuration = [delayTimeUnclampedProp floatValue];
  }
  else {
    
    NSNumber *delayTimeProp = gifProperties[(NSString *)kCGImagePropertyGIFDelayTime];
    if (delayTimeProp) {
      frameDuration = [delayTimeProp floatValue];
    }
  }
  
  // Many annoying ads specify a 0 duration to make an image flash as quickly as possible.
  // We follow Firefox's behavior and use a duration of 100 ms for any frames that specify
  // a duration of <= 10 ms. See <rdar://problem/7689300> and <http://webkit.org/b/36082>
  // for more information.
  
  if (frameDuration < 0.011f) {
    frameDuration = 0.100f;
  }
  
  CFRelease(cfFrameProperties);
  return frameDuration;
}

@end
