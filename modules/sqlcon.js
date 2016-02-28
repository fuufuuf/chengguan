var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var async = require('async');
var util = require('util');
var settings = require('../settings');

var config = {
    userName: settings.db_user,
    password: settings.db_passwd,
    server: settings.db_server,
    options:
    {rowCollectionOnDone : 'true'}


};


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

            var sql = util.format("SELECT * FROM BMSInspection.dbo.CG_taskdispatch where BMSInspection.dbo.CG_taskdispatch.TaskNum='%s'",taskNum);

            sqlexec(sql, function(err, rowCount, row){

                callback(null, row);
            });

        },
        task_img: function(callback){

            var sql = "SELECT * FROM BMSInspection.dbo.CG_TaskMaterials where BMSInspection.dbo.CG_TaskMaterials.TaskNum='%s'"+
                "and BMSInspection.dbo.CG_TaskMaterials.Type=0";

            sql = util.format(sql, taskNum);

            console.log(sql);

            sqlexec(sql, function(err, rowCount, row){

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

                    var request_body = "<ResultCode>1</ResultCode>"+
                        "<ResultDesc>internal errors</ResultDesc>"+
                        "<ResultMemo>TaskDispatch</ResultMemo>";

                    callback (request_body,null);

                }else {

                    request_body = "<ResultCode>0</ResultCode>" +
                        "<ResultDesc>成功保存信息</ResultDesc>" +
                        "<ResultMemo>TaskDispatch</ResultMemo>";


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
        callback(null, results);
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
//var s = sqlexec('select * from BMSInspection.dbo.aspnet_Users');



