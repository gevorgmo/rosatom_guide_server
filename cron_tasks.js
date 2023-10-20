var mongoose= require('mongoose');
var config = require('./config/config');
var fetch = require('node-fetch');
var moment = require('moment');


require("./db_initializer").init(config);

var Page = mongoose.model('Page');

GetEvents(function(_data){
	if(!_data){
		process.exit();
	} else {
		Page.find({category:"event", published:{$gte: new Date()}}).exec(function(err, _pages){
			if(err || !pages) {
				process.exit();
			} else {
			
				var _all_ids=[];
				var _insert_events=[];
				
				_pages.map(function(_i){
					var _u=_i.toObject();
					if(_u.event_id_on_web) _all_ids.push(_u.event_id_on_web);
				});
				
				var _slug=new Date().getTime();
				
				_data.map(function(_i){
					if(_i.ID && _i.DATE &&  _i.IMAGE && _i.TITLE && _i.SHORT_DESCRIPTION && _i._AREA && _i._AGE){
						var _content={"ru":{},"en":{}};
						
						
						_insert_events.push({
							active:true, 
							category:"event", 
							slug:(_slug+_i.ID), 
							"event_id_on_web":_i.ID, 
							"created":new Date(),
							ord:1,
							poster:"https://atom-museum.ru/"+_i.IMAGE,
							title:{"ru":(_i.TITLE.RU || ""),"en":(_i.TITLE.EN || "")},	
							text:{"ru":(_i.SHORT_DESCRIPTION.RU || ""),"en":(_i.SHORT_DESCRIPTION.EN || "")},
							audio:{},
							video:{},
							media_type:0,
							published:moment(_i.DATE).format("YYYY-MM-DD HH:mm")
							content:_content {
								"ru": {
								  "speakers": [
									{
									  "name": "ИМЯ ФАМИЛИЯ",
									  "photo": "/files/2023/8/1690978566522.jpg",
									  "info": "Внезапно, сделанные на базе интернет-аналитики выводы представляют собой не что иное, как квинтэссенцию победы маркетинга над разумом и должны быть смешаны с не уникальными данными до степени совершенной."
									},
								  ],
								  "type": "Детские",
								  "floor": "Вместимость зала: 24"
								},
								"place": "laboratory",
								"en": {
								  "type": "",
								  "floor": ""
								}
							  },
						});
					}
				});
				
				Page.collection.insertMany(_insert_events, function (err, new_events) {
					process.exit();
				});
				
			}	
		});
	}
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetEvents(_cb){
	fetch( 'https://atom-museum.ru/rest/1/csbm8rclvegdd9vn/iblock.AllElement.List.json/?IBLOCK_ID=11', {
        method: 'get',
        headers: { 'Content-Type': 'application/json'},
    })
	.then(response => response.json())
	.then((json ) => {
		if(json){
			if(json.result){
				return _cb(json.result); 
			} else {
				return _cb(null); 
			}
		} else {
			return _cb(null);  
		}
    }).catch(err => {
		console.log(err.message);
		return _cb(null);  
	});
}	