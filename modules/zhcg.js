var fs = require('fs');
var soap = require('soap');
var settings = require('../settings');
var path = require('path');
var url = settings.zhcg_webservice_url;
//var url = 'http://localhost:8004/wsdltest?wsdl'



var zhcg_opt = function(func, opt, callback) {//this is used to send request to zhcg, that includes taskfeedback, delay('ApplyAccredit') and rollback

    console.log(settings.zhcg_webservice_url);

    soap.createClient(settings.zhcg_webservice_url, function(err, client) {

        if (err) throw err;

        client.process({SPID:settings.zhcg_user,SPPWD:settings.zhcg_passwd,func:func,request:opt},function(err,res){
        if (err) throw err;
        callback(res);
    });
    })
}


exports.zhcg_opt = zhcg_opt;
