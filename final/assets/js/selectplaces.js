document.addEventListener("DOMContentLoaded", function () {
    const resultsContainer = document.getElementById("results-container");
    const selectedPlacesContainer = document.getElementById("selected-places-list");
    const nextButton = document.getElementById("next-btn");
    let selectedPlaces = [];

    // Retrieve city & country from session storage
    let selectedHotel = JSON.parse(sessionStorage.getItem("selectedHotel") || "{}");
    let addressParts = selectedHotel.address ? selectedHotel.address.split(",") : [];
    let city = addressParts.length > 1 ? addressParts[1].trim() : "";
    let country = sessionStorage.getItem("countryReal")

    console.log(` Fetching places for: ${city}, ${country}`);

    // Fetch places based on selected category
    function fetchPlaces(category) {
        let apiUrl = "";

        if (category === "attractions") {
            apiUrl = `http://localhost:5001/api/atlas/attractions/${country}`;
        } else if (category === "food") {
            apiUrl = `http://localhost:5001/api/gastro/places/${country}`;
        }

        resultsContainer.innerHTML = `<p>Loading ${category}...</p>`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = "";
                let places = data.Attractions || data["Gastro-Places"] || [];

                if (places.length === 0) {
                    resultsContainer.innerHTML = "<p>No results found.</p>";
                    return;
                }

                places.forEach(place => {
                    const placeCard = document.createElement("div");
                    placeCard.classList.add("place-card");

                    placeCard.innerHTML = `
                        <img src="${place.img || 'https://via.placeholder.com/250'}" alt="${place.name}">
                        <h3>${place.name}</h3>
                        <p>${place.description}</p>
                        <button class="select-btn" data-name="${place.name}" data-img="${place.img}">Select</button>
                    `;

                    resultsContainer.appendChild(placeCard);
                });

                attachSelectListeners();
            })
            .catch(error => {
                console.error("❌ Error fetching places:", error);
                resultsContainer.innerHTML = "<p>Failed to load places. Try again later.</p>";
            });
    }

    // Handle selecting a place
    function attachSelectListeners() {
        document.querySelectorAll(".select-btn").forEach(button => {
            button.addEventListener("click", function () {
                let placeName = this.getAttribute("data-name");
                let placeImg = this.getAttribute("data-img");

                if (this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    selectedPlaces = selectedPlaces.filter(place => place.name !== placeName);
                } else {
                    this.classList.add("selected");
                    selectedPlaces.push({ name: placeName, img: placeImg });
                }

                sessionStorage.setItem("selectedPlaces", JSON.stringify(selectedPlaces));
                updateSelectedPlaces();
                updateNextButton();
            });
        });
    }

    // Update the "Selected Places" section
    function updateSelectedPlaces() {
        selectedPlacesContainer.innerHTML = "";
        if (selectedPlaces.length === 0) {
            selectedPlacesContainer.innerHTML = "<p>No places selected.</p>";
            return;
        }
    
        selectedPlaces.forEach(place => {
            const placeItem = document.createElement("div");
            placeItem.classList.add("selected-place");
    
            placeItem.innerHTML = `
                <img src="${place.img || 'https://via.placeholder.com/100'}" alt="${place.name}">
                <p>${place.name}</p>
            `;
    
            selectedPlacesContainer.appendChild(placeItem);
        });
    }

    // Enable "Next" button when at least one place is selected
    function updateNextButton() {
        if (selectedPlaces.length > 0) {
            nextButton.classList.add("enabled");
            nextButton.disabled = false;
        } else {
            nextButton.classList.remove("enabled");
            nextButton.disabled = true;
        }
    }

    // Handle tab switching
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            let category = this.dataset.category;
            fetchPlaces(category);
        });
    });

    // Handle Next Button Click
    nextButton.addEventListener("click", function () {
        window.location.href = "/itinerary"; // Move to the next step
    });

    // Load the first category by default (Attractions)
    fetchPlaces("attractions");
});

document.getElementById("home-btn").addEventListener("click", function () {
    window.location.href = "/plan";
});

document.getElementById("my-trip-btn").addEventListener("click", function () {
    window.location.href = "/trips";
});

document.getElementById("create-trip-btn").addEventListener("click", function () {
    window.location.href = "/createtrip";
});