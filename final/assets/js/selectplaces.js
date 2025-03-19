document.addEventListener("DOMContentLoaded", function () {
    const resultsContainer = document.getElementById("results-container");
    const nextButton = document.getElementById("next-btn");
    let selectedPlaces = [];

    let selectedHotel = JSON.parse(sessionStorage.getItem("selectedHotel") || "{}");
    let addressParts = selectedHotel.address ? selectedHotel.address.split(",") : [];
    let city = addressParts.length > 1 ? addressParts[1].trim() : "";
    let country = addressParts.length > 4 ? addressParts[4].trim() : "";

    console.log(`📍 Fetching places for: ${city}, ${country}`);

    const API_BASE_URL = "http://localhost:5001";

    function fetchPlaces(category) {
        let apiUrl = "";

        if (category === "attractions") {
            apiUrl = `${API_BASE_URL}/api/atlas/attractions/${country}`;
        } else if (category === "food") {
            apiUrl = `${API_BASE_URL}/api/gastro/places/${country}`;
        }

        resultsContainer.innerHTML = `<p>Loading ${category}...</p>`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log("✅ API Response:", data); // Debugging line
                resultsContainer.innerHTML = "";

                let places = data.Attractions || data["Gastro-Places"] || [];

                if (!places.length) {
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
                        <button class="select-btn" data-name="${place.name}" data-location="${place.location}">Select</button>
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

    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            let category = this.dataset.category;
            fetchPlaces(category);
        });
    });

    function attachSelectListeners() {
        document.querySelectorAll(".select-btn").forEach(button => {
            button.addEventListener("click", function () {
                let placeName = this.getAttribute("data-name");
                let placeLocation = this.getAttribute("data-location");

                if (this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    selectedPlaces = selectedPlaces.filter(place => place.name !== placeName);
                } else {
                    this.classList.add("selected");
                    selectedPlaces.push({ name: placeName, location: placeLocation });
                }

                sessionStorage.setItem("selectedPlaces", JSON.stringify(selectedPlaces));
                updateNextButton();
            });
        });
    }

    function updateNextButton() {
        if (selectedPlaces.length > 0) {
            nextButton.classList.add("enabled");
            nextButton.disabled = false;
        } else {
            nextButton.classList.remove("enabled");
            nextButton.disabled = true;
        }
    }

    nextButton.addEventListener("click", function () {
        window.location.href = "next-step.html";
    });

    fetchPlaces("attractions");
});
