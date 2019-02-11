package com.dalingjia.shop.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import android.content.Context;


public class StringUtil {

	/**
	 * 字符串非空 return true
	 * @param str
	 * @return
	 */
	public static boolean checkStr(CharSequence str) {
		if (null == str) {
			return false;
		}
		if ("".equals(str)) {
			return false;
		}
		if ("".equals(str.toString().trim())) {
			return false;
		}
		if ("null".equals(str)) {
			return false;
		}
		return true;
	}

	public static String trimLast(String str) {
		return str.replaceAll("\\s*$", "");
	}

	// 正则判断一个字符串是否全是数字
	public static boolean isNumeric(String str) {
		if (!checkStr(str))
			return false;
		Pattern pattern = Pattern.compile("[0-9]*");
		Matcher isNum = pattern.matcher(str);
		if (!isNum.matches()) {
			return false;
		}
		return true;
	}

	// 判断电话号码格式是否正确
	public static boolean isMobileNO(String mobiles) {

		/*
		 * Pattern p = Pattern
		 * 
		 * .compile("^((13[0-9])|(15[^4,\\D])|(18[0,5-9]))\\d{8}$");
		 */

		if (!checkStr(mobiles))
			return false;
		Pattern p = Pattern.compile("[0-9]*");
		Matcher m = p.matcher(mobiles);

		return m.matches() & mobiles.trim().length() == 11;

	}

	// 判断密码格式是否正确
	public static boolean isPassword(String password) {
		if (password.length() >= 6) {
			return true;
		}
		if (password.length() <= 13) {
			return true;
		}
		return false;

	}



	// 判断IMEI的合法性
	public static boolean checkIMEI(String str) {
		if (null == str) {
			return false;
		}
		if ("".equals(str)) {
			return false;
		}
		if ("".equals(str.trim())) {
			return false;
		}
		if ("null".equals(str)) {
			return false;
		}
		if (str.length() < 14) {
			return false;
		}
		boolean isNum = str.matches("[0]+");
		return !isNum;
	}

	/**
	 * 判断二个字符串是否相等
	 * @param str1
	 * @param str2
	 * @return
	 */
	public static boolean equals(String str1, String str2) {
		if (str1 == null) {
			if (str2 == null) {
				return true;
			}
			return false;
		} else if (str1.equals(str2)) {
			return true;
		}
		return false;
	}
	
	/**
	 * 计算倒计时时间
	 * 
	 * @param mss
	 * @return
	 */
	public static String formatDuringNew(long mss) {
		long days = mss / (1000 * 60 * 60 * 24);
		long hours = (mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
		long minutes = (mss % (1000 * 60 * 60)) / (1000 * 60);
		long seconds = (mss % (1000 * 60)) / 1000;
		if (days > 0) {
			return " 还剩" + days + "天" + hours + "小时";
		}
		if (hours > 0) {
			return " 还剩" + hours + "小时" + minutes + "分";
		}
		if (minutes > 0) {
			return " 还剩" + minutes + "分钟";
		}
		if (seconds > 0) {
			return " 还剩" + seconds + "秒";
		}
		return "";

	}

}