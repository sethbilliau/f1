/*
Support Container Section. 

This code manages the navigation for the support container which tells the player 
how they can support the project. 
*/

// Define constants 
const supportX = document.getElementById("support_modal_close_button")
const supportContainer = document.getElementById("support_modal_container");
const navSupport = document.getElementById("nav-support");

// Hide the support modal container upon click
function showSupportModal() {
    supportContainer.style.visibility = "visible";
    supportContainer.classList.add("show");
    supportContainer.classList.remove("hidden");
}

// Hide the support modal container upon click
supportX.onclick = function(){
    supportContainer.style.visibility = "hidden";
    supportContainer.classList.add("hidden");
    supportContainer.classList.remove("show");
}

navSupport.onclick = showSupportModal
