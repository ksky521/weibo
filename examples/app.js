var bdTemplate = require('./baiduTemplate').template;

var fs = require('fs');
var querystring = require('querystring');

var express = require('express');
var Weibo = require(__dirname + '/../index');
var connect = require('connect');

var templateDir = __dirname + '/template/';
var app = module.export = express.createServer();

var SITE = 'http://testapp.cn';
var backURL = SITE + '/callback';

var MemoryStore = connect.middleware.session.MemoryStore;
var Session = connect.middleware.session.Session;
//建立一个memory store的实例
var storeMemory = new MemoryStore({
    reapInterval: 60000 * 10
});

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

var weibo = new Weibo();


app.get('/', function(req, res) {
    var realpath = templateDir + 'index.html';
    var html = fs.readFileSync(realpath);
    var data = {};


    data.loginURL = weibo.getAuthorizeURL(backURL);

    html = bdTemplate(html, data);

    res.end(html);
});

app.get('/send', function(req, res) {
    if (req.session.access_token && req.session.uid) {
        weibo = new Weibo(req.session.access_token, '');
        
        weibo.api('statuses/update', {}).done(function(err, result) {
            console.log(result);
            res.end(JSON.stringify(result));
        });

        return;
    }
    var html = fs.readFileSync(templateDir + 'error.html');
    res.end(html);
});

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

});



app.listen(80, function() {
    var addr = app.address();
    console.log('app listening on http://127.0.0.1：' + addr.port);
});