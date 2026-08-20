document.addEventListener("DOMContentLoaded", function () {
    let dateInput = document.getElementById("date-range");
    let continueBtn = document.getElementById("continue-btn");
    let selectedHotelDisplay = document.getElementById("selected-hotel");

    // Full list of 195 countries
    const countryList = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
        "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
        "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
        "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
        "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
        "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
        "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
        "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
        "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
        "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
        "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
        "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
        "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
        "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
        "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
        "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
        "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
        "Yemen", "Zambia", "Zimbabwe"
    ];

    // Common country abbreviations
    const countryAbbreviations = {
        "USA": "United States",
        "U.S.A.": "United States",
        "US": "United States",
        "U.S.": "United States",
        "UK": "United Kingdom",
        "U.K.": "United Kingdom",
        "UAE": "United Arab Emirates",
        "D.R.": "Dominican Republic",
        "R.O.K.": "South Korea",
        "R.O.C.": "Taiwan"
    };

    // Retrieve & Parse Selected Hotel Location
    let selectedLocation = sessionStorage.getItem("selectedHotel");

    if (selectedLocation) {
        let parsedLocation = JSON.parse(selectedLocation); // 🔹 Parse the JSON string
        let address = parsedLocation.address; // The full address string
        let country = "Unknown Country"; // Default
    
    
        // Check for a country abbreviation first
        for (let abbr in countryAbbreviations) {
            if (address.includes(abbr)) {
                country = countryAbbreviations[abbr];
                break; // Stop searching once found
            }
        }
    
        // ✅ If no abbreviation found, check for full country names
        if (country === "Unknown Country") {
            for (let i = 0; i < countryList.length; i++) {
                if (address.includes(countryList[i])) {
                    country = countryList[i];
                    break;
                }
            }
        }
    
        selectedHotelDisplay.textContent = `You are staying at: ${parsedLocation.name} in ${country}`;
    
        // ✅ Replace spaces with hyphens for use in API URLs
        let countryReal = country.replace(/\s+/g, "-");
        sessionStorage.setItem("countryReal", countryReal);
    } else {
        selectedHotelDisplay.textContent = "No hotel selected.";
    }
    


    // Initialize Flatpickr for Date Selection
    flatpickr(dateInput, {
        mode: "range",
        minDate: "today",
        dateFormat: "F j, Y",
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                sessionStorage.setItem("tripDates", JSON.stringify(selectedDates));
                continueBtn.disabled = false;
            }
        }
    });

    document.getElementById("home-btn").addEventListener("click", function () {
        window.location.href = "/plan";
    });

    document.getElementById("my-trip-btn").addEventListener("click", function () {
        window.location.href = "/trips";
    });

    document.getElementById("create-trip-btn").addEventListener("click", function () {
        window.location.href = "/createtrip";
    });

    document.getElementById("date-form").addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "/selectplaces";
    });
});

