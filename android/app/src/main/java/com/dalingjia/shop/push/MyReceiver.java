package com.dalingjia.shop.push;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.dalingjia.shop.Logger;

import cn.jpush.android.api.JPushInterface;

/**
 * Created by daling on 2018/1/16.
 */

public class MyReceiver extends BroadcastReceiver {
    private static final String TAG = "MyReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {

        try {
            Bundle bundle = intent.getExtras();
            //   Logger.e(TAG, "onReceive - " + intent.getAction() + ", bundle is : "
            //          + bundle.toString() + "" + printBundle(bundle));
            if (JPushInterface.ACTION_REGISTRATION_ID.equals(intent.getAction())) {
                String regId = bundle.getString(JPushInterface.EXTRA_REGISTRATION_ID);
                PushUtils.onReceiveRegistrationId(context, regId);
            } else if (JPushInterface.ACTION_MESSAGE_RECEIVED.equals(intent.getAction())) {
//                Logger.e(TAG, "接收到推送下来的自定义消息: " + bundle.getString(JPushInterface.EXTRA_MESSAGE));
                String msg = bundle.getString(JPushInterface.EXTRA_MESSAGE);
                PushUtils.onMessageReceived(context, msg);
            } else if (JPushInterface.ACTION_NOTIFICATION_RECEIVED.equals(intent.getAction())) {
//                Logger.d(TAG, "接收到推送下来的通知==bundle is " + bundle + ",EXTRA_EXTRA is " + JPushInterface.EXTRA_EXTRA);
                int notifactionId = bundle.getInt(JPushInterface.EXTRA_NOTIFICATION_ID);
//                Logger.d(TAG, "接收到推送下来的通知的ID: " + notifactionId);// cn.jpush.android.EXTRA
                String msg = bundle.getString(JPushInterface.EXTRA_EXTRA);
                // String msg = bundle.getString(JPushInterface.EXTRA_MESSAGE);
//                Logger.d(TAG, "接收到推送下来的通知==msg is " + msg);
                JPushInterface.clearAllNotifications(context);
                PushUtils.onNotificationReceived(context, msg);
            } else if (JPushInterface.ACTION_NOTIFICATION_OPENED.equals(intent.getAction())) {
                /**
                 * 会比 {@link #MiMsgReceiver onNotificationMessageClicked()}提前收到广播,
                 * 使onNotificationMessageClicked无响应！！
                 * 测试机型 htc one， 华为 p6
                 */
                PushUtils.onNotificationClicked(context, intent);
            } else if (JPushInterface.ACTION_RICHPUSH_CALLBACK.equals(intent.getAction())) {
                PushUtils.onReceiveRichpushCallback(context, bundle.getString(JPushInterface.EXTRA_EXTRA));
            } else {
//                Logger.d(TAG, "Unhandled intent - " + intent.getAction());
            }
        } catch (Exception e) {
        }
    }

    private void receivingNotification(Context context, Bundle bundle) {
        String title = bundle.getString(JPushInterface.EXTRA_NOTIFICATION_TITLE);
        String message = bundle.getString(JPushInterface.EXTRA_ALERT);
        String extras = bundle.getString(JPushInterface.EXTRA_EXTRA);
    }

    // 打印所有的 intent extra 数据
    private static String printBundle(Bundle bundle) {
        StringBuilder sb = new StringBuilder();
        for (String key : bundle.keySet()) {
            if (key.equals(JPushInterface.EXTRA_NOTIFICATION_ID)) {
                sb.append("\nkey:" + key + ", value:" + bundle.getInt(key));
            } else {
                sb.append("\nkey:" + key + ", value:" + bundle.getString(key));
            }
        }
        return sb.toString();
    }
}