## app中使用到的一些说明

### websocket协议

#### 示例：
```
{
    "command":"update_bundle",
    "data":"更新使用到的数据"
}
```
#### 参数说明

- `command`，命令 {string}，app调用方法的关键字。命令使用`_`连接，全部使用小写。
- `data`，数据 {json|string|number}，后端传递的数据。

#### 命令枚举

- `update_bundle`,升级bundle。返回bundle的数据。
    - md5
    - version
    - updateTime

### app内网页协议

#### APP自动注入SDK对象

- SDK加载完成，暂无
- 加入购物车 addCart(id,num)
- 点击进入商品详情页 openDetail(id)
- 立即购买 buy(id)
- 进入购物车 openCart()
- 进入搜索页 search(txt)
- 分享当前页面 sharePage(url,img,title,desc,shareList<Array>?) 目前不需要参数
- utoken,预写入cookie中，name=utoken
- utoken,当前用户token，utoken
- 进入订单页,orderPage
- 进入我的订单，myOrderPage
- myOrderDetail(id)
- orderDetail(id)
- 去登录，login()
- 当前环境，current
- 微信支付，wxpay(datas)
- 设置当前标题,setTitle(title)
- 设置当前是否可以跳转到上一页，isCanGoBack(bl)
- 设置分享标题和详情,setShareInfo(title,desc,shareList<Array>?)
- 设置显示内容,setMenu(list<Array>?);['shareBtn','backBtn','topBar']
- 分享成功，触发`refresh`事件
- 支付结果，触发`payed`事件，参数，bl<Bool>
- 调起分享到微信好友，shareToSession(title,desc,url,img)
- 调起分享到微信朋友圈，shareToTimeline(title,desc,url,img)

## TODO:

- 路由拦截过滤，首页退出提示
- 用户缓存
- 分享组件