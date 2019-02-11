package com.dalingjia.shop.utils;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.widget.Toast;


import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class SaveImageForShare {
    private List<File> files;
    private List<String> image;
    private boolean isTimeline;
    private String description;
    private Context mContext;

    /**
     * @param image      图片网址数组
     * @param isTimeline 是否是朋友圈
     */
    public SaveImageForShare(Context context, List<String> image, String description, boolean isTimeline) {
        this.image = image;
        this.isTimeline = isTimeline;
        this.description = description;
        this.mContext = context;

    }

    public void shareImage() {
        if (image == null || image.size() == 0) {
            return;
        }
        files = new ArrayList<File>();
        try {
            String storePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "dalingjia/shareImage";
            File appDir = new File(storePath);
            if (appDir.exists() && files.size() == 0) {
                //删除旧数据
                deleteFile(appDir, 3);
            }
            if (!appDir.exists()) {
                appDir.mkdirs();
            }
            for (int i = 0; i < image.size(); i++) {
                new SaveImage(appDir).execute(image.get(i));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void shareImage(File file) {
        files.add(file);
        if (files.size() != image.size()) {
            return;
        }
        new Thread(new Runnable() {
            @Override
            public void run() {

                try {
                    Intent intent = new Intent();
                    ComponentName comp;

                    if (!isTimeline) {
                        comp = new ComponentName("com.tencent.mm", "com.tencent.mm.ui.tools.ShareImgUI");
                    } else {
                        comp = new ComponentName("com.tencent.mm", "com.tencent.mm.ui.tools.ShareToTimeLineUI");
                        intent.putExtra("Kdescription", description);
                    }
                    intent.setComponent(comp);
                    intent.setAction(Intent.ACTION_SEND_MULTIPLE);
                    intent.setType("image/*");

                    ArrayList<Uri> imageUris = new ArrayList<Uri>();
                    for (File f : files) {
                        imageUris.add(Uri.fromFile(f));
                    }
                    intent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, imageUris);
                    mContext.startActivity(intent);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();

    }

    /***
     * 功能：用线程保存图片
     *
     */
    private class SaveImage extends AsyncTask<String, Void, File> {
        File appDir;

        public SaveImage(File appDir) {
            this.appDir = appDir;
        }

        @Override
        protected File doInBackground(String... params) {
            try {
                // 首先保存图片

                String fileName = MD5Util.encoder(params[0]) + ".jpg";
                File file = new File(appDir, fileName);
                if (file.exists()) {
                    return file;
                }
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
                return file;
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(File file) {
            if (file != null) {
                shareImage(file);
            } else {
                Toast.makeText(mContext, "图片下载失败，分享失败", Toast.LENGTH_LONG).show();
            }

        }
    }

    /**
     * @param file
     * @param days 过期时间
     * @return
     */
    private boolean deleteFile(File file, int days) {
        boolean isDelete = false;
        if (file == null || !file.exists()) {
            return true;
        } else if (file.isDirectory()) {
            File[] files = file.listFiles();
            if (files != null) {
                for (File f : files) {
                    isDelete = deleteFile(f, days);
                    if (!isDelete) {
                        return isDelete;
                    }
                }
            }
            return true;
            //   isDelete = file.delete();
        } else {
            if (System.currentTimeMillis() - file.lastModified() > days * 24 * 60 * 60 * 1000) {
                isDelete = file.delete();
            } else {
                isDelete = true;
            }
        }
        return isDelete;
    }
}
