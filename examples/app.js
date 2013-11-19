var fs = require('fs');
var querystring = require('querystring');

var express = require('express');
var connect = require('connect');
var ejs = require('ejs');
var iweibo = require(__dirname + '/../index');
var Weibo = iweibo.Weibo;

var cfg = require('./config.json');

var templateDir = __dirname + '/template/';
var app = module.export = express();

var SITE = cfg.site_url;
var backURL = SITE + '/callback';

var MemoryStore = connect.middleware.session.MemoryStore;
var Session = connect.middleware.session.Session;
//建立一个memory store的实例
var storeMemory = new MemoryStore({
    reapInterval: 60000 * 10
});

//配置
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'wyq',
        store: storeMemory
    }));
    app.use(express.methodOverride());

    app.use(express.static(__dirname + '/static'));
});

iweibo.set({
    appkey: cfg.app_key,
    appsecret: cfg.app_secret
}).setAPI('statuses/update', {
    method: 'post',
    params: {
        status: 'hello, world',
        visible: 0
    }
});


var weibo = new Weibo();


app.get('/', function(req, res) {
    var realpath = templateDir + 'index.ejs';
    var html = fs.readFileSync(realpath).toString();
    var data = {};

    data.loginURL = weibo.getAuthorizeURL(backURL);
    html = ejs.render(html, data);
    res.end(html);
});

app.get('/send', function(req, res) {
    if (req.session.access_token && req.session.uid) {
        weibo = new Weibo(req.session.access_token, '');

        weibo.api('statuses/update', {
            status: 'hi, iweibo! https://github.com/ksky521/weibo ' + Date.now(),
            visible: 0
        }).done(function(err, result) {
            console.log(result);
            res.end(JSON.stringify(result));
        }).fail(function(err, result) {
            res.end('<h1>出错啦！！</h1><p>错误信息如下：</p>' + JSON.stringify(result));
        });

        return;
    }
    var html = fs.readFileSync(templateDir + 'error.ejs');
    res.end(html);
});

//获取access_token
app.get('/callback', function(req, res) {
    if (req.session.access_token && req.session.uid) {
        weibo = new Weibo(req.session.access_token, '');
        var urlObj = {
            uid: req.session.uid
        }
        weibo.api('users/show', urlObj).done(function(err, result) {
            console.log(result);
            res.end(JSON.stringify(result));
        });

        return;
    }

    var code = req.query.code;
    weibo.getAccessToken('code', {
        code: code,
        redirect_uri: backURL
    }).done(function(err, data) {
        var realpath = templateDir + 'callback.ejs';
        html = fs.readFileSync(realpath).toString();
        data = JSON.parse(data);
        data.refresh_token = data.refresh_token || '';
        req.session.refresh_token = data.refresh_token;
        req.session.access_token = data.access_token;
        req.session.uid = data.uid;

        html = ejs.render(html, data);
        res.end(html);
    }).fail(function(err, data) {
        var html;
        if (err) {
            html = fs.readFileSync(templateDir + 'error.ejs');
        }
        res.end(html);
    });

});



app.listen(80, function() {
    console.log('app starting');
});
