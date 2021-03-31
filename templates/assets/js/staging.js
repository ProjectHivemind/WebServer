(function ($) {
    let row_to_remove; //global variable
    let group_info;
    let action_info = '';
    let implant_info = '';
    let selected_mods = [];

    $(document).on('shown.bs.modal', '#delete-action-modal', function (event) {
        row_to_remove = $(event.relatedTarget);
    });

    $('#delete-action-confirm').click(function () {
        var uuid = row_to_remove.parents("tr").find("td:first").text();
        var api_url = `/api/stagedaction/${uuid}`
        $.ajax({
            url: api_url,
            type: "delete",
            success: function (response) {

            },
            error: function (xhr) {
                console.log("Error deleting action");
            }
        });
        $('#delete-action-modal').modal('toggle');
        $('#table').DataTable().ajax.reload();
        $('#table').DataTable().searchPanes.rebuildPane();
    });

    $('#table').DataTable({
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/stagedactionfrontend",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ "data": [] });
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            response[i]["editbuttons"] = '<div role="group" class="btn-group btn-group-sm"><button class="btn btn-danger group-action-button" type="button" data-target="#delete-action-modal" data-toggle="modal"><i class="far fa-trash-alt"></i></button></div>';
                        }
                        callback({ "data": response });
                    }
                },
            })
        },
        columns: [
            { "data": "stagedactions.id" },
            { "data": "implant.primaryip" },
            { "data": "implant.hostname" },
            { "data": "implant.implantos" },
            { "data": "storedactions.moduletorun" },
            { "data": "storedactions.modulefunc" },
            {
                "data": "storedactions.arguments",
                render: {
                    _: '[, ]',
                    sp: '[]'
                },
                searchPanes: {
                    orthogonal: 'sp'
                }
            },
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
            targets: [0, 1, 2, 3]
        },
        {
            searchPanes: {
                show: false
            },
            targets: [4]
        }]
    });

    $('#stage-group-table').DataTable({
        select: {
            style: 'multi'
        },
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/group",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ "data": [] });
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            response[i]["nummembers"] = response[i].implants.length;
                        }
                        group_info = response;
                        callback({ "data": response });
                    }
                },
            })
        },
        columns: [
            { "data": "uuid" },
            { "data": "groupname" },
            { "data": "nummembers" },
        ],
        colReorder: true,
        dom: 'lfrtip',
        responsive: true,
        autoWidth: false
    });

    $('#stage-target-table').DataTable({
        select: {
            style: 'multi'
        },
        colReorder: true,
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/implant",
                success: function (response) {
                    if (response === null) {
                        callback({ "data": [] });
                    } else {
                        implant_info = response;
                        callback({ "data": response });
                    }
                },
            })
        },
        columns: [
            { "data": "uuid" },
            { "data": "primaryip" },
            { "data": "hostname" },
            { "data": "implantos" },
            {
                "data": "supportedmodules",
                render: {
                    _: '[, ]',
                },
            },
        ],
        dom: 'lfrtip',
        responsive: true,
        autoWidth: false,
        columnDefs: [
            {
                targets: [4],
                visible: false,
                searchable: true,
            },
            {
                targets: [0, 1, 2, 3],
                visible: true
            }
        ],
    });

    $('#stage-action-table').DataTable({
        select: {
            style: 'multi'
        },
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/storedaction",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ "data": [] });
                    } else {
                        action_info = response;
                        callback({ "data": response });
                    }
                },
            })
        },
        columns: [
            { "data": "uuid" },
            { "data": "moduletorun" },
            { "data": "modulefunc" },
            {
                "data": "arguments"
            },
        ],
        colReorder: true,
        dom: 'lfrtip',
        responsive: true,
        autoWidth: false
    });

    $('#stage-action-table').DataTable().on('select', function (e, dt, type, indexes) {
        var row = $('#stage-action-table').DataTable().rows(indexes).data();
        var search = `(?=.*${row[0]["moduletorun"]})`;
        if (!selected_mods.includes(search)) {
            selected_mods.push(search);
        }
        $('#stage-target-table').DataTable().column(4).data().search(selected_mods.join(''), true, false).draw();
    });

    $('#stage-action-table').DataTable().on('deselect', function (e, dt, type, indexes) {
        var row = $('#stage-action-table').DataTable().rows(indexes).data();
        for (let i = 0; i < selected_mods.length; i++) {
            if (selected_mods[i].includes(row[0]["moduletorun"])) {
                selected_mods.splice(i, 1);
                break;
            }
        }
        $('#stage-target-table').DataTable().column(4).data().search(selected_mods.join(''), true, false).draw();
    });

    $(document).on('shown.bs.modal', '#stage-action-modal', function (event) {
        $('#stage-action-table').DataTable().rows('.selected').deselect();
        $('#stage-target-table').DataTable().rows('.selected').deselect();
        $('#stage-group-table').DataTable().rows('.selected').deselect();
    });

    $('#stage-action-confirm').click(function () {
        $('#stage-action-confirm').attr('disabled', '');
        var already_staged = {};
        let selected_actions = $('#stage-action-table').DataTable().rows({ selected: true }).data();
        let selected_implants = $('#stage-target-table').DataTable().rows({ selected: true }).data();
        let selected_groups = $('#stage-group-table').DataTable().rows({ selected: true }).data();

        for (var i = 0; i < selected_actions.length; i++) {
            already_staged[selected_actions[i].uuid] = []
            //Implants first
            for (var j = 0; j < selected_implants.length; j++) {
                if (!already_staged[selected_actions[i].uuid].includes(selected_implants[j].uuid)) {
                    already_staged[selected_actions[i].uuid].push(selected_implants[j].uuid);
                    var request = {
                        id: '',
                        uuidofaction: selected_actions[i].uuid,
                        uuidofimplant: selected_implants[j].uuid,
                        timestaged: ''
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/api/stagedaction',
                        dataType: 'json',
                        data: JSON.stringify(request),
                        success: function (msg) {

                        }
                    });
                }
            }
            //Groups
            for (var j = 0; j < selected_groups.length; j++) {
                for (var k = 0; k < group_info.length; k++) {
                    if (group_info[k].uuid == selected_groups[j].uuid) {
                        for (var l = 0; l < group_info[k].implants.length; l++) {
                            if (!already_staged[selected_actions[i].uuid].includes(group_info[k].implants[l])) {
                                already_staged[selected_actions[i].uuid].push(group_info[k].implants[l]);
                                var request = {
                                    id: '',
                                    uuidofaction: selected_actions[i].uuid,
                                    uuidofimplant: group_info[k].implants[l],
                                    timestaged: ''
                                }
                                $.ajax({
                                    type: 'POST',
                                    url: '/api/stagedaction',
                                    dataType: 'json',
                                    data: JSON.stringify(request),
                                    success: function (msg) {

                                    },
                                    error: function () {

                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        $('#table').DataTable().ajax.reload();
        $('#table').DataTable().searchPanes.rebuildPane();
        $('#action-created-successful').show();
        $('#stage-action-confirm').removeAttr('disabled');
    
        setTimeout(function () {
            $('#action-created-successful').hide();
        }, 4000);
    });
    $('#action-created-successful').hide();
})(jQuery); // End of use strict
