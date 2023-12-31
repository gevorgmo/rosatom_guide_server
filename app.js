/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');
var mongoose= require('mongoose');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var app = express();
var expressValidator = require('express-validator');
var fs = require('fs');
var http = require('http').Server(app);
var  passport = require('passport');
var RedisStore = require('connect-redis')(session);
var  redis = require('redis');




// Load configurations
console.log("[INFO] Reading configurations");
var env = process.env.NODE_ENV || 'staging'
  , config = require('./config/config');
var ECT = require('ect');
app.locals.env = env;


//Init Redis
console.log("[INFO] Initializing Redis");
var client=require("./redis").init(config, redis);
 


//Init DB
require("./db_initializer").init(config);



//Init passport-js authentication
console.log("[INFO] Initializing authentication module");
var auth = require('./auth');
auth.boot(passport, config);


// all environments
app.set('tempdir', __dirname + '/public/tmp');
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ect');
app.engine('.ect', ECT({ watch: true, root: __dirname + '/views' }).render);
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({secret: 'dfdsgdsgdgaggghjgsdfj',  saveUninitialized: true,  resave: false, store: new RedisStore({client:client})}));
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true }));
app.use(multer({dest:__dirname+'/tmp'}).any());
app.use(express.static(path.join(__dirname, '/public')));
app.use(passport.initialize());
app.use(passport.session()); 

//Routes
console.log("[INFO] Initializing express: routes");

//Init routes and filters
var routesPath = __dirname + '/routes', 
    routefiles = fs.readdirSync(routesPath);      

routefiles.forEach(function (file) {
    var filePath = path.resolve('./', 'routes', file),
        route = require(filePath);
    route.init(app);
    console.log("[INFO] Route initialized: %s", file);
});

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

if (!fs.existsSync('./public/tmp')) {
    fs.mkdirSync('./public/tmp');
}
/*
app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Content-Security-Policy", "default-src 'self';");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
   next();
});
*/
 



app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



	
	
	











