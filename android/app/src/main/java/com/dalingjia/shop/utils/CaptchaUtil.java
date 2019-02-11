package com.dalingjia.shop.utils;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.Toast;

import com.dalingjia.shop.MainApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.netease.nis.captcha.Captcha;
import com.netease.nis.captcha.CaptchaListener;
import com.tencent.captchasdk.TCaptchaDialog;
import com.tencent.captchasdk.TCaptchaVerifyListener;

import org.json.JSONObject;

/**
 * Created by daling on 2017/12/15.
 */

public class CaptchaUtil {
    private final static String TAG = "Captcha";
    Captcha mCaptcha = null;
    private Activity mContext = null;
    private TCaptchaDialog dialog;
    private String captchaId;

    public CaptchaUtil(Activity mContext, String captchaId) {
        this.mContext = mContext;
        this.captchaId = captchaId;
        if (!StringUtil.checkStr(captchaId)) {
            this.captchaId = "2083786765";
            //2083786765
        }

    }

    public void startValidate() {
        try {
            if (dialog != null) {
                dialog.dismiss();
            }

            mContext.runOnUiThread(new Runnable() {
                public void run() {
                    String map = null;
                    //   if (uin != null && uin.length() >0) {
                    //     JSONObject jsonObject = new JSONObject();
                    //      jsonObject.put("uin", Integer.parseInt(uin));
                    //      jsonObject.put("但是法律框架","sdfklj sfd史蒂夫");
                    //     map = URLEncoder.encode(jsonObject.toString(),"utf-8");
                    //   }
                    dialog = new TCaptchaDialog(mContext, true, cancelListener, captchaId, captchaVerifyListener, map);
                    dialog.show();
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Dialog.OnCancelListener cancelListener = new Dialog.OnCancelListener() {
        @Override
        public void onCancel(DialogInterface dialog) {
            // Toast.makeText(mContext, "用戶可能按了返回键，关闭验证码未验证成功", Toast.LENGTH_SHORT).show();
            dialog = null;
        }
    };
    private TCaptchaVerifyListener captchaVerifyListener = new TCaptchaVerifyListener() {
        @Override
        public void onVerifyCallback(JSONObject jsonObject) {
            handleCallback(jsonObject);
        }
    };

    private void handleCallback(JSONObject jsonObject) {
        try {

            int ret = jsonObject.getInt("ret");
            String info = jsonObject.toString();
            if (ret == 0) { //验证成功
                WritableMap params = Arguments.createMap();
                params.putString("validate", info);
                sentEvent(params);
            } else if (ret == -1001) {// 首个TCaptcha.js加载错误时允许用户(操作者)或业务方(接入方)介入重试
                WritableMap params = Arguments.createMap();
                params.putString("errormsg", info);
                sentEvent(params);
            } else { //用户(可能)点了验证码的关闭按钮
                //  WritableMap params = Arguments.createMap();
                //  params.putString("errormsg", info);
            }
            //Toast.makeText(mContext, info, Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sentEvent(WritableMap params) {
        try {
            MainApplication.getApplication().getReactNativeHost().getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("EventCaptcha", params);
        } catch (Exception e) {

        }
    }

}
