//
//  NSData+Additional.m
//  FlyintheSky
//
//  Created by LiJia on 12-11-30.
//  Copyright (c) 2012年 Jia Li. All rights reserved.
//

#import "NSData+LCAdditional.h"
#import <CommonCrypto/CommonCryptor.h>

@implementation NSData (LCAdditional)

- (NSData *)AES256EncryptWithKey:(NSString *)key {
	// 'key' should be 32 bytes for AES256, will be null-padded otherwise
	char keyPtr[kCCKeySizeAES256+1]; // room for terminator (unused)
	bzero(keyPtr, sizeof(keyPtr)); // fill with zeroes (for padding)
	
	// fetch key data
	[key getCString:keyPtr maxLength:sizeof(keyPtr) encoding:NSUTF8StringEncoding];
	
	NSUInteger dataLength = [self length];
	
	//See the doc: For block ciphers, the output size will always be less than or
	//equal to the input size plus the size of one block.
	//That's why we need to add the size of one block here
	size_t bufferSize = dataLength + kCCBlockSizeAES128;
	void *buffer = malloc(bufferSize);
	
	size_t numBytesEncrypted = 0;
	CCCryptorStatus cryptStatus = CCCrypt(kCCEncrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding,
                                          keyPtr, kCCKeySizeAES256,
                                          NULL /* initialization vector (optional) */,
                                          [self bytes], dataLength, /* input */
                                          buffer, bufferSize, /* output */
                                          &numBytesEncrypted);
	if (cryptStatus == kCCSuccess) {
		//the returned NSData takes ownership of the buffer and will free it on deallocation
		return [NSData dataWithBytesNoCopy:buffer length:numBytesEncrypted];
	}
    
	free(buffer); //free the buffer;
	return nil;
}

- (NSData *)AES256DecryptWithKey:(NSString *)key {
	// 'key' should be 32 bytes for AES256, will be null-padded otherwise
	char keyPtr[kCCKeySizeAES256+1]; // room for terminator (unused)
	bzero(keyPtr, sizeof(keyPtr)); // fill with zeroes (for padding)
	
	// fetch key data
	[key getCString:keyPtr maxLength:sizeof(keyPtr) encoding:NSUTF8StringEncoding];
	
	NSUInteger dataLength = [self length];
	
	//See the doc: For block ciphers, the output size will always be less than or
	//equal to the input size plus the size of one block.
	//That's why we need to add the size of one block here
	size_t bufferSize = dataLength + kCCBlockSizeAES128;
	void *buffer = malloc(bufferSize);
	
	size_t numBytesDecrypted = 0;
	CCCryptorStatus cryptStatus = CCCrypt(kCCDecrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding,
                                          keyPtr, kCCKeySizeAES256,
                                          NULL /* initialization vector (optional) */,
                                          [self bytes], dataLength, /* input */
                                          buffer, bufferSize, /* output */
                                          &numBytesDecrypted);
	
	if (cryptStatus == kCCSuccess) {
		//the returned NSData takes ownership of the buffer and will free it on deallocation
		return [NSData dataWithBytesNoCopy:buffer length:numBytesDecrypted];
	}
	
	free(buffer); //free the buffer;
	return nil;
}

- (NSData *)DESDecryptWithKey:(NSString *)key {
	CCCryptorStatus ccStatus;
	uint8_t *bufferPtr = NULL;
	size_t bufferPtrSize = 0;
	size_t numBytesDecrypted = 0;
	
	bufferPtrSize = (self.length + kCCBlockSizeDES) & ~(kCCBlockSizeDES - 1);
	bufferPtr = malloc( bufferPtrSize * sizeof(Byte));
	memset((void *)bufferPtr, 0x0, bufferPtrSize);
	
	const void *vkey = (const void *) [key UTF8String];
	
    ccStatus=CCCrypt(kCCDecrypt,
                     kCCAlgorithmDES,
                     kCCOptionPKCS7Padding | kCCOptionECBMode,
                     vkey, //"123456789012345678901234", //key
                     kCCKeySizeDES,
                     NULL,// vinitVec, //"init Vec", //iv,
                     [self bytes], //data in
                     self.length,
                     (void *)bufferPtr,//data out
                     bufferPtrSize,
                     &numBytesDecrypted);
    
    if (ccStatus == kCCSuccess) {
		//the returned NSData takes ownership of the buffer and will free it on deallocation
		return [NSData dataWithBytesNoCopy:bufferPtr length:numBytesDecrypted];
	}
    else return nil;

}

- (NSData *)DESEncryptWithKey:(NSString *)key{
    CCCryptorStatus ccStatus;
	uint8_t *bufferPtr = NULL;
	size_t bufferPtrSize = 0;
	size_t numBytesDecrypted = 0;
	
	bufferPtrSize = (self.length + kCCBlockSizeDES) & ~(kCCBlockSizeDES - 1);
	bufferPtr = malloc( bufferPtrSize * sizeof(Byte));
	memset((void *)bufferPtr, 0x0, bufferPtrSize);
	
	const void *vkey = (const void *) [key UTF8String];
	
    ccStatus=CCCrypt(kCCEncrypt,
                     kCCAlgorithmDES,
                     kCCOptionPKCS7Padding | kCCOptionECBMode,
                     vkey, //"123456789012345678901234", //key
                     kCCKeySizeDES,
                     NULL,// vinitVec, //"init Vec", //iv,
                     [self bytes], //data in
                     self.length,
                     (void *)bufferPtr,//data out
                     bufferPtrSize,
                     &numBytesDecrypted);
    
    if (ccStatus == kCCSuccess) {
		//the returned NSData takes ownership of the buffer and will free it on deallocation
		return [NSData dataWithBytesNoCopy:bufferPtr length:numBytesDecrypted];
	}else
        return nil;

}
@end
