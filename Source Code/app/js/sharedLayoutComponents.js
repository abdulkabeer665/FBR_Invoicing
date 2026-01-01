//#region JS Load

$().ready(function () {

    loadHeader();
    $("#userName").text(toPascalCase(localStorage.getItem('fullName')))
    loadMenus();
});

//#endregion

//#region Generic Header

function loadHeader() {

    var headerText = '';
    headerText += '<li class="nav-item navbar-dropdown dropdown-user dropdown">';
    headerText += '<a class="nav-link dropdown-toggle hide-arrow p-0" href="javascript:void(0);" data-bs-toggle="dropdown">';
    headerText += '<div class="avatar avatar-online">';
    headerText += '<img src="assets/img/avatars/1.png" alt class="w-px-40 h-auto rounded-circle" />';
    headerText += '</div>';
    headerText += '</a>';
    headerText += '<ul class="dropdown-menu dropdown-menu-end">';
    headerText += '<li>';
    headerText += '<a class="dropdown-item" href="#">';
    headerText += '<div class="d-flex">';
    headerText += '<div class="flex-shrink-0 me-3">';
    headerText += '<div class="avatar avatar-online">';
    headerText += '<img src="assets/img/avatars/1.png" alt class="w-px-40 h-auto rounded-circle" />';
    headerText += '</div>';
    headerText += '</div>';
    headerText += '<div class="flex-grow-1">';
    headerText += '<h6 class="mb-0" id="userName">abc</h6>';
    headerText += '<small class="text-muted">Admin</small>';
    headerText += '</div>';
    headerText += '</div>';
    headerText += '</a>';
    headerText += '</li>';
    headerText += '<li>';
    headerText += '<div class="dropdown-divider my-1"></div>';
    headerText += '</li>';
    headerText += '<li>';
    headerText += '<a class="dropdown-item" href="#">';
    headerText += '<i class="bx bx-user bx-md me-3"></i><span>My Profile</span>';
    headerText += '</a>';
    headerText += '</li>';
    // headerText += '<li>';
    // headerText += '<a class="dropdown-item" href="#"> <i class="bx bx-cog bx-md me-3"></i><span>Settings</span> </a>';
    // headerText += '</li>';
    // headerText += '<li>';
    // headerText += '<a class="dropdown-item" href="#">';
    // headerText += '<span class="d-flex align-items-center align-middle">';
    // headerText += '<i class="flex-shrink-0 bx bx-credit-card bx-md me-3"></i><span class="flex-grow-1 align-middle">Billing Plan</span>';
    // headerText += '<span class="flex-shrink-0 badge rounded-pill bg-danger">4</span>';
    // headerText += '</span>';
    // headerText += '</a>';
    // headerText += '</li>';
    headerText += '<li>';
    headerText += '<div class="dropdown-divider my-1"></div>';
    headerText += '</li>';
    headerText += '<li>';
    headerText += '<a class="dropdown-item" style="cursor: pointer" id="logOutBtn">';
    headerText += '<i class="bx bx-power-off bx-md me-3"></i><span>Log Out</span>';
    headerText += '</a>';
    headerText += '</li>';
    headerText += '</ul>';
    headerText += '</li>';

    document.getElementById("loadUserInfo").innerHTML = headerText;

    $("#logOutBtn").click(() => {
        localStorage.clear();
        window.location.replace(baseURLValue);  // Redirect to login
    });

};

//#endregion

//#region Generic Menus

function loadMenus() {
    if (!localStorage.getItem('token')) {
        window.location.href = baseURLValue;
    } else {
        const token = localStorage.getItem('token');
        var api_url = baseURLValue + 'getMenuAgainstRoleID';

        makeApiCall({
            url: api_url,
            method: 'POST',
            token: token,
            data: {},
            successCallback: function (result) {
                BindMenu(result.actualData);
            },
            errorCallback: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });

    }
};

function BindMenu(jsonData) {

    var sideMenu = '';
    for (let i = 0; i < jsonData.length; i++) {
        var childMenu = '';
        if (jsonData[i]["P_Name"] == null) {
            sideMenu += '<li class="menu-item">';
            sideMenu += '<a href="javascript:void(0);" class="menu-link menu-toggle" onclick="toggleMenu(this)">';
            sideMenu += '<i class="menu-icon tf-icons ' + jsonData[i]["Icon"] + '"></i>';
            sideMenu += '<div class="text-truncate" data-i18n="Account Settings">' + jsonData[i]["PC_MenuName"] + '</div>';   //PC_MenuName (Parent)
            sideMenu += '</a>';
            for (let j = 0; j < jsonData.length; j++) {
                if (jsonData[j]["P_Name"] != null && jsonData[i]["PC_MenuName"] == jsonData[j]["PC_MenuName"]) {
                    childMenu += '<ul class="menu-sub">';
                    childMenu += '<li class="menu-item">';
                    childMenu += jsonData[j]["URL"] == null ? '<a href="/index" class="menu-link">' : '<a href="' + jsonData[j]["URL"] + '" class="menu-link">';
                    childMenu += jsonData[j]["P_Name"] == "Reason" ? '<div class="text-truncate" data-i18n="Role">Rejection ' + jsonData[j]["P_Name"] + '</div>' : '<div class="text-truncate" data-i18n="Role">' + jsonData[j]["P_Name"] + '</div>';  //P_Name (CHILD)
                    childMenu += '</a>';
                    childMenu += '</li>';
                    childMenu += '</ul>';
                }
            }
        }
        sideMenu += childMenu;
        sideMenu += '</li>';
    }
    document.getElementById("loadMenu").innerHTML = sideMenu;
};

//#endregion

//#region Function to toggle menu

function toggleMenu(clickedElement) {
    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    // Loop through all items and close the others
    menuItems.forEach(item => {
        const submenu = item.querySelector('.menu-sub');
        if (submenu && submenu !== clickedElement.nextElementSibling) {
            submenu.classList.remove('open');  // Remove the 'open' class from other submenus
        }
    });

    // Toggle the clicked item's submenu
    const currentSubmenu = clickedElement.nextElementSibling;
    if (currentSubmenu) {
        currentSubmenu.classList.toggle('open');  // Toggle the 'open' class on the clicked submenu
    }
}

//#endregion

//#region Convert to Pascal Case

function toPascalCase(str) {
    return str
        .split(' ')                      // Split the string into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize the first letter of each word
        .join(' ');                        // Join the words back together
};

//#endregion