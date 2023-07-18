$(document).ready(function(){
		
	if($('.edit_contr_cont')[0]){
		
		if(_item_det.content){	
			var _tempt_content=$('<div>'+_item_det.content+'</div>');
			if(_tempt_content.find('.content_row').length>0){
				_tempt_content.find('.content_row').each(function(){
					var _ed_etm=this;
					if($(_ed_etm).attr('data-type')){
						var _ind=parseInt($(this).attr('data-type'));
						var _iit=$(_edit_templater[_ind]);
						if(_ind==0){
							_iit.find('.edit_img').attr('data-src',$(_ed_etm).find('img').attr('src'));
							_iit.find('.edit_img').css('background-image','url('+$(_ed_etm).find('img').attr('src')+')');
							if($(_ed_etm).find('.content_caption').length>0) _iit.find('.edit_img_caption').html($(_ed_etm).find('.content_caption').html());
						} else if(_ind==1){		
							$(_iit.find('.edit_img')[0]).attr('data-src', $($(_ed_etm).find('img')[0]).attr('src'));
							$(_iit.find('.edit_img')[0]).css('background-image','url('+$($(_ed_etm).find('img')[0]).attr('src')+')');	
							if($(_ed_etm).find('.edit_ittm_part1').find('.content_caption').length>0) $(_iit.find('.edit_img_caption')[0]).html($(_ed_etm).find('.edit_ittm_part1').find('.content_caption').html());
							$(_iit.find('.edit_img')[1]).attr('data-src', $($(_ed_etm).find('img')[1]).attr('src'));
							$(_iit.find('.edit_img')[1]).css('background-image','url('+$($(_ed_etm).find('img')[1]).attr('src')+')');	
							if($(_ed_etm).find('.edit_ittm_part2').find('.content_caption').length>0) $(_iit.find('.edit_img_caption')[1]).html($(_ed_etm).find('.edit_ittm_part2').find('.content_caption').html());		
						} else if(_ind==2 || _ind==3){
							_iit.find('.edit_img').attr('data-src', $(_ed_etm).find('img').attr('src'));
							_iit.find('.edit_img').css('background-image','url('+$(_ed_etm).find('img').attr('src')+')');
							_iit.find('.edit_text').html($(_ed_etm).find('.content_wrap').html());
							if($(_ed_etm).find('.content_caption').length>0) _iit.find('.edit_img_caption').html($(_ed_etm).find('.content_caption').html());
						} else if(_ind==4){
							_iit.find('.edit_text').html($(_ed_etm).html());
						} else if(_ind==5){
							$(_iit.find('.edit_text')[0]).html($($(_ed_etm).find('.content_wrap')[0]).html());
							$(_iit.find('.edit_text')[1]).html($($(_ed_etm).find('.content_wrap')[1]).html());
						} else if(_ind==6){
							_iit.find('.edit_video').attr('data-src', $(_ed_etm).find('iframe').attr('src'));
							_iit.find('.edit_video').html('<iframe class="edit_video_iframe"  src="'+$(_ed_etm).find('iframe').attr('src')+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
							if($(_ed_etm).find('.content_caption').length>0) _iit.find('.edit_img_caption').html($(_ed_etm).find('.content_caption').html());
						} else if(_ind==7){
							_iit.find('.edit_videof').attr('data-src1', $($(_ed_etm).find('source')[0]).attr('src'));
							_iit.find('.edit_videof').attr('data-src2', ($(_ed_etm).find('source').length>1 ? $($(_ed_etm).find('source')[1]).attr('src') : ""));
							_iit.find('.edit_videof').html('<video  class="edit_video_file" muted=""><source src="'+$($(_ed_etm).find('source')[0]).attr('src')+'" type="video/mp4">'+($(_ed_etm).find('source').length>1 ? '<source src="'+$($(_ed_etm).find('source')[1]).attr('src')+'" type="video/ogg">' : "")+'</video>');
							if($(_ed_etm).find('.content_caption').length>0) _iit.find('.edit_img_caption').html($(_ed_etm).find('.content_caption').html());
						} else if(_ind==8){
							var _all_slides=$(_iit.find('.edit_slideshow_content')[0]);
							_all_slides.empty();
							$(_ed_etm).find('.content_slideshow_itm').each(function(){						
								_all_slides.append('<img class="slideshow_itm" src="'+$(this).attr('data-src')+'" alt="" />');
							});		
						}
						
						
						$("#edit_contr_items_list").append(_iit);
					}
				});
			}
		}
	
		
		$(".edit_templ").draggable({
			connectToSortable: "#edit_contr_items_list", 
			helper: "clone",
			revert: "invalid"
		});
	
		$("#edit_contr_items_list").droppable({
			drop: function(event, ui) {
				AddItemLoList(ui.draggable);
			}
		}).sortable({
			placeholder         : 'edit_item_empty',
			forcePlaceholderSize: true,
			zIndex              : 999999
		});
		
		$("#prtext1").trumbowyg({
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
		$("#prtext2").trumbowyg({
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
		
		
		$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
		
		$("#slideshow_list").sortable({
			placeholder         : $(".slide_itm").data('placeholder'),
			connectWith         : $(".slide_itm").data('connect'),
			handle              : '',
			forcePlaceholderSize: true,
			zIndex              : 999999
		});
	}
	
	

	
	$('body').on('click', '.btn-remove-edit-item', function(evt) {
		event.preventDefault();	
		_rthis=this;
		Edit_confirm(function(){
			$(_rthis).parent().parent().remove();	
			$("#edit_contr_items_list").sortable('refresh');
		});
		return false;
	});
	
	$("body").on('click', '.slide_remove', function(event) {
		event.preventDefault();	
		$(this).parent().remove();
		return false;
	});
		
	$("body").on('click', '.btn_add_slide', function(event) {
		event.preventDefault();	
		var _id=$('.slide_itm').length;
		while($('#slideitm'+_id)[0]){
			_id++;
		}
		$('#slideshow_list').append('<div class="slide_itm"><div class="slide_itm_wrap"><button type="button" class="media_btn btn  btn-info btn-xs" ><i class="fa  fa-image"></i></button><div class="selected_media_itm" style="display:none"   data-src="" data-type="image"  id="slideitm'+_id+'"><a class="media_itm_link lightbox  btn btn-warning btn-flat" id="i'+_id+'" href="#" target="_blank" title=""><i class="fa  fa-eye"></i></a><button type="button" class="btn-selectedmediaremove  btn btn-danger btn-flat"><i class="fa fa-trash"></i></button></div></div><button type="button" class="slide_remove  btn  btn-danger btn-xs"><i class="fa fa-times"></i></button></div>');
		return false;
	});	
	
	
	$("body").on('click', '.btn-edit-edit-item', function(event) {
		event.preventDefault();	
		_edit_now_rdit=$(this).parent().parent();
	   var _ind=parseInt(_edit_now_rdit.attr('data-type'));
	   	$('.editor_img1').hide();
		$('.editor_img2').hide();
		$('.editor_text1').hide();
		$('.editor_text2').hide();
		$('.edit_ttpls').hide();
		$('.editor_video').hide();
		$('.editor_videof').hide();
		$('.editor_slideshow').hide();


		$('#primg1').val('');
		$('#primg1').attr('data-src','');
		$('#primg1').hide();
		$('#primg1').parent().find('.media_btn').show();
		
		$('#primg2').val('');
		$('#primg2').attr('data-src','');
		$('#primg2').hide();
		$('#primg2').parent().find('.media_btn').show();
		
		$('#prvideof1').val('');
		$('#prvideof1').attr('data-src','');
		$('#prvideof1').hide();
		$('#prvideof1').parent().find('.media_btn').show();
		
		$('#prvideof2').val('');
		$('#prvideof2').attr('data-src','');
		$('#prvideof2').hide();
		$('#prvideof2').parent().find('.media_btn').show();
		
		$('#prcaption1').val('');
		$('#prcaption2').val('');
		$('#prvideo').val('');
		$('#prvideocaption').val('');
		$("#prtext1").trumbowyg('empty');
		$("#prtext2").trumbowyg('empty');
		$('#prvideofcaption').val('');
		$('.edit_ttpls'+(_ind+1)).show();
		
		if(_ind==0){
			$('.editor_img1').show();
			var _srcc1= _edit_now_rdit.find('.edit_img').attr('data-src');
			if(_srcc1!=""){
				$('#primg1').attr('data-src',_srcc1);
				$('#primg1').css('background-image','url('+_srcc1+')');
				$('#primg1').find('.media_itm_link').attr('href', _srcc1);
				$('#primg1').parent().find('.media_btn').hide();
				$('#primg1').show();
			}	
			$('#prcaption1').val(_edit_now_rdit.find('.edit_img_caption').html());
		} else if(_ind==1){
			$('.editor_img1').show();
			$('.editor_img2').show();
			var _srcc1= $(_edit_now_rdit.find('.edit_img')[0]).attr('data-src');
			var _srcc2= $(_edit_now_rdit.find('.edit_img')[1]).attr('data-src');
			if(_srcc1!=""){
				$('#primg1').attr('data-src',_srcc1);
				$('#primg1').css('background-image','url('+_srcc1+')');
				$('#primg1').find('.media_itm_link').attr('href', _srcc1);
				$('#primg1').parent().find('.media_btn').hide();
				$('#primg1').show();
			}	
			if(_srcc2!=""){
				$('#primg2').attr('data-src',_srcc2);
				$('#primg2').css('background-image','url('+_srcc2+')');
				$('#primg2').find('.media_itm_link').attr('href', _srcc2);
				$('#primg2').parent().find('.media_btn').hide();
				$('#primg2').show();
			}	
			$('#prcaption1').val($(_edit_now_rdit.find('.edit_img_caption')[0]).html());
			$('#prcaption2').val($(_edit_now_rdit.find('.edit_img_caption')[1]).html());
		} else if(_ind==2 || _ind==3){
			$('.editor_img1').show();
			$('.editor_text1').show();
			var _srcc1= _edit_now_rdit.find('.edit_img').attr('data-src');
			if(_srcc1!=""){
				$('#primg1').attr('data-src',_srcc1);
				$('#primg1').css('background-image','url('+_srcc1+')');
				$('#primg1').find('.media_itm_link').attr('href', _srcc1);
				$('#primg1').parent().find('.media_btn').hide();
				$('#primg1').show();
			}
			$("#prtext1").trumbowyg('html', _edit_now_rdit.find('.edit_text').html());
			$('#prcaption1').val(_edit_now_rdit.find('.edit_img_caption').html());
		} else if(_ind==4){
			$('.editor_text1').show();
			$("#prtext1").trumbowyg('html', _edit_now_rdit.find('.edit_text').html());
		} else if(_ind==5){
			$('.editor_text1').show();
			$('.editor_text2').show();
			$("#prtext1").trumbowyg('html', $(_edit_now_rdit.find('.edit_text')[0]).html());
			$("#prtext2").trumbowyg('html', $(_edit_now_rdit.find('.edit_text')[1]).html());
		} else if(_ind==6){
			$('.editor_video').show();
			$('#prvideo').val(_edit_now_rdit.find('.edit_video').attr('data-src'));
			$('#prvideocaption').val(_edit_now_rdit.find('.edit_img_caption').html());
		} else if(_ind==7){
			$('.editor_videof').show();
			var _srcc1=_edit_now_rdit.find('.edit_videof').attr('data-src1');
			var _srcc2=_edit_now_rdit.find('.edit_videof').attr('data-src2');
			if(_srcc1!=""){
				$('#prvideof1').attr('data-src', _srcc1);
				$('#prvideof1').css('background-image','url('+(_file_typs['video'])+')');
				$('#prvideof1').find('.media_itm_link').attr('href', _srcc1);
				$('#prvideof1').parent().find('.media_btn').hide();
				$('#prvideof1').show();
			}
			if(_srcc2!=""){
				$('#prvideof2').attr('data-src', _srcc2);
				$('#prvideof2').css('background-image','url('+(_file_typs['video'])+')');
				$('#prvideof2').find('.media_itm_link').attr('href', _srcc2);
				$('#prvideof2').parent().find('.media_btn').hide();
				$('#prvideof2').show();
			}
			$('#prvideofcaption').val(_edit_now_rdit.find('.edit_img_caption').html());
		} else if(_ind==8){
			$('.editor_slideshow').show();
			$('#slideshow_list').empty();
			var _i=0;
			_edit_now_rdit.find('.slideshow_itm').each(function(){
				$('#slideshow_list').append('<div class="slide_itm"><div class="slide_itm_wrap"><button type="button" class="media_btn btn  btn-info btn-xs" style="display:none"><i class="fa fa-image"></i></button><div class="selected_media_itm"   style="background-image:url('+$(this).attr('src')+')" data-src="'+$(this).attr('src')+'" data-type="image"  id="slideitm'+_i+'"><a class="media_itm_link lightbox  btn btn-warning btn-flat" id="i'+_i+'" href="#" target="_blank" title=""><i class="fa  fa-eye"></i></a><button type="button" class="btn-selectedmediaremove  btn btn-danger btn-flat"><i class="fa fa-trash"></i></button></div></div><button type="button" class="slide_remove  btn  btn-danger btn-xs"><i class="fa fa-times"></i></button></div>');
				_i++;
			});
	    }
		
		$('#edit_content_elements').modal('show'); 
	});
	
	
	
	$('body').on('click', '#edit_save', function(evt) {
		event.preventDefault();	
	    var _ind=parseInt(_edit_now_rdit.attr('data-type'));
		if(_ind==0){
			_edit_now_rdit.find('.edit_img').attr('data-src', $('#primg1').attr('data-src'));
			_edit_now_rdit.find('.edit_img').css('background-image','url('+$('#primg1').attr('data-src')+')');
			_edit_now_rdit.find('.edit_img_caption').html($('#prcaption1').val());
		} else if(_ind==1){
			$(_edit_now_rdit.find('.edit_img')[0]).attr('data-src', $('#primg1').attr('data-src'));
			$(_edit_now_rdit.find('.edit_img')[0]).css('background-image','url('+$('#primg1').attr('data-src')+')');
			$(_edit_now_rdit.find('.edit_img_caption')[0]).html($('#prcaption1').val());
			$(_edit_now_rdit.find('.edit_img')[1]).attr('data-src', $('#primg2').attr('data-src'));
			$(_edit_now_rdit.find('.edit_img')[1]).css('background-image','url('+$('#primg2').attr('data-src')+')');
			$(_edit_now_rdit.find('.edit_img_caption')[1]).html($('#prcaption2').val());
		} else if(_ind==2 || _ind==3){
			_edit_now_rdit.find('.edit_img').attr('data-src', $('#primg1').attr('data-src'));
			_edit_now_rdit.find('.edit_img').css('background-image','url('+$('#primg1').attr('data-src')+')');
			_edit_now_rdit.find('.edit_img_caption').html($('#prcaption1').val());
			_edit_now_rdit.find('.edit_text').html($('#prtext1').trumbowyg('html'));
		} else if(_ind==4){
			_edit_now_rdit.find('.edit_text').html($('#prtext1').trumbowyg('html'));
		} else if(_ind==5){
			$(_edit_now_rdit.find('.edit_text')[0]).html($('#prtext1').trumbowyg('html'));
			$(_edit_now_rdit.find('.edit_text')[1]).html($('#prtext2').trumbowyg('html'));
		} else if(_ind==6){
			_edit_now_rdit.find('.edit_video').attr('data-src', $('#prvideo').val());
			_edit_now_rdit.find('.edit_video').html('<iframe class="edit_video_iframe"  src="'+$('#prvideo').val()+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
			_edit_now_rdit.find('.edit_img_caption').html($('#prvideocaption').val());
		} else if(_ind==7){
			_edit_now_rdit.find('.edit_videof').attr('data-src1', $('#prvideof1').attr('data-src'));
			_edit_now_rdit.find('.edit_videof').attr('data-src2', $('#prvideof2').attr('data-src'));
			_edit_now_rdit.find('.edit_videof').html('<video  controls loop autoplay muted="" class="edit_video_file" >'+($('#prvideof1').attr('data-src').trim().length>4 ? '<source src="'+$('#prvideof1').attr('data-src').trim()+'" type="video/mp4">' : "")+($('#prvideof2').attr('data-src').trim().length>4 ? '<source src="'+$('#prvideof2').attr('data-src').trim()+'" type="video/ogg">' : "")+'</video>');
			_edit_now_rdit.find('.edit_img_caption').html($('#prvideofcaption').val());
		} else if(_ind==8){
			var _all_slides=$(_edit_now_rdit.find('.edit_slideshow_content')[0]);
			_all_slides.empty();
			$('.slide_itm').each(function(){
				if($(this).find('.selected_media_itm').attr('data-src')!=""){
					_all_slides.append('<img class="slideshow_itm" src="'+$(this).find('.selected_media_itm').attr('data-src')+'" alt="" />');
				}
			});
		}
		return false;
	});
	
	
	
});


function AddItemLoList(_item){
	if(_item.hasClass('edit_templ') && $('.edit_item_empty')[0] && !$('.edit_item_empty').hasClass('loaded')){
		var _id=parseInt(_item.attr('data-type'));
		$('.edit_item_empty').after(_edit_templater[_id]);
		$('.edit_item_empty').addClass('loaded');
		$("#edit_contr_items_list").sortable('refresh');
		_item.remove();
	}
}



var _edit_now_rdit;
var _edit_templater=[
	'<div class="edit_ittm" data-type="0"><div class="edit_img" data-src=""></div><div class="edit_img_caption"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item"><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="1"><div class="edit_ittm_part1"><div class="edit_img" data-src=""></div><div class="edit_img_caption"></div></div><div class="edit_ittm_part2"><div class="edit_img" data-src=""></div><div class="edit_img_caption"></div></div><div class="edit_ittm_clbth"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="2"><div class="edit_ittm_part1"><div class="edit_img" data-src=""></div><div class="edit_img_caption"></div></div><div class="edit_ittm_part2"><div class="edit_text">Text 1</div></div><div class="edit_ittm_clbth"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="3"><div class="edit_ittm_part1"><div class="edit_text">Text 1</div></div><div class="edit_ittm_part2"><div class="edit_img" data-src=""></div><div class="edit_img_caption"></div></div><div class="edit_ittm_clbth"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="4"><div class="edit_text">Text 1</div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="5"><div class="edit_ittm_part1"><div class="edit_text">Text 1</div></div><div class="edit_ittm_part2"><div class="edit_text">Text 2</div></div><div class="edit_ittm_clbth"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="6"><div class="edit_video" data-src=""></div><div class="edit_img_caption"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="7"><div class="edit_videof" data-src1="" data-src2=""></div><div class="edit_img_caption"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="8"><div class="edit_slideshow_content"><div class="edit_slideshow"></div></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>'
];


function Edit_confirm(callback) {
	var confirmModal;	
	if(!$('#modalc_danger')[0]){
		$('body').append('<div id="modalc_danger" style="display:none;"></div>');

		confirmModal = $('<div class="modal fade modal-danger" id="modal_danger">' + 
							'<div class="modal-dialog">' + 
								'<div class="modal-content">' + 
									'<div class="modal-header">' + 
										'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
										'<div class="modal-title">Confirm Delete</div>' + 
									'</div>' + 
									'<div class="modal-body"><p class="modal-body-p">Please confirm that You wish to delete.</p></div>' + 
									'<div class="modal-footer">' + 
										'<button type="button" class="btn btn-outline pull-left" data-dismiss="modal">Cancel</button>' + 
										'<button type="button" class="btn btn-outline okButton" >Delete</button>' + 
									'</div>' + 
								'</div>' + 
							'</div>' + 
						'</div>');
	} else {
		confirmModal=$('#modal_danger');
	}

	confirmModal.find('.okButton').click(function(event) {
		callback();
		confirmModal.modal('hide');
	});			
	confirmModal.modal('show'); 
};