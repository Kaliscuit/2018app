package com.dalingjia.shop;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.support.annotation.Nullable;

import com.dalingjia.shop.utils.SaveImageForShare;
import com.dalingjia.shop.utils.StringUtil;
import com.dalingjia.shop.utils.WechatUtil;
import com.facebook.common.executors.UiThreadImmediateExecutorService;
import com.facebook.common.references.CloseableReference;
import com.facebook.common.util.UriUtil;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.imagepipeline.common.ResizeOptions;
import com.facebook.imagepipeline.core.ImagePipeline;
import com.facebook.imagepipeline.datasource.BaseBitmapDataSubscriber;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX;
import com.tencent.mm.opensdk.modelmsg.WXFileObject;
import com.tencent.mm.opensdk.modelmsg.WXImageObject;
import com.tencent.mm.opensdk.modelmsg.WXMediaMessage;
import com.tencent.mm.opensdk.modelmsg.WXMiniProgramObject;
import com.tencent.mm.opensdk.modelmsg.WXMusicObject;
import com.tencent.mm.opensdk.modelmsg.WXTextObject;
import com.tencent.mm.opensdk.modelmsg.WXVideoObject;
import com.tencent.mm.opensdk.modelmsg.WXWebpageObject;
import com.tencent.mm.opensdk.modelpay.PayReq;
import com.tencent.mm.opensdk.modelpay.PayResp;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Created by tdzl2_000 on 2015-10-10.
 */
public class WeChatModule extends ReactContextBaseJavaModule implements IWXAPIEventHandler {
    private String appId;

    private IWXAPI api = null;
    private final static String NOT_REGISTERED = "registerApp required.";
    private final static String INVOKE_FAILED = "WeChat API invoke returns false.";
    private final static String INVALID_ARGUMENT = "invalid argument.";

    public WeChatModule(ReactApplicationContext context) {
        super(context);
    }

    private static final int THUMB_SIZE = 150;

    @Override
    public String getName() {
        return "WeChat";
    }

    /**
     * fix Native module WeChatModule tried to override WeChatModule for module name RCTWeChat.
     * If this was your intention, return true from WeChatModule#canOverrideExistingModule() bug
     *
     * @return
     */
    public boolean canOverrideExistingModule() {
        return true;
    }

    private static ArrayList<WeChatModule> modules = new ArrayList<>();

    @Override
    public void initialize() {
        super.initialize();
        modules.add(this);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (api != null) {
            api = null;
        }
        modules.remove(this);
    }

    public static void handleIntent(Intent intent) {
        for (WeChatModule mod : modules) {
            mod.api.handleIntent(intent, mod);
        }
    }

    @ReactMethod
    public void registerApp(String appid, Callback callback) {
        this.appId = appid;
        api = WXAPIFactory.createWXAPI(this.getReactApplicationContext().getBaseContext(), appid, true);
        callback.invoke(null, api.registerApp(appid));
    }

    @ReactMethod
    public void isWXAppInstalled(Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        callback.invoke(null, api.isWXAppInstalled());
    }

    @ReactMethod
    public void isWXAppSupportApi(Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        callback.invoke(null, api.isWXAppSupportAPI());
    }

    @ReactMethod
    public void getApiVersion(Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        callback.invoke(null, api.getWXAppSupportAPI());
    }

    @ReactMethod
    public void openWXApp(Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        callback.invoke(null, api.openWXApp());
    }

    @ReactMethod
    public void sendAuthRequest(String scope, String state, Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        SendAuth.Req req = new SendAuth.Req();
        req.scope = scope;
        req.state = state;
        callback.invoke(null, api.sendReq(req));
    }

    @ReactMethod
    public void shareToTimeline(ReadableMap data, Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        _share(SendMessageToWX.Req.WXSceneTimeline, data, callback);
    }

    @ReactMethod
    public void shareToSession(ReadableMap data, Callback callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED);
            return;
        }
        _share(SendMessageToWX.Req.WXSceneSession, data, callback);
    }

    @ReactMethod
    public void shareImagesToTimeline(ReadableMap data, Callback callback) {
        if (api == null) {
            if (callback != null)
                callback.invoke(NOT_REGISTERED);
            return;
        }
        shareImages(data, true);
    }

    @ReactMethod
    public void shareImagesToSession(ReadableMap data, Callback callback) {
        if (api == null) {
            if (callback != null)
                callback.invoke(NOT_REGISTERED);
            return;
        }
        shareImages(data, false);
    }

    private void shareImages(ReadableMap data, boolean isTimeline) {
        String description = "";
        List<String> imageList = new ArrayList<String>();
        if (data != null && data.hasKey("description")) {
            description = data.getString("description");
        }
        if (data != null && data.hasKey("images")) {
            String images = data.getString("images");
            if (StringUtil.checkStr(images)) {
                String[] imageArray = images.split("\\|");
                for (int i=0;i<imageArray.length;i++){
                    imageList.add(imageArray[i]);
                }
            }
        }
        new SaveImageForShare(getReactApplicationContext(), imageList, description, isTimeline).shareImage();
    }

    @ReactMethod
    public void pay(ReadableMap data, Callback callback) {
        PayReq payReq = new PayReq();
        if (data.hasKey("partnerId")) {
            payReq.partnerId = data.getString("partnerId");
        }
        if (data.hasKey("prepayId")) {
            payReq.prepayId = data.getString("prepayId");
        }
        if (data.hasKey("nonceStr")) {
            payReq.nonceStr = data.getString("nonceStr");
        }
        if (data.hasKey("timeStamp")) {
            payReq.timeStamp = data.getString("timeStamp");
        }
        if (data.hasKey("sign")) {
            payReq.sign = data.getString("sign");
        }
        if (data.hasKey("package")) {
            payReq.packageValue = data.getString("package");
        }
        if (data.hasKey("extData")) {
            payReq.extData = data.getString("extData");
        }
        payReq.appId = appId;
        callback.invoke(api.sendReq(payReq) ? null : INVOKE_FAILED);
    }

    private void _share(final int scene, final ReadableMap data, final Callback callback) {
        Uri uri = null;
        if (data.hasKey("thumbImage")) {
            String imageUrl = data.getString("thumbImage");

            try {
                uri = Uri.parse(imageUrl);
                // Verify scheme is set, so that relative uri (used by static resources) are not handled.
                if (uri.getScheme() == null) {
                    uri = getResourceDrawableUri(getReactApplicationContext(), imageUrl);
                }
            } catch (Exception e) {
                // ignore malformed uri, then attempt to extract resource ID.
            }
        }

        if (uri != null) {
            this._getImage(uri, new ResizeOptions(100, 100), new ImageCallback() {
                @Override
                public void invoke(@Nullable Bitmap bitmap) {
                    WeChatModule.this._share(scene, data, bitmap, callback);
                }
            });
        } else {
            this._share(scene, data, null, callback);
        }
    }

    private void _getImage(Uri uri, ResizeOptions resizeOptions, final ImageCallback imageCallback) {
        BaseBitmapDataSubscriber dataSubscriber = new BaseBitmapDataSubscriber() {
            @Override
            protected void onNewResultImpl(Bitmap bitmap) {
                bitmap = bitmap.copy(bitmap.getConfig(), true);
                imageCallback.invoke(bitmap);
            }

            @Override
            protected void onFailureImpl(DataSource<CloseableReference<CloseableImage>> dataSource) {
                imageCallback.invoke(null);
            }
        };

        ImageRequestBuilder builder = ImageRequestBuilder.newBuilderWithSource(uri);
        if (resizeOptions != null) {
            builder = builder.setResizeOptions(resizeOptions);
        }
        ImageRequest imageRequest = builder.build();

        ImagePipeline imagePipeline = Fresco.getImagePipeline();
        DataSource<CloseableReference<CloseableImage>> dataSource = imagePipeline.fetchDecodedImage(imageRequest, null);
        dataSource.subscribe(dataSubscriber, UiThreadImmediateExecutorService.getInstance());
    }

    private static Uri getResourceDrawableUri(Context context, String name) {
        if (name == null || name.isEmpty()) {
            return null;
        }
        name = name.toLowerCase().replace("-", "_");
        int resId = context.getResources().getIdentifier(
                name,
                "drawable",
                context.getPackageName());

        if (resId == 0) {
            return null;
        } else {
            return new Uri.Builder()
                    .scheme(UriUtil.LOCAL_RESOURCE_SCHEME)
                    .path(String.valueOf(resId))
                    .build();
        }
    }

    private void _share(final int scene, final ReadableMap data, final Bitmap thumbImage, final Callback callback) {
        if (!data.hasKey("type")) {
            callback.invoke(INVALID_ARGUMENT);
            return;
        }
        String type = data.getString("type");

        WXMediaMessage.IMediaObject mediaObject = null;
        if (type.equals("news")) {
            mediaObject = _jsonToWebpageMedia(data);
        } else if (type.equals("text")) {
            mediaObject = _jsonToTextMedia(data);
        } else if (type.equals("imageUrl") || type.equals("imageResource")) {
            __jsonToImageUrlMedia(data, new MediaObjectCallback() {
                @Override
                public void invoke(@Nullable WXMediaMessage.IMediaObject mediaObject) {
                    if (mediaObject == null) {
                        callback.invoke(INVALID_ARGUMENT);
                    } else {
                        WeChatModule.this._share(scene, data, thumbImage, mediaObject, callback);
                    }
                }
            });
            return;
        } else if (type.equals("imageFile")) {
            __jsonToImageFileMedia(data, new MediaObjectCallback() {
                @Override
                public void invoke(@Nullable WXMediaMessage.IMediaObject mediaObject) {
                    if (mediaObject == null) {
                        callback.invoke(INVALID_ARGUMENT);
                    } else {
                        WeChatModule.this._share(scene, data, thumbImage, mediaObject, callback);
                    }
                }
            });
            return;
        } else if (type.equals("video")) {
            mediaObject = __jsonToVideoMedia(data);
        } else if (type.equals("audio")) {
            mediaObject = __jsonToMusicMedia(data);
        } else if (type.equals("file")) {
            mediaObject = __jsonToFileMedia(data);
        } else if (type.equals("mini")) {
            shareToWXMINI(scene, data, thumbImage, callback);
            return;
        }

        if (mediaObject == null) {
            callback.invoke(INVALID_ARGUMENT);
        } else {
            _share(scene, data, thumbImage, mediaObject, callback);
        }
    }

    private void _share(int scene, ReadableMap data, Bitmap thumbImage, WXMediaMessage.IMediaObject mediaObject, Callback callback) {

        WXMediaMessage message = new WXMediaMessage();
        message.mediaObject = mediaObject;

        if (thumbImage != null) {
            message.setThumbImage(thumbImage);
        }

        if (data.hasKey("title")) {
            message.title = data.getString("title");
        }
        if (data.hasKey("description")) {
            message.description = data.getString("description");
        }
        if (data.hasKey("mediaTagName")) {
            message.mediaTagName = data.getString("mediaTagName");
        }
        if (data.hasKey("messageAction")) {
            message.messageAction = data.getString("messageAction");
        }
        if (data.hasKey("messageExt")) {
            message.messageExt = data.getString("messageExt");
        }

        SendMessageToWX.Req req = new SendMessageToWX.Req();
        req.message = message;
        req.scene = scene;
        req.transaction = UUID.randomUUID().toString();
        callback.invoke(null, api.sendReq(req));
    }

    private void shareToWXMINI(int scene, ReadableMap data, Bitmap thumbImage, Callback callback) {
        WXMiniProgramObject miniProgram = new WXMiniProgramObject();
        if (data.hasKey("webpageUrl")) {
            miniProgram.webpageUrl = data.getString("webpageUrl");
        }
        if (data.hasKey("userName")) {
            miniProgram.userName = data.getString("userName");
        }
        if (data.hasKey("path")) {
            miniProgram.path = data.getString("path");
        }
        WXMediaMessage msg = new WXMediaMessage(miniProgram);

        if (data.hasKey("title")) {
            msg.title = data.getString("title");
        }
        if (data.hasKey("description")) {
            msg.description = data.getString("description");
        }
        if (thumbImage == null) {

            Bitmap bmp = BitmapFactory.decodeResource(getReactApplicationContext().getResources(), R.mipmap.send_music_thumb);
            Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, THUMB_SIZE, THUMB_SIZE, true);
            bmp.recycle();
            msg.thumbData = WechatUtil.bmpToByteArray(thumbBmp, true);
            SendMessageToWX.Req req = new SendMessageToWX.Req();
            req.transaction = buildTransaction("webpage");
            req.message = msg;
            req.scene = scene;
            callback.invoke(null, api.sendReq(req));
        } else {
//            msg.thumbData = WechatUtil.bmpToByteArray(thumbImage, true);
            //异步获取图片后分享
            new MyAsyncTask(msg, callback, scene).execute(data.getString("thumbImage"));
        }

    }

    private String buildTransaction(final String type) {
        return (type == null) ? String.valueOf(System.currentTimeMillis()) : type + System.currentTimeMillis();
    }

    private WXTextObject _jsonToTextMedia(ReadableMap data) {
        if (!data.hasKey("description")) {
            return null;
        }

        WXTextObject ret = new WXTextObject();
        ret.text = data.getString("description");
        return ret;
    }

    private WXWebpageObject _jsonToWebpageMedia(ReadableMap data) {
        if (!data.hasKey("webpageUrl")) {
            return null;
        }

        WXWebpageObject ret = new WXWebpageObject();
        ret.webpageUrl = data.getString("webpageUrl");
        if (data.hasKey("extInfo")) {
            ret.extInfo = data.getString("extInfo");
        }
        return ret;
    }

    private void __jsonToImageMedia(String imageUrl, final MediaObjectCallback callback) {
        Uri imageUri;
        try {
            imageUri = Uri.parse(imageUrl);
            // Verify scheme is set, so that relative uri (used by static resources) are not handled.
            if (imageUri.getScheme() == null) {
                imageUri = getResourceDrawableUri(getReactApplicationContext(), imageUrl);
            }
        } catch (Exception e) {
            imageUri = null;
        }

        if (imageUri == null) {
            callback.invoke(null);
            return;
        }

        this._getImage(imageUri, null, new ImageCallback() {
            @Override
            public void invoke(@Nullable Bitmap bitmap) {
                callback.invoke(bitmap == null ? null : new WXImageObject(bitmap));
            }
        });
    }

    private void __jsonToImageUrlMedia(ReadableMap data, MediaObjectCallback callback) {
        if (!data.hasKey("imageUrl")) {
            callback.invoke(null);
            return;
        }
        String imageUrl = data.getString("imageUrl");
        __jsonToImageMedia(imageUrl, callback);
    }

    private void __jsonToImageFileMedia(ReadableMap data, MediaObjectCallback callback) {
        if (!data.hasKey("imageUrl")) {
            callback.invoke(null);
            return;
        }

        String imageUrl = data.getString("imageUrl");
        if (!imageUrl.toLowerCase().startsWith("file://")) {
            imageUrl = "file://" + imageUrl;
        }
        __jsonToImageMedia(imageUrl, callback);
    }

    private WXMusicObject __jsonToMusicMedia(ReadableMap data) {
        if (!data.hasKey("musicUrl")) {
            return null;
        }

        WXMusicObject ret = new WXMusicObject();
        ret.musicUrl = data.getString("musicUrl");
        return ret;
    }

    private WXVideoObject __jsonToVideoMedia(ReadableMap data) {
        if (!data.hasKey("videoUrl")) {
            return null;
        }

        WXVideoObject ret = new WXVideoObject();
        ret.videoUrl = data.getString("videoUrl");
        return ret;
    }

    private WXFileObject __jsonToFileMedia(ReadableMap data) {
        if (!data.hasKey("filePath")) {
            return null;
        }
        return new WXFileObject(data.getString("filePath"));
    }

    // TODO: 实现sendRequest、sendSuccessResponse、sendErrorCommonResponse、sendErrorUserCancelResponse

    @Override
    public void onReq(BaseReq baseReq) {

    }

    @Override
    public void onResp(BaseResp baseResp) {
        WritableMap map = Arguments.createMap();
        map.putInt("errCode", baseResp.errCode);
        map.putString("errStr", baseResp.errStr);
        map.putString("openId", baseResp.openId);
        map.putString("transaction", baseResp.transaction);

        if (baseResp instanceof SendAuth.Resp) {
            SendAuth.Resp resp = (SendAuth.Resp) (baseResp);

            map.putString("type", "SendAuth.Resp");
            map.putString("code", resp.code);
            map.putString("state", resp.state);
            map.putString("url", resp.url);
            map.putString("lang", resp.lang);
            map.putString("country", resp.country);
        } else if (baseResp instanceof SendMessageToWX.Resp) {
            SendMessageToWX.Resp resp = (SendMessageToWX.Resp) (baseResp);
            map.putString("type", "SendMessageToWX.Resp");
        } else if (baseResp instanceof PayResp) {
            PayResp resp = (PayResp) (baseResp);
            map.putString("type", "PayReq.Resp");
            map.putString("returnKey", resp.returnKey);
        }

        this.getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("WeChat_Resp", map);
    }

    private interface ImageCallback {
        void invoke(@Nullable Bitmap bitmap);
    }

    private interface MediaObjectCallback {
        void invoke(@Nullable WXMediaMessage.IMediaObject mediaObject);
    }

    /**
     * 异步获取图片
     */
    private class MyAsyncTask extends
            AsyncTask<String, Object, byte[]> {
        WXMediaMessage msg;
        Callback callback;
        int scene;

        private MyAsyncTask(WXMediaMessage msg, Callback callback, int scene) {
            this.msg = msg;
            this.callback = callback;
            this.scene = scene;
        }

        @Override
        protected byte[] doInBackground(String... params) {
            return WechatUtil.getHtmlByteArray(params[0]);
        }

        @Override
        protected void onPostExecute(byte[] result) {
            super.onPostExecute(result);
            if (result != null && result.length != 0) {
                msg.thumbData = result;
                SendMessageToWX.Req req = new SendMessageToWX.Req();
                req.transaction = buildTransaction("webpage");
                req.message = msg;
                req.scene = scene;
                callback.invoke(null, api.sendReq(req));
            }
        }
    }
}
