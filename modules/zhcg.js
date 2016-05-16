var fs = require('fs');
var soap = require('soap');
var settings = require('../settings');
var path = require('path');
var fs = require('fs');


var zhcg_opt = function(func, opt, callback) {//this is used to send request to zhcg, that includes taskfeedback, delay('ApplyAccredit') and rollback


    soap.createClient(settings.zhcg_webservice_url, function(err, client) {

        if (err) throw err;

        client.process({SPID:settings.zhcg_user,SPPWD:settings.zhcg_passwd,func:func,request:opt},function(err,res){
        if (err) throw err;
        callback(res);
    });
    })
}

//var xml = fs.readFileSync('../modules/request_test.xml');
//
//zhcg_opt('test_func',xml, function(res){
//
//    console.log(res);
//})

exports.zhcg_opt = zhcg_opt;
