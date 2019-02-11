//
//  XNEvalueColorManager.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 17/6/29.
//  Copyright © 2017年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface XNEvalueColorManager : NSObject

/*设置各颜色配置*/

/*背景颜色*/
-(void)setViewBackGroundColor:(NSArray *)viewBackGroundColor;
/*评价title字体颜色*/
-(void)setEvalueTitleColor: (NSArray *)evalueTitleColor;
/**
 评价选项文字颜色设置
 @param evalueTextDefaultColor:  评价选项文字非选中字体颜色
 @param evalueTextSelectedColor  评价选项文字选中字体颜色
 */
-(void)setEvalueTextDefaultColor:(NSArray *)evalueTextDefaultColor andTextSelectedColor:(NSArray *)evalueTextSelectedColor;

/**
 解决状态颜色设置
 @param evalueStatusTitleColor:  解决进度title字体颜色
 @param evalueStatusTextDefaultColor  解决进度文字非选中字体颜色
 @param evalueStatusTextSelectedColor  解决进度文字选中字体颜色
 */
-(void)setEvalueStatusTitleColor:(NSArray *)evalueStatusTitleColor andTextDefaultColor:(NSArray *)evalueStatusTextDefaultColor TextSelectedColor:(NSArray *)evalueStatusTextSelectedColor;

/**
 建议反馈颜色设置
 @param evalueAdviceTitleColor:  建议反馈title字体颜色
 @param evalueAdviceFormColor  建议反馈输入边框颜色
 @param evalueAdvicePlaceholdTextColor  建议反馈占位符字体颜色
 */
-(void)setEvalueAdviceTitleColor:(NSArray *)evalueAdviceTitleColor andFormColor:(NSArray *)evalueAdviceFormColor PlaceholdTextColor:(NSArray *)evalueAdvicePlaceholdTextColor;

/**
 "取消"按钮颜色设置
 @param evalueCancelTextDefaultColor:  ”取消“默认字体颜色
 @param evalueCancelTextHighLightColor  ”取消“高亮状态字体颜色
 @param evalueCancelDefaultBackgroundColor  ”取消“按钮默认背景颜色
 @param evalueCancelSelectedBackgroundColor  ”取消“按钮选中背景颜色
 */
-(void)setEvalueCancelTextDefaultColor:(NSArray *)evalueCancelTextDefaultColor andTextHighLightColor:(NSArray *)evalueCancelTextHighLightColor defaultBackgroundColor:(NSArray *)evalueCancelDefaultBackgroundColor selectedBackgroundColor:(NSArray *)evalueCancelSelectedBackgroundColor;

/**
 "提交“颜色设置
 @param evalueSubmitTextDefaultColor:  ”提交“默认字体颜色
 @param evalueSubmitTextHighLightColor  ”提交“高亮状态字体颜色
 @param evalueSubmitDefaultBackgroundColor  ”提交“按钮默认背景颜色
 @param evalueSubmitSelectedBackgroundColor  ”提交“按钮选中背景颜色
 */
-(void)setEvalueSubmitTextDefaultColor:(NSArray *)evalueSubmitTextDefaultColor andTextHighLightColor:(NSArray *)evalueSubmitTextHighLightColor defaultBackgroundColor:(NSArray *)evalueSubmitDefaultBackgroundColor selectedBackgroundColor:(NSArray *)evalueSubmitSelectedBackgroundColor;

@end
