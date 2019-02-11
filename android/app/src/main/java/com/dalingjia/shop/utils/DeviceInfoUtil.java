package com.dalingjia.shop.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.security.MessageDigest;
import java.util.UUID;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.DisplayMetrics;

import com.dalingjia.shop.model.DeviceInfo;


/**
 * @ClassName DeviceInfoUtil
 * @Description 获取DeviceInfo工具类
 */
public class DeviceInfoUtil {

	private static final String TAG = "DeviceInfoUtil";
	private static Context mContext;

	/**
	 * 获取DeviceInfo对象
	 * 
	 * @param context
	 *            要获取对象的环境
	 * @return DeviceInfo对象
	 */
	public static DeviceInfo getDeviceInfo(Context context) {

		mContext = context;

		DeviceInfo deviceInfo = DeviceInfo.getInstance();

		// 获取屏幕分辨率
		DisplayMetrics displayMetrics = new DisplayMetrics();
		displayMetrics = context.getResources().getDisplayMetrics();
		deviceInfo.setScreenWidth(displayMetrics.widthPixels);
		deviceInfo.setScreenHeight(displayMetrics.heightPixels);

		// 获取DeviceID
		TelephonyManager telephonyManager = (TelephonyManager) context
				.getSystemService(Context.TELEPHONY_SERVICE);
		String deviceID = "";
		String IMEI = telephonyManager.getDeviceId();
		String mac = getLocalMacAddress();
		if (StringUtil.checkIMEI(IMEI)) {
			deviceID = IMEI;
		} else if (StringUtil.checkStr(mac)) {
			deviceID = MD5(IMEI + mac);
		} else {
			deviceID = id(context);
		}

		deviceInfo.setDeviceID(deviceID);

		// 获取设备型号
		deviceInfo.setDeviceModel(android.os.Build.MODEL);
		// 获取厂商
		deviceInfo.setDeviceBrand(android.os.Build.BRAND);
		// 获取设备系统版本
		deviceInfo.setSystemVersion(android.os.Build.VERSION.RELEASE);

		// 获取软件版本号
		PackageManager packageManager = context.getPackageManager();
		try {
			PackageInfo packageInfo = packageManager.getPackageInfo(
					context.getPackageName(), 0);
			deviceInfo.setSoftVersion(packageInfo.versionName);
			deviceInfo.setAppVersionCode(packageInfo.versionCode);
		} catch (NameNotFoundException e) {
			deviceInfo.setSoftVersion("");
			deviceInfo.setAppVersionCode(1);
		}

		try {
			ApplicationInfo ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
			Bundle bundle = ai.metaData;
			deviceInfo.setAppChanel(bundle.getString("UMENG_CHANNEL"));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return deviceInfo;
	}

	/**
	 * 获取MAC地址
	 * 
	 * @return
	 */
	public static String getLocalMacAddress() {
		try {
			WifiManager wifi = (WifiManager) mContext
					.getSystemService(Context.WIFI_SERVICE);
			WifiInfo info = wifi.getConnectionInfo();
			return info.getMacAddress();
		} catch (Exception e) {
			// TODO: handle exception
			return "";
		}
		
	}

	static String MD5(String s) {
		char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
				'A', 'B', 'C', 'D', 'E', 'F' };
		try {
			byte[] btInput = s.getBytes();
			// 获得MD5摘要算法的 MessageDigest 对象
			MessageDigest mdInst = MessageDigest.getInstance("MD5");
			// 使用指定的字节更新摘要
			mdInst.update(btInput);
			// 获得密文
			byte[] md = mdInst.digest();
			// 把密文转换成十六进制的字符串形式
			int j = md.length;
			char str[] = new char[j * 2];
			int k = 0;
			for (int i = 0; i < j; i++) {
				byte byte0 = md[i];
				str[k++] = hexDigits[byte0 >>> 4 & 0xf];
				str[k++] = hexDigits[byte0 & 0xf];
			}
			return new String(str);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	private static String sID = null;
	private static final String INSTALLATION = "INSTALLATION";

	public synchronized static String id(Context context) {
		if (sID == null) {
			File installation = new File(context.getFilesDir(), INSTALLATION);
			try {
				if (!installation.exists())
					writeInstallationFile(installation);
				sID = readInstallationFile(installation);
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}
		return sID;
	}

	private static String readInstallationFile(File installation)
			throws IOException {
		RandomAccessFile f = new RandomAccessFile(installation, "r");
		byte[] bytes = new byte[(int) f.length()];
		f.readFully(bytes);
		f.close();

		return new String(bytes);
	}

	private static void writeInstallationFile(File installation)
			throws IOException {
		FileOutputStream out = new FileOutputStream(installation);
		String id = UUID.randomUUID().toString();
		out.write(id.getBytes());
		out.close();
	}
}