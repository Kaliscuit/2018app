package com.dalingjia.shop.model.Response;


/**
 * Created by fwq on 2017/2/23.
 */

public class BaseResponse<T> {

    public int status; // 0 正常
    public String errorMg;// 信息
    public T data;


    @Override
    public String toString() {
        return status + "msg=" + errorMg + data + "====="+data;
    }

}
