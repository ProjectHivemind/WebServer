(function ($) {
    let module_info = ''; //global variable

    $('#table').DataTable({
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "http://192.168.215.138:1337/api/storedaction",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ "data": [] });
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            response[i]["editbuttons"] = '<div role="group" class="btn-group btn-group-sm"><button class="btn btn-primary group-action-button" type="button" data-target="#loading-modal" data-toggle="modal"><i class="fas fa-info-circle"></i></button><button class="btn btn-danger group-action-button" type="button" data-target="#delete-group-modal" data-toggle="modal"><i class="far fa-trash-alt"></i></button><button class="btn btn-warning group-action-button edit-group-button" type="button"><i class="far fa-edit"></i></button></div>';
                        }
                        module_info = response;
                        callback({ "data": response });
                    }
                },
            })
        },
        columns: [
            { "data": "uuid" },
            { "data": "moduletorun" },
            { "data": "modulefunc" },
            { "data": "arguments" },
            { "data": "editbuttons" },
        ],
        colReorder: true,
        dom: 'PBlfrtip',
        responsive: true,
        autoWidth: false,
        buttons: [
            'colvis'
        ],
        columnDefs: [{
            searchPanes: {
                show: true
            },
            targets: [0, 1, 2,3,4]
        }]
    });
})(jQuery); // End of use strict
