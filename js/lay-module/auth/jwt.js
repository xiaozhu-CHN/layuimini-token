(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    /**
     * The code was extracted from:
     * https://github.com/davidchambers/Base64.js
     */

    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function InvalidCharacterError(message) {
        this.message = message;
    }

    InvalidCharacterError.prototype = new Error();
    InvalidCharacterError.prototype.name = "InvalidCharacterError";

    function polyfill(input) {
        var str = String(input).replace(/=+$/, "");
        if (str.length % 4 == 1) {
            throw new InvalidCharacterError(
                "'atob' failed: The string to be decoded is not correctly encoded."
            );
        }
        for (
            // initialize result and counters
            var bc = 0, bs, buffer, idx = 0, output = "";
            // get next character
            (buffer = str.charAt(idx++));
            // character found in table? initialize bit storage and add its ascii value;
            ~buffer &&
            ((bs = bc % 4 ? bs * 64 + buffer : buffer),
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4) ?
            (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))) :
            0
        ) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    var atob = (typeof window !== "undefined" &&
        window.atob &&
        window.atob.bind(window)) ||
    polyfill;

    function b64DecodeUnicode(str) {
        return decodeURIComponent(
            atob(str).replace(/(.)/g, function(m, p) {
                var code = p.charCodeAt(0).toString(16).toUpperCase();
                if (code.length < 2) {
                    code = "0" + code;
                }
                return "%" + code;
            })
        );
    }

    function base64_url_decode(str) {
        var output = str.replace(/-/g, "+").replace(/_/g, "/");
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += "==";
                break;
            case 3:
                output += "=";
                break;
            default:
                throw "Illegal base64url string!";
        }

        try {
            return b64DecodeUnicode(output);
        } catch (err) {
            return atob(output);
        }
    }

    function InvalidTokenError(message) {
        this.message = message;
    }

    InvalidTokenError.prototype = new Error();
    InvalidTokenError.prototype.name = "InvalidTokenError";

    function jwtDecode(token, options) {
        if (typeof token !== "string") {
            throw new InvalidTokenError("Invalid token specified");
        }

        options = options || {};
        var pos = options.header === true ? 0 : 1;
        try {
            return JSON.parse(base64_url_decode(token.split(".")[pos]));
        } catch (e) {
            throw new InvalidTokenError("Invalid token specified: " + e.message);
        }
    }

    /*
     * Expose the function on the window object
     */

    //use amd or just through the window object.
    if (window) {
        if (typeof window.define == "function" && window.define.amd) {
            window.define("jwt_decode", function() {
                return jwtDecode;
            });
        } else if (window) {
            window.jwt_decode = jwtDecode;
        }
    }

})));
//# sourceMappingURL=jwt-decode.js.map

window.rootPath = (function (src) {
    src = document.scripts[document.scripts.length - 1].src;
    return src.substring(0, src.lastIndexOf("/") + 1);
})();

layui.define(["jquery"], function(exports) {
	var $ = layui.$,
	    layer = layui.layer;
	var jwt = {
		render:function(options){
			options.login = options.login || 'page/login-1.html';
			options.tokenName = options.tokenName || 'Authorization';
			options.indPage = options.indPage || [];
			
			//保存是否开启token
			layui.data('jwt', {
				key: 'istoken'
				,value: options.token
			});
			if(options.token){
				//保存login地址
				layui.data('jwt', {
					key: 'login'
					,value: options.login
				});
				//保存token 的字段名
				layui.data('jwt', {
					key: 'tokenname'
					,value: options.tokenName
				});
				//保存无需过滤页面
				layui.data('jwt', {
					key: 'indpage'
					,value: options.indPage
				});
			}
		},
		/**
		 * 解析jwt的有效载荷
		 */
		decode: function(decodeToken){
			decodeToken = decodeToken || jwt.getToken();
			try{
				if(token = null){
					return null;
				}else{
					return jwt_decode(decodeToken.toString());
				}
			}catch(err){
				return null;
			}
		},
		/**
		 * 判断当前token是否有效
		 */
		isState: function(isStateToken){
			try{
				var payload = jwt.decode(isStateToken);
				var time = Date.parse(new Date())/1000;;
				if(payload != null){
					if(payload['exp']!=null && payload['exp']>time){
						return true;
					}
				}
			}catch(err){
				return false;
			}
			return false;
		},
		/**
		 * 拦截器 token失效就跳转登录页面
		 * @param {Object} url 验证url
		 */
		interceptor: function(url){
			//判断是否开启token
			try{
				var interceptorjwt = layui.data('jwt');
				if(interceptorjwt.istoken){
					//判断是否过滤的页面
					url = url || '/';
					var a = interceptorjwt.indpage.indexOf(url);
					if(a > -1){
						return true;
					}else{
						//判断token是否有效
						if(jwt.isState()){
							return true;
						}else{
							var jwtbase = layui.cache.base;
							// 跳转登录页面
							layer.msg('未登录或登录状态失效', {icon: 2, shade: this.shade, scrollbar: false, time: 2000, shadeClose: true}, function(){
								window.location.href = jwtbase.substring(0,jwtbase.length-14)+interceptorjwt.login;
							});
						}
					}	
				}else{
					return true;
				}
			}catch(err){
				return false;
			}
		},
		/**
		 * 获取token
		 */
		getToken: function(){
			return layui.data('jwt').token;
		},
		/**
		 * 保存token
		 * @param {Object} token 存入的token值
		 */
		setToken: function(token){
			if(token!=null){
				layui.data('jwt', {
					key: 'token'
					,value: token
				});
			}
		},
		/**
		 * 删除token
		 */
		delToken: function(){
			layui.data('jwt', {
			  key: 'token'
			  ,remove: true
			});
		},
		/**
		 * 清空缓存(清空jwt的所有data数据)
		 */
		delData: function(){
			layui.data('jwt', null);
		},
		/**
		 * ajax请求
		 * @param {Object} options ajax请求参数
		 */
		req: function(options){
			var that = this
			,success = options.success
			,error = options.error
			,tokenName = layui.data('jwt').tokenname;
			
			//判断是否开启token
			if(layui.data('jwt').istoken){
				options.data = options.data || {};
				options.headers = options.headers || {};
				
				//放入token参数
				if(tokenName){
				  //自动给参数传入默认 token
				  options.data[tokenName] = tokenName in options.data 
				    ?  options.data[tokenName]
				  : (layui.data('jwt').token || '');
				  
				  //判断传入的headers是否有token，有的话就不自动加入
				  options.headers[tokenName] = tokenName in options.headers 
				    ?  options.headers[tokenName]
				  : (layui.data('jwt').token || '');
				}
				
				delete options.success;
				delete options.error;
				
				return $.ajax($.extend({
				  type: 'get'
				  ,dataType: 'json'
				  ,success: function(res, textStatus, jqXHR){
					// getAllResponseHeaders  getResponseHeader
					//状态码为401 未授权的时候
					if(jqXHR.status == 401){
						 //清空token
						jwt.delToken();
						//拦截器鉴权
						jwt.interceptor()
						layui.hint().error('请求异常，没有权限');
					}else{
						//如果有返回token就更新
						if(jqXHR.getResponseHeader(tokenName)){
							//判断token是否有效 有效的话就保存
							if(jwt.isState(jqXHR.getResponseHeader(tokenName))){
								jwt.setToken(jqXHR.getResponseHeader(tokenName));
							}
						}
						//执行success代码
						typeof success === 'function' && success(res, textStatus, jqXHR);
					}
				  }
				  ,error: function(exhr,estatus,e){
				    layui.hint().error(e);
				    typeof error === 'function' && error(exhr,estatus,e);
				  }
				}, options));
			}else{
				return $.ajax(options);
			}
		}
	};
    exports('jwt', jwt);
});