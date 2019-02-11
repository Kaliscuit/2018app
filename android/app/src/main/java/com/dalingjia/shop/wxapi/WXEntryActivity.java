package com.dalingjia.shop.wxapi;

/**
 * Created by daling on 2017/8/17.
 */

import android.app.Activity;
import android.os.Bundle;

import com.dalingjia.shop.WeChatModule;

public class WXEntryActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WeChatModule.handleIntent(getIntent());
        finish();
    }
}

