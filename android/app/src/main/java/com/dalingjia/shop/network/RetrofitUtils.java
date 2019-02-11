package com.dalingjia.shop.network;

import com.dalingjia.shop.MainApplication;
import com.dalingjia.shop.model.DeviceInfo;
import com.dalingjia.shop.utils.Constant;
import com.dalingjia.shop.utils.DeviceInfoUtil;
import com.dalingjia.shop.utils.SSLSocketClient;
import com.google.gson.GsonBuilder;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import retrofit2.CallAdapter;
import retrofit2.Converter;
import retrofit2.Retrofit;
import retrofit2.adapter.rxjava.RxJavaCallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Created by fwq on 2017/8/31.
 */

public class RetrofitUtils {


    private static Converter.Factory gsonConverterFactory = GsonConverterFactory.create();

    private static CallAdapter.Factory rxjavaCallAdapterFactory = RxJavaCallAdapterFactory.create();

    private static Retrofit mRetrofit;
    private OkHttpClient mOkHttpClient;

    public static Retrofit getRetrofit() {
        if (mRetrofit == null) {
            OkHttpClient mOkHttpClient = new OkHttpClient()
                    .newBuilder()
                    .addInterceptor(new Interceptor() {
                        @Override
                        public Response intercept(Chain chain) throws IOException {
                            DeviceInfo deviceInfo = DeviceInfoUtil.getDeviceInfo(MainApplication.getApplication());
                            Request request = chain.request().newBuilder()
                                    .addHeader("platform", "android")
                                    .addHeader("clientid", deviceInfo.getDeviceID())
                                    .addHeader("version", deviceInfo.getSoftVersion())
                                    .addHeader("bundle", MainApplication.getApplication().getBundleVersion()).build();
                            return chain.proceed(request);
                        }
                    })
                    .sslSocketFactory(SSLSocketClient.getSSLSocketFactory())//配置
                    .hostnameVerifier(SSLSocketClient.getHostnameVerifier())//配置
                    .connectTimeout(20, TimeUnit.SECONDS)
                    .readTimeout(20, TimeUnit.SECONDS)
                    .writeTimeout(20, TimeUnit.SECONDS)
                    .build();
            mRetrofit = new Retrofit.Builder()
                    .client(mOkHttpClient)
                    .baseUrl(Constant.BASE_URL)
                    .addConverterFactory(gsonConverterFactory)
                    .addCallAdapterFactory(rxjavaCallAdapterFactory)
                    .build();
        }
        return mRetrofit;
    }

}
