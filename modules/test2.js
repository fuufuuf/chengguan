var async = require('async');
var fs = require('fs');
var sql_exec = require('./sqlcon');

fs.readFile('./json_test.json', 'utf-8',function(err, data){

    //
    //var str = JSON.parse(data);
    //console.log(str);

    console.log(data);
    console.log('重启大法不好');


})
