$(document).ready(function(){
		
	if($('.edit_contr_cont')[0]){
		
		if(_item_det.content){	
			if(Object.keys(_item_det.content).length !== 0) {	
				for (var key in _item_det.content) {
					var _tempt_content=$('<div>'+_item_det.content[key]+'</div>');
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
									_iit.find('.edit_text').html($(_ed_etm).html());
								} 		
								$("#edit_contr_items_list"+key).append(_iit);
							}
						});
					}
				}
			}	
		}
	
		$('.edit_contr_items_list').each(function(){
			var _lang=$(this).attr('data-lang');
			$(".edit_templ"+_lang).draggable({
				connectToSortable: "#edit_contr_items_list"+_lang, 
				helper: "clone",
				revert: "invalid"
			});
			
			$("#edit_contr_items_list"+_lang).droppable({
				drop: function(event, ui) {
					AddItemLoList(ui.draggable);
				}
			}).sortable({
				placeholder         : 'edit_item_empty',
				forcePlaceholderSize: true,
				zIndex              : 999999
			});	
		});
	

		
		$("#prtext1").trumbowyg({
			 btns: [
				['viewHTML'],
				['undo', 'redo'],
				['strong', 'em', 'del'],
				['formatting','blockquote'],
				['link'],
				['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
				['unorderedList'],
				['removeformat'],
				['fullscreen']
			],
			removeformatPasted: true
		});

	
		$('.wait_overlay').css({'visibility':'hidden','opacity':'0'});
		
	}
	
	

	
	$('body').on('click', '.btn-remove-edit-item', function(evt) {
		event.preventDefault();	
		_rthis=this;
		Edit_confirm(function(){
			$(_rthis).parent().parent().remove();
			$('.edit_contr_items_list').each(function(){
				var _lang=$(this).attr('data-lang');
				$("#edit_contr_items_list"+_lang).sortable('refresh');
			});	
		});
		return false;
	});
	


	
	$("body").on('click', '.btn-edit-edit-item', function(event) {
		event.preventDefault();	
		_edit_now_rdit=$(this).parent().parent();
	   var _ind=parseInt(_edit_now_rdit.attr('data-type'));
	   	$('.editor_img1').hide();
		$('.editor_text1').hide();
		$('.edit_ttpls').hide();


		$('#primg1').val('');
		$('#primg1').attr('data-src','');
		$('#primg1').hide();
		$('#primg1').parent().find('.media_btn').show();

		$('#prcaption1').val('');
		$('#prcaption2').val('');
		$("#prtext1").trumbowyg('empty');

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
			$('.editor_text1').show();
			$("#prtext1").trumbowyg('html', _edit_now_rdit.find('.edit_text').html());
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
			_edit_now_rdit.find('.edit_text').html($('#prtext1').trumbowyg('html'));
		}
		return false;
	});
	
	
	
});


function AddItemLoList(_item){
	if(_item.hasClass('edit_templ') && $('.edit_item_empty')[0] && !$('.edit_item_empty').hasClass('loaded')){
		var _id=parseInt(_item.attr('data-type'));
		$('.edit_item_empty').after(_edit_templater[_id]);
		$('.edit_item_empty').addClass('loaded');
		$('.edit_contr_items_list').each(function(){
			var _lang=$(this).attr('data-lang');
			$("#edit_contr_items_list"+_lang).sortable('refresh');
		});	
		_item.remove();
	}
}



var _edit_now_rdit;
var _edit_templater=[
	'<div class="edit_ittm" data-type="0"><div class="edit_img" data-src=""></div><div class="edit_img_caption"></div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item"><i class="fa fa-edit"></i></button></div></div>',
	'<div class="edit_ittm" data-type="1"><div class="edit_text">Text</div><div class="edit_btns"><button  type="button"  class="btn  btn-danger btn-xs btn-remove-edit-item" ><i class="fa fa-trash-o"></i></button><button  type="button"  class="btn  btn-success btn-xs btn-edit-edit-item" ><i class="fa fa-edit"></i></button></div></div>',
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