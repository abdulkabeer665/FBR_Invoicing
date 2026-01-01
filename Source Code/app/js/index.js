const baseURLValue = baseURL;

function greet() {
    localStorage.clear();
    window.location.replace(baseURLValue);  // Redirect to login
}

// setTimeout(greet, 300000); // Calls greet() after 2000 milliseconds (2 seconds)

// Scroll every 2 seconds (2000ms)
// setInterval(autoScroll, 2000);


let isScrollingDown = true;  // Keeps track of scroll direction

function autoScroll() {
    // Get the current scroll position, document height, and viewport height
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    // console.log(`scrollTop: ${scrollTop}, windowHeight: ${windowHeight}, scrollHeight: ${scrollHeight}`);

    if (isScrollingDown) {
        // Scroll down by 100px
        window.scrollBy(0, 100);

        // Check if we've reached the bottom of the page
        if (scrollTop + windowHeight >= scrollHeight - 1) {  // Allow for rounding errors
            isScrollingDown = false;  // Reverse direction once at the bottom
            // console.log("Reached the bottom, scrolling up now");
        }
    } else {
        // Scroll up by 100px
        window.scrollBy(0, -100);

        // Check if we've reached the top of the page
        if (scrollTop <= 0) {
            isScrollingDown = true;  // Reverse direction once at the top
            // console.log("Reached the top, scrolling down now");
        }
    }
}
