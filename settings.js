module.exports = {
    service_host:'localhost',//localhost ip
    service_port: 3000,//default is 3000
    db_server: '115.29.33.204',//test server is 115.29.33.204 product server 192.168.202.48
    db_user: 'sa',//数据库名称
    db_passwd:'BSMS-Server',//数据库密码
    //zhcg_webservice_url:'192.168.2.2:8884/wsdltest?wsdl',//宁波智慧城管web service地址
    zhcg_webservice_url:'http://183.136.153.50:8996/egovaService?wsdl',
    zhcg_user:'user',//连接宁波智慧城管web service用户名
    zhcg_passwd:'passwd',//连接宁波智慧城管web service密码
    local_webservice_port: 8004,//本地web service服务端口 8004
    push_id:'Qz9XjVHbt2U2aMlAtPUQ67Lw-gzGzoHsz',//leancloud id
    push_key:'TrE9eOtAJjb9wkrubjFjzJJR',//leancloud key
	service_api_host:'115.29.33.204'//test server is 115.29.33.204 product server 192.168.202.48
};
