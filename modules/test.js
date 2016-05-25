var soap = require('soap');
var url = 'http://localhost:8004/wsdltest?wsdl';
var url2 = 'http://183.136.153.50:8996/egovaService?wsdl';
var args = {name: 'value'};
soap.createClient(url2, function(err, client) {
    //client.process(args, function(err, result) {
    //    console.log(err);
    //});

    console.log(client.describe());
});