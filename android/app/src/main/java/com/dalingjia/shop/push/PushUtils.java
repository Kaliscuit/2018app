package com.dalingjia.shop.push;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.dalingjia.shop.LogoActivity;
import com.dalingjia.shop.MainActivity;
import com.dalingjia.shop.constants.ParamsKey;
import com.dalingjia.shop.utils.Constant;


public class PushUtils {
    private static final String TAG = "PushUtils";


    public static void onReceiveRegistrationId(Context context, String regId) {
    }

    /**
     * 收到透传消息
     *
     * @param context
     * @param msg
     */
    public static void onMessageReceived(Context context, String msg) {
        Intent i = new Intent(context, MyPushService.class);
        i.putExtra(ParamsKey.PUSH_MESSAGE, msg);
        context.startService(i);
    }

    /**
     * 收到通知消息
     *
     * @param context
     * @param msg
     */
    public static void onNotificationReceived(Context context, String msg) {
        Intent i = new Intent(context, MyPushService.class);
        i.putExtra(ParamsKey.PUSH_MESSAGE, msg);
        context.startService(i);
    }

    public static void onNotificationClicked(final Context context,
                                             final Intent intent) {
        startActivity(context, intent);
    }

    public static void startActivity(Context context, Intent intent) {
        if (Constant.isStart) {
            intent.setClass(context, LogoActivity.class);
            context.startActivity(intent);
        }else {
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.setClass(context, LogoActivity.class);
            //push 点击统计
            //new PushNotificationClick(push_id, context);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
    }

    public static void onReceiveRichpushCallback(Context context, String msg) {
      //  Log.d(TAG, "用户收到到RICH PUSH CALLBACK: " + msg);
    }
}
