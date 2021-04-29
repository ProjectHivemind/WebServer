(function ($) {

    let row_to_remove = ''; //global variable
    let group_info = ''; //global variable
    let selected_group;

    $(document).on('shown.bs.modal', '#delete-group-modal', function (event) {
        row_to_remove = $(event.relatedTarget);
    });

    $('#create-group-confirm').click(function () {
        let selected = $('#create-group-table').DataTable().rows({ selected: true }).data();

        $("#add-group-modal").scrollTop(0);
        $("html, body").scrollTop($("#add-group-modal").offset().top);

        if (!$('#group-name-input').val()) {
            $('#no-group-name-alert').show();
            setTimeout(function () {
                $('#no-group-name-alert').hide();
            }, 4000);
            return;
        }

        if (selected.length === 0) {
            $('#no-implants-selected-alert').show();
            setTimeout(function () {
                $('#no-implants-selected-alert').hide();
            }, 4000);
            return;
        }

        var request = {
            uuid: '',
            group_name: $('#group-name-input').val(),
            implants: []
        }
        implants_uuid = []
        for (var i = 0; i < selected.length; i++) {
            request.implants.push(selected[i].implant.uuid);
        }

        $.ajax({
            type: 'POST',
            url: '/api/group',
            dataType: 'json',
            data: JSON.stringify(request),
            success: function (msg) {
                $('#group-created-successful').show();
                setTimeout(function () {
                    $('#group-created-successful').hide();
                }, 4000);
                $('#table').DataTable().ajax.reload();
                $('#table').DataTable().searchPanes.rebuildPane();
            }
        });
    });


    $(document).on('shown.bs.modal', '#loading-modal', function (event) {
        $('#info-group-table').DataTable().clear().draw();
        var row = $(event.relatedTarget).parents("tr");
        var uuid = row.find("td:first").text();
        for (var i = 0; i < group_info.length; i++) {
            if (group_info[i].uuid == uuid) {
                selected_group = group_info[i];
                $('#info-group-table').DataTable().ajax.reload();
                $('#info-group-table').DataTable().searchPanes.rebuildPane();
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

            },
            error: function (xhr) {
                console.log("Error deleting group");
            }
        });
        $('#delete-group-modal').modal('toggle');
        $('#table').DataTable().ajax.reload();
        $('#table').DataTable().searchPanes.rebuildPane();
    });

    $('#table').DataTable({
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/group",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ data: [] });
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            response[i]["num_members"] = response[i].implants.length;
                            response[i]["edit_buttons"] = '<div role="group" class="btn-group btn-group-sm"><button class="btn btn-primary group-action-button" type="button" data-target="#loading-modal" data-toggle="modal"><i class="fas fa-info-circle"></i></button><button class="btn btn-danger group-action-button" type="button" data-target="#delete-group-modal" data-toggle="modal"><i class="far fa-trash-alt"></i></button><button class="btn btn-warning group-action-button edit-group-button" type="button"><i class="far fa-edit"></i></button></div>';
                        }
                        group_info = response;
                        callback({ data: response });
                    }
                },
            })
        },
        columns: [
            { data: "uuid" },
            { data: "group_name" },
            { data: "num_members" },
            { data: "edit_buttons" },
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
            targets: [0, 1, 2]
        }]
    });

    $('#create-group-table').DataTable({
        select: {
            style: 'multi'
        },
        buttons: [
            {
                text: 'Select all filtered',
                action: function () {
                    $('#create-group-table').DataTable().rows({
                        search: 'applied'
                    }).select();
                }
            },
            'selectAll',
            'selectNone',
            'colvis'
        ],
        language: {
            buttons: {
                selectAll: "Select all items",
                selectNone: "Select none"
            }
        },
        colReorder: true,
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/implantswithcallbacks",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ data: [] });
                    } else {
                        callback({ data: response });
                    }
                },
            })
        },
        columns: [
            { data: "implant.uuid" },
            { data: "implant.primary_ip" },
            { data: "implant.hostname" },
            { data: "implant.implant_os" },
            { data: "implant_type.implant_name" },
            { data: "implant_type.implant_version" },
            { 
                data: "callback.last_call",
                render: function (data, type, row, meta) {
                    return moment.utc(data).local().format('MMM DD HH:mm:ss');
                },
            },
            {
                data: "implant.supported_modules",
                render: {
                    _: '[, ]',
                    sp: '[]'
                },
                searchPanes: {
                    orthogonal: 'sp'
                }
            },
        ],
        dom: 'PBlfrtip',
        responsive: true,
        autoWidth: false,
        columnDefs: [{
            searchPanes: {
                show: true,
            },
            targets: [0, 1, 2, 3, 4, 5, 7]
        },
        {
            searchPanes: {
                show: false
            },
            targets: [6]
        }]
    });

    $('#info-group-table').DataTable({
        colReorder: true,
        ajax: function (data, callback, settings) {
            var group_implants = []
            if (selected_group) {
                $("#group-name").val(selected_group.groupname);
                $("#group-uuid").val(selected_group.uuid);
                for (var j = 0; j < selected_group.implants.length; j++) {
                    $.ajax({
                        type: 'GET',
                        url: `/api/implant/${selected_group.implants[j]}`,
                        success: function (msg) {
                            group_implants.push(msg);
                        },
                        error: function (resp) {
                            console.log("Error in request for implant");
                        },
                        async: false
                    });
                }
                $('#loading-modal').modal('hide')
                $('#info-group-modal').modal('show')
            }
            callback({ data: group_implants })
        },
        columns: [
            { data: "uuid" },
            { data: "primary_ip" },
            { data: "hostname" },
            { data: "implant_os" },
            {
                data: "supported_modules",
                render: {
                    _: '[, ]',
                    sp: '[]'
                },
                searchPanes: {
                    orthogonal: 'sp'
                }
            },
        ],
        dom: 'Plfrtip',
        responsive: true,
        autoWidth: false,
        columnDefs: [{
            searchPanes: {
                show: true,
            },
            targets: [0, 1, 2, 3, 4]
        }]
    });

    $('#no-group-name-alert').hide();
    $('#no-implants-selected-alert').hide();
    $('#group-created-successful').hide();

    $(document).on("click", ".edit-group-button", function () {
        let group_uuid = $(this).parents("tr").find("td:first").text();
        $('#group-name-input').val($(this).parents("tr").find("td:eq(1)").text())
        $('#create-group-table').DataTable().rows('.selected').deselect();
        for (var i = 0; i < group_info.length; i++) {
            if (group_info[i].uuid == group_uuid) {
                $('#create-group-table').DataTable().searchPanes.clearSelections();
                var indexes = $('#create-group-table').DataTable().rows().eq(0).filter(function (rowIdx) {
                    return group_info[i].implants.includes($('#create-group-table').DataTable().cell(rowIdx, 0).data()) ? true : false;
                });
                $('#create-group-table').DataTable().rows(indexes).select();
                break;
            }
        }
        $('#add-group-modal').modal('show')
    });
})(jQuery); // End of use strict
