(function ($) {
    $('#table').DataTable({
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
            { data: "implant_type.implant_name" },
            { data: "implant_type.implant_version" },
            { data: "implant.implant_os" },
            { data: "callback.last_call" },
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
        language: {
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i>'
        },
        buttons: [
            'colvis'
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
})(jQuery); // End of use strict
