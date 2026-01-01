//#region "Declaration"

const baseURLValue = baseURL;
var addEditBtnFlag = 0;
var datatableReload = 0;
const token = localStorage.getItem('token');
var selectedIds = [];
selectedRows = [];

//#endregion

//#region "Page Load"

$(document).ready(function () {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("fromDate").value = today;
    document.getElementById("toDate").value = today;
    
    $("#userName").val(localStorage.getItem('userName'));
    $('#btnSave').text('SAVE');
    $("#carcassModalTitleText").text('Environment');
    LoadScenarios();
    $("#carcassModal").modal('show');    //Uncomment this after successful grid load
});

//#endregion

//#region Load Invoices from GP

function LoadInvoices(frmDate, toDate) {
    
    $('#loaderRow').show();
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
    } else {
        const obj = {
            fromDate : frmDate,
            toDate : toDate
        }
        var api_url = baseURLValue + 'getSalesReport';
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: obj, // You can pass any data you want to send
            successCallback: function (result) {
                console.log(result.actualData)
                
                FillDataTable(result.actualData);
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });

    }
};

function FillDataTable(jsonData) {
    var table = $("#" + 'carcassTable');
    var tbody = table.find('tbody');

    // Clear the existing data in tbody
    tbody.empty();

    // Create an array to hold all rows of table
    var rows = [];

    // Initialize or reinitialize DataTable
    if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy(); // Destroy the previous instance
    }

    // Loop through the data and create table rows
    jsonData.forEach(function (data) {
        var row = $('<tr/>');
        var status = data['TrxStatus'].trim();
        var icon = '';
        var color = '';

        if (status === 'Un-Posted') {
            icon = '&#10006;'; // ✗ cross
            color = 'red';
        } else if (status === 'Posted') {
            icon = '&#10004;'; // ✓ tick
            color = 'green';
        }
        row.append('<td><input type="checkbox" class="row-checkbox"></td>');
        row.append('<td style="text-align: center; color:' + color + ';" title="' + status + '">' + icon + '</td>');
        row.append('<td>' + data['Document No.'].trim() + '</td>'); //Invoice No or "invoiceRefNo"
        row.append('<td>Sale Invoice</td>');   //Invoice Type

        row.append('<td>' + data['Item Number'].trim() + '</td>');  //Item No or "sroItemSerialNo"
        row.append('<td>' + data['Item Description'].trim() + '</td>'); //Item Description or "productDescription"

        //#region Buyer Information

        row.append('<td>' + data['NTN#'].trim().split('-')[0] + '</td>'); //Customer NTN# or "buyerNTNCNIC"
        row.append('<td>' + data['Customer Name'].trim() + '</td>');    //Name of Custom or "buyerBusinessName"
        if (data['Location'].trim() != 'Karachi') {
            row.append('<td>' + 'Punjab' + '</td>');    //Province or "buyerProvince"
        }
        else {
            row.append('<td>' + 'Sindh' + '</td>');    //Province or "buyerProvince"
        }
        row.append('<td>' + data['Location'].trim() + '</td>'); //Location/Station or "buyerAddress"

        row.append('<td>Registered</td>'); //Buyer Registration Type or "buyerRegistrationType"

        //#endregion

        //#region Seller Information

        row.append('<td>1522054</td>');  //Seller NTNCNIC or "sellerNTNCNIC"
        row.append('<td>'+ data['Manufacturer'] + '</td>');  //Seller Business Name or "sellerBusinessName"
        if (data['Location'] != 'Karachi') {
            row.append('<td>Punjab</td>');  //Seller Province or "sellerProvince"
        }
        else {
            row.append('<td>Sindh</td>');  //Seller Province or "sellerProvince"
        }
        row.append('<td>Korangi</td>');  //Seller Address or "sellerAddress"

        //#endregion
        
        row.append('<td style="text-align: right;">' + new Date(data['Document Date']).toISOString().split('T')[0] + '</td>');  //Invoice Date or "invoiceDate"
        row.append('<td>' + data['HS Code'] + '</td>'); //HS Code or "hsCode"
        row.append('<td>KG</td>');    //Unit of Measurement or "uoM"
        row.append('<td>' + $("#scenariosDD option:selected").text().split('-')[0] + '</td>');   //IRIS Senario ID or "scenarioId"

        row.append('<td>' + data['Tax Schedule ID'].split(" ")[1] + '</td>'); //Rate or "rate"
        row.append('<td style="text-align: right;">' + Number(data['Qty']) + '</td>');  //Production Qty or "quantity"
        row.append('<td>' + 0 + '</td>');   //Total or "totalValues"
        
        //row.append('<td style="text-align: right;">' + (Number(data['Net Amount']) + Number(data['Tax Amount'])).toLocaleString() + '</td>');   //Sales Amount or "valueSalesExcludingST"
        row.append('<td style="text-align: right;">' + (Number(data['Net Amount'])).toLocaleString() + '</td>');   //Sales Amount or "valueSalesExcludingST"
        
        // if (data['Tax Schedule ID'].split(" ")[1].includes("%")) {
        //     let value = data["Tax Schedule ID"].split(" ")[1]; // e.g., "18%"
        //     let numberOnly = value.match(/\d+/)[0]; // "18"
        //     let taxRate = Number(numberOnly); // 18 as number

        //     let netAmount = Number(data["Net Amount"]); // e.g., 100

        //     let taxAmount = (netAmount * taxRate) / 100;
        //     row.append('<td style="text-align: right;">' + Number(taxAmount).toLocaleString() + '</td>');  //Sales Amount or "valueSalesExcludingST"
        // }
        // else {
        //     row.append('<td style="text-align: right;">0</td>');  //Sales Amount or "valueSalesExcludingST"
        // }
        
        row.append('<td>0</td>'); //Fixed Notified Value Or Retail Price or "fixedNotifiedValueOrRetailPrice"
        // row.append('<td>' + Number(data['Tax Amount']).toLocaleString() + '</td>'); //Sales Tax or 
        
        if (data['Tax Schedule ID'].split(" ")[1].includes("%")) {
            let value = data["Tax Schedule ID"].split(" ")[1]; // e.g., "18%"
            let numberOnly = value.match(/\d+/)[0]; // "18"
            let taxRate = Number(numberOnly); // 18 as number

            let netAmount = Number(data["Net Amount"]); // e.g., 100

            let taxAmount = (netAmount * taxRate) / 100;
            row.append('<td style="text-align: right;">' + Number(taxAmount).toLocaleString() + '</td>');  //Sales Tax Applicable or "salesTaxApplicable"
        }
        else {
            row.append('<td style="text-align: right;">0</td>');  //Sales Tax Applicable or "salesTaxApplicable"
        }

        // row.append('<td>' + 0 + '</td>');   //Sales Tax Applicable or "salesTaxApplicable"
        row.append('<td>' + 0 + '</td>');   //Sales Tax With Held At Source or "salesTaxWithheldAtSource"
        row.append('<td></td>');    //Extra Tax or "extraTax"
        row.append('<td>' + 0 + '</td>');   //Further Tax or "furtherTax"
        row.append('<td></td>');    //Sro ScheduleNo or "sroScheduleNo"
        row.append('<td>' + 0 + '</td>');   //FED Payable or "fedPayable"
        row.append('<td>' + 0 + '</td>');   //Discount or "discount"

        // row.append('<td>' + data['Sales Type'].trim() + '</td>');   //Sales Type or "saleType"
        row.append('<td>' + $("#scenariosDD option:selected").text().split('-')[1] + '</td>');   //Sales Type or "saleType"

        row.append(createDropdownMenu(data)); // Dropdown menu

        rows.push(row);
    });

    // Append all rows at once
    tbody.append(rows);

    $('#loaderRow').hide();

    table.DataTable({
        "dom": '<"row justify-content-between top-information"lf>rt<"row justify-content-between bottom-information"ip><"clear">'
    });
};

// Function to create the dropdown menu
function createDropdownMenu(data) {
    // Create the dropdown menu with edit and delete options
    return $('<td style="text-align: center;">').append(
        $('<div/>', { 'class': 'dropdown' }).append(
            $('<button/>', {
                'type': 'button',
                'class': 'btn p-0 dropdown-toggle hide-arrow',
                'data-bs-toggle': 'dropdown'
            }).append(
                $('<i/>', { 'class': 'bx bx-dots-vertical-rounded' })
            ),
            $('<div/>', { 'class': 'dropdown-menu' }).append(
                $('<a/>', {
                    'class': 'dropdown-item',
                    'style': 'cursor: pointer',
                    'data-id': data['ID'],  // Store RoleID in a data attribute
                    'data-code': data['Code'],      // Store Code in a data attribute
                    'data-name': data['Name'], // Store Name
                    'data-nameAr': data['NameAr'], // Store NameAr
                    'data-line-type-id': data['LineTypeID'], // Store LineTypeID
                    'id': 'validateBtn'  // unique id for edit button
                }).append(
                    ' Validate' , $('<i/>', { 'class': 'bx bx-key me-1' })
                ),
            )
        )
    );
};

//#endregion

//#region Add, Edit & Delete Buttons

// $("#addBtn").click(function AddBtn() {
//     addEditBtnFlag = 0;
//     $('#carcassIDHiddenField').val('');
//     $('#animalCategoryDD').val(0);
//     $('#code').val('');
//     $('#name').val('');
//     $('#nameAr').val('');
//     $('#btnSave').text('Save Changes');
//     $("#carcassModalTitleText").text('Add Carcass Information');
//     $("#carcassModal").modal('show');
// });

// Event delegation for dynamically created buttons
$(document).on('click', '#validateBtn', function EditBtn() {
    console.log("Here");
    return;
    addEditBtnFlag = 1;
    var ID = $(this).data('id');
    var code = $(this).data('code');
    var name = $(this).data('name');
    var nameAr = $(this).data('namear');
    var lineTypeID = $(this).data('line-type-id');
    $('#carcassIDHiddenField').val(ID);
    $('#animalCategoryDD').val(lineTypeID);
    $('#code').val(code);
    $('#name').val(name);
    $('#nameAr').val(nameAr);
    $('#btnSave').text('Update Changes');
    $("#carcassModalTitleText").text('Edit Carcass Information');
    $("#carcassModal").modal('show')
});

$(document).on('click', '#deleteBtn', function () {

    var id = $(this).data('id');
    var api_url = baseURLValue + 'DeleteAnimalCategory';
    // Call the generic SweetAlert confirmation function
    showConfirmAlert(
        'warning', // Icon type
        'Are you sure?', // Title
        'Do you want to delete this record?', // Text
        'Yes, confirm!', // Confirm button text
        'Cancel' // Cancel button text
    ).then((result) => {
        if (result.isConfirmed) {
            $('#loaderModal').show();
            // If user clicks "Yes, delete it!"
            const obj = {
                ID: id,
                IsDelete: 1
            }
            makeApiCall({
                url: api_url,
                method: 'DELETE',
                token: token,
                data: obj,
                successCallback: function (result) {
                    showSweetAlert('success', '', '', result.actualData[0]['Message'], 5000)
                        .then(() => {
                            $('#loaderModal').hide();
                            LoadCarcassInfoOrAnimalCategories();
                        });
                },
                errorCallback: function (xhr, status, error) {
                    $('#loaderModal').hide();
                    showSweetAlert('error', 'Transaction Failed', xhr.responseJSON.actualData[0]['Message'], ``, 5000);   //Passing the values to SweetAlert class
                    console.error("Error:" + error);
                }
            });

        } else {
            $('#loaderModal').hide();
            showSweetAlert('error', 'Deletion Cancelled', 'Your record is safe!', ``, 2000);   //Passing the values to SweetAlert class
        }
    });
});

//#endregion

//#region Modal Close Buttons

$("#btnClose").click(function CloseModal() {
    $('#animalCategoryDD').val(0);
    $('#code').val('');
    $('#name').val('');
    $('#nameAr').val('');
});

$("#crossBtn").click(function CloseModal() {
    $('#animalCategoryDD').val(0);
    $('#code').val('');
    $('#name').val('');
    $('#nameAr').val('');
});

//#endregion

//#region "Select All or Indivisual Selection option"

// Toggle all checkboxes when master checkbox is clicked
$('#carcassTable').on('change', '#selectAll', function () {
    var isChecked = $(this).is(':checked');
    $('.row-checkbox').prop('checked', isChecked);
    if (isChecked) {
        $('.row-checkbox').each(function () {
            var $row = $(this).closest('tr'); // Get the closest row
            var rowData = [];

            $row.find('td').each(function () {
                rowData.push($(this).text().trim());
            });
            var hsCodeIndex = 16;
            var hsCode = rowData[hsCodeIndex];
            var invoiceNoIndex = 2;
            var invoiceNo = rowData[invoiceNoIndex];
            if (!hsCode) {
                Swal.fire({
                    icon: 'warning',
                    html: 'HS Code is required for Invoice# <b>' + invoiceNo + '</b>.',
                });
                $(this).prop('checked', false); // Uncheck the checkbox
                return; // Do not continue processing this row
            }
            selectedRows.push(rowData);
        });
    }
});

// Optional: update master checkbox when any row checkbox changes
$('#carcassTable').on('change', '.row-checkbox', function () {
    var id = $(this).val();
    var $row = $(this).closest('tr');

    if ($(this).is(':checked')) {
        // Collect row data
        var rowData = [];
        $row.find('td').each(function () {
            rowData.push($(this).text().trim());
        });

        // ✅ Check if hsCode is empty (column index 13)
        var hsCodeIndex = 16;
        var hsCode = rowData[hsCodeIndex];
        var invoiceNoIndex = 2;
        var invoiceNo = rowData[invoiceNoIndex];
        if (!hsCode) {
            Swal.fire({
                icon: 'warning',
                html: 'HS Code is required for Invoice# <b>' + invoiceNo + '</b>.',
            });
            $(this).prop('checked', false); // Uncheck the checkbox
            return; // Do not continue processing this row
        }
        // Add ID if not already added
        if (!selectedIds.includes(id)) {
            selectedIds.push(id);
        }

        // Add row data if not already in selectedRows
        var exists = selectedRows.some(r => JSON.stringify(r) === JSON.stringify(rowData));
        if (!exists) {
            selectedRows.push(rowData);
        }

    } else {
        // Remove from selectedIds
        selectedIds = selectedIds.filter(function (item) {
            return item !== id;
        });

        // Remove from selectedRows
        var rowDataToRemove = [];
        $row.find('td').each(function () {
            rowDataToRemove.push($(this).text().trim());
        });

        selectedRows = selectedRows.filter(r => JSON.stringify(r) !== JSON.stringify(rowDataToRemove));
    }

    // Update "select all" checkbox
    var total = $('.row-checkbox').length;
    var checked = $('.row-checkbox:checked').length;
    $('#selectAll').prop('checked', total === checked);
});

//#endregion

//#region "Save Token in hidden field"

$("#btnSave").click(function SaveEditButton() {
    if ($("#tokenValue").val() == "") {
        alert("Please select an Environment.");
    }
    $("#tokenValueInput").val($("#tokenValue").val());
    $("#carcassModal").modal('hide');

});

//#endregion

//#region "Fetch Token on Environment Selection"

$("#tokenDD").change(function () {
    
    if ($("#tokenDD").val() != "select") {
        if (!localStorage.getItem('token')) {
            window.location.href = baseURLValue;
            $("#tokenValue").val("");
        } else {
            var api_url = baseURLValue + 'getTokenCallEncrypted';
            $("#tokenValue").val("");
            $("#tokenValueInput").val("");
            
            const tokenObj = {
                tokenKey : $("#tokenDD").val()
            };
            makeApiCall({
                url: api_url,
                method: 'POST',
                token: token,
                data: tokenObj, // You can pass any data you want to send
                successCallback: function (result) {
                    
                    $("#tokenValue").val(result.token);
                    $("#tokenValueInput").val(result.token);
                },
                errorCallback: function (xhr, status, error) {
                    console.error("Error:", error);
                    $("#tokenValue").val("");
                    $("#tokenValueInput").val("");
                }
            });
    
        }
        
    }
    else{
        $("#tokenValue").val("");
        $("#tokenValueInput").val("");
    }
    
});

//#endregion

//#region "Search Btn click"

$("#searchBtn").click(function () {
    
    var fromDateSelect = $("#fromDate").val();
    var toDateSelect = $("#toDate").val();

    if (fromDateSelect == "" || toDateSelect == "") {
        alert("Error: Invalid Date.");
        return;
    };

    if (toDateSelect < fromDateSelect) {
        alert("Error: To Date can't be less then From Date.");
        return;
    };

    LoadInvoices(fromDateSelect, toDateSelect);
});

//#endregion

//#region "Push to FBR button click"

$("#pushToFBRBtn").click(function AddBtn() {
debugger
    if (selectedRows.length === 0) {
        alert("Please select an invoice to push.");
        return;
    }

    const keys = [
        "invoiceRefNo", "invoiceType", "sroItemSerialNo", "productDescription",
        "buyerNTNCNIC", "buyerBusinessName", "buyerProvince", "buyerAddress", "buyerRegistrationType",
        "sellerNTNCNIC", "sellerBusinessName", "sellerProvince", "sellerAddress", 
        "invoiceDate", "hsCode", "uoM", "scenarioId", "rate",  "quantity", 
        "totalValues", "valueSalesExcludingST", "fixedNotifiedValueOrRetailPrice",
        "salesTaxApplicable", "salesTaxWithheldAtSource", "extraTax", "furtherTax",
        "sroScheduleNo", "fedPayable", "discount", "saleType"
    ];

    let cleanedRows = selectedRows.map(row => row.slice(2)); // clean data
console.log("cleanedRows: " + cleanedRows);
    // Convert to array of objects
    const rawDataObjects = cleanedRows.map(valuesArr => {
        const obj = {};
        keys.forEach((key, idx) => {
            obj[key] = valuesArr[idx];
        });
        return obj;
    });

    console.log(rawDataObjects);

    // Grouping logic
    const groupedByInvoice = {};

    rawDataObjects.forEach(item => {
        const invoiceKey = item.invoiceRefNo;
debugger
        if (!groupedByInvoice[invoiceKey]) {
            groupedByInvoice[invoiceKey] = {
                invoiceRefNo: item.invoiceRefNo,
                invoiceType: item.invoiceType,
                invoiceDate: item.invoiceDate,
                sellerNTNCNIC: item.sellerNTNCNIC,
                sellerBusinessName: item.sellerBusinessName,
                sellerProvince: item.sellerProvince,
                sellerAddress: item.sellerAddress,
                buyerNTNCNIC: item.buyerNTNCNIC,
                buyerBusinessName: item.buyerBusinessName,
                buyerProvince: item.buyerProvince,
                buyerAddress: item.buyerAddress,
                buyerRegistrationType: item.buyerRegistrationType,
                scenarioId: item.scenarioId,
                items: []
            };
        }

        // console.log("Before mapping to item: " + groupedByInvoice)

        // Push item-specific fields into `items`
        groupedByInvoice[invoiceKey].items.push({
            hsCode: item.hsCode.split("-")[0],
            productDescription: item.productDescription,
            rate: item.rate,
            uoM: item.uoM,
            quantity: Number(item.quantity),

            totalValues: Number(item.totalValues.replace(/,/g, '')),
            valueSalesExcludingST: Number(item.valueSalesExcludingST.replace(/,/g, '')),

            fixedNotifiedValueOrRetailPrice: Number(item.fixedNotifiedValueOrRetailPrice),
            salesTaxApplicable: Number(item.salesTaxApplicable.replace(/,/g, '')),
            salesTaxWithheldAtSource: Number(item.salesTaxWithheldAtSource),
            extraTax: item.extraTax,
            furtherTax: Number(item.furtherTax),
            sroScheduleNo: item.sroScheduleNo,
            fedPayable: Number(item.fedPayable),
            discount: Number(item.discount),
            saleType: item.saleType,
            sroItemSerialNo: item.sroItemSerialNo
        });
        console.log("After mapping to item: " + groupedByInvoice); 
    });

    // Final payload: convert grouped object to array
    const finalPayload = Object.values(groupedByInvoice);
        debugger
    console.log("Final Payload:", finalPayload);
    debugger
    const FBR_token = $("#tokenValueInput").val();

    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
        $("#tokenValue").val("");
    } else {
        var api_url = baseURLValue + 'getTokenCallDecrypted';
        $("#tokenValue").val("");
        const tokenObj = {
            decTokenKey : FBR_token
        };
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: tokenObj, // You can pass any data you want to send
            successCallback: function (result) {
                // var fbrAPIToken = $("#tokenValue").val(result.token);
                const fbrAPIToken = result.token;
                
                
                console.log(fbrAPIToken);
                debugger
                // At this point you can:
                // - send finalPayload to API
                // ----- AJAX CALL -----
    
                // Loop over each invoice and send a request
                finalPayload.forEach((invoicePayload, index) => {
                    $.ajax({
                        url: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
                        method: 'POST',
                        contentType: 'application/json',
                        headers: {
                            'Authorization': 'Bearer ' + fbrAPIToken.trim()
                        },
                        data: JSON.stringify(invoicePayload),
                        success: function (response) {
                            debugger
                            console.log(`Invoice ${invoicePayload.invoiceRefNo} pushed successfully`, response);

                            // If it's the last invoice, reset UI
                            if (index === finalPayload.length - 1) {
                                alert('All invoices pushed successfully!');
                                selectedIds = [];
                                selectedRows = [];
                                $('.row-checkbox').prop('checked', false);
                                $('#selectAll').prop('checked', false);
                            }
                        },
                        error: function (xhr, status, error) {
                            debugger
                            console.error(`Failed to push invoice ${invoicePayload.invoiceRefNo}`, error);
                            alert(`Failed to push invoice ${invoicePayload.invoiceRefNo}. Check console for details.`);
                        }
                    });
                });

                // $.ajax({
                //     url: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',        // <-- Replace with your API URL
                //     method: 'POST',
                //     contentType: 'application/json',
                //     headers: {
                //         'Authorization': 'Bearer ' + fbrAPIToken.trim()
                //     },
                //     data: JSON.stringify(finalPayload),
                //     success: function(response) {
                //         debugger
                //         alert('Invoices pushed successfully!');
                //         console.log('Server response:', response);

                //         // Reset selections/UI after success
                //         selectedIds = [];
                //         selectedRows = [];
                //         $('.row-checkbox').prop('checked', false);
                //         $('#selectAll').prop('checked', false);
                //     },
                //     error: function(xhr, status, error) {
                //         debugger
                //         alert('Failed to push invoices. Please try again.');
                //         console.error('AJAX error:', error);
                //     }
                // });
                // var settings = {
                //     "url": "https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb",
                //     "method": "POST",
                //     "timeout": 0,
                //     "headers": {
                //       "Content-Type": "application/json",
                //       "Authorization": "Bearer " + fbrAPIToken.trim(),
                //       //"Cookie": "key=value; JSESSIONID=UTEgay50xuTXTO5tAlGTc8pDqmZoa3AhOiFr1B73.i01-irisdmz54; cookiesession1=678B28F2CB763E08E0DF447115BEDAFB"
                //     },
                //     "data": JSON.stringify(finalPayload),
                //     // "data": JSON.stringify({
                //     //     "invoiceType": "Sale Invoice",
                //     //     "invoiceDate": "yyyy-MM-dd",
                //     //     "sellerNTNCNIC": "1522054",
                //     //     "sellerBusinessName": "Your Business Name",
                //     //     "sellerProvince": "Seller Province",
                //     //     "sellerAddress": "Seller Address",
                //     //     "buyerNTNCNIC": "0000000000000",
                //     //     "buyerBusinessName": "Buyer Business Name",
                //     //     "buyerProvince": "Buyer Province",
                //     //     "buyerAddress": "Buyer Address",
                //     //     "buyerRegistrationType": "Registered",
                //     //     "invoiceRefNo": "",
                //     //     "scenarioId": "SN000",
                //     //     "items": [
                //     //       {
                //     //         "hsCode": "0000.0000",
                //     //         "productDescription": "",
                //     //         "rate": "0%",
                //     //         "uoM": "",
                //     //         "quantity": 0,
                //     //         "totalValues": 0,
                //     //         "valueSalesExcludingST": 0,
                //     //         "fixedNotifiedValueOrRetailPrice": 0,
                //     //         "salesTaxApplicable": 0,
                //     //         "salesTaxWithheldAtSource": 0,
                //     //         "extraTax": "",
                //     //         "furtherTax": 0,
                //     //         "sroScheduleNo": "",
                //     //         "fedPayable": 0,
                //     //         "discount": 0,
                //     //         "saleType": "",
                //     //         "sroItemSerialNo": ""
                //     //       }
                //     //     ]
                //     //   }),
                //   };

                //   $.ajax(settings).done(function (response) {
                //     console.log(response);
                //   });
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
                $("#tokenValue").val("");
            }
        });
    };
});

//#endregion

//#region "Load Scenarios"

function LoadScenarios() {
    
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
    } else {
        
        var api_url = baseURLValue + 'getScenarios';
        makeApiCall({
            url: api_url,
            method: 'GET',
            token: token,
            data: {}, // You can pass any data you want to send
            successCallback: function (result) {
                FillDropDown('scenariosDD', 'Select Scenario', result.actualData)
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });

    }
};

//#endregion
