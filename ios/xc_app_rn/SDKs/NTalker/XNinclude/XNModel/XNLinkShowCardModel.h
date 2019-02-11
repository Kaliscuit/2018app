//
//  XNLinkShowCardModel.h
//  NTalkerUIKitSDK
//
//  Created by NTalker-zhou on 16/2/24.
//  Copyright © 2016年 NTalker. All rights reserved.
//  链接名片-数据模型类

#import <Foundation/Foundation.h>

@interface XNLinkShowCardModel : NSObject

@property(nonatomic,strong)NSString *LinkUrl;//链接网址
@property(nonatomic,strong)NSString *imageUrl;//图片
@property(nonatomic,strong)NSString *title;//标题
@property(nonatomic,strong)NSString *content;//内容（取部分显示）

@end
