package com.dalingjia.shop.push;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.dalingjia.shop.utils.SharedPreferencesUtils;
import com.huawei.hms.support.api.push.PushReceiver;

/*
 * 接收华为Push所有消息的广播接收器
 */
public class HWReceiver extends PushReceiver {

    private static final String TAG = "HWReceiver";


    @Override
    public void onToken(Context context, String token, Bundle extras) {
        // String belongId = extras.getString("belongId");
        //String content = "获取token和belongId成功，token = " + token + ",belongId = " + belongId;
        //Log.e("HWReceiver",content);
        new SharedPreferencesUtils(context, "HWTOKEN").SaveData("token", token);
        //Intent intent = new Intent(context, UploadTokenService.class);
        // intent.putExtra(ParamsKey.TOKEN_CHANNEL, "huawei");
        // intent.putExtra(ParamsKey.TOKEN_VALUE, token);
        //  context.startService(intent);
    }


    /**
     * 接收透传消息
     */
    @Override
    public boolean onPushMsg(Context context, byte[] msg, Bundle bundle) {
        try {
            String content = new String(msg, "UTF-8");
            PushUtils.onMessageReceived(context, content);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public void onEvent(Context context, Event event, Bundle extras) {
        if (Event.NOTIFICATION_OPENED.equals(event) || Event.NOTIFICATION_CLICK_BTN.equals(event)) {
            int notifyId = extras.getInt(BOUND_KEY.pushNotifyId, 0);
            if (0 != notifyId) {
                NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                manager.cancel(notifyId);
            }
            String content = "收到通知附加消息： " + extras.getString(BOUND_KEY.pushMsgKey);
            //Log.e("HWReceiver",content);
        }
        super.onEvent(context, event, extras);
    }

}
