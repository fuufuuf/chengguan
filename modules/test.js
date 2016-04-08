var fs = require('fs');
var util = require('util');
var settings = require('../settings.js')


var s = {img_1:'x1', img_2:'x2'}

var t = "<picture name='%s' url='http://%s'/>";
var s_start = "<FeedbackPictures num='%s'>"
console.log(s.length);

for(name in s){

    console.log(util.format(t, name, settings.service_host+ ':' +settings.service_port +'/cg_imgs/'+name));
}
var s_end = "</FeedbackPictures>";


var st;

for (s in st){

    console.log(s);

}




