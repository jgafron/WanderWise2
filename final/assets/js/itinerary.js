document.addEventListener("DOMContentLoaded", function () {
    const hotelNameElement = document.getElementById("hotel-name");
    const hotelLocationElement = document.getElementById("hotel-location");
    const tripDurationElement = document.getElementById("trip-duration");
    const selectedPlacesList = document.getElementById("selected-places");
    const itineraryContent = document.getElementById("itinerary-content");
    const loadingMessage = document.getElementById("loading-message");
    const regenerateButton = document.getElementById("regenerate");
    const saveButton = document.getElementById("save-itinerary");

    let selectedHotel = JSON.parse(sessionStorage.getItem("selectedHotel") || "{}");
    let selectedPlaces = JSON.parse(sessionStorage.getItem("selectedPlaces") || "[]");
    let tripDates = JSON.parse(sessionStorage.getItem("tripDates") || "[]");

    // Display Selected Hotel and Trip Details
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

    // Display Selected Places
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

    // Display Loading Message and Fetch Itinerary
    itineraryContent.innerHTML = "";
    loadingMessage.style.display = "block"; // Show loading message

    function fetchItinerary() {
        let userPrompt = `Plan a ${tripDuration} itinerary for ${selectedHotel.address}, including ${selectedPlaces.map(p => p.name).join(", ")}. 
        The itinerary should be structured efficiently by grouping nearby places together to minimize travel time. 
        If the user does NOT have a food related place selected for a day, recommend a well-known restaurant that is nearby the
        place they chose for that given day. Do not add too many extra places beyond what the user has selected. 

        Format each day's plan as follows:

        ---
        Example Itinerary Format:

        Day 1: Visit Place A
        - Description of Place A.
        - Travel to Place A (X minutes away from your hotel).
        - Visit Place A
        - Lunch recommendation (only if necessary).

        Day 2: Visit Place B 
        - Description of Place B.
        - Travel to Place B (X minutes away from your hotel)
        - Efficiently schedule the rest of the day based on proximity.

        ---

        Now, using this format, generate the itinerary for ${tripDuration} days.`;

        fetch("https://us-central1-cloud-gafron-jgafron.cloudfunctions.net/generate_itinerary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user_input: userPrompt })
        })
        .then(response => response.json())
        .then(data => {
            loadingMessage.style.display = "none"; // Hide loading message
            if (data.itinerary) {
                displayItinerary(data.itinerary); // Call new function to format output
            } else {
                itineraryContent.innerHTML = "<p>Failed to generate itinerary. Try again.</p>";
            }
        })        
        .catch(error => {
            console.error("Error fetching itinerary:", error);
            itineraryContent.innerHTML = "<p>Failed to generate itinerary. Try again later.</p>";
            loadingMessage.style.display = "none";
        });
    }

    fetchItinerary();

    function displayItinerary(itineraryText) {
        let itineraryContent = document.getElementById("itinerary-content");
        itineraryContent.innerHTML = ""; // Clear previous content
    
        let days = itineraryText.split(/(?=Day \d+: )/g);
    
        days.forEach(dayText => {
            let parts = dayText.split(": ");
            let dayTitle = parts[0].trim();
            let dayDetails = parts.slice(1).join(": ").trim();
    
            let dayCard = document.createElement("div");
            dayCard.classList.add("day-card");
            dayCard.innerHTML = `
                <h2 class="day-title">${dayTitle}</h2>
                <p class="day-content">${dayDetails.replace(/\n/g, "<br>")}</p>
            `;
            itineraryContent.appendChild(dayCard);
        });
    }

    console.log("🟢 itinerary.js Loaded!");

// Retry logic: Wait for Firebase Config
    let retryCount = 0;
    const maxRetries = 10; // Try for ~5 seconds

    function checkFirebaseConfig() {
    if (window.firebaseConfig) {
        console.log("Firebase Config on itinerary page:", window.firebaseConfig);
    } else if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Firebase Config not found yet. Retrying... (${retryCount}/${maxRetries})`);
        setTimeout(checkFirebaseConfig, 500); // Try again in 500ms
    } else {
        console.error("Firebase Config is still missing after retries. Check if auth.js is loaded.");
    }
    }

// Start checking
checkFirebaseConfig();
    // Regenerate Itinerary
    regenerateButton.addEventListener("click", function () {
        itineraryContent.innerHTML = "";
        loadingMessage.style.display = "block"; // Show loading message again
        fetchItinerary();
    });

    // When Save Itinerary button is clicked, log the object instead of saving
    saveButton.addEventListener("click", async function (event) {
        event.preventDefault();
        console.log("🟢 Save Itinerary button clicked. Preparing to save...");
    
        // ✅ Check if Firestore is available
        if (!window.db) {
            console.error("Firestore is not initialized! Check auth.js.");
            alert("An error occurred: Firestore is not connected.");
            return;
        }
    
        // ✅ Get current logged-in user
        let user = JSON.parse(sessionStorage.getItem("firebaseUser") || "{}");
        if (!user.uid) {
            console.error("User not authenticated. Cannot save itinerary.");
            alert("You need to log in to save your itinerary.");
            return;
        }
    
        // ✅ Create itinerary object
        let itineraryData = {
            destination: selectedHotel.address || "Unknown Destination",
            hotel: selectedHotel,
            tripDates: {
                start: tripDates[0] || "",
                end: tripDates[1] || ""
            },
            selectedPlaces: selectedPlaces,
            itineraryText: itineraryContent ? itineraryContent.innerText : "No itinerary available.",
            timestamp: new Date().toISOString()
        };
    
        console.log("📋 Itinerary Object to be saved:", itineraryData);
    
        // ✅ Generate a unique document ID for the itinerary
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");
        const { setDoc, doc } = firestoreModule;
    
        let itineraryId = Date.now().toString(); // Unique ID
    
        try {
            console.log("⏳ Saving itinerary to Firestore...");
            await setDoc(doc(window.db, `users/${user.uid}/itineraries`, itineraryId), itineraryData);
            console.log("✅ Itinerary saved successfully!");
            alert("✅ Your itinerary has been saved successfully!");
    
            // ✅ Redirect after saving
            setTimeout(() => {
                window.location.href = "/plan";
            }, 2000);
        } catch (error) {
            console.error("❌ Error saving itinerary:", error);
            alert("An error occurred while saving your itinerary. Please try again.");
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
});
