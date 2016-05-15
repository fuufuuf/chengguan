var express = require('express');
var router = express.Router();
var util = require('util');
var path = require('path');
var fs = require('fs');

router.post('/wsdl', function(req, res, next){


    console.log(res.body);

    res.send('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ><soap:Body><undefined:processResponse><request>&lt;ResultCode&gt;0&lt;/ResultCode&gt;&lt;ResultDesc&gt;成功保存信息&lt;/ResultDesc&gt;&lt;ResultMemo&gt;TaskDispatch&lt;/ResultMemo&gt;</request></undefined:processResponse></soap:Body></soap:Envelope>')
});


router.get('/wsdl', function(req, res, next){


    var xml = require('fs').readFileSync(path.join(path.dirname(__dirname),'zhcg.wsdl'), 'utf8')
    res.set('Content-Type','application/xml');
    res.send(xml);

});



module.exports = router;