var fs = require('fs');
var querystring = require('querystring');
xml_req = fs.readFileSync('./rev.xml', 'utf-8');//taskdispatch

console.log(xml_req);
s=xml_req.replace(/&lt;/g,'<').replace(/&quot;/g,'\'').replace(/&gt;/g,'>');
console.log(s);
//console.log(querystring.unescape(xml_req));


