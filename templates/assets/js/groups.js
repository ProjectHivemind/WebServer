(function($) {

  var row_to_remove = ''; //global variable
    
  $(document).on('shown.bs.modal', '#delete-group-modal', function (event) {
    row_to_remove = $(event.relatedTarget);
  });

  $('#delete-group-confirm').click(function() {
    // send request to server here
    row_to_remove.parents("tr").remove();
    $('#delete-group-modal').modal('toggle');
  });

})(jQuery); // End of use strict
