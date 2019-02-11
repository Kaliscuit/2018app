//
//  XNVideoPlayerView.h
//  TestVideoII
//
//  Created by Ntalker on 16/8/5.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSUInteger, E_PlayerFromType) {
    e_record,
    e_play,
};

@protocol XNVideoPlayerViewDelegate <NSObject>

@optional

- (void)videoPlayerSenderButtonClicked:(NSURL *)videoURL imageURL:(NSURL *)imageURL;

- (void)videoPlayDidCanceled;

@end

@interface XNVideoPlayerView : UIView

@property (weak, nonatomic) id<XNVideoPlayerViewDelegate> delegate;

@property (assign, nonatomic) E_PlayerFromType e_fromType;

//- (instancetype)initWithFrame:(CGRect)frame URL:(NSURL *)videoURL;

- (void)startVideoPlay:(NSURL *)videoURL;

@end
