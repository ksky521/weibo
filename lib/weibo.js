'use strict';
//系统模块
var fs = require('fs');
var querystring = require('querystring');
var util = require('util');

var crypto = require('crypto');
var https = require('https');
var URL = require('url');
var http = require('http');

//非系统模块
var Promise = require(__dirname + '/promise').Promise;
var $ = require(__dirname + '/mix');

//配置常量

var CONFIG = {
    appkey: '',
    appsecret: '',
    oauth_host: 'https://api.weibo.com/oauth2/authorize',
    access_url: 'https://api.weibo.com/oauth2/access_token',
    api_url: 'https://api.weibo.com/2/'
}
var APIS = require(__dirname + '/apis');
var iweibo = {};
/**
 * 基本配置
 * @param {String} name key
 * @param {String} opt  value
 */
iweibo.set = function(name, opt) {
    if ($.isString(name)) {

        if ($.isString(opt)) {
            CONFIG[name] = opt;
        } else {
            return CONFIG[name];
        }

    } else if (typeof name === 'object') {
        CONFIG = $.mix(CONFIG, name);
    }

    return iweibo;
}
/**
 * 添加api
 * @param {[type]} name [description]
 * @param {[type]} opt  [description]
 */
iweibo.setAPI = function(name, opt) {
    if ($.isString(name)) {
        
        if (typeof opt === 'object') {
            if( !opt.params ){
                opt.params = {};
            }
            APIS[name] = opt;
        } else {
            return APIS[name];
        }

    } else if (typeof name === 'object') {
        APIS = $.mix(APIS, name);
    }
    return iweibo;
}


var emptyFn = function() {};

var Weibo = function(accessToken, refreshToken) {
    this.oauthHost = CONFIG.oauth_host;
    this.accessURL = CONFIG.access_url;
    this.appkey = CONFIG.appkey;
    this.apppwd = CONFIG.appsecret;
    this.apiURL = CONFIG.api_url;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
}
Weibo.prototype.getAPI = function(url, params, callback) {
    params.source = this.appkey;
    if (this.assessToken)
        params.access_token = this.accessToken;
    url = url + '?' + querystring.stringify(params);
    return this.get(url, callback);
}
Weibo.prototype.postAPI = function(url, params, callback) {
    params.source = this.appkey;
    if (this.assessToken)
        params.access_token = this.accessToken;
    return this.post(url, params, callback);
};
Weibo.prototype.api = function(key, params, callback) {
    var apis = APIS;
    if (key in apis) {
        //存在api中
        var apiData = apis[key];
        params = params || {};
        params = $.mix(apiData.params, params);
        var method = (apiData.method || 'get').toLowerCase();
        var url = this.apiURL + key + '.json';
        var cb = emptyFn;
        if ($.isFunction(callback)) {
            cb = function(err, data) {
                data = JSON.parse(data);
                callback(err, data);
            }
        }
        return this[method + 'API'](url, params, callback);

    } else {
        return false;
    }
}

Weibo.prototype.getAuthorizeURL = function(url, response_type, state, display) {
    state = state || '';
    display = display || '';
    response_type = response_type || 'code';
    if (url === '') {
        console.log('getAuthorizeURL: url is empty!');
    }
    var urlObj = {
        'client_id': this.appkey,
        'redirect_uri': url,
        'response_type': response_type,
        'state': state,
        'display': display
    };
    //https://api.weibo.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REGISTERED_REDIRECT_URI
    return this.oauthHost + '?' + querystring.stringify(urlObj);
};
Weibo.prototype.getAccessToken = function(response_type, keys, callback) {
    var urlObj = {
        'client_id': this.appkey,
        'client_secret': this.apppwd
    };
    switch (response_type) {
        case 'token':
            urlObj.grant_type = 'refresh_token';
            urlObj.refresh_token = keys.refresh_token;
            break;
        case 'code':
            urlObj.grant_type = 'authorization_code';
            urlObj.code = keys.code;
            urlObj.redirect_uri = keys.redirect_uri;
            break;
        case 'password':
            urlObj.grant_type = 'password';
            urlObj.username = keys.username;
            urlObj.password = keys.password;
            break;
        default:
            console.log('getAccessToken: error type ' + response_type);
    }


    return this.post(this.accessURL, urlObj, callback);
};

Weibo.prototype.request = function(method, url, headers, post_body, access_token, callback) {

    var http_library = https;
    var creds = crypto.createCredentials({});
    var parsedUrl = URL.parse(url, true);
    if (parsedUrl.protocol == 'https:' && !parsedUrl.port) {
        parsedUrl.port = 443;
    }

    // As this is OAUth2, we *assume* https unless told explicitly otherwise.
    if (parsedUrl.protocol !== 'https:') {
        http_library = http;
    }

    var realHeaders = {};

    if (headers) {
        for (var key in headers) {
            realHeaders[key] = headers[key];
        }
    }
    realHeaders.Host = parsedUrl.host;

    realHeaders['Content-Length'] = post_body ? Buffer.byteLength(post_body) : 0;
    if (access_token && !('Authorization' in realHeaders)) {
        if (!parsedUrl.query) parsedUrl.query = {};
        parsedUrl.query.access_token = access_token;
    }

    var queryStr = querystring.stringify(parsedUrl.query);
    if (queryStr) queryStr = '?' + queryStr;
    var options = {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + queryStr,
        method: method,
        headers: realHeaders
    };
    return this.executeRequest(http_library, options, post_body, callback);
}
Weibo.prototype.executeRequest = function(http_library, options, post_body, callback) {
    // allow this behaviour.
    var callbackCalled = false;
    var promise = new Promise();
    promise.always(callback, callback);

    function passBackControl(response, result) {
        if (!callbackCalled) {
            callbackCalled = true;
            if (response.statusCode != 200 && (response.statusCode != 301) && (response.statusCode != 302)) {
                console.log('ERROR===>', result);
                promise.reject([true, {
                    statusCode: response.statusCode,
                    data: result
                }]);
            } else {
                console.log('Success===>', result);
                promise.resolve([false, result, response]);
            }
        }
    }

    var result = '';

    var request = http_library.request(options, function(response) {
        response.on('data', function(chunk) {
            result += chunk
        });
        response.on('close', function(err) {

        });
        response.addListener('end', function() {
            passBackControl(response, result);
        });
    });
    request.on('error', function(e) {
        callbackCalled = true;
        promise.reject([e]);
    });

    if (options.method == 'POST' && post_body) {
        request.write(post_body);
    }
    request.end();
    return promise;
}


Weibo.prototype.get = function(url, callback) {
    return this.request('GET', url, '', '', '', callback);
};
Weibo.prototype.post = function(url, postData, callback) {
    postData = $.isString(postData) ? postData : querystring.stringify(postData);
    var postHeader = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    if (!$.isFunction(callback)) {
        callback = emptyFn;
    }
    return this.request('POST', url, postHeader, postData, null, callback);
};
iweibo.Weibo = Weibo;
module.exports = iweibo;
