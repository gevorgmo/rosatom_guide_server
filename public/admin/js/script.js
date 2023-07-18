var _rid,_table;
var _msg_warning="Warning";
var _msg_close="Close";
var _msg_del_err="There was an error when deleting.";
var _msg_del_conf="Confirm Delete";
var _msg_del_conf2="Please confirm that You wish to delete.";
var _msg_delete="Delete";
var _msg_change="Change";
var _msg_clone="Copy";
var _msg_inserted="Inserted";
var _msg_deleted="Deleted";
var _msg_updated="Updated";
var _msg_items="items";
var _msg_action="Action"; 
var _msg_clone_conf="Please confirm that You wish to copy the item.";
var _msg_err_uploading="There was an error when uploading file.";
var _msg_err_file_format="Bad file format.";
var _msg_err_saving="There was an error when saving.";
var _msg_err_loading="There was an error when loading.";
var _msg_succ="Success";
var _msg_succ_save="Successfully saved.";
var _msg_err_sort_save="There was an error when saving sorting result.";
var _msg_succ_sorting="Sorting result saved.";
var _msg_err_higthlit='Please fill in the highlighted rows.';

var _file_typs={"video": "/admin/img/videof.png", "pdf": "/admin/img/pdf.png", "doc": "/admin/img/doc.png", "xls": "/admin/img/doc.png"};



$(document).ajaxStart(function() { Pace.restart(); });
//////////////////////////////////////////////
$(document).ready(function(){
	
	$("body").on('change', '.fileuploaderinput', function(evt) {
		evt.preventDefault();
		if(Validate('fileupload')){
			$('.btn-mediauploader').hide();	
			$('.more_media').hide();
			$('.progress').css('opacity','1');
			$(".media_wait").show();
			var formData = new FormData();
			var file = document.getElementById('fileupload').files[0];
			formData.append('images', file);	
			var xhr = new XMLHttpRequest();
			xhr.open('post', '/admin/gallery', true);
			xhr.upload.onprogress = function(e) {
				if (e.lengthComputable)  $('.progress-bar').css('width',parseInt(e.loaded / e.total * 100, 10) + '%');
			};
			xhr.onerror = function(e) {
				confirm('warning',_msg_warning, _msg_err_uploading, _msg_close, '', function(){});
			};
			xhr.onload = function(date) {	
				$(".media_wait").hide();
				$('.btn-mediauploader').show();
				$('.more_media').show();
				$('.progress-bar').css('width','0%');
				$('.progress').css('opacity','0');
				document.getElementById('fileupload').value = "";			
				if(xhr.status == 200) {
					var _data=JSON.parse(date.target.response);
					if(_data.url){
						$('#media_list').prepend('<div class="media_itm  mitm_'+_data.type+'" data-id="'+_data.id+'" data-src="'+_data.url+'" data-type="'+_data.type+'" style="background-image:url('+(_data.type=="image" ? _data.url : _file_typs[_data.type])+')"><a class="media_itm_link '+(_data.type=="image" ? "lightbox" : "")+' btn btn-warning btn-flat" id="i'+$('.media_itm').length+'" href="'+_data.url+'" target="_blank"  title="'+_data.filename+'"><i class="fa  fa-eye"></i></a><button type="button" class="btn-fileremove  btn btn-danger btn-flat"><i class="fa fa-trash"></i></button></div>');
					}else{
						confirm('warning',_msg_warning,_data, _msg_close, '', function(){});
					}				
				} else {
						confirm('warning',_msg_warning, _msg_err_uploading, _msg_close, '', function(){});
				}
			};
			xhr.send(formData);
		}else{
			confirm('warning',_msg_warning, _msg_err_file_format, _msg_close, '', function(){});
		}	
	});
	
	
	
	
	$("body").on('click', '.btn-fileremove', function(event) {
		event.preventDefault();		
		var heading = _msg_del_conf;
		var question = _msg_del_conf2;
		var cancelButtonTxt = 'Cancel';
		var okButtonTxt =_msg_delete;
		var _this=$(this).parent();
		var _rid=$(this).parent().attr('data-id');
		if($('#modal_danger')[0]) $('#modal_danger').attr('data-id', _rid);
		confirm('danger',heading, question, cancelButtonTxt, okButtonTxt, _rid,  function(){
			if($('#modal_danger').attr('data-id')==_rid){
				var formData = new FormData();
				formData.append('id',  _rid);
				var xhr = new XMLHttpRequest();
				xhr.open('delete', '/admin/gallery', true);
				$(".media_wait").show();
				xhr.onerror = function(e) {
					confirm('warning',_msg_warning, _msg_del_err, _msg_close, '', function(){});
				};
				xhr.onload = function(date) {
					$(".media_wait").hide();
					if(xhr.status == 200) {
						_this.remove();
						if(!$('.media_itm.selected')[0]) $('#media_set').hide();
					} else{			
						confirm('warning',_msg_warning, _msg_del_err, _msg_close, '', function(){});
					}
				};
				xhr.send(formData);	
			}
		});
		return false;
	});
	
	
	



	$("body").on('click', '.lightbox', function(event) {
		event.preventDefault();
		var _this=$(this);
		var _carouselLinks=[];
		var _i=0;
		var _index=0;
			$('.lightbox').each(function () {
				if(_this.attr('id')==$(this).attr('id')){
					_index=_i;
				}
			  _carouselLinks.push({ href: $(this).attr('href'), title: $(this).attr('title')});
			  _i++;
			});
			blueimp.Gallery(_carouselLinks, {
			  index: _index,
			  container: '#blueimp-gallery',
			  carousel: true
			});
		return false;
	});
	
	
	
	$("body").on('click', '.media_btn', function(event) {
		$("#media_library").attr('data-itm', $(this).parent().find('.selected_media_itm').attr('id'));
		$("#media_library").attr('data-type', $(this).parent().find('.selected_media_itm').attr('data-type'));
		if(!$('.media_itm')[0]) {
			LoadMediaLibrary();
		} else {
			$('.media_itm').removeClass('selected');
			$('#media_set').hide();
			FilteringMediaLibrary();
		}
		$("#media_library").modal('show'); 
	});
	
	
	$("body").on('click', '.load_more_media', function(event) {
		LoadMediaLibrary();
	});
	
	
	$("body").on('click', '.media_itm', function(event) {
		if($("#media_library").attr('data-type')=="any" || $("#media_library").attr('data-type')== $(this).attr('data-type')){
			$('.media_itm').removeClass('selected');
			$(this).addClass('selected');
			$('#media_set').show();
		}
	});
	
	$("body").on('click', '#media_set', function(event) {
		if($('.media_itm.selected')[0]){
			var _itm=$('#'+$("#media_library").attr('data-itm'));
			var _src=$('.media_itm.selected').attr('data-src');
			var _type=$('.media_itm.selected').attr('data-type');
			_itm.attr('data-src', _src);
			_itm.css('background-image','url('+(_type=="image" ? _src : _file_typs[_type])+')');
			_itm.find('.media_itm_link').attr('href', _src);
			if(_type!="image") _itm.find('.media_itm_link').removeClass('lightbox');
			_itm.parent().find('.media_btn').hide();
			_itm.show();
		}
	});
	
	
	$("body").on('click', '.btn-selectedmediaremove', function(event) {
		$(this).parent().attr('data-src','');
		$(this).parent().hide();
		$(this).parent().parent().find('.media_btn').show();
	});
	
	
	
	if($('.othercheckbox')[0]){	
		$('.othercheckbox').iCheck({
			checkboxClass: 'icheckbox_flat-blue',
			radioClass: 'iradio_flat-blue',
			handle: 'checkbox'
		});
	}
	
	
	if($('.connectedSortable')[0]){
		$(".connectedSortable").sortable({
			placeholder         : $(".connectedSortable").data('placeholder'),
			connectWith         : $(".connectedSortable").data('connect'),
			handle              : '',
			forcePlaceholderSize: true,
			zIndex              : 999999,
			axis: "y"
		});
	}
	
///////////////////////////USERS//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	$('body').on('click', '.btn-deleteuser', function(event) {
		event.preventDefault();		
		var heading = _msg_del_conf;
		var question = _msg_del_conf2;
		var cancelButtonTxt = 'Cancel';
		var okButtonTxt =_msg_delete;
		var _rid=$(this).attr('data-id');
		if($('#modal_danger')[0]) $('#modal_danger').attr('data-id', _rid);
		confirm('danger',heading, question, cancelButtonTxt, okButtonTxt, _rid,  function(){
			if($('#modal_danger').attr('data-id')==_rid){	
				$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
				PostRec('/admin/deleteuser',{id:_rid}, function(_err, __data){
					$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
					if(__data.status){	
						if(__data.error){
							confirm('warning',__data.error, _msg_err_sort_save, _msg_close, '', function(){});
						} else {
							$('#r'+_rid).remove();
						}						
					} else{			
						confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
					}
				});
			}	
		});		
	});
	
	
	
	
	
	$('body').on('click', '.btn-saveuser', function(event) {
		event.preventDefault();	
		var _err=0;
		$('.form-control').css('border-color', '#d2d6de');
		if($('#prusername').val().trim().length < 4 || !$('#prusername').val().trim().match(/[\d\w\-\_\.]+@[\d\w\-\_\.]+\.[\w]{2,4}/i)){ 
			$('#prusername').css('border-color', '#F44336');
			_err++;
		}
		if($('#prpassword1').val().trim().length>0){ 
			if($('#prpassword1').val().trim().length<5 || $('#prpassword2').val().trim().length<5 || $('#prpassword1').val().trim()!=$('#prpassword2').val().trim()){ 
				$('#prpassword1').css('border-color', '#F44336');
				$('#prpassword2').css('border-color', '#F44336');
				_err++;
			}
		}
		if(_err==0){
			var _data={};
			_data["id"]=$('#prid').val();	
			_data["username"]=$('#prusername').val().trim();
			_data["fullname"]=$('#prfullname').val().trim();
			_data["role"]=$('#prrole').val();
			_data["password1"]=$('#prpassword1').val().trim();
			_data["password2"]=$('#prpassword2').val().trim();
			$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
			PostRec('/admin/saveuser',_data, function(_err, __data){
				$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
				if(__data.status){
					if(__data.error){
						confirm('warning',__data.error, _msg_err_sort_save, _msg_close, '', function(){});
					} else {
						location.href="/admin/users/all";	
					}					
				} else{			
					confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
				}
			});
		}
		return false;
	});	
	
	
	
//////////////////////////LANGUAGES//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	if($('.p-languages')[0]){
		_languages.map(function(_i){
			$('.languages_list').append('<div class="sortitem  item_'+_i.language.code+' row" data-id="'+_i._id+'"   data-code="'+_i.language.code+'" data-name="'+_i.language.name+'"  style="position: relative;">'+
							'<div class="col-md-4"><b>Language:</b> '+_i.language.name+'</div>'+
							'<div class="col-md-8 cont_li"><button type="button" class="btn btn-xs  btn-success btn-editcountries"><i class="fa fa-edit"></i></button><button type="button" class="btn btn-xs btn-danger btn-languagedelete"><i class="fa fa-trash-o"></i></button><b>Countries:</b> <div class="countries_list_curr">'+AddCountries(_i.language.countries)+'</div></div>'+
					'</div>');
		});
	}


	$("body").on('click', '.btn-editcountries', function(event) {
		$("#set_country").attr('data-code', $(this).parent().parent().attr('data-code'));
		$('.country_modal_ttl').html('Set countrys for '+$(this).parent().parent().attr('data-name')+'  language');
		$('.country_selector').iCheck("uncheck");	
		$(this).parent().find('.cont_li_itm').each(function(){
			$('.country_selector'+$(this).attr('data-code')).iCheck("check");
		});
		$("#set_country").modal('show'); 
	});
	
	
	$("body").on('click', '#countries_set', function(event) {
		event.preventDefault();
		console.log($('#set_country').attr('data-code'));
		var _ty=$('.item_'+$('#set_country').attr('data-code')).find('.countries_list_curr')
		_ty.empty();
		$('.country_selector').each(function(){
			if($(this).prop('checked')){
				_ty.append('<span class="cont_li_itm"  data-code="'+$(this).val()+'">'+_all_countrys[$(this).val()]+'</span>');
			}
		});
		return false;
	});
	
	

	$("body").on('click', '.btn-addlanguage', function(event) {
		event.preventDefault();
		if(!$('.item_'+$('#prlanguage').val())[0]){		
			$('.languages_list').append('<div class="sortitem  item_'+$('#prlanguage').val()+' row"  data-code="'+$('#prlanguage').val()+'" data-id="new" data-name="'+_all_langs[$('#prlanguage').val()]+'"  style="position: relative;">'+
							'<div class="col-md-4"><b>Language:</b> '+_all_langs[$('#prlanguage').val()]+'</div>'+
							'<div class="col-md-8 cont_li"><button type="button" class="btn btn-xs  btn-success btn-editcountries"><i class="fa fa-edit"></i></button><button type="button" class="btn btn-xs btn-danger btn-languagedelete"><i class="fa fa-trash-o"></i></button><b>Countries:</b> <div class="countries_list_curr"></div></div>'+
					'</div>');			
		} else if($('.item_'+$('#prlanguage').val()).hasClass('rremoved')){	
			$('.item_'+$('#prlanguage').val()).removeClass('rremoved');
		}
		return false;
	});

	
	
	$("body").on('click', '.btn-languagedelete', function(event) {
		event.preventDefault();	
		var heading = _msg_del_conf;
		var question = _msg_del_conf2;
		var cancelButtonTxt = 'Cancel';
		var okButtonTxt =_msg_delete;
		var _rid=$(this).parent().parent().attr('data-code');
		if($('#modal_danger')[0]) $('#modal_danger').attr('data-id', _rid);
		confirm('danger',heading, question, cancelButtonTxt, okButtonTxt, _rid,  function(){
			if($('#modal_danger').attr('data-id')==_rid){
				if($('.item_'+_rid).attr('data-id')!="new"){
					$('.item_'+_rid).addClass('rremoved');	
				} else {
					$('.item_'+_rid).remove();
				}
			}
		});	
		return false;
	});

	
	
	
	$('body').on('click', '.btn-savelanguages', function(event) {
		event.preventDefault();	
		var _data={};
		_data["languages"]=[];
		
		if($('.sortitem')[0]){
			$('.sortitem').each(function(){
				var _lang={code:$(this).attr('data-code'), name:$(this).attr('data-name'), id:$(this).attr('data-id'), countries:[], remove:($(this).hasClass('rremoved') ? "y" : "n")};
				$(this).find('.cont_li_itm').each(function(){
					_lang.countries.push($(this).attr('data-code'));
				});
				_data["languages"].push(_lang);
			});
		} else {
			_data["languages"].push({code:"en", id:"new", name:"English (en)", countries:[]});
		}
		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/admin/savelanguages',_data, function(_err, __data){
			$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
			if(__data.status){
				location.href='/admin';			
			} else{			
				confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
			}
		});
	});
//////////////////////////TAGS//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	$("body").on('click', '.btn-addtag', function(event) {
		event.preventDefault();
		
		var _lang=$(this).attr('data-code');
		var _tag=$('#'+_lang+'prtag').val().trim().replace(/"/g, '');	
		$('.'+_lang+'tags_list').append('<div class="sortitem bg-red item_'+_lang+'"  data-tag="'+_tag+'"   style="position: relative;"><i class="button_draging fa  fa-ellipsis-v"></i>'+
				'<span class="itm_name_el">'+_tag+'</span>'+
				'<button type="button" class="btn  btn-sml btn-sitemdelete pull-right"><i class="fa fa-trash-o"></i></button>'+
		'</div>');
		$('#'+_lang+'prtag').val('');
		return false;
	});


	$("body").on('click', '.btn-sitemdelete', function(event) {
		event.preventDefault();	
		$(this).parent().remove();
		return false;
	});
	
	$('body').on('click', '.btn-savetags', function(event) {
		event.preventDefault();	
		var _data={};
		_data["tags"]=[];
		
		$('.tab-pane').each(function(){
			var _lang=$(this).attr('data-code');
			var _id=$(this).attr('data-id');
			var _tgs=[];
			$('.item_'+_lang).each(function(){
				_tgs.push($(this).attr('data-tag'));
			});
			_data["tags"].push({id:_id, tags:_tgs});
		});
		
		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/admin/savetags',_data, function(_err, __data){
			$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
			if(__data.status){
				location.href='/admin';			
			} else{			
				confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
			}
		});
	});
	
	
///////////////////////////TRANSLATIONS//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$('body').on('click', '.btn-savetrans', function(event) {
		event.preventDefault();	
		var _this=$(this);
		var _data={};
		_data["translations"]=[];	
		
		$('.tab-pane').each(function(){
			var _id=$(this).attr('data-id');
			var _code=$(this).attr('data-code');
			var _trans={id:$(this).attr('data-id'), translations:{}};

			_trans.translations.book_a_meeting=$("#"+_code+"prbook_a_meeting").val();
			_trans.translations.more=$("#"+_code+"prmore").val();
			_trans.translations.all=$("#"+_code+"prall").val();
			_trans.translations.slogan=$("#"+_code+"prslogan").val();
			_trans.translations.all_solutions=$("#"+_code+"prall_solutions").val();
			_trans.translations.all_services=$("#"+_code+"prall_services").val();
			_trans.translations.all_products=$("#"+_code+"prall_products").val();
			_trans.translations.follow_us_on=$("#"+_code+"prfollow_us_on").val();
			_trans.translations.copyright=$("#"+_code+"prcopyright").val();
			_trans.translations.date_publication=$("#"+_code+"prdate_publication").val();
			_trans.translations.date_expire=$("#"+_code+"prdate_expire").val();
			_trans.translations.apply_for_this_job=$("#"+_code+"prapply_for_this_job").val();
			_trans.translations.attach=$("#"+_code+"prattach").val();
			_trans.translations.attach_formats=$("#"+_code+"prattach_formats").val();
			_trans.translations.upload=$("#"+_code+"prupload").val();
			_trans.translations.apply=$("#"+_code+"prapply").val();
			_trans.translations.all_jobs=$("#"+_code+"prall_jobs").val();
			_trans.translations.write_to_us=$("#"+_code+"prwrite_to_us").val();
			_trans.translations.name_surname=$("#"+_code+"prname_surname").val();
			_trans.translations.company_name=$("#"+_code+"prcompany_name").val();
			_trans.translations.email=$("#"+_code+"premail").val();
			_trans.translations.phone=$("#"+_code+"prphone").val();
			_trans.translations.description=$("#"+_code+"prdescription").val();
			_trans.translations.sent=$("#"+_code+"prsent").val();
			_trans.translations.address=$("#"+_code+"praddress").val();
			_trans.translations.form_success=$("#"+_code+"prform_success").val();
			_trans.translations.form_error=$("#"+_code+"prform_error").val();
			_data["translations"].push(_trans);
		});
		
		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/admin/savetranslations',_data, function(_err, __data){
			$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
			if(__data.status){
				if(_this.hasClass('andexit')) {
					location.href=_this.attr('data-href');
				} else {
					$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
				}		
			} else{			
				confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
			}
		});
	});	
	

///////////////////////////MENUS//////////////////////////////////////////////////////////////////////////////////////////////////////////////



	$('body').on('click', '.btn-savemenus', function(evt) {
		evt.preventDefault();
		var _this=$(this);
		var _data={};
		_data["menus"]=[];	
		
		$('.tab-pane').each(function(){
			var _code=$(this).attr('data-code');
			var _id=$(this).attr('data-id');
			var _menu={
				id:_id,
				heads:{},
				tags:[],
				services:[],
				solutions:[],
				additional:[]
			};
			
			_menu.heads["solutions"]=$('#'+_code+'prhead_solutions').val();
			_menu.heads["services"]=$('#'+_code+'prhead_services').val();
			_menu.heads["products"]=$('#'+_code+'prhead_products').val();
			_menu.heads["company"]=$('#'+_code+'prhead_company').val();
			_menu.heads["about"]=$('#'+_code+'prhead_about').val();
			_menu.heads["team"]=$('#'+_code+'prhead_team').val();
			_menu.heads["careers"]=$('#'+_code+'prhead_careers').val();
			_menu.heads["contact"]=$('#'+_code+'prhead_contact').val();

			_menu.tags=$('#'+_code+'prtags').val();
			
			if($('.'+_code+'prservice_itm')[0]){	
				$('.'+_code+'prservice_itm').each(function(){
					 _menu.services.push($(this).attr('id'));
				});
			}
			
			if($('.'+_code+'prsolution_itm')[0]){	
				$('.'+_code+'prsolution_itm').each(function(){
					  _menu.solutions.push($(this).attr('id'));
				});
			}
			if($('.'+_code+'prpage_itm')[0]){	
				$('.'+_code+'prpage_itm').each(function(){
					_menu.additional.push($(this).attr('id'));
				});
			}
			
			_data["menus"].push(_menu);
		});

		
		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/admin/savemenus',_data, function(_err, __data){
			if(__data.status){
				if(_this.hasClass('andexit')) {
					location.href=_this.attr('data-href');
				} else {
					$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
				}
			} else {	
				confirm('warning',_msg_warning, _msg_err_saving, _msg_close, '', function(){});
			}
		});	

		return false;
	});

///////////////////////////ITEMS//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
	$('body').on('click', '.btn-deleteitem', function(event) {
		event.preventDefault();		
		var heading = _msg_del_conf;
		var question = _msg_del_conf2;
		var cancelButtonTxt = 'Cancel';
		var okButtonTxt =_msg_delete;
		var _rid=$(this).attr('data-slugid');
		if($('#modal_danger')[0]) $('#modal_danger').attr('data-id', _rid);
		confirm('danger',heading, question, cancelButtonTxt, okButtonTxt, _rid,  function(){
			if($('#modal_danger').attr('data-id')==_rid){	
				$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
				PostRec('/admin/deleteitem',{slugid:_rid}, function(_err, __data){
					$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
					if(__data.status){
							$('#'+_rid).remove();
					} else{			
						confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
					}
				});
			}	
		});		
	});


	$('body').on('click', '.btn-copyitem', function(event) {
		event.preventDefault();
		var _this=$(this);	
		var heading = _msg_warning;
		var question = _msg_clone_conf;
		var cancelButtonTxt = 'Cancel';
		var okButtonTxt =_msg_clone;
		var _rid=$(this).attr('data-slugid');
		if($('#modal_warning')[0]) $('#modal_warning').attr('data-id', _rid);
		confirm('warning',heading, question, cancelButtonTxt, okButtonTxt, _rid,  function(){
			if($('#modal_warning').attr('data-id')==_rid){	
				$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
				PostRec('/admin/copyitem',{slugid:_rid}, function(_err, __data){
					if(__data.status){
						location.href=_this.attr('data-href');
					} else{	
						$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
						confirm('warning',_msg_warning, _msg_err_sort_save, _msg_close, '', function(){});
					}
				});
			}	
		});		
	});	
	
///////////////////////////ITEM//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	if($('.p-item-career')[0]){	
		_item_det.published=_item_det.published || "";
		$('#prpublished').datetimepicker({
			format: "YYYY-MM-DD HH:mm",
			ignoreReadonly:true,
			defaultDate: (_item_det.published!="" ? new Date(_item_det.published) : new Date())
		});	
		
		_item_det.expiring=_item_det.expiring || "";
		$('#prexpiring').datetimepicker({
			format: "YYYY-MM-DD HH:mm",
			ignoreReadonly:true,
			defaultDate: (_item_det.expiring!="" ? new Date(_item_det.expiring) : new Date())
		});	
	}

	

	
	


	if($('.p-item-product')[0]){	
	
		$('#prinformation').trumbowyg({
			 btns: [
				['viewHTML'],
				['undo', 'redo'],
				['strong', 'em', 'del'],
				['formatting'],
				['link'],
				['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
				['unorderedList'],
				['removeformat'],
				['fullscreen']
			],
			removeformatPasted: true
		});
	
		$('#prspecification').trumbowyg({
			 btns: [
				['viewHTML'],
				['undo', 'redo'],
				['strong', 'em', 'del'],
				['formatting'],
				['link'],
				['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
				['unorderedList'],
				['removeformat'],
				['fullscreen']
			],
			removeformatPasted: true
		});

		
		$('#prinformation').trumbowyg('html',  (_item_det.additional.information || ""));
		$('#prspecification').trumbowyg('html',  (_item_det.additional.specification || ""));
		
	}
	
	
	if($("#prsub_title")[0]){
		$("#prsub_title").trumbowyg({
			 btns: [
				['viewHTML'],
				['undo', 'redo'],
				['strong', 'em', 'del'],
				['formatting'],
				['link'],
				['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
				['unorderedList'],
				['removeformat'],
				['fullscreen']
			],
			removeformatPasted: true
		});
		$("#prsub_title").trumbowyg('html', (_item_det.sub_title || ""));
	}
	

	
	$('body').on('click', '.btn-ineraddslide', function(evt) {
		evt.preventDefault();
		var _id=$('.iteminnerslideshow_itm').length;
		while($('#prslide'+_id)[0]){
			_id++;
		}
		$('#iteminnerslideshow').append('<div class="sortingitm iteminnerslideshow_itm"><div class="slide_itm_wrap"><button type="button" class="media_btn btn btn-info btn-flat" ><i class="fa fa-image"></i> Select Media</button><div class="selected_media_itm" style="display:none"   data-src="" data-type="image"  id="prslide'+_id+'"><a class="media_itm_link lightbox  btn btn-warning btn-flat" id="g'+_id+'" href="#" target="_blank" title=""><i class="fa  fa-eye"></i></a><button type="button" class="btn-selectedmediaremove  btn btn-danger btn-flat"><i class="fa fa-trash"></i></button></div></div><button type="button" class="btn-sitemdelete  btn  btn-danger btn-xs"><i class="fa fa-times"></i></button></div>');
		return false;
	});
	
	
	
	

	if($(".select2")[0]){
		$(".select2").each(function(){
			var _cat=$(this).attr('data-category');
			var _wrp=$(this).attr('id');
			$(this).select2({
				ajax: {
					url: '/admin/getitems',
					type: "POST",
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return {
							title: params.term, 
							language: $('#prlanguage').val(), 
							category: _cat, 
							page: params.page
						};
					},
					processResults: function (data, params) {
						params.page = params.page || 1;
						return {
							results: (SetIds(data.items) || []),
							pagination: {
								more: data.items.length==20
							}
						};
					},
					cache: true
				},
				escapeMarkup: function (markup) { return markup; }, 
				minimumInputLength: 3,
				templateResult: formatRepo, 
				templateSelection: function(repo){
					if(!$('.'+_wrp+'_'+ repo.id)[0]){
						var _img='/admin/img/temp.png';
						if(repo.poster) _img=repo.poster;
						$('#'+_wrp+'_wrap').append('<div class="sortingitm spec_itm_li '+_wrp+'_itm '+_wrp+'_'+ repo.id+ '"  id="'+ repo.id+ '">'+
														'<div class="spec_itm_li_media"><img src="'+ _img+'" /></div>'+
														'<div class="spec_itm_li_title">'+repo.title+'</div>'+
														'<button type="button" class="btn-sitemdelete  btn  btn-danger btn-xs btn-removerelatedproduct"><i class="fa fa-times"></i></button>'+
													'</div>');					
					}
					return '';
				} 
			});
		});
	}
	
	
	
	if($("#prtags")[0]){	
		if(_tags){
			_tags.map(function(_i){
				var newOption;
				if(_item_det.tags){
					if(_item_det.tags.indexOf(_i)>-1){
						 newOption = new Option(_i, _i, true, true);
					} else {
						 newOption = new Option(_i, _i, false, false);
					}
				} else {
					newOption = new Option(_i, _i, false, false);
				}
				$('#prtags').append(newOption).trigger('change');
			});
		}

		$("#prtags").select2({
			placeholder: 'Enter tag'
		});
	}
	
	
	if($(".alltags")[0]){
		$(".alltags").each(function(){
			var _lang=$(this).attr('data-code');
			if(_all_tags[_lang]){
				_all_tags[_lang].map(function(_i){
					var newOption;
					if(_selected_tags[_lang]){
						if(_selected_tags[_lang].indexOf(_i)>-1){
							 newOption = new Option(_i, _i, true, true);
						} else {
							 newOption = new Option(_i, _i, false, false);
						}
					} else {
						newOption = new Option(_i, _i, false, false);
					}
					$('#'+_lang+'prtags').append(newOption).trigger('change');
				});
			}
			$(this).select2({
				placeholder: 'Enter tag'
			});
		});
	}



	
	$('body').on('click', '.btn-saveitem', function(evt) {
		evt.preventDefault();
		var _this=$(this);
		var _data={};
		_data["active"]=($('#practive')[0] ? ($('#practive').prop('checked') ? 1 : 0 ) : 1);
		_data['id']=$('#prid').val();
		_data['slugid']=$('#prslugid').val();
		_data['language']=$('#prlanguage').val();
		_data['category']=$('#prcategory').val();
		_data["poster"]=$('#prposter').attr('data-src');
		_data["title"]=($('#prtitle')[0] ? $('#prtitle').val() : "");
		_data["slug"]=($('#prslug')[0] ? $('#prslug').val() : "");
		_data["seo_keywords"]=$('#prseo_keywords').val();
		_data["seo_description"]=$('#prseo_description').val();
		_data["content"]="";
		_data["rel_products"]=[];
		_data["rel_solutions"]=[];
		_data["rel_services"]=[];
		_data["rel_team"]=[];
		_data["rel_careers"]=[];
		_data["tags"]=[];	
		_data["additional"]={};
		
		var _alt_title=($('#prtitle')[0] ? $('#prtitle').val().trim().replace(/"/g, "'") : "");
		
		if($('#prsub_title')[0]) _data["sub_title"]=$('#prsub_title').trumbowyg('html');
		
		
		if($('.iteminnerslideshow_itm')[0]){
			_data["additional"].slideshow=[];	
			$('.iteminnerslideshow_itm').each(function(){
				if($(this).find('.selected_media_itm').attr('data-src')!="") _data["additional"].slideshow.push($(this).find('.selected_media_itm').attr('data-src'));
			});
		}
		
		if($('#prbackground')[0]) _data["additional"].background=$('#prbackground').attr('data-src');
		
		
		if($('#prcategory').val()=="product"){	
			_data["additional"].screenshot=$('#prscreenshot').attr('data-src');
			_data["additional"].information=$('#prinformation').trumbowyg('html');
			_data["additional"].specification=$('#prspecification').trumbowyg('html');
		}
		
		
		if($('#prtags')[0]) _data["tags"]=$('#prtags').val();	


		if($('.p-item-career')[0]){	
			_data["published"]=$('#prpublished').data("DateTimePicker").date()._d.toUTCString();
			_data["expiring"]=$('#prexpiring').data("DateTimePicker").date()._d.toUTCString();
		}
		
		
		
		if($('.p-page-home')[0]){	
			_data["additional"].top_left_image=$('#prtop_left_image').attr('data-src');
			_data["additional"].top_left_title=$('#prtop_left_title').val();
			_data["additional"].top_left_sub_title=$('#prtop_left_sub_title').val();
			_data["additional"].top_left_url=$('#prtop_left_url').val();
			_data["additional"].top_right_image=$('#prtop_right_image').attr('data-src');
			_data["additional"].top_right_title=$('#prtop_right_title').val();
			_data["additional"].top_right_sub_title=$('#prtop_right_sub_title').val();
			_data["additional"].top_right_url=$('#prtop_right_url').val();		
		}
		
		
		if($('.p-page-contact')[0]){
			_data["additional"].address=$('#praddress').val();
			_data["additional"].email=$('#premail').val();
			_data["additional"].phone=$('#prphone').val();
			_data["additional"].facebook=$('#prfacebook').val();
			_data["additional"].linkedin=$('#prlinkedin').val();
			_data["additional"].youtube=$('#pryoutube').val();
			_data["additional"].twitter=$('#prtwitter').val();
			_data["additional"].telegram=$('#prtelegram').val();
		}
		
		
		if($('.prproduct_itm')[0]){	
			$('.prproduct_itm').each(function(){
				 _data["rel_products"].push($(this).attr('id'));
			});
		}
		
		if($('.prservice_itm')[0]){	
			$('.prservice_itm').each(function(){
				 _data["rel_services"].push($(this).attr('id'));
			});
		}
		
		if($('.prsolution_itm')[0]){	
			$('.prsolution_itm').each(function(){
				 _data["rel_solutions"].push($(this).attr('id'));
			});
		}
		
		if($('.prcareer_itm')[0]){	
			$('.prcareer_itm').each(function(){
				 _data["rel_careers"].push($(this).attr('id'));
			});
		}
		
		if($('.prteam_itm')[0]){	
			$('.prteam_itm').each(function(){
				 _data["rel_team"].push($(this).attr('id'));
			});
		}
		
		
		
		
		if($('#prbottom_link_title1')[0]){	
			 _data["additional"].bottom_link_title1=$('#prbottom_link_title1').val();
			 _data["additional"].bottom_link_title2=$('#prbottom_link_title2').val();
			 _data["additional"].bottom_link_url1=$('#prbottom_link_url1').val();
			 _data["additional"].bottom_link_url2=$('#prbottom_link_url2').val();
		}
		
		
		if($('#prposition')[0])  _data["additional"].position=$('#prposition').val();
		
		
		if($('.edit_ittm')[0]){	
			var  _ttmp_cont=$('<div></div>');
			$('.edit_ittm').each(function(){
				if($(this).attr('data-type')){
					var _ind=parseInt($(this).attr('data-type'));
					var _iit=$('<div class="content_row" data-type="'+_ind+'"></div>');
		
					if(_ind==0){
						_iit.addClass('content_single_image');
						_iit.append('<div class="img_wrpr"><img src="'+$(this).find('.edit_img').attr('data-src')+'" alt="'+_alt_title+'"  /></div>');
						if($(this).find('.edit_img_caption').html().length>0) _iit.append('<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>');
					} else if(_ind==1){
						_iit.addClass('content_left_right_media');
						_iit.append('<div class="content_left content_left_right_img content_left_right_half edit_ittm_part1"><div class="img_wrpr"><img src="'+$($(this).find('.edit_img')[0]).attr('data-src')+'" alt="'+_alt_title+'"  /></div>'+($(this).find('.edit_ittm_part1').find('.edit_img_caption').html().length>0 ? '<div class="content_caption">'+$(this).find('.edit_ittm_part1').find('.edit_img_caption').html()+'</div>' : "")+'</div>');
						_iit.append('<div class="content_right content_left_right_img content_left_right_half edit_ittm_part2"><div class="img_wrpr"><img src="'+$($(this).find('.edit_img')[1]).attr('data-src')+'" alt="'+_alt_title+'"  /></div>'+($(this).find('.edit_ittm_part2').find('.edit_img_caption').html().length>0 ? '<div class="content_caption">'+$(this).find('.edit_ittm_part2').find('.edit_img_caption').html()+'</div>' : "")+'</div>');
					} else if(_ind==2){
						_iit.addClass('content_left_right_media');
						_iit.append('<div class="content_left_right_img"><div class="img_wrpr"><img src="'+$(this).find('.edit_img').attr('data-src')+'" alt="'+_alt_title+'"  /></div>'+($(this).find('.edit_img_caption').html().length>0 ? '<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>'  : "")+'</div>');
						_iit.append('<div class="content_right content_left_right_text"><div class="content_wrap">'+$(this).find('.edit_text').html()+'</div></div>');
					} else if(_ind==3){
						_iit.addClass('content_left_right_media');
						_iit.append('<div class="for_mobile_only content_left_right_img"><div class="img_wrpr"><img src="'+$(this).find('.edit_img').attr('data-src')+'" alt="'+_alt_title+'"  /></div>'+($(this).find('.edit_img_caption').html().length>0 ? '<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>'  : "")+'</div>');
						_iit.append('<div class="content_left content_left_right_text"><div class="content_wrap">'+$(this).find('.edit_text').html()+'</div></div>');
						_iit.append('<div class="for_desktop_only content_left_right_img"><div class="img_wrpr"><img src="'+$(this).find('.edit_img').attr('data-src')+'" alt="'+_alt_title+'"  /></div>'+($(this).find('.edit_img_caption').html().length>0 ? '<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>'  : "")+'</div>');
					} else if(_ind==4){
						_iit.addClass('content_single_text');
						_iit.append($(this).find('.edit_text').html());
					} else if(_ind==5){
						_iit.addClass('content_left_right_media');
						_iit.append('<div class="content_left content_left_right_text content_left_right_half edit_ittm_part1"><div class="content_wrap">'+$($(this).find('.edit_text')[0]).html()+'</div></div>');
						_iit.append('<div class="content_right content_left_right_text content_left_right_half edit_ittm_part2"><div class="content_wrap">'+$($(this).find('.edit_text')[1]).html()+'</div></div>');
					} else if(_ind==6){
						_iit.addClass('content_video');
						_iit.append('<div class="content_video_wrap"><iframe class="content_video_iframe"  src="'+$(this).find('.edit_video').attr('data-src')+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>');
						if($(this).find('.edit_img_caption').html().length>0) _iit.append('<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>');
					} else if(_ind==7){
						_iit.addClass('content_video');
						_iit.append('<div class="content_video_wrap"><video  class="content_video_file" controls loop autoplay muted><source src="'+$(this).find('.edit_videof').attr('data-src1')+'" type="video/mp4">'+($(this).find('.edit_videof').attr('data-src2')!="" ? '<source src="'+$(this).find('.edit_videof').attr('data-src2')+'" type="video/ogg">' : "")+'</video></div>');
						if($(this).find('.edit_img_caption').html().length>0) _iit.append('<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>');
					} else if(_ind==8){
						_iit.addClass('content_slideshow');
						var _slid_cont="";
						$(this).find('.slideshow_itm').each(function(){
							_slid_cont+='<div class="content_slideshow_itm" style="background-image:url('+$(this).attr('src')+')" data-src="'+$(this).attr('src')+'"></div>';
						});
						_iit.append('<div class="content_slideshow_wrap"><div class="owl-carousel">'+_slid_cont+'</div><a href="#" class="carer_slide_contr_left cont_sld_left for_desktop_only"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.435 61.909" class="career_sld_cntrl_left"><g transform="translate(1844.177 61.909) rotate(180)"><g transform="translate(1810.742 0)"><path fill="#fff" d="M150.472,29.256,121.837.7a2.4,2.4,0,1,0-3.389,3.4l26.93,26.856L118.447,57.811a2.4,2.4,0,0,0,3.39,3.4l28.635-28.555a2.4,2.4,0,0,0,0-3.4Z" transform="translate(-117.742 0)"/></g></g></svg></a><a href="#" class="carer_slide_contr_right cont_sld_right for_desktop_only"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.435 61.909" class="career_sld_cntrl_right"><path fill="#FFFFFF" stroke="none" d="M 0 2.45Q 0 3.55 0.7 4.1L 27.65 31 0.7 57.85Q 0 58.55 0 59.55 0 60.6 0.7 61.25 1.4 61.9 2.4 61.95 3.3 61.95 4.1 61.25L 32.7 32.7 32.75 32.7Q 33.4 31.9 33.4 31 33.35 30.05 32.7 29.25L 4.1 0.7Q 3.35 0.1 2.4 0.1 1.4 0.1 0.7 0.7 0 1.4 0 2.45 Z"/></svg></a>');
					}
					
					_ttmp_cont.append(_iit);
				}
			});	
			_data["content"]=_ttmp_cont.html();
		}
		

		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/admin/saveitem',_data, function(_err, __data){
			if(__data.status){
				if(_this.hasClass('andexit')) {
					location.href=_this.attr('data-href');
				} else {
					$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
				}
			} else {
				
				confirm('warning',_msg_warning, _msg_err_saving, _msg_close, '', function(){});
			}
		});	

		return false;
	});

	
	
	
	
});

/////////////////////////////////
function PostRec(_url, _data, callback){
	$.ajax({
		type: "POST",
		url: _url,
		data: _data
	}).done(function(o) {
		callback(null,o);
	}).fail(function(e) {
		callback(e);
	});
}
/////////////////////////////////
function confirm(type,heading, question, cancelButtonTxt, okButtonTxt, _id=0,  _callback) {
	var confirmModal;
	if(!$('#modal_' + type)[0]){

		confirmModal = $('<div class="modal fade modal-' + type +'" data-id="'+_id+'" id="modal_' + type +'">' + 
							'<div class="modal-dialog">' + 
								'<div class="modal-content">' + 
									'<div class="modal-header">' + 
										'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
										'<div class="modal-title">' + heading +'</div>' + 
									'</div>' + 
									'<div class="modal-body"><p class="modal-body-p">' + question + '</p></div>' + 
									'<div class="modal-footer">' + 
										'<button type="button" class="btn btn-outline pull-left" data-dismiss="modal">'+cancelButtonTxt+'</button>' + 
										'<button type="button" class="btn btn-outline okButton" >'+okButtonTxt+'</button>' + 
									'</div>' + 
								'</div>' + 
							'</div>' + 
						'</div>');
		$('body').append(confirmModal);				
	} else {
		confirmModal=$('#modal_' + type);
	}
	
	if(okButtonTxt=='') { confirmModal.find('.okButton').hide();}
	confirmModal.find('.okButton').click(function(event) {
		_callback();
		confirmModal.modal('hide');
	});			
	confirmModal.modal('show'); 
};

////////////////////////////////////////////////
var _validFileExtensions = [".jpg",".jpeg",".png",".svg",".gif",".tif",".doc",".docx",".xls",".xlsx",".mp4",".ogv",".pdf"];    
function Validate(_elem) {
    var oInput =document.getElementById(_elem);
	if (oInput.type == "file") {
		var sFileName = oInput.value;
		if (sFileName.length > 0) {
			var blnValid = false;
			for (var j = 0; j < _validFileExtensions.length; j++) {
				var sCurExtension = _validFileExtensions[j];
				if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
					blnValid = true;
					break;
				}
			}		
			if (!blnValid) {
				return false;
			}
		}
	}
    return true;
}


///////////////////////////////////////////////////
function LoadMediaLibrary(){
	var _page=parseInt($("#media_library").attr('data-page'));
	$(".load_more_media").hide();
	$(".btn-mediauploader").hide();
	$(".media_loading_animation").show();
	$(".media_wait").show();
	
	PostRec('/admin/getgallery',{page: _page}, function(_err, __data){
		$(".load_more_media").show();
		$(".btn-mediauploader").show();
		$(".media_loading_animation").hide();
		$(".media_wait").hide();
		if(__data.files){
			__data.files.map(function(_i){
				$('#media_list').append('<div class="media_itm   mitm_'+_i.type+'" data-id="'+_i._id+'" data-src="'+_i.url+'"  data-type="'+_i.type+'"  style="background-image:url('+(_i.type=="image" ? _i.url : _file_typs[_i.type])+')"><a class="media_itm_link '+(_i.type=="image" ? "lightbox" : "")+' btn btn-warning btn-flat" href="'+_i.url+'" id="i'+$('.media_itm').length+'"  target="_blank" title="'+_i.filename+'"><i class="fa  fa-eye"></i></a><button type="button" class="btn-fileremove  btn btn-danger btn-flat"><i class="fa fa-trash"></i></button></div>');
			});
			if(__data.files.length<20) $(".load_more_media").hide();
			if(!$('.media_itm.selected')[0]) $('#media_set').hide();
			FilteringMediaLibrary();
		} else {
			confirm('warning',_msg_warning, _msg_err_loading, _msg_close, '', function(){});
		}
	});	
	_page++;
	$("#media_library").attr('data-page', _page);
}
///////////////////////////////////////////////////
function FilteringMediaLibrary(){
	if($("#media_library").attr('data-type')!="any"){
		$(".media_itm").css('opacity', '0.5');
		$(".mitm_"+$("#media_library").attr('data-type')).css('opacity', '1');
	} else {
		$(".media_itm").css('opacity', '1');
	}
}

////////////////////////////////////////////////////////
function SetIds(_items){
	var newitems=[];
	_items.map(function(_i){
		if(_i.slugid) newitems.push({id:_i._id, title:_i.title, poster:(_i.poster || null)});
	});
	return newitems;
}
///////////////////////////////////////////////////////
function formatRepo (repo) {
	if (repo.loading) return repo.title;
	var _img='/admin/img/temp.png';
	if(repo.poster) _img=repo.poster;

	var markup = "<div class='select2-result-repository clearfix'>" +
					"<div class='select2-result-repository__avatar'><img src='" + _img + "' /></div>" +
					"<div class='select2-result-repository__meta'>" +
						"<div class='select2-result-repository__title'>" + repo.title + "</div>"+
					"</div>"+
				"</div>";
	return markup;
}
///////////////////////////////////////////////////	
function AddCountries(_countries){
	var _u="";
	if(_countries){
		_countries.map(function(_i){
			_u+='<span class="cont_li_itm" data-code="'+_i+'">'+_all_countrys[_i]+'</span>';
		});
	}
	return _u;
}
///////////////////////////////////////////////////
var _all_langs={
"ab":"Abkhazian (ab)",
"aa":"Afar (aa)",
"af":"Afrikaans (af)",
"ak":"Akan (ak)",
"sq":"Albanian (sq)",
"am":"Amharic (am)",
"ar":"Arabic (ar)",
"an":"Aragonese (an)",
"hy":"Armenian (hy)",
"as":"Assamese (as)",
"av":"Avaric (av)",
"ae":"Avestan (ae)",
"ay":"Aymara (ay)",
"az":"Azerbaijani (az)",
"bm":"Bambara (bm)",
"ba":"Bashkir (ba)",
"eu":"Basque (eu)",
"be":"Belarusian (be)",
"bn":"Bengali (bn)",
"bi":"Bislama (bi)",
"bs":"Bosnian (bs)",
"br":"Breton (br)",
"bg":"Bulgarian (bg)",
"my":"Burmese (my)",
"ca":"Catalan, Valencian (ca)",
"ch":"Chamorro (ch)",
"ce":"Chechen (ce)",
"ny":"Chichewa, Chewa, Nyanja (ny)",
"zh":"Chinese (zh)",
"cu":"Church Slavic, Old Slavonic, Church Slavonic, Old Bulgarian, Old Church Slavonic (cu)",
"cv":"Chuvash (cv)",
"kw":"Cornish (kw)",
"co":"Corsican (co)",
"cr":"Cree (cr)",
"hr":"Croatian (hr)",
"cs":"Czech (cs)",
"da":"Danish (da)",
"dv":"Divehi, Dhivehi, Maldivian (dv)",
"nl":"Dutch, Flemish (nl)",
"dz":"Dzongkha (dz)",
"en":"English (en)",
"eo":"Esperanto (eo)",
"et":"Estonian (et)",
"ee":"Ewe (ee)",
"fo":"Faroese (fo)",
"fj":"Fijian (fj)",
"fi":"Finnish (fi)",
"fr":"French (fr)",
"fy":"Western Frisian (fy)",
"ff":"Fulah (ff)",
"gd":"Gaelic, Scottish Gaelic (gd)",
"gl":"Galician (gl)",
"lg":"Ganda (lg)",
"ka":"Georgian (ka)",
"de":"German (de)",
"el":"Greek, Modern (1453–) (el)",
"kl":"Kalaallisut, Greenlandic (kl)",
"gn":"Guarani (gn)",
"gu":"Gujarati (gu)",
"ht":"Haitian, Haitian Creole (ht)",
"ha":"Hausa (ha)",
"he":"Hebrew (he)",
"hz":"Herero (hz)",
"hi":"Hindi (hi)",
"ho":"Hiri Motu (ho)",
"hu":"Hungarian (hu)",
"is":"Icelandic (is)",
"io":"Ido (io)",
"ig":"Igbo (ig)",
"id":"Indonesian (id)",
"ia":"Interlingua (International Auxiliary Language Association) (ia)",
"ie":"Interlingue, Occidental (ie)",
"iu":"Inuktitut (iu)",
"ik":"Inupiaq (ik)",
"ga":"Irish (ga)",
"it":"Italian (it)",
"ja":"Japanese (ja)",
"jv":"Javanese (jv)",
"kn":"Kannada (kn)",
"kr":"Kanuri (kr)",
"ks":"Kashmiri (ks)",
"kk":"Kazakh (kk)",
"km":"Central Khmer (km)",
"ki":"Kikuyu, Gikuyu (ki)",
"rw":"Kinyarwanda (rw)",
"ky":"Kirghiz, Kyrgyz (ky)",
"kv":"Komi (kv)",
"kg":"Kongo (kg)",
"ko":"Korean (ko)",
"kj":"Kuanyama, Kwanyama (kj)",
"ku":"Kurdish (ku)",
"lo":"Lao (lo)",
"la":"Latin (la)",
"lv":"Latvian (lv)",
"li":"Limburgan, Limburger, Limburgish (li)",
"ln":"Lingala (ln)",
"lt":"Lithuanian (lt)",
"lu":"Luba-Katanga (lu)",
"lb":"Luxembourgish, Letzeburgesch (lb)",
"mk":"Macedonian (mk)",
"mg":"Malagasy (mg)",
"ms":"Malay (ms)",
"ml":"Malayalam (ml)",
"mt":"Maltese (mt)",
"gv":"Manx (gv)",
"mi":"Maori (mi)",
"mr":"Marathi (mr)",
"mh":"Marshallese (mh)",
"mn":"Mongolian (mn)",
"na":"Nauru (na)",
"nv":"Navajo, Navaho (nv)",
"nd":"North Ndebele (nd)",
"nr":"South Ndebele (nr)",
"ng":"Ndonga (ng)",
"ne":"Nepali (ne)",
"no":"Norwegian (no)",
"nb":"Norwegian Bokmål (nb)",
"nn":"Norwegian Nynorsk (nn)",
"ii":"Sichuan Yi, Nuosu (ii)",
"oc":"Occitan (oc)",
"oj":"Ojibwa (oj)",
"or":"Oriya (or)",
"om":"Oromo (om)",
"os":"Ossetian, Ossetic (os)",
"pi":"Pali (pi)",
"ps":"Pashto, Pushto (ps)",
"fa":"Persian (fa)",
"pl":"Polish (pl)",
"pt":"Portuguese (pt)",
"pa":"Punjabi, Panjabi (pa)",
"qu":"Quechua (qu)",
"ro":"Romanian, Moldavian, Moldovan (ro)",
"rm":"Romansh (rm)",
"rn":"Rundi (rn)",
"ru":"Russian (ru)",
"se":"Northern Sami (se)",
"sm":"Samoan (sm)",
"sg":"Sango (sg)",
"sa":"Sanskrit (sa)",
"sc":"Sardinian (sc)",
"sr":"Serbian (sr)",
"sn":"Shona (sn)",
"sd":"Sindhi (sd)",
"si":"Sinhala, Sinhalese (si)",
"sk":"Slovak (sk)",
"sl":"Slovenian (sl)",
"so":"Somali (so)",
"st":"Southern Sotho (st)",
"es":"Spanish, Castilian (es)",
"su":"Sundanese (su)",
"sw":"Swahili (sw)",
"ss":"Swati (ss)",
"sv":"Swedish (sv)",
"tl":"Tagalog (tl)",
"ty":"Tahitian (ty)",
"tg":"Tajik (tg)",
"ta":"Tamil (ta)",
"tt":"Tatar (tt)",
"te":"Telugu (te)",
"th":"Thai (th)",
"bo":"Tibetan (bo)",
"ti":"Tigrinya (ti)",
"to":"Tonga (Tonga Islands) (to)",
"ts":"Tsonga (ts)",
"tn":"Tswana (tn)",
"tr":"Turkish (tr)",
"tk":"Turkmen (tk)",
"tw":"Twi (tw)",
"ug":"Uighur, Uyghur (ug)",
"uk":"Ukrainian (uk)",
"ur":"Urdu (ur)",
"uz":"Uzbek (uz)",
"ve":"Venda (ve)",
"vi":"Vietnamese (vi)",
"vo":"Volapük (vo)",
"wa":"Walloon (wa)",
"cy":"Welsh (cy)",
"wo":"Wolof (wo)",
"xh":"Xhosa (xh)",
"yi":"Yiddish (yi)",
"yo":"Yoruba (yo)",
"za":"Zhuang, Chuang (za)",
"zu":"Zulu (zu)"
};

var _all_countrys={
"AF":"Afghanistan",
"AX":"Åland Islands",
"AL":"Albania",
"DZ":"Algeria",
"AS":"American Samoa",
"AD":"AndorrA",
"AO":"Angola",
"AI":"Anguilla",
"AQ":"Antarctica",
"AG":"Antigua and Barbuda",
"AR":"Argentina",
"AM":"Armenia",
"AW":"Aruba",
"AU":"Australia",
"AT":"Austria",
"AZ":"Azerbaijan",
"BS":"Bahamas",
"BH":"Bahrain",
"BD":"Bangladesh",
"BB":"Barbados",
"BY":"Belarus",
"BE":"Belgium",
"BZ":"Belize",
"BJ":"Benin",
"BM":"Bermuda",
"BT":"Bhutan",
"BO":"Bolivia",
"BA":"Bosnia and Herzegovina",
"BW":"Botswana",
"BV":"Bouvet Island",
"BR":"Brazil",
"IO":"British Indian Ocean Territory",
"BN":"Brunei Darussalam",
"BG":"Bulgaria",
"BF":"Burkina Faso",
"BI":"Burundi",
"KH":"Cambodia",
"CM":"Cameroon",
"CA":"Canada",
"CV":"Cape Verde",
"KY":"Cayman Islands",
"CF":"Central African Republic",
"TD":"Chad",
"CL":"Chile",
"CN":"China",
"CX":"Christmas Island",
"CC":"Cocos (Keeling) Islands",
"CO":"Colombia",
"KM":"Comoros",
"CG":"Congo",
"CD":"Congo, The Democratic Republic of the",
"CK":"Cook Islands",
"CR":"Costa Rica",
"CI":"Cote D'Ivoire",
"HR":"Croatia",
"CU":"Cuba",
"CY":"Cyprus",
"CZ":"Czech Republic",
"DK":"Denmark",
"DJ":"Djibouti",
"DM":"Dominica",
"DO":"Dominican Republic",
"EC":"Ecuador",
"EG":"Egypt",
"SV":"El Salvador",
"GQ":"Equatorial Guinea",
"ER":"Eritrea",
"EE":"Estonia",
"ET":"Ethiopia",
"FK":"Falkland Islands (Malvinas)",
"FO":"Faroe Islands",
"FJ":"Fiji",
"FI":"Finland",
"FR":"France",
"GF":"French Guiana",
"PF":"French Polynesia",
"TF":"French Southern Territories",
"GA":"Gabon",
"GM":"Gambia",
"GE":"Georgia",
"DE":"Germany",
"GH":"Ghana",
"GI":"Gibraltar",
"GR":"Greece",
"GL":"Greenland",
"GD":"Grenada",
"GP":"Guadeloupe",
"GU":"Guam",
"GT":"Guatemala",
"GG":"Guernsey",
"GN":"Guinea",
"GW":"Guinea-Bissau",
"GY":"Guyana",
"HT":"Haiti",
"HM":"Heard Island and Mcdonald Islands",
"VA":"Holy See (Vatican City State)",
"HN":"Honduras",
"HK":"Hong Kong",
"HU":"Hungary",
"IS":"Iceland",
"IN":"India",
"ID":"Indonesia",
"IR":"Iran, Islamic Republic Of",
"IQ":"Iraq",
"IE":"Ireland",
"IM":"Isle of Man",
"IL":"Israel",
"IT":"Italy",
"JM":"Jamaica",
"JP":"Japan",
"JE":"Jersey",
"JO":"Jordan",
"KZ":"Kazakhstan",
"KE":"Kenya",
"KI":"Kiribati",
"KP":"Korea, Democratic People'S Republic of",
"KR":"Korea, Republic of",
"KW":"Kuwait",
"KG":"Kyrgyzstan",
"LA":"Lao People'S Democratic Republic",
"LV":"Latvia",
"LB":"Lebanon",
"LS":"Lesotho",
"LR":"Liberia",
"LY":"Libyan Arab Jamahiriya",
"LI":"Liechtenstein",
"LT":"Lithuania",
"LU":"Luxembourg",
"MO":"Macao",
"MK":"Macedonia, The Former Yugoslav Republic of",
"MG":"Madagascar",
"MW":"Malawi",
"MY":"Malaysia",
"MV":"Maldives",
"ML":"Mali",
"MT":"Malta",
"MH":"Marshall Islands",
"MQ":"Martinique",
"MR":"Mauritania",
"MU":"Mauritius",
"YT":"Mayotte",
"MX":"Mexico",
"FM":"Micronesia, Federated States of",
"MD":"Moldova, Republic of",
"MC":"Monaco",
"MN":"Mongolia",
"MS":"Montserrat",
"MA":"Morocco",
"MZ":"Mozambique",
"MM":"Myanmar",
"NA":"Namibia",
"NR":"Nauru",
"NP":"Nepal",
"NL":"Netherlands",
"AN":"Netherlands Antilles",
"NC":"New Caledonia",
"NZ":"New Zealand",
"NI":"Nicaragua",
"NE":"Niger",
"NG":"Nigeria",
"NU":"Niue",
"NF":"Norfolk Island",
"MP":"Northern Mariana Islands",
"NO":"Norway",
"OM":"Oman",
"PK":"Pakistan",
"PW":"Palau",
"PS":"Palestinian Territory, Occupied",
"PA":"Panama",
"PG":"Papua New Guinea",
"PY":"Paraguay",
"PE":"Peru",
"PH":"Philippines",
"PN":"Pitcairn",
"PL":"Poland",
"PT":"Portugal",
"PR":"Puerto Rico",
"QA":"Qatar",
"RE":"Reunion",
"RO":"Romania",
"RU":"Russian Federation",
"RW":"RWANDA",
"SH":"Saint Helena",
"KN":"Saint Kitts and Nevis",
"LC":"Saint Lucia",
"PM":"Saint Pierre and Miquelon",
"VC":"Saint Vincent and the Grenadines",
"WS":"Samoa",
"SM":"San Marino",
"ST":"Sao Tome and Principe",
"SA":"Saudi Arabia",
"SN":"Senegal",
"CS":"Serbia and Montenegro",
"SC":"Seychelles",
"SL":"Sierra Leone",
"SG":"Singapore",
"SK":"Slovakia",
"SI":"Slovenia",
"SB":"Solomon Islands",
"SO":"Somalia",
"ZA":"South Africa",
"GS":"South Georgia and the South Sandwich Islands",
"ES":"Spain",
"LK":"Sri Lanka",
"SD":"Sudan",
"SR":"Suriname",
"SJ":"Svalbard and Jan Mayen",
"SZ":"Swaziland",
"SE":"Sweden",
"CH":"Switzerland",
"SY":"Syrian Arab Republic",
"TW":"Taiwan, Province of China",
"TJ":"Tajikistan",
"TZ":"Tanzania, United Republic of",
"TH":"Thailand",
"TL":"Timor-Leste",
"TG":"Togo",
"TK":"Tokelau",
"TO":"Tonga",
"TT":"Trinidad and Tobago",
"TN":"Tunisia",
"TR":"Turkey",
"TM":"Turkmenistan",
"TC":"Turks and Caicos Islands",
"TV":"Tuvalu",
"UG":"Uganda",
"UA":"Ukraine",
"AE":"United Arab Emirates",
"GB":"United Kingdom",
"US":"United States",
"UM":"United States Minor Outlying Islands",
"UY":"Uruguay",
"UZ":"Uzbekistan",
"VU":"Vanuatu",
"VE":"Venezuela",
"VN":"Viet Nam",
"VG":"Virgin Islands, British",
"VI":"Virgin Islands, U.S.",
"WF":"Wallis and Futuna",
"EH":"Western Sahara",
"YE":"Yemen",
"ZM":"Zambia",
"ZW":"Zimbabwe"
};