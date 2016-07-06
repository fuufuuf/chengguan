var fs = require('fs');
var soap = require('soap');
var settings = require('../settings');
var path = require('path');
var fs = require('fs');
var parseString = require('xml2js').parseString;


var zhcg_opt = function(func, opt, callback) {//this is used to send request to zhcg, that includes taskfeedback, delay('ApplyAccredit') and rollback


    soap.createClient(settings.zhcg_webservice_url, function(err, client) {

        if (err){

            callback(err);

        }else{

        client.process({SPID:settings.zhcg_user,SPPWD:settings.zhcg_passwd,func:func,request:opt},function(err,ret) {
            if (err) {

                console.log(err);
                callback(err);
            } else {

                parseString(ret['result'], {explicitArray: false, mergeAttrs: true}, function (err, result) {

                    callback(null, result['Result'])
                })

            }

    });
        }
    })
}

//var xml = fs.readFileSync('../modules/request_test.xml');
//
//zhcg_opt('test_func',xml, function(res){
//
//    console.log(res);
//})

exports.zhcg_opt = zhcg_opt;
