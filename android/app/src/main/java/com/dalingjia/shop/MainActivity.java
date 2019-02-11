package com.dalingjia.shop;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.dalingjia.shop.utils.Constant;
import com.dalingjia.shop.utils.NotificationCheckUtil;
import com.dalingjia.shop.utils.StringUtil;
import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.umeng.analytics.MobclickAgent;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Bootstrap";
    }

    @Override
    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MobclickAgent.setDebugMode(false);
        // SDK在统计Fragment时，需要关闭Activity自带的页面统计，
        // 然后在每个页面中重新集成页面统计的代码(包括调用了 onResume 和 onPause 的Activity)。
        MobclickAgent.openActivityDurationTrack(false);
        // MobclickAgent.setAutoLocation(true);
        // MobclickAgent.setSessionContinueMillis(1000);
        // MobclickAgent.startWithConfigure(
        // new UMAnalyticsConfig(mContext, "4f83c5d852701564c0000011", "Umeng",
        // EScenarioType.E_UM_NORMAL));
        MobclickAgent.setScenarioType(this, MobclickAgent.EScenarioType.E_UM_NORMAL);
        Constant.isStart = true;
        //NotificationCheckUtil.checkNotificationOpend(this,true);
        Intent intent = getIntent();
        if (intent != null) {
            Bundle bundle = intent.getExtras();
            if (bundle != null && bundle.containsKey("pushMsg")) {
                String pushMsg = bundle.getString("pushMsg");
                if (StringUtil.checkStr(pushMsg)) {
                    WritableMap params = Arguments.createMap();
                    params.putString("pushMsg", pushMsg);
                    sentPushEvent(params);
                }
            }
        }
    }

    private void sentPushEvent(WritableMap params) {
        try {
            MainApplication.getApplication().getReactNativeHost().getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("EventPush", params);
        } catch (Exception e) {

        }
    }
}
