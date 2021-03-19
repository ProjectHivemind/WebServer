// (function ($) {
//     $('#table').DataTable({
//         "ordering": true,
//         "ajax": {
//             "url": "http://localhost:1337/api/implantswithcallbacks",
//             dataSrc: ""
//         },
//         "columns": [
            // { "data": "implant.primaryip" },
            // { "data": "implant.hostname" },
            // { "data": "implant.implantos" },
            // { "data": "callback.lastcall" }
//         ]
//     });
// })(jQuery); // End of use strict


function format ( d ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Full name:</td>'+
            '<td>'+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Extension number:</td>'+
            '<td>'+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Extra info:</td>'+
            '<td>And any further details here (images etc)...</td>'+
        '</tr>'+
    '</table>';
}
 
(function ($) {
    // var table = $('#table').DataTable( {
    //     "ajax": {
    //         "url": "http://localhost:1337/api/implantswithcallbacks",
    //         dataSrc: ""
    //     },
    //     "columns": [
    //         {
    //             "className":      'details-control',
    //             "orderable":      false,
    //             "data":           null,
    //             "defaultContent": ''
    //         },
    //         { "data": "implant.primaryip" },
    //         { "data": "implant.hostname" },
    //         { "data": "implant.implantos" },
    //         { "data": "callback.lastcall" }
    //     ],
    //     "order": [[1, 'asc']]
    // } );
     
        var table = $('#table').DataTable( {
            // responsive: {
            //     details: {
            //         renderer: function ( api, rowIdx, columns ) {
            //             var data = $.map( columns, function ( col, i ) {
            //                 return col.hidden ?
            //                     '<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
            //                         '<td>'+col.title+':'+'</td> '+
            //                         '<td>'+col.data+'</td>'+
            //                     '</tr>' :
            //                     '';
            //             } ).join('');
     
            //             return data ?
            //                 $('<table/>').append( data ) :
            //                 false;
            //         }
            //     }
            // },
            "ajax": {
                "url": "http://localhost:1337/api/implantswithcallbacks",
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
