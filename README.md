新浪微博node sdk
=======
## 特点
 * api可配置化
 * 接口采用promise
 * 最少依赖，专注新浪微博OAuth2.0认证

## 使用方法

安装

```shell
wget http://github.com/ksky521/weibo/tarball/master
npm install
```

## 配置

### 配置app信息

打开 ```config.json``` 修改自己的appkey和appsecret

### 配置api接口

打开 ```lib/apis.js``` 配置下微博接口（由于太多，并且不时更新，所以我就没全配置），配置下自己使用的接口，方法参考下本js文件，基本如下：

```javascript
'接口名称': {
    method: 'get', //请求方法，post或者get，参考api文档
    params: { //默认参数，不用填写appkey和access_token，程序会自动补上
        
    }
}
```

## 使用
参考 ```examplesa/app.js``` 文件（需要先在本目录执行 ```npm install``` 安装依赖模块）

修改host，添加下面内容：

```shell
127.0.0.1 testapp.cn
```

进入 open.weibo.com 设置应用回调地址到 http://testapp.cn/callbak

### 获取登录链接

```javascript
weibo.getAuthorizeURL(backURL);
```

### 获取access_token

```javascript
weibo.getAccessToken('code', {
    code: code,
    redirect_uri: backURL
}).done(function(err, data) {
    var realpath = templateDir + 'callback.html';
    html = fs.readFileSync(realpath);
    data = JSON.parse(data);
    data.refresh_token = data.refresh_token || '';
    req.session.refresh_token = data.refresh_token;
    req.session.access_token = data.access_token;
    req.session.uid = data.uid;

    html = bdTemplate(html, data);
    res.end(html);
}).fail(function(err, data) {
    var html;
    if (err) {
        html = fs.readFileSync(templateDir + 'error.html');
    }
    res.end(html);
});
```

## 使用api接口

```javascript
//所有API都支持promise接口
weibo.api('users/show', urlObj).done(function(err, result) {
    console.log(result);
    res.end(JSON.stringify(result));
});
```