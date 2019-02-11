package com.dalingjia.shop.model.Response;


/**
 * 版本升级
 */

public class BundleVersionResponse extends BaseResponse<BundleVersionResponse> {
    public String sign; // 新配签名
    public String downloadUrl; // 下载地址
    public String forceYN; // 是否强制启动
    public String version; // 版本号
}
