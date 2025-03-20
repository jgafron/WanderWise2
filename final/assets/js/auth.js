document.addEventListener("DOMContentLoaded", async function () {
    console.log("auth.js loaded after DOM is ready!");

    const getStartedButton = document.getElementById("get-started-btn");
    const signOutButton = document.getElementById("sign-out-btn");
    const userInfo = document.getElementById("user-info");

    let firebaseApp, auth, provider, signInWithPopup, signOut, onAuthStateChanged, getAuth, db;

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

    async function initializeFirebase() {
        const firebaseConfig = await fetchFirebaseConfig();
        if (!firebaseConfig) return;

        const firebaseModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js");
        const authModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js");

        firebaseApp = firebaseModule.initializeApp(firebaseConfig);
        getAuth = authModule.getAuth;
        auth = getAuth(firebaseApp);
        provider = new authModule.GoogleAuthProvider();

        signInWithPopup = authModule.signInWithPopup;
        signOut = authModule.signOut;
        onAuthStateChanged = authModule.onAuthStateChanged;

        // ✅ Initialize Firestore
        db = firestoreModule.getFirestore(firebaseApp);

        console.log("Firebase & Firestore Initialized");
        window.firebaseConfig = firebaseConfig; // ✅ Store globally for access in other scripts
        window.db = db; // ✅ Store Firestore globally

        // ✅ Ensure `onAuthStateChanged` runs
        setupAuthListener();
    }

    await initializeFirebase();

    function setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log("Checking Authentication State...");
            if (user) {
                console.log("User is logged in:", user.email);
                sessionStorage.setItem("firebaseUser", JSON.stringify(user)); // Store user info for other scripts
                if (userInfo) userInfo.textContent = `Logged in as ${user.displayName}`;
                if (getStartedButton) getStartedButton.style.display = "none";
                if (signOutButton) signOutButton.style.display = "block";
            } else {
                console.log("User is NOT logged in.");
                sessionStorage.removeItem("firebaseUser");
                if (userInfo) userInfo.textContent = "Not logged in";
                if (getStartedButton) getStartedButton.style.display = "block"; // Ensures button is visible
                if (signOutButton) signOutButton.style.display = "none";
            }
        });
    }

    window.signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log(" User signed in:", result.user);
            const idToken = await result.user.getIdToken();
            await sendAuthTokenToBackend(idToken);
            window.location.href = "/plan";  
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    window.signOutUser = async () => {
        try {
            await signOut(auth);
            console.log(" User signed out");
            sessionStorage.removeItem("firebaseUser"); // ✅ Clear stored user info
            window.location.href = "/login.html";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    async function sendAuthTokenToBackend(idToken) {
        try {
            const response = await fetch("https://us-central1-cloud-gafron-jgafron.cloudfunctions.net/firebase_auth_handler", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: idToken })
            });

            const data = await response.json();
            console.log(" Server Response:", data);
        } catch (error) {
            console.error("Error sending ID token:", error);
        }
    }

    getStartedButton?.addEventListener("click", signInWithGoogle);
    signOutButton?.addEventListener("click", signOutUser);
});
