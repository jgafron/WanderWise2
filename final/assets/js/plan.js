document.addEventListener("DOMContentLoaded", function () {
    console.log("🔥 Plan Page Loaded");

    const createTripButton = document.getElementById("create-trip-btn");
    const myTripsBtn = document.getElementById("my-trip-btn");
    const userInfoContainer = document.getElementById("user-info-container");
    const userEmailElement = document.getElementById("user-email");
    const userProfilePic = document.getElementById("user-profile-pic");

    function restoreUserSession() {
        let storedUser = sessionStorage.getItem("firebaseUser");
        if (storedUser) {
            let user = JSON.parse(storedUser);

            if (userInfoContainer) {
                userInfoContainer.style.display = "flex";
                userEmailElement.textContent = user.email;
                userProfilePic.src = user.photoURL || "https://via.placeholder.com/40";
            }
        } else {
            console.warn("No user session found.");
        }
    }

    restoreUserSession();

    if (createTripButton) {
        createTripButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "/createtrip";
        });
    } else {
        console.error("❌ 'Create a Trip' button not found!");
    }

    if (myTripsBtn) {
        myTripsBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "/trips";
        });
    } else {
        console.error("❌ 'My Trips' button not found!");
    }
});

document.getElementById("home-btn").addEventListener("click", function (event) {
    event.preventDefault();  // Prevent default anchor behavior
    window.location.href = "/plan"; // Redirect to /plan route
});

