layuimini集成jwt实现token
===============
### 一.配置
编辑index.html,150行，启用token和输入登录页地址。
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

### 三.jwt方法
#### 1.decode()
##### 简要描述
- 解析jwt的有效载荷

##### 参数
无需参数

##### 返回值
返回一个对象。根据你设定的PAYLOAD有啥对象就有啥。

##### 案例
``` 
{
	"sub": "1234567890",
	"name": "John Doe",
	"iat": 1516239022,
	"exp": 1710553586
}
```

#### 2.isState()
##### 简要描述
- 判断当前token是否有效

##### 参数
无需参数

##### 返回值
true或者false。

|类型|返回值|
|:----    |:---|
|token为空 |false |
|当前时间大于token的到期时间 |false  |
|token不为空且当前时间小于token的到期时间    |true  |

#### 3.isStateHref()
#### 简要描述
- 判断当前token是否有效 失效的话跳转登录页面

##### 参数
无需参数

##### 返回值
true或者直接跳转登录页面

|类型|返回值|
|:----    |:---|
|token为空 |直接跳转登录页面 |
|当前时间大于token的到期时间 |直接跳转登录页面  |
|token不为空且当前时间小于token的到期时间    |true  |

#### 4.getToken()
#### 简要描述
- 获取token

##### 参数
无需参数

##### 返回值
无返回值

#### 5.setToken(token)
#### 简要描述
- 保存token

##### 参数
token：保存的token

##### 返回值
无返回值

#### 6.delToken()
#### 简要描述
- 删除token

##### 参数
无需参数

##### 返回值
无返回值

### 四.案例
#### 登录页面保存token。
```javascript
$.ajax({
	url: login,
	type: 'get',
	success(data){
		if (data != null) {
			// 保存token
			jwt.setToken(data);
			layer.msg('登录成功', function () {
				 window.location = '../index.html';
			});
		} else {
			layer.msg('登录失败', {icon: 2, time: 1000});
		}
	},
	error(err){
		layer.msg('服务器错误', {icon: 2, time: 1000});
	}
});
```

#### Ajax请求带上token
```javascript
if(jwt.isStateHref()){
	//如果token失效就自动登录页
	$.ajax({
		url: login,
		type: 'get',
		headers: {
			'Authorization': jwt.getToken()
		},
		success(data){
			if (data != null) {
				// 数据处理
			} else {
				layer.msg('获取数据失败', {icon: 2, time: 1000});
			}
		},
		error(err){
			layer.msg('服务器错误', {icon: 2, time: 1000});
		}
	});
}

```