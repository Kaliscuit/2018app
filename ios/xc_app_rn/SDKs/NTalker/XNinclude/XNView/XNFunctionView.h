//
//  XNFunctionView.h
//  TestSDKII
//
//  Created by Ntalker on 16/4/22.
//  Copyright © 2016年 NTalker. All rights reserved.
//

/*
    扩展功能栏
 */

#import <UIKit/UIKit.h>


#define TAG_ALBUM_EXTENTION_NENG 1234
#define TAG_CAMERA_EXTENTION_NENG 1235
#define TAG_EVALUATE_EXTENTION_NENG 1236
#define TAG_EVALUATELABEL_EXTENTION_NENG 1246
#define TAG_VIDEO_EXTENTION_NENG 1237

@protocol XNFuctionViewDelegate <NSObject>

/**
 扩展项点击回调

 @param tag 被点击的扩展项的tag值
 */
- (void)extentionItemDidClickedWith:(NSInteger)tag inChatView:(UIViewController *)chatView;

@end

@interface XNFunctionView : UIScrollView

@property (nonatomic ,weak) UIViewController *viewController;

/**
 代理对象
 */
@property (weak, nonatomic) id<XNFuctionViewDelegate> extentionDelegate;

/**
功能栏中所有扩展项
 
 @discussion 元素为字典,key值分别为image,title,tag
 */
@property (strong, nonatomic) NSMutableArray *allItems;

/**
 向功能栏中增加扩展项

 @param imageName 扩展项的图片名称
 @param title     扩展项名称
 @param tag       扩展项的唯一标示符
 
 @discussion 所传tag值不能和已有的扩展项重复,否则添加不上
 */
- (void)addExtentionWithImageName:(NSString *)imageName HighlightImageName:(NSString *)HighlightImageName title:(NSString *)title tag:(NSInteger)tag;

/**
 移除现有功能栏的扩展项

 @param tag 要移除项的唯一标示符
 */
//- (void)removeExtentionWithTag:(NSInteger)tag;

/**
 移除现有功能栏的所有扩展项
*/
- (void)removeAllExtentionButton;
/**
 设置是否开启小视频
 
 @param isHaveVideo  YES:开启  NO：关闭   默认关闭
*/
-(void)setIsHaveVideo:(BOOL)isHaveVideo;
@end
