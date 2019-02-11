package com.dalingjia.shop;

import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.os.StrictMode;
import android.support.multidex.MultiDex;
import android.util.Log;
import android.os.Process;

import com.brentvatne.react.ReactVideoPackage;
import com.dalingjia.shop.model.DeviceInfo;
import com.dalingjia.shop.utils.Constant;
import com.dalingjia.shop.utils.DBAdmin;
import com.dalingjia.shop.utils.DeviceInfoUtil;
import com.dalingjia.shop.utils.MD5Util;
import com.dalingjia.shop.utils.OSUtils;
import com.dalingjia.shop.utils.StringUtil;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.ReactApplication;
import com.beefe.picker.PickerViewPackage;
import com.huawei.android.hms.agent.HMSAgent;
import com.reactnativecomponent.barcode.RCTCapturePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.xiaomi.mipush.sdk.MiPushClient;

import java.io.File;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import javax.annotation.Nullable;

import cn.jpush.android.api.JPushInterface;

public class MainApplication extends Application implements ReactApplication {

    private ReactNativeHost mReactNativeHost;
    private static MainApplication mApp;
    private boolean isStart = false;
    public static final String APP_ID = "2882303761517620318";
    public static final String APP_KEY = "5221762037318";
    DeviceInfo deviceInfo;
    private String emuiVersion;

    public void initReactNativeHost() {
        mReactNativeHost = new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
                return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
                return Arrays.<ReactPackage>asList(
                        new RNMainReactPackage(),
                        new WeChatPackage(),
                        new UmengReactPackage(),
                        new AppPackage(),
                        new HttpCachePackage(),
                        new AlipayPackage(),
                        new JPushPackage(false, false),
                        new RCTCapturePackage(),
                        new ReactVideoPackage(),
                        new PickerViewPackage(),
                        new PickerPackage()
                );
            }

            @Nullable
            @Override
            protected String getJSBundleFile() {
                if (isApkDebugable()) {
                    return super.getJSBundleFile();
                }
                String jsBundleFile = getFilesDir().getAbsolutePath() + "/" + Constant.BUNDLE_NAME;
                File file = new File(jsBundleFile);
                return file != null && file.exists() ? jsBundleFile : super.getJSBundleFile();
            }
        };
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= 24) {
            StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
            StrictMode.setVmPolicy(builder.build());
        }
        mApp = this;
        Fresco.initialize(this);
        initReactNativeHost();
        SoLoader.init(this, /* native exopackage */ false);

        JPushInterface.setDebugMode(false);    // 设置开启日志,发布时请关闭日志
        JPushInterface.init(this);
        if (shouldInit()) {
            MiPushClient.registerPush(this, APP_ID, APP_KEY);
        }
        emuiVersion = OSUtils.getEmuiVersion();
        if (StringUtil.checkStr(emuiVersion)) {
            HMSAgent.init(this);
        }

        setPushTag();
        clearOldMsg();
    }

    public boolean isApkDebugable() {
        try {
            ApplicationInfo info = this.getApplicationInfo();
            return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception e) {

        }
        return false;
    }

    public static MainApplication getApplication() {
        return mApp;
    }

    public String getBundleVersion() {
        return "";
    }

    public String getBundleMD5() {
        String jsBundleFile = getFilesDir().getAbsolutePath() + "/" + Constant.BUNDLE_NAME;
        File file = new File(jsBundleFile);
        return file != null && file.exists() ? MD5Util.md5sum(jsBundleFile) : Constant.BUNDLE_SIGN;
    }

    private boolean shouldInit() {
        ActivityManager am = ((ActivityManager) getSystemService(Context.ACTIVITY_SERVICE));
        List<ActivityManager.RunningAppProcessInfo> processInfos = am.getRunningAppProcesses();
        String mainProcessName = getPackageName();
        int myPid = Process.myPid();
        for (ActivityManager.RunningAppProcessInfo info : processInfos) {
            if (info.pid == myPid && mainProcessName.equals(info.processName)) {
                return true;
            }
        }
        return false;
    }

    private void setPushTag() {
        deviceInfo = DeviceInfoUtil.getDeviceInfo(this);
        Set<String> tagSet = new LinkedHashSet<String>();
        if (StringUtil.checkStr(deviceInfo.getDeviceID()))
            tagSet.add(deviceInfo.getDeviceID());
        //   if (StringUtil.checkStr(UserData.userId))
        //        tagSet.add(UserData.userId);
        if (StringUtil.checkStr(deviceInfo.getSoftVersion())) {
            String appversion = deviceInfo.getSoftVersion();
            if (appversion.contains(".")) {
                appversion = appversion.replaceAll(".", "");
                tagSet.add(appversion);
            }
        }

        //  if (StringUtil.checkStr(UserData.userPhone))
        //         tagSet.add(UserData.userPhone);
        Log.e("deviceInfogetDeviceID==", deviceInfo.getDeviceID());
        if (StringUtil.checkStr(deviceInfo.getDeviceID())) {
            MiPushClient.setAlias(this, deviceInfo.getDeviceID(), null);
            JPushInterface.setAliasAndTags(this, deviceInfo.getDeviceID(),
                    tagSet, null);
        } else {
            JPushInterface.setAliasAndTags(this, null, tagSet, null);
        }
    }

    private void clearOldMsg() {
        try {
            DBAdmin.getInstance(mApp).deleteOldMessage(
                    System.currentTimeMillis(), 1);
        } catch (Exception e) {
        }
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }

    public String getEmuiVersion() {
        return emuiVersion;
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
           if (StringUtil.checkStr(emuiVersion)) {
              HMSAgent.destroy();
          }
    }
}
