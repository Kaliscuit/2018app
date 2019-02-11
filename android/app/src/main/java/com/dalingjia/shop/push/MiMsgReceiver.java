package com.dalingjia.shop.push;

import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.dalingjia.shop.utils.DBAdmin;
import com.xiaomi.mipush.sdk.MiPushClient;
import com.xiaomi.mipush.sdk.MiPushCommandMessage;
import com.xiaomi.mipush.sdk.MiPushMessage;
import com.xiaomi.mipush.sdk.PushMessageReceiver;

/**
 * 小米push Receiver
 *
 */
public class MiMsgReceiver extends PushMessageReceiver {
    
    private Handler mHandler = new Handler(Looper.getMainLooper());
    
    /**
     * 在子线程 接收服务器向客户端发送的透传消息
     */
    @Override
    public void onReceivePassThroughMessage(final Context context, MiPushMessage message){
    	final String content = message.getContent();
		mHandler.post(new Runnable() {
			@Override
			public void run() {
				PushUtils.onMessageReceived(context, content);
			}
		});
    }
    
    /**
     * 在子线程 接收服务器向客户端发送的通知消息,
     * 这个回调方法会在用户手动点击通知后触发
     */
    @Override
    public void onNotificationMessageClicked(final Context context, MiPushMessage message){
    	String content = message.getContent();
    //	Log.e("XiaoMicontent",content);
    	final Intent intent = new Intent();
    	intent.putExtra("pushMsg",content);
		PushUtils.onNotificationClicked(context, intent);
    }
    
    /**
     * 在子线程 接收服务器向客户端发送的通知消息，
     * 这个回调方法是在通知消息到达客户端时触发。
     * 另外应用在前台时不弹出通知的通知消息到达客户端也会触发这个回调函数
     */
    @Override
    public void onNotificationMessageArrived(final Context context, final MiPushMessage message){

    	final String content = message.getContent();
		Log.e("XiaoMicontent22",content);
    	mHandler.post(new Runnable() {
			@Override
			public void run() {
				JSONObject jsonObj;
				try {
					jsonObj = new JSONObject(content);
					String id = jsonObj.optString("id");
					String msg = jsonObj.optString("msg");
					if(DBAdmin.getInstance(context).hasMessage(id)){
						MiPushClient.clearNotification(context,message.getNotifyId());
					} else {
						DBAdmin.getInstance(context).savePushMsg(id, msg);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
    }

    /**
     * 在子线程 接收客户端向服务器发送命令后的响应结果
     */
    @Override
    public void onCommandResult(Context context, MiPushCommandMessage message) {
    }
    
    /**
     * 在子线程 接收客户端向服务器发送注册命令后的响应结果
     */
    @Override
    public void onReceiveRegisterResult(Context context, MiPushCommandMessage message){
    }
}
