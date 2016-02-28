var util = require('util');
s=util.format('select * from %s where a=%s', 'foo','bar');
console.log(s);

f= parseFloat('ddd22ddd').toFixed(2);
console.log(f);

y = 1+'';
console.log(typeof(y) );