var fs = require('fs');
var soap = require('soap');
var settings = require('../settings');
var path = require('path');
var url = settings.zhcg_webservice_url;

// soap.createClient(url, function(err, client) {

//     if (err) throw err;


//     xml_req = fs.readFileSync('./request_test.xml', 'utf-8');
//     xml_req_1 = fs.readFileSync('./request_reply_delay.xml', 'utf-8');
//     xml_req_2 = fs.readFileSync('./request_reply_hang.xml', 'utf-8');
//     /*测试新建任务*/
//     client.process({SPID: settings.zhcg_user, SPPWD: settings.zhcg_passwd, func: 'TaskDispatch', request: xml_req}, function (err, res) {
//         if (err) throw err;

//         console.log(res);
//     });
//     /*测试延期*/
//     //client.process({SPID:'12345',SPPWD:'22345',func:'ReplyAccredit',request:xml_req_1},function(err,res){
//     //    if (err) throw err;
//     //
//     //    console.log(res);
//     //});
//     /*测试挂账*/
// //    client.process({SPID:'12345',SPPWD:'22345',func:'ReplyAccredit',request:xml_req_2},function(err,res){
// //        if (err) throw err;
// //
// //        console.log(res);
// //    });
// //



// });


var zhcg_opt = function(func, opt, callback) {

    console.log(settings.zhcg_webservice_url);

    soap.createClient(settings.zhcg_webservice_url, function(err, client) {

        if (err) throw err;


        client.process({SPID:settings.zhcg_user,SPPWD:settings.zhcg_passwd,func:func,request:opt},function(err,res){
        if (err) throw err;
        callback(res);
    });
    })
}


//test only
xml_req = fs.readFileSync(path.join(__dirname,'request_test.xml'), 'utf-8');



zhcg_opt('taskFeedback', xml_req, function(results){

    console.log(results);

})


exports.zhcg_opt = zhcg_opt;
