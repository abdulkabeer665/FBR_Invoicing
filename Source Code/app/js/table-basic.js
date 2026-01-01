const baseURLValue = baseURL;

$(document).ready(function () {

    LoadDeparts();
    $("#userName").val(localStorage.getItem('userName'));

});

function LoadDeparts() {
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
    } else {

        const token = localStorage.getItem('token');
        var api_url = baseURLValue + 'getAppUsers';

        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: {}, // You can pass any data you want to send
            successCallback: function (result) {


                BindBody(result.actualData);

            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });

    }
}


$("#logOutBtn2").click(() => {
    localStorage.clear();
    window.location.replace(baseURLValue);  // Redirect to login
});

// function BindBody(jsonData) {

//     var mdata = '';
//     var tablename = 'tablebasic'
//     $("#" + tablename).DataTable().destroy();
//     $("#" + tablename + ' tbody').empty();

//     for (var i = 0; i < jsonData.length; i++) {

//         //Main Parent
//         // mdata = $('<tr/>');
//         mdata += '<tr>';
//         mdata += '<td><i class="bx bxl-angular bx-md text-danger me-4"></i> <span>' + jsonData[i]['LoginName'] + '</span></td>';
//         mdata += '<td>' + jsonData[i]['UserName'] + '</td>';
//         mdata += '<td>';
//         mdata += '<ul class="list-unstyled m-0 avatar-group d-flex align-items-center">';
//         mdata += '<li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top" class="avatar avatar-xs pull-up" title="Lilian Fuller">';
//         mdata += '<img src="../assets/img/avatars/5.png" alt="Avatar" class="rounded-circle" />';
//         mdata += '</li>';
//         mdata += '<li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top" class="avatar avatar-xs pull-up" title="Sophia Wilkerson">';
//         mdata += '<img src="../assets/img/avatars/6.png" alt="Avatar" class="rounded-circle" />';
//         mdata += '</li>';
//         mdata += '<li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top" class="avatar avatar-xs pull-up" title="Christina Parker">';
//         mdata += '<img src="../assets/img/avatars/7.png" alt="Avatar" class="rounded-circle" />';
//         mdata += '</li>';
//         mdata += '</ul>';
//         mdata += '</td>';
//         mdata += '<td><span class="badge bg-label-primary me-1">Active</span></td>';
//         mdata += '<td>';
//         mdata += '<div class="dropdown">';
//         mdata += '<button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">';
//         mdata += '<i class="bx bx-dots-vertical-rounded"></i>';
//         mdata += '</button>';
//         mdata += '<div class="dropdown-menu">';
//         mdata += '<a class="dropdown-item" href="javascript:void(0);">';
//         mdata += '<i class="bx bx-edit-alt me-1"></i> Edit';
//         mdata += '</a>';
//         mdata += '<a class="dropdown-item" href="javascript:void(0);">';
//         mdata += '<i class="bx bx-trash me-1"></i> Delete';
//         mdata += '</a>';
//         mdata += '</div>';
//         mdata += '</div>';
//         mdata += '</td>';
//         mdata += '</tr>';
//         // $("#" + tablename + ' tbody').append(mdata);
//         // mdata = $('<tr/>');
//         // mdata.append()
//     }
//     $("#" + tablename + ' tbody').append(mdata);
//     $("#" + tablename).DataTable(
//         {
//             //"order": [[orderColumn, 'asc']], // Order by the calculated column index. For no order use "order": [],
//             "dom": '<"row justify-content-between top-information"lf>rt<"row justify-content-between bottom-information"ip><"clear">'
//         }
//     );
// }

function BindBody(jsonData) {
    var table = $("#" + 'tablebasic');
    var tbody = table.find('tbody');

    // Clear the existing data in tbody
    tbody.empty();

    // Create an array to hold all rows of table
    var rows = [];

    // Loop through the data and create table rows
    jsonData.forEach(function (data) {
        var row = $('<tr/>');
        row.append('<td><i class="bx bxl-angular bx-md text-danger me-4"></i> <span>' + data['LoginName'] + '</span></td>');
        row.append('<td>' + data['UserName'] + '</td>');
        row.append(createAvatarGroup());  // Avatar list
        row.append('<td><span class="badge bg-label-primary me-1">Active</span></td>');
        row.append(createDropdownMenu()); // Dropdown menu

        rows.push(row);
    });

    // Append all rows at once
    tbody.append(rows);

    // Initialize or reinitialize DataTable
    if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy(); // Destroy the previous instance
    }

    table.DataTable({
        "dom": '<"row justify-content-between top-information"lf>rt<"row justify-content-between bottom-information"ip><"clear">'
    });
}

// Function to create avatar group
function createAvatarGroup() {
    return $('<td>').append(
        $('<ul/>', { 'class': 'list-unstyled m-0 avatar-group d-flex align-items-center' }).append(
            ['5', '6', '7'].map(function (id) {
                return $('<li/>', {
                    'class': 'avatar avatar-xs pull-up',
                    'data-bs-toggle': 'tooltip',
                    'data-popup': 'tooltip-custom',
                    'data-bs-placement': 'top',
                    'title': 'User ' + id
                }).append(
                    $('<img/>', {
                        'src': '../assets/img/avatars/' + id + '.png',
                        'alt': 'Avatar ' + id,
                        'class': 'rounded-circle'
                    })
                );
            })
        )
    );
}

// Function to create the dropdown menu
function createDropdownMenu() {
    return $('<td>').append(
        $('<div/>', { 'class': 'dropdown' }).append(
            $('<button/>', {
                'type': 'button',
                'class': 'btn p-0 dropdown-toggle hide-arrow',
                'data-bs-toggle': 'dropdown'
            }).append(
                $('<i/>', { 'class': 'bx bx-dots-vertical-rounded' })
            ),
            $('<div/>', { 'class': 'dropdown-menu' }).append(
                $('<a/>', { 'class': 'dropdown-item', 'href': 'javascript:void(0);' }).append(
                    $('<i/>', { 'class': 'bx bx-edit-alt me-1' }), ' Edit'
                ),
                $('<a/>', { 'class': 'dropdown-item', 'href': 'javascript:void(0);' }).append(
                    $('<i/>', { 'class': 'bx bx-trash me-1' }), ' Delete'
                )
            )
        )
    );
}