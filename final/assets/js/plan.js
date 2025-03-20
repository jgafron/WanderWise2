document.addEventListener("DOMContentLoaded", function () {
    console.log("🔥 Plan Page Loaded");

    const createTripButton = document.getElementById("create-trip-btn");
    const myTripsBtn = document.getElementById("my-trip-btn");

    // ✅ Fix: Ensure 'Create a Trip' button works correctly
    if (createTripButton) {
        createTripButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default anchor behavior
            console.log("✅ 'Create a Trip' button clicked. Redirecting...");
            window.location.href = "/createtrip"; // Redirect to the itinerary creation page
        });
    } else {
        console.error("❌ 'Create a Trip' button not found!");
    }

    // ✅ Fix: Ensure 'My Trips' button works correctly
    if (myTripsBtn) {
        myTripsBtn.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default behavior
            console.log("✅ 'My Trips' button clicked. Redirecting...");
            window.location.href = "/trips"; // Redirect to My Trips page
        });
    } else {
        console.error("❌ 'My Trips' button not found!");
    }
});
