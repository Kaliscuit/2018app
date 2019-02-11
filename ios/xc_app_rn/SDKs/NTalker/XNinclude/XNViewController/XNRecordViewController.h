//
//  XNRecordViewController.h
//  NTalkerUIKitSDK
//
//  Created by Ntalker on 16/8/8.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

@class XNRecordViewController;
@protocol XNVideoRecordControllerDelegate <NSObject>

- (void)recordDidFinishedWithVideoURL:(NSURL *)videoURL displayImageURL:(NSURL *)displayImageURL recordViewController:(XNRecordViewController *)recordViewController;

@end

@interface XNRecordViewController : UIViewController

@property (weak, nonatomic) id<XNVideoRecordControllerDelegate> delegate;

@end
