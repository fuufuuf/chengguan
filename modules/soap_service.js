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

            process : function(args, callback) {


                    var nr = args.request['$value'].replace(/\/\'/g, '\'');

                    parseString(nr, {explicitArray: false, mergeAttrs: true}, function (err, result) {

                        if (err) throw err;
                        var params = result['Request']['params'];

                        if (result['Request']['function']['name'] == 'TaskDispatch') {
                            // console.log(s);

                            Task_dispatch(params, function (r) {

                                callback(r);
                            });


                        } else if (result['Request']['function']['name'] == 'ReplyAccredit') {

                            ReplyAccredit(params, function (r) {

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


        var sql = "update BMSInspection.dbo.CG_ApplyAccredit set ReplyDate='%s', ReplyCode='%s', ReplyInfo='%s', ReplyMemo='%s' where " +
            "TaskNum='%s'";

        sql = util.format(sql, p.ReplayDate, p.ReplayCode, p.ReplayInfo, p.ReplayMemo, p.TaskNum);
        var status= (p.ReplyInfo==1)?1+ p.ReplayCode:2+ p.ReplayCode;


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
