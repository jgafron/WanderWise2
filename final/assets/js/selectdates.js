document.addEventListener("DOMContentLoaded", function () {
    let dateInput = document.getElementById("date-range");
    let continueBtn = document.getElementById("continue-btn");
    let selectedHotelDisplay = document.getElementById("selected-hotel");

    // ✅ Retrieve & Display Selected Hotel Location
    let selectedLocation = sessionStorage.getItem("selectedLocation") || "a hotel";
    selectedHotelDisplay.textContent = `You are staying at: ${selectedLocation}`;

    // ✅ Initialize Flatpickr for Date Selection
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

    // ✅ Handle Form Submission
    document.getElementById("date-form").addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "next-step.html"; // Redirect to the next step
    });
});