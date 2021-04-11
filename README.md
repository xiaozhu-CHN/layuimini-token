layuimini集成jwt实现token
===============
## 介绍

本项目是在layuimini项目的基础上增加jwt的token，感觉也挺多人用token的，~~注意项目只实现了iframe v2版集成token~~。

原项目地址：[https://github.com/zhongshaofa/layuimini](https://github.com/zhongshaofa/layuimini)

解码jwt项目地址：[https://github.com/auth0/jwt-decode](https://github.com/auth0/jwt-decode)

### 拉取代码：

iframe v2多tab版：`git clone https://github.com/xiaozhu-CHN/layuimini-token -b v2`

onepage v2单页版：`git clone https://github.com/xiaozhu-CHN/layuimini-token -b v2-onepage`



## 使用文档

### 一.配置

编辑index.html,150行，启用token和输入登录页地址，然后打开index.html，打开该页面的时候会自动进行jwt初始化。
```javascript
var options = {
    iniUrl: "api/init.json",    // 初始化接口
    clearUrl: "api/clear.json", // 缓存清理接口
    urlHashLocation: true,      // 是否打开hash定位
    bgColorDefault: false,      // 主题默认配置
    multiModule: true,          // 是否开启多模块
    menuChildOpen: false,       // 是否默认展开菜单
    loadingTime: 0,             // 初始化加载时间
    pageAnim: true,             // iframe窗口动画
    maxTabNum: 20,              // 最大的tab打开数量
    token: true,				// 是否启用token
    login: "page/login-1.html", //登录页面
    tokenName: "Authorization", //自动携带 token 的字段名
	serviceUrl: "http://127.0.0.1:80/", //后台URL开头
    indPage: [
        'page/login-1.html' //登入页
        ,'page/404.html' //404页
    ]							//无需过滤页面
};
```

### 二.使用
1. 引入js。
```javascript
//不要忘记引用第二个
<script src="lib/layui-v2.5.5/layui.js" charset="utf-8"></script>
<script src="js/lay-config.js?v=2.0.0" charset="utf-8"></script>
```

2. layui引入jwt模块。
正常引用：
```javascript
layui.use(["jwt"], function () {
	 var jwt = layui.jwt;
});
```
如果已经引入了"miniTab"或者"miniAdmin"，直接var使用即可，无需引入，案例：
```javascript
layui.use(['jquery', 'layer', 'miniAdmin'], function () {
	var $ = layui.jquery,
		layer = layui.layer,
		miniAdmin = layui.miniAdmin,
		jwt = layui.jwt;
});
```

注意：jwt引入了jQuery模块。

### 三.jwt方法

#### 1.decode(decodeToken)
解析jwt的有效载荷(PAYLOAD)，decodeToken为可选参数。不传参默认解析setToken()方法保存的token，传参的话就解析decodeToken的有效载荷。

返回案例：

``` 
{
	"sub": "1234567890",
	"name": "John Doe",
	"iat": 1516239022,
	"exp": 1710553586
}
```

#### 2.isState(isStateToken)

判断token是否有效，isStateToken为可选参数。不传参默认判断setToken()方法保存的token是否生效，传参的话就解析isStateToken是否生效。

主要是判断token是否为伪造和到期时间是否大于当前时间。

返回值为true或者false。

#### 3.interceptor(url)
拦截器方法，token失效且非无需过滤的页面就跳转登录页面，参数url为拦截的url，无需全部地址，只需要hash地址。

调用案例：

`jwt.interceptor('page\welcome-1.html')`

#### 4.getToken()
获取token。

#### 5.setToken(token)
保存token。

#### 6.delToken()
删除token。

#### 7.delData()

清空缓存(清空jwt的所有data数据)。

#### 8.req(options)

ajax请求，用法同 $.ajax(options)，只不过会在请求头和参数自动放入token。

#### 9.getUrl()

获取自定义的后台url，在index.html页面传入保存，方便接口链接的修改。

#### 10.getTokenName()

获取设置的token字段名称。

#### 11.getTabelToken()

获取token的名称和token值，方便LayuiTable模块传递token，使用详见案例。

### 四.案例
#### 登录页面保存token。

注意使用jwt.req方法都会自动带上token。

```javascript
jwt.req({
	url: login,
	type: 'get',
    dataType: 'json',
	success: function (data, textStatus, jqXHR){
		if (data) {
			// 保存token
			jwt.setToken(data['token']);
			layer.msg('登录成功', function () {
				 window.location = '../index.html';
			});
		} else {
			layer.msg('登录失败', {icon: 2, time: 1000});
		}
	},
	error: function(err){
		layer.msg('服务器错误', {icon: 2, time: 1000});
	}
});
```

#### LayuiTable传递token。

```javascript
		var jwt = layui.jwt,
			table = layui.table;
		var apiTable = table.render({
			elem: '#currentTableId',
			url: jwt.getUrl() + 'admin/tsetapi',
			headers: jwt.getTabelToken(),
			toolbar: '#toolbar',
			title: 'APITEST表',
			cols: [
				[{
					field: 'id',
					title: 'ID',
					width: '30%',
					fixed: 'left',
					unresize: true,
					sort: true,
					align: 'center'
				}, {
					field: 'token',
					title: 'Token',
					width: '30%',
					align: 'center'
				}, {
					field: 'tset',
					title: 'test',
					width: '40%',
					edit: 'text',
					align: 'center'
				}]
			],
			page: true,
			even: true
		});
```



### 五.问题

注意jwt.req()是基于jQuery Ajax的。返回的token需要带有到期时间，即exp参数。

1. ajax请求头加Token时发生的跨域（CORS）请求问题

   先看后台对OPTIONS类型的请求是否为200，因为ajax修改了请求头是非简单请求，所以请求前会发送一次预检请求(OPTIONS)。放行OPTIONS类型的请求后还需设置响应头。

   以web.py为例：

   ```python
   # 限制允许跨域访问的源 *为所有源 注意只能设置一个参数
   web.header("Access-Control-Allow-Origin", "*")
   # 限制允许跨域访问的http方法类型
   web.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS")
   # 限制允许跨域访问的http头部
   web.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
   ```

   

2. ajax获取不到返回头(token)的值

   设置一下Access-Control-Expose-Headers响应头，以web.py为例：

   ```python
   # 设置自定义的响应头
   web.header("Access-Control-Expose-Headers", "Authorization")
   # 放入返回的token
   web.header("Authorization","XXXXXXXXSSSSSSSSSSSSSSSSSSSSSSSSSXXXXXXXXXX")
   ```

3. 如何更新token

   建议是每次服务器请求，服务器都更新下token的到期时间，即更新exp时间；然后将token放入响应头，jwt.req()会自动将本地的token更新为响应头的token。

4. 服务器如何清空前端token

   可以手动通过通过delToken()方法清空；当通过jwt.req()请求服务器时，服务器返回401响应码会自动清空token并转跳到登录页。