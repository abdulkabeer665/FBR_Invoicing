//#region "Declaration"
const baseURLValue = baseURL;
var addEditBtnFlag = 0;
var datatableReload = 0;
const token = localStorage.getItem('token');
var selectedIds = [];
selectedRows = [];
let scenariosList = []; // Global variable to hold scenario data
let provincesList = []; // Global variable to hold scenario data
let scenarioIDSelected = "";
let scenarioIDSelectedCheckbox = "";
let provinceSelected = "";
let salesTypeSelected = "";
let salesTypeSelectedCheckbox = "";
let salesTypeSelectedArr = [];
let salesTypeSelectedArrCheckbox = [];
let itemCounter = 0; // counter to track current index in salesTypeSelectedArr
let transactionTypeID = 0;
let rate_ID = 0;
let rate_Desc = "";
let sro_ID = 0;
let sro_Desc = "";
let sro_item_ID = 0;
let sro_item_Desc = "";
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
    LoadProvinces();
    $("#environment").text(localStorage.getItem('environmentName'));
    if (localStorage.getItem('pushToken') == null || localStorage.getItem('pushToken') == "") {
        $("#carcassModal").modal('show');
    }
    $("#tokenValueInput").val(localStorage.getItem('pushToken'));
});

$("#environment").click(function () {
    $("#carcassModal").modal('show');
});

//#endregion

//#region Load Invoices from GP

function LoadInvoices(frmDate, toDate) {
    $('#loaderRow').show();
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
    } else {
        const obj = {
            fromDate: frmDate,
            toDate: toDate
        }
        var api_url = baseURLValue + 'getSalesReport';
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: obj, // You can pass any data you want to send
            successCallback: function (result) {
                FillDataTable(result.actualData);
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });
    }
};

//#region "Fill DataTable"
function FillDataTable(jsonData) {
    var table = $("#" + 'carcassTable');
    var tbody = table.find('tbody');
    tbody.empty();
    var rows = [];
    if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
    };
    jsonData.forEach(function (data, index) {
        var row = $('<tr/>');
        // var status = data['TrxStatus'].trim();
        var status = "";
        var icon = '';
        var color = '';

        // if (status === 'Un-Posted') {
        //     icon = '&#10006;'; // ✗ cross
        //     color = 'red';
        // } else if (status === 'Posted') {
        //     icon = '&#10004;'; // ✓ tick
        //     color = 'green';
        // }
        if (data["FBR_Invoice_No"] == "" || data["FBR_Invoice_No"] == null) {
            icon = '&#10006;'; // ✗ cross
            color = 'red';
            status = "Not pushed to FBR";
        } else {
            icon = '&#10004;'; // ✓ tick
            color = 'green';
            status = "Pushed to FBR";
        }
        if (data["FBR_Invoice_No"] == "" || data["FBR_Invoice_No"] == null) {
            row.append('<td><input type="checkbox" class="row-checkbox"></td>');
        }
        else {
            row.append('<td><input disabled type="checkbox" class="row-checkbox"></td>');    
        }
        // row.append('<td><input type="checkbox" class="row-checkbox"></td>');
        row.append('<td style="text-align: center; color:' + color + ';" title="' + status + '">' + icon + '</td>');
        row.append('<td>' + data['Document No.'].trim() + '</td>'); //Invoice No or "invoiceRefNo"
        row.append('<td>Sale Invoice</td>');   //Invoice Type
        const sroItemSerialNoCellID = "sroItemSchNo-" + index;
        row.append('<td>' + data['Item Number'].trim() + '</td>');   //Zultec Item No
        row.append('<td id="' + sroItemSerialNoCellID + '"></td>');  //Item No or "sroItemSerialNo"
        row.append('<td>' + data['Item Description'].trim() + '</td>'); //Item Description or "productDescription"

        //#region Buyer Information
        const buyerNTN = data['NTN#'].trim().split('-')[0];
        row.append('<td>' + buyerNTN + '</td>'); //Customer NTN# or "buyerNTNCNIC"
        row.append('<td>' + data['Customer Name'].trim() + '</td>');    //Name of Custom or "buyerBusinessName"
        
        if (data['Location'].trim() != 'Karachi') {
            row.append('<td>' + 'Punjab' + '</td>');    //Province or "buyerProvince"
        }
        else {
            row.append('<td>' + 'Sindh' + '</td>');    //Province or "buyerProvince"
        }
        row.append('<td>' + data['Location'].trim() + '</td>'); //Location/Station or "buyerAddress"
        // row.append('<td>Registered</td>'); //Buyer Registration Type or "buyerRegistrationType"
        const registrationCellID = 'reg-' + index;
        // row.append('<td id="' + registrationCellID + '">Loading...</td>')
        row.append('<td class="registration-cell">Loading...</td>');
        row.attr('data-ntn', buyerNTN);
        const regCell = row.find('.registration-cell');
        if (buyerNTN !== "") {            
            // fetchRegistrationTypefromAPI(buyerNTN, registrationCellID);
            fetchRegistrationTypefromAPI(buyerNTN, regCell);
        }
        //#endregion
        
        //#region Seller Information

        row.append('<td>1522054</td>');  //Seller NTNCNIC or "sellerNTNCNIC"
        row.append('<td>' + data['Manufacturer'] + '</td>');  //Seller Business Name or "sellerBusinessName"
        if (data['Location'].trim() != 'Karachi') {
            row.append('<td>' + 'Punjab' + '</td>');    //Province or "buyerProvince"
        }
        else {
            row.append('<td>' + 'Sindh' + '</td>');    //Province or "buyerProvince"
        }
        
        // let provincesOptions = provincesList.map(s => {
        //     return `<option value="${s.ID}">${s.Value}</option>`;
        // }).join('');
        // row.append(`<td><select class="form-control provinces-dropdown">${provincesOptions}</select></td>`);

        row.append('<td>Korangi</td>');  //Seller Address or "sellerAddress"

        //#endregion
        row.append('<td style="text-align: right;">' + new Date(data['Document Date']).toISOString().split('T')[0] + '</td>');  //Invoice Date or "invoiceDate"
        
        //#region HS Code and Unit of measurement work
        const hsCodeCellID = 'hsCode-' + index;
        const uomCellID = 'uom-' + index;
        let hsValue = (data['HS Code'] ?? "").trim();
        let firstPart = ''; let secondPart = '';
        if (hsValue !== "") {
            if (hsValue.includes("-")) {
                firstPart = hsValue.split("-")[0].trim();
                secondPart = hsValue.split("-")[1].trim();
            } else {
                firstPart = hsValue;
                secondPart = '';
            }
        }
        row.append('<td id="' + hsCodeCellID + '" class="editable-hs" style="cursor:pointer;">' + firstPart + '</td>');
        row.append('<td>' + secondPart + '</td>');

        row.attr('data-hs', hsValue);   //newly added        
        row.append('<td class="uom-cell">Loading...</td>'); //newly added
        const uomCell = row.find('.uom-cell');
        if (hsValue !== "") {
            // fetchUOMFromAPI(hsValue, uomCellID);            
            fetchUOMFromAPI(hsValue, uomCell);
        } else {
            $('#' + uomCellID).html('');
        }

        // if ((data['HS Code'] ?? "").trim() === "") {
        //     row.append('<td></td>'); //HS Code or "hsCode"
        //     row.append('<td></td>'); //HS Code or "hsCode"
        // }
        // else {
        //     if (data['HS Code'].trim().includes("-")) {
        //         row.append('<td>' + data['HS Code'].split("-")[0].trim() + '' + '</td>'); //HS Code or "hsCode"
        //         row.append('<td>' + data['HS Code'].split("-")[1].trim() + '</td>'); //HS Code or "hsCode"    
        //     }
        //     else {
        //         row.append('<td>' + data['HS Code'].split(" ")[0].trim() + ':-' + '</td>'); //HS Code or "hsCode"
        //         row.append('<td></td>'); //HS Code or "hsCode"    
        //     }
        // }
        // if (data['HS Code'] && data['HS Code'].trim() !== "") {
        //     const uomCellID = 'uom-' + index; // Make a unique ID for each row's UOM cell
        //     row.append('<td id="' + uomCellID + '">Loading...</td>');
        //     fetchUOMFromAPI(data['HS Code'].trim(), uomCellID);
        // }
        // else {
        //     const uomCellID = 'uom-' + index; // Make a unique ID for each row's UOM cell
        //     row.append('<td id="' + uomCellID + '"></td>');
        // }
        //#endregion
        row.append('<td>' + data['Category'] + '</td>');

        //#region "Scenario Dropdown"
        let scenarioOptions = scenariosList.map(s => {
            return `<option value="${s.ID}">${s.Value}</option>`;
        }).join('');
        row.append(`<td><select class="form-control scenario-dropdown">${scenarioOptions}</select></td>`);        
        //#endregion

        const rateCellID = 'rate-' + index;
        row.append('<td id="' + rateCellID + '">' + data["Tax Schedule ID"].split(" ")[1] + '</td>');
        // row.append('<td style="text-align: right;">' + Number(data['Qty']) + '</td>');  //Production Qty or "quantity"
        const qtyCellID = 'qty-' + index;
        row.append('<td id="' + qtyCellID + '" class="editable-qty" style="text-align:right; cursor:pointer;">' + Number(data['Qty']).toLocaleString() + '</td>');
        row.append('<td>' + 0 + '</td>');   //Total or "totalValues"
        const netAmountCellID = 'netAmount-' + index;
        //row.append('<td id="' + netAmountCellID + '" style="text-align: right;">' + (Number(data['Net Amount'])).toLocaleString() + '</td>');   //Sales Amount or "valueSalesExcludingST"
        row.append('<td id="' + netAmountCellID + '" class="editable" style="text-align: right; cursor:pointer;">' + (Number(data['Net Amount'])).toLocaleString() + '</td>');
        row.append('<td>0</td>'); //Fixed Notified Value Or Retail Price or "fixedNotifiedValueOrRetailPrice"
        const salesTaxCellID = 'salesTax-' + index;
        if (data['Tax Schedule ID'].split(" ")[1].includes("%")) {
            let value = data["Tax Schedule ID"].split(" ")[1]; // e.g., "18%"
            let numberOnly = value.match(/\d+/)[0]; // "18"
            let taxRate = Number(numberOnly); // 18 as number
            let netAmount = Number(data["Net Amount"]); // e.g., 100
            let taxAmount = (netAmount * taxRate) / 100;
            //row.append('<td id="' + salesTaxCellID + '" style="text-align: right;">' + Number(taxAmount).toLocaleString() + '</td>');  //Sales Tax Applicable or "salesTaxApplicable"
            row.append('<td id="' + salesTaxCellID + '" class="editable-tax" style="text-align: right; cursor:pointer;">' + Number(taxAmount).toLocaleString() + '</td>');
        }
        else {
            row.append('<td style="text-align: right;">0</td>');  //Sales Tax Applicable or "salesTaxApplicable"
        }
        row.append('<td>' + 0 + '</td>');   //Sales Tax With Held At Source or "salesTaxWithheldAtSource"
        row.append('<td></td>');    //Extra Tax or "extraTax"
        row.append('<td>' + 0 + '</td>');   //Further Tax or "furtherTax"
        const sroSchCellID = "sroSch-" + index;
        row.append('<td id="' + sroSchCellID + '"></td>');  //Item No or "sroItemSerialNo"
        row.append('<td>' + 0 + '</td>');   //FED Payable or "fedPayable"
        row.append('<td>' + 0 + '</td>');   //Discount or "discount"
        row.append('<td>' + (data["FBR_Invoice_No"] ?? '') + '</td>');   //FBR_Invoice_No
        row.append(createDropdownMenu(data)); // Dropdown menu
        rows.push(row);
    });

    // Append all rows at once
    tbody.append(rows);
    $('#loaderRow').hide();
    var dt = $('#carcassTable').DataTable({
        order: [[2, "asc"]],
        dom: '<"row justify-content-between top-information"lf>rt<"row justify-content-between bottom-information"ip><"clear">',
        scrollX: true,
        scrollCollapse: true,
        fixedColumns: {
            leftColumns: 3   // freeze Invoice Ref No column
        },
        drawCallback: function () {
            $('#carcassTable tbody tr').each(function () {
                const $row = $(this);
                const hsCode = $row.attr('data-hs');
                const $uomCell = $row.find('.uom-cell');

                if (hsCode && $uomCell.text() === 'Loading...') {
                    fetchUOMFromAPI(hsCode, $uomCell);
                }
            });
        }
    });    
    const dropdown = $('.scenario-dropdown').first();
    handleScenarioChange(dropdown, "SN001 - Goods at standard rate (default)");
    const provincesDropdown = $('.provinces-dropdown').first();
    handleProvinceChange(provincesDropdown, "AZAD JAMMU AND KASHMIR");

    //#region Net Amount input field section
    $('#carcassTable tbody').off('click', 'td.editable'); // prevent duplicate binding
    $('#carcassTable tbody').on('click', 'td.editable', function () {
        var cell = dt.cell(this);
        var originalValue = cell.data().toString().replace(/,/g, '');
        var $td = $(this);
        // Prevent multiple inputs
        if ($td.find('input').length > 0) return;
        var input = $('<input type="text" class="form-control" style="text-align:right;">').val(originalValue);
        $td.html(input);
        input.focus().select();
        // Save on Enter or Blur
        input.on('blur keydown', function (e) {
            if (e.type === 'blur' || e.key === 'Enter') {
                var newValue = $(this).val().replace(/,/g, '');
                if (isNaN(newValue) || newValue === '') {
                    newValue = originalValue;
                }
                var formatted = Number(newValue).toLocaleString();
                cell.data(formatted).draw(false);
                // 🔥 Recalculate Sales Tax automatically
                var rowIndex = dt.row($td.closest('tr')).index();
                recalculateTax(rowIndex, Number(newValue));
            }
            if (e.key === 'Escape') {
                cell.data(Number(originalValue).toLocaleString()).draw(false);
            }
        });
    });
    //#endregion

    //#region Sales Tax Applicable input field section
    $('#carcassTable tbody').off('click', 'td.editable-tax');
    $('#carcassTable tbody').on('click', 'td.editable-tax', function () {
        var cell = dt.cell(this);
        var originalValue = cell.data().toString().replace(/,/g, '');
        var $td = $(this);
        if ($td.find('input').length > 0) return;
        var input = $('<input type="text" class="form-control" style="text-align:right;">').val(originalValue);
        $td.html(input);
        input.focus().select();
        input.on('blur keydown', function (e) {
            if (e.type === 'blur' || e.key === 'Enter') {
                var newValue = $(this).val().replace(/,/g, '');
                if (isNaN(newValue) || newValue === '') {
                    newValue = originalValue;
                }
                var formatted = Number(newValue).toLocaleString();
                cell.data(formatted).draw(false);
            }
            if (e.key === 'Escape') {
                cell.data(Number(originalValue).toLocaleString()).draw(false);
            }
        });
    });
    //#endregion

    //#region HS Code input field section
    $('#carcassTable tbody').off('click', 'td.editable-hs');
    $('#carcassTable tbody').on('click', 'td.editable-hs', function () {        
        var cell = dt.cell(this);
        var originalValue = cell.data().toString().trim();
        var $td = $(this);
        if ($td.find('input').length > 0) return;
        var input = $('<input type="text" class="form-control">').val(originalValue);
        $td.html(input);
        input.focus().select();
        input.on('blur keydown', function (e) {
            if (e.type === 'blur' || e.key === 'Enter') {
                var newValue = $(this).val().trim();
                if (newValue === '') newValue = originalValue;
                cell.data(newValue).draw(false);
                // 🔥 Get correct row index safely
                var rowIndex = dt.row($td.closest('tr')).index();
                var uomCellID = 'uom-' + rowIndex;
                $('#' + uomCellID).html("Loading...");
                fetchUOMFromAPI(newValue, uomCellID);
            }
            if (e.key === 'Escape') {
                cell.data(originalValue).draw(false);
            }
        });
    });
    //#endregion

    //#region Production Qty input field section
    $('#carcassTable tbody').off('click', 'td.editable-qty');
    $('#carcassTable tbody').on('click', 'td.editable-qty', function () {
        var cell = dt.cell(this);
        var originalValue = cell.data().toString().replace(/,/g, '');
        var $td = $(this);
        if ($td.find('input').length > 0) return;
        var input = $('<input type="text" class="form-control" style="text-align:right;">').val(originalValue);
        $td.html(input);
        input.focus().select();
        input.on('blur keydown', function (e) {
            if (e.type === 'blur' || e.key === 'Enter') {
                var newValue = $(this).val().replace(/,/g, '');
                if (isNaN(newValue) || newValue === '') {
                    newValue = originalValue;
                }
                var formatted = Number(newValue).toLocaleString();
                cell.data(formatted).draw(false);
                // 🔥 OPTIONAL: If you want recalculation
                var rowIndex = dt.row($td.closest('tr')).index();
                recalculateRow(rowIndex); // Create this if needed
            }
            if (e.key === 'Escape') {
                cell.data(Number(originalValue).toLocaleString()).draw(false);
            }
        });
    });
    //#endregion

};

//#endregion

//#region Recalculate Tax Value

function recalculateTax(rowIndex, netAmount) {

    var dt = $('#carcassTable').DataTable();
    var rowNode = dt.row(rowIndex).node();

    var rateText = $(rowNode).find('td[id^="rate-"]').text();

    if (rateText.includes('%')) {
        var rate = parseFloat(rateText.replace('%', ''));
        var taxAmount = (netAmount * rate) / 100;

        $(rowNode).find('td[id^="salesTax-"]')
            .text(Number(taxAmount).toLocaleString());
    }
};

//#endregion

//#region Recalculate Row Value

function recalculateRow(rowIndex, netAmount) {

    var dt = $('#carcassTable').DataTable();
    var rowNode = dt.row(rowIndex).node();

    var rateText = $(rowNode).find('td[id^="rate-"]').text();

    // if (rateText.includes('%')) {
    //     var rate = parseFloat(rateText.replace('%', ''));
    //     var taxAmount = (netAmount * rate) / 100;

    //     $(rowNode).find('td[id^="salesTax-"]')
    //         .text(Number(taxAmount).toLocaleString());
    // }
};

//#endregion

//#region "Create Dropdown Menu"

function createDropdownMenu(data) {
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

                // Validate option
                $('<a/>', {
                    'class': 'dropdown-item',
                    'style': 'cursor: pointer',
                    // 'data-id': data['ID'],
                    // 'data-code': data['Code'],
                    // 'data-name': data['Name'],
                    // 'data-nameAr': data['NameAr'],
                    // 'data-line-type-id': data['LineTypeID'],
                    'id': 'validateBtn'  // unique id for edit button
                }).append(
                    $('<i/>', { 'class': 'bx bx-key me-1' }),
                    ' Validate'
                ),

                // // Second option (example: Print)
                // $('<a/>', {
                //     'class': 'dropdown-item',
                //     'style': 'cursor: pointer',
                //     // 'data-id': data['Document No.'].trim(),
                //     'data-id': (data["FBR_Invoice_No"] ?? ''),
                //     'id': 'printBtn'  // unique id for edit button
                // }).append(
                //     $('<i/>', { 'class': 'bx bx-check me-1' }),
                //     ' Print QR Code'
                // )
            )
        )
    );
};

//#endregion

//#endregion

//#region "Print Button"

$(document).on('click', '#printBtn', function PrintQRCode() {

    // var api_url = baseURLValue + 'save-qr';
            
    //         var fbr_Invoice_No = $(this).data('id');
    //         var tempDiv = document.createElement("div");
    //         var qrcode = new QRCode(tempDiv, {
    //             text: fbr_Invoice_No,
    //             width: 200,      // pixel size
    //             height: 200,
    //             correctLevel: QRCode.CorrectLevel.M, // error correction level (L, M, Q, H)
    //             version: 2       // force QR code version 2
    //             //QRCode.CorrectLevel.L → Low (7%)
    //             //QRCode.CorrectLevel.M → Medium (15%)
    //             //QRCode.CorrectLevel.Q → Quartile (25%)
    //             //QRCode.CorrectLevel.H → High (30%)
    //         });
    //         setTimeout(function () {
    //             var qrImg = tempDiv.querySelector("img");
    //             var qrBase64 = qrImg.src;
    //             makeApiCall({
    //                 url: api_url,
    //                 method: 'POST',
    //                 token: token,
    //                 data: {
    //                     image: qrBase64,
    //                     invoice: fbr_Invoice_No_1
    //                 },
    //                 successCallback: function (result) {
    //                     console.log(result);
    //                 },
    //                 errorCallback: function (xhr, status, error) {
    //                     alert("Bad Request: " + xhr.responseText)
    //                     console.error("Error:", error, xhr.responseText);
    //                 }
    //             })
    //         });        
    
    const fbr_Invoice_No = $(this).data('id');
    if (fbr_Invoice_No != "" && fbr_Invoice_No != undefined) {
        var tempDiv = document.createElement("div");
        var qrcode = new QRCode(tempDiv, {
            text: fbr_Invoice_No,
            width: 200,      // pixel size
            height: 200,
            correctLevel: QRCode.CorrectLevel.M, // error correction level (L, M, Q, H)
            version: 2       // force QR code version 2
            //QRCode.CorrectLevel.L → Low (7%)
            //QRCode.CorrectLevel.M → Medium (15%)
            //QRCode.CorrectLevel.Q → Quartile (25%)
            //QRCode.CorrectLevel.H → High (30%)
        });
        setTimeout(function () {
            var qrImg = tempDiv.querySelector("img");
            var imagePath = window.location.origin + "/assets/img/icons/brands/fbrdigitalinvoicing.png";
            var printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>
                            Print FBR Invoice #
                        </title>
                        <style>
                            @page {
                                margin: 0; /* removes browser print margins */
                            }
                            body {
                                margin: 0;
                                padding: 5px 0 0 3px;
                                font-family: Arial, sans-serif;
                            }
                            .container {
                                display: flex;
                                flex-direction: column;
                                align-items: flex-start;
                            }
                            .row {
                                display: flex;
                                gap: 5px;
                                align-items: center;
                            }
                            .print-img {
                                width: 40px;
                                height: auto;
                            }
                            .print-text {
                                margin-top: 2px;
                                font-size: 8px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="row" style="margin-left: 42px;">
                                <img src="${imagePath}" class="print-img" />
                                <img src="${qrImg.src}" class="print-img" />
                            </div>
                            <div class="print-text">
                                <strong>FBR Invoice # :</strong> ${fbr_Invoice_No}
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };
        }, 100);
    } else {
        alert("FBR Invoice # not found. Invoice is not pushed to FBR.");
    }
});

// $(document).on('click', '#printBtn', function () {

//     var api_url = baseURLValue + 'save-qr';
//     var fbr_Invoice_No = $(this).data('id');
//     var tempDiv = document.createElement("div");
//     var qrcode = new QRCode(tempDiv, {
//         text: fbr_Invoice_No,
//         width: 200,
//         height: 200,
//         correctLevel: QRCode.CorrectLevel.M
//     });
//     setTimeout(function () {
//         var qrBase64 = "";
//         var img = tempDiv.querySelector("img");
//         var canvas = tempDiv.querySelector("canvas");
//         if (img) {
//             qrBase64 = img.src;
//         }
//         else if (canvas) {
//             qrBase64 = canvas.toDataURL("image/png");
//         }
//         if (!qrBase64) {
//             console.error("QR generation failed");
//             return;
//         }
//         makeApiCall({
//             url: api_url,
//             method: 'POST',
//             token: token,
//             data: {
//                 image: qrBase64,
//                 invoiceNo: fbr_Invoice_No
//             },
//             successCallback: function (result) {
//                 console.log(result);
//             },
//             errorCallback: function (xhr, status, error) {
//                 alert("Bad Request: " + xhr.responseText);
//                 console.error("Error:", error, xhr.responseText);
//             }
//         });

//     }, 200);

// });

//#endregion

//#region Validate Buttons

// Event delegation for dynamically created buttons
$(document).on('click', '#validateBtn', function EditBtn() {
    if (selectedRows.length === 0) {
        alert("Please select an invoice to push.");
        return;
    }
    var keys = [
        "invoiceRefNo", "invoiceType", "zultecItemNo", "sroItemSerialNo", "productDescription",
        "buyerNTNCNIC", "buyerBusinessName", "buyerProvince", "buyerAddress", "buyerRegistrationType",
        "sellerNTNCNIC", "sellerBusinessName", "sellerProvince", "sellerAddress",
        "invoiceDate", "hsCode", "hsCodeDesc", "uoM", "category", "scenarioId", "rate", "quantity",
        "totalValues", "valueSalesExcludingST", "fixedNotifiedValueOrRetailPrice",
        "salesTaxApplicable", "salesTaxWithheldAtSource", "extraTax", "furtherTax",
        "sroScheduleNo", "fedPayable", "discount", "saleType", "fbr_invoice_no"
    ];
    let cleanedRows = selectedRows.map(row => row.slice(2)); // clean data
    const rawDataObjects = cleanedRows.map(valuesArr => {
        const obj = {};
        keys.forEach((key, idx) => {
            
            if (idx !== 2 && idx !== 16 && idx !== 18 && idx !== 33) { // skip zultecItemNo = 2, hsCode = 16, cateory = 18, fbr_invoice_no = 33
                obj[key] = valuesArr[idx];
            }
        });
        return obj;
    });
    
    const groupedByInvoice = {};
    const environmentText = $("#environment").text().trim();

    rawDataObjects.forEach(item => {
        const invoiceKey = item.invoiceRefNo;
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
                //scenarioId: scenarioIDSelected,
                items: []
            };
            // ✅ Add scenarioId only in Sandbox
            if (environmentText === "(Sandbox Environment)") {
                groupedByInvoice[invoiceKey].scenarioId = scenarioIDSelected;
            }
            //groupedByInvoice[invoiceKey].sellerProvince = provinceSelected;
        }

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
            saleType: salesTypeSelectedArr[itemCounter], // assign the specific element
            sroItemSerialNo: item.sroItemSerialNo
        });

        itemCounter++; // increment counter for next item
    });

    const finalPayload = Object.values(groupedByInvoice);

    const FBR_token = $("#tokenValueInput").val();

    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
        $("#tokenValue").val("");
    } else {
        var api_url = baseURLValue + 'getTokenCallDecrypted';
        $("#tokenValue").val("");
        const tokenObj = {
            decTokenKey: FBR_token
        };
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: tokenObj,
            successCallback: function (result) {
                const fbrAPIToken = result.token;
                if (!localStorage.getItem('token')) {
                    window.location.href = baseURLValue;
                } else {                    
                    finalPayload.forEach((finalPayload, index) => {
                        $.ajax({
                            url: 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb',
                            method: 'POST',
                            contentType: 'application/json',
                            headers: {
                                'Authorization': 'Bearer ' + fbrAPIToken.trim()
                            },
                            data: JSON.stringify(finalPayload),
                            success: function (response) {
                                
                                if (response.validationResponse.invoiceStatuses == null) {
                                    alert(response.validationResponse.error)
                                }
                                else if (response.validationResponse.status == "Invalid") {
                                    alert('Failed to validate Invoice# ' + finalPayload.invoiceRefNo + '. The error is "' + response.validationResponse.invoiceStatuses[0]["error"] + '"')
                                }
                                else {  //Valid case
                                    if (!localStorage.getItem('token')) {
                                        window.location.href = baseURLValue;
                                    } else {
                                        alert("Invoice# " + finalPayload.invoiceRefNo + " validated successfully.");
                                        //var totalRows = response.validationResponse.invoiceStatuses.length;

                                        // for (let i = 0; i < response.validationResponse.invoiceStatuses.length; i++) {
                                        //     const obj = {
                                        //         Sopnumbr: finalPayload.invoiceRefNo,
                                        //         FBR_InvoiceNo: response.validationResponse.invoiceStatuses[i]['invoiceNo'],
                                        //         Dated: response.dated,
                                        //         Status: response.validationResponse.invoiceStatuses[i]['status'],
                                        //         StatusCode: response.validationResponse.invoiceStatuses[i]['statusCode'],
                                        //         ScenarioID: scenarioIDSelected,
                                        //         ScenarioDesc: salesTypeSelected
                                        //     };
                                        //     var api_url = baseURLValue + 'InsertFBR_Response';
                                        //     makeApiCall({
                                        //         url: api_url,
                                        //         method: 'POST',
                                        //         token: token,
                                        //         data: obj, // You can pass any data you want to send
                                        //         successCallback: function (result) {
                                        //             if ((i + 1) == totalRows) {
                                        //                 alert("Success: " + result.actualData[0]["Message"]);
                                        //                 window.location.href = baseURLValue + 'invoices';
                                        //             }
                                        //         },
                                        //         errorCallback: function (xhr, status, error) {
                                        //             alert("Bad Request: " + xhr.responseText)
                                        //             console.error("Error:", error, xhr.responseText);
                                        //         }
                                        //     });
                                        // };
                                    }
                                }
                            },
                            error: function (xhr, status, error) {
                                
                                console.error(`Failed to validate invoice ${finalPayload.invoiceRefNo}`, error);
                                alert(`Failed to validate invoice ${finalPayload.invoiceRefNo}. Check console for details.`);
                            }

                        });
                    });
                }
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
                $("#tokenValue").val("");
            }
        });
    };
    
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

$('#carcassTable').on('change', '.row-checkbox', function () {
    
    var id = $(this).val();
    var $row = $(this).closest('tr');

    // Collect row data for the clicked row
    var rowData = [];
    $row.find('td').each(function () {
        rowData.push($(this).text().trim());
    });
    
    var invoiceNoIndex = 2;
    var hsCodeIndex = 17;
    var scenarioIndex = 21;
    var invoiceNo = rowData[invoiceNoIndex];
    var scenarioDesc = rowData[scenarioIndex];
    var alertCheck = "";

    var scenarioDescCheck;

    // Find all rows with same invoice number
    var matchingRows = $('#carcassTable tbody tr').filter(function () {
        return $(this).find('td').eq(invoiceNoIndex).text().trim() === invoiceNo;
    });

    if ($(this).is(':checked')) {
        // Validate HS Code on all rows with the same invoice number
        let invalidRow = null;
        matchingRows.each(function () {
            var hs = $(this).find('td').eq(hsCodeIndex).text().trim();
            if (!hs) {
                invalidRow = $(this);
                alertCheck = "HS Code"
                return false;
            }
            
            // var scenarioText = $(this).find('td').eq(scenarioIndex).find('select option:selected').text().trim();
            // if (!scenarioText) {
            //     invalidRow = $(this);
            //     alertCheck = "HS Code"
            //     return false;
            // }
        });

        if (invalidRow) {
            if (alertCheck == "Select Scenario") {
                Swal.fire({
                    icon: 'warning',
                    html: 'Select Scenario for invoice# <b>' + invoiceNo + '</b>.',
                });
            }
            else if (alertCheck == "HS Code") {
                Swal.fire({
                    icon: 'warning',
                    html: 'HS Code is required for Invoice# <b>' + invoiceNo + '</b>.',
                });
            }
            matchingRows.find('.row-checkbox').prop('checked', false);
            return;
        }
		// Check all matching checkboxes
        // matchingRows.find('.row-checkbox').each(function () {
        //     var rowId = $(this).val();
        //     $(this).prop('checked', true);

        //     // Add ID
        //     if (!selectedIds.includes(rowId)) {
        //         selectedIds.push(rowId);
        //     }

        //     // Add row data
        //     var rData = [];
        //     $(this).closest('tr').find('td').each(function () {
        //         rData.push($(this).text().trim());
        //     });

        //     var exists = selectedRows.some(r => JSON.stringify(r) === JSON.stringify(rData));
        //     if (!exists) {
        //         selectedRows.push(rData);
                selectedRows.push(rowData);
        //     }
        // });
    } else {
        // Uncheck all rows with same invoice number
        matchingRows.find('.row-checkbox').each(function () {
            var rowId = $(this).val();
            $(this).prop('checked', false);
            selectedIds = selectedIds.filter(id => id !== rowId);

            // Remove row-data
            var rData = [];
            $(this).closest('tr').find('td').each(function () {
                rData.push($(this).text().trim());
            });

            selectedRows = selectedRows.filter(r => JSON.stringify(r) !== JSON.stringify(rData));
        });
    };
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
    if ($("#tokenDD").val() == "pushInvoiceToSandboxToken") {
        $("#environment").text("(Sandbox Environment)");
        localStorage.setItem('environmentName', "(Sandbox Environment)");
    }
    else if ($("#tokenDD").val() == "pushInvoiceToProductionToken") {
        $("#environment").text("(Production Environment)");
        localStorage.setItem('environmentName', "(Production Environment)");
    }
    else {

    }
    $("#tokenValueInput").val($("#tokenValue").val());
    localStorage.setItem('pushToken', $("#tokenValue").val())
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
                tokenKey: $("#tokenDD").val()
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
    else {
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
    $("#btnExport").css('display', 'block');
    $("#pushToFBRBtn").css('display', 'block');
});

//#endregion

//#region "Push to FBR button click"

$("#pushToFBRBtn").click(function AddBtn() {
    
    var invoice_Push_URL = 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata';
    if (selectedRows.length === 0) {
        alert("Please select an invoice to push.");
        return;
    }
    var keys = [
        "invoiceRefNo", "invoiceType", "zultecItemNo", "sroItemSerialNo", "productDescription",
        "buyerNTNCNIC", "buyerBusinessName", "buyerProvince", "buyerAddress", "buyerRegistrationType",
        "sellerNTNCNIC", "sellerBusinessName", "sellerProvince", "sellerAddress",
        "invoiceDate", "hsCode", "hsCodeDesc", "uoM", "category", "scenarioId", "rate", "quantity",
        "totalValues", "valueSalesExcludingST", "fixedNotifiedValueOrRetailPrice",
        "salesTaxApplicable", "salesTaxWithheldAtSource", "extraTax", "furtherTax",
        "sroScheduleNo", "fedPayable", "discount", "saleType", "fbr_invoice_no"
    ];
    
    let cleanedRows = selectedRows.map(row => row.slice(2)); // clean data
    const rawDataObjects = cleanedRows.map(valuesArr => {
        const obj = {};
        keys.forEach((key, idx) => {
            
            if (idx !== 2 && idx !== 16 && idx !== 18 && idx !== 33) { // skip zultecItemNo = 2, hsCode = 16, cateory = 18, fbr_invoice_no = 33
                obj[key] = valuesArr[idx];
            }
        });
        return obj;
    });
    
    const groupedByInvoice = {};
    const environmentText = $("#environment").text().trim();
    rawDataObjects.forEach(item => {
        const invoiceKey = item.invoiceRefNo;
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
                //scenarioId: scenarioIDSelected,
                items: []
            };
            // ✅ Add scenarioId only in Sandbox
            if (environmentText === "(Sandbox Environment)") {
                groupedByInvoice[invoiceKey].scenarioId = scenarioIDSelected;
                invoice_Push_URL = 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb';
            }
            //groupedByInvoice[invoiceKey].sellerProvince = provinceSelected;
        }

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
            saleType: salesTypeSelectedArr[0], // assign the specific element
            sroItemSerialNo: item.sroItemSerialNo
        });

        itemCounter++; // increment counter for next item
    });

    const finalPayload = Object.values(groupedByInvoice);

    //#region "Write payload in a file"

    var fileWriter_URL = baseURLValue + 'save-invoice';

    makeApiCall({
        url: fileWriter_URL,
        method: 'POST',
        token: token,
        data: finalPayload, // You can pass any data you want to send
        successCallback: function (result) {
            // console.log(result);
        },
        errorCallback: function (xhr, status, error) {
            alert("Bad Request: " + xhr.responseText)
            console.error("Error:", error, xhr.responseText);
        }
    });

    //#endregion

    const FBR_token = $("#tokenValueInput").val();
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
        $("#tokenValue").val("");
    } else {
        var api_url = baseURLValue + 'getTokenCallDecrypted';
        $("#tokenValue").val("");
        const tokenObj = {
            decTokenKey: FBR_token
        };
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: tokenObj,
            successCallback: function (result) {
                const fbrAPIToken = result.token;
                if (!localStorage.getItem('token')) {
                    window.location.href = baseURLValue;
                } else {
                    finalPayload.forEach((finalPayload, index) => {
                        $.ajax({
                            // url: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb'    //Sandbox URL,
                            //url: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata',
                            url: invoice_Push_URL,
                            method: 'POST',
                            contentType: 'application/json',
                            headers: {
                                'Authorization': 'Bearer ' + fbrAPIToken.trim()
                            },
                            data: JSON.stringify(finalPayload),
                            success: function (response) {
                                if (response.validationResponse.invoiceStatuses == null) {
                                    alert(response.validationResponse.error)
                                }
                                else if (response.validationResponse.status == "Invalid") {
                                    alert(response.validationResponse.invoiceStatuses[0]['error'])
                                }
                                else {
                                    if (!localStorage.getItem('token')) {
                                        window.location.href = baseURLValue;
                                    } else {
                                        let totalRows = response.validationResponse.invoiceStatuses.length;

                                        // for (let i = 0; i < totalRows; i++) {

                                            let fbr_Invoice_No_QR = response.invoiceNumber;
                                            let fbr_Invoice_No = response.invoiceNumber;
                                            // let fbr_Invoice_No = response.validationResponse.invoiceStatuses[i]['invoiceNo'];
                                            let qrBase64 = "";
                                        
                                            let tempDiv = document.createElement("div");
                                        
                                            let qrcode = new QRCode(tempDiv, {
                                                text: fbr_Invoice_No_QR,
                                                width: 200,
                                                height: 200,
                                                correctLevel: QRCode.CorrectLevel.M,
                                                version: 2
                                            });
                                            
                                            setTimeout(function () {
                                            
                                                let img = tempDiv.querySelector("img");
                                                let canvas = tempDiv.querySelector("canvas");
                                            
                                                if (img) {
                                                    qrBase64 = img.src;
                                                } else if (canvas) {
                                                    qrBase64 = canvas.toDataURL("image/png");
                                                }
                                            
                                                if (!qrBase64) {
                                                    console.error("QR generation failed");
                                                    return;
                                                }
                                            
                                                const obj = {
                                                    Sopnumbr: finalPayload.invoiceRefNo,
                                                    FBR_InvoiceNo: fbr_Invoice_No,
                                                    Dated: response.dated,
                                                    Status: response.validationResponse.invoiceStatuses[0]['status'],
                                                    StatusCode: response.validationResponse.invoiceStatuses[0]['statusCode'],
                                                    ScenarioID: scenarioIDSelected,
                                                    ScenarioDesc: salesTypeSelected,
                                                    Environment: environmentText,
                                                    QRImage: qrBase64
                                                };
                                            
                                                var api_url = baseURLValue + 'InsertFBR_Response';
                                            
                                                makeApiCall({
                                                    url: api_url,
                                                    method: 'POST',
                                                    token: token,
                                                    data: obj,
                                                    successCallback: function (result) {
                                                        // if ((i + 1) == totalRows) {
                                                            alert("Success: " + result.actualData[0]["Message"]);
                                                            window.location.href = baseURLValue + 'invoices';
                                                        // }
                                                    },
                                                    errorCallback: function (xhr, status, error) {
                                                        alert("Bad Request: " + xhr.responseText)
                                                        console.error("Error:", error, xhr.responseText);
                                                    }
                                                });
                                            
                                            }, 200);
                                        // }




                                        // var totalRows = response.validationResponse.invoiceStatuses.length;
                                        // var qrBase64 = "";
                                        // for (let i = 0; i < response.validationResponse.invoiceStatuses.length; i++) {

                                        //     var fbr_Invoice_No = response.validationResponse.invoiceStatuses[i]['invoiceNo'];
                                            
                                        //     var tempDiv = document.createElement("div");
                                        //     var qrcode = new QRCode(tempDiv, {
                                        //         text: fbr_Invoice_No,
                                        //         width: 200,      // pixel size
                                        //         height: 200,
                                        //         correctLevel: QRCode.CorrectLevel.M, // error correction level (L, M, Q, H)
                                        //         version: 2       // force QR code version 2
                                        //         //QRCode.CorrectLevel.L → Low (7%)
                                        //         //QRCode.CorrectLevel.M → Medium (15%)
                                        //         //QRCode.CorrectLevel.Q → Quartile (25%)
                                        //         //QRCode.CorrectLevel.H → High (30%)
                                        //     });
                                        //     setTimeout(function () {                                                
                                        //         var img = tempDiv.querySelector("img");
                                        //         var canvas = tempDiv.querySelector("canvas");
                                        //         if (img) {
                                        //             qrBase64 = img.src;
                                        //         }
                                        //         else if (canvas) {
                                        //             qrBase64 = canvas.toDataURL("image/png");
                                        //         }
                                        //         if (!qrBase64) {
                                        //             console.error("QR generation failed");
                                        //             return;
                                        //         }                                          

                                        //         const obj = {
                                        //             Sopnumbr: finalPayload.invoiceRefNo,
                                        //             FBR_InvoiceNo: fbr_Invoice_No,
                                        //             Dated: response.dated,
                                        //             Status: response.validationResponse.invoiceStatuses[i]['status'],
                                        //             StatusCode: response.validationResponse.invoiceStatuses[i]['statusCode'],
                                        //             ScenarioID: scenarioIDSelected,
                                        //             ScenarioDesc: salesTypeSelected,
                                        //             Environment: environmentText,
                                        //             QRImage: qrBase64
                                        //         };
                                        //         var api_url = baseURLValue + 'InsertFBR_Response';
                                        //         makeApiCall({
                                        //             url: api_url,
                                        //             method: 'POST',
                                        //             token: token,
                                        //             data: obj, // You can pass any data you want to send
                                        //             successCallback: function (result) {
                                        //                 if ((i + 1) == totalRows) {
                                        //                     alert("Success: " + result.actualData[0]["Message"]);
                                        //                     window.location.href = baseURLValue + 'invoices';
                                        //                 }
                                        //             },
                                        //             errorCallback: function (xhr, status, error) {
                                        //                 alert("Bad Request: " + xhr.responseText)
                                        //                 console.error("Error:", error, xhr.responseText);
                                        //             }
                                        //         });
                                        //     }, 200);
                                        // }   
                                    }
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error(`Failed to push invoice ${finalPayload.invoiceRefNo}`, error);
                                alert(`Failed to push invoice ${finalPayload.invoiceRefNo}. Check console for details.`);
                            }

                        });
                    });
                }
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
                scenariosList = result.actualData || [];
                // // Add default "Select Scenario" option at the beginning
                // scenariosList.unshift({ ID: 0, Value: 'Select Scenario' });
                // FillDropDown('scenariosDD', 'Select Scenario', result.actualData);
                FillDropDown('scenariosDD', '', result.actualData);
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });

    }
};

//#endregion

//#region "Load Provinces"

function LoadProvinces() {
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
    } else {
        var api_url = baseURLValue + 'getProvinces';
        makeApiCall({
            url: api_url,
            method: 'GET',
            token: token,
            data: {}, // You can pass any data you want to send
            successCallback: function (result) {
                provincesList = result.actualData || [];
                FillDropDown('provincesDD', '', result.actualData);
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });
    }
};

//#endregion

//#region "Get UOM Against HS Code"

// function fetchUOMFromAPI(hsCode, targetCellId) {
function fetchUOMFromAPI(hsCode, $cell) {
    const FBR_token = $("#tokenValueInput").val();
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
        $("#tokenValue").val("");
    } else {
        var api_url = baseURLValue + 'getTokenCallDecrypted';
        $("#tokenValue").val("");
        const tokenObj = {
            decTokenKey: FBR_token
        };
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: tokenObj,
            successCallback: function (result) {
                const fbrAPIToken = result.token;
                var settings = {
                    "url": 'https://gw.fbr.gov.pk/pdi/v2/HS_UOM?hs_code=' + hsCode.split("-")[0] + '&annexure_id=3',
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        // "Authorization": 'Bearer 427664dd-1809-3280-9ed3-c704e823e557'
                        'Authorization': 'Bearer ' + fbrAPIToken.trim()
                        //   "Cookie": "JSESSIONID=HDCez6mog7ZHkUSj15spUh-g7TiCGto2IHkrziec.i01-irisdmz55; cookiesession1=678B28F2CB763E08E0DF447115BEDAFB"
                    },
                };

                $.ajax(settings).done(function (response) {
                    // const uom = response[0]["description"] || 'N/A';
                    const uom = response?.[0]?.description ?? 'N/A';
                    // $('#' + targetCellId).text(uom);
                    $cell.text(uom);    //newly added
                });
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
                $("#tokenValue").val("");
            }
        });
    };
}

//#endregion

//#region "Get Registration Type Against NTN #"

// function fetchRegistrationTypefromAPI(ntn, targetCellId) {
function fetchRegistrationTypefromAPI(ntn, $cell) {
    const FBR_token = $("#tokenValueInput").val();
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
        $("#tokenValue").val("");
    } else {
        var api_url = baseURLValue + 'getTokenCallDecrypted';
        $("#tokenValue").val("");
        const tokenObj = {
            decTokenKey: FBR_token
        };
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: tokenObj,
            successCallback: function (result) {
                const fbrAPIToken = result.token;
                var settings = {
                    "url":'https://gw.fbr.gov.pk/dist/v1/Get_Reg_Type?Registration_No=' + ntn,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        // "Authorization": 'Bearer 427664dd-1809-3280-9ed3-c704e823e557'
                        'Authorization': 'Bearer ' + fbrAPIToken.trim()
                        //   "Cookie": "JSESSIONID=HDCez6mog7ZHkUSj15spUh-g7TiCGto2IHkrziec.i01-irisdmz55; cookiesession1=678B28F2CB763E08E0DF447115BEDAFB"
                    },
                };
            
                $.ajax(settings).done(function (response) {
                    const registrationType = response?.REGISTRATION_TYPE ?? 'N/A';
                    // $('#' + targetCellId).text(registrationType);
                    $cell.text(registrationType);
                });
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
                $("#tokenValue").val("");
            }
        });
    };
};

//#endregion

//#region "Scenario Dropdown change"

$(document).on('change', '.scenario-dropdown', function () {
    handleScenarioChange(this);
});

// $(document).on('change', '.scenario-dropdown', function () {
function handleScenarioChange(dropdown, defaultValue = null) {
    
    // const $dropdown = $(this);
    const $dropdown = $(dropdown);
    const $row = $dropdown.closest('tr');           // Get the parent <tr>

    const $sroItemSchNoCell = $row.find('td[id^="sroItemSchNo-"]');
    const colSROItemSchNoID = $sroItemSchNoCell.attr('id');

    const $rateCell = $row.find('td[id^="rate-"]'); // any td with id like rate-1, rate-2, etc.
    const colRateID = $rateCell.attr('id');            // 'rate-1'

    const $netAmountCell = $row.find('td[id^="netAmount-"]');
    const netAmountValue = $netAmountCell.text().trim();      // text inside the cell

    const $salesTaxCell = $row.find('td[id^="salesTax-"]');
    const colSalesTaxID = $salesTaxCell.attr('id');

    const $sroSchCell = $row.find('td[id^="sroSch-"]');
    const colSROSchID = $sroSchCell.attr('id');

    // const selectedText = $(this).find('option:selected').text();
    let selectedText;

    if (defaultValue) {
        selectedText = defaultValue;
    } else {
        selectedText = $dropdown.find('option:selected').text();
    }

    scenarioIDSelected = selectedText.split(" - ")[0].trim();     //Scenario ID
    salesTypeSelected = selectedText.split(" - ")[1].trim();      //Description

    salesTypeSelectedArr = [];
    salesTypeSelectedArr.push(salesTypeSelected);

    const FBR_token = $("#tokenValueInput").val();
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
        $("#tokenValue").val("");
    } else {
        var api_url = baseURLValue + 'getTokenCallDecrypted';
        $("#tokenValue").val("");
        const tokenObj = {
            decTokenKey: FBR_token
        };
        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: tokenObj,
            successCallback: function (result) {
                const fbrAPIToken = result.token;
                // You can store this in a variable, update UI, or make an API call, etc.
                if (scenarioIDSelected != "SN001") {
                
                    var settings = {
                        "url": 'https://gw.fbr.gov.pk/pdi/v1/transtypecode',
                        "method": "GET",
                        "timeout": 0,
                        "headers": {
                            // "Authorization": 'Bearer 427664dd-1809-3280-9ed3-c704e823e557'
                            'Authorization': 'Bearer ' + fbrAPIToken.trim()
                        },
                    };
                
                    $.ajax(settings).done(function (transactionTypesResponse) {
                        for (let i = 0; i < transactionTypesResponse.length; i++) {
                            if (transactionTypesResponse[i]['transactioN_DESC'].trim() == salesTypeSelected) {
                            
                                transactionTypeID = Number(transactionTypesResponse[i]['transactioN_TYPE_ID']);
                                break;
                            }
                        }
                        var settings = {
                            "url": 'https://gw.fbr.gov.pk/pdi/v2/SaleTypeToRate?date=02-Sep-2025&transTypeId=' + transactionTypeID + '&originationSupplier=8',
                            "method": "GET",
                            "timeout": 0,
                            "headers": {
                                // "Authorization": 'Bearer 427664dd-1809-3280-9ed3-c704e823e557'
                                'Authorization': 'Bearer ' + fbrAPIToken.trim()
                            },
                        };
                    
                        $.ajax(settings).done(function (SaleTypeToRateResponse) {
                        
                            if (scenarioIDSelected == "SN005") {    //Goods at Reduced Rate
                                rate_ID = 109; //Number(SaleTypeToRateResponse[0]['ratE_ID']); 
                                rate_Desc = "5%"//SaleTypeToRateResponse[0]['ratE_DESC'].trim();
                                $("#" + colRateID).text(rate_Desc);
                            }
                            else {
                                rate_ID = Number(SaleTypeToRateResponse[0]['ratE_ID']);
                                rate_Desc = SaleTypeToRateResponse[0]['ratE_DESC'].trim();
                                $("#" + colRateID).text(rate_Desc);
                                if (!rate_Desc.includes("%")) {
                                    $("#" + colSalesTaxID).text("0")
                                }
                                else {
                                    let numberOnly = rate_Desc.match(/\d+/)[0]; // "18"
                                    let taxRate = Number(numberOnly); // 18 as number
                                    if (taxRate != 0) {
                                        var res = (netAmountValue * taxRate) / 100;
                                        $("#" + colSalesTaxID).text(res);
                                    }
                                    else {
                                        $("#" + colSalesTaxID).text("0");
                                    }
                                }
                            }
                        
                            var settings = {
                                "url": 'https://gw.fbr.gov.pk/pdi/v1/SroSchedule?rate_id=' + rate_ID + '&date=02-Sep-2025&origination_supplier_csv=8',
                                "method": "GET",
                                "timeout": 0,
                                "headers": {
                                    // "Authorization": 'Bearer 427664dd-1809-3280-9ed3-c704e823e557'
                                    'Authorization': 'Bearer ' + fbrAPIToken.trim()
                                },
                            };
                            $.ajax(settings).done(function (SroScheduleResponse) {
                            
                                sro_ID = Number(SroScheduleResponse[0]['srO_ID']);
                                sro_Desc = SroScheduleResponse[0]['srO_DESC'].trim();
                                $("#" + colSROSchID).text(sro_Desc);
                            
                                var settings = {
                                    "url": 'https://gw.fbr.gov.pk/pdi/v2/SROItem?date=2025-09-04&sro_id=' + sro_ID,
                                    "method": "GET",
                                    "timeout": 0,
                                    "headers": {
                                        // "Authorization": 'Bearer 427664dd-1809-3280-9ed3-c704e823e557'
                                        'Authorization': 'Bearer ' + fbrAPIToken.trim()
                                    },
                                };
                                $.ajax(settings).done(function (SroItemResponse) {
                                
                                    if (scenarioIDSelected == "SN006") {
                                        sro_item_ID = 18130;
                                        sro_item_Desc = "166";
                                        $("#" + colSROItemSchNoID).text(sro_item_Desc);
                                    }
                                    else {
                                        sro_item_ID = Number(SroItemResponse[0]['srO_ITEM_ID']);
                                        sro_item_Desc = SroItemResponse[0]['srO_ITEM_DESC'].trim();
                                        $("#" + colSROItemSchNoID).text(sro_item_Desc);
                                    }
                                });
                            
                            });
                        });
                    });
                }
                else {
                
                    let rate = "18%"
                    let numberOnly = "18"; // "18"
                    const taxRate = Number(numberOnly); // 18 as number
                    if (taxRate != 0) {
                        const cleanedValue = netAmountValue.replace(/[^0-9.-]+/g, ''); // remove anything that isn't a digit, dot, or minus
                        const result = Number(cleanedValue);
                        var res = (result * taxRate) / 100;
                        $("#" + colRateID).text(rate);
                        // $("#" + colSalesTaxID).text(res);
                    }
                    else {
                        $("#" + colRateID).text(rate);
                        // $("#" + colSalesTaxID).text("0");
                    }
                }
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
                $("#tokenValue").val("");
            }
        });
    };

// });
};

//#endregion

//#region "Province Dropdown change"

$(document).on('change', '.provinces-dropdown', function () {
    handleProvinceChange(this);
});

function handleProvinceChange(dropdown, defaultValue = null) {
    
    const $dropdown = $(dropdown);
    let selectedText;
    if (defaultValue) {
        selectedText = defaultValue;
    } else {
        selectedText = $dropdown.find('option:selected').text();
    }
    provinceSelected = selectedText;
};

//#endregion

//#region "Export to Excel"

$("#btnExport").on("click", function () {
    //exportLimitedColumns('carcassTable', [0,1,3,21,24,28,29,30,31,32,33,34], 'FBR_Invoices_Export.xlsx');   //TableName, Indexes which will remove, fileName
    function getCurrentDateTime() {
        const now = new Date();
        const date = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // convert 0 to 12
        hours = String(hours).padStart(2, "0");
        return `${date}_${hours}-${minutes}_${ampm}`;
    };
    const dateTime = getCurrentDateTime();
    const fileName = `FBR_Invoices_Export_${dateTime}.xlsx`;
    exportLimitedColumns('carcassTable', [0,1,3,21,24,28,29,30,31,32,33,35], fileName);
});

function exportLimitedColumns(tableId, columnIndexes, filename = 'export.xlsx') {

    const numericColumns = [23, 25, 27]; // example indexes //Production Qty, SalesAmount, SalesTaxApplicable

    var dt = $('#' + tableId).DataTable();

    if (!dt || dt.rows().count() === 0) {
        alert("No data available to export.");
        return;
    }

    // Get ALL data (not just current page)
    var data = dt.rows({ search: 'applied' }).data().toArray();

    // Get headers
    var headers = [];
    $('#' + tableId + ' thead th').each(function (index) {
        if (!columnIndexes.includes(index)) {
            headers.push($(this).text().trim());
        }
    });

    // Build export data
    var exportData = [];
    exportData.push(headers);

    data.forEach(function (row) {

        var rowData = [];

        for (let i = 0; i < row.length; i++) {
            
            if (!columnIndexes.includes(i)) {

                let cell = row[i];

                // Remove HTML if present
                if (typeof cell === 'string') {
                    cell = cell.replace(/<[^>]*>/g, '').trim();
                }

                // ✅ Convert to number with 2 decimal places
                if (numericColumns.includes(i)) {

                    if (typeof cell === 'string') {
                        // Remove commas and any non-numeric characters (except dot & minus)
                        cell = cell.replace(/,/g, '').replace(/[^0-9.-]/g, '');
                    }
                
                    let num = parseFloat(cell);
                    cell = !isNaN(num) ? num : 0;
                }

                rowData.push(cell);
            }
        }

        exportData.push(rowData);
    });

    // Create sheet
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(exportData);

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
}


// function exportLimitedColumns(tableId, columnIndexes, filename = 'export.xlsx') {
//     var isDT = $.fn.DataTable && $.fn.DataTable.isDataTable('#' + tableId);
//     var hasRows = false;
//     if (isDT) {
//         var dt = $('#' + tableId).DataTable();
//         hasRows = dt.rows({ search: 'applied' }).count() > 0;
//     } else {
//         var table = document.getElementById(tableId);
//         hasRows = table && table.tBodies.length && table.tBodies[0].rows.length > 0;
//     }
//     if (!hasRows) {
//         alert("No data available to export.");
//         return;
//     }
//     // Clone the table
//     var originalTable = document.getElementById(tableId);
//     var clone = originalTable.cloneNode(true);
//     clone.querySelectorAll('input, select, textarea').forEach(el => el.remove());
//     clone.classList.remove('dataTable');
//     columnIndexes.sort((a, b) => b - a); // remove from rightmost first
//     clone.querySelectorAll('tr').forEach(row => {
//         columnIndexes.forEach(i => {
//             if (i < row.children.length) {  // make sure the index exists
//                 row.removeChild(row.children[i]);
//             }
//         });
//     });
//     var wb = XLSX.utils.book_new();
//     var ws = XLSX.utils.table_to_sheet(clone);
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//     XLSX.writeFile(wb, filename);
// };


//#endregion
