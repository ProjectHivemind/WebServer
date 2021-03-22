(function ($) {

  var row_to_remove = ''; //global variable
  var group_info = ''; //global variable
  var loaded_implants = false;

  $(document).on('shown.bs.modal', '#delete-group-modal', function (event) {
    row_to_remove = $(event.relatedTarget);
  });

  $(document).on('shown.bs.modal', '#add-group-modal', function (event) {
    if (!loaded_implants) {
      loaded_implants = true;

    }
  });

  $('#create-group-table tbody').on('click', 'tr', function () {
    $(this).toggleClass('active');
  });

  $('#create-group-confirm').click(function () {
    // alert($('#create-group-table').DataTable().rows('.active').data().length + ' row(s) selected');
    var selected = $('#create-group-table').DataTable().rows('.active').data();
    console.log(selected);
    if (!$('#group-name-input').val()) {
      $('#no-group-name-alert').show();
      setTimeout(function () { $('#no-group-name-alert').hide(); }, 4000);
      return;
    }

    if (selected.length == 0) {
      $('#no-implants-selected-alert').show();
      setTimeout(function () { $('#no-implants-selected-alert').hide(); }, 4000);
      return;
    }

    var request = {
      uuid: '',
      groupname: $('#group-name-input').val(),
      implants: []
    }
    implants_uuid = []
    for(var i = 0; i < selected.length; i++){
      console.log(selected[i].implant.uuid);
      request.implants.push(selected[i].implant.uuid);
    }

    $.ajax({
      type: 'POST',
      url: 'http://192.168.215.138:1337/api/group',
      dataType: 'json',
      data: JSON.stringify(request),
      success: function (msg) {
        $('#group-created-successful').show();
        setTimeout(function () { $('#group-created-successful').hide(); }, 4000);
        $('#table').DataTable().ajax.reload();
        $('#table').DataTable().searchPanes.rebuildPane();
      }
    });
  });

  $(document).on('shown.bs.modal', '#info-group-modal', function (event) {
    var row = $(event.relatedTarget).parents("tr");
    var uuid = row.find("td:first").text();
    console.log(uuid);
    for (var i = 0; i < group_info.length; i++) {
      if (group_info[i].uuid == uuid) {
        console.log(group_info[i]);
        $("#group-name").val(group_info[i].groupname);
        $("#group-uuid").val(group_info[i].uuid);
        // group_info[i].implants.forEach(i => {
        //   console.log(i);
        // })
        $("#group-members").val(group_info[i].implants.join("\n"));
        return;
      }
    }
  });

  $('#delete-group-confirm').click(function () {
    var uuid = row_to_remove.parents("tr").find("td:first").text();
    var api_url = `/api/group/${uuid}`
    $.ajax({
      url: api_url,
      type: "delete",
      success: function (response) {
        row_to_remove.parents("tr").remove();
      },
      error: function (xhr) {
        //Do Something to handle error
      }
    });
    $('#delete-group-modal').modal('toggle');
  });

  $('#table').DataTable({
    "ajax": {
      "url": "http://192.168.215.138:1337/api/group",
      "dataSrc": function (json) {
        console.log(json);
        for (var i = 0; i < json.length; i++) {
          json[i]["nummembers"] = json[i].implants.length;
          json[i]["editbuttons"] = '<div role="group" class="btn-group btn-group-sm"><button class="btn btn-primary group-action-button" id="Info" type="button" data-target="#info-group-modal" data-toggle="modal"><i class="fas fa-info-circle"></i></button><button class="btn btn-danger group-action-button" id="Delete" type="button" data-target="#delete-group-modal" data-toggle="modal"><i class="far fa-trash-alt"></i></button><button class="btn btn-warning group-action-button" id="Edit" type="button"><i class="far fa-edit"></i></button></div>';
        }
        group_info = json;
        return json;
      },
    },
    "columns": [
      { "data": "uuid" },
      { "data": "groupname" },
      { "data": "nummembers" },
      { "data": "editbuttons" },
    ],
    colReorder: true,
    dom: 'Plfrtip',
    columnDefs: [{
      searchPanes: {
        show: true
      },
      targets: [0, 1, 2]
    }]
  });

  $('#create-group-table').DataTable({
    select: {
      style: 'multi'
    },
    colReorder: true,
    "ajax": {
      "url": "http://192.168.215.138:1337/api/implantswithcallbacks",
      dataSrc: ""
    },
    "columns": [
      { "data": "implant.uuid" },
      { "data": "implant.primaryip" },
      { "data": "implant.hostname" },
      { "data": "implanttype.implantname" },
      { "data": "implanttype.implantversion" },
      { "data": "implant.implantos" },
      { "data": "callback.lastcall" },
      { "data": "implant.supportedmodules" },
    ],
    dom: 'Plfrtip',
    columnDefs: [{
      searchPanes: {
        show: true,
      },
      targets: [0, 1, 2, 3, 4, 5, 6]
    }]
  });

  $('#no-group-name-alert').hide();
  $('#no-implants-selected-alert').hide();
  $('#group-created-successful').hide();
})(jQuery); // End of use strict
