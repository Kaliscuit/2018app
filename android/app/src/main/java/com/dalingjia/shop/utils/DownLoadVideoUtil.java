package com.dalingjia.shop.utils;

import android.app.Activity;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.widget.Toast;

import com.dalingjia.shop.R;
import com.facebook.react.bridge.Promise;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

public class DownLoadVideoUtil {
    private Context mContext;
    private NotificationManager notificationManager;
    private NotificationCompat.Builder builder;
    private String url;
    private String storePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "dalingjia/video";
    private String fileName;
    private static final int NOTIFICATION_ID = 0x3;
    Promise promise;

    public DownLoadVideoUtil(Context context, String url, String fileName, Promise promise) {
        this.mContext = context;
        this.url = url;
        this.fileName = fileName;
        this.promise = promise;
        notificationManager = (NotificationManager) context.getSystemService(Activity.NOTIFICATION_SERVICE);
        builder = new NotificationCompat.Builder(context);
    }

    public void downloadVideo() {
        new MyAsyncTask().execute(url);
    }

    private class MyAsyncTask extends AsyncTask<String, Integer, Integer> {
        long file_length;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            builder.setSmallIcon(R.mipmap.ic_launcher)
                    .setContentInfo("下载中...")
                    .setContentTitle("正在下载");
        }

        @Override
        protected Integer doInBackground(String... params) {
            InputStream is = null;
            OutputStream os = null;
            HttpURLConnection connection = null;
            int total_length = 0;
            try {
                URL url1 = new URL(params[0]);
                connection = (HttpURLConnection) url1.openConnection();
                connection.setRequestMethod("GET");
                connection.setReadTimeout(50000);
                connection.connect();
                if (connection.getResponseCode() == 200) {
                    is = connection.getInputStream();
                    File appDir = new File(storePath);
                    if (!appDir.exists()) {
                        appDir.mkdirs();
                    }
                    File file = new File(appDir, fileName);
                    os = new FileOutputStream(file);
                    byte[] buf = new byte[1024];
                    int len;
                    int pro1 = 0;
                    int pro2 = 0;
                    // 获取文件流大小，用于更新进度
                    file_length = connection.getContentLength();
                    while ((len = is.read(buf)) != -1) {
                        total_length += len;
                        if (file_length > 0) {
                            pro1 = (int) ((total_length / (float) file_length) * 100);//传递进度（注意顺序）
                        }
                        if (pro1 != pro2) {
                            // 调用update函数，更新进度
                            publishProgress(pro2 = pro1);
                        }
                        os.write(buf, 0, len);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                try {
                    if (is != null) {
                        is.close();
                    }
                    if (os != null) {
                        os.close();
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
                if (connection != null) {
                    connection.disconnect();
                }
            }
            return total_length;
        }

        @Override
        protected void onCancelled(Integer integer) {
            super.onCancelled(integer);
        }

        @Override
        protected void onCancelled() {
            super.onCancelled();
        }

        @Override
        protected void onProgressUpdate(Integer... values) {
            super.onProgressUpdate(values);
            builder.setProgress(100, values[0], false);
            //下载进度提示
            builder.setContentText("下载" + values[0] + "%");
            notificationManager.notify(NOTIFICATION_ID, builder.build());

        }

        @Override
        protected void onPostExecute(Integer integer) {
            super.onPostExecute(integer);
            if (integer == file_length) {
                if (promise != null) {
                    promise.resolve("成功");
                }
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                openAssignFolder(storePath + "/" + fileName);
                Toast.makeText(mContext, "下载完成", Toast.LENGTH_SHORT).show();
            } else {
                if (promise != null) {
                    promise.reject("Error", "下载失败");
                }
                notificationManager.cancel(NOTIFICATION_ID);
                Toast.makeText(mContext, "网络不稳定，下载失败", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void openAssignFolder(String path) {
        File file = new File(path);
        if (null == file || !file.exists()) {
            return;
        }
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_DEFAULT);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setDataAndType(Uri.fromFile(file), "*/*");
        PendingIntent pendingIntent = PendingIntent.getActivity(mContext, 0, Intent.createChooser(intent, "Open folder"), PendingIntent.FLAG_UPDATE_CURRENT);
        builder.setContentTitle("下载完成")
                .setContentText("点击查看")
                .setContentInfo("")
                .setAutoCancel(true)//点击后消失
                .setContentIntent(pendingIntent);
        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }
}
