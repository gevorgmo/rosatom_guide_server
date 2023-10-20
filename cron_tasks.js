var mongoose= require('mongoose');
var config = require('./config/config');
var fetch = require('node-fetch');
var moment = require('moment');
var https = require('https');

require("./db_initializer").init(config);

var Page = mongoose.model('Page');
var _all_places_ru={"Конференц-зал":"hall","Выставка «Атомные города»":"atom_citys","Лобби":"Lobby","Лаборатория":"laboratory","Атомариум":"atomarium"}


GetEvents(function(_data){
	if(!_data){
		process.exit();
	} else {

		Page.find({category:"event", published:{$gte: new Date()}}).exec(function(err, _pages){
			if(err || !_pages) {
				process.exit();
			} else {
			
				var _all_ids=[];
				var _insert_events=[];
				var _slug=new Date().getTime();
				var _date_now=new Date();
				_pages.map(function(_i){
					var _u=_i.toObject();
					if(_u.event_id_on_web) _all_ids.push(_u.event_id_on_web);
				});
				
				
				_data.map(function(_i){
					if(_i.ID && _i.DATE &&  _i.IMAGE && _i.TITLE && _i.SHORT_DESCRIPTION && _i._AREA && _i._AGE){
						var _date=moment(_i.DATE).format("YYYY-MM-DD HH:mm");
						if(_all_ids.indexOf(_i.ID)==-1 && _date>=_date_now){
							var _content={"ru":{"type":(_i._AGE.RU || ""), "floor":""},"en":{"type":(_i._AGE.EN || ""), "floor":""}, "place":""};
							if(_i._AREA){
								if(_i._AREA.RU)  _content.place=(_all_places_ru[_i._AREA.RU] || "");
							}
							
							if(_i.SPEAKERS){
								if(Array.isArray(_i.SPEAKERS)){
									_content.ru.speakers=[];
									_content.en.speakers=[];
									_i.SPEAKERS.map(function(_q){
										if(_q.RU) _content.ru.speakers.puash({"name":(_q.RU.NAME || ""),"photo":"https://atom-museum.ru/"+(_q.RU.PREVIEW_PICTURE || ""),"info":(_q.RU.PREVIEW_TEXT || "")});
										if(_q.EN) _content.en.speakers.puash({"name":(_q.EN.NAME || ""),"photo":"https://atom-museum.ru/"+(_q.EN.PREVIEW_PICTURE || ""),"info":(_q.EN.PREVIEW_TEXT || "")});
									});
								} else if(typeof _i.SPEAKERS=="object"){
									if(_i.SPEAKERS.RU) _content.ru.speakers=[{"name":(_i.SPEAKERS.RU.NAME || ""),"photo":"https://atom-museum.ru/"+(_i.SPEAKERS.RU.PREVIEW_PICTURE || ""),"info":(_i.SPEAKERS.RU.PREVIEW_TEXT || "")}];
									if(_i.SPEAKERS.EN) _content.en.speakers=[{"name":(_i.SPEAKERS.EN.NAME || ""),"photo":"https://atom-museum.ru/"+(_i.SPEAKERS.EN.PREVIEW_PICTURE || ""),"info":(_i.SPEAKERS.EN.PREVIEW_TEXT || "")}];
								}
							}
							
							_insert_events.push({
								active:true, 
								category:"event", 
								slug:(_slug+_i.ID), 
								"event_id_on_web":_i.ID, 
								"created":_date_now,
								ord:1,
								poster:"https://atom-museum.ru/"+_i.IMAGE,
								title:{"ru":(_i.TITLE.RU || ""),"en":(_i.TITLE.EN || "")},	
								text:{"ru":(_i.SHORT_DESCRIPTION.RU || ""),"en":(_i.SHORT_DESCRIPTION.EN || "")},
								audio:{},
								video:{},
								media_type:0,
								published:moment(_i.DATE, "YYYY-MM-DD HH:mm").toDate(),
								content:_content
							});
						}
					}
				});
				
				//console.log(_insert_events);
				
				Page.collection.insertMany(_insert_events, function (err, new_events) {
					process.exit();
				});
				
			}	
		});
	}
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetEvents(_cb){
	const httpsAgent = new https.Agent({
	  rejectUnauthorized: false,
	});
	
	fetch( 'https://atom-museum.ru/rest/1/csbm8rclvegdd9vn/iblock.AllElement.List.json/?IBLOCK_ID=11', {
        method: 'get',
        headers: { 'Content-Type': 'application/json'},
		agent: httpsAgent,
    })
	.then(response => response.json())
	.then((json ) => {
		if(json){
			if(json.result){
				return _cb(json.result.result); 
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