(function ($) {
    let row_to_remove; //global variable
    let group_info;
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

    $('#executed-actions-table').DataTable({
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/executedactionfrontend",
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
            { data: "executed_action.id" },
            { data: "stored_action.name" },
            { data: "executed_action.uuid_of_implant" },
            { data: "executed_action.uuid_of_action" },
            { data: "implant.hostname" },
            { data: "implant.mac" },
            { data: "implant.implant_os" },
            {
                data: "executed_action.time_sent",
                render: function (data, type, row, meta) {
                    return moment.utc(data).local().format('MMM DD HH:mm:ss');
                },
            },
            {
                data: "executed_action.action_response",
                render: function (data, type, row) {
                    return data.replace(/\n/ig, "<br/>");
                },
            },
            { data: "implant.primary_ip" },
            { data: "stored_action.module_to_run" },
            { data: "stored_action.module_func" },
            { data: "stored_action.arguments" },
            {
                data: "executed_action.time_ran",
                render: function (data, type, row, meta) {
                    var temp = moment.utc(data).local().format('MMM DD HH:mm:ss');
                    if (temp == 'Invalid date') {
                        return "";
                    }
                    return temp;
                },
            },
            { data: "executed_action.successful" },
        ],
        colReorder: true,
        order: [[13, "desc"]],
        dom: 'lfrtip',
        responsive: true,
        autoWidth: false,
    });

    $('#table').DataTable({
        ajax: function (data, callback, settings) {
            $.ajax({
                url: "/api/stagedactionfrontend",
                dataType: "json",
                success: function (response) {
                    if (response === null) {
                        callback({ data: [] });
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            response[i]["edit_buttons"] = '<div role="group" class="btn-group btn-group-sm"><button class="btn btn-danger group-action-button" type="button" data-target="#delete-action-modal" data-toggle="modal"><i class="far fa-trash-alt"></i></button></div>';
                        }
                        callback({ data: response });
                    }
                },
            })
        },
        columns: [
            { data: "staged_action.id" },
            { data: "stored_action.name" },
            { data: "implant.primary_ip" },
            { data: "implant.hostname" },
            { data: "implant.implant_os" },
            { data: "stored_action.module_to_run" },
            { data: "stored_action.module_func" },
            { data: "stored_action.arguments" },
            { data: "edit_buttons" },
        ],
        colReorder: true,
        dom: 'lfrtip',
        responsive: true,
        autoWidth: false,
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
                        callback({ data: [] });
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            response[i]["num_members"] = response[i].implants.length;
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
                        callback({ data: [] });
                    } else {
                        callback({ data: response });
                    }
                },
            })
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
                        callback({ data: [] });
                    } else {
                        callback({ data: response });
                    }
                },
            })
        },
        columns: [
            { data: "uuid" },
            { data: "name" },
            { data: "module_to_run" },
            { data: "module_func" },
            { data: "arguments" },
        ],
        colReorder: true,
        dom: 'lfrtip',
        responsive: true,
        autoWidth: false
    });

    $('#stage-action-table').DataTable().on('select', function (e, dt, type, indexes) {
        var row = $('#stage-action-table').DataTable().rows(indexes).data();
        var search = `(?=.*${row[0]["module_to_run"]})`;
        if (!selected_mods.includes(search)) {
            selected_mods.push(search);
        }
        $('#stage-target-table').DataTable().column(4).data().search(selected_mods.join(''), true, false).draw();
    });

    $('#stage-action-table').DataTable().on('deselect', function (e, dt, type, indexes) {
        var row = $('#stage-action-table').DataTable().rows(indexes).data();
        for (let i = 0; i < selected_mods.length; i++) {
            if (selected_mods[i].includes(row[0]["module_to_run"])) {
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
                        uuid_of_action: selected_actions[i].uuid,
                        uuid_of_implant: selected_implants[j].uuid,
                        time_staged: ''
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
                                    uuid_of_action: selected_actions[i].uuid,
                                    uuid_of_implant: group_info[k].implants[l],
                                    time_staged: ''
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
