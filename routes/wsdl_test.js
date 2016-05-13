var express = require('express');
var router = express.Router();
var util = require('util');



router.post('/wsdlt', function(req, res, next){


    console.log(res.body);

    res.send('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ><soap:Body><undefined:processResponse><request>&lt;ResultCode&gt;0&lt;/ResultCode&gt;&lt;ResultDesc&gt;成功保存信息&lt;/ResultDesc&gt;&lt;ResultMemo&gt;TaskDispatch&lt;/ResultMemo&gt;</request></undefined:processResponse></soap:Body></soap:Envelope>')
});


router.get('/wsdl', function(req, res, next){


    console.log(res.query);

    res.send('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ><soap:Body><undefined:processResponse><request>&lt;ResultCode&gt;0&lt;/ResultCode&gt;&lt;ResultDesc&gt;成功保存信息&lt;/ResultDesc&gt;&lt;ResultMemo&gt;TaskDispatch&lt;/ResultMemo&gt;</request></undefined:processResponse></soap:Body></soap:Envelope>')
});



module.exports = router;