package com.dalingjia.shop.push;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.os.Looper;
import android.support.v4.app.NotificationCompat;

import cn.jpush.android.api.JPushInterface;

import com.dalingjia.shop.R;
import com.dalingjia.shop.constants.ParamsKey;
import com.dalingjia.shop.utils.DBAdmin;
import com.dalingjia.shop.utils.StringUtil;
import com.xiaomi.mipush.sdk.MiPushClient;

public class MyPushService extends IntentService {

    private static final String TAG = "MyPushService";


    private Context mContext;
    private NotificationManager mNotificationManager;

    public MyPushService() {
        super("MyPushService");
    }

    public MyPushService(String name) {
        super("MyPushService");
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mContext = this;
        mNotificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Bundle bundle = getIn.getExtras();
        try {
            String msg = intent.getStringExtra(ParamsKey.PUSH_MESSAGE);
            showNotify(msg);
        } catch (Exception e) {
            // TODO: handle exception
            e.printStackTrace();
        }

        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return super.onBind(intent);
    }

    @Override
    protected void onHandleIntent(Intent intent) {
    }

    private void showNotify(String message) {
        if (!StringUtil.checkStr(message))
            return;
        try {

            JSONObject jsonObj = new JSONObject(message);
            String id = jsonObj.optString("id");
            //
            if (DBAdmin.getInstance(mContext).hasMessage(id)) {
                return;
            } else {
                DBAdmin.getInstance(mContext).savePushMsg(id, message);
            }
            MiPushClient.clearNotification(mContext);
            final String tit = jsonObj.optString("tit");
            final String msg = jsonObj.optString("msg");
            final Intent intent = new Intent();
            intent.putExtra("pushMsg", message);
            intent.setClass(mContext, MyReceiver.class);
            intent.setAction(JPushInterface.ACTION_NOTIFICATION_OPENED);
            showNotif(tit, msg, intent);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 显示通知栏
     *
     * @param title
     * @param summary
     * @param intent
     */
    void showNotif(String title, String summary, Intent intent) {


        //PendingIntent contentIntent = PendingIntent.getActivity(mContext, 0,
        //intent, PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent contentIntent = PendingIntent.getBroadcast(mContext, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(
                this)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(summary)
                .setContentIntent(contentIntent)
                .setAutoCancel(true)
                .setDefaults(Notification.DEFAULT_ALL)
                .setStyle(
                        new NotificationCompat.BigTextStyle().bigText(summary));
        NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        mNotificationManager.notify(0, builder.build());
    }
}