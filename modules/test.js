var soap = require('soap');
var url = 'http://101.200.174.136:8004/wsdltest?wsdl';
var args = {name: 'value'};
soap.createClient(url, function(err, client) {
    client.process(args, function(err, result) {
        console.log(err);
    });
});