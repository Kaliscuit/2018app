package com.dalingjia.shop;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.widget.Toast;

import com.dalingjia.shop.model.DeviceInfo;
import com.dalingjia.shop.utils.CaptchaUtil;
import com.dalingjia.shop.utils.DeviceInfoUtil;
import com.dalingjia.shop.utils.DownLoadVideoUtil;
import com.dalingjia.shop.utils.NetworkUtil;
import com.dalingjia.shop.utils.NotificationCheckUtil;
import com.dalingjia.shop.utils.SharedPreferencesUtils;
import com.dalingjia.shop.utils.StringUtil;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

/**
 * APP自定义接口
 */
public class AppModule extends ReactContextBaseJavaModule {
    public static final String NAME = "AppModule";
    private Context mContext;
    DeviceInfo deviceInfo;

    public AppModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        deviceInfo = DeviceInfoUtil.getDeviceInfo(mContext);
    }

    private void initDeviceInfo() {
        if (deviceInfo == null)
            deviceInfo = DeviceInfoUtil.getDeviceInfo(mContext);

    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void toast(String msg) {
        Toast.makeText(mContext, msg, Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getDeviceId(Callback callback) {
        // 获取DeviceID
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getDeviceID());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppVersionCode(Callback callback) {
        // 因为IOS已经提交审核，为了统一所以此方法为获取版本名称
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getSoftVersion());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppPlatform(Callback callback) {
        // 获取来源
        callback.invoke(null, "android");
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppVersion(Callback callback) {
        // 获取getAppVersionCode
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getAppVersionCode());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppDeviceModel(Callback callback) {
        // 获取设备型号
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getDeviceModel());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppDeviceProduct(Callback callback) {
        //制造厂商
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getDeviceBrand());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppNetType(Callback callback) {
        //网络类型
        callback.invoke(null, NetworkUtil.getCurrentNetworkTypeName(mContext));
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppChanel(Callback callback) {
        //渠道来源
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getAppChanel());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getAppOSVersion(Callback callback) {
        //手机系统版本
        if (deviceInfo == null) {
            initDeviceInfo();
        }
        callback.invoke(null, deviceInfo.getSystemVersion());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void getBundleMD5(Callback callback) {
        //bundleMD5
        callback.invoke(null, MainApplication.getApplication().getBundleMD5());
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void saveImageToAlbum(String url, Callback callback) {
        if (StringUtil.checkStr(url)) {
            new SaveImage(callback).execute(url);
        }
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void saveVideoToAlbum(String url,String fileName, Promise promise) {
        if (StringUtil.checkStr(url)) {
          //new SaveVideo(promise).execute(url,fileName);
            new DownLoadVideoUtil( getCurrentActivity(),url,fileName,promise).downloadVideo();
        }
    }

    @ReactMethod
    @SuppressWarnings("unused")
    public void restartApp(String url,Callback callback) {

        Intent newIntent = new Intent(getCurrentActivity(), LogoActivity.class);
        if (StringUtil.checkStr(url)) {
            newIntent.setData(Uri.parse(url));
            newIntent.setAction(Intent.ACTION_VIEW);
        }
        getCurrentActivity().startActivity(newIntent);
        getCurrentActivity().finish();
        callback.invoke(null,true);
    }

    /**
     * 弹出验证码框
     * @param captchaId
     * @param promise
     */
    @ReactMethod
    @SuppressWarnings("unused")
    public void startValidateV2(String captchaId,Promise promise) {
        new CaptchaUtil(getCurrentActivity(),captchaId).startValidate();
    }

    /**
     * 判断是否打开了push
     * @param callback
     */
    @ReactMethod
    @SuppressWarnings("unused")
    public void getPushStatus(Callback callback) {
        callback.invoke(null, NotificationCheckUtil.notificationIsOpen(mContext));
    }

    /**
     * 跳转系统设置推送
     */
    @ReactMethod
    @SuppressWarnings("unused")
    public void openPushSetting() {
        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Intent intent = new Intent();
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.putExtra("app_package", mContext.getPackageName());
            intent.putExtra("app_uid", mContext.getApplicationInfo().uid);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mContext.startActivity(intent);
        } else if (android.os.Build.VERSION.SDK_INT == Build.VERSION_CODES.KITKAT) {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.addCategory(Intent.CATEGORY_DEFAULT);
            intent.setData(Uri.parse("package:" + mContext.getPackageName()));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mContext.startActivity(intent);
        }
    }
    /**
     * 获取华为PushToken
     * @param promise
     */
    @ReactMethod
    @SuppressWarnings("unused")
    public void getHWPushToken(Promise promise){
        if(promise!=null) {
            promise.resolve(new SharedPreferencesUtils(mContext, "HWTOKEN").getStringData("token"));
        }
    }

    /***
     * 功能：用线程保存图片
     *
     */
    private class SaveImage extends AsyncTask<String, Void, String> {
        Callback callback;
        boolean isSucced = false;

        public SaveImage(Callback callback) {
            this.callback = callback;
        }

        @Override
        protected String doInBackground(String... params) {
            String result = "";
            try {
                // 首先保存图片
                String storePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "dalingjia/image";
                File appDir = new File(storePath);
                if (!appDir.exists()) {
                    appDir.mkdirs();
                }
                String fileName = System.currentTimeMillis() + ".jpg";
                File file = new File(appDir, fileName);

                InputStream inputStream = null;
                URL url = new URL(params[0]);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(20000);
                if (conn.getResponseCode() == 200) {
                    inputStream = conn.getInputStream();
                }
                byte[] buffer = new byte[4096];
                int len = 0;
                FileOutputStream outStream = new FileOutputStream(file);
                while ((len = inputStream.read(buffer)) != -1) {
                    outStream.write(buffer, 0, len);
                }
                outStream.close();
                //保存图片后发送广播通知更新数据库
                Uri uri = Uri.fromFile(file);
                mContext.sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri));
                result = "图片已保存至：" + file.getAbsolutePath();
                isSucced = true;
            } catch (Exception e) {
                result = "保存失败！" + e.getLocalizedMessage();
                isSucced = false;
            }
            return result;
        }

        @Override
        protected void onPostExecute(String result) {
            callback.invoke(null, isSucced);
            Toast.makeText(mContext, result, Toast.LENGTH_SHORT).show();
        }
    }
    /***
     * 功能：用线程保存视频
     *
     */
    private class SaveVideo extends AsyncTask<String, Void, String> {
        Promise promise;
        boolean isSucced = false;

        public SaveVideo(Promise promise) {
            this.promise = promise;
        }

        @Override
        protected String doInBackground(String... params) {
            String result = "";
            try {
                // 首先保存视频
                String storePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "dalingjia/video";
                File appDir = new File(storePath);
                if (!appDir.exists()) {
                    appDir.mkdirs();
                }
                String fileName = params[1];
                File file = new File(appDir, fileName);

                InputStream inputStream = null;
                URL url = new URL(params[0]);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(20000);
                if (conn.getResponseCode() == 200) {
                    inputStream = conn.getInputStream();
                }
                byte[] buffer = new byte[4096];
                int len = 0;
                FileOutputStream outStream = new FileOutputStream(file);
                while ((len = inputStream.read(buffer)) != -1) {
                    outStream.write(buffer, 0, len);
                }
                outStream.close();
                //保存图片后发送广播通知更新数据库
                Uri uri = Uri.fromFile(file);
                mContext.sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri));
                result = "视频已保存至：" + file.getAbsolutePath();
                isSucced = true;
            } catch (Exception e) {
                result = "保存失败！" + e.getLocalizedMessage();
                isSucced = false;
            }
            return result;
        }

        @Override
        protected void onPostExecute(String result) {
            if(promise!=null) {
                if(isSucced){
                    promise.resolve(result);
                }else{
                    promise.reject("Error",result);
                }

            }
            Toast.makeText(mContext, result, Toast.LENGTH_SHORT).show();
        }
    }
}
