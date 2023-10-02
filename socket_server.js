var mongoose= require('mongoose');
var redis = require('redis');
var crypto = require('crypto');
var uuid = require('uuid');
var ObjectId = require('mongodb').ObjectID;
var config = require('./config/config');	


const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
  
var  WebSocket = require('ws');
var wss = new WebSocket.Server({
	port: 3001,  
	perMessageDeflate: false
});



wss.broadcast = function(_data) {
	wss.clients.forEach(function each(_client) {
		if (_client.readyState === WebSocket.OPEN) {
			_client.send(JSON.stringify({"status":"roomevent","data":_data}), { binary: true });
		}
	});
};

  

//Init Redis
//console.log("[INFO] Initializing Redis");
require("./redis").init(config, redis);
var client = require('./redis').client();


//Init DB
require("./db_initializer").init(config);
var Page = mongoose.model('Page');



				
			
wss.on('connection', function connection(ws, request, _client) {
	ws.on('message', function message(_message) {
		let _data = JSON.parse(decoder.write(Buffer.from(_message)));
		if(_data.status){
			let ok = ws.send(JSON.stringify({"status":"eventresp","data":{"msg":"single_test"}}), { binary: true });
			setTimeout(function(){ wss.broadcast({"msg":"room_test"}); },5000);
		}
	});
});
					


