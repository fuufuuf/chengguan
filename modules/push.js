var request = require('request');
var settings = require('../settings');

function push_opt_0(pd){

    this.headers={
        'X-LC-Id': settings.push_id,
        'X-LC-Key': settings.push_key,
        'Content-Type': 'application/json'};
    this.url= 'https://api.leancloud.cn/1.1/push';
    this.body={

        data:{
            'alert': pd.contents,
            'title': pd.title,
            'type': pd.type,
            'attach': pd.rep_attach,
            'date': pd.push_time,
            'push_id': pd.id,
            'action': 'com.brotec.UPDATE_STATUS'


        },

        channels: [pd.push_group]
    };

    this.json=true

}


function push_opt_1(pd){


    this.headers={
        'X-LC-Id': 'Qz9XjVHbt2U2aMlAtPUQ67Lw-gzGzoHsz',
        'X-LC-Key': 'TrE9eOtAJjb9wkrubjFjzJJR',
        'Content-Type': 'application/json'};
    this.url= 'https://api.leancloud.cn/1.1/push';
    this.body={

        data:{
            'alert': pd.title,
            'title': pd.type_c
        },

        channels: [pd.push_group]
    };

    this.json=true

}


var push = function(pd, callback_1) {
    /*pd has 3 parameters - data, title, channel[]*/
    //console.log('alert', pd[0]);

    switch (pd[0].type)
    {
        case '0':
            pd[0].type_c="您有一条新的图文消息";
            break;
        case '1':
            pd[0].type_c="您有一条新的巡检消息";
            break;
        case '2':
            pd[0].type_c="您有一条新的养护消息";
            break;
        case '3':
            pd[0].type_c="您有一条新的维修消息";
            break;
        case '4':
            pd[0].type_c="您有一条新的预警消息";
            break;
        case '5':
            pd[0].type_c="您有一条新的报告消息";
            break;
    }

//需要推送2次，因此创建两个推送parameter
    var p = new push_opt_0(pd[0]);
    var p1 = new push_opt_1(pd[0]);

    console.log(p);

//两次推送

    request.post(p, function(error, response, body) {

        if (!error && response.statusCode == 200) {

            request.post(p1, function(error,response, body){


                if (!error && response.statusCode == 200){


                    callback_1({success:'成功推送'});

                }
                else{

                    callback_1({fail:error});
                }

            })

        }
    });



};

var get_user = function(callback_2) {

    console.log('get user');

    var r = {};
    r.headers={
        'X-LC-Id': 'Qz9XjVHbt2U2aMlAtPUQ67Lw-gzGzoHsz',
        'X-LC-Key': 'TrE9eOtAJjb9wkrubjFjzJJR'};
    r.url= 'https://api.leancloud.cn/1.1/installations';

    request(r, function(error, response, body){

        if (!error && response.statusCode == 200) {

            callback_2(JSON.parse(body));
        }



    })

}


var auto_push = function(pd, cb){


    yh.forEach(function(e){

        var p = new push_opt_0(pd);
        var p1 = new push_opt_1(pd);



    })

}


//get_user(function(d){
//
//    console.log(d.results);
//
//
//})

exports.push = push;
exports.get_user = get_user;


