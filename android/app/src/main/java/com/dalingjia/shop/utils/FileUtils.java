package com.dalingjia.shop.utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Environment;
import android.text.TextUtils;

/**
 * file utils
 * @author fwq
 *
 */
public class FileUtils {
	static final boolean DEBUG = false;
	private static String BASE_DIR = "**";

	
	public static File getDirectory (String path) {
		File file = new File(path);
		if (makeDir(path)) {
			return file;
		}
		return null;
	}
	
	public static File getImageCacheDir() throws IOException {
		File dir = new File(Environment.getExternalStorageDirectory()
				+ BASE_DIR + "/.image");
		if (!dir.exists()) {
			dir.mkdirs();
		}
		new File(dir, ".nomedia");
		return dir;
	}

	public static Drawable getDrawableFromFile(Context ctx, String filePath)
			throws RuntimeException {
		Bitmap bitmap = BitmapFactory.decodeFile(filePath);
		return new BitmapDrawable(ctx.getResources(), bitmap);
	}

	public static String getNameFromUrl(String url) {
		if (url != null && !url.endsWith("/")) {
			return url.substring(url.lastIndexOf("/") + 1);
		} else {
			return "noname";
		}
	}
	
	/**
	 * 文件是否存在
	 * @param filePath
	 * @return
	 */
	public static boolean isFileExists(String filePath) {
		if (TextUtils.isEmpty(filePath)) return false;
		
		File file = new File(filePath);
		return file.exists() && file.isFile();
	}
	
	/**
	 * 目录是否存在
	 * @param dirPath
	 * @return
	 */
	public static boolean isDirExists(String dirPath) {
		if (TextUtils.isEmpty(dirPath)) return false;
		
		File file = new File(dirPath);
		return file.exists() && file.isDirectory();
	}
	
	public static boolean makeDir(String path) {
		return makeDir(new File(path));
	}
	
	/**
     * 创建文件夹
     * @param dir
     * @return
     */
    public static boolean makeDir(File dir) {
    	if (dir == null) return false;
    	
    	if (!dir.exists()) {
    		return dir.mkdirs();
    	} else if (dir.isFile()) {
			deleteFile(dir);
			return dir.mkdirs();
    	} else {
    		return true;
    	}
    }
    
    public static boolean createFile(File dir, String fileName) {
    	if (dir == null) return false;
    	return createFile(new File(dir, fileName));
    }
    
    /**
     * 创建文件
     * @param path
     * @return
     */
    public static boolean createFile(String path) {
    	return createFile(new File(path));
    }
    
    public static boolean createFile(File file) {
    	try {
	    	if (!file.exists()) {
	    		if (makeDir(file.getParent())) {
	    				return file.createNewFile();
	    		}
	    	} else if (file.isDirectory()) {
	    		deleteFile(file);
	    		return file.createNewFile();
	    	} else {
	    		return true;
	    	}
    	} catch (IOException e) {
    	}
    	return false;
    }

	public static boolean deleteFile(File file) {
		boolean isDelete = false;

		if (file == null || !file.exists()) {
			return true;
		} else if (file.isDirectory()) {
			File[] files = file.listFiles();
			if (files != null) { 
				for (File f : files) {
					isDelete = deleteFile(f);
					if (!isDelete) {
						return isDelete;
					}
				}
			}
			isDelete = file.delete();
		} else {
			isDelete = file.delete();
		}
		return isDelete;
	}

	public static boolean deleteFile(String path) {
		return deleteFile(new File(path));
	}


	public static void openFile(Context context, String path, String mimeType) {
		Intent intent = new Intent(Intent.ACTION_VIEW);
		intent.setDataAndType(Uri.parse("file://" + path), mimeType);
		if (context instanceof Activity) {
			((Activity) context).startActivity(intent);
		} else {
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			context.startActivity(intent);
		}
	}
   
   public static List<File> getSubFiles(File baseDir){  
       List<File> fileList = new ArrayList<File>();
       File[] tmp = baseDir.listFiles();
       for (int i = 0; i<tmp.length; i++) {
           if(tmp[i].isFile())
               fileList.add(tmp[i]);
           if(tmp[i].isDirectory())
               fileList.addAll(getSubFiles(tmp[i]));
       }
       return fileList;
   }
	

    
    public static long getFileSize(File file) {
    	if (file != null && file.exists()) {
    		return file.length();
    	}
    	return 0;
    }

	private FileUtils() {/* Do not new me */};
}
