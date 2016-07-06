var parseString = require('xml2js').parseString;

var s = '"<?xml version="1.0" encoding="UTF-8" ?><Result><ResultCode>-4</ResultCode><ResultDesc>处理外部系统申请授权接口失败！</ResultDesc><ResultMemo></ResultMemo></Result>"';
console.log(s.substring(1, s.length-1));