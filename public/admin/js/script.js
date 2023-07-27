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

var _file_typs={"video": "/admin/img/videof.png",  "audio": "/admin/img/audio.png"};



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
			xhr.open('post', '/gallery', true);
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
				xhr.open('delete', '/gallery', true);
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
				PostRec('/deleteuser',{id:_rid}, function(_err, __data){
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
			PostRec('/saveuser',_data, function(_err, __data){
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
	
	
///////////////////////////OPTIONS//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$('body').on('click', '.btn-deleteoption', function(event) {
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
				PostRec('/deleteoption',{id:_rid}, function(_err, __data){
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
///////////////////////////OPTION//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	if($('#prlanguage_code')[0]){	
		if(_option.language_code) document.getElementById('prlanguage_code').value=_option.language_code;
	}
	
	$('body').on('click', '.btn-saveoption', function(evt) {
		evt.preventDefault();
		var _this=$(this);
		var _data={};
		_data['id']=$('#prid').val();
		_data['language_code']=$('#prlanguage_code').val();
		_data['language_title']=$('#prlanguage_title').val();
		_data['ord']=$('#prord').val();
		_data["translations"]={};
		
		if($('.prtxt')[0]){
			$('.prtxt').each(function(){
				 _data["translations"][$(this).attr('data-id')]=$(this).val();
			});
		}	
		
		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/saveoption',_data, function(_err, __data){
			if(__data.status){
				location.href=_this.attr('data-href');
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
		var _rid=$(this).attr('data-id');
		if($('#modal_danger')[0]) $('#modal_danger').attr('data-id', _rid);
		confirm('danger',heading, question, cancelButtonTxt, okButtonTxt, _rid,  function(){
			if($('#modal_danger').attr('data-id')==_rid){	
				$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
				PostRec('/deleteitem',{id:_rid}, function(_err, __data){
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
///////////////////////////ITEM//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	if($('#prpublished')[0]){	
		_item_det.published=_item_det.published || "";
		$('#prpublished').datetimepicker({
			format: "YYYY-MM-DD HH:mm",
			ignoreReadonly:true,
			defaultDate: (_item_det.published!="" ? new Date(_item_det.published) : new Date())
		});		
	}

	
	
	
	$('body').on('click', '.btn-saveitem', function(evt) {
		evt.preventDefault();
		var _this=$(this);
		var _data={};
		_data["active"]=($('#practive')[0] ? ($('#practive').prop('checked') ? 1 : 0 ) : 1);
		_data['id']=$('#prid').val();
		_data['category']=$('#prcategory').val();
		
		if($('#prposter')[0]) {
			if($('#prposter').attr('data-src')!="") _data['poster']=$('#prposter').attr('data-src');
		}
		
		if($('#prslug')[0]) _data['slug']=($('#prslug').val()!="" ? $('#prslug').val() : (new Date().getTime()).toString());
		if($('#prord')[0])  _data['ord']=$('#prord').val();
		if($('#prpublished')[0]) _data["published"]=$('#prpublished').data("DateTimePicker").date()._d.toUTCString();
		
		_data['title']={};
		_data['audio']={};
		_data['video']={};
		_data['text']={};
		_data['content']={};
		

		if($('.prtitle')[0]){
			$('.prtitle').each(function(){
				_data['title'][$(this).attr('data-lang')]=$(this).val();
			});
		}
		
		if($('.prtranscript')[0]){
			$('.prtranscript').each(function(){
				_data['text'][$(this).attr('data-lang')]=$(this).val();
			});
		}
		
		if($('.praudio')[0]){
			$('.praudio').each(function(){
				if($(this).attr('data-src')!="") _data['audio'][$(this).attr('data-lang')]=$(this).attr('data-src');
			});
		}
		
		if($('.prvideo')[0]){
			$('.prvideo').each(function(){
				if($(this).attr('data-src')!="") _data['video'][$(this).attr('data-lang')]=$(this).attr('data-src');
			});
		}
		
		if($('.edit_contr_items_list')[0]){
			$('.edit_contr_items_list').each(function(){	
				if($(this).find('.edit_ittm')[0]){	
					var  _ttmp_cont=$('<div></div>');
					$(this).find('.edit_ittm').each(function(){
						if($(this).attr('data-type')){
							var _ind=parseInt($(this).attr('data-type'));
							var _iit=$('<div class="content_row" data-type="'+_ind+'"></div>');
							if(_ind==0){
								_iit.addClass('content_single_image');
								_iit.append('<div class="img_wrpr"><img src="'+$(this).find('.edit_img').attr('data-src')+'" alt=""  /></div>');
								if($(this).find('.edit_img_caption').html().length>0) _iit.append('<div class="content_caption">'+$(this).find('.edit_img_caption').html()+'</div>');
							} else if(_ind==1){
								_iit.addClass('content_single_text');
								_iit.append($(this).find('.edit_text').html());
							}
							_ttmp_cont.append(_iit);
						}
					});	
					if(!_data["content"][$(this).attr('data-lang')]) _data["content"][$(this).attr('data-lang')]={};
					_data["content"][$(this).attr('data-lang')]["content"]=_ttmp_cont.html();
				}
			});	
		}
		
		
		if($('.prtxt')[0]){
			$('.prtxt').each(function(){
				if(!_data["content"][$(this).attr('data-lang')]) _data["content"][$(this).attr('data-lang')]={};
				 _data["content"][$(this).attr('data-lang')][$(this).attr('data-id')]=$(this).val();
			});
		}	
		
		
		if($('.p-globalpage')[0]){
			_data['slug']=$('#prslug').val();
			if($('.primage0')[0]){
				$('.primage0').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image0=$(this).attr('data-src');
				});
			}	
			if($('.primage1')[0]){
				$('.primage1').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image1=$(this).attr('data-src');
				});
			}	
			if($('.primage2')[0]){
				$('.primage2').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image2=$(this).attr('data-src');
				});
			}	
			if($('.primage3')[0]){
				$('.primage3').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image3=$(this).attr('data-src');
				});
			}	
			if($('.primage4')[0]){
				$('.primage4').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image4=$(this).attr('data-src');
				});
			}	
			if($('.primage5')[0]){
				$('.primage5').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image5=$(this).attr('data-src');
				});
			}	
			if($('.primage6')[0]){
				$('.primage6').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image6=$(this).attr('data-src');
				});
			}	
			if($('.primage7')[0]){
				$('.primage7').each(function(){
					if($(this).attr('data-src')!="") _data["content"][$(this).attr('data-lang')].image7=$(this).attr('data-src');
				});
			}	
		}
		
		
		
		$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
		PostRec('/saveitem',_data, function(_err, __data){
			if(__data.status){
				if(_this.hasClass('andexit')) {
					location.href=_this.attr('data-href');
				} else {
					$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
				}
			} else {	
				$('.wait_overlay').css({'visibility':'visible','opacity':'1'});
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
var _validFileExtensions = [".jpg",".jpeg",".png",".svg",".gif",".mp4",".ogv",".mp3"];    
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
	
	PostRec('/getgallery',{page: _page}, function(_err, __data){
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

