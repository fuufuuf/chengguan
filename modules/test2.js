var fs = require('fs');
var soap = require('soap');
var settings = require('../settings');
var path = require('path');
//var url = settings.zhcg_webservice_url;
var url = 'http://localhost:8004/wsdltest?wsdl';

//test only
//xml_req = fs.readFileSync(path.join(__dirname,'request_test.xml'), 'utf-8');
//
//zhcg_opt('taskFeedback', xml_req, function(results){//task feedback
//
//    console.log(results);
//
//})

soap.createClient(url, function(err, client) {

    if (err) throw err;


    xml_req = fs.readFileSync('./rev.xml', 'utf-8');//taskdispatch
    //xml_req_1 = fs.readFileSync('./request_reply_delay.xml', 'utf-8');
    //xml_req_2 = fs.readFileSync('./request_reply_hang.xml', 'utf-8');
    /*测试新建任务*/
    client.process({SPID: settings.zhcg_user, SPPWD: settings.zhcg_passwd, func: 'TaskDispatch', request: xml_req}, function (err, res) {
        if (err) throw err;

        console.log(res);
    });
    /*测试延期*/
    //client.process({SPID:'12345',SPPWD:'22345',func:'ReplyAccredit',request:xml_req_1},function(err,res){
    //    if (err) throw err;
    //
    //    console.log(res);
    //});
    /*测试挂账*/
    //    client.process({SPID:'12345',SPPWD:'22345',func:'ReplyAccredit',request:xml_req_2},function(err,res){
    //        if (err) throw err;
    //
    //        console.log(res);
    //    });
    //



});



