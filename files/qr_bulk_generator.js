var fs         = require('fs')
  , csv = require("fast-csv")
  , _async = require('async')
  , QRCode = require('qrcode');



var _elems=[];
var stream = fs.createReadStream('qr_list.csv');
csv.fromStream(stream, {delimiter :','}).on("data", function(data){
	_elems.push(data);
}).on("end", function(){
	_async.eachSeries(_elems, function(_elem, _cb) {
		QRCode.toFile(_elem[0]+".svg",_elem[0], {type:"svg"},function (err) {
			return _cb(null);
		})
	}, function(err) {
		console.log("done");
	});	
});
	