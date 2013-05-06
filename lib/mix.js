var cleanObj = {};
var emptyArr = [];
var arrSlice = emptyArr.slice;
var $ = {}; 
/**
 * 混合杂糅
 * @param  {Object} target 目标对象，以此为基础的对象
 * @param  {Object} source 来源对象
 * @param  {Boolean} ride  是否覆盖同名属性
 * @return {Object}        处理完的对象
 */

$.mix = function mix(target, source, ride) {
    var args = arrSlice.call(arguments);
    var i = 1;
    var key;
    //如果最后参数是布尔，判定是否覆写同名属性
    ride = $.isBoolean(ride) ? ride : true;

    while ((source = args[i++])) {
        //source = [{a:1},{b:3}];
        if ($.isArray(source)) {
            for (var n = 0, len = source.length; n < len; n++) {
                mix(target, source[n], ride);
            }
            continue;
        }
        //杂糅只允许对象
        for (key in source) {
            if (ride || !(key in target)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

//基本类型判断
'Function,String,Number'.replace(/[^, ]+/g, function(t) {
    $['is' + t] = function(s) {
        return isType(s, t);
    }
});
$.isObject = function(obj) {
    return typeof obj === 'object';
}
$.isArray = Array.isArray;
$.isBoolean = function(obj) {
    return obj === true || obj === false || isType(obj, 'Boolean');
};

$.isUndefined = function(obj) {
    return obj === undefined;
};

/**
 * 获取类型
 * @param  {Object} obj 要判断的对象
 * @return {String}     返回类型
 */

function isType(obj, type) {
    return cleanObj.toString.call(obj).slice(8, -1) === type;
}

module.exports = $;