document.addEventListener("DOMContentLoaded", async function () {
    console.log("🔥 My Trips Page Loaded!");

    // Ensure Firebase and Firestore are initialized
    async function waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 10;
        while ((!window.firebaseConfig || !window.db) && attempts < maxAttempts) {
            console.warn(`⚠️ Firebase not ready, retrying... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        if (!window.db) {
            console.error("❌ Firestore not initialized after retries.");
            return false;
        }
        console.log("✅ Firestore is ready.");
        return true;
    }

    // Wait for Firestore
    const firebaseReady = await waitForFirebase();
    if (!firebaseReady) return;

    // Firestore Import
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");
    const { getDocs, getDoc, doc, deleteDoc, collection } = firestoreModule;

    // Get current logged-in user
    let user = JSON.parse(sessionStorage.getItem("firebaseUser") || "{}");

    if (!user.uid) {
        console.error("User not authenticated. Redirecting to login...");
        alert("You need to log in to view your trips.");
        window.location.href = "/login.html";
        return;
    }

    console.log(`Fetching trips for user: ${user.uid}`);

    // Query Firestore for user trips
    async function fetchUserTrips() {
        try {
            const userTripsRef = collection(window.db, `users/${user.uid}/itineraries`);
            const tripSnapshots = await getDocs(userTripsRef);

            if (tripSnapshots.empty) {
                console.warn("⚠️ No trips found for this user.");
                document.getElementById("trip-list").innerHTML = "<p>No saved trips found.</p>";
                return;
            }

            console.log(`Found ${tripSnapshots.size} trip(s).`);
            displayTrips(tripSnapshots);
        } catch (error) {
            console.error(" Error fetching trips:", error);
            document.getElementById("trip-list").innerHTML = "<p>Error loading trips.</p>";
        }
    }

    // Function to display trips
    function displayTrips(tripSnapshots) {
        const tripList = document.getElementById("trip-list");
        tripList.innerHTML = ""; // Clear previous content

        tripSnapshots.forEach(docSnap => {
            const tripData = docSnap.data();
            console.log("📜 Trip Data from Firestore:", tripData);

            // Extract country from hotel address
            let country = "Unknown Country";
            if (tripData.hotel && tripData.hotel.address) {
                const addressParts = tripData.hotel.address.split(",");
                country = addressParts[addressParts.length - 1].trim(); // Get last part (Country)
            }

            // Format trip title: "Hotel Name, Country"
            const tripTitle = `${tripData.hotel.name || "Unnamed Hotel"}, ${country}`;

            // Format readable dates
            let startDate = new Date(tripData.tripDates.start).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            let endDate = new Date(tripData.tripDates.end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

            // Generate selected places list
            let selectedPlacesHTML = `
                <p class="selected-places-title"><strong>Selected Places:</strong></p>
                <div class="places-container">
            `;
            if (tripData.selectedPlaces && tripData.selectedPlaces.length > 0) {
                tripData.selectedPlaces.forEach(place => {
                    selectedPlacesHTML += `
                        <div class="place-item">
                            <img src="${place.img || 'https://via.placeholder.com/100'}" alt="${place.name}" class="place-img">
                            <p>${place.name}</p>
                        </div>
                    `;
                });
            } else {
                selectedPlacesHTML += `<p>No places selected.</p>`;
            }
            selectedPlacesHTML += `</div>`; // Close container

            const tripCard = document.createElement("div");
            tripCard.classList.add("trip-card");

            tripCard.innerHTML = `
            <h3>${tripTitle}</h3>
            <p><strong>Dates:</strong> ${startDate} - ${endDate}</p>
            ${selectedPlacesHTML}
            <div class="trip-buttons">
                <button class="view-trip-btn" data-id="${docSnap.id}">View Trip</button>
                <button class="delete-trip-btn" data-id="${docSnap.id}">Delete Trip</button>
            </div>
            <div class="expanded-trip-content" style="display: none;"></div> <!-- Hidden by default -->
            `;

            tripList.appendChild(tripCard);
        });

        // ✅ Add event listeners to view trip buttons
        document.querySelectorAll(".view-trip-btn").forEach(button => {
            button.addEventListener("click", async function () {
                const tripId = this.getAttribute("data-id");
                console.log(`🔍 Fetching itinerary for trip: ${tripId}`);
        
                const tripCard = this.closest(".trip-card");
                const tripContainer = document.getElementById("trip-list");
                const expandedContainer = tripCard.querySelector(".expanded-trip-content");
                const viewTripButton = tripCard.querySelector(".view-trip-btn");
        
                // If already expanded, collapse it and show other trips again
                if (tripCard.classList.contains("expanded")) {
                    tripCard.classList.remove("expanded");
                    expandedContainer.style.display = "none";
                    tripContainer.classList.remove("hide-other");
                    viewTripButton.style.display = "block"; // Show button again
                    return;
                }
        
                // Hide other trip cards when one is expanded
                tripContainer.classList.add("hide-other");
        
                // Expand selected trip card
                tripCard.classList.add("expanded");
                expandedContainer.style.display = "block";
                viewTripButton.style.display = "none"; // Hide button
        
                // ✅ Fetch itinerary details
                try {
                    const tripRef = doc(window.db, `users/${user.uid}/itineraries/${tripId}`);
                    const tripSnap = await getDoc(tripRef);
        
                    if (!tripSnap.exists()) {
                        console.error("Itinerary not found.");
                        expandedContainer.innerHTML = "<p>No itinerary available.</p>";
                        expandedContainer.style.display = "block";
                        return;
                    }
        
                    const tripData = tripSnap.data();
                    console.log("🔥 FULL TRIP OBJECT:", JSON.stringify(tripData, null, 2));
        
                    // Parse `itineraryText` correctly
                    let itineraryHTML = `<h2 class="itinerary-title">Generated Itinerary</h2><div id="itinerary-content">`;
        
                    if (tripData.itineraryText) {
                        const days = tripData.itineraryText.split(/\n\n(?=Day \d+)/g);
        
                        days.forEach(dayBlock => {
                            const lines = dayBlock.split("\n").filter(line => line.trim() !== "");
                            const dayTitle = lines[0].trim();
                            const dayDetails = lines.slice(1).join("<br>");
        
                            console.log(`📆 Formatting: ${dayTitle}`, dayDetails);
        
                            itineraryHTML += `
                                <div class="day-card">
                                    <h3 class="day-title">${dayTitle}</h3>
                                    <p class="day-content">${dayDetails}</p>
                                </div>
                            `;
                        });
                    } else {
                        console.warn("⚠️ No itinerary data found.");
                        itineraryHTML += "<p>No itinerary available.</p>";
                    }
        
                    itineraryHTML += `<button class="close-trip-btn">Close</button>`;
        
                    // Populate expanded content and display
                    expandedContainer.innerHTML = itineraryHTML;
        
                    // Close button functionality
                    expandedContainer.querySelector(".close-trip-btn").addEventListener("click", () => {
                        console.log("📌 Closing expanded itinerary.");
                        tripCard.classList.remove("expanded");
                        expandedContainer.style.display = "none";
                        tripContainer.classList.remove("hide-other");
                        viewTripButton.style.display = "block"; // Show button again
                    });
        
                } catch (error) {
                    console.error("Error fetching itinerary:", error);
                    expandedContainer.innerHTML = "<p>Error loading itinerary.</p>";
                    expandedContainer.style.display = "block";
                }
            });
        });

        document.querySelectorAll(".delete-trip-btn").forEach(button => {
            button.addEventListener("click", async function () {
                const tripId = this.getAttribute("data-id");
                console.log(`🗑 Attempting to delete trip: ${tripId}`);
        
                if (!tripId) {
                    console.error("No trip ID found. Cannot delete.");
                    return;
                }
        
                if (!confirm("Are you sure you want to delete this trip?")) {
                    console.log("Trip deletion canceled by user.");
                    return;
                }
        
                try {
                    console.log(`📡 Connecting to Firestore to delete trip: ${tripId}`);
                    const tripRef = doc(window.db, `users/${user.uid}/itineraries/${tripId}`);
        
                    await deleteDoc(tripRef);
                    console.log(`Successfully deleted trip: ${tripId} from Firestore.`);
        
                    // Remove the trip card from UI
                    const tripCard = this.closest(".trip-card");
                    if (tripCard) {
                        tripCard.remove();
                        console.log(`🧹 Removed trip ${tripId} from the UI.`);
                    } else {
                        console.warn(`⚠️ Trip card element for ${tripId} not found in DOM.`);
                    }
        
                } catch (error) {
                    console.error(`Error deleting trip ${tripId}:`, error);
                    alert("Failed to delete trip. Please try again.");
                }
            });
        });
        
        
    }

    // ✅ Fetch and display trips
    fetchUserTrips();
});
