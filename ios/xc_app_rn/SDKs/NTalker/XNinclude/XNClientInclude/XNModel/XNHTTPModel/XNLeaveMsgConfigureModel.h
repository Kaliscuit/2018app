//
//  XNLeaveMsgConfigureModel.h
//  NTalkerClientSDK
//
//  Created by Ntalker on 16/1/21.
//  Copyright © 2016年 NTalker. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface XNLeaveMsgConfigureModel : NSObject

@property (strong, nonatomic) NSString *isopen;
@property (strong, nonatomic) NSString *isannounce;
@property (strong, nonatomic) NSString *leavewords;
@property (strong, nonatomic) NSMutableArray *lwsetting;
@property (strong, nonatomic) NSMutableArray *detailArr;

@end
