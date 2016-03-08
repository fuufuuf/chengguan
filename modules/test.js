



var request = require('request');
var req = "http://115.29.33.204/InspectionService/ExamineService.svc/GetExaminePlanTaskById?user_name=not_in_use&validated_info=not_in_use&taskID=DDA8A773-0865-4E59-BDE1-06C8E4F9BA12;"

request(req, function (error, response, body) {
    if (!error && response.statusCode == 200) {


        console.log('status'+body);

    }else{

        console.log(error);



    }
})
