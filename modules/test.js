



var Run_task = function(h1,callback){


    console.log(h1);
    //callback(h1);
}

var sss = function(h1, h2, callback){


    callback(h1);
    return;
    callback(h2);

}


sss('h1','h2',function(h){

    console.log(h);

})