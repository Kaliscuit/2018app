package com.dalingjia.shop.network;

import com.dalingjia.shop.network.api.DalingApi;

/**
 *
 */

public class DalingNetwork {

    public static DalingApi getDalingApi() {
        return RetrofitUtils.getRetrofit().create(DalingApi.class);
    }

}
