var soap = require('soap');
var parseString = require('xml2js').parseString;
var path = require('path');
var http = require('http');
var sql_exec = require('./sqlcon');
var util = require('util');
var settings = require('../settings');

var soap_service = {
    ws: {
        zj_zhcg: {

            process : function(args, callback){



                parseString(args.request, { explicitArray : false, mergeAttrs: true }, function (err, result) {

                    if(err) throw err;


                    if(args.func=='TaskDispatch'){


                        Task_dispatch(result['request']['params'], function(r){

                            callback(r);
                        });


                    }else if(args.func=='ReplyAccredit'){


                        ReplyAccredit(result['request']['params'], function(r){

                            callback(r);
                        });



                    }



                });

            }
        }
    }
};

/*create soap service*/
var xml = require('fs').readFileSync(path.join(path.dirname(__dirname),'zhcg.wsdl'), 'utf8'),
    soap_server = http.createServer(function(request,response) {
        response.end("404: Not Found: "+request.url)
    });
soap_server.listen(settings.local_webservice_port);
s = soap.listen(soap_server, '/wsdltest', soap_service, xml);

s.log = function(type, data) {
    //console.log('type *********************************'+type);
    console.log('**************************data ************************\n'+data+'\n***************************\n');
};

s.on('request', function(req, methodName){
    //  console.log(methodName);
   // console.log(req);

});


var Task_dispatch = function(p, callback){


    //var NoNULL_LIST = ['EventPositionMap','SendTime','SendMemo','DealUnit', 'EventSource','EventPictures','EventMedias'];
    //
    //
    ////pre_check记录了soap传来的参数是否有空值，如果有空值但是不在null_list里面，直接返回错误给soap服务器
    //var pre_check = Check_Null(NoNULL_LIST, p);

    var pre_check=true;//set always to true until pre_check function done


    if(pre_check!=true){

        var request_body = "<ResultCode>1</ResultCode>"+
            "<ResultDesc>%s 是空值，不符合规范，请重新发起请求</ResultDesc>"+
            "<ResultMemo>TaskDispatch</ResultMemo>";


        request_body = util.format(request_body, pre_check);

        callback ({request:request_body});

    }
    else{
        sql_exec.task_dispatch(p, function(err, res){

            if (err) {

                callback({request: err});
            }
            else{

                callback({request:res});

            };




        })

    }


};


var ReplyAccredit = function(p, callback){


    //var NoNULL_LIST = ['EventPositionMap','SendTime','SendMemo','DealUnit', 'EventSource','EventPictures','EventMedias'];
    //
    //
    ////pre_check记录了soap传来的参数是否有空值，如果有空值但是不在null_list里面，直接返回错误给soap服务器
    //var pre_check = Check_Null(NoNULL_LIST, p);

    var pre_check=true;//set always to true until pre_check function done


    if(pre_check!=true){

        var request_body = "<ResultCode>1</ResultCode>"+
            "<ResultDesc>%s 是空值，不符合规范，请重新发起请求</ResultDesc>"+
            "<ResultMemo>TaskDispatch</ResultMemo>";


        request_body = util.format(request_body, pre_check);

        callback ({request:request_body});

    }
    else{
        var sql = "update BMSInspection.dbo.CG_ApplyAccredit set ReplyDate='%s', ReplyCode='%s', ReplyInfo='%s', ReplyMemo='%s' where " +
            "TaskNum='%s'";

        sql = util.format(sql, p.ReplayDate, p.ReplayCode, p.ReplayInfo, p.ReplayMemo, p.TaskNum);
        var status= (p.ReplyInfo==1)?1+ p.ReplayCode:2+ p.ReplayCode;


        sql_exec.status_update(p.TaskNum, status, sql, function(err, result){


            if (err){


                var request_body = "<ResultCode>1</ResultCode>"+
                    "<ResultDesc>err</ResultDesc>"+
                    "<ResultMemo>ApplyAccredit</ResultMemo>";

                callback ({request:request_body});


            }else{


                var request_body = "<ResultCode>0</ResultCode>"+
                    "<ResultDesc>saved successed</ResultDesc>"+
                    "<ResultMemo>ApplyAccredit</ResultMemo>";

                callback ({request:request_body});
            }

        })
    }
};

//check if the list value is not null...
var Check_Null = function(NoNULL_LIST, p){

    for (var key in p) {

        var flag = 0;

        for(i in NoNULL_LIST){

            if(NoNULL_LIST[i] == key){

                flag = 1;
                break;

            }

        }

        if(flag==0 && (p[key]==null||p[key]=='')){


            return key;
        }

    }

    return true;

};