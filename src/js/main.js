$(document).ready(function() {
	$('input[name="customer_type"]').on('change', function(e){
		var toggle_field = $(this).data('show');
		$('.hide').toggleClass('hide');
		$('.' + toggle_field).toggleClass('hide');
	});
	$('[data-field-type="datepicker"]').datepicker({
		minDate: 0 
	});
});