# 达令家 APP

> 基于 React Native 构建的混合客户端 APP

## Native 原生消息
EventName:EventNetwork
body:"status": WIFI NULL MOBILE

EventName:EventCaptcha
body:"validate": 易盾返回的string
body:"errormsg": 易盾返回的错误信息

## Native 接口列表
友盟：http://dev.umeng.com/analytics/h5/react-native%E9%9B%86%E6%88%90%E6%96%87%E6%A1%A3
微信参考：http://www.jianshu.com/p/3f424cccb888


模块名称：AppModule

方法：getDeviceId(callback)
说明：获取设备唯一标识。

方法：saveImageToAlbum(imageUrl,callback)
说明：存储图片到本地相册，调用后通知存储是否成功。

方法：showToast(str)
说明：ios端弹出1.5秒的指定文案的toast。

20170921新增
方法：getAppPlatform(callback)
说明：获取来源android ios 。

方法：getAppDeviceModel(callback)
说明：获取设备型号。

方法：getAppDeviceProduct(callback)
说明：获取制造厂商。

方法：getAppChanel(callback)
说明：获取安卓市场渠道来源。

方法：getAppNetType(callback)
说明：获取网络类型。

方法：getAppOSVersion(callback)
说明：获取手机操作系统版本。

方法：getBundleMD5(callback)
说明：获取bundle的MD5。

方法：getPushToken()
说明：获取苹果pushtoken，发出异步请求，成功返回promise带string类型的pushtoken。

方法：startValidate(String captchaId,Promise promise)
说明：调用网易易盾验证。(已过时，使用startValidateV2)

方法：startValidateV2(String captchaId,Promise promise)
说明：调用网易易盾验证。(和原来的相比。修改了回调通知方式)

方法：restartApp(String url,callback)
说明：更新bundle重启APP

方法：getPushStatus(callback)
说明：获取通知开关状态 true or false。

方法：openPushSetting(callback)
说明：打开手机系统通知设置。

-----支付宝API-----
module名称：Alipay
方法：pay(options)
说明：options是字典里面包含key:orderString,value:"支付串"。客户端发出异步请求，成功返回promise带字典类型的支付结果。

-----微信API-----
API

registerApp(appid) ：注册APP
registerAppWithDescription(appid, appdesc) ： 注册APP（仅支持iOS）
isWXAppInstalled() ：检查微信是否安装
isWXAppSupportApi()
getApiVersion() ：获得微信SDK的版本
openWXApp() ：打开微信APP
sendAuthRequest([scope[, state]]) ：发送微信登录授权
shareToTimeline(data) ： 分享到朋友圈
shareToSession(data) ：分享到朋友
pay(data) ：调用微信支付

调用原生图片分享到微信
shareImagesToTimeline（data,callback）:到朋友圈
shareImagesToSession（data,callback）:到朋友
其中data包含description：朋友圈文字描述 可空
images:图片网址多张图用|隔开


addListener(eventType, listener[, context]) ：监听状态
once(eventType, listener[, context]) ：监听状态
removeAllListeners() ：移除所有监听
方法接口描述
registerApp(appid)：注册微信SDK

registerApp(appid)
@params

参数名	类型	默认值	描述
appid	string	无	微信后台的appid
示例代码

//建议在应用启动时初始化，初始化之前无法使用此模块的其他方法。WeChat模块只需要初始化一次。
//const wechat = require('react-native-wechat')
import *as wechat from 'react-native-wechat'
// If you register here
componentDidMount (){
  wechat.registerApp('your appid')
}
registerAppWithDescription(appid, appdesc):注册微信SDK(仅对iOS有效)

registerAppWithDescription(appid, appdesc)

params

参数名	类型	默认值	描述
appid	string	无	微信后台的appid
appdesc	string	无	对你的APP的描述
isWXAppInstalled() : 检查微信是否安装

isWXAppInstalled()
return
{Promise}

示例代码

wechat.isWXAppInstalled()
   .then( ( isInstalled ) => {
        if ( isInstalled ) {
           ...
        } else {
          toastShort( '没有安装微信软件，请您安装微信之后再试' );
        }
    } );
isWXAppSupportApi() : 检查是否支持微信开放接口

isWXAppSupportApi()
return
{Promise}
示例代码

同isWXAppInstalled
getApiVersion() ： 获取微信SDK版本

getApiVersion()
return
{Promise}
示例代码

同isWXAppInstalled
openWXApp() ： 打开微信

openWXApp()
return
{Promise}

sendAuthRequest([scope[, state]]) ： 微信登录授权请求

sendAuthRequest([scope[, state]])
params

参数名	类型	默认值	描述
scope	{Array/String}	无	应用授权作用域，如获取用户个人信息则填写snsapi_userinfo
state	{String}	无	用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数加session进行校验
return
{Promise}

示例代码

//微信登录示例
WXLogin = () => {
  let scope = 'snsapi_userinfo';
  let state = 'wechat_sdk_demo';
  //判断微信是否安装
  wechat.isWXAppInstalled()
    .then((isInstalled) => {
      if (isInstalled) {
        //发送授权请求
        wechat.sendAuthRequest(scope, state)
          .then(responseCode => {
            //返回code码，通过code获取access_token
            this.getAccessToken(responseCode.code);
          })
          .catch(err => {
            Alert.alert('登录授权发生错误：', err.message, [
              {text: '确定'}
            ]);
          })
      } else {
        Platform.OS == 'ios' ?
          Alert.alert('没有安装微信', '是否安装微信？', [
            {text: '取消'},
            {text: '确定', onPress: () => this.installWechat()}
          ]) :
          Alert.alert('没有安装微信', '请先安装微信客户端在进行登录', [
            {text: '确定'}
          ])
      }
    })
};
参数名	类型	描述
errCode	Number	ERR_OK = 0(用户同意)  ERR_AUTH_DENIED = -4（用户拒绝授权）ERR_USER_CANCEL = -2（用户取消）
errStr	String
openId	String
code	String	用户换取access_token的code，仅在ErrCode为0时有效
shareToTimeline(data) ： 分享到朋友圈

shareToTimeline(data)
params

参数名	类型	描述
thumbImage	String	消息的Thumb图像，可以是uri或资源id
type	String	{news/text/imageUrl/imageFile/imageResource/video/audio/file/mini}
webpageUrl	String	如果type为news或者mini(低版本微信兼容URL),则使用此分享url
imageUrl	String	如果type为image,则使用此分享url
videoUrl	String	如果type为video,则使用此分享url
musicUrl	String	如果type为audio,则使用此分享url
filePath	String	如果type为file,则使用此获取本地文件
fileExtension	String	如果type为file,则使用此提供文件类型
示例代码

WeChat.shareToTimeline({
    type: 'imageUrl',
    title: 'web image',
    description: 'share web image to time line',
    mediaTagName: 'email signature',
    messageAction: undefined,
    messageExt: undefined,
    imageUrl: 'http://www.ncloud.hk/email-signature-262x100.png'
  });
return

目前小程序只支持会话分享
WeChat.shareToTimeline({
    type: 'mini',//分享到小程序的type
    title: 'web mini',//小程序title
    description: 'share web nimi to time line',//小程序desc
    webpageUrl: 'www.daling.com',//兼容低版本的网页链接
    userName: 'userName',//跳转的小程序的原始ID
    path: 'path',//小程序的path,
    thumbImage:'wwww',//安卓和IOS低版本用图 <32K
    hdImageData:'www'//IOS小程序节点高清大图<128K
  });

参数名	类型	描述
errCode	Number	0 if authorization successed
errStr	String	Error message if any error occurred
shareToSession(data) ：分享到好友

shareToSession(data)
示例代码

同 shareToTimeline(data) ：
shareToFavorite(data) ：收藏（v1.9.9+）

shareToFavorite(data)
示例代码

同 shareToTimeline(data) ：
pay(data) ： 微信支付

pay(data)
示例代码

const result = await WeChat.pay(
  {
    partnerId: '',  // 商家向财付通申请的商家id
    prepayId: '',   // 预支付订单
    nonceStr: '',   // 随机串，防重发
    timeStamp: '',  // 时间戳，防重发
    package: '',    // 商家根据财付通文档填写的数据和签名
    sign: ''        // 商家根据微信开放平台文档对数据做的签名
  }
);
return

参数名	类型	描述
errCode	Number	0 if authorization successed
errStr	String	Error message if any error occurred
addListener(eventType, listener[, context]) : 监听状态

示例代码

      //监听分享状态
      // 'SendMessageToWX.Resp' 分享监听字段
      // 'PayReq.Resp'          支付监听字段
      // 'SendAuth.Resp'        登录监听字段
      wechat.addListener(
          'SendMessageToWX.Resp',
          (response) => {
              if (parseInt(response.errCode) === 0) {
                  toastShort('分享成功');
              } else {
                  toastShort('分享失败');
              }
          }
      );

once(eventType, listener[, context])
和addListener类似，但是被调用一次后会被移除

removeAllListeners()
移除所有监听事件

