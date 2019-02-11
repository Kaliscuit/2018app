package com.dalingjia.shop.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SharedPreferencesUtils {
	private SharedPreferences sp;  
 	
	public SharedPreferencesUtils(Context context,String file) {
		// TODO Auto-generated constructor stub
		sp = context.getSharedPreferences(file, Context.MODE_PRIVATE); 
	}
	
	
	public void SaveData(String key,String value) {
		//指定操作的文件名称
		SharedPreferences.Editor edit = sp.edit(); //编辑文件
		edit.putString(key, value);			//根据键值对添加数据
 		edit.commit();	//保存数据信息
	}
	
	
	public void SaveIntData(String key,int value) {
		//指定操作的文件名称
		SharedPreferences.Editor edit = sp.edit(); //编辑文件
		edit.putInt(key, value);			//根据键值对添加数据
 		edit.commit();	//保存数据信息
	}

	public String  getStringData(String key) {
		//指定操作的文件名称
 		return sp.getString(key,"");
	}

	public int  getIntData(String key) {
		//指定操作的文件名称
 		return sp.getInt(key,0);
	}
}
