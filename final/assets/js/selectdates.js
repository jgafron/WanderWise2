document.addEventListener("DOMContentLoaded", function () {
    let dateInput = document.getElementById("date-range");
    let continueBtn = document.getElementById("continue-btn");
    let selectedHotelDisplay = document.getElementById("selected-hotel");

    // Retrieve & Parse Selected Hotel Location
    let selectedLocation = sessionStorage.getItem("selectedHotel");

    if (selectedLocation) {
        let parsedLocation = JSON.parse(selectedLocation); // 🔹 Parse the JSON string

        let addressParts = parsedLocation.address.split(","); // 🔹 Now it's an object, so we can access `.address`
        console.log(addressParts)
        let city = addressParts[1]?.trim() || "Unknown City"; // Add fallback in case undefined
        let country = addressParts[4]?.trim() || "Unknown Country";

        selectedHotelDisplay.textContent = `You are staying at: ${parsedLocation.name} in ${city}, ${country}`;
    } else {
        selectedHotelDisplay.textContent = "No hotel selected.";
    }

    // Initialize Flatpickr for Date Selection
    flatpickr(dateInput, {
        mode: "range", // Select start & end date
        minDate: "today", // No past dates
        dateFormat: "F j, Y", // Example: "March 12, 2025"
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                // ✅ Store Dates in Session Storage
                sessionStorage.setItem("tripDates", JSON.stringify(selectedDates));

                // ✅ Enable "Continue" Button
                continueBtn.disabled = false;
            }
        }
    });

    document.getElementById("home-btn").addEventListener("click", function () {
        console.log("🏠 Redirecting to /plan...");
        window.location.href = "/plan";
    });
    
    document.getElementById("my-trip-btn").addEventListener("click", function () {
        console.log("📌 Redirecting to /trips...");
        window.location.href = "/trips";
    });
    
    document.getElementById("create-trip-btn").addEventListener("click", function () {
        console.log("✈️ Redirecting to /createtrips...");
        window.location.href = "/createtrip";
    });
    
    // Handle Form Submission
    document.getElementById("date-form").addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "/selectplaces";
    });
});

