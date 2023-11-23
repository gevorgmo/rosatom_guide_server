var mongoose       = require('mongoose')
  , User = mongoose.model('User')
  , Page = mongoose.model('Page')
  , Option = mongoose.model('Option')
  , Media = mongoose.model('Media')
  , moment = require('moment')
  , passport  = require('passport')
  , fs         = require('fs')
  , fetch = require('node-fetch')
  , config = require('../config/config')
  , QRCode = require('qrcode')
  , ObjectId = require('mongodb').ObjectID
  , nodemailer = require("nodemailer")
  , auth = require('../auth');



var client = require('../redis').client();

var _all_roles=["user","admin"];
var _all_categories=["exhibition","event","service","media"];
var _all_global_pages=["home","exhibitions","events","services","maps"];

exports.init = function (app) {
/////////////////////////////////////////////////////////////
  
    app.get('/tttttttt', function(req, res){
		var _new_user={
			status:1,
			role:1,
			username:"it@atom.museum",
			password:"qwertrewq",
		};
		User.create(_new_user, function(err, ___user) {
			return res.render('templates/test',{server_address:config.server_address});
		});
    });
	


	app.get('/test', function(req, res) {
		return res.render('templates/test',{server_address:config.server_address});
	});
/////////////////////////////////////////////////////////////
	app.get('/explore/:lang/:slug', function(req, res) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		var _language=escape(req.params.lang || "ru").trim().toLowerCase();
		var _slug=escape(req.params.slug || "home").trim().toLowerCase();
		var _categories={"exhibitions":"exhibition","events":"event","services":"service"};
		var _all_item={"home":"home","exhibition":"exhibition","media":"media","event":"event","service":"service","maps":"maps"};
		var _uuid=escape(req.query.uuid || "test").trim();
		var _interaction=Date.now()/1000;
		console.log(_uuid);
		
		Option.find().sort({ord:1}).exec(function(err, _options){
			Option.updateOne({language_code:_language}, {$inc:{"views":1}}, function(err, ___option) {
				client.hgetall("dev:"+_uuid, function (err, _device) {
					var _dev=(_device || {time:(Date.now()/1000).toString(), qr:"0"});	
					client.hmset("dev:"+_uuid, "interaction", _interaction.toString(), "time", _dev.time.toString(), "qr", _dev.qr.toString(), function(err10,ret){	
						if(_categories[_slug]){ 
							var _quer={active:true, category:_categories[_slug]};
							var _sort={ord:1};
							if(_slug=="events"){
								_sort={published:1};
								_quer.published={$gte: new Date()};
							}
							Page.find(_quer).sort(_sort).exec(function(err, _pages){
								if(err || !_pages) {
									Page.findOne({active:true, slug:"home"}).exec(function(_err, __home){
										return res.render('templates/home', {lang:_language, page:__home.toObject(), options:_options, server_address:config.server_address});
									});
								} else {
									if(_slug=="events"){
										_pages.today=[];
										_pages.upcoming=[];
										_pages.filters=[];
										_pages.map(function(_i){
											var _p=_i.toObject();
											_p.time=moment(_p.published).format("HH:mm");
											_p.date=moment(_p.published).format("DD.MM.YY");
											
											if (_p.content){
												if (_p.content[_language]){
													if (_p.content[_language].type){
														if (_p.content[_language].type!=""){
															if(_pages.filters.indexOf(_p.content[_language].type)==-1) _pages.filters.push(_p.content[_language].type);
														}	
													}
												}
											}
													
											if(isToday(_p.published)){
												//_pages.today.push(_p);
											} else {
												_pages.upcoming.push(_p);
												_pages.today.push(_p);
											}
										});
									}
									return res.render('templates/'+_slug, {lang:_language, category:_slug, pages:_pages,  options:_options, server_address:config.server_address});	
								}
							});	
						} else {
							Page.findOne({active:true, slug:_slug}).exec(function(_err, __page){
								if(_err || !__page) {
									Page.findOne({active:true, slug:"home"}).exec(function(_err, __home){
										return res.render('templates/home', {lang:_language, page:__home.toObject(), options:_options, server_address:config.server_address});
									});	
								} else {
									Page.updateOne({_id:__page._id}, {$inc:{"views":1}}, function(err, ___page) {
										var _p=__page.toObject();
										if(_all_item[_p.category]){ 
											if(_p.category=="event"){
												_p.time=moment(_p.published).format("HH:mm");
												_p.date=moment(_p.published).format("DD.MM.YY");
											}
											if(_p.category=="media"){
												client.hmset("dev:"+_uuid, "interaction", _interaction.toString(), "time", _dev.time.toString(), "qr", (parseInt(_dev.qr)+1).toString(), function(err10,ret){
													return res.render('templates/'+_p.category, {lang:_language, page:_p,   options:_options, server_address:config.server_address});
												});
											} else {
												return res.render('templates/'+_p.category, {lang:_language, page:_p,   options:_options, server_address:config.server_address});
											}											
										} else {
											client.hmset("dev:"+_uuid, "interaction", _interaction.toString(), "time", _dev.time.toString(), "qr", (parseInt(_dev.qr)+1).toString(), function(err10,ret){	
												return res.render('templates/media', {lang:_language, page:__page.toObject(),   options:_options, server_address:config.server_address});
											});
										}	
									});	
								}
							});
						}
					});		
				});		
			});			
		});	
	});
//////////////////////////////////////////////////////////////////////////
	app.post('/explore',  function(req, res){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', 'X-Custom-Heade');
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.setHeader('content-type', 'text/javascript');
		
		var _language=escape(req.body.language || "ru").trim().toLowerCase();
		var _slug=escape(req.body.slug || "home").trim().toLowerCase();
		Page.findOne({active:true, slug:_slug}).exec(function(_err, __page){
			if(_err || !__page) return res.status(200).send({"status":false});
			var _page=__page.toObject();
			var _itm={
				audio:(_page.audio ? (_page.audio[_language] ||  "") : ""),
				video:(_page.video ? (_page.video[_language] ||  "") : ""),
				text:(_page.text ? (_page.text[_language] ||  "") : ""),
				content:(_page.content ? (_page.content[_language] ||  "") : ""),
			};
			return res.status(200).send({"status":true, page:_itm});
		});
    });
//////////////////////////////////////////////////////////////////////////
	app.post('/sessionupdate',  function(req, res){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', 'X-Custom-Heade');
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.setHeader('content-type', 'text/javascript');
		
		if(req.body.uuid && req.body.lang){
			var _uuid=escape(req.body.uuid || "0").trim().toLowerCase();
			var _language=escape(req.body.lang || "ru").trim().toLowerCase();
			var _time_now=Date.now()/1000;
			client.hgetall("dev:"+_uuid, function (err, _device) {
				if(_device){
					var _interaction=parseInt(_device.interaction);
					var _time=parseInt(_device.time);
					//if((_time_now-_interaction)>1200){
						Option.updateOne({language_code:_language}, {$inc:{"sessions_count":1, "qr_count":parseInt(_device.qr),"sessions_time":(_interaction-_time)}}, function(err, ___option) {
							client.hmset("dev:"+_uuid, "interaction", _time_now.toString(), "time", _time_now.toString(), "qr", "0", function(err10,ret){	
								return res.status(200).send({"status":true});
							});	
						});	
					//} else {
					//	return res.status(200).send({"status":false});
					//}
				} else {
					client.hmset("dev:"+_uuid, "interaction", _time_now.toString(), "time", _time_now.toString(), "qr", "0", function(err10,ret){	
						return res.status(200).send({"status":false});
					});	
				}	
			});	
		} else {
			return res.status(200).send({"status":false});
		}		
    });	
//////////////////////////////////////////////////////////////////////
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
/////////////////////////////////////////////////////////////
	app.get('/login', function(req, res) {
		return res.render('login', {pagename:"login"});
	});
/////////////////////////////////////////////////////////////
    app.post('/login',   function(req, res, next) {
		if(req.body.username && req.body.password){
			return  passport.authenticate('local', function(err, user) {
				if (err) { return next(err); }
				if (!user) {
					return res.render('login', {pagename:"login", errors:"Wrong data!"});
				}
				req.logIn(user, function(err) {
					if (err) { return next(err); }
					return res.redirect('/');
				});
			})(req, res, next)
		} else {
			return res.redirect('/login');
		}
    });
/////////////////////////////////////////////////////////////
	app.get('/', isLoggedIn, function(req, res) {
		Option.find().sort({ord:1}).exec(function(err, _options){
			Page.find({'category': {$nin : ["home", "map", "maps"]}}).sort({views:-1}).limit(10).exec(function(err, _pages){
				return res.render("index", {user_status:_all_roles[req.user.role], pages:_pages, options:_options, pagename:"dashboard"});
			});	
		});	
	});
/////////////////////////////////////////////////////////////
	app.get('/users/:uid', isLoggedIn, function(req, res) {
		if(req.params.uid && req.user.role==1){
			if(req.params.uid=="all"){
				User.find({}).exec(function(err, _users){
					if(err || !_users) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});
					return res.render("users", {user_status:_all_roles[req.user.role],  pagename:"users", users:_users});
				});
			} else if(req.params.uid=="new"){
				return res.render("user", {user_status:_all_roles[req.user.role],  pagename:"users", user:{}});
			} else {
				User.findOne({_id:req.params.uid}).exec(function(err, _user){
					if(err || !_user) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});
					return res.render("user", {user_status:_all_roles[req.user.role],  pagename:"users", user:_user});
				});
			}
		} else {
			return res.redirect('/');
		}
	});
/////////////////////////////////////////////////////////////
	app.get('/category/:categoryname', isLoggedIn, function(req, res) {
		var _sort={ord:1};
		if(req.params.categoryname=="event") _sort={published:1};
		Page.find({category:req.params.categoryname}).populate('related').sort(_sort).exec(function(err, _pages){
			if(err || !_pages) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});		
			if(req.params.categoryname=="event"){
				_pages.map(function(_i){
					_i.time=moment(_i.published).format("YY.MM.DD HH:mm");
				});	
			}
			if(req.params.categoryname=="media"){
				Page.find({category:"exhibition"}).sort(_sort).exec(function(err, _exhibitions){
					return res.render("category", {user_status:_all_roles[req.user.role],  pagename:req.params.categoryname, pages:_pages, exhibitions:_exhibitions});
				});
			} else {
				return res.render("category", {user_status:_all_roles[req.user.role],  pagename:req.params.categoryname, pages:_pages});
			}			
		});
	});
/////////////////////////////////////////////////////////////
	app.get('/page/:pagename', isLoggedIn, function(req, res) {
		Option.find().sort({ord:1}).exec(function(err, _options){
			Page.findOne({category:req.params.pagename}).exec(function(err, _page){
				if(err || !_page) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});					
				return res.render("globalpage", {user_status:_all_roles[req.user.role],  pagename:req.params.pagename, item:_page.toObject(), options:_options});
			});
		});	
	});
/////////////////////////////////////////////////////////////
	app.get('/options/:optionid', isLoggedIn, function(req, res) {
		if(req.params.optionid=="all"){
			Option.find().sort({ord:1}).exec(function(err, _options){
				if(err || !_options) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});					
				return res.render("options", {user_status:_all_roles[req.user.role],  pagename:req.params.pagename, options:_options});
			});
		} else if(req.params.optionid=="new"){
			return res.render("option", {user_status:_all_roles[req.user.role],  pagename:req.params.pagename, option:{}});
		} else {
			Option.findById(req.params.optionid).exec(function(err, _option){
				if(err || !_option) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});					
				return res.render("option", {user_status:_all_roles[req.user.role],  pagename:req.params.pagename, option:_option.toObject()});
			});
		}	
	});
/////////////////////////////////////////////////////////////
	app.get('/item/:itemid', isLoggedIn, function(req, res) {
		if(req.params.itemid){
			Option.find().sort({ord:1}).exec(function(err, _options){
				if(req.params.itemid!='new'){
					Page.findById(req.params.itemid).exec(function(err, _page){
						if(err || !_page) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});					
						if(_all_categories.indexOf(_page.category)!=-1){
							if(_page.category=="media"){
								Page.find({category:"exhibition"}).sort({ord:1}).exec(function(err, _exhibitions){
									return res.render("item", {user_status:_all_roles[req.user.role],  pagename:_page.category, item:_page.toObject(), options:_options, exhibitions:_exhibitions});
								})
							} else {
								return res.render("item", {user_status:_all_roles[req.user.role],  pagename:_page.category, item:_page.toObject(), options:_options});
							}							
						} else {
							return res.render("globalpage", {user_status:_all_roles[req.user.role],  pagename:_page.category, item:_page.toObject(), options:_options});
						}
					});
				} else {
					var _category=req.query.category || "page";
					if(_all_categories.indexOf(_category)==-1 && _all_global_pages.indexOf(_category)==-1) _category="page";
					if(_category=="media"){
						Page.find({category:"exhibition"}).sort({ord:1}).exec(function(err, _exhibitions){
							return res.render("item", {user_status:_all_roles[req.user.role],  pagename:_category, item:{slug:"", _id:"new"}, options:_options, exhibitions:_exhibitions});
						})	
					} else {
						return res.render("item", {user_status:_all_roles[req.user.role],  pagename:_category, item:{slug:"", _id:"new"}, options:_options});
					}		
				}
			});	
		} else {
			return res.redirect('/');
		}
	});
/////////////////////////////////////////////////////////////
	app.get('/qrgenerate', isLoggedIn, function(req, res) {
		if(req.query.slug){
			QRCode.toString(req.query.slug, {type:"svg"},function (err, svg) {
				res.setHeader('Content-disposition', 'attachment; filename='+req.query.slug+'.svg');
				res.set('Content-Type', 'image/svg');
				return res.status(200).send(svg);
			})
		} else {
			return res.redirect('/');
		}
	});
///////////////////////////////////////////////////////////////////
	app.post('/deleteoption', isLoggedIn, function(req, res) {
		if(req.body.id){
			Option.deleteOne({_id:req.body.id}, function (__err) {
				if(__err) return res.status(200).send({status:false});
				return res.status(200).send({status:true});
			});
		} else {
			return res.status(200).send({status:false});
		}
	});
///////////////////////////////////////////////////////////////////
	app.post('/deleteitem', isLoggedIn, function(req, res) {
		if(req.body.id){
			Page.deleteOne({_id:req.body.id}, function (__err) {
				if(__err) return res.status(200).send({status:false});
				return res.status(200).send({status:true});
			});
		} else {
			return res.status(200).send({status:false});
		}
	});
///////////////////////////////////////////////////////////////////
	app.post('/deleteuser', isLoggedIn, function(req, res) {
		if(req.body.id && req.user.role==1){
			if(req.user._id!=req.body.id){
				User.deleteOne({_id:req.body.id}, function (__err) {
					if(__err) return res.status(200).send({status:false});
					return res.status(200).send({status:true});
				});
			} else {
				return res.status(200).send({status:true, "error":"You can't remove your account"});
			}
		} else {
			return res.status(200).send({status:false, error:"404"});
		}
	});
///////////////////////////////////////////////////////////////////
	app.post('/getgallery', isLoggedIn, function(req, res) {
		var _page=req.body.page || 1;
		_page=parseInt(_page)-1;
		Media.find({}).sort({created:-1}).limit(20).skip(20 * _page).exec(function(err, _media) {
			if(err || !_media) return res.status(200).send({files:[]});
			return res.status(200).send({files:_media});
		});
	});
///////////////////////////////////////////////////////////////////////////
	app.post('/gallery', isLoggedIn, function(req, res) {
			var msg = '';
			var ftyp = '';
			var images = req.files[0];

			if (/\.jpg$/i.test(images.originalname)  || images.mimetype == 'image/jpeg' || images.mimetype == 'image/pjpeg'){
				ftyp='image';
			} else 	if (/\.png$/i.test(images.originalname) || images.mimetype == 'image/png'){
				ftyp='image';
			}else if (/\.gif$/i.test(images.originalname) || images.mimetype == 'image/gif'){
				ftyp='image';
			}else if (/\.svg$/i.test(images.originalname) || images.mimetype == 'image/svg' || images.mimetype == 'image/svg+xml'){
				ftyp='image';
			}else if (/\.mp4$/i.test(images.originalname) || images.mimetype == 'video/mp4'){
				ftyp='video';
			}else if (/\.ogv$/i.test(images.originalname) || images.mimetype == 'video/ogg'){
				ftyp='video';
			}else if (/\.mp3$/i.test(images.originalname) || images.mimetype == 'audio/mp3'){
				ftyp='audio';
			}else if (/\.m4a$/i.test(images.originalname) || images.mimetype == 'audio/m4a'){
				ftyp='audio';	
			}else if (/\.aac$/i.test(images.originalname) || images.mimetype == 'audio/aac'){
				ftyp='audio';			
			}else{
				msg = 'Invalid format.';
			}
			if(images.size > 20242880) {
				msg += 'File size no accepted. Max: 20Mb.';
			}
			if(msg == ''){
				var tmpPath = images.path,
				originalFileName = images.originalname,
				fileExt = originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase(),
				fileindex=new Date().getTime(),
				newFilename =fileindex  + fileExt,
				dateObj = new Date(),
				month = dateObj.getUTCMonth() + 1,
				year = dateObj.getUTCFullYear(),
				newPath = './public/files/'+year+"/"+month+"/"+newFilename;

				var month = dateObj.getUTCMonth() + 1;
				var year = dateObj.getUTCFullYear();

				if (!fs.existsSync('./public/files/'+year)) fs.mkdirSync('./public/files/'+year);
				if (!fs.existsSync('./public/files/'+year+"/"+month)) fs.mkdirSync('./public/files/'+year+"/"+month);


				MoveFile(tmpPath,newPath, function() {
					Media.create({filename:originalFileName, type:ftyp, url:"/files/"+year+"/"+month+"/"+newFilename,created:new Date()}, function(err6, _item){
						return res.status(200).send({url:"/files/"+year+"/"+month+"/"+newFilename, id:_item.id, type:ftyp, filename:originalFileName});
					});
				});
			} else {
				return res.status(500).send(msg);
			}

	});
////////////////////////////////////////////////////////////////////////////////
	app.delete('/gallery',  function(req, res) {
		if(req.body.id){
			Media.findOne({_id:req.body.id}, function(_err, _media){
				if (_err || !_media) { console.log(_err); return res.send(404);}
				var oldPath= "./public"+_media.url;
				_media.remove(function(err2) {
					if (err2) { console.log(err2); return res.send(404); }
					if(fs.existsSync(oldPath)) {
						fs.unlink(oldPath, function(err1) {
							if(err1) { console.log(err1); return res.send(404); }
							return res.status(200).send({status:true});
						});
					} else {
						return res.status(200).send({status:true});
					}
				});
			});
		} else {
			return res.send(404);
		}
	});
///////////////////////////////////////////////////////////////////
	app.post('/saveitem', isLoggedIn, function(req, res) {
		var _page={
			active:(req.body.active ? (parseInt(req.body.active)==1 ? true : false) : true),	
			category:(req.body.category || "page").trim().toLowerCase(),
			ord:(req.body.ord || 1),
			poster:(req.body.poster || ""),
			title:(req.body.title || {}),	
			content:(req.body.content || {}),
			audio:(req.body.audio || {}),
			video:(req.body.video || {}),
			text:(req.body.text || {}),
			media_type:(req.body.media_type || 0),
			published:(req.body.published || new Date())	
		};
		_page.slug=GenerateSlug(req.body.slug || new Date().getTime());
		
		if(req.body.related) _page.related=ObjectId(req.body.related);
		 
		if(req.body.id=="new"){
			Page.find({slug: _page.slug}, function (err1, _slugs) {
				if(err1) return res.status(200).send({"status":false});
				if(_slugs){
					if(_slugs.length>0) return res.status(200).send({"status":false});
				}
				_page.views=0;
				Page.create(_page,  function(err3, __page) {
					if (err3 || !__page) return res.status(200).send({"status":false});
					return res.status(200).send({"status":true});
				});
			});
		} else {
			Page.updateOne({_id:req.body.id},  {$set:_page}, {}, function(err, ___page) {
				if (err){ console.log(err); }
				return res.status(200).send({"status":true});
			});
		}

	});
///////////////////////////////////////////////////////////////////
	app.post('/changepagestatus', isLoggedIn, function(req, res) {
		if(req.body.id!=="undefined"){
			var _active=(req.body.status ? (parseInt(req.body.status)==1 ? true : false) : true);
			Page.updateOne({_id:req.body.id},{active:_active}, function (err1, _page) {
				if(err1) return res.status(200).send({"status":false});
				return res.status(200).send({"status":true});
			});
		} else {
			return res.status(200).send({"status":false});
		}
	});
///////////////////////////////////////////////////////////////////
	app.post('/saveoption', isLoggedIn, function(req, res) {
		var _option={
			language_code:(req.body.language_code || "en"),	
			language_title:(req.body.language_title || "en").trim(),
			translations:(req.body.translations || {}),
			ord:parseInt(req.body.ord || 0)
		};

		if(req.body.id=="new"){
			_option.views=0;
			_option.sessions_count=0;
			_option.sessions_time=0;
			Option.create(_option,  function(err3, __option) {
				if (err3 || !__option) return res.status(200).send({"status":false});
				return res.status(200).send({"status":true});
			});
		} else {
			Option.updateOne({_id:req.body.id},  {$set:_option}, {}, function(err, __option) {
				if (err){ console.log(err); }
				return res.status(200).send({"status":true});
			});
		}
	});
//////////////////////////////////////////////////////////////////////////////////////
	app.post('/saveuser', isLoggedIn, function(req, res) {
		if(req.body.id !== undefined && req.body.username !== undefined && req.user.role==1) {
			var _username=escape(req.body.username || "").trim().toLowerCase();
			var _fullname=req.body.fullname || "";
			var _id=req.body.id || "";
			var _role=req.body.role || 0;
			var _password1=escape(req.body.password1 || '').trim();
			var _password2=escape(req.body.password1 || '').trim();

			if(_username.match(/[\d\w\-\_\.]+@[\d\w\-\_\.]+\.[\w]{2,4}/i)){
				if(_id=="new"){
					if(req.body.password1 !== undefined) {
						if(_password1 == _password2 && _password1!=""){
							User.findOne({username:_username}, function(err, _other_user){
								if (err) return res.status(200).send({"status":false})
								if(_other_user){
									return res.status(200).send({"status":true, "error":"Duplicate Username!"})
								} else {
									_new_user={
										username:_username,
										fullname: _fullname,
										password:_password1,
										role: parseInt(_role)
									};
									User.create(_new_user, function(err, ___user) {
										if (err) return res.status(200).send({"status":false})
										return res.status(200).send({"status":true});
									});
								}
							});
						}else {
							return res.status(200).send({"status":false});
						}
					}else {
						return res.status(200).send({"status":false});
					}
				} else {
					User.findOne({_id:_id}, function(err, _user){
						if (err || !_user) return res.status(200).send({"status":false});
						_user.fullname=_fullname;
						_user.role=parseInt(_role);
						if(req.body.password1 !== undefined) {
							if(_password1 == _password2 && _password1!="") _user.password = _password1;
						}
						if(_username!=_user.username){
							User.findOne({username:_username}, function(err, _other_user){
								if (err) return res.status(200).send({"status":false})
								if(_other_user){
									return res.status(200).send({"status":true, "error":"Duplicate Username!"})
								} else {
									_user.username=_username;
									_user.save(function(err2){
										if (err) return res.status(200).send({"status":false})
										return res.status(200).send({"status":true});
									});
								}
							});
						} else {
							_user.save(function(err2){
								if (err) return res.status(200).send({"status":false})
								return res.status(200).send({"status":true});
							});
						}
					});
				}
			}else {
				return res.status(200).send({"status":false});
			}
		}else {
			return res.status(200).send({"status":false});
		}
	});
//////////////////////////////////////////////////////////////////////////////////////
	app.post('/sendemail', function(req, res) {
		if(req.body.lang !== undefined && req.body.name !== undefined && req.body.email !== undefined  && req.body.password !== undefined) {
			if(req.body.password =="ifhjd87467fjnggvys89uyg7fghbd"){
				var _email=escape(req.body.email || "").trim().toLowerCase();
				var _lang=req.body.lang || "ru";
				var _name=req.body.name || "";
				if(_email.match(/[\d\w\-\_\.]+@[\d\w\-\_\.]+\.[\w]{2,4}/i)){
					//GeneratePDF(_lang, _name, function(_file){
						SendEmail_to_address(_lang, _email, "certificate_"+_lang, function(_err){		
							User.updateOne({_id:config.signecountid},{$inc:{signecount:1}}, function(err, _datttt){
								User.findOne({_id:config.signecountid}, function(err, _datt){
									res.setHeader('Access-Control-Allow-Origin', '*');
									res.setHeader('Access-Control-Allow-Headers', 'X-Custom-Heade');
									res.setHeader('Content-Type', 'text/html; charset=utf-8');
									res.setHeader('content-type', 'text/javascript');
									return res.status(200).send({"status":(_err ? false : true),"count":(_datt.signecount || 0)});
								});		
							});	
						});	
					//});	
				}else {
					return res.status(404).send({"status":false});	
				}					
			}else {
				return res.status(404).send({"status":false});	
			}
		}else {
			return res.status(404).send({"status":false});
		}
	});
//////////////////////////////////////////////////////////////////////////////////////
	app.post('/getsignecount', function(req, res) {
		User.findOne({_id:config.signecountid}, function(err, _datt){
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Headers', 'X-Custom-Heade');
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.setHeader('content-type', 'text/javascript');
			return res.status(200).send({"count":(_datt.signecount || 0)});		
		});
	});
/////////////////////////////////////////////////////////////
	app.get('/pdfgenerate', function(req, res) {
		//GeneratePDF("en", "Gevorg Manukyan", function(_file){
			SendEmail_to_address("ru", "gevorgmo@gmail.com", "certificate_ru", function(_err){
				console.log(_err);
				return res.render('templates/test',{});
			});	
		//});
	});


	

};
/////////////////////////////////////////////////////////////////////////////
function GenerateSlug(_slug, _slugid, _slugs){
   var _s= _slug.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, "") //remove diacritics
            .toLowerCase()
            .replace(/\s+/g, '-') //spaces to dashes
            .replace(/&/g, '-and-') //ampersand to and
            .replace(/[^\w\-]+/g, '') //remove non-words
            .replace(/\-\-+/g, '-') //collapse multiple dashes
            .replace(/^-+/, '') //trim starting dash
            .replace(/-+$/, ''); //trim ending dash
	if(_s=="")	 _s=new Date().getTime();
	return _s;	
}
/////////////////////////////////////////////////////////////////////////////
function isLoggedIn(req, res, next) {
    if (req.session.passport.user !== undefined){
        return next();
	}
    res.redirect('/test');
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
 function MoveFile(oldPath,newPath, callback) {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });
        readStream.pipe(writeStream);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function isToday(date) {
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    return true;
  }
  return false;
}
////////////////////////////////////////////////////
function SendEmail_to_address(_lang, _email, _filename, _cb){
	var _email_data={
		"ru":{
			subject:"Ваш сертификат",
			text:"Спасибо,<br>что поддержали<br>Московский<br>договор!",
			file:"Certificate",
			name:"Павильон АТОМ"
		},
		"en":{
			subject:"Your certificate",
			text:"Thank you<br>for supporting<br>the Moscow<br>Treaty!",
			file:"Certificate",
			name:"ATOM Pavilion"
		}
	}
	
	
	
	const transporter = nodemailer.createTransport({
		host: config.email.host,
		port: config.email.port,
		secure: true,
		auth: {
			user: config.email.user,
			pass: config.email.pass,
		},
	});
	
	let mailContent={
		from: '"'+_email_data[_lang].name+'" <'+config.email.address+'>', // sender address
		to: _email, // list of receivers
		subject: _email_data[_lang].subject, // Subject line
		//text: _email_data[_lang].text, // plain text body
		html: '<table align="center"  cellpadding="0" cellspacing="0"  width="100%" style="margin:0 auto;border:0;padding:0;" ><tbody><tr><td style="width:100%;text-align:center;background-color:#fff;margin:0 auto;border:0;padding:70px 0 0 0;"><img src="https://loremipsumcorp.com/templates/atom_logo.jpg" style="width:225px;height:58px;" /></td></tr><tr><td style="width:100%;text-align:center;background-color:#fff;margin:0;border:0;padding:50px 20px;"><p  style="padding:0px;color:#666666;font-family:Georgia, sans-serif;font-size:45px;font-weight:400;margin:0;line-height:50px;letter-spacing:1px">'+_email_data[_lang].text+'</p></td></tr></tbody></table>', // html body
		attachments: [
			{   // stream as an attachment
				filename: _email_data[_lang].file+'.pdf',
				content: fs.createReadStream('./signe/'+_filename+'.pdf')
			}
		]
	};

	transporter.sendMail(mailContent, function(error, data){
		//DeleteFiles(_filename, function(){
			if(error){
				_cb("Please try again later!");
			}else{
				_cb(null);
			}
		//});	
	});

}
/////////////////////////////////////////////////////////////////
function PostData(_url,_dat,_cb){
	fetch(_url, {
		headers: { 'Content-Type': 'application/json'},
        method: 'post',
		body:JSON.stringify(_dat)
    }).then(response => response.json()).then((json) => {
		console.log(json);
		 try {	
			_cb(json);
		} catch (er) {
			_cb(null);
		}
	}).catch(err => {
		console.log(err);
		_cb(null);  
	});
}
/////////////////////////////////////////////////////////////////
function GetData(_url,_dat,_cb){
	fetch(_url+'?'+_dat, {
        method: 'get'
    }).then(response => response.json()).then((json) => {
		console.log(json);
		 try {	
			_cb(json);
		} catch (er) {
			_cb(null);
		}
	}).catch(err => {
		console.log(err);
		_cb(null);  
	});
}
/*
///////////////////////////////////
function DeleteFiles(_filename, _cb){
	if(fs.existsSync('./signe/'+_filename+'.pdf')) {
		fs.unlink('./signe/'+_filename+'.pdf', function(err2) {	
			_cb();
		});
	} else{
		_cb();
	}	
}
/////////////////////////////////////////////////////////////////
function GeneratePDF(_lang,  _name, _cb){
	var fonts = {
		c1: {normal: './signe/c1.ttf'},
		c2: {normal: './signe/c2.ttf'}
	};

	var PdfPrinter = require('pdfmake');
	var printer = new PdfPrinter(fonts);
	var _texts={
		"ru":{
			p1:"Настоящим удостоверяется,",
			p2:"что ",
			p3:"присоединился к Договору",
			p4:"о запрещении испытаний", 
			p5:"ядерного оружия в атмосфере,",
			p6:"в космическом пространстве",
			p7:"и под водой.",
			p8:"",
			p9:"Выражаем Вам нашу искреннюю",
			p10:"признательность.",
		},
		"en":{		
			p1:"This is to certify",
			p2:"that ",
			p3:" has joined the Treaty on the Prohibition",
			p4:"of Nuclear Weapons Testing",
			p5:"in the Atmosphere, in Outer Space,",
			p6:"and Under Water.",
			p7:"",
			p8:"Please accept",
			p9:"our sincere gratitude.",
			p10:""
		}
	}
	
	
	var docDefinition = {
		 pageMargins: [ 0, 10, 0, 10 ],
		background: function (page) {
			return [
				{
					image: './signe/'+_lang+'.png',
					width: 600,
					height: 848,
				}
			];
		},
		content: [
			{
				text: _texts[_lang].p1,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 314 }	
			},
			{
				text: _texts[_lang].p2+_name,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 346 }	
			},
			{
				text: _texts[_lang].p3,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 378 }	
			},
			{
				text: _texts[_lang].p4,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 409 }	
			},
			{
				text: _texts[_lang].p5,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 441 }	
			},
			{
				text: _texts[_lang].p6,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 472 }	
			},
			{
				text: _texts[_lang].p7,
				font:'c1',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 504 }	
			},
			{
				text: _texts[_lang].p8,
				font:'c2',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 535 }	
			},
			{
				text: _texts[_lang].p9,
				font:'c2',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 567 }	
			},
			{
				text: _texts[_lang].p10,
				font:'c2',
				alignment:'center',
				fontSize: 27,
				color:'#000000',
				width: 600,
				height: 32,
				absolutePosition: { x: 0, y: 602 }	
			},
		]
	};
	var _filename=(new Date()).getTime().toString();
	var pdfDoc = printer.createPdfKitDocument(docDefinition);
	pdfDoc.pipe(fs.createWriteStream('./signe/'+_filename+'.pdf'));
	pdfDoc.end();
	_cb(_filename);
}
*/








