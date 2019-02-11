package com.dalingjia.shop;

import com.facebook.react.animated.NativeAnimatedModule;
import com.facebook.react.bridge.ModuleSpec;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.accessibilityinfo.AccessibilityInfoModule;
import com.facebook.react.modules.appstate.AppStateModule;
import com.facebook.react.modules.blob.BlobModule;
import com.facebook.react.modules.camera.CameraRollManager;
import com.facebook.react.modules.camera.ImageEditingManager;
import com.facebook.react.modules.camera.ImageStoreManager;
import com.facebook.react.modules.clipboard.ClipboardModule;
import com.facebook.react.modules.datepicker.DatePickerDialogModule;
import com.facebook.react.modules.dialog.DialogModule;
import com.facebook.react.modules.fresco.FrescoModule;
import com.facebook.react.modules.i18nmanager.I18nManagerModule;
import com.facebook.react.modules.image.ImageLoaderModule;
import com.facebook.react.modules.intent.IntentModule;
import com.facebook.react.modules.location.LocationModule;
import com.facebook.react.modules.netinfo.NetInfoModule;
import com.facebook.react.modules.network.NetworkingModule;
import com.facebook.react.modules.permissions.PermissionsModule;
import com.facebook.react.modules.share.ShareModule;
import com.facebook.react.modules.statusbar.StatusBarModule;
import com.facebook.react.modules.storage.AsyncStorageModule;
import com.facebook.react.modules.timepicker.TimePickerDialogModule;
import com.facebook.react.modules.toast.ToastModule;
import com.facebook.react.modules.vibration.VibrationModule;
import com.facebook.react.modules.websocket.WebSocketModule;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import javax.inject.Provider;

/**
 * Created by daling on 2018/2/7.
 */

public class RNMainReactPackage extends MainReactPackage {

    @Override
    public List<ModuleSpec> getNativeModules(final ReactApplicationContext context) {
        return Arrays.asList(
                 ModuleSpec.nativeModuleSpec(
                        AccessibilityInfoModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new AccessibilityInfoModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        AppStateModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new AppStateModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        BlobModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new BlobModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        AsyncStorageModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new AsyncStorageModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        CameraRollManager.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new CameraRollManager(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        ClipboardModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new ClipboardModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        DatePickerDialogModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new DatePickerDialogModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        DialogModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new DialogModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(MyFrescoModule.class, new Provider<NativeModule>() {
                    @Override
                    public NativeModule get() {
                        return new MyFrescoModule(context);
                    }
                }),
                ModuleSpec.nativeModuleSpec(
                        I18nManagerModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new I18nManagerModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        ImageEditingManager.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new ImageEditingManager(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        ImageLoaderModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new ImageLoaderModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        ImageStoreManager.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new ImageStoreManager(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        IntentModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new IntentModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        LocationModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new LocationModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        NativeAnimatedModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new NativeAnimatedModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        NetworkingModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new NetworkingModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        NetInfoModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new NetInfoModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        PermissionsModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new PermissionsModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        ShareModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new ShareModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        StatusBarModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new StatusBarModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        TimePickerDialogModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new TimePickerDialogModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        ToastModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new ToastModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        VibrationModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new VibrationModule(context);
                            }
                        }),
                ModuleSpec.nativeModuleSpec(
                        WebSocketModule.class,
                        new Provider<NativeModule>() {
                            @Override
                            public NativeModule get() {
                                return new WebSocketModule(context);
                            }
                        }));
    }

}
