let map;
let marker;
let autocomplete;
let selectedHotel = null; // Stores the selected hotel data

// Fetch API Key and Load Google Maps
async function loadGoogleMaps() {
    try {
        let response = await fetch("/get-api-key");
        let data = await response.json();
        let apiKey = data.apiKey;

        if (!apiKey) throw new Error("API key not found.");

        console.log("✅ API Key Loaded Successfully:", apiKey);

        let script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = function () {
            console.error("❌ Google Maps API failed to load.");
        };

        document.head.appendChild(script);
    } catch (error) {
        console.error("❌ Error loading API key:", error);
    }
}

// Initialize Google Map and Places Autocomplete
function initMap() {
    console.log("✅ Google Maps Loaded Successfully");

    let defaultLocation = { lat: 40.7128, lng: -74.0060 }; // Default New York

    // Initialize Google Map
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });

    // Initialize Marker
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Selected Hotel",
        visible: false,
    });

    let inputField = document.getElementById("location-search");
    let submitButton = document.getElementById("submit-btn");

    if (!inputField) {
        console.error("❌ Input field for Autocomplete not found.");
        return;
    }

    // Initialize Google Places Autocomplete
    autocomplete = new google.maps.places.Autocomplete(inputField, {
        types: ["establishment"], // Restrict to places like hotels, Airbnbs
        fields: ["geometry", "name", "formatted_address"],
    });

    // Handle user selection
    autocomplete.addListener("place_changed", function () {
        let place = autocomplete.getPlace();

        if (!place.geometry) {
            console.error("No location data for this place.");
            alert("No details available for the selected location.");
            return;
        }

        console.log(`Selected Place: ${place.name}, ${place.formatted_address}`);

        // Move the map & marker to the selected location
        map.setCenter(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        // Store hotel details in memory
        selectedHotel = {
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };

        // Enable the submit button
        submitButton.disabled = false;
    });

    // Handle form submission (Save to sessionStorage)
    document.getElementById("trip-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        if (!selectedHotel) {
            alert("Please select a hotel before continuing.");
            return;
        }

        // Store in sessionStorage
        sessionStorage.setItem("selectedHotel", JSON.stringify(selectedHotel));
        console.log("✅ Hotel saved to sessionStorage:", selectedHotel);

        // 🚀 Move to the next step (Redirect if needed)
        window.location.href = "/select-dates"; // Replace with your actual next step
    });
}


document.getElementById("home-btn").addEventListener("click", function () {
    console.log("🏠 Redirecting to /plan...");
    window.location.href = "/plan";
});

document.getElementById("my-trip-btn").addEventListener("click", function () {
    console.log("📌 Redirecting to /trips...");
    window.location.href = "/trips";
});

document.getElementById("create-trip-btn").addEventListener("click", function () {
    console.log("✈️ Already on the Create Trip page.");
});

// Load Google Maps
loadGoogleMaps();
