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
                console.log("✅ Firebase Config Loaded:", data.firebaseConfig);
                return data.firebaseConfig;
            } else {
                console.error("❌ Error fetching Firebase config");
                return null;
            }
        } catch (error) {
            console.error("❌ Fetching Firebase config failed:", error);
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

        console.log("✅ Firebase & Firestore Initialized");
        window.firebaseConfig = firebaseConfig; // ✅ Store globally for access in other scripts
        window.db = db; // ✅ Store Firestore globally

        // ✅ Ensure `onAuthStateChanged` runs
        setupAuthListener();
    }

    await initializeFirebase();

    function setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log("🔄 Auth State Changed:", user);

            if (user) {
                console.log("✅ User is logged in:", user.email);
                console.log("📸 Profile Picture:", user.photoURL);
                sessionStorage.setItem("firebaseUser", JSON.stringify(user));

                updateUserUI(user);
            } else {
                console.log("❌ User is NOT logged in.");
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
            console.log("🔄 Restoring user from session:", user);
            updateUserUI(user);
        }
    });

    window.signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("✅ User signed in:", result.user);
            const idToken = await result.user.getIdToken();
            await sendAuthTokenToBackend(idToken);
            window.location.href = "/plan";  
        } catch (error) {
            console.error("❌ Login failed:", error);
        }
    };

    window.signOutUser = async () => {
        try {
            await signOut(auth);
            console.log("🚪 User signed out");
            sessionStorage.removeItem("firebaseUser"); // ✅ Clear stored user info
            window.location.href = "/login.html";
        } catch (error) {
            console.error("❌ Logout failed:", error);
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
            console.log("✅ Server Response:", data);
        } catch (error) {
            console.error("❌ Error sending ID token:", error);
        }
    }

    getStartedButton?.addEventListener("click", signInWithGoogle);
    signOutButton?.addEventListener("click", signOutUser);
});
