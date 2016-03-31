
var fs = require('fs');
xml_req = fs.readFileSync('./request_test.xml', 'utf-8');

n = xml_req.replace('\n','');
t = xml_req.replace('\t','');
console.log(n);
