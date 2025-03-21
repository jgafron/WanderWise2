document.addEventListener("DOMContentLoaded", async function () {
    console.log("auth.js loaded after DOM is ready!");

    const getStartedButton = document.getElementById("get-started-btn");
    const signOutButton = document.getElementById("sign-out-btn");
    const userInfoContainer = document.getElementById("user-info-container");
    const userEmailElement = document.getElementById("user-email");
    const userProfilePic = document.getElementById("user-profile-pic");

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
        window.db = db; // Store Firestore globally

        // ✅ Ensure `onAuthStateChanged` runs
        setupAuthListener();
    }

    await initializeFirebase();

    function setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log("🔄 Auth State Changed:", user);

            if (user) {
                sessionStorage.setItem("firebaseUser", JSON.stringify(user));

                updateUserUI(user);
            } else {
                sessionStorage.removeItem("firebaseUser");

                if (userInfoContainer) {
                    userInfoContainer.style.display = "none";
                    userEmailElement.textContent = "Not signed in";
                    userProfilePic.src = "";
                }

                if (getStartedButton) getStartedButton.style.display = "block";
                if (signOutButton) signOutButton.style.display = "none";
            }
        });
    }

    function updateUserUI(user) {
        if (!user) return;

        if (userInfoContainer) {
            userInfoContainer.style.display = "flex";
            userEmailElement.textContent = user.email;
            userProfilePic.src = user.photoURL || "https://via.placeholder.com/40";
        }
        
        if (getStartedButton) getStartedButton.style.display = "none";
        if (signOutButton) signOutButton.style.display = "block";
    }

    // ✅ Restore user session on page load (Useful if switching between pages)
    document.addEventListener("DOMContentLoaded", function () {
        let storedUser = sessionStorage.getItem("firebaseUser");
        if (storedUser) {
            let user = JSON.parse(storedUser);
            updateUserUI(user);
        }
    });

    window.signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await sendAuthTokenToBackend(idToken);
            window.location.href = "/plan";  
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    window.signOutUser = async () => {
        console.log("Sign out button clicked! Attempting to sign out...");

        if (!auth) {
            console.error("Firebase Auth is not initialized yet!");
            return;
        }

        try {
            await signOut(auth);
            sessionStorage.removeItem("firebaseUser"); // ✅ Clear stored user info
            window.location.href = "/"; // Redirect to homepage
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
        } catch (error) {
            console.error("❌ Error sending ID token:", error);
        }
    }

    // Ensure the button works
    if (signOutButton) {
        signOutButton.addEventListener("click", window.signOutUser);
    } else {
        console.error("Sign Out Button NOT found in the DOM!");
    }

    getStartedButton?.addEventListener("click", signInWithGoogle);
});
