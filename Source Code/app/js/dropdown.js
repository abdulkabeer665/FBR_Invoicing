function FillDropDown (fieldID, initialText, jsonData) {
    $("#" + fieldID).empty();
    var s = "";
    if (initialText != "") {
        s = '<option value="0">' + initialText + '</option>';
    }
    for (var i = 0; i < jsonData.length; i++) {
           s += '<option value="' + jsonData[i]["ID"] + '">' + jsonData[i]["Value"] + '</option>';
    }
    $("#" + fieldID).html(s);
};