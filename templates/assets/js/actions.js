(function ($) {
    let row_to_remove = ''; //global variable
    let module_funcs = [];

    $(document).on('shown.bs.modal', '#delete-action-modal', function (event) {
        row_to_remove = $(event.relatedTarget);
    });

    $('#delete-action-confirm').click(function () {
        var name = row_to_remove.parents("tr").find("td:first").text();
        console.log(name);
        var api_url = `/api/storedaction/${name}`
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
                url: "/api/storedaction",
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
            { data: "uuid" },
            { data: "module_to_run" },
            { data: "module_func" },
            { data: "arguments" },
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
        },
        {
            searchPanes: {
                show: false
            },
            targets: [3, 4]
        }]
    });

    $('select').selectpicker();

    $('#module-select').on('change', function (e) {
        $('#create-action-confirm').attr('disabled', '');
        $('#dynamic-fields').empty();
        $('#module-function-select').find('option').remove();

        $.ajax({
            url: `/api/modulefunc/${this.value}`,
            type: "get",
            success: function (response) {
                module_funcs = response;
                for (var i = 0; i < response.length; i++) {
                    $('#module-function-select').append(`<option data-subtext="${response[i]["module_func_desc"]}" val="${response[i]["module_func_name"]}">${response[i]["module_func_name"]}</option>`);
                }
                $('#module-function-select').removeAttr('disabled');
                $("#module-function-select").selectpicker("refresh");
            },
            error: function (xhr) {
                console.log("Error getting function");
            }
        });
    });

    $('#module-function-select').on('change', function (e) {
        $('#dynamic-fields').empty();
        $('#create-action-confirm').removeAttr('disabled');

        for (var i = 0; i < module_funcs.length; i++) {
            if (module_funcs[i]["module_func_name"] == this.value) {
                for (var j = 0; j < module_funcs[i]["param_names"].length; j++) {
                    if (module_funcs[i]["param_types"][j] == "String") {
                        console.log(module_funcs[i]["param_names"][j] + " is a String");
                        $('#dynamic-fields').append(`<input class="form-control" type="text" id="${module_funcs[i]["param_names"][j]}" placeholder="${module_funcs[i]["param_names"][j]}" />`);
                    }
                    else if (module_funcs[i]["param_types"][j] == "Double") {
                        console.log(module_funcs[i]["param_names"][j] + " is a Double");
                        $('#dynamic-fields').append(`<input class="form-control" type="number" id="${module_funcs[i]["param_names"][j]}" placeholder="${module_funcs[i]["param_names"][j]}" min="0" step="any"/>`);
                    }
                    else if (module_funcs[i]["param_types"][j] == "Int") {
                        console.log(module_funcs[i]["param_names"][j] + " is an Int");
                        $('#dynamic-fields').append(`<input class="form-control" type="number" id="${module_funcs[i]["param_names"][j]}" placeholder="${module_funcs[i]["param_names"][j]}" min="0" step="1" />`);
                    }
                }
            }
        }
    });

    $(document).on('shown.bs.modal', '#add-action-modal', function (event) {
        $('#dynamic-fields').empty();
        $('#module-select').find('option').remove();
        $('#module-function-select').find('option').remove();
        $("#module-select").selectpicker("refresh");
        $('#module-function-select').attr('disabled', '');
        $("#module-function-select").selectpicker("refresh");
        $('#create-action-confirm').attr('disabled', '');
        $('#action-name-input').val('');
        $('#create-action-confirm').attr('disabled', '');

        $.ajax({
            url: "/api/module",
            type: "get",
            success: function (response) {
                modules = response;
                for (var i = 0; i < response.length; i++) {
                    $('#module-select').append(`<option data-subtext="${response[i]["module_desc"]}" val="${response[i]["module_name"]}">${response[i]["module_name"]}</option>`);
                }
                $("#module-select").selectpicker("refresh");
            },
            error: function (xhr) {
                console.log("Error getting modules");
            }
        });
    });

    $('#create-action-confirm').click(function () {
        $("#add-action-modal").scrollTop(0);
        $("html, body").scrollTop($("#add-action-modal").offset().top);

        if (!$('#action-name-input').val()) {
            $('#no-action-name-alert').show();
            setTimeout(function () {
                $('#no-action-name-alert').hide();
            }, 4000);
            return;
        }

        var request = {
            uuid: '',
            module_to_run: $('#module-select').val(),
            module_func: $('#module-function-select').val(),
            arguments: []
        }
        var temp = {}
        for (var i = 0; i < module_funcs.length; i++) {
            if (module_funcs[i]["module_func_name"] == $('#module-function-select').val()) {
                for (var j = 0; j < module_funcs[i]["param_names"].length; j++) {
                    var name = `${module_funcs[i]["param_names"][j]}`;
                    temp[name] = $(`#${name}`).val();
                }
                break;
            }
        }
        request.arguments.push(JSON.stringify(temp));
        $.ajax({
            type: 'POST',
            url: '/api/storedaction',
            dataType: 'json',
            data: JSON.stringify(request),
            success: function (msg) {
                $('#action-created-successful').show();
                setTimeout(function () {
                    $('#action-created-successful').hide();
                }, 4000);
            }
        });
        $('#table').DataTable().ajax.reload();
        $('#table').DataTable().searchPanes.rebuildPane();
    });

    $('#no-action-name-alert').hide();
    $('#missing-params-alert').hide();
    $('#action-created-successful').hide();
})(jQuery); // End of use strict
