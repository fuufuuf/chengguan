var soap = require('soap');
var parseString = require('xml2js').parseString;
var path = require('path');
var http = require('http');
var sql_exec = require('./sqlcon');
var util = require('util');
var settings = require('../settings');

var soap_service = {
    EgovaService: {
        EgovaServicePort: {

            process : function(args, callback) {


                console.log('*********handle the process**************');
                console.log(args);
                console.log('*********handle the process**************');
                if(args.request['$value']){

                    var nr = args.request['$value'].replace(/\/\'/g, '\'');
                    parseString(nr, {explicitArray: false, mergeAttrs: true}, function (err, result) {

                        if (err) throw err;
                        var params = result['Request']['params'];

                        if (result['Request']['function']['name'] == 'TaskDispatch') {
                            // console.log(s);
                            if(params.DealUnit!=settings.unitID){//throw unitID not eq required

                                var request_body = "<Request><ResultCode>0</ResultCode>" +
                                    "<ResultDesc>成功保存</ResultDesc>" +
                                    "<ResultMemo>信息不属于市政部</ResultMemo></Request>";

                                callback ({result:request_body});
                            }else{

                            Task_dispatch(params, function (r) {

                                callback(r);
                            });
                            }


                        } else if (result['Request']['function']['name'] == 'ReplyAccredit') {

                            ReplyAccredit(params, function (r) {

                                callback(r);
                            });

                        }else if(result['Request']['function']['name'] == 'StateDispatch'){

                            StateDispatch(params, function(r){


                                callback(r);
                            })


                        }

                    });
                }else{
                    var request_body = "<Request><ResultCode>1</ResultCode>"+
                        "<ResultDesc>err</ResultDesc>"+
                        "<ResultMemo>internal error</ResultMemo></Request>";

                    callback ({result:request_body});

                }


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


        sql_exec.task_dispatch(p, function(err, res){

            if (err) {

                callback({result: err});
            }
            else{

                callback({result:res});

            }

        })




};


var ReplyAccredit = function(p, callback){

    console.log('replyAccredit');


        var sql = "update BMSInspection.dbo.CG_ApplyAccredit set ReplyDate='%s', ReplyCode='%s', ReplyInfo='%s', ReplyMemo='%s' where " +
            "TaskNum='%s'";

        sql = util.format(sql, p.ReplayDate, p.ReplayCode, p.ReplayInfo, p.ReplayMemo, p.TaskNum);
        var status= (p.ReplyInfo==1)?1+ p.ReplayCode:2+ p.ReplayCode;

    console.log(sql);

        sql_exec.status_update(p.TaskNum, status, sql, function(err, result){


            if (err){


                var request_body = "<Request><ResultCode>1</ResultCode>"+
                    "<ResultDesc>err</ResultDesc>"+
                    "<ResultMemo>ApplyAccredit</ResultMemo></Request>";

                callback ({result:request_body});


            }else{


                var request_body = "<Request><ResultCode>0</ResultCode>"+
                    "<ResultDesc>saved successed</ResultDesc>"+
                    "<ResultMemo>ApplyAccredit</ResultMemo></Request>";

                callback ({result:request_body});
            }

        })

};


var StateDispatch = function(p, callback){

    var sql = "select * from BMSInspection.dbo.CG_inState where TaskNum='%s'";
    var sql_insert = "insert into BMSInspection.dbo.CG_inState(TaskNum,OperateDate,OperateID, ActDefName) values('%s', '%s', '%s', '%s')";
    var sql_update = "update BMSInspection.dbo.CG_inState set OperateDate='%s', OperateID='%s', ActDefName='%s' where TaskNum='%s'";

    sql = util.format(sql, p.TaskNum);
    sql_insert = util.format(sql_insert, p.TaskNum, p.OperateDate, p.OperateID, p.ActDefName);
    sql_update = util.format(sql_update, p.OperateDate, p.OperateID, p.ActDefName, p.TaskNum);

    var request_body_err = "<Request><ResultCode>1</ResultCode>"+
        "<ResultDesc>err</ResultDesc>"+
        "<ResultMemo>StateDispatch</ResultMemo></Request>";

    var request_body = "<Request><ResultCode>0</ResultCode>"+
        "<ResultDesc>saved successed</ResultDesc>"+
        "<ResultMemo>StateDispatch</ResultMemo></Request>";

    console.log(sql, sql_insert, sql_update);



    sql_exec.sqlexec(sql, function(err, rowCount, row){

        if(rowCount==0){

            sql_exec.sqlexec(sql_insert, function(err, rowCount, row){

                callback ({result:request_body});
            })

        }else{

            sql_exec.sqlexec(sql_update, function (err, rowCount, row) {

                callback ({result:request_body});

            })

        }

    })
};
