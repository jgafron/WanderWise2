document.addEventListener("DOMContentLoaded", async function () {
    const getStartedButton = document.getElementById("get-started-btn");

    let firebaseApp, auth, provider, signInWithPopup, signOut, onAuthStateChanged, getAuth;

    // ✅ Fetch Firebase Config from Cloud Function
    async function fetchFirebaseConfig() {
        try {
            const response = await fetch("https://us-central1-cloud-gafron-jgafron.cloudfunctions.net/firebase_auth_handler");
            const data = await response.json();

            if (data.firebaseConfig) {
                console.log("✅ Firebase Config Loaded:", data.firebaseConfig);
                return data.firebaseConfig;
            } else {
                console.error("🔥 Error fetching Firebase config");
                return null;
            }
        } catch (error) {
            console.error("🔥 Fetching Firebase config failed:", error);
            return null;
        }
    }

    // ✅ Initialize Firebase Securely
    async function initializeFirebase() {
        const firebaseConfig = await fetchFirebaseConfig();
        if (!firebaseConfig) return;

        // ✅ Dynamically load Firebase SDK (MODULAR)
        const firebaseModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js");
        const authModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js");

        firebaseApp = firebaseModule.initializeApp(firebaseConfig);
        getAuth = authModule.getAuth;
        auth = getAuth(firebaseApp);
        provider = new authModule.GoogleAuthProvider();

        // ✅ Get functions from modular SDK
        signInWithPopup = authModule.signInWithPopup;
        signOut = authModule.signOut;
        onAuthStateChanged = authModule.onAuthStateChanged;

        console.log("✅ Firebase Initialized");
    }

    await initializeFirebase();

    // ✅ Function to handle login
    window.signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("✅ User signed in:", result.user);

            // ✅ Send ID token to backend
            const idToken = await result.user.getIdToken();
            await sendAuthTokenToBackend(idToken);

            // ✅ Redirect to the main app
            window.location.href = "/dashboard.html";
        } catch (error) {
            console.error("🔥 Login failed:", error);
        }
    };

    // ✅ Function to handle logout
    window.signOutUser = async () => {
        try {
            await signOut(auth);
            console.log("✅ User signed out");
            window.location.href = "/login.html";
        } catch (error) {
            console.error("🔥 Logout failed:", error);
        }
    };

    // ✅ Function to check authentication state
    function checkAuthState() {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log("❌ User is not authenticated. Redirecting...");
                window.location.href = "/login.html"; // Redirect to login if not authenticated
            }
        });
    }

    // ✅ Prevent unauthorized access
    checkAuthState();

    // ✅ Attach event listeners
    getStartedButton.addEventListener("click", signInWithGoogle);
});
