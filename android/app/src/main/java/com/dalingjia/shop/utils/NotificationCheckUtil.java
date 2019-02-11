package com.dalingjia.shop.utils;

import android.app.Activity;
import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.support.annotation.RequiresApi;
import android.support.v4.app.FragmentManager;


import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * @author : gjg
 * @date : 2017/6/12
 * FileName: NotificationCheckUtil
 * @description:
 *  4.3以下，由于系统使用的AIDL机制中无法通过反射去改变其检测是否为系统应用的逻辑，所以无法得到通知开关状态
 *  这个是系统强制要求，所以该方法只适用于4.3及其以上，以下默认返回true
 */


public class NotificationCheckUtil {
    private static final String CHECK_OP_NO_THROW = "checkOpNoThrow";
    private static final String OP_POST_NOTIFICATION = "OP_POST_NOTIFICATION";

    public static boolean notificationIsOpen(Context context){
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){//API19+
            return notificationCheckFor19Up(context);
        }
        return true;
    }
    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    private static boolean notificationCheckFor19Up(Context context){
        AppOpsManager appOpsManager = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        ApplicationInfo applicationInfo = context.getApplicationInfo();
        String pkg = context.getApplicationContext().getPackageName();
        int uid = applicationInfo.uid;
        Class appOpsClass;

        try {
            appOpsClass = Class.forName(AppOpsManager.class.getName());
            Method checkOpNoThrowMethod = appOpsClass.getMethod(CHECK_OP_NO_THROW,Integer.TYPE,Integer.TYPE,String.class);
            Field opPostNotificationValue = appOpsClass.getDeclaredField(OP_POST_NOTIFICATION);
            int op = (int) opPostNotificationValue.get(Integer.class);
            return ((int)checkOpNoThrowMethod.invoke(appOpsManager,op,uid,pkg) == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return true;
    }


    private static void checkNotificationOpend(final Activity context,boolean jump2Setting){
        if(notificationIsOpen(context)){

        }else{
            if(jump2Setting){
                DialogUtil.showConfirmCancleDialog(context,
                         "您还没有打开通知，请前往设置中心设置", new DialogUtil.OnDialogUtilClickListener() {

                            @Override
                            public void onClick(boolean isLeft) {
                                // TODO Auto-generated method stub
                                if (!isLeft) {

                                    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                        Intent intent = new Intent();
                                        intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
                                        intent.putExtra("app_package", context.getPackageName());
                                        intent.putExtra("app_uid", context.getApplicationInfo().uid);
                                        context.startActivity(intent);
                                    } else if (android.os.Build.VERSION.SDK_INT == Build.VERSION_CODES.KITKAT) {
                                        Intent intent = new Intent();
                                        intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                                        intent.addCategory(Intent.CATEGORY_DEFAULT);
                                        intent.setData(Uri.parse("package:" + context.getPackageName()));
                                        context.startActivity(intent);
                                    }
                                }
                            }
                        });
            }else{
              //  listener.checkResult(false);
            }
        }
    }
}