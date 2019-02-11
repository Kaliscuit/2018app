package com.dalingjia.shop.network.exception;

/**
 */

public class ApiHttpResonseException extends RuntimeException {


    public ApiHttpResonseException(int resultCode,String msg){
        this.getApiHttpResonseMsg(resultCode,msg);
    }

    public ApiHttpResonseException(String detaileMsg){
        super(detaileMsg);
    }


    private static String getApiHttpResonseMsg(int code,String msg){
        if(code != 200){
            return msg;
        }
        return null;
    }


}
