document.addEventListener("DOMContentLoaded", async function () {
    const getStartedButton = document.getElementById("get-started-btn"); // Updated reference
    const signOutButton = document.getElementById("sign-out-btn");
    const userInfo = document.getElementById("user-info");

    let firebaseApp, auth, provider, signInWithPopup, signOut, onAuthStateChanged, getAuth;

    // Fetch Firebase Config from Cloud Function
    async function fetchFirebaseConfig() {
        try {
            const response = await fetch("https://us-central1-cloud-gafron-jgafron.cloudfunctions.net/firebase_auth_handler");
            const data = await response.json();

            if (data.firebaseConfig) {
                console.log("Firebase Config Loaded:", data.firebaseConfig);
                return data.firebaseConfig;
            } else {
                console.error("Error fetching Firebase config");
                return null;
            }
        } catch (error) {
            console.error("Fetching Firebase config failed:", error);
            return null;
        }
    }

    // Initialize Firebase Securely
    async function initializeFirebase() {
        const firebaseConfig = await fetchFirebaseConfig();
        if (!firebaseConfig) return;

        // Dynamically load Firebase SDK (MODULAR)
        const firebaseModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js");
        const authModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js");

        firebaseApp = firebaseModule.initializeApp(firebaseConfig);
        getAuth = authModule.getAuth;
        auth = getAuth(firebaseApp);
        provider = new authModule.GoogleAuthProvider();

        // Get functions from modular SDK
        signInWithPopup = authModule.signInWithPopup;
        signOut = authModule.signOut;
        onAuthStateChanged = authModule.onAuthStateChanged;

        console.log("✅ Firebase Initialized");
    }

    await initializeFirebase();

    // Sign in with Google 
    window.signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("✅ User signed in:", result.user);

            // ✅ Send ID token to backend
            const idToken = await result.user.getIdToken();
            await sendAuthTokenToBackend(idToken);
            window.location.href = "/plan";  // Redirect after login
        } catch (error) {
            console.error("🔥 Login failed:", error);
        }
    };

    // Sign out 
    window.signOutUser = async () => {
        try {
            await signOut(auth);
            console.log("User signed out");
            window.location.href = "/login.html";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Send Firebase ID Token to Backend
    async function sendAuthTokenToBackend(idToken) {
        try {
            const response = await fetch("https://us-central1-cloud-gafron-jgafron.cloudfunctions.net/firebase_auth_handler", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: idToken })
            });

            const data = await response.json();
            console.log("🔑 Server Response:", data);
        } catch (error) {
            console.error("Error sending ID token:", error);
        }
    }

    // Listen for auth state changes 
    onAuthStateChanged(auth, (user) => {
        console.log("Checking Authentication State...");
        if (user) {
            console.log("User is logged in:", user.email);
            userInfo.textContent = `Logged in as ${user.displayName}`;
            getStartedButton.style.display = "none";
            signOutButton.style.display = "block";
        } else {
            console.log("User is NOT logged in.");
            userInfo.textContent = "Not logged in";
            getStartedButton.style.display = "block";
            signOutButton.style.display = "none";
        }
    });
    

    getStartedButton.addEventListener("click", signInWithGoogle); // Updated 
    signOutButton.addEventListener("click", signOutUser);
});
