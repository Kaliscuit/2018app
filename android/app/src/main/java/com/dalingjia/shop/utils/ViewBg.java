package com.dalingjia.shop.utils;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.widget.TextView;

/**
 * 设置背景和字体色值
 * @author gaoyahang
 */
public class ViewBg {
	
	public void setBg(View view, String bgcolor) {
		// TODO Auto-generated method stub
		try {
			GradientDrawable d = new GradientDrawable();
			d.setColor(Color.parseColor(bgcolor));// 设置颜色
			view.setBackgroundDrawable(d);
		} catch (Exception e) {
			// TODO: handle exception
		}

	}
	/**
	 * 设置TextView字体色值
	 *
	 */
	public static void setTextColor(TextView tv, String bgcolor) {
		try {
			tv.setTextColor(Color.parseColor(bgcolor));
		} catch (Exception e) {
			// TODO: handle exception
		}
	}
	
	/**
	 * 设置背景 圆角
	 * 
	 * @param view
	 * @param bgcolor
	 * @param radios
	 */
	public void setBg(View view, String bgcolor, int radios) {
		// TODO Auto-generated method stub
		try {
			GradientDrawable d = new GradientDrawable();
			d.setColor(Color.parseColor(bgcolor));// 设置颜色
			d.setGradientType(GradientDrawable.RECTANGLE);
			d.setCornerRadius(DisplayUtil.dipToPixel(radios));
			view.setBackgroundDrawable(d);
		} catch (Exception e) {
			// TODO: handle exception
		}

	}

	/**
	 * 设置背景 圆角, 边线
	 * 
	 * @param view
	 * @param bgcolor
	 * @param radios
	 */
	public void setBg(View view, String bgcolor, int lineColor, int radios) {
		// TODO Auto-generated method stub
		setBg(view, bgcolor, lineColor, 1, radios);

	}

	public void setBg(View view, String bgcolor, String lineColor, int radios) {
		// TODO Auto-generated method stub
		setBg(view, bgcolor, Color.parseColor(lineColor), 1, radios); 
	}
	public void setBg(View view, String bgcolor, String lineColor, int linewidth , int radios) {
		// TODO Auto-generated method stub
		setBg(view, bgcolor, Color.parseColor(lineColor), linewidth, radios); 
	}
	public void setBg(View view, String bgcolor, int lineColor, int lineWidth,
			int radios) {
		// TODO Auto-generated method stub
		try {
			GradientDrawable d = new GradientDrawable();
			d.setColor(Color.parseColor(bgcolor));// 设置颜色
			d.setStroke(lineWidth, lineColor);
			d.setGradientType(GradientDrawable.RECTANGLE);
			d.setCornerRadius(DisplayUtil.dipToPixel(radios));
			view.setBackgroundDrawable(d);
		} catch (Exception e) {
			// TODO: handle exception
		}

	}

	public void setBg(Context mContext, View view, int bgcolor) {
		// TODO Auto-generated method stub
		try {
			GradientDrawable d = new GradientDrawable();
			d.setColor(mContext.getResources().getColor(bgcolor));// 设置颜色
			view.setBackgroundDrawable(d);
		} catch (Exception e) {
			// TODO: handle exception
		}

	}

	public void setBg(View view) {
		// TODO Auto-generated method stub
		try {
			GradientDrawable d = new GradientDrawable();
			view.setBackgroundDrawable(d);
		} catch (Exception e) {
			// TODO: handle exception
		}

	}
}
