var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var block = require('./routes/block');
var tx = require('./routes/tx');
var account = require('./routes/account');
var accounts = require('./routes/accounts');
var contract = require('./routes/contract');
var signature = require('./routes/signature');
var search = require('./routes/search');
var event = require('./routes/event');
var events = require('./routes/events');

var config = new(require('./config.js'))();
var Datastore = require('nedb-core')

var dbEvent = new Datastore({ filename: './data.db', autoload: true });

var levelup = require('levelup');
var db = levelup('./data');

dbEvent.ensureIndex({ fieldName: 'balance' }, function (err) {
  if (err) {
    console.log("Error creating balance db index:", err);
  }
});

dbEvent.ensureIndex({ fieldName: 'timestamp' }, function (err) {
  if (err) {
    console.log("Error creating timestamp db index:", err);
  }
});

dbEvent.ensureIndex({ fieldName: 'args._from' }, function (err) {
  if (err) {
    console.log("Error creating _from db index:", err);
  }
});

dbEvent.ensureIndex({ fieldName: 'args._to' }, function (err) {
  if (err) {
    console.log("Error creating _to db index:", err);
  }
});

var exporterService = require('./services/exporter.js');
var exporter = new exporterService(config, dbEvent);


// var basepath = "/explorer";
var basepath = process.env.ETHERCHAIN_LIGHT_BASEPATH || '/explorer';

var app = express();

app.locals.basepath = basepath;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('config', config);
app.set('db', db);
app.set('dbEvent', dbEvent);
app.set('trust proxy', true);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(config.logFormat));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(basepath, express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public')));

app.locals.moment = require('moment');
app.locals.numeral = require('numeral');
app.locals.ethformatter = require('./utils/ethformatter.js');
app.locals.nameformatter = new(require('./utils/nameformatter.js'))(config);
app.locals.nodeStatus = new(require('./utils/nodeStatus.js'))(config);
app.locals.config = config;

app.use(basepath + '/', index);
app.use(basepath + '/block', block);
app.use(basepath + '/tx', tx);
app.use(basepath + '/account', account);
app.use(basepath + '/accounts', accounts);
app.use(basepath + '/contract', contract);
app.use(basepath + '/signature', signature);
app.use(basepath + '/event', event);
app.use(basepath + '/events', events);
app.use(basepath + '/search', search);

app.locals.moment = require('moment');
app.locals.nodeStatus = new(require('./utils/nodeStatus.js'))(config);
app.locals.nameformatter = new(require('./utils/nameformatter.js'))(config);
app.locals.tokenformatter = new(require('./utils/tokenformatter.js'))(config);
app.locals.config = config;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
