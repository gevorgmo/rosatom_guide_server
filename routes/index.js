var mongoose       = require('mongoose')
  , User = mongoose.model('User')
  , Page = mongoose.model('Page')
  , Option = mongoose.model('Option')
  , Media = mongoose.model('Media')
  , Slug = mongoose.model('Slug')
  , moment = require('moment')
  , passport  = require('passport')
  , fs         = require('fs')
  , fetch = require('node-fetch')
  , uuid = require('node-uuid')
  , nodemailer = require('nodemailer')
  , _async 	= require('async')
  , config = require('../config/config')
  , auth = require('../auth');




var _all_roles=["user","admin"];
var _all_categories=["product","solution","service","team","career","page"];
var _all_global_pages=["home","products","solutions","services","company","careers","contact","about","team"];

exports.init = function (app) {

//////////////////////////////////////////////////////////////////////////
/*
	app.get('/createuser', function(req, res) {
		var __user= {
			fullname:"Administrator",
			username:"gevorgmo@gmail.com",
			password:"qqqqqqQ1",
			updated:Date.now(),
			created:Date.now(),
			role:1
		}
		 User.create(__user, function(_err2, newUser){
			if(_err2) console.log(_err2);
			return res.status(200);
		});
	});
*/
/////////////////////////////////////////////////////////////
	app.get('/explore', function(req, res) {
		return res.render('explore', {pagename:"explore"});
	});
//////////////////////////////////////////////////////////////////////////
	app.post('/explore',  function(req, res){
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
		return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});
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
	app.get('/item/:itemid', isLoggedIn, function(req, res) {
		if(req.params.itemid){
				if(req.params.itemid!='new'){
					Page.findById(req.params.itemid}.exec(function(err, _page){
						if(err || !_page) return res.render("index", {user_status:_all_roles[req.user.role],  pagename:"dashboard"});					
						if(_all_global_pages.indexOf(_page.category)==-1){
							return res.render("item", {user_status:_all_roles[req.user.role],  pagename:_page.category, item:_page});
						} else {
							return res.render("globalpage", {user_status:_all_roles[req.user.role],  pagename:_page.category, item:_page});
						}
					});
				} else {
					var _category=req.query.category || "page";
					var _slug=req.query.slug || "none";
					if(_all_categories.indexOf(_category)==-1 && _all_global_pages.indexOf(_category)==-1) _category="page";
					return res.render("item", {user_status:_all_roles[req.user.role],  pagename:_category, item:{slug:"none"}, pages:[]});
				}
			});
		} else {
			return res.redirect('/');
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
			}else if (/\.tif$/i.test(images.originalname) || images.mimetype == 'image/tiff'){
				ftyp='image';
			}else if (/\.tiff$/i.test(images.originalname) || images.mimetype == 'image/tiff'){
				ftyp='image';
			}else if (/\.mp4$/i.test(images.originalname) || images.mimetype == 'video/mp4'){
				ftyp='video';
			}else if (/\.ogv$/i.test(images.originalname) || images.mimetype == 'video/ogg'){
				ftyp='video';
			}else if (/\.pdf$/i.test(images.originalname) || images.mimetype == 'application/pdf'){
				ftyp='pdf';
			}else if (/\.doc$/i.test(images.originalname) || images.mimetype == 'application/msword'){
				ftyp='doc';
			}else if (/\.xls$/i.test(images.originalname) || images.mimetype == 'application/vnd.ms-excel'){
				ftyp='xls';
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
			active:(req.body.active ? (parseInt(req.body.active)==1 ? true : false) : false),
			title:(req.body.title || ""),	
			category:(req.body.category || "page").trim().toLowerCase(),
			content:(req.body.content || {}),
			audio:(req.body.audio || {}),
			video:(req.body.video || {}),
			text:(req.body.text || {}),
		};

		var _slug=req.body.slug || "none";
		var _category=(req.body.category || "page").trim().toLowerCase();

		if(_all_global_pages.indexOf(_category)>-1){
			if(_category=="home"){
				_page.active=true;
				_page.title="Home Page";
			}
			_slug=_category;
		}

		if(_slug=="" || _slug=="none") _slug=_page.title;
		
		_slug=GenerateSlug(_slug);
		
		_page.slug=_slug;
		
		if(req.body.id=="new"){
			Page.find({slug: _slug}, function (err1, _slugs) {
				if(err1) return res.status(200).send({"status":false});
				if(_slugs){
					if(_slugs.length>0) return res.status(200).send({"status":false});
				}
				Page.create(_page,  function(err3, __page) {
					if (err3 || !__page) return res.status(200).send({"status":false});
					return res.status(200).send({"status":true});
				});
			});
			
		} else {
			Page.update({_id:req.body.id},  {$set:_page}, {}, function(err, ___page) {
				if (err){ console.log(err); }
				return res.status(200).send({"status":true});
			});
		});

	});
//////////////////////////////////////////////////////////////////////////////////////
	app.post('/saveuser', isLoggedIn, function(req, res) {
		if(req.body.id !== undefined && req.body.username !== undefined && req.body.role !== undefined) {
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
    res.redirect('/explore');
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
function SendEmail_sendgrid(_email, _subj, _msg, _cb){
	const formData = require('form-data');
	const Mailgun = require('mailgun.js');

	const mailgun = new Mailgun(formData);
	const client = mailgun.client({username: process.env.MAILGUN_USERNAME, key: process.env.MAILGUN_KEY ,url:"https://api.eu.mailgun.net"});


	const messageData = {
		from: process.env.MAILGUN_FROM,
		to: _email,
		subject: _subj,
		html: _msg
	};

	client.messages.create(process.env.MAILGUN_DOMAIN, messageData).then((res) => {
		return _cb(null);
	})
	.catch((err) => {
		return _cb("Please try again later!");
	});
}
