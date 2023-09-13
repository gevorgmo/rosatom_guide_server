var mongoose       = require('mongoose')
, config = require('../config/config')
, fs         = require('fs')
, csv = require("fast-csv")
, _async = require('async');


require("../db_initializer").init(config);
 
 var Page = mongoose.model('Page')
 , Media = mongoose.model('Media')
  
var _elems=[];
var stream = fs.createReadStream('media_list.csv');
var _ord=0;

csv.fromStream(stream, {delimiter :','}).on("data", function(data){
	_elems.push(data);
}).on("end", function(){
	_async.eachSeries(_elems, function(_elem, _cb) {
		_ord++;
		Media.create({filename:_elem[3]+".mp3", type:"audio", url:"/files/2023/8/"+_elem[3]+".mp3",created:new Date()}, function(err6, _item){
			var _page={
				slug:_elem[3],
				active:true,	
				category:"media",
				ord:_ord,
				title:{"en":_elem[1],"ru":_elem[0]},
				audio:{"en":"/files/2023/8/"+_elem[3]+".mp3","ru":"/files/2023/8/"+_elem[3]+".mp3"},
				media_type:parseInt(_elem[2]),
				published:new Date()
			};
			Page.create(_page,  function(err3, __page) {
				return _cb(null);
			});
		});
	}, function(err) {
		console.log("done");
	});	
});
  
  
	

		