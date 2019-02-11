package com.dalingjia.shop.push;

import com.dingfch.dbutils.db.annotation.Column;
import com.dingfch.dbutils.db.annotation.Id;
import com.dingfch.dbutils.db.annotation.Table;

/**
 * push 消息
 * @author dingfangchao
 */
@Table(name = "PushMessage")
public class PushMessage {
	@Id(column = "MsgId")
	public String mMsgId;
	@Column(column = "Content")
	public String mContent;
	@Column(column = "CtrateTime")
	public long mCtrateTime;
	
	public PushMessage(){
		mCtrateTime = System.currentTimeMillis()/(1000*60*60);
	}
	
}
