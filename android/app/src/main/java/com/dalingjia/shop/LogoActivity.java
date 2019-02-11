package com.dalingjia.shop;

import android.content.Intent;
import android.graphics.drawable.Animatable;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.dalingjia.shop.model.Response.BundleVersionResponse;
import com.dalingjia.shop.network.BaseSubscriber;
import com.dalingjia.shop.network.DalingNetwork;
import com.dalingjia.shop.utils.Constant;
import com.dalingjia.shop.utils.MD5Util;
import com.dalingjia.shop.utils.StringUtil;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.drawee.controller.BaseControllerListener;
import com.facebook.drawee.controller.ControllerListener;
import com.facebook.drawee.interfaces.DraweeController;
import com.facebook.drawee.view.SimpleDraweeView;
import com.facebook.imagepipeline.animated.base.AbstractAnimatedDrawable;
import com.facebook.imagepipeline.image.ImageInfo;
import com.huawei.android.hms.agent.HMSAgent;
import com.huawei.android.hms.agent.common.handler.ConnectHandler;
import com.huawei.android.hms.agent.push.handler.GetTokenHandler;
import com.huawei.hms.api.ConnectionResult;
import com.huawei.hms.api.HuaweiApiClient;
import com.huawei.hms.support.api.push.HuaweiPush;
import com.huawei.hms.support.api.push.TokenResult;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;

import rx.Subscription;
import rx.android.schedulers.AndroidSchedulers;
import rx.schedulers.Schedulers;

public class LogoActivity extends AppCompatActivity implements HuaweiApiClient.ConnectionCallbacks,HuaweiApiClient.OnConnectionFailedListener {
    ProgressBar progressBar;
    TextView tv_update;
    ImageView iv_arrow;
    int mProgress = 0;
    long starTime;
    Uri uri;
    String pushMsg;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = getIntent();
        if (intent != null) {
            Bundle bundle = intent.getExtras();
            if(bundle!=null&&bundle.containsKey("pushMsg")) {
                pushMsg =bundle.getString("pushMsg");
            }
            String action = intent.getAction();
            if (Intent.ACTION_VIEW.equals(action)) {
                uri = intent.getData();
                if (Constant.isStart) {
                    Intent newIntent = new Intent(LogoActivity.this, MainActivity.class);
                    if (null != uri) {
                        newIntent.setData(uri);
                        newIntent.setAction(Intent.ACTION_VIEW);
                    }
                    startActivity(newIntent);
                    finish();
                    return;
                }
            }
        }
        setContentView(R.layout.activity_logo);
        progressBar = (ProgressBar) findViewById(R.id.progressBar);
        tv_update = (TextView) findViewById(R.id.tv_update);
        iv_arrow = (ImageView) findViewById(R.id.iv_arrow);
        SimpleDraweeView drawview = (SimpleDraweeView) findViewById(R.id.main_drawview);
        DraweeController mDraweeController = Fresco.newDraweeControllerBuilder()
                .setAutoPlayAnimations(true)
                .setUri(Uri.parse("res://" + getPackageName() + "/" + R.drawable.start))//设置uri
                .build();
        drawview.setController(mDraweeController);
        starTime = System.currentTimeMillis();
        requestData();
        if (StringUtil.checkStr(MainApplication.getApplication().getEmuiVersion())) {
            HMSAgent.connect(this, new ConnectHandler() {
                @Override
                public void onConnect(int rst) {
                    getToken();
                }
            });
        }
    }

    private Subscription subscribe;

    @Override
    protected void onDestroy() {
        if (subscribe != null && !subscribe.isUnsubscribed()) {
            subscribe.unsubscribe();
        }
        super.onDestroy();
    }

    /**
     * 请求网络
     */

    private void requestData() {

        subscribe = DalingNetwork
                .getDalingApi()
                .getBundleVersion()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new BaseSubscriber<BundleVersionResponse>() {
                    @Override
                    public void onError(Throwable e) {
                        startMainActivity();
                        e.printStackTrace();
                    }

                    @Override
                    public void onNext(final BundleVersionResponse response) {
                        if (response.status == 0) {
                            if (response.data != null) {
                                if (MainApplication.getApplication().getBundleMD5().equalsIgnoreCase(response.data.sign)) {
                                    //和本地版本相同，直接进入主页
                                    startMainActivity();
                                } else {
                                    //下载升级
                                    downloadSign = response.data.sign;
                                    downloadUrl = response.data.downloadUrl;
                                    downLoad(response.data.downloadUrl, response.data.sign);
                                }
                            }
                        } else {
                            startMainActivity();
                        }
                    }
                });
    }

    private void startMainActivity() {
        long time = System.currentTimeMillis() - starTime;
        if (time < 30000) {
            time = 3000 - time;
        }
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(LogoActivity.this, MainActivity.class);
                if (null != uri) {
                    intent.setData(uri);
                    intent.setAction(Intent.ACTION_VIEW);
                }
                if(StringUtil.checkStr(pushMsg)){
                    intent.putExtra("pushMsg",pushMsg);
                }
                startActivity(intent);
                finish();
            }
        }, 500 + time);


    }

    private void downLoad(final String url, final String sign) {
        String jsBundleFile = getFilesDir().getAbsolutePath() + "/" + filename;
        File file = new File(jsBundleFile);
        tv_update.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.VISIBLE);
        iv_arrow.setVisibility(View.VISIBLE);
        progressBar.setProgress(0);
        new Thread() {
            public void run() {
                try {
                    //下载文件，参数：第一个URL，第二个存放路径
                    down_file(url, getFilesDir().getAbsolutePath(), sign);
                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                    startMainActivity();
                }
            }
        }.start();
    }


    int fileSize;
    int downLoadFileSize;
    String downloadUrl, downloadSign;
    String filename = Constant.BUNDLE_NAME;
    private static final float PROGRESS_MAX = 100.0f;
    int downTimes = 0;
    //用来接收线程发送来的文件下载量，进行UI界面的更新
    private Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {//定义一个Handler，用于处理下载线程与UI间通讯
            if (!Thread.currentThread().isInterrupted()) {
                switch (msg.what) {
                    case 0:
                    case 1:
                        int result = downLoadFileSize * 100 / fileSize;
                        progressBar.setProgress(result);
                        RelativeLayout.LayoutParams arrowParams = (RelativeLayout.LayoutParams) iv_arrow.getLayoutParams();
                        float leftPosition = ((progressBar.getWidth() / PROGRESS_MAX) * (result - 2)) + progressBar.getLeft();
                        arrowParams.leftMargin = (int) Math.ceil(leftPosition);
                        iv_arrow.setLayoutParams(arrowParams);
                        break;
                    case 2:
                        MainApplication.getApplication().initReactNativeHost();
                        startMainActivity();
                        break;

                    case -1:
                        String error = msg.getData().getString("error");
                        if (downTimes >= 1) {
                            startMainActivity();
                        } else {
                            downTimes++;
                            downLoad(downloadUrl, downloadSign);
                        }
                        break;
                }
            }
            super.handleMessage(msg);
        }
    };

    /**
     * 文件下载
     *
     * @param url：文件的下载地址
     * @param path：文件保存到本地的地址
     * @throws IOException
     */
    public void down_file(String url, String path, String sign) throws IOException {
        //下载函数
        //获取文件名
        String filename1 = "down.js";
        URL myURL = new URL(url);
        URLConnection conn = myURL.openConnection();
        conn.connect();
        InputStream is = conn.getInputStream();
        this.fileSize = conn.getContentLength();//根据响应获取文件大小
        if (this.fileSize <= 0) throw new RuntimeException("无法获知文件大小 ");
        if (is == null) throw new RuntimeException("stream is null");
        File file1 = new File(path);
        File file2 = new File(path + "/" + filename1);
        if (!file1.exists()) {
            file1.mkdirs();
        }
        if (!file2.exists()) {
            file2.createNewFile();
        }
        FileOutputStream fos = new FileOutputStream(path + "/" + filename1);
        //把数据存入路径+文件名
        byte buf[] = new byte[1024];
        downLoadFileSize = 0;
        sendMsg(0);
        do {
            //循环读取
            int numread = is.read(buf);
            if (numread == -1) {
                break;
            }
            fos.write(buf, 0, numread);
            downLoadFileSize += numread;

            sendMsg(1);//更新进度条
        } while (true);
        if (MD5Util.md5sum(path + "/" + filename1).equalsIgnoreCase(sign)) {
            //文件合法，更新覆盖旧的js
            renameFile(path, filename1, filename);
        } else {
            file2.delete();
        }
        sendMsg(2);//通知下载完成

        try {
            is.close();
        } catch (Exception ex) {
        }

    }

    /** */
    /**
     * 文件重命名
     *
     * @param path    文件目录
     * @param oldname 原来的文件名
     * @param newname 新文件名
     */
    public void renameFile(String path, String oldname, String newname) {
        if (!oldname.equals(newname)) {//新的文件名和以前文件名不同时,才有必要进行重命名
            File oldfile = new File(path + "/" + oldname);
            File newfile = new File(path + "/" + newname);
            if (!oldfile.exists()) {
                return;//重命名文件不存在
            }
            if (newfile.exists())//若在该目录下已经有一个文件和新文件名相同，则不允许重命名
                newfile.delete();
            oldfile.renameTo(newfile);
        } else {
            System.out.println("新文件名和旧文件名相同...");
        }
    }

    //在线程中向Handler发送文件的下载量，进行UI界面的更新
    private void sendMsg(int flag) {
        Message msg = new Message();
        msg.what = flag;
        handler.sendMessage(msg);
    }

    /**
     * 获取token
     */
    private void getToken() {
        HMSAgent.Push.getToken(new GetTokenHandler() {

            @Override
            public void onResult(int rst) {
                Log.e("HMSAgent.getToken=","get token: end" + rst);
            }
        });
    }

    @Override
    public void onConnected() {

    }

    @Override
    public void onConnectionSuspended(int i) {

    }

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        Log.e("ConnectionResult",connectionResult.getErrorCode()+"---");
    }
}
