
$("#loginBtn").click(function (event) {

    event.preventDefault(); // Prevent the form from submitting and the page from reloading

    if ($("#email").val() == "" || $("#password").val() == "") {    // Check if email or password fields are empty
        alert("Please provide email or password");
    } else {
        showSweetAlertWithSpinner();    //Showing SweetAlert with Spinner
        var obj = {
            "email": $("#email").val().toLowerCase(),
            "password": $("#password").val()
        };

        var api_url = baseURL + 'login';
        $.ajax({
            type: "POST",
            url: api_url,
            data: JSON.stringify(obj),
            headers: { 'Content-type': 'application/json' },
            dataType: 'json',
            success: function (result) {
                Swal.close();    // Close the loading spinner
                localStorage.setItem('token', result.token);
                localStorage.setItem('userID', result.user.ID);
                localStorage.setItem('userName', result.user.UserName);
                localStorage.setItem('fullName', result.user.FullName);
                if (parseInt(result.user.Status) == 200) {
                    showSweetAlert('success', '', '', `Welcome <b>` + result.user.FullName + `</b>`, 2000)
                        .then(() => {
                            window.location.href = baseURL + 'index'; // After the alert closes, redirect to the new page
                        });
                }
                else {
                    showSweetAlert('error', 'Login Failed', 'Invalid Email or Password', ``, 2000);   //Passing the values to SweetAlert class
                }
                $("#password").val('');     // Clear the password field
            },
            error: function (xhr, status, error) {  // Use the 'error' callback here
                Swal.close();  // Close the SweetAlert spinner

                // Display the error message using SweetAlert
                if (xhr.status === 401) {
                    showSweetAlert('error', 'Unauthorized', 'Invalid email or password', '', 2000);
                } else if (xhr.status === 500) {
                    showSweetAlert('error', 'Server Error', 'Database connection is not correct. Contact your Network Administrator.', '', 2000);
                } else if (xhr.status === 400) {
                    showSweetAlert('error', 'Server Error', 'An error occurred on the server. Please try again later.', '', 2000);
                } else {
                    showSweetAlert('error', 'Oops...', 'Something went wrong. Please try again!', '', 2000);
                }
                $("#password").val('');     // Clear the password field
            }
        });
    }
});

let previousValue = ''; // Store the previous value

document.getElementById('serverConnectionTimeout').addEventListener('input', function (event) {
    let currentValue = this.value;
    let newChar = currentValue.slice(previousValue.length);
    if (newChar === '' || /^\d$/.test(newChar)) {
        previousValue = currentValue;
    } else {
        this.value = previousValue;
    }
});

function splitValue(value, splittingCharacter, index) {

    return value.split(splittingCharacter)[index]
}

$("#registerBtn").click(function register(e) {

    e.preventDefault();
    showSweetAlertWithSpinner();
    var serverName = splitValue($("#serverName").val(), ',', 0);
    var serverPort = $("#serverPort").val();
    var serverUserName = $("#serverUserName").val();
    var serverPassword = $("#serverPassword").val();
    var dbName = $("#dbName").val();
    var serverConnectionTimeout = $("#serverConnectionTimeout").val();

    // Sending data to the backend
    $.ajax({
        url: '/update-connection-string', // The route to handle the request
        method: 'POST',
        data: {
            serverName: serverName,
            serverPort: serverPort,
            serverUserName: serverUserName,
            serverPassword: serverPassword,
            dbName: dbName,
            serverConnectionTimeout: serverConnectionTimeout
        },
        success: function (response) {
            Swal.close();
            showSweetAlert('success', 'Success Response', "Connection string updated successfully.", ``, 5000).then(() => {
                window.location.href = baseURL;
                // document.querySelectorAll('input, textarea').forEach(el => el.value = '');
            })
        },
        error: function (error) {
            Swal.close();
            showSweetAlert('error', 'Error Response', error.responseText, ``, 5000);
        }
    });
});


function AutoLogin() {
    showSweetAlertWithSpinner();    //Showing SweetAlert with Spinner
    var obj = {
        "email": 'admin',
        "password": 'pass'
    };

    var api_url = baseURL + 'login';
    $.ajax({
        type: "POST",
        url: api_url,
        data: JSON.stringify(obj),
        headers: { 'Content-type': 'application/json' },
        dataType: 'json',
        success: function (result) {
            Swal.close();    // Close the loading spinner
            localStorage.setItem('token', result.token);
            localStorage.setItem('userID', result.user.ID);
            localStorage.setItem('userName', result.user.UserName);
            localStorage.setItem('fullName', result.user.FullName);
            if (parseInt(result.user.Status) == 200) {
                showSweetAlert('success', '', '', `Welcome <b>` + result.user.FullName + `</b>`, 2000)
                    .then(() => {
                        window.location.href = baseURL + 'index'; // After the alert closes, redirect to the new page
                    });
            }
            else {
                showSweetAlert('error', 'Login Failed', 'Invalid Email or Password', ``, 2000);   //Passing the values to SweetAlert class
            }
            $("#password").val('');     // Clear the password field
        },
        error: function (xhr, status, error) {  // Use the 'error' callback here
            Swal.close();  // Close the SweetAlert spinner

            // Display the error message using SweetAlert
            if (xhr.status === 401) {
                showSweetAlert('error', 'Unauthorized', 'Invalid email or password', '', 2000);
            } else if (xhr.status === 500) {
                showSweetAlert('error', 'Server Error', 'Database connection is not correct. Contact your Network Administrator.', '', 2000);
            } else if (xhr.status === 400) {
                showSweetAlert('error', 'Server Error', 'An error occurred on the server. Please try again later.', '', 2000);
            } else {
                showSweetAlert('error', 'Oops...', 'Something went wrong. Please try again!', '', 2000);
            }
            $("#password").val('');     // Clear the password field
        }
    });
}

// setTimeout(AutoLogin, 60000); // Calls greet() after 60000 milliseconds (60 seconds or 1 minute)