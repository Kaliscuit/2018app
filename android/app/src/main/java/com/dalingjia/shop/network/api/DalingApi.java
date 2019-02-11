package com.dalingjia.shop.network.api;

import com.dalingjia.shop.model.Response.BundleVersionResponse;
import com.dalingjia.shop.utils.Constant;

import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.HEAD;
import retrofit2.http.POST;
import retrofit2.http.Query;
import rx.Observable;

/**
 */

public interface DalingApi {

    @POST(Constant.BUNDLE_VERSION_URL)
    Observable<BundleVersionResponse> getBundleVersion(

    );

}
