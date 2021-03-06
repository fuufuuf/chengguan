var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var wsdl = require('./routes/wsdl_test');

var ueditor = require('ueditor');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*ue editor*/
app.use("/lib/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  // ueditor
  if(req.query.action === 'uploadimage'){
    var foo = req.ueditor;
    var date = new Date();
    var imgname = req.ueditor.filename;

    var img_url = '/editor';
    res.ue_up(img_url); //
  }
  //
  else if (req.query.action === 'listimage'){
    var dir_url = '/';
    res.ue_list(dir_url);  //
  }
  //
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/lib/ueditor/node/config.json')
  }}));
/**************************************************************************************/

app.use('/', routes);
app.use('/users', users);
app.use('/', routes);
app.use('/wsdltest', wsdl);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
