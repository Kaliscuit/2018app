package com.dalingjia.shop.network;

import android.widget.Toast;

import com.dalingjia.shop.MainApplication;
import com.dalingjia.shop.model.Response.BaseResponse;
import com.dalingjia.shop.network.exception.ApiHttpResonseException;
import com.dalingjia.shop.utils.NetworkUtil;

import rx.Subscriber;
import rx.functions.Func1;

/**
 * Created by wuxiaojun on 2017/2/28.
 */

public abstract class BaseSubscriber<T> extends Subscriber<T> {

    @Override
    public void onStart() {
        super.onStart();
        if (!NetworkUtil.isConnected(MainApplication.getApplication())) {
            Toast.makeText(MainApplication.getApplication(), "请检查网络!",Toast.LENGTH_LONG).show();
            return;
        }
        // 显示进度条
    }

    @Override
    public void onError(Throwable e) {
        e.printStackTrace();
    }

    @Override
    public void onCompleted() {
        // 关闭进度条
    }

    /***
     * 对返回结果进行预先处理
     *
     * @param <T>
     */
    public class HttpResponseFun<T> implements Func1<BaseResponse<T>, T> {
        @Override
        public T call(BaseResponse<T> tBaseResponse) {
            if (tBaseResponse.status != 0) {
                throw new ApiHttpResonseException(tBaseResponse.status, tBaseResponse.errorMg);
            }
            return tBaseResponse.data;
        }

    }


}
