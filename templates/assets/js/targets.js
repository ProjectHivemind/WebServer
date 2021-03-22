(function ($) { 
        var table = $('#table').DataTable( {
            "ajax": {
                "url": "http://192.168.215.138:1337/api/implantswithcallbacks",
                dataSrc: ""
            },
            "columns": [
                { "data": "implant.uuid" },
                { "data": "implant.primaryip" },
                { "data": "implant.hostname" },
                { "data": "implant.implantos" },
                { "data": "callback.lastcall" },
                // { "data": "implant.supportedmodules" },
            ],
        } );
})(jQuery); // End of use strict
