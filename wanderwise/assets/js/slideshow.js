let slideIndex = 0;

// Start slideshow
showSlides();

// Function to show slides
function showSlides() {
    let slides = document.querySelectorAll(".slide");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1; }
    slides[slideIndex - 1].style.display = "block";  
    setTimeout(showSlides, 3000); // Change image every 3 seconds
}

// Function to change slides manually
function changeSlide(n) {
    slideIndex += n - 1;
    let slides = document.querySelectorAll(".slide");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    if (slideIndex < 0) { slideIndex = slides.length - 1; }
    if (slideIndex >= slides.length) { slideIndex = 0; }
    slides[slideIndex].style.display = "block";
}
