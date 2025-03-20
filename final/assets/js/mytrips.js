document.addEventListener("DOMContentLoaded", async function () {
    console.log("🔥 My Trips Page Loaded!");

    // Ensure Firebase and Firestore are initialized
    async function waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 10;
        while ((!window.firebaseConfig || !window.db) && attempts < maxAttempts) {
            console.warn(`⚠️ Firebase Config or Firestore not found yet. Retrying... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
            attempts++;
        }

        if (!window.firebaseConfig || !window.db) {
            console.error("❌ Firebase Config or Firestore missing after retries!");
            return false;
        }

        console.log("✅ Firebase and Firestore are initialized.");
        return true;
    }

    // Wait for Firebase
    const firebaseReady = await waitForFirebase();
    if (!firebaseReady) return;

    // Ensure Firestore module is loaded
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");
    const { getDocs, collection } = firestoreModule;

    // Get current logged-in user
    let user = JSON.parse(sessionStorage.getItem("firebaseUser") || "{}");

    if (!user.uid) {
        console.error("User not authenticated. Redirecting to login...");
        alert("You need to log in to view your trips.");
        window.location.href = "/login.html";
        return;
    }

    console.log(`✅ Fetching trips for user: ${user.uid}`);

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
            console.error("Error fetching trips:", error);
            document.getElementById("trip-list").innerHTML = "<p>Error loading trips.</p>";
        }
    }

    // Function to display trips on the page
    function displayTrips(tripSnapshots) {
        const tripList = document.getElementById("trip-list");
        tripList.innerHTML = ""; // Clear previous content

        tripSnapshots.forEach(doc => {
            const tripData = doc.data();
            console.log(" Trip Data:", tripData);

            const tripCard = document.createElement("div");
            tripCard.classList.add("trip-card");

            tripCard.innerHTML = `
                <h3>${tripData.destination || "Unnamed Trip"}</h3>
                <p><strong>Hotel:</strong> ${tripData.hotel.name || "Unknown Hotel"}</p>
                <p><strong>Dates:</strong> ${tripData.tripDates.start || "?"} - ${tripData.tripDates.end || "?"}</p>
                <button class="view-trip-btn" data-id="${doc.id}">View Trip</button>
            `;

            tripList.appendChild(tripCard);
        });

        // Add event listeners to view trip buttons
        document.querySelectorAll(".view-trip-btn").forEach(button => {
            button.addEventListener("click", function () {
                const tripId = this.getAttribute("data-id");
                console.log(`Viewing trip: ${tripId}`);
                window.location.href = `/itinerary?id=${tripId}`; // Redirect to itinerary page
            });
        });
    }

    // Fetch and display trips
    fetchUserTrips();
});
