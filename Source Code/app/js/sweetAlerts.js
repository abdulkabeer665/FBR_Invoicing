let timerInterval;

function showSweetAlert(iconRes, titleRes, textRes, htmlRes, timer) {
    return Swal.fire({
        title: titleRes,
        text: textRes,
        html: htmlRes,
        icon: iconRes,
        timer: timer, // Close after 2 seconds
        timerProgressBar: true,
        showConfirmButton: false, // Hide confirm button
        showCancelButton: false,  // Hide cancel button
    });
};

function showSweetAlertWithSpinner(){
    Swal.fire({
        title: 'Loading...',
        //text: 'Please wait while we log you in.',
        allowOutsideClick: false, // Prevent closing the modal by clicking outside
        didOpen: () => {
            Swal.showLoading(); // Show the spinner
        }
    });
};

function showConfirmAlert(iconRes, titleRes, textRes, confirmBtnText, cancelBtnText) {
    return Swal.fire({
        title: titleRes,
        text: textRes,
        icon: iconRes,
        showCancelButton: true,
        confirmButtonText: confirmBtnText,
        cancelButtonText: cancelBtnText,
        reverseButtons: true,
        confirmButtonColor: '#d33', // Red color for the "Yes, delete it!" button (danger button)
        cancelButtonColor: '#3085d6', // Blue color for the "Cancel" button (default)
    });
}