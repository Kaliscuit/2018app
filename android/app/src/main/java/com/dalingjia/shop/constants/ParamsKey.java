package com.dalingjia.shop.constants;

import java.util.ArrayList;

/*
 * 参数传递的key值
 */
public class ParamsKey {

	public static final String SORT_VALUE = "sortvalue";
	public static final String QUERY_PARAMS = "queryParams";
	public static final String GOODS_ID_KEY = "goods_id";
	public static final String GOODS_BRAND_KEY = "goods_brand";
	public static final String GOODS_NAME_KEY = "goods_name";// 商品名称
	public static final String GOODS_PRICE_KEY = "goods_price";// 商品价格
	public static final String GOODS_QUANTITY_KEY = "goods_quantity";// 商品价格
	public static final String GOODS_IMG_KEY = "goods_img";// 商品价格
	public static final String GOODS_COM_KEY = "goods_com";// 商品价格
	public static final String GOODS_IMG_NUM = "goods_img_num";// 商品价格
	public static final String IS_SHOW_CART = "is_show_cart";// 是否显示购物车

	public static final String GOODS_CHANGE_GOODS = "goods_change_goods"; // 换购商品，不可购买

	public static final String GOODS_LIST = "goods_list";
	public static final String GOODS_LIST_FROM_CAR = "goods_list_from_car";

	public static final String GOODS_SN_KEY = "goods_sn";
	public static final String GOODS_STOCK_KEY = "stock";// 商品库存
	public static final String GOODS_NOTIFIED = "goodsnotified";// 商品到货提醒
	public static final String WEB_URL = "weburl";// 跳转wenbview的url
	public static final String WEB_SHARE = "web_share";// web页是否可分享
	public static final String SEARCH_KEYWORDS = "keywords";// 搜索
	public static final String FROM_SEARCH = "from_search";// 来源于搜索
	public static final String TITLE_GOODS = "title";
	public static final String EXTRA = "extra";
	public static String changeAcount = "changgeAcount";
	public static String forget = "forget";
	public static String creatNewAcount = "creatNewAcount";
	public static String register = "register";

	public static final int creatUser = 1;
	public static final int changeUser = 2;
	public static final int forgetpassword = 3;
	public static final String phoneKey = "phone";
	public static final String REG = "reg";
	public static final String LOGIN = "login";
	public static final String AUTO = "auto";
	// 未注册2，注册过1
	public static final String WAY = "way";

	/*
	 * 地址详情页参数key
	 */
	public static final String ADDR_ID = "addr_id";
	public static final String SHOUHUOREN_NAME = "shouhuoren_name";// 收货人姓名
	public static final String SHOUHUOREN_MOB = "shouhuoren_mob";// 收货人电话
	public static final String SHOUHUOREN_CARD_ID = "shouhuoren_card_id";// 身份证
	public static final String SHOUHUOREN_AREA = "shouhuoren_area";// 收货人区域
	public static final String SHOUHUOREN_DETAIL_ADDR = "detail_address";// 收货人地址
	public static final String JIHUOREN_MOB = "jihuoren_mob";// 收货人地址
	public static final String ADDRESS_LIST_POS = "pos";// 收货人地址
	public static final String ADDRESS_CLICK_WAY = "way";// 用于标记订单确认-地址管理-新增地址
	public static final String ADDRESS_ID = "address_id";// 收货地址ID
	public static final String ADDRESS_DEFAULT = "address_default";// 收货地址ID
	public static final String RECEIVER_CARD_SWITCH = "receiver_card_switch";// 收货地址ID
	public static final String FRONTIMAGE = "frontImage";// 收货地址ID
	public static final String BACKIMAGE = "backImage";// 收货地址ID

	/*
	 * 登陆注册成功之后跳转是否需要finish
	 */
	public static final String IS_FINISHE = "isfinish";

	public static final String ORDER_ID = "order_id";

	public static final String WULIU_COM = "wuliu_com";// 物流公司名称key，如yuantong,shunfeng
	public static final String ORDER_SN = "order_sn";// 订单sn编号key
	public static final String ORDER_TIME = "order_time";
	public static final String SHIPPING_ID = "shipping_id";
	public static final String WULIU_TELE = "wuliu_tele";
	public static final String WULIU_INFO = "wuliu_info";
	public static final String WULIU_SHOW_GOODS = "wuliu_show_goods";
	public static final String SHIPPING_CODE = "shipping_code"; // 物流编号
	public static final String OS_ID = "os_id"; // 原始配货单号

	/**
	 * 订单是否分包裹
	 */
	public static final String ORDER_BAOGUO = "order_baoguos";

	public static final String IMG_URL = "img_url";

	/**
	 * 订单支付方式类型
	 */
	public static final String PAY_TYPE = "pay_type";

	/**
	 * 支付UKEY
	 */
	public static final String UKEY = "ukey";

	// public static ArrayList<Activity> list = new ArrayList<Activity>();//注册登陆

	/*
	 * 版本更新参数信息
	 */
	public static final String version_title = "version_title";
	public static final String version_size = "version_size";
	public static final String version_desc = "version_desc";
	public static final String version_url = "version_url";
	public static final String android_no = "android_no";
	public static final String mustUpdate = "must_update";
	/*
	 * 时间
	 */
	public static final String LOCAL_TIME = "local_time";
	public static final String LOCAL_PUSH_TIME = "local_pushtime";

	/*
	 * push
	 */
	public static final String PUSH_TYPE = "push_type";
	public static final String PUSH_ID = "push_id";
	public static final String PUSH_MESSAGE = "push_message";
	public static final String PUSH_GID = "push_gid";
	public static final String PUSH_WEBURL = "push_url";
	public static final String PUSH_TITLE = "push_title";
	/**
	 * 退出登录发送广播
	 */
	public static final String RECEVIERMORE = "more";
	public static final String RECEVIERMYORDER = "myorder";
	/**
	 * 支付方式
	 */
	public static final String PAYWEB = "alipay";
	public static final String PAYCLIENT = "appalipay";
	public static final String PAYCLIENT_GUOJI = "appalipay_international";
	public static final String PAYYINLIAN = "unipay";
	public static final String TENPAY = "tenpay";
	public static final String WXPAY = "wxpay";
	public static final String ABCPAY = "abcpay";
	public static final String CMBPAY = "cmbpay";// 招商银行
	public static final String CODPOS = "cod_pos";
	public static final String CODMONEY = "cod_money";
	public static final String YIZHIFU = "yipay";
	public static final String SUNINGZHIFU = "yfbpay";

	// 储蓄卡
	public static final String TENPAY_DEBIT = "tenpay_debit";
	// 信用卡
	public static final String TENPAY_CREDIT = "tenpay_credit";

	/*
	 * 优惠券选择页面
	 */
	public static final String UCPN_ID = "ucpn_id";//
	public static final String UCPN_AMOUNT = "amount";
	public static final String youhuiquanList = "youhuiquanList";
	public static final String min_order_amount = "min_order_amount";
	// public static int code =-1;

	// 地址管理界面
	public static final String ADDR_KEY = "addr_key";
	public static final String CHA_KEY = "CHA_KEY";
	public static final int ADD_NEW_ADDR = 1;
	public static final int MODIFY_NEW_ADDR = 2;
	public static final int ADDRESS_CODE1 = 3;
	public static final int ADDRESS_CODE2 = 4;
	public static final String shouhuoren_name = "shouhuoren_name";
	public static final String shouhuoren_area = "shouhuoren_area";
	public static final String detail_address = "detail_address";
	public static final String shouhuoren_phone = "shouhuoren_phone";

	/*
	 * 商品详情页面
	 */
	public static final String GOODS_LIKED = "goods_liked";
	/*
	 * 支付成功页面
	 */
	public static final String GOODS_NUM_KEY = "goods_num";// 商品数量
	public static final String SEARCH_TAGS = "search_tags";

	public static final String WIDGET_TONGJI = "widget_tongji";

	public static final String FROM_PUSH = "frompush";

	public static final String CHANNEL_NAME_KEY = "UMENG_CHANNEL";

	public static final String CHANNEL_ID_KEY = "CHANNEL_ID";

	/*
	 * 从我的订单跳到 收货地址管理页面
	 */
	public static final String FROM_MYORDER_TO_ADDRADMIN = "from_myorder_to_addradmin";
	/*
	 * 从订单订单确认 跳到 收货地址管理页面
	 */
	public static final String FROM_ORDER_CONFIRM_TO_ADDRADMIN = "from_order_confirm_to_addradmin";

	public static final String IF_SHOW_NEWIMG = "if_special";// 是否使用新的商品图

	/*
	 * 从分类点击进去的二级分类的参数串
	 */
	public static final String CATEGORY_JSON = "categoryJson";
	public static final String ER_JI_MENU_STR = "erjimenustr";
	public static final String ER_JI_MENU_TITLE = "erjimenutitle";
	public static final String CATEGORY_ALT = "category_alt";// 一级alt
	public static final String CATEGORY_ERJI_ALT = "category_erji_alt";// 二级alt

	public static final String SHOW_GOODSLIST_HEAD = "show_goodslist_head";
	public static final String GOODSLIST_TITLE = "goodslist_title";

	/**
	 * 一级分类ID
	 */
	public static final String MENU_CATEGORY_ID = "menu_category_id";
	/**
	 * 二级分类ID
	 */
	public static final String MENU_NODE_ID = "menu_node_id";

	/*
	 * 选择银行
	 */
	public static final String BANK_TYPE = "bank_type";
	public static final String BANK_JSON = "bank_type";
	public static final String BANK_POS = "bank_pos";
	// public static final String ALIWEB_PAY = "aliweb_pay";
	public static final String BANK_NAME = "bank_name";
	public static final String PAY_WAY = "pay_way";//
	public static final String PAY_TYPE_TXT = "pay_type_txt";

	/**
	 * 进入banner详情页
	 */
	public static final String BANNER_ID = "banner_id";
	public static final String BANNER_TYPE = "banner_type";
	public static final String BANNER_STYLE = "banner_style";
	public static final String BANNER_TITLE = "banner_title";
	public static final String BANNER_URL = "banner_url";
	public static final String BANNER_TRANS = "banner_trans";
	public static final String BANNER_OPACITY = "banner_opacity";

	/*
	 * 点击click读图
	 */
	public static final String CLICK_IMG_FILE = "click_img_file";
	public static final String SLID_IMG_FILE = "slid_img_file";

	/*
	 * 是否来自订单确认页的跳转
	 */
	public static final String fromOrderConfirm = "fromOrderConfirm";

	/**
	 * 
	 */

	public static final String FROM_HUODONG_WEB = "fromhuodongweb";

	/**
	 * 卡的名字，卡的价值，卡号
	 */
	public static final String CARDNAME = "cardname";
	public static final String CARDPRICE = "cardprice";
	public static final String CARDNUMBER = "cardnumber";

	/**
	 * 我的充值卡
	 */
	public static final String CODE = "code";
	public static final String CURRENT = "current";
	public static ArrayList<String> IDlist = new ArrayList<String>();
	public static Boolean key = false;
	public static int i = 1;

	/**
	 * 提交申请退款
	 */
	public static final String REFUND_STATUS = "refund_statsu";

	/**
	 * 各种活动字段定义
	 */
	public static final String BANNER_GOODS = "goods";
	public static final String BANNER_TOPIC = "topic";
	public static final String BANNER_COUPON = "coupon";
	public static final String BANNER_SEARCH = "search";
	public static final String BANNER_HTML = "html";
	public static final String BANNER_CHANNEL_RECOMMEND = "channel_recommend";

	/**
	 * 今日闪购更多
	 */
	public static final String GOODS_SEARCH_FLASH = "goods_search_flash";

	/**
	 * RecommendGoodsList 传递字段
	 */
	public static final String RECOMMEND_TITLE = "recommend_title";
	public static final String RECOMMEND_id = "recommend_id";
	public static final String RECOMMEND_BRIEF = "recommend_brief";

	public static final String PIC_CAMERA_IMG_DIR = "dalingUpImg";
	public static final String PIC_CAMERA_IMG_NAME = "camera.jpg";
	public static final String PIC_IMG_SIZE = "size.jpg";

	/**
	 * 订单商品退货状态
	 */
	public static final int ORDER_GOODS_RETURN_TYPE_OTHER = 0; // 其它，只显示，不处理
	public static final int ORDER_GOODS_RETURN_TYPE_COMPLAINTS = 1; // 申诉
	public static final int ORDER_GOODS_RETURN_TYPE_SEHNQING = 2; // 申请退款
	public static final int ORDER_GOODS_RETURN_TYPE_JIHUI = 4; // 寄回商品
	public static final int ORDER_GOODS_RETURN_TYPE_DENGDAI = 8; // 等待退款
	public static final int ORDER_GOODS_RETURN_CANCELED = 10; // 申请退货已取消
	public static final int ORDER_GOODS_RETURN_TYPE_SUCESS = 16; // 退款成功或失败

	/**
	 * 更多新品
	 */
	public static final String XINPIN_MORE_HINT_COUNT = "hint_count";
	public static final String XINPIN_MORE_REMAINDER_COUNT = "remainder_count";

	public static final String ORDER_GOODS_IDS = "order_goods_ids";
	public static final String ORDER_GOODS_NUMS = "order_goods_nums";

	/**
	 * 超值换购
	 */
	public static final String BENEFIT_GOODS_LIST = "benefit_goods_list";
	public static final String BENEFIT_INFO = "benefit_info";
	public static final String BENEFIT_MIN_AMOUNT = "benefit_min_amount";

	/*
	 * 支付方式
	 */
	public static final String ZHIFU_WAY_FILENAME = "zhifu_way_filename";
	public static final String ZHIFU_WAY_CODE = "zhifu_way_code";

	public static final String ZHIFU_BANK_TYPE = "zhifu_bank_type";
	public static final String ZHIFU_BANK_POS = "zhifu_bank_pos";
	public static final String ZHIFU_BANK_NAME = "zhifu_bank_name";

	/**
	 * 支付成功时的支付方式
	 */
	public static final String ZHIFU_PAY_UKEY = "zhifu_pay_ukey";
	public static final String ZHIFU_PAY_UKEY_VALUE = "zhifu_pay_ukey_value";

	// public static final String ZHIFU_WAY_FILENAME_TRUE =
	// "zhifu_way_filename_true";
	// public static final String ZHIFU_WAY_CODE_TRUE = "zhifu_way_code_true";

	// public static final String ZHIFU_BANK_TYPE_TRUE = "zhifu_bank_type_true";
	// public static final String ZHIFU_BANK_POS_TRUE = "zhifu_bank_pos_true";
	// public static final String ZHIFU_BANK_NAME_TRUE = "zhifu_bank_name_true";

	// APPNAME
	public static final String APP_NAME = "com.daling.daling";

	// 商品详情广播
	public static final String RECEVIER_GOODS_DETAIL = "recevier_goods_detail";
	public static final String GOODS_DETAIL = "goods_detail";

	/**
	 * 用户信息
	 */
	public static final String USER_INFOS = "user_infos";

	/**
	 * 用户名
	 */
	public static final String USER_NAME = "user_name";

	/**
	 * 用户名
	 */
	public static final String USER_DESC = "user_desc";

	/**
	 * 用户ID
	 */
	public static final String USER_ID = "user_id";

	/**
	 * 退出设置密码
	 */
	public static final String LOGIN_SET_PASS = "login_set_pass";

	/**
	 * 评论成功
	 */
	public static final String WRITE_COMMENT = "write_comment";

	/**
	 * 订单操作
	 */
	public static final String ORDER_DO = "order_do";

	/**
	 * 购物车
	 */
	public static final String GOODS_CAR_VIEW = "goods_car_view";

	/**
	 * 激活充值卡
	 */
	public static final String JIHUOLIPINKA = "jihuolipinka";

	/**
	 * 评论ID
	 */
	public static final String COMMENT_ID = "comment_id";

	public static final int TYPE_OVER_TIME = -2;
	public static final int TYPE_NO_COMMENT = -1;
	public static final int TYPE_IS_RETURN = 0;
	public static final int TYPE_WAIT_SHENHE = 1;
	public static final int TYPE_IS_OK = 2;

	//
	public static final String REGION_VERSION = "region_version";

	public static final String BONDED_KEY_FILE = "bonded_key_file";

	public static final int ITEM_POSITION_TOP_GROUP = 0;
	public static final int ITEM_POSITION_TOP = 4;
	public static final int ITEM_POSITION_CENTER = 1;
	public static final int ITEM_POSITION_BOTTOM = 2;
	public static final int ITEM_POSITION_BOTTOM_CENTER_GOODS = 5;
	public static final int ITEM_POSITION_ONE = 3;

	public static final int ITEM_POSITION_SECOND_TOP = 5; // 单个商品的赠品第一件赠品
	public static final int ITEM_POSITION_SECOND_CENTER = 6; // 单个商品的赠品中间赠品
	public static final int ITEM_POSITION_SECOND_BOTTOM = 7; // 单个商品的赠品最后赠品
	public static final int ITEM_POSITION_SECOND_ONE = 8; // 单个商品的只有一个赠品

	/**
	 * DiscountGoodsList 传递字段
	 */
	public static final String DISCOUNT_LIST_TITLE = "discount_list_title";
	public static final String DISCOUNT_LIST_ID = "discount_list_id";
	public static final String DISCOUNT_LIST_TAG = "discount_list_tag";
	public static final String IMAGES_GOODS_IDS = "images_goods_ids";
	

	// 今日闪购
	public static final String DISCOUNT_LIST_TYPE = "discount_today";

	/**
	 * 货到付款显示隐藏方式
	 */

	public static final int COD_SHOW_VISIBLE = 1; // 显示
	public static final int COD_SHOW_INVISIBLE = 2; // 置灰
	public static final int COD_SHOW_GONE = 3; // 不显示

	/**
	 * 是否可以取消订单
	 */
	public static final int CLOUD_CANCEL_ORDER_VISIBLE = 1; // 显示
	public static final int CLOUD_CANCEL_ORDER_GONE = 0; // 不显示

	/**
	 * 订单是否是cod订单 ， 1是COD , 0不是COD
	 */
	public static final int ORDER_IS_COD_YES = 1;
	public static final int ORDER_ID_COD_NO = 0;

	/**
	 * 优惠跳转类型
	 */
	public static final String COUPON_GOODS = "goods";
	public static final String COUPON_SEARCH = "search";
	public static final String COUPON_H5 = "h5";
	/**
	 * 促销类型
	 */
	public static final int DETAIL_COUPON = 1; // 红包,优惠券
	public static final int DETAIL_MAISONG = 2; // 买送，赠品
	public static final int DETAIL_SUB = 3; // 满减
	public static final int DETAIL_FULL_SONG = 4; // 满送
	public static final int DETAIL_TWO_SALE = 5; // 第二件半价
	public static final int DETAIL_TITLE = 6; // 标题
	public static final int DETAIL_BAOYOU = 7; // 包邮

	// 赠品IDS
	public static final String PROMOTION_GIFT_GOODS_IDS = "goods_ids";

	public static final String PROMOTION_GIFT_GOODS_NUMS = "goods_nums";

	// 主题大图列表
	public static final String SUBJECT_IMG_LIST = "subject_img_list";
	// 主题大图位置
	public static final String SUBJECT_IMG_INDEX = "subject_img_index";

	// 主题id
	public static final String SUBJECT_ID = "subject_id";
	// 来源
	public static final String ACTIVITY_FROM = "activity_from";

	// 选择图片
	public static final String ADD_PIC = "subject_add_pic";
	// 编辑关联商品
	public static final String EDIT_PIC = "subject_edit_pic_goods";

	// 统计页面来源
	public static final String FROM_ACTIVITY = "from_activity";

	// 统计页
	public static final String FROM_PAGE_PATH = "from_path";

	// 退货相关
	public static final String REFUND_METHOD_TUIHUO = "tui_huo";
	public static final String REFUND_METHOD_SHENDU = "shen_su";

	// 广告跳转类型
	public static final String ADD_TYPE_H5 = "web";
	public static final String ADD_TYPE_DETAIL = "goodsDetail";
	public static final String ADD_TYPE_RED_PACKET = "coupon";// 红包
	public static final String ADD_TYPE_NODE = "node";
	public static final String ADD_TYPE_SEARCH = "list";

	// 首页TAB
	public static final String SHOUYE_TAB = "shouye_tab";

	// 修改退货信息
	public static final String RETURN_VIEW_TYPE = "viewType";
	public static final String RETURN_BANK_NAME = "bank_name";
	public static final String RETURN_BANK_OPEN_NAME = "open_name";
	public static final String RETURN_BANK_USER = "user";
	public static final String RETURN_BANG_CARD_CODE = "card_code";
	public static final String RETURN_EXPRESS = "express";
	public static final String RETURN_EXPRESS_NAME = "express_name";
	public static final String RETURN_EXPRESS_COMPANY = "EXPRESS_COMPANY";
	/**
	 * express.code
	 */
	public static final String RETURN_EXPRESS_TYPE = "express_type";
	/**
	 * 物流单号
	 */
	public static final String RETURN_EXPRESS_CODE = "express_code";
	public static final String RETURN_PICTURE = "picture";
	public static final String RETURN_REFUND_ID = "return_refund_id";
	public static final String RETURN_SHENSU = "return_shensu";
	public static final String RETURN_REFUND_ORDER_SN = "return_order_sn";
	public static final String RETURN_REFUND_PAGEAGE_ID = "return_pageage_id";
	public static final String RETURN_REFUND_REC_ID = "return_rec_id";
	public static final String RETURN_REFUND_ORDER_ID = "return_order_id";
	public static final String IS_COMPLAIN = "is_complain";
	// 分类
	public static final String MENU_ID = "menu_id";

	// 上传token 相关
	public static final String HEADER_LOADED = "header_loaded";
	public static final String TOKEN_CHANNEL = "token_channel";
	public static final String TOKEN_VALUE = "token_value";

	// 标签分类
	public static final String LABEL_TYPE_NAME = "label_type_name";
	public static final String LABEL_TYPE_ID = "label_type_id";

	// Video设置文件名
	public static final String VIDEO_SET = "video_set";
	public static final String VIDEO_SET_KEY = "video_set_key_wifi";

	// 是否是视频接口
	public static final String IS_VIDEO = "is_video";
	//
	public static final String CHANNEL_ID = "channel_id";
	public static final String CHANNEL_NAME = "channel_name";

	public static final String LOGIN_TYPE = "type";
	// 注册用户
	public static final String LOGIN_CREATE = "create";
	// 忘记密码
	public static final String LOGIN_FIND = "find";

	/**
	 * 一级分类 - 达令帮消息
	 */
	public static final String MSG_DLBM = "DLBM";
	/**
	 * 一级分类 - 促销活动
	 */
	public static final String MSG_SPAM = "SPAM";
	/**
	 * 一级分类 - 账户消息
	 */
	public static final String MSG_AM = "AM";
	/**
	 * 一级分类 - 会员消息
	 */
	public static final String MSG_MM = "MM";
	/**
	 * 一级分类 - 通知消息
	 */
	public static final String MSG_NM = "NM";
	/**
	 * 一级分类 - 订单消息
	 */
	public static final String MSG_OM = "OM";

	// 验证码类型
	public static final String VERIFICATION_TYPE_REG = "reg"; // 普通注册
	public static final String VERIFICATION_TYPE_WXREG = "wxreg";// 微信注册
	public static final String VERIFICATION_TYPE_LOGIN = "login";// 短信登录
	public static final String VERIFICATION_TYPE_WXLOGIN = "wxlogin";// 微信登录
	public static final String VERIFICATION_TYPE_REPASS = "repass";// 找回密码
	public static final String VERIFICATION_TYPE_AUTO = "auto";// 普通注册或登录
	
	
 
	/**
	 * 微信union_id
	 */
	public static final String WX_UNION_ID = "wx_open_id";
	
	/**
	 * 微信头像
	 */
	public static final String WX_AVTOR = "wx_vator";
	
	/**
	 * 微信名称
	 */
	public static final String WX_NICK_NAME = "wx_nick_name";
	
	/**
	 * 微信绑定积分提示
	 */
	public static final String WX_BIND_MSG = "wx_bind_msg";
	
	/**
	 * 修改密码获取验证码
	 */
	public static final String SET_PASS_CODE = "set_pass_code";

}
