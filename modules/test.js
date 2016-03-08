



var request = require('request');
var req = "http://115.29.33.204/InspectionService/ExamineService.svc/GetExaminePlanTaskById?user_name=not_in_use&validated_info=not_in_use&taskID=DDA8A773-0865-4E59-BDE1-06C8E4F9BA12;"
var req = "http://115.29.33.204/InspectionService/RepairService.svc/GetBridgeComponentDamageAndMeasureListByMaintainTaskID?MaintainTaskID=20&user_name=admin&validated_info=dd&page=1&rows=10&_=1456390570981";
request(req, function (error, response, body) {
    if (!error && response.statusCode == 200) {


        console.log('status'+JSON.parse(body).rows[0].BridgeName);

    }else{

        console.log(error);



    }
})
