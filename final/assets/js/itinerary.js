document.addEventListener("DOMContentLoaded", function () {
    const hotelNameElement = document.getElementById("hotel-name");
    const hotelLocationElement = document.getElementById("hotel-location");
    const tripDurationElement = document.getElementById("trip-duration");
    const selectedPlacesList = document.getElementById("selected-places");
    const itineraryContent = document.getElementById("itinerary-content");

    let selectedHotel = JSON.parse(sessionStorage.getItem("selectedHotel") || "{}");
    let selectedPlaces = JSON.parse(sessionStorage.getItem("selectedPlaces") || "[]");
    let tripDates = JSON.parse(sessionStorage.getItem("tripDates") || "[]");

    hotelNameElement.textContent = selectedHotel.name || "Not selected";
    hotelLocationElement.textContent = selectedHotel.address || "Unknown location";

    let tripDuration = "Unknown duration";
    let formattedDates = "Dates not set";

    if (tripDates.length === 2) {
        let startDate = new Date(tripDates[0]);
        let endDate = new Date(tripDates[1]);

        let differenceInTime = endDate - startDate;
        let differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert ms to days

        tripDuration = `${differenceInDays} Days`;
        
        let options = { year: "numeric", month: "long", day: "numeric" };
        formattedDates = `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
    }

    tripDurationElement.textContent = `${formattedDates} (${tripDuration})`;

    selectedPlacesList.innerHTML = "";
    if (selectedPlaces.length === 0) {
        selectedPlacesList.innerHTML = "<li>No places selected.</li>";
    } else {
        selectedPlaces.forEach(place => {
            let listItem = document.createElement("li");
            listItem.classList.add("selected-place-item");
            listItem.innerHTML = `
                <img src="${place.img || 'https://via.placeholder.com/50'}" alt="${place.name}" class="place-img">
                <span>${place.name}</span>
            `;
            selectedPlacesList.appendChild(listItem);
        });
    }

    itineraryContent.innerHTML = "<p>Your itinerary will appear here. Feel free to draft your own plan.</p>";
});
