//
//  XCViewUpdate.m
//  xc_app_rn
//
//  Created by zl on 2017/9/1.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "XCViewUpdate.h"
#import "UIImage+animattedGIF.h"

@implementation XCViewUpdate

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
-(void)awakeFromNib
{
  [super awakeFromNib];
  
  NSString *path = [[NSBundle mainBundle] pathForResource:@"icon_launchBG" ofType:@"gif"];
  NSData *data = [NSData dataWithContentsOfFile:path];
  NSArray *images = [UIImage xc_animatedGIFWithData:data completeBlock:^{
  }];
  [self.imageBG setImage:[UIImage imageNamed:@"icon_launch_last"]];
  self.imageBG.animationImages = images;
  self.imageBG.animationDuration = 1.3;
  self.imageBG.animationRepeatCount = 1;
  [self.imageBG startAnimating];
  
//  [self.imageBG addObserver:self forKeyPath:@"isAnimating" options:NSKeyValueObservingOptionOld context:nil];
  self.timer =[NSTimer scheduledTimerWithTimeInterval:0.12 target:self selector:@selector(play) userInfo:nil repeats:YES];
  self.timerCount = 0;
  [self.timer fire];
  
  [self.viewButtonStart.layer setMasksToBounds:YES];
  [self.viewButtonStart.layer setCornerRadius:self.viewButtonStart.frame.size.height/2];
  [self.viewButtonStart.layer setBorderColor:[UIColor colorWithHexString:@"#D0648F"].CGColor];

  CGFloat scale = [[UIScreen mainScreen] scale];
  CGFloat width = scale > 0.0 ? 1.0 / scale : 1.0;
  [self.viewButtonStart.layer setBorderWidth:width];
}

-(void)play
{
  self.timerCount ++;
  if (self.imageBG.isAnimating == NO || self.timerCount > 20)
  {
    [self.timer invalidate];
    if (self.blockAnimateImageFinished)
    {
      self.blockAnimateImageFinished();
    }
    [self.imageBG stopAnimating];
    self.imageBG.animationImages = nil;
    [self.imageBG setImage:[UIImage imageNamed:@"icon_launch_last"]];
  }
}

- (void)setProgress:(NSProgress *)progress
{
  CGFloat ratio =  progress.fractionCompleted;
  [self.viewProgressBar setViewWidth:self.viewProgressBar.superview.frame.size.width*ratio];
  [self.imgPoint setViewOriginX:self.viewProgressBar.frame.size.width -7];
}

- (IBAction)startButtonClicked:(id)sender {
  if (self.blockStartButtonClicked) {
    self.blockStartButtonClicked();
  }
}

#if 0
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSString *,id> *)change context:(void *)context {
  id oldName = [change objectForKey:NSKeyValueChangeOldKey];
  NSLog(@"oldName----------%@",oldName);
  id newName = [change objectForKey:NSKeyValueChangeNewKey];
  NSLog(@"newName-----------%@",newName);
  //当界面要消失的时候,移除kvo
  //    [object removeObserver:self forKeyPath:@"name"];
}
#endif

@end
