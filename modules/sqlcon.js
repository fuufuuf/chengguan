var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var async = require('async');
var util = require('util');
var request = require('request');
var settings = require('../settings');

var config = {
    userName: settings.db_user,
    password: settings.db_passwd,
    server: settings.db_server,
    options:
    {rowCollectionOnDone : 'true'}


};


Date.prototype.Format = function(fmt)
{
    var o = {
        "M+" : this.getMonth()+1,                 //
        "d+" : this.getDate(),                    //
        "h+" : this.getHours(),                   //
        "m+" : this.getMinutes(),                 //
        "s+" : this.getSeconds(),                 //
        "q+" : Math.floor((this.getMonth()+3)/3), //
        "S"  : this.getMilliseconds()             //
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}



var sqlexec = function(sql, callback) {
    var conn = new Connection(config);
    conn.on('connect', function(err) {
            // If no error, then good to go...
            if (err){
                console.log(err);
                callback(err, null);
            }
            else {
          //      console.log('connected');
                exec(conn, sql, function(err, rowCount, rows){

                    //console.log(rows);
                    if (err){

                        callback(err, null);
                    }else{

                        callback(null, rowCount, rows);
                    }

                });

            }
        }
    );


};


function exec(conn, sql, callback){


    var rows=[];
    var i = 0;

    var request = new Request(sql, function(err, rowCount) {
        if (err) {
            console.log(err);
            callback(err, null);
            conn.close();
        } else {
            console.log(rowCount + ' rows');
            conn.close();
            callback(null, rowCount, rows);

        }
    });

    request.on('row', function(columns) {
        var tmp ={};

        columns.forEach(function(column) {

            tmp[column.metadata.colName] = column.value;

        });
        rows[i] = tmp;
        i++;

    });
    conn.execSql(request);


};


var sql_task_detail = function(taskNum, callback){

    async.series({
        task: function(callback){

            var sql = util.format("SELECT * FROM BMSInspection.dbo.CG_taskdispatch a, BMSInspection.dbo.CG_ZHCGMAINTYPE b, BMSInspection.dbo.CG_ZHCGSUBTYPE c, BMSInspection.dbo.CG_ZHCGEVENTTYPE d" +
                " where a.TaskNum='%s' and a.MainType=b.MAINTYPEID and a.SubType=c.SUBTYPEID and a.EventType=d.EVENTTYPEID",taskNum);

            console.log(sql);

            sqlexec(sql, function(err, rowCount, row){

                row[0].EventPositionMap = 'http://www.96310.gov.cn:8080/Media.ashx?URL='+row[0].EventPositionMap.split('MediaRoot')[1].substring(1);


                callback(null, row);
            });

        },
        task_img: function(callback){

            var sql = "SELECT * FROM BMSInspection.dbo.CG_TaskMaterials where BMSInspection.dbo.CG_TaskMaterials.TaskNum='%s'"+
                "and BMSInspection.dbo.CG_TaskMaterials.Type=0";

            sql = util.format(sql, taskNum);

           // console.log(sql);

            sqlexec(sql, function(err, rowCount, row){

                row.forEach(function(item){
                    item.LocalURL='http://www.96310.gov.cn:8080/Media.ashx?URL='+item.LocalURL.split('MediaRoot')[1].substring(1);

                })

                callback(null, row);
            });
        },
        task_media: function(callback){


            var sql = "SELECT * FROM BMSInspection.dbo.CG_TaskMaterials where BMSInspection.dbo.CG_TaskMaterials.TaskNum='%s'"+
                "and BMSInspection.dbo.CG_TaskMaterials.Type=1";
            sql = util.format(sql, taskNum);

            sqlexec(sql, function(err, rowCount, row){

                callback(null, row);
            });
        }
    },function(err, results) {
        console.log(results);
        callback(results);
    });
};

//从web service拿到task具体信息插入到CG_taskdispatch表内
var task_dispatch = function(p, callback){

    var status = '00';
    var img_list = [];

    var sql = "insert into BMSInspection.dbo.CG_taskdispatch(TaskNum, FindTime, EventSource, EventType, MainType, SubType, DistrictCode, DistrictName," +
        "StreetCode, StreetName, CommunityCode, CommunityName, CoordinateX, CoordinateY, EventAddress, EventDescription, EventPositionMap, " +
        "SendTime, DealEndTime, SendMemo, DealTimeLimit, DealUnit, Status) values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', "+
        " %s, %s, '%s', '%s', '%s', '%s', '%s', '%s', %s, '%s','%s')";

    sql=util.format(sql, p.TaskNum, p.FindTime, p.EventSource, p.EventType, p.MainType, p.SubType, p.DistrictCode, p.DistrictName,
        p.StreetCode, p.StreetName, p.CommunityCode, p.CommunityName, 1*p.CoordinateX, 1*p.CoordinateY, p.EventAddress, p.EventDescription,
        p.EventPositionMap, p.SendTime, p.DealEndTime, p.SendMemo, 1*p.DealTimeLimit, p.DealUnit, status);


    var sql_img = "insert into BMSInspection.dbo.CG_TaskMaterials(TaskNum, SourceName, SourceURL, LocalURL, Type) values('%s', '%s', '%s', '%s', '%s')";
//确保如果没有图片也能够正确处理CG_TaskMaterials
    var pic_num = p.EventPictures||0;
    var media_num = p.EventMedias||0;

//如果Pic数量大于1那么作为数组处理
    if(pic_num!=0&&p.EventPictures.num>1) {
        p.EventPictures.picture.forEach(function (obj) {
            // do not save img locally
            img_list.push(util.format(sql_img, p.TaskNum, obj.name, obj.url, obj.url, 0));

        });
        //如果Pic数量等于1那么作为key:value处理
    } else if(pic_num!=0&&p.EventPictures.num==1){
        var obj = p.EventPictures.picture;
        img_list.push(util.format(sql_img, p.TaskNum, obj.name, obj.url, obj.url, 0));

    }


    if(media_num!=0&&p.EventMedias.num>1) {
        p.EventMedias.media.forEach(function (obj) {
            // media also saves into img_list
            img_list.push(util.format(sql_img, p.TaskNum, obj.name, obj.url, obj.url, 1));

        });
    } else if(media_num!=0&&p.EventMedias.num==1){

        var obj = p.EventMedias.media;
        img_list.push(util.format(sql_img, p.TaskNum, obj.name, obj.url, obj.url, 1));

    }

    async.series({

        insert_task_dispatch: function(callback){

            sqlexec(sql, function (err, rowCount, row) {

                if (err) {

                    var request_body = "<Request><ResultCode>1</ResultCode>"+
                        "<ResultDesc>internal errors</ResultDesc>"+
                        "<ResultMemo>TaskDispatch</ResultMemo></Request>";

                    callback (request_body,null);

                }else {

                    request_body = "<Request><ResultCode>0</ResultCode>" +
                        "<ResultDesc>成功保存信息</ResultDesc>" +
                        "<ResultMemo>TaskDispatch</ResultMemo></Request>";


                    callback(null, request_body);
                }


            });
        },
//include both image and medias
        insert_img: function(callback_1){

            if(img_list.length==0){

                callback_1(null, 'no image');
            }else{

            async.each(img_list, function(img_sql, callback_each) {

                // insert into cg_materials on file here.

                sqlexec(img_sql, function (err, rowCount, row) {

                    if (err) {

                        callback_each(err,'****error url is '+img_sql);

                    }else {

                        callback_each();
                    }

                });

            }, function(err){
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('A sql failed to process');
                    console.log(err);
                    callback_1(err);
                } else {
                    console.log('All img_info have been processed successfully');
                    callback_1(null, 'all img saved');
                }
            });
            }//else

        }}, function(err, results){

        if(err){

            //the error might error on both task_dispatch and task_materials table
            callback(err, null);
        }
        else{
            //return task dispatch results
            callback(null, results.insert_task_dispatch);

        }

    });

};



/*status format should be like 00, 01*/
var status_update = function(taskNum,status, sql, callback){

    async.series({
        status_update: function(callback){


            var status_sql = "update BMSInspection.dbo.CG_taskdispatch set Status='%s' where TaskNum='%s'";
            status_sql = util.format(status_sql, status, taskNum);

            console.log(status_sql);


            sqlexec(status_sql, function(err, rowCount, row){

                callback(null, row);
            });

        },
        task: function(callback){

            sqlexec(sql, function(err, rowCount, row){

                callback(null, row);
            });
        }
    },function(err, results) {

        if(err){

            callback(err);

        }else {
            callback(null, results)
        };
    });
};


var push = function(update_info, callback){

    async.series({
        update_push_table: function(callback){

        //根据信息更新推送表
            var status_sql = "update BMSInspection.dbo.CG_push set push_group='%s', push_time='%s',status='%s' where id=%s";
            status_sql = util.format(status_sql,update_info.dept, update_info.t, 1,update_info.id);

            console.log(status_sql);


            sqlexec(status_sql, function(err, rowCount, row){

                callback(null, row);
            });

        },
        get_result_for_push: function(callback){
        //将最新信息返回作为推送信息
            var sql = 'select * from BMSInspection.dbo.CG_push where id='+update_info.id;

            sqlexec(sql, function(err, rowCount, row){

                callback(null, row);
            });
        }
    },function(err, results) {
        callback(null, results);
    });
};

//http://ip/userVerify?userName=xxxx&validatedInfo=xxxx
var user_validation = function(user, passwd, callback_1){

    async.series({
        Check_ZJ_User: function(callback){

            var sql = util.format("select * from BMSPlatForm.dbo.Users where Username='%s'",user);

            sqlexec(sql, function(err, rowCount, row){

                if(rowCount==0){

                    callback('-2', null);//return 0 as no user in BMSPlatForm
                }
                else{

                    callback(null, 'pass to Create_Mobile_User')

                };


            });

        },
        Create_Mobile_User: function(callback){

            var sql = "select * from BMSInspection.dbo.CG_Mobile_User where name='%s'";

            sql = util.format(sql, user);

            sqlexec(sql, function(err, rowCount, row){
                //新建用户
                if(rowCount==0){

                    var sql_c = "insert into BMSInspection.dbo.CG_Mobile_User(name, validate_info) values('%s','%s')";
                    sql_c = util.format(sql_c, user, passwd);
                    sqlexec(sql_c, function(err, rowCount, row){

                        callback('1', null);//return 1 as user creation succeeded
                    })

                }else{

                    callback(null, 'pass to Check_Mobile_User');

                }


            });
        },
        Check_Mobile_User: function(callback){

            var sql = "select * from BMSInspection.dbo.CG_Mobile_User where name='%s' AND validate_info='%s'";

            sql = util.format(sql, user,passwd);

            sqlexec(sql, function(err, rowCount, row){
                if(rowCount==0){

                    callback('-1', null);//return -1 as passwd incorrect

                }else{

                    callback(null, '1');

                }



            });
        }
    },function(err, results) {
        callback_1(err, results);
    });
};



var auto_push = function(sql_yh, sql_wx, sql_xj, callback_auto){

    var sql_pool = [];

    async.series({

        yh:function(callback){

        sqlexec(sql_yh, function(err, rowCount, row){
                row.forEach(function(item){
                var sql = "insert into BMSInspection.dbo.CG_push(title, contents, create_time, type, status, zhcg, push_group, auto_push, push_time) " +
                    "values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s','%s')";
                var contents = {};
                contents['task_name'] = item.task_name;
                contents['start_time'] = new Date(item.start_time).Format("yyyy-MM-dd hh:mm:ss");
                contents['end_time'] = new Date(item.end_time).Format("yyyy-MM-dd hh:mm:ss");
                contents['xj_bridge'] = item.xj_bridge;
                contents['task_desc'] = item.task_desc;
                sql = util.format(sql, item.task_name, JSON.stringify(contents), new Date(item.create_time).Format("yyyy-MM-dd hh:mm:ss"),
                    2, 1, 0, item.dept, 0, new Date().Format("yyyy-MM-dd hh:mm:ss"));
                sql_pool.push(sql);
                    //console.log(sql);

    })
                callback(null, 'yh');

            });



        },
        xj:function(callback_s){

            sqlexec(sql_xj, function(err, rowCount, row) {
                async.each(row, function (item, callback) {
                    var sql = "insert into BMSInspection.dbo.CG_push(title, contents, create_time, type, status, zhcg, push_group, auto_push, push_time) " +
                        "values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')";
                    var contents = {};
                    //获取巡检桥梁接口GetExaminePlanTaskById(string user_name, string validated_info, string taskID)
                    //http:/service_host/InspectionService/ExamineService.svc/GetExaminePlanTaskById?user_name=xxxx&validated_info=xxxx&taskID=xxxx
                    var req = "http://%s/InspectionService/ExamineService.svc/GetExaminePlanTaskById?user_name=not_in_use&validated_info=not_in_use&taskID=%s";
                    var req = util.format(req, settings.service_api_host, item.TaskID);
                    //console.log(req);
                    request(req, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            //the request may return null, original api issue. So skip these task since no bridge
                            if(body!='') {

                                contents['task_name'] = item.task_name;
                                contents['start_time'] = new Date(item.start_time).Format("yyyy-MM-dd hh:mm:ss");
                                contents['end_time'] = new Date(item.end_time).Format("yyyy-MM-dd hh:mm:ss");
                                contents['xj_bridge'] = JSON.parse(body).BridgeName;
                                contents['task_desc'] = item.task_desc;
                                sql = util.format(sql, item.task_name, JSON.stringify(contents), new Date(item.create_time).Format("yyyy-MM-dd hh:mm:ss"),
                                    1, 1, 0, item.dept, 0,new Date().Format("yyyy-MM-dd hh:mm:ss"));
                                sql_pool.push(sql);
                                //console.log(sql);
                            }callback();

                        }
                    })
                },function(err){
                    callback_s(null, 'xj');

                })
            })},
        wx:function(callback_s){
            sqlexec(sql_wx, function(err, rowCount, row) {
                async.each(row, function (item, callback) {
                    var sql = "insert into BMSInspection.dbo.CG_push(title, contents, create_time, type, status, zhcg, push_group, auto_push, push_time) " +
                        "values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')";
                    var contents = {};
                    //http://localhost/InspectionService/RepairService.svc/
                    //GetBridgeComponentDamageAndMeasureListByMaintainTaskID?MaintainTaskID=30&user_name=admin&validated_info=qswdIM10wuHHvllXl9aUXDwGLD8DiYCqMmVsxCRLNZg%3d&page=1&rows=10&_=1456390570981
                    var req = "http://%s/InspectionService/RepairService.svc/GetBridgeComponentDamageAndMeasureListByMaintainTaskID?" +
                        "MaintainTaskID=%s&user_name=admin&validated_info=qswdIM10wuHHvllXl9aUXDwGLD8DiYCqMmVsxCRLNZg%3d&page=1&rows=10&_=1456390570981";
                    var req = util.format(req, settings.service_api_host, item.MaintainTaskID);

                    request(req, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            // the request may return null, original api issue. So skip these task since no bridge

                            if(JSON.parse(body).total!=0) {
                                contents['task_name'] = item.task_name;
                                contents['start_time'] = new Date(item.start_time).Format("yyyy-MM-dd hh:mm:ss");
                                contents['end_time'] = new Date(item.end_time).Format("yyyy-MM-dd hh:mm:ss");
                                //返回的所有bridge name 都是一样的，这里默认取了第一个
                                contents['xj_bridge'] = JSON.parse(body).rows[0].BridgeName;
                                contents['task_desc'] = item.task_desc;
                                sql = util.format(sql, item.task_name, JSON.stringify(contents), new Date(item.create_time).Format("yyyy-MM-dd hh:mm:ss"),
                                    3, 1, 0, item.dept, 0, new Date().Format("yyyy-MM-dd hh:mm:ss"));
                                sql_pool.push(sql);
                            }
                            callback();

                        }
                    })
                },function(err){

                    callback_s(null, 'wx')

                })
            })
        }



    },function(err, results){

        //对于sql_pool里的每一项，执行sql语句

       // callback_auto(null, sql_pool);

        async.each(sql_pool, function(item, callback){

            sqlexec(item, function(err, rowCount, row){

                callback();
            })

        },function(err){

            //query all available push item and return

            var sql_auto_push = "select * from [BMSInspection].[dbo].[CG_push] where auto_push=0";

            sqlexec(sql_auto_push, function(err, rowCount, row) {

                callback_auto(rowCount, row);
            })




        })

    })

}

/*
test function
*/


//var sql_yh = "select a.TaskStartTime as create_time, a.TaskName as task_name, a.TaskStartTime as start_time, a.TaskEndTime as end_time, a.TaskDescription as task_desc, c.BridgeName as xj_bridge, a.ExecutionGroup as dept from " +
//    "[BMSInspection].[dbo].[Bridge_ConserveTask] a, [BMSInspection].[dbo].[Bridge_ConserveMeasure] b, [BMSInspection].[dbo].[Bridge_Bridge] c " +
//    "where a.TaskID=b.TaskID and b.BridgeID=c.BridgeID";
/////维修任务 - a任务名称，b任务开始时间，c任务结束时间，d维修/巡检桥梁，e任务描述
//var sql_wx = "select MaintainTaskMadeTime as create_time, MaintainTaskID, MaintainTaskName as task_name, ExpectBeginTime start_time, ExpectEndTime as end_time, MaintainTaskDes as task_desc, ExecuteWorkGroup as dept" +
//    " from [BMSInspection].[dbo].[Bridge_MaintainTask]";
////巡检任务包含：a 任务名称，b任务开始时间，c任务结束时间，d 巡检桥梁 e 巡检类型 f 任务描述 -no type(e) here, need to be added once confirmed
//var sql_xj = "select a.TaskID, b.MakeTime as create_time, a.TaskID, b.PlanName as task_name, a.TaskStartTime  as start_time, a.TaskEndTime as end_time, b.PlanContent as task_desc, TaskExeGroup as dept " +
//    "from BMSInspection.dbo.Bridge_ExaminePlanTask a, BMSInspection.dbo.Bridge_ExaminePlan b " +
//    "where a.PlanID=b.PlanID";
//
//auto_push(sql_yh, sql_wx, sql_xj, function(err, sql_status){
//
//    console.log(sql_status);
//
//})

//user validation test
//user_validation('admin999988','1234567',function(err, result){
//
//    console.log('err',err);
//    console.log('result', result.Check_Mobile_User);
//
//
//
//
//})

exports.user_validation = user_validation;
exports.status_update = status_update;
exports.sqlexec = sqlexec;
exports.sql_task_detail = sql_task_detail;
exports.task_dispatch = task_dispatch;
exports.push = push;
exports.auto_push = auto_push;
//var s = sqlexec('select * from BMSInspection.dbo.aspnet_Users');



