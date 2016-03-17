var express = require('express');
var router = express.Router();
var sql_exec = require('../modules/sqlcon');
var mobile_push = require('../modules/push');
var zhcg = require('../modules/zhcg');
var async = require('async');
var xml2js = require('xml2js');
var fs = require('fs');
var path = require('path');
var util = require('util');
var request = require('request');
var formidable = require('formidable');
var url = require('url');
var settings = require('../settings');
/*host should be changed to real host, used to record real url for ueditor webpage*/
var host = settings.service_host;
var port = settings.service_port;

/* GET home page. */
var PUSH_STATUS_PASS = '编辑成功！请到推送管理界面进行推送';

//not in use
// router.get('/disease', function(req, res, next){

//   res.render('disease');


// })

//not in use
// router.post('/tree', function(req, res, next) {
//     //read from http request
//     //var req = "http://60.190.13.20:8080/InspectionService/GISService.svc/GetAllBridgeTree";
//     //
//     //request(req, function (error, response, body) {
//     //    if (!error && response.statusCode == 200) {
//     //        var info = JSON.parse(body);
//     //
//     //        res.json(info);
//     //
//     //    }
//     //})


//     //read from file
//     fs.readFile('../modules/bridge.json','utf-8', function(err, data){

//         if(err) throw err;

//         var j_obj = JSON.parse(data);

//         res.json(j_obj);

//     })

// });

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


router.get('/new_layout', function(req, res, next){

  res.render('new_layout');


})



router.post('/comp', function(req, res, next) {

    var dmg = req.query.id;
    var req = "http://115.29.33.204/InspectionService//ExamineService.svc/" +
        "GetAllComponentDamageTypesByStructureID?user_name=admin&validated_info=qswdIM10wuEdYHpLxS80rP6jHd1Luhavxne3Ad3961M%3d&structureID=%s&_=1449554356388";
    req = util.format(req, dmg);
    request(req, function (error, response, body) {
           if (!error && response.statusCode == 200) {

               var info = JSON.parse(body);
               var dmg_type=[]
               info.forEach(function(item){

                   dmg_type.push({'lable':item.DamageTypeName, 'value':item.DamageTypeID});
                   //console.log(item.DamageTypeName);

               });
               console.log(dmg_type);
               res.json(dmg_type);

             }
         })


});


router.get('/get_task', function(req, res, next) {
    res.render('get_task', { title: 'Express' });
});

router.get('/', function(req, res, next) {
    res.render('new_layout', { title: 'Express' });
});

router.get('/task_done', function(req, res, next) {
    res.render('get_task_done');
});

router.get('/task_gzyq', function(req, res, next) {
    res.render('get_task_gzyq');
});



router.post('/get_task', function(req, res, next) {


    sql = 'select TaskNum, MainType, DistrictName, EventAddress, SendTime, DealEndTime from BMSInspection.dbo.CG_taskdispatch where Status='+req.query.status;

    sql_exec.sqlexec(sql, function (err, rowCount, row) {


        var t = {total: rowCount, rows: row};
        res.json(t);


    });
});


router.get('/accredit', function(req, res, next) {
    res.render('accredit');
});

router.post('/accredit', function(req, res, next){

    /*获取挂账延期信息，查询表为BMSInspection.dbo.CG_ApplyAccredit, status=0为正在申请的延期挂账，status=1为申请通过的延期挂账*/

    var sql;
    if(req.query.status=='0'){

        sql = 'select TaskNum, ApplyOpter, ApplyDate, ApplyFlag ,ApplyDelayInfo, ApplyMemo from BMSInspection.dbo.CG_ApplyAccredit where ReplyDate is null';


    }else{


        sql = 'select * from BMSInspection.dbo.CG_ApplyAccredit where ReplyDate is not null';
    }

    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        row.forEach(function(r){
            if(r.ApplyFlag==1){

                r.ApplyFlag='申请延期';
            } else if(r.ApplyFlag==2){

                r.ApplyFlag='申请挂账';

            }
            if(r.ReplyInfo==0){
                r.ReplyInfo='不同意申请';

            }else if(r.ReplyInfo==1){

                r.ReplyInfo='同意申请';
            }

        })


        var t = {total: rowCount, rows: row};

        res.json(t);


    });



});


router.post('/ApplyAccredit', function(req, res, next) {
/*申请延期挂账，type=1申请延期，2申请挂账(暂时不支持)， 操作的表为CG_ApplyAccredit*/

/*type, tasknum, unitID从query获取，其他从body获取*/
    if (req.query.type=='1'){

        var sql = "insert into BMSInspection.dbo.CG_ApplyAccredit(TaskNum, ApplyOpter, ApplyFlag,ApplyDelayInfo, ApplyDate, ApplyMemo) values"+
            "('%s', '%s', '%s', '%s', '%s', '%s')";
        sql=util.format(sql, req.query.TaskNum, req.body.cgID, '1', parseFloat(req.body.ApplyDelayInfo).toFixed(2), req.body.ApplyDate, req.body.ApplyMemo);

    }else{

        var sql = "insert into BMSInspection.dbo.CG_ApplyAccredit(TaskNum, ApplyOpter, ApplyFlag, ApplyDate, ApplyMemo) values"+
            "('%s', '%s', '%s', '%s', '%s')";
        sql = util.format(sql, req.query.TaskNum, req.body.cgID, '2', req.body.ApplyDate, req.body.ApplyMemo);


    }

    console.log(sql);
    /*更新task表状态信息 01 申请延期，02申请挂账
    * 插入表CG_ApplyAccredit作为新的延期挂账申请*/
    sql_exec.status_update(req.query.TaskNum, '0'+req.query.type, sql, function(err){

        if(err) res.end('err');
/*
* not in use
* */
        //var json_obj = {
        //    TaskNum: req.query.TaskNum,
        //    ApplayOpter:req.body.cgID,
        //    ApplyFlag: req.query.type,
        //    ApplyDelayInfo:parseFloat(req.body.ApplyDelayInfo).toFixed(2),
        //    ApplyDate:req.body.ApplyDate,
        //    ApplyMemo:req.body.ApplyMemo
        //}
        //var builder = new xml2js.Builder();
        //
        //var xml =  builder.buildObject(json_obj);

        //zhcg.zhcg_opt('ApplyAccredit',xml, function(result){
        //
        //    res.end('操作成功！');
        //
        //})
        res.end('操作成功！');

    });

});

/*
*案件回退功能
*/
router.post('/task_Rollback', function(req, res, next){

    var status = '03';
    var sql = "insert into BMSInspection.dbo.CG_TaskRollBack(TaskNum, RollbackOpter, RollbackDate, RollbackMemo) values('%s','%s','%s','%s')"
    sql = util.format(sql, req.body.taskNum, req.body.RollbackOpter, req.body.RollbackDate, req.body.RollbackMemo);
    console.log(sql);
    sql_exec.status_update(req.body.taskNum,status, sql, function(err, result){

        if(err) res.end(err);
        res.end('回退成功');

    })


});

router.get('/task_rollback', function(req, res, next){

    res.render('list_rollback');

    


});

router.post('/post_rollback_list', function(req, res, next){

    var sql = "select * from BMSInspection.dbo.CG_TaskRollBack"

     sql_exec.sqlexec(sql, function(err, rowCount, row){

        var t = {total:rowCount, rows:row};
        res.json(t);


    });

});

router.get('/task_details', function(req, res, next) {

    var task_id = req.query.id;
    var web_source = req.query.source;
    console.log(web_source);


    sql_exec.sql_task_detail(task_id, function(data){



        console.log(data['task_img']);
//media is not in use on task_detail.ejs
        res.render('task_detail', {details:data['task'][0], img: data['task_img'], media:data['task_media'], web_source:web_source||'/'});

    })


});


router.post('/search_res', function(req, res, next) {


    key = req.query.key;
    nkey = req.query.nkey;

    var sql;



    if (key){

        sql = ' select TaskNum, MainType, DistrictName, EventAddress, SendTime, DealEndTime from BMSInspection.dbo.CG_taskdispatch ' +
            'where EventDescription LIKE \'%'+key+'%\' or SearchTag=1';

    }
    else if(nkey){

        sql = ' select TaskNum, MainType, DistrictName, EventAddress, SendTime, DealEndTime from BMSInspection.dbo.CG_taskdispatch ' +
            'where EventDescription not LIKE \'%'+nkey+'%\'';

    }

    console.log(sql);


    sql_exec.sqlexec(sql, function(err, rowCount, row){

        var t = {total:rowCount, rows:row};
        res.json(t);


    });


});

router.post('/setSearchTag', function(req, res, next) {

    console.log(req.body);

    TaskNum = req.body.id;

    var sql = "update BMSInspection.dbo.CG_taskdispatch set SearchTag=1 where TaskNum='%s'";
    sql = util.format(sql, TaskNum);
    console.log(sql);
    sql_exec.sqlexec(sql, function(err, rowCount, row){

        var t = {total:rowCount, rows:row};
        res.json({status:'编辑成功', success:1});


    });

});



router.post('/task_search', function(req, res, next) {

    Keyword = req.body.Keyword;

    res.render('search_res', {keyword: Keyword});
});



router.get('/editor', function(req, res, next) {

    var title;
    if(req.query.type==0){

        title = '图文编辑器';
    } else if(req.query.type==5){

        title = '报告编辑器';

    }
    res.render('editor',{type:req.query.type, title:title});
});

/*图文编辑器生成html*/
router.post('/editor', function(req, res, next) {

    var locc = {};
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(path.join(path.dirname(__dirname), 'public/cg_imgs'));
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        console.log(fields);

        //生成Html,位置在public/editor/html/目录下
        console.log(__dirname);
        fs.writeFileSync(path.join(__dirname,'..','public','editor','html',fields.title+'.html'), fields.editorValue);
        //保存附件
        for(item in files){

            if(files[item].name!='') {
                var new_path = path.join(form.uploadDir, files[item].name);
                fs.renameSync(files[item].path, new_path);
                console.log(new_path);
                console.log('name', files[item].name);
                locc[files[item].name] = host+':'+port+'/cg_imgs/'+ files[item].name;
            }

        }

        //插入推送数据库
        var sql = "insert into BMSInspection.dbo.CG_push(title, contents, create_time, type, status, rep_attach) values('%s', '%s', '%s', '%s', '%s', '%s')";
        var loc = host+':'+port+'/editor/html/'+fields.title+'.html';
        var date = new Date().Format("yyyy-MM-dd hh:mm:ss");

        sql = util.format(sql, fields.title, loc, date,req.query.type,0, JSON.stringify(locc));
        console.log(sql);

        sql_exec.sqlexec(sql, function (err, rowCount, row) {

            var t = {total: rowCount, rows: row};
       
            res.json({status : PUSH_STATUS_PASS});

        });


    });


});

/*获取所有可以推送的信息*/
router.post('/get_push', function(req, res, next) {

    var sql;

    if(req.query.status==0){
        //未推送的信息
        sql = 'select * from BMSInspection.dbo.CG_push where status='+req.query.status+' order by id desc';

    }
    else if(req.query.status==1){

        //已推送的信息

        sql = 'select a.*,b.GroupDefineName from BMSInspection.dbo.CG_push a, BMSInspection.dbo.Bridge_GroupDefine b where status='+req.query.status+
            ' and a.push_group=b.GroupDefineID order by id desc';

    }

    console.log(sql)


    //var sql = 'select a.*, b.GroupDefineName from BMSInspection.dbo.CG_push a, BMSInspection.dbo.Bridge_GroupDefine b where status='+req.query.status+' and a.GroupDefineID=b.Bridge_GroupDefine' +
    //    ' order by id desc';

    sql_exec.sqlexec(sql, function (err, rowCount, row) {


        var t = {total: rowCount, rows: row};

        row.forEach(function(r){

            r.type=push_n2c(r.type);

        })

        res.json(t);

    });
});
/*推送主界面*/
router.get('/push', function(req, res, next) {
    res.render('push.ejs');
});

/*推送消息到leancloud*/
router.post('/push', function(req, res, next) {


    //query all info from push table;id=req.body.id
    var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
    req.body.t = date;
     sql_exec.push(req.body, function(err, row){
//因为按照主键查询，数组只返回一项
         mobile_push.push(row.get_result_for_push[0], function(result){

             res.json({status:'推送成功'});

         })
     })

});





router.get('/reply_task', function(req, res, next) {


    sql_exec.sql_task_detail(req.query.id, function(data){


        res.render('reply_task', {details:data['task'][0], img: data['task_img']});

    })
});


router.post('/reply_task', function(req, res, next) {

    var loc = {};
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(path.join(path.dirname(__dirname), 'public/cg_imgs'));
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        console.log(files);

        for(item in files){

            if(files[item].name!='') {
                var new_path = path.join(form.uploadDir, files[item].name);
                fs.renameSync(files[item].path, new_path);
                console.log(new_path);
                console.log('name', files[item].name);
                loc[files[item].name] = new_path;
            }

        }

        //修改status=04,
        var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
        var sql = "insert into BMSInspection.dbo.CG_TaskFeedBack(TaskNum, FeedbackDate, FeedbackMemo, FeedbackOpter, FeedbackPic) values('%s','%s','%s','%s','%s')";
        sql = util.format(sql, fields.task_num,  date, fields.details, fields.person, JSON.stringify(loc));

       sql_exec.status_update(fields.task_num, '04', sql, function(err){

           if(err) throw err;
           res.end('操作成功');


       });



    });



});


router.get('/taskeditor', function(req, res, next) {

    var type = req.query.type;


    res.render('taskeditor.ejs',{type:type,task_type:push_n2c(type)});

});

router.post('/taskeditor', function(req, res, next) {



    var sql = "insert into BMSInspection.dbo.CG_push(title, contents, create_time, type, status, zhcg) values('%s', '%s', '%s', '%s', '%s', '%s')";
    var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
//always set zhcg=0
    sql = util.format(sql, req.body.task_name, JSON.stringify(req.body), date, req.query.type,0, 0);
  sql_exec.sqlexec(sql, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};
        console.log(t);

        res.json({status: PUSH_STATUS_PASS});

    });

});


router.get('/warning_info', function(req, res, next) {


    res.render('warning_info.ejs');

});

router.post('/warning_info', function(req, res, next) {

    var sql = "insert into BMSInspection.dbo.CG_push(title, contents, create_time, type, status, zhcg) values('%s', '%s', '%s', '%s', '%s', '%s')";
    var date = new Date().Format("yyyy-MM-dd hh:mm:ss");

    sql = util.format(sql, req.body.bridge_name+' '+date, JSON.stringify(req.body), date, req.query.type,0, req.body.zhcg_tag);
    console.log(sql);

    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};
        console.log(t);

        res.json({status: PUSH_STATUS_PASS});

    });
});

/*
* function not used since requirement change
* */
//router.get('/zj_taskpush', function(req, res, next) {
//
//
//    res.render('zj_taskpush.ejs')
//
//});
//
//router.post('/zj_taskpush', function(req, res, next) {
//
//    console.log(req.body);
//});
//
//router.post('/post_zjuser', function(req, res, next) {
//
//    mobile_push.get_user(function(d){
//
//        var t ={total: d.results.length, rows: d.results};
//        res.json(t);
//
//    })
//
//});

//推送信息预览
router.get('/push_view', function(req, res, next) {

    var id = req.query.id;
    var sql = 'select * from BMSInspection.dbo.CG_push where id='+id;


    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        //处理预警消息
        if(row[0].type=='4'){
            var obj = JSON.parse(row[0].contents);

            console.log(obj);
            res.render('inner.ejs',{c:row[0], cs:obj, type:row[0].type});

        }
        else if(row[0].type=='0'||row[0].type=='5'){

            var typec = push_n2c(row[0].type);
            var p = url.parse(row[0].contents).path;
//加入附件预览的功能
            var sj = JSON.parse(row[0].rep_attach);//解析成json
            var attach = '';

            for(k in sj){

                attach = 'http://'+sj[k];//原地址加上http://，这样href才能跳转

            };

            res.render('inner.ejs',{c:row[0], type:row[0].type, typec:typec, url:p, attach:attach});



        }else{
            var typec = push_n2c(row[0].type);
            var obj = JSON.parse(row[0].contents);
            obj.create_time = row[0].create_time;

            res.render('inner.ejs',{c:obj, type:row[0].type, typec:typec});




        }

    });

});

//列出所有可以推送的组信息
router.post('/post_all_group', function(req, res, next) {

    var sql = 'SELECT GroupDefineID, GroupDefineName from BMSInspection.dbo.Bridge_GroupDefine where Disabled=0';
    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};

        res.json(row);

    });


});

//删除推送记录
router.post('/remove_pushtask', function(req, res, next) {

    var sql = 'delete from BMSInspection.dbo.CG_push where id='+req.body.id;
    console.log(sql);
    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};

        res.json({status:'删除成功'});

    });


});



router.get('/dk_summ', function(req, res, next) {

    res.render('dk_summ.ejs');


});
//type=2对应工作组，type=1对应个人
router.post('/dk_summ', function(req, res, next) {

    var sql;

    if(req.query.type==2){

        sql = 'select UserID, Username from BMSPlatForm.dbo.Users';


    }else if(req.query.type==1){

        sql = 'select GroupDefineID, GroupDefineName from BMSInspection.dbo.Bridge_GroupDefine where Disabled=0';
        

    }
    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};
        console.log(t);

        res.json(row);

    });




});




//手机端验证用户信息
//http://ip/userVerify?userName=xxxx&validatedInfo=xxxx

router.get('/userVerify', function(req, res, next) {

    var userName = req.query.userName;
    var validatedInfo = req.query.validatedInfo;

    sql_exec.user_validation(userName, validatedInfo, function(err, result){

        if(err) {

            console.log('error',err);

            res.json({'response':err});
        }else{

            console.log('result',result.Check_Mobile_User);

            res.json({'response':result.Check_Mobile_User});

        }



    })


})

//手机创建任务以及打卡接口
router.get('/pcheck', function(req, res, next) {

    var userID = req.query.userID;
    var TaskID = req.query.TaskID;
    var Check_date = req.query.CheckDate;
    var Task_Check_Label = req.query.check;

    if(Task_Check_Label=='1'){
        //此时用户打卡
        var sql = "update BMSInspection.dbo.CG_DK set Task_Check_Label='1' where userID='%s' and TaskID='%s'";

        sql = util.format(sql, userID, TaskID);
        console.log(sql);
        sql_exec.sqlexec(sql, function (err, rowCount, row) {

            var t = {total: rowCount, rows: row};
            console.log(t);

            res.json({task:'works'});

        });


    }else{

        //用户创建任务，未打卡

        var sql = "insert into BMSInspection.dbo.CG_DK(userID, TaskID, Task_Create_Time, Task_Check_Label) values('%s','%s','%s','%s')";
        sql = util.format(sql, userID, TaskID, Check_date,Task_Check_Label);
        console.log(sql);

        sql_exec.sqlexec(sql, function (err, rowCount, row) {

            var t = {total: rowCount, rows: row};
            console.log(t);

            res.json({task:'works'});

        });


    }

})


//手机端获取group信息接口 user->group
router.get('/get_group', function(req, res, next) {

    var u_name = req.query.user;

    var g2 = " select a.UserId, a.DisplayName,b.GroupDefineName, b.GroupDefineID " +
        "from BMSPlatForm.dbo.Users a, BMSInspection.dbo.Bridge_GroupDefine b, BMSInspection.dbo.Bridge_GroupUsers c " +
        "where a.UserID=c.UserID and c.GroupDefineID=b.GroupDefineID and a.Username='%s'";

    g2 = util.format(g2, u_name);

    console.log(g2);

    sql_exec.sqlexec(g2, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};
        res.json(row);

    });


})

//移动端获取桥梁坐标
router.get('/get_xy', function(req, res, next) {
    var bridge_id = req.query.bridge_id;
    var sql = "select CharXCoord, CharYCoord from BMSInspection.dbo.Bridge_Bridge where BridgeID='%s'";
    sql = util.format(sql,bridge_id);

    sql_exec.sqlexec(sql, function (err, rowCount, row) {
        var t = {total: rowCount, rows: row};
        console.log(t);
        res.json(t.rows);


    });

});
/*智慧城管获取预警信息接口
每次获取最新的n条预警信息,如果n为空则获取1条.
location: /zhcg_get_warning
parameter: num
sample: http://1.2.3.4/zhcg_get_warning?num=5
返回为json数组.包含以下项
push_time - 推送的时间
contents - 推送的内容。内容包括bridge_name(桥梁名称), check_name(监测点), check_position(检测位置) over_time(超限时间), over_value（超限值）, yr（红黄预警）,
over_min（下限）, over_max（上限）, recover_time（恢复时间）
*/
router.get('/zhcg_get_warning', function(req, res, next) {

    var num = req.query.num||1;

    var sql = " select top %s push_time, contents from BMSInspection.dbo.CG_push where type=4 and status=1 and zhcg=1 order by push_time desc";

    sql = util.format(sql, num);

    console.log(sql);

    sql_exec.sqlexec(sql, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};
        console.log(t);

        res.json(row);

    });


})


//移动端&服务器端获取打卡展示图
router.get('/getRate', function(req, res, next) {

//getRate?id=id&name=name&rateType=1/2

    var month_list = complementHistoryDate(12);
    var month_data = [100,100,100,100,100,100,100,100,100,100,100,100];
    var type;
    var sql;

    if(req.query.rateType==2){

        type='人员到位率';

        sql = "SELECT sum(Task_Check_Label) C, count(*) Total,Task_Create_Time "+

            "FROM [BMSInspection].[dbo].[CG_DK] where UserID='%s' and Task_Create_Time between '%s' and '%s' group by Task_Create_Time;"

        } else if(req.query.rateType==1){
            type = '组到位率';
            sql = " SELECT sum(Task_Check_Label) C, count(*) Total,Task_Create_Time FROM BMSInspection.dbo.CG_DK a,BMSInspection.dbo.Bridge_GroupUsers b"+
            " where a.UserID=b.UserID and b.GroupDefineID='%s' and Task_Create_Time between '%s' and '%s' group by Task_Create_Time;"
        }


        sql = util.format(sql, req.query.id,month_list[month_list.length-1], month_list[0] );
   
        sql_exec.sqlexec(sql, function (err, rowCount, row) {

            var t = {total: rowCount, rows: row};

            row.forEach(function(r){
               // console.log(r.Task_Create_Time);

                if(month_list.indexOf(r.Task_Create_Time)!=-1) {

                    console.log('C',r.C);
                    console.log('Total',r.Total);

                    month_data[month_list.indexOf(r.Task_Create_Time)] = parseInt(r.C * 100 / r.Total);
                }

            })
            for(i=0;i<month_list.length;i++){
                month_list[i] = util.format("'%s'",month_list[i])
            }


            res.render('summ.ejs', {name:req.query.name, m_list: month_list, m_data: month_data, type:type})

        });
})

/*url： ip/getGroupMems?groupID=xxxx

返回需要一个JSON数组包括这个工作组内每一个成员的userID和displayName

用于后续显示个人打卡率查看*/

router.get('/getGroupMems', function(req, res, next) {

    var groupID = req.query.groupID;

    var g2 = " select a.UserId, a.DisplayName " +
        "from BMSPlatForm.dbo.Users a, BMSInspection.dbo.Bridge_GroupUsers c " +
        "where a.UserID=c.UserID and c.GroupDefineID='%s' ";

    g2 = util.format(g2, groupID);

    console.log(g2);

    sql_exec.sqlexec(g2, function (err, rowCount, row) {

        var t = {total: rowCount, rows: row};
        res.json(row);

    });


})


function push_n2c(n){
    var x;

    switch (n)
    {
        case '0':
            x="图文";
            break;
        case '1':
            x="巡检任务";
            break;
        case '3':
            x="养护任务";
            break;
        case '2':
            x="维修任务";
            break;
        case '4':
            x="预警消息";
            break;
        case '5':
            x="报告";
            break;
    }
    return x;


}
//根据当前月,取得以前一年的月份
function complementHistoryDate(numMonth) {
    var complDate = [];
    var curDate = new Date();
    var y = curDate.getFullYear();
    var m = curDate.getMonth() + 1;
    //第一次装入当前月(格式yyyy-mm)
    complDate[0] = y + "-" + (m.toString().length == 1 ? "0" + m : m);
    m--;
    //第一次已经装入,numMonth少计算一次
    for (var i = 1; i < numMonth; i++, m--) {
        if (m == 0) {
            //到1月后,后推一年
            y--;
            m = 12; //再从12月往后推
        }
        complDate[i] = y + "-" + (m.toString().length == 1 ? "0" + m : m);
    }
    return complDate;
}



/*获取手机图片并且保存DamagePicUpload?damageID=testid
http://ip/DamagePicUpload?damageID=testid

 数据库表名称

 BMSInspection.dbo.CG_MobilePic
 表项

 damage_id-病害id
 pic_name-图片名称
 local_save-本地存储位置
 url-网络访问url
*/
router.post('/DamagePicUpload', function(req, res, next) {

    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(path.join(path.dirname(__dirname), 'public/damage_imgs'));
    form.keepExtensions = true;
    var new_path;
    var name;

    form.parse(req, function (err, fields, files) {
//one pic only
        for (item in files) {

            if (files[item].name != '') {
                new_path = path.join(form.uploadDir, files[item].name);
                fs.renameSync(files[item].path, new_path);
                name = files[item].name;
                console.log(name, new_path);
            }

        }
//保存到数据库
        var sql = "insert into BMSInspection.dbo.CG_MobilePic(damage_id, pic_name, local_save, url) values('%s','%s','%s','%s')";
        var url = host+':'+port+'/damage_imgs/'+name;
        sql = util.format(sql, req.query.damageID, name, new_path, url);
        console.log(sql);
        sql_exec.sqlexec(sql, function (err, rowCount, row) {

            var t = {total: rowCount, rows: row};
            console.log(t);
            res.end('true');

        });


    });

})


//每天8点准时推送任务一次run_task()

c = new Date();//current time
c_8 = new Date(c.Format("yyyy-MM-dd hh:mm:ss").split(' ')[0]+' 08:00:00');//8am current day
n_8 = new Date(c_8.getTime()+86400000);//8am next day

function Run_task(){

    console.log('Pushing task ', new Date());


    ///养护任务 - a任务名称，b任务开始时间，c任务结束时间，d维修/巡检桥梁，e任务描述

    var sql_yh = "select a.TaskStartTime as create_time, a.TaskName as task_name, a.TaskStartTime as start_time, a.TaskEndTime as end_time, a.TaskDescription as task_desc, c.BridgeName as xj_bridge, a.ExecutionGroup as dept from " +
        "[BMSInspection].[dbo].[Bridge_ConserveTask] a, [BMSInspection].[dbo].[Bridge_ConserveMeasure] b, [BMSInspection].[dbo].[Bridge_Bridge] c " +
        "where a.TaskID=b.TaskID and b.BridgeID=c.BridgeID";
///维修任务 - a任务名称，b任务开始时间，c任务结束时间，d维修/巡检桥梁，e任务描述
    var sql_wx = "select MaintainTaskMadeTime as create_time, MaintainTaskID, MaintainTaskName as task_name, ExpectBeginTime start_time, ExpectEndTime as end_time, MaintainTaskDes as task_desc, ExecuteWorkGroup as dept" +
        " from [BMSInspection].[dbo].[Bridge_MaintainTask]";
//巡检任务包含：a 任务名称，b任务开始时间，c任务结束时间，d 巡检桥梁 e 巡检类型 f 任务描述 -no type(e) here, need to be added once confirmed
    var sql_xj = "select a.TaskID, b.MakeTime as create_time, a.TaskID, b.PlanName as task_name, a.TaskStartTime  as start_time, a.TaskEndTime as end_time, b.PlanContent as task_desc, TaskExeGroup as dept " +
        "from BMSInspection.dbo.Bridge_ExaminePlanTask a, BMSInspection.dbo.Bridge_ExaminePlan b " +
        "where a.PlanID=b.PlanID";


    sql_exec.auto_push(sql_yh, sql_wx, sql_xj, function(rowCount, row){


        async.each(row, function(item, callback){

            console.log(item);

            mobile_push.push(item, function(result){

                callback();

            })



        }, function(err){

            //推送完成后更新自动推送列为1

            var date = new Date().Format("yyyy-MM-dd hh:mm:ss");

            var sql = "update [BMSInspection].[dbo].[CG_push] set auto_push=1 where auto_push=0";
            sql_exec.sqlexec(sql, function (err, rowCount, row) {
                console.log('auto push done');

            });


        })


    })

        
}

<<<<<<< HEAD
Run_task();
=======
//Run_task();
>>>>>>> origin/master

if(c.getHours()<8){
    
    setInterval(function(){
        
        Run_task();
        
        while(true){
            setInterval(Run_task,86400000); 
        }
        },c_8-c);
    
    
}else{
    
    setInterval(function(){
        
        Run_task();
        
        while(true){
            setInterval(Run_task,86400000); 
        }
        },n_8-c);
    
}


module.exports = router;
