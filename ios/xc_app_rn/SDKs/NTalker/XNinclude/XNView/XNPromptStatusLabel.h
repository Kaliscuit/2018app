//
//  XNPromptStatusLabel.h
//  TestChoose
//
//  Created by Ntalker on 16/3/11.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef void(^clickedBlock)(NSString *clickedString);

@interface XNPromptStatusLabel : UILabel

@property (strong, nonatomic) NSArray *needClickedArray;

- (void)addBlock:(clickedBlock)block;

@end
