document.addEventListener("DOMContentLoaded", function () {
    console.log("🔥 Plan Page Loaded");

    const createTripButton = document.getElementById("create-trip-btn");

    if (createTripButton) {
        createTripButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default anchor behavior
            console.log("✅ 'Create a Trip' button clicked. Redirecting...");
            window.location.href = "/createtrip"; // Redirect to the itinerary creation page
        });
    } else {
        console.error("❌ 'Create a Trip' button not found!");
    }
});
