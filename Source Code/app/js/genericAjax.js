function makeApiCall({ url, method, data = {}, token = '', successCallback, errorCallback }) {

    const headers = token ? {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + token
    } : {
        'Content-Type': 'application/json'
    };

    $.ajax({
        type: method,
        url: url,
        data: JSON.stringify(data),  // Convert data to JSON
        headers: headers,
        dataType: 'json',  // Expect JSON response
        beforeSend: function () {
            // Optional: Show a loading spinner
        },
        success: function (result) {

            if (successCallback) {
                successCallback(result);
            }
        },
        error: function (xhr, status, error) {

            console.error("AJAX error:", status, error);

            // If the status code is 401, handle the unauthorized error
            if (xhr.status === 401) {
                console.log('Unauthorized - Invalid credentials');
                showSweetAlert('error', 'Unauthorized', 'Invalid login credentials.', '', 2000);
            } else if (xhr.status === 500) {
                // Handle internal server errors or other errors
                console.log('Server error:', xhr.responseText);
                showSweetAlert('error', 'Server Error', 'An error occurred on the server. Please try again later.', '', 2000);
            } else {
                console.error("Unexpected error status:", xhr.status);
                if (errorCallback) {
                    errorCallback(xhr, status, error);
                } else {
                    showSweetAlert('error', 'Oops...', 'Something went wrong. Please try again!', '', 2000);
                }
            }
        }
    });
}