//
//  XCViewUpdate.h
//  xc_app_rn
//
//  Created by zl on 2017/9/1.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface XCViewUpdate : UIView
@property (weak, nonatomic) IBOutlet UIView *viewUpdate;
@property (weak, nonatomic) IBOutlet UIView *viewProgressBar;
@property (weak, nonatomic) IBOutlet UIImageView *imgPoint;
@property (weak, nonatomic) IBOutlet UIView *viewButtonStart;
@property (weak, nonatomic) IBOutlet UIImageView *imageBG;
@property (strong, nonatomic)UIImage *aimage;
@property (strong, nonatomic)NSTimer *timer;
@property (assign, nonatomic)NSInteger timerCount;

@property (copy, nonatomic) void(^blockStartButtonClicked)();
@property (copy, nonatomic) void(^blockAnimateImageFinished)();
- (void)setProgress:(NSProgress *)progress;
@end
